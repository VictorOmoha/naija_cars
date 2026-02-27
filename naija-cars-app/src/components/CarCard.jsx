import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, MapPin, Gauge, Fuel, Settings2, BadgeCheck,
  ChevronLeft, ChevronRight, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { listingsAPI } from '../services/api';
import useAuthStore from '../stores/authStore';

const CarCard = ({ car, index = 0, variant = 'sale' }) => {
  const { openQuickView, addToast } = useApp();
  const { isAuthenticated } = useAuthStore();
  const [isLiked, setIsLiked] = useState(car.isFavorited || false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    }
    return `₦${price.toLocaleString()}`;
  };

  const isSale = variant === 'sale' || car.type === 'sale';
  const price = isSale ? car.price : car.pricePerDay;
  const priceLabel = isSale ? '' : '/day';

  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast('Please sign in to save favorites', 'info');
      return;
    }
    try {
      const { data } = await listingsAPI.toggleFavorite(car.id);
      setIsLiked(data.data.isFavorited);
      addToast(data.data.isFavorited ? 'Added to favorites!' : 'Removed from favorites', 'info');
    } catch {
      addToast('Failed to update favorite', 'error');
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(car);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-pointer"
      onClick={handleQuickView}
    >
      <div className="card-warm overflow-hidden hover-lift">
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden rounded-t-3xl">
          {/* Images */}
          <motion.img
            src={car.images[currentImage]}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={isSale ? 'tag-sale' : 'tag-rent'}>
              {isSale ? 'For Sale' : 'For Rent'}
            </span>
            {car.featured && (
              <span className="bg-gold-400 text-charcoal-900 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                Featured
              </span>
            )}
          </div>

          {/* Like Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLikeClick}
            className={`absolute top-4 right-4 p-2.5 rounded-xl backdrop-blur-sm transition-all duration-300
                      ${isLiked
                        ? 'bg-naija-500 text-white'
                        : 'bg-white/80 text-charcoal-600 hover:bg-white'
                      }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>

          {/* Image Navigation (only show if multiple images) */}
          {car.images.length > 1 && isHovered && (
            <>
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImage((prev) => (prev === 0 ? car.images.length - 1 : prev - 1));
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90
                         rounded-xl text-charcoal-700 hover:bg-white transition-colors shadow-card"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImage((prev) => (prev === car.images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90
                         rounded-xl text-charcoal-700 hover:bg-white transition-colors shadow-card"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </>
          )}

          {/* Quick View Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
          >
            <button
              onClick={handleQuickView}
              className="flex items-center gap-2 px-5 py-2.5 bg-naija-500 text-white
                       font-semibold text-sm rounded-xl shadow-button transition-all hover:bg-naija-600"
            >
              <Eye className="w-4 h-4" />
              Quick View
            </button>
          </motion.div>

          {/* Image Dots */}
          {car.images.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-1.5">
              {car.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImage(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentImage === idx ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title & Verification */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-charcoal-800 group-hover:text-naija-500
                           transition-colors duration-300">
                {car.year} {car.make} {car.model}
              </h3>
              <p className="text-sm text-charcoal-600">{car.trim}</p>
            </div>
            {car.verified && (
              <div className="verified-badge">
                <BadgeCheck className="w-4 h-4" />
                Verified
              </div>
            )}
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {isSale ? (
              <>
                <div className="flex items-center gap-1.5 text-charcoal-500">
                  <Gauge className="w-4 h-4 text-naija-400" />
                  <span className="text-xs">{car.mileage?.toLocaleString()} km</span>
                </div>
                <div className="flex items-center gap-1.5 text-charcoal-500">
                  <Fuel className="w-4 h-4 text-naija-400" />
                  <span className="text-xs">{car.fuelType}</span>
                </div>
                <div className="flex items-center gap-1.5 text-charcoal-500">
                  <Settings2 className="w-4 h-4 text-naija-400" />
                  <span className="text-xs">{car.transmission?.slice(0, 4)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-charcoal-500">
                  <Settings2 className="w-4 h-4 text-naija-400" />
                  <span className="text-xs">{car.transmission}</span>
                </div>
                <div className="flex items-center gap-1.5 text-charcoal-500">
                  <Fuel className="w-4 h-4 text-naija-400" />
                  <span className="text-xs">{car.fuelType}</span>
                </div>
                <div className="flex items-center gap-1.5 text-charcoal-500">
                  <span className="text-xs">{car.seats} Seats</span>
                </div>
              </>
            )}
          </div>

          {/* Condition Tag (for sale cars) */}
          {isSale && car.condition && (
            <div className="mb-4">
              <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-medium
                            ${car.condition === 'Brand New'
                              ? 'bg-emerald-100 text-emerald-700'
                              : car.condition === 'Foreign Used'
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-gold-100 text-gold-900'
                            }`}>
                {car.condition}
              </span>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-1.5 text-charcoal-600 text-sm mb-4">
            <MapPin className="w-4 h-4" />
            {car.location.city}, {car.location.state}
          </div>

          {/* Divider */}
          <div className="border-t border-pearl-300 pt-4">
            <div className="flex items-center justify-between">
              {/* Price */}
              <div>
                <span className="text-2xl font-display font-bold text-naija-500">
                  {formatPrice(price)}
                </span>
                {priceLabel && (
                  <span className="text-sm text-charcoal-600">{priceLabel}</span>
                )}
              </div>

              {/* Dealer Info */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-pearl-200 rounded-xl flex items-center justify-center
                              text-naija-500 text-xs font-bold">
                  {(car.dealer?.name || car.company?.name)?.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs text-charcoal-600 font-medium truncate max-w-[100px]">
                    {car.dealer?.name || car.company?.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gold-500 text-xs">★</span>
                    <span className="text-xs text-charcoal-600">
                      {car.dealer?.rating || car.company?.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CarCard;
