import 'dotenv/config';

// Simple webhook sender using the channelConfig of the job
export async function sendWebhook(job) {
  try {
    const cfg = job.channelConfig?.webhook || null;
    const url = cfg?.url || process.env.WEBHOOK_DEFAULT_URL;
    if (!url) throw new Error('No webhook URL provided in channelConfig or WEBHOOK_DEFAULT_URL');

    const method = (cfg?.method || 'POST').toUpperCase();
    const headers = Object.fromEntries(cfg?.headers || []);

    // authType handling
    if (cfg?.authType) {
      if (cfg.authType.none !== undefined) {
        // no-op
      } else if (cfg.authType.basic) {
        const { username, password } = cfg.authType.basic;
        const token = Buffer.from(`${username}:${password}`).toString('base64');
        headers['Authorization'] = `Basic ${token}`;
      } else if (cfg.authType.bearer) {
        headers['Authorization'] = `Bearer ${cfg.authType.bearer}`;
      }
    }

    // Construct payload: include message content and intents
    const body = JSON.stringify({
      id: job.id,
      messageId: job.messageId,
      messageType: job.messageType,
      recipientId: job.recipientId?.toText?.() || String(job.recipientId),
      content: job.content,
      intents: job.intents,
      channel: {
        id: job.channelId,
        type: job.channelType,
        name: job.channelName,
      },
      createdAt: job.createdAt,
    });

    const res = await fetch(url, { method, headers: { 'content-type': 'application/json', ...headers }, body });
    const ok = res.status >= 200 && res.status < 300;
    return ok;
  } catch (e) {
    console.error('[webhook] error', e);
    return false;
  }
}
