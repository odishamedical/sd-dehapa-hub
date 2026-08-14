"use client";

import React from "react";
import Link from "next/link";

interface SquareTicketProps {
  title: string;
  subtitle: string;
  rating: string;
  icon: string;
  imageSrc?: string;
  href: string;
  actionText: string;
}

export default function SquareTicket({ title, subtitle, rating, icon, imageSrc, href, actionText }: SquareTicketProps) {
  return (
    <Link href={href} className="block w-full">
      <div className="bg-white/40 backdrop-blur-2xl border border-white/40 rounded-3xl p-1 flex flex-col shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] hover:-translate-y-2 hover:shadow-[0_25px_50px_-10px_rgba(0,20,60,0.2)] transition-all group relative overflow-hidden h-full min-h-[260px]">
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white/40 backdrop-blur-md rounded-full px-2.5 py-1 text-xs font-bold text-[#0a2540] flex items-center gap-1 border border-white/40 shadow-sm z-10">
          <span className="text-yellow-500">★</span> {rating}
        </div>

        {/* Image/Icon Area */}
        <div className="flex-1 flex items-center justify-center p-6 rounded-t-3xl bg-white/10 relative overflow-hidden">
           {imageSrc ? (
             <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/50 shadow-lg group-hover:scale-110 transition-transform bg-white">
               <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
             </div>
           ) : (
             <div className="text-7xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.15)] group-hover:scale-110 transition-transform">{icon}</div>
           )}
        </div>

        {/* Content Area with Divider */}
        <div className="w-full bg-white/20 pt-4 pb-4 px-5 border-t border-white/20 rounded-b-3xl">
          <h3 className="font-black text-lg text-[#0a2540] mb-0.5 tracking-tight truncate">{title}</h3>
          <p className="text-[13px] text-slate-600 font-medium tracking-wide mb-3">{subtitle}</p>
          
          {/* Action Button */}
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 rounded-xl shadow-md transition-colors">
            {actionText}
          </button>
        </div>
      </div>
    </Link>
  );
}
