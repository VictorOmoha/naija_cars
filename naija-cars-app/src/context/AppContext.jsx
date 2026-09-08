import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Modal states
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState('login');

  // Notification badge count — updated by NotificationsPage
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isListCarOpen, setIsListCarOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isValuationOpen, setIsValuationOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Compare tray — up to 3 cars, persists across listing pages
  const [compareList, setCompareList] = useState([]);

  // Search state
  const [searchFilters, setSearchFilters] = useState({
    type: 'buy',
    make: '',
    state: '',
    priceRange: '',
  });

  // Add toast notification
  const addToast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  }, []);

  // Remove toast
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Toggle a car in the compare tray (max 3)
  const toggleCompare = useCallback((car) => {
    setCompareList((prev) => {
      if (prev.some((c) => c.id === car.id)) {
        return prev.filter((c) => c.id !== car.id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, car];
    });
  }, []);

  const removeFromCompare = useCallback((carId) => {
    setCompareList((prev) => prev.filter((c) => c.id !== carId));
  }, []);

  const clearCompare = useCallback(() => setCompareList([]), []);

  // Open Quick View
  const openQuickView = useCallback((car) => {
    setSelectedCar(car);
    setIsQuickViewOpen(true);
  }, []);

  // Close Quick View
  const closeQuickView = useCallback(() => {
    setIsQuickViewOpen(false);
    setSelectedCar(null);
  }, []);

  // Open auth modal with a specific mode ('login' | 'register')
  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModalInitialMode(mode);
    setIsSignInOpen(true);
  }, []);

  // Scroll to section
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Handle search
  const handleSearch = useCallback(() => {
    const { type, make, state, priceRange } = searchFilters;
    let message = `Searching for ${type === 'buy' ? 'cars to buy' : 'cars to rent'}`;
    if (make) message += ` - ${make}`;
    if (state) message += ` in ${state}`;
    if (priceRange) message += ` (${priceRange})`;
    addToast(message, 'info');
    scrollToSection(type === 'buy' ? 'featured-cars' : 'rentals');
  }, [searchFilters, addToast, scrollToSection]);

  const value = {
    // Modals
    isSignInOpen,
    setIsSignInOpen,
    authModalInitialMode,
    openAuthModal,
    // Notifications
    unreadNotificationCount,
    setUnreadNotificationCount,
    isListCarOpen,
    setIsListCarOpen,
    isQuickViewOpen,
    selectedCar,
    openQuickView,
    closeQuickView,
    isValuationOpen,
    setIsValuationOpen,
    // Toasts
    toasts,
    addToast,
    removeToast,
    // Compare
    compareList,
    toggleCompare,
    removeFromCompare,
    clearCompare,
    // Search
    searchFilters,
    setSearchFilters,
    handleSearch,
    // Navigation
    scrollToSection,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
