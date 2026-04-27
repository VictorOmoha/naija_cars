import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, Phone, Mail, Globe, Clock, Star, BadgeCheck,
  Car, MessageCircle, Heart, ChevronRight, Filter, Grid, List,
  Calendar, Users, Shield, Award, ExternalLink, Facebook, Instagram, Twitter,
  AlertCircle, ArrowLeft
} from 'lucide-react';
import { usersAPI } from '../services/api';
import SharePopover from '../components/SharePopover';

export default function DealerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('listings');
  const [viewMode, setViewMode] = useState('grid');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchDealer = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userRes, listingsRes] = await Promise.all([
          usersAPI.getById(id),
          usersAPI.getListings(id, { limit: 20 })
        ]);

        const user = userRes.data?.data?.user;
        if (!user) throw new Error('Dealer not found');

        setDealer(user);
        setListings(listingsRes.data?.data?.listings || []);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Dealer not found');
      } finally {
        setLoading(false);
      }
    };

    fetchDealer();
  }, [id]);

  const formatPrice = (price) => {
    if (price >= 1000000) return `₦${(price / 1000000).toFixed(1)}M`;
    return `₦${price.toLocaleString()}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-pearl-100 pt-24">
        <div className="section-container">
          {/* Cover skeleton */}
          <div className="h-64 bg-pearl-300 animate-pulse rounded-3xl mb-8" />
          <div className="bg-white rounded-3xl shadow-lifted p-8">
            <div className="flex gap-6">
              <div className="w-36 h-36 bg-pearl-200 animate-pulse rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-pearl-200 animate-pulse rounded-xl w-64" />
                <div className="h-4 bg-pearl-200 animate-pulse rounded-xl w-48" />
                <div className="h-4 bg-pearl-200 animate-pulse rounded-xl w-full max-w-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error / not found state
  if (error || !dealer) {
    return (
      <div className="min-h-screen bg-pearl-100 flex items-center justify-center pt-24">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-naija-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-naija-500" />
          </div>
          <h2 className="text-2xl font-display font-bold text-charcoal-800 mb-3">
            Dealer Not Found
          </h2>
          <p className="text-charcoal-500 mb-8">
            {error || 'This dealer profile does not exist or may have been removed.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/cars"
              className="inline-flex items-center gap-2 px-6 py-3 bg-naija-500 text-white font-medium rounded-xl hover:bg-naija-600 transition-colors"
            >
              <Car className="w-5 h-5" />
              Browse All Cars
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-charcoal-200 text-charcoal-700 font-medium rounded-xl hover:bg-pearl-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const profile = dealer.profile || {};
  const dealerName = profile.firstName && profile.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : dealer.email?.split('@')[0] || 'Dealer';

  const dealerLocation = [profile.city, profile.state].filter(Boolean).join(', ') || 'Nigeria';

  const dealerShareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const dealerShareText = `Check out ${dealerName} on Naija Cars! 🚗`;

  const coverImage = profile.coverImage
    || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200';

  const avatarUrl = profile.avatarUrl || profile.businessLogoUrl
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(dealerName)}&background=008753&color=fff&size=200`;

  return (
    <div className="min-h-screen bg-pearl-100">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 lg:h-96">
        <img
          src={coverImage}
          alt={dealerName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Floating Actions */}
        <div className="absolute top-28 right-4 md:right-8 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-3 rounded-xl backdrop-blur-sm transition-colors ${
              isFavorite ? 'bg-naija-500 text-white' : 'bg-white/90 text-charcoal-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </motion.button>
          <div className="bg-white/90 rounded-xl backdrop-blur-sm">
            <SharePopover url={dealerShareUrl} text={dealerShareText} />
          </div>
        </div>
      </div>

      {/* Dealer Info Card */}
      <div className="section-container -mt-24 relative z-10 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lifted overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-white shadow-card bg-white">
                  <img
                    src={avatarUrl}
                    alt={dealerName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl md:text-3xl font-display font-bold text-charcoal-800">
                        {dealerName}
                      </h1>
                      {dealer.isVerified && (
                        <div className="p-1.5 bg-naija-500 rounded-full">
                          <BadgeCheck className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-charcoal-500">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {dealerLocation}
                      </span>
                      <span className="flex items-center gap-1.5 capitalize">
                        <Building2 className="w-4 h-4" />
                        {dealer.userType?.toLowerCase() === 'dealer' ? 'Verified Dealer' : 'Individual Seller'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {dealer.isVerified && (
                    <span className="px-3 py-1.5 bg-naija-50 text-naija-700 text-sm font-medium rounded-full">
                      Verified
                    </span>
                  )}
                  {dealer.userType === 'DEALER' && (
                    <span className="px-3 py-1.5 bg-gold-100 text-gold-800 text-sm font-medium rounded-full flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Dealer Account
                    </span>
                  )}
                  {dealer._count?.listings > 0 && (
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                      {dealer._count.listings} Active {dealer._count.listings === 1 ? 'Listing' : 'Listings'}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-pearl-50 rounded-xl">
                    <Car className="w-6 h-6 text-naija-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-charcoal-800">{dealer._count?.listings ?? 0}</div>
                    <div className="text-xs text-charcoal-500">Active Listings</div>
                  </div>
                  <div className="text-center p-3 bg-pearl-50 rounded-xl">
                    <Shield className="w-6 h-6 text-naija-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-charcoal-800">
                      {dealer.isVerified ? 'Yes' : 'No'}
                    </div>
                    <div className="text-xs text-charcoal-500">Verified</div>
                  </div>
                  <div className="text-center p-3 bg-pearl-50 rounded-xl">
                    <Calendar className="w-6 h-6 text-naija-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-charcoal-800">
                      {new Date(dealer.createdAt).getFullYear()}
                    </div>
                    <div className="text-xs text-charcoal-500">Member Since</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Buttons */}
            {dealer.phoneNumber && (
              <div className="mt-6 pt-6 border-t border-pearl-200 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${dealer.phoneNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-medium rounded-xl hover:bg-[#20BD5A] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
                <a
                  href={`tel:${dealer.phoneNumber}`}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-naija-500 text-white font-medium rounded-xl hover:bg-naija-600 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Tabs Section */}
      <div className="section-container pb-20">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-card mb-6 p-2">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'listings', label: 'Inventory', count: listings.length },
              { id: 'about', label: 'About' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-naija-500 text-white'
                    : 'text-charcoal-600 hover:bg-pearl-100'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-pearl-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Listings Tab */}
          {activeTab === 'listings' && (
            <motion.div
              key="listings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {listings.length === 0 ? (
                <div className="text-center py-16">
                  <Car className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
                  <h3 className="text-xl font-display font-semibold text-charcoal-600 mb-2">
                    No active listings
                  </h3>
                  <p className="text-charcoal-400">This dealer has no cars listed right now.</p>
                </div>
              ) : (
                <>
                  {/* Toolbar */}
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-charcoal-600">
                      Showing <span className="font-semibold">{listings.length}</span> vehicles
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-xl transition-all ${
                          viewMode === 'grid' ? 'bg-naija-500 text-white' : 'bg-white text-charcoal-600'
                        }`}
                      >
                        <Grid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-xl transition-all ${
                          viewMode === 'list' ? 'bg-naija-500 text-white' : 'bg-white text-charcoal-600'
                        }`}
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Grid */}
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {listings.map((car, index) => {
                      const carImage = car.media?.[0]?.url
                        || 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800';
                      return (
                        <motion.div
                          key={car.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => navigate(`/car/${car.id}`)}
                          className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all cursor-pointer group"
                        >
                          {viewMode === 'grid' ? (
                            <>
                              <div className="relative h-48 overflow-hidden">
                                <img
                                  src={carImage}
                                  alt={`${car.make} ${car.model}`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3">
                                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                                    car.condition === 'BRAND_NEW' ? 'bg-emerald-500 text-white' : 'bg-naija-500 text-white'
                                  }`}>
                                    {car.condition?.replace('_', ' ') || 'Used'}
                                  </span>
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="font-display font-bold text-lg text-charcoal-800 mb-1">
                                  {car.year} {car.make} {car.model}
                                </h3>
                                {car.trim && <p className="text-charcoal-500 text-sm mb-3">{car.trim}</p>}
                                <div className="flex items-center justify-between">
                                  <span className="text-xl font-bold text-naija-500">{formatPrice(car.price)}</span>
                                  {car.mileage && (
                                    <span className="text-sm text-charcoal-500">
                                      {car.mileage.toLocaleString()} km
                                    </span>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex">
                              <div className="w-48 h-36 flex-shrink-0">
                                <img
                                  src={carImage}
                                  alt={`${car.make} ${car.model}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                  <h3 className="font-display font-bold text-lg text-charcoal-800">
                                    {car.year} {car.make} {car.model}
                                  </h3>
                                  <p className="text-charcoal-500 text-sm">
                                    {car.trim && `${car.trim} • `}{car.condition?.replace('_', ' ')}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xl font-bold text-naija-500">{formatPrice(car.price)}</span>
                                  <button className="px-4 py-2 bg-naija-500 text-white rounded-lg hover:bg-naija-600 transition-colors">
                                    View Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="text-xl font-display font-bold text-charcoal-800 mb-4">About</h3>
                  <p className="text-charcoal-600 leading-relaxed">
                    {profile.about || `${dealerName} is a trusted seller on NaijaCars. Browse their inventory above.`}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="text-xl font-display font-bold text-charcoal-800 mb-4">Location</h3>
                  <div className="flex items-start gap-3 text-charcoal-600">
                    <MapPin className="w-5 h-5 text-naija-500 flex-shrink-0 mt-0.5" />
                    <span>{dealerLocation}</span>
                  </div>
                  {dealerLocation !== 'Nigeria' && (
                    <button
                      onClick={() => window.open(
                        `https://www.google.com/maps/search/${encodeURIComponent(dealerLocation + ', Nigeria')}`,
                        '_blank'
                      )}
                      className="mt-4 w-full px-4 py-2.5 bg-naija-50 text-naija-700 text-sm font-medium rounded-xl hover:bg-naija-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Google Maps
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="text-xl font-display font-bold text-charcoal-800 mb-4">Member Since</h3>
                  <p className="text-charcoal-600">
                    {new Date(dealer.createdAt).toLocaleDateString('en-NG', {
                      year: 'numeric', month: 'long'
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
