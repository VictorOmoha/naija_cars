import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Car, Check, Copy, Heart } from 'lucide-react';
import { listingsAPI } from '../services/api';
import useAuthStore from '../stores/authStore';
import { useApp } from '../context/AppContext';
import SeoHead from '../components/SeoHead';
import CarCard from '../components/CarCard';
import { transformToCardShape } from '../utils/listingCard';
import {
  formatNaira, formatNairaFull, formatKm, monthlyPayment,
  conditionLabel, getDialablePhone, waLink,
} from '../utils/format';

// Share URL routes through the backend so social bots receive proper OG meta tags
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://naija-cars-api.onrender.com';

const DOWN_OPTIONS = [20, 30, 50];
const TENOR_OPTIONS = [12, 24, 48];

const PillGroup = ({ options, value, onChange, format }) => (
  <div className="flex gap-1.5">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`flex-1 text-center text-xs rounded-full transition-colors ${
          value === opt
            ? 'font-extrabold bg-ink text-white py-[9px]'
            : 'font-bold border-2 border-ink py-[7px] hover:bg-ink/5'
        }`}
      >
        {format(opt)}
      </button>
    ))}
  </div>
);

// Financing calculator block — shared between desktop rail and mobile layout
const FinancingCalc = ({ price, downPct, setDownPct, tenor, setTenor }) => {
  const monthly = monthlyPayment(price, downPct, tenor);
  const downAmount = price * (downPct / 100);
  return (
    <>
      <div className="flex flex-col gap-2.5 mb-3.5">
        <PillGroup options={DOWN_OPTIONS} value={downPct} onChange={setDownPct} format={(v) => `${v}% down`} />
        <PillGroup options={TENOR_OPTIONS} value={tenor} onChange={setTenor} format={(v) => `${v} mo`} />
      </div>
      <div className="flex justify-between items-center bg-amber-tint border-2 border-amber rounded-xl px-4 py-[13px]">
        <span className="text-xs font-bold">{formatNaira(downAmount)} down, then</span>
        <span className="text-[19px] font-black">
          {formatNaira(monthly)}
          <span className="text-xs font-bold">/mo</span>
        </span>
      </div>
    </>
  );
};

const SpecTile = ({ label, value }) => (
  <div className="border-2 border-lightborder rounded-xl px-[15px] py-[13px] bg-white">
    <div className="microlabel-1b">{label}</div>
    <div className="text-[15px] font-extrabold mt-1">{value}</div>
  </div>
);

