import { motion } from 'framer-motion';
import { Calculator, TrendingUp, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ValuationCTA = () => {
  const { addToast } = useApp();

  const handleGetValuation = () => {
    addToast('Calculating your car\'s market value...', 'info');
  };

  return (
    <section id="valuation" className="relative py-24 overflow-hidden bg-pearl-50">
      {/* Background with pattern */}
      <div className="absolute inset-0">
        <div className="gradient-mesh" />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-naija-100/50 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2]
          }}
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

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: TrendingUp,
                  title: 'Market Insights',
                  desc: 'Real-time pricing based on actual sales data'
                },
                {
                  icon: ShieldCheck,
                  title: 'Trusted Data',
                  desc: 'Verified by industry experts'
                },
                {
                  icon: Clock,
                  title: 'Instant Results',
                  desc: 'Get your valuation in under 60 seconds'
                },
                {
                  icon: Calculator,
                  title: 'Detailed Report',
                  desc: 'Comprehensive breakdown of value factors'
                }
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
              onClick={handleGetValuation}
              className="group flex items-center gap-3 px-8 py-4 bg-naija-500 text-white
                       font-semibold rounded-2xl shadow-button transition-all duration-300
                       hover:bg-naija-600"
            >
              Get Free Valuation
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </motion.div>

          {/* Right - Valuation Form Preview */}
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

                <div className="space-y-4">
                  {/* Car Make */}
                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                      Car Make
                    </label>
                    <select className="select-warm">
                      <option>Select Make</option>
                      <option>Toyota</option>
                      <option>Mercedes-Benz</option>
                      <option>BMW</option>
                      <option>Lexus</option>
                      <option>Honda</option>
                    </select>
                  </div>

                  {/* Car Model */}
                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                      Car Model
                    </label>
                    <select className="select-warm">
                      <option>Select Model</option>
                    </select>
                  </div>

                  {/* Year */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                        Year
                      </label>
                      <select className="select-warm">
                        <option>2024</option>
                        <option>2023</option>
                        <option>2022</option>
                        <option>2021</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                        Mileage
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 50,000"
                        className="input-warm"
                      />
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                      Condition
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Brand New', 'Foreign Used', 'Nigerian Used'].map((condition) => (
                        <button
                          key={condition}
                          className="px-3 py-2.5 border border-pearl-300 rounded-xl text-xs text-charcoal-600
                                   hover:border-naija-400 hover:text-naija-500 transition-colors text-center
                                   font-medium"
                        >
                          {condition}
                        </button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleGetValuation}
                    className="w-full py-4 bg-naija-500 text-white font-semibold rounded-xl
                             shadow-button transition-all duration-300 mt-4 hover:bg-naija-600"
                  >
                    Get Instant Valuation
                  </motion.button>
                </div>

                {/* Sample Result Preview */}
                <div className="mt-6 p-4 bg-pearl-100 rounded-xl border border-pearl-200">
                  <div className="text-center">
                    <p className="text-xs text-charcoal-600 mb-1">Estimated Value</p>
                    <p className="text-3xl font-display font-bold text-naija-500">₦15M - ₦18M</p>
                    <p className="text-xs text-charcoal-600 mt-1">Based on 2023 Toyota Camry XLE</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
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
