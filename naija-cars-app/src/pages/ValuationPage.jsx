import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Calculator, ArrowRight, RotateCcw } from 'lucide-react';
import { PageHeader } from '../components/PageLayout';
import { carMakes, carModels, calculateValuation } from '../utils/valuation';
import { formatNairaFull } from '../utils/format';
import { NIGERIAN_STATES } from '../data/constants';

export default function ValuationPage() {
  const [params] = useSearchParams();
  const [result, setResult] = useState(null);
  const { register, handleSubmit, watch, reset } = useForm({ defaultValues: { make: params.get('make') || '', model: params.get('model') || '', year: params.get('year') || '', mileage: params.get('mileage') || '', condition: 'Foreign Used (Tokunbo)', transmission: 'Automatic', fuelType: 'Petrol', location: '' } });
  const make = watch('make');
  const calculate = (values) => setResult({ ...values, ...calculateValuation(values) });
  return <><PageHeader eyebrow="Plan your next move" title="What could your car be worth?" description="Start with an indicative estimate, then compare similar cars for sale." /><div className="nc-page-width nc-content nc-support-layout"><section className="nc-panel"><h2>Tell us about your car</h2><p className="nc-form-intro">A few details help us put together an estimated range.</p><form className="nc-form" onSubmit={handleSubmit(calculate)}><div className="nc-form-grid">
    <label className="nc-form-field">Make<select {...register('make')} required onChange={(e) => { register('make').onChange(e); reset({ ...watch(), make: e.target.value, model: '' }); }}><option value="">Choose a make</option>{carMakes.map(item => <option key={item}>{item}</option>)}</select></label>
    <label className="nc-form-field">Model<select {...register('model')} required disabled={!make}><option value="">Choose a model</option>{(carModels[make] || []).map(item => <option key={item}>{item}</option>)}</select></label>
    <label className="nc-form-field">Year<input type="number" min="1990" max={new Date().getFullYear() + 1} {...register('year')} required /></label><label className="nc-form-field">Mileage (km)<input type="number" min="0" max="2000000" {...register('mileage')} required /></label>
    <label className="nc-form-field">Condition<select {...register('condition')}><option>Brand New</option><option>Foreign Used (Tokunbo)</option><option>Nigerian Used (Locally Used)</option></select></label><label className="nc-form-field">Transmission<select {...register('transmission')}><option>Automatic</option><option>Manual</option></select></label>
    <label className="nc-form-field">Fuel type<select {...register('fuelType')}><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></label><label className="nc-form-field">Location<select {...register('location')}><option value="">All Nigeria</option>{NIGERIAN_STATES.map(item => <option key={item}>{item}</option>)}</select></label>
    </div><button className="nc-button"><Calculator size={18} />Estimate value</button></form></section><aside className="space-y-5" aria-live="polite">{result ? <section className="nc-panel"><p className="nc-eyebrow">Indicative value range</p><h2>{result.year} {result.make} {result.model}</h2><p className="nc-estimate-range">{formatNairaFull(result.lowEstimate)}<span>to</span>{formatNairaFull(result.highEstimate)}</p><p className="nc-description">This estimate uses a general pricing model. It isn’t a verified market valuation or an offer to buy. Condition, history and current asking prices can change the value.</p><Link className="nc-button mt-6 w-full" to={`/cars?make=${encodeURIComponent(result.make)}&search=${encodeURIComponent(result.model)}`}>Compare similar cars<ArrowRight size={17} /></Link><button className="nc-text-link" onClick={() => { setResult(null); reset(); }}><RotateCcw size={16} />Start again</button></section> : <section className="nc-safety-note"><Calculator size={24} /><div><h2>A useful starting point</h2><p>Use your estimate alongside current listings, maintenance records and an in-person inspection. The final price is agreed between the buyer and seller.</p></div></section>}<section className="nc-panel"><h2>Ready to sell?</h2><p className="nc-description">Give your car a clear, detailed listing and connect with buyers across Nigeria.</p><Link to="/sell" className="nc-text-link">Create a listing<ArrowRight size={17} /></Link></section></aside></div></>;
}
