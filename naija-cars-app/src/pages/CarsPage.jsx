import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, X, Car } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '../context/AppContext';
import { listingsAPI } from '../services/api';
import CarCard from '../components/CarCard';
import { transformToCardShape } from '../utils/listingCard';
import { formatNaira, monthlyPayment } from '../utils/format';
import { CAR_MAKES, NIGERIAN_STATES } from '../data/constants';

const PAGE_SIZE = 12;
const PRICE_MIN = 0;
const PRICE_MAX = 100_000_000;
const PRICE_STEP = 500_000;

const CONDITION_CHIPS = [
  { value: '', label: 'All' },
  { value: 'FOREIGN_USED', label: 'Tokunbo' },
  { value: 'NIGERIAN_USED', label: 'Naija-used' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-low', label: 'Price ↑' },
  { value: 'price-high', label: 'Price ↓' },
  { value: 'year-new', label: 'Year: newest' },
  { value: 'mileage', label: 'Lowest mileage' },
];

// Legacy condition aliases still used by old links (footer, dropdowns)
const CONDITION_ALIASES = {
  foreign: 'FOREIGN_USED',
  nigerian: 'NIGERIAN_USED',
  new: 'BRAND_NEW',
};

const YEARS = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - i);

const filtersFromParams = (searchParams) => ({
  search: searchParams.get('search') || '',
  makes: (searchParams.get('make') || '').split(',').filter(Boolean),
  state: searchParams.get('state') || searchParams.get('location') || '',
  minPrice: searchParams.get('minPrice') || '',
  maxPrice: searchParams.get('maxPrice') || '',
  condition: CONDITION_ALIASES[searchParams.get('condition')] || searchParams.get('condition') || '',
  minYear: searchParams.get('minYear') || '',
  maxYear: searchParams.get('maxYear') || '',
  bodyType: searchParams.get('bodyType') || '',
  verifiedOnly: searchParams.get('verified') !== '0', // defaults ON per design
  page: parseInt(searchParams.get('page'), 10) || 1,
});

const FilterHeading = ({ children }) => (
  <div className="text-xs font-black uppercase tracking-[0.1em] mb-3">{children}</div>
);

// Sidebar / sheet filter controls. Draft state applies on "Apply filters".
const FilterPanel = ({ draft, setDraft, onApply, onClear, visibleMakes, setShowAllMakes, showAllMakes }) => {
  const minP = draft.minPrice === '' ? PRICE_MIN : parseInt(draft.minPrice, 10);
  const maxP = draft.maxPrice === '' ? PRICE_MAX : parseInt(draft.maxPrice, 10);
  const leftPct = (minP / PRICE_MAX) * 100;
  const rightPct = 100 - (maxP / PRICE_MAX) * 100;

  const toggleMake = (make) => {
    setDraft((d) => ({
      ...d,
      makes: d.makes.includes(make) ? d.makes.filter((m) => m !== make) : [...d.makes, make],
    }));
  };

  return (
    <div className="flex flex-col gap-[22px]">
      {/* Make */}
      <div>
        <FilterHeading>Make</FilterHeading>
        <div className="flex flex-col gap-[9px] text-[13.5px] font-semibold">
          {visibleMakes.map((make) => {
            const checked = draft.makes.includes(make);
            return (
              <button
                key={make}
                onClick={() => toggleMake(make)}
                className="flex gap-[9px] items-center text-left"
              >
                <span
                  className={`w-[17px] h-[17px] flex-none border-2 border-ink rounded flex items-center justify-center text-[11px] font-black ${
                    checked ? 'bg-brand text-white' : 'bg-white'
                  }`}
                >
                  {checked ? '✓' : ''}
                </span>
                {make}
              </button>
            );
          })}
          <button
            onClick={() => setShowAllMakes(!showAllMakes)}
            className="text-xs font-extrabold text-brand text-left"
          >
            {showAllMakes ? '– show fewer makes' : `+ ${CAR_MAKES.length - 4} more makes`}
          </button>
        </div>
      </div>

      {/* Budget */}
      <div>
        <FilterHeading>Budget</FilterHeading>
        <div className="relative h-1.5 bg-lightborder rounded-full mx-2">
          <div
            className="absolute top-0 bottom-0 bg-brand rounded-full"
            style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
          />
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={minP}
            onChange={(e) => {
              const v = Math.min(parseInt(e.target.value, 10), maxP - PRICE_STEP);
              setDraft((d) => ({ ...d, minPrice: v <= PRICE_MIN ? '' : String(v) }));
            }}
            className="range-1b z-10"
            aria-label="Minimum price"
          />
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={maxP}
            onChange={(e) => {
              const v = Math.max(parseInt(e.target.value, 10), minP + PRICE_STEP);
              setDraft((d) => ({ ...d, maxPrice: v >= PRICE_MAX ? '' : String(v) }));
            }}
            className="range-1b z-20"
            aria-label="Maximum price"
          />
        </div>
        <div className="flex justify-between text-[12.5px] font-extrabold mt-3">
          <span>₦{minP.toLocaleString()}</span>
          <span>{maxP >= PRICE_MAX ? `₦${PRICE_MAX.toLocaleString()}+` : `₦${maxP.toLocaleString()}`}</span>
        </div>
        <div className="text-[11.5px] font-semibold text-muted mt-1.5">
          or monthly: {formatNaira(monthlyPayment(minP || PRICE_STEP))} – {formatNaira(monthlyPayment(maxP))}/mo
        </div>
      </div>

      {/* Condition */}
      <div>
        <FilterHeading>Condition</FilterHeading>
        <div className="flex gap-1.5">
          {CONDITION_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setDraft((d) => ({ ...d, condition: chip.value }))}
              className={`text-xs rounded-full ${
                draft.condition === chip.value
                  ? 'font-extrabold bg-ink text-white px-[13px] py-2'
                  : 'font-bold border-2 border-ink px-[11px] py-1.5'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Year */}
      <div>
        <FilterHeading>Year</FilterHeading>
        <div className="flex gap-2">
          <select
            value={draft.minYear}
            onChange={(e) => setDraft((d) => ({ ...d, minYear: e.target.value }))}
            className="flex-1 border-2 border-ink rounded-[10px] px-3 py-2.5 text-[13px] font-bold bg-white focus:outline-none focus:border-brand"
            aria-label="Minimum year"
          >
            <option value="">From</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={draft.maxYear}
            onChange={(e) => setDraft((d) => ({ ...d, maxYear: e.target.value }))}
            className="flex-1 border-2 border-ink rounded-[10px] px-3 py-2.5 text-[13px] font-bold bg-white focus:outline-none focus:border-brand"
            aria-label="Maximum year"
          >
            <option value="">To</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <FilterHeading>Location</FilterHeading>
        <select
          value={draft.state}
          onChange={(e) => setDraft((d) => ({ ...d, state: e.target.value }))}
          className="w-full border-2 border-ink rounded-[10px] px-3 py-2.5 text-[13px] font-bold bg-white focus:outline-none focus:border-brand"
        >
          <option value="">All Nigeria</option>
          {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Verified only toggle */}
      <div className="flex items-center justify-between border-2 border-brand rounded-xl px-3.5 py-3 bg-greentint">
        <div>
          <div className="text-[13px] font-extrabold text-brand">✓ Verified only</div>
          <div className="text-[11px] font-semibold text-muted">Inspected + escrow eligible</div>
        </div>
        <button
          onClick={() => setDraft((d) => ({ ...d, verifiedOnly: !d.verifiedOnly }))}
          role="switch"
          aria-checked={draft.verifiedOnly}
          className={`relative w-10 h-[23px] rounded-full transition-colors ${
            draft.verifiedOnly ? 'bg-brand' : 'bg-lightborder'
          }`}
        >
          <span
            className={`absolute top-[3px] w-[17px] h-[17px] rounded-full bg-white transition-all ${
              draft.verifiedOnly ? 'right-[3px]' : 'left-[3px]'
            }`}
          />
        </button>
      </div>

      <button onClick={onApply} className="btn-pill-dark text-[13.5px] py-3.5">
        Apply filters
      </button>
      <button onClick={onClear} className="text-xs font-extrabold text-muted hover:text-ink -mt-3">
        Clear all filters
      </button>
    </div>
  );
};

const CarsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { compareList } = useApp();

  const applied = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const [draft, setDraft] = useState(applied);
  const [sortBy, setSortBy] = useState('newest');
  const [showAllMakes, setShowAllMakes] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(applied.search);

  // Keep draft + search box in sync when the URL changes externally
  useEffect(() => {
    setDraft(applied);
    setSearchInput(applied.search);
  }, [applied]);

  const applyFilters = (next = draft, page = 1) => {
    const params = new URLSearchParams();
    if (next.search) params.set('search', next.search);
    if (next.makes.length) params.set('make', next.makes.join(','));
    if (next.state) params.set('state', next.state);
    if (next.minPrice) params.set('minPrice', next.minPrice);
    if (next.maxPrice) params.set('maxPrice', next.maxPrice);
    if (next.condition) params.set('condition', next.condition);
    if (next.minYear) params.set('minYear', next.minYear);
    if (next.maxYear) params.set('maxYear', next.maxYear);
    if (next.bodyType) params.set('bodyType', next.bodyType);
    if (!next.verifiedOnly) params.set('verified', '0');
    if (page > 1) params.set('page', String(page));
    setSearchParams(params);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setSearchParams(applied.verifiedOnly ? {} : { verified: '0' });
  };

  const removeFilter = (patch) => applyFilters({ ...applied, ...patch });

  // Server query — make passed only when a single one is selected
  const apiParams = {
    page: applied.page,
    limit: PAGE_SIZE,
    type: 'SALE',
    ...(applied.search && { search: applied.search }),
    ...(applied.makes.length === 1 && { make: applied.makes[0] }),
    ...(applied.state && { state: applied.state }),
    ...(applied.minPrice && { minPrice: applied.minPrice }),
    ...(applied.maxPrice && { maxPrice: applied.maxPrice }),
    ...(applied.condition && { condition: applied.condition }),
    ...(applied.minYear && { minYear: applied.minYear }),
    ...(applied.maxYear && { maxYear: applied.maxYear }),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['listings', apiParams],
    queryFn: () => listingsAPI.getAll(apiParams),
    select: (res) => res?.data?.data ?? {},
    keepPreviousData: true,
  });

  const allCars = (data?.listings ?? []).map(transformToCardShape);

  // Client-side refinements the API doesn't support
  const refined = allCars.filter((car) => {
    if (applied.makes.length > 1 && !applied.makes.includes(car.make)) return false;
    if (applied.bodyType) {
      const tag = applied.bodyType.toLowerCase() === 'suv' ? 'suv' : 'sedan';
      if (!(car.category || []).includes(tag)) return false;
    }
    if (applied.verifiedOnly && !car.verified) return false;
    return true;
  });

  const cars = [...refined].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'year-new': return b.year - a.year;
      case 'mileage': return a.mileage - b.mileage;
      default: return 0;
    }
  });

  const total = data?.pagination?.total ?? 0;
  const pages = data?.pagination?.pages ?? 1;
  const page = applied.page;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const hiddenByVerified = applied.verifiedOnly && refined.length === 0 && allCars.length > 0;

  const visibleMakes = showAllMakes ? CAR_MAKES : CAR_MAKES.slice(0, 4);

  // Chips shown in the green summary bar
  const summaryChips = [
    ...applied.makes.map((m) => ({ label: m, onRemove: () => removeFilter({ makes: applied.makes.filter((x) => x !== m) }) })),
    applied.state && { label: applied.state, onRemove: () => removeFilter({ state: '' }) },
    (applied.minPrice || applied.maxPrice) && {
      label: `${formatNaira(applied.minPrice || 0)} – ${applied.maxPrice ? formatNaira(applied.maxPrice) : 'any'}`,
      onRemove: () => removeFilter({ minPrice: '', maxPrice: '' }),
    },
    applied.condition && {
      label: { FOREIGN_USED: 'Tokunbo', NIGERIAN_USED: 'Naija-used', BRAND_NEW: 'Brand new' }[applied.condition] || applied.condition,
      onRemove: () => removeFilter({ condition: '' }),
    },
    applied.bodyType && { label: `${applied.bodyType}s`, onRemove: () => removeFilter({ bodyType: '' }) },
    applied.search && { label: `“${applied.search}”`, onRemove: () => removeFilter({ search: '' }) },
  ].filter(Boolean);

  const pageNumbers = useMemo(() => {
    const nums = new Set([1, pages, page - 1, page, page + 1]);
    return [...nums].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  }, [page, pages]);

  return (
    <div className="bg-paper text-ink min-h-screen">
      {/* ===== Active search summary bar ===== */}
      <div className="hidden md:flex items-center gap-2.5 px-9 py-4 bg-brand text-white flex-wrap">
        <span className="text-[13px] font-extrabold uppercase tracking-[0.06em]">Your search:</span>
        {summaryChips.map((chip) => (
          <button
            key={chip.label}
            onClick={chip.onRemove}
            className="text-[12.5px] font-bold bg-white/15 border border-white/35 px-[13px] py-[7px] rounded-full hover:bg-white/25 transition-colors"
          >
            {chip.label} ✕
          </button>
        ))}
        {applied.verifiedOnly && (
          <button
            onClick={() => removeFilter({ verifiedOnly: false })}
            className="text-[12.5px] font-bold bg-amber text-ink px-[13px] py-[7px] rounded-full"
          >
            ✓ Verified only
          </button>
        )}
        {summaryChips.length === 0 && !applied.verifiedOnly && (
          <span className="text-[12.5px] font-semibold text-white/80">All cars</span>
        )}
        <span className="ml-auto text-[13.5px] font-extrabold">
          {total.toLocaleString()} correct car{total === 1 ? '' : 's'} found
        </span>
      </div>

      {/* ===== Mobile search strip ===== */}
      <div className="md:hidden px-4 py-3 bg-brand">
        <form
          onSubmit={(e) => { e.preventDefault(); applyFilters({ ...applied, search: searchInput }); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="⌕ SUVs in Lagos, ₦5–20M"
            className="flex-1 bg-white rounded-full px-4 py-[11px] text-[13px] font-bold placeholder:text-placeholdertext focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="w-[42px] h-[42px] flex-none rounded-full bg-ink text-white flex items-center justify-center"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Mobile quick chips */}
      <div className="md:hidden flex gap-2 px-4 py-3 overflow-x-auto border-b-2 border-ink [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => removeFilter({ verifiedOnly: !applied.verifiedOnly })}
          className={`flex-none text-[11.5px] rounded-full ${
            applied.verifiedOnly
              ? 'font-extrabold bg-amber px-[13px] py-2'
              : 'font-bold border-2 border-ink px-[11px] py-1.5'
          }`}
        >
          ✓ Verified only
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="flex-none text-[11.5px] font-bold border-2 border-ink px-[11px] py-1.5 rounded-full bg-transparent focus:outline-none"
          aria-label="Sort"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
        </select>
        {CONDITION_CHIPS.filter((c) => c.value).map((chip) => (
          <button
            key={chip.value}
            onClick={() => removeFilter({ condition: applied.condition === chip.value ? '' : chip.value })}
            className={`flex-none text-[11.5px] rounded-full ${
              applied.condition === chip.value
                ? 'font-extrabold bg-ink text-white px-[13px] py-2'
                : 'font-bold border-2 border-ink px-[11px] py-1.5'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr]">
        {/* ===== Filter sidebar (desktop) ===== */}
        <aside className="hidden lg:block border-r-2 border-ink px-[22px] pt-6 pb-8">
          <FilterPanel
            draft={draft}
            setDraft={setDraft}
            onApply={() => applyFilters()}
            onClear={clearFilters}
            visibleMakes={visibleMakes}
            showAllMakes={showAllMakes}
            setShowAllMakes={setShowAllMakes}
          />
        </aside>

        {/* ===== Results ===== */}
        <main className="px-4 md:px-9 pt-4 md:pt-[22px] pb-8">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-4 md:mb-[18px]">
            <div className="text-[12.5px] md:text-[13px] font-bold text-muted">
              Showing <b className="text-ink">{from}–{to}</b> of {total.toLocaleString()}
              <span className="hidden md:inline text-brand font-extrabold"> · ⇄ Tick up to 3 cars to compare</span>
              <span className="md:hidden"> · tick to compare</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="hidden md:block border-2 border-ink rounded-full px-4 py-[9px] text-[12.5px] font-extrabold bg-transparent focus:outline-none cursor-pointer"
              aria-label="Sort results"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
            </select>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-[18px]">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card-1b">
                  <div className="h-[160px] bg-hairline animate-pulse" />
                  <div className="p-3.5 space-y-2">
                    <div className="h-4 bg-hairline animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-hairline animate-pulse rounded w-1/2" />
                    <div className="h-6 bg-hairline animate-pulse rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <Car className="w-14 h-14 text-lightborder mx-auto mb-4" />
              <h3 className="display-1b text-xl mb-2">Error loading cars</h3>
              <p className="text-sm font-semibold text-muted">{error.message || 'Something went wrong. Please try again.'}</p>
            </div>
          ) : cars.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-[18px]">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} variant="sale" />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Car className="w-14 h-14 text-lightborder mx-auto mb-4" />
              <h3 className="display-1b text-xl mb-2">No cars found</h3>
              <p className="text-sm font-semibold text-muted mb-6">
                {hiddenByVerified
                  ? 'All cars matching your search are still awaiting verification.'
                  : 'Try adjusting your filters or search.'}
              </p>
              {hiddenByVerified ? (
                <button
                  onClick={() => removeFilter({ verifiedOnly: false })}
                  className="btn-pill-outline text-sm px-6 py-3"
                >
                  Show unverified cars too
                </button>
              ) : (
                <button onClick={clearFilters} className="btn-pill-dark text-sm px-6 py-3">
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-[26px]">
              {pageNumbers.map((n, i) => (
                <span key={n} className="flex items-center gap-2">
                  {i > 0 && pageNumbers[i - 1] !== n - 1 && (
                    <span className="text-sm font-bold text-muted">…</span>
                  )}
                  <button
                    onClick={() => applyFilters(applied, n)}
                    className={`w-[38px] h-[38px] rounded-full text-[13px] font-extrabold flex items-center justify-center ${
                      n === page ? 'bg-ink text-white' : 'border-2 border-ink hover:bg-ink hover:text-white transition-colors'
                    }`}
                  >
                    {n}
                  </button>
                </span>
              ))}
              {page < pages && (
                <button
                  onClick={() => applyFilters(applied, page + 1)}
                  className="h-[38px] rounded-full border-2 border-ink px-4 text-[13px] font-extrabold hover:bg-ink hover:text-white transition-colors"
                >
                  Next →
                </button>
              )}
            </div>
          )}

          {/* Spacer so the compare tray doesn't cover the last row */}
          {compareList.length > 0 && <div className="h-20" />}
        </main>
      </div>

      {/* ===== Mobile filter sheet ===== */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-ink/50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 w-[320px] max-w-[88vw] bg-paper z-50 lg:hidden overflow-y-auto border-l-2 border-ink"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b-2 border-ink sticky top-0 bg-paper">
                <span className="text-sm font-black uppercase tracking-[0.06em]">Filters</span>
                <button onClick={() => setShowMobileFilters(false)} aria-label="Close filters">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-4 py-5">
                <FilterPanel
                  draft={draft}
                  setDraft={setDraft}
                  onApply={() => applyFilters()}
                  onClear={clearFilters}
                  visibleMakes={visibleMakes}
                  showAllMakes={showAllMakes}
                  setShowAllMakes={setShowAllMakes}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarsPage;
