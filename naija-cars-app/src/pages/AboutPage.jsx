import { Link } from 'react-router-dom';
import { Car, ShieldCheck, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/PageLayout';

export default function AboutPage() {
  return <><PageHeader eyebrow="About NaijaCars" title="A clearer way to find your next car." description="A marketplace that brings buyers, sellers and rental providers together across Nigeria." /><div className="nc-page-width nc-content"><section className="nc-about-intro"><div><h2>More choice.<br />More confidence in your next move.</h2><p>Finding a car is a big decision. NaijaCars puts vehicle photos, prices and seller details in one place, so you can explore your options at your own pace.</p><p>Browse cars for sale or rent, build a shortlist, compare the details and speak directly with the people behind each listing.</p><Link to="/cars" className="nc-button">Find your next car<ArrowRight size={18} /></Link></div><img src="/assets/marketplace-hero.webp" alt="Silver SUV parked outside a contemporary home in Lagos" /></section>
    <section className="nc-about-values">{[[SlidersHorizontal, 'Make the choice yours', 'Filter by what matters to you: your budget, location, preferred make and vehicle condition.'], [Car, 'See the details clearly', 'Explore photos and specifications, compare cars side by side and keep your favourites together.'], [ShieldCheck, 'Connect with the seller', 'Ask questions and arrange a viewing. Inspect the vehicle and documents before agreeing to pay.']].map(([Icon, title, copy]) => <article className="nc-panel" key={title}><Icon size={28} className="text-brand mb-5" /><h2>{title}</h2><p className="nc-description">{copy}</p></article>)}</section>
    <section className="nc-about-cta"><div><h2>Have a car to sell?</h2><p>Put your vehicle in front of people looking for their next move.</p></div><Link to="/sell" className="nc-button">List a car<ArrowRight size={18} /></Link></section>
  </div></>;
}
