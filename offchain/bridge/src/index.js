// src/index.js
import 'dotenv/config';
import { HttpAgent, Actor } from '@dfinity/agent';
import fs from 'node:fs';

import { identityFromPemFile } from './identity.js';
import { sendWebhook } from './adapters/webhook.js';
import { processWithAI } from './aiStub.js';
import express from 'express';
import * as telegramAdapter from './adapters/telegram.js';
   
const CANISTER_ID = process.env.CANISTER_ID;
const IC_HOST = (process.env.IC_HOST || 'https://ic0.app').trim();
const BRIDGE_LIMIT = Number(process.env.BRIDGE_LIMIT || 20);
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 500);
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const log = {
  debug: (...a) => (LOG_LEVEL === 'debug' ? console.debug('[debug]', ...a) : undefined),
  info: (...a) => console.log('[info]', ...a),
  warn: (...a) => console.warn('[warn]', ...a),
  error: (...a) => console.error('[error]', ...a),
};

// Load the frontend-generated IDL for your backend canister
async function loadBackendIDL() {
  try {
    const mod = await import('../../../src/declarations/backend/backend.did.js');
    return mod.idlFactory;
  } catch (e) {
    log.error('Failed to load backend.did.js. Run `dfx generate backend` so this path exists: src/declarations/backend/backend.did.js');
    throw e;
  }
}

async function createActor() {
  if (!CANISTER_ID) throw new Error('Missing CANISTER_ID in env');
  const idlFactory = await loadBackendIDL();

  const agent = new HttpAgent({ host: IC_HOST });

  // Optional: use a specific PEM identity for the bridge
  const pemPath = process.env.BRIDGE_IDENTITY_PEM;
  if (pemPath) {
    if (!fs.existsSync(pemPath)) throw new Error(`BRIDGE_IDENTITY_PEM not found: ${pemPath}`);
    const identity = await identityFromPemFile(pemPath);
    log.info('[auth] Using identity principal:', identity.getPrincipal().toText());
    agent.replaceIdentity(identity);
  }

  // Local replica needs the root key
  if (IC_HOST.includes('127.0.0.1') || IC_HOST.includes('localhost')) {
    await agent.fetchRootKey();
  }

  return Actor.createActor(idlFactory, { agent, canisterId: CANISTER_ID });
}

// Start a lightweight Express server for incoming Telegram webhooks
function startHttpServer(actor) {
  const app = express();
  app.use(express.json());

  const TELEGRAM_WEBHOOK_PATH = process.env.TELEGRAM_WEBHOOK_PATH || '/telegram/webhook';
  const PORT = Number(process.env.PORT || 3000);

  // Initialize telegram adapter with actor reference
  try {
    telegramAdapter.init(actor);
  } catch (e) {
    console.warn('Failed to init telegram adapter:', e);
  }

  app.post(TELEGRAM_WEBHOOK_PATH, async (req, res) => {
    try {
      const result = await telegramAdapter.handleWebhookUpdate(req.body);
      if (result && result.ok) return res.status(result.status).send('OK');
      return res.status(result.status || 500).send(result.reason || 'error');
    } catch (e) {
      console.error('Telegram webhook handler error:', e);
      return res.status(500).send('internal error');
    }
  });

  app.get('/', (req, res) => res.send('Bridge running'));

  app.listen(PORT, () => {
    console.info(`HTTP server listening on port ${PORT}, telegram webhook path ${TELEGRAM_WEBHOOK_PATH}`);
  });
}

async function deliverJob(job) {
  try {
    const enriched = await processWithAI(job);

    if ('webhook' in enriched.channelType) {
      return await sendWebhook(enriched);
    }

    log.warn('No adapter implemented for channelType:', Object.keys(enriched.channelType));
    return false;
  } catch (e) {
    log.error('deliverJob error:', e);
    return false;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  const actor = await createActor();
  log.info('Bridge started. Polling for jobs...');

  // Start HTTP server for Telegram webhook handling
  startHttpServer(actor);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let jobsRes;
    try {
      jobsRes = await actor.nextDispatchJobs(BRIDGE_LIMIT);
    } catch (e) {
      log.error('nextDispatchJobs threw:', e);
      await sleep(1000);
      continue;
    }

    if ('err' in jobsRes) {
      log.warn('nextDispatchJobs err:', jobsRes.err);
      await sleep(1000);
      continue;
    }

    const jobs = jobsRes.ok || [];
    if (jobs.length === 0) {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    for (const job of jobs) {
      log.info(`Job ${job.id} -> ${job.messageType} via ${Object.keys(job.channelType)} (${job.channelName})`);
      console.log('Job content:', job);
      log.debug('Job content:', { content: job.content, intents: job.intents });

      // If this is a telegram verification job, route to telegram adapter
      let delivered = false;
      try {
        const intents = job.intents || [];
        const intentMap = Object.fromEntries(intents.map(([k, v]) => [k, v]));
        if (intentMap.intentType === 'telegram_verification') {
          const r = await telegramAdapter.handleVerificationJob(job);
          // adapter returns 'deferred' to indicate it will ack later via webhook -> confirm
          if (r === 'deferred') {
            log.info(`Job ${job.id} deferred to telegram adapter for webhook confirmation`);
            continue; // do not ack here
          }
          delivered = !!r;
        } else {
          delivered = await deliverJob(job);
        }
      } catch (e) {
        console.error('Job delivery routing error:', e);
        delivered = false;
      }

      try {
        const status = delivered ? { delivered: null } : { failed: null };
        const ack = await actor.acknowledgeJobDelivery(job.id, status);
        if ('err' in ack) {
          log.warn('acknowledgeJobDelivery err:', ack.err);
        } else {
          log.info(`Acked job ${job.id} as ${delivered ? 'delivered' : 'failed'}`);
        }
      } catch (e) {
        log.error('acknowledgeJobDelivery threw:', e);
      }
    }
  }
}

run().catch((e) => {
  log.error('Fatal bridge error:', e);
  process.exit(1);
});
