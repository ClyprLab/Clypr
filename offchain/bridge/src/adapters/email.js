import nodemailer from 'nodemailer';
import fs from 'node:fs';
import path from 'node:path';

function sanitizeValue(v) {
  if (typeof v === 'bigint') return v.toString();
  if (v && typeof v.toText === 'function') return v.toText();
  return v;
}

function parseIntents(intents) {
  try {
    return Object.fromEntries(intents.map(([k, v]) => [k, sanitizeValue(v)]));
  } catch (e) {
    return {};
  }
}

// Helper: demo transport that mimics nodemailer's sendMail
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
    try { fs.mkdirSync(outDir, { recursive: true }); } catch(_) {}
    const filename = path.join(outDir, `email-${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify(out, null, 2), { encoding: 'utf8' });
    console.info('[email][demo] wrote demo email to', filename);
    // return object similar to nodemailer info
    return { messageId: `demo-${Date.now()}`, demoFile: filename };
  } catch (e) {
    console.error('[email][demo] failed to write demo email:', e);
    throw e;
  }
}

/**
 * Minimal email adapter for verification jobs.
 * Expects job.intents to include: token, email, expiresAt, owner
 */
export async function handleVerificationJob(job) {
  const intents = parseIntents(job.intents || []);
  const token = intents.token || (job.content && job.content.body);
  const email = intents.email || (job.channelConfig && job.channelConfig.email && job.channelConfig.email.fromAddress) || null;
  if (!token || !email) {
    console.warn('[email] verification job missing token or email, skipping', job.id);
    return false;
  }

  // If DEMO_EMAIL is enabled, just write a demo file and return success
  if (String(process.env.DEMO_EMAIL || '').toLowerCase() === 'true') {
    try {
      const verificationUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/verify-email?token=${encodeURIComponent(token)}`;
      const mail = {
        from: process.env.VERIFICATION_FROM || `no-reply@${(new URL(process.env.IC_HOST || 'https://ic0.app')).hostname}`,
        to: email,
        subject: 'Clypr Email Verification (DEMO)',
        text: `Your verification token: ${token}\nVerify here: ${verificationUrl}`,
        html: `<p>Your verification token: <b>${token}</b></p><p><a href="${verificationUrl}">Click to verify</a></p>`
      };
      const info = await demoSendMail(mail);
      console.info('[email][demo] verification email simulated for job', job.id, 'info', info);
      return true;
    } catch (e) {
      console.error('[email][demo] error simulating verification email:', e);
      return false;
    }
  }

  // Transport configuration - prefer explicit env variables
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromAddress = process.env.VERIFICATION_FROM || `no-reply@${(new URL(process.env.IC_HOST || 'https://ic0.app')).hostname}`;

  let transporter;
  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass }
    });
  } else {
    // Fallback to ethereal for dev if not configured
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.info('[email] using ethereal test account. preview url will be logged');
  }

  const verificationUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/verify-email?token=${encodeURIComponent(token)}`;
  const mail = {
    from: fromAddress,
    to: email,
    subject: 'Clypr Email Verification',
    text: `Your verification token: ${token}\nVerify here: ${verificationUrl}`,
    html: `<p>Your verification token: <b>${token}</b></p><p><a href="${verificationUrl}">Click to verify</a></p>`
  };

  try {
    const info = await transporter.sendMail(mail);
    console.info('[email] sent verification email for job', job.id, 'messageId', info.messageId);
    if (nodemailer.getTestMessageUrl && info && info.messageId) {
      const url = nodemailer.getTestMessageUrl(info);
      if (url) console.info('[email] preview URL:', url);
    }
    return true;
  } catch (e) {
    console.error('[email] sendMail error:', e);
    return false;
  }
}

/**
 * Minimal email adapter for regular message jobs.
 * Expects job.intents to include: email
 */
export async function handleMessageJob(job) {
  const intents = parseIntents(job.intents || []);
  // Determine recipient email: prefer channel config, fallback to intent 'email'
  const email = intents.email || (job.channelConfig && job.channelConfig.email && job.channelConfig.email.fromAddress) || null;
  const fromAddr = (job.channelConfig && job.channelConfig.email && job.channelConfig.email.replyTo) || process.env.VERIFICATION_FROM || `no-reply@${(new URL(process.env.IC_HOST || 'https://ic0.app')).hostname}`;

  if (!email) {
    console.warn('[email] message job missing recipient email, skipping', job.id);
    return false;
  }

  // Build subject and body from job.content
  const subject = (job.content && (job.content.title || job.messageType)) || `Notification from Clypr: ${job.messageType}`;
  const body = job.content && (job.content.body || '') || '';

  // Flatten metadata into a footer for human-readable email (non-sensitive)
  let metaText = '';
  try {
    const meta = job.content && job.content.metadata ? job.content.metadata : [];
    if (Array.isArray(meta) && meta.length > 0) {
      metaText = '\n\nMetadata:\n' + meta.map(([k, v]) => `${k}: ${sanitizeValue(v)}`).join('\n');
    }
  } catch (e) {
    // ignore
  }

  // If DEMO_EMAIL is enabled, write demo file and return success
  if (String(process.env.DEMO_EMAIL || '').toLowerCase() === 'true') {
    try {
      const mail = {
        from: fromAddr,
        to: email,
        subject,
        text: `${body}${metaText}`,
        html: `<div>${(body || '').replace(/\n/g, '<br/>')}<pre style="opacity:0.8">${metaText}</pre></div>`
      };
      const info = await demoSendMail(mail);
      console.info('[email][demo] message email simulated for job', job.id, 'info', info);
      return true;
    } catch (e) {
      console.error('[email][demo] error simulating message email:', e);
      return false;
    }
  }

  // Transport configuration - prefer explicit env variables
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  let transporter;
  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass }
    });
  } else {
    // Fallback to ethereal for dev if not configured
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.info('[email] using ethereal test account. preview url will be logged');
  }

  const mail = {
    from: fromAddr,
    to: email,
    subject,
    text: `${body}${metaText}`,
    html: `<div>${(body || '').replace(/\n/g, '<br/>')}<pre style="opacity:0.8">${metaText}</pre></div>`
  };

  try {
    const info = await transporter.sendMail(mail);
    console.info('[email] sent message email for job', job.id, 'messageId', info.messageId);
    if (nodemailer.getTestMessageUrl && info && info.messageId) {
      const url = nodemailer.getTestMessageUrl(info);
      if (url) console.info('[email] preview URL:', url);
    }
    return true;
  } catch (e) {
    console.error('[email] sendMail error for message job:', e);
    return false;
  }
}
