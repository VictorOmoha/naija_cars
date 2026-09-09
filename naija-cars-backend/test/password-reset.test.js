const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const prisma = require('../src/lib/prisma');
const service = require('../src/services/authService');

// Capture mail locally; these tests must never send real recovery emails.
process.env.NODE_ENV = 'production';
process.env.SMTP_HOST = 'smtp.example.test';
process.env.SMTP_USER = 'test@example.test';
process.env.SMTP_PASS = 'test-only';
process.env.FROM_EMAIL = 'test@example.test';
process.env.SENDGRID_API_KEY = '';
let messages, deliveryFailure, resetRecord, removedRecord, savedHash;
nodemailer.createTransport = () => ({
  sendMail: async message => {
    if (deliveryFailure) throw new Error('SMTP credentials rejected');
    messages.push(message);
  }
});

let claimed;
let writes;
beforeEach(() => {
  messages = [];
  deliveryFailure = false;
  resetRecord = removedRecord = savedHash = null;
  claimed = false;
  writes = 0;
  prisma.user.findUnique = async () => ({ id: 'user' });
  prisma.verification.findFirst = async () => ({ id: 'code-1' });
  prisma.verification.deleteMany = async () => ({ count: 1 });
  prisma.verification.create = async ({ data }) => {
    resetRecord = { id: 'code-1', ...data };
    return resetRecord;
  };
  prisma.verification.delete = async ({ where }) => { removedRecord = where.id; };
  prisma.$transaction = async (callback) => callback({
    verification: { updateMany: async () => {
      if (claimed) return { count: 0 };
      claimed = true;
      return { count: 1 };
    } },
    user: { update: async ({ data }) => { writes++; savedHash = data.passwordHash; } },
  });
});
test('concurrent reset attempts cannot reuse the same reset code', async () => {
  const results = await Promise.allSettled([
    service.resetPassword('user@example.com', '123456', 'Password123'),
    service.resetPassword('user@example.com', '123456', 'Different123'),
  ]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(writes, 1);
  assert.equal(results.find(result => result.status === 'rejected').reason.status, 400);
});
test('verification codes cannot consume password-reset records', async () => {
  prisma.verification.findFirst = async ({ where }) => {
    assert.equal(where.verificationType, 'OTP_PHONE');
    return null;
  };
  await assert.rejects(service.verifyOTP('user', '123456'), { status: 400 });
});

test('recovery emails contain the saved six-digit code with a 30-minute expiry', async () => {
  const started = Date.now();
  prisma.user.findUnique = async ({ where }) => {
    assert.equal(where.email, 'user@example.com');
    return { id: 'user' };
  };
  await service.requestPasswordReset('User@Example.com');
  assert.equal(messages.length, 1);
  assert.equal(messages[0].to, 'User@Example.com');
  assert.match(resetRecord.code, /^\d{6}$/);
  assert.equal(resetRecord.verificationType, 'OTP_EMAIL');
  assert.ok(resetRecord.expiresAt.getTime() >= started + 30 * 60 * 1000);
  assert.ok(resetRecord.expiresAt.getTime() <= Date.now() + 30 * 60 * 1000);
  assert.ok(messages[0].text.includes(resetRecord.code));
  assert.match(messages[0].text, /30 minutes/);
});

test('unknown emails receive the same response without creating or sending a code', async () => {
  const known = await service.requestPasswordReset('user@example.com');
  resetRecord = null;
  messages = [];
  prisma.user.findUnique = async () => null;
  const unknown = await service.requestPasswordReset('missing@example.com');
  assert.deepEqual(unknown, known);
  assert.equal(resetRecord, null);
  assert.equal(messages.length, 0);
});

test('resending replaces unused recovery codes without deleting other verification records', async () => {
  let invalidated = false;
  prisma.verification.deleteMany = async ({ where }) => {
    assert.deepEqual(where, { userId: 'user', verificationType: 'OTP_EMAIL', isVerified: false });
    invalidated = true;
  };
  prisma.verification.create = async () => {
    assert.equal(invalidated, true);
    return { id: 'replacement' };
  };
  await service.requestPasswordReset('user@example.com');
});

test('delivery failures remove the unusable code and return a retryable error', async () => {
  deliveryFailure = true;
  await assert.rejects(service.requestPasswordReset('user@example.com'), {
    status: 503,
    message: 'We could not send the reset email right now. Please try again shortly.'
  });
  assert.equal(removedRecord, 'code-1');
  assert.equal(messages.length, 0);
});

test('invalid, expired, used, and other-purpose codes cannot change a password', async () => {
  prisma.verification.findFirst = async ({ where }) => {
    assert.equal(where.userId, 'user');
    assert.equal(where.verificationType, 'OTP_EMAIL');
    assert.equal(where.code, '123456');
    assert.equal(where.isVerified, false);
    assert.ok(where.expiresAt.gte instanceof Date);
    return null;
  };
  await assert.rejects(service.resetPassword('user@example.com', '123456', 'Password123'), { status: 400 });
  assert.equal(writes, 0);
});

test('a valid recovery code saves a hashed password and cannot be used twice', async () => {
  await service.resetPassword('user@example.com', '123456', 'NewPassword123');
  assert.notEqual(savedHash, 'NewPassword123');
  assert.equal(await bcrypt.compare('NewPassword123', savedHash), true);
  await assert.rejects(service.resetPassword('user@example.com', '123456', 'Different123'), { status: 400 });
  assert.equal(writes, 1);
});
