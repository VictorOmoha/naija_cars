const crypto = require('crypto');

const PAYSTACK_BASE = 'https://api.paystack.co';

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
}

async function paystackRequest(method, path, body) {
  const options = { method, headers: getHeaders() };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${PAYSTACK_BASE}${path}`, options);
  const data = await res.json();

  if (!data.status) {
    throw new Error(data.message || 'Paystack API error');
  }
  return data.data;
}

/**
 * Initialize a transaction — returns authorization_url for redirect
 */
async function initializeTransaction({ email, amount, metadata, callbackUrl }) {
  return paystackRequest('POST', '/transaction/initialize', {
    email,
    amount, // in kobo
    currency: 'NGN',
    callback_url: callbackUrl,
    metadata,
  });
}

/**
 * Verify a transaction by reference
 */
async function verifyTransaction(reference) {
  return paystackRequest('GET', `/transaction/verify/${encodeURIComponent(reference)}`);
}

/**
 * Validate a webhook signature
 */
function validateWebhook(rawBody, signature) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
}

module.exports = {
  initializeTransaction,
  verifyTransaction,
  validateWebhook,
};
