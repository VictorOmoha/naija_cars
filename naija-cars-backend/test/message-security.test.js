const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../src/lib/prisma');
const service = require('../src/services/messageService');

const account = {
  id: 'seller', email: 'seller@example.com', passwordHash: 'must-not-leak', phoneNumber: 'private',
  profile: { firstName: 'Seller', address: 'Private home', verificationDocs: 'private-id-document' },
};
// Apply Prisma's select semantics to a fixture containing private fields.
function project(row, query) {
  if (!query?.select) return row;
  return Object.fromEntries(Object.entries(query.select).map(([key, value]) => [
    key, value === true ? row[key] : project(row[key], value),
  ]));
}
const messageFor = (query) => ({
  id: 'message-1', conversationId: 'buyer_seller', senderId: 'seller', receiverId: 'buyer',
  sender: project(account, query.include.sender),
  ...(query.include.receiver && { receiver: project(account, query.include.receiver) }),
});
beforeEach(() => {
  prisma.user.findFirst = async () => ({ id: 'buyer' });
  prisma.carListing.findFirst = async () => ({ id: 'listing', sellerId: 'seller' });
  prisma.message.create = async (query) => messageFor(query);
  prisma.message.findMany = async (query) => [messageFor(query)];
  prisma.message.count = async () => 1;
});
test('seller can reply about their own listing', async () => {
  const message = await service.sendMessage({ senderId: 'seller', receiverId: 'buyer', listingId: 'listing', messageText: 'Available' });
  assert.equal(message.id, 'message-1');
});
test('unrelated participants cannot attach another seller listing', async () => {
  await assert.rejects(service.sendMessage({ senderId: 'third-party', receiverId: 'buyer', listingId: 'listing', messageText: 'Hi' }), { status: 400 });
});
test('send, conversations, and history responses omit passwords and private profiles', async () => {
  const results = [
    await service.sendMessage({ senderId: 'buyer', receiverId: 'seller', messageText: 'Hi' }),
    await service.getUserConversations('buyer'),
    await service.getConversationMessages('buyer_seller', 'buyer'),
  ];
  for (const result of results) {
    assert.doesNotMatch(JSON.stringify(result), /passwordHash|verificationDocs|Private home|must-not-leak/);
    assert.match(JSON.stringify(result), /Seller/);
  }
});
test('history rejects unrelated users and malformed conversation IDs', async () => {
  await assert.rejects(service.getConversationMessages('buyer_seller', 'intruder'), { status: 403 });
  await assert.rejects(service.getConversationMessages('buyer_seller_intruder', 'buyer'), { status: 403 });
});
