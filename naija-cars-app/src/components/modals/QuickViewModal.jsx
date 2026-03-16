import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Heart, MapPin, Gauge, Fuel, Settings2,
  BadgeCheck, Phone, MessageCircle, ChevronLeft, ChevronRight,
  Star, Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { listingsAPI } from '../../services/api';
import useAuthStore from '../../stores/authStore';
import SharePopover from '../SharePopover';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://naija-cars-api.onrender.com';

const QuickViewModal = () => {
  const { isQuickViewOpen, selectedCar, closeQuickView, addToast, setIsSignInOpen } = useApp();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  if (!selectedCar) return null;

  const isSale = selectedCar.type === 'sale';
  const price = isSale ? selectedCar.price : selectedCar.pricePerDay;
  const priceLabel = isSale ? '' : '/day';

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    }
    return `₦${price.toLocaleString()}`;
  };

  const handleContact = (method) => {
    if (!isAuthenticated) {
      closeQuickView();
      setIsSignInOpen(true);
      return;
    }
    if (method === 'phone') {
      const phone = selectedCar.dealer?.phone || selectedCar.company?.phone || selectedCar.seller?.phoneNumber;
      if (phone) {
        window.open(`tel:${phone}`, '_self');
      } else {
        addToast('Phone number not available', 'info');
      }
    } else {
      closeQuickView();
      navigate(`/messages?sellerId=${selectedCar.sellerId || selectedCar.seller?.id}&listingId=${selectedCar.id}`);
    }
  };

  const shareUrl = selectedCar?.id
    ? `${API_BASE}/share/car/${selectedCar.id}`
    : window.location.href;
  const shareText = selectedCar
    ? `Check out this ${selectedCar.year} ${selectedCar.make} ${selectedCar.model} on Naija Cars! 🚗`
    : 'Check out this listing on Naija Cars!';

  return (
    <AnimatePresence>
      {isQuickViewOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          onClick={closeQuickView}
        >
          <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-white border border-pearl-200
                     rounded-3xl shadow-card-hover overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="grid md:grid-cols-2">
              {/* Left - Image Gallery */}
              <div className="relative h-72 md:h-full min-h-[400px] bg-pearl-100">
                <img
                  src={selectedCar.images[currentImage]}
                  alt={`${selectedCar.make} ${selectedCar.model}`}
                  className="w-full h-full object-cover"
                />

                {/* Image Navigation */}
                {selectedCar.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage((prev) =>
                        prev === 0 ? selectedCar.images.length - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90
                               rounded-xl text-charcoal-700 hover:bg-white transition-colors shadow-card"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImage((prev) =>
                        prev === selectedCar.images.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90
                               rounded-xl text-charcoal-700 hover:bg-white transition-colors shadow-card"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Type Badge */}
                <div className="absolute top-4 left-4">
                  <span className={isSale ? 'tag-sale' : 'tag-rent'}>
                    {isSale ? 'For Sale' : 'For Rent'}
                  </span>
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5
                             bg-white/90 rounded-xl text-xs text-charcoal-700 font-medium shadow-card">
                  {currentImage + 1} / {selectedCar.images.length}
                </div>
              </div>

              {/* Right - Details */}
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-2xl font-semibold text-charcoal-800 leading-tight">
                      {selectedCar.year} {selectedCar.make} {selectedCar.model}
                    </h2>
                    <p className="text-charcoal-600">{selectedCar.trim}</p>
                  </div>
                  {/* Action buttons — no absolute close button so nothing overlaps */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={async () => {
                        if (!isAuthenticated) {
                          addToast('Please sign in to save favorites', 'info');
                          return;
                        }
                        try {
                          const { data } = await listingsAPI.toggleFavorite(selectedCar.id);
                          setIsLiked(data.data.isFavorited);
                          addToast(data.data.isFavorited ? 'Added to favorites!' : 'Removed from favorites', 'info');
                        } catch {
                          addToast('Failed to update favorite', 'error');
                        }
                      }}
                      className={`p-2.5 rounded-xl transition-colors ${
                        isLiked
                          ? 'bg-naija-500 text-white'
                          : 'bg-pearl-100 text-charcoal-700 hover:text-naija-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    </motion.button>
                    <SharePopover url={shareUrl} text={shareText} />
                    <button
                      onClick={closeQuickView}
                      className="p-2.5 bg-pearl-100 text-charcoal-600 hover:text-charcoal-800
                               hover:bg-pearl-200 rounded-xl transition-colors"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-bold text-naija-500">
                    {formatPrice(price)}
                  </span>
                  {priceLabel && <span className="text-charcoal-600">{priceLabel}</span>}
                </div>

                {/* Verification Badge */}
                {selectedCar.verified && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border
                               border-emerald-200 rounded-xl text-emerald-700">
                    <BadgeCheck className="w-5 h-5" />
                    <span className="font-medium">Verified Listing</span>
                  </div>
                )}

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {isSale ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-pearl-100 rounded-xl">
                        <Gauge className="w-5 h-5 text-naija-500" />
                        <div>
                          <p className="text-xs text-charcoal-600">Mileage</p>
                          <p className="text-sm text-charcoal-700 font-medium">{selectedCar.mileage?.toLocaleString()} km</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-pearl-100 rounded-xl">
                        <Settings2 className="w-5 h-5 text-naija-500" />
                        <div>
                          <p className="text-xs text-charcoal-600">Transmission</p>
                          <p className="text-sm text-charcoal-700 font-medium">{selectedCar.transmission}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-pearl-100 rounded-xl">
                        <Fuel className="w-5 h-5 text-naija-500" />
                        <div>
                          <p className="text-xs text-charcoal-600">Fuel Type</p>
                          <p className="text-sm text-charcoal-700 font-medium">{selectedCar.fuelType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-pearl-100 rounded-xl">
                        <Shield className="w-5 h-5 text-naija-500" />
                        <div>
                          <p className="text-xs text-charcoal-600">Condition</p>
                          <p className="text-sm text-charcoal-700 font-medium">{selectedCar.condition}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-pearl-100 rounded-xl">
                        <Settings2 className="w-5 h-5 text-naija-500" />
                        <div>
                          <p className="text-xs text-charcoal-600">Transmission</p>
                          <p className="text-sm text-charcoal-700 font-medium">{selectedCar.transmission}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-pearl-100 rounded-xl">
                        <Fuel className="w-5 h-5 text-naija-500" />
                        <div>
                          <p className="text-xs text-charcoal-600">Fuel Type</p>
                          <p className="text-sm text-charcoal-700 font-medium">{selectedCar.fuelType}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-charcoal-500">
                  <MapPin className="w-5 h-5" />
                  <span>{selectedCar.location.city}, {selectedCar.location.state}</span>
                </div>

                {/* Features (for rentals) */}
                {!isSale && selectedCar.features && (
                  <div>
                    <p className="text-sm text-charcoal-600 mb-2">Features</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCar.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1.5 bg-pearl-100 rounded-xl text-xs text-charcoal-600 font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seller Info */}
                <div className="p-4 bg-pearl-100 rounded-xl border border-pearl-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-naija-100 rounded-xl flex items-center justify-center
                                   text-naija-700 font-bold">
                        {(selectedCar.dealer?.name || selectedCar.company?.name)?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal-800">
                          {selectedCar.dealer?.name || selectedCar.company?.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-gold-500 fill-current" />
                          <span className="text-sm text-charcoal-500">
                            {selectedCar.dealer?.rating || selectedCar.company?.rating}
                          </span>
                          {(selectedCar.dealer?.verified || selectedCar.company?.verified) && (
                            <BadgeCheck className="w-4 h-4 text-emerald-500 ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleContact('phone')}
                      className="flex items-center justify-center gap-2 py-3 bg-naija-500
                               text-white font-semibold rounded-xl shadow-button transition-all
                               hover:bg-naija-600"
                    >
                      <Phone className="w-5 h-5" />
                      Call
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleContact('message')}
                      className="flex items-center justify-center gap-2 py-3 border-2 border-naija-500
                               text-naija-500 font-semibold rounded-xl hover:bg-naija-500
                               hover:text-white transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Message
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
