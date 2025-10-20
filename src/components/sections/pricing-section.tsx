'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  lookupKey: string;
  popular?: boolean;
  cta: string;
}

const plans: PricingPlan[] = [
  {
    name: 'Starter Plan',
    price: '$29',
    description: 'Perfect for small teams',
    lookupKey: 'starter_plan',
    cta: 'Start Free Trial',
    features: [
      'Up to 1,000 emails per month',
      'Basic email templates',
      'Email support',
      'Basic analytics dashboard',
      '5 team members',
    ],
  },
  {
    name: 'Pro',
    price: '$40',
    description: 'For growing businesses',
    lookupKey: 'pro_plan',
    popular: true,
    cta: 'Start Free Trial',
    features: [
      'Up to 10,000 emails per month',
      'Advanced email templates',
      'Priority email support',
      'Advanced analytics & reports',
      '25 team members',
      'API access',
      'Custom integrations',
    ],
  },
  {
    name: 'Enterprise',
    price: '$200',
    description: 'For large organizations',
    lookupKey: 'enterprise_plan',
    cta: 'Start Free Trial',
    features: [
      'Unlimited emails',
      'Custom email templates',
      '24/7 phone & email support',
      'Advanced analytics & reporting',
      'Unlimited team members',
      'Full API access',
      'Dedicated account manager',
      'Custom SLA',
    ],
  },
];

export function PricingSection() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (lookupKey: string) => {
    setLoadingPlan(lookupKey);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lookup_key: lookupKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to start checkout. Please try again.');
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Simple, Transparent Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your team. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.lookupKey}
              className={`bg-card p-8 rounded-lg relative transition-shadow hover:shadow-xl ${
                plan.popular
                  ? 'border-2 border-primary shadow-lg'
                  : 'border border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className="text-lg font-semibold mb-2">{plan.name}</div>
                <div className="text-4xl font-bold mb-2">
                  {plan.price}
                  <span className="text-xl text-muted-foreground">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="text-primary mr-2 mt-0.5 flex-shrink-0" size={18} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.lookupKey)}
                disabled={loadingPlan !== null}
                className={`w-full ${
                  plan.popular
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-secondary hover:bg-secondary/90'
                }`}
                variant={plan.popular ? 'default' : 'outline'}
              >
                {loadingPlan === plan.lookupKey ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    {plan.cta}
                    <ArrowRight className="ml-2" size={16} />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                No credit card required
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            All plans include email integration, real-time tracking, and secure data encryption.
          </p>
          <p className="text-sm text-muted-foreground">
            Need a custom plan?{' '}
            <a href="#contact" className="text-primary hover:underline">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
