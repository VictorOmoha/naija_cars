import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, CheckCheck, ArrowRight, Bell } from 'lucide-react';
import { PageHeader, PageState } from '../components/PageLayout';
import api from '../services/api';
import { useApp } from '../context/AppContext';

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [marking, setMarking] = useState(false);
  const { addToast } = useApp();
  const client = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['conversations'], queryFn: () => api.get('/messages/conversations').then(r => r.data) });
  const conversations = data?.data?.conversations || [];
  const unread = conversations.filter(item => item.unreadCount > 0);
  const visible = unreadOnly ? unread : conversations.filter(item => item.lastMessage);
  const markAll = async () => {
    setMarking(true);
    try { await Promise.all(unread.map(item => api.put(`/messages/${item.conversationId}/read`))); await client.invalidateQueries({ queryKey: ['conversations'] }); addToast('Messages marked as read', 'success'); }
    catch { addToast('Could not update all messages. Please try again.', 'error'); }
    finally { setMarking(false); }
  };
  return <><PageHeader eyebrow="Stay up to date" title="Notifications" description="Your latest messages, all in one place." /><div className="nc-page-width nc-content"><div className="nc-content-toolbar"><div className="nc-tabs"><button aria-pressed={!unreadOnly} onClick={() => setUnreadOnly(false)}>All messages</button><button aria-pressed={unreadOnly} onClick={() => setUnreadOnly(true)}>Unread ({unread.length})</button></div><button className="nc-button nc-button-secondary" disabled={!unread.length || marking} onClick={markAll}><CheckCheck size={17} />Mark all read</button></div>
    {isLoading ? <PageState loading /> : error ? <PageState title="Couldn’t load notifications"><button className="nc-button" onClick={() => refetch()}>Try again</button></PageState> : !visible.length ? <PageState title={unreadOnly ? 'You’re all caught up' : 'No messages yet'} description="When you hear from a buyer or seller, their messages will appear here."><Link className="nc-button" to="/cars">Explore cars</Link></PageState> : <div className="nc-notification-list">{visible.map(item => {
      const name = item.otherUser?.profile?.businessName || [item.otherUser?.profile?.firstName, item.otherUser?.profile?.lastName].filter(Boolean).join(' ') || 'NaijaCars member';
      return <Link className={'nc-notification-row' + (item.unreadCount ? ' unread' : '')} key={item.conversationId} to={`/messages?conversationId=${encodeURIComponent(item.conversationId)}`}><span className="nc-seller-avatar"><MessageCircle size={22} /></span><div><h2>{name}{item.unreadCount > 0 && <span className="nc-status">{item.unreadCount} unread</span>}</h2><p>{item.lastMessage?.messageText}</p><time>{new Date(item.lastMessage.createdAt).toLocaleString()}</time></div><ArrowRight size={19} /></Link>;
    })}</div>}
    <p className="nc-preference-note"><Bell size={16} />Manage browser notification permissions in your browser’s site settings.</p>
  </div></>;
}
