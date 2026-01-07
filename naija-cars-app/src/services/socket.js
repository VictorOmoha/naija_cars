import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(accessToken) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const SERVER_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

    this.socket = io(SERVER_URL, {
      auth: {
        token: accessToken
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('join-conversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('leave-conversation', conversationId);
    }
  }

  sendTyping(conversationId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off('new-message');
    }
  }

  offUserTyping() {
    if (this.socket) {
      this.socket.off('user-typing');
    }
  }
}

export default new SocketService();
