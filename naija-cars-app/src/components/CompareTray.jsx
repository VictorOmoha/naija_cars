import { useState } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, ArrowRight, ImageOff, BadgeCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNairaFull, formatKm, conditionLabel } from '../utils/format';
import Dialog from './Dialog';

const CAR_ATTRIBUTES = [
  ['Price', (car) => formatNairaFull(car.price)],
  ['Year', (car) => car.year],
  ['Mileage', (car) => car.mileage == null ? 'Not provided' : formatKm(car.mileage)],
  ['Condition', (car) => conditionLabel(car.condition).replace('Naija-used', 'Nigerian used')],
  ['Transmission', (car) => car.transmission || 'Not provided'],
  ['Fuel', (car) => car.fuelType || 'Not provided'],
  ['Location', (car) => [car.location?.city, car.location?.state].filter(Boolean).join(', ') || 'Nigeria'],
  ['Seller', (car) => car.verified ? <span className="compare-verified"><BadgeCheck size={16} />Verified seller</span> : 'Not verified'],
];
const titleOf = (car) => car.year + ' ' + car.make + ' ' + car.model;

function TraySurface({ children }) {
  const present = useIsPresent();
  const reduceMotion = useReducedMotion();
  return <motion.section className="nc-compare-tray" aria-label="Selected cars to compare" inert={!present}
    initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
    transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </motion.section>;
}

export default function CompareTray() {
  const { compareList, removeFromCompare, openQuickView } = useApp();
  const [open, setOpen] = useState(false);
  const remove = (id) => {
    if (compareList.length === 1) setOpen(false);
    removeFromCompare(id);
  };
  const openCar = (event, car) => {
    setOpen(false);
    if (car.isPlaceholder || typeof car.id === 'number') { event.preventDefault(); openQuickView(car); }
  };
  return (
    <>
      <AnimatePresence>
        {compareList.length > 0 && <TraySurface key="compare-tray">
          <div className="nc-compare-summary">
            <strong role="status"><span className="nc-selection-count" key={compareList.length}>{compareList.length}</span> of 3 selected</strong>
            <span>{compareList.length < 2 ? 'Choose at least two cars to compare.' : 'Ready to find your favourite?'}</span>
          </div>
          <div className="nc-compare-picks">{compareList.map((car) => <button key={car.id} onClick={() => remove(car.id)} aria-label={'Remove ' + titleOf(car) + ' from compare'}>{car.make} {car.model}<X size={15} /></button>)}</div>
          <button className="nc-button" onClick={() => setOpen(true)} disabled={compareList.length < 2}>Compare<span className="nc-compare-count"> {compareList.length} cars</span><ArrowRight size={18} /></button>
        </TraySurface>}
      </AnimatePresence>
      <Dialog open={open && compareList.length > 0} onClose={() => setOpen(false)} title={'Compare ' + compareList.length + ' cars'} className="nc-compare-dialog">
        <p className="nc-compare-intro">The details that matter, side by side.</p>
        <div className="nc-compare-scroll" tabIndex={0} role="region" aria-label="Car comparison table, scroll horizontally for more cars">
          <table className="nc-compare-table">
            <thead><tr><th scope="col"><span className="sr-only">Car details</span></th>{compareList.map((car) => <th scope="col" key={car.id}>
              <div className="nc-compare-image">{car.images?.[0] ? <img src={car.images[0]} alt={titleOf(car)} /> : <ImageOff size={25} />}<button className="nc-icon-button" onClick={() => remove(car.id)} aria-label={'Remove ' + titleOf(car) + ' from compare'}><X size={18} /></button></div>
              <Link to={'/car/' + car.id} onClick={(event) => openCar(event, car)}>{titleOf(car)}</Link>{car.isPlaceholder && <span className="nc-compare-sample">Sample listing</span>}
            </th>)}</tr></thead>
            <tbody>{CAR_ATTRIBUTES.map(([label, render]) => <tr key={label}><th scope="row">{label}</th>{compareList.map((car) => <td key={car.id}>{render(car)}</td>)}</tr>)}
              <tr><th scope="row"><span className="sr-only">View car</span></th>{compareList.map((car) => <td key={car.id}><Link className="nc-button nc-button-secondary" to={'/car/' + car.id} onClick={(event) => openCar(event, car)}>View details<ArrowRight size={16} /></Link></td>)}</tr>
            </tbody>
          </table>
        </div>
      </Dialog>
    </>
  );
}
