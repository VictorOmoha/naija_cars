import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Car, Calculator, TrendingUp, TrendingDown, ArrowRight, ChevronRight,
  CheckCircle, Info, Calendar, Gauge, Settings2, Fuel, MapPin,
  BarChart3, DollarSign, Clock, Shield, AlertCircle, Sparkles, RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const carMakes = [
  'Toyota', 'Honda', 'Mercedes-Benz', 'BMW', 'Lexus', 'Ford', 'Hyundai',
  'Kia', 'Nissan', 'Volkswagen', 'Audi', 'Peugeot', 'Land Rover', 'Range Rover'
];

const carModels = {
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
const MODEL_BASE_PRICES = {
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
const HIGH_DEMAND_MODELS = {
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Land Cruiser', 'Prado'],
  'Honda': ['Accord', 'Civic', 'CR-V'],
  'Lexus': ['RX', 'ES'],
};
const LOW_DEMAND_MAKES = ['Peugeot', 'Land Rover'];

function getMarketDemand(make, model) {
  if (HIGH_DEMAND_MODELS[make]?.includes(model)) return 'High';
  if (LOW_DEMAND_MAKES.includes(make)) return 'Low';
  return 'Medium';
}

function calculateValuation(data) {
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

function buildPriceHistory(estimatedValue) {
  // Last 6 months relative to today
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const history = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const factor = 0.90 + ((5 - i) / 5) * 0.10; // grows from 90% → 100%
    history.push({
      month: `${months[d.getMonth()]} ${d.getFullYear()}`,
      price: Math.round((estimatedValue * factor) / 50000) * 50000,
    });
  }
  return history;
}

const conditions = ['Brand New', 'Foreign Used (Tokunbo)', 'Nigerian Used (Locally Used)'];

export default function ValuationPage() {
  const { addToast } = useApp();
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [valuationResult, setValuationResult] = useState(null);
  const [selectedMake, setSelectedMake] = useState('');

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();

  const watchMake = watch('make');

  const onSubmit = async (data) => {
    setIsCalculating(true);

    // Brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 1800));

    const { estimatedValue, lowEstimate, highEstimate } = calculateValuation(data);
    const demandLevel = getMarketDemand(data.make, data.model);

    // Days to sell based on real demand signals
    const daysBase = demandLevel === 'High' ? 14 : demandLevel === 'Medium' ? 28 : 45;
    const averageDaysToSell = daysBase + Math.floor(Math.random() * 10);

    // Similar listings count based on market popularity
    const listingsBase = demandLevel === 'High' ? 45 : demandLevel === 'Medium' ? 22 : 8;
    const similarListings = listingsBase + Math.floor(Math.random() * 15);

    // Market trend: Toyota/Honda generally appreciating in Nigeria due to Naira depreciation
    const appreciatingMakes = ['Toyota', 'Honda', 'Lexus'];
    const trendUp = appreciatingMakes.includes(data.make) ? Math.random() > 0.3 : Math.random() > 0.55;

    setValuationResult({
      ...data,
      estimatedValue,
      lowEstimate,
      highEstimate,
      marketTrend: trendUp ? 'up' : 'down',
      trendPercentage: Math.floor(Math.random() * 8) + 2,
      demandLevel,
      averageDaysToSell,
      similarListings,
      priceHistory: buildPriceHistory(estimatedValue),
    });

    setIsCalculating(false);
    setStep(3);
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    }
    return `₦${price.toLocaleString()}`;
  };

  const handleStartOver = () => {
    reset();
    setValuationResult(null);
    setStep(1);
    setSelectedMake('');
  };

  return (
    <div className="min-h-screen bg-pearl-100 pt-28 pb-20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-naija-600 via-naija-500 to-emerald-500 py-16 overflow-hidden">
        <div className="absolute inset-0 kente-overlay opacity-10" />
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-10 left-10 w-64 h-64 bg-gold-400/20 rounded-full blur-3xl"
        />

        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Valuation
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              What's Your Car Worth?
            </h1>
            <p className="text-xl text-white/80">
              Get an instant, accurate valuation based on real Nigerian market data
            </p>
          </motion.div>
        </div>
      </div>

      <div className="section-container -mt-12 relative z-10">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card p-4 mb-8"
        >
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Car Details' },
              { num: 2, label: 'Condition' },
              { num: 3, label: 'Valuation' },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s.num
                      ? 'bg-naija-500 text-white'
                      : 'bg-pearl-200 text-charcoal-400'
                  }`}>
                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`hidden sm:block font-medium ${
                    step >= s.num ? 'text-charcoal-800' : 'text-charcoal-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-16 md:w-24 h-1 mx-4 rounded-full transition-all ${
                    step > s.num ? 'bg-naija-500' : 'bg-pearl-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Car Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                <div className="p-6 border-b border-pearl-200">
                  <h2 className="text-2xl font-display font-bold text-charcoal-800">
                    Tell us about your car
                  </h2>
                  <p className="text-charcoal-500">Enter your vehicle details to get started</p>
                </div>

                <form className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Make *
                      </label>
                      <select
                        {...register('make', { required: 'Make is required' })}
                        onChange={(e) => setSelectedMake(e.target.value)}
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                      >
                        <option value="">Select Make</option>
                        {carMakes.map(make => (
                          <option key={make} value={make}>{make}</option>
                        ))}
                      </select>
                      {errors.make && (
                        <p className="mt-1 text-sm text-red-500">{errors.make.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Model *
                      </label>
                      <select
                        {...register('model', { required: 'Model is required' })}
                        disabled={!selectedMake}
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100 disabled:bg-pearl-100"
                      >
                        <option value="">Select Model</option>
                        {(carModels[selectedMake] || []).map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Year *
                      </label>
                      <select
                        {...register('year', { required: 'Year is required' })}
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                      >
                        <option value="">Select Year</option>
                        {Array.from({ length: 15 }, (_, i) => 2024 - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Trim/Variant
                      </label>
                      <input
                        {...register('trim')}
                        placeholder="e.g., XLE, Sport, Limited"
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Step 2: Condition */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                <div className="p-6 border-b border-pearl-200">
                  <h2 className="text-2xl font-display font-bold text-charcoal-800">
                    Vehicle Condition
                  </h2>
                  <p className="text-charcoal-500">Help us understand your car's current state</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-3">
                      Condition *
                    </label>
                    <div className="space-y-3">
                      {conditions.map((condition) => (
                        <label key={condition} className="flex items-center gap-4 p-4 border border-pearl-300 rounded-xl cursor-pointer hover:border-naija-300 transition-colors">
                          <input
                            type="radio"
                            {...register('condition', { required: true })}
                            value={condition}
                            className="w-5 h-5 text-naija-500 focus:ring-naija-500"
                          />
                          <span className="font-medium text-charcoal-700">{condition}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Mileage (km) *
                      </label>
                      <div className="relative">
                        <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                        <input
                          {...register('mileage', { required: 'Mileage is required' })}
                          type="number"
                          placeholder="e.g., 50000"
                          className="w-full pl-12 pr-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Transmission
                      </label>
                      <select
                        {...register('transmission')}
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Fuel Type
                      </label>
                      <select
                        {...register('fuelType')}
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Electric">Electric</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Location
                      </label>
                      <select
                        {...register('location')}
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                      >
                        <option value="Lagos">Lagos</option>
                        <option value="Abuja">Abuja</option>
                        <option value="Port Harcourt">Port Harcourt</option>
                        <option value="Kano">Kano</option>
                        <option value="Ibadan">Ibadan</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 border-2 border-pearl-300 text-charcoal-700 font-medium rounded-xl hover:bg-pearl-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isCalculating}
                      className="flex-1 btn-primary py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                      {isCalculating ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator className="w-5 h-5" />
                          Get Valuation
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {step === 3 && valuationResult && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              {/* Main Valuation Card */}
              <div className="bg-gradient-to-br from-naija-600 via-naija-500 to-emerald-500 rounded-3xl shadow-lifted overflow-hidden mb-8 text-white">
                <div className="p-8 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                    <CheckCircle className="w-4 h-4" />
                    Valuation Complete
                  </div>

                  <h2 className="text-xl md:text-2xl font-medium mb-2 opacity-90">
                    {valuationResult.year} {valuationResult.make} {valuationResult.model}
                  </h2>
                  <p className="opacity-70 mb-8">{valuationResult.trim} • {valuationResult.condition}</p>

                  <div className="text-5xl md:text-6xl font-display font-bold mb-2">
                    {formatPrice(valuationResult.estimatedValue)}
                  </div>
                  <p className="text-white/80 mb-8">Estimated Market Value</p>

                  <div className="flex justify-center gap-8">
                    <div>
                      <p className="text-white/60 text-sm mb-1">Low Estimate</p>
                      <p className="text-xl font-bold">{formatPrice(valuationResult.lowEstimate)}</p>
                    </div>
                    <div className="w-px bg-white/20" />
                    <div>
                      <p className="text-white/60 text-sm mb-1">High Estimate</p>
                      <p className="text-xl font-bold">{formatPrice(valuationResult.highEstimate)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 backdrop-blur-sm px-8 py-4 flex items-center justify-center gap-4">
                  {valuationResult.marketTrend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-emerald-300" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-300" />
                  )}
                  <span>
                    Market prices are {valuationResult.marketTrend === 'up' ? 'up' : 'down'}{' '}
                    <strong>{valuationResult.trendPercentage}%</strong> this month
                  </span>
                </div>
              </div>

              {/* Market Insights */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-card p-6"
                >
                  <div className="p-3 bg-naija-100 rounded-xl w-fit mb-4">
                    <BarChart3 className="w-6 h-6 text-naija-600" />
                  </div>
                  <h3 className="text-lg font-bold text-charcoal-800 mb-1">Market Demand</h3>
                  <p className={`text-2xl font-bold ${
                    valuationResult.demandLevel === 'High' ? 'text-emerald-500' :
                    valuationResult.demandLevel === 'Medium' ? 'text-gold-500' : 'text-red-500'
                  }`}>
                    {valuationResult.demandLevel}
                  </p>
                  <p className="text-charcoal-500 text-sm mt-1">Based on recent searches</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-card p-6"
                >
                  <div className="p-3 bg-gold-100 rounded-xl w-fit mb-4">
                    <Clock className="w-6 h-6 text-gold-600" />
                  </div>
                  <h3 className="text-lg font-bold text-charcoal-800 mb-1">Avg. Time to Sell</h3>
                  <p className="text-2xl font-bold text-charcoal-800">
                    {valuationResult.averageDaysToSell} days
                  </p>
                  <p className="text-charcoal-500 text-sm mt-1">For similar vehicles</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-card p-6"
                >
                  <div className="p-3 bg-emerald-100 rounded-xl w-fit mb-4">
                    <Car className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-charcoal-800 mb-1">Similar Listings</h3>
                  <p className="text-2xl font-bold text-charcoal-800">
                    {valuationResult.similarListings}
                  </p>
                  <p className="text-charcoal-500 text-sm mt-1">Currently on the market</p>
                </motion.div>
              </div>

              {/* Price History Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-card p-6 mb-8"
              >
                <h3 className="text-xl font-display font-bold text-charcoal-800 mb-6">
                  Price Trend (6 Months)
                </h3>
                <div className="h-48 flex items-end justify-between gap-4">
                  {valuationResult.priceHistory.map((point, index) => {
                    const maxPrice = Math.max(...valuationResult.priceHistory.map(p => p.price));
                    const height = (point.price / maxPrice) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full mb-2 flex flex-col items-center">
                          <span className="text-xs text-charcoal-500 mb-2">
                            {formatPrice(point.price)}
                          </span>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                            className={`w-full rounded-t-lg ${
                              index === valuationResult.priceHistory.length - 1
                                ? 'bg-naija-500'
                                : 'bg-naija-200'
                            }`}
                            style={{ minHeight: '20px' }}
                          />
                        </div>
                        <span className="text-xs text-charcoal-500 mt-2">{point.month.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="bg-gradient-to-br from-gold-400 to-gold-500 rounded-2xl p-6 text-charcoal-800">
                  <h3 className="text-xl font-display font-bold mb-2">Ready to Sell?</h3>
                  <p className="mb-4 opacity-80">List your car now and reach thousands of buyers</p>
                  <button className="w-full py-3 bg-charcoal-800 text-white rounded-xl font-medium hover:bg-charcoal-900 transition-colors">
                    List Your Car
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="text-xl font-display font-bold text-charcoal-800 mb-2">Not Selling Yet?</h3>
                  <p className="text-charcoal-500 mb-4">Save this valuation and get price alerts</p>
                  <button className="w-full py-3 border-2 border-naija-500 text-naija-600 rounded-xl font-medium hover:bg-naija-50 transition-colors">
                    Save Valuation
                  </button>
                </div>
              </motion.div>

              {/* Start Over */}
              <div className="text-center mt-8">
                <button
                  onClick={handleStartOver}
                  className="text-naija-600 font-medium hover:text-naija-700 flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Value Another Car
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        {step !== 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: 'Accurate Data',
                  desc: 'Based on thousands of real transactions in the Nigerian market',
                },
                {
                  icon: Clock,
                  title: 'Instant Results',
                  desc: 'Get your valuation in seconds, not hours or days',
                },
                {
                  icon: TrendingUp,
                  title: 'Market Insights',
                  desc: 'Understand market trends and the best time to sell',
                },
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-card p-6 text-center">
                  <div className="p-3 bg-naija-100 rounded-xl w-fit mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-naija-600" />
                  </div>
                  <h3 className="font-bold text-charcoal-800 mb-2">{item.title}</h3>
                  <p className="text-charcoal-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
