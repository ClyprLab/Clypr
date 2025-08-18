import nodemailer from 'nodemailer';

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
