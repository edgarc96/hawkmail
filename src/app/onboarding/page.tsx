'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  Users,
  Settings,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Zap,
  Shield,
  BarChart3,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingData {
  companyName: string;
  teamSize: string;
  emailProvider: string;
  targetResponseTime: string;
  businessHours: {
    start: string;
    end: string;
    timezone: string;
  };
  notifications: {
    email: boolean;
    slack: boolean;
    desktop: boolean;
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    companyName: '',
    teamSize: '',
    emailProvider: '',
    targetResponseTime: '60',
    businessHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC'
    },
    notifications: {
      email: true,
      slack: false,
      desktop: true
    }
  });

  const totalSteps = 5;

  const updateOnboardingData = (field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateBusinessHours = (field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [field]: value
      }
    }));
  };

  const updateNotifications = (field: string, value: boolean) => {
    setOnboardingData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setIsCompleting(true);

    try {
      // Call API to save onboarding data
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      toast.success('Welcome to HawkMail! Your account is ready.');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Welcome to HawkMail!</CardTitle>
              <CardDescription>
                Let's set up your account to get started with email analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Inc."
                    value={onboardingData.companyName}
                    onChange={(e) => updateOnboardingData('companyName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team Size</Label>
                  <select
                    id="teamSize"
                    className="w-full p-2 border rounded"
                    value={onboardingData.teamSize}
                    onChange={(e) => updateOnboardingData('teamSize', e.target.value)}
                  >
                    <option value="">Select team size</option>
                    <option value="1-5">1-5 members</option>
                    <option value="6-20">6-20 members</option>
                    <option value="21-50">21-50 members</option>
                    <option value="50+">50+ members</option>
                  </select>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What you'll get:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Real-time email tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Team performance analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    SLA monitoring and alerts
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Connect Your Email</CardTitle>
              <CardDescription>
                Choose your email provider to start tracking responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Email Provider</Label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'gmail', name: 'Gmail', description: 'Connect your Gmail account' },
                    { id: 'outlook', name: 'Outlook', description: 'Connect your Outlook account' },
                    { id: 'other', name: 'Other', description: 'Connect via IMAP/SMTP' }
                  ].map((provider) => (
                    <div
                      key={provider.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${onboardingData.emailProvider === provider.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                        }`}
                      onClick={() => updateOnboardingData('emailProvider', provider.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{provider.name}</h4>
                          <p className="text-sm text-muted-foreground">{provider.description}</p>
                        </div>
                        {onboardingData.emailProvider === provider.id && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Secure Connection
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  We use OAuth 2.0 for secure authentication. Your credentials are never stored.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Set Your SLA Goals</CardTitle>
              <CardDescription>
                Define your target response times and business hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="targetResponseTime">Target Response Time (minutes)</Label>
                  <select
                    id="targetResponseTime"
                    className="w-full p-2 border rounded"
                    value={onboardingData.targetResponseTime}
                    onChange={(e) => updateOnboardingData('targetResponseTime', e.target.value)}
                  >
                    <option value="15">15 minutes - Premium</option>
                    <option value="30">30 minutes - Fast</option>
                    <option value="60">60 minutes - Standard</option>
                    <option value="120">120 minutes - Casual</option>
                  </select>
                </div>

                <Separator />

                <div>
                  <Label>Business Hours</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="startTime" className="text-sm">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={onboardingData.businessHours.start}
                        onChange={(e) => updateBusinessHours('start', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-sm">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={onboardingData.businessHours.end}
                        onChange={(e) => updateBusinessHours('end', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="w-full p-2 border rounded"
                    value={onboardingData.businessHours.timezone}
                    onChange={(e) => updateBusinessHours('timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time (EST)</option>
                    <option value="PST">Pacific Time (PST)</option>
                    <option value="CET">Central European Time (CET)</option>
                  </select>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                  <Zap className="w-4 h-4 inline mr-1" />
                  Pro Tip
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Setting realistic SLA goals helps maintain team morale and customer satisfaction.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive alerts and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  {
                    key: 'email',
                    label: 'Email Notifications',
                    description: 'Get email alerts for urgent messages',
                    icon: Mail
                  },
                  {
                    key: 'slack',
                    label: 'Slack Integration',
                    description: 'Receive notifications in your Slack workspace',
                    icon: BarChart3
                  },
                  {
                    key: 'desktop',
                    label: 'Desktop Alerts',
                    description: 'Browser notifications for real-time updates',
                    icon: Zap
                  }
                ].map((notification) => (
                  <div key={notification.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <notification.icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{notification.label}</h4>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={onboardingData.notifications[notification.key as keyof typeof onboardingData.notifications]}
                      onChange={(e) => updateNotifications(notification.key, e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Smart Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  We'll only send you important notifications to avoid alert fatigue.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>You're All Set!</CardTitle>
              <CardDescription>
                Review your settings and start using HawkMail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Company:</span>
                    <p className="text-muted-foreground">{onboardingData.companyName || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Team Size:</span>
                    <p className="text-muted-foreground">{onboardingData.teamSize || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email Provider:</span>
                    <p className="text-muted-foreground">{onboardingData.emailProvider || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Response Time:</span>
                    <p className="text-muted-foreground">{onboardingData.targetResponseTime} minutes</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold">What's Next?</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Connect your email provider
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Invite team members
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Set up email templates
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Monitor your first analytics
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <h4 className="font-semibold mb-2">Ready to get started?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete setup to access your dashboard and start tracking email performance.
                </p>
                <Badge variant="secondary" className="text-sm">
                  14-day free trial • No credit card required
                </Badge>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === totalSteps ? (
            <Button onClick={completeOnboarding} disabled={isCompleting}>
              {isCompleting ? (
                <>Completing setup...</>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}