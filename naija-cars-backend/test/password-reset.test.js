const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../src/lib/prisma');
const service = require('../src/services/authService');

let claimed;
let writes;
beforeEach(() => {
  claimed = false;
  writes = 0;
  prisma.user.findUnique = async () => ({ id: 'user' });
  prisma.verification.findFirst = async () => ({ id: 'code-1' });
  prisma.$transaction = async (callback) => callback({
    verification: { updateMany: async () => {
      if (claimed) return { count: 0 };
      claimed = true;
      return { count: 1 };
    } },
    user: { update: async () => { writes++; } },
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
