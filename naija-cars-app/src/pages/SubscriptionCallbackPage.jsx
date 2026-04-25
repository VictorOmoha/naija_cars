import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { subscriptionAPI } from '../services/api';

const SubscriptionCallbackPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!reference) {
      setStatus('error');
      setMessage('No payment reference found.');
      return;
    }

    const verify = async () => {
      try {
        const response = await subscriptionAPI.verify(reference);
        const activatedSub = response.data.data?.subscription;
        setStatus('success');
        setMessage(response.data.message || 'Subscription activated!');
        setSubscription(activatedSub);

        // The subscription was just activated server-side. The cached
        // ['my-subscription'] from before payment still says "no sub" —
        // if we just invalidate, the next page (/sell) renders the
        // "Subscription Required" gate during the refetch. Push the
        // fresh subscription into the cache directly (matching the
        // /me response shape) so the gate never appears, then trigger
        // a refetch so the cache stays in sync with the server.
        if (activatedSub) {
          const planNames = { BASIC: 'Basic', PRO: 'Pro', PREMIUM: 'Premium' };
          const listingsRemaining =
            activatedSub.listingsLimit === -1
              ? -1
              : activatedSub.listingsLimit - (activatedSub.listingsUsed || 0);
          const shaped = {
            id: activatedSub.id,
            planType: activatedSub.planType,
            planName: planNames[activatedSub.planType] || activatedSub.planType,
            startDate: activatedSub.startDate,
            endDate: activatedSub.endDate,
            listingsUsed: activatedSub.listingsUsed || 0,
            listingsLimit: activatedSub.listingsLimit,
            listingsRemaining,
            autoRenew: activatedSub.autoRenew,
            cancelledAt: activatedSub.cancelledAt,
          };
          queryClient.setQueryData(['my-subscription'], {
            data: { success: true, data: { subscription: shaped } },
          });
        }
        queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.error?.message || 'Payment verification failed. Please contact support.'
        );
      }
    };

    verify();
  }, [reference, queryClient]);

  return (
    <div className="min-h-screen bg-pearl-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-naija-500 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-charcoal-800 mb-2">
              Verifying Payment
            </h1>
            <p className="text-charcoal-600">
              Please wait while we confirm your payment...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-display font-bold text-charcoal-800 mb-2">
              Subscription Activated!
            </h1>
            <p className="text-charcoal-600 mb-2">{message}</p>
            {subscription && (
              <p className="text-sm text-charcoal-500 mb-6">
                Plan: <strong>{subscription.planType}</strong> &middot; Valid until{' '}
                {new Date(subscription.endDate).toLocaleDateString()}
              </p>
            )}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/sell')}
                className="w-full py-3 bg-naija-500 hover:bg-naija-600 text-white font-semibold rounded-xl transition-colors"
              >
                List Your Car Now
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 bg-pearl-100 hover:bg-pearl-200 text-charcoal-700 font-semibold rounded-xl transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-display font-bold text-charcoal-800 mb-2">
              Payment Failed
            </h1>
            <p className="text-charcoal-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                to="/pricing"
                className="block w-full py-3 bg-naija-500 hover:bg-naija-600 text-white font-semibold rounded-xl transition-colors text-center"
              >
                Try Again
              </Link>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 bg-pearl-100 hover:bg-pearl-200 text-charcoal-700 font-semibold rounded-xl transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCallbackPage;
