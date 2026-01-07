import { motion } from 'framer-motion';
import { Shield, ChevronRight, Lock, Eye, Database, UserCheck, Bell, Globe } from 'lucide-react';

const highlights = [
  { icon: Lock, title: 'Your Data is Encrypted', desc: '256-bit SSL encryption protects all data' },
  { icon: Eye, title: 'No Hidden Tracking', desc: 'We only collect what\'s necessary' },
  { icon: UserCheck, title: 'You\'re in Control', desc: 'Manage your data preferences anytime' },
  { icon: Database, title: 'Data Stored Locally', desc: 'Your data stays in Nigeria' },
];

const sections = [
  {
    id: 'collection',
    title: '1. Information We Collect',
    content: `We collect information to provide better services to our users. The types of information we collect include:

**Information You Provide:**
• Account information: Name, email, phone number, address
• Profile information: Photo, bio, preferences
• Listing information: Vehicle details, photos, pricing
• Communication data: Messages between users
• Payment information: When using our payment services

**Information We Collect Automatically:**
• Device information: IP address, browser type, device type
• Usage data: Pages viewed, features used, search queries
• Location data: General location based on IP address
• Cookies: For authentication and preferences

**Information From Third Parties:**
• Social login data (if you sign in with Google/Facebook)
• Payment processors (transaction status, not card details)
• Verification services (identity verification results)`
  },
  {
    id: 'use',
    title: '2. How We Use Your Information',
    content: `We use the information we collect for the following purposes:

**Providing Our Services:**
• Creating and managing your account
• Displaying your vehicle listings
• Facilitating communication between users
• Processing payments and transactions

**Improving Our Platform:**
• Analyzing usage patterns to improve features
• Developing new products and services
• Personalizing your experience
• Conducting research and analysis

**Safety and Security:**
• Verifying user identities
• Detecting and preventing fraud
• Enforcing our Terms of Service
• Protecting users from harmful activities

**Communications:**
• Sending important account notifications
• Providing customer support
• Sending marketing communications (with consent)
• Notifying you about policy changes`
  },
  {
    id: 'sharing',
    title: '3. Information Sharing',
    content: `We do not sell your personal information. We may share your information in the following circumstances:

**With Other Users:**
• Profile information visible to other users
• Listing information publicly visible
• Messages shared with intended recipients

**With Service Providers:**
• Cloud hosting providers (data storage)
• Payment processors (transaction processing)
• Analytics services (usage analysis)
• Email service providers (communications)

**For Legal Reasons:**
• To comply with legal obligations
• To respond to legal process
• To protect our rights and safety
• To prevent fraud or illegal activities

**Business Transfers:**
• In connection with merger, acquisition, or sale
• Your information may transfer to the new entity`
  },
  {
    id: 'protection',
    title: '4. Data Protection',
    content: `We implement robust security measures to protect your information:

**Technical Measures:**
• 256-bit SSL encryption for data in transit
• Encrypted storage for sensitive data
• Regular security audits and testing
• Secure data centers with access controls

**Organizational Measures:**
• Employee access limited on need-to-know basis
• Staff training on data protection
• Incident response procedures
• Regular policy reviews

**Your Role:**
• Keep your password secure
• Use strong, unique passwords
• Enable two-factor authentication
• Log out on shared devices
• Report suspicious activity`
  },
  {
    id: 'rights',
    title: '5. Your Rights',
    content: `You have the following rights regarding your personal information:

**Access:** Request a copy of your personal data we hold

**Correction:** Request correction of inaccurate data

**Deletion:** Request deletion of your data (with exceptions)

**Portability:** Request your data in a portable format

**Objection:** Object to certain processing activities

**Restriction:** Request limitation of processing

**Withdraw Consent:** Withdraw consent for marketing

To exercise these rights, contact us at privacy@naijacars.com or through your account settings.`
  },
  {
    id: 'cookies',
    title: '6. Cookies and Tracking',
    content: `We use cookies and similar technologies for:

**Essential Cookies:**
• Authentication and security
• Session management
• Fraud prevention

**Functional Cookies:**
• Remembering preferences
• Language settings
• Recent searches

**Analytics Cookies:**
• Understanding usage patterns
• Improving our services
• Measuring performance

**Managing Cookies:**
You can control cookies through your browser settings. Blocking essential cookies may affect platform functionality.`
  },
  {
    id: 'retention',
    title: '7. Data Retention',
    content: `We retain your information for as long as necessary to:

• Provide our services to you
• Comply with legal obligations
• Resolve disputes
• Enforce our agreements

**Retention Periods:**
• Account data: Until account deletion + 30 days
• Transaction records: 7 years (legal requirement)
• Messages: 2 years after account deletion
• Usage logs: 12 months

After deletion, some data may remain in backups for up to 90 days.`
  },
  {
    id: 'children',
    title: '8. Children\'s Privacy',
    content: `NaijaCars is not intended for users under 18 years of age. We do not knowingly collect information from children under 18.

If we discover that we have collected information from a child under 18, we will delete it immediately. If you believe we have information about a child, please contact us at privacy@naijacars.com.`
  },
  {
    id: 'international',
    title: '9. International Data',
    content: `NaijaCars operates in Nigeria. Your information is primarily stored and processed in Nigeria.

If you access our services from outside Nigeria, your information may be transferred to and processed in Nigeria. By using our services, you consent to this transfer.

We ensure appropriate safeguards are in place for any international data transfers.`
  },
  {
    id: 'changes',
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Modified" date.

For significant changes, we will:
• Notify you via email
• Display a prominent notice on our platform
• Request consent where required by law

We encourage you to review this policy periodically.`
  },
  {
    id: 'contact',
    title: '11. Contact Us',
    content: `For privacy-related questions or concerns:

**Data Protection Officer:**
Email: privacy@naijacars.com
Address: 123 Admiralty Way, Lekki Phase 1, Lagos, Nigeria
Phone: +234 801 234 5678

We aim to respond to all inquiries within 48 hours.

This Privacy Policy was last updated on January 1, 2024.`
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-pearl-100">
      {/* Hero */}
      <div className="bg-gradient-to-r from-naija-600 to-emerald-500 pt-32 pb-16">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="p-4 bg-white/20 rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Privacy Policy
              </h1>
              <p className="text-white/80 mt-1">Last updated: January 1, 2024</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Highlights */}
      <div className="section-container -mt-8 relative z-10 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card p-6"
        >
          <div className="grid md:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex p-3 bg-naija-100 rounded-xl mb-3">
                  <item.icon className="w-6 h-6 text-naija-600" />
                </div>
                <h3 className="font-semibold text-charcoal-800">{item.title}</h3>
                <p className="text-sm text-charcoal-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="section-container pb-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-card p-4 sticky top-28">
              <h3 className="font-semibold text-charcoal-800 mb-4 px-2">Quick Navigation</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal-600 hover:bg-naija-50 hover:text-naija-600 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                    {section.title.replace(/^\d+\.\s*/, '')}
                  </a>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-3xl shadow-card overflow-hidden">
              <div className="p-6 md:p-8 border-b border-pearl-200">
                <p className="text-charcoal-600">
                  At NaijaCars, we take your privacy seriously. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use our platform.
                </p>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                {sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    id={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="scroll-mt-32"
                  >
                    <h2 className="text-xl font-display font-bold text-charcoal-800 mb-4">
                      {section.title}
                    </h2>
                    <div className="text-charcoal-600 whitespace-pre-line leading-relaxed prose prose-sm max-w-none">
                      {section.content.split('**').map((part, i) =>
                        i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Related Links */}
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <a href="/terms" className="bg-white rounded-2xl shadow-card p-6 hover:shadow-card-hover transition-all">
                <h3 className="font-display font-bold text-charcoal-800 mb-2">Terms of Service</h3>
                <p className="text-charcoal-500 text-sm">Read our terms and conditions</p>
              </a>
              <a href="/contact" className="bg-white rounded-2xl shadow-card p-6 hover:shadow-card-hover transition-all">
                <h3 className="font-display font-bold text-charcoal-800 mb-2">Contact Us</h3>
                <p className="text-charcoal-500 text-sm">Questions about privacy? Reach out</p>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
