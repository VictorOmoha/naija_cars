import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Upload, MapPin, DollarSign, Camera, Check, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { carMakes, nigerianStates } from '../../data/cars';
import { listingsAPI, mediaAPI } from '../../services/api';
import useAuthStore from '../../stores/authStore';

const ListCarModal = () => {
  const { isListCarOpen, setIsListCarOpen, addToast } = useApp();
  const { isAuthenticated, user } = useAuthStore();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(1);
  const [listingType, setListingType] = useState('sale');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    trim: '',
    mileage: '',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    condition: 'Foreign Used',
    price: '',
    state: '',
    city: '',
    description: '',
    images: [],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setUploadedImages(prev => [...prev, ...newImages].slice(0, 20));
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Map frontend condition values to backend enum format
  const mapCondition = (condition) => {
    const conditionMap = {
      'Brand New': 'BRAND_NEW',
      'Foreign Used': 'FOREIGN_USED',
      'Nigerian Used': 'NIGERIAN_USED'
    };
    return conditionMap[condition] || 'NIGERIAN_USED';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      addToast('Please sign in to list your car.', 'error');
      setIsListCarOpen(false);
      return;
    }

    // Check if user is verified
    if (!user?.isVerified) {
      addToast('Please verify your account before listing a car.', 'error');
      return;
    }

    // Validate required fields
    if (!formData.make || !formData.model || !formData.year || !formData.price || !formData.state || !formData.city) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare listing data for backend
      const listingData = {
        listingType: listingType.toUpperCase(),
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        trim: formData.trim || undefined,
        mileage: formData.mileage ? parseInt(formData.mileage.replace(/,/g, '')) : undefined,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        condition: mapCondition(formData.condition),
        price: parseFloat(formData.price.replace(/,/g, '')),
        locationState: formData.state,
        locationCity: formData.city,
        description: formData.description || undefined
      };

      // Create the listing
      const response = await listingsAPI.create(listingData);
      const listingId = response.data.data.listing.id;

      // Upload images if any
      if (uploadedImages.length > 0) {
        const imageFiles = uploadedImages.map(img => img.file);
        try {
          await mediaAPI.upload(listingId, imageFiles);
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          // Continue even if image upload fails
        }
      }

      addToast('Your car listing has been submitted for review!', 'success');
      setIsListCarOpen(false);
      setStep(1);
      setUploadedImages([]);
      setFormData({
        make: '', model: '', year: '', trim: '', mileage: '',
        transmission: 'Automatic', fuelType: 'Petrol', condition: 'Foreign Used',
        price: '', state: '', city: '', description: '', images: [],
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      const errorMessage = error.response?.data?.error?.message ||
                          error.response?.data?.error?.details?.[0]?.msg ||
                          'Failed to create listing. Please try again.';
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="font-display text-xl font-semibold text-charcoal-800">Car Details</h3>
              <p className="text-sm text-charcoal-600">Tell us about your vehicle</p>
            </div>

            {/* Listing Type */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'sale', label: 'For Sale', desc: 'Sell your car' },
                { id: 'rent', label: 'For Rent', desc: 'Rent out your car' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setListingType(type.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    listingType === type.id
                      ? 'border-naija-500 bg-naija-50'
                      : 'border-pearl-300 hover:border-naija-300'
                  }`}
                >
                  <span className={`font-semibold ${listingType === type.id ? 'text-naija-700' : 'text-charcoal-700'}`}>
                    {type.label}
                  </span>
                  <span className="block text-xs text-charcoal-600 mt-1">{type.desc}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">Make *</label>
                <select
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  required
                  className="select-warm"
                >
                  <option value="">Select Make</option>
                  {carMakes.map((make) => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">Model *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. Camry"
                  required
                  className="input-warm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">Year *</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  className="select-warm"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 25 }, (_, i) => 2024 - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">Trim</label>
                <input
                  type="text"
                  name="trim"
                  value={formData.trim}
                  onChange={handleChange}
                  placeholder="e.g. XLE"
                  className="input-warm"
                />
              </div>
              <div>
                <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">Mileage</label>
                <input
                  type="text"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  placeholder="km"
                  className="input-warm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">Transmission</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="select-warm"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="select-warm"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="select-warm"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Foreign Used">Foreign Used</option>
                  <option value="Nigerian Used">Nigerian Used</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="font-display text-xl font-semibold text-charcoal-800">Pricing & Location</h3>
              <p className="text-sm text-charcoal-600">Set your price and location</p>
            </div>

            <div>
              <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                {listingType === 'rent' ? 'Price Per Day (₦) *' : 'Price (₦) *'}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-600" />
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder={listingType === 'rent' ? 'e.g. 50,000' : 'e.g. 15,000,000'}
                  required
                  className="input-warm pl-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">State *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-600" />
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="select-warm pl-12"
                  >
                    <option value="">Select State</option>
                    {nigerianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Victoria Island"
                  required
                  className="input-warm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your car's condition, features, and any additional details..."
                rows={4}
                className="input-warm resize-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="font-display text-xl font-semibold text-charcoal-800">Upload Photos</h3>
              <p className="text-sm text-charcoal-600">Add photos of your vehicle (up to 20)</p>
            </div>

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img
                      src={image.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full
                               opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-naija-500 text-white text-xs rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <label className="border-2 border-dashed border-pearl-300 rounded-2xl p-8
                         hover:border-naija-400 transition-colors cursor-pointer block">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-naija-50
                             rounded-2xl mb-4">
                  <Camera className="w-8 h-8 text-naija-500" />
                </div>
                <p className="text-charcoal-700 font-medium mb-2">Click to upload photos</p>
                <p className="text-sm text-charcoal-600 mb-4">
                  {uploadedImages.length > 0
                    ? `${uploadedImages.length} photo${uploadedImages.length > 1 ? 's' : ''} selected`
                    : 'JPG, PNG up to 10MB each'}
                </p>
                <span className="px-6 py-2.5 bg-naija-50 text-naija-700 font-medium rounded-xl
                           hover:bg-naija-100 transition-colors inline-flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </span>
              </div>
            </label>

            {/* Photo Tips */}
            <div className="bg-pearl-100 rounded-xl p-4 border border-pearl-200">
              <h4 className="text-sm font-semibold text-charcoal-700 mb-2">Photo Tips:</h4>
              <ul className="text-xs text-charcoal-700 space-y-1">
                <li>• Include exterior shots from all angles</li>
                <li>• Add clear interior photos</li>
                <li>• Show the dashboard and mileage</li>
                <li>• Include any special features or damage</li>
              </ul>
            </div>

            {/* Summary */}
            <div className="bg-pearl-100 rounded-xl p-4 border border-pearl-200">
              <h4 className="text-sm font-semibold text-charcoal-700 mb-3">Listing Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-charcoal-600">Car:</span>
                <span className="text-charcoal-700">{formData.year} {formData.make} {formData.model}</span>
                <span className="text-charcoal-600">Type:</span>
                <span className="text-charcoal-700">{listingType === 'sale' ? 'For Sale' : 'For Rent'}</span>
                <span className="text-charcoal-600">Price:</span>
                <span className="text-naija-500 font-semibold">
                  ₦{formData.price || '0'}{listingType === 'rent' && '/day'}
                </span>
                <span className="text-charcoal-600">Location:</span>
                <span className="text-charcoal-700">{formData.city}, {formData.state}</span>
                <span className="text-charcoal-600">Photos:</span>
                <span className="text-charcoal-700">{uploadedImages.length} uploaded</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isListCarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          onClick={() => setIsListCarOpen(false)}
        >
          <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white border border-pearl-200
                     rounded-3xl shadow-card-hover overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsListCarOpen(false)}
              className="absolute top-4 right-4 p-2 text-charcoal-600 hover:text-charcoal-700
                       hover:bg-pearl-100 rounded-xl transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="p-6 pb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-naija-50 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-naija-500" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-charcoal-800">List Your Car</h2>
                  <p className="text-sm text-charcoal-600">Step {step} of 3</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      s <= step ? 'bg-naija-500' : 'bg-pearl-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-pearl-200">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 border border-pearl-300 text-charcoal-600
                             font-medium rounded-xl hover:border-naija-400 transition-colors"
                  >
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-naija-500 text-white font-semibold rounded-xl
                             shadow-button hover:bg-naija-600 transition-colors"
                  >
                    Continue
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    className="flex-1 py-3 bg-naija-500 text-white font-semibold rounded-xl
                             shadow-button hover:bg-naija-600 flex items-center justify-center gap-2
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Submit Listing
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ListCarModal;
