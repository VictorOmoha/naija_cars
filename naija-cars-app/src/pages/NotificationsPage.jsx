import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, MessageCircle, TrendingDown, Car, Settings,
  Check, CheckCheck, Trash2, Search, ChevronRight, Clock, Star,
  AlertCircle, Info, Gift, CreditCard, BadgeCheck
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { useApp } from '../context/AppContext';
import api from '../services/api';

// Non-message notification persistence is not implemented yet. Keep the page
// driven by real unread message data so the badge never lies to users.
const mockNotifications = [
  {
    id: 2,
    type: 'price_drop',
    title: 'Price Drop Alert!',
    message: '2021 Mercedes-Benz C300 you saved is now ₦3M cheaper!',
    time: '1 hour ago',
    read: true,
    actionUrl: '/car/2',
    icon: TrendingDown,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    meta: { originalPrice: '₦38M', newPrice: '₦35M' },
  },
  {
    id: 4,
    type: 'promo',
    title: 'Special Offer!',
    message: 'Use code NAIJA25 for 25% off your next featured listing',
    time: '3 hours ago',
    read: true,
    icon: Gift,
    iconBg: 'bg-gold-100',
    iconColor: 'text-gold-600',
  },
  {
    id: 5,
    type: 'listing',
    title: 'Listing Approved',
    message: 'Your 2023 Toyota Highlander listing is now live!',
    time: '5 hours ago',
    read: true,
    actionUrl: '/car/5',
    icon: CheckCheck,
    iconBg: 'bg-naija-100',
    iconColor: 'text-naija-600',
  },
  {
    id: 6,
    type: 'review',
    title: 'New Review',
    message: 'Amaka left a 5-star review on your profile',
    time: '1 day ago',
    read: true,
    actionUrl: '/profile',
    icon: Star,
    iconBg: 'bg-gold-100',
    iconColor: 'text-gold-500',
  },
  {
    id: 7,
    type: 'verification',
    title: 'Verification Complete',
    message: 'Your phone number has been verified successfully',
    time: '2 days ago',
    read: true,
    icon: BadgeCheck,
    iconBg: 'bg-naija-100',
    iconColor: 'text-naija-600',
  },
  {
    id: 8,
    type: 'payment',
    title: 'Payment Received',
    message: 'You received ₦15,000,000 for your Toyota Land Cruiser sale',
    time: '3 days ago',
    read: true,
    actionUrl: '/dashboard',
    icon: CreditCard,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    id: 9,
    type: 'system',
    title: 'New Feature Available',
    message: 'You can now compare up to 3 cars side by side!',
    time: '1 week ago',
    read: true,
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
];

const getDisplayName = (otherUser) =>
  otherUser?.profile?.businessName ||
  `${otherUser?.profile?.firstName || ''} ${otherUser?.profile?.lastName || ''}`.trim() ||
  otherUser?.email ||
  'Someone';

const formatRelativeTime = (dateValue) => {
  if (!dateValue) return 'Recently';
  const diffMs = Date.now() - new Date(dateValue).getTime();
  const minutes = Math.max(Math.floor(diffMs / 60000), 0);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const filterOptions = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'unread', label: 'Unread', icon: AlertCircle },
  { id: 'message', label: 'Messages', icon: MessageCircle },
  { id: 'price_drop', label: 'Price Alerts', icon: TrendingDown },
  { id: 'listing', label: 'Listings', icon: Car },
];

