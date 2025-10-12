import React from 'react';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="bg-[#faf8f5]">
      <div className="mx-auto max-w-[1200px] px-8 py-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="text-center lg:text-left">
            <h1 className="text-[2.5rem] font-extrabold leading-[1.2] text-[#0f1729] lg:text-[3.5rem]">
              Don’t just track your team’s email response time —{' '}
              <span className="relative inline-block">
                optimize it.
                <svg
                  className="absolute -bottom-2 left-0 h-auto w-full text-[#4ECDC4]"
                  viewBox="0 0 194 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M1 9.38234C31.5936 3.51523 117.659 -5.5133 193 9.38234"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-[#4a5568]">
              The only email analytics tool with live inbox alerts for team members & a custom dashboard for managers, ensuring your team meets SLAs, hit their KPIs, and elevates customer experience.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <a
                href="https://info.timetoreply.com/book-demo"
                title="Book Demo"
                className="inline-block rounded-lg bg-[#4ECDC4] px-8 py-3.5 text-center font-semibold text-white transition hover:opacity-90"
              >
                Book Demo
              </a>
              <a
                href="https://portal.timetoreply.com/auth/register-try-free"
                title="Try Free"
                className="inline-block rounded-lg border border-[#d1d5db] bg-white px-8 py-3.5 text-center font-semibold text-[#0f1729] transition hover:bg-gray-50"
              >
                Try Free
              </a>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/images/1-v2-2-1.gif?"
              alt="Animated email interface mockup with inbox, email list, and response time indicators in purple/turquoise color scheme"
              width={800}
              height={600}
              className="h-auto w-full max-w-full rounded-lg"
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;