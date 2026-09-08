import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ImageOff, BadgeCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNairaFull, conditionLabel } from '../utils/format';

const CarCard = ({ car, variant, showCompare = true, entranceIndex = 0 }) => {
  const { openQuickView, compareList, toggleCompare } = useApp();
  const [failedImage, setFailedImage] = useState(null);
  const isSale = variant ? variant === 'sale' : car.type !== 'rent';
  const isSample = Boolean(car.isPlaceholder) || typeof car.id === 'number';
  const selected = compareList.some((item) => item.id === car.id);
  const compareFull = compareList.length >= 3 && !selected;
  const title = `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ''}`;
  const image = car.images?.[0];
  const location = car.location?.state || car.location?.city || 'Nigeria';

  return (
    <article className={`vehicle-card${selected ? ' is-selected' : ''}`} style={{ '--nc-entrance-delay': `${Math.min(entranceIndex, 5) * 35}ms` }}>
      <Link to={`/car/${car.id}`} className="vehicle-card-link"
        onClick={(event) => { if (isSample) { event.preventDefault(); openQuickView(car); } }}
        aria-label={`View ${title}`}>
        <div className="vehicle-card-photo">
          {image && failedImage !== image ? (
            <img src={image} alt={title} loading="lazy" onError={() => setFailedImage(image)} />
          ) : (
            <div className="vehicle-no-photo"><ImageOff size={28} aria-hidden="true" /><span>Photos coming soon</span></div>
          )}
          {isSample && <span className="vehicle-sample">Sample listing</span>}
        </div>
        <div className="vehicle-card-content">
          <h3>{title}</h3>
          <p className="vehicle-card-meta">
            <span>{isSale ? conditionLabel(car.condition).replace('Naija-used', 'Nigerian used') : 'For rent'}</span>
            <span className="vehicle-meta-dot" aria-hidden="true">·</span><span>{location}</span>
            {car.verified && <BadgeCheck size={16} aria-label="Verified seller" className="text-brand" />}
          </p>
          <div className="vehicle-card-bottom">
            <p className="vehicle-card-price">{formatNairaFull(isSale ? car.price : (car.pricePerDay ?? car.price))}{!isSale && <span> / day</span>}</p>
            <span className="vehicle-card-arrow" aria-hidden="true"><ArrowRight size={20} /></span>
          </div>
        </div>
      </Link>
      {showCompare && isSale && (
        <label className={`vehicle-compare${compareFull ? ' is-disabled' : ''}`} title={compareFull ? 'Remove a car to compare another (maximum 3)' : `Compare ${title}`}>
          <input type="checkbox" checked={selected} disabled={compareFull} onChange={() => toggleCompare(car)} aria-label={`Compare ${title}`} />
        </label>
      )}
    </article>
  );
};

export default CarCard;
