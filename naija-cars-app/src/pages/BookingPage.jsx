import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Car, Calendar, MapPin, Clock, CreditCard, Shield, CheckCircle, ArrowRight,
  ChevronLeft, User, Phone, Mail, Building2, AlertCircle, Lock, Sparkles,
  Truck, FileText, BadgeCheck, Gift, Tag, Minus, Plus, Info, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import useAuthStore from '../stores/authStore';
import { listingsAPI, bookingsAPI } from '../services/api';

// Fallback car data
const fallbackCar = {
  id: 1,
  make: 'Toyota',
  model: 'Land Cruiser',
  year: 2022,
  trim: 'VXR V8',
  price: 120000000,
  pricePerDay: 150000,
  images: ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800'],
  location: { city: 'Lagos', state: 'Lagos' },
  dealer: { name: 'Premium Motors', phone: '+234 801 234 5678' },
  verified: true,
};

// Transform backend listing to expected format
const transformListing = (listing) => {
  return {
    id: listing.id,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    trim: listing.trim || '',
    price: listing.price,
    pricePerDay: listing.listingType === 'RENT' ? listing.price : Math.round(listing.price / 30),
    images: listing.media?.length > 0
      ? listing.media.map(m => m.url)
      : ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'],
    location: {
      city: listing.locationCity,
      state: listing.locationState
    },
    dealer: {
      name: listing.seller?.profile?.businessName || 'Private Seller',
      phone: listing.seller?.phoneNumber || '+234 800 000 0000'
    },
    verified: listing.seller?.profile?.verificationBadge ? true : false,
  };
};

