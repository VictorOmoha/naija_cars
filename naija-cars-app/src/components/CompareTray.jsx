import { useState } from 'react';
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
      {compareList.length > 0 && <section className="nc-compare-tray" aria-label="Selected cars to compare">
        <div className="nc-compare-summary"><strong>{compareList.length} of 3 selected</strong><span>Choose at least two cars to compare.</span></div>
        <div className="nc-compare-picks">{compareList.map((car) => <button key={car.id} onClick={() => remove(car.id)} aria-label={'Remove ' + titleOf(car) + ' from compare'}>{car.make} {car.model}<X size={15} /></button>)}</div>
        <button className="nc-button" onClick={() => setOpen(true)} disabled={compareList.length < 2}>Compare<span className="nc-compare-count"> {compareList.length} cars</span><ArrowRight size={18} /></button>
      </section>}
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
