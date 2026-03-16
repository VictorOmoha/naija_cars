import { motion } from 'framer-motion';
import { BadgeCheck, Star, MapPin, Car, ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const dealers = [
  {
    id: 1,
    name: 'AutoPrime Motors',
    location: 'Victoria Island, Lagos',
    rating: 4.9,
    reviews: 342,
    listings: 156,
    verified: true,
    speciality: 'Luxury SUVs',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400'
  },
  {
    id: 2,
    name: 'Elite Auto Gallery',
    location: 'Maitama, Abuja',
    rating: 4.8,
    reviews: 287,
    listings: 98,
    verified: true,
    speciality: 'German Imports',
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'
  },
  {
    id: 3,
    name: 'Prestige Auto Hub',
    location: 'Lekki, Lagos',
    rating: 4.7,
    reviews: 198,
    listings: 124,
    verified: true,
    speciality: 'Premium Sedans',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400'
  },
  {
    id: 4,
    name: 'Luxury Auto Imports',
    location: 'Ikoyi, Lagos',
    rating: 4.9,
    reviews: 412,
    listings: 89,
    verified: true,
    speciality: 'Range Rovers',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400'
  }
];

const DealersSection = () => {
  const { openAuthModal } = useApp();
  const navigate = useNavigate();

  // Opens the register modal pre-set to the register tab
  const handleBecomeDealer = () => {
    openAuthModal('register');
  };

  // Navigate to the full dealers listing page
  const handleViewAllDealers = () => {
    navigate('/cars?userType=dealer');
  };

  // These cards are showcase/demo dealers — navigate to the dealers listing
  const handleDealerClick = () => {
    navigate('/cars?userType=dealer');
  };

  return (
    <section id="dealers" className="relative py-24 bg-pearl-100 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="kente-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]
                      bg-gradient-radial from-naija-100/30 to-transparent rounded-full" />
      </div>

      <div className="relative section-container">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-naija-500 text-sm font-semibold uppercase tracking-wider mb-3 block">
              Trusted Partners
            </span>
            <h2 className="heading-display text-4xl md:text-5xl text-charcoal-800 mb-4">
              Verified
              <span className="heading-naija"> Dealers</span>
            </h2>
            <p className="text-charcoal-700 max-w-xl">
              Connect with Nigeria's most trusted car dealers. Every dealer is verified
              and rated by real customers for your peace of mind.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            onClick={handleBecomeDealer}
            className="group flex items-center gap-2 text-naija-500 font-semibold hover:underline"
          >
            Become a Dealer
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>

        {/* Dealers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealers.map((dealer, index) => (
            <motion.div
              key={dealer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
              onClick={() => handleDealerClick(dealer)}
            >
              <div className="card-warm overflow-hidden hover-lift cursor-pointer">
                {/* Dealer Image */}
                <div className="relative h-40 overflow-hidden rounded-t-3xl">
                  <img
                    src={dealer.image}
                    alt={dealer.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-charcoal-900/20 to-transparent" />

                  {/* Verified Badge */}
                  {dealer.verified && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5
                                  bg-emerald-500 text-white rounded-xl text-xs font-bold">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Verified
                    </div>
                  )}

                  {/* Speciality Tag */}
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm
                                rounded-xl text-xs text-charcoal-700 font-medium">
                    {dealer.speciality}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display font-semibold text-charcoal-800 mb-2 group-hover:text-naija-500
                               transition-colors duration-300">
                    {dealer.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-charcoal-600 text-sm mb-4">
                    <MapPin className="w-4 h-4" />
                    {dealer.location}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-pearl-300">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gold-500 fill-current" />
                      <span className="font-semibold text-charcoal-800">{dealer.rating}</span>
                      <span className="text-xs text-charcoal-600">({dealer.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-charcoal-700 text-sm">
                      <Car className="w-4 h-4" />
                      {dealer.listings} cars
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Dealers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(196, 92, 62, 0.2)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewAllDealers}
            className="group flex items-center gap-3 px-8 py-4 border-2 border-naija-500
                     text-naija-500 font-semibold rounded-2xl transition-all duration-300
                     hover:bg-naija-500 hover:text-white"
          >
            View All 850+ Dealers
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default DealersSection;
