import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Trash2, Grid, List, MapPin, Gauge, Fuel, Settings2,
  BadgeCheck, Bell, GitCompare, X, ChevronDown, Share2,
  ExternalLink, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import useAuthStore from '../stores/authStore';
import { usersAPI, listingsAPI } from '../services/api';

export default function FavoritesPage() {
  const { addToast } = useApp();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState({});

  // Fetch favorites from API
  const { data: favoritesResponse, isLoading, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => usersAPI.getFavorites(),
    enabled: isAuthenticated,
  });

  const favoritesData = (favoritesResponse?.data?.data?.favorites || []).map(listing => ({
    id: listing.id,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    trim: listing.trim || '',
    price: parseFloat(listing.price),
    mileage: listing.mileage || 0,
    fuelType: listing.fuelType,
    transmission: listing.transmission,
    condition: listing.condition,
    locationCity: listing.locationCity,
    locationState: listing.locationState,
    image: listing.media?.[0]?.url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600',
    verified: listing.seller?.profile?.verificationBadge || false,
    dealerName: listing.seller?.profile?.businessName || listing.seller?.profile?.firstName || 'Private Seller',
    createdAt: listing.createdAt,
  }));

  const sortedFavorites = useMemo(() => {
    let sorted = [...favoritesData];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'recent':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'year':
        sorted.sort((a, b) => b.year - a.year);
        break;
      default:
        break;
    }
    return sorted;
  }, [favoritesData, sortBy]);

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    }
    return `₦${price.toLocaleString()}`;
  };

  const handleRemove = async (carId, e) => {
    e.stopPropagation();
    try {
      await listingsAPI.toggleFavorite(carId);
      addToast('Removed from favorites', 'success');
      refetch();
    } catch (error) {
      addToast('Failed to remove favorite', 'error');
    }
  };

  const handleCompareToggle = (car, e) => {
    e.stopPropagation();
    if (compareList.find(c => c.id === car.id)) {
      setCompareList(compareList.filter(c => c.id !== car.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, car]);
      if (compareList.length === 2) {
        addToast('You can now compare up to 3 cars!', 'info');
      }
    } else {
      addToast('Maximum 3 cars can be compared', 'warning');
    }
  };

  const togglePriceAlert = (carId, e) => {
    e.stopPropagation();
    setPriceAlerts(prev => ({
      ...prev,
      [carId]: !prev[carId]
    }));
    addToast(priceAlerts[carId] ? 'Price alert disabled' : 'Price alert enabled', 'success');
  };

  const handleShare = async (car, e) => {
    e.stopPropagation();
    try {
      await navigator.share({
        title: `${car.year} ${car.make} ${car.model}`,
        text: `Check out this ${car.year} ${car.make} ${car.model} for ${formatPrice(car.price)}`,
        url: window.location.origin + `/car/${car.id}`,
      });
    } catch (err) {
      navigator.clipboard.writeText(window.location.origin + `/car/${car.id}`);
      addToast('Link copied to clipboard', 'success');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-pearl-100 pt-28 pb-20">
        <div className="bg-gradient-to-r from-naija-600 via-naija-500 to-emerald-500 py-12 relative overflow-hidden">
          <div className="absolute inset-0 kente-overlay opacity-10" />
          <div className="section-container relative">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                  My Favorites
                </h1>
                <p className="text-white/80 mt-1">Loading...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="section-container py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-naija-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl-100 pt-28 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-naija-600 via-naija-500 to-emerald-500 py-12 relative overflow-hidden">
        <div className="absolute inset-0 kente-overlay opacity-10" />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-5 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"
        />
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                My Favorites
              </h1>
              <p className="text-white/80 mt-1">
                {favoritesData.length} saved {favoritesData.length === 1 ? 'car' : 'cars'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Compare Bar */}
        <AnimatePresence>
          {compareList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-white rounded-2xl shadow-card flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <GitCompare className="w-6 h-6 text-naija-500" />
                <span className="font-medium text-charcoal-700">
                  {compareList.length} {compareList.length === 1 ? 'car' : 'cars'} selected for comparison
                </span>
                <div className="flex gap-2">
                  {compareList.map((car) => (
                    <div key={car.id} className="flex items-center gap-2 px-3 py-1.5 bg-pearl-100 rounded-lg">
                      <span className="text-sm font-medium">{car.make} {car.model}</span>
                      <button
                        onClick={() => setCompareList(compareList.filter(c => c.id !== car.id))}
                        className="text-charcoal-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCompareList([])}
                  className="px-4 py-2 text-charcoal-600 hover:bg-pearl-100 rounded-xl transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowCompareModal(true)}
                  disabled={compareList.length < 2}
                  className="px-6 py-2 bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Compare Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${
                viewMode === 'grid' ? 'bg-naija-500 text-white' : 'bg-white text-charcoal-600 hover:bg-pearl-200'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${
                viewMode === 'list' ? 'bg-naija-500 text-white' : 'bg-white text-charcoal-600 hover:bg-pearl-200'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white pl-4 pr-10 py-2.5 rounded-xl border border-pearl-300 text-charcoal-700 font-medium focus:border-naija-500 focus:ring-2 focus:ring-naija-100 cursor-pointer"
              >
                <option value="recent">Recently Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="year">Year: Newest First</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {favoritesData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-pearl-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-charcoal-300" />
            </div>
            <h2 className="text-2xl font-display font-bold text-charcoal-800 mb-2">
              No favorites yet
            </h2>
            <p className="text-charcoal-500 mb-8 max-w-md mx-auto">
              Start saving cars you love by clicking the heart icon on any listing
            </p>
            <button
              onClick={() => navigate('/cars')}
              className="btn-primary px-8 py-3 rounded-xl"
            >
              Browse Cars
            </button>
          </motion.div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedFavorites.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/car/${car.id}`)}
                    className="group cursor-pointer"
                  >
                    <div className="bg-white rounded-3xl shadow-card overflow-hidden hover:shadow-card-hover transition-all hover:-translate-y-1">
                      {/* Image */}
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={car.image}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => togglePriceAlert(car.id, e)}
                            className={`p-2 rounded-xl backdrop-blur-sm transition-colors ${
                              priceAlerts[car.id]
                                ? 'bg-gold-400 text-charcoal-800'
                                : 'bg-white/80 text-charcoal-600 hover:bg-white'
                            }`}
                          >
                            <Bell className={`w-5 h-5 ${priceAlerts[car.id] ? 'fill-current' : ''}`} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleRemove(car.id, e)}
                            className="p-2 bg-naija-500 text-white rounded-xl backdrop-blur-sm"
                          >
                            <Heart className="w-5 h-5 fill-current" />
                          </motion.button>
                        </div>

                        {/* Compare Checkbox */}
                        <div className="absolute bottom-4 left-4">
                          <button
                            onClick={(e) => handleCompareToggle(car, e)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              compareList.find(c => c.id === car.id)
                                ? 'bg-naija-500 text-white'
                                : 'bg-white/90 text-charcoal-700 hover:bg-white'
                            }`}
                          >
                            <GitCompare className="w-4 h-4" />
                            {compareList.find(c => c.id === car.id) ? 'Selected' : 'Compare'}
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-display font-bold text-lg text-charcoal-800 group-hover:text-naija-500 transition-colors">
                              {car.year} {car.make} {car.model}
                            </h3>
                            <p className="text-charcoal-500 text-sm">{car.trim}</p>
                          </div>
                          {car.verified && (
                            <div className="verified-badge">
                              <BadgeCheck className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {/* Specs */}
                        <div className="flex flex-wrap gap-3 mb-4 text-sm text-charcoal-500">
                          <span className="flex items-center gap-1">
                            <Gauge className="w-4 h-4 text-naija-400" />
                            {car.mileage.toLocaleString()} km
                          </span>
                          <span className="flex items-center gap-1">
                            <Fuel className="w-4 h-4 text-naija-400" />
                            {car.fuelType}
                          </span>
                          <span className="flex items-center gap-1">
                            <Settings2 className="w-4 h-4 text-naija-400" />
                            {car.transmission?.slice(0, 4)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-charcoal-500 text-sm mb-4">
                          <MapPin className="w-4 h-4" />
                          {car.locationCity}, {car.locationState}
                        </div>

                        <div className="border-t border-pearl-200 pt-4 flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-display font-bold text-naija-500">
                              {formatPrice(car.price)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleShare(car, e)}
                              className="p-2 bg-pearl-100 text-charcoal-600 rounded-xl hover:bg-pearl-200 transition-colors"
                            >
                              <Share2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/car/${car.id}`);
                              }}
                              className="p-2 bg-naija-100 text-naija-600 rounded-xl hover:bg-naija-200 transition-colors"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {sortedFavorites.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/car/${car.id}`)}
                    className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="md:w-72 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
                        <img
                          src={car.image}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => handleCompareToggle(car, e)}
                          className={`absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                            compareList.find(c => c.id === car.id)
                              ? 'bg-naija-500 text-white'
                              : 'bg-white/90 text-charcoal-700'
                          }`}
                        >
                          <GitCompare className="w-3 h-3" />
                          Compare
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-display font-bold text-xl text-charcoal-800">
                                {car.year} {car.make} {car.model}
                              </h3>
                              <p className="text-charcoal-500">{car.trim} • {car.condition}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => togglePriceAlert(car.id, e)}
                                className={`p-2 rounded-xl transition-colors ${
                                  priceAlerts[car.id]
                                    ? 'bg-gold-100 text-gold-600'
                                    : 'bg-pearl-100 text-charcoal-500 hover:bg-pearl-200'
                                }`}
                              >
                                <Bell className={`w-5 h-5 ${priceAlerts[car.id] ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={(e) => handleRemove(car.id, e)}
                                className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-charcoal-500 mb-3">
                            <span className="flex items-center gap-1.5">
                              <Gauge className="w-4 h-4 text-naija-400" />
                              {car.mileage.toLocaleString()} km
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Fuel className="w-4 h-4 text-naija-400" />
                              {car.fuelType}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Settings2 className="w-4 h-4 text-naija-400" />
                              {car.transmission}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-naija-400" />
                              {car.locationCity}, {car.locationState}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-pearl-200">
                          <div>
                            <div className="text-2xl font-display font-bold text-naija-500">
                              {formatPrice(car.price)}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right mr-4">
                              <p className="text-sm text-charcoal-500">Listed by</p>
                              <p className="font-medium text-charcoal-700">{car.dealerName}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/car/${car.id}`);
                              }}
                              className="px-6 py-2.5 bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompareModal && compareList.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCompareModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-lifted max-w-5xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="sticky top-0 bg-white border-b border-pearl-200 p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-display font-bold text-charcoal-800">
                    Compare Cars
                  </h2>
                  <p className="text-charcoal-500">Side-by-side comparison of selected vehicles</p>
                </div>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="p-2 hover:bg-pearl-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid gap-6" style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}>
                  {/* Images Row */}
                  <div className="font-medium text-charcoal-500">Vehicle</div>
                  {compareList.map((car) => (
                    <div key={car.id} className="text-center">
                      <img
                        src={car.image}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-40 object-cover rounded-xl mb-3"
                      />
                      <h3 className="font-display font-bold text-charcoal-800">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <p className="text-charcoal-500 text-sm">{car.trim}</p>
                    </div>
                  ))}

                  {/* Price Row */}
                  <div className="font-medium text-charcoal-500 pt-4 border-t">Price</div>
                  {compareList.map((car) => (
                    <div key={car.id} className="text-center pt-4 border-t">
                      <span className="text-xl font-bold text-naija-500">{formatPrice(car.price)}</span>
                    </div>
                  ))}

                  {/* Specs Rows */}
                  {['condition', 'mileage', 'fuelType', 'transmission'].map((spec) => (
                    <>
                      <div key={spec} className="font-medium text-charcoal-500 capitalize pt-4 border-t">
                        {spec === 'fuelType' ? 'Fuel Type' : spec}
                      </div>
                      {compareList.map((car) => (
                        <div key={`${car.id}-${spec}`} className="text-center pt-4 border-t text-charcoal-700">
                          {spec === 'mileage' ? `${car[spec].toLocaleString()} km` : car[spec]}
                        </div>
                      ))}
                    </>
                  ))}

                  {/* Location Row */}
                  <div className="font-medium text-charcoal-500 pt-4 border-t">Location</div>
                  {compareList.map((car) => (
                    <div key={car.id} className="text-center pt-4 border-t text-charcoal-700">
                      {car.locationCity}, {car.locationState}
                    </div>
                  ))}

                  {/* Dealer Row */}
                  <div className="font-medium text-charcoal-500 pt-4 border-t">Seller</div>
                  {compareList.map((car) => (
                    <div key={car.id} className="text-center pt-4 border-t">
                      <p className="text-charcoal-700">{car.dealerName}</p>
                    </div>
                  ))}

                  {/* Action Row */}
                  <div className="pt-4 border-t"></div>
                  {compareList.map((car) => (
                    <div key={car.id} className="pt-4 border-t text-center">
                      <button
                        onClick={() => {
                          setShowCompareModal(false);
                          navigate(`/car/${car.id}`);
                        }}
                        className="px-6 py-2.5 bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors w-full"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
