const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  // Use SMTP credentials from env if available
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else if (process.env.NODE_ENV === 'development') {
    // In dev, use Ethereal (fake SMTP - catches emails without sending)
    // Falls back to console logging if Ethereal isn't configured
    transporter = null;
  }

  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();

  if (!t) {
    // No transporter configured — log to console in dev
    console.log(`\n[EMAIL - DEV FALLBACK]`);
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body: ${text || html}`);
    console.log(`[END EMAIL]\n`);
    return;
  }

  await t.sendMail({
    from: `"Naija Cars" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text
  });
}

async function sendOTPEmail(email, code) {
  await sendEmail({
    to: email,
    subject: 'Your Naija Cars verification code',
    text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
        <h2 style="color:#16a34a;">Verify your Naija Cars account</h2>
        <p>Use the code below to verify your account:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#111;margin:24px 0;">${code}</div>
        <p style="color:#6b7280;font-size:14px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#9ca3af;font-size:12px;">If you did not create a Naija Cars account, you can safely ignore this email.</p>
      </div>
    `
  });
}

async function sendPasswordResetEmail(email, code) {
  await sendEmail({
    to: email,
    subject: 'Your Naija Cars password reset code',
    text: `Your password reset code is: ${code}\n\nThis code expires in 30 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
        <h2 style="color:#16a34a;">Reset your Naija Cars password</h2>
        <p>Use the code below to reset your password:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#111;margin:24px 0;">${code}</div>
        <p style="color:#6b7280;font-size:14px;">This code expires in <strong>30 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#9ca3af;font-size:12px;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `
  });
}

module.exports = { sendOTPEmail, sendPasswordResetEmail };
