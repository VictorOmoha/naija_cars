import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, Phone, Mail, Globe, Clock, Star, BadgeCheck,
  Car, MessageCircle, Share2, Heart, ChevronRight, Filter, Grid, List,
  Calendar, Users, Shield, Award, ExternalLink, Facebook, Instagram, Twitter
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Mock dealer data
const mockDealer = {
  id: 1,
  name: 'Premium Motors Nigeria',
  type: 'DEALER',
  verified: true,
  premium: true,
  logo: 'https://ui-avatars.com/api/?name=Premium+Motors&background=008753&color=fff&size=200',
  coverImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200',
  description: 'Premium Motors Nigeria is the leading luxury and premium car dealership in Lagos. We specialize in foreign used and brand new vehicles from top manufacturers including Mercedes-Benz, BMW, Toyota, and Lexus. With over 15 years of experience, we pride ourselves on quality vehicles and exceptional customer service.',
  location: {
    address: '123 Admiralty Way, Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos',
  },
  contact: {
    phone: '+234 801 234 5678',
    whatsapp: '+234 801 234 5678',
    email: 'sales@premiummotorsng.com',
    website: 'www.premiummotorsng.com',
  },
  social: {
    facebook: 'https://facebook.com/premiummotors',
    instagram: 'https://instagram.com/premiummotors',
    twitter: 'https://twitter.com/premiummotors',
  },
  hours: {
    weekdays: '9:00 AM - 6:00 PM',
    saturday: '10:00 AM - 4:00 PM',
    sunday: 'Closed',
  },
  stats: {
    totalListings: 45,
    soldCars: 320,
    yearsInBusiness: 15,
    rating: 4.9,
    reviewCount: 156,
    responseRate: 98,
    responseTime: 'Within 1 hour',
  },
  badges: ['Top Seller', 'Fast Response', 'Trusted Dealer', 'Premium Partner'],
  specializations: ['Luxury Cars', 'SUVs', 'Executive Sedans', 'Sports Cars'],
};

const mockListings = [
  {
    id: 1,
    make: 'Mercedes-Benz',
    model: 'E350',
    year: 2022,
    trim: '4MATIC AMG Line',
    price: 45000000,
    mileage: 12000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    condition: 'Foreign Used',
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'],
    verified: true,
  },
  {
    id: 2,
    make: 'BMW',
    model: 'X7',
    year: 2023,
    trim: 'xDrive40i',
    price: 85000000,
    mileage: 5000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    condition: 'Brand New',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'],
    verified: true,
  },
  {
    id: 3,
    make: 'Lexus',
    model: 'RX350',
    year: 2021,
    trim: 'F-Sport',
    price: 38000000,
    mileage: 28000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    condition: 'Foreign Used',
    images: ['https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800'],
    verified: true,
  },
  {
    id: 4,
    make: 'Toyota',
    model: 'Land Cruiser',
    year: 2022,
    trim: 'VXR V8',
    price: 120000000,
    mileage: 8000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    condition: 'Brand New',
    images: ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800'],
    verified: true,
  },
];

const mockReviews = [
  {
    id: 1,
    author: 'Chinedu Okonkwo',
    avatar: 'https://ui-avatars.com/api/?name=Chinedu+Okonkwo&background=008753&color=fff',
    rating: 5,
    date: '2024-01-10',
    title: 'Excellent Service!',
    content: 'I bought my Mercedes E350 from Premium Motors and the experience was fantastic. The car was exactly as described, and they handled all the paperwork seamlessly. Highly recommended!',
    verified: true,
    carPurchased: '2022 Mercedes-Benz E350',
  },
  {
    id: 2,
    author: 'Amaka Nwosu',
    avatar: 'https://ui-avatars.com/api/?name=Amaka+Nwosu&background=FFB81C&color=1A1A1A',
    rating: 5,
    date: '2024-01-05',
    title: 'Professional and Trustworthy',
    content: 'Been buying cars from Premium Motors for 5 years now. They always deliver quality vehicles and stand behind their sales. Their after-sales support is top-notch.',
    verified: true,
    carPurchased: '2021 BMW X5',
  },
  {
    id: 3,
    author: 'Oluwaseun Adeyemi',
    avatar: 'https://ui-avatars.com/api/?name=Oluwaseun+Adeyemi&background=10B981&color=fff',
    rating: 4,
    date: '2023-12-20',
    title: 'Great Selection',
    content: 'Wide variety of luxury cars to choose from. Prices are fair for the quality. Only reason for 4 stars is that delivery took a bit longer than expected.',
    verified: true,
    carPurchased: '2023 Lexus RX350',
  },
];

