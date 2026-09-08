import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useId, cloneElement } from 'react';
import { PageState } from '../components/PageLayout';
import { Car, X, Plus, Loader2, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api, { subscriptionAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import useAuthStore from '../stores/authStore';
import { CAR_MAKES, BODY_TYPES, NIGERIAN_STATES, CAR_FEATURES } from '../data/constants';
import { prepareListingImageData } from '../utils/listingImages';
import { calculateValuation, carModels } from '../utils/valuation';
import { formatNaira } from '../utils/format';

// Map frontend condition values → backend enum
const conditionToBackend = {
  'brand-new': 'BRAND_NEW',
  'foreign-used': 'FOREIGN_USED',
  'nigerian-used': 'NIGERIAN_USED',
};

const conditionToFrontend = {
  BRAND_NEW: 'brand-new',
  FOREIGN_USED: 'foreign-used',
  NIGERIAN_USED: 'nigerian-used',
};

// Condition values → valuation model labels
const conditionToValuation = {
  'brand-new': 'Brand New',
  'foreign-used': 'Foreign Used (Tokunbo)',
  'nigerian-used': 'Nigerian Used',
};

const STEPS = [
  { number: 1, label: 'CAR DETAILS' },
  { number: 2, label: 'PHOTOS' },
  { number: 3, label: 'PRICING' },
  { number: 4, label: 'REVIEW' },
];

const Field = ({ label, children, className = '' }) => {
  const id = useId();
  const control = ['input', 'select', 'textarea'].includes(children?.type);
  return <div className={className}><label htmlFor={control ? id : undefined} className="block text-sm font-medium mb-2">{label}</label>{control ? cloneElement(children, { id }) : children}</div>;
};

const ChipGroup = ({ options, value, onChange }) => (
  <div className="flex gap-2 flex-wrap">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        aria-pressed={value === opt.value}
        onClick={() => onChange(opt.value)}
        className={`text-[13px] rounded-xl transition-colors ${
          value === opt.value
            ? 'font-semibold bg-brand text-white px-5 py-[11px]'
            : 'font-bold border border-lightborder px-[18px] py-[9px] hover:bg-ink/5'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const SellCarPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast, setIsSignInOpen } = useApp();
  const { isAuthenticated, user } = useAuthStore();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  // Subscription check
  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => subscriptionAPI.getMySubscription(),
    enabled: isAuthenticated,
  });
  const subscription = subData?.data?.data?.subscription;
  const hasActiveSub = !!subscription;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [images, setImages] = useState([]);
  const previewUrls = useRef(new Set());
  useEffect(() => () => { previewUrls.current.forEach(url => URL.revokeObjectURL(url)); }, []);
  const [existingImages, setExistingImages] = useState([]);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    condition: 'nigerian-used',
    listingType: 'SALE',
    mileage: '',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: '',
    color: '',
    engineSize: '',
    price: '',
    negotiable: true,
    title: '',
    description: '',
    features: [],
    phone: '',
    whatsapp: '',
    locationCity: '',
    locationState: '',
  });

  // Live instant estimate — recalculates as car details change
  const estimate = useMemo(() => {
    if (!formData.year || !carModels[formData.make]?.includes(formData.model)) return null;
    return calculateValuation({
      make: formData.make,
      model: formData.model,
      year: formData.year,
      condition: conditionToValuation[formData.condition],
      mileage: formData.mileage,
      transmission: formData.transmission === 'manual' ? 'Manual' : 'Automatic',
      fuelType: formData.fuelType.charAt(0).toUpperCase() + formData.fuelType.slice(1),
      location: formData.locationState,
    });
  }, [formData.make, formData.model, formData.year, formData.condition, formData.mileage, formData.transmission, formData.fuelType, formData.locationState]);

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
          transmission: (listing.transmission || 'automatic').toLowerCase(),
          fuelType: (listing.fuelType || 'petrol').toLowerCase(),
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

        if (listing.media && listing.media.length > 0) {
          setExistingImages(listing.media.map(m => ({ id: m.id, url: m.url || m.thumbnailUrl })));
        }
      } catch {
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
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
    const totalAllowed = 10 - existingImages.length - images.length;
    const validFiles = files.filter(file => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024);
    if (validFiles.length !== files.length) addToast('Choose images smaller than 10 MB.', 'error');
    if (validFiles.length > totalAllowed) addToast('A listing can contain up to 10 photos.', 'info');
    const newImages = validFiles.slice(0, totalAllowed).map(file => {
      const preview = URL.createObjectURL(file);
      previewUrls.current.add(preview);
      return { file, preview };
    });
    setImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(images[index].preview);
    previewUrls.current.delete(images[index].preview);
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (index) => {
    const image = existingImages[index];
    try {
      await api.delete(`/media/${image.id}`);
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Failed to delete image:', error);
      addToast('Failed to delete image. Please try again.', 'error');
    }
  };

  const validateStep = (step) => {
    if (step === 1 && (!formData.make || !formData.model || !formData.year || Number(formData.year) < 1900 || Number(formData.year) > new Date().getFullYear() + 1)) { addToast('Enter a make, model and valid year before continuing.', 'error'); return false; }
    if (step === 1 && (!formData.locationCity.trim() || !formData.locationState)) { addToast('Enter the city and state where the car is located.', 'error'); return false; }
    if (step === 1 && formData.mileage && Number(formData.mileage) < 0) { addToast('Mileage cannot be negative.', 'error'); return false; }
    if (step === 2 && existingImages.length + images.length === 0) { addToast('Add at least one photo before continuing.', 'error'); return false; }
    if (step === 3 && !(Number(formData.price) > 0)) { addToast('Enter a price greater than zero before continuing.', 'error'); return false; }
    return true;
  };
  const goToStep = (next) => {
    if (next <= currentStep) return setCurrentStep(next);
    for (let step = 1; step < next; step++) if (!validateStep(step)) { setCurrentStep(step); return; }
    setCurrentStep(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    for (let step = 1; step <= 3; step++) if (!validateStep(step)) { setCurrentStep(step); return; }
    setIsSubmitting(true);

    if (existingImages.length + images.length === 0) {
      addToast('Please add at least one photo before submitting your listing.', 'error');
      setCurrentStep(2);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        listingType: formData.listingType,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        title: formData.title || null,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        bodyType: formData.bodyType || null,
        color: formData.color || null,
        engineSize: formData.engineSize || null,
        condition: conditionToBackend[formData.condition],
        price: parseFloat(formData.price),
        negotiable: formData.negotiable,
        locationCity: formData.locationCity,
        locationState: formData.locationState,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        description: formData.description,
        features: formData.features,
      };

      let listing;
      if (isEditMode) {
        const response = await api.put(`/listings/${editId}`, payload);
        listing = response.data.data.listing;
      } else {
        const response = await api.post('/listings', payload);
        listing = response.data.data.listing;
      }

      let failedImageUploads = 0;
      if (images.length > 0) {
        for (const image of images) {
          try {
            const preparedImages = await prepareListingImageData([image.file]);
            await api.post('/media/upload-data', {
              listingId: listing.id,
              images: preparedImages
            });
          } catch (imageError) {
            failedImageUploads += 1;
            console.error('Failed to upload listing image:', imageError);
          }
        }
      }

      if (failedImageUploads > 0) {
        addToast(
          `${isEditMode ? 'Listing updated' : 'Your listing is live'}, but ${failedImageUploads} photo${failedImageUploads === 1 ? '' : 's'} did not upload. You can retry from your dashboard.`,
          'info'
        );
      } else {
        addToast(isEditMode ? 'Listing updated successfully!' : 'Your listing is now live!', 'success');
      }

      navigate(`/car/${listing.id}`);
    } catch (error) {
      const message =
        error.response?.data?.error?.message || `Failed to ${isEditMode ? 'update' : 'submit'} listing. Please try again.`;
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'nc-input';

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <Field label="Listing type">
              <ChipGroup
                options={[{ value: 'SALE', label: 'For sale' }, { value: 'RENT', label: 'For rent' }]}
                value={formData.listingType}
                onChange={(v) => setFormData(prev => ({ ...prev, listingType: v }))}
              />
            </Field>

            <div className="grid md:grid-cols-2 gap-3.5">
              <Field label="Make *">
                <select name="make" value={formData.make} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select make</option>
                  {formData.make && !CAR_MAKES.includes(formData.make) && <option value={formData.make}>{formData.make}</option>}
                  {CAR_MAKES.map(make => <option key={make} value={make}>{make}</option>)}
                </select>
              </Field>
              <Field label="Model *">
                <input
                  type="text" name="model" value={formData.model} onChange={handleInputChange}
                  placeholder="e.g. Camry, Accord, C300" className={inputClass}
                />
              </Field>
              <Field label="Year *">
                <select name="year" value={formData.year} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select year</option>
                  {Array.from({ length: new Date().getFullYear() - 1898 }, (_, i) => new Date().getFullYear() + 1 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </Field>
              <Field label="Mileage (km)">
                <input
                  type="number" name="mileage" value={formData.mileage} onChange={handleInputChange}
                  placeholder="e.g. 62,400" className={inputClass}
                />
              </Field>
            </div>

            <Field label="Condition *">
              <ChipGroup
                options={[
                  { value: 'foreign-used', label: 'Tokunbo (foreign used)' },
                  { value: 'nigerian-used', label: 'Naija-used' },
                  { value: 'brand-new', label: 'Brand new' },
                ]}
                value={formData.condition}
                onChange={(v) => setFormData(prev => ({ ...prev, condition: v }))}
              />
            </Field>

            <div className="grid md:grid-cols-2 gap-3.5">
              <Field label="Transmission">
                <select name="transmission" value={formData.transmission} onChange={handleInputChange} className={inputClass}>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </Field>
              <Field label="Fuel type">
                <select name="fuelType" value={formData.fuelType} onChange={handleInputChange} className={inputClass}>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
              </Field>
              <Field label="Body type">
                <select name="bodyType" value={formData.bodyType} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select body type</option>
                  {BODY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </Field>
              <Field label="Colour">
                <input
                  type="text" name="color" value={formData.color} onChange={handleInputChange}
                  placeholder="e.g. Black, Silver" className={inputClass}
                />
              </Field>
              <Field label="Engine size">
                <input
                  type="text" name="engineSize" value={formData.engineSize} onChange={handleInputChange}
                  placeholder="e.g. 2.5L" className={inputClass}
                />
              </Field>
            </div>

            <div className="grid md:grid-cols-2 gap-3.5">
              <Field label="State *">
                <select name="locationState" value={formData.locationState} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </Field>
              <Field label="Area *">
                <input
                  type="text" name="locationCity" value={formData.locationCity} onChange={handleInputChange}
                  placeholder="e.g. Lekki, Victoria Island" className={inputClass}
                />
              </Field>
              <Field label="Phone (optional)">
                <input
                  type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  placeholder="0803 000 0000" className={inputClass}
                />
              </Field>
              <Field label="Phone (WhatsApp)">
                <input
                  type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange}
                  placeholder="0803 000 0000" className={inputClass}
                />
              </Field>
            </div>

            <Field label="Features">
              <div className="flex flex-wrap gap-2">
                {CAR_FEATURES.map(feature => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => handleFeatureToggle(feature)}
                    aria-pressed={formData.features.includes(feature)}
                    className={`text-xs rounded-full transition-colors ${
                      formData.features.includes(feature)
                        ? 'font-semibold bg-brand text-white px-3.5 py-2'
                        : 'font-bold border border-lightborder px-3 py-1.5 hover:border-ink'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <p className="text-[13px] font-semibold text-muted">
              Add up to 10 photos. The first photo becomes the main image.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {existingImages.map((image, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-[10px] overflow-hidden border border-lightborder group">
                  <img src={image.url} alt={`Car ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1.5 right-1.5 p-1 bg-ink text-white rounded-full opacity-100 transition-opacity"
                    aria-label="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 badge-verified text-[9px] px-2 py-[3px]">MAIN</span>
                  )}
                </div>
              ))}

              {images.map((image, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-[10px] overflow-hidden border border-lightborder group">
                  <img src={image.preview} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 p-1 bg-ink text-white rounded-full opacity-100 transition-opacity"
                    aria-label="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold uppercase bg-amber text-ink px-2 py-[3px] rounded-full">
                    New
                  </span>
                </div>
              ))}

              {(existingImages.length + images.length) < 10 && (
                <label className="aspect-square rounded-[10px] border-2 border-dashed border-ink/40 hover:border-brand cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-colors">
                  <Plus className="w-7 h-7 text-placeholdertext" />
                  <span className="text-xs font-bold text-placeholdertext">Add photo</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="border-2 border-amber bg-amber-tint rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.06em] text-warntext mb-2">Photo tips</h4>
              <ul className="text-[12.5px] font-semibold text-warntext space-y-1">
                <li>• Shoot in good light — golden hour flatters every car</li>
                <li>• Include exterior ¾ front, interior, dashboard and engine bay</li>
                <li>• Show any damage or wear clearly — honesty sells faster</li>
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3.5">
              <Field label={formData.listingType === 'RENT' ? 'Daily rental price (₦) *' : 'Asking price (₦) *'}>
                <input
                  type="number" name="price" value={formData.price} onChange={handleInputChange}
                  placeholder="e.g. 18,500,000" className={inputClass}
                />
              </Field>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, negotiable: !prev.negotiable }))}
                    role="switch"
                    aria-checked={formData.negotiable}
                    className={`relative w-10 h-[23px] rounded-full transition-colors ${formData.negotiable ? 'bg-brand' : 'bg-lightborder'}`}
                  >
                    <span className={`absolute top-[3px] w-[17px] h-[17px] rounded-full bg-white transition-all ${formData.negotiable ? 'right-[3px]' : 'left-[3px]'}`} />
                  </button>
                  <span className="text-[13px] font-bold">Price slightly negotiable</span>
                </label>
              </div>
            </div>

            {estimate && (
              <div className="border-2 border-amber bg-amber-tint rounded-[14px] px-4 py-3.5 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10.5px] font-bold tracking-[0.08em] uppercase">Indicative estimate</span>
                <span className="text-[17px] font-bold">
                  {formatNaira(estimate.lowEstimate)} – {formatNaira(estimate.highEstimate)}
                </span>
              </div>
            )}

            <Field label="Listing title">
              <input
                type="text" name="title" value={formData.title} onChange={handleInputChange}
                placeholder={`e.g. Clean ${formData.year || '2019'} ${formData.make || 'Toyota'} ${formData.model || 'Camry'} with full options`}
                className={inputClass}
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description" value={formData.description} onChange={handleInputChange} rows={5}
                placeholder="Describe the car's condition, history and any special features…"
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="border border-lightborder rounded-2xl p-5 space-y-4">
              <div className="flex gap-4 items-start">
                {(existingImages[0] || images[0]) && (
                  <img
                    src={existingImages[0]?.url || images[0]?.preview}
                    alt="Main"
                    className="w-32 h-24 object-cover rounded-[10px] border border-lightborder"
                  />
                )}
                <div>
                  <h4 className="text-[15px] font-semibold">
                    {formData.title || `${formData.year} ${formData.make} ${formData.model}`}
                  </h4>
                  <p className="text-[22px] font-bold tracking-[-0.02em] mt-0.5">
                    ₦{Number(formData.price || 0).toLocaleString()}
                    {formData.negotiable && (
                      <span className="text-xs font-bold text-brand ml-2">slightly negotiable</span>
                    )}
                  </p>
                  <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-[0.05em] bg-greentint text-brand px-2.5 py-1 rounded-full">
                    {formData.listingType === 'RENT' ? 'For rent' : 'For sale'}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-x-6 text-[13px] font-semibold">
                {[
                  ['Make', formData.make],
                  ['Model', formData.model],
                  ['Year', formData.year],
                  ['Condition', { 'foreign-used': 'Tokunbo', 'nigerian-used': 'Naija-used', 'brand-new': 'Brand new' }[formData.condition]],
                  ['Mileage', formData.mileage ? `${Number(formData.mileage).toLocaleString()} km` : '—'],
                  ['Transmission', formData.transmission],
                  ['Location', [formData.locationCity, formData.locationState].filter(Boolean).join(', ') || '—'],
                  ['Photos', `${existingImages.length + images.length} uploaded`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b-2 border-hairline">
                    <span className="text-muted">{label}</span>
                    <span className="font-bold capitalize">{value}</span>
                  </div>
                ))}
              </div>

              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formData.features.map(feature => (
                    <span key={feature} className="text-[10px] font-semibold uppercase bg-greentint text-brand px-2.5 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="border-2 border-brand bg-greentint rounded-xl p-4 flex items-start gap-3">
              <span className="flex-none w-[22px] h-[22px] rounded-full bg-brand text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" strokeWidth={3.5} />
              </span>
              <div>
                <h4 className="text-[13px] font-semibold text-brand">
                  {isEditMode ? 'Ready to update' : 'Ready to submit'}
                </h4>
                <p className="text-[12.5px] font-semibold text-muted mt-0.5">
                  {isEditMode
                    ? 'Your changes will be saved immediately.'
                    : 'Your listing will be published after submission with an active seller plan.'}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) return <PageState title="Ready to list your car?" description="Sign in to create your listing and manage it from your dashboard."><button className="nc-button" onClick={() => setIsSignInOpen(true)}>Sign in to get started</button><Link className="nc-button nc-button-secondary" to="/pricing">Explore seller plans</Link></PageState>;
  if (!isEditMode && !user?.isVerified) return <PageState title="Verify your account first" description="Confirm your email address before publishing a listing."><Link className="nc-button" to="/profile">Go to account settings</Link></PageState>;
  if (isLoadingEdit) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-muted">Loading listing data…</p>
        </div>
      </div>
    );
  }

  // Subscription gate (skip in edit mode)
  if (!isEditMode && !subLoading && !hasActiveSub && isAuthenticated) {
    return (
      <div className="min-h-screen bg-paper pt-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="nc-surface-lg p-10">
            <Car className="w-14 h-14 text-brand mx-auto mb-4" />
            <h1 className="nc-heading text-2xl mb-3">Subscription required</h1>
            <p className="text-sm font-semibold text-muted mb-6">
              You need an active subscription to list cars on NaijaCars. Choose a plan that fits your needs.
            </p>
            <Link to="/pricing" className="nc-action-green text-sm px-8 py-3.5">
              View plans →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isEditMode && hasActiveSub && subscription.listingsRemaining === 0) {
    return (
      <div className="min-h-screen bg-paper pt-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="nc-surface-lg p-10">
            <Car className="w-14 h-14 text-amber mx-auto mb-4" />
            <h1 className="nc-heading text-2xl mb-3">Listing limit reached</h1>
            <p className="text-sm font-semibold text-muted mb-6">
              You've used all {subscription.listingsLimit} listings on your {subscription.planName} plan this month.
              Upgrade for more listings.
            </p>
            <Link to="/pricing" className="nc-action-amber text-sm px-8 py-3.5">
              Upgrade plan →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper text-ink min-h-screen">
      {/* ===== Ink header with step indicator ===== */}
      <div className="nc-sell-header nc-page-width">
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
          <div>
            <h1 className="nc-heading text-2xl md:text-[40px]">
              {isEditMode ? 'Update your listing.' : 'A great listing starts here.'}
              <br />
              <span className="text-mint">{isEditMode ? 'Keep every detail current.' : 'Make your car stand out.'}</span>
            </h1>
            <p className="text-[13px] md:text-sm text-darkmuted mt-3">
              {isEditMode
                ? 'Edit the details below — your listing stays live while you work'
                : 'Add clear photos and honest details. Manage enquiries from your dashboard.'}
            </p>
          </div>

          {/* Desktop step indicator */}
          <div className="hidden md:flex items-center">
            {STEPS.map((step, i) => (
              <div key={step.number} className="flex items-center">
                {i > 0 && <div className="w-[52px] h-0.5 bg-ink-line mx-2 mb-[18px]" />}
                <button
                  type="button"
                  onClick={() => goToStep(step.number)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span
                    className={`w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center ${
                      currentStep === step.number
                        ? 'bg-amber text-ink'
                        : currentStep > step.number
                          ? 'bg-brand text-white'
                          : 'border border-lightborder text-placeholdertext'
                    }`}
                  >
                    {currentStep > step.number ? <Check className="w-4 h-4" strokeWidth={3.5} /> : step.number}
                  </span>
                  <span
                    className={`text-[10.5px] tracking-[0.06em] ${
                      currentStep === step.number
                        ? 'font-semibold text-amber'
                        : currentStep > step.number
                          ? 'font-bold text-mint'
                          : 'font-bold text-placeholdertext'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: step count + progress bar */}
        <div className="md:hidden mt-5">
          <div className="flex justify-between text-[11px] font-semibold mb-2">
            <span className="uppercase tracking-[0.06em]">{STEPS[currentStep - 1].label}</span>
            <span className="text-placeholdertext">{currentStep}/4</span>
          </div>
          <div className="flex gap-[5px]">
            {STEPS.map((step) => (
              <span
                key={step.number}
                className={`flex-1 h-[5px] rounded-full ${
                  step.number <= currentStep ? 'bg-amber' : 'bg-ink-line'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ===== Form + rail ===== */}
      <div className="nc-page-width grid lg:grid-cols-[1fr_320px] gap-[26px] pt-6 md:pt-8 pb-11">
        {/* Form card */}
        <form onSubmit={handleSubmit} className="nc-surface-lg p-5 md:p-[26px] self-start">
          <h2 className="nc-heading text-lg mb-5">
            {currentStep === 1 && 'Tell us about your car'}
            {currentStep === 2 && 'Add photos'}
            {currentStep === 3 && 'Set your price'}
            {currentStep === 4 && 'Review your listing'}
          </h2>

          {renderStepContent()}

          <div className="flex justify-between items-center mt-6 pt-6 border-t-2 border-hairline">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                className="nc-action-outline text-[13px] px-5 py-2.5"
              >
                ← Back
              </button>
            ) : (
              <span className="text-xs font-semibold text-muted">
                Step {currentStep} of 4 · takes ~3 minutes total
              </span>
            )}

            {currentStep < 4 ? (
              <button
                key="next-step"
                type="button"
                onClick={(event) => { event.preventDefault(); goToStep(currentStep + 1); }}
                className="nc-action-green text-sm px-[30px] py-3.5"
              >
                {currentStep === 1 ? 'Continue to photos →' : currentStep === 2 ? 'Continue to pricing →' : 'Review listing →'}
              </button>
            ) : (
              <button
                key="submit-listing"
                type="submit"
                disabled={isSubmitting}
                className="nc-action-green text-sm px-[30px] py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEditMode ? 'Updating…' : 'Submitting…'}
                  </>
                ) : (
                  <>{isEditMode ? 'Update listing' : 'Submit listing'} →</>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Right rail */}
        <div className="flex flex-col gap-4 self-start lg:sticky lg:top-[88px]">
          {/* Instant estimate */}
          <div className="border border-lightborder rounded-[15px] bg-greentint p-[22px]">
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase mb-2">Indicative estimate</div>
            {estimate ? (
              <>
                <div className="text-[27px] font-bold tracking-[-0.02em]">
                  {formatNaira(estimate.lowEstimate)} – {formatNaira(estimate.highEstimate)}
                </div>
                <p className="text-xs font-semibold text-muted mt-1.5 leading-normal">
                  Based on a general pricing model for {formData.make} {formData.model}. Compare current listings before setting your price.
                </p>
              </>
            ) : (
              <p className="text-[13px] font-semibold text-muted">
                Estimates are available for selected models. Compare similar listings to help set your price.
              </p>
            )}
          </div>

          {/* What happens next */}
          <div className="border border-lightborder rounded-[18px] bg-white p-5">
            <div className="text-xs font-bold tracking-[0.08em] uppercase mb-3.5">What happens next</div>
            <div className="flex flex-col gap-3 text-[12.5px] font-semibold text-muted leading-normal">
              {[
                'Your listing goes live after submission with an active plan',
                'Buyers can contact you through your listing',
                'Track views, requests and messages from your dashboard',
              ].map((line) => (
                <div key={line} className="flex gap-2.5">
                  <span className="flex-none w-[22px] h-[22px] rounded-full bg-brand text-white flex items-center justify-center">
                    <Check className="w-3 h-3" strokeWidth={4} />
                  </span>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellCarPage;
