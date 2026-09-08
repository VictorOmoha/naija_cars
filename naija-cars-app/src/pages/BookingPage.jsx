import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import useListing from '../hooks/useListing';
import {
  Car, MapPin, Clock, Shield, CheckCircle, ArrowRight,
  ChevronLeft, User, Phone, Mail, Lock,
  Truck, FileText, BadgeCheck, Minus, Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import useAuthStore from '../stores/authStore';
import api from '../services/api';

export default function BookingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast, openAuthModal } = useApp();
  const { user, isAuthenticated } = useAuthStore();

  const bookingType = searchParams.get('type') || 'purchase'; // 'purchase' or 'rental'

  const [step, setStep] = useState(1);
  const [rentalDays, setRentalDays] = useState(() => Math.min(365, Math.max(1, parseInt(searchParams.get('days'), 10) || 3)));
  const selectedPayment = 'arrange_with_seller';
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedTotal, setConfirmedTotal] = useState(null);
  const [bookingReference, setBookingReference] = useState('');
  const [addons, setAddons] = useState({
    insurance: false,
    delivery: false,
    inspection: false,
  });

  const { register, formState: { errors }, getValues, trigger } = useForm({
    defaultValues: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
    }
  });

  // Fetch real listing data
  const { data: listing, isLoading, isError } = useListing(id);

  // Derived values from listing
  const carPrice = listing ? parseFloat(listing.price) : 0;
  const pricePerDay = carPrice;
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
  const totalPrice = Math.round((basePrice + insuranceFee + deliveryFee + inspectionFee + serviceFee) * 100) / 100;

  const formatPrice = (price) => {
    if (price >= 1000000) return `₦${(price / 1000000).toFixed(2)}M`;
    return `₦${price.toLocaleString()}`;
  };

  const handlePayment = async () => {
    if (isProcessing) return;
    if (!isAuthenticated) {
      addToast('Please log in to continue', 'error');
      openAuthModal();
      return;
    }
    if (!await trigger()) {
      setStep(1);
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
        totalAmount: totalPrice,
      });
      setBookingReference(response.data?.data?.booking?.reference || '');
      setConfirmedTotal(response.data.data.booking.totalAmount);
      setIsProcessing(false);
      setStep(4);
    } catch (error) {
      setIsProcessing(false);
      addToast(
        error.response?.data?.error?.message || 'Booking checkout is not available yet. Please contact the seller directly.',
        'error'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pearl-100 pt-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-naija-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-charcoal-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (isError || !listing || listing.listingType !== (bookingType === 'rental' ? 'RENT' : 'SALE')) {
    return (
      <div className="min-h-screen bg-pearl-100 pt-8 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl border border-lightborder p-12 max-w-md">
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
    <div className="min-h-screen bg-pearl-100 pb-20">
      {/* Header */}
      <div className="nc-page-banner">
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
            {bookingType === 'rental' ? 'Request this rental' : 'Request this car'}
          </h1>
          <p className="text-white/80 mt-1">{carName}</p>
        </div>
      </div>

      <div className="section-container mt-6 relative z-10">
        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              { num: 1, label: 'Details' },
              { num: 2, label: bookingType === 'rental' ? 'Rental Info' : 'Add-ons' },
              { num: 3, label: 'Review' },
              { num: 4, label: 'Confirmation' },
            ].map((s, index) => (
              <div key={s.num} className={`flex items-center min-w-0 ${index < 3 ? 'flex-1' : ''}`}>
                <div className="flex items-center gap-2 shrink-0">
                  <div aria-label={`Step ${s.num}: ${s.label}`} className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s.num ? 'bg-naija-500 text-white' : 'bg-pearl-200 text-charcoal-400'
                  }`}>
                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`hidden md:block font-medium ${step >= s.num ? 'text-charcoal-800' : 'text-charcoal-400'}`}>
                    {s.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`flex-1 min-w-2 h-1 mx-1 md:mx-3 rounded-full ${step > s.num ? 'bg-naija-500' : 'bg-pearl-200'}`} />
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
                  className="bg-white rounded-2xl border border-lightborder overflow-hidden"
                >
                  <div className="p-6 border-b border-pearl-200">
                    <h2 className="text-xl font-display font-bold text-charcoal-800">Contact Information</h2>
                    <p className="text-charcoal-500">Contact details for your booking request</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">First Name *</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            aria-label="First name" {...register('firstName', { required: 'First name is required' })}
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
                            aria-label="Last name" {...register('lastName', { required: 'Last name is required' })}
                            className="w-full pl-12 pr-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                            placeholder="Enter last name"
                          />
                        </div>
                        {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            aria-label="Email address" {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                            type="email"
                            className="w-full pl-12 pr-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                            placeholder="your@email.com"
                          />
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">Phone *</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            aria-label="Phone number" {...register('phone', { required: 'Phone is required', pattern: { value: /^\+?[\d\s()-]{7,20}$/, message: 'Enter a valid phone number' } })}
                            className="w-full pl-12 pr-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                            placeholder="+234 xxx xxx xxxx"
                          />
                        </div>
                        {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
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
                      onClick={async () => { if (await trigger()) setStep(2); }}
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
                    <div className="bg-white rounded-2xl border border-lightborder overflow-hidden">
                      <div className="p-6 border-b border-pearl-200">
                        <h2 className="text-xl font-display font-bold text-charcoal-800">Rental Duration</h2>
                        <p className="text-charcoal-500">Select how many days you need the vehicle</p>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-center gap-6 mb-6">
                          <button aria-label="Decrease rental duration" onClick={() => setRentalDays(Math.max(1, rentalDays - 1))} className="p-3 bg-pearl-100 text-charcoal-600 rounded-xl hover:bg-pearl-200 transition-colors">
                            <Minus className="w-6 h-6" />
                          </button>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-charcoal-800">{rentalDays}</div>
                            <div className="text-charcoal-500">days</div>
                          </div>
                          <button aria-label="Increase rental duration" onClick={() => setRentalDays(Math.min(365, rentalDays + 1))} className="p-3 bg-pearl-100 text-charcoal-600 rounded-xl hover:bg-pearl-200 transition-colors">
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
                      </div>
                    </div>
                  )}

                  {/* Add-ons */}
                  <div className="bg-white rounded-2xl border border-lightborder overflow-hidden">
                    <div className="p-6 border-b border-pearl-200">
                      <h2 className="text-xl font-display font-bold text-charcoal-800">Optional Add-ons</h2>
                      <p className="text-charcoal-500">Enhance your {bookingType === 'rental' ? 'rental' : 'purchase'} experience</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {[
                        { key: 'insurance', label: 'Request insurance', desc: bookingType === 'rental' ? 'Subject to provider availability and policy terms' : 'Confirm cover and final terms with the provider', price: bookingType === 'rental' ? '₦15,000/day' : '₦500,000', icon: Shield, color: 'naija' },
                        { key: 'delivery', label: 'Request delivery', desc: 'Confirm the location, availability and fee with the seller', price: '₦50,000 estimate', icon: Truck, color: 'gold' },
                        ...(bookingType === 'purchase' ? [{ key: 'inspection', label: 'Request an inspection', desc: 'Ask the seller to arrange an independent inspection', price: '₦75,000', icon: FileText, color: 'emerald' }] : [])
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
                      Review request <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl border border-lightborder p-6">
                    <h2 className="text-xl font-display font-bold text-charcoal-800">Review your booking request</h2>
                    <p className="text-charcoal-500 mt-2">No payment is collected here. Confirm availability, add-ons, and payment arrangements with the seller before paying.</p><dl className="nc-spec-grid mt-6"><div><dt>Contact name</dt><dd>{getValues("firstName")} {getValues("lastName")}</dd></div><div><dt>Email</dt><dd className="break-all normal-case">{getValues("email")}</dd></div><div><dt>Phone</dt><dd>{getValues("phone")}</dd></div></dl>
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
                          Submit Booking Request
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-charcoal-500">
                    <Shield className="w-4 h-4" />
                    <span>No payment is collected when you submit this request</span>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-lightborder overflow-hidden text-center"
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
                      Booking Request Received
                    </h2>
                    <p className="text-charcoal-500 mb-6">
                      Save your reference and contact the seller to confirm availability. No payment has been collected.
                    </p>

                    <div className="bg-pearl-50 rounded-2xl p-6 mb-6 text-left">
                      <h3 className="font-semibold text-charcoal-800 mb-4">Request summary</h3>
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
                        <div className="flex justify-between gap-4">
                          <span className="text-charcoal-500 shrink-0">Reference</span>
                          <span className="font-medium text-charcoal-800 text-right break-all">{bookingReference}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Estimated Total</span>
                          <span className="font-bold text-naija-600">{formatPrice(confirmedTotal ?? totalPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Payment Status</span>
                          <span className="font-medium capitalize">Not collected</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 border border-naija-500 text-naija-600 font-medium rounded-xl hover:bg-naija-50 transition-colors">
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

          {/* Request summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-lightborder overflow-hidden sticky top-28"
            >
              <div className="p-6 border-b border-pearl-200">
                <h3 className="text-lg font-display font-bold text-charcoal-800">Request summary</h3>
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
                </div>

                <div className="border-t border-pearl-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-charcoal-800">Estimated total</span>
                    <span className="text-2xl font-bold text-naija-600">{formatPrice(confirmedTotal ?? totalPrice)}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-charcoal-600"><Shield className="w-5 h-5 text-naija-500" /><span>Inspect the vehicle before paying</span></div>
                  <div className="flex items-center gap-3 text-sm text-charcoal-600"><BadgeCheck className="w-5 h-5 text-naija-500" /><span>Confirm documents with the seller</span></div>
                  <div className="flex items-center gap-3 text-sm text-charcoal-600"><Lock className="w-5 h-5 text-naija-500" /><span>Review details before paying</span></div>
                  <div className="flex items-center gap-3 text-sm text-charcoal-600"><Clock className="w-5 h-5 text-naija-500" /><span>Arrange a viewing directly</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
