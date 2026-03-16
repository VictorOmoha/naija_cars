import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import CarCard from './CarCard';
import { featuredCars } from '../data/cars';

const FeaturedCars = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Cars' },
    { id: 'suv', label: 'SUVs' },
    { id: 'sedan', label: 'Sedans' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'new', label: 'Brand New' },
  ];

  // Filter the homepage showcase cards by category
  const filteredCars = activeFilter === 'all'
    ? featuredCars
    : featuredCars.filter(car =>
        activeFilter === 'new'
          ? car.condition === 'Brand New'
          : (car.category || []).includes(activeFilter)
      );

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
  };

  // Navigate to the full cars listing with the matching filter pre-applied
  const handleViewAll = () => {
    const filterMap = { suv: 'SUV', sedan: 'Sedan', luxury: '', new: 'Brand New' };
    if (activeFilter === 'new') {
      navigate('/cars?condition=new');
    } else if (activeFilter !== 'all' && filterMap[activeFilter]) {
      navigate(`/cars?bodyType=${filterMap[activeFilter]}`);
    } else {
      navigate('/cars');
    }
  };

  return (
    <section id="featured-cars" className="relative py-24 bg-pearl-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 kente-overlay" />

      {/* Gradient Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-naija-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-100/50 rounded-full blur-3xl" />

      <div className="relative section-container">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider mb-3 block">
              Premium Selection
            </span>
            <h2 className="heading-display text-4xl md:text-5xl mb-4">
              Featured Vehicles
            </h2>
            <p className="text-charcoal-700 max-w-xl">
              Handpicked selection of premium vehicles from verified dealers across Nigeria.
              Every car inspected and certified for quality assurance.
            </p>
          </motion.div>

          {/* Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                          ${activeFilter === filter.id
                            ? 'bg-naija-500 text-white shadow-button'
                            : 'bg-white text-charcoal-600 border border-pearl-300 hover:border-naija-300 hover:text-naija-500'
                          }`}
              >
                {filter.label}
              </button>
            ))}
            <button
              onClick={() => navigate('/cars')}
              className="p-2.5 rounded-xl bg-white text-charcoal-500
                         border border-pearl-300 hover:border-naija-300 hover:text-naija-500
                         transition-all duration-300"
              title="Advanced filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Cars Grid */}
        {filteredCars.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} variant="sale" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-charcoal-500">
            <p className="text-lg font-medium mb-3">No featured listings in this category yet.</p>
            <button onClick={() => navigate('/cars')} className="text-naija-600 font-semibold hover:underline">
              Browse all cars →
            </button>
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewAll}
            className="btn-outline group flex items-center gap-3"
          >
            View All 15,000+ Cars
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCars;
