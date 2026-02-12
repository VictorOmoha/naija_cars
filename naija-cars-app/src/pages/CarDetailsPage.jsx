import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { listingsAPI } from '../services/api';
import useAuthStore from '../stores/authStore';
import { useApp } from '../context/AppContext';

export default function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { setIsSignInOpen } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsAPI.getById(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-naija-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-charcoal-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Car not found</p>
        </div>
      </div>
    );
  }

  const car = data?.data?.data?.listing;

  if (!car) return null;

  return (
    <div className="min-h-screen bg-pearl-100 pt-32 pb-20">
      <div className="container-custom">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {/* Image Gallery */}
          <div className="relative aspect-video bg-charcoal-200">
            {car.media && car.media.length > 0 ? (
              <>
                <img
                  src={car.media[currentImageIndex]?.url}
                  alt={`${car.make} ${car.model} - Photo ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {car.media.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(i => i === 0 ? car.media.length - 1 : i - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(i => i === car.media.length - 1 ? 0 : i + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {car.media.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-colors ${
                            idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-charcoal-400">
                No image available
              </div>
            )}
          </div>

          {/* Car Details */}
          <div className="p-8">
            <h1 className="text-4xl font-display font-bold text-charcoal-700 mb-2">
              {car.year} {car.make} {car.model}
            </h1>
            {car.trim && (
              <p className="text-xl text-charcoal-500 mb-6">{car.trim}</p>
            )}

            <div className="text-3xl font-bold text-naija-600 mb-8">
              ₦{parseFloat(car.price).toLocaleString()}
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div>
                <p className="text-charcoal-400 text-sm mb-1">Mileage</p>
                <p className="text-charcoal-700 font-semibold">
                  {car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-charcoal-400 text-sm mb-1">Transmission</p>
                <p className="text-charcoal-700 font-semibold">{car.transmission}</p>
              </div>
              <div>
                <p className="text-charcoal-400 text-sm mb-1">Fuel Type</p>
                <p className="text-charcoal-700 font-semibold">{car.fuelType}</p>
              </div>
              <div>
                <p className="text-charcoal-400 text-sm mb-1">Condition</p>
                <p className="text-charcoal-700 font-semibold">
                  {car.condition.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-display font-bold text-charcoal-700 mb-4">
                  Description
                </h2>
                <p className="text-charcoal-600 leading-relaxed whitespace-pre-line">
                  {car.description}
                </p>
              </div>
            )}

            {/* Location */}
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-charcoal-700 mb-4">
                Location
              </h2>
              <p className="text-charcoal-600">
                {car.locationCity}, {car.locationState}
              </p>
            </div>

            {/* Seller Info */}
            {car.seller && (
              <div className="border-t pt-8">
                <h2 className="text-2xl font-display font-bold text-charcoal-700 mb-4">
                  Seller Information
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-charcoal-200 rounded-full flex items-center justify-center">
                    {car.seller.profile?.businessLogoUrl ? (
                      <img
                        src={car.seller.profile.businessLogoUrl}
                        alt="Seller"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-charcoal-600">
                        {car.seller.profile?.businessName?.[0] || car.seller.email[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-700">
                      {car.seller.profile?.businessName || 'Private Seller'}
                    </p>
                    {car.seller.profile?.verificationBadge && (
                      <span className="text-sm text-success-600">✓ Verified</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      setIsSignInOpen(true);
                      return;
                    }
                    navigate(`/messages?sellerId=${car.seller.id}&listingId=${car.id}`);
                  }}
                  className="mt-6 w-full md:w-auto px-8 py-3 bg-naija-500 text-white rounded-lg hover:bg-naija-600 transition-colors"
                >
                  Contact Seller
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
