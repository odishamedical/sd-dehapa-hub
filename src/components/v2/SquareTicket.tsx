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
    <Link href={href} className="block w-full h-full">
      <div className="bg-white/40 backdrop-blur-2xl border border-white/40 rounded-3xl flex flex-col shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] hover:-translate-y-2 hover:shadow-[0_25px_50px_-10px_rgba(0,20,60,0.2)] transition-all group relative overflow-hidden h-full min-h-[300px]">
        
        {/* Top 50% Image Area */}
        <div className="h-44 w-full relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center shrink-0">
           {imageSrc ? (
             <>
               <img src={imageSrc} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </>
           ) : (
             <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600">
               <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
               <div className="text-7xl drop-shadow-[0_15px_15px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-500 relative z-10">{icon}</div>
             </div>
           )}
           
           {/* Rating Badge Overlay */}
           <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md rounded-full px-2.5 py-1 text-xs font-black text-[#0a2540] flex items-center gap-1 shadow-[0_5px_15px_rgba(0,0,0,0.15)] z-10">
             <span className="text-yellow-500 text-[10px]">★</span> {rating}
           </div>
        </div>

        {/* Bottom 50% Content Area */}
        <div className="flex-1 flex flex-col justify-between bg-white/30 p-5">
          <div>
            <h3 className="font-black text-lg text-[#0a2540] mb-1 tracking-tight line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">{title}</h3>
            <p className="text-[13px] text-slate-600 font-bold tracking-wide">{subtitle}</p>
          </div>
          
          <button className="w-full mt-5 bg-white hover:bg-blue-50 text-blue-600 border border-blue-100 text-[13px] font-black tracking-widest uppercase py-3 rounded-xl shadow-sm hover:shadow-md transition-all group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:text-white group-hover:border-transparent">
            {actionText}
          </button>
        </div>
      </div>
    </Link>
  );
}
