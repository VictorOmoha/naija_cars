import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Search, Send, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import api from '../services/api';
import socketService from '../services/socket';

export default function MessagesPage() {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Connect to socket on mount
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      socketService.connect(accessToken);

      return () => {
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, accessToken]);

  // Fetch conversations
  const { data: conversationsData, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/messages/conversations');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Fetch messages for selected conversation
  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedConversation?.conversationId],
    queryFn: async () => {
      const response = await api.get(`/messages/${selectedConversation.conversationId}`);
      return response.data;
    },
    enabled: !!selectedConversation,
  });

  // Listen for new messages
  useEffect(() => {
    if (!selectedConversation) return;

    socketService.joinConversation(selectedConversation.conversationId);

    socketService.onNewMessage((data) => {
      refetchMessages();
      refetchConversations();
    });

    socketService.onUserTyping(({ userId, isTyping: typing }) => {
      if (userId !== user?.id) {
        setIsTyping(typing);
      }
    });

    return () => {
      socketService.leaveConversation(selectedConversation.conversationId);
      socketService.offNewMessage();
      socketService.offUserTyping();
    };
  }, [selectedConversation, refetchMessages, refetchConversations, user]);

  // Mark messages as read
  useEffect(() => {
    if (selectedConversation) {
      api.put(`/messages/${selectedConversation.conversationId}/read`);
    }
  }, [selectedConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await api.post('/messages', {
        receiverId: selectedConversation.otherUser.id,
        messageText: messageText.trim(),
        listingId: selectedConversation.listing?.id,
      });

      setMessageText('');
      refetchMessages();
      refetchConversations();
    } catch {
      // Message send failed silently - could add toast notification here
    }
  };

  const handleTyping = () => {
    if (selectedConversation) {
      socketService.sendTyping(selectedConversation.conversationId, true);

      // Stop typing after 2 seconds of inactivity
      setTimeout(() => {
        socketService.sendTyping(selectedConversation.conversationId, false);
      }, 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-pearl-100 pt-32 pb-20">
        <div className="container-custom text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-charcoal-400" />
          <h2 className="text-2xl font-display font-bold text-charcoal-700 mb-2">
            Sign in to view messages
          </h2>
          <p className="text-charcoal-500">
            You need to be logged in to access your messages
          </p>
        </div>
      </div>
    );
  }

  const conversations = conversationsData?.data?.conversations || [];
  const messages = messagesData?.data?.messages || [];

  const filteredConversations = conversations.filter((conv) => {
    const otherUserName = conv.otherUser.profile?.businessName ||
                          `${conv.otherUser.profile?.firstName} ${conv.otherUser.profile?.lastName}`;
    return otherUserName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-pearl-100 pt-20">
      <div className="h-[calc(100vh-5rem)] flex">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-96
                        bg-white border-r border-pearl-200 flex flex-col`}>
          {/* Header */}
          <div className="p-6 border-b border-pearl-200">
            <h1 className="text-2xl font-display font-bold text-charcoal-700 mb-4">
              Messages
            </h1>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-pearl-50 border border-pearl-200
                         rounded-lg focus:outline-none focus:ring-2 focus:ring-naija-500"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-charcoal-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-charcoal-300" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div>
                {filteredConversations.map((conversation) => {
                  const otherUser = conversation.otherUser;
                  const displayName = otherUser.profile?.businessName ||
                                    `${otherUser.profile?.firstName || ''} ${otherUser.profile?.lastName || ''}`.trim() ||
                                    otherUser.email;

                  return (
                    <button
                      key={conversation.conversationId}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full p-4 border-b border-pearl-100 hover:bg-pearl-50
                                transition-colors text-left ${
                                  selectedConversation?.conversationId === conversation.conversationId
                                    ? 'bg-naija-50 border-l-4 border-l-naija-500'
                                    : ''
                                }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-charcoal-200 rounded-full flex items-center
                                      justify-center flex-shrink-0">
                          {otherUser.profile?.businessLogoUrl || otherUser.profile?.avatarUrl ? (
                            <img
                              src={otherUser.profile.businessLogoUrl || otherUser.profile.avatarUrl}
                              alt={displayName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold text-charcoal-600">
                              {displayName[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-charcoal-700 truncate">
                              {displayName}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-naija-500 text-white text-xs px-2 py-0.5
                                           rounded-full ml-2">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>

                          {conversation.listing && (
                            <p className="text-xs text-charcoal-500 mb-1">
                              {conversation.listing.year} {conversation.listing.make}{' '}
                              {conversation.listing.model}
                            </p>
                          )}

                          <p className="text-sm text-charcoal-500 truncate">
                            {conversation.lastMessage.messageText}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedConversation ? 'block' : 'hidden md:block'} flex-1
                        flex flex-col bg-white`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-pearl-200 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-pearl-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 bg-charcoal-200 rounded-full flex items-center
                              justify-center">
                  {selectedConversation.otherUser.profile?.businessLogoUrl ||
                   selectedConversation.otherUser.profile?.avatarUrl ? (
                    <img
                      src={selectedConversation.otherUser.profile.businessLogoUrl ||
                           selectedConversation.otherUser.profile.avatarUrl}
                      alt="User"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-charcoal-600">
                      {(selectedConversation.otherUser.profile?.businessName ||
                        selectedConversation.otherUser.profile?.firstName ||
                        selectedConversation.otherUser.email)[0]?.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-charcoal-700">
                    {selectedConversation.otherUser.profile?.businessName ||
                      `${selectedConversation.otherUser.profile?.firstName || ''} ${
                        selectedConversation.otherUser.profile?.lastName || ''
                      }`.trim() ||
                      selectedConversation.otherUser.email}
                  </p>

                  {selectedConversation.listing && (
                    <p className="text-sm text-charcoal-500">
                      {selectedConversation.listing.year} {selectedConversation.listing.make}{' '}
                      {selectedConversation.listing.model}
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => {
                    const isOwn = message.senderId === user?.id;

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-naija-500 text-white'
                              : 'bg-pearl-100 text-charcoal-700'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.messageText}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? 'text-naija-100' : 'text-charcoal-400'
                            }`}
                          >
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

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-pearl-100 px-4 py-2 rounded-2xl">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-charcoal-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-charcoal-400 rounded-full animate-bounce delay-100" />
                        <span className="w-2 h-2 bg-charcoal-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-pearl-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-naija-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="px-6 py-3 bg-naija-500 text-white rounded-xl hover:bg-naija-600
                             transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div>
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-charcoal-300" />
                <p className="text-charcoal-500">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
