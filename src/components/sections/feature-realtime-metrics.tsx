import React from 'react';
import Image from 'next/image';
import { LineChart } from 'lucide-react';

const FeatureRealtimeMetrics = () => {
  return (
    <section className="bg-white py-16 px-6 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:justify-between lg:gap-20">
          <div className="w-full text-center lg:w-2/5 lg:text-left">
            <div className="inline-flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#4ECDC4]">
              <LineChart className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-4 text-[32px] font-bold leading-[1.2] text-[#0f1729]">
              Display your teams’ real-time response metrics in their inbox.
            </h2>
            <p className="mt-4 text-lg leading-[1.6] text-[#6B7280]">
              Set specific SLA’s and KPIs that fit your teams’ goals, customize them per account, customer or team, and keep them front and center.
            </p>
          </div>
          <div className="w-full lg:w-3/5">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/icons/5-v2-14.gif?"
              alt="Real-time response metrics dashboard in inbox"
              width={600}
              height={600}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureRealtimeMetrics;