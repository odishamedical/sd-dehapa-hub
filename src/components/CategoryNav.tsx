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
    <div className="bg-[#f1f5f9] border-b border-slate-300 shadow-inner relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <nav className="flex items-center md:justify-center gap-2 overflow-x-auto no-scrollbar py-3">
          {categories.map((cat) => {
            const isActive = pathname.startsWith(cat.href);
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                  isActive 
                    ? 'bg-white text-teal-700 border-[2px] md:border-[3px] border-teal-600 shadow-[0_6px_15px_rgba(13,148,136,0.2)] transform md:-translate-y-0.5' 
                    : 'bg-white text-slate-500 hover:text-slate-800 border-[2px] md:border-[3px] border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                }`}
              >
                <span className="text-sm md:text-lg drop-shadow-sm">{cat.icon}</span>
                {cat.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