export default function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { setIsSignInOpen, addToast, compareList, toggleCompare } = useApp();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllThumbs, setShowAllThumbs] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteSaving, setFavoriteSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downPct, setDownPct] = useState(20);
  const [tenor, setTenor] = useState(48);

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsAPI.getById(id),
  });

  const car = data?.data?.data?.listing;

  // Similar cars: same make, excluding this one
  const { data: similarData } = useQuery({
    queryKey: ['similar', car?.make],
    queryFn: () => listingsAPI.getAll({ limit: 5, page: 1, type: 'SALE', make: car.make }),
    enabled: Boolean(car?.make),
    select: (res) => res?.data?.data?.listings ?? [],
  });

  const similarCars = useMemo(
    () => (similarData ?? []).filter((l) => l.id !== id).slice(0, 4).map(transformToCardShape),
    [similarData, id]
  );

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      addToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Could not copy link', 'error');
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setIsSignInOpen(true);
      return;
    }
    setFavoriteSaving(true);
    try {
      const response = await listingsAPI.toggleFavorite(id);
      setIsFavorite(response.data.data.isFavorited);
      addToast(response.data.data.isFavorited ? 'Saved to favourites' : 'Removed from favourites', 'success');
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to update favourite', 'error');
    } finally {
      setFavoriteSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper px-4 md:px-9 py-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-[26px]">
          <div className="space-y-4">
            <div className="h-[300px] md:h-[430px] bg-hairline animate-pulse rounded-[18px] border-2 border-lightborder" />
            <div className="h-10 bg-hairline animate-pulse rounded-xl w-2/3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-hairline animate-pulse rounded-xl" />)}
            </div>
          </div>
          <div className="h-[420px] bg-hairline animate-pulse rounded-[18px] border-2 border-lightborder" />
        </div>
      </div>
    );
  }

  if (error || (!isLoading && !car)) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-lightborder mx-auto mb-4" />
          <h2 className="display-1b text-2xl mb-2">Car not found</h2>
          <p className="text-sm font-semibold text-muted mb-6">This listing may have been removed or sold.</p>
          <Link to="/cars" className="btn-pill-dark text-sm px-6 py-3">Browse all cars</Link>
        </div>
      </div>
    );
  }

  const carTitle = `${car.year} ${car.make} ${car.model}${car.trim ? ' ' + car.trim : ''}`;
  const carPrice = parseFloat(car.price);
  const isPlaceholder = Boolean(car.isPlaceholder);
  const shareUrl = `${API_BASE}/share/car/${car.id}`;
  const sellerPhone = car.phone || car.whatsapp || car.seller?.phoneNumber || '';
  const whatsappPhone = getDialablePhone(car.whatsapp || sellerPhone);
  const media = car.media ?? [];
  const mainImage = media[currentImageIndex]?.url;
  const isVerified = car.seller?.profile?.verificationBadge || false;
  const isCompared = compareList.some((c) => c.id === car.id);
  const condLabel = conditionLabel(car.condition);
  const listedDaysAgo = car.createdAt
    ? Math.max(0, Math.round((Date.now() - new Date(car.createdAt).getTime()) / 86400000))
    : null;

  const cardShape = transformToCardShape(car);

  const whatsappHref = whatsappPhone
    ? waLink(sellerPhone, `Hi, I'm interested in your ${carTitle} listed on NaijaCars (ref ${car.id.slice(0, 8).toUpperCase()}). Is it still available?`)
    : null;

  const seoDescription = [
    `Buy this ${condLabel} ${carTitle}`,
    car.locationCity && `in ${car.locationCity}`,
    car.locationState && `${car.locationCity ? ',' : 'in'} ${car.locationState}.`,
    car.transmission && `${car.transmission} transmission,`,
    car.fuelType && `${car.fuelType}.`,
    `Listed on Naija Cars for ₦${carPrice.toLocaleString()}.`,
  ].filter(Boolean).join(' ');

  const visibleThumbs = showAllThumbs ? media : media.slice(0, 4);
  const hiddenThumbCount = media.length - 5;

  const specs = [
    car.mileage != null && { label: 'Mileage', value: formatKm(car.mileage) },
    car.transmission && { label: 'Transmission', value: car.transmission },
    { label: 'Engine', value: car.engineSize || car.fuelType || '—' },
    { label: 'Condition', value: condLabel },
    car.bodyType && { label: 'Body type', value: car.bodyType },
    car.color && { label: 'Colour', value: car.color },
    car.doors && { label: 'Doors', value: car.doors },
    car.fuelType && car.engineSize && { label: 'Fuel', value: car.fuelType },
  ].filter(Boolean);

  return (
    <>
      <SeoHead
        title={`${carTitle} – ₦${(carPrice / 1_000_000).toFixed(1)}M`}
        description={seoDescription}
        image={media[0]?.url}
        url={`/car/${car.id}`}
        type="article"
      />

      <div className="bg-paper text-ink min-h-screen pb-24 lg:pb-10">
        {/* Breadcrumb (desktop) */}
        <div className="hidden md:block px-9 pt-[18px] pb-1 text-xs font-bold text-muted">
          <Link to="/cars" className="hover:text-ink">Buy</Link>
          {car.locationState && <> → <Link to={`/cars?state=${car.locationState}`} className="hover:text-ink">{car.locationState}</Link></>}
          {' → '}
          <Link to={`/cars?make=${car.make}`} className="hover:text-ink">{car.make}</Link>
          {' → '}
          <span className="text-ink">{car.model} {car.trim} {car.year}</span>
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between gap-5 px-4 md:px-9 pt-4 md:pt-1.5 pb-4 md:pb-5">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="display-1b text-[22px] md:text-[34px]">{carTitle}</h1>
              {isVerified && (
                <span className="badge-verified text-[11px] px-3 py-1.5">✓ VERIFIED</span>
              )}
            </div>
            <p className="text-xs md:text-[13.5px] font-semibold text-muted mt-1.5">
              {[car.locationCity, car.locationState].filter(Boolean).join(', ')}
              {listedDaysAgo != null && ` · Listed ${listedDaysAgo === 0 ? 'today' : `${listedDaysAgo} day${listedDaysAgo === 1 ? '' : 's'} ago`}`}
              {` · Ref NC-${car.id.slice(0, 6).toUpperCase()}`}
            </p>
          </div>
          <div className="hidden md:flex gap-2.5 flex-none">
            <button
              onClick={handleToggleFavorite}
              disabled={favoriteSaving}
              className={`btn-pill-outline text-[12.5px] px-4 py-2.5 ${isFavorite ? '!border-brand !text-brand' : ''}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-brand' : ''}`} />
              {isFavorite ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => toggleCompare(cardShape)}
              className={`btn-pill-outline text-[12.5px] px-4 py-2.5 ${isCompared ? '!border-brand !text-brand' : ''}`}
            >
              ⇄ {isCompared ? 'In compare tray' : 'Compare'}
            </button>
          </div>
        </div>

        {isPlaceholder && (
          <div className="mx-4 md:mx-9 mb-4 rounded-2xl border-2 border-amber bg-amber-tint px-5 py-3.5 text-sm font-semibold text-warntext">
            This is a placeholder listing for preview only. Real listings appear without this notice.
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_400px] gap-[26px] px-4 md:px-9">
          {/* ===== Left column: gallery + specs + description ===== */}
          <div>
            {/* Gallery */}
            <div className="relative h-[250px] md:h-[430px] border-2 border-ink rounded-[18px] stripes-1b overflow-hidden">
              {mainImage ? (
                <img src={mainImage} alt={`${carTitle} — photo ${currentImageIndex + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="w-16 h-16 text-lightborder" />
                </div>
              )}
              {isVerified && (
                <span className="badge-verified absolute top-3 left-3 md:hidden">✓ VERIFIED</span>
              )}
              {media.length > 0 && (
                <span className="absolute bottom-3.5 right-3.5 text-[11.5px] font-extrabold bg-ink text-white px-3 py-1.5 rounded-full">
                  {currentImageIndex + 1} / {media.length} photos
                </span>
              )}
              {media.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i === 0 ? media.length - 1 : i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border-2 border-ink rounded-full font-black flex items-center justify-center hover:bg-ink hover:text-white transition-colors"
                    aria-label="Previous photo"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i === media.length - 1 ? 0 : i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border-2 border-ink rounded-full font-black flex items-center justify-center hover:bg-ink hover:text-white transition-colors"
                    aria-label="Next photo"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            {/* Thumb strip */}
            {media.length > 1 && (
              <div className="grid grid-cols-5 gap-2.5 mt-3">
                {visibleThumbs.map((m, idx) => (
                  <button
                    key={m.url || idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-[54px] md:h-[70px] rounded-[10px] overflow-hidden border-2 ${
                      idx === currentImageIndex ? 'border-ink' : 'border-lightborder'
                    }`}
                  >
                    <img src={m.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
                {!showAllThumbs && hiddenThumbCount > 0 && (
                  <button
                    onClick={() => setShowAllThumbs(true)}
                    className="h-[54px] md:h-[70px] rounded-[10px] bg-ink text-white text-xs font-extrabold flex items-center justify-center"
                  >
                    +{hiddenThumbCount + 1} more
                  </button>
                )}
              </div>
            )}

            {/* Mobile financing (above the fold on mobile) */}
            <div className="lg:hidden mt-5">
              <div className="text-[11.5px] font-black uppercase tracking-[0.08em] mb-2.5">Or pay monthly</div>
              <FinancingCalc price={carPrice} downPct={downPct} setDownPct={setDownPct} tenor={tenor} setTenor={setTenor} />
            </div>

            {/* Verification card — only shown for verified sellers */}
            {isVerified && (
              <div className="border-2 border-ink rounded-[18px] mt-[22px] overflow-hidden bg-white">
                <div className="flex items-center justify-between bg-ink text-white px-4 md:px-5 py-4 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 md:w-11 md:h-11 flex-none rounded-full bg-brand flex items-center justify-center">
                      <Check className="w-5 h-5" strokeWidth={3.5} />
                    </span>
                    <div>
                      <div className="text-[13px] md:text-[15px] font-black uppercase tracking-[0.04em]">Verified listing</div>
                      <div className="text-[11.5px] text-mint font-semibold">Seller identity checked by NaijaCars</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 px-4 md:px-5 py-4 text-xs font-bold flex-wrap">
                  <span className="text-brand">✓ Verified seller badge</span>
                  <span className="text-brand">✓ Escrow eligible</span>
                  <span className="text-brand">✓ Screened before going live</span>
                </div>
              </div>
            )}

            {/* Spec tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-[22px]">
              {specs.map((spec) => (
                <SpecTile key={spec.label} label={spec.label} value={spec.value} />
              ))}
            </div>

            {/* Description */}
            {car.description && (
              <div className="mt-[22px]">
                <h2 className="display-1b text-lg mb-3">Description</h2>
                <p className="text-sm font-medium text-muted leading-relaxed whitespace-pre-line">{car.description}</p>
              </div>
            )}

            {/* Features */}
            {car.features?.length > 0 && (
              <div className="mt-[22px]">
                <h2 className="display-1b text-lg mb-3">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((feature, i) => (
                    <span key={i} className="text-[10.5px] font-extrabold uppercase tracking-[0.04em] bg-greentint text-brand px-2.5 py-[5px] rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===== Right rail (sticky on desktop) ===== */}
          <div className="hidden lg:flex flex-col gap-4 self-start sticky top-[88px]">
            {/* Price + financing card */}
            <div className="card-1b-lg p-5">
              <div className="text-[31px] font-black tracking-[-0.02em]">{formatNairaFull(carPrice)}</div>
              <div className="text-xs font-bold text-brand mt-0.5">
                {isVerified ? 'Escrow-protected · ' : ''}price slightly negotiable
              </div>
              <div className="border-t-2 border-lightborder my-4" />
              <div className="text-[11.5px] font-black uppercase tracking-[0.08em] mb-2.5">Or pay monthly</div>
              <FinancingCalc price={carPrice} downPct={downPct} setDownPct={setDownPct} tenor={tenor} setTenor={setTenor} />

              <div className="flex flex-col gap-[9px] mt-4">
                {whatsappHref ? (
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-pill-green text-sm py-[15px]">
                    WhatsApp seller ↗
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) { setIsSignInOpen(true); return; }
                      navigate(`/messages?sellerId=${car.seller?.id}&listingId=${car.id}`);
                    }}
                    className="btn-pill-green text-sm py-[15px]"
                  >
                    Message seller
                  </button>
                )}
                <Link to={`/booking/${car.id}`} className="btn-pill-outline text-sm py-[13px]">
                  Book a viewing
                </Link>
                <Link to="/pricing" className="btn-pill-amber text-sm py-[15px]">
                  Apply for financing
                </Link>
              </div>

              {isVerified && (
                <p className="text-[11px] font-semibold text-muted mt-3 leading-normal">
                  🔒 Your payment stays in escrow until you confirm the car matches its listing.
                </p>
              )}

              <button
                onClick={() => handleCopyLink(shareUrl)}
                className="flex items-center gap-1.5 text-[11px] font-extrabold text-muted hover:text-ink mt-3 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Link copied!' : 'Copy listing link'}
              </button>
            </div>

            {/* Seller card */}
            {car.seller && (
              <div className="border-2 border-ink rounded-[18px] px-[18px] py-4 bg-white">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 flex-none rounded-full border-2 border-ink bg-hairline overflow-hidden flex items-center justify-center font-black text-muted">
                    {car.seller.profile?.businessLogoUrl ? (
                      <img src={car.seller.profile.businessLogoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (car.seller.profile?.businessName || 'S')[0].toUpperCase()
                    )}
                  </span>
                  <div>
                    <div className="text-sm font-extrabold">
                      {car.seller.profile?.businessName || 'Private Seller'}{' '}
                      {car.seller.userType === 'DEALER' && (
                        <span className="badge-verified text-[10px] px-2 py-[3px] align-[2px]">✓ DEALER</span>
                      )}
                    </div>
                    <Link
                      to={`/dealer/${car.seller.id}`}
                      className="text-[11.5px] font-semibold text-muted hover:text-brand mt-0.5 inline-block"
                    >
                      View all listings from this seller →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Safety note */}
            <div className="border-2 border-amber bg-amber-tint rounded-[18px] px-[18px] py-4">
              <p className="text-xs font-extrabold text-warntext mb-1 uppercase tracking-[0.04em]">Safety tip</p>
              <p className="text-xs font-semibold text-warntext leading-relaxed">
                Always inspect the car in person before payment. Meet in a public place or at the seller's registered dealership.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile seller + safety */}
        <div className="lg:hidden px-4 mt-5 space-y-4">
          {car.seller && (
            <div className="border-2 border-ink rounded-2xl px-4 py-3.5 bg-white flex items-center gap-3">
              <span className="w-10 h-10 flex-none rounded-full border-2 border-ink bg-hairline overflow-hidden flex items-center justify-center font-black text-muted">
                {car.seller.profile?.businessLogoUrl ? (
                  <img src={car.seller.profile.businessLogoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  (car.seller.profile?.businessName || 'S')[0].toUpperCase()
                )}
              </span>
              <div>
                <div className="text-[13px] font-extrabold">
                  {car.seller.profile?.businessName || 'Private Seller'}{' '}
                  {car.seller.userType === 'DEALER' && (
                    <span className="badge-verified text-[9px] px-1.5 py-[2px] align-[1px]">✓ DEALER</span>
                  )}
                </div>
                <Link to={`/dealer/${car.seller.id}`} className="text-[11px] font-semibold text-muted">
                  View all listings →
                </Link>
              </div>
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteSaving}
                className="ml-auto p-2"
                aria-label="Save to favourites"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-brand text-brand' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* ===== Similar cars ===== */}
        {similarCars.length > 0 && (
          <div className="border-t-2 border-ink mt-8 px-4 md:px-9 pt-[26px] pb-2">
            <h2 className="display-1b text-lg md:text-xl mb-4">Similar correct cars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarCars.map((c) => (
                <CarCard key={c.id} car={c} variant="sale" showCompare={false} />
              ))}
            </div>
          </div>
        )}

        {/* ===== Mobile sticky bottom bar ===== */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center gap-2.5 bg-ink px-4 py-3">
          <div className="text-white mr-auto">
            <div className="text-[17px] font-black leading-tight">{formatNaira(carPrice)}</div>
            {isVerified && <div className="text-[10px] font-semibold text-mint">escrow-protected</div>}
          </div>
          {whatsappHref ? (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-pill-green text-[12.5px] px-[18px] py-3">
              WhatsApp ↗
            </a>
          ) : (
            <button
              onClick={() => {
                if (!isAuthenticated) { setIsSignInOpen(true); return; }
                navigate(`/messages?sellerId=${car.seller?.id}&listingId=${car.id}`);
              }}
              className="btn-pill-green text-[12.5px] px-[18px] py-3"
            >
              Message
            </button>
          )}
          <Link to="/pricing" className="btn-pill-amber text-[12.5px] px-[18px] py-3">
            Finance it
          </Link>
        </div>
      </div>
    </>
  );
}
