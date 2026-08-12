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
      <div className="bg-white/40 backdrop-blur-2xl border border-white/40 rounded-3xl p-1 flex flex-col shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] hover:-translate-y-2 hover:shadow-[0_25px_50px_-10px_rgba(0,20,60,0.2)] transition-all group relative overflow-hidden min-h-[380px] h-full">
        
        {/* The Edge-to-Edge Hero Background */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
        
        {/* Gradient Overlay so text is readable */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Rating Badge (Top Right) */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-2.5 py-1 text-xs font-bold text-white flex items-center gap-1 border border-white/30 shadow-sm z-10">
          <span className="text-yellow-400">★</span> {rating}
        </div>

        {/* Content Area (Forced to bottom) */}
        <div className="relative z-10 flex flex-col justify-end h-full p-5 pt-32">
          
          <h3 className="font-black text-2xl text-white mb-1 tracking-tight drop-shadow-md">{title}</h3>
          <p className="text-sm text-white/80 font-medium tracking-wide mb-4 drop-shadow-md">{subtitle}</p>
          
          {/* Action Button */}
          <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white text-sm font-bold py-3 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-colors">
            {actionText}
          </button>
        </div>
      </div>
    </Link>
  );
}
