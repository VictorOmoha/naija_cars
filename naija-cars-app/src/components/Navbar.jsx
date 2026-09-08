import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Menu, X, ChevronDown, User, Heart, Bell,
  LayoutDashboard, LogOut, MessageCircle, HelpCircle, Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import useAuthStore from '../stores/authStore';

// City counts shown in the ticker strip (marketing figures)
const TICKER_ITEMS = [
  'LAGOS 6,204 CARS',
  'ABUJA 3,118',
  'PORT HARCOURT 1,442',
  'IBADAN 986',
  'KANO 688',
];

const NAV_LINKS = [
  { name: 'Buy', href: '/cars' },
  { name: 'Rent', href: '/rent' },
  { name: 'Sell', href: '/sell' },
  { name: 'Financing', href: '/pricing' },
];

// Wordmark: "Naija" green, "Cars" ink, "." amber
export const Logo = ({ className = 'text-[21px]' }) => (
  <span className={`font-black uppercase tracking-[-0.03em] leading-none text-ink ${className}`}>
    <span className="text-brand">Naija</span>Cars<span className="text-amber">.</span>
  </span>
);

const Ticker = () => (
  <div className="ticker-1b py-2 px-4 md:px-9">
    <div className="ticker-track flex gap-7 w-max">
      {[0, 1].map((copy) => (
        <div key={copy} className="flex gap-7" aria-hidden={copy === 1}>
          {TICKER_ITEMS.map((item) => (
            <span key={item} className="flex gap-7">
              <span>{item}</span>
              <span>·</span>
            </span>
          ))}
          <span className="text-amber">FINANCING FROM 20% DOWN</span>
          <span className="pr-7">·</span>
        </div>
      ))}
    </div>
  </div>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsSignInOpen, unreadNotificationCount } = useApp();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Transparent at page top so the hero car cutout can pop out behind the nav
  // row; opaque once sticky engages and content scrolls beneath.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const isActive = (href) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  return (
    // Fragment (not a wrapper element) so the sticky nav can pin to the
    // viewport for the whole page, while the ticker scrolls away.
    <>
      <Ticker />

      <nav className={`sticky top-0 z-40 transition-colors duration-200 ${isScrolled ? 'bg-paper' : 'bg-transparent'}`}>
        <div className="flex items-center justify-between px-4 md:px-9 py-4 border-b-2 border-ink">
          {/* Logo */}
          <Link to="/" aria-label="NaijaCars home">
            <Logo className="text-[19px] md:text-[21px]" />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-[26px] text-sm font-bold">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`pb-0.5 border-b-[3px] transition-colors hover:border-brand ${
                  isActive(link.href) ? 'border-brand' : 'border-transparent'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && (
              <>
                <Link
                  to="/favorites"
                  title="Saved cars"
                  className="p-2 rounded-full hover:bg-greentint transition-colors"
                >
                  <Heart className="w-5 h-5" />
                </Link>
                <Link
                  to="/messages"
                  title="Messages"
                  className="relative p-2 rounded-full hover:bg-greentint transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-brand text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/notifications?filter=all"
                  title="Notifications"
                  className="relative p-2 rounded-full hover:bg-greentint transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-amber text-ink text-[10px] font-extrabold rounded-full flex items-center justify-center">
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="btn-pill-outline text-[13px] px-4 py-2"
                >
                  <span className="w-6 h-6 -ml-1 bg-brand text-white rounded-full flex items-center justify-center text-[11px] font-black">
                    {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                  {user?.profile?.firstName || 'Account'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-3 w-60 bg-white border-2 border-ink rounded-2xl shadow-hard-sm overflow-hidden"
                    >
                      <div className="p-3.5 border-b-2 border-hairline">
                        <p className="font-extrabold text-sm">
                          {user?.profile?.firstName} {user?.profile?.lastName}
                        </p>
                        <p className="text-xs font-semibold text-muted truncate">{user?.email}</p>
                      </div>
                      <div className="py-1.5 text-[13px] font-bold">
                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 hover:bg-greentint transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-greentint transition-colors">
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                        <Link to="/favorites" className="flex items-center gap-3 px-4 py-2.5 hover:bg-greentint transition-colors">
                          <Heart className="w-4 h-4" /> Saved Cars
                        </Link>
                        <Link to="/help" className="flex items-center gap-3 px-4 py-2.5 hover:bg-greentint transition-colors">
                          <HelpCircle className="w-4 h-4" /> Help Center
                        </Link>
                        {user?.userType === 'ADMIN' && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-greentint transition-colors">
                            <Shield className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                      </div>
                      <div className="border-t-2 border-hairline py-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-[13px] font-bold text-warntext hover:bg-amber-tint transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsSignInOpen(true)}
                className="btn-pill-outline text-[13px] px-[18px] py-[9px]"
              >
                Sign in
              </button>
            )}

            <Link to="/sell" className="btn-pill-amber text-sm px-5 py-[11px]">
              Sell am fast →
            </Link>
          </div>

          {/* Mobile actions */}
          <div className="lg:hidden flex items-center gap-2">
            <Link to="/sell" className="btn-pill-amber text-xs px-3.5 py-2">
              Sell am fast →
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center w-10 h-10"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden bg-paper border-b-2 border-ink"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`block px-3 py-3 rounded-xl font-extrabold text-[15px] ${
                      isActive(link.href) ? 'bg-greentint text-brand' : 'hover:bg-greentint'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link to="/dealers" className="block px-3 py-3 rounded-xl font-bold text-[15px] hover:bg-greentint">
                  Dealers
                </Link>
                <Link to="/valuation" className="block px-3 py-3 rounded-xl font-bold text-[15px] hover:bg-greentint">
                  Car Valuation
                </Link>

                {isAuthenticated && (
                  <>
                    <div className="border-t-2 border-hairline my-2" />
                    <Link to="/dashboard" className="block px-3 py-3 rounded-xl font-bold text-[15px] hover:bg-greentint">
                      Dashboard
                    </Link>
                    <Link to="/profile" className="block px-3 py-3 rounded-xl font-bold text-[15px] hover:bg-greentint">
                      My Profile
                    </Link>
                    <Link to="/favorites" className="block px-3 py-3 rounded-xl font-bold text-[15px] hover:bg-greentint">
                      Saved Cars
                    </Link>
                    <Link to="/messages" className="flex items-center justify-between px-3 py-3 rounded-xl font-bold text-[15px] hover:bg-greentint">
                      Messages
                      {unreadNotificationCount > 0 && (
                        <span className="min-w-[20px] h-5 px-1 bg-brand text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                          {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                        </span>
                      )}
                    </Link>
                    <Link to="/notifications?filter=all" className="block px-3 py-3 rounded-xl font-bold text-[15px] hover:bg-greentint">
                      Notifications
                    </Link>
                  </>
                )}

                <div className="border-t-2 border-hairline my-2" />
                <div className="pt-2 pb-1 space-y-2.5">
                  {isAuthenticated ? (
                    <button onClick={handleLogout} className="btn-pill-outline w-full py-3 text-sm">
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsSignInOpen(true);
                      }}
                      className="btn-pill-outline w-full py-3 text-sm"
                    >
                      Sign in
                    </button>
                  )}
                  <Link to="/sell" className="btn-pill-amber w-full py-3.5 text-sm">
                    Sell am fast →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
