import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../stores/authStore';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import socketService from '../services/socket';

export default function MessageNotifications() {
  const location = useLocation();
  const client = useQueryClient();
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const { addToast, setUnreadNotificationCount } = useApp();
  const { data } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => api.get('/messages/conversations').then(r => r.data),
    enabled: isAuthenticated && !!user?.id,
    refetchInterval: 10000,
  });
  const unread = isAuthenticated
    ? (data?.data?.conversations || []).reduce((sum, item) => sum + item.unreadCount, 0) : 0;
  useEffect(() => { setUnreadNotificationCount(unread); }, [unread, setUnreadNotificationCount]);
  useEffect(() => {
    if (isAuthenticated && accessToken && user?.id) socketService.connect(accessToken, user.id);
    else socketService.disconnect();
  }, [accessToken, isAuthenticated, user?.id]);
  useEffect(() => () => socketService.disconnect(), []);
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const refresh = () => {
      client.invalidateQueries({ queryKey: ['conversations', user.id] });
      client.invalidateQueries({ queryKey: ['messages', user.id] });
    };
    const handleRead = ({ conversationId }) => {
      client.invalidateQueries({ queryKey: ['conversations', user.id] });
      client.invalidateQueries({ queryKey: ['messages', user.id, conversationId] });
    };
    const handleNewMessage = ({ message }) => {
      if (!message || ![message.senderId, message.receiverId].includes(user.id)) return;
      handleRead(message);
      if (message.receiverId !== user.id) return;
      const params = new URLSearchParams(location.search);
      const activeId = params.get('conversationId') || (params.get('sellerId')
        ? [params.get('sellerId'), user.id].sort().join('_') : null);
      const isOpen = location.pathname === '/messages' && activeId === message.conversationId;
      const sender = message.sender;
      const name = sender?.profile?.businessName
        || [sender?.profile?.firstName, sender?.profile?.lastName].filter(Boolean).join(' ') || 'Someone';
      if (!isOpen) addToast(`New message from ${name}`, 'info');
      if (document.hidden && window.Notification?.permission === 'granted') {
        const notification = new Notification('New message on NaijaCars', {
          body: `${name}: ${message.messageText}`, icon: '/logo.png?v=3', tag: message.conversationId,
        });
        notification.onclick = () => {
          window.focus();
          window.location.href = `/messages?conversationId=${encodeURIComponent(message.conversationId)}`;
        };
      }
    };
    socketService.onConnect(refresh);
    socketService.onNewMessage(handleNewMessage);
    socketService.onMessagesRead(handleRead);
    return () => {
      socketService.offConnect(refresh);
      socketService.offNewMessage(handleNewMessage);
      socketService.offMessagesRead(handleRead);
    };
  }, [user?.id, isAuthenticated, location.pathname, location.search, addToast, client]);
  return null;
}
