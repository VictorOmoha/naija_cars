import Hero from '../components/Hero';
import FeaturedCars from '../components/FeaturedCars';
import ValuationCTA from '../components/ValuationCTA';
import RentalsSection from '../components/RentalsSection';
import DealersSection from '../components/DealersSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCars />
      <ValuationCTA />
      <RentalsSection />
      <DealersSection />
    </>
  );
}
