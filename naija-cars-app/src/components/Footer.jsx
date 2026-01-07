import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  Mail, Phone, MapPin, ArrowRight, ChevronRight
} from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    'Buy Cars': [
      { name: 'All Cars for Sale', href: '/cars' },
      { name: 'Foreign Used Cars', href: '/cars?condition=foreign' },
      { name: 'Nigerian Used Cars', href: '/cars?condition=nigerian' },
      { name: 'Brand New Cars', href: '/cars?condition=new' },
      { name: 'Car Valuation', href: '/valuation' },
    ],
    'Rent Cars': [
      { name: 'All Rentals', href: '/rent' },
      { name: 'Daily Rentals', href: '/rent?period=daily' },
      { name: 'Weekly Rentals', href: '/rent?period=weekly' },
      { name: 'Corporate Rentals', href: '/rent?period=corporate' },
      { name: 'Chauffeur Service', href: '/rent?service=chauffeur' },
    ],
    'For Dealers': [
      { name: 'Become a Dealer', href: '/contact' },
      { name: 'Dealer Dashboard', href: '/dashboard' },
      { name: 'Find Dealers', href: '/dealer/1' },
      { name: 'Advertise', href: '/contact' },
      { name: 'Dealer Support', href: '/help' },
    ],
    'Company': [
      { name: 'About Us', href: '/about' },
      { name: 'How It Works', href: '/help' },
      { name: 'Contact', href: '/contact' },
      { name: 'Help Center', href: '/help' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  const nigerianStates = [
    'Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'Ogun', 'Edo',
    'Delta', 'Enugu', 'Anambra', 'Imo'
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="relative bg-charcoal-800 border-t border-charcoal-700">
      {/* Newsletter Section */}
      <div className="relative py-16 border-b border-charcoal-700">
        <div className="absolute inset-0 bg-gradient-to-r from-naija-900/20 to-charcoal-800" />
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"
          >
            <div className="max-w-xl">
              <h3 className="heading-display-light text-2xl md:text-3xl mb-3">
                Stay Updated on the Best Deals
              </h3>
              <p className="text-pearl-300">
                Get notified about new listings, price drops, and exclusive offers from top dealers.
              </p>
            </div>

            <form className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pearl-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 bg-charcoal-700/50 border border-charcoal-600
                           text-white rounded-xl focus:border-naija-400 focus:outline-none
                           transition-colors placeholder:text-pearl-500"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(196, 92, 62, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-naija-500
                         text-white font-semibold rounded-xl shadow-button transition-all duration-300
                         hover:bg-naija-600"
              >
                Subscribe
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="section-container py-16">
        <div className="grid lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img
                src="/logo.png?v=3"
                alt="Naija Cars"
                className="h-14 w-auto object-contain brightness-110 drop-shadow-lg"
              />
            </Link>
            <p className="text-pearl-300 mb-6 max-w-xs">
              Nigeria's most trusted automotive marketplace. Buy, sell, or rent verified
              vehicles with confidence.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a href="tel:+2341234567890" className="flex items-center gap-3 text-pearl-300
                                                     hover:text-naija-400 transition-colors">
                <Phone className="w-5 h-5" />
                +234 123 456 7890
              </a>
              <a href="mailto:hello@naijacars.com" className="flex items-center gap-3 text-pearl-300
                                                             hover:text-naija-400 transition-colors">
                <Mail className="w-5 h-5" />
                hello@naijacars.com
              </a>
              <div className="flex items-start gap-3 text-pearl-300">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>123 Victoria Island, Lagos, Nigeria</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 bg-charcoal-700/50 border border-charcoal-600 rounded-xl
                           text-pearl-300 hover:text-naija-400 hover:border-naija-500/30
                           transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-pearl-300 hover:text-naija-400 transition-colors
                               flex items-center gap-1 group"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100
                                             group-hover:ml-0 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Popular Locations */}
        <div className="mt-12 pt-8 border-t border-charcoal-700">
          <h4 className="font-display font-semibold text-white mb-4">Popular Locations</h4>
          <div className="flex flex-wrap gap-2">
            {nigerianStates.map((state) => (
              <Link
                key={state}
                to={`/cars?location=${state.toLowerCase()}`}
                className="px-4 py-2 bg-charcoal-700/50 border border-charcoal-600 rounded-xl
                         text-sm text-pearl-300 hover:text-naija-400 hover:border-naija-500/30
                         transition-all duration-300"
              >
                Cars in {state}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-charcoal-700 py-6">
        <div className="section-container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-pearl-400 text-sm">
            © {new Date().getFullYear()} Naija Cars. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/privacy" className="text-pearl-300 hover:text-naija-400 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-pearl-300 hover:text-naija-400 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/help" className="text-pearl-300 hover:text-naija-400 text-sm transition-colors">
              Help Center
            </Link>
            <Link to="/contact" className="text-pearl-300 hover:text-naija-400 text-sm transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
