// Shape a DB listing into the format CarCard (and the compare tray) expects.
// Shared by HomePage, CarsPage and related grids.

export function getCategoryTags(listing) {
  const tags = [];
  const body = listing.bodyType?.toLowerCase() || '';
  if (['suv', 'crossover', 'jeep', 'pickup', 'truck'].includes(body)) tags.push('suv');
  if (['sedan', 'coupe', 'hatchback', 'saloon'].includes(body)) tags.push('sedan');
  const luxuryMakes = ['mercedes-benz', 'bmw', 'lexus', 'range rover', 'audi', 'porsche', 'land rover', 'bentley', 'rolls-royce'];
  if (luxuryMakes.includes((listing.make || '').toLowerCase())) tags.push('luxury');
  if (listing.condition === 'BRAND_NEW') tags.push('new');
  return tags;
}

export function transformToCardShape(listing) {
  const images = listing.media?.length
    ? listing.media.map((m) => m.url)
    : [];

  const conditionMap = {
    BRAND_NEW: 'Brand New',
    FOREIGN_USED: 'Foreign Used',
    NIGERIAN_USED: 'Nigerian Used',
  };

  return {
    id: listing.id,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    trim: listing.trim || '',
    price: parseFloat(listing.price),
    pricePerDay: listing.listingType === 'RENT' ? parseFloat(listing.price) : undefined,
    mileage: listing.mileage ?? null,
    transmission: listing.transmission,
    fuelType: listing.fuelType,
    condition: conditionMap[listing.condition] || listing.condition?.replace(/_/g, ' '),
    category: getCategoryTags(listing),
    location: {
      city: listing.locationCity || '',
      state: listing.locationState || '',
    },
    type: listing.listingType === 'RENT' ? 'rent' : 'sale',
    images,
    phone: listing.phone || listing.seller?.phoneNumber || '',
    whatsapp: listing.whatsapp || listing.phone || listing.seller?.phoneNumber || '',
    sellerId: listing.seller?.id,
    seller: listing.seller,
    verified: listing.seller?.profile?.verificationBadge || false,
    featured: listing.isFeatured || false,
    isFavorited: listing.isFavorited || false,
    isPlaceholder: listing.isPlaceholder || false,
    dealer: {
      name: listing.seller?.profile?.businessName || 'Private Seller',
      phone: listing.phone || listing.seller?.phoneNumber || '',
      verified: listing.seller?.profile?.verificationBadge || false,
    },
  };
}

// Budget presets shared by homepage search + listings filters ("min-max" values)
export const BUDGET_OPTIONS = [
  { value: '', label: 'Any budget' },
  { value: '-5000000', label: 'Under ₦5M' },
  { value: '5000000-10000000', label: '₦5M – ₦10M' },
  { value: '5000000-20000000', label: '₦5M – ₦20M' },
  { value: '10000000-20000000', label: '₦10M – ₦20M' },
  { value: '20000000-50000000', label: '₦20M – ₦50M' },
  { value: '50000000-', label: '₦50M+' },
];

export const parseBudget = (value) => {
  if (!value) return { minPrice: '', maxPrice: '' };
  const [min, max] = value.split('-');
  return { minPrice: min || '', maxPrice: max || '' };
};
