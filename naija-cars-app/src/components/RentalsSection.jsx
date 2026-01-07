import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Shield, Clock, Headphones } from 'lucide-react';
import CarCard from './CarCard';
import { rentalCars } from '../data/cars';
import { useApp } from '../context/AppContext';

const RentalsSection = () => {
  const { addToast, setIsListCarOpen } = useApp();
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

  const handleBrowseRentals = () => {
    addToast('Loading all rental cars...', 'info');
  };

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

        {/* Rental Cars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rentalCars.map((car, index) => (
            <CarCard key={car.id} car={car} index={index} variant="rent" />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(196, 92, 62, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBrowseRentals}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-naija-500
                       text-white font-semibold rounded-2xl shadow-button transition-all duration-300
                       hover:bg-naija-600"
            >
              Browse All Rentals
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
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
