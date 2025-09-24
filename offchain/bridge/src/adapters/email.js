import nodemailer from 'nodemailer';
import fs from 'node:fs';
import path from 'node:path';

function sanitizeValue(v) {
  if (typeof v === 'bigint') return v.toString();
  if (v && typeof v.toText === 'function') return v.toText();
  return v;
}

function normalizeEmailInput(input) {
  if (!input && input !== 0) return null;

  if (Array.isArray(input) && input.length > 0) {
    input = input[0];
  }

  if (typeof input === 'object' && input !== null) {
    if (typeof input.email === 'string') input = input.email;
    else if (typeof input.address === 'string') input = input.address;
    else if (typeof input.to === 'string') input = input.to;
    else input = String(input);
  }

  if (typeof input !== 'string') input = String(input);

  input = input.replace(/[\u0000-\u001F\u007F\u200B\uFEFF]/g, '').trim();
  if (input.length === 0) return null;

  if (input.includes(',')) {
    const parts = input.split(',').map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      const normalized = normalizeEmailInput(p);
      if (normalized) return normalized;
    }
    return null;
  }

  const angleMatch = input.match(/<([^>]+)>/);
  if (angleMatch && angleMatch[1]) {
    input = angleMatch[1];
  }

  if (!/^[^@\s]+@[^@\s]+$/.test(input)) return null;

  return input;
}

function parseIntents(intents) {
  try {
    return Object.fromEntries(intents.map(([k, v]) => [k, sanitizeValue(v)]));
  } catch (e) {
    return {};
  }
}

async function demoSendMail(mail) {
  try {
    const out = {
      timestamp: new Date().toISOString(),
      from: mail.from,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html
    };
    const outDir = process.env.DEMO_EMAIL_DIR || path.join(process.cwd(), 'offchain', 'bridge', 'demo_emails');
    fs.mkdirSync(outDir, { recursive: true });
    const filename = path.join(outDir, `email-${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify(out, null, 2), { encoding: 'utf8' });
    console.info('[email][demo] wrote demo email to', filename);
    return { messageId: `demo-${Date.now()}`, demoFile: filename };
  } catch (e) {
    console.error('[email][demo] failed to write demo email:', e);
    throw e;
  }
}

function getTransport() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass }
    });
  }

  // fallback ethereal
  return nodemailer.createTestAccount().then(testAccount =>
    nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    })
  );
}

/**
 * Verification emails
 */
export async function handleVerificationJob(job) {
  const intents = parseIntents(job.intents || []);
  const token = intents.token || (job.content && job.content.body);

  const rawRecipient =
    job.channelConfig?.email?.fromAddress ||
    intents.email ||
    null;
  const recipient = normalizeEmailInput(rawRecipient);

  const fromAddr =
    process.env.VERIFICATION_FROM ||
    process.env.SMTP_FROM ||
    `no-reply@${(new URL(process.env.IC_HOST || 'https://ic0.app')).hostname}`;

  if (!token || !recipient) {
    console.warn('[email] verification job missing token or email, skipping', job.id);
    return false;
  }

  const verificationUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/verify-email?token=${encodeURIComponent(token)}`;
  const mail = {
    from: fromAddr,
    to: recipient,
    subject: 'Clypr Email Verification',
    text: `Your verification token: ${token}\n\nClick to verify: ${verificationUrl}`,
    html: `<p>Your verification token: <b>${token}</b></p><p><a href="${verificationUrl}">Click to verify</a></p>`
  };

  if (String(process.env.DEMO_EMAIL || '').toLowerCase() === 'true') {
    await demoSendMail(mail);
    return true;
  }

  try {
    const transporter = await getTransport();
    console.info('[email][debug] about to send verification mail', job.id, {
      rawRecipient,
      normalizedRecipient: recipient,
      from: fromAddr
    });
    const info = await transporter.sendMail(mail);
    console.info('[email] sent verification email for job', job.id, 'messageId', info.messageId);
    return true;
  } catch (e) {
    console.error('[email] sendMail error (verification):', e);
    return false;
  }
}

/**
 * Regular message emails
 */
export async function handleMessageJob(job) {
  const intents = parseIntents(job.intents || []);

  const rawRecipient =
    job.channelConfig?.email?.fromAddress ||
    intents.email ||
    null;
  const recipient = normalizeEmailInput(rawRecipient);

  const fromAddr =
    process.env.SMTP_FROM ||
    process.env.VERIFICATION_FROM ||
    `no-reply@${(new URL(process.env.IC_HOST || 'https://ic0.app')).hostname}`;

  if (!recipient) {
    console.warn('[email] message job missing recipient email, skipping', job.id);
    return false;
  }

  const subject =
    (job.content && (job.content.title || job.messageType)) ||
    `Notification from Clypr: ${job.messageType}`;
  const body = (job.content && job.content.body) || '';

  let metaText = '';
  if (Array.isArray(job.content?.metadata) && job.content.metadata.length > 0) {
    metaText =
      '\n\nMetadata:\n' +
      job.content.metadata.map(([k, v]) => `${k}: ${sanitizeValue(v)}`).join('\n');
  }

  const mail = {
    from: fromAddr,
    to: recipient,
    subject,
    text: `${body}${metaText}`,
    html: `<div>${(body || '').replace(/\n/g, '<br/>')}<pre style="opacity:0.8">${metaText}</pre></div>`
  };

  if (String(process.env.DEMO_EMAIL || '').toLowerCase() === 'true') {
    await demoSendMail(mail);
    return true;
  }

  try {
    const transporter = await getTransport();
    console.info('[email][debug] about to send message mail', job.id, {
      rawRecipient,
      normalizedRecipient: recipient,
      from: fromAddr
    });
    const info = await transporter.sendMail(mail);
    console.info('[email] sent message email for job', job.id, 'messageId', info.messageId);
    return true;
  } catch (e) {
    console.error('[email] sendMail error (message):', e);
    return false;
  }
}
