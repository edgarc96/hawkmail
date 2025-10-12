"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, User, HelpCircle } from "lucide-react";

const NavigationHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex items-center justify-between h-[88px]">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/svgs/timetoreply-logo-1.svg?"
                alt="timetoreply"
                width={180}
                height={32}
                className="w-[180px] h-auto"
                priority
              />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              href="/register"
              className="px-6 py-3 bg-[#4ECDC4] text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Try Free
            </Link>
            <Link
              href="/login"
              className="flex items-center space-x-2 text-[#1a202c] font-semibold text-sm hover:opacity-70 transition-opacity"
            >
              <User size={18} />
              <span>LOG IN</span>
            </Link>
          </nav>

          <div className="lg:hidden">
            <button onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
              <Menu size={28} className="text-[#1a202c]" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } bg-white`}
      >
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="flex items-center justify-between h-[88px]">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/abd887e9-f493-4931-b980-ae13dd9c4515-timetoreply-com/assets/svgs/timetoreply-logo-1.svg?"
                alt="timetoreply"
                width={180}
                height={32}
                className="w-[180px] h-auto"
                priority
              />
            </Link>
            <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
              <X size={28} className="text-[#1a202c]" />
            </button>
          </div>
          <nav className="mt-8 flex flex-col items-center space-y-6">
            <Link
              href="/register"
              onClick={() => setIsMenuOpen(false)}
              className="w-full text-center px-6 py-3 bg-[#4ECDC4] text-white rounded-lg font-semibold text-base"
            >
              Try Free
            </Link>
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-2 text-[#1a202c] font-semibold text-base"
            >
              <User size={20} />
              <span>LOG IN</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;