import { Navbar } from "@/components/sections/navigation-header";
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
            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Tracking</h3>
              <p className="text-muted-foreground">
                Monitor email response times as they happen. Get instant alerts when SLAs are at risk.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Deep insights into team performance, trends, and bottlenecks with customizable dashboards.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Track individual and team performance. Identify top performers and coaching opportunities.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Mail className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Email Integration</h3>
              <p className="text-muted-foreground">
                Seamlessly connects with Gmail, Outlook, and other major email providers.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Automation</h3>
              <p className="text-muted-foreground">
                Automate reporting, alerts, and workflows to save time and improve efficiency.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
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
                <span className="text-brackets gradient-text">Analytics That Matter</span>
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
            <div className="bg-muted/30 rounded-lg p-8 h-96 flex items-center justify-center border border-border">
              <div className="text-muted-foreground">Analytics Dashboard Preview</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Simple, Transparent Pricing</span>
            </h2>
            <p className="text-xl text-muted-foreground">Choose the plan that fits your team size</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-lg font-semibold mb-2">Starter</div>
              <div className="text-4xl font-bold mb-6">
                $29<span className="text-xl text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <ArrowRight className="text-primary mr-2" size={16} />
                  <span>Up to 5 users</span>
                </li>
                <li className="flex items-center">
                  <ArrowRight className="text-primary mr-2" size={16} />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-center">
                  <ArrowRight className="text-primary mr-2" size={16} />
                  <span>Email support</span>
                </li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full">Start Trial</Button>
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="bg-card p-8 rounded-lg border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm">
                Most Popular
              </div>
              <div className="text-lg font-semibold mb-2">Professional</div>
              <div className="text-4xl font-bold mb-6">
                $79<span className="text-xl text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <ArrowRight className="text-primary mr-2" size={16} />
                  <span>Up to 25 users</span>
                </li>
                <li className="flex items-center">
                  <ArrowRight className="text-primary mr-2" size={16} />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <ArrowRight className="text-primary mr-2" size={16} />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <ArrowRight className="text-primary mr-2" size={16} />
                  <span>Custom reports</span>
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full">Start Trial</Button>
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-lg font-semibold mb-2">Enterprise</div>
              <div className="text-4xl font-bold mb-6">Custom</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <ArrowRight className="text-primary mr-2" size={16} />
                  <span>Unlimited users</span>
                </li>
                <li className="flex items-center">
                  <ArrowRight className="text-primary mr-2" size={16} />
                  <span>Custom integration</span>
                </li>
                <li className="flex items-center">
                  <ArrowRight className="text-primary mr-2" size={16} />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-center">
                  <ArrowRight className="text-primary mr-2" size={16} />
                  <span>SLA guarantee</span>
                </li>
              </ul>
              <Link href="/login">
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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