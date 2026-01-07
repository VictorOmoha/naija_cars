import { motion } from 'framer-motion';
import { Search, MapPin, ChevronDown, Car, Key, Sparkles, ArrowRight, Star } from 'lucide-react';
import { nigerianStates, carMakes, stats } from '../data/cars';
import { useApp } from '../context/AppContext';

const HeroNew = () => {
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
    <section id="hero" className="relative min-h-screen overflow-hidden bg-gradient-obsidian">
      {/* African Pattern Overlay */}
      <div className="african-pattern-overlay" />

      {/* Geometric Pattern Background */}
      <div className="absolute inset-0 geometric-pattern" />

      {/* Dramatic Radial Gradients */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/3 right-0 w-[1000px] h-[1000px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
          }}
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -left-1/4 w-[1200px] h-[1200px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(10, 95, 62, 0.2) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Main Content Container - Asymmetric Grid */}
      <div className="relative section-container pt-32 pb-24">
        <div className="min-h-[calc(100vh-12rem)]">
          {/* Top Section - Headline & Badge */}
          <div className="grid lg:grid-cols-12 gap-12 items-start mb-16">
            {/* Left Column - Takes 7 columns */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="lg:col-span-7 space-y-10"
            >
              {/* Premium Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="inline-block"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-luxury opacity-75 blur-xl group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative px-8 py-3 bg-charcoal-600 border-2 border-gold-500 clip-path-diagonal">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-gold-400 fill-gold-400 animate-pulse" />
                      <span className="font-display text-gold-400 text-sm uppercase tracking-widest font-bold">
                        Nigeria's Premier Auto Marketplace
                      </span>
                      <Star className="w-5 h-5 text-gold-400 fill-gold-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Massive Headline - Afro-Futuristic Style */}
              <div className="space-y-6">
                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="relative"
                >
                  <span className="block font-display text-7xl sm:text-8xl lg:text-9xl xl:text-[10rem] font-black leading-[0.85] uppercase">
                    <span className="block text-gradient-luxury">DRIVE</span>
                    <span className="block text-pearl-50">YOUR</span>
                    <span className="block relative inline-block">
                      <span className="text-gold-400">POWER</span>
                      <motion.div
                        animate={{
                          scaleX: [0, 1],
                        }}
                        transition={{ duration: 1.5, delay: 1.5 }}
                        className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-luxury"
                        style={{ transformOrigin: 'left' }}
                      />
                    </span>
                  </span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="max-w-2xl"
                >
                  <p className="font-serif text-2xl md:text-3xl text-gold-300 italic leading-relaxed">
                    "Where Nigerian dreams meet automotive excellence"
                  </p>
                  <p className="mt-4 text-lg md:text-xl text-pearl-400 font-body">
                    Discover <span className="text-emerald-400 font-bold">{formatNumber(stats.totalListings)}+</span> verified vehicles from
                    <span className="text-gold-400 font-bold"> {stats.verifiedDealers}+ trusted dealers</span> across all 36 states.
                  </p>
                </motion.div>
              </div>

              {/* Stats Bar - Horizontal */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="flex flex-wrap gap-12 pt-8 border-t-2 border-gold-500/30"
              >
                {[
                  { value: stats.totalListings, label: 'Premium Vehicles', icon: Car },
                  { value: stats.verifiedDealers, label: 'Verified Dealers', icon: Sparkles },
                  { value: stats.statesCovered, label: 'States Nationwide', icon: MapPin },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                    className="group relative"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-luxury flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <stat.icon className="w-7 h-7 text-charcoal-700" />
                      </div>
                      <div>
                        <div className="font-display text-4xl md:text-5xl text-gold-400 font-black leading-none">
                          {formatNumber(stat.value)}+
                        </div>
                        <div className="text-sm text-pearl-400 uppercase tracking-wider font-bold mt-1">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column - Featured Car Visual - Takes 5 columns */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative">
                {/* Main Car Image with Border Animation */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="relative border border-naija-200-luxury"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800"
                      alt="Luxury Vehicle"
                      className="w-full h-[600px] object-cover"
                    />
                    {/* Dramatic Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-obsidian-900/40 via-transparent to-emerald-900/40" />

                    {/* Price Tag - Floating */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5, duration: 0.6, type: "spring" }}
                      className="absolute top-8 right-8 bg-gradient-luxury px-8 py-4 clip-path-diagonal"
                    >
                      <div className="text-center">
                        <div className="text-xs text-charcoal-700 font-black uppercase tracking-widest">From</div>
                        <div className="text-3xl font-display font-black text-charcoal-700">₦5M</div>
                      </div>
                    </motion.div>

                    {/* Verified Badge */}
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.8, duration: 0.6 }}
                      className="absolute bottom-8 right-8"
                    >
                      <div className="verified-badge">
                        <Sparkles className="w-4 h-4" />
                        100% Verified
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute -inset-8 bg-gradient-radial from-gold-500/20 to-transparent blur-3xl -z-10" />
              </div>
            </motion.div>
          </div>

          {/* Bottom Section - Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="relative"
          >
            <div className="relative max-w-6xl mx-auto">
              {/* Dramatic Background Glow */}
              <div className="absolute inset-0 bg-gradient-luxury opacity-20 blur-3xl" />

              <div className="relative glass-luxury p-8 md:p-10 border border-naija-200-luxury">
                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                  {[
                    { id: 'buy', label: 'Buy Vehicle', icon: Car },
                    { id: 'rent', label: 'Rent Vehicle', icon: Key },
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-3 px-8 py-4 font-display text-sm uppercase tracking-widest font-bold
                                transition-all duration-500 ${
                        searchFilters.type === tab.id
                          ? 'bg-gradient-luxury text-charcoal-700 shadow-luxury-lg'
                          : 'bg-charcoal-600 text-gold-400 border-2 border-gold-500/30 hover:border-gold-500'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </motion.button>
                  ))}
                </div>

                {/* Search Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Make */}
                  <div>
                    <label className="block text-xs text-gold-400 mb-3 font-black uppercase tracking-widest">
                      Car Make
                    </label>
                    <div className="relative">
                      <select
                        value={searchFilters.make}
                        onChange={(e) => handleInputChange('make', e.target.value)}
                        className="input-luxury w-full"
                      >
                        <option value="">All Makes</option>
                        {carMakes.map((make) => (
                          <option key={make} value={make}>{make}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs text-gold-400 mb-3 font-black uppercase tracking-widest">
                      Location
                    </label>
                    <div className="relative">
                      <select
                        value={searchFilters.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="input-luxury w-full"
                      >
                        <option value="">All States</option>
                        {nigerianStates.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs text-gold-400 mb-3 font-black uppercase tracking-widest">
                      {searchFilters.type === 'rent' ? 'Budget/Day' : 'Price Range'}
                    </label>
                    <div className="relative">
                      <select
                        value={searchFilters.priceRange}
                        onChange={(e) => handleInputChange('priceRange', e.target.value)}
                        className="input-luxury w-full"
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
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Search Button - BOLD */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSearchClick}
                  className="w-full group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-emerald opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative btn-primary flex items-center justify-center gap-4 py-6">
                    <Search className="w-7 h-7 group-hover:rotate-90 transition-transform duration-500" />
                    <span className="text-xl">
                      Search {formatNumber(stats.totalListings)}+ Vehicles
                    </span>
                    <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform duration-500" />
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroNew;
