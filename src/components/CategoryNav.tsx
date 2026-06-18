"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CategoryNav() {
  const pathname = usePathname();

  const categories = [
    { name: "Doctors", icon: "🩺", href: "/doctors" },
    { name: "Hospitals", icon: "🏥", href: "/hospitals" },
    { name: "Labs", icon: "🔬", href: "/labs" },
    { name: "Pharmacies", icon: "💊", href: "/pharmacies" },
    { name: "Ambulances", icon: "🚑", href: "/ambulances" }
  ];

  return (
    <div className="bg-[#040815] py-2 border-b border-cyan-900/30 relative z-40">
      <div className="max-w-6xl mx-auto px-6">
        <nav className="flex items-center md:justify-center gap-2 overflow-x-auto no-scrollbar py-3">
          <div className="flex items-center gap-2 bg-[#0a1229]/80 backdrop-blur-xl border border-slate-700/50 p-1.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {categories.map((cat) => {
              const isActive = pathname.startsWith(cat.href);
              return (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                    isActive 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                      : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <span className={`text-sm md:text-lg ${isActive ? 'drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : ''}`}>{cat.icon}</span>
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
