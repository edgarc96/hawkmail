import Navigation from "@/components/sections/navigation";
import HeroSection from "@/components/sections/hero";
import StatisticsBanner from "@/components/sections/statistics-banner";
import CustomerLogos from "@/components/sections/customer-logos";
import ProblemStatement from "@/components/sections/problem-statement";
import ValueProposition from "@/components/sections/value-proposition";
import FeatureCountdownTimer from "@/components/sections/feature-countdown-timer";
import FeatureInboxAlerts from "@/components/sections/feature-inbox-alerts";
import FeatureRealtimeMetrics from "@/components/sections/feature-realtime-metrics";
import FeatureManagerDashboard from "@/components/sections/feature-manager-dashboard";
import DepartmentsSection from "@/components/sections/departments";
import Testimonials from "@/components/sections/testimonials";
import BenefitsSection from "@/components/sections/benefits";
import CtaBanner from "@/components/sections/cta-banner";
import FaqSection from "@/components/sections/faq";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <HeroSection />
        <StatisticsBanner />
        <CustomerLogos />
        <ProblemStatement />
        <ValueProposition />
        <FeatureCountdownTimer />
        <FeatureInboxAlerts />
        <FeatureRealtimeMetrics />
        <FeatureManagerDashboard />
        <DepartmentsSection />
        <Testimonials />
        <BenefitsSection />
        <CtaBanner />
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}