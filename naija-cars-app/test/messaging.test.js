import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { SocketService } from '../src/services/socket.js';
import { conversationTarget, historyMessages } from '../src/services/messaging.js';

function setup() {
  const sockets = [];
  const service = new SocketService((url, options) => {
    const events = new EventEmitter();
    const socket = {
      auth: options.auth, connected: false, sent: [], attempts: 0,
      on: (name, handler) => events.on(name, handler),
      emit: (name, payload) => socket.sent.push({ name, payload }),
      connect: () => { socket.attempts++; },
      disconnect: () => { socket.connected = false; },
      removeAllListeners: () => events.removeAllListeners(),
      receive: (name, payload) => {
        if (name === 'connect') socket.connected = true;
        if (name === 'disconnect') socket.connected = false;
        events.emit(name, payload);
      },
    };
    sockets.push(socket);
    return socket;
  });
  return { service, sockets };
}

test('listeners registered before login receive events and unsubscribe cleanly', () => {
  const { service } = setup();
  const received = [];
  const listener = value => received.push(value);
  service.onNewMessage(listener);
  const socket = service.connect('token', 'buyer');
  socket.receive('new-message', { id: 'one' });
  service.offNewMessage(listener);
  socket.receive('new-message', { id: 'two' });
  assert.deepEqual(received, [{ id: 'one' }]);
});

test('reconnection restores only the currently open room and refreshes history', () => {
  const { service } = setup();
  let refreshes = 0;
  service.onConnect(() => refreshes++);
  service.joinConversation('buyer_seller');
  const socket = service.connect('token', 'buyer');
  socket.receive('connect');
  socket.receive('disconnect');
  service.leaveConversation('buyer_seller');
  service.joinConversation('buyer_dealer');
  socket.sent.length = 0;
  service.sendTyping('buyer_dealer', true);
  assert.deepEqual(socket.sent, []); // No stale typing events queued while offline.
  socket.receive('connect');
  assert.deepEqual(socket.sent, [{ name: 'join-conversation', payload: 'buyer_dealer' }]);
  assert.equal(refreshes, 2);
});

test('token refresh reconnects with fresh auth; changing account removes old rooms and connection', () => {
  const { service, sockets } = setup();
  const first = service.connect('expired', 'buyer');
  service.joinConversation('buyer_seller');
  service.connect('fresh', 'buyer');
  assert.equal(first.auth.token, 'fresh');
  assert.equal(first.attempts, 2);
  const second = service.connect('seller-token', 'seller');
  second.receive('connect');
  assert.equal(sockets.length, 2);
  assert.equal(first.connected, false);
  assert.deepEqual(second.sent, []);
});

test('direct links select only valid conversations belonging to the signed-in user', () => {
  assert.deepEqual(conversationTarget(new URLSearchParams('sellerId=seller'), 'buyer'), { conversationId: 'buyer_seller', otherId: 'seller' });
  assert.deepEqual(conversationTarget(new URLSearchParams('conversationId=buyer_dealer'), 'buyer'), { conversationId: 'buyer_dealer', otherId: 'dealer' });
  for (const query of ['', 'sellerId=buyer', 'sellerId=undefined', 'sellerId=null', 'conversationId=other_seller', 'conversationId=buyer_other_seller']) {
    assert.equal(conversationTarget(new URLSearchParams(query), 'buyer'), null);
  }
});

test('overlapping history pages retain every message once and prefer updated read status', () => {
  const a = { id: 'a', createdAt: '2026-01-01T12:00:00Z', isRead: false };
  const b = { id: 'b', createdAt: '2026-01-01T12:00:01Z', isRead: false };
  const c = { id: 'c', createdAt: '2026-01-01T12:00:02Z', isRead: false };
  assert.deepEqual(historyMessages({ pages: [{ messages: [{ ...b, isRead: true }, c] }, { messages: [a, b] }] }), [a, { ...b, isRead: true }, c]);
});
