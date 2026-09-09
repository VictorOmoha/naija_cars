const { test, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const nodemailer = require('nodemailer');
const { sendPasswordResetEmail } = require('../src/lib/emailService');

let requests;
beforeEach(() => {
  process.env.NODE_ENV = 'production';
  process.env.SENDGRID_API_KEY = 'test-only-sendgrid-key';
  process.env.FROM_EMAIL = 'support@example.test';
  process.env.SMTP_HOST = 'smtp.example.test';
  process.env.SMTP_USER = 'smtp-user@example.test';
  process.env.SMTP_PASS = 'test-only-smtp-password';
  requests = [];
  mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url, ...options });
    return { status: 202 };
  });
});
afterEach(() => mock.restoreAll());

test('recovery emails use SendGrid HTTPS even when SMTP credentials also exist', async () => {
  mock.method(nodemailer, 'createTransport', () => { throw new Error('SMTP must not be used'); });
  await sendPasswordResetEmail('user@example.test', '123456');
  assert.equal(requests.length, 1);
  const request = requests[0];
  assert.equal(request.url, 'https://api.sendgrid.com/v3/mail/send');
  assert.equal(request.method, 'POST');
  assert.equal(request.headers.Authorization, 'Bearer test-only-sendgrid-key');
  assert.equal(request.headers['Content-Type'], 'application/json');
  assert.ok(request.signal instanceof AbortSignal);
  const body = JSON.parse(request.body);
  assert.deepEqual(body.personalizations, [{ to: [{ email: 'user@example.test' }] }]);
  assert.deepEqual(body.from, { email: 'support@example.test', name: 'Naija Cars' });
  assert.match(body.subject, /password reset/i);
  assert.deepEqual(body.content.map(part => part.type), ['text/plain', 'text/html']);
  assert.ok(body.content.every(part => part.value.includes('123456')));
});

test('provider errors reject without leaking the provider response or reporting success', async () => {
  mock.method(globalThis, 'fetch', async () => ({ status: 403 }));
  await assert.rejects(sendPasswordResetEmail('user@example.test', '123456'), {
    message: 'Email provider rejected the request (403)'
  });
});

test('network failures and timeouts reject instead of retrying an uncertain email send', async () => {
  let attempts = 0;
  mock.method(globalThis, 'fetch', async () => {
    attempts++;
    throw new Error('Network timeout');
  });
  await assert.rejects(sendPasswordResetEmail('user@example.test', '123456'), /Network timeout/);
  assert.equal(attempts, 1);
});

test('a SendGrid request requires a valid sender configuration', async () => {
  process.env.FROM_EMAIL = '';
  process.env.SMTP_USER = 'apikey';
  await assert.rejects(sendPasswordResetEmail('user@example.test', '123456'), /sender is not configured/);
  assert.equal(requests.length, 0);
});

test('SMTP remains available when no SendGrid API key is configured', async () => {
  process.env.SENDGRID_API_KEY = '';
  let sent;
  mock.method(nodemailer, 'createTransport', options => {
    assert.equal(options.host, 'smtp.example.test');
    assert.equal(options.connectionTimeout, 15000);
    return { sendMail: async message => { sent = message; } };
  });
  await sendPasswordResetEmail('user@example.test', '123456');
  assert.equal(sent.to, 'user@example.test');
  assert.match(sent.text, /123456/);
  assert.equal(requests.length, 0);
});
