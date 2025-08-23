import dns from 'node:dns/promises';
import fetch from 'node-fetch';

// Respect environment flag to avoid printing sensitive tokens in logs
const REDACT_SENSITIVE_LOGS = process.env.REDACT_SENSITIVE_LOGS === 'true';

// Simple Telegram verification adapter
// - register verification tokens from jobs
// - expose a webhook handler to be called by Telegram
// - on webhook, call bridgeConfirmVerification and acknowledge job

let actorRef = null;
const tokenMap = new Map(); // token -> { jobId, expiresAtMs }
const processedMessages = new Set(); // message_id -> timestamp to prevent duplicates
const CLEANUP_INTERVAL_MS = 30_000; // Clean up every 30 seconds instead of 60
let cleanupHandle = null;

// Export tokenMap for debugging (remove in production)
export { tokenMap };

// Telegram bot token for sending confirmation messages back to users
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || null;

async function sendTelegramMessage(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.debug('[telegram] TELEGRAM_BOT_TOKEN not set; skipping sendMessage');
    return false;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: String(chatId), text }),
    });
    if (!res.ok) {
      console.warn('[telegram] sendMessage non-2xx', res.status);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[telegram] sendMessage error:', e && e.message ? e.message : e);
    return false;
  }
}

function sanitizeValue(v) {
  if (typeof v === 'bigint') return v.toString();
  if (v && typeof v.toText === 'function') return v.toText();
  return v;
}

function redact(token) {
  if (!token) return token;
  if (!REDACT_SENSITIVE_LOGS) return token;
  // Show only first 4 and last 4 chars
  const s = String(token);
  if (s.length <= 8) return '****';
  return `${s.slice(0,4)}...${s.slice(-4)}`;
}

function logInfo(...args) {
  // If token appears in args, redact it
  const out = args.map(a => (typeof a === 'string' ? a.replace(/token\s*[:=]?\s*([A-Za-z0-9_-]+)/gi, (m, p1) => `token=${redact(p1)}`) : a));
  console.info('[telegram]', ...out);
}

