"use client";

import React from "react";
import Link from "next/link";

interface PortraitTicketProps {
  title: string;
  subtitle: string;
  rating: string;
  imageSrc: string; // Since it's a hero photo, we use an image or gradient
  href: string;
  actionText: string;
}

export default function PortraitTicket({ title, subtitle, rating, imageSrc, href, actionText }: PortraitTicketProps) {
  return (
    <Link href={href} className="block w-full h-full">
      <div className="bg-white/40 backdrop-blur-2xl border border-white/40 rounded-3xl flex flex-col shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] hover:-translate-y-2 hover:shadow-[0_25px_50px_-10px_rgba(0,20,60,0.2)] transition-all group relative overflow-hidden min-h-[420px] h-full">
        
        {/* The Edge-to-Edge Hero Background */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
        
        {/* Gradient Overlay (Starts lower to keep top clear) */}
        <div className="absolute inset-x-0 bottom-0 top-[40%] z-0 bg-gradient-to-t from-[#0a2540] via-[#0a2540]/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

        {/* Subtle top gradient for badge contrast */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent opacity-60 z-0" />

        {/* Rating Badge (Top Right) */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-black text-white flex items-center gap-1 border border-white/30 shadow-[0_5px_15px_rgba(0,0,0,0.2)] z-10">
          <span className="text-yellow-400 text-sm">★</span> {rating}
        </div>

        {/* Content Area (Forced to bottom) */}
        <div className="relative z-10 flex flex-col justify-end h-full p-6 pt-32">
          
          <h3 className="font-black text-2xl sm:text-3xl text-white mb-2 tracking-tight drop-shadow-xl leading-tight group-hover:text-cyan-300 transition-colors">{title}</h3>
          <p className="text-[13px] sm:text-sm text-cyan-100 font-bold tracking-wide mb-6 drop-shadow-lg">{subtitle}</p>
          
          {/* Action Button */}
          <button className="w-full bg-white/10 hover:bg-white text-white hover:text-[#0a2540] backdrop-blur-md border border-white/30 font-black uppercase tracking-widest text-[11px] sm:text-xs py-4 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)] transition-all">
            {actionText}
          </button>
        </div>
      </div>
    </Link>
  );
}
