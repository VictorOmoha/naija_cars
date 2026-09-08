import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import CarCard from '../components/CarCard';
import { listingsAPI } from '../services/api';
import { transformToCardShape, BUDGET_OPTIONS, parseBudget } from '../utils/listingCard';
import { NIGERIAN_STATES } from '../data/constants';

const CONDITION_OPTIONS = [
  { value: '', label: 'Any condition' },
  { value: 'FOREIGN_USED', label: 'Tokunbo' },
  { value: 'NIGERIAN_USED', label: 'Naija-used' },
  { value: 'BRAND_NEW', label: 'Brand new' },
];

// Category chips row below the hero
const CATEGORY_CHIPS = [
  { label: 'All cars', to: '/cars', active: true },
  { label: 'SUVs', to: '/cars?bodyType=SUV' },
  { label: 'Sedans', to: '/cars?bodyType=Sedan' },
  { label: 'Tokunbo', to: '/cars?condition=FOREIGN_USED' },
  { label: 'Naija-used', to: '/cars?condition=NIGERIAN_USED' },
  { label: 'Under ₦10M', to: '/cars?maxPrice=10000000' },
  { label: 'Rentals', to: '/rent' },
];

const SearchField = ({ label, children, withBorder = true }) => (
  <div className={`flex-1 px-4 py-1.5 ${withBorder ? 'border-r border-lightborder' : ''}`}>
    <div className="microlabel-1b">{label}</div>
    {children}
  </div>
);

