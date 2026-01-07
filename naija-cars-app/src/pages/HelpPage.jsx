import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HelpCircle, Search, ChevronDown, ChevronRight, Car, CreditCard, Shield,
  MessageCircle, User, Settings, FileText, Phone, Mail, ExternalLink,
  Book, PlayCircle, Headphones, ArrowRight
} from 'lucide-react';

const categories = [
  {
    id: 'buying',
    name: 'Buying a Car',
    icon: Car,
    description: 'Learn how to find, evaluate, and purchase vehicles',
    faqs: [
      {
        question: 'How do I search for cars on NaijaCars?',
        answer: 'You can search for cars using the search bar on the homepage or visit the "Browse Cars" page. Use filters like make, model, year, price range, and location to narrow down your options. You can also save searches to get notified when new matching listings appear.'
      },
      {
        question: 'How do I contact a seller?',
        answer: 'On any car listing page, you\'ll find contact options including "Send Message", "Call", and "WhatsApp". Click any of these to reach out to the seller directly. We recommend using our messaging system for recorded communication.'
      },
      {
        question: 'What does "Verified" mean on a listing?',
        answer: 'A "Verified" badge means our team has confirmed the vehicle details including ownership documents, vehicle history, and physical condition. Verified listings have gone through our quality assurance process.'
      },
      {
        question: 'Can I schedule a test drive?',
        answer: 'Yes! Contact the seller through the listing page to arrange a test drive. We recommend meeting in a public place and bringing someone with you. For dealer listings, you can visit their showroom during business hours.'
      },
      {
        question: 'How do I know if a listing is legitimate?',
        answer: 'Look for verified badges, check seller reviews, review the listing details carefully, and use our messaging system. Be cautious of deals that seem too good to be true, requests for unusual payment methods, or sellers who avoid meeting in person.'
      },
    ]
  },
  {
    id: 'selling',
    name: 'Selling Your Car',
    icon: FileText,
    description: 'Tips for creating listings and making sales',
    faqs: [
      {
        question: 'How do I list my car for sale?',
        answer: 'Click "List Your Car" in the navigation bar. Fill in your vehicle details, upload clear photos, set your price, and submit. Basic listings are free. Your listing will be reviewed and published within 24 hours.'
      },
      {
        question: 'What photos should I include?',
        answer: 'Include at least 5-10 high-quality photos showing: exterior (front, back, sides), interior (dashboard, seats, trunk), engine bay, odometer, and any special features or damage. Good photos significantly increase buyer interest.'
      },
      {
        question: 'How should I price my car?',
        answer: 'Use our free Car Valuation tool to get an estimated market value. Consider your car\'s condition, mileage, and local demand. Check similar listings on our platform for reference. Competitive pricing leads to faster sales.'
      },
      {
        question: 'What documents do I need to sell my car?',
        answer: 'You\'ll need: Original proof of ownership (vehicle license), vehicle registration, customs papers (for imported vehicles), valid ID, and any service/maintenance records. Having complete documentation increases buyer confidence.'
      },
      {
        question: 'How long does it take to sell a car?',
        answer: 'Selling time varies based on demand, pricing, and condition. Well-priced vehicles with good photos typically sell within 2-4 weeks. Premium listings get more visibility and tend to sell faster.'
      },
    ]
  },
  {
    id: 'payments',
    name: 'Payments & Pricing',
    icon: CreditCard,
    description: 'Information about fees, payments, and subscriptions',
    faqs: [
      {
        question: 'Is it free to use NaijaCars?',
        answer: 'Browsing listings and contacting sellers is completely free. Basic car listings are also free. We offer optional premium features for enhanced visibility and faster sales.'
      },
      {
        question: 'What are Featured Listings?',
        answer: 'Featured Listings appear at the top of search results and category pages, getting 5x more views than regular listings. The cost varies by duration - contact us for current pricing.'
      },
      {
        question: 'How do I pay for premium services?',
        answer: 'We accept payments via Paystack, Flutterwave, bank transfer, and card payments. All payments are processed securely with 256-bit encryption.'
      },
      {
        question: 'Can I get a refund?',
        answer: 'Premium listing fees are generally non-refundable once the listing is live. However, if there\'s an issue with our service, please contact support and we\'ll review your case.'
      },
      {
        question: 'What are dealer subscription plans?',
        answer: 'Dealers can subscribe to monthly or annual plans that include unlimited listings, priority support, analytics dashboard, and verification badges. Visit our Dealer Partners page for details.'
      },
    ]
  },
  {
    id: 'account',
    name: 'Account & Settings',
    icon: User,
    description: 'Managing your profile and preferences',
    faqs: [
      {
        question: 'How do I create an account?',
        answer: 'Click "Sign In" in the navigation bar, then select "Create Account". Enter your email, create a password, and verify your phone number via OTP. You can also sign up using Google or Facebook.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click "Sign In", then "Forgot Password". Enter your email address and we\'ll send you a password reset link. The link expires after 24 hours.'
      },
      {
        question: 'How do I get verified as a seller?',
        answer: 'Go to Profile > Verification. Complete email and phone verification, then upload your ID for identity verification. Dealers need to provide CAC documents for business verification.'
      },
      {
        question: 'How do I delete my account?',
        answer: 'Go to Profile > Settings > Account > Delete Account. Please note this action is permanent and will remove all your listings, messages, and data. Pending transactions must be completed first.'
      },
      {
        question: 'Can I change my email address?',
        answer: 'Yes. Go to Profile > Settings > Account and update your email. You\'ll need to verify the new email address before the change takes effect.'
      },
    ]
  },
  {
    id: 'safety',
    name: 'Safety & Trust',
    icon: Shield,
    description: 'Stay safe while buying or selling',
    faqs: [
      {
        question: 'How do I stay safe when meeting a seller?',
        answer: 'Always meet in public places during daylight hours. Bring someone with you. Verify the vehicle documents match the car. Never pay before inspecting the vehicle. Use our escrow service for large transactions.'
      },
      {
        question: 'How do I report a suspicious listing?',
        answer: 'Click the "Report" button on any listing page and select the reason. Our trust team reviews all reports within 24 hours. You can also email trust@naijacars.com with details.'
      },
      {
        question: 'What is the NaijaCars Guarantee?',
        answer: 'Our guarantee protects buyers who use our payment facilitation service. If a verified vehicle is significantly not as described, you may be eligible for a refund. Terms and conditions apply.'
      },
      {
        question: 'How do I avoid scams?',
        answer: 'Never pay before seeing the vehicle. Beware of prices too good to be true. Don\'t click suspicious links. Use our messaging system. Verify seller identity and vehicle documents. Trust your instincts.'
      },
      {
        question: 'Is my personal information safe?',
        answer: 'Yes. We use industry-standard encryption and security measures. Your contact details are only shared when you initiate contact with a seller. Read our Privacy Policy for full details.'
      },
    ]
  },
  {
    id: 'technical',
    name: 'Technical Support',
    icon: Settings,
    description: 'Troubleshooting and app issues',
    faqs: [
      {
        question: 'Why can\'t I upload photos?',
        answer: 'Ensure your photos are in JPG, PNG, or WEBP format, under 10MB each. Check your internet connection. Try using a different browser or clearing your cache. Maximum 20 photos per listing.'
      },
      {
        question: 'I\'m not receiving verification codes',
        answer: 'Check your spam folder for email codes. For SMS, ensure your phone number is correct and can receive texts. Try requesting a new code after 60 seconds. Contact support if issues persist.'
      },
      {
        question: 'The website is loading slowly',
        answer: 'Try clearing your browser cache and cookies. Ensure you have a stable internet connection. Try a different browser. Disable browser extensions. Our status page shows any known issues.'
      },
      {
        question: 'How do I use the mobile app?',
        answer: 'NaijaCars is available as a Progressive Web App. Visit our website on your mobile browser, tap "Add to Home Screen" in the browser menu. You can also use our mobile-responsive website.'
      },
      {
        question: 'My listing isn\'t showing up',
        answer: 'New listings take up to 24 hours for review. Check your dashboard for listing status. If rejected, you\'ll receive an email explaining why. Contact support if approved but not visible.'
      },
    ]
  },
];