export function init(actor) {
  actorRef = actor;
  if (!cleanupHandle) {
    cleanupHandle = setInterval(() => {
      const now = Date.now();
      // Clean up expired tokens
      for (const [token, info] of tokenMap.entries()) {
        if (info.expiresAtMs <= now) tokenMap.delete(token);
      }
      // Clean up old processed messages (older than 1 hour)
      for (const [messageId, timestamp] of processedMessages.entries()) {
        if (now - timestamp > 60 * 60 * 1000) processedMessages.delete(messageId);
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
  
  logInfo('Processing verification job', job.id, 'intents:', Object.keys(intents));
  
  if (!token) {
    console.warn('[telegram] job has no token, skipping', job.id);
    // Acknowledge as failed immediately to avoid dangling jobs
    try { await ackJob(Number(job.id), false); } catch (e) {}
    return false; // immediate failure
  }

  // Motoko Time.now() is in nanoseconds. Convert to ms for JS timers when provided as large int string
  let expiresAtMs = Number.MAX_SAFE_INTEGER;
  try {
    if (expiresAtStr) {
      const asBig = BigInt(expiresAtStr.toString());
      expiresAtMs = Number(asBig / 1000000n);
    } else {
      // Default to 15 minutes if no expiry provided
      expiresAtMs = Date.now() + 15 * 60 * 1000;
    }
  } catch (e) {
    console.warn('[telegram] Failed to parse expiresAt, using default 15 minutes:', e);
    expiresAtMs = Date.now() + 15 * 60 * 1000;
  }

  // Check if token already exists (shouldn't happen, but just in case)
  if (tokenMap.has(token)) {
    console.warn('[telegram] Token already registered, replacing:', redact(token));
  }

  tokenMap.set(token, { jobId: Number(job.id), expiresAtMs });
  logInfo('registered token for job', job.id, 'token', redact(token), 'expiresMs', expiresAtMs, 'expiresAt', new Date(expiresAtMs).toISOString());

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
    logInfo('Received webhook update:', JSON.stringify(update, null, 2));
    
    const msg = update.message || update.edited_message || update.channel_post || (update.callback_query && update.callback_query.message);
    if (!msg && !update.callback_query) {
      logInfo('No message or callback_query found in update');
      return { ok: true, status: 200 }; // Return OK to acknowledge webhook
    }

    // Generate a unique message identifier to prevent duplicate processing
    const messageId = msg ? msg.message_id : (update.callback_query ? `cb_${update.callback_query.id}` : null);
    const chatId = (msg && msg.chat && (msg.chat.id || (msg.chat && msg.chat.id))) || (update.callback_query && update.callback_query.from && update.callback_query.from.id);
    
    // Check for duplicate message processing
    if (messageId && processedMessages.has(messageId)) {
      logInfo('Duplicate message detected, skipping:', messageId);
      return { ok: true, status: 200 }; // Return OK to acknowledge webhook
    }

    // Mark message as processed
    if (messageId) {
      processedMessages.add(messageId);
    }

    // Handle help command
    if (text && text.trim().toLowerCase() === '/help') {
      try {
        await sendTelegramMessage(chatId, "🤖 *Clypr Verification Bot*\n\n" +
          "This bot helps you verify your identity with Clypr.\n\n" +
          "*Available Commands:*\n" +
          "• `/help` - Show this help message\n" +
          "• `/verify <token>` - Verify with a token\n" +
          "• `/start <token>` - Start and verify with a token\n\n" +
          "*How to use:*\n" +
          "1. Request verification in the Clypr app\n" +
          "2. Copy the verification token\n" +
          "3. Paste it here or use `/verify <token>`\n\n" +
          "You can also paste the token directly without any command.");
      } catch (e) {}
      return { ok: true, status: 200 }; // Return OK to acknowledge webhook
    }

    // Extract different token sources
    let text = msg && (msg.text || msg.caption) ? String(msg.text || msg.caption) : '';
    const callbackData = update.callback_query && update.callback_query.data ? String(update.callback_query.data) : null;

    logInfo('Extracted chatId:', chatId, 'text:', text ? text.substring(0, 50) + '...' : 'empty', 'callbackData:', callbackData ? callbackData.substring(0, 50) + '...' : 'null');

    if (!chatId) {
      // Best-effort: try to use callback_query.from.id
      if (update.callback_query && update.callback_query.from && update.callback_query.from.id) {
        // ok
      } else {
        logInfo('No chat ID found in update');
        return { ok: true, status: 200 }; // Return OK to acknowledge webhook
      }
    }

    // Helper to try find a token in text via exact match or registered substrings
    let tokenCandidate = null;

    // 1) callback_data as token
    if (callbackData) {
      tokenCandidate = callbackData.trim();
      logInfo('Found token in callback_data:', redact(tokenCandidate));
    }

    // 2) /start <token> command
    if (!tokenCandidate && text) {
      const parts = text.trim().split(/\s+/);
      if (parts.length >= 2 && parts[0].startsWith('/start')) {
        tokenCandidate = parts.slice(1).join(' ');
        logInfo('Found token in /start command:', redact(tokenCandidate));
      } else if (parts.length === 1 && parts[0].startsWith('/start')) {
        // /start without token - send welcome message
        try {
          await sendTelegramMessage(chatId, "👋 *Welcome to Clypr Verification Bot!*\n\n" +
            "To verify your identity with Clypr:\n\n" +
            "1. **Request verification** in the Clypr app\n" +
            "2. **Copy the verification token** from the app\n" +
            "3. **Paste it here** or use `/verify <token>`\n\n" +
            "You can also use `/help` for more information.");
        } catch (e) {}
        return { ok: true, status: 200 }; // Return OK to acknowledge webhook
      }
    }

    // 3) plain token: if the entire message looks like a token (no spaces) use it
    if (!tokenCandidate && text && text.trim().length > 0 && !text.includes(' ')) {
      tokenCandidate = text.trim();
      logInfo('Found token as plain message:', redact(tokenCandidate));
    }

    // 4) /verify command with token
    if (!tokenCandidate && text) {
      const parts = text.trim().split(/\s+/);
      if (parts.length >= 2 && parts[0].startsWith('/verify')) {
        tokenCandidate = parts.slice(1).join(' ');
        logInfo('Found token in /verify command:', redact(tokenCandidate));
      }
    }

    // 5) fallback: find any registered token substring in the text (case-sensitive match)
    if (!tokenCandidate && text) {
      for (const t of tokenMap.keys()) {
        if (text.includes(t)) { 
          tokenCandidate = t; 
          logInfo('Found token as substring in text:', redact(tokenCandidate));
          break; 
        }
      }
    }

    // If still no token, always reply with helpful instructions
    if (!tokenCandidate) {
      logInfo('No token found in message. Available tokens:', Array.from(tokenMap.keys()).map(redact));
      try {
        await sendTelegramMessage(chatId, "I couldn't find a verification token in your message. Please use one of these methods:\n\n" +
          "• Paste the token directly\n" +
          "• Use /verify <token>\n" +
          "• Use /start <token>\n\n" +
          "Make sure you're using the complete token from the Clypr app.");
      } catch (e) {}
      return { ok: true, status: 200 }; // Return OK to acknowledge webhook
    }

    const entry = tokenMap.get(tokenCandidate);
    if (!entry) {
      // Token unknown or expired — tell the user and advise re-request
      logInfo('Token not found in map:', redact(tokenCandidate), 'Available tokens:', Array.from(tokenMap.keys()).map(redact));
      try { 
        await sendTelegramMessage(chatId, "That verification token is unknown or has expired. Please request a new verification in the Clypr app and try again.\n\n" +
          "You can paste the new token directly or use:\n" +
          "• /verify <token>\n" +
          "• /start <token>"); 
      } catch (e) {}
      return { ok: true, status: 200 }; // Return OK to acknowledge webhook
    }

          // Check expiry
      const now = Date.now();
      if (entry.expiresAtMs <= now) {
        logInfo('Token expired:', redact(tokenCandidate), 'expired at:', new Date(entry.expiresAtMs).toISOString(), 'now:', new Date(now).toISOString());
        tokenMap.delete(tokenCandidate);
        // Ack failed due to expiry
        await ackJob(entry.jobId, false);
        try { await sendTelegramMessage(chatId, "This verification token has expired. Please request a new verification from the Clypr app.\n\n" +
          "You can paste the new token directly or use:\n" +
          "• /verify <token>\n" +
          "• /start <token>"); } catch (e) {}
        return { ok: true, status: 200 }; // Return OK to acknowledge webhook
      }

    logInfo('Token validated successfully:', redact(tokenCandidate), 'expires at:', new Date(entry.expiresAtMs).toISOString());

    // Call canister confirm
    try {
      const res = await actorRef.bridgeConfirmVerification(tokenCandidate, String(chatId));
      if ('err' in res) {
        console.warn('[telegram] bridgeConfirmVerification err:', res.err);
        // Ack job as failed
        await ackJob(entry.jobId, false);
        tokenMap.delete(tokenCandidate);
        try { await sendTelegramMessage(chatId, "Verification failed due to a backend error. Please try again later."); } catch (e) {}
        return { ok: true, status: 200 }; // Return OK to acknowledge webhook
      }

      // Success: ack delivered
      await ackJob(entry.jobId, true);
      tokenMap.delete(tokenCandidate);
      // Notify the user in Telegram that verification succeeded
      try { await sendTelegramMessage(chatId, "✅ *Verification Successful!*\n\n" +
        "You have been successfully verified with Clypr.\n\n" +
        "You can now return to the Clypr app and continue using the service.\n\n" +
        "Thank you for using Clypr! 🚀"); } catch (e) {}
      return { ok: true, status: 200 }; // Return OK to acknowledge webhook
    } catch (e) {
      console.error('[telegram] bridgeConfirmVerification threw:', e);
      await ackJob(entry.jobId, false);
      tokenMap.delete(tokenCandidate);
      try { await sendTelegramMessage(chatId, "Verification failed due to an internal error. Please try again later."); } catch (e) {}
      return { ok: true, status: 200 }; // Return OK to acknowledge webhook
    }
  } catch (e) {
    console.error('[telegram] handleWebhookUpdate error:', e);
    return { ok: true, status: 200 }; // Return OK to acknowledge webhook even on error
  }
}
