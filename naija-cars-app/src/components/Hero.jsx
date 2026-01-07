import { motion } from 'framer-motion';
import { Search, MapPin, ChevronDown, Car, Key, Sparkles, ArrowRight } from 'lucide-react';
import { nigerianStates, carMakes, stats } from '../data/cars';
import { useApp } from '../context/AppContext';

const Hero = () => {
  const { searchFilters, setSearchFilters, handleSearch, scrollToSection } = useApp();

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const handleTabChange = (type) => {
    setSearchFilters({ ...searchFilters, type });
  };

  const handleInputChange = (field, value) => {
    setSearchFilters({ ...searchFilters, [field]: value });
  };

  const onSearchClick = () => {
    handleSearch();
    scrollToSection(searchFilters.type === 'buy' ? 'featured-cars' : 'rentals');
  };

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Mesh */}
        <div className="gradient-mesh absolute inset-0" />

        {/* Decorative Circles */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-naija-100 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gold-100 rounded-full blur-3xl"
        />

        {/* Decorative Dots */}
        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-naija-400 rounded-full opacity-60" />
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-emerald-400 rounded-full opacity-40" />
        <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-gold-400 rounded-full opacity-30" />
      </div>

      {/* Content */}
      <div className="relative section-container pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-12rem)]">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-naija-50 border border-naija-300
                       rounded-full text-naija-700 text-sm font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              Nigeria's #1 Auto Marketplace
            </motion.div>

            {/* Headline */}
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="heading-display text-5xl md:text-6xl lg:text-7xl leading-tight"
              >
                Find Your
                <span className="block heading-naija">
                  Perfect Vehicle
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl md:text-2xl text-charcoal-600 max-w-xl leading-relaxed font-body"
              >
                Buy, sell, or rent <span className="font-bold text-charcoal-800">verified vehicles</span> from trusted dealers in <span className="font-bold text-naija-600">all 36 states</span>.
              </motion.p>
            </div>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="card-warm p-6 max-w-xl"
            >
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {[
                  { id: 'buy', label: 'Buy a Car', icon: Car },
                  { id: 'rent', label: 'Rent a Car', icon: Key },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                              transition-all duration-300 ${
                      searchFilters.type === tab.id
                        ? 'bg-naija-500 text-white shadow-button'
                        : 'text-charcoal-700 hover:bg-pearl-200'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Fields */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Make Dropdown */}
                <div className="relative">
                  <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                    Car Make
                  </label>
                  <div className="relative">
                    <select
                      value={searchFilters.make}
                      onChange={(e) => handleInputChange('make', e.target.value)}
                      className="select-warm pr-10"
                    >
                      <option value="">All Makes</option>
                      {carMakes.map((make) => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-600 pointer-events-none" />
                  </div>
                </div>

                {/* State Dropdown */}
                <div className="relative">
                  <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                    Location
                  </label>
                  <div className="relative">
                    <select
                      value={searchFilters.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="select-warm pr-10"
                    >
                      <option value="">All States</option>
                      {nigerianStates.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-600 pointer-events-none" />
                  </div>
                </div>

                {/* Price Range */}
                <div className="relative">
                  <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                    {searchFilters.type === 'rent' ? 'Budget/Day' : 'Price Range'}
                  </label>
                  <div className="relative">
                    <select
                      value={searchFilters.priceRange}
                      onChange={(e) => handleInputChange('priceRange', e.target.value)}
                      className="select-warm pr-10"
                    >
                      {searchFilters.type === 'rent' ? (
                        <>
                          <option value="">Any Budget</option>
                          <option value="0-50000">Under ₦50,000</option>
                          <option value="50000-100000">₦50k - ₦100k</option>
                          <option value="100000-200000">₦100k - ₦200k</option>
                          <option value="200000+">₦200k+</option>
                        </>
                      ) : (
                        <>
                          <option value="">Any Price</option>
                          <option value="0-10000000">Under ₦10M</option>
                          <option value="10000000-30000000">₦10M - ₦30M</option>
                          <option value="30000000-70000000">₦30M - ₦70M</option>
                          <option value="70000000+">₦70M+</option>
                        </>
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSearchClick}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-3 text-lg py-5 uppercase tracking-wide"
              >
                <Search className="w-6 h-6" />
                Search {formatNumber(stats.totalListings)}+ Vehicles
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap gap-10 pt-6"
            >
              {[
                { value: stats.verifiedDealers, label: 'Verified Dealers', sectionId: 'dealers' },
                { value: stats.happyCustomers, label: 'Happy Customers', sectionId: null },
                { value: stats.statesCovered, label: 'States Covered', sectionId: null },
              ].map((stat, index) => (
                <motion.button
                  key={index}
                  onClick={() => stat.sectionId && scrollToSection(stat.sectionId)}
                  whileHover={stat.sectionId ? { scale: 1.08, y: -2 } : {}}
                  className={`text-left ${stat.sectionId ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="text-4xl md:text-5xl font-display font-bold text-naija-500 leading-none">
                    {formatNumber(stat.value)}+
                  </div>
                  <div className="text-sm md:text-base text-charcoal-600 font-heading font-semibold uppercase tracking-wider mt-2">{stat.label}</div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Featured Car Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block relative"
          >
            {/* Main Car Image */}
            <div className="relative">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="rounded-4xl overflow-hidden shadow-warm-lg border border-naija-200">
                  <img
                    src="https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800"
                    alt="Featured Luxury Car"
                    className="w-full h-[520px] object-cover"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/40 via-transparent to-transparent" />
                </div>

                {/* Floating Card - Car Details */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => scrollToSection('featured-cars')}
                  className="absolute -left-6 bottom-24 bg-white rounded-2xl p-4 shadow-card-hover min-w-[220px] cursor-pointer border border-pearl-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-naija-50 rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6 text-naija-500" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-charcoal-800">Range Rover</div>
                      <div className="text-xs text-charcoal-600">Sport HSE 2023</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-naija-500 font-bold text-lg">₦95M</span>
                    <span className="verified-badge text-xs">
                      <span className="w-1.5 h-1.5 bg-naija-600 rounded-full"></span>
                      Verified
                    </span>
                  </div>
                </motion.div>

                {/* Floating Card - Rating */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute -right-4 top-16 bg-white rounded-2xl px-5 py-4 shadow-card-hover border border-pearl-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5 text-gold-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-charcoal-700">4.9</span>
                  </div>
                  <div className="text-xs text-charcoal-600 mt-1">28k+ Happy Customers</div>
                </motion.div>

                {/* Browse CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => scrollToSection('featured-cars')}
                  className="absolute bottom-8 right-8 flex items-center gap-2 bg-white/90 backdrop-blur-sm
                           text-charcoal-700 font-medium px-5 py-3 rounded-xl shadow-card hover:bg-white transition-all"
                >
                  Browse All Cars
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>

              {/* Background decorative elements */}
              <div className="absolute -inset-4 bg-gradient-radial from-naija-100/50 to-transparent blur-2xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom curved divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16">
          <path
            d="M0 80L60 74.7C120 69.3 240 58.7 360 53.3C480 48 600 48 720 53.3C840 58.7 960 69.3 1080 69.3C1200 69.3 1320 58.7 1380 53.3L1440 48V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
            fill="#FDF8F3"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
