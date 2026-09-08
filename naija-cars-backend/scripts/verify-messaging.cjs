// Real HTTP + Socket.IO integration against the isolated local preview only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const bcrypt = require('bcryptjs');
const { io } = require('../../naija-cars-app/node_modules/socket.io-client');
const password = fs.readFileSync(path.resolve(__dirname, '../../.preview/db-password.txt'), 'utf8').trim();
process.env.DATABASE_URL = `postgresql://naijacars_preview:${password}@127.0.0.1:5432/naijacars_preview`;
const prisma = require('../src/lib/prisma');
const base = 'http://127.0.0.1:5056';
const userIds = [randomUUID(), randomUUID(), randomUUID()];
const sockets = [];

async function request(route, { token, body, method = 'GET', status = 200 } = {}) {
  const response = await fetch(base + '/api' + route, {
    method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json();
  assert.equal(response.status, status, `${method} ${route}: ${JSON.stringify(payload).slice(0, 150)}`);
  return payload.data;
}
function event(socket, name, predicate = () => true) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { socket.off(name, receive); reject(new Error(`Timed out: ${name}`)); }, 5000);
    function receive(payload) {
      if (!predicate(payload)) return;
      clearTimeout(timer); socket.off(name, receive); resolve(payload);
    }
    socket.on(name, receive);
  });
}
async function connect(token) {
  const socket = io(base, { auth: { token }, autoConnect: false, reconnection: false });
  sockets.push(socket);
  const ready = event(socket, 'connect');
  socket.connect(); await ready;
  return socket;
}
async function run() {
  const passwordHash = await bcrypt.hash('MessagingQA2026!', 10);
  for (const [index, id] of userIds.entries()) await prisma.user.create({ data: {
    id, email: `messaging-${id}@naijacars.test`, phoneNumber: `+test-${id}`, passwordHash,
    userType: index === 1 ? 'DEALER' : 'BUYER', isVerified: true,
    profile: { create: { firstName: ['Buyer', 'Seller', 'Outsider'][index], lastName: 'Messaging QA' } },
  } });
  const [buyer, seller, outsider] = await Promise.all(userIds.map(id => request('/auth/login', { method: 'POST', body: { email: `messaging-${id}@naijacars.test`, password: 'MessagingQA2026!' } })));
  const listing = await prisma.carListing.create({ data: { sellerId: seller.user.id, listingType: 'SALE', make: 'Toyota', model: 'Messaging QA', year: 2022, transmission: 'automatic', fuelType: 'petrol', condition: 'FOREIGN_USED', price: 12000000, locationState: 'Lagos', locationCity: 'Lagos', status: 'ACTIVE' } });
  const conversationId = [buyer.user.id, seller.user.id].sort().join('_');
  const [buyerSocket, sellerSocket] = await Promise.all([connect(buyer.accessToken), connect(seller.accessToken)]);
  const send = (account, receiverId, text) => request('/messages', { token: account.accessToken, method: 'POST', status: 201, body: { receiverId, listingId: listing.id, messageText: text } });
  const incoming = event(sellerSocket, 'new-message');
  const ownDelivery = event(buyerSocket, 'new-message');
  const first = (await send(buyer, seller.user.id, 'Is this car available?')).message;
  assert.equal((await incoming).message.id, first.id);
  assert.equal((await ownDelivery).message.id, first.id);
  const conversations = () => request('/messages/conversations', { token: seller.accessToken }).then(data => data.conversations);
  assert.equal((await conversations())[0].unreadCount, 1);
  console.log('PASS first message persists, delivers live to both participants, and increments unread count');

  const replyDelivery = event(buyerSocket, 'new-message');
  await send(seller, buyer.user.id, 'Yes, it is available.');
  assert.equal((await replyDelivery).message.senderId, seller.user.id);
  const readDelivery = event(buyerSocket, 'messages-read');
  const second = (await send(buyer, seller.user.id, 'Can we arrange a viewing?')).message;
  await request(`/messages/${conversationId}/read`, { token: seller.accessToken, method: 'PUT', body: { messageIds: [first.id] } });
  assert.equal((await readDelivery).readerId, seller.user.id);
  assert.equal((await conversations())[0].unreadCount, 1);
  await request(`/messages/${conversationId}/read`, { token: seller.accessToken, method: 'PUT', body: { messageIds: [second.id] } });
  assert.equal((await conversations())[0].unreadCount, 0);
  console.log('PASS seller replies, read receipts and unread counts; unseen arrivals remain unread');

  buyerSocket.emit('join-conversation', conversationId);
  sellerSocket.emit('join-conversation', conversationId);
  // Joining and typing are ordered on each socket; this barrier confirms both joins reached the server.
  await new Promise(resolve => setTimeout(resolve, 100));
  const typing = event(sellerSocket, 'user-typing');
  buyerSocket.emit('typing', { conversationId, isTyping: true });
  assert.deepEqual(await typing, { conversationId, userId: buyer.user.id, isTyping: true });
  sellerSocket.disconnect();
  const offline = (await send(buyer, seller.user.id, 'Saved while the recipient is offline.')).message;
  assert.ok((await request(`/messages/${conversationId}`, { token: seller.accessToken })).messages.some(message => message.id === offline.id));
  const ready = event(sellerSocket, 'connect'); sellerSocket.connect(); await ready;
  const resumed = event(sellerSocket, 'new-message');
  await send(buyer, seller.user.id, 'Live delivery after reconnect.'); await resumed;
  console.log('PASS typing, offline persistence and resumed live delivery');

  await prisma.message.createMany({ data: Array.from({ length: 60 }, (_, index) => ({ conversationId, senderId: buyer.user.id, receiverId: seller.user.id, listingId: listing.id, messageText: `History ${index + 1}` })) });
  const [recent, older] = await Promise.all([1, 2].map(page => request(`/messages/${conversationId}?page=${page}&limit=50`, { token: seller.accessToken })));
  assert.equal(recent.messages.length, 50);
  assert.equal(new Set([...recent.messages, ...older.messages].map(message => message.id)).size, recent.pagination.total);
  await request(`/messages/${conversationId}`, { token: outsider.accessToken, status: 403 });
  await request(`/messages/${conversationId}/read`, { token: outsider.accessToken, method: 'PUT', status: 403 });
  await request('/messages/conversations', { status: 401 });
  await request('/messages', { token: buyer.accessToken, method: 'POST', status: 400, body: { receiverId: seller.user.id, messageText: 'x'.repeat(5001) } });
  console.log('PASS paginated history, account isolation and input validation');

  await prisma.carListing.update({ where: { id: listing.id }, data: { status: 'SOLD' } });
  await send(seller, buyer.user.id, 'Following up on our existing conversation.');
  await request('/messages', { token: outsider.accessToken, method: 'POST', status: 404, body: { receiverId: seller.user.id, listingId: listing.id, messageText: 'New enquiry about a sold car' } });
  console.log('PASS existing conversations remain usable after a listing is sold');
}
run().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(async () => {
  sockets.forEach(socket => socket.disconnect());
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});
