import fetch from 'node-fetch';
import dns from 'node:dns/promises';

function sanitizeValue(v) {
  if (typeof v === 'bigint') return v.toString();
  if (v && typeof v.toText === 'function') return v.toText(); // Principal
  if (v && v._isPrincipal) return String(v); // fallback, just in case
  return v;
}

function sanitizeJob(job) {
  // shallow sanitize fields you care about; expand if you need more
  try {
    const contentBody = job.content?.body || job.content?.title || '';
    const bodySnippet = String(contentBody).length > 200 ? String(contentBody).slice(0, 200) + '…' : String(contentBody);

    // Intents is an array of [k, v] pairs; only expose keys to avoid leaking token values
    let intentKeys = [];
    try {
      if (Array.isArray(job.intents)) intentKeys = job.intents.map(([k]) => String(k));
    } catch (e) {
      intentKeys = [];
    }

    // Sanitize channel config to avoid leaking secrets (headers, auth credentials)
    const rawCfg = job.channelConfig || {};
    const cfgSafe = {};
    if (rawCfg.webhook) {
      const w = rawCfg.webhook;
      cfgSafe.webhook = {
        url: w.url ? String(w.url).replace(/:\/\/.*@/, '://REDACTED@') : undefined,
        method: w.method || undefined,
        headers: Array.isArray(w.headers) ? w.headers.map(([k]) => String(k)) : (w.headers && typeof w.headers === 'object' ? Object.keys(w.headers) : undefined),
        authType: w.authType ? (w.authType.basic ? { basic: { username: w.authType.basic.username ? 'REDACTED' : undefined } } : (w.authType.bearer ? { bearer: 'REDACTED' } : { none: null })) : undefined,
        retryCount: w.retryCount ?? undefined,
        timeoutMs: w.timeoutMs ?? undefined,
      };
    } else {
      // Generic shallow copy but redact known sensitive shapes
      for (const k of Object.keys(rawCfg)) {
        try {
          const v = rawCfg[k];
          if (k === 'apiKey' || k === 'password' || k === 'secret' || k === 'token') {
            cfgSafe[k] = 'REDACTED';
          } else if (typeof v === 'object') {
            cfgSafe[k] = '[object]';
          } else {
            cfgSafe[k] = v;
          }
        } catch (e) {
          cfgSafe[k] = 'REDACTED';
        }
      }
    }

    const sanitized = {
      id: sanitizeValue(job.id),
      messageId: job.messageId,
      messageType: job.messageType,
      recipientId: job.recipientId && sanitizeValue(job.recipientId),
      content: {
        title: job.content?.title,
        bodySnippet,
        contentType: job.content?.contentType,
        priority: sanitizeValue(job.content?.priority),
        metadataCount: Array.isArray(job.content?.metadata) ? job.content.metadata.length : undefined,
      },
      intents: intentKeys,
      channel: {
        id: job.channelId ? sanitizeValue(job.channelId) : null,
        name: job.channelName || null,
        type: job.channelType ? Object.keys(job.channelType)[0] : null,
        config: cfgSafe,
      },
      createdAt: sanitizeValue(job.createdAt),
      expiresAt: sanitizeValue(job.expiresAt),
      attempts: sanitizeValue(job.attempts),
      retryConfig: job.retryConfig || null,
    };

    return sanitized;
  } catch (e) {
    return { id: job?.id ? sanitizeValue(job.id) : null, error: 'sanitize_failed' };
  }
}

const DEFAULT_TIMEOUT = 30000; // ms
const DEFAULT_RETRIES = 2;
const DEFAULT_BACKOFF = 1000; // ms

async function fetchWithRetries(url, fetchOptions = {}, timeoutMs = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES, backoffMs = DEFAULT_BACKOFF) {
  const parsed = new URL(url);
  const hostname = parsed.hostname;

  // Try to resolve DNS first for logging
  try {
    const addrs = await dns.lookup(hostname, { all: true });
    const ips = addrs.map(a => a.address).join(',');
    console.info(`[webhook] resolved ${hostname} -> ${ips}`);
  } catch (dnsErr) {
    console.warn('[webhook] DNS lookup failed for', hostname, dnsErr && dnsErr.code ? dnsErr.code : dnsErr);
    // continue — fetch will surface the error
  }

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const signal = controller.signal;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...fetchOptions, signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      // If aborted due to timeout, normalize the error
      const code = err && err.code ? err.code : (err.name === 'AbortError' ? 'ETIMEDOUT' : null);
      console.warn(`[webhook] attempt ${attempt + 1} failed for ${url}:`, err && err.message ? err.message : err, 'code:', code || err.name);

      const isRetryable = code === 'ETIMEDOUT' || code === 'ECONNRESET' || code === 'EAI_AGAIN' || code === 'ENOTFOUND' || code === 'ECONNREFUSED' || !code;
      if (attempt < retries && isRetryable) {
        const wait = backoffMs * Math.pow(2, attempt);
        console.info(`[webhook] retrying in ${wait}ms (attempt ${attempt + 2}/${retries + 1})`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      throw err;
    }
  }
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
    const body = JSON.stringify(payload);

    const timeoutMs = (cfg?.timeoutMs) || DEFAULT_TIMEOUT;
    const retries = (cfg?.retryCount ?? DEFAULT_RETRIES);
    const backoffMs = DEFAULT_BACKOFF;

    const res = await fetchWithRetries(url, { method, headers, body }, timeoutMs, retries, backoffMs);
    const ok = res && res.status >= 200 && res.status < 300;
    if (!ok) {
      console.warn('[webhook] non-2xx response', res && res.status);
    }
    return ok;
  } catch (e) {
    console.error('[webhook] error', e);
    return false;
  }
}
