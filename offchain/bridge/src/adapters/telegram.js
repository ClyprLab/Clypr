import dns from 'node:dns/promises';

// Simple Telegram verification adapter
// - register verification tokens from jobs
// - expose a webhook handler to be called by Telegram
// - on webhook, call bridgeConfirmVerification and acknowledge job

let actorRef = null;
const tokenMap = new Map(); // token -> { jobId, expiresAtMs }
const CLEANUP_INTERVAL_MS = 60_000;
let cleanupHandle = null;

function sanitizeValue(v) {
  if (typeof v === 'bigint') return v.toString();
  if (v && typeof v.toText === 'function') return v.toText();
  return v;
}

export function init(actor) {
  actorRef = actor;
  if (!cleanupHandle) {
    cleanupHandle = setInterval(() => {
      const now = Date.now();
      for (const [token, info] of tokenMap.entries()) {
        if (info.expiresAtMs <= now) tokenMap.delete(token);
      }
    }, CLEANUP_INTERVAL_MS);
  }
}

function parseIntents(intents) {
  try {
    return Object.fromEntries(intents.map(([k, v]) => [k, sanitizeValue(v)]));
  } catch (e) {
    return {};
  }
}

export async function handleVerificationJob(job) {
  if (!actorRef) throw new Error('Telegram adapter not initialized');

  const intents = parseIntents(job.intents || []);
  const token = intents.token || (job.content && job.content.body);
  const expiresAtStr = intents.expiresAt || (job.expiresAt ? String(job.expiresAt) : null);
  if (!token) {
    console.warn('[telegram] job has no token, skipping', job.id);
    return false; // immediate failure
  }

  // Motoko Time.now() is in nanoseconds. Convert to ms for JS timers when provided as large int string
  let expiresAtMs = Number.MAX_SAFE_INTEGER;
  try {
    if (expiresAtStr) {
      const asBig = BigInt(expiresAtStr.toString());
      expiresAtMs = Number(asBig / 1000000n);
    }
  } catch (e) {
    expiresAtMs = Date.now() + 15 * 60 * 1000;
  }

  tokenMap.set(token, { jobId: Number(job.id), expiresAtMs });
  console.info('[telegram] registered token for job', job.id, 'token', token, 'expiresMs', expiresAtMs);

  // Defer acknowledgement until we receive the webhook and confirm
  return 'deferred';
}

async function ackJob(jobId, delivered = true) {
  try {
    const status = delivered ? { delivered: null } : { failed: null };
    const res = await actorRef.acknowledgeJobDelivery(jobId, status);
    if ('err' in res) {
      console.warn('[telegram] acknowledgeJobDelivery err:', res.err);
      return false;
    }
    console.info('[telegram] acknowledged job', jobId, delivered ? 'delivered' : 'failed');
    return true;
  } catch (e) {
    console.error('[telegram] ackJob threw:', e);
    return false;
  }
}

export async function handleWebhookUpdate(update) {
  // Accept update object from Telegram
  try {
    const msg = update.message || update.edited_message || update.channel_post || update.callback_query && update.callback_query.message;
    if (!msg) return { ok: false, status: 400, reason: 'no message' };

    const text = msg.text || (msg.caption) || '';
    const chatId = msg.chat && (msg.chat.id || (msg.chat && msg.chat.id));
    if (!chatId) return { ok: false, status: 400, reason: 'no chat id' };

    // Token is usually last word in /start <token> or entire text after /start
    const parts = String(text || '').trim().split(/\s+/);
    let tokenCandidate = null;
    if (parts.length >= 2 && parts[0].startsWith('/start')) {
      tokenCandidate = parts.slice(1).join(' ');
    } else {
      // fallback: find any registered token substring in the text
      for (const t of tokenMap.keys()) {
        if (text.includes(t)) { tokenCandidate = t; break; }
      }
    }

    if (!tokenCandidate) return { ok: false, status: 404, reason: 'token not found in message' };

    const entry = tokenMap.get(tokenCandidate);
    if (!entry) return { ok: false, status: 404, reason: 'unknown token or expired' };

    // Check expiry
    if (entry.expiresAtMs <= Date.now()) {
      tokenMap.delete(tokenCandidate);
      // Ack failed due to expiry
      await ackJob(entry.jobId, false);
      return { ok: false, status: 410, reason: 'token expired' };
    }

    // Call canister confirm
    try {
      const res = await actorRef.bridgeConfirmVerification(tokenCandidate, String(chatId));
      if ('err' in res) {
        console.warn('[telegram] bridgeConfirmVerification err:', res.err);
        // Ack job as failed
        await ackJob(entry.jobId, false);
        tokenMap.delete(tokenCandidate);
        return { ok: false, status: 500, reason: 'canister err' };
      }

      // Success: ack delivered
      await ackJob(entry.jobId, true);
      tokenMap.delete(tokenCandidate);
      return { ok: true, status: 200 };
    } catch (e) {
      console.error('[telegram] bridgeConfirmVerification threw:', e);
      await ackJob(entry.jobId, false);
      tokenMap.delete(tokenCandidate);
      return { ok: false, status: 500, reason: 'exception' };
    }
  } catch (e) {
    console.error('[telegram] handleWebhookUpdate error:', e);
    return { ok: false, status: 500, reason: 'internal' };
  }
}
