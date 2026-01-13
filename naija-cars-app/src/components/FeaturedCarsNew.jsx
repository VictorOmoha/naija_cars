import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, Heart, MapPin, Gauge, Fuel, Shield, Sparkles } from 'lucide-react';
import { featuredCars } from '../data/cars';
import { useApp } from '../context/AppContext';

const FeaturedCarsNew = () => {
  const { addToast, toggleFavorite, openQuickView } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Vehicles', icon: Sparkles },
    { id: 'suv', label: 'SUVs', icon: Shield },
    { id: 'sedan', label: 'Sedans', icon: Gauge },
    { id: 'luxury', label: 'Luxury', icon: Heart },
  ];

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    addToast(`Filtering: ${filters.find(f => f.id === filterId)?.label}`, 'info');
  };

  const handleViewAll = () => {
    addToast('Loading complete inventory...', 'info');
  };

  const handleQuickView = (car) => {
    openQuickView(car);
  };

  const handleAddToFavorites = (e, car) => {
    e.stopPropagation();
    toggleFavorite(car.id);
  };

  return (
    <section id="featured-cars" className="relative py-32 bg-gradient-obsidian overflow-hidden">
      {/* African Pattern Overlay */}
      <div className="african-pattern-overlay" />

      {/* Dramatic Gradient Accents */}
      <div className="absolute inset-0 gradient-mesh-luxury" />

      <div className="relative section-container">
        {/* Section Header - BOLD */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <div className="px-6 py-2 bg-gradient-luxury">
                <span className="font-display text-charcoal-700 text-xs uppercase tracking-widest font-black">
                  Premium Collection
                </span>
              </div>
            </motion.div>

            <h2 className="font-display text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-none mb-6">
              <span className="block text-pearl-50">FEATURED</span>
              <span className="block text-gradient-luxury">VEHICLES</span>
            </h2>

            <p className="text-xl text-pearl-400 font-body max-w-2xl mx-auto">
              Handpicked selection of <span className="text-gold-400 font-bold">premium vehicles</span> from
              <span className="text-emerald-400 font-bold"> verified dealers</span> across Nigeria
            </p>
          </motion.div>

          {/* Filter Bar - Angular Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mt-12"
          >
            {filters.map((filter, index) => (
              <motion.button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 px-8 py-4 font-bold uppercase tracking-widest
                          transition-all duration-500 clip-path-diagonal ${
                  activeFilter === filter.id
                    ? 'bg-gradient-luxury text-charcoal-700 shadow-luxury-xl'
                    : 'bg-charcoal-600 text-pearl-300 border-2 border-gold-500/30 hover:border-gold-500'
                }`}
              >
                <filter.icon className="w-5 h-5" />
                {filter.label}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Car Grid - Dramatic Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {featuredCars.slice(0, 6).map((car, index) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative card-luxury overflow-hidden h-full flex flex-col">
                {/* Image Container */}
                <div className="relative h-72 overflow-hidden">
                  <motion.img
                    src={car.images?.[0] || car.image}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900 via-obsidian-900/50 to-transparent" />

                  {/* Status Tags */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {car.condition === 'Brand New' && (
                      <div className="tag-new">NEW</div>
                    )}
                    {car.verified && (
                      <div className="verified-badge">
                        <Shield className="w-3 h-3" />
                        VERIFIED
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleAddToFavorites(e, car)}
                      className="w-10 h-10 bg-charcoal-700/90 backdrop-blur-sm border border-gold-500/50
                               flex items-center justify-center hover:bg-gradient-luxury transition-all duration-300 group/btn"
                    >
                      <Heart className="w-5 h-5 text-pearl-300 group-hover/btn:text-charcoal-700" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuickView(car)}
                      className="w-10 h-10 bg-charcoal-700/90 backdrop-blur-sm border border-gold-500/50
                               flex items-center justify-center hover:bg-gradient-luxury transition-all duration-300 group/btn"
                    >
                      <Eye className="w-5 h-5 text-pearl-300 group-hover/btn:text-charcoal-700" />
                    </motion.button>
                  </div>

                  {/* Price - Prominent */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-gradient-luxury px-6 py-3 clip-path-diagonal">
                      <div className="text-xs text-charcoal-700 font-black uppercase tracking-widest">Price</div>
                      <div className="text-2xl font-display font-black text-charcoal-700">
                        ₦{(car.price / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex-1 p-6 bg-gradient-to-br from-obsidian-700 to-obsidian-800">
                  {/* Car Name */}
                  <div className="mb-4">
                    <h3 className="font-display text-2xl font-black text-gold-400 uppercase leading-tight mb-1">
                      {car.make}
                    </h3>
                    <p className="text-lg text-pearl-300 font-bold">
                      {car.model} {car.year}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 mb-4 text-pearl-400">
                    <MapPin className="w-4 h-4 text-gold-400" />
                    <span className="text-sm font-medium">
                      {typeof car.location === 'string' ? car.location : `${car.location.city}, ${car.location.state}`}
                    </span>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-600 flex items-center justify-center">
                        <Gauge className="w-4 h-4 text-gold-400" />
                      </div>
                      <div>
                        <div className="text-xs text-pearl-500 uppercase tracking-wider">Mileage</div>
                        <div className="text-sm font-bold text-pearl-200">{car.mileage.toLocaleString()}km</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-600 flex items-center justify-center">
                        <Fuel className="w-4 h-4 text-gold-400" />
                      </div>
                      <div>
                        <div className="text-xs text-pearl-500 uppercase tracking-wider">Fuel</div>
                        <div className="text-sm font-bold text-pearl-200">{car.fuelType}</div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickView(car)}
                    className="w-full mt-4 group/cta relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-emerald translate-x-full group-hover/cta:translate-x-0 transition-transform duration-500" />
                    <div className="relative flex items-center justify-center gap-3 py-4 bg-gradient-luxury group-hover/cta:bg-transparent
                                  border-2 border-gold-600 font-black uppercase tracking-widest text-sm text-charcoal-700 group-hover/cta:text-gold-400 transition-colors duration-500">
                      View Details
                      <ArrowRight className="w-5 h-5 group-hover/cta:translate-x-1 transition-transform duration-300" />
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All CTA - BOLD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewAll}
            className="group relative inline-block"
          >
            <div className="absolute inset-0 bg-gradient-luxury blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative btn-primary px-16 py-6 text-lg flex items-center gap-4">
              <span>VIEW ALL VEHICLES</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </motion.button>

          <p className="mt-6 text-pearl-400 text-sm">
            Browse through <span className="text-gold-400 font-bold">15,000+</span> verified vehicles
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCarsNew;
