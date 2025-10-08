import Image from "next/image";
import { BarChart3 } from "lucide-react";

const FeatureRealtimeMetrics = () => {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col gap-y-6 text-center lg:text-left items-center lg:items-start">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-2 shrink-0">
              <BarChart3
                className="w-10 h-10 text-primary-dark"
                strokeWidth={1.5}
              />
            </div>
            <h2 className="text-[40px] lg:text-[48px] font-bold text-primary-dark leading-[1.2] -tracking-[0.01em]">
              Display your teams’ real-time response metrics in their inbox.
            </h2>
            <p className="text-lg lg:text-xl text-text-primary leading-[1.6] max-w-lg lg:max-w-none">
              Set specific SLA’s and KPIs that fit your teams’ goals, customize
              them per account, customer or team, and keep them front and
              center.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/1-1-18.png?"
              alt="Dashboard preview with real-time response metrics"
              width={600}
              height={600}
              className="rounded-xl shadow-2xl w-full h-auto max-w-xl lg:max-w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureRealtimeMetrics;