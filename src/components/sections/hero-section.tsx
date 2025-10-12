import React from 'react';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#0A192F] overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-yellow-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      
      <div className="mx-auto max-w-[1200px] px-8 py-20 lg:py-28 relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-sm font-semibold text-amber-400">Swift Analytics Platform</span>
            </div>
            
            <h1 className="text-[2.5rem] font-black leading-[1.15] text-white lg:text-[4rem]">
              Don't just track emails —{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                  dominate them.
                </span>
                <svg
                  className="absolute -bottom-2 left-0 h-auto w-full text-amber-500"
                  viewBox="0 0 194 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M1 9.38234C31.5936 3.51523 117.659 -5.5133 193 9.38234"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            
            <p className="mt-8 text-xl leading-relaxed text-gray-300">
              Eagle-eyed email analytics with real-time alerts. Watch your team's response times like a hawk, 
              hit SLAs consistently, and deliver lightning-fast customer experiences.
            </p>
            
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <a
                href="/register"
                title="Start Free Trial"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-center font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:from-amber-600 hover:to-amber-700 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="group-hover:animate-bounce">
                  <path d="M10 2L4 7V11C4 14 7 16 10 18C13 16 16 14 16 11V7L10 2Z" fill="currentColor"/>
                </svg>
                Start Free Trial
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a
                href="/login"
                title="Watch Demo"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-amber-500/30 bg-white/5 backdrop-blur-sm px-8 py-4 text-center font-semibold text-white transition-all hover:bg-white/10 hover:border-amber-500/50"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 6L14 10L8 14V6Z" fill="currentColor"/>
                </svg>
                Watch Demo
              </a>
            </div>
            
            {/* Stats */}
            <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-8">
              <div>
                <div className="text-3xl font-black text-amber-400">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-black text-amber-400">2.3s</div>
                <div className="text-sm text-gray-400">Avg Response</div>
              </div>
              <div>
                <div className="text-3xl font-black text-amber-400">10K+</div>
                <div className="text-sm text-gray-400">Teams</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 blur-3xl rounded-full"></div>
            
            {/* Placeholder for dashboard mockup */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-amber-500/20 shadow-2xl shadow-amber-500/20 overflow-hidden">
              <div className="p-4">
                {/* Mock browser bar */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                
                {/* Mock dashboard content */}
                <div className="space-y-4">
                  <div className="h-8 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded animate-pulse"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-amber-500/10 rounded border border-amber-500/20 animate-pulse"></div>
                    <div className="h-24 bg-amber-500/10 rounded border border-amber-500/20 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="h-24 bg-amber-500/10 rounded border border-amber-500/20 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <div className="h-48 bg-amber-500/5 rounded border border-amber-500/20"></div>
                </div>
              </div>
              
              {/* Hawk icon overlay */}
              <div className="absolute top-4 right-4 opacity-20">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <path d="M40 8L16 28V46C16 58 26 66 40 72C54 66 64 58 64 46V28L40 8Z" fill="#F59E0B" opacity="0.3"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;