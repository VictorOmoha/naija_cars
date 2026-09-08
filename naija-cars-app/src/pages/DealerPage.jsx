import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, MapPin, Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import { usersAPI } from '../services/api';
import { PageHeader, PageState } from '../components/PageLayout';
import CarCard from '../components/CarCard';
import { transformToCardShape } from '../utils/listingCard';
import { getDialablePhone } from '../utils/format';

export default function DealerPage() {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const { data: dealer, isLoading, error, refetch } = useQuery({ queryKey: ['dealer', id], queryFn: () => usersAPI.getById(id), select: (r) => r.data.data.user });
  const { data: inventory, isLoading: inventoryLoading, error: inventoryError, refetch: retryInventory } = useQuery({ queryKey: ['dealer-listings', id, page], queryFn: () => usersAPI.getListings(id, { page, limit: 12 }), select: (r) => r.data.data });
  if (isLoading) return <PageState loading title="Loading seller…" />;
  if (error || !dealer) return <PageState title="This seller is unavailable"><button className="nc-button" onClick={() => refetch()}>Try again</button><Link to="/dealers" className="nc-button nc-button-secondary">Browse dealers</Link></PageState>;
  const profile = dealer.profile || {};
  const name = profile.businessName || [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Private seller';
  const phone = getDialablePhone(dealer.phoneNumber || profile.businessPhone || '');
  const cars = inventory?.listings || [];
  const pages = inventory?.pagination?.pages || 1;
  return <><PageHeader eyebrow="Meet the seller" backTo="/dealers" backLabel="Browse dealers" title={name} description={<><MapPin size={16} />{[profile.city, profile.state].filter(Boolean).join(', ') || 'Nigeria'}{profile.verificationBadge && <span className="nc-status"><BadgeCheck size={16} />Verified seller</span>}</>}>
    {phone && <a className="nc-button" href={`tel:${phone}`}><Phone size={17} />Call seller</a>}
  </PageHeader><div className="nc-page-width nc-content">
    {(profile.about) && <section className="nc-panel mb-8"><h2>About {name}</h2><p className="nc-description">{profile.about}</p></section>}
    <div className="nc-section-title"><div><h2>Available cars</h2><p>{inventory?.pagination?.total ?? cars.length} listings from this seller</p></div></div>
    {inventoryLoading ? <PageState loading /> : inventoryError ? <PageState title="We couldn’t load these cars"><button className="nc-button" onClick={() => retryInventory()}>Try again</button></PageState> : !cars.length ? <PageState title="No cars listed right now" description="Check back for new arrivals or explore cars from other sellers."><Link to="/cars" className="nc-button">Browse all cars</Link></PageState> : <div className="nc-saved-grid">{cars.map((car) => <CarCard key={car.id} car={transformToCardShape(car)} />)}</div>}
    {pages > 1 && <nav className="nc-pagination" aria-label="Seller listings pages"><button disabled={page === 1} onClick={() => setPage(page - 1)}><ArrowLeft size={18} />Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next<ArrowRight size={18} /></button></nav>}
  </div></>;
}
