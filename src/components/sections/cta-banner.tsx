import React from 'react';

const CtaBanner = () => {
  return (
    <section className="bg-background-primary py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#42E8B5] to-[#3DDFCD] rounded-[1rem] py-12 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-[1.2] tracking-tight">
              Get real-time email metrics in front of your team... and watch the magic happen.
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="https://info.timetoreply.com/book-demo"
                className="inline-block w-full rounded-md bg-white px-8 py-4 text-lg font-semibold text-primary-dark shadow-sm transition-colors hover:bg-gray-200 sm:w-auto"
              >
                Book Demo
              </a>
              <a
                href="https://portal.timetoreply.com/auth/register-try-free"
                className="inline-block w-full rounded-md border-2 border-white px-8 py-[14px] text-lg font-semibold text-white transition-colors hover:bg-white/20 sm:w-auto"
              >
                Try Free
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;