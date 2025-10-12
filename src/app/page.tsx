import NavigationHeader from "@/components/sections/navigation-header";
import HeroSection from "@/components/sections/hero-section";
import StatisticsBanner from "@/components/sections/statistics-banner";
import TrustedCompaniesLogos from "@/components/sections/trusted-companies-logos";
import ProblemStatementSection from "@/components/sections/problem-statement-section";
import SolutionIntroSection from "@/components/sections/solution-intro-section";
import FeatureCountdownTimer from "@/components/sections/feature-countdown-timer";
import FeatureInboxAlerts from "@/components/sections/feature-inbox-alerts";
import FeatureRealtimeMetrics from "@/components/sections/feature-realtime-metrics";
import FeatureManagerDashboard from "@/components/sections/feature-manager-dashboard";
import UseCasesSection from "@/components/sections/use-cases-section";
import TestimonialsSection from "@/components/sections/testimonials-section";
import BenefitsSection from "@/components/sections/benefits-section";
import FinalCtaSection from "@/components/sections/final-cta-section";
import FaqSection from "@/components/sections/faq-section";
import Footer from "@/components/sections/footer";

export default function Page() {
  return (
    <div className="min-h-screen">
      <NavigationHeader />
      <main>
        <HeroSection />
        <StatisticsBanner />
        <TrustedCompaniesLogos />
        <ProblemStatementSection />
        <SolutionIntroSection />
        <FeatureCountdownTimer />
        <FeatureInboxAlerts />
        <FeatureRealtimeMetrics />
        <FeatureManagerDashboard />
        <UseCasesSection />
        <TestimonialsSection />
        <BenefitsSection />
        <FinalCtaSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}