export default function BookingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { user, isAuthenticated } = useAuthStore();

  const bookingType = searchParams.get('type') || 'purchase'; // 'purchase' or 'rental'

  const [car, setCar] = useState(null);
  const [isLoadingCar, setIsLoadingCar] = useState(true);
  const [step, setStep] = useState(1);
  const [rentalDays, setRentalDays] = useState(3);
  const [selectedPayment, setSelectedPayment] = useState('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [addons, setAddons] = useState({
    insurance: false,
    delivery: false,
    inspection: false,
  });

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      email: user?.email || '',
      phone: user?.profile?.phone || '',
    }
  });

  // Fetch car data
  useEffect(() => {
    const fetchCar = async () => {
      if (!id) {
        setCar(fallbackCar);
        setIsLoadingCar(false);
        return;
      }

      try {
        setIsLoadingCar(true);
        const response = await listingsAPI.getById(id);
        const listing = response.data.data.listing;
        setCar(transformListing(listing));
      } catch (error) {
        console.error('Error fetching car:', error);
        addToast('Failed to load car details', 'error');
        setCar(fallbackCar);
      } finally {
        setIsLoadingCar(false);
      }
    };

    fetchCar();
  }, [id, addToast]);

  // Show loading state
  if (isLoadingCar) {
    return (
      <div className="min-h-screen bg-pearl-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-naija-500 animate-spin mx-auto mb-4" />
          <p className="text-charcoal-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-pearl-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-charcoal-600">Car not found</p>
        </div>
      </div>
    );
  }

  // Calculate prices
  const basePrice = bookingType === 'rental' ? car.pricePerDay * rentalDays : car.price;
  const insuranceFee = addons.insurance ? (bookingType === 'rental' ? 15000 * rentalDays : 500000) : 0;
  const deliveryFee = addons.delivery ? 50000 : 0;
  const inspectionFee = addons.inspection ? 75000 : 0;
  const serviceFee = bookingType === 'rental' ? 5000 : basePrice * 0.01;
  const promoDiscount = promoApplied ? (bookingType === 'rental' ? 20000 : basePrice * 0.02) : 0;
  const totalPrice = basePrice + insuranceFee + deliveryFee + inspectionFee + serviceFee - promoDiscount;

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(2)}M`;
    }
    return `₦${price.toLocaleString()}`;
  };

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'naija10') {
      setPromoApplied(true);
      addToast('Promo code applied successfully!', 'success');
    } else {
      addToast('Invalid promo code', 'error');
    }
  };

  const [bookingId, setBookingId] = useState(null);

  const onSubmit = async (data) => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!isAuthenticated) {
      addToast('Please log in to complete your booking', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      // Create the booking
      const bookingData = {
        listingId: id,
        bookingType: bookingType === 'rental' ? 'RENTAL' : 'PURCHASE',
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        basePrice,
        totalPrice,
        serviceFee,
        insuranceFee,
        deliveryFee,
        promoDiscount,
        ...(bookingType === 'rental' && {
          rentalDays,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + rentalDays * 24 * 60 * 60 * 1000).toISOString()
        }),
        paymentMethod: selectedPayment,
        deliveryAddress: data.address || null,
        pickupLocation: car.location.city,
        hasInsurance: addons.insurance,
        hasDelivery: addons.delivery,
        hasInspection: addons.inspection,
        notes: null
      };

      const response = await bookingsAPI.create(bookingData);
      setBookingId(response.data.data.booking.id);
      addToast('Booking created successfully!', 'success');
      setStep(4);
    } catch (error) {
      console.error('Booking error:', error);
      addToast(error.response?.data?.error?.message || 'Failed to create booking', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'paystack',
      name: 'Paystack',
      desc: 'Pay with card, bank transfer, or USSD',
      logo: '💳',
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      desc: 'Multiple payment options',
      logo: '🦋',
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      desc: 'Pay directly to our bank account',
      logo: '🏦',
    },
  ];

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
                  <span className={`hidden md:block font-medium ${
                    step >= s.num ? 'text-charcoal-800' : 'text-charcoal-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-12 md:w-20 h-1 mx-2 md:mx-4 rounded-full ${
                    step > s.num ? 'bg-naija-500' : 'bg-pearl-200'
                  }`} />
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
                    <h2 className="text-xl font-display font-bold text-charcoal-800">
                      Contact Information
                    </h2>
                    <p className="text-charcoal-500">We'll use this to send your {bookingType === 'rental' ? 'booking' : 'purchase'} confirmation</p>
                  </div>

                  <form className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          First Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            {...register('firstName', { required: 'First name is required' })}
                            className="w-full pl-12 pr-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                            placeholder="Enter first name"
                          />
                        </div>
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          Last Name *
                        </label>
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
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          Email Address *
                        </label>
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
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          Phone Number *
                        </label>
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
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          Delivery Address
                        </label>
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
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
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
                        <h2 className="text-xl font-display font-bold text-charcoal-800">
                          Rental Duration
                        </h2>
                        <p className="text-charcoal-500">Select how many days you need the vehicle</p>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-center gap-6 mb-6">
                          <button
                            onClick={() => setRentalDays(Math.max(1, rentalDays - 1))}
                            className="p-3 bg-pearl-100 text-charcoal-600 rounded-xl hover:bg-pearl-200 transition-colors"
                          >
                            <Minus className="w-6 h-6" />
                          </button>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-charcoal-800">{rentalDays}</div>
                            <div className="text-charcoal-500">days</div>
                          </div>
                          <button
                            onClick={() => setRentalDays(rentalDays + 1)}
                            className="p-3 bg-pearl-100 text-charcoal-600 rounded-xl hover:bg-pearl-200 transition-colors"
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {[1, 3, 7, 14].map((days) => (
                            <button
                              key={days}
                              onClick={() => setRentalDays(days)}
                              className={`py-3 rounded-xl font-medium transition-colors ${
                                rentalDays === days
                                  ? 'bg-naija-500 text-white'
                                  : 'bg-pearl-100 text-charcoal-600 hover:bg-pearl-200'
                              }`}
                            >
                              {days} {days === 1 ? 'day' : 'days'}
                            </button>
                          ))}
                        </div>

                        {rentalDays >= 7 && (
                          <div className="mt-4 p-4 bg-emerald-50 rounded-xl flex items-center gap-3">
                            <Gift className="w-5 h-5 text-emerald-600" />
                            <span className="text-emerald-700 font-medium">
                              10% discount applied for weekly rental!
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add-ons */}
                  <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                    <div className="p-6 border-b border-pearl-200">
                      <h2 className="text-xl font-display font-bold text-charcoal-800">
                        Optional Add-ons
                      </h2>
                      <p className="text-charcoal-500">Enhance your {bookingType === 'rental' ? 'rental' : 'purchase'} experience</p>
                    </div>

                    <div className="p-6 space-y-4">
                      <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        addons.insurance ? 'border-naija-500 bg-naija-50' : 'border-pearl-300 hover:border-pearl-400'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-naija-100 rounded-xl">
                            <Shield className="w-6 h-6 text-naija-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-charcoal-800">Full Insurance Coverage</h3>
                            <p className="text-sm text-charcoal-500">
                              {bookingType === 'rental' ? 'Comprehensive coverage during your rental' : 'First year comprehensive insurance'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-naija-600">
                            {bookingType === 'rental' ? `₦15,000/day` : `₦500,000`}
                          </span>
                          <input
                            type="checkbox"
                            checked={addons.insurance}
                            onChange={() => setAddons({ ...addons, insurance: !addons.insurance })}
                            className="w-5 h-5 text-naija-500 rounded focus:ring-naija-500"
                          />
                        </div>
                      </label>

                      <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        addons.delivery ? 'border-naija-500 bg-naija-50' : 'border-pearl-300 hover:border-pearl-400'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gold-100 rounded-xl">
                            <Truck className="w-6 h-6 text-gold-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-charcoal-800">Home Delivery</h3>
                            <p className="text-sm text-charcoal-500">
                              We'll deliver the vehicle to your location in Lagos
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-naija-600">₦50,000</span>
                          <input
                            type="checkbox"
                            checked={addons.delivery}
                            onChange={() => setAddons({ ...addons, delivery: !addons.delivery })}
                            className="w-5 h-5 text-naija-500 rounded focus:ring-naija-500"
                          />
                        </div>
                      </label>

                      {bookingType === 'purchase' && (
                        <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                          addons.inspection ? 'border-naija-500 bg-naija-50' : 'border-pearl-300 hover:border-pearl-400'
                        }`}>
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                              <FileText className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-charcoal-800">Pre-Purchase Inspection</h3>
                              <p className="text-sm text-charcoal-500">
                                Independent 200-point vehicle inspection report
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-naija-600">₦75,000</span>
                            <input
                              type="checkbox"
                              checked={addons.inspection}
                              onChange={() => setAddons({ ...addons, inspection: !addons.inspection })}
                              className="w-5 h-5 text-naija-500 rounded focus:ring-naija-500"
                            />
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 border-2 border-pearl-300 text-charcoal-700 font-medium rounded-xl hover:bg-pearl-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 btn-primary py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                      Continue to Payment
                      <ArrowRight className="w-5 h-5" />
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
                      <h2 className="text-xl font-display font-bold text-charcoal-800">
                        Payment Method
                      </h2>
                      <p className="text-charcoal-500">Choose how you'd like to pay</p>
                    </div>

                    <div className="p-6 space-y-4">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                            selectedPayment === method.id
                              ? 'border-naija-500 bg-naija-50'
                              : 'border-pearl-300 hover:border-pearl-400'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{method.logo}</span>
                            <div>
                              <h3 className="font-semibold text-charcoal-800">{method.name}</h3>
                              <p className="text-sm text-charcoal-500">{method.desc}</p>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="payment"
                            checked={selectedPayment === method.id}
                            onChange={() => setSelectedPayment(method.id)}
                            className="w-5 h-5 text-naija-500 focus:ring-naija-500"
                          />
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
                          placeholder="Enter code"
                        />
                      </div>
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoApplied || !promoCode}
                        className="px-6 py-3 bg-naija-500 text-white font-medium rounded-xl hover:bg-naija-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {promoApplied ? 'Applied!' : 'Apply'}
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-charcoal-500">Try "NAIJA10" for a discount</p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 py-4 border-2 border-pearl-300 text-charcoal-700 font-medium rounded-xl hover:bg-pearl-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={isProcessing}
                      className="flex-1 btn-primary py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
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
                        : 'Thank you for your purchase. We\'ll be in touch shortly.'}
                    </p>

                    <div className="bg-pearl-50 rounded-2xl p-6 mb-6 text-left">
                      <h3 className="font-semibold text-charcoal-800 mb-4">Order Summary</h3>
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={car.images[0]}
                          alt={`${car.make} ${car.model}`}
                          className="w-20 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-semibold text-charcoal-800">
                            {car.year} {car.make} {car.model}
                          </p>
                          <p className="text-sm text-charcoal-500">{car.trim}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Booking ID</span>
                          <span className="font-medium text-charcoal-800">#{bookingId ? bookingId.slice(0, 8).toUpperCase() : 'NC' + Date.now().toString().slice(-8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Total Paid</span>
                          <span className="font-bold text-naija-600">{formatPrice(totalPrice)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 py-3 border-2 border-naija-500 text-naija-600 font-medium rounded-xl hover:bg-naija-50 transition-colors"
                      >
                        View Dashboard
                      </button>
                      <button
                        onClick={() => navigate('/cars')}
                        className="flex-1 btn-primary py-3 rounded-xl"
                      >
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
                <h3 className="text-lg font-display font-bold text-charcoal-800">
                  Order Summary
                </h3>
              </div>

              <div className="p-6">
                {/* Car Info */}
                <div className="flex gap-4 mb-6 pb-6 border-b border-pearl-200">
                  <img
                    src={car.images[0]}
                    alt={`${car.make} ${car.model}`}
                    className="w-24 h-20 object-cover rounded-xl"
                  />
                  <div>
                    <h4 className="font-semibold text-charcoal-800">
                      {car.year} {car.make} {car.model}
                    </h4>
                    <p className="text-sm text-charcoal-500">{car.trim}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-charcoal-400" />
                      <span className="text-xs text-charcoal-500">{car.location.city}</span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">
                      {bookingType === 'rental' ? `${rentalDays} days × ${formatPrice(car.pricePerDay)}` : 'Vehicle Price'}
                    </span>
                    <span className="font-medium">{formatPrice(basePrice)}</span>
                  </div>

                  {addons.insurance && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Insurance</span>
                      <span className="font-medium">{formatPrice(insuranceFee)}</span>
                    </div>
                  )}

                  {addons.delivery && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Delivery</span>
                      <span className="font-medium">{formatPrice(deliveryFee)}</span>
                    </div>
                  )}

                  {addons.inspection && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Inspection</span>
                      <span className="font-medium">{formatPrice(inspectionFee)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Service Fee</span>
                    <span className="font-medium">{formatPrice(serviceFee)}</span>
                  </div>

                  {promoApplied && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Promo Discount</span>
                      <span className="font-medium">-{formatPrice(promoDiscount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-pearl-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-charcoal-800">Total</span>
                    <span className="text-2xl font-bold text-naija-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-pearl-200 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-charcoal-600">
                    <Shield className="w-5 h-5 text-naija-500" />
                    <span>Buyer Protection Guarantee</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-charcoal-600">
                    <BadgeCheck className="w-5 h-5 text-naija-500" />
                    <span>Verified Vehicle</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-charcoal-600">
                    <Lock className="w-5 h-5 text-naija-500" />
                    <span>Secure Payment</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
