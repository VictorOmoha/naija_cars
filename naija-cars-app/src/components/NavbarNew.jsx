import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Car, Key, Search, User, Heart, Crown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const NavbarNew = () => {
  const { setIsSignInOpen, setIsListCarOpen, favorites, scrollToSection, addToast } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    {
      name: 'Buy Cars',
      sectionId: 'featured-cars',
      icon: Car,
      dropdown: [
        { name: 'Browse All Cars', sectionId: 'featured-cars' },
        { name: 'Foreign Used', sectionId: 'featured-cars', filter: 'foreign' },
        { name: 'Nigerian Used', sectionId: 'featured-cars', filter: 'nigerian' },
        { name: 'Brand New', sectionId: 'featured-cars', filter: 'new' },
      ]
    },
    {
      name: 'Rent Cars',
      sectionId: 'rentals',
      icon: Key,
      dropdown: [
        { name: 'Daily Rentals', sectionId: 'rentals' },
        { name: 'Weekly Deals', sectionId: 'rentals' },
        { name: 'Corporate Rentals', sectionId: 'rentals' },
        { name: 'Chauffeur Service', sectionId: 'rentals' },
      ]
    },
    { name: 'Sell Your Car', action: 'listCar' },
    { name: 'Car Valuation', sectionId: 'valuation' },
    { name: 'Dealers', sectionId: 'dealers' },
  ];

  const handleNavClick = (link, e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (link.action === 'listCar') {
      setIsListCarOpen(true);
    } else if (link.sectionId) {
      scrollToSection(link.sectionId);
    }
  };

  const handleDropdownClick = (item, e) => {
    e.preventDefault();
    setActiveDropdown(null);

    if (item.filter) {
      addToast(`Filtering by: ${item.name}`, 'info');
    }
    if (item.sectionId) {
      scrollToSection(item.sectionId);
    }
  };

  const handleSearchClick = () => {
    scrollToSection('hero');
    addToast('Use the search form below to find your car', 'info');
  };

  const handleFavoritesClick = () => {
    if (favorites.length === 0) {
      addToast('No favorites yet. Click the heart on any car to save it!', 'info');
    } else {
      addToast(`You have ${favorites.length} favorite${favorites.length > 1 ? 's' : ''}`, 'info');
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass-luxury shadow-obsidian-deep py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between">
          {/* Logo - Afro-Futuristic */}
          <motion.button
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-3 group relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              {/* Animated Border Glow */}
              <div className="absolute inset-0 bg-gradient-luxury opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />

              {/* Logo Container */}
              <div className="relative flex items-center gap-3 px-6 py-3 bg-gradient-obsidian border-2 border-gold-500">
                <Crown className="w-8 h-8 text-gold-400" />
                <div>
                  <div className="font-display text-2xl font-black text-gold-400 uppercase leading-none tracking-wider">
                    NAIJA
                  </div>
                  <div className="font-display text-xs text-pearl-400 uppercase tracking-widest">
                    CARS
                  </div>
                </div>
              </div>
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={(e) => handleNavClick(link, e)}
                  className="flex items-center gap-2 px-5 py-3 text-sm font-heading font-bold text-pearl-200
                           hover:text-gold-400 transition-colors duration-300 group uppercase tracking-wide relative"
                >
                  <span className="relative z-10">{link.name}</span>
                  {link.dropdown && (
                    <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180 relative z-10" />
                  )}

                  {/* Hover Underline Effect */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-luxury"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {link.dropdown && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-charcoal-600
                               border-2 border-gold-500/50 shadow-luxury-lg overflow-hidden"
                    >
                      <div className="py-2">
                        {link.dropdown.map((item, index) => (
                          <motion.button
                            key={item.name}
                            onClick={(e) => handleDropdownClick(item, e)}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="block w-full text-left px-6 py-3 text-sm text-pearl-300 hover:text-gold-400
                                     hover:bg-charcoal-500 transition-all duration-300 font-medium"
                          >
                            {item.name}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSearchClick}
              className="p-3 text-pearl-300 hover:text-gold-400 hover:bg-charcoal-600
                       border border-transparent hover:border-gold-500/30 transition-all duration-300"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoritesClick}
              className="p-3 text-pearl-300 hover:text-gold-400 hover:bg-charcoal-600
                       border border-transparent hover:border-gold-500/30 transition-all duration-300 relative"
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-luxury
                           text-charcoal-700 text-[10px] font-black flex items-center justify-center"
                >
                  {favorites.length}
                </motion.span>
              )}
            </motion.button>

            <div className="w-px h-8 bg-gold-500/30 mx-2" />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSignInOpen(true)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-pearl-200
                       border-2 border-emerald-500 hover:bg-emerald-600 hover:text-gold-400
                       transition-all duration-300 uppercase tracking-wider"
            >
              <User className="w-4 h-4" />
              Sign In
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsListCarOpen(true)}
              className="relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-emerald opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative btn-primary px-8 py-3 text-sm">
                List Your Car
              </div>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-3 text-pearl-300 hover:bg-charcoal-600 border-2 border-gold-500/30 hover:border-gold-500 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden mt-4 pb-4 border-t-2 border-gold-500/30"
            >
              <div className="pt-4 space-y-2">
                {navLinks.map((link) => (
                  <motion.button
                    key={link.name}
                    onClick={(e) => handleNavClick(link, e)}
                    whileHover={{ x: 4 }}
                    className="block w-full text-left px-6 py-3 text-pearl-300 hover:text-gold-400
                             hover:bg-charcoal-600 border-l-2 border-transparent hover:border-gold-500
                             transition-all font-bold uppercase tracking-wide"
                  >
                    {link.name}
                  </motion.button>
                ))}

                {/* Mobile Quick Actions */}
                <div className="pt-4 px-4 flex gap-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      scrollToSection('featured-cars');
                    }}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-pearl-200 border-2 border-gold-500/30
                             hover:border-gold-500 hover:bg-charcoal-600 transition-all"
                  >
                    <Search className="w-5 h-5" />
                    <span className="text-sm font-bold">Search</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      window.location.href = '/favorites';
                    }}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-pearl-200 border-2 border-gold-500/30
                             hover:border-gold-500 hover:bg-charcoal-600 transition-all relative"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-bold">Favorites</span>
                    {favorites.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="pt-3 space-y-3 px-4">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSignInOpen(true);
                    }}
                    className="w-full py-3 text-pearl-200 border-2 border-emerald-500
                             hover:bg-emerald-600 transition-all font-bold uppercase tracking-wide"
                  >
                    Sign In
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsListCarOpen(true);
                    }}
                    className="w-full btn-primary py-3"
                  >
                    List Your Car
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default NavbarNew;
