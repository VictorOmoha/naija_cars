import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  Car, MapPin, Clock, Shield, CheckCircle, ArrowRight,
  ChevronLeft, User, Phone, Mail, Lock, Sparkles,
  Truck, FileText, BadgeCheck, Gift, Tag, Minus, Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import useAuthStore from '../stores/authStore';
import api from '../services/api';
import { rentalCars } from '../data/cars';

export default function BookingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { user, isAuthenticated } = useAuthStore();

  const bookingType = searchParams.get('type') || 'purchase'; // 'purchase' or 'rental'

  const [step, setStep] = useState(1);
  const [rentalDays, setRentalDays] = useState(3);
  const [selectedPayment, setSelectedPayment] = useState('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [addons, setAddons] = useState({
    insurance: false,
    delivery: false,
    inspection: false,
  });

  const { register, formState: { errors }, getValues } = useForm({
    defaultValues: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      email: user?.email || '',
      phone: user?.profile?.phone || '',
    }
  });

  // Fetch real listing data
  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const localRental = rentalCars.find((car) => String(car.id) === String(id));
      if (bookingType === 'rental' && localRental) {
        return {
          id: String(localRental.id),
          make: localRental.make,
          model: localRental.model,
          year: localRental.year,
          trim: localRental.trim,
          price: localRental.pricePerDay,
          pricePerDay: localRental.pricePerDay,
          transmission: localRental.transmission,
          fuelType: localRental.fuelType,
          locationCity: localRental.location?.city || '',
          locationState: localRental.location?.state || '',
          media: localRental.images?.map((url, index) => ({ url, displayOrder: index })) || [],
          seller: {
            profile: { businessName: localRental.company?.name || 'Rental Partner' },
          },
          localOnly: true,
        };
      }

      const response = await api.get(`/listings/${id}`);
      return response.data.data.listing;
    },
    enabled: !!id,
  });

  // Derived values from listing
  const carPrice = listing ? parseFloat(listing.price) : 0;
  // For rentals, estimate a daily price (if not on the schema, derive from price)
  const pricePerDay = listing?.pricePerDay || Math.round(carPrice * 0.01);
  const carName = listing ? `${listing.year} ${listing.make} ${listing.model}` : '';
  const carImage = listing?.media?.[0]?.url || listing?.media?.[0]?.thumbnailUrl || null;
  const carLocation = listing ? `${listing.locationCity}, ${listing.locationState}` : '';
  const sellerName = listing?.seller?.profile?.businessName
    || (listing?.seller?.profile ? `${listing.seller.profile.firstName || ''} ${listing.seller.profile.lastName || ''}`.trim() : '')
    || listing?.seller?.email || '';

  // Calculate prices
  const basePrice = bookingType === 'rental' ? pricePerDay * rentalDays : carPrice;
  const insuranceFee = addons.insurance ? (bookingType === 'rental' ? 15000 * rentalDays : 500000) : 0;
  const deliveryFee = addons.delivery ? 50000 : 0;
  const inspectionFee = addons.inspection ? 75000 : 0;
  const serviceFee = bookingType === 'rental' ? 5000 : basePrice * 0.01;
  const promoDiscount = promoApplied ? (bookingType === 'rental' ? 20000 : basePrice * 0.05) : 0;
  const totalPrice = basePrice + insuranceFee + deliveryFee + inspectionFee + serviceFee - promoDiscount;

  const formatPrice = (price) => {
    if (price >= 1000000) return `₦${(price / 1000000).toFixed(2)}M`;
    return `₦${price.toLocaleString()}`;
  };

  const handleApplyPromo = async () => {
    // In a real implementation, validate promo against API
    // For now validate a simple format
    if (promoCode.trim().length >= 4) {
      setPromoApplied(true);
      addToast('Promo code applied!', 'success');
    } else {
      addToast('Invalid promo code', 'error');
    }
  };

  const handlePayment = async () => {
    if (!isAuthenticated) {
      addToast('Please log in to continue', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      // Initiate booking/order via API
      const response = await api.post('/bookings', {
        listingId: id,
        bookingType,
        rentalDays: bookingType === 'rental' ? rentalDays : undefined,
        paymentMethod: selectedPayment,
        addons,
        contactInfo: getValues(),
        listingSnapshot: listing?.localOnly ? {
          id: listing.id,
          make: listing.make,
          model: listing.model,
          year: listing.year,
          trim: listing.trim,
          pricePerDay: listing.pricePerDay,
          locationCity: listing.locationCity,
          locationState: listing.locationState,
          image: listing.media?.[0]?.url || null,
          sellerName,
        } : undefined,
        totalAmount: totalPrice,
        promoCode: promoApplied ? promoCode : undefined,
      });
      setBookingReference(response.data?.data?.booking?.reference || '');

      setTimeout(() => {
        setIsProcessing(false);
        setStep(4);
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      addToast(
        error.response?.data?.error?.message || 'Booking checkout is not available yet. Please contact the seller directly.',
        'error'
      );
    }
  };

  const paymentMethods = [
    { id: 'paystack', name: 'Paystack', desc: 'Pay with card, bank transfer, or USSD', logo: '💳' },
    { id: 'flutterwave', name: 'Flutterwave', desc: 'Multiple payment options', logo: '🦋' },
    { id: 'bank_transfer', name: 'Bank Transfer', desc: 'Pay directly to our bank account', logo: '🏦' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pearl-100 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-naija-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-charcoal-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="min-h-screen bg-pearl-100 pt-28 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-card p-12 max-w-md">
          <Car className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-charcoal-800 mb-2">Listing Not Found</h2>
          <p className="text-charcoal-500 mb-6">This listing may have been removed or is unavailable.</p>
          <button
            onClick={() => navigate('/cars')}
            className="btn-primary px-6 py-3 rounded-xl"
          >
            Browse Cars
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl-100 pt-28 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-naija-600 via-naija-500 to-emerald-500 py-8 relative overflow-hidden">
        <div className="absolute inset-0 kente-overlay opacity-10" />
        <div className="section-container relative">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-display font-bold text-white">
            {bookingType === 'rental' ? 'Complete Your Rental' : 'Secure This Vehicle'}
          </h1>
          <p className="text-white/80 mt-1">{carName}</p>
        </div>
      </div>

      <div className="section-container -mt-6 relative z-10">
        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Details' },
              { num: 2, label: bookingType === 'rental' ? 'Rental Info' : 'Add-ons' },
              { num: 3, label: 'Payment' },
              { num: 4, label: 'Confirmation' },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s.num ? 'bg-naija-500 text-white' : 'bg-pearl-200 text-charcoal-400'
                  }`}>
                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`hidden md:block font-medium ${step >= s.num ? 'text-charcoal-800' : 'text-charcoal-400'}`}>
                    {s.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-12 md:w-20 h-1 mx-2 md:mx-4 rounded-full ${step > s.num ? 'bg-naija-500' : 'bg-pearl-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Contact Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-3xl shadow-card overflow-hidden"
                >
                  <div className="p-6 border-b border-pearl-200">
                    <h2 className="text-xl font-display font-bold text-charcoal-800">Contact Information</h2>
                    <p className="text-charcoal-500">We'll use this to send your {bookingType === 'rental' ? 'booking' : 'purchase'} confirmation</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">First Name *</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            {...register('firstName', { required: 'First name is required' })}
                            className="w-full pl-12 pr-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                            placeholder="Enter first name"
                          />
                        </div>
                        {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">Last Name *</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            {...register('lastName', { required: 'Last name is required' })}
                            className="w-full pl-12 pr-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            {...register('email', { required: 'Email is required' })}
                            type="email"
                            className="w-full pl-12 pr-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">Phone *</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            {...register('phone', { required: 'Phone is required' })}
                            className="w-full pl-12 pr-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                            placeholder="+234 xxx xxx xxxx"
                          />
                        </div>
                      </div>
                    </div>
                    {bookingType === 'purchase' && (
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">Delivery Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-4 w-5 h-5 text-charcoal-400" />
                          <textarea
                            {...register('address')}
                            rows={3}
                            className="w-full pl-12 pr-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100 resize-none"
                            placeholder="Enter your full delivery address"
                          />
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                      Continue <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Rental Info or Add-ons */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {bookingType === 'rental' && (
                    <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                      <div className="p-6 border-b border-pearl-200">
                        <h2 className="text-xl font-display font-bold text-charcoal-800">Rental Duration</h2>
                        <p className="text-charcoal-500">Select how many days you need the vehicle</p>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-center gap-6 mb-6">
                          <button onClick={() => setRentalDays(Math.max(1, rentalDays - 1))} className="p-3 bg-pearl-100 text-charcoal-600 rounded-xl hover:bg-pearl-200 transition-colors">
                            <Minus className="w-6 h-6" />
                          </button>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-charcoal-800">{rentalDays}</div>
                            <div className="text-charcoal-500">days</div>
                          </div>
                          <button onClick={() => setRentalDays(rentalDays + 1)} className="p-3 bg-pearl-100 text-charcoal-600 rounded-xl hover:bg-pearl-200 transition-colors">
                            <Plus className="w-6 h-6" />
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 3, 7, 14].map((days) => (
                            <button key={days} onClick={() => setRentalDays(days)} className={`py-3 rounded-xl font-medium transition-colors ${rentalDays === days ? 'bg-naija-500 text-white' : 'bg-pearl-100 text-charcoal-600 hover:bg-pearl-200'}`}>
                              {days} {days === 1 ? 'day' : 'days'}
                            </button>
                          ))}
                        </div>
                        {rentalDays >= 7 && (
                          <div className="mt-4 p-4 bg-emerald-50 rounded-xl flex items-center gap-3">
                            <Gift className="w-5 h-5 text-emerald-600" />
                            <span className="text-emerald-700 font-medium">10% discount applied for weekly rental!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add-ons */}
                  <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                    <div className="p-6 border-b border-pearl-200">
                      <h2 className="text-xl font-display font-bold text-charcoal-800">Optional Add-ons</h2>
                      <p className="text-charcoal-500">Enhance your {bookingType === 'rental' ? 'rental' : 'purchase'} experience</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {[
                        { key: 'insurance', label: 'Full Insurance Coverage', desc: bookingType === 'rental' ? 'Comprehensive coverage during your rental' : 'First year comprehensive insurance', price: bookingType === 'rental' ? '₦15,000/day' : '₦500,000', icon: Shield, color: 'naija' },
                        { key: 'delivery', label: 'Home Delivery', desc: 'We\'ll deliver the vehicle to your location in Lagos', price: '₦50,000', icon: Truck, color: 'gold' },
                        ...(bookingType === 'purchase' ? [{ key: 'inspection', label: 'Pre-Purchase Inspection', desc: 'Independent 200-point vehicle inspection report', price: '₦75,000', icon: FileText, color: 'emerald' }] : [])
                      ].map((addon) => (
                        <label key={addon.key} className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${addons[addon.key] ? 'border-naija-500 bg-naija-50' : 'border-pearl-300 hover:border-pearl-400'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`p-3 bg-${addon.color}-100 rounded-xl`}>
                              <addon.icon className={`w-6 h-6 text-${addon.color}-600`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-charcoal-800">{addon.label}</h3>
                              <p className="text-sm text-charcoal-500">{addon.desc}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-naija-600">{addon.price}</span>
                            <input type="checkbox" checked={addons[addon.key]} onChange={() => setAddons({ ...addons, [addon.key]: !addons[addon.key] })} className="w-5 h-5 text-naija-500 rounded focus:ring-naija-500" />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-pearl-300 text-charcoal-700 font-medium rounded-xl hover:bg-pearl-50 transition-colors">Back</button>
                    <button onClick={() => setStep(3)} className="flex-1 btn-primary py-4 rounded-xl flex items-center justify-center gap-2">
                      Continue to Payment <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                    <div className="p-6 border-b border-pearl-200">
                      <h2 className="text-xl font-display font-bold text-charcoal-800">Payment Method</h2>
                      <p className="text-charcoal-500">Choose how you'd like to pay</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {paymentMethods.map((method) => (
                        <label key={method.id} className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${selectedPayment === method.id ? 'border-naija-500 bg-naija-50' : 'border-pearl-300 hover:border-pearl-400'}`}>
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{method.logo}</span>
                            <div>
                              <h3 className="font-semibold text-charcoal-800">{method.name}</h3>
                              <p className="text-sm text-charcoal-500">{method.desc}</p>
                            </div>
                          </div>
                          <input type="radio" name="payment" checked={selectedPayment === method.id} onChange={() => setSelectedPayment(method.id)} className="w-5 h-5 text-naija-500 focus:ring-naija-500" />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="bg-white rounded-3xl shadow-card p-6">
                    <h3 className="font-semibold text-charcoal-800 mb-4">Have a Promo Code?</h3>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          disabled={promoApplied}
                          className="w-full pl-12 pr-4 py-3 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100 disabled:bg-pearl-100"
                          placeholder="Enter promo code"
                        />
                      </div>
                      <button onClick={handleApplyPromo} disabled={promoApplied || !promoCode} className="px-6 py-3 bg-naija-500 text-white font-medium rounded-xl hover:bg-naija-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {promoApplied ? 'Applied!' : 'Apply'}
                      </button>
                    </div>
                    {promoApplied && (
                      <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
                        <Sparkles className="w-4 h-4" /> 5% discount applied!
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="flex-1 py-4 border-2 border-pearl-300 text-charcoal-700 font-medium rounded-xl hover:bg-pearl-50 transition-colors">Back</button>
                    <button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="flex-1 btn-primary py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Lock className="w-5 h-5 animate-pulse" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Pay {formatPrice(totalPrice)}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-charcoal-500">
                    <Shield className="w-4 h-4" />
                    <span>Your payment is secured with 256-bit SSL encryption</span>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-card overflow-hidden text-center"
                >
                  <div className="p-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="w-20 h-20 bg-naija-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-10 h-10 text-naija-600" />
                    </motion.div>

                    <h2 className="text-2xl font-display font-bold text-charcoal-800 mb-2">
                      {bookingType === 'rental' ? 'Booking Confirmed!' : 'Order Placed Successfully!'}
                    </h2>
                    <p className="text-charcoal-500 mb-6">
                      {bookingType === 'rental'
                        ? 'Your rental has been confirmed. Check your email for details.'
                        : "Thank you for your purchase. We'll be in touch shortly."}
                    </p>

                    <div className="bg-pearl-50 rounded-2xl p-6 mb-6 text-left">
                      <h3 className="font-semibold text-charcoal-800 mb-4">Order Summary</h3>
                      <div className="flex items-center gap-4 mb-4">
                        {carImage ? (
                          <img src={carImage} alt={carName} className="w-20 h-16 object-cover rounded-lg" />
                        ) : (
                          <div className="w-20 h-16 bg-pearl-200 rounded-lg flex items-center justify-center">
                            <Car className="w-8 h-8 text-charcoal-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-charcoal-800">{carName}</p>
                          <p className="text-sm text-charcoal-500">{carLocation}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Reference</span>
                          <span className="font-medium text-charcoal-800">{bookingReference || `NC-${String(id).slice(-6).toUpperCase()}`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Total Paid</span>
                          <span className="font-bold text-naija-600">{formatPrice(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Payment Method</span>
                          <span className="font-medium capitalize">{selectedPayment.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 border-2 border-naija-500 text-naija-600 font-medium rounded-xl hover:bg-naija-50 transition-colors">
                        View Dashboard
                      </button>
                      <button onClick={() => navigate('/cars')} className="flex-1 btn-primary py-3 rounded-xl">
                        Browse More Cars
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-card overflow-hidden sticky top-28"
            >
              <div className="p-6 border-b border-pearl-200">
                <h3 className="text-lg font-display font-bold text-charcoal-800">Order Summary</h3>
              </div>
              <div className="p-6">
                {/* Car Info */}
                <div className="flex gap-4 mb-6 pb-6 border-b border-pearl-200">
                  {carImage ? (
                    <img src={carImage} alt={carName} className="w-24 h-20 object-cover rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-24 h-20 bg-pearl-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Car className="w-8 h-8 text-charcoal-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-charcoal-800 text-sm">{carName}</h4>
                    {sellerName && <p className="text-xs text-charcoal-500">{sellerName}</p>}
                    {carLocation && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-charcoal-400" />
                        <span className="text-xs text-charcoal-500">{carLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500 text-sm">
                      {bookingType === 'rental' ? `${rentalDays} days × ${formatPrice(pricePerDay)}` : 'Vehicle Price'}
                    </span>
                    <span className="font-medium text-sm">{formatPrice(basePrice)}</span>
                  </div>
                  {addons.insurance && <div className="flex justify-between"><span className="text-charcoal-500 text-sm">Insurance</span><span className="font-medium text-sm">{formatPrice(insuranceFee)}</span></div>}
                  {addons.delivery && <div className="flex justify-between"><span className="text-charcoal-500 text-sm">Delivery</span><span className="font-medium text-sm">{formatPrice(deliveryFee)}</span></div>}
                  {addons.inspection && <div className="flex justify-between"><span className="text-charcoal-500 text-sm">Inspection</span><span className="font-medium text-sm">{formatPrice(inspectionFee)}</span></div>}
                  <div className="flex justify-between"><span className="text-charcoal-500 text-sm">Service Fee</span><span className="font-medium text-sm">{formatPrice(serviceFee)}</span></div>
                  {promoApplied && <div className="flex justify-between text-emerald-600"><span className="text-sm">Promo Discount</span><span className="font-medium text-sm">-{formatPrice(promoDiscount)}</span></div>}
                </div>

                <div className="border-t border-pearl-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-charcoal-800">Total</span>
                    <span className="text-2xl font-bold text-naija-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-charcoal-600"><Shield className="w-5 h-5 text-naija-500" /><span>Buyer Protection Guarantee</span></div>
                  <div className="flex items-center gap-3 text-sm text-charcoal-600"><BadgeCheck className="w-5 h-5 text-naija-500" /><span>Verified Vehicle</span></div>
                  <div className="flex items-center gap-3 text-sm text-charcoal-600"><Lock className="w-5 h-5 text-naija-500" /><span>Secure Payment</span></div>
                  <div className="flex items-center gap-3 text-sm text-charcoal-600"><Clock className="w-5 h-5 text-naija-500" /><span>Quick Response Guaranteed</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
