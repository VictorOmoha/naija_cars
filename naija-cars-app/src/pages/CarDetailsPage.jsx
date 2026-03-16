import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, MapPin, Fuel, Settings2, Gauge,
  Calendar, Car, BadgeCheck, MessageCircle, Phone, Heart,
  Share2, Copy, Check, ArrowLeft, Eye, Shield
} from 'lucide-react';
import { listingsAPI } from '../services/api';
import useAuthStore from '../stores/authStore';
import { useApp } from '../context/AppContext';
import SeoHead from '../components/SeoHead';

const SITE_URL = 'https://naijacars.online';

// Social share helpers
function buildShareLinks(car, url) {
  const title = `${car.year} ${car.make} ${car.model}${car.trim ? ' ' + car.trim : ''}`;
  const price = `₦${parseFloat(car.price).toLocaleString()}`;
  const text = `Check out this ${title} for ${price} on Naija Cars! 🚗`;
  const encoded = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  return {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encoded}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encoded}&via=naijacars`,
    telegram: `https://t.me/share/url?url=${encoded}&text=${encodedText}`,
  };
}

export default function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { setIsSignInOpen, addToast } = useApp();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsAPI.getById(id),
  });

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      addToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Could not copy link', 'error');
    }
  };

  const handleNativeShare = async (car, url) => {
    const title = `${car.year} ${car.make} ${car.model}`;
    const text = `Check out this ${title} for ₦${parseFloat(car.price).toLocaleString()} on Naija Cars!`;
    try {
      await navigator.share({ title, text, url });
    } catch {
      setShowShareMenu(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pearl-100 pt-24">
        <div className="section-container py-8">
          <div className="bg-white rounded-3xl shadow-card overflow-hidden">
            <div className="aspect-video bg-pearl-200 animate-pulse" />
            <div className="p-8 space-y-4">
              <div className="h-10 bg-pearl-200 animate-pulse rounded-xl w-2/3" />
              <div className="h-8 bg-pearl-200 animate-pulse rounded-xl w-1/3" />
              <div className="grid grid-cols-4 gap-4 mt-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-pearl-200 animate-pulse rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <Car className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-charcoal-700 mb-2">Car Not Found</h2>
          <p className="text-charcoal-500 mb-6">This listing may have been removed or sold.</p>
          <Link to="/cars" className="px-6 py-3 bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors">
            Browse All Cars
          </Link>
        </div>
      </div>
    );
  }

  const car = data?.data?.data?.listing;
  if (!car) return null;

  const carTitle = `${car.year} ${car.make} ${car.model}${car.trim ? ' ' + car.trim : ''}`;
  const carPrice = parseFloat(car.price);
  const shareUrl = `${SITE_URL}/car/${car.id}`;
  const shareLinks = buildShareLinks(car, shareUrl);
  const mainImage = car.media?.[0]?.url;

  const conditionLabel = {
    FOREIGN_USED: 'Foreign Used',
    NIGERIAN_USED: 'Nigerian Used',
    BRAND_NEW: 'Brand New',
  }[car.condition] || car.condition?.replace(/_/g, ' ');

  const seoDescription = [
    `Buy this ${conditionLabel} ${carTitle}`,
    car.locationCity && `in ${car.locationCity}`,
    car.locationState && `${car.locationCity ? ',' : 'in'} ${car.locationState}.`,
    car.transmission && `${car.transmission} transmission,`,
    car.fuelType && `${car.fuelType}.`,
    `Listed on Naija Cars for ₦${carPrice.toLocaleString()}.`,
  ].filter(Boolean).join(' ');

  return (
    <>
      <SeoHead
        title={`${carTitle} – ₦${(carPrice / 1_000_000).toFixed(1)}M`}
        description={seoDescription}
        image={mainImage}
        url={`/car/${car.id}`}
        type="article"
      />

      <div className="min-h-screen bg-pearl-100 pt-24 pb-20">
        <div className="section-container">
          {/* Back navigation */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-charcoal-500 hover:text-naija-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to listings
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: images + details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-card overflow-hidden"
              >
                <div className="relative aspect-video bg-charcoal-200">
                  {car.media && car.media.length > 0 ? (
                    <>
                      <img
                        src={car.media[currentImageIndex]?.url}
                        alt={`${carTitle} - Photo ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Condition badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1.5 text-sm font-bold rounded-xl ${
                          car.condition === 'BRAND_NEW'
                            ? 'bg-emerald-500 text-white'
                            : car.condition === 'FOREIGN_USED'
                            ? 'bg-blue-500 text-white'
                            : 'bg-naija-500 text-white'
                        }`}>
                          {conditionLabel}
                        </span>
                      </div>

                      {/* Image counter */}
                      {car.media.length > 1 && (
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 text-white text-sm font-medium rounded-xl flex items-center gap-1.5">
                          <Eye className="w-4 h-4" />
                          {currentImageIndex + 1}/{car.media.length}
                        </div>
                      )}

                      {/* Nav arrows */}
                      {car.media.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImageIndex(i => i === 0 ? car.media.length - 1 : i - 1)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 hover:bg-black/75 text-white rounded-full transition-colors"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex(i => i === car.media.length - 1 ? 0 : i + 1)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 hover:bg-black/75 text-white rounded-full transition-colors"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}

                      {/* Dot indicators */}
                      {car.media.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {car.media.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`transition-all rounded-full ${
                                idx === currentImageIndex
                                  ? 'w-6 h-2.5 bg-white'
                                  : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-20 h-20 text-charcoal-300" />
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {car.media && car.media.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {car.media.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                          idx === currentImageIndex
                            ? 'border-naija-500 opacity-100'
                            : 'border-transparent opacity-60 hover:opacity-90'
                        }`}
                      >
                        <img src={img.url} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Car Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-card p-6 md:p-8"
              >
                <h1 className="text-3xl md:text-4xl font-display font-bold text-charcoal-800 mb-1">
                  {carTitle}
                </h1>
                {car.trim && (
                  <p className="text-lg text-charcoal-400 mb-4">{car.trim}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {car.locationState && (
                    <span className="flex items-center gap-1.5 text-charcoal-500 text-sm">
                      <MapPin className="w-4 h-4 text-naija-500" />
                      {[car.locationCity, car.locationState].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>

                {/* Specs grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { icon: Calendar, label: 'Year', value: car.year },
                    { icon: Gauge, label: 'Mileage', value: car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A' },
                    { icon: Settings2, label: 'Transmission', value: car.transmission },
                    { icon: Fuel, label: 'Fuel Type', value: car.fuelType },
                    car.bodyType && { icon: Car, label: 'Body Type', value: car.bodyType },
                    car.color && { icon: Car, label: 'Colour', value: car.color },
                    car.engineSize && { icon: Settings2, label: 'Engine', value: car.engineSize },
                    car.doors && { icon: Car, label: 'Doors', value: car.doors },
                  ].filter(Boolean).map(({ icon: Icon, label, value }) => (
                    <div key={label} className="p-4 bg-pearl-50 rounded-2xl">
                      <Icon className="w-5 h-5 text-naija-500 mb-2" />
                      <p className="text-xs text-charcoal-400 mb-0.5">{label}</p>
                      <p className="font-semibold text-charcoal-800 text-sm">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {car.description && (
                  <div className="mb-6">
                    <h2 className="text-xl font-display font-bold text-charcoal-800 mb-3">Description</h2>
                    <p className="text-charcoal-600 leading-relaxed whitespace-pre-line">{car.description}</p>
                  </div>
                )}

                {/* Features */}
                {car.features && car.features.length > 0 && (
                  <div>
                    <h2 className="text-xl font-display font-bold text-charcoal-800 mb-3">Features</h2>
                    <div className="flex flex-wrap gap-2">
                      {car.features.map((feature, i) => (
                        <span key={i} className="px-3 py-1.5 bg-naija-50 text-naija-700 text-sm rounded-xl">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: price, actions, seller */}
            <div className="space-y-6">
              {/* Price Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-3xl shadow-card p-6 sticky top-28"
              >
                <div className="mb-6">
                  <p className="text-sm text-charcoal-400 mb-1">Asking Price</p>
                  <div className="text-4xl font-display font-bold text-naija-600">
                    ₦{carPrice.toLocaleString()}
                  </div>
                  {carPrice >= 1_000_000 && (
                    <p className="text-charcoal-400 text-sm mt-1">
                      ≈ ₦{(carPrice / 1_000_000).toFixed(2)}M
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) { setIsSignInOpen(true); return; }
                      navigate(`/messages?sellerId=${car.seller?.id}&listingId=${car.id}`);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-naija-500 text-white font-semibold rounded-xl hover:bg-naija-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Message Seller
                  </button>

                  {car.seller?.phoneNumber && (
                    <a
                      href={`https://wa.me/${car.seller.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your ${carTitle} listed on Naija Cars. Is it still available?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#20BD5A] transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp Seller
                    </a>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsFavorite(f => !f)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all ${
                        isFavorite
                          ? 'bg-naija-50 border-naija-400 text-naija-600'
                          : 'border-pearl-300 text-charcoal-600 hover:border-naija-300'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-naija-500 text-naija-500' : ''}`} />
                      {isFavorite ? 'Saved' : 'Save'}
                    </button>

                    {/* Share button */}
                    <div className="relative flex-1">
                      <button
                        onClick={() => handleNativeShare(car, shareUrl)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-pearl-300 text-charcoal-600 hover:border-naija-300 font-medium transition-all"
                      >
                        <Share2 className="w-5 h-5" />
                        Share
                      </button>

                      {/* Share menu (shown when native share isn't supported) */}
                      {showShareMenu && (
                        <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-2xl shadow-lifted border border-pearl-200 overflow-hidden z-50">
                          <div className="p-3 border-b border-pearl-100">
                            <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">Share this car</p>
                          </div>
                          <div className="p-2 space-y-1">
                            {/* WhatsApp */}
                            <a
                              href={shareLinks.whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setShowShareMenu(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-pearl-50 transition-colors text-charcoal-700"
                            >
                              <span className="w-8 h-8 bg-[#25D366] rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              </span>
                              WhatsApp
                            </a>

                            {/* Facebook */}
                            <a
                              href={shareLinks.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setShowShareMenu(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-pearl-50 transition-colors text-charcoal-700"
                            >
                              <span className="w-8 h-8 bg-[#1877F2] rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                              </span>
                              Facebook
                            </a>

                            {/* Twitter / X */}
                            <a
                              href={shareLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setShowShareMenu(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-pearl-50 transition-colors text-charcoal-700"
                            >
                              <span className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                              </span>
                              X (Twitter)
                            </a>

                            {/* Telegram */}
                            <a
                              href={shareLinks.telegram}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setShowShareMenu(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-pearl-50 transition-colors text-charcoal-700"
                            >
                              <span className="w-8 h-8 bg-[#229ED9] rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                              </span>
                              Telegram
                            </a>

                            {/* Copy Link */}
                            <button
                              onClick={() => { handleCopyLink(shareUrl); setShowShareMenu(false); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-pearl-50 transition-colors text-charcoal-700"
                            >
                              <span className="w-8 h-8 bg-charcoal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                {copied ? <Check className="w-4 h-4 text-naija-500" /> : <Copy className="w-4 h-4 text-charcoal-600" />}
                              </span>
                              {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                          </div>

                          {/* Close overlay */}
                          <button
                            className="fixed inset-0 -z-10"
                            onClick={() => setShowShareMenu(false)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Share icons row (always visible) */}
                <div className="pt-4 border-t border-pearl-100">
                  <p className="text-xs text-charcoal-400 mb-3 text-center">Share this listing</p>
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={shareLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Share on WhatsApp"
                      className="w-10 h-10 bg-[#25D366] hover:bg-[#20BD5A] rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
                    <a
                      href={shareLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Share on Facebook"
                      className="w-10 h-10 bg-[#1877F2] hover:bg-[#166FE5] rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    <a
                      href={shareLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Share on X (Twitter)"
                      className="w-10 h-10 bg-black hover:bg-charcoal-700 rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a
                      href={shareLinks.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Share on Telegram"
                      className="w-10 h-10 bg-[#229ED9] hover:bg-[#1e8ec2] rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    </a>
                    <button
                      onClick={() => handleCopyLink(shareUrl)}
                      title="Copy link"
                      className="w-10 h-10 bg-charcoal-100 hover:bg-charcoal-200 rounded-full flex items-center justify-center transition-colors"
                    >
                      {copied
                        ? <Check className="w-4 h-4 text-naija-500" />
                        : <Copy className="w-4 h-4 text-charcoal-600" />
                      }
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Seller Info */}
              {car.seller && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-3xl shadow-card p-6"
                >
                  <h2 className="text-lg font-display font-bold text-charcoal-800 mb-4">Seller</h2>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-charcoal-100 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
                      {car.seller.profile?.businessLogoUrl ? (
                        <img
                          src={car.seller.profile.businessLogoUrl}
                          alt="Seller"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-charcoal-500">
                          {(car.seller.profile?.businessName || car.seller.email || 'S')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal-800">
                        {car.seller.profile?.businessName || 'Private Seller'}
                      </p>
                      {car.seller.profile?.verificationBadge && (
                        <span className="flex items-center gap-1 text-sm text-naija-600">
                          <BadgeCheck className="w-4 h-4" />
                          Verified Seller
                        </span>
                      )}
                      {car.seller.userType === 'DEALER' && (
                        <span className="flex items-center gap-1 text-sm text-charcoal-500">
                          <Shield className="w-4 h-4" />
                          Dealer Account
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/dealer/${car.seller.id}`}
                    className="text-sm text-naija-600 hover:text-naija-700 font-medium underline-offset-2 hover:underline"
                  >
                    View all listings from this seller →
                  </Link>
                </motion.div>
              )}

              {/* Safety tip */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-sm font-semibold text-amber-800 mb-1">Safety Tip</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Always inspect the car in person before payment. Never send money before seeing
                  the vehicle. Meet in a public place or at the seller's registered dealership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
