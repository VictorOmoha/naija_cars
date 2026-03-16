import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check, Car, LogIn, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useApp } from '../../context/AppContext';
import useAuthStore from '../../stores/authStore';
import MediaUploader from '../MediaUploader';
import api from '../../services/api';
import { nigerianStates, carMakes } from '../../data/cars';

export default function EnhancedListCarModal() {
  const navigate = useNavigate();
  const { isListCarOpen, setIsListCarOpen, setIsSignInOpen, addToast } = useApp();
  const { user, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdListingId, setCreatedListingId] = useState(null);
  const [uploadedMedia, setUploadedMedia] = useState([]);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
      listingType: 'SALE',
      condition: 'FOREIGN_USED',
      transmission: 'automatic',
      fuelType: 'petrol'
    }
  });

  const listingType = watch('listingType');

  const handleClose = () => {
    setIsListCarOpen(false);
    setStep(1);
    setCreatedListingId(null);
    setUploadedMedia([]);
    reset();
  };

  const handleSignIn = () => {
    setIsListCarOpen(false);
    setIsSignInOpen(true);
  };

  const handleGoToSellPage = () => {
    setIsListCarOpen(false);
    navigate('/sell');
  };

  const onSubmit = async (data) => {
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2 && !createdListingId) {
      // Create listing
      setIsSubmitting(true);
      try {
        const response = await api.post('/listings', {
          ...data,
          price: parseFloat(data.price),
          year: parseInt(data.year),
          mileage: data.mileage ? parseInt(data.mileage) : null
        });

        const listing = response.data.data.listing;
        setCreatedListingId(listing.id);
        addToast('Listing created! Now add photos and videos.', 'success');
        setStep(3);
      } catch (error) {
        addToast(error.response?.data?.error?.message || 'Failed to create listing', 'error');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (step === 3) {
      if (uploadedMedia.length === 0) {
        addToast('Please add at least one photo', 'error');
        return;
      }

      // Complete
      addToast('Listing published successfully!', 'success');
      const listingId = createdListingId;
      handleClose();
      navigate(`/car/${listingId}`);
    }
  };

  const handleMediaUploadComplete = (media) => {
    setUploadedMedia([...uploadedMedia, ...media]);
  };

  const totalSteps = 3;

  // Show authentication prompt for non-authenticated users
  if (!isAuthenticated && isListCarOpen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white border border-pearl-200
                     rounded-3xl shadow-card-hover overflow-hidden"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-charcoal-600 hover:text-charcoal-700
                       hover:bg-pearl-100 rounded-xl transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Car className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-display font-bold text-gray-800 mb-3">
                List Your Car
              </h2>
              <p className="text-gray-600 mb-8">
                Sign in to list your car and reach thousands of verified buyers across Nigeria.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleSignIn}
                  className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl
                           hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In to Continue
                </button>

                <button
                  onClick={handleGoToSellPage}
                  className="w-full py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-xl
                           hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  Learn More About Selling
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Don't have an account?{' '}
                <button onClick={handleSignIn} className="text-green-600 font-medium hover:underline">
                  Create one for free
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isListCarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-white border border-pearl-200
                     rounded-3xl shadow-card-hover overflow-hidden my-8"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-charcoal-600 hover:text-charcoal-700
                       hover:bg-pearl-100 rounded-xl transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Progress */}
            <div className="p-4 md:p-8 pb-4 md:pb-6 border-b border-pearl-200">
              <h2 className="font-display text-2xl font-semibold text-charcoal-800 mb-6">
                {step === 1 && 'Basic Information'}
                {step === 2 && 'Car Details'}
                {step === 3 && 'Photos & Videos'}
              </h2>

              {/* Progress Bar */}
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      s <= step ? 'bg-naija-500' : 'bg-pearl-200'
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-between mt-2 text-xs text-charcoal-500">
                <span>Basic Info</span>
                <span>Details</span>
                <span>Media</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="p-4 md:p-8 space-y-5 max-h-[60vh] overflow-y-auto">
                  {/* Listing Type */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Listing Type *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        listingType === 'SALE' ? 'border-naija-500 bg-naija-50' : 'border-pearl-200 hover:border-naija-300'
                      }`}>
                        <input
                          type="radio"
                          value="SALE"
                          {...register('listingType', { required: true })}
                          className="sr-only"
                        />
                        <div className="font-semibold text-charcoal-800">For Sale</div>
                        <div className="text-sm text-charcoal-500">Sell your car</div>
                      </label>

                      <label className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        listingType === 'RENT' ? 'border-naija-500 bg-naija-50' : 'border-pearl-200 hover:border-naija-300'
                      }`}>
                        <input
                          type="radio"
                          value="RENT"
                          {...register('listingType', { required: true })}
                          className="sr-only"
                        />
                        <div className="font-semibold text-charcoal-800">For Rent</div>
                        <div className="text-sm text-charcoal-500">Rent out your car</div>
                      </label>
                    </div>
                  </div>

                  {/* Make & Model */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Make *
                      </label>
                      <select
                        {...register('make', { required: 'Make is required' })}
                        className="w-full px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-naija-500"
                      >
                        <option value="">Select make</option>
                        {carMakes.map(make => (
                          <option key={make} value={make}>{make}</option>
                        ))}
                      </select>
                      {errors.make && (
                        <p className="text-red-500 text-sm mt-1">{errors.make.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Model *
                      </label>
                      <input
                        type="text"
                        {...register('model', { required: 'Model is required' })}
                        placeholder="e.g., Camry"
                        className="w-full px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-naija-500"
                      />
                      {errors.model && (
                        <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Year & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Year *
                      </label>
                      <input
                        type="number"
                        {...register('year', {
                          required: 'Year is required',
                          min: { value: 1990, message: 'Year must be 1990 or later' },
                          max: { value: new Date().getFullYear() + 1, message: 'Invalid year' }
                        })}
                        placeholder="2020"
                        className="w-full px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-naija-500"
                      />
                      {errors.year && (
                        <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Price (₦) *
                      </label>
                      <input
                        type="number"
                        {...register('price', {
                          required: 'Price is required',
                          min: { value: 100000, message: 'Minimum price is ₦100,000' }
                        })}
                        placeholder="5000000"
                        className="w-full px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-naija-500"
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        State *
                      </label>
                      <select
                        {...register('locationState', { required: 'State is required' })}
                        className="w-full px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-naija-500"
                      >
                        <option value="">Select state</option>
                        {nigerianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {errors.locationState && (
                        <p className="text-red-500 text-sm mt-1">{errors.locationState.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        {...register('locationCity', { required: 'City is required' })}
                        placeholder="e.g., Ikeja"
                        className="w-full px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-naija-500"
                      />
                      {errors.locationCity && (
                        <p className="text-red-500 text-sm mt-1">{errors.locationCity.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Car Details */}
              {step === 2 && (
                <div className="p-4 md:p-8 space-y-5 max-h-[60vh] overflow-y-auto">
                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Condition *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['FOREIGN_USED', 'NIGERIAN_USED', 'BRAND_NEW'].map((cond) => (
                        <label key={cond} className={`border-2 rounded-xl p-3 cursor-pointer text-center transition-all ${
                          watch('condition') === cond ? 'border-naija-500 bg-naija-50' : 'border-pearl-200'
                        }`}>
                          <input
                            type="radio"
                            value={cond}
                            {...register('condition')}
                            className="sr-only"
                          />
                          <div className="text-sm font-semibold text-charcoal-800">
                            {cond.replace(/_/g, ' ')}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Transmission & Fuel Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Transmission *
                      </label>
                      <select
                        {...register('transmission', { required: true })}
                        className="w-full px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-naija-500"
                      >
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Fuel Type *
                      </label>
                      <select
                        {...register('fuelType', { required: true })}
                        className="w-full px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-naija-500"
                      >
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="electric">Electric</option>
                      </select>
                    </div>
                  </div>

                  {/* Mileage & Trim */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Mileage (km)
                      </label>
                      <input
                        type="number"
                        {...register('mileage')}
                        placeholder="50000"
                        className="w-full px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-naija-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Trim/Variant
                      </label>
                      <input
                        type="text"
                        {...register('trim')}
                        placeholder="e.g., LE, XLE"
                        className="w-full px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-naija-500"
                      />
                    </div>
                  </div>

                  {/* VIN */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      VIN Number (Optional)
                    </label>
                    <input
                      type="text"
                      {...register('vinNumber')}
                      placeholder="17 character VIN"
                      maxLength={17}
                      className="w-full px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-naija-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      placeholder="Describe the car condition, features, history..."
                      className="w-full px-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-naija-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Media Upload */}
              {step === 3 && createdListingId && (
                <div className="p-4 md:p-8 max-h-[60vh] overflow-y-auto">
                  <MediaUploader
                    listingId={createdListingId}
                    initialMedia={uploadedMedia}
                    onUploadComplete={handleMediaUploadComplete}
                  />
                </div>
              )}

              {/* Footer */}
              <div className="p-6 border-t border-pearl-200 flex justify-between gap-3">
                {step > 1 && !createdListingId && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-3 bg-pearl-100 text-charcoal-700 rounded-xl
                             hover:bg-pearl-200 transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-naija-500 to-naija-600
                           text-white rounded-xl hover:shadow-button transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    'Creating...'
                  ) : step === 3 ? (
                    <>
                      <Check className="w-5 h-5" />
                      Publish Listing
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
