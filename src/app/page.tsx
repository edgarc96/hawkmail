import { Navbar } from "@/components/sections/navigation-header";
import { PricingSection } from "@/components/sections/pricing-section";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Clock, BarChart3, Users, Zap, Shield } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Master Your Email</span>
            <span className="block mt-4">
              <span className="text-geometric gradient-text">Response Times</span>
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            HawkMail helps teams track, analyze, and optimize email response times.
            Deliver exceptional customer service with real-time analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Watch Demo
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-primary">47%</div>
              <div className="text-muted-foreground mt-2">Faster Response Times</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">98%</div>
              <div className="text-muted-foreground mt-2">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-muted-foreground mt-2">Teams Trust Us</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-accent-bars gradient-text">Powerful Features</span>
            </h2>
            <p className="text-xl text-muted-foreground">Everything you need to track and improve email performance</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Tracking</h3>
              <p className="text-muted-foreground">
                Monitor email response times as they happen. Get instant alerts when SLAs are at risk.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Deep insights into team performance, trends, and bottlenecks with customizable dashboards.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Track individual and team performance. Identify top performers and coaching opportunities.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Mail className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Email Integration</h3>
              <p className="text-muted-foreground">
                Seamlessly connects with Gmail, Outlook, and other major email providers.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Automation</h3>
              <p className="text-muted-foreground">
                Automate reporting, alerts, and workflows to save time and improve efficiency.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Enterprise Security</h3>
              <p className="text-muted-foreground">
                Bank-level encryption, SSO, and compliance with GDPR, SOC2, and HIPAA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                <span className="gradient-text">Analytics That Matter</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Get actionable insights from your email data. Track response times, workload distribution, and team performance in real-time.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-1 mr-3 mt-1">
                    <ArrowRight className="text-primary" size={16} />
                  </div>
                  <div>
                    <div className="font-semibold">First Response Time</div>
                    <div className="text-muted-foreground">Track how quickly your team responds to new emails</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-1 mr-3 mt-1">
                    <ArrowRight className="text-primary" size={16} />
                  </div>
                  <div>
                    <div className="font-semibold">Resolution Time</div>
                    <div className="text-muted-foreground">Measure end-to-end conversation duration</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-1 mr-3 mt-1">
                    <ArrowRight className="text-primary" size={16} />
                  </div>
                  <div>
                    <div className="font-semibold">SLA Compliance</div>
                    <div className="text-muted-foreground">Monitor adherence to service level agreements</div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <h3 className="text-lg font-semibold">Analytics Overview</h3>
                  <div className="text-sm text-muted-foreground">Last 7 days</div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Avg Response Time</div>
                    <div className="text-2xl font-bold text-primary">2.3h</div>
                    <div className="text-xs text-green-500 mt-1">↓ 15% vs last week</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Emails Processed</div>
                    <div className="text-2xl font-bold">1,247</div>
                    <div className="text-xs text-green-500 mt-1">↑ 23% vs last week</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">SLA Compliance</div>
                    <div className="text-2xl font-bold text-primary">94%</div>
                    <div className="text-xs text-green-500 mt-1">↑ 3% vs last week</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Team Performance</div>
                    <div className="text-2xl font-bold">8.7/10</div>
                    <div className="text-xs text-green-500 mt-1">↑ 0.5 vs last week</div>
                  </div>
                </div>
                
                {/* Chart Placeholder */}
                <div className="bg-muted/30 rounded-lg p-6 h-32 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-end justify-around px-4 pb-4 gap-2">
                    <div className="bg-primary/30 w-full rounded-t-sm" style={{height: '40%'}}></div>
                    <div className="bg-primary/50 w-full rounded-t-sm" style={{height: '65%'}}></div>
                    <div className="bg-primary/40 w-full rounded-t-sm" style={{height: '50%'}}></div>
                    <div className="bg-primary/70 w-full rounded-t-sm" style={{height: '85%'}}></div>
                    <div className="bg-primary/60 w-full rounded-t-sm" style={{height: '70%'}}></div>
                    <div className="bg-primary w-full rounded-t-sm" style={{height: '95%'}}></div>
                    <div className="bg-primary/80 w-full rounded-t-sm" style={{height: '88%'}}></div>
                  </div>
                </div>
                <div className="text-xs text-center text-muted-foreground">Response Time Trends</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            <span className="text-glow gradient-text">Ready to Transform Your Email Performance?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of teams who have improved their response times with HawkMail
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Start Your Free Trial <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-xl font-bold mb-4">HawkMail</div>
              <p className="text-muted-foreground">
                The leading email analytics platform for modern teams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2025 HawkMail. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}