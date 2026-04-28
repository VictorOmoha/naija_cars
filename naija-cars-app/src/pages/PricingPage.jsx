import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Rocket, Loader2 } from 'lucide-react';
import { subscriptionAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import useAuthStore from '../stores/authStore';

const planIcons = { BASIC: Zap, PRO: Crown, PREMIUM: Rocket };
const planColorClasses = {
  BASIC: { bg: 'bg-naija-500/10', text: 'text-naija-500' },
  PRO: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  PREMIUM: { bg: 'bg-purple-600/10', text: 'text-purple-600' },
};

const PricingPage = () => {
  const { addToast, openAuthModal } = useApp();
  const { isAuthenticated } = useAuthStore();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionAPI.getPlans(),
    staleTime: 60 * 60 * 1000,
  });

  const { data: subData } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => subscriptionAPI.getMySubscription(),
    enabled: isAuthenticated,
  });

  const plans = plansData?.data?.data?.plans || [];
  const currentSub = subData?.data?.data?.subscription;

  const handleSubscribe = async (planType) => {
    if (!isAuthenticated) {
      openAuthModal('register');
      return;
    }

    setLoadingPlan(planType);
    try {
      const response = await subscriptionAPI.initialize(planType);
      const { authorizationUrl } = response.data.data;
      window.location.href = authorizationUrl;
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'Failed to initialize payment';
      addToast(msg, 'error');
    } finally {
      setLoadingPlan(null);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

  if (plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <Loader2 className="w-8 h-8 animate-spin text-naija-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl-50 pt-32 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-charcoal-800 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
            Subscribe to start listing your cars on NaijaCars. All plans include instant listing activation — no waiting for approval.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = planIcons[plan.id] || Zap;
            const colors = planColorClasses[plan.id] || planColorClasses.BASIC;
            const isCurrentPlan = currentSub?.planType === plan.id;
            const isPopular = plan.id === 'PRO';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 flex flex-col ${
                  isPopular
                    ? 'border-naija-500 ring-2 ring-naija-200'
                    : 'border-pearl-200'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-naija-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${colors.text}`} />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-charcoal-800">
                    {plan.name}
                  </h2>
                  <div className="mt-3">
                    <span className="text-4xl font-bold text-charcoal-900">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-charcoal-500">/month</span>
                  </div>
                  <p className="text-sm text-charcoal-500 mt-1">
                    {plan.listingsLimit === -1
                      ? 'Unlimited listings'
                      : `${plan.listingsLimit} listings per month`}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-naija-500 mt-0.5 flex-shrink-0" />
                      <span className="text-charcoal-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || loadingPlan === plan.id}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-all ${
                    isCurrentPlan
                      ? 'bg-pearl-200 text-charcoal-500 cursor-default'
                      : isPopular
                        ? 'bg-naija-500 hover:bg-naija-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-charcoal-800 hover:bg-charcoal-900 text-white'
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    'Get Started'
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h3 className="text-xl font-display font-bold text-charcoal-800 mb-4">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4 text-left">
            <div className="bg-white p-5 rounded-xl border border-pearl-200">
              <h4 className="font-semibold text-charcoal-800">Can I browse for free?</h4>
              <p className="text-charcoal-600 mt-1">
                Yes! Browsing listings, searching, and contacting sellers is completely free. A subscription is only needed to list your own cars.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-pearl-200">
              <h4 className="font-semibold text-charcoal-800">Can I upgrade or downgrade my plan?</h4>
              <p className="text-charcoal-600 mt-1">
                Yes, you can switch plans at any time. Your new plan takes effect immediately.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-pearl-200">
              <h4 className="font-semibold text-charcoal-800">What happens when my subscription expires?</h4>
              <p className="text-charcoal-600 mt-1">
                Your existing listings remain active, but you won't be able to create new ones until you renew.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
