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
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Land Cruiser', 'Prado', 'Sienna', 'Venza', 'Avalon'],
  'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot', 'HR-V', 'Odyssey'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'A-Class', 'CLA'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7'],
  'Lexus': ['RX', 'ES', 'IS', 'GX', 'LX', 'NX'],
};

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

    // Simulate API call for valuation
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generate mock valuation result
    const basePrice = {
      'Toyota': 8000000,
      'Honda': 7500000,
      'Mercedes-Benz': 25000000,
      'BMW': 22000000,
      'Lexus': 18000000,
    }[data.make] || 10000000;

    const yearFactor = (parseInt(data.year) - 2015) * 0.08;
    const mileageFactor = (200000 - parseInt(data.mileage)) / 200000 * 0.3;
    const conditionFactor = data.condition === 'Brand New' ? 1.4 : data.condition === 'Foreign Used (Tokunbo)' ? 1 : 0.7;

    const estimatedValue = Math.round(basePrice * (1 + yearFactor) * mileageFactor * conditionFactor);
    const lowEstimate = Math.round(estimatedValue * 0.85);
    const highEstimate = Math.round(estimatedValue * 1.15);

    setValuationResult({
      ...data,
      estimatedValue,
      lowEstimate,
      highEstimate,
      marketTrend: Math.random() > 0.5 ? 'up' : 'down',
      trendPercentage: Math.floor(Math.random() * 10) + 1,
      demandLevel: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
      averageDaysToSell: Math.floor(Math.random() * 30) + 15,
      similarListings: Math.floor(Math.random() * 50) + 10,
      priceHistory: [
        { month: 'Aug 2023', price: estimatedValue * 0.92 },
        { month: 'Sep 2023', price: estimatedValue * 0.95 },
        { month: 'Oct 2023', price: estimatedValue * 0.97 },
        { month: 'Nov 2023', price: estimatedValue * 0.99 },
        { month: 'Dec 2023', price: estimatedValue * 1.02 },
        { month: 'Jan 2024', price: estimatedValue },
      ],
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
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100 bg-white text-charcoal-800"
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
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100 disabled:bg-pearl-100 bg-white text-charcoal-800"
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
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100 bg-white text-charcoal-800"
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
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100 bg-white text-charcoal-800"
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
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100 bg-white text-charcoal-800"
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
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100 bg-white text-charcoal-800"
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
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100 bg-white text-charcoal-800"
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
