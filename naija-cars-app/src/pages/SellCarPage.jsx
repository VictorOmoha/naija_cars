import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Car, Camera, DollarSign, FileText, Shield, CheckCircle,
  ChevronRight, TrendingUp, Users, Clock, ArrowRight, X, Plus, Loader2
} from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import { CAR_MAKES, BODY_TYPES, NIGERIAN_STATES, CAR_FEATURES } from '../data/constants';

// Map frontend condition values → backend enum
const conditionToBackend = {
  'brand-new': 'BRAND_NEW',
  'foreign-used': 'FOREIGN_USED',
  'nigerian-used': 'NIGERIAN_USED',
};

// Map backend condition enum → frontend values
const conditionToFrontend = {
  'BRAND_NEW': 'brand-new',
  'FOREIGN_USED': 'foreign-used',
  'NIGERIAN_USED': 'nigerian-used',
};

const SellCarPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useApp();
  const editId = searchParams.get('edit'); // listing ID if in edit mode
  const isEditMode = !!editId;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [images, setImages] = useState([]); // new file uploads
  const [existingImages, setExistingImages] = useState([]); // already-uploaded URLs
  const [formData, setFormData] = useState({
    // Basic Info
    make: '',
    model: '',
    year: '',
    condition: 'nigerian-used',
    listingType: 'SALE',
    // Details
    mileage: '',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: '',
    color: '',
    engineSize: '',
    // Pricing
    price: '',
    negotiable: true,
    // Description
    title: '',
    description: '',
    features: [],
    // Contact
    phone: '',
    whatsapp: '',
    locationCity: '',
    locationState: '',
  });

  const steps = [
    { number: 1, title: 'Basic Info', icon: Car },
    { number: 2, title: 'Details', icon: FileText },
    { number: 3, title: 'Photos', icon: Camera },
    { number: 4, title: 'Pricing', icon: DollarSign },
    { number: 5, title: 'Review', icon: CheckCircle },
  ];

  const benefits = [
    { icon: Users, title: 'Reach Millions', desc: 'Access thousands of verified buyers across Nigeria' },
    { icon: Shield, title: 'Secure Transactions', desc: 'Protected payments and verified buyer contacts' },
    { icon: TrendingUp, title: 'Best Prices', desc: 'Get competitive market rates for your vehicle' },
    { icon: Clock, title: 'Quick Sales', desc: 'Average selling time of just 14 days' },
  ];

  // Fetch existing listing data in edit mode
  useEffect(() => {
    if (!editId) return;

    const fetchListing = async () => {
      setIsLoadingEdit(true);
      try {
        const response = await api.get(`/listings/${editId}`);
        const listing = response.data.data.listing;

        setFormData({
          make: listing.make || '',
          model: listing.model || '',
          year: listing.year?.toString() || '',
          condition: conditionToFrontend[listing.condition] || 'nigerian-used',
          listingType: listing.listingType || 'SALE',
          mileage: listing.mileage?.toString() || '',
          transmission: listing.transmission || 'automatic',
          fuelType: listing.fuelType || 'petrol',
          bodyType: listing.bodyType || '',
          color: listing.color || '',
          engineSize: listing.engineSize || '',
          price: listing.price?.toString() || '',
          negotiable: listing.negotiable ?? true,
          title: listing.title || `${listing.year} ${listing.make} ${listing.model}`,
          description: listing.description || '',
          features: listing.features || [],
          phone: listing.phone || '',
          whatsapp: listing.whatsapp || '',
          locationCity: listing.locationCity || '',
          locationState: listing.locationState || '',
        });

        // Load existing images as previews
        if (listing.media && listing.media.length > 0) {
          setExistingImages(listing.media.map(m => ({ id: m.id, url: m.url || m.thumbnailUrl })));
        }
      } catch (error) {
        addToast('Failed to load listing for editing', 'error');
        navigate('/dashboard');
      } finally {
        setIsLoadingEdit(false);
      }
    };

    fetchListing();
  }, [editId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    const totalAllowed = 10 - existingImages.length;
    setImages(prev => [...prev, ...newImages].slice(0, totalAllowed));
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        listingType: formData.listingType,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        condition: conditionToBackend[formData.condition],
        price: parseFloat(formData.price),
        locationCity: formData.locationCity,
        locationState: formData.locationState,
        description: formData.description,
      };

      let listing;

      if (isEditMode) {
        // Update existing listing
        const response = await api.put(`/listings/${editId}`, payload);
        listing = response.data.data.listing;
      } else {
        // Create new listing
        const response = await api.post('/listings', payload);
        listing = response.data.data.listing;
      }

      // Upload new images if any were selected
      if (images.length > 0) {
        const mediaFormData = new FormData();
        mediaFormData.append('listingId', listing.id);
        images.forEach((img) => {
          mediaFormData.append('files', img.file);
        });

        await api.post('/media/upload', mediaFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      addToast(
        isEditMode ? 'Listing updated successfully!' : 'Your listing has been submitted for review!',
        'success'
      );
      navigate(`/car/${listing.id}`);
    } catch (error) {
      const message =
        error.response?.data?.error?.message || `Failed to ${isEditMode ? 'update' : 'submit'} listing. Please try again.`;
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-charcoal-800">
              Tell us about your car
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Listing Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Listing Type *
                </label>
                <div className="flex gap-4">
                  {[{ value: 'SALE', label: 'For Sale' }, { value: 'RENT', label: 'For Rent' }].map(option => (
                    <label key={option.value} className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.listingType === option.value
                        ? 'border-naija-500 bg-naija-50 text-naija-700'
                        : 'border-pearl-300 text-charcoal-600'
                    }`}>
                      <input
                        type="radio"
                        name="listingType"
                        value={option.value}
                        checked={formData.listingType === option.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Car Make *
                </label>
                <select
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                >
                  <option value="">Select Make</option>
                  {CAR_MAKES.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Camry, Accord, C300"
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                >
                  <option value="brand-new">Brand New</option>
                  <option value="foreign-used">Foreign Used (Tokunbo)</option>
                  <option value="nigerian-used">Nigerian Used</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-charcoal-800">
              Vehicle Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Mileage (km) *
                </label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Transmission *
                </label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
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
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Body Type *
                </label>
                <select
                  name="bodyType"
                  value={formData.bodyType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                >
                  <option value="">Select Body Type</option>
                  {BODY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="e.g., Black, White, Silver"
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Engine Size
                </label>
                <input
                  type="text"
                  name="engineSize"
                  value={formData.engineSize}
                  onChange={handleInputChange}
                  placeholder="e.g., 2.5L, 3.0L"
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-3">
                Features
              </label>
              <div className="flex flex-wrap gap-2">
                {CAR_FEATURES.map(feature => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => handleFeatureToggle(feature)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.features.includes(feature)
                        ? 'bg-naija-500 text-white'
                        : 'bg-pearl-100 text-charcoal-600 hover:bg-pearl-200'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-charcoal-800">
              Upload Photos
            </h3>
            <p className="text-charcoal-600">
              Add up to 10 photos. First photo will be the main image.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Existing (already uploaded) images */}
              {existingImages.map((image, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img
                    src={image.url}
                    alt={`Car ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-naija-500 text-white text-xs rounded-full">
                      Main
                    </span>
                  )}
                </div>
              ))}

              {/* New file uploads */}
              {images.map((image, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img
                    src={image.preview}
                    alt={`New ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-gold-500 text-white text-xs rounded-full">
                    New
                  </span>
                </div>
              ))}

              {(existingImages.length + images.length) < 10 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-pearl-300 hover:border-naija-500 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                  <Plus className="w-8 h-8 text-pearl-400" />
                  <span className="text-sm text-pearl-500">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-medium text-amber-800 mb-2">Photo Tips:</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Take photos in good lighting</li>
                <li>• Include exterior, interior, and engine photos</li>
                <li>• Show any damage or wear clearly</li>
                <li>• Clean your car before taking photos</li>
              </ul>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-charcoal-800">
              Set Your Price & Contact Info
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Asking Price (₦) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 15000000"
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="negotiable"
                    checked={formData.negotiable}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-naija-500 rounded focus:ring-naija-500"
                  />
                  <span className="text-charcoal-700">Price is negotiable</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Listing Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Clean Toyota Camry 2019 with full options"
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your car's condition, history, and any special features..."
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g., 08012345678"
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="e.g., 08012345678"
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  State *
                </label>
                <select
                  name="locationState"
                  value={formData.locationState}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                >
                  <option value="">Select State</option>
                  {NIGERIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Location/Area *
                </label>
                <input
                  type="text"
                  name="locationCity"
                  value={formData.locationCity}
                  onChange={handleInputChange}
                  placeholder="e.g., Victoria Island, Lekki"
                  className="w-full px-4 py-3 border border-pearl-300 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-charcoal-800">
              Review Your Listing
            </h3>

            <div className="bg-pearl-50 rounded-2xl p-6 space-y-4">
              <div className="flex gap-4">
                {(existingImages[0] || images[0]) && (
                  <img
                    src={existingImages[0]?.url || images[0]?.preview}
                    alt="Main"
                    className="w-32 h-24 object-cover rounded-xl"
                  />
                )}
                <div>
                  <h4 className="font-bold text-charcoal-800">
                    {formData.title || `${formData.year} ${formData.make} ${formData.model}`}
                  </h4>
                  <p className="text-2xl font-bold text-naija-600">
                    ₦{Number(formData.price).toLocaleString()}
                    {formData.negotiable && <span className="text-sm font-normal text-charcoal-500 ml-2">Negotiable</span>}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    formData.listingType === 'RENT' ? 'bg-blue-100 text-blue-700' : 'bg-naija-100 text-naija-700'
                  }`}>
                    {formData.listingType === 'RENT' ? 'For Rent' : 'For Sale'}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b border-pearl-200">
                  <span className="text-charcoal-500">Make</span>
                  <span className="font-medium">{formData.make}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-pearl-200">
                  <span className="text-charcoal-500">Model</span>
                  <span className="font-medium">{formData.model}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-pearl-200">
                  <span className="text-charcoal-500">Year</span>
                  <span className="font-medium">{formData.year}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-pearl-200">
                  <span className="text-charcoal-500">Condition</span>
                  <span className="font-medium capitalize">{formData.condition.replace(/-/g, ' ')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-pearl-200">
                  <span className="text-charcoal-500">Mileage</span>
                  <span className="font-medium">{Number(formData.mileage).toLocaleString()} km</span>
                </div>
                <div className="flex justify-between py-2 border-b border-pearl-200">
                  <span className="text-charcoal-500">Transmission</span>
                  <span className="font-medium capitalize">{formData.transmission}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-pearl-200">
                  <span className="text-charcoal-500">Location</span>
                  <span className="font-medium">{formData.locationCity}, {formData.locationState}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-pearl-200">
                  <span className="text-charcoal-500">Photos</span>
                  <span className="font-medium">{existingImages.length + images.length} uploaded</span>
                </div>
              </div>

              {formData.features.length > 0 && (
                <div>
                  <span className="text-charcoal-500 text-sm">Features:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.features.map(feature => (
                      <span key={feature} className="px-3 py-1 bg-naija-100 text-naija-700 text-sm rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={`border rounded-xl p-4 ${isEditMode ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-start gap-3">
                <CheckCircle className={`w-5 h-5 mt-0.5 ${isEditMode ? 'text-blue-600' : 'text-green-600'}`} />
                <div>
                  <h4 className={`font-medium ${isEditMode ? 'text-blue-800' : 'text-green-800'}`}>
                    {isEditMode ? 'Ready to Update' : 'Ready to Submit'}
                  </h4>
                  <p className={`text-sm ${isEditMode ? 'text-blue-700' : 'text-green-700'}`}>
                    {isEditMode
                      ? 'Your changes will be saved immediately.'
                      : 'Your listing will be reviewed within 24 hours and published once approved.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoadingEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-naija-500 animate-spin mx-auto mb-4" />
          <p className="text-charcoal-600">Loading listing data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-800 via-gray-900 to-green-900">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            {isEditMode && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-200 rounded-full text-sm font-medium mb-4">
                <FileText className="w-4 h-4" />
                Editing Listing
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              {isEditMode ? 'Update Your Listing' : <>Sell Your Car <span className="text-green-400">Fast</span></>}
            </h1>
            <p className="text-xl text-gray-300">
              {isEditMode
                ? 'Make changes to your listing below. Updates are saved immediately.'
                : 'List your vehicle and reach thousands of verified buyers across Nigeria. Get the best price with our trusted marketplace.'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits (only on create) */}
      {!isEditMode && (
        <section className="py-12 bg-white border-b border-pearl-200">
          <div className="section-container">
            <div className="grid md:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="p-3 bg-naija-100 rounded-xl">
                    <benefit.icon className="w-6 h-6 text-naija-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-charcoal-800">{benefit.title}</h3>
                    <p className="text-sm text-charcoal-600">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Form Section */}
      <section className="py-16">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <button
                      onClick={() => setCurrentStep(step.number)}
                      className={`flex flex-col items-center gap-2 ${
                        currentStep >= step.number ? 'text-naija-600' : 'text-pearl-400'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        currentStep >= step.number
                          ? 'bg-naija-500 text-white'
                          : 'bg-pearl-200 text-pearl-500'
                      }`}>
                        {currentStep > step.number ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <step.icon className="w-6 h-6" />
                        )}
                      </div>
                      <span className="text-sm font-medium hidden md:block">{step.title}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className={`w-full h-1 mx-2 rounded ${
                        currentStep > step.number ? 'bg-naija-500' : 'bg-pearl-200'
                      }`} style={{ minWidth: '40px' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-card p-8"
            >
              <form onSubmit={handleSubmit}>
                {renderStepContent()}

                <div className="flex justify-between mt-8 pt-6 border-t border-pearl-200">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      currentStep === 1
                        ? 'opacity-0 pointer-events-none'
                        : 'text-charcoal-600 hover:bg-pearl-100'
                    }`}
                  >
                    Back
                  </button>

                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                      className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2"
                    >
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {isEditMode ? 'Updating...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          {isEditMode ? 'Update Listing' : 'Submit Listing'}
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section (only on create) */}
      {!isEditMode && (
        <section className="py-16 bg-gray-800">
          <div className="section-container text-center">
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              Need Help Selling Your Car?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Our team can help you create the perfect listing and connect with serious buyers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/valuation"
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                Get Free Valuation
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 border border-gray-400 text-gray-200 rounded-xl font-medium hover:bg-gray-700 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default SellCarPage;
