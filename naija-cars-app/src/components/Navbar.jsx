import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ChevronDown, Car, Key, Search, User, Heart, Bell,
  LayoutDashboard, LogOut, MessageCircle, HelpCircle, Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import useAuthStore from '../stores/authStore';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsSignInOpen, setIsListCarOpen, scrollToSection, addToast, unreadNotificationCount } = useApp();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const navLinks = [
    {
      name: 'Buy Cars',
      href: '/cars',
      icon: Car,
      dropdown: [
        { name: 'Browse All Cars', href: '/cars' },
        { name: 'Foreign Used', href: '/cars?condition=foreign' },
        { name: 'Nigerian Used', href: '/cars?condition=nigerian' },
        { name: 'Brand New', href: '/cars?condition=new' },
      ]
    },
    {
      name: 'Rent Cars',
      href: '/rent',
      icon: Key,
      dropdown: [
        { name: 'All Rentals', href: '/rent' },
        { name: 'Daily Rentals', href: '/rent?period=daily' },
        { name: 'Weekly Deals', href: '/rent?period=weekly' },
        { name: 'Corporate Rentals', href: '/rent?period=corporate' },
      ]
    },
    { name: 'Sell Your Car', href: '/sell' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Car Valuation', href: '/valuation' },
    { name: 'Dealers', href: '/dealers' },
  ];

  const handleNavClick = (link, e) => {
    if (link.action === 'listCar') {
      e.preventDefault();
      setIsListCarOpen(true);
    } else if (link.href) {
      // Let the Link handle it
    } else if (link.sectionId) {
      e.preventDefault();
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => scrollToSection(link.sectionId), 100);
      } else {
        scrollToSection(link.sectionId);
      }
    }
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
    navigate('/');
    setShowUserMenu(false);
  };

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      scrollToSection('hero');
    } else {
      navigate('/');
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg py-3'
        : 'bg-white/80 backdrop-blur-sm py-5'
        }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.button
            onClick={handleLogoClick}
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src="/logo.png?v=3"
              alt="Naija Cars"
              className="h-14 w-auto object-contain drop-shadow-sm"
            />
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {link.href ? (
                  <Link
                    to={link.href}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-heading font-bold text-charcoal-700
                             hover:text-naija-500 transition-colors duration-300 group uppercase tracking-wide"
                  >
                    {link.name}
                    {link.dropdown && (
                      <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={(e) => handleNavClick(link, e)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-heading font-bold text-charcoal-700
                             hover:text-naija-500 transition-colors duration-300 group uppercase tracking-wide"
                  >
                    {link.name}
                  </button>
                )}

                {/* Dropdown */}
                <AnimatePresence>
                  {link.dropdown && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white
                               border border-pearl-300 rounded-2xl shadow-card-hover overflow-hidden"
                    >
                      <div className="py-2">
                        {link.dropdown.map((item, index) => (
                          <motion.div key={item.name}>
                            <Link
                              to={item.href}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="block w-full text-left px-4 py-3 text-sm text-charcoal-600 hover:text-naija-500
                                       hover:bg-pearl-100 transition-all duration-300"
                            >
                              {item.name}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden xl:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/cars')}
              className="p-2.5 text-charcoal-700 hover:text-naija-500 hover:bg-pearl-200 rounded-xl transition-all"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            <Link to="/favorites">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 text-charcoal-700 hover:text-naija-500 hover:bg-pearl-200 rounded-xl transition-all relative"
              >
                <Heart className="w-5 h-5" />
              </motion.div>
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/messages">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 text-charcoal-700 hover:text-naija-500 hover:bg-pearl-200 rounded-xl transition-all relative"
                    title="Messages"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-naija-500 text-white
                                     text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                      </span>
                    )}
                  </motion.div>
                </Link>

                <Link to="/notifications">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 text-charcoal-700 hover:text-naija-500 hover:bg-pearl-200 rounded-xl transition-all relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white
                                     text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                      </span>
                    )}
                  </motion.div>
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-charcoal-700
                             border border-pearl-400 rounded-xl hover:border-naija-300 hover:text-naija-500 transition-all"
                  >
                    <div className="w-7 h-7 bg-naija-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                      {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden xl:block">{user?.profile?.firstName || 'Account'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white border border-pearl-300 rounded-2xl shadow-card-hover overflow-hidden"
                      >
                        <div className="p-3 border-b border-pearl-200">
                          <p className="font-medium text-charcoal-800">
                            {user?.profile?.firstName} {user?.profile?.lastName}
                          </p>
                          <p className="text-sm text-charcoal-500 truncate">{user?.email}</p>
                        </div>
                        <div className="py-2">
                          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-charcoal-600 hover:text-naija-500 hover:bg-pearl-100 transition-colors">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-charcoal-600 hover:text-naija-500 hover:bg-pearl-100 transition-colors">
                            <User className="w-4 h-4" />
                            My Profile
                          </Link>
                          <Link to="/messages" className="flex items-center justify-between gap-3 px-4 py-2.5 text-charcoal-600 hover:text-naija-500 hover:bg-pearl-100 transition-colors">
                            <span className="flex items-center gap-3">
                              <MessageCircle className="w-4 h-4" />
                              Messages
                            </span>
                            {unreadNotificationCount > 0 && (
                              <span className="min-w-[20px] h-5 px-1 bg-naija-500 text-white
                                             text-[10px] font-bold rounded-full flex items-center justify-center">
                                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                              </span>
                            )}
                          </Link>
                          <Link to="/favorites" className="flex items-center gap-3 px-4 py-2.5 text-charcoal-600 hover:text-naija-500 hover:bg-pearl-100 transition-colors">
                            <Heart className="w-4 h-4" />
                            Saved Cars
                          </Link>
                          <Link to="/help" className="flex items-center gap-3 px-4 py-2.5 text-charcoal-600 hover:text-naija-500 hover:bg-pearl-100 transition-colors">
                            <HelpCircle className="w-4 h-4" />
                            Help Center
                          </Link>
                          {user?.userType === 'ADMIN' && (
                            <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-charcoal-600 hover:text-naija-500 hover:bg-pearl-100 transition-colors">
                              <Shield className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-pearl-200 py-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsSignInOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-charcoal-700
                         border border-pearl-400 rounded-xl hover:border-naija-300 hover:text-naija-500 transition-all"
              >
                <User className="w-4 h-4" />
                Sign In
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsListCarOpen(true)}
              className="btn-primary px-6 py-2.5 text-sm rounded-xl"
            >
              List Your Car
            </motion.button>
          </div>

          {/* Mobile Actions */}
          <div className="xl:hidden flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsListCarOpen(true)}
              className="inline-flex h-12 items-center justify-center gap-2 px-3 sm:px-4 bg-naija-500 text-white
                       text-sm font-semibold rounded-xl shadow-sm hover:bg-naija-600 transition-colors"
              aria-label="List your car"
            >
              <Car className="w-4 h-4" />
              <span>List</span>
              <span className="hidden sm:inline">Your Car</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center w-12 h-12 text-charcoal-700 hover:bg-pearl-200 rounded-xl transition-colors border border-pearl-300"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="xl:hidden mt-4 pb-4 border-t border-pearl-300"
            >
              <div className="pt-4 space-y-1">
                {navLinks.map((link) => (
                  link.href ? (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="block w-full text-left px-4 py-3 text-charcoal-700 hover:text-naija-500
                               hover:bg-pearl-100 rounded-xl transition-colors font-medium"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <button
                      key={link.name}
                      onClick={(e) => handleNavClick(link, e)}
                      className="block w-full text-left px-4 py-3 text-charcoal-700 hover:text-naija-500
                               hover:bg-pearl-100 rounded-xl transition-colors font-medium"
                    >
                      {link.name}
                    </button>
                  )
                ))}

                {isAuthenticated && (
                  <>
                    <div className="border-t border-pearl-200 my-3" />
                    <Link to="/dashboard" className="block px-4 py-3 text-charcoal-700 hover:text-naija-500 hover:bg-pearl-100 rounded-xl font-medium">
                      Dashboard
                    </Link>
                    <Link to="/profile" className="block px-4 py-3 text-charcoal-700 hover:text-naija-500 hover:bg-pearl-100 rounded-xl font-medium">
                      My Profile
                    </Link>
                    <Link to="/favorites" className="block px-4 py-3 text-charcoal-700 hover:text-naija-500 hover:bg-pearl-100 rounded-xl font-medium">
                      Saved Cars
                    </Link>
                    <Link to="/notifications" className="flex items-center justify-between px-4 py-3 text-charcoal-700 hover:text-naija-500 hover:bg-pearl-100 rounded-xl font-medium">
                      <span>Notifications</span>
                      {unreadNotificationCount > 0 && (
                        <span className="min-w-[22px] h-5 px-1 bg-red-500 text-white
                                       text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                        </span>
                      )}
                    </Link>
                    <Link to="/messages" className="flex items-center justify-between px-4 py-3 text-charcoal-700 hover:text-naija-500 hover:bg-pearl-100 rounded-xl font-medium">
                      <span>Messages</span>
                      {unreadNotificationCount > 0 && (
                        <span className="min-w-[22px] h-5 px-1 bg-naija-500 text-white
                                       text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                <div className="border-t border-pearl-200 my-3" />
                <Link to="/help" className="block px-4 py-3 text-charcoal-700 hover:text-naija-500 hover:bg-pearl-100 rounded-xl font-medium">
                  Help Center
                </Link>
                <Link to="/about" className="block px-4 py-3 text-charcoal-700 hover:text-naija-500 hover:bg-pearl-100 rounded-xl font-medium">
                  About Us
                </Link>
                <Link to="/contact" className="block px-4 py-3 text-charcoal-700 hover:text-naija-500 hover:bg-pearl-100 rounded-xl font-medium">
                  Contact
                </Link>

                <div className="pt-4 space-y-3 px-4">
                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="w-full py-3 text-red-600 border border-red-300
                               rounded-xl hover:bg-red-50 transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsSignInOpen(true);
                      }}
                      className="w-full py-3 text-charcoal-700 border border-pearl-400
                               rounded-xl hover:border-naija-300 transition-colors font-medium"
                    >
                      Sign In
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsListCarOpen(true);
                    }}
                    className="btn-primary w-full py-3 rounded-xl"
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

export default Navbar;
