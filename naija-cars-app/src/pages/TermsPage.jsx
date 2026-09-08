import { PageHeader } from '../components/PageLayout';
import PageContents from '../components/PageContents';
import { motion } from 'framer-motion';
import { FileText, ChevronRight } from 'lucide-react';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using NaijaCars ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform.

These Terms apply to all users of the Platform, including but not limited to buyers, sellers, dealers, and visitors. We reserve the right to modify these Terms at any time, and such modifications will be effective immediately upon posting.`
  },
  {
    id: 'description',
    title: '2. Description of Service',
    content: `NaijaCars is an online marketplace that connects car buyers with sellers across Nigeria. Our services include:

• Vehicle listings for sale and rent
• Messaging between buyers and sellers
• Car valuation tools
• Dealer verification services
• Payment facilitation (where applicable)

We do not own, sell, or rent vehicles directly. We serve as an intermediary platform connecting buyers and sellers.`
  },
  {
    id: 'eligibility',
    title: '3. Eligibility',
    content: `To use NaijaCars, you must:

• Be at least 18 years of age
• Be legally capable of entering into binding contracts
• Have a valid Nigerian identification
• Provide accurate and truthful information during registration

Business users (dealers) must additionally provide valid CAC registration documents and comply with all applicable Nigerian business laws.`
  },
  {
    id: 'accounts',
    title: '4. User Accounts',
    content: `When creating an account, you agree to:

• Provide accurate, current, and complete information
• Maintain and update your information to keep it accurate
• Maintain the security of your account credentials
• Accept responsibility for all activities under your account
• Notify us immediately of any unauthorized use

We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.`
  },
  {
    id: 'listings',
    title: '5. Vehicle Listings',
    content: `When listing a vehicle, you represent and warrant that:

• You are the legal owner of the vehicle or authorized to sell it
• All information provided is accurate and complete
• All photos are of the actual vehicle being sold
• The vehicle has no undisclosed liens or encumbrances
• The vehicle's condition is as described

Prohibited listings include:
• Stolen vehicles
• Vehicles with tampered odometers
• Fraudulent or misleading listings
• Vehicles that don't meet Nigerian road safety standards

We reserve the right to remove any listing that violates these Terms.`
  },
  {
    id: 'transactions',
    title: '6. Transactions',
    content: `NaijaCars facilitates connections between buyers and sellers but is not a party to the actual sale transaction. Buyers and sellers are responsible for:

• Verifying vehicle condition and documentation
• Negotiating terms of sale
• Completing payment safely
• Transferring vehicle ownership legally

We strongly recommend:
• Meeting in safe, public locations
• Verifying vehicle papers with appropriate authorities
• Using secure payment methods
• Conducting independent vehicle inspections`
  },
  {
    id: 'fees',
    title: '7. Fees and Payments',
    content: `Basic listing on NaijaCars is free. Premium services include:

• Featured listings: Additional fee per listing
• Dealer subscriptions: Monthly/annual fees
• Transaction facilitation: Service fee where applicable

All fees are displayed before purchase and are non-refundable unless otherwise stated. We reserve the right to modify our fee structure with reasonable notice.`
  },
  {
    id: 'prohibited',
    title: '8. Prohibited Conduct',
    content: `Users may not:

• Post false, misleading, or deceptive content
• Impersonate others or misrepresent affiliation
• Harass, abuse, or threaten other users
• Circumvent security features or access restrictions
• Scrape, harvest, or collect user data
• Distribute spam or unsolicited communications
• Engage in money laundering or fraud
• Violate any applicable laws or regulations

Violation of these prohibitions may result in immediate account termination and legal action.`
  },
  {
    id: 'ip',
    title: '9. Intellectual Property',
    content: `All content on NaijaCars, including but not limited to logos, text, graphics, images, and software, is the property of NaijaCars or its licensors and is protected by Nigerian and international intellectual property laws.

Users retain ownership of content they submit but grant NaijaCars a non-exclusive, worldwide, royalty-free license to use, display, and distribute such content in connection with the Platform.`
  },
  {
    id: 'liability',
    title: '10. Limitation of Liability',
    content: `NaijaCars is provided "as is" without warranties of any kind. We do not guarantee:

• Accuracy of listings or user information
• Availability or uninterrupted access
• Security of transactions between users
• Quality or condition of vehicles listed

To the maximum extent permitted by law, NaijaCars shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.`
  },
  {
    id: 'indemnification',
    title: '11. Indemnification',
    content: `You agree to indemnify and hold harmless NaijaCars, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable legal fees) arising from:

• Your use of the Platform
• Your violation of these Terms
• Your violation of any third-party rights
• Any transaction you conduct through the Platform`
  },
  {
    id: 'governing',
    title: '12. Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.`
  },
  {
    id: 'contact',
    title: '13. Contact Information',
    content: `For questions about these Terms of Service, please contact us:

Email: legal@naijacars.com
Address: 123 Admiralty Way, Lekki Phase 1, Lagos, Nigeria
Phone: +234 801 234 5678

These Terms were last updated on January 1, 2024.`
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-pearl-100">
      <PageHeader eyebrow="NaijaCars policies" title="Terms of service" description="Last updated: January 1, 2024" />

      <div className="nc-page-width py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <PageContents sections={sections} />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <div className="nc-panel !p-0">
              <div className="p-6 md:p-8 border-b border-pearl-200">
                <p className="text-charcoal-600">
                  Welcome to NaijaCars. Please read these Terms of Service carefully before using our platform. By using NaijaCars, you agree to be bound by these terms.
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
                    <div className="text-charcoal-600 whitespace-pre-line leading-relaxed">
                      {section.content}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Related Links */}
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <a href="/privacy" className="bg-white rounded-2xl border border-lightborder p-6 hover:shadow-card-hover transition-all">
                <h3 className="font-display font-bold text-charcoal-800 mb-2">Privacy Policy</h3>
                <p className="text-charcoal-500 text-sm">Learn how we collect and use your data</p>
              </a>
              <a href="/help" className="bg-white rounded-2xl border border-lightborder p-6 hover:shadow-card-hover transition-all">
                <h3 className="font-display font-bold text-charcoal-800 mb-2">Help Center</h3>
                <p className="text-charcoal-500 text-sm">Find answers to common questions</p>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
