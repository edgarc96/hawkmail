'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Bell, 
  Mail, 
  Users, 
  Zap,
  Save,
  ExternalLink,
  Loader2,
  CreditCard,
  Shield,
  History
} from 'lucide-react';

interface UserSettings {
  emailNotifications: boolean;
  slackNotifications: boolean;
  autoAssignment: boolean;
  slaAlerts: boolean;
  weeklyReports: boolean;
}

interface EmailProvider {
  id: number;
  provider: string;
  email: string;
  isActive: boolean;
  lastSyncAt: string | null;
}

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface SettingsContentProps {
  session: any;
}

export function SettingsContent({ session }: SettingsContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    slackNotifications: false,
    autoAssignment: true,
    slaAlerts: true,
    weeklyReports: true,
  });
  const [emailProviders, setEmailProviders] = useState<EmailProvider[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (session?.user) {
      loadAllData();
    }
  }, [session]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel for faster loading
      const [settingsRes, providersRes, subscriptionRes] = await Promise.all([
        fetch('/api/user/settings').catch(() => null),
        fetch('/api/email-providers').catch(() => null),
        fetch('/api/user/subscription').catch(() => null),
      ]);

      // Process settings
      if (settingsRes?.ok) {
        const data = await settingsRes.json();
        setSettings(data.settings || settings);
      }

      // Process email providers
      if (providersRes?.ok) {
        const data = await providersRes.json();
        setEmailProviders(data.providers || []);
      }

      // Process subscription
      if (subscriptionRes?.ok) {
        const data = await subscriptionRes.json();
        setSubscription(data.subscription || null);
      }
    } catch (error) {
      console.error('Error loading settings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchEmailProviders = async () => {
    try {
      const response = await fetch('/api/email-providers');
      if (response.ok) {
        const data = await response.json();
        setEmailProviders(data.providers || []);
      }
    } catch (error) {
      console.error('Error fetching email providers:', error);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectProvider = (provider: 'gmail' | 'outlook') => {
    if (!session?.user?.id) {
      toast.error('Please login first');
      return;
    }
    window.location.href = `/api/oauth/${provider}/authorize?userId=${session.user.id}`;
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        toast.error('Failed to open subscription management');
      }
    } catch (error) {
      console.error('Error opening subscription management:', error);
      toast.error('Failed to open subscription management');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
       
        {subscription && subscription.plan !== 'free' && (
          <Badge variant="default" className="text-sm bg-orange-600 hover:bg-orange-700">
            {subscription.plan === 'pro' ? 'Pro Plan' : 'Enterprise'}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Notifications */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for important events
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Slack Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notifications in your Slack workspace
                  </p>
                </div>
                <Switch
                  checked={settings.slackNotifications}
                  onCheckedChange={(checked) => handleSettingChange('slackNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">SLA Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when emails are approaching SLA limits
                  </p>
                </div>
                <Switch
                  checked={settings.slaAlerts}
                  onCheckedChange={(checked) => handleSettingChange('slaAlerts', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly performance summaries
                  </p>
                </div>
                <Switch
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Management */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Mail className="w-5 h-5 mr-2" />
                Email Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Auto-Assignment</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign emails to team members
                  </p>
                </div>
                <Switch
                  checked={settings.autoAssignment}
                  onCheckedChange={(checked) => handleSettingChange('autoAssignment', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Connected Email Providers</Label>
                
                {emailProviders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No email providers connected yet.</p>
                ) : (
                  <div className="space-y-3">
                    {emailProviders.map((provider) => (
                      <div
                        key={provider.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            provider.provider === 'gmail' ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            <Mail className={`w-5 h-5 ${
                              provider.provider === 'gmail' ? 'text-red-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{provider.provider}</p>
                            <p className="text-sm text-muted-foreground">{provider.email}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnectProvider('gmail')}
                    className="flex-1"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Connect Gmail
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnectProvider('outlook')}
                    className="flex-1"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Connect Outlook
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-4">
          {/* Subscription */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="w-5 h-5 mr-2" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subscription ? (
                <>
                  <div className="space-y-2">
                    <Badge variant="default" className="bg-orange-600 hover:bg-orange-700">
                      {subscription.plan === 'pro' ? 'Pro Plan' : subscription.plan}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      ${subscription.plan === 'pro' ? '40' : '0'}/month • Renews on {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleManageSubscription}
                  >
                    Manage Subscription
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    No active subscription
                  </p>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => window.location.href = '/stripe/checkout'}
                  >
                    Upgrade to Pro
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Zap className="w-5 h-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => toast.info('Team management coming soon')}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Team
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => toast.info('Security settings coming soon')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => toast.info('Notification history coming soon')}
              >
                <History className="w-4 h-4 mr-2" />
                Notification History
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full bg-orange-600 hover:bg-orange-700"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}