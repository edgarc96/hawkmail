import React from 'react';

const FinalCtaSection = () => {
  return (
    <section className="w-full bg-gradient-to-r from-[#4ECDC4] to-[#45B7AA] px-8 py-16">
      <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
        <h2 className="text-[2rem] font-bold leading-[1.3] tracking-tight text-white md:text-[2.5rem]">
          Get real-time email metrics in front of your team... and watch the magic happen.
        </h2>
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-4 md:w-auto md:flex-row">
          <a
            href="https://info.timetoreply.com/book-demo"
            className="w-full rounded-lg bg-white px-8 py-3.5 font-semibold text-[#0f1729] md:w-auto"
          >
            Book Demo
          </a>
          <a
            href="https://portal.timetoreply.com/auth/register-try-free"
            className="w-full rounded-lg border-2 border-white bg-transparent px-8 py-3.5 font-semibold text-white md:w-auto"
          >
            Try Free
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCtaSection;