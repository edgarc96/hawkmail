import React from 'react';

const WavyUnderline = () => (
  <svg
    className="absolute -bottom-1 left-0 w-full h-[7px]"
    viewBox="0 0 250 7"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path
      d="M1.00018 4.99982C36.438 0.147854 75.3831 6.27044 125.045 4.99982C174.707 3.7292 213.116 -0.122753 249.006 4.99982"
      stroke="#8B5CF6"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const SolutionIntroSection = () => {
  return (
    <section className="bg-white py-16 px-8 text-center">
      <div className="max-w-[1200px] mx-auto">
        <div className="w-full md:w-[90%] lg:w-4/5 mx-auto">
          <h2 className="text-[#0f1729] font-bold text-[2rem] lg:text-[2.5rem] leading-[1.3]">
            Only timetoreply make metrics actionable with{' '}
            <span className="relative inline-block whitespace-nowrap">
              real-time email KPIs
              <WavyUnderline />
            </span>{' '}
            in every inbox.
          </h2>
        </div>
      </div>
    </section>
  );
};

export default SolutionIntroSection;