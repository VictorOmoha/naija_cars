const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../src/lib/prisma');
const paystack = require('../src/services/paystackService');
require('../src/lib/emailService').sendSubscriptionEmail = async () => {};

process.env.JWT_SECRET = 'subscription-test-secret';
process.env.PAYSTACK_SECRET_KEY = 'webhook-test-secret';
let event;
let subscription;
let txn;
let transactionCalls;
let failure;
let baseUrl;
let server;
prisma.user.findUnique = async () => ({ id: 'buyer', isActive: true });
prisma.paystackEvent.findUnique = async () => event;
prisma.subscription.findFirst = async ({ where }) => (
  subscription && (!where.userId || subscription.userId === where.userId) ? subscription : null
);
prisma.subscription.findUnique = async () => subscription;
paystack.verifyTransaction = async () => txn;
prisma.$transaction = async (callback) => {
  transactionCalls++;
  if (failure) throw failure;
  return callback({
    paystackEvent: { create: async () => {}, update: async () => {} },
    subscription: {
      updateMany: async () => {},
      create: async ({ data }) => { subscription = data; return data; },
    },
  });
};

before(async () => {
  const app = express();
  app.use('/subscriptions/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json());
  app.use('/subscriptions', require('../src/routes/subscriptions'));
  app.use((err, req, res, next) => res.status(err.status || 500).json({ error: err.message }));
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
beforeEach(() => {
  event = null;
  subscription = null;
  transactionCalls = 0;
  failure = null;
  txn = { reference: 'ref-1', status: 'success', amount: 500000, currency: 'NGN', metadata: { userId: 'buyer', planType: 'BASIC' } };
});
const verify = () => fetch(`${baseUrl}/subscriptions/verify?reference=ref-1`, {
  headers: { Authorization: `Bearer ${jwt.sign({ id: 'buyer' }, process.env.JWT_SECRET)}` },
});
const webhook = (payload = { event: 'charge.success', data: txn }, signature) => {
  const body = JSON.stringify(payload);
  return fetch(`${baseUrl}/subscriptions/webhook`, {
    method: 'POST', body,
    headers: { 'Content-Type': 'application/json', 'x-paystack-signature': signature ?? crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(body).digest('hex') },
  });
};
test('already-processed references cannot disclose another user subscription', async () => {
  event = { processed: true };
  subscription = { userId: 'someone-else', paymentReference: 'ref-1' };
  assert.equal((await verify()).status, 404);
  assert.equal(transactionCalls, 0);
});
test('owner can verify a previously processed subscription', async () => {
  event = { processed: true };
  subscription = { userId: 'buyer', paymentReference: 'ref-1' };
  assert.equal((await verify()).status, 200);
  assert.equal(transactionCalls, 0);
});
test('verification checks payment ownership, amount, and currency', async () => {
  txn.metadata.userId = 'other';
  assert.equal((await verify()).status, 403);
  txn.metadata.userId = 'buyer';
  txn.amount = 1;
  assert.equal((await verify()).status, 400);
  txn.amount = 500000;
  txn.currency = 'USD';
  assert.equal((await verify()).status, 400);
  assert.equal(transactionCalls, 0);
});
test('valid NGN payment activates exactly the purchased plan', async () => {
  assert.equal((await verify()).status, 200);
  assert.equal(subscription.amountPaid, 5000);
  assert.equal(subscription.listingsLimit, 5);
});
test('webhook refuses invalid signatures and underpayments', async () => {
  assert.equal((await webhook(undefined, 'invalid')).status, 401);
  txn.amount = 1;
  assert.equal((await webhook()).status, 400);
  assert.equal(transactionCalls, 0);
});
test('webhook acknowledges duplicates but retries failed storage', async () => {
  event = { processed: true };
  assert.equal((await webhook()).status, 200);
  assert.equal(transactionCalls, 0);
  event = null;
  failure = new Error('database temporarily unavailable');
  assert.equal((await webhook()).status, 500);
});
test('webhook handles concurrent delivery once the other transaction commits', async () => {
  failure = Object.assign(new Error('duplicate'), { code: 'P2002' });
  let checks = 0;
  prisma.paystackEvent.findUnique = async () => ++checks === 1 ? null : { processed: true };
  assert.equal((await webhook()).status, 200);
  prisma.paystackEvent.findUnique = async () => event;
});
test('unrelated webhook events need no transaction reference', async () => {
  assert.equal((await webhook({ event: 'subscription.disable', data: {} })).status, 200);
  assert.equal(transactionCalls, 0);
});
test('signature verification fails closed without a configured secret', () => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  delete process.env.PAYSTACK_SECRET_KEY;
  assert.equal(paystack.validateWebhook('{}', '0'.repeat(128)), false);
  process.env.PAYSTACK_SECRET_KEY = secret;
});
