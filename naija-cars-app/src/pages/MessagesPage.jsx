import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Search, Send, ArrowLeft, Loader2, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import api, { usersAPI } from '../services/api';
import socketService from '../services/socket';

const QUICK_REPLIES = [
  'Is this still available?',
  "What's your best price?",
  'Can I schedule a test drive?',
  'Where is the car located?',
  'Is the price negotiable?',
  'Can you provide more photos?',
];

export default function MessagesPage() {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);

  const sellerIdParam = searchParams.get('sellerId');
  const listingIdParam = searchParams.get('listingId');

  // selectedConversation = real DB conversation object
  // pendingConversation  = not yet in DB (first message hasn't been sent yet)
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [pendingConversation, setPendingConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // The "active" conversation is whichever is open
  const activeConversation = selectedConversation || pendingConversation;

  // --- Socket connection ---
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      socketService.connect(accessToken);
      return () => socketService.disconnect();
    }
  }, [isAuthenticated, accessToken]);

  // --- Fetch conversations list ---
  const { data: conversationsData, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/messages/conversations').then(r => r.data),
    enabled: isAuthenticated,
    refetchInterval: 30000, // poll every 30s as a fallback
  });

  // --- Fetch messages for active (non-pending) conversation ---
  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', activeConversation?.conversationId],
    queryFn: () =>
      api.get(`/messages/${activeConversation.conversationId}`).then(r => r.data),
    enabled: !!activeConversation && !activeConversation.isPending,
  });

  // --- Handle sellerId/listingId URL params: pre-open conversation ---
  useEffect(() => {
    if (!sellerIdParam || !user?.id || !isAuthenticated) return;

    const conversations = conversationsData?.data?.conversations ?? [];
    const conversationId = [user.id, sellerIdParam].sort().join('_');

    // If conversation already exists in DB, select it
    const existing = conversations.find(c => c.conversationId === conversationId);
    if (existing) {
      setSelectedConversation(existing);
      setPendingConversation(null);
      return;
    }

    // Don't re-fetch if we already have the pending conv set
    if (pendingConversation?.conversationId === conversationId) return;

    // Fetch seller info then build pending conversation
    usersAPI.getById(sellerIdParam)
      .then(res => {
        const seller = res.data?.data?.user;
        if (!seller) return;
        setPendingConversation({
          conversationId,
          otherUser: {
            id: seller.id,
            email: seller.email,
            profile: seller.profile,
            userType: seller.userType,
          },
          listing: listingIdParam ? { id: listingIdParam } : null,
          lastMessage: null,
          unreadCount: 0,
          isPending: true,
        });
      })
      .catch(() => {});
  }, [sellerIdParam, listingIdParam, user?.id, isAuthenticated, conversationsData]);

  // --- Socket: join/leave room + live message events ---
  useEffect(() => {
    if (!activeConversation || activeConversation.isPending) return;

    socketService.joinConversation(activeConversation.conversationId);

    socketService.onNewMessage(() => {
      refetchMessages();
      refetchConversations();
    });

    socketService.onUserTyping(({ userId, isTyping }) => {
      if (userId !== user?.id) setOtherUserTyping(isTyping);
    });

    return () => {
      socketService.leaveConversation(activeConversation.conversationId);
      socketService.offNewMessage();
      socketService.offUserTyping();
    };
  }, [activeConversation?.conversationId]);

  // --- Mark as read when conversation is opened ---
  useEffect(() => {
    if (activeConversation && !activeConversation.isPending) {
      api.put(`/messages/${activeConversation.conversationId}/read`).catch(() => {});
    }
  }, [activeConversation?.conversationId]);

  // --- Auto-scroll to newest message ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  // --- Send message ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation || isSending) return;

    const receiverId = activeConversation.otherUser?.id;
    const listingId = activeConversation.isPending
      ? (listingIdParam || undefined)
      : (activeConversation.listing?.id || undefined);

    setIsSending(true);
    try {
      await api.post('/messages', {
        receiverId,
        messageText: messageText.trim(),
        ...(listingId && { listingId }),
      });

      setMessageText('');

      if (activeConversation.isPending) {
        // First message sent — conversation now persisted in DB
        const convId = activeConversation.conversationId;
        const result = await refetchConversations();
        const convs = result.data?.data?.conversations ?? [];
        const newConv = convs.find(c => c.conversationId === convId);
        if (newConv) {
          setSelectedConversation(newConv);
          setPendingConversation(null);
        } else {
          // Fallback: mark as no longer pending so messages can be fetched
          setPendingConversation(prev => ({ ...prev, isPending: false }));
          refetchMessages();
        }
      } else {
        refetchMessages();
        refetchConversations();
      }
    } catch {
      // silent — could add toast here
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = () => {
    if (activeConversation && !activeConversation.isPending) {
      socketService.sendTyping(activeConversation.conversationId, true);
      setTimeout(() => socketService.sendTyping(activeConversation.conversationId, false), 2000);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setPendingConversation(null);
    setMessageText('');
  };

  const handleBack = () => {
    setSelectedConversation(null);
    // Keep pending conversation so it still appears in sidebar
  };

  // --- Helpers ---
  const getDisplayName = (otherUser) =>
    otherUser?.profile?.businessName ||
    `${otherUser?.profile?.firstName || ''} ${otherUser?.profile?.lastName || ''}`.trim() ||
    otherUser?.email ||
    'Unknown';

  const getAvatar = (otherUser) =>
    otherUser?.profile?.businessLogoUrl || otherUser?.profile?.avatarUrl;

  // --- Not authenticated ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-pearl-100 pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-charcoal-400" />
          <h2 className="text-2xl font-display font-bold text-charcoal-700 mb-2">
            Sign in to view messages
          </h2>
          <p className="text-charcoal-500">You need to be logged in to access your messages</p>
        </div>
      </div>
    );
  }

  const conversations = conversationsData?.data?.conversations ?? [];

  const filteredConversations = conversations.filter(conv => {
    const name = getDisplayName(conv.otherUser);
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Prepend pending conversation to sidebar list (deduplicated)
  const displayedConversations = pendingConversation
    ? [pendingConversation, ...filteredConversations.filter(
        c => c.conversationId !== pendingConversation.conversationId
      )]
    : filteredConversations;

  const messages = messagesData?.data?.messages ?? [];

  return (
    <div className="min-h-screen bg-pearl-100 pt-20">
      <div className="h-[calc(100vh-5rem)] flex overflow-hidden">

        {/* ── Conversations Sidebar ── */}
        <div className={`${activeConversation ? 'hidden md:flex' : 'flex'} w-full md:w-96
                        flex-col bg-white border-r border-pearl-200 flex-shrink-0`}>

          {/* Header */}
          <div className="p-6 border-b border-pearl-200">
            <h1 className="text-2xl font-display font-bold text-charcoal-700 mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-pearl-50 border border-pearl-200
                           rounded-lg focus:outline-none focus:ring-2 focus:ring-naija-500 text-sm"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {displayedConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-charcoal-300" />
                <p className="font-medium text-charcoal-700 mb-2">No conversations yet</p>
                <p className="text-sm text-charcoal-500 mb-5">
                  Find a car and tap "Message Seller" to start chatting.
                </p>
                <Link
                  to="/cars"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-naija-500 text-white
                             text-sm rounded-xl hover:bg-naija-600 transition-colors"
                >
                  <Car className="w-4 h-4" />
                  Browse Cars
                </Link>
              </div>
            ) : (
              displayedConversations.map(conv => {
                const name = getDisplayName(conv.otherUser);
                const avatar = getAvatar(conv.otherUser);
                const isActive = activeConversation?.conversationId === conv.conversationId;

                return (
                  <button
                    key={conv.conversationId}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 border-b border-pearl-100 hover:bg-pearl-50
                                transition-colors text-left ${
                                  isActive
                                    ? 'bg-naija-50 border-l-4 border-l-naija-500'
                                    : ''
                                }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-charcoal-200 flex items-center
                                      justify-center flex-shrink-0 overflow-hidden">
                        {avatar ? (
                          <img src={avatar} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-charcoal-600">
                            {name[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-semibold text-charcoal-700 truncate text-sm">{name}</p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-naija-500 text-white text-xs px-2 py-0.5
                                             rounded-full ml-2 shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        {conv.listing?.make && (
                          <p className="text-xs text-naija-600 truncate mb-0.5">
                            {conv.listing.year} {conv.listing.make} {conv.listing.model}
                          </p>
                        )}
                        <p className="text-xs text-charcoal-500 truncate">
                          {conv.isPending
                            ? <span className="italic text-charcoal-400">New conversation</span>
                            : conv.lastMessage?.messageText}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div className={`${activeConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white min-w-0`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-pearl-200 flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleBack}
                  className="md:hidden p-2 hover:bg-pearl-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-charcoal-200 flex items-center
                                justify-center overflow-hidden flex-shrink-0">
                  {getAvatar(activeConversation.otherUser) ? (
                    <img
                      src={getAvatar(activeConversation.otherUser)}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-charcoal-600">
                      {getDisplayName(activeConversation.otherUser)[0]?.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-charcoal-700 truncate">
                    {getDisplayName(activeConversation.otherUser)}
                  </p>
                  {activeConversation.listing?.make && (
                    <p className="text-xs text-charcoal-500 truncate">
                      Re: {activeConversation.listing.year} {activeConversation.listing.make}{' '}
                      {activeConversation.listing.model}
                    </p>
                  )}
                  {activeConversation.isPending && (
                    <p className="text-xs text-naija-500">New conversation</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Empty state for new/pending conversations */}
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-10"
                  >
                    <div className="w-16 h-16 bg-naija-50 rounded-full flex items-center
                                    justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-naija-400" />
                    </div>
                    <p className="font-medium text-charcoal-700 mb-1">
                      {activeConversation.isPending
                        ? `Start a conversation with ${getDisplayName(activeConversation.otherUser)}`
                        : 'No messages yet'}
                    </p>
                    <p className="text-sm text-charcoal-400">
                      Your messages are private and secure.
                    </p>
                  </motion.div>
                )}

                <AnimatePresence>
                  {messages.map(message => {
                    const isOwn = message.senderId === user?.id;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[72%] px-4 py-2.5 rounded-2xl ${
                            isOwn
                              ? 'bg-naija-500 text-white rounded-br-sm'
                              : 'bg-pearl-100 text-charcoal-700 rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {message.messageText}
                          </p>
                          <p className={`text-xs mt-1 ${
                            isOwn ? 'text-naija-100' : 'text-charcoal-400'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {otherUserTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-pearl-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1 items-center">
                          {[0, 150, 300].map(delay => (
                            <span
                              key={delay}
                              className="w-2 h-2 bg-charcoal-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${delay}ms` }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Quick reply chips (only when conversation is empty) */}
              {messages.length === 0 && (
                <div className="px-4 pb-2 flex gap-2 flex-wrap flex-shrink-0">
                  {QUICK_REPLIES.map(reply => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => setMessageText(reply)}
                      className="text-xs px-3 py-1.5 border border-naija-200 text-naija-700
                                 rounded-full hover:bg-naija-50 transition-colors bg-white"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-pearl-200 flex-shrink-0"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={e => {
                      setMessageText(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-naija-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || isSending}
                    className="px-5 py-3 bg-naija-500 text-white rounded-xl hover:bg-naija-600
                               transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                               flex items-center justify-center"
                  >
                    {isSending
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Empty state — no conversation selected */
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div>
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-charcoal-300" />
                <p className="text-lg font-semibold text-charcoal-700 mb-2">Your Messages</p>
                <p className="text-charcoal-500 mb-6 max-w-xs mx-auto">
                  Select a conversation from the left, or message a seller directly from a listing.
                </p>
                <Link
                  to="/cars"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-naija-500 text-white
                             rounded-xl hover:bg-naija-600 transition-colors text-sm font-medium"
                >
                  <Car className="w-4 h-4" />
                  Browse Cars
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
