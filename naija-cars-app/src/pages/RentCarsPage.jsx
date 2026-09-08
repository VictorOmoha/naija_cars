import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Car } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { listingsAPI } from '../services/api';
import { formatNaira } from '../utils/format';

const CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu'];
const VEHICLE_TYPES = ['Any', 'Sedan', 'SUV', 'Bus', 'Van', 'Pickup'];

const MODES = [
  { id: 'self-drive', label: 'Self-drive' },
  { id: 'with-driver', label: 'With driver' },
  { id: 'corporate', label: 'Corporate / events' },
];

// Sample fleet shown while the live rental inventory is still growing.
// Marked as samples — real RENT listings from the API replace them.
const SAMPLE_FLEET = [
  {
    id: 'sample-corolla', isSample: true, name: 'Toyota Corolla 2021', bodyType: 'Sedan',
    image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=600&q=70',
    dailyRate: 65000, selfDrive: true, withDriver: true, fuelIncluded: true, deposit: 100000,
    location: 'Lagos', featured: false, corporate: false,
  },
  {
    id: 'sample-prado', isSample: true, name: 'Toyota Prado 2022', bodyType: 'SUV',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=70',
    dailyRate: 150000, selfDrive: false, withDriver: true, fuelIncluded: false, deposit: 0,
    location: 'Lagos', featured: true, corporate: true, minDays: 1,
  },
  {
    id: 'sample-hiace', isSample: true, name: 'Toyota Hiace 2020 · 14 seats', bodyType: 'Bus',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=70',
    dailyRate: 110000, selfDrive: false, withDriver: true, fuelIncluded: false, deposit: 0,
    location: 'Lagos', featured: false, corporate: true,
  },
  {
    id: 'sample-civic', isSample: true, name: 'Honda Civic 2022', bodyType: 'Sedan',
    image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=600&q=70',
    dailyRate: 70000, selfDrive: true, withDriver: false, fuelIncluded: false, deposit: 150000,
    location: 'Abuja', featured: false, corporate: false,
  },
  {
    id: 'sample-crv', isSample: true, name: 'Honda CR-V 2022', bodyType: 'SUV',
    image: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=600&q=70',
    dailyRate: 95000, selfDrive: true, withDriver: true, fuelIncluded: false, deposit: 200000,
    location: 'Lagos', featured: false, corporate: false,
  },
  {
    id: 'sample-gx', isSample: true, name: 'Lexus GX 460 2021', bodyType: 'SUV',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=70',
    dailyRate: 220000, selfDrive: false, withDriver: true, fuelIncluded: false, deposit: 0,
    location: 'Abuja', featured: true, corporate: true,
  },
];

