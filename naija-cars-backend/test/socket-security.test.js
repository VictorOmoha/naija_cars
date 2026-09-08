const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const prisma = require('../src/lib/prisma');
const { authenticateSocket, registerSocketHandlers } = require('../src/services/socketHandlers');

test('malformed typing events cannot crash the server or emit into unrelated rooms', () => {
  const handlers = {};
  const emitted = [];
  const joined = [];
  registerSocketHandlers({
    userId: 'buyer', join: (id) => joined.push(id), leave: () => {},
    on: (event, handler) => { handlers[event] = handler; },
    to: (room) => ({ emit: (event, data) => emitted.push({ room, event, data }) }),
  });
  for (const payload of [undefined, null, '', 1, {}, { conversationId: 'other_seller' }]) {
    assert.doesNotThrow(() => handlers.typing(payload));
  }
  handlers['join-conversation']('other_seller');
  assert.deepEqual(joined, ['buyer']);
  assert.equal(emitted.length, 0);
  handlers.typing({ conversationId: 'buyer_seller', isTyping: true });
  assert.equal(emitted[0].data.isTyping, true);
});
test('a suspended user cannot authenticate a socket with a still-valid token', async () => {
  process.env.JWT_SECRET = 'socket-test-secret';
  prisma.user.findUnique = async () => ({ id: 'buyer', isActive: false });
  const socket = { handshake: { auth: { token: jwt.sign({ id: 'buyer' }, process.env.JWT_SECRET) } } };
  let result;
  await authenticateSocket(socket, (error) => { result = error; });
  assert.equal(result.message, 'Authentication error');
  assert.equal(socket.userId, undefined);
});
