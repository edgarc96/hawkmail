import Image from 'next/image';
import { Timer, ArrowRight } from 'lucide-react';

const FeatureCountdownTimer = () => {
  return (
    <section className="bg-white">
      <div className="max-w-[1200px] mx-auto py-16 px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
          {/* Left Content */}
          <div className="lg:w-2/5">
            <div className="flex items-center justify-center w-[60px] h-[60px] bg-[#4ECDC4] rounded-full">
              <Timer className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h2 className="mt-4 text-[2rem] font-bold text-[#0f1729] leading-tight">
              Each email gets prioritized with a countdown timer.
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-[1.6]">
              The moment an email hits the inbox, it gets assigned a deadline based on goals you’ve set, then pushes it to the top according to time remaining.
            </p>
            <a href="https://info.timetoreply.com/optimizer" className="mt-6 inline-flex items-center font-semibold text-[#4ECDC4] gap-2 group hover:text-[#45b8b0] transition-colors">
              See it in action
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>

          {/* Right Content */}
          <div className="lg:w-3/5 mt-12 lg:mt-0">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/1-v2-2-1.gif?"
              alt="Animated mockup of email interface with countdown timers and priority indicators."
              width={800}
              height={600}
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCountdownTimer;