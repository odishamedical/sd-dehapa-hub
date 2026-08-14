"use client";

import React from "react";
import Link from "next/link";

interface WideTicketProps {
  title: string;
  subtitle: string;
  rating: string;
  icon: string;
  imageSrc?: string;
  href: string;
  actionText: string;
  stats?: string;
}

export default function WideTicket({ title, subtitle, rating, icon, imageSrc, href, actionText, stats }: WideTicketProps) {
  return (
    <Link href={href} className="block w-full h-full">
      <div className="bg-white/40 backdrop-blur-2xl border border-white/40 rounded-3xl flex flex-col md:flex-row shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] hover:-translate-y-2 hover:shadow-[0_25px_50px_-10px_rgba(0,20,60,0.2)] transition-all group relative overflow-hidden h-full">
        
        {/* Image Area: 50% Top on Mobile, 40% Left on Desktop */}
        <div className="w-full md:w-[45%] h-56 md:h-auto relative overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-white/30">
           {imageSrc ? (
             <>
               <img src={imageSrc} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </>
           ) : (
             <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                <div className="text-8xl drop-shadow-[0_15px_15px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-500 relative z-10">{icon}</div>
             </div>
           )}
           
           {/* Mobile-only Rating Badge over image */}
           <div className="absolute top-4 right-4 md:hidden bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-black text-[#0a2540] flex items-center gap-1 shadow-[0_5px_15px_rgba(0,0,0,0.15)] z-10">
             <span className="text-yellow-500 text-[10px]">★</span> {rating}
           </div>
        </div>

        {/* Content Area */}
        <div className="w-full md:w-[55%] bg-white/30 p-6 sm:p-8 flex flex-col justify-between relative">
          
          {/* Desktop-only Rating Badge */}
          <div className="hidden md:flex absolute top-6 right-6 bg-white/80 backdrop-blur-md rounded-full px-3 py-1.5 text-sm font-black text-[#0a2540] items-center gap-1 shadow-sm">
             <span className="text-yellow-500 text-xs">★</span> {rating}
          </div>

          <div className="pr-0 md:pr-16 mb-6 md:mb-8">
            <h3 className="font-black text-2xl text-[#0a2540] mb-2 tracking-tight group-hover:text-blue-700 transition-colors line-clamp-2">{title}</h3>
            <p className="text-[15px] text-slate-600 font-bold tracking-wide">{subtitle}</p>
            {stats && (
              <div className="mt-4 inline-flex items-center bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-lg">
                <p className="text-xs font-black uppercase tracking-widest text-teal-600">{stats}</p>
              </div>
            )}
          </div>
          
          {/* Action Button */}
          <div className="flex justify-start md:justify-end mt-auto">
            <button className="w-full md:w-auto bg-white hover:bg-blue-50 text-blue-600 border border-blue-100 text-[13px] font-black tracking-widest uppercase py-3.5 px-8 rounded-xl shadow-sm hover:shadow-md transition-all group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:text-white group-hover:border-transparent">
              {actionText}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
