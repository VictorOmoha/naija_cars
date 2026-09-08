import { useId, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Search, MapPin, ChevronDown, Car, CarFront, Banknote, SlidersHorizontal, ArrowLeft, ArrowRight, X, RotateCcw } from 'lucide-react';
import { listingsAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { CAR_MAKES, NIGERIAN_STATES } from '../data/constants';
import { BUDGET_OPTIONS, parseBudget, transformToCardShape } from '../utils/listingCard';
import { formatNaira } from '../utils/format';
import CarCard from './CarCard';
import MarketplaceHero from './MarketplaceHero';
import Dialog from './Dialog';
import SidebarAd from './SidebarAd';

const PAGE_SIZE = 12;
const RENT_BUDGETS = [
  { value: '', label: 'Any daily budget' }, { value: '-50000', label: 'Under ₦50,000 / day' },
  { value: '50000-100000', label: '₦50,000 – ₦100,000 / day' }, { value: '100000-200000', label: '₦100,000 – ₦200,000 / day' },
  { value: '200000-', label: '₦200,000+ / day' },
];
const SORT_OPTIONS = [
  ['newest', 'Newest listings'], ['price-low', 'Price: low to high'], ['price-high', 'Price: high to low'],
  ['year-new', 'Year: newest first'], ['mileage', 'Lowest mileage'],
];
const BODY_OPTIONS = [{ value: 'SUV', label: 'SUVs', icon: CarFront }, { value: 'Sedan', label: 'Sedans', icon: Car }, { value: 'Hatchback', label: 'Hatchbacks', icon: CarFront }];
const CONDITION_LABELS = { FOREIGN_USED: 'Tokunbo', NIGERIAN_USED: 'Nigerian used', BRAND_NEW: 'Brand new' };
const FIELD_KEYS = ['search', 'make', 'state', 'minPrice', 'maxPrice', 'condition', 'minYear', 'maxYear', 'bodyType', 'verified'];
const readFilters = (params) => {
  const result = Object.fromEntries(FIELD_KEYS.map((key) => [key, params.get(key) || '']));
  result.state ||= params.get('location') || '';
  result.condition = ({ foreign: 'FOREIGN_USED', nigerian: 'NIGERIAN_USED', new: 'BRAND_NEW' })[result.condition] || result.condition;
  result.verified = ['1', 'true'].includes(result.verified) ? 'true' : '';
  return result;
};

function Field({ label, icon: Icon, children }) {
  const id = useId();
  return <div className="market-field"><label htmlFor={id}>{label}</label><div className="market-control">{Icon && <Icon size={21} aria-hidden="true" />}{children(id)}<ChevronDown className="market-control-chevron" size={17} aria-hidden="true" /></div></div>;
}

function SearchPanel({ applied, rental, onApply, onTypeChange, onClear }) {
  const [draft, setDraft] = useState(applied);
  const change = (key, value) => setDraft((previous) => ({ ...previous, [key]: value }));
  const budgets = rental ? RENT_BUDGETS : BUDGET_OPTIONS.filter(({ value }) => value !== '5000000-20000000');
  const budgetValue = draft.minPrice || draft.maxPrice ? draft.minPrice + '-' + draft.maxPrice : '';
  const customBudget = budgetValue && !budgets.some(({ value }) => value === budgetValue);
  const hasFilters = FIELD_KEYS.some((key) => Boolean(applied[key]));
  return (
    <form className="market-search-panel" onSubmit={(event) => { event.preventDefault(); onApply(draft); }}>
      <h2>Find a car</h2>
      <div className="market-type-switch" aria-label="Listing type">
        <button type="button" aria-pressed={!rental} onClick={() => onTypeChange(false)}>Buy</button>
        <button type="button" aria-pressed={rental} onClick={() => onTypeChange(true)}>Rent</button>
      </div>
      <Field label="Make or model" icon={Search}>{(id) => <input id={id} type="search" placeholder="Toyota, Lexus, Honda…" value={draft.search} onChange={(event) => change('search', event.target.value)} />}</Field>
      <Field label="Location" icon={MapPin}>{(id) => <select id={id} value={draft.state} onChange={(event) => change('state', event.target.value)}><option value="">All Nigeria</option>{NIGERIAN_STATES.map((state) => <option key={state}>{state}</option>)}</select>}</Field>
      <Field label={rental ? 'Daily budget' : 'Budget'} icon={Banknote}>{(id) => <select id={id} value={budgetValue} onChange={(event) => setDraft((previous) => ({ ...previous, ...parseBudget(event.target.value) }))}>{customBudget && <option value={budgetValue}>Custom budget</option>}{budgets.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select>}</Field>
      <button className="nc-button market-search-submit" type="submit"><Search size={21} />Search cars</button>
      <div className="market-body-types">
        <h3>Browse by body type</h3>
        <div>{BODY_OPTIONS.map(({ value, label, icon: Icon }) => <button type="button" key={value} aria-pressed={draft.bodyType === value} onClick={() => { const next = { ...draft, bodyType: draft.bodyType === value ? '' : value }; setDraft(next); onApply(next); }}><Icon size={30} strokeWidth={1.5} /><span>{label}</span></button>)}</div>
      </div>
      <details className="market-more-filters" open={Boolean(applied.make || applied.condition || applied.minYear || applied.maxYear || applied.verified) || undefined}>
        <summary><SlidersHorizontal size={17} />More filters<ChevronDown size={17} /></summary>
        <div className="market-extra-fields">
          <Field label="Make">{(id) => <select id={id} value={draft.make} onChange={(event) => change('make', event.target.value)}><option value="">All makes</option>{draft.make && !CAR_MAKES.includes(draft.make) && <option>{draft.make}</option>}{CAR_MAKES.map((make) => <option key={make}>{make}</option>)}</select>}</Field>
          <Field label="Condition">{(id) => <select id={id} value={draft.condition} onChange={(event) => change('condition', event.target.value)}><option value="">Any condition</option>{Object.entries(CONDITION_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>}</Field>
          <div className="market-year-range">
            <label>From year<input type="number" min="1900" max={new Date().getFullYear() + 1} value={draft.minYear} placeholder="Any" onChange={(event) => change('minYear', event.target.value)} /></label>
            <label>To year<input type="number" min={draft.minYear || 1900} max={new Date().getFullYear() + 1} value={draft.maxYear} placeholder="Any" onChange={(event) => change('maxYear', event.target.value)} /></label>
          </div>
          <label className="market-verified"><input type="checkbox" checked={draft.verified === 'true'} onChange={(event) => change('verified', event.target.checked ? 'true' : '')} /><span>Verified sellers only</span></label>
          <button className="nc-button nc-button-secondary" type="submit">Apply filters</button>
        </div>
      </details>
      {hasFilters && <button className="market-reset" type="button" onClick={onClear}><RotateCcw size={15} />Clear all filters</button>}
    </form>
  );
}

export default function Marketplace({ home = false, defaultType = 'SALE' }) {
  const [params, setParams] = useSearchParams();
  const { compareList } = useApp();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsRef = useRef(null);
  const applied = readFilters(params);
  const rental = (params.get('type') || defaultType) === 'RENT';
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);
  const sort = SORT_OPTIONS.some(([value]) => value === params.get('sort')) ? params.get('sort') : 'newest';
  const apiParams = { ...Object.fromEntries(Object.entries(applied).filter(([, value]) => value)), type: rental ? 'RENT' : 'SALE', page, limit: PAGE_SIZE, sort };
  const { data, isLoading, isFetching, isPlaceholderData, error, refetch } = useQuery({
    queryKey: ['marketplace', apiParams],
    queryFn: () => listingsAPI.getAll(apiParams),
    select: (response) => response?.data?.data ?? {},
    placeholderData: keepPreviousData,
  });
  const cars = (data?.listings || []).map(transformToCardShape);
  const total = data?.pagination?.total ?? 0;
  const pages = Math.max(1, data?.pagination?.pages || 1);
  const activeFilters = Object.entries(applied).filter(([, value]) => value);
  const changeParams = (filters = applied, extras = {}) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filters, type: rental ? 'RENT' : 'SALE', sort, ...extras })) if (value) next.set(key, String(value).trim());
    setParams(next);
    setFiltersOpen(false);
  };
  const clear = () => changeParams({});
  const changeType = (nextRental) => changeParams({ ...applied, minPrice: '', maxPrice: '' }, { type: nextRental ? 'RENT' : 'SALE' });
  const goToPage = (nextPage) => {
    changeParams(applied, { page: nextPage });
    resultsRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  };
  const panelProps = { applied, rental, onApply: changeParams, onTypeChange: changeType, onClear: clear };
  const chipLabel = (key, value) => {
    if (key === 'minPrice') return 'From ' + formatNaira(value);
    if (key === 'maxPrice') return 'Up to ' + formatNaira(value);
    if (key === 'minYear') return 'From ' + value;
    if (key === 'maxYear') return 'Up to ' + value;
    if (key === 'verified') return 'Verified sellers';
    return CONDITION_LABELS[value] || value;
  };

  return (
    <div className={'marketplace-page' + (compareList.length ? ' has-compare' : '')}>
      <MarketplaceHero rental={rental} />
      <div className="marketplace-layout">
        <aside className="marketplace-sidebar" aria-label="Find a car">
          <SearchPanel key={params.toString()} {...panelProps} />
          {home && <SidebarAd />}
        </aside>
        <section className="marketplace-results" ref={resultsRef} aria-labelledby="results-heading" aria-busy={isFetching}>
          <div className="market-results-toolbar">
            <div><h2 id="results-heading">{rental ? 'Explore cars for rent' : 'Explore cars for sale'}</h2><p>{home && !activeFilters.length ? 'Discover your next everyday favourite.' : isLoading ? 'Finding cars for you…' : total.toLocaleString() + ' car' + (total === 1 ? '' : 's') + ' to explore'}</p></div>
            <div className="market-toolbar-controls">
              <div className="market-location-control"><MapPin size={18} aria-hidden="true" /><select aria-label="Filter results by location" value={applied.state} onChange={(event) => changeParams({ ...applied, state: event.target.value })}><option value="">All Nigeria</option>{NIGERIAN_STATES.map((state) => <option key={state}>{state}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></div>
              <div className="market-sort-control"><select aria-label="Sort results" value={sort} onChange={(event) => changeParams(applied, { sort: event.target.value })}>{SORT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></div>
            </div>
          </div>
          <div className="market-mobile-actions"><button className="nc-button nc-button-secondary" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={18} />Filters{activeFilters.length > 0 && <span>{activeFilters.length}</span>}</button><div className="market-type-switch"><button aria-pressed={!rental} onClick={() => changeType(false)}>Buy</button><button aria-pressed={rental} onClick={() => changeType(true)}>Rent</button></div></div>
          {activeFilters.length > 0 && <div className="market-active-filters">{activeFilters.map(([key, value]) => <button key={key} aria-label={'Remove filter: ' + chipLabel(key, value)} onClick={() => changeParams({ ...applied, [key]: '' })}>{chipLabel(key, value)}<X size={14} /></button>)}<button className="market-clear-link" onClick={clear}>Clear all</button></div>}
          <span className="sr-only" role="status">{isFetching ? 'Updating results' : total + ' cars found'}</span>
          {isLoading ? <div className="marketplace-grid" aria-label="Loading cars">{[0, 1, 2, 3].map((item) => <div className="market-card-skeleton" key={item}><div /><span /><span /></div>)}</div> : error ? (
            <div className="market-empty"><Car size={40} /><h3>We couldn’t load the cars</h3><p>Please check your connection and try again.</p><button className="nc-button" onClick={() => refetch()}>Try again</button></div>
          ) : cars.length ? (
            <div className={'marketplace-grid' + (isPlaceholderData ? ' is-updating' : '')}>{cars.map((car, index) => <CarCard key={car.id} car={car} entranceIndex={index} variant={rental ? 'rent' : 'sale'} />)}</div>
          ) : (
            <div className="market-empty"><Search size={40} /><h3>No cars match just yet</h3><p>Try another make, a wider budget, or a different location.</p><button className="nc-button nc-button-secondary" onClick={clear}>Clear filters</button></div>
          )}
          {!error && total > 0 && <div className="market-pagination"><p>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} cars</p>{pages > 1 && <nav aria-label="Results pages"><button aria-label="Previous page" disabled={page === 1 || isPlaceholderData} onClick={() => goToPage(page - 1)}><ArrowLeft size={18} /></button><span>Page {page} of {pages}</span><button aria-label="Next page" disabled={page >= pages || isPlaceholderData} onClick={() => goToPage(page + 1)}><ArrowRight size={18} /></button></nav>}</div>}
        </section>
      </div>
      <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" className="market-filter-dialog"><SearchPanel key={params.toString()} {...panelProps} /></Dialog>
    </div>
  );
}
