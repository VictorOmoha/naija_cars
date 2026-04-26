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

async function sendWelcomeEmail(email, { firstName, userType }) {
  const userTypeLabels = {
    INDIVIDUAL_SELLER: 'Individual Seller',
    DEALER: 'Dealer',
    RENTAL_COMPANY: 'Rental Company',
    BUYER: 'Buyer',
    ADMIN: 'Admin',
  };
  const accountTypeLabel = userTypeLabels[userType] || userType;
  const greeting = firstName ? `Welcome, ${firstName}!` : 'Welcome to Naija Cars!';
  const clientUrl = process.env.CLIENT_URL || 'https://www.naijacars.online';

  await sendEmail({
    to: email,
    subject: 'Welcome to Naija Cars 🎉',
    text: `${greeting}\n\nYour ${accountTypeLabel} account has been created successfully. You can now browse cars, save favorites, and contact sellers.\n\nGet started: ${clientUrl}\n\nNeed help? Visit ${clientUrl}/help`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;background:#fafafa;">
        <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <h2 style="color:#16a34a;margin:0 0 8px;">${greeting}</h2>
          <p style="color:#374151;font-size:16px;margin:0 0 24px;">
            Your <strong>${accountTypeLabel}</strong> account has been created successfully.
          </p>
          <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px 20px;border-radius:8px;margin:24px 0;">
            <p style="margin:0;color:#15803d;font-weight:600;">What's next?</p>
            <ul style="margin:8px 0 0;padding-left:20px;color:#374151;">
              <li>Browse thousands of verified cars across Nigeria</li>
              <li>Save your favorite listings</li>
              <li>Message sellers directly</li>
              ${userType !== 'BUYER' ? '<li>Subscribe to a plan to start listing your own cars</li>' : ''}
            </ul>
          </div>
          <a href="${clientUrl}" style="display:inline-block;background:#16a34a;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;margin:8px 0;">
            Go to Naija Cars
          </a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="color:#9ca3af;font-size:12px;margin:0;">
            Need help? Visit our <a href="${clientUrl}/help" style="color:#16a34a;">Help Center</a> or reply to this email.
          </p>
        </div>
      </div>
    `
  });
}

async function sendSubscriptionEmail(email, { firstName, planName, amount, endDate, listingsLimit }) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';
  const clientUrl = process.env.CLIENT_URL || 'https://www.naijacars.online';
  const formattedAmount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  const formattedEnd = new Date(endDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
  const limitLabel = listingsLimit === -1 ? 'Unlimited listings' : `${listingsLimit} listings/month`;

  await sendEmail({
    to: email,
    subject: `Your Naija Cars ${planName} subscription is active`,
    text: `${greeting}\n\nThanks for subscribing to the ${planName} plan!\n\nPayment: ${formattedAmount}\nIncludes: ${limitLabel}\nValid until: ${formattedEnd}\n\nStart listing your cars now: ${clientUrl}/sell\nView your dashboard: ${clientUrl}/dashboard`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;background:#fafafa;">
        <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <h2 style="color:#16a34a;margin:0 0 8px;">Subscription Activated 🎉</h2>
          <p style="color:#374151;font-size:16px;margin:0 0 24px;">
            ${greeting} thanks for subscribing to the <strong>${planName}</strong> plan!
          </p>
          <div style="background:#f9fafb;border-radius:12px;padding:20px;margin:24px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:6px 0;color:#6b7280;">Plan</td>
                <td style="padding:6px 0;color:#111;font-weight:600;text-align:right;">${planName}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;">Amount</td>
                <td style="padding:6px 0;color:#111;font-weight:600;text-align:right;">${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;">Includes</td>
                <td style="padding:6px 0;color:#111;font-weight:600;text-align:right;">${limitLabel}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;">Valid until</td>
                <td style="padding:6px 0;color:#111;font-weight:600;text-align:right;">${formattedEnd}</td>
              </tr>
            </table>
          </div>
          <a href="${clientUrl}/sell" style="display:inline-block;background:#16a34a;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;margin:8px 8px 8px 0;">
            List Your Car
          </a>
          <a href="${clientUrl}/dashboard" style="display:inline-block;background:#f3f4f6;color:#111;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;margin:8px 0;">
            View Dashboard
          </a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="color:#9ca3af;font-size:12px;margin:0;">
            Questions? Reply to this email or visit our <a href="${clientUrl}/help" style="color:#16a34a;">Help Center</a>.
          </p>
        </div>
      </div>
    `
  });
}

module.exports = { sendOTPEmail, sendPasswordResetEmail, sendWelcomeEmail, sendSubscriptionEmail };
