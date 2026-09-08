import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Heart, Copy, MapPin, BadgeCheck, MessageCircle, Phone, ShieldCheck, Car, GitCompare } from 'lucide-react';
import useListing from '../hooks/useListing';
import { listingsAPI, usersAPI } from '../services/api';
import useAuthStore from '../stores/authStore';
import { useApp } from '../context/AppContext';
import SeoHead from '../components/SeoHead';
import CarCard from '../components/CarCard';
import { PageHeader, PageState } from '../components/PageLayout';
import { transformToCardShape } from '../utils/listingCard';
import { formatNairaFull, formatKm, conditionLabel, getDialablePhone, waLink } from '../utils/format';

export default function CarDetailsPage() {
  const { id } = useParams();
  const { data: car, isLoading, error, refetch } = useListing(id);
  if (isLoading) return <PageState loading title="Finding your car…" />;
  if (error || !car) return <PageState title="This listing is unavailable" description="It may have been removed, or we couldn’t connect. Please try again."><button className="nc-button" onClick={() => refetch()}>Try again</button><Link className="nc-button nc-button-secondary" to="/cars">Browse cars</Link></PageState>;
  return <ListingDetails key={car.id} car={car} />;
}

function ListingDetails({ car }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const { setIsSignInOpen, addToast, compareList, toggleCompare } = useApp();
  const [photo, setPhoto] = useState(0);
  const [saving, setSaving] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const rental = car.listingType === 'RENT';
  const title = `${car.year} ${car.make} ${car.model}${car.trim ? ' ' + car.trim : ''}`;
  const media = (car.media || []).filter((item) => item.type !== 'VIDEO' && item.mediaType !== 'VIDEO');
  const profile = car.seller?.profile;
  const sellerName = profile?.businessName || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Private seller';
  const verified = Boolean(profile?.verificationBadge);
  const sample = Boolean(car.isPlaceholder);
  const ownListing = user?.id === car.sellerId;
  const browseUrl = rental ? '/rent' : '/cars';
  const { data: favorites = [] } = useQuery({ queryKey: ['favorites'], queryFn: () => usersAPI.getFavorites(), select: (r) => r.data.data.favorites, enabled: isAuthenticated });
  const saved = favorites.some((listing) => listing.id === car.id);
  const { data: similar = [] } = useQuery({
    queryKey: ['similar', car.make, car.listingType],
    queryFn: () => listingsAPI.getAll({ make: car.make, type: car.listingType, limit: 5 }),
    select: (r) => r.data.data.listings,
  });
  const changePhoto = (index) => { setPhoto(index); setImageFailed(false); };
  const save = async () => {
    if (!isAuthenticated) return setIsSignInOpen(true);
    setSaving(true);
    try {
      await listingsAPI.toggleFavorite(car.id);
      await queryClient.invalidateQueries({ queryKey: ['favorites'] });
      addToast(saved ? 'Removed from saved cars' : 'Car saved', 'success');
    } catch (err) { addToast(err.response?.data?.error?.message || 'Could not save this car. Please try again.', 'error'); }
    finally { setSaving(false); }
  };
  const messageSeller = () => navigate(`/messages?listingId=${car.id}&sellerId=${car.sellerId}`);
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); addToast('Listing link copied', 'success'); }
    catch { addToast('Could not copy the link. You can copy it from your address bar.', 'error'); }
  };
  const phone = getDialablePhone(car.phone || car.seller?.phoneNumber || '');
  const whatsapp = getDialablePhone(car.whatsapp || phone);
  const specs = [
    ['Condition', conditionLabel(car.condition)], ['Mileage', car.mileage == null ? null : formatKm(car.mileage)],
    ['Transmission', car.transmission], ['Fuel type', car.fuelType], ['Body type', car.bodyType],
    ['Colour', car.color], ['Engine', car.engineSize], ['Year', car.year],
  ].filter(([, value]) => value != null && value !== '');
  const related = similar.filter((listing) => listing.id !== car.id).slice(0, 4);

  return <>
    <SeoHead title={`${title} | ${formatNairaFull(car.price)}${rental ? ' per day' : ''}`} description={`${rental ? 'Rent' : 'Buy'} this ${conditionLabel(car.condition)} ${title} in ${car.locationCity}, ${car.locationState}. See photos and contact the seller on NaijaCars.`} image={media[0]?.url} url={`/car/${car.id}`} type="article" />
    <PageHeader backTo={browseUrl} backLabel={rental ? 'All rental cars' : 'All cars'} eyebrow={rental ? 'Find your next rental' : 'Find your next car'} title={title} description={<><MapPin size={16} />{[car.locationCity, car.locationState].filter(Boolean).join(', ')}<span className="nc-meta-separator">·</span>Ref. NC-{car.id.slice(0, 6).toUpperCase()}</>}>
      <button className="nc-button nc-button-secondary nc-save-car" onClick={save} disabled={saving} aria-pressed={saved} aria-busy={saving}><Heart size={18} fill={saved ? 'currentColor' : 'none'} />{saved ? 'Saved' : 'Save car'}</button>
      <button className="nc-button nc-button-secondary" onClick={() => toggleCompare(transformToCardShape(car))} aria-pressed={compareList.some((item) => item.id === car.id)}><GitCompare size={18} />Compare</button>
    </PageHeader>
    <div className="nc-page-width nc-detail-layout">
      <div className="nc-detail-main">
        <section className="nc-gallery" aria-label="Vehicle photos">
          <div className="nc-gallery-image">
            {media[photo]?.url && !imageFailed ? <img src={media[photo].url} alt={`${title}, photo ${photo + 1}`} onError={() => setImageFailed(true)} /> : <div className="nc-photo-unavailable"><Car size={44} /><span>Photo unavailable</span></div>}
            {media.length > 1 && <><button className="nc-gallery-arrow previous" aria-label="Previous photo" onClick={() => changePhoto((photo - 1 + media.length) % media.length)}><ArrowLeft size={20} /></button><button className="nc-gallery-arrow next" aria-label="Next photo" onClick={() => changePhoto((photo + 1) % media.length)}><ArrowRight size={20} /></button></>}
            {media.length > 0 && <span className="nc-photo-count">{photo + 1} / {media.length} photos</span>}
            {sample && <span className="nc-gallery-tag">Sample listing</span>}
          </div>
          {media.length > 1 && <div className="nc-gallery-thumbnails">{media.map((item, index) => <button key={item.id || item.url + index} aria-label={`View photo ${index + 1}`} aria-pressed={photo === index} onClick={() => changePhoto(index)}><img src={item.thumbnailUrl || item.url} alt="" loading="lazy" /></button>)}</div>}
        </section>
        <section className="nc-panel nc-vehicle-overview"><div className="nc-section-title"><h2>Vehicle overview</h2>{verified && <span className="nc-status"><BadgeCheck size={17} />Verified seller</span>}</div><dl className="nc-spec-grid">{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
        {car.description && <section className="nc-panel"><h2>About this car</h2><p className="nc-description">{car.description}</p></section>}
        {Array.isArray(car.features) && car.features.length > 0 && <section className="nc-panel"><h2>Features & equipment</h2><ul className="nc-feature-list">{car.features.map((feature) => <li key={feature}><BadgeCheck size={17} />{feature}</li>)}</ul></section>}
      </div>
      <aside className="nc-detail-rail" aria-label="Price and seller">
        <section className="nc-panel nc-price-panel"><p className="nc-eyebrow">{rental ? 'Daily rental price' : 'Asking price'}</p><p className="nc-detail-price">{formatNairaFull(car.price)}{rental && <small> / day</small>}</p><p className="nc-price-note">{car.negotiable ? 'Open to reasonable offers' : 'Price set by the seller'}</p>
          <div className="nc-price-divider" />
          {sample ? <p className="nc-notice">This is a sample listing. Browse live listings to contact a seller or make a request.</p> : ownListing ? <Link className="nc-button" to={`/sell?edit=${car.id}`}>Edit your listing</Link> : <div className="nc-action-stack">
            <Link className="nc-button" to={`/booking/${car.id}?type=${rental ? 'rental' : 'purchase'}`}>{rental ? 'Request a rental' : 'Start a purchase request'}<ArrowRight size={18} /></Link>
            <button className="nc-button nc-button-secondary" onClick={messageSeller}><MessageCircle size={18} />Message seller</button>
            {(whatsapp || phone) && <div className="nc-contact-links">{whatsapp && <a href={waLink(whatsapp, `Hello, I’m interested in your ${title} on NaijaCars. Is it available?`)} target="_blank" rel="noopener noreferrer">WhatsApp seller<ArrowRight size={15} /></a>}{phone && <a href={`tel:${phone}`}><Phone size={16} />Call seller</a>}</div>}
            <p className="nc-transaction-note">No payment is taken here. Confirm {rental ? 'dates, availability and terms' : 'availability and viewing arrangements'} directly with the seller.</p>
          </div>}
          <button className="nc-copy-link" onClick={copyLink}><Copy size={15} />Copy listing link</button>
        </section>
        <section className="nc-panel nc-seller-panel"><div className="nc-seller-identity"><span className="nc-seller-avatar">{sellerName.charAt(0)}</span><div><h2>{sellerName}</h2><p>{verified ? 'Verified seller' : 'Seller on NaijaCars'}</p></div></div>{car.sellerId && <Link to={`/dealer/${car.sellerId}`}>View seller’s cars<ArrowRight size={17} /></Link>}</section>
        <section className="nc-safety-note"><ShieldCheck size={22} /><div><h2>Buy with confidence</h2><p>Inspect the car and its documents before paying. Meet at the seller’s dealership or in a public place.</p><Link to="/help">Read our buying guide<ArrowRight size={15} /></Link></div></section>
      </aside>
    </div>
    {related.length > 0 && <section className="nc-page-width nc-related"><div className="nc-section-title"><div><h2>More cars to consider</h2><p>A few more options for your shortlist.</p></div><Link to={`${browseUrl}?make=${encodeURIComponent(car.make)}`}>See all<ArrowRight size={18} /></Link></div><div className="nc-related-grid">{related.map((listing) => <CarCard key={listing.id} car={transformToCardShape(listing)} />)}</div></section>}
  </>;
}
