import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Search, Send, ArrowLeft, Loader2, Check, CheckCheck } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import api, { usersAPI } from '../services/api';
import socketService from '../services/socket';
import { conversationTarget, historyMessages } from '../services/messaging';
import { useApp } from '../context/AppContext';

const QUICK_REPLIES = ['Is this still available?', "What's your best price?", 'Can I schedule a test drive?', 'Where is the car located?'];
const displayName = person => person?.profile?.businessName
  || [person?.profile?.firstName, person?.profile?.lastName].filter(Boolean).join(' ')
  || person?.email || 'NaijaCars member';
const avatar = person => person?.profile?.businessLogoUrl || person?.profile?.avatarUrl;

function PersonAvatar({ person }) {
  return <span className="w-11 h-11 rounded-full bg-greentint flex items-center justify-center shrink-0 overflow-hidden text-brand font-bold">
    {avatar(person) ? <img src={avatar(person)} alt="" className="w-full h-full object-cover" /> : displayName(person)[0]?.toUpperCase()}
  </span>;
}

function ChatPanel({ user, conversation, listing, onBack }) {
  const client = useQueryClient();
  const { addToast } = useApp();
  const { conversationId, otherUser } = conversation;
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [readError, setReadError] = useState(false);
  const [readRetry, setReadRetry] = useState(0);
  const [typing, setTyping] = useState(false);
  const [visible, setVisible] = useState(!document.hidden);
  const typingTimer = useRef();
  const incomingTypingTimer = useRef();
  const scrollArea = useRef();
  const lastMessageId = useRef();
  const mounted = useRef(true);
  const key = ['messages', user.id, conversationId];
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam, signal }) => api.get('/messages/' + conversationId, { params: { page: pageParam, limit: 50 }, signal }).then(r => r.data.data),
    initialPageParam: 1,
    getNextPageParam: page => page.pagination.page < page.pagination.pages ? page.pagination.page + 1 : undefined,
    refetchInterval: 10000,
  });
  const messages = historyMessages(data);
  const newestId = messages.at(-1)?.id;
  const unreadIds = messages.filter(message => message.receiverId === user.id && !message.isRead).slice(-100).map(message => message.id);
  const unreadKey = unreadIds.join(',');
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    const handleVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);
  useEffect(() => {
    socketService.joinConversation(conversationId);
    const handleTyping = payload => {
      if (payload.conversationId !== conversationId || payload.userId !== otherUser.id) return;
      clearTimeout(incomingTypingTimer.current);
      setTyping(payload.isTyping);
      if (payload.isTyping) incomingTypingTimer.current = setTimeout(() => setTyping(false), 3000);
    };
    socketService.onUserTyping(handleTyping);
    return () => {
      clearTimeout(typingTimer.current);
      clearTimeout(incomingTypingTimer.current);
      socketService.sendTyping(conversationId, false);
      socketService.leaveConversation(conversationId);
      socketService.offUserTyping(handleTyping);
    };
  }, [conversationId, otherUser.id]);
  useEffect(() => {
    if (!visible || !unreadKey) return;
    let cancelled = false;
    const ids = unreadKey.split(',');
    api.put('/messages/' + conversationId + '/read', { messageIds: ids }).then(() => {
      if (cancelled) return;
      setReadError(false);
      client.setQueryData(key, current => current && ({
        ...current,
        pages: current.pages.map(page => ({ ...page, messages: page.messages.map(message =>
          ids.includes(message.id) && message.receiverId === user.id ? { ...message, isRead: true } : message) })),
      }));
      client.invalidateQueries({ queryKey: ['conversations', user.id] });
    }).catch(() => { if (!cancelled) setReadError(true); });
    return () => { cancelled = true; };
  }, [conversationId, user.id, unreadKey, visible, readRetry, client]);
  useEffect(() => {
    if (!newestId || newestId === lastMessageId.current) return;
    const area = scrollArea.current;
    if (area) area.scrollTop = area.scrollHeight;
    lastMessageId.current = newestId;
  }, [newestId]);

  const send = async event => {
    event.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setSendError('');
    clearTimeout(typingTimer.current);
    socketService.sendTyping(conversationId, false);
    try {
      const response = await api.post('/messages', {
        receiverId: otherUser.id, messageText: text.trim(), ...(listing?.id ? { listingId: listing.id } : {}),
      });
      const saved = response.data.data.message;
      client.setQueryData(key, current => {
        const page = current?.pages?.[0] || { messages: [], pagination: { page: 1, pages: 1, total: 0, limit: 50 } };
        const exists = page.messages.some(message => message.id === saved.id);
        return {
          pages: [{ ...page, messages: exists ? page.messages : [...page.messages, saved] }, ...(current?.pages?.slice(1) || [])],
          pageParams: current?.pageParams || [1],
        };
      });
      client.invalidateQueries({ queryKey: ['conversations', user.id] });
      client.invalidateQueries({ queryKey: key });
      if (mounted.current) {
        setText('');
        if (response.data.data.fraudWarning) addToast(response.data.data.fraudWarning, 'info');
      }
    } catch (error) {
      if (mounted.current) setSendError(error.response?.data?.error?.message || 'Message could not be sent. Your draft is saved here; please try again.');
    } finally { if (mounted.current) setSending(false); }
  };
  const type = value => {
    setText(value);
    clearTimeout(typingTimer.current);
    socketService.sendTyping(conversationId, Boolean(value.trim()));
    typingTimer.current = setTimeout(() => socketService.sendTyping(conversationId, false), 1500);
  };
  const loadOlder = async () => {
    const area = scrollArea.current;
    const height = area?.scrollHeight || 0;
    await fetchNextPage();
    requestAnimationFrame(() => { if (area) area.scrollTop += area.scrollHeight - height; });
  };

  return <>
    <div className="p-4 border-b border-pearl-200 flex items-center gap-3 shrink-0">
      <button type="button" aria-label="Back to conversations" onClick={onBack} className="md:hidden nc-icon-button"><ArrowLeft size={20} /></button>
      <PersonAvatar person={otherUser} />
      <div className="min-w-0 flex-1"><h2 className="font-semibold truncate">{displayName(otherUser)}</h2>
        {listing?.make && <Link className="text-sm text-muted hover:text-brand" to={'/car/' + listing.id}>{[listing.year, listing.make, listing.model].filter(Boolean).join(' ')}</Link>}
      </div>
    </div>
    <div ref={scrollArea} aria-label="Message history" className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
      {hasNextPage && <div className="text-center"><button type="button" className="nc-button nc-button-secondary" disabled={isFetchingNextPage} onClick={loadOlder}>{isFetchingNextPage ? 'Loading…' : 'Load earlier messages'}</button></div>}
      {isError && <div role="alert" className="nc-panel"><p>Couldn’t load messages. Sending is still available.</p><button className="nc-button nc-button-secondary mt-3" onClick={() => refetch()}>Try again</button></div>}
      {isPending && <p role="status" className="text-muted">Loading messages…</p>}
      {!isPending && !isError && !messages.length && <div className="text-center py-10"><MessageCircle className="mx-auto text-brand mb-4" size={40} /><h3 className="font-semibold">Start a conversation with {displayName(otherUser)}</h3><p className="text-sm text-muted mt-2">Ask about the car, its condition or a viewing.</p></div>}
      {messages.map(message => {
        const own = message.senderId === user.id;
        return <div key={message.id} className={'flex ' + (own ? 'justify-end' : 'justify-start')}>
          <div className={'max-w-[85%] md:max-w-[72%] px-4 py-3 rounded-2xl ' + (own ? 'bg-brand text-white rounded-br-sm' : 'bg-greentint text-ink rounded-bl-sm')}>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.messageText}</p>
            <div className={'text-xs mt-2 flex items-center justify-end gap-2 ' + (own ? 'text-white/80' : 'text-muted')}>
              <time dateTime={message.createdAt} title={new Date(message.createdAt).toLocaleString()}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
              {own && <span aria-label={message.isRead ? 'Read' : 'Sent'} title={message.isRead ? 'Read' : 'Sent'}>{message.isRead ? <CheckCheck size={15} /> : <Check size={15} />}</span>}
            </div>
          </div>
        </div>;
      })}
      {typing && <p role="status" className="text-sm text-muted">{displayName(otherUser)} is typing…</p>}
    </div>
    {readError && <p role="alert" className="px-4 text-sm text-muted">Couldn’t update read status. <button className="text-brand underline" onClick={() => setReadRetry(value => value + 1)}>Retry</button></p>}
    {!isPending && !isError && !messages.length && <div className="px-4 pb-3 flex gap-2 flex-wrap">{QUICK_REPLIES.map(reply => <button key={reply} type="button" className="text-xs px-3 py-2 border border-pearl-200 rounded-full hover:bg-greentint" onClick={() => type(reply)}>{reply}</button>)}</div>}
    <form onSubmit={send} className="p-4 border-t border-pearl-200 shrink-0">
      {sendError && <p role="alert" className="text-red-700 text-sm mb-3">{sendError}</p>}
      <div className="flex items-end gap-2">
        <textarea aria-label="Message" placeholder="Type a message…" value={text} disabled={sending} maxLength={5000} rows={2}
          onChange={event => type(event.target.value)}
          onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(event); } }}
          className="flex-1 min-w-0 resize-none px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500 text-sm" />
        <button aria-label={sending ? 'Sending message' : 'Send message'} type="submit" disabled={!text.trim() || sending} className="nc-button h-12 px-4 disabled:opacity-50">{sending ? <Loader2 size={19} className="animate-spin" /> : <Send size={19} />}</button>
      </div>
      <p className="text-xs text-muted mt-2">Enter to send · Shift + Enter for a new line</p>
    </form>
  </>;
}

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const target = conversationTarget(params, user?.id);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: ({ signal }) => api.get('/messages/conversations', { signal }).then(r => r.data),
    enabled: isAuthenticated && !!user?.id,
    refetchInterval: 10000,
  });
  const conversations = data?.data?.conversations || [];
  const stored = conversations.find(item => item.conversationId === target?.conversationId);
  const person = useQuery({
    queryKey: ['message-recipient', user?.id, target?.otherId],
    queryFn: () => usersAPI.getById(target.otherId).then(r => r.data.data.user),
    enabled: !!target && !stored,
  });
  const listingId = params.get('listingId');
  const listingQuery = useQuery({
    queryKey: ['message-listing', listingId],
    queryFn: ({ signal }) => api.get('/listings/' + listingId, { signal }).then(r => r.data.data.listing),
    enabled: !!target && !!listingId,
  });
  const active = stored || (target && person.data ? { ...target, otherUser: person.data, unreadCount: 0 } : null);
  const listing = listingId ? listingQuery.data : stored?.listing;
  const filtered = conversations.filter(item => displayName(item.otherUser).toLowerCase().includes(search.toLowerCase()));
  const displayed = active && !stored ? [active, ...filtered] : filtered;
  const requested = params.has('sellerId') || params.has('conversationId');
  const back = () => setParams({});
  return <div className="max-w-[1440px] mx-auto md:px-6 md:py-6">
    <div className="flex h-[calc(100dvh-5rem)] md:h-[calc(100dvh-8rem)] min-h-[480px] bg-white md:rounded-2xl md:border border-pearl-200 overflow-hidden">
      <aside aria-label="Conversations" className={(requested ? 'hidden md:flex' : 'flex') + ' w-full md:w-80 lg:w-96 shrink-0 flex-col border-r border-pearl-200'}>
        <div className="p-5 border-b border-pearl-200"><h1 className="text-2xl font-bold mb-4">Messages</h1><div className="relative"><Search size={18} className="absolute left-3 top-3 text-muted" /><input aria-label="Search conversations" placeholder="Search conversations…" value={search} onChange={event => setSearch(event.target.value)} className="w-full pl-10 pr-3 py-3 bg-pearl-50 border border-pearl-200 rounded-xl text-sm" /></div></div>
        <div className="flex-1 overflow-y-auto">
          {isError && <div role="alert" className="p-5"><p>Couldn’t load your conversations.</p><button className="nc-button nc-button-secondary mt-3" onClick={() => refetch()}>Try again</button></div>}
          {isPending && <p role="status" className="p-5 text-muted">Loading conversations…</p>}
          {!isPending && !isError && !displayed.length && <div className="text-center p-8"><MessageCircle className="mx-auto text-brand mb-3" size={32} /><h2 className="font-semibold">{search ? 'No matching conversations' : 'No conversations yet'}</h2><p className="text-sm text-muted my-3">Open a car and choose Message seller to get started.</p><Link className="nc-button nc-button-secondary" to="/cars">Browse cars</Link></div>}
          {displayed.map(item => <button key={item.conversationId} aria-current={target?.conversationId === item.conversationId ? 'true' : undefined}
            onClick={() => setParams({ conversationId: item.conversationId })} className={'w-full p-4 flex gap-3 text-left border-b border-pearl-100 hover:bg-pearl-50 ' + (target?.conversationId === item.conversationId ? 'bg-greentint' : '')}>
            <PersonAvatar person={item.otherUser} /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><span className="font-semibold text-sm truncate">{displayName(item.otherUser)}</span>{item.unreadCount > 0 && <span aria-label={item.unreadCount + ' unread messages'} className="bg-brand text-white text-xs px-2 py-1 rounded-full">{item.unreadCount}</span>}</div>
              {item.listing?.make && <p className="text-xs text-brand truncate mt-1">{item.listing.year} {item.listing.make} {item.listing.model}</p>}
              <p className="text-sm text-muted truncate mt-1">{item.lastMessage?.messageText || 'New conversation'}</p>
            </div></button>)}
        </div>
      </aside>
      <section aria-label="Conversation" className={(requested ? 'flex' : 'hidden md:flex') + ' flex-1 min-w-0 flex-col'}>
        {active ? <ChatPanel key={user.id + '/' + active.conversationId} user={user} conversation={active} listing={listing} onBack={back} />
          : <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-4">
            <MessageCircle size={40} className="text-brand" />
            <h2 className="font-semibold text-xl">{!requested ? 'Your conversations, all in one place' : !target || person.isError ? 'Conversation unavailable' : 'Opening conversation…'}</h2>
            <p className="text-muted max-w-sm">{!requested ? 'Choose a conversation or message a seller from a car listing.' : !target ? 'Choose another member to start a conversation.' : person.isError ? 'Couldn’t load this member. Please try again.' : 'Loading member details.'}</p>
            {person.isError && target && <button className="nc-button" onClick={() => person.refetch()}>Try again</button>}
            {requested ? <button className="nc-button nc-button-secondary" onClick={back}>Back to conversations</button> : <Link className="nc-button nc-button-secondary" to="/cars">Browse cars</Link>}
          </div>}
      </section>
    </div>
  </div>;
}
