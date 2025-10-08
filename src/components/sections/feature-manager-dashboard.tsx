import Image from "next/image";
import { Users } from "lucide-react";

const FeatureManagerDashboard = () => {
  return (
    <section className="bg-background-secondary py-16 lg:py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Image Column (Left on desktop) */}
          <div className="w-full lg:w-3/5">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/8-v2-17.gif?"
              alt="Manager dashboard for tracking team email performance"
              width={800}
              height={600}
              className="w-full rounded-2xl shadow-xl"
            />
          </div>

          {/* Text Column (Right on desktop) */}
          <div className="w-full lg:w-2/5">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary">
              <Users className="h-10 w-10 text-primary-dark" strokeWidth={1.5} />
            </div>
            
            <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-primary-dark lg:text-[40px]">
              Managers: track team email performance live …in one custom dashboard.
            </h2>
            
            <ul className="mt-6 space-y-3 list-disc pl-5 text-lg text-text-primary lg:text-xl">
              <li>View individual or team performance</li>
              <li>Filter by customer groups</li>
              <li>Sort by internal or external communication</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureManagerDashboard;