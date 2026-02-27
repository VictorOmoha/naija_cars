import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Calendar, MapPin, Clock, Shield, Star, Heart, Filter,
  Search, Users, Fuel, Settings, Phone, MessageCircle,
  CheckCircle, ArrowRight, Sparkles, X, Briefcase, Award,
  ChevronDown, Grid, List, SlidersHorizontal, Building2, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { listingsAPI } from '../services/api';
import useAuthStore from '../stores/authStore';

const RentCarsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useApp();
  const { isAuthenticated } = useAuthStore();

  // Get filter values from URL params
  const [filters, setFilters] = useState({
    period: searchParams.get('period') || '',
    service: searchParams.get('service') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    priceRange: searchParams.get('priceRange') || '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  // Update filters when URL params change
  useEffect(() => {
    setFilters({
      period: searchParams.get('period') || '',
      service: searchParams.get('service') || '',
      category: searchParams.get('category') || '',
      location: searchParams.get('location') || '',
      priceRange: searchParams.get('priceRange') || '',
    });
  }, [searchParams]);

  const categories = [
    { id: 'all', name: 'All Cars', icon: Car },
    { id: 'economy', name: 'Economy', icon: Fuel },
    { id: 'suv', name: 'SUV', icon: Car },
    { id: 'luxury', name: 'Luxury', icon: Sparkles },
    { id: 'van', name: 'Vans', icon: Users },
    { id: 'executive', name: 'Executive', icon: Briefcase },
  ];

  const rentalPeriods = [
    { id: '', name: 'All Rentals' },
    { id: 'daily', name: 'Daily Rentals' },
    { id: 'weekly', name: 'Weekly Deals' },
    { id: 'monthly', name: 'Monthly Plans' },
    { id: 'corporate', name: 'Corporate Rentals' },
  ];

  const locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu'];

  const rentalCars = [
    // Economy Cars
    {
      id: 101,
      name: 'Toyota Corolla 2023',
      category: 'economy',
      image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=600',
      dailyRate: 25000,
      weeklyRate: 150000,
      monthlyRate: 500000,
      corporateRate: 450000,
      seats: 5,
      transmission: 'Automatic',
      fuel: 'Petrol',
      location: 'Lagos',
      rating: 4.8,
      reviews: 124,
      available: true,
      chauffeurAvailable: true,
      features: ['AC', 'Bluetooth', 'USB Charging', 'Backup Camera'],
      dealer: 'Premium Auto Rentals',
      featured: true,
      weeklyDeal: true,
    },
    {
      id: 102,
      name: 'Honda Civic 2022',
      category: 'economy',
      image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=600',
      dailyRate: 28000,
      weeklyRate: 170000,
      monthlyRate: 580000,
      corporateRate: 520000,
      seats: 5,
      transmission: 'Automatic',
      fuel: 'Petrol',
      location: 'Abuja',
      rating: 4.7,
      reviews: 98,
      available: true,
      chauffeurAvailable: false,
      features: ['AC', 'Apple CarPlay', 'Lane Assist', 'Cruise Control'],
      dealer: 'Capital Motors Abuja',
      featured: false,
      weeklyDeal: false,
    },
    {
      id: 103,
      name: 'Hyundai Elantra 2023',
      category: 'economy',
      image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600',
      dailyRate: 22000,
      weeklyRate: 130000,
      monthlyRate: 450000,
      corporateRate: 400000,
      seats: 5,
      transmission: 'Automatic',
      fuel: 'Petrol',
      location: 'Lagos',
      rating: 4.6,
      reviews: 67,
      available: true,
      chauffeurAvailable: true,
      features: ['AC', 'Bluetooth', 'Rear Camera', 'Keyless Entry'],
      dealer: 'Hyundai Lagos Rentals',
      featured: false,
      weeklyDeal: true,
    },
    // SUVs
    {
      id: 104,
      name: 'Honda CR-V 2022',
      category: 'suv',
      image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=600',
      dailyRate: 45000,
      weeklyRate: 280000,
      monthlyRate: 950000,
      corporateRate: 850000,
      seats: 5,
      transmission: 'Automatic',
      fuel: 'Petrol',
      location: 'Lagos',
      rating: 4.9,
      reviews: 89,
      available: true,
      chauffeurAvailable: true,
      features: ['AC', 'Sunroof', 'Leather Seats', 'Navigation'],
      dealer: 'AutoKing Rentals',
      featured: true,
      weeklyDeal: false,
    },
    {
      id: 105,
      name: 'Toyota Highlander 2023',
      category: 'suv',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600',
      dailyRate: 55000,
      weeklyRate: 340000,
      monthlyRate: 1100000,
      corporateRate: 950000,
      seats: 7,
      transmission: 'Automatic',
      fuel: 'Petrol',
      location: 'Abuja',
      rating: 4.8,
      reviews: 112,
      available: true,
      chauffeurAvailable: true,
      features: ['AC', '3rd Row Seating', 'Premium Audio', 'Safety Suite'],
      dealer: 'Elite Motors Abuja',
      featured: true,
      weeklyDeal: true,
    },
    {
      id: 106,
      name: 'Kia Sportage 2023',
      category: 'suv',
      image: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=600',
      dailyRate: 40000,
      weeklyRate: 240000,
      monthlyRate: 850000,
      corporateRate: 750000,
      seats: 5,
      transmission: 'Automatic',
      fuel: 'Petrol',
      location: 'Port Harcourt',
      rating: 4.6,
      reviews: 45,
      available: true,
      chauffeurAvailable: false,
      features: ['AC', 'Apple CarPlay', 'Cruise Control', 'Rear Camera'],
      dealer: 'Rivers Auto Hub',
      featured: false,
      weeklyDeal: true,
    },
    // Luxury Cars
    {
      id: 107,
      name: 'Mercedes-Benz E-Class 2023',
      category: 'luxury',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600',
      dailyRate: 120000,
      weeklyRate: 700000,
      monthlyRate: 2500000,
      corporateRate: 2200000,
      seats: 5,
      transmission: 'Automatic',
      fuel: 'Petrol',
      location: 'Lagos',
      rating: 5.0,
      reviews: 56,
      available: true,
      chauffeurAvailable: true,
      features: ['AC', 'Sunroof', 'Leather Seats', 'Chauffeur Included'],
      dealer: 'Luxury Wheels NG',
      featured: true,
      weeklyDeal: false,
    },
    {
      id: 108,
      name: 'Lexus RX 350 2022',
      category: 'luxury',
      image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600',
      dailyRate: 85000,
      weeklyRate: 500000,
      monthlyRate: 1800000,
      corporateRate: 1600000,
      seats: 5,
      transmission: 'Automatic',
      fuel: 'Petrol',
      location: 'Abuja',
      rating: 4.9,
      reviews: 92,
      available: true,
      chauffeurAvailable: true,
      features: ['AC', 'Panoramic Roof', 'Premium Sound', 'Driver Available'],
      dealer: 'Elite Motors Abuja',
      featured: true,
      weeklyDeal: false,
    },
    {
      id: 109,
      name: 'BMW 5 Series 2023',
      category: 'luxury',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600',
      dailyRate: 110000,
      weeklyRate: 650000,
      monthlyRate: 2300000,
      corporateRate: 2000000,
      seats: 5,
      transmission: 'Automatic',
      fuel: 'Petrol',
      location: 'Lagos',
      rating: 4.9,
      reviews: 78,
      available: false,
      chauffeurAvailable: true,
      features: ['AC', 'M Sport Package', 'Heads-up Display', 'Massage Seats'],
      dealer: 'BMW Lagos Rentals',
      featured: false,
      weeklyDeal: false,
    },
    // Executive Cars
    {
      id: 110,
      name: 'Mercedes-Benz S-Class 2023',
      category: 'executive',
      image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=600',
      dailyRate: 200000,
      weeklyRate: 1200000,
      monthlyRate: 4500000,
      corporateRate: 4000000,
      seats: 5,
      transmission: 'Automatic',
      fuel: 'Petrol',
      location: 'Lagos',
      rating: 5.0,
      reviews: 34,
      available: true,
      chauffeurAvailable: true,
      features: ['Executive Seating', 'Champagne Cooler', 'Privacy Glass', 'Chauffeur Included'],
      dealer: 'VIP Motors Nigeria',
      featured: true,
      weeklyDeal: false,
    },
    {
      id: 111,
      name: 'Range Rover Autobiography 2023',
      category: 'executive',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600',
      dailyRate: 250000,
      weeklyRate: 1500000,
      monthlyRate: 5500000,
      corporateRate: 5000000,
      seats: 5,
      transmission: 'Automatic',
      fuel: 'Petrol',
      location: 'Abuja',
      rating: 5.0,
      reviews: 28,
      available: true,
      chauffeurAvailable: true,
      features: ['Full Size Luxury', 'Rear Entertainment', 'Refrigerator', 'Armed Escort Available'],
      dealer: 'Presidential Fleet NG',
      featured: true,
      weeklyDeal: false,
    },
    // Vans
    {
      id: 112,
      name: 'Toyota Hiace 2021',
      category: 'van',
      image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=600',
      dailyRate: 55000,
      weeklyRate: 350000,
      monthlyRate: 1200000,
      corporateRate: 1000000,
      seats: 14,
      transmission: 'Manual',
      fuel: 'Diesel',
      location: 'Lagos',
      rating: 4.7,
      reviews: 78,
      available: true,
      chauffeurAvailable: true,
      features: ['AC', 'PA System', 'Large Luggage Space'],
      dealer: 'TransNaija Rentals',
      featured: false,
      weeklyDeal: true,
    },
    {
      id: 113,
      name: 'Mercedes Sprinter 2022',
      category: 'van',
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600',
      dailyRate: 80000,
      weeklyRate: 480000,
      monthlyRate: 1700000,
      corporateRate: 1500000,
      seats: 12,
      transmission: 'Automatic',
      fuel: 'Diesel',
      location: 'Abuja',
      rating: 4.8,
      reviews: 45,
      available: true,
      chauffeurAvailable: true,
      features: ['AC', 'Executive Seating', 'WiFi', 'USB Ports'],
      dealer: 'Executive Transit Abuja',
      featured: true,
      weeklyDeal: false,
    },
    {
      id: 114,
      name: 'Ford Transit 2023',
      category: 'van',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      dailyRate: 65000,
      weeklyRate: 400000,
      monthlyRate: 1400000,
      corporateRate: 1200000,
      seats: 15,
      transmission: 'Automatic',
      fuel: 'Diesel',
      location: 'Lagos',
      rating: 4.6,
      reviews: 52,
      available: true,
      chauffeurAvailable: true,
      features: ['AC', 'Spacious Interior', 'Corporate Ready', 'GPS Tracking'],
      dealer: 'TransNaija Rentals',
      featured: false,
      weeklyDeal: true,
    },
  ];

  const services = [
    {
      icon: Car,
      title: 'Self-Drive Rentals',
      desc: 'Drive yourself with our well-maintained fleet',
    },
    {
      icon: Users,
      title: 'Chauffeur Service',
      desc: 'Professional drivers for your comfort',
      action: () => handleFilterChange('service', 'chauffeur'),
    },
    {
      icon: MapPin,
      title: 'Airport Pickup',
      desc: 'Convenient pickup from any airport',
    },
    {
      icon: Briefcase,
      title: 'Corporate Rentals',
      desc: 'Special rates for businesses',
      action: () => handleFilterChange('period', 'corporate'),
    },
  ];

  // Filter cars based on current filters
  const filteredCars = rentalCars.filter(car => {
    // Category filter
    if (filters.category && filters.category !== 'all' && car.category !== filters.category) return false;

    // Location filter
    if (filters.location && car.location.toLowerCase() !== filters.location.toLowerCase()) return false;

    // Chauffeur service filter
    if (filters.service === 'chauffeur' && !car.chauffeurAvailable) return false;

    // Period filter - show cars with weekly deals for weekly period
    if (filters.period === 'weekly' && !car.weeklyDeal) return false;

    // Corporate filter - show all but highlight corporate rates
    // All cars are available for corporate, just different pricing

    // Price range filter
    if (filters.priceRange) {
      const rate = filters.period === 'weekly' ? car.weeklyRate :
                   filters.period === 'monthly' ? car.monthlyRate :
                   filters.period === 'corporate' ? car.corporateRate :
                   car.dailyRate;

      if (filters.priceRange === 'budget') {
        const threshold = filters.period === 'weekly' ? 200000 :
                         filters.period === 'monthly' ? 700000 :
                         filters.period === 'corporate' ? 600000 : 35000;
        if (rate > threshold) return false;
      }
      if (filters.priceRange === 'mid') {
        const min = filters.period === 'weekly' ? 200000 :
                   filters.period === 'monthly' ? 700000 :
                   filters.period === 'corporate' ? 600000 : 35000;
        const max = filters.period === 'weekly' ? 500000 :
                   filters.period === 'monthly' ? 1500000 :
                   filters.period === 'corporate' ? 1200000 : 80000;
        if (rate < min || rate > max) return false;
      }
      if (filters.priceRange === 'premium') {
        const threshold = filters.period === 'weekly' ? 500000 :
                         filters.period === 'monthly' ? 1500000 :
                         filters.period === 'corporate' ? 1200000 : 80000;
        if (rate < threshold) return false;
      }
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return car.name.toLowerCase().includes(query) ||
             car.dealer.toLowerCase().includes(query) ||
             car.category.toLowerCase().includes(query);
    }

    return true;
  });

  // Sort cars
  const sortedCars = [...filteredCars].sort((a, b) => {
    const getRate = (car) => {
      switch (filters.period) {
        case 'weekly': return car.weeklyRate;
        case 'monthly': return car.monthlyRate;
        case 'corporate': return car.corporateRate;
        default: return car.dailyRate;
      }
    };

    switch (sortBy) {
      case 'price-low': return getRate(a) - getRate(b);
      case 'price-high': return getRate(b) - getRate(a);
      case 'rating': return b.rating - a.rating;
      case 'featured': return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      default: return 0;
    }
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      period: '',
      service: '',
      category: '',
      location: '',
      priceRange: '',
    });
    setSearchParams({});
    setSearchQuery('');
  };

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  const handleToggleFavorite = async (car) => {
    if (!isAuthenticated) {
      addToast('Please sign in to save favorites', 'info');
      return;
    }
    try {
      await listingsAPI.toggleFavorite(car.id);
    } catch {
      addToast('Failed to update favorite', 'error');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDisplayRate = (car) => {
    switch (filters.period) {
      case 'weekly': return { rate: car.weeklyRate, label: '/week' };
      case 'monthly': return { rate: car.monthlyRate, label: '/month' };
      case 'corporate': return { rate: car.corporateRate, label: '/month' };
      default: return { rate: car.dailyRate, label: '/day' };
    }
  };

  const getPageTitle = () => {
    if (filters.service === 'chauffeur') return 'Chauffeur Service';
    switch (filters.period) {
      case 'daily': return 'Daily Car Rentals';
      case 'weekly': return 'Weekly Rental Deals';
      case 'monthly': return 'Monthly Rental Plans';
      case 'corporate': return 'Corporate Car Rentals';
      default: return 'Car Rentals';
    }
  };

  const getPageDescription = () => {
    if (filters.service === 'chauffeur') {
      return 'Professional chauffeur-driven vehicles for your comfort and convenience. Sit back, relax, and let our trained drivers take you anywhere.';
    }
    switch (filters.period) {
      case 'daily':
        return 'Flexible daily rentals perfect for short trips, airport transfers, and day excursions. Pick up and return at your convenience.';
      case 'weekly':
        return 'Save up to 15% with our weekly rental packages. Perfect for extended trips, business assignments, and vacation getaways.';
      case 'monthly':
        return 'Long-term rental solutions with the best monthly rates. Ideal for expatriates, project-based work, and extended stays.';
      case 'corporate':
        return 'Tailored corporate fleet solutions with dedicated account management, priority service, and volume discounts for businesses.';
      default:
        return 'From economy cars to luxury vehicles. Self-drive or with chauffeur. Flexible daily, weekly, and monthly rates across Nigeria.';
    }
  };

  const getPeriodBadge = () => {
    if (filters.service === 'chauffeur') return { icon: Users, text: 'Chauffeur Included', color: 'bg-purple-500/20 text-purple-400' };
    switch (filters.period) {
      case 'daily': return { icon: Clock, text: 'Daily Rates', color: 'bg-blue-500/20 text-blue-400' };
      case 'weekly': return { icon: Zap, text: 'Weekly Deals - Save 15%', color: 'bg-yellow-500/20 text-yellow-400' };
      case 'monthly': return { icon: Calendar, text: 'Monthly Plans', color: 'bg-green-500/20 text-green-400' };
      case 'corporate': return { icon: Building2, text: 'Corporate Rates', color: 'bg-indigo-500/20 text-indigo-400' };
      default: return { icon: Car, text: 'Premium Car Rentals', color: 'bg-green-500/20 text-green-400' };
    }
  };

  const badge = getPeriodBadge();

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-800 via-gray-900 to-green-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] bg-repeat" />
        </div>
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className={`inline-flex items-center gap-2 px-4 py-2 ${badge.color} rounded-full text-sm font-medium mb-6`}>
              <badge.icon className="w-4 h-4" />
              {badge.text}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              {getPageTitle().includes('Chauffeur') ? (
                <>Chauffeur <span className="text-green-400">Service</span></>
              ) : getPageTitle().includes('Corporate') ? (
                <>Corporate <span className="text-green-400">Rentals</span></>
              ) : getPageTitle().includes('Weekly') ? (
                <>Weekly <span className="text-yellow-400">Deals</span></>
              ) : getPageTitle().includes('Monthly') ? (
                <>Monthly <span className="text-green-400">Plans</span></>
              ) : getPageTitle().includes('Daily') ? (
                <>Daily <span className="text-green-400">Rentals</span></>
              ) : (
                <>Rent Your Perfect <span className="text-green-400">Ride</span></>
              )}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {getPageDescription()}
            </p>

            {/* Quick Search */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 [&>option]:text-gray-900 [&>option]:bg-white"
                    >
                      <option value="">All Locations</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc.toLowerCase()}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Pick-up Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Return Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      const section = document.getElementById('rental-results');
                      if (section) section.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
                  >
                    <Search className="w-5 h-5" />
                    Search Cars
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rental Period Tabs */}
      <section className="py-4 bg-white border-b border-gray-200 sticky top-[72px] md:top-[68px] z-40">
        <div className="section-container">
          <div className="flex flex-wrap items-center gap-2">
            {rentalPeriods.map((period) => (
              <button
                key={period.id}
                onClick={() => handleFilterChange('period', period.id)}
                className={`px-3 md:px-4 py-2 rounded-full font-medium transition-all text-sm md:text-base ${
                  filters.period === period.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.name}
                {period.id === 'weekly' && filters.period !== 'weekly' && (
                  <span className="ml-1 md:ml-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs rounded-full">
                    Save 15%
                  </span>
                )}
              </button>
            ))}
            <div className="hidden md:block border-l border-gray-300 h-8 mx-2" />
            <button
              onClick={() => handleFilterChange('service', filters.service === 'chauffeur' ? '' : 'chauffeur')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full font-medium transition-all text-sm md:text-base ${
                filters.service === 'chauffeur'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Chauffeur</span>
              <span className="sm:hidden">Driver</span>
            </button>
          </div>
        </div>
      </section>

      {/* Services - Only show on main page */}
      {!filters.period && !filters.service && (
        <section className="py-12 bg-white border-b border-gray-200">
          <div className="section-container">
            <div className="grid md:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <motion.button
                  key={service.title}
                  onClick={service.action}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="p-3 bg-green-100 rounded-xl">
                    <service.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{service.title}</h3>
                    <p className="text-sm text-gray-600">{service.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="section-container py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Filter Results</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Locations</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc.toLowerCase()}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Prices</option>
                    <option value="budget">Budget</option>
                    <option value="mid">Mid-Range</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select
                    value={filters.service}
                    onChange={(e) => handleFilterChange('service', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Services</option>
                    <option value="chauffeur">Chauffeur Available</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <section id="rental-results" className="py-8 bg-gray-50 min-h-screen">
        <div className="section-container">
          {/* Results Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-gray-600">
                <span className="font-bold text-gray-900">{sortedCars.length}</span> cars available
              </p>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Tags */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.period && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  {rentalPeriods.find(p => p.id === filters.period)?.name}
                  <button onClick={() => handleFilterChange('period', '')} className="hover:text-green-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.service === 'chauffeur' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  Chauffeur Service
                  <button onClick={() => handleFilterChange('service', '')} className="hover:text-purple-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {categories.find(c => c.id === filters.category)?.name}
                  <button onClick={() => handleFilterChange('category', '')} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.location && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {filters.location}
                  <button onClick={() => handleFilterChange('location', '')} className="hover:text-gray-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Corporate Benefits Banner */}
          {filters.period === 'corporate' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Building2 className="w-6 h-6" />
                    Corporate Fleet Solutions
                  </h3>
                  <p className="text-indigo-100">
                    Dedicated account manager • Priority support • Volume discounts • Flexible billing
                  </p>
                </div>
                <Link
                  to="/contact"
                  className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  Request Quote
                </Link>
              </div>
            </motion.div>
          )}

          {/* Weekly Deals Banner */}
          {filters.period === 'weekly' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 mb-8 text-white"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Zap className="w-6 h-6" />
                    Weekly Rental Deals
                  </h3>
                  <p className="text-yellow-100">
                    Save up to 15% compared to daily rates! Perfect for extended trips and business travel.
                  </p>
                </div>
                <div className="text-3xl font-bold">
                  Up to 15% OFF
                </div>
              </div>
            </motion.div>
          )}

          {/* Car Grid/List */}
          {sortedCars.length > 0 ? (
            <div className={viewMode === 'grid'
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }>
              {sortedCars.map((car, index) => {
                const { rate, label } = getDisplayRate(car);
                return (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={viewMode === 'grid'
                      ? 'bg-white rounded-2xl shadow-md overflow-hidden group hover:shadow-xl transition-all'
                      : 'bg-white rounded-2xl shadow-md overflow-hidden flex group hover:shadow-xl transition-all'
                    }
                  >
                    {/* Image */}
                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-72 flex-shrink-0' : 'aspect-[4/3]'}`}>
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={() => handleToggleFavorite(car)}
                        className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            car.isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
                          }`}
                        />
                      </button>
                      {!car.available && (
                        <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                          <span className="px-4 py-2 bg-gray-800 text-white rounded-full font-medium">
                            Currently Unavailable
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        <span className="px-3 py-1 bg-white/90 text-gray-700 text-sm rounded-full font-medium capitalize">
                          {car.category}
                        </span>
                        {car.chauffeurAvailable && (
                          <span className="px-3 py-1 bg-purple-500 text-white text-sm rounded-full font-medium">
                            Chauffeur
                          </span>
                        )}
                      </div>
                      {car.featured && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-full font-medium">
                            Featured
                          </span>
                        </div>
                      )}
                      {car.weeklyDeal && filters.period === 'weekly' && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-orange-500 text-white text-sm rounded-full font-medium">
                            Weekly Deal
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`p-5 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{car.name}</h3>
                          <p className="text-sm text-gray-500">{car.dealer}</p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-medium text-gray-800">{car.rating}</span>
                          <span className="text-gray-400 text-sm">({car.reviews})</span>
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {car.seats} seats
                        </span>
                        <span className="flex items-center gap-1">
                          <Settings className="w-4 h-4" />
                          {car.transmission}
                        </span>
                        <span className="flex items-center gap-1">
                          <Fuel className="w-4 h-4" />
                          {car.fuel}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <MapPin className="w-4 h-4" />
                        {car.location}
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {car.features.slice(0, 3).map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                        {car.features.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{car.features.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-end justify-between mb-4">
                          <div>
                            <span className="text-sm text-gray-500">
                              {filters.period === 'corporate' ? 'Corporate Rate' :
                               filters.period === 'weekly' ? 'Weekly Rate' :
                               filters.period === 'monthly' ? 'Monthly Rate' : 'Daily Rate'}
                            </span>
                            <p className="text-2xl font-bold text-green-600">
                              {formatPrice(rate)}
                              <span className="text-sm font-normal text-gray-500">{label}</span>
                            </p>
                          </div>
                          {!filters.period && (
                            <div className="text-right text-sm">
                              <p className="text-gray-500">
                                Weekly: <span className="font-medium text-gray-700">{formatPrice(car.weeklyRate)}</span>
                              </p>
                              <p className="text-gray-500">
                                Monthly: <span className="font-medium text-gray-700">{formatPrice(car.monthlyRate)}</span>
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={`/booking/${car.id}?type=rental${filters.period ? `&period=${filters.period}` : ''}`}
                            className={`flex-1 py-3 rounded-xl font-medium text-center transition-colors ${
                              car.available
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {car.available ? 'Book Now' : 'Unavailable'}
                          </Link>
                          <a
                            href="tel:+2341234567890"
                            className="p-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <Phone className="w-5 h-5" />
                          </a>
                          <a
                            href="https://wa.me/2341234567890"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 border border-gray-300 rounded-xl text-green-600 hover:bg-green-50 transition-colors"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No cars found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters to see more options
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Rent Section */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-800 mb-4">Why Rent With Us?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience hassle-free car rentals with Nigeria's most trusted platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Fully Insured Vehicles',
                desc: 'All our rental cars come with comprehensive insurance coverage for your peace of mind.',
              },
              {
                icon: Clock,
                title: '24/7 Support',
                desc: 'Round-the-clock customer support for any assistance you may need during your rental.',
              },
              {
                icon: CheckCircle,
                title: 'Verified Condition',
                desc: 'Every vehicle is thoroughly inspected and sanitized before each rental.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-8 rounded-2xl bg-gray-50"
              >
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700">
        <div className="section-container text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Want to List Your Car for Rent?
          </h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Earn extra income by renting out your vehicle. Join our network of trusted car owners.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/sell"
              className="px-8 py-3 bg-white text-green-700 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              List Your Car
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 border-2 border-white text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default RentCarsPage;
