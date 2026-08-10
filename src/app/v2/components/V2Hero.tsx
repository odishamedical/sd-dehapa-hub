"use client";

import React from "react";
import { Search, MapPin } from "lucide-react";

interface V2HeroProps {
  titleStart: string;
  highlight?: string;
  titleEnd?: string;
  subtitle: string;
  showSearch?: boolean;
  desktopBgImage?: string;
  mobileBgImage?: string;
}

export default function V2Hero({ 
  titleStart, 
  highlight, 
  titleEnd, 
  subtitle, 
  showSearch = true,
  desktopBgImage = "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=2000&h=600", // Default Medical abstract
  mobileBgImage = "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=800&h=800"
}: V2HeroProps) {
  return (
    <section className="relative z-10 w-full px-4 md:px-8 pt-8 pb-12 flex justify-center">
      
      {/* The Constrained Hero Container */}
      <div className="relative w-full max-w-7xl rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,100,200,0.15)] border border-white/50 bg-white/20 backdrop-blur-md flex flex-col items-center justify-center py-20 px-4">
        
        {/* Desktop Background Image (Hidden on mobile) */}
        <div 
          className="absolute inset-0 z-0 hidden md:block bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url(${desktopBgImage})` }}
        />
        
        {/* Mobile Background Image (Hidden on desktop) */}
        <div 
          className="absolute inset-0 z-0 block md:hidden bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url(${mobileBgImage})` }}
        />

        {/* Text Content */}
        <div className="relative z-10 flex flex-col items-center w-full">
          <h1 className="text-4xl md:text-6xl font-black text-[#0a2540] text-center tracking-tight mb-4 drop-shadow-md">
            {titleStart} {highlight && <span className="text-blue-600">{highlight}</span>} {titleEnd}
          </h1>
          <p className="text-slate-700 text-lg md:text-xl font-bold text-center max-w-2xl mb-10 drop-shadow-sm">
            {subtitle}
          </p>

          {/* Optional Glassmorphism Search Bar */}
          {showSearch && (
            <div className="w-full max-w-4xl bg-white/10 backdrop-blur-3xl border-t-[2px] border-l-[2px] border-white/70 border-r border-b border-white/20 shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),0_15px_40px_rgba(0,100,200,0.2)] rounded-full p-2 flex flex-col md:flex-row items-center gap-2 transition-all hover:bg-white/20">
              
              <div className="flex items-center w-full md:flex-1 px-6 py-2 border-b md:border-b-0 md:border-r border-slate-400/20">
                <Search className="w-5 h-5 text-slate-500 mr-3" />
                <input 
                  type="text" 
                  placeholder="Search doctors, clinics, specialties..." 
                  className="w-full bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-500 font-medium"
                />
              </div>

              <div className="flex items-center w-full md:flex-1 px-6 py-2">
                <MapPin className="w-5 h-5 text-slate-500 mr-3" />
                <input 
                  type="text" 
                  placeholder="Enter location" 
                  className="w-full bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-500 font-medium"
                />
              </div>

              <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_10px_rgba(37,99,235,0.3)] transition-all">
                Search
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
