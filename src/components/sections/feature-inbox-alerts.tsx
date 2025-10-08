import Image from "next/image";
import { Bell, ArrowRight } from "lucide-react";

const FeatureInboxAlerts = () => {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          <div className="w-full lg:w-1/2">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/6-v2-2-16.gif?"
              alt="A mockup of the timetoreply interface showing inbox alerts for performance stats and important emails."
              width={600}
              height={600}
              className="h-auto w-full"
              unoptimized
            />
          </div>

          <div className="w-full lg:w-1/2">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e2fcf9]">
              <Bell className="h-9 w-9 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="mt-6 text-[2.5rem] font-bold leading-[1.2] text-primary-dark lg:text-[3rem]">
              Team members get alerts in their inbox when response targets are
              at risk.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-text-primary lg:text-xl">
              Timetoreply empowers employees to take responsibility for SLAs,
              stay proactive, and uphold top service standards.
            </p>
            <div className="mt-8">
              <a
                href="https://info.timetoreply.com/optimizer"
                className="group inline-flex items-center text-lg font-bold text-primary transition-colors hover:text-primary-dark"
              >
                See it in action
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureInboxAlerts;