'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export function PremiumUpgradeNotice() {
  const searchParams = useSearchParams();
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const upgrade = searchParams.get('upgrade');
    if (upgrade === 'true') {
      setShowUpgrade(true);
      // Remove the parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('upgrade');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  if (!showUpgrade) return null;

  const features = [
    'Advanced analytics dashboard',
    'Team performance metrics',
    'Custom SLA settings',
    'API access for integrations',
    'Priority email support',
    'Custom email templates',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Upgrade to Premium</CardTitle>
          <CardDescription>
            This feature requires an active subscription to unlock advanced capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Premium Features:</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-col gap-3">
            <Link href="#pricing">
              <Button className="w-full" onClick={() => setShowUpgrade(false)}>
                View Pricing Plans
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowUpgrade(false)}
            >
              Maybe Later
            </Button>
          </div>
          
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              14-day free trial • No credit card required
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}