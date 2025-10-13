'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3">
              <XCircle className="h-16 w-16 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            Checkout Cancelled
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Your subscription was not completed
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              What happened?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              You cancelled the checkout process. No charges have been made to your account.
              You can return to the checkout page anytime to complete your subscription.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  Have questions?
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  If you encountered any issues or have questions about our plans,
                  feel free to contact our support team.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/stripe/checkout" className="flex-1">
              <Button className="w-full" variant="default">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Checkout
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full" variant="outline">
                Go to Home
              </Button>
            </Link>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help deciding? View our{' '}
              <Link href="/pricing" className="text-blue-600 dark:text-blue-400 hover:underline">
                pricing comparison
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