const resources = [
  {
    icon: Book,
    title: 'Buying Guide',
    description: 'Complete guide to buying a car in Nigeria',
    link: '#',
  },
  {
    icon: PlayCircle,
    title: 'Video Tutorials',
    description: 'Watch how to use NaijaCars features',
    link: '#',
  },
  {
    icon: FileText,
    title: 'Safety Checklist',
    description: 'Download our transaction safety checklist',
    link: '#',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('buying');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const filteredCategories = searchQuery
    ? categories.map(cat => ({
        ...cat,
        faqs: cat.faqs.filter(faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.faqs.length > 0)
    : categories;

  const currentCategory = filteredCategories.find(c => c.id === activeCategory) || filteredCategories[0];

  return (
    <div className="min-h-screen bg-pearl-100">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-naija-600 via-naija-500 to-emerald-500 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 kente-overlay opacity-10" />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl"
        />

        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              Help Center
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              How Can We Help?
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Find answers to common questions and learn how to use NaijaCars
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Resources */}
      <div className="section-container -mt-8 relative z-10 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {resources.map((resource, index) => (
            <motion.a
              key={index}
              href={resource.link}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all group"
            >
              <div className="p-3 bg-naija-100 rounded-xl group-hover:bg-naija-500 transition-colors">
                <resource.icon className="w-6 h-6 text-naija-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-800">{resource.title}</h3>
                <p className="text-sm text-charcoal-500">{resource.description}</p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="section-container pb-20">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-card p-4 sticky top-28">
              <h3 className="font-semibold text-charcoal-800 mb-4 px-2">Categories</h3>
              <nav className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setExpandedFaq(null);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-naija-50 text-naija-600'
                        : 'text-charcoal-600 hover:bg-pearl-100'
                    }`}
                  >
                    <category.icon className="w-5 h-5" />
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            {searchQuery && filteredCategories.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-card p-12 text-center">
                <HelpCircle className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold text-charcoal-800 mb-2">
                  No results found
                </h3>
                <p className="text-charcoal-500 mb-6">
                  Try a different search term or browse our categories
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-naija-600 font-medium hover:text-naija-700"
                >
                  Clear search
                </button>
              </div>
            ) : currentCategory && (
              <div className="space-y-6">
                {/* Category Header */}
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-naija-100 rounded-xl">
                      <currentCategory.icon className="w-6 h-6 text-naija-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-charcoal-800">
                        {currentCategory.name}
                      </h2>
                      <p className="text-charcoal-500">{currentCategory.description}</p>
                    </div>
                  </div>
                </div>

                {/* FAQ List */}
                <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                  <div className="divide-y divide-pearl-200">
                    {currentCategory.faqs.map((faq, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                          className="w-full p-5 text-left flex items-center justify-between hover:bg-pearl-50 transition-colors"
                        >
                          <span className="font-medium text-charcoal-800 pr-4">{faq.question}</span>
                          <ChevronDown className={`w-5 h-5 text-charcoal-400 flex-shrink-0 transition-transform ${
                            expandedFaq === index ? 'rotate-180' : ''
                          }`} />
                        </button>
                        <AnimatePresence>
                          {expandedFaq === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 text-charcoal-600 leading-relaxed">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Still Need Help */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 bg-gradient-to-r from-naija-500 to-emerald-500 rounded-3xl p-8 text-white"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-2xl">
                    <Headphones className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold">Still Need Help?</h3>
                    <p className="text-white/80">Our support team is ready to assist you</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="mailto:support@naijacars.com" className="flex items-center gap-2 px-5 py-3 bg-white text-naija-600 font-medium rounded-xl hover:bg-pearl-100 transition-colors">
                    <Mail className="w-5 h-5" />
                    Email Us
                  </a>
                  <a href="tel:+2348012345678" className="flex items-center gap-2 px-5 py-3 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-colors">
                    <Phone className="w-5 h-5" />
                    Call Us
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
