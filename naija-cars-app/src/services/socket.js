import { io } from 'socket.io-client';

const serverUrl = import.meta.env?.VITE_API_URL?.replace(/\/api\/?$/, '')
  || (import.meta.env?.PROD ? 'https://naija-cars-api.onrender.com' : 'http://localhost:5000');

export class SocketService {
  constructor(createSocket = io) {
    this.createSocket = createSocket;
    this.socket = null;
    this.userId = null;
    this.connected = false;
    this.rooms = new Set();
    this.listeners = new Map();
  }
  connect(accessToken, userId) {
    if (this.socket && this.userId !== userId) this.disconnect();
    this.userId = userId;
    if (this.socket) {
      this.socket.auth.token = accessToken;
      if (!this.socket.connected) this.socket.connect();
      return this.socket;
    }
    this.socket = this.createSocket(serverUrl, {
      auth: { token: accessToken }, autoConnect: false,
      reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: 10000,
    });
    this.socket.on('connect', () => {
      this.connected = true;
      for (const room of this.rooms) this.socket.emit('join-conversation', room);
      this.notify('connect');
    });
    this.socket.on('disconnect', () => { this.connected = false; });
    this.socket.on('connect_error', () => { this.connected = false; });
    for (const event of ['new-message', 'user-typing', 'messages-read']) {
      this.socket.on(event, (payload) => this.notify(event, payload));
    }
    this.socket.connect();
    return this.socket;
  }
  disconnect() {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.userId = null;
    this.connected = false;
    this.rooms.clear();
  }
  notify(event, payload) {
    this.listeners.get(event)?.forEach(callback => callback(payload));
  }
  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
  }
  off(event, callback) { this.listeners.get(event)?.delete(callback); }
  joinConversation(id) {
    this.rooms.add(id);
    if (this.socket?.connected) this.socket.emit('join-conversation', id);
  }
  leaveConversation(id) {
    this.rooms.delete(id);
    if (this.socket?.connected) this.socket.emit('leave-conversation', id);
  }
  sendTyping(conversationId, isTyping) {
    if (this.socket?.connected) this.socket.emit('typing', { conversationId, isTyping });
  }
  onConnect(callback) { this.on('connect', callback); }
  offConnect(callback) { this.off('connect', callback); }
  onNewMessage(callback) { this.on('new-message', callback); }
  offNewMessage(callback) { this.off('new-message', callback); }
  onUserTyping(callback) { this.on('user-typing', callback); }
  offUserTyping(callback) { this.off('user-typing', callback); }
  onMessagesRead(callback) { this.on('messages-read', callback); }
  offMessagesRead(callback) { this.off('messages-read', callback); }
}
export default new SocketService();
