import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import CarCard from './CarCard';
import { listingsAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { featuredCars as fallbackCars } from '../data/cars';

// Transform backend listing to CarCard format
const transformListing = (listing) => {
  const conditionMap = {
    'FOREIGN_USED': 'Foreign Used',
    'NIGERIAN_USED': 'Nigerian Used',
    'BRAND_NEW': 'Brand New'
  };

  return {
    id: listing.id,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    trim: listing.trim || '',
    price: listing.price,
    pricePerDay: listing.listingType === 'RENT' ? listing.price : undefined,
    mileage: listing.mileage || 0,
    transmission: listing.transmission,
    fuelType: listing.fuelType,
    condition: conditionMap[listing.condition] || listing.condition,
    location: {
      state: listing.locationState,
      city: listing.locationCity
    },
    type: listing.listingType?.toLowerCase() || 'sale',
    images: listing.media?.length > 0
      ? listing.media.map(m => m.url)
      : ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'],
    verified: listing.seller?.profile?.verificationBadge ? true : false,
    featured: listing.isFeatured || false,
    dealer: {
      name: listing.seller?.profile?.businessName || 'Private Seller',
      verified: listing.seller?.profile?.verificationBadge ? true : false,
      rating: 4.5
    }
  };
};

const FeaturedCars = () => {
  const { addToast } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const filters = [
    { id: 'all', label: 'All Cars' },
    { id: 'suv', label: 'SUVs' },
    { id: 'sedan', label: 'Sedans' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'new', label: 'Brand New' },
  ];

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const response = await listingsAPI.getAll({
          type: 'SALE',
          limit: 6
        });

        const listings = response.data.data.listings;
        if (listings && listings.length > 0) {
          setCars(listings.map(transformListing));
        } else {
          setCars(fallbackCars.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
        setCars(fallbackCars.slice(0, 6));
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    addToast(`Filtering by: ${filters.find(f => f.id === filterId)?.label}`, 'info');
  };

  // Filter cars based on active filter
  const filteredCars = cars.filter(car => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'suv') return car.model?.toLowerCase().includes('suv') || ['X5', 'GLE', 'RX', 'Land Cruiser', 'Highlander'].some(m => car.model?.includes(m));
    if (activeFilter === 'sedan') return ['Camry', 'Accord', 'C-Class', 'E-Class', '3 Series'].some(m => car.model?.includes(m));
    if (activeFilter === 'luxury') return ['Mercedes-Benz', 'BMW', 'Lexus', 'Audi', 'Porsche'].includes(car.make);
    if (activeFilter === 'new') return car.condition === 'Brand New';
    return true;
  });

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
            <button className="p-2.5 rounded-xl bg-white text-charcoal-500
                           border border-pearl-300 hover:border-naija-300 hover:text-naija-500
                           transition-all duration-300">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-naija-500 animate-spin" />
          </div>
        )}

        {/* Cars Grid */}
        {!isLoading && filteredCars.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} variant="sale" />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredCars.length === 0 && (
          <div className="text-center py-20 text-charcoal-600">
            <p>No cars found matching your filter. Try a different filter.</p>
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
          <Link to="/cars">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-outline group flex items-center gap-3"
            >
              View All Cars
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCars;