const isoDate = (d) => d.toISOString().slice(0, 10);
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const RentalCard = ({ ride, days, onBook }) => {
  const total = ride.dailyRate * days;
  const tags = [
    ride.fuelIncluded && { text: 'FUEL INCLUDED', tone: 'green' },
    ride.withDriver && !ride.selfDrive && { text: 'DRIVER INCLUDED', tone: 'green' },
    ride.deposit > 0 && { text: `${formatNaira(ride.deposit)} DEPOSIT`, tone: 'amber' },
    ride.minDays && { text: `MIN. ${ride.minDays} DAY${ride.minDays > 1 ? 'S' : ''}`, tone: 'amber' },
    ride.corporate && { text: 'CORPORATE RATES', tone: 'amber' },
  ].filter(Boolean).slice(0, 3);

  const driveMode = ride.selfDrive && ride.withDriver
    ? 'Self-drive or with driver'
    : ride.selfDrive ? 'Self-drive' : 'With driver only';

  return (
    <div className="card-1b-lg card-1b-hover">
      <div className="relative h-40 md:h-[180px] stripes-1b">
        {ride.image ? (
          <img src={ride.image} alt={ride.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-10 h-10 text-lightborder" />
          </div>
        )}
        <span className="badge-verified absolute top-3 left-3">✓ VERIFIED FLEET</span>
        {ride.featured && (
          <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-[0.05em] bg-amber text-ink px-2.5 py-[5px] rounded-full">
            POPULAR
          </span>
        )}
        {ride.isSample && (
          <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-[0.05em] bg-ink/85 text-white px-2.5 py-1 rounded-full">
            Sample
          </span>
        )}
      </div>
      <div className="px-4 pt-[15px] pb-4">
        <h3 className="text-[15.5px] font-extrabold">{ride.name}</h3>
        <p className="text-xs font-semibold text-muted mt-[3px]">
          {ride.bodyType} · AC · {driveMode}
        </p>
        {tags.length > 0 && (
          <div className="flex gap-1.5 mt-2.5 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag.text}
                className={`text-[10.5px] font-extrabold px-2.5 py-[5px] rounded-full ${
                  tag.tone === 'green' ? 'bg-greentint text-brand' : 'bg-amber-tint text-ink'
                }`}
              >
                {tag.text}
              </span>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center mt-[13px] pt-3 border-t-2 border-hairline">
          <div>
            <div className="text-xl font-black">
              {formatNaira(ride.dailyRate)}
              <span className="text-xs font-bold">/day</span>
            </div>
            <div className="text-[10.5px] font-semibold text-muted">
              {formatNaira(total)} for your {days} day{days > 1 ? 's' : ''}
            </div>
          </div>
          <button onClick={() => onBook(ride)} className="btn-pill-green text-xs px-[17px] py-[11px]">
            Book ↗
          </button>
        </div>
      </div>
    </div>
  );
};

const RentCarsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useApp();

  // Legacy links: /rent?period=corporate etc.
  const initialMode = searchParams.get('period') === 'corporate' ? 'corporate' : 'self-drive';

  const [mode, setMode] = useState(initialMode);
  const [city, setCity] = useState('Lagos');
  const [pickupDate, setPickupDate] = useState(isoDate(addDays(new Date(), 1)));
  const [returnDate, setReturnDate] = useState(isoDate(addDays(new Date(), 4)));
  const [vehicleType, setVehicleType] = useState('Any');
  const [sortBy, setSortBy] = useState('price-low');

  const days = useMemo(() => {
    const ms = new Date(returnDate) - new Date(pickupDate);
    return Math.max(1, Math.round(ms / 86400000));
  }, [pickupDate, returnDate]);

  // Live RENT listings from the API
  const { data: apiRides } = useQuery({
    queryKey: ['rentals'],
    queryFn: () => listingsAPI.getAll({ limit: 24, page: 1, type: 'RENT' }),
    staleTime: 5 * 60 * 1000,
    select: (res) => res?.data?.data?.listings ?? [],
  });

  // Shape API listings into ride cards; price on a RENT listing is the daily rate
  const liveRides = (apiRides ?? []).map((l) => ({
    id: l.id,
    isSample: Boolean(l.isPlaceholder),
    name: `${l.make} ${l.model} ${l.year}`,
    bodyType: l.bodyType || 'Sedan',
    image: l.media?.[0]?.url,
    dailyRate: parseFloat(l.price),
    selfDrive: true,
    withDriver: true,
    fuelIncluded: false,
    deposit: 0,
    location: l.locationState || '',
    featured: Boolean(l.isFeatured),
    corporate: false,
  }));

  const fleet = liveRides.length > 0 ? liveRides : SAMPLE_FLEET;

  const rides = useMemo(() => {
    let result = fleet.filter((ride) => {
      if (mode === 'self-drive' && !ride.selfDrive) return false;
      if (mode === 'with-driver' && !ride.withDriver) return false;
      if (mode === 'corporate' && !(ride.corporate || ride.withDriver)) return false;
      if (vehicleType !== 'Any' && ride.bodyType !== vehicleType) return false;
      if (city && ride.location && ride.location !== city) return false;
      return true;
    });
    result = [...result].sort((a, b) =>
      sortBy === 'price-high' ? b.dailyRate - a.dailyRate : a.dailyRate - b.dailyRate
    );
    return result;
  }, [fleet, mode, vehicleType, city, sortBy]);

  const handleBook = (ride) => {
    if (ride.isSample) {
      addToast('This is a sample vehicle — live rentals appear here as fleets join', 'info');
      return;
    }
    navigate(`/booking/${ride.id}`);
  };

  const selectHeroClass =
    'w-full bg-transparent text-[14.5px] font-bold text-ink mt-0.5 focus:outline-none cursor-pointer';

  return (
    <div className="bg-paper text-ink min-h-screen">
      {/* ===== Rent hero ===== */}
      <section className="relative bg-brand text-white px-4 md:px-9 pt-7 md:pt-[38px] pb-6 md:pb-[34px] overflow-hidden">
        <div className="absolute -right-[50px] -top-[90px] w-[340px] h-[340px] rounded-full bg-white/[.06]" />

        <h1 className="relative display-1b text-[28px] md:text-[44px]">
          Rent a correct ride.
          <br />
          <span className="text-amber">Driver optional.</span>
        </h1>

        {/* Mode toggle */}
        <div className="relative flex gap-2 mt-4 md:mt-5 mb-3 md:mb-4 flex-wrap">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`text-[12px] md:text-[13px] rounded-full transition-colors ${
                mode === m.id
                  ? 'font-extrabold bg-white text-ink px-4 md:px-5 py-2.5'
                  : 'font-bold border-2 border-white/50 px-3.5 md:px-[18px] py-2 hover:border-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Desktop search bar */}
        <div className="relative hidden md:flex items-center bg-white rounded-2xl px-[18px] py-4 shadow-[0_10px_30px_rgba(14,31,23,.2)]">
          <div className="flex-[1.2] px-4 py-1 border-r border-lightborder">
            <div className="microlabel-1b !text-[10px]">Pick-up city</div>
            <select value={city} onChange={(e) => setCity(e.target.value)} className={selectHeroClass}>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 px-4 py-1 border-r border-lightborder">
            <div className="microlabel-1b !text-[10px]">Pick-up date</div>
            <input
              type="date" value={pickupDate} min={isoDate(new Date())}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full bg-transparent text-[14.5px] font-bold text-ink mt-0.5 focus:outline-none"
            />
          </div>
          <div className="flex-1 px-4 py-1 border-r border-lightborder">
            <div className="microlabel-1b !text-[10px]">Return date</div>
            <input
              type="date" value={returnDate} min={pickupDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-transparent text-[14.5px] font-bold text-ink mt-0.5 focus:outline-none"
            />
          </div>
          <div className="flex-[.8] px-4 py-1">
            <div className="microlabel-1b !text-[10px]">Vehicle type</div>
            <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className={selectHeroClass}>
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <span className="flex-none text-sm font-extrabold text-white bg-ink px-[30px] py-[15px] rounded-xl">
            {rides.length} ride{rides.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Mobile search panel */}
        <div className="relative md:hidden bg-white rounded-[14px] p-3 flex flex-col gap-2">
          <select value={city} onChange={(e) => setCity(e.target.value)} className="input-1b-light">
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date" value={pickupDate} min={isoDate(new Date())}
              onChange={(e) => setPickupDate(e.target.value)} className="input-1b-light"
              aria-label="Pick-up date"
            />
            <input
              type="date" value={returnDate} min={pickupDate}
              onChange={(e) => setReturnDate(e.target.value)} className="input-1b-light"
              aria-label="Return date"
            />
          </div>
          <div className="text-[13.5px] font-extrabold text-white bg-ink py-3.5 rounded-[10px] text-center">
            Showing {rides.length} ride{rides.length === 1 ? '' : 's'}
          </div>
        </div>
      </section>

      {/* ===== Results ===== */}
      <section className="px-4 md:px-9 pt-6 md:pt-[30px] pb-10">
        <div className="flex items-baseline justify-between gap-3 mb-5 flex-wrap">
          <h2 className="display-1b text-lg md:text-[26px]">
            {rides.length} ride{rides.length === 1 ? '' : 's'} in {city} · {days} day{days > 1 ? 's' : ''}
          </h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-2 border-ink rounded-full px-4 py-[9px] text-[12.5px] font-extrabold bg-transparent focus:outline-none cursor-pointer"
            aria-label="Sort rides"
          >
            <option value="price-low">Sort: Price ↑</option>
            <option value="price-high">Sort: Price ↓</option>
          </select>
        </div>

        {rides.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {rides.map((ride) => (
              <RentalCard key={ride.id} ride={ride} days={days} onBook={handleBook} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Car className="w-14 h-14 text-lightborder mx-auto mb-4" />
            <h3 className="display-1b text-xl mb-2">No rides match</h3>
            <p className="text-sm font-semibold text-muted mb-5">
              Try a different city, vehicle type or drive mode.
            </p>
            <button
              onClick={() => { setVehicleType('Any'); setMode('self-drive'); }}
              className="btn-pill-outline text-sm px-6 py-3"
            >
              Reset search
            </button>
          </div>
        )}

        {/* Corporate strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ink text-white rounded-[18px] px-5 md:px-[26px] py-5 md:py-[22px] mt-[26px]">
          <div>
            <div className="text-[15px] md:text-[19px] font-black uppercase tracking-[-0.01em]">
              Need cars every week?{' '}
              <span className="text-mint">Corporate plans from ₦1.8M/mo.</span>
            </div>
            <div className="text-[12.5px] text-darkmuted mt-1 font-semibold">
              Dedicated fleet, vetted drivers, one monthly invoice.
            </div>
          </div>
          <Link to="/contact" className="btn-pill-amber flex-none text-[13px] px-6 py-3 self-start md:self-auto">
            Talk to sales
          </Link>
        </div>
      </section>
    </div>
  );
};

export default RentCarsPage;
