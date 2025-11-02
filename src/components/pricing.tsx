'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button'; // Assuming a UI library is used

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface Plan {
  name: string;
  price: string;
  features: string[];
  lookupKey: string;
}

const plans: Plan[] = [
  {
    name: 'Basic',
    price: '$19/mo',
    features: ['5 users', '1,000 emails/mo', 'Basic analytics'],
    lookupKey: 'hawkmail_basic_monthly',
  },
  {
    name: 'Pro',
    price: '$39/mo',
    features: ['Unlimited users', 'Unlimited emails', 'AI features', 'API access'],
    lookupKey: 'hawkmail_pro_monthly',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: ['Everything in Pro', 'Dedicated support', 'SLA guarantees'],
    lookupKey: 'hawkmail_enterprise_yearly',
  },
];

export default function Pricing() {
  const [loading, setLoading] = useState('');

  const handleCheckout = async (lookupKey: string) => {
    setLoading(lookupKey);
    try {
      const response = await fetch('/api/checkout-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lookup_key: lookupKey }),
      });
      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="flex justify-center p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        {plans.map((plan) => (
          <div key={plan.name} className="border rounded-lg p-6 flex flex-col">
            <h2 className="text-2xl font-bold">{plan.name}</h2>
            <p className="text-4xl font-bold my-4">{plan.price}</p>
            <ul className="space-y-2 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleCheckout(plan.lookupKey)}
              disabled={loading === plan.lookupKey}
              className="mt-auto"
            >
              {loading === plan.lookupKey ? 'Loading...' : 'Choose Plan'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
