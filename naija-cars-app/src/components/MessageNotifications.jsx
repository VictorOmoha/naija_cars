import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../stores/authStore';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import socketService from '../services/socket';

const getDisplayName = (user) =>
  user?.profile?.businessName ||
  `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim() ||
  user?.email ||
  'Someone';

export default function MessageNotifications() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const { addToast, setUnreadNotificationCount } = useApp();

  const { data, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/messages/conversations').then(r => r.data),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const unreadMessageCount = useMemo(() => {
    const conversations = data?.data?.conversations ?? [];
    return conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0);
  }, [data]);

  useEffect(() => {
    setUnreadNotificationCount(unreadMessageCount);
  }, [setUnreadNotificationCount, unreadMessageCount]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      socketService.disconnect();
      setUnreadNotificationCount(0);
      return;
    }

    socketService.connect(accessToken);

    const handleNewMessage = ({ message }) => {
      if (!message || message.receiverId !== user?.id) return;

      refetch();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      const isOnMessagesPage = location.pathname.startsWith('/messages');
      if (!isOnMessagesPage) {
        const senderName = getDisplayName(message.sender);
        addToast(`New message from ${senderName}`, 'info');

        if (document.hidden && window.Notification?.permission === 'granted') {
          const browserNotification = new Notification('New message on Naija Cars', {
            body: `${senderName}: ${message.messageText}`,
            icon: '/logo.png?v=3',
            tag: message.conversationId,
          });
          browserNotification.onclick = () => {
            window.focus();
            window.location.href = `/notifications?filter=message`;
          };
        }
      }
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.offNewMessage(handleNewMessage);
    };
  }, [
    accessToken,
    addToast,
    isAuthenticated,
    location.pathname,
    queryClient,
    refetch,
    setUnreadNotificationCount,
    user?.id,
  ]);

  return null;
}
