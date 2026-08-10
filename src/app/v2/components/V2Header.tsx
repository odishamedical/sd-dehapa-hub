"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function V2Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If we scroll down, hide the header. If we scroll up, show it.
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header 
      className={`fixed top-0 w-full z-50 bg-white/30 backdrop-blur-xl border-b border-white/40 h-20 flex items-center justify-between px-8 shadow-[0_4px_30px_rgba(0,0,0,0.05)] transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <Link href="/v2" className="font-black text-2xl tracking-tight text-slate-900">
        dehapa<span className="text-blue-600">.v2</span>
      </Link>

      <nav className="hidden md:flex gap-6 items-center">
        <Link href="/v2" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">
          Homepage
        </Link>
        
        <div className="relative group">
          <button className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors py-2 flex items-center">
            SEO Hubs ▾
          </button>
          <div className="absolute top-full left-0 w-48 bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <Link href="/v2/doctors" className="block px-4 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">Doctors</Link>
            <Link href="/v2/hospitals" className="block px-4 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">Hospitals</Link>
            <Link href="/v2/labs" className="block px-4 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">Labs</Link>
            <Link href="/v2/pharmacies" className="block px-4 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">Pharmacies</Link>
            <Link href="/v2/ambulances" className="block px-4 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">Ambulances</Link>
          </div>
        </div>

        <Link href="/v2/search" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors bg-white/50 px-4 py-2 rounded-full border border-white/60 shadow-sm">
          Live Search Engine
        </Link>
      </nav>
    </header>
  );
}
