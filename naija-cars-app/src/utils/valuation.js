// Client-side valuation model — extracted from ValuationPage so the sell
// wizard's instant-estimate card can share it.

export const carMakes = [
  'Toyota', 'Honda', 'Mercedes-Benz', 'BMW', 'Lexus', 'Ford', 'Hyundai',
  'Kia', 'Nissan', 'Volkswagen', 'Audi', 'Peugeot', 'Land Rover', 'Range Rover'
];

export const carModels = {
  'Toyota':        ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Land Cruiser', 'Prado', 'Sienna', 'Venza', 'Avalon'],
  'Honda':         ['Accord', 'Civic', 'CR-V', 'Pilot', 'HR-V', 'Odyssey'],
  'Mercedes-Benz': ['A-Class', 'CLA', 'C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS'],
  'BMW':           ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X6', 'X7'],
  'Lexus':         ['IS', 'ES', 'NX', 'RX', 'GX', 'LX'],
  'Ford':          ['Focus', 'Fusion', 'Explorer', 'Expedition', 'Ranger', 'Edge'],
  'Hyundai':       ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade'],
  'Kia':           ['Rio', 'Cerato', 'Sportage', 'Sorento', 'Telluride'],
  'Nissan':        ['Sentra', 'Altima', 'Maxima', 'Murano', 'Pathfinder', 'Armada'],
  'Volkswagen':    ['Golf', 'Jetta', 'Passat', 'Tiguan', 'Touareg'],
  'Audi':          ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7'],
  'Peugeot':       ['307', '406', '407', '508', '3008', '5008'],
  'Land Rover':    ['Discovery Sport', 'Discovery', 'Defender', 'Freelander'],
  'Range Rover':   ['Evoque', 'Velar', 'Sport', 'Vogue', 'Autobiography'],
};

// Base prices: Foreign Used reference, model year 2020, ~60,000 km
// Reflects 2024 Nigerian market (₦)
export const MODEL_BASE_PRICES = {
  'Toyota': {
    'Corolla': 9500000, 'Camry': 14500000, 'Avalon': 20000000,
    'RAV4': 20000000, 'Venza': 18000000, 'Highlander': 30000000,
    'Sienna': 25000000, 'Prado': 52000000, 'Land Cruiser': 85000000,
    _default: 12000000,
  },
  'Honda': {
    'Civic': 8500000, 'Accord': 13500000, 'HR-V': 12000000,
    'CR-V': 18000000, 'Pilot': 25000000, 'Odyssey': 20000000,
    _default: 11000000,
  },
  'Mercedes-Benz': {
    'A-Class': 16000000, 'CLA': 18000000, 'C-Class': 23000000,
    'E-Class': 36000000, 'S-Class': 70000000,
    'GLC': 34000000, 'GLE': 50000000, 'GLS': 70000000,
    _default: 22000000,
  },
  'BMW': {
    '3 Series': 20000000, '5 Series': 32000000, '7 Series': 55000000,
    'X3': 28000000, 'X5': 45000000, 'X6': 42000000, 'X7': 78000000,
    _default: 25000000,
  },
  'Lexus': {
    'IS': 18000000, 'ES': 25000000, 'NX': 28000000,
    'RX': 36000000, 'GX': 45000000, 'LX': 90000000,
    _default: 22000000,
  },
  'Ford': {
    'Focus': 7500000, 'Fusion': 10000000, 'Edge': 18000000,
    'Explorer': 25000000, 'Expedition': 35000000, 'Ranger': 20000000,
    _default: 12000000,
  },
  'Hyundai': {
    'Elantra': 7500000, 'Sonata': 10000000, 'Tucson': 13000000,
    'Santa Fe': 17000000, 'Palisade': 22000000,
    _default: 9000000,
  },
  'Kia': {
    'Rio': 7000000, 'Cerato': 8500000, 'Sportage': 13000000,
    'Sorento': 17000000, 'Telluride': 24000000,
    _default: 9000000,
  },
  'Nissan': {
    'Sentra': 7000000, 'Altima': 9500000, 'Maxima': 13000000,
    'Murano': 17000000, 'Pathfinder': 21000000, 'Armada': 30000000,
    _default: 10000000,
  },
  'Volkswagen': {
    'Golf': 8000000, 'Jetta': 9000000, 'Passat': 12000000,
    'Tiguan': 16000000, 'Touareg': 28000000,
    _default: 10000000,
  },
  'Audi': {
    'A3': 16000000, 'A4': 22000000, 'A6': 36000000, 'A8': 55000000,
    'Q3': 18000000, 'Q5': 30000000, 'Q7': 50000000,
    _default: 22000000,
  },
  'Peugeot': {
    '307': 3500000, '406': 3000000, '407': 4500000,
    '508': 7000000, '3008': 9000000, '5008': 11000000,
    _default: 4500000,
  },
  'Land Rover': {
    'Freelander': 12000000, 'Discovery Sport': 22000000,
    'Discovery': 40000000, 'Defender': 55000000,
    _default: 25000000,
  },
  'Range Rover': {
    'Evoque': 28000000, 'Velar': 38000000,
    'Sport': 60000000, 'Vogue': 95000000, 'Autobiography': 130000000,
    _default: 45000000,
  },
};

