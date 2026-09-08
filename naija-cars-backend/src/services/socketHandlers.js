const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

async function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (typeof token !== 'string') throw new Error('Missing token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, isActive: true } });
    if (!user?.isActive) throw new Error('Inactive account');
    socket.userId = user.id;
    next();
  } catch {
    next(new Error('Authentication error'));
  }
}

function registerSocketHandlers(socket) {
  socket.join(socket.userId);
  const isParticipant = (conversationId) => {
    if (typeof conversationId !== 'string') return false;
    const participants = conversationId.split('_');
    return participants.length === 2 && participants.every(Boolean) && participants.includes(socket.userId);
  };
  socket.on('join-conversation', (id) => { if (isParticipant(id)) socket.join(id); });
  socket.on('leave-conversation', (id) => { if (isParticipant(id)) socket.leave(id); });
  socket.on('typing', (payload) => {
    if (!payload || typeof payload !== 'object' || !isParticipant(payload.conversationId)) return;
    socket.to(payload.conversationId).emit('user-typing', {
      conversationId: payload.conversationId, userId: socket.userId, isTyping: payload.isTyping === true,
    });
  });
}

module.exports = { authenticateSocket, registerSocketHandlers };
