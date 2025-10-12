import Image from "next/image";
import { Users } from "lucide-react";

const FeatureManagerDashboard = () => {
  const features = [
    "View individual or team performance",
    "Filter by customer groups",
    "Sort by internal or external communication",
  ];

  return (
    <section className="bg-[#faf8f5] py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Column: Image (on desktop) */}
          <div className="lg:w-[55%] w-full">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/8-v2-17.gif?"
              alt="Manager dashboard showing team email performance analytics"
              width={800}
              height={600}
              className="rounded-lg shadow-xl w-full h-auto"
            />
          </div>

          {/* Right Column: Content (on desktop) */}
          <div className="lg:w-[45%] w-full">
            <div className="w-[60px] h-[60px] bg-[#4ECDC4] rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-[#0f1729] text-[2rem] leading-tight font-bold mt-4">
              Managers: track team email performance live …in one custom dashboard.
            </h2>
            
            <ul className="mt-6 space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-[#4ECDC4] rounded-full mt-3 mr-3"></span>
                  <span className="text-lg text-gray-700 leading-[1.8]">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeatureManagerDashboard;