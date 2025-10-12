import Image from "next/image";
import { Bell, ArrowRight } from "lucide-react";

const FeatureInboxAlerts = () => {
  return (
    <section className="bg-[#faf8f5] py-16 px-8">
      <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:justify-between">
        
        {/* Right content on Desktop, Top on Mobile - Text */}
        <div className="w-full lg:w-[45%] lg:order-2 flex flex-col items-start text-left">
          <div className="w-[60px] h-[60px] bg-[#4ECDC4] rounded-full flex items-center justify-center mb-8">
            <Bell className="w-6 h-6 text-white" />
          </div>
          
          <h2 className="text-[32px] font-bold text-[#0f1729] leading-tight">
            Team members get alerts in their inbox when response targets are at risk.
          </h2>
          
          <p className="text-lg text-[#6B7280] mt-4 leading-[1.6]">
            Timetoreply empowers employees to take responsibility for SLAs, stay proactive, and uphold top service standards.
          </p>
          
          <a
            href="https://info.timetoreply.com/optimizer"
            className="mt-6 flex items-center font-semibold text-[#4ECDC4] transition-colors hover:text-[#3dbab2] group"
          >
            See it in action
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        
        {/* Left content on Desktop, Bottom on Mobile - Image */}
        <div className="w-full lg:w-1/2 lg:order-1">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/icons/6-v2-1-15.gif?"
            alt="Animated mockup of inbox alerts for at-risk response targets"
            width={600}
            height={600}
            className="w-full h-auto"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
};

export default FeatureInboxAlerts;