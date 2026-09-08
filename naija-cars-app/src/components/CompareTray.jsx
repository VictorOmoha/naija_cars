import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Car, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNaira, formatKm, monthlyPayment, conditionLabel, waLink } from '../utils/format';

// Side-by-side compare view for the ticked cars
const CompareModal = ({ cars, onClose, onRemove }) => {
  const rows = [
    { label: 'Price', render: (c) => <span className="text-lg font-black">{formatNaira(c.price)}</span> },
    { label: 'Monthly (20% / 48mo)', render: (c) => <span className="font-extrabold text-brand">{formatNaira(monthlyPayment(c.price))}/mo</span> },
    { label: 'Year', render: (c) => c.year },
    { label: 'Mileage', render: (c) => (c.mileage ? formatKm(c.mileage) : '—') },
    { label: 'Condition', render: (c) => conditionLabel(c.condition) || '—' },
    { label: 'Transmission', render: (c) => c.transmission || '—' },
    { label: 'Fuel', render: (c) => c.fuelType || '—' },
    { label: 'Location', render: (c) => [c.location?.city, c.location?.state].filter(Boolean).join(', ') || '—' },
    { label: 'Verified', render: (c) => (c.verified ? <span className="badge-verified text-[10px] px-2 py-[3px]">✓ VERIFIED</span> : <span className="text-muted font-semibold">Not yet</span>) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-3 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-paper border-2 border-ink rounded-[18px] shadow-hard w-full max-w-4xl max-h-[88vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-ink bg-ink text-white">
          <h2 className="display-1b text-base md:text-lg">
            Compare {cars.length} car{cars.length > 1 ? 's' : ''}
          </h2>
          <button onClick={onClose} aria-label="Close compare view" className="p-1 hover:text-amber transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-[13px] border-collapse min-w-[560px]">
            <thead>
              <tr>
                <th className="sticky left-0 bg-paper w-36 md:w-44" aria-label="Attribute" />
                {cars.map((car) => (
                  <th key={car.id} className="px-3 pt-4 pb-2 text-left align-top font-normal">
                    <div className="relative h-24 rounded-xl overflow-hidden border-2 border-ink stripes-1b mb-2">
                      {car.images?.[0] ? (
                        <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-6 h-6 text-muted" />
                        </div>
                      )}
                      <button
                        onClick={() => onRemove(car.id)}
                        aria-label={`Remove ${car.model} from compare`}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-ink text-white rounded-full flex items-center justify-center hover:bg-warntext transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Link to={`/car/${car.id}`} className="font-extrabold text-[13.5px] leading-snug hover:text-brand transition-colors">
                      {car.year} {car.make} {car.model}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t-2 border-hairline">
                  <td className="sticky left-0 bg-paper px-4 py-3 microlabel-1b !text-[10px] whitespace-nowrap">
                    {row.label}
                  </td>
                  {cars.map((car) => (
                    <td key={car.id} className="px-3 py-3 font-bold align-top">
                      {row.render(car)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t-2 border-hairline">
                <td className="sticky left-0 bg-paper" />
                {cars.map((car) => {
                  const phone = car.whatsapp || car.phone || '';
                  return (
                    <td key={car.id} className="px-3 py-4">
                      {phone ? (
                        <a
                          href={waLink(phone, `Hi, I'm interested in your ${car.year} ${car.make} ${car.model} listed on NaijaCars. Is it still available?`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-pill-dark text-xs px-4 py-2.5"
                        >
                          WhatsApp ↗
                        </a>
                      ) : (
                        <Link to={`/car/${car.id}`} className="btn-pill-outline text-xs px-4 py-2.5">
                          View details
                        </Link>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Sticky bottom compare tray (ink bg) — appears when ≥1 car is ticked to compare.
const CompareTray = () => {
  const { compareList, removeFromCompare } = useApp();
  const [showCompare, setShowCompare] = useState(false);

  const openCompare = () => setShowCompare(true);

  return (
    <>
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-ink text-white"
          >
            {/* Desktop */}
            <div className="hidden md:flex items-center justify-between px-9 py-3.5">
              <div className="flex items-center gap-3.5 flex-wrap">
                <span className="text-xs font-black uppercase tracking-[0.08em] text-mint">
                  Compare tray
                </span>
                {compareList.map((car) => (
                  <button
                    key={car.id}
                    onClick={() => removeFromCompare(car.id)}
                    className="text-[12.5px] font-bold bg-ink-pill px-3.5 py-2 rounded-full hover:bg-[#28453a] transition-colors"
                  >
                    {car.model} {car.trim || ''} ✕
                  </button>
                ))}
                {compareList.length < 3 && (
                  <span className="text-[12.5px] font-semibold text-placeholdertext border-2 border-dashed border-ink-line px-3.5 py-1.5 rounded-full">
                    + add {3 - compareList.length} more
                  </span>
                )}
              </div>
              <button
                onClick={openCompare}
                disabled={compareList.length < 2}
                className="btn-pill-amber text-[13px] px-[22px] py-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Compare {compareList.length} car{compareList.length > 1 ? 's' : ''} →
              </button>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center justify-between px-4 py-3">
              <span className="text-xs font-bold">
                <span className="text-mint font-black">{compareList.length} selected</span>
                {compareList.length < 3 && ` · add up to ${3 - compareList.length} more`}
              </span>
              <button
                onClick={openCompare}
                disabled={compareList.length < 2}
                className="btn-pill-amber text-xs px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Compare →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompare && compareList.length > 0 && (
          <CompareModal
            cars={compareList}
            onClose={() => setShowCompare(false)}
            onRemove={(id) => {
              removeFromCompare(id);
              if (compareList.length <= 1) setShowCompare(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CompareTray;