// Models with high buyer demand in Nigeria
export const HIGH_DEMAND_MODELS = {
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Land Cruiser', 'Prado'],
  'Honda': ['Accord', 'Civic', 'CR-V'],
  'Lexus': ['RX', 'ES'],
};
export const LOW_DEMAND_MAKES = ['Peugeot', 'Land Rover'];

export function getMarketDemand(make, model) {
  if (HIGH_DEMAND_MODELS[make]?.includes(model)) return 'High';
  if (LOW_DEMAND_MAKES.includes(make)) return 'Low';
  return 'Medium';
}

export function calculateValuation(data) {
  const { make, model, year, condition, mileage, transmission, fuelType, location } = data;
  const vehicleYear = parseInt(year);
  const vehicleMileage = parseInt(mileage) || 0;

  // 1. Model-specific base price (Foreign Used 2020, ~60k km)
  const makeMap = MODEL_BASE_PRICES[make] || {};
  const basePrice = makeMap[model] || makeMap._default || 10000000;

  // 2. Year depreciation/appreciation (anchor: 2020)
  const yearDiff = vehicleYear - 2020;
  let yearMultiplier;
  if (yearDiff >= 0) {
    // Newer: +13% per year, capped at 5 years
    yearMultiplier = 1 + (Math.min(yearDiff, 5) * 0.13);
  } else {
    // Older: -10% per year, floor at 40% of base
    yearMultiplier = Math.max(1 + yearDiff * 0.10, 0.40);
  }

  // 3. Mileage adjustment (reference: 60,000 km)
  let mileageMultiplier;
  if      (vehicleMileage <  20000) mileageMultiplier = 1.15;
  else if (vehicleMileage <  60000) mileageMultiplier = 1.05;
  else if (vehicleMileage < 100000) mileageMultiplier = 0.95;
  else if (vehicleMileage < 150000) mileageMultiplier = 0.84;
  else if (vehicleMileage < 200000) mileageMultiplier = 0.73;
  else if (vehicleMileage < 250000) mileageMultiplier = 0.62;
  else                               mileageMultiplier = 0.52;

  // 4. Condition
  const conditionMultiplier =
    condition === 'Brand New' ? 1.60 :
    condition === 'Foreign Used (Tokunbo)' ? 1.00 :
    0.74; // Nigerian Used

  // 5. Location premium
  const locationMultiplier =
    location === 'Lagos' ? 1.08 :
    location === 'Abuja' ? 1.05 :
    location === 'Port Harcourt' ? 1.03 :
    location === 'Ibadan' ? 0.97 :
    location === 'Kano' ? 0.94 : 1.00;

  // 6. Transmission (automatic commands a premium in Nigeria)
  const transmissionMultiplier = transmission === 'Manual' ? 0.91 : 1.00;

  // 7. Fuel type
  const fuelMultiplier =
    fuelType === 'Hybrid' ? 1.12 :
    fuelType === 'Electric' ? 1.20 :
    fuelType === 'Diesel' ? 1.05 : 1.00;

  const raw = basePrice * yearMultiplier * mileageMultiplier * conditionMultiplier
              * locationMultiplier * transmissionMultiplier * fuelMultiplier;

  // Round to nearest ₦50,000 for realism
  const estimatedValue = Math.round(raw / 50000) * 50000;
  return {
    estimatedValue,
    lowEstimate:  Math.round((estimatedValue * 0.88) / 50000) * 50000,
    highEstimate: Math.round((estimatedValue * 1.12) / 50000) * 50000,
  };
}
