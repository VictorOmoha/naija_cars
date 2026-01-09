import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Shield, Clock, Headphones, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import CarCard from './CarCard';
import { listingsAPI } from '../services/api';
import { rentalCars as fallbackCars } from '../data/cars';
import { useApp } from '../context/AppContext';

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
    pricePerDay: listing.price,
    mileage: listing.mileage || 0,
    transmission: listing.transmission,
    fuelType: listing.fuelType,
    condition: conditionMap[listing.condition] || listing.condition,
    location: {
      state: listing.locationState,
      city: listing.locationCity
    },
    type: 'rent',
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

const RentalsSection = () => {
  const { setIsListCarOpen } = useApp();
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        setIsLoading(true);
        const response = await listingsAPI.getAll({
          type: 'RENT',
          limit: 4
        });

        const listings = response.data.data.listings;
        if (listings && listings.length > 0) {
          setCars(listings.map(transformListing));
        } else {
          setCars(fallbackCars.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching rentals:', err);
        setCars(fallbackCars.slice(0, 4));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentals();
  }, []);
  const benefits = [
    {
      icon: Shield,
      title: 'Fully Insured',
      description: 'All vehicles come with comprehensive insurance coverage'
    },
    {
      icon: Clock,
      title: 'Flexible Duration',
      description: 'Rent by day, week, or month - your choice'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock assistance for your peace of mind'
    },
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Book online in minutes, pick up same day'
    }
  ];

  const handleListForRent = () => {
    setIsListCarOpen(true);
  };

  return (
    <section id="rentals" className="relative py-24 bg-charcoal-800 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-800 via-charcoal-900 to-charcoal-800" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 border border-naija-500/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-60 -left-60 w-[500px] h-[500px] border border-gold-500/10 rounded-full"
        />
        {/* Gradient orbs */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-naija-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative section-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-naija-400 text-sm font-semibold uppercase tracking-wider mb-4"
          >
            Car Rentals
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="heading-display-light text-4xl md:text-5xl mb-6"
          >
            Rent Your
            <span className="heading-naija"> Perfect Car</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-charcoal-300 max-w-2xl mx-auto"
          >
            From economy to luxury, find the perfect vehicle for your journey.
            All cars from verified rental companies with transparent pricing.
          </motion.p>
        </div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 bg-charcoal-700/50 border border-charcoal-600/50 rounded-2xl
                       hover:border-naija-500/30 hover:bg-charcoal-700/80 transition-all duration-500"
            >
              <div className="w-12 h-12 bg-naija-500/10 rounded-xl flex items-center justify-center
                           mb-4 group-hover:bg-naija-500/20 group-hover:scale-110 transition-all duration-500">
                <benefit.icon className="w-6 h-6 text-naija-400" />
              </div>
              <h3 className="font-display font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-sm text-charcoal-600">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-naija-400 animate-spin" />
          </div>
        )}

        {/* Rental Cars Grid */}
        {!isLoading && cars.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cars.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} variant="rent" />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && cars.length === 0 && (
          <div className="text-center py-20 text-charcoal-400">
            <p>No rental cars available at the moment.</p>
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link to="/rent">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(196, 92, 62, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-naija-500
                         text-white font-semibold rounded-2xl shadow-button transition-all duration-300
                         hover:bg-naija-600"
              >
                Browse All Rentals
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleListForRent}
              className="px-8 py-4 border-2 border-charcoal-500 text-charcoal-200
                       font-semibold rounded-2xl transition-all duration-300
                       hover:border-naija-400 hover:text-naija-400"
            >
              List Your Car for Rent
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RentalsSection;