export default function DealerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast, setIsSignInOpen } = useApp();
  const [activeTab, setActiveTab] = useState('listings');
  const [viewMode, setViewMode] = useState('grid');
  const [isFavorite, setIsFavorite] = useState(false);

  const dealer = mockDealer; // In real app, fetch by ID
  const listings = mockListings;
  const reviews = mockReviews;

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    }
    return `₦${price.toLocaleString()}`;
  };

  const handleContact = (type) => {
    if (type === 'whatsapp') {
      window.open(`https://wa.me/${dealer.contact.whatsapp.replace(/\D/g, '')}`, '_blank');
    } else if (type === 'call') {
      window.open(`tel:${dealer.contact.phone}`, '_blank');
    } else if (type === 'email') {
      window.open(`mailto:${dealer.contact.email}`, '_blank');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: dealer.name,
        text: `Check out ${dealer.name} on NaijaCars`,
        url: window.location.href,
      });
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-pearl-100">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 lg:h-96">
        <img
          src={dealer.coverImage}
          alt={dealer.name}
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="p-3 bg-white/90 text-charcoal-600 rounded-xl backdrop-blur-sm hover:bg-white"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
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
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-white shadow-card bg-white">
                  <img
                    src={dealer.logo}
                    alt={dealer.name}
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
                        {dealer.name}
                      </h1>
                      {dealer.verified && (
                        <div className="p-1.5 bg-naija-500 rounded-full">
                          <BadgeCheck className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-charcoal-500">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {dealer.location.city}, {dealer.location.state}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {dealer.hours.weekdays}
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="text-center px-6 py-3 bg-pearl-50 rounded-2xl">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-6 h-6 text-gold-500 fill-gold-500" />
                      <span className="text-2xl font-bold text-charcoal-800">{dealer.stats.rating}</span>
                    </div>
                    <p className="text-sm text-charcoal-500">{dealer.stats.reviewCount} reviews</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {dealer.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-naija-50 text-naija-700 text-sm font-medium rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                  {dealer.premium && (
                    <span className="px-3 py-1.5 bg-gold-100 text-gold-800 text-sm font-medium rounded-full flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Premium Partner
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-pearl-50 rounded-xl">
                    <Car className="w-6 h-6 text-naija-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-charcoal-800">{dealer.stats.totalListings}</div>
                    <div className="text-xs text-charcoal-500">Active Listings</div>
                  </div>
                  <div className="text-center p-3 bg-pearl-50 rounded-xl">
                    <Shield className="w-6 h-6 text-naija-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-charcoal-800">{dealer.stats.soldCars}+</div>
                    <div className="text-xs text-charcoal-500">Cars Sold</div>
                  </div>
                  <div className="text-center p-3 bg-pearl-50 rounded-xl">
                    <Calendar className="w-6 h-6 text-naija-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-charcoal-800">{dealer.stats.yearsInBusiness}</div>
                    <div className="text-xs text-charcoal-500">Years in Business</div>
                  </div>
                  <div className="text-center p-3 bg-pearl-50 rounded-xl">
                    <MessageCircle className="w-6 h-6 text-naija-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-charcoal-800">{dealer.stats.responseRate}%</div>
                    <div className="text-xs text-charcoal-500">Response Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="mt-6 pt-6 border-t border-pearl-200 flex flex-wrap gap-3">
              <button
                onClick={() => handleContact('whatsapp')}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-medium rounded-xl hover:bg-[#20BD5A] transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </button>
              <button
                onClick={() => handleContact('call')}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-naija-500 text-white font-medium rounded-xl hover:bg-naija-600 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </button>
              <button
                onClick={() => handleContact('email')}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border-2 border-naija-500 text-naija-600 font-medium rounded-xl hover:bg-naija-50 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email
              </button>
              {dealer.contact.website && (
                <button
                  onClick={() => window.open(`https://${dealer.contact.website}`, '_blank')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-pearl-100 text-charcoal-700 font-medium rounded-xl hover:bg-pearl-200 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  Website
                </button>
              )}
            </div>
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
              { id: 'reviews', label: 'Reviews', count: reviews.length },
              { id: 'contact', label: 'Contact' },
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
                {tab.count && (
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
                {listings.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/car/${car.id}`)}
                    className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all cursor-pointer group"
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={car.images[0]}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3">
                            <span className={`px-2 py-1 text-xs font-bold rounded ${
                              car.condition === 'Brand New' ? 'bg-emerald-500 text-white' : 'bg-naija-500 text-white'
                            }`}>
                              {car.condition}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-display font-bold text-lg text-charcoal-800 mb-1">
                            {car.year} {car.make} {car.model}
                          </h3>
                          <p className="text-charcoal-500 text-sm mb-3">{car.trim}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-naija-500">{formatPrice(car.price)}</span>
                            <span className="text-sm text-charcoal-500">{car.mileage.toLocaleString()} km</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex">
                        <div className="w-48 h-36 flex-shrink-0">
                          <img
                            src={car.images[0]}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <h3 className="font-display font-bold text-lg text-charcoal-800">
                              {car.year} {car.make} {car.model}
                            </h3>
                            <p className="text-charcoal-500 text-sm">{car.trim} • {car.condition}</p>
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
                ))}
              </div>
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
                  <h3 className="text-xl font-display font-bold text-charcoal-800 mb-4">About Us</h3>
                  <p className="text-charcoal-600 leading-relaxed">{dealer.description}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="text-xl font-display font-bold text-charcoal-800 mb-4">Specializations</h3>
                  <div className="flex flex-wrap gap-3">
                    {dealer.specializations.map((spec, index) => (
                      <span key={index} className="px-4 py-2 bg-pearl-100 text-charcoal-700 rounded-xl font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="text-xl font-display font-bold text-charcoal-800 mb-4">Business Hours</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Monday - Friday</span>
                      <span className="font-medium text-charcoal-800">{dealer.hours.weekdays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Saturday</span>
                      <span className="font-medium text-charcoal-800">{dealer.hours.saturday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Sunday</span>
                      <span className="font-medium text-charcoal-800">{dealer.hours.sunday}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="text-xl font-display font-bold text-charcoal-800 mb-4">Follow Us</h3>
                  <div className="flex gap-3">
                    {dealer.social.facebook && (
                      <a href={dealer.social.facebook} target="_blank" rel="noopener noreferrer"
                         className="p-3 bg-pearl-100 text-charcoal-600 rounded-xl hover:bg-naija-100 hover:text-naija-600 transition-colors">
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {dealer.social.instagram && (
                      <a href={dealer.social.instagram} target="_blank" rel="noopener noreferrer"
                         className="p-3 bg-pearl-100 text-charcoal-600 rounded-xl hover:bg-naija-100 hover:text-naija-600 transition-colors">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {dealer.social.twitter && (
                      <a href={dealer.social.twitter} target="_blank" rel="noopener noreferrer"
                         className="p-3 bg-pearl-100 text-charcoal-600 rounded-xl hover:bg-naija-100 hover:text-naija-600 transition-colors">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Rating Summary */}
              <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-charcoal-800 mb-2">{dealer.stats.rating}</div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-5 h-5 ${
                          star <= Math.floor(dealer.stats.rating) ? 'text-gold-500 fill-gold-500' : 'text-pearl-300'
                        }`} />
                      ))}
                    </div>
                    <p className="text-charcoal-500">{dealer.stats.reviewCount} reviews</p>
                  </div>

                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = rating === 5 ? 120 : rating === 4 ? 28 : rating === 3 ? 6 : rating === 2 ? 2 : 0;
                      const percentage = (count / dealer.stats.reviewCount) * 100;
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="text-sm text-charcoal-500 w-8">{rating} ★</span>
                          <div className="flex-1 h-2 bg-pearl-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold-400 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-charcoal-500 w-8">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-card p-6"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={review.avatar}
                        alt={review.author}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-charcoal-800">{review.author}</h4>
                              {review.verified && (
                                <span className="px-2 py-0.5 bg-naija-100 text-naija-700 text-xs font-medium rounded-full">
                                  Verified Buyer
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-charcoal-500">{review.carPurchased}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-4 h-4 ${
                                star <= review.rating ? 'text-gold-500 fill-gold-500' : 'text-pearl-300'
                              }`} />
                            ))}
                          </div>
                        </div>
                        <h5 className="font-medium text-charcoal-800 mb-2">{review.title}</h5>
                        <p className="text-charcoal-600">{review.content}</p>
                        <p className="text-sm text-charcoal-400 mt-3">
                          {new Date(review.date).toLocaleDateString('en-NG', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-6"
            >
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="text-xl font-display font-bold text-charcoal-800 mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-pearl-50 rounded-xl">
                    <div className="p-3 bg-naija-100 rounded-xl">
                      <MapPin className="w-6 h-6 text-naija-600" />
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-500">Address</p>
                      <p className="font-medium text-charcoal-800">{dealer.location.address}</p>
                      <p className="text-charcoal-600">{dealer.location.city}, {dealer.location.state}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-pearl-50 rounded-xl">
                    <div className="p-3 bg-naija-100 rounded-xl">
                      <Phone className="w-6 h-6 text-naija-600" />
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-500">Phone</p>
                      <a href={`tel:${dealer.contact.phone}`} className="font-medium text-naija-600 hover:text-naija-700">
                        {dealer.contact.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-pearl-50 rounded-xl">
                    <div className="p-3 bg-naija-100 rounded-xl">
                      <Mail className="w-6 h-6 text-naija-600" />
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-500">Email</p>
                      <a href={`mailto:${dealer.contact.email}`} className="font-medium text-naija-600 hover:text-naija-700">
                        {dealer.contact.email}
                      </a>
                    </div>
                  </div>

                  {dealer.contact.website && (
                    <div className="flex items-center gap-4 p-4 bg-pearl-50 rounded-xl">
                      <div className="p-3 bg-naija-100 rounded-xl">
                        <Globe className="w-6 h-6 text-naija-600" />
                      </div>
                      <div>
                        <p className="text-sm text-charcoal-500">Website</p>
                        <a href={`https://${dealer.contact.website}`} target="_blank" rel="noopener noreferrer"
                           className="font-medium text-naija-600 hover:text-naija-700 flex items-center gap-1">
                          {dealer.contact.website}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="h-full min-h-[400px] bg-pearl-100 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
                    <p className="text-charcoal-500">Map integration coming soon</p>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(dealer.location.address + ' ' + dealer.location.city)}`, '_blank')}
                      className="mt-4 px-6 py-2 bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors"
                    >
                      Open in Google Maps
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