const selectClass =
  'w-full bg-transparent text-[15px] font-bold text-ink mt-0.5 focus:outline-none cursor-pointer';

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [state, setState] = useState('');
  const [budget, setBudget] = useState('');
  const [condition, setCondition] = useState('');

  // Newest live listings for "Hot this week"
  const { data } = useQuery({
    queryKey: ['homepage-hot'],
    queryFn: () => listingsAPI.getAll({ limit: 6, page: 1, type: 'SALE' }),
    staleTime: 5 * 60 * 1000,
    select: (res) => res?.data?.data ?? {},
  });

  const hotCars = (data?.listings ?? []).map(transformToCardShape);
  const totalLive = data?.pagination?.total ?? 0;

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (state) params.set('state', state);
    if (condition) params.set('condition', condition);
    const { minPrice, maxPrice } = parseBudget(budget);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    navigate(`/cars${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="bg-paper text-ink">
      {/* ============ Hero ============ */}
      <section className="relative bg-brand text-white">
        {/* Decorative circles in a clipped inner layer, so the car cutout can
            overflow the hero while the circles stay contained */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="nc-drift-1 absolute -right-[60px] -top-20 w-[420px] h-[420px] rounded-full bg-white/[.06]" />
          <div className="nc-drift-2 absolute right-20 -bottom-36 w-[300px] h-[300px] rounded-full bg-ink/[.15]" />
        </div>

        {/* Car cutout popping out of the hero — two-car rotation (≥1050px only) */}
        <div className="hero-car-pop" aria-hidden="true">
          <div className="hero-car-layer">
            <img src="/assets/hero-car.png" alt="" className="block w-full h-full object-contain" />
          </div>
          <div className="hero-car-layer hero-car-layer-2">
            <img src="/assets/hero-car-2.png" alt="" loading="lazy" className="block w-full h-full object-contain" />
          </div>
        </div>

        <div className="relative px-4 md:px-9 pt-8 md:pt-12 lg:pt-[52px]">
          <div className="max-w-[820px]">
            <h1 className="nc-pop display-1b text-[38px] md:text-5xl lg:text-[64px] leading-[0.98] tracking-[-0.035em]">
              Correct cars.
              <br />
              <span className="nc-pop-2 text-amber">Zero stories.</span>
            </h1>
            <p className="nc-up-sub text-[13.5px] md:text-[17px] leading-normal text-herosub mt-3 md:mt-[18px] mb-5 md:mb-[26px] max-w-[520px]">
              Every car inspected by our engineers before it goes live. What you see na wetin you go get.
            </p>
          </div>

          {/* Desktop search bar — docked to hero bottom */}
          <form
            onSubmit={handleSearch}
            className="nc-up-search relative hidden md:flex items-center bg-white rounded-t-2xl px-5 py-[18px] shadow-[0_-8px_30px_rgba(14,31,23,.15)]"
          >
            <SearchField label="Looking for">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Toyota, Lexus, Honda…"
                className="w-full bg-transparent text-[15px] font-bold text-ink mt-0.5 placeholder:text-placeholdertext focus:outline-none"
              />
            </SearchField>
            <SearchField label="Where">
              <select value={state} onChange={(e) => setState(e.target.value)} className={selectClass}>
                <option value="">All Nigeria</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </SearchField>
            <SearchField label="Budget">
              <select value={budget} onChange={(e) => setBudget(e.target.value)} className={selectClass}>
                {BUDGET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SearchField>
            <SearchField label="Condition" withBorder={false}>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className={selectClass}>
                {CONDITION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SearchField>
            <button
              type="submit"
              className="flex-none text-[15px] font-extrabold text-white bg-ink hover:bg-[#1a2f24] transition-colors px-[34px] py-4 rounded-xl"
            >
              Find my ride
            </button>
          </form>

          {/* Mobile search panel */}
          <form
            onSubmit={handleSearch}
            className="nc-up-search relative md:hidden bg-white rounded-[14px] p-3 flex flex-col gap-2 mb-6"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="⌕ Toyota, Lexus, Honda…"
              className="input-1b-light"
            />
            <div className="grid grid-cols-2 gap-2">
              <select value={state} onChange={(e) => setState(e.target.value)} className="input-1b-light">
                <option value="">All Nigeria</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select value={budget} onChange={(e) => setBudget(e.target.value)} className="input-1b-light">
                {BUDGET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="text-sm font-extrabold text-white bg-ink py-3.5 rounded-[10px] text-center"
            >
              Find my ride
            </button>
          </form>
        </div>
      </section>

      {/* ============ Category chips ============ */}
      <div className="flex gap-2 md:gap-2.5 px-4 md:px-9 py-4 md:py-[22px] overflow-x-auto border-b-2 border-ink [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORY_CHIPS.map((chip) => (
          <Link
            key={chip.label}
            to={chip.to}
            className={`flex-none text-[13px] rounded-full whitespace-nowrap ${
              chip.active
                ? 'font-extrabold bg-ink text-white px-[18px] py-2.5'
                : 'font-bold border-2 border-ink px-4 py-2 hover:bg-ink hover:text-white transition-colors'
            }`}
          >
            {chip.label}
          </Link>
        ))}
        <Link
          to="/cars"
          className="flex-none text-[13px] font-bold text-brand border-2 border-dashed border-brand px-4 py-2 rounded-full whitespace-nowrap hover:bg-greentint transition-colors"
        >
          ⇄ Compare cars
        </Link>
      </div>

      {/* ============ Hot this week ============ */}
      <section className="px-4 md:px-9 pt-6 md:pt-8 pb-8 md:pb-11">
        <div className="flex items-baseline gap-3.5 mb-4 md:mb-[22px]">
          <h2 className="display-1b text-xl md:text-[30px]">Hot this week</h2>
          {totalLive > 0 && (
            <span className="text-[10.5px] md:text-xs font-extrabold text-ink bg-amber px-2.5 py-1 rounded-full">
              {totalLive.toLocaleString()} LIVE
            </span>
          )}
        </div>

        {hotCars.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {hotCars.map((car) => (
              <CarCard key={car.id} car={car} variant="sale" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-1b">
                <div className="h-[170px] bg-hairline animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-hairline animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-hairline animate-pulse rounded w-1/2" />
                  <div className="h-6 bg-hairline animate-pulse rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <Link to="/cars" className="btn-pill-outline text-sm px-6 py-3">
            Browse all cars →
          </Link>
        </div>
      </section>

      {/* ============ How it works — the verification story ============ */}
      <section className="px-4 md:px-9 pb-8 md:pb-12">
        <div className="flex items-baseline justify-between gap-4 mb-4 md:mb-[22px]">
          <h2 className="display-1b text-xl md:text-[26px]">No stories, by design</h2>
          <Link to="/help" className="text-xs font-extrabold text-brand whitespace-nowrap hover:underline">
            How it works →
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 md:gap-5">
          {[
            {
              step: '01',
              title: 'Engineer-inspected',
              copy: 'Every verified listing is screened before it goes live. What you see na wetin you go get.',
            },
            {
              step: '02',
              title: 'Escrow-protected',
              copy: 'Your money waits in escrow until you confirm the car matches its listing. No transfers on trust.',
            },
            {
              step: '03',
              title: 'Paid same week',
              copy: 'Sellers collect their alert before the car leaves. Buyers drive off with zero wahala.',
            },
          ].map((item) => (
            <div key={item.step} className="card-1b p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 flex-none rounded-full bg-brand text-white text-[13px] font-black flex items-center justify-center">
                  {item.step}
                </span>
                <h3 className="display-1b text-[15px]">{item.title}</h3>
              </div>
              <p className="text-[13px] font-semibold text-muted leading-relaxed">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ Sell CTA band ============ */}
      <section className="px-4 md:px-0 pb-6 md:pb-0">
        {/* Desktop band */}
        <div className="hidden md:grid grid-cols-2 bg-ink text-white">
          <div className="px-9 py-11">
            <h2 className="display-1b text-[38px]">
              Sell am fast.
              <br />
              <span className="text-mint">Get paid same week.</span>
            </h2>
            <p className="text-[14.5px] leading-relaxed text-darkmuted mt-4 mb-6 max-w-[420px]">
              Free inspection at your location. We verify, list and market your car — you just collect your alert.
            </p>
            <div className="flex gap-3">
              <Link to="/valuation" className="btn-pill-amber text-sm px-6 py-[13px]">
                Get free valuation
              </Link>
              <Link
                to="/help"
                className="btn-pill text-sm font-extrabold text-white border-2 border-ink-line px-6 py-[11px] hover:bg-ink-pill transition-colors"
              >
                How it works
              </Link>
            </div>
          </div>
          <div className="relative min-h-[220px] bg-[repeating-linear-gradient(45deg,#163526_0_12px,#1B4030_12px_24px)] flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=900&q=70"
              alt="Seller handing over car keys"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Mobile card */}
        <div className="md:hidden bg-ink text-white rounded-2xl px-[18px] py-[22px]">
          <h2 className="display-1b text-2xl leading-[1.02]">
            Sell am fast.
            <br />
            <span className="text-mint">Paid same week.</span>
          </h2>
          <Link to="/valuation" className="btn-pill-amber w-full text-[13.5px] py-[13px] mt-4">
            Get free valuation
          </Link>
        </div>
      </section>
    </div>
  );
}