const emptyStateContent = {
  all: {
    title: 'No notifications',
    message: 'Message activity, listing updates, and price alerts will appear here.',
  },
  unread: {
    title: 'No unread notifications',
    message: 'Unread message alerts and account updates will appear here.',
  },
  message: {
    title: 'No message notifications',
    message: 'When you send or receive messages, conversations will appear here.',
  },
  price_drop: {
    title: 'No price alerts',
    message: 'Price drops for saved cars will appear here.',
  },
  listing: {
    title: 'No listing notifications',
    message: 'Listing approvals and updates will appear here.',
  },
};

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const { addToast, setUnreadNotificationCount } = useApp();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  );

  const { data: conversationsData, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/messages/conversations').then(r => r.data),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  // Never call navigate() in the render body — use useEffect
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const messageNotifications = useMemo(() => {
    const conversations = conversationsData?.data?.conversations ?? [];
    return conversations
      .filter(conversation => conversation.lastMessage)
      .map(conversation => {
        const senderName = getDisplayName(conversation.otherUser);
        const unreadCount = conversation.unreadCount || 0;
        return {
          id: `message-${conversation.conversationId}`,
          type: 'message',
          title: unreadCount > 0
            ? `${unreadCount} new message${unreadCount === 1 ? '' : 's'}`
            : `Conversation with ${senderName}`,
          message: `${senderName}: ${conversation.lastMessage?.messageText || 'Sent you a message'}`,
          time: formatRelativeTime(conversation.lastMessage?.createdAt),
          read: unreadCount === 0,
          unreadCount,
          actionUrl: `/messages?conversationId=${encodeURIComponent(conversation.conversationId)}`,
          conversationId: conversation.conversationId,
          icon: MessageCircle,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
        };
      });
  }, [conversationsData]);

  const notifications = useMemo(() => [
    ...messageNotifications,
    ...mockNotifications,
  ].filter(notification => !dismissedNotifications.includes(notification.id)), [
    dismissedNotifications,
    messageNotifications,
  ]);

  const unreadMessageNotifications = useMemo(
    () => messageNotifications.filter(notification => !notification.read),
    [messageNotifications]
  );

  // Keep the navbar badge in sync with real unread message count.
  useEffect(() => {
    const count = unreadMessageNotifications.reduce(
      (total, notification) => total + (notification.unreadCount || 0),
      0
    );
    setUnreadNotificationCount(count);
  }, [setUnreadNotificationCount, unreadMessageNotifications]);

  const unreadCount = unreadMessageNotifications.reduce(
    (total, notification) => total + (notification.unreadCount || 0),
    0
  );

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = activeFilter === 'all' ||
      (activeFilter === 'unread' ? !n.read : n.type === activeFilter);
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const tabCounts = useMemo(() => ({
    all: notifications.length,
    unread: notifications.filter(notification => !notification.read).length,
    message: notifications.filter(notification => notification.type === 'message').length,
    price_drop: notifications.filter(notification => notification.type === 'price_drop').length,
    listing: notifications.filter(notification => notification.type === 'listing').length,
  }), [notifications]);

  const emptyState = searchQuery
    ? {
        title: 'No matching notifications',
        message: 'Try a different search term.',
      }
    : emptyStateContent[activeFilter] || emptyStateContent.all;

  const handleMarkAsRead = (id) => {
    const notification = notifications.find(n => n.id === id);
    if (notification?.conversationId) {
      api.put(`/messages/${notification.conversationId}/read`)
        .then(() => refetchConversations())
        .catch(() => addToast('Could not mark message as read', 'error'));
      return;
    }

    setDismissedNotifications(prev => [...prev, id]);
  };

  const handleMarkAllAsRead = () => {
    Promise.all(unreadMessageNotifications.map(notification =>
      api.put(`/messages/${notification.conversationId}/read`)
    ))
      .then(() => {
        refetchConversations();
        addToast('All message notifications marked as read', 'success');
      })
      .catch(() => addToast('Could not mark all messages as read', 'error'));
  };

  const handleDelete = (id) => {
    setDismissedNotifications(prev => [...prev, id]);
    addToast('Notification deleted', 'success');
  };

  const handleDeleteSelected = () => {
    setDismissedNotifications(prev => [...prev, ...selectedNotifications]);
    setSelectedNotifications([]);
    setIsSelecting(false);
    addToast(`${selectedNotifications.length} notifications deleted`, 'success');
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleEnableBrowserNotifications = async () => {
    if (typeof Notification === 'undefined') {
      addToast('Browser notifications are not supported here', 'error');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    addToast(
      permission === 'granted' ? 'Browser notifications enabled' : 'Browser notifications not enabled',
      permission === 'granted' ? 'success' : 'error'
    );
  };

  const toggleSelect = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-pearl-100 pt-28 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-naija-600 via-naija-500 to-emerald-500 py-12 relative overflow-hidden">
        <div className="absolute inset-0 kente-overlay opacity-10" />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-5 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"
        />

        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-white">
                  Notifications
                </h1>
                <p className="text-white/80">
                  {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'You\'re all caught up!'}
                </p>
              </div>
            </div>

            <button
              onClick={handleEnableBrowserNotifications}
              disabled={notificationPermission === 'granted' || notificationPermission === 'unsupported'}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30
                         transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              title={
                notificationPermission === 'granted'
                  ? 'Browser notifications enabled'
                  : 'Enable browser notifications'
              }
            >
              <Settings className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    activeFilter === filter.id
                      ? 'bg-naija-500 text-white'
                      : 'bg-pearl-100 text-charcoal-600 hover:bg-pearl-200'
                  }`}
                >
                  <filter.icon className="w-4 h-4" />
                  {filter.label}
                  {tabCounts[filter.id] > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                      activeFilter === filter.id ? 'bg-white/20' : 'bg-charcoal-100 text-charcoal-600'
                    }`}>
                      {tabCounts[filter.id] > 99 ? '99+' : tabCounts[filter.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {isSelecting ? (
                <>
                  <span className="text-sm text-charcoal-500">
                    {selectedNotifications.length} selected
                  </span>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedNotifications.length === 0}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setIsSelecting(false);
                      setSelectedNotifications([]);
                    }}
                    className="px-4 py-2 bg-pearl-100 text-charcoal-600 rounded-xl hover:bg-pearl-200 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsSelecting(true)}
                    className="px-4 py-2 bg-pearl-100 text-charcoal-600 rounded-xl hover:bg-pearl-200 transition-colors"
                  >
                    Select
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="px-4 py-2 bg-naija-100 text-naija-600 rounded-xl hover:bg-naija-200 transition-colors flex items-center gap-2"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Mark All Read
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-12 pr-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
            />
          </div>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-card p-12 text-center"
              >
                <div className="w-20 h-20 bg-pearl-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-charcoal-300" />
                </div>
                <h3 className="text-xl font-display font-bold text-charcoal-800 mb-2">
                  {emptyState.title}
                </h3>
                <p className="text-charcoal-500">
                  {emptyState.message}
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-2xl shadow-card overflow-hidden transition-all ${
                    !notification.read ? 'border-l-4 border-naija-500' : ''
                  } ${isSelecting ? 'cursor-pointer' : ''}`}
                  onClick={() => isSelecting && toggleSelect(notification.id)}
                >
                  <div className="p-4 flex items-start gap-4">
                    {/* Checkbox (when selecting) */}
                    {isSelecting && (
                      <div className="flex items-center justify-center w-6 h-6 mt-1">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleSelect(notification.id)}
                          className="w-5 h-5 text-naija-500 rounded focus:ring-naija-500"
                        />
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`p-3 rounded-xl flex-shrink-0 ${notification.iconBg}`}>
                      <notification.icon className={`w-6 h-6 ${notification.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-semibold ${!notification.read ? 'text-charcoal-800' : 'text-charcoal-600'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-charcoal-500 text-sm mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Price Drop Meta */}
                          {notification.type === 'price_drop' && notification.meta && (
                            <div className="mt-2 flex items-center gap-3">
                              <span className="text-charcoal-400 line-through text-sm">
                                {notification.meta.originalPrice}
                              </span>
                              <span className="font-bold text-naija-600">
                                {notification.meta.newPrice}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                            <span className="text-xs text-charcoal-400">{notification.time}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        {!isSelecting && (
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="p-2 text-charcoal-400 hover:text-naija-500 hover:bg-pearl-100 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {notification.actionUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification);
                                }}
                                className="p-2 text-charcoal-400 hover:text-naija-500 hover:bg-naija-50 rounded-lg transition-colors"
                                title="View"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
