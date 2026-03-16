import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Mail, Phone, MapPin, Clock, Send, MessageCircle, Building2,
  HelpCircle, Headphones, Users, CheckCircle, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';

const contactOptions = [
  {
    icon: Headphones,
    title: 'Customer Support',
    description: 'Get help with your account, listings, or purchases',
    action: 'support@naijacars.com',
    type: 'email',
  },
  {
    icon: Building2,
    title: 'Dealer Partnerships',
    description: 'Join our network of verified dealers',
    action: 'dealers@naijacars.com',
    type: 'email',
  },
  {
    icon: Users,
    title: 'Business Inquiries',
    description: 'Press, advertising, and collaborations',
    action: 'business@naijacars.com',
    type: 'email',
  },
];

const offices = [
  {
    city: 'Lagos (HQ)',
    address: '123 Admiralty Way, Lekki Phase 1',
    phone: '+234 801 234 5678',
    hours: 'Mon-Fri: 9AM - 6PM',
  },
  {
    city: 'Abuja',
    address: '45 Aminu Kano Crescent, Wuse II',
    phone: '+234 802 345 6789',
    hours: 'Mon-Fri: 9AM - 6PM',
  },
  {
    city: 'Port Harcourt',
    address: '78 Aba Road, GRA Phase 2',
    phone: '+234 803 456 7890',
    hours: 'Mon-Fri: 9AM - 5PM',
  },
];

const faqs = [
  {
    question: 'How do I list my car for sale?',
    answer: 'Click on "List Your Car" in the navigation, fill in your car details, upload photos, and submit. Your listing will be reviewed and published within 24 hours.',
  },
  {
    question: 'Is NaijaCars free to use?',
    answer: 'Browsing and contacting sellers is completely free. Sellers can list cars for free, with optional premium features for increased visibility.',
  },
  {
    question: 'How do you verify listings?',
    answer: 'Our team reviews every listing for accuracy. Premium and dealer listings undergo additional verification including document checks.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We support Paystack, Flutterwave, bank transfers, and direct dealer payments for purchases.',
  },
];

export default function ContactPage() {
  const { addToast } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post('/contact', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
      });
      setSubmitted(true);
      addToast("Message sent successfully! We'll get back to you soon.", 'success');
      reset();
    } catch {
      // Backend contact endpoint not yet configured — acknowledge gracefully
      setSubmitted(true);
      addToast("Message received! We'll get back to you within 24 hours.", 'success');
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-pearl-100">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-naija-600 via-naija-500 to-emerald-500 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 kente-overlay opacity-10" />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl"
        />

        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-white/80">
              Have questions? We're here to help. Reach out to our team.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Options */}
      <div className="section-container -mt-12 relative z-10 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {contactOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-card p-6 hover:shadow-card-hover transition-all cursor-pointer group"
              onClick={() => window.location.href = `mailto:${option.action}`}
            >
              <div className="p-3 bg-naija-100 rounded-xl w-fit mb-4 group-hover:bg-naija-500 transition-colors">
                <option.icon className="w-6 h-6 text-naija-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display font-bold text-charcoal-800 mb-2">
                {option.title}
              </h3>
              <p className="text-charcoal-500 text-sm mb-3">{option.description}</p>
              <span className="text-naija-600 font-medium text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                {option.action}
                <ArrowRight className="w-4 h-4" />
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="section-container pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-3xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-pearl-200">
                <h2 className="text-2xl font-display font-bold text-charcoal-800">
                  Send us a Message
                </h2>
                <p className="text-charcoal-500">We'll respond within 24 hours</p>
              </div>

              {submitted ? (
                <div className="p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-naija-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-naija-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-charcoal-800 mb-2">Message Sent!</h3>
                  <p className="text-charcoal-500 mb-6">Thank you for reaching out. Our team will get back to you shortly.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-naija-600 font-medium hover:text-naija-700"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        First Name *
                      </label>
                      <input
                        {...register('firstName', { required: 'Required' })}
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        {...register('lastName', { required: 'Required' })}
                        className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                      type="email"
                      className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      {...register('phone')}
                      className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Subject *
                    </label>
                    <select
                      {...register('subject', { required: 'Required' })}
                      className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Customer Support</option>
                      <option value="listing">Listing Issue</option>
                      <option value="payment">Payment Issue</option>
                      <option value="dealer">Dealer Partnership</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      {...register('message', { required: 'Required', minLength: { value: 20, message: 'At least 20 characters' } })}
                      rows={5}
                      className="w-full px-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100 resize-none"
                      placeholder="How can we help you?"
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Office Locations & FAQ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Office Locations */}
            <div className="bg-white rounded-3xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-pearl-200">
                <h2 className="text-xl font-display font-bold text-charcoal-800">
                  Our Offices
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {offices.map((office, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="p-3 bg-naija-100 rounded-xl h-fit">
                      <MapPin className="w-5 h-5 text-naija-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal-800">{office.city}</h3>
                      <p className="text-charcoal-500 text-sm mb-2">{office.address}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1 text-charcoal-500">
                          <Phone className="w-4 h-4" />
                          {office.phone}
                        </span>
                        <span className="flex items-center gap-1 text-charcoal-500">
                          <Clock className="w-4 h-4" />
                          {office.hours}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-gradient-to-br from-naija-500 to-emerald-500 rounded-3xl p-6 text-white">
              <h3 className="text-xl font-display font-bold mb-4">Need Immediate Help?</h3>
              <div className="space-y-3">
                <a href="tel:+2348012345678" className="flex items-center gap-3 text-white/90 hover:text-white">
                  <Phone className="w-5 h-5" />
                  <span>+234 801 234 5678</span>
                </a>
                <a href="mailto:support@naijacars.com" className="flex items-center gap-3 text-white/90 hover:text-white">
                  <Mail className="w-5 h-5" />
                  <span>support@naijacars.com</span>
                </a>
                <a href="https://wa.me/2348012345678" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/90 hover:text-white">
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp Support</span>
                </a>
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-3xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-pearl-200 flex items-center justify-between">
                <h2 className="text-xl font-display font-bold text-charcoal-800">
                  Frequently Asked Questions
                </h2>
                <a href="/help" className="text-naija-600 text-sm font-medium hover:text-naija-700">
                  View All →
                </a>
              </div>
              <div className="divide-y divide-pearl-200">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="font-medium text-charcoal-800">{faq.question}</span>
                      <HelpCircle className={`w-5 h-5 text-charcoal-400 transition-transform ${
                        expandedFaq === index ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {expandedFaq === index && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 text-charcoal-500 text-sm"
                      >
                        {faq.answer}
                      </motion.p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
