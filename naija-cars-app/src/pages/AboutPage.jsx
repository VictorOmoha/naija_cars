import { motion } from 'framer-motion';
import {
  Shield, Users, Car, Award, Target, Heart, Zap, Globe,
  CheckCircle, MapPin
} from 'lucide-react';

const stats = [
  { value: '50K+', label: 'Active Listings', icon: Car },
  { value: '100K+', label: 'Happy Customers', icon: Users },
  { value: '500+', label: 'Verified Dealers', icon: Shield },
  { value: '36', label: 'States Covered', icon: MapPin },
];

const values = [
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'Every listing is verified. Every transaction is secure. We believe in complete transparency in the car buying process.',
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Your satisfaction is our priority. From browsing to buying, we ensure a seamless and enjoyable experience.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'We leverage cutting-edge technology to make car trading faster, easier, and more accessible for all Nigerians.',
  },
  {
    icon: Globe,
    title: 'Nigerian Pride',
    description: 'Built by Nigerians, for Nigerians. We understand the local market and cater to the unique needs of Nigerian car buyers.',
  },
];

const milestones = [
  { year: '2020', title: 'NaijaCars Founded', description: 'Started with a vision to transform car trading in Nigeria' },
  { year: '2021', title: '10,000 Listings', description: 'Reached our first major milestone with trusted dealers' },
  { year: '2022', title: 'Launched Nationwide', description: 'Expanded to all 36 states and FCT' },
  { year: '2023', title: '100K Customers', description: 'Celebrated serving over 100,000 happy customers' },
  { year: '2024', title: 'AI-Powered Valuation', description: 'Introduced smart car valuation technology' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-pearl-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-naija-600 via-naija-500 to-emerald-500 pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 kente-overlay opacity-10" />
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-10 left-10 w-80 h-80 bg-gold-400/20 rounded-full blur-3xl"
        />

        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              Nigeria's #1 Car Marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
              Driving Nigeria Forward,{' '}
              <span className="text-gold-400">One Car at a Time</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              We're on a mission to make car ownership accessible, transparent, and enjoyable for every Nigerian.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="section-container -mt-12 relative z-10 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lifted p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex p-3 bg-naija-100 rounded-xl mb-4">
                  <stat.icon className="w-6 h-6 text-naija-600" />
                </div>
                <div className="text-3xl md:text-4xl font-display font-bold text-charcoal-800 mb-1">
                  {stat.value}
                </div>
                <div className="text-charcoal-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Our Story */}
      <div className="section-container mb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal-800 mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-charcoal-600">
              <p>
                NaijaCars was born from a simple frustration: buying a car in Nigeria shouldn't be this hard. The founders, seasoned automotive industry professionals, witnessed firsthand the challenges Nigerians face – from unverified listings to opaque pricing and lack of trust.
              </p>
              <p>
                In 2020, we set out to build something different. A platform where every car is verified, every seller is vetted, and every transaction is secure. A marketplace that puts Nigerian car buyers first.
              </p>
              <p>
                Today, NaijaCars is the largest and most trusted automotive marketplace in Nigeria, connecting hundreds of thousands of buyers with verified dealers and private sellers across all 36 states.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-naija-500 to-emerald-500 rounded-3xl p-8 text-white">
              <Target className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-display font-bold mb-4">Our Mission</h3>
              <p className="text-white/90">
                To democratize car ownership in Nigeria by providing a trusted, transparent, and technology-driven marketplace that connects buyers and sellers seamlessly.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-card p-6 absolute -bottom-6 -left-6 max-w-xs"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 bg-gold-100 rounded-lg">
                  <Award className="w-6 h-6 text-gold-600" />
                </div>
                <span className="font-bold text-charcoal-800">Award Winning</span>
              </div>
              <p className="text-sm text-charcoal-500">
                Best Automotive Marketplace 2023 - Nigeria Tech Awards
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal-800 mb-4">
              Our Values
            </h2>
            <p className="text-charcoal-500 max-w-2xl mx-auto">
              These principles guide everything we do at NaijaCars
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-pearl-50 rounded-2xl p-6 hover:shadow-card transition-shadow"
              >
                <div className="p-3 bg-naija-100 rounded-xl w-fit mb-4">
                  <value.icon className="w-6 h-6 text-naija-600" />
                </div>
                <h3 className="text-lg font-display font-bold text-charcoal-800 mb-2">
                  {value.title}
                </h3>
                <p className="text-charcoal-500 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="section-container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal-800 mb-4">
            Our Journey
          </h2>
          <p className="text-charcoal-500">Key milestones in our growth story</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-naija-200 hidden md:block" />

          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex items-center gap-8 mb-8 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                <div className="bg-white rounded-2xl shadow-card p-6 inline-block">
                  <span className="text-naija-500 font-bold text-lg">{milestone.year}</span>
                  <h3 className="font-display font-bold text-charcoal-800 mt-1">
                    {milestone.title}
                  </h3>
                  <p className="text-charcoal-500 text-sm mt-1">{milestone.description}</p>
                </div>
              </div>

              <div className="hidden md:flex w-10 h-10 bg-naija-500 rounded-full items-center justify-center z-10 flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="section-container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-naija-500 to-emerald-500 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 kente-overlay opacity-10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Find Your Perfect Car?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Join over 100,000 Nigerians who have found their dream cars on NaijaCars
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/cars" className="px-8 py-4 bg-white text-naija-600 font-bold rounded-xl hover:bg-pearl-100 transition-colors">
                Browse Cars
              </a>
              <a href="/contact" className="px-8 py-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
