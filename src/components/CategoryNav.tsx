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
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <nav className="flex items-center md:justify-center gap-1 overflow-x-auto no-scrollbar py-2">
          {categories.map((cat) => {
            const isActive = pathname.startsWith(cat.href);
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors shrink-0 ${
                  isActive 
                    ? 'bg-teal-50 text-teal-700 border-2 border-teal-100 shadow-sm' 
                    : 'bg-transparent text-slate-600 hover:bg-slate-50 border-2 border-transparent'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                {cat.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
