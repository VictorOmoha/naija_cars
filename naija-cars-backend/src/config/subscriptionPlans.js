const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: 'Basic',
    price: 500000,      // ₦5,000 in kobo
    priceDisplay: 5000,  // ₦5,000
    listingsLimit: 5,
    features: [
      '5 car listings per month',
      'Standard visibility',
      'Basic analytics',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 1500000,     // ₦15,000 in kobo
    priceDisplay: 15000,
    listingsLimit: 20,
    features: [
      '20 car listings per month',
      'Featured badge on listings',
      'Priority in search results',
      'Detailed analytics',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 3000000,     // ₦30,000 in kobo
    priceDisplay: 30000,
    listingsLimit: -1,  // unlimited
    features: [
      'Unlimited listings',
      'Featured badge on all listings',
      'Top placement in search',
      'Priority support',
      'Advanced analytics dashboard',
    ],
  },
};

module.exports = SUBSCRIPTION_PLANS;
