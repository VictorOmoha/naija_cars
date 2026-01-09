import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, X, ChevronDown, Grid, List, SlidersHorizontal,
  Car, MapPin, Calendar, Fuel, Settings, Heart, Eye, ArrowUpDown, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { listingsAPI } from '../services/api';

// Transform backend listing to component format
const transformListing = (listing) => {
  const conditionMap = {
    'FOREIGN_USED': 'foreign',
    'NIGERIAN_USED': 'nigerian',
    'BRAND_NEW': 'new'
  };

  return {
    id: listing.id,
    title: `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ' ' + listing.trim : ''}`,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    price: listing.price,
    condition: conditionMap[listing.condition] || 'foreign',
    mileage: listing.mileage || 0,
    transmission: listing.transmission,
    fuelType: listing.fuelType,
    bodyType: listing.bodyType || 'Sedan',
    location: listing.locationState,
    image: listing.media?.[0]?.url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600',
    images: listing.media?.length || 1,
    featured: listing.isFeatured || false,
    verified: listing.seller?.profile?.verificationBadge ? true : false,
    dealer: listing.seller?.profile?.businessName || 'Private Seller',
  };
};

const CarsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToFavorites, removeFromFavorites, favorites } = useApp();

  const [allCars, setAllCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');

  // Get filter values from URL params
  const [filters, setFilters] = useState({
    condition: searchParams.get('condition') || '',
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minYear: searchParams.get('minYear') || '',
    maxYear: searchParams.get('maxYear') || '',
    location: searchParams.get('location') || '',
    transmission: searchParams.get('transmission') || '',
    fuelType: searchParams.get('fuelType') || '',
    bodyType: searchParams.get('bodyType') || '',
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch listings from API
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);

        // Build API params from filters
        const params = {
          type: 'SALE',
          limit: 24,
          page: pagination.page,
          ...(filters.make && { make: filters.make }),
          ...(filters.condition && {
            condition: filters.condition === 'foreign' ? 'FOREIGN_USED' :
                       filters.condition === 'nigerian' ? 'NIGERIAN_USED' : 'BRAND_NEW'
          }),
          ...(filters.location && { state: filters.location }),
          ...(filters.transmission && { transmission: filters.transmission }),
          ...(filters.fuelType && { fuelType: filters.fuelType }),
          ...(filters.minPrice && { minPrice: filters.minPrice }),
          ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
          ...(filters.minYear && { minYear: filters.minYear }),
          ...(filters.maxYear && { maxYear: filters.maxYear }),
          ...(searchQuery && { search: searchQuery }),
        };

        const response = await listingsAPI.getAll(params);
        const listings = response.data.data.listings;
        const paginationData = response.data.data.pagination;

        setAllCars(listings.map(transformListing));
        setPagination(paginationData);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setAllCars([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [filters, searchQuery, pagination.page]);

  // Fallback sample car data (used when API returns empty)
  const fallbackCars = [
    {
      id: 1,
      title: '2022 Toyota Camry XLE',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      price: 18500000,
      condition: 'foreign',
      mileage: 25000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      bodyType: 'Sedan',
      location: 'Lagos',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600',
      images: 8,
      featured: true,
      verified: true,
      dealer: 'AutoKing Motors',
    },
    {
      id: 2,
      title: '2021 Honda Accord Sport',
      make: 'Honda',
      model: 'Accord',
      year: 2021,
      price: 16000000,
      condition: 'foreign',
      mileage: 32000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      bodyType: 'Sedan',
      location: 'Abuja',
      image: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=600',
      images: 12,
      featured: false,
      verified: true,
      dealer: 'Prime Auto Hub',
    },
    {
      id: 3,
      title: '2020 Mercedes-Benz E350',
      make: 'Mercedes-Benz',
      model: 'E350',
      year: 2020,
      price: 32000000,
      condition: 'foreign',
      mileage: 28000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      bodyType: 'Sedan',
      location: 'Lagos',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600',
      images: 15,
      featured: true,
      verified: true,
      dealer: 'Luxury Wheels NG',
    },
    {
      id: 4,
      title: '2019 Toyota Highlander',
      make: 'Toyota',
      model: 'Highlander',
      year: 2019,
      price: 22000000,
      condition: 'foreign',
      mileage: 45000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      bodyType: 'SUV',
      location: 'Port Harcourt',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600',
      images: 10,
      featured: false,
      verified: true,
      dealer: 'Rivers Auto',
    },
    {
      id: 5,
      title: '2018 Lexus RX 350',
      make: 'Lexus',
      model: 'RX 350',
      year: 2018,
      price: 19500000,
      condition: 'nigerian',
      mileage: 65000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      bodyType: 'SUV',
      location: 'Lagos',
      image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600',
      images: 9,
      featured: false,
      verified: true,
      dealer: 'AutoMart Lagos',
    },
    {
      id: 6,
      title: '2017 BMW X5 xDrive35i',
      make: 'BMW',
      model: 'X5',
      year: 2017,
      price: 17000000,
      condition: 'nigerian',
      mileage: 78000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      bodyType: 'SUV',
      location: 'Abuja',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600',
      images: 11,
      featured: false,
      verified: false,
      dealer: 'Capital Motors',
    },
    {
      id: 7,
      title: '2024 Toyota Corolla Cross',
      make: 'Toyota',
      model: 'Corolla Cross',
      year: 2024,
      price: 35000000,
      condition: 'new',
      mileage: 0,
      transmission: 'Automatic',
      fuelType: 'Hybrid',
      bodyType: 'SUV',
      location: 'Lagos',
      image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=600',
      images: 20,
      featured: true,
      verified: true,
      dealer: 'Toyota Nigeria',
    },
    {
      id: 8,
      title: '2024 Honda HR-V',
      make: 'Honda',
      model: 'HR-V',
      year: 2024,
      price: 28000000,
      condition: 'new',
      mileage: 0,
      transmission: 'CVT',
      fuelType: 'Petrol',
      bodyType: 'SUV',
      location: 'Lagos',
      image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=600',
      images: 18,
      featured: true,
      verified: true,
      dealer: 'Honda Place Nigeria',
    },
    {
      id: 9,
      title: '2016 Ford Explorer',
      make: 'Ford',
      model: 'Explorer',
      year: 2016,
      price: 12500000,
      condition: 'nigerian',
      mileage: 95000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      bodyType: 'SUV',
      location: 'Kano',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600',
      images: 7,
      featured: false,
      verified: false,
      dealer: 'Kano Auto Market',
    },
    {
      id: 10,
      title: '2020 Hyundai Tucson',
      make: 'Hyundai',
      model: 'Tucson',
      year: 2020,
      price: 14000000,
      condition: 'foreign',
      mileage: 38000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      bodyType: 'SUV',
      location: 'Lagos',
      image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600',
      images: 10,
      featured: false,
      verified: true,
      dealer: 'Hyundai Lagos',
    },
    {
      id: 11,
      title: '2019 Kia Sportage',
      make: 'Kia',
      model: 'Sportage',
      year: 2019,
      price: 11500000,
      condition: 'foreign',
      mileage: 42000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      bodyType: 'SUV',
      location: 'Oyo',
      image: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=600',
      images: 8,
      featured: false,
      verified: true,
      dealer: 'Ibadan Motors',
    },
    {
      id: 12,
      title: '2021 Mazda CX-5',
      make: 'Mazda',
      model: 'CX-5',
      year: 2021,
      price: 15500000,
      condition: 'foreign',
      mileage: 29000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      bodyType: 'SUV',
      location: 'Lagos',
      image: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b4c?w=600',
      images: 12,
      featured: false,
      verified: true,
      dealer: 'Mazda Nigeria',
    },
  ];

  const carMakes = ['Toyota', 'Honda', 'Mercedes-Benz', 'BMW', 'Lexus', 'Ford', 'Hyundai', 'Kia', 'Mazda', 'Nissan', 'Volkswagen'];
  const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Pickup', 'Van', 'Wagon'];
  const locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Oyo', 'Rivers', 'Kaduna', 'Ogun', 'Edo'];
  const transmissions = ['Automatic', 'Manual', 'CVT'];
  const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];

  // Filter cars based on current filters
  // Use API results directly (filtering is done server-side)
  // Only apply client-side sorting
  const sortedCars = [...allCars].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'year-new': return b.year - a.year;
      case 'year-old': return a.year - b.year;
      case 'mileage': return a.mileage - b.mileage;
      default: return 0; // newest (by id for demo)
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
      condition: '',
      make: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      location: '',
      transmission: '',
      fuelType: '',
      bodyType: '',
    });
    setSearchParams({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  const isFavorite = (carId) => favorites.some(f => f.id === carId);

  const toggleFavorite = (car) => {
    if (isFavorite(car.id)) {
      removeFromFavorites(car.id);
    } else {
      addToFavorites(car);
    }
  };

  const getConditionLabel = (condition) => {
    switch (condition) {
      case 'foreign': return 'Foreign Used';
      case 'nigerian': return 'Nigerian Used';
      case 'new': return 'Brand New';
      default: return condition;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-8 bg-gradient-to-br from-gray-800 via-gray-900 to-green-900">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              {filters.condition === 'foreign' && 'Foreign Used Cars'}
              {filters.condition === 'nigerian' && 'Nigerian Used Cars'}
              {filters.condition === 'new' && 'Brand New Cars'}
              {!filters.condition && 'All Cars for Sale'}
              {filters.location && ` in ${filters.location}`}
            </h1>
            <p className="text-gray-300 mb-6">
              Browse {sortedCars.length} verified vehicles from trusted dealers across Nigeria
            </p>

            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by make, model, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-6 h-6 bg-green-500 rounded-full text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

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

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    value={filters.condition}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Conditions</option>
                    <option value="new">Brand New</option>
                    <option value="foreign">Foreign Used</option>
                    <option value="nigerian">Nigerian Used</option>
                  </select>
                </div>

                {/* Make */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                  <select
                    value={filters.make}
                    onChange={(e) => handleFilterChange('make', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Makes</option>
                    {carMakes.map(make => (
                      <option key={make} value={make}>{make}</option>
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

                {/* Body Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body Type</label>
                  <select
                    value={filters.bodyType}
                    onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {bodyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                  <select
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">No Min</option>
                    <option value="5000000">₦5M</option>
                    <option value="10000000">₦10M</option>
                    <option value="15000000">₦15M</option>
                    <option value="20000000">₦20M</option>
                    <option value="30000000">₦30M</option>
                  </select>
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                  <select
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">No Max</option>
                    <option value="10000000">₦10M</option>
                    <option value="15000000">₦15M</option>
                    <option value="20000000">₦20M</option>
                    <option value="30000000">₦30M</option>
                    <option value="50000000">₦50M</option>
                  </select>
                </div>
              </div>

              {/* Additional Filters Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                {/* Transmission */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                  <select
                    value={filters.transmission}
                    onChange={(e) => handleFilterChange('transmission', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    {transmissions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                  <select
                    value={filters.fuelType}
                    onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    {fuelTypes.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* Min Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Year</label>
                  <select
                    value={filters.minYear}
                    onChange={(e) => handleFilterChange('minYear', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    {Array.from({ length: 15 }, (_, i) => 2024 - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Max Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Year</label>
                  <select
                    value={filters.maxYear}
                    onChange={(e) => handleFilterChange('maxYear', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    {Array.from({ length: 15 }, (_, i) => 2024 - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <section className="py-8 bg-gray-50 min-h-screen">
        <div className="section-container">
          {/* Results Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <p className="text-gray-600">
                <span className="font-bold text-gray-900">{sortedCars.length}</span> cars found
              </p>

              {/* Active Filters Tags */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.condition && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      {getConditionLabel(filters.condition)}
                      <button onClick={() => handleFilterChange('condition', '')} className="hover:text-green-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.make && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      {filters.make}
                      <button onClick={() => handleFilterChange('make', '')} className="hover:text-green-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.location && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      {filters.location}
                      <button onClick={() => handleFilterChange('location', '')} className="hover:text-green-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="year-new">Year: Newest</option>
                  <option value="year-old">Year: Oldest</option>
                  <option value="mileage">Lowest Mileage</option>
                </select>
              </div>

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

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading cars...</p>
              </div>
            </div>
          )}

          {/* Cars Grid/List */}
          {!isLoading && sortedCars.length > 0 ? (
            <div className={viewMode === 'grid'
              ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {sortedCars.map((car, index) => (
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
                      alt={car.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {car.featured && (
                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                          Featured
                        </span>
                      )}
                      <span className={`px-2 py-1 text-white text-xs font-medium rounded-full ${
                        car.condition === 'new' ? 'bg-green-600' :
                        car.condition === 'foreign' ? 'bg-blue-600' : 'bg-orange-600'
                      }`}>
                        {getConditionLabel(car.condition)}
                      </span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(car)}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${isFavorite(car.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </button>

                    {/* Image Count */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {car.images} photos
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link to={`/car/${car.id}`} className="font-bold text-gray-800 hover:text-green-600 transition-colors">
                          {car.title}
                        </Link>
                        <p className="text-sm text-gray-500">{car.dealer}</p>
                      </div>
                      {car.verified && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Specs */}
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {car.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <Settings className="w-4 h-4" />
                        {car.transmission}
                      </span>
                      <span className="flex items-center gap-1">
                        <Fuel className="w-4 h-4" />
                        {car.fuelType}
                      </span>
                      {viewMode === 'list' && (
                        <>
                          <span className="flex items-center gap-1">
                            <Car className="w-4 h-4" />
                            {car.bodyType}
                          </span>
                          <span className="flex items-center gap-1">
                            {car.mileage.toLocaleString()} km
                          </span>
                        </>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4" />
                      {car.location}
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <p className="text-xl font-bold text-green-600">
                        {formatPrice(car.price)}
                      </p>
                      <Link
                        to={`/car/${car.id}`}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : !isLoading && (
            <div className="text-center py-20">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No cars found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && sortedCars.length > 0 && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CarsPage;
