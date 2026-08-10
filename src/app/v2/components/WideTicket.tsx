"use client";

import React from "react";
import Link from "next/link";

interface WideTicketProps {
  title: string;
  subtitle: string;
  rating: string;
  icon: string;
  href: string;
  actionText: string;
  stats?: string;
}

export default function WideTicket({ title, subtitle, rating, icon, href, actionText, stats }: WideTicketProps) {
  return (
    <Link href={href} className="block w-full">
      <div className="bg-white/40 backdrop-blur-2xl border border-white rounded-3xl p-1 flex flex-col md:flex-row shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] hover:-translate-y-2 hover:shadow-[0_25px_50px_-10px_rgba(0,20,60,0.2)] transition-all group relative overflow-hidden">
        
        {/* Left Side: Image/Icon */}
        <div className="md:w-1/3 min-h-[160px] flex items-center justify-center p-6 bg-gradient-to-r from-transparent to-white/10 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none md:border-r border-white/30 relative">
           <div className="text-8xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.15)] group-hover:scale-110 transition-transform">{icon}</div>
        </div>

        {/* Right Side: Content Area */}
        <div className="md:w-2/3 bg-gradient-to-b md:bg-gradient-to-r from-white/30 to-white/60 p-6 rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-black text-2xl text-[#0a2540] mb-1 tracking-tight">{title}</h3>
              <p className="text-sm text-slate-600 font-medium tracking-wide">{subtitle}</p>
              {stats && <p className="text-xs text-slate-500 mt-2">{stats}</p>}
            </div>
            
            {/* Rating Badge */}
            <div className="bg-white/40 backdrop-blur-md rounded-full px-3 py-1.5 text-sm font-bold text-slate-700 flex items-center gap-1 border border-white/60 shadow-sm">
              <span className="text-yellow-500">★</span> {rating}
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex justify-end mt-4 md:mt-0">
            <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-8 rounded-xl shadow-md transition-colors">
              {actionText}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
