import fetch from 'node-fetch';

function sanitizeValue(v) {
  if (typeof v === 'bigint') return v.toString();
  if (v && typeof v.toText === 'function') return v.toText(); // Principal
  if (v && v._isPrincipal) return String(v); // fallback, just in case
  return v;
}

function sanitizeJob(job) {
  // shallow sanitize fields you care about; expand if you need more
  const sanitized = {
    id: sanitizeValue(job.id),
    messageId: job.messageId,
    messageType: job.messageType,
    recipientId: job.recipientId && (sanitizeValue(job.recipientId)),
    content: {
      title: job.content?.title,
      body: job.content?.body,
      contentType: job.content?.contentType,
      priority: sanitizeValue(job.content?.priority),
      metadata: job.content?.metadata || [],
    },
    intents: job.intents || [],
    channel: {
      id: sanitizeValue(job.channelId),
      name: job.channelName,
      // channelType might be { webhook: null } — normalize to string 'webhook'
      type: job.channelType ? Object.keys(job.channelType)[0] : null,
      config: job.channelConfig || {},
    },
    createdAt: sanitizeValue(job.createdAt),
    expiresAt: sanitizeValue(job.expiresAt),
    attempts: sanitizeValue(job.attempts),
    retryConfig: job.retryConfig || null,
  };

  return sanitized;
}

export async function sendWebhook(job) {
  try {
    const cfg = job.channelConfig?.webhook || null;
    const url = cfg?.url || process.env.WEBHOOK_DEFAULT_URL;
    if (!url) throw new Error('No webhook URL provided in channelConfig or WEBHOOK_DEFAULT_URL');

    const method = (cfg?.method || 'POST').toUpperCase();
    // cfg.headers may be an array of [k,v] pairs or an object
    let headers = {};
    if (Array.isArray(cfg?.headers)) {
      headers = Object.fromEntries(cfg.headers);
    } else if (cfg?.headers && typeof cfg.headers === 'object') {
      headers = { ...cfg.headers };
    }
    headers['content-type'] = headers['content-type'] || 'application/json';

    // authentication
    if (cfg?.authType) {
      if (cfg.authType.basic) {
        const { username, password } = cfg.authType.basic;
        const token = Buffer.from(`${username}:${password}`).toString('base64');
        headers['authorization'] = `Basic ${token}`;
      } else if (cfg.authType.bearer) {
        headers['authorization'] = `Bearer ${cfg.authType.bearer}`;
      }
    }

    // Build sanitized payload
    const payload = sanitizeJob(job);

    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(payload),
      timeout: cfg?.timeoutMs || 30000,
    });

    const ok = res.status >= 200 && res.status < 300;
    return ok;
  } catch (e) {
    console.error('[webhook] error', e);
    return false;
  }
}
