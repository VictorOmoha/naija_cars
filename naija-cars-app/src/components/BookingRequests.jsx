import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../stores/authStore';
import { PageState } from './PageLayout';
import { formatNairaFull } from '../utils/format';

export default function BookingRequests() {
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['my-bookings', page], queryFn: () => api.get('/bookings/me', { params: { page } }).then(r => r.data.data), staleTime: 0 });
  if (isLoading) return <PageState loading title="Loading requests…" />;
  if (error) return <PageState title="We couldn’t load your requests"><button className="nc-button" onClick={() => refetch()}>Try again</button></PageState>;
  if (!data?.bookings.length) return <PageState title="Your next move starts here" description="Purchase and rental requests you send or receive will appear here."><Link className="nc-button" to="/cars">Browse cars</Link></PageState>;
  return <div className="space-y-5">{data.bookings.map(item => {
    const car = item.listingSnapshot || {};
    const incoming = item.sellerId === user.id;
    const otherId = incoming ? item.buyerId : item.sellerId;
    return <article key={item.id} className="nc-panel"><div className="nc-section-title"><div><p className="nc-eyebrow">{incoming ? 'Received request' : 'Your request'} · {item.bookingType === 'RENTAL' ? `${item.rentalDays} day rental` : 'Purchase'}</p><h2>{[car.year, car.make, car.model].filter(Boolean).join(' ') || 'Vehicle request'}</h2><p>{new Date(item.createdAt).toLocaleDateString()} · {item.reference}</p></div><span className="nc-status">{item.status === 'CANCELLED' ? 'Cancelled' : 'Request received'}</span></div><div className="flex justify-between items-start gap-4 flex-wrap"><div><p className="text-xl font-semibold">{formatNairaFull(item.totalAmount)}</p><p className="text-sm text-muted mt-2">Estimate includes selected options. No payment collected.</p></div>{otherId && <Link className="nc-button nc-button-secondary" to={`/messages?sellerId=${otherId}&listingId=${item.listingId}`}>{incoming ? 'Message buyer' : 'Message seller'}<ArrowRight size={17} /></Link>}</div>{incoming && <p className="text-sm text-muted mt-5">Contact: {item.contactInfo?.firstName} {item.contactInfo?.lastName} · {item.contactInfo?.email} · {item.contactInfo?.phone}</p>}</article>;
  })}{data.pagination.pages > 1 && <nav className="nc-pagination" aria-label="Request pages"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>{page} / {data.pagination.pages}</span><button disabled={page >= data.pagination.pages} onClick={() => setPage(page + 1)}>Next</button></nav>}</div>;
}
