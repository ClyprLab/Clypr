// src/index.js
import 'dotenv/config';
import { HttpAgent, Actor } from '@dfinity/agent';
import fs from 'node:fs';

import { identityFromPemFile } from './identity.js';
import { sendWebhook } from './adapters/webhook.js';
import { processWithAI } from './aiStub.js';
import express from 'express';
import * as telegramAdapter from './adapters/telegram.js';
import * as emailAdapter from './adapters/email.js';
   
const CANISTER_ID = process.env.CANISTER_ID;
const IC_HOST = (process.env.IC_HOST || 'https://ic0.app').trim();
const BRIDGE_LIMIT = Number(process.env.BRIDGE_LIMIT || 20);
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 500);
// How long to remember a deferred job (ms) to avoid re-processing it repeatedly
const DEFERRED_JOBS_TTL_MS = Number(process.env.BRIDGE_DEFERRED_TTL_MS || process.env.TELEGRAM_VERIFICATION_TTL_MS || (2 * 60 * 1000));
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const log = {
  debug: (...a) => (LOG_LEVEL === 'debug' ? console.debug('[debug]', ...a) : undefined),
  info: (...a) => console.log('[info]', ...a),
  warn: (...a) => console.warn('[warn]', ...a),
  error: (...a) => console.error('[error]', ...a),
};

// Add a small sanitizer to summarize jobs for logging without exposing PII/tokens
function summarizeJob(job) {
  try {
    const redact = String(process.env.REDACT_SENSITIVE_LOGS || '').toLowerCase() === 'true';
    const channelType = job && job.channelType ? Object.keys(job.channelType)[0] : null;
    const intentKeys = Array.isArray(job?.intents) ? job.intents.map(([k]) => String(k)) : [];

    const base = {
      id: job?.id ? String(job.id) : null,
      messageType: job?.messageType || null,
      channelName: job?.channelName || null,
      channelType,
      createdAt: job?.createdAt ? String(job.createdAt) : null,
      intentKeys,
    };

    if (redact) {
      // Do not include any content that may contain tokens or PII
      return { ...base, contentSnippet: '[REDACTED]' };
    }

    const contentBody = job && job.content ? (job.content.body || job.content.title || '') : '';
    const snippet = String(contentBody).length > 200 ? String(contentBody).slice(0, 200) + '…' : String(contentBody);
    return { ...base, contentSnippet: snippet };
  } catch (e) {
    return { id: job?.id ? String(job.id) : null, error: 'summarize_failed' };
  }
}

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
      // Always return 200 OK to Telegram to acknowledge the webhook
      // This prevents Telegram from retrying the webhook
      return res.status(200).send('OK');
    } catch (e) {
      console.error('Telegram webhook handler error:', e);
      // Even on error, return 200 OK to prevent webhook retries
      return res.status(200).send('OK');
    }
  });

  app.get('/', (req, res) => res.send('Bridge running'));

  // Debug endpoint to check registered tokens (remove in production)
  app.get('/debug/tokens', (req, res) => {
    try {
      const tokens = Array.from(telegramAdapter.tokenMap.entries()).map(([token, info]) => ({
        token: token.substring(0, 8) + '...' + token.substring(token.length - 4),
        jobId: info.jobId,
        expiresAt: new Date(info.expiresAtMs).toISOString(),
        expiresInMs: info.expiresAtMs - Date.now()
      }));
      res.json({ 
        tokenCount: tokens.length, 
        tokens,
        now: new Date().toISOString()
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.listen(PORT, () => {
    console.info(`HTTP server listening on port ${PORT}, telegram webhook path ${TELEGRAM_WEBHOOK_PATH}`);
    console.info(`Debug endpoint available at http://localhost:${PORT}/debug/tokens`);
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

  // Keep a short-lived cache of job ids that were deferred to adapters so the
  // bridge doesn't re-process them continuously while waiting for external
  // webhook confirmations. Entries expire after DEFERRED_JOBS_TTL_MS.
  const deferredJobs = new Map(); // jobId -> expiresAtMs

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
      // Purge expired deferred entries occasionally (cheap)
      const nowPurge = Date.now();
      for (const [jid, exp] of deferredJobs.entries()) {
        if (exp <= nowPurge) deferredJobs.delete(jid);
      }

      // If we've recently deferred this job, skip re-processing until its TTL
      // expires. This avoids log spam and repeated adapter registration calls.
      const existingDeferred = deferredJobs.get(String(job.id));
      if (existingDeferred && existingDeferred > Date.now()) {
        log.debug(`Skipping recently-deferred job ${job.id}`);
        continue;
      }
      log.info(`Job ${job.id} -> ${job.messageType} via ${Object.keys(job.channelType)} (${job.channelName})`);
      try {
        const summary = summarizeJob(job);
        log.debug('Job summary:', summary);
      } catch (e) {
        log.debug('Job summary build failed');
      }

      // If this is a telegram verification job, route to telegram adapter
      let delivered = false;
      try {
        const intents = job.intents || [];
        const intentMap = Object.fromEntries(intents.map(([k, v]) => [k, v]));

        // Special-case verification intents
        if (intentMap.intentType === 'telegram_verification') {
          const r = await telegramAdapter.handleVerificationJob(job);
          if (r === 'deferred') {
            log.info(`Job ${job.id} deferred to telegram adapter for webhook confirmation`);
            // Remember that this job is deferred for a short TTL so we don't
            // re-process it while waiting for webhook confirmation.
            deferredJobs.set(String(job.id), Date.now() + DEFERRED_JOBS_TTL_MS);
            continue; // do not ack here
          }
          delivered = !!r;
        } else if (intentMap.intentType === 'email_verification') {
          try {
            const r = await emailAdapter.handleVerificationJob(job);
            delivered = !!r;
          } catch (e) {
            log.error('email verification adapter error:', e);
            delivered = false;
          }
        } else {
          // Route by channel type for normal messages
          const channelType = job.channelType ? Object.keys(job.channelType)[0] : null;
          if (channelType === 'email') {
            try {
              delivered = await emailAdapter.handleMessageJob(job);
            } catch (e) {
              log.error('email message adapter error:', e);
              delivered = false;
            }
          } else if (channelType === 'telegramContact' || channelType === 'telegram') {
            // Telegram delivery path (non-verification)
            delivered = await deliverJob(job);
          } else if (channelType === 'webhook') {
            delivered = await deliverJob(job);
          } else {
            // Fallback to generic delivery for unknown channel types
            delivered = await deliverJob(job);
          }
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
