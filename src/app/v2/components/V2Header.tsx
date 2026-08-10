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
      className={`fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 h-20 flex items-center px-8 shadow-sm transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <Link href="/v2" className="font-black text-2xl tracking-tight text-slate-900">
        dehapa<span className="text-blue-600">.v2</span>
      </Link>
    </header>
  );
}
