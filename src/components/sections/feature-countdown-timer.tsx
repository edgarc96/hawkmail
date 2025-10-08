import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';

const FeatureCountdownTimer = () => {
  return (
    <section className="bg-background py-16">
      <div className="container max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 items-center gap-8 lg:gap-16">
          
          <div className="lg:col-span-2">
            
            <div className="flex">
              <span className="flex items-center justify-center w-16 h-16 bg-primary rounded-full">
                <Clock className="w-8 h-8 text-primary-dark" />
              </span>
            </div>
            
            <h2 className="mt-6 text-[40px] lg:text-5xl font-bold text-primary-dark tracking-tight leading-[1.2]">
              Each email gets prioritized with a countdown timer.
            </h2>
            
            <p className="mt-4 text-lg lg:text-xl text-text-primary leading-relaxed">
              The moment an email hits the inbox, it gets assigned a deadline based on goals you’ve set, then pushes it to the top according to time remaining.
            </p>
            
            <div className="mt-8">
              <a 
                href="https://info.timetoreply.com/optimizer"
                className="inline-flex items-center gap-2 text-primary font-semibold text-lg group hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                See it in action
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        
          <div className="lg:col-span-3">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/5-v2-14.gif"
              alt="Animated email interface showing priority system with countdown timers"
              width={800}
              height={600}
              className="w-full h-auto rounded-[20px] shadow-lg"
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCountdownTimer;