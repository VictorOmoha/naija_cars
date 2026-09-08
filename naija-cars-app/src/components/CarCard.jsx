import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNaira, formatKm, monthlyPayment, conditionLabel, waLink } from '../utils/format';

const isPlaceholderCar = (car) => Boolean(car.isPlaceholder) || typeof car.id === 'number';

// Listing card — "1b: Bold Market Energy": 2px ink border, hard offset shadow,
// VERIFIED pill, compare checkbox, price + monthly line, WhatsApp pill.
const CarCard = ({ car, variant = 'sale', showCompare = true }) => {
  const navigate = useNavigate();
  const { openQuickView, compareList, toggleCompare, addToast } = useApp();

  const isSale = variant === 'sale' || car.type === 'sale';
  const price = isSale ? car.price : car.pricePerDay;
  const isPlaceholder = isPlaceholderCar(car);
  const isCompared = compareList.some((c) => c.id === car.id);
  const compareFull = compareList.length >= 3 && !isCompared;

  const title = `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ''}`;
  const metaParts = [
    [car.location?.city, car.location?.state].filter(Boolean).join(', '),
    car.mileage ? formatKm(car.mileage) : null,
    isSale ? conditionLabel(car.condition) : null,
  ].filter(Boolean);
  const monthly = isSale ? monthlyPayment(price) : 0;
  const whatsappNumber = car.whatsapp || car.phone || car.dealer?.phone || '';

  const handleOpen = () => {
    if (isPlaceholder) {
      openQuickView(car);
    } else {
      navigate(`/car/${car.id}`);
    }
  };

  const handleCompare = (e) => {
    e.stopPropagation();
    if (compareFull) {
      addToast('You can compare up to 3 cars', 'info');
      return;
    }
    toggleCompare(car);
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    if (!whatsappNumber) {
      handleOpen();
    }
  };

  return (
    <div
      onClick={handleOpen}
      className={`card-1b card-1b-hover cursor-pointer ${isCompared ? 'card-1b-selected' : ''}`}
    >
      {/* Image */}
      <div className="relative h-40 sm:h-[170px] stripes-1b">
        {car.images?.[0] ? (
          <img
            src={car.images[0]}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[11px] font-mono text-muted">
            photos coming soon
          </div>
        )}

        {car.verified && (
          <span className="badge-verified absolute top-3 left-3">✓ VERIFIED</span>
        )}
        {isPlaceholder && (
          <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-[0.05em] bg-ink/85 text-white px-2.5 py-1 rounded-full">
            Sample
          </span>
        )}

        {/* Compare checkbox */}
        {showCompare && isSale && (
          <button
            onClick={handleCompare}
            title={isCompared ? 'Remove from compare' : 'Tick to compare'}
            aria-pressed={isCompared}
            className={`absolute top-2.5 right-2.5 w-[24px] h-[24px] rounded-[7px] flex items-center justify-center transition-colors ${
              isCompared
                ? 'bg-brand text-white border-2 border-white'
                : 'bg-white border-2 border-ink'
            } ${compareFull ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {isCompared && <Check className="w-3.5 h-3.5" strokeWidth={4} />}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-3.5 pt-3.5 pb-4">
        <h3 className="text-[15px] font-extrabold leading-snug">{title}</h3>
        <p className="text-[11.5px] font-semibold text-muted mt-0.5">
          {metaParts.join(' · ')}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div>
            <div className="text-[19px] font-black tracking-[-0.02em]">
              {formatNaira(price)}
              {!isSale && <span className="text-xs font-bold">/day</span>}
            </div>
            {isSale && monthly > 0 && (
              <div className="text-[11px] font-semibold text-brand">
                or {formatNaira(monthly)}/mo
              </div>
            )}
          </div>

          {whatsappNumber ? (
            <a
              href={waLink(whatsappNumber, `Hi, I'm interested in your ${title} listed on NaijaCars. Is it still available?`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsApp}
              className="btn-pill-dark text-xs px-4 py-[11px]"
            >
              WhatsApp ↗
            </a>
          ) : (
            <button onClick={handleOpen} className="btn-pill-dark text-xs px-4 py-[11px]">
              View details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarCard;
