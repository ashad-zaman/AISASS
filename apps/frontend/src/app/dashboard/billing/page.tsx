'use client';

import { useState, useEffect } from 'react';
import { Check, X, Crown, Users } from 'lucide-react';
import { billingApi } from '@/lib/api';

const plans = [
  {
    type: 'FREE',
    name: 'Free',
    price: 0,
    features: [
      '100 requests/month',
      '10,000 tokens/month',
      '5 documents',
      'Basic support',
    ],
  },
  {
    type: 'PRO',
    name: 'Pro',
    price: 29,
    features: [
      '5,000 requests/month',
      '500,000 tokens/month',
      '100 documents',
      'Priority support',
      'Larger file uploads',
    ],
  },
  {
    type: 'TEAM',
    name: 'Team',
    price: 99,
    features: [
      'Unlimited requests',
      'Unlimited tokens',
      'Unlimited documents',
      'Priority support',
      '100MB file uploads',
      'Team collaboration',
    ],
  },
];

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await billingApi.getSubscription();
      setSubscription(response.data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (planType: 'PRO' | 'TEAM') => {
    try {
      const response = await billingApi.createCheckout({
        planType,
        successUrl: `${window.location.origin}/dashboard/billing?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`,
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    
    try {
      await billingApi.cancel();
      await loadSubscription();
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-600">Manage your subscription and billing</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.plan === plan.name;
          
          return (
            <div
              key={plan.type}
              className={`bg-white rounded-lg shadow p-6 ${
                plan.type === 'PRO' ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                {plan.type === 'PRO' && (
                  <Crown className="h-5 w-5 text-primary-500" />
                )}
              </div>
              
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-500">/month</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full py-2 px-4 bg-green-100 text-green-700 rounded-lg font-medium"
                >
                  Current Plan
                </button>
              ) : plan.type === 'FREE' ? (
                <button
                  disabled
                  className="w-full py-2 px-4 bg-gray-100 text-gray-500 rounded-lg font-medium"
                >
                  Included
                </button>
              ) : (
                <button
                  onClick={() => handleCheckout(plan.type as 'PRO' | 'TEAM')}
                  className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                >
                  Upgrade
                </button>
              )}
            </div>
          );
        })}
      </div>

      {subscription && subscription.status !== 'CANCELED' && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Current Subscription</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{subscription.plan}</p>
              <p className="text-sm text-gray-500">
                {subscription.cancelAtPeriodEnd 
                  ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                  : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                }
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}