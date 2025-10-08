import React from 'react';

const HeroSection = () => {
  return (
    <section className="bg-background font-sans">
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 items-center gap-y-12 lg:grid-cols-2 lg:gap-x-20">
          <div className="text-center lg:text-left">
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] tracking-tighter text-[#0F2A3D] lg:text-[4rem]">
              Don’t just track your team’s email response time —{' '}
              <span className="relative inline-block whitespace-nowrap">
                optimize it.
                <svg
                  className="absolute -bottom-1 left-0 w-full md:-bottom-2"
                  viewBox="0 0 283 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2.61066 11.232C41.1164 5.23432 173.208 -5.20433 280.602 11.232"
                    stroke="#3DDFCD"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-[#1E293B] lg:mx-0 lg:text-xl">
              The only email analytics tool with live inbox alerts for team members & a custom dashboard for managers, ensuring your team meets SLAs, hit their KPIs, and elevates customer experience.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:mt-10 lg:justify-start">
              <a
                href="https://info.timetoreply.com/book-demo"
                title="Book Demo"
                className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-md bg-[#42E8B5] px-8 text-lg font-semibold text-[#0F2A3D] transition-colors hover:bg-opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
              >
                Book Demo
              </a>
              <a
                href="https://portal.timetoreply.com/auth/register-try-free"
                title="Try Free"
                className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-md border-2 border-[#1A202C] bg-transparent px-8 text-lg font-semibold text-[#0F2A3D] transition-colors hover:bg-[#F5F1ED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
              >
                Try Free
              </a>
            </div>
          </div>
          <div>
            <img
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/images/1-v2-2-1.gif"
              alt="Animated dashboard preview showing email interface with performance stats"
              className="w-full max-w-full rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;