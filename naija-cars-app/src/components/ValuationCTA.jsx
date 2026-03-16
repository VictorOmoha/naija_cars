import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

// Car data — mirrors ValuationPage so both stay in sync
const CAR_MAKES = [
  'Toyota', 'Honda', 'Mercedes-Benz', 'BMW', 'Lexus', 'Ford',
  'Hyundai', 'Kia', 'Nissan', 'Volkswagen', 'Audi', 'Peugeot',
  'Land Rover', 'Range Rover',
];

const CAR_MODELS = {
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

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 16 }, (_, i) => CURRENT_YEAR - i);
const CONDITIONS = ['Brand New', 'Foreign Used', 'Nigerian Used'];

const ValuationCTA = () => {
  const navigate = useNavigate();

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [mileage, setMileage] = useState('');
  const [condition, setCondition] = useState('');
  const [errors, setErrors] = useState({});

  const availableModels = make ? (CAR_MODELS[make] || []) : [];

  const handleMakeChange = (e) => {
    setMake(e.target.value);
    setModel(''); // reset model when make changes
    setErrors(prev => ({ ...prev, make: '', model: '' }));
  };

  const handleModelChange = (e) => {
    setModel(e.target.value);
    setErrors(prev => ({ ...prev, model: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {};
    if (!make) newErrors.make = 'Please select a make';
    if (!model) newErrors.model = 'Please select a model';
    if (!condition) newErrors.condition = 'Please select a condition';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Build query string and navigate to the full Valuation page with values pre-filled
    const params = new URLSearchParams({ make, model, year, condition });
    if (mileage) params.set('mileage', mileage.replace(/,/g, ''));
    navigate(`/valuation?${params.toString()}`);
  };

  return (
    <section id="valuation" className="relative py-24 overflow-hidden bg-pearl-50">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="gradient-mesh" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-naija-100/50 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-100/50 rounded-full blur-3xl"
        />
      </div>

      <div className="relative section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-naija-50 border border-naija-200
                           rounded-full text-naija-700 text-sm font-medium mb-4">
                <Calculator className="w-4 h-4" />
                Free Car Valuation
              </span>
              <h2 className="heading-display text-4xl md:text-5xl mb-4">
                Know Your Car's
                <span className="heading-naija"> True Value</span>
              </h2>
              <p className="text-charcoal-700 text-lg">
                Get an accurate market valuation for your vehicle using our advanced pricing
                algorithm. Based on real Nigerian market data and trusted by thousands.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: TrendingUp,  title: 'Market Insights',  desc: 'Real-time pricing based on actual sales data' },
                { icon: ShieldCheck, title: 'Trusted Data',     desc: 'Verified by industry experts' },
                { icon: Clock,       title: 'Instant Results',  desc: 'Get your valuation in under 60 seconds' },
                { icon: Calculator,  title: 'Detailed Report',  desc: 'Comprehensive breakdown of value factors' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-3"
                >
                  <div className="w-10 h-10 bg-naija-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-naija-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal-800 mb-1">{feature.title}</h4>
                    <p className="text-sm text-charcoal-600">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(196, 92, 62, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/valuation')}
              className="group flex items-center gap-3 px-8 py-4 bg-naija-500 text-white
                       font-semibold rounded-2xl shadow-button transition-all duration-300
                       hover:bg-naija-600"
            >
              Get Full Valuation Report
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </motion.div>

          {/* Right — Interactive Quick Valuation Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="border border-naija-200 rounded-3xl">
              <div className="bg-white rounded-3xl p-8 shadow-card-hover">
                <h3 className="font-display text-xl font-semibold text-charcoal-800 mb-6">
                  Quick Valuation
                </h3>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* Car Make */}
                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                      Car Make *
                    </label>
                    <select
                      value={make}
                      onChange={handleMakeChange}
                      className={`select-warm ${errors.make ? 'border-red-400 focus:border-red-400' : ''}`}
                    >
                      <option value="">Select Make</option>
                      {CAR_MAKES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    {errors.make && (
                      <p className="mt-1 text-xs text-red-500">{errors.make}</p>
                    )}
                  </div>

                  {/* Car Model */}
                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                      Car Model *
                    </label>
                    <select
                      value={model}
                      onChange={handleModelChange}
                      disabled={!make}
                      className={`select-warm ${!make ? 'opacity-50 cursor-not-allowed' : ''} ${errors.model ? 'border-red-400' : ''}`}
                    >
                      <option value="">{make ? 'Select Model' : 'Select a make first'}</option>
                      {availableModels.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    {errors.model && (
                      <p className="mt-1 text-xs text-red-500">{errors.model}</p>
                    )}
                  </div>

                  {/* Year + Mileage */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                        Year
                      </label>
                      <select
                        value={year}
                        onChange={e => setYear(e.target.value)}
                        className="select-warm"
                      >
                        {YEARS.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                        Mileage (km)
                      </label>
                      <input
                        type="text"
                        value={mileage}
                        onChange={e => setMileage(e.target.value)}
                        placeholder="e.g. 50,000"
                        className="input-warm"
                      />
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                      Condition *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {CONDITIONS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setCondition(c); setErrors(prev => ({ ...prev, condition: '' })); }}
                          className={`px-3 py-2.5 border rounded-xl text-xs font-medium transition-all text-center ${
                            condition === c
                              ? 'bg-naija-500 border-naija-500 text-white'
                              : 'border-pearl-300 text-charcoal-600 hover:border-naija-400 hover:text-naija-500'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    {errors.condition && (
                      <p className="mt-1 text-xs text-red-500">{errors.condition}</p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="w-full py-4 bg-naija-500 text-white font-semibold rounded-xl
                             shadow-button transition-all duration-300 mt-2 hover:bg-naija-600
                             flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-5 h-5" />
                    Get Instant Valuation
                  </motion.button>
                </form>

                {/* Hint */}
                <p className="mt-4 text-xs text-charcoal-400 text-center">
                  Select make, model &amp; condition to get started
                </p>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-white rounded-2xl px-4 py-3 shadow-card-hover border border-pearl-200"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-600">Market Trend</p>
                  <p className="text-sm font-semibold text-emerald-600">+12% this month</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ValuationCTA;
