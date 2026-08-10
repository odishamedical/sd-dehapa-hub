"use client";

import React from "react";
import { Search, MapPin, Stethoscope, Building2, CheckCircle } from "lucide-react";
import Link from "next/link";

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
  desktopBgImage = "/v2/hero-desktop.png",
  mobileBgImage = "/v2/hero-mobile.png"
}: V2HeroProps) {
  return (
    <section className="relative z-10 w-full px-4 md:px-8 pt-8 pb-12 flex justify-center">
      
      {/* The Constrained Hero Container */}
      <div className="relative w-full max-w-[1400px] rounded-[40px] overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] border border-white bg-white/40 backdrop-blur-3xl flex flex-col justify-center min-h-[500px]">
        
        {/* Desktop Background Image - Positioned right */}
        <div 
          className="absolute inset-0 z-0 hidden md:block bg-cover bg-right"
          style={{ backgroundImage: `url(${desktopBgImage})` }}
        />
        
        {/* Mobile Background Image */}
        <div 
          className="absolute inset-0 z-0 block md:hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${mobileBgImage})` }}
        />

        {/* Gradient Overlay for Text Readability (Left side white, right side transparent) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent hidden md:block" />
        {/* Mobile Gradient Overlay (Top to bottom) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/95 via-white/80 to-white/40 block md:hidden" />

        {/* Text Content - Left Aligned */}
        <div className="relative z-10 flex flex-col items-start w-full md:w-3/5 lg:w-1/2 p-8 md:p-16 lg:p-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0a2540] tracking-tight mb-4 drop-shadow-sm leading-tight">
            {titleStart} <span className="text-blue-600">{highlight}</span> {titleEnd}
          </h1>
          <p className="text-slate-700 text-lg md:text-xl font-bold max-w-lg mb-10 drop-shadow-sm">
            {subtitle}
          </p>

          {/* Search Bar */}
          {showSearch && (
            <div className="w-full max-w-3xl bg-white/60 backdrop-blur-2xl border-t-[2px] border-l-[2px] border-white border-r border-b border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.8),0_15px_40px_rgba(0,100,200,0.1)] rounded-3xl md:rounded-full p-2 flex flex-col md:flex-row items-center gap-2 transition-all hover:bg-white/80 mb-8">
              
              <div className="flex items-center w-full md:flex-1 px-4 md:px-6 py-2 border-b md:border-b-0 md:border-r border-slate-300">
                <Search className="w-5 h-5 text-blue-600 mr-3" />
                <input 
                  type="text" 
                  placeholder="Search doctors, clinics..." 
                  className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-500 font-bold"
                />
              </div>

              <div className="flex items-center w-full md:flex-1 px-4 md:px-6 py-2">
                <MapPin className="w-5 h-5 text-blue-600 mr-3" />
                <input 
                  type="text" 
                  placeholder="Enter location" 
                  className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-500 font-bold"
                />
              </div>

              <Link href="/v2/search" className="w-full md:w-auto">
                <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 md:py-4 px-8 rounded-2xl md:rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_10px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center text-lg hover:scale-105">
                  Search
                </button>
              </Link>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full">
            <Link href="/join/apply?role=doctor" className="flex-1 min-w-[140px] md:flex-none flex items-center justify-center gap-2 bg-[#0a2540] hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all hover:scale-105 border border-white/20">
              <Stethoscope className="w-4 h-4" /> Join as Doctor
            </Link>
            <Link href="/join/apply?role=hospital" className="flex-1 min-w-[140px] md:flex-none flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all hover:scale-105 border border-white/20">
              <Building2 className="w-4 h-4" /> List Hospital
            </Link>
            <Link href="/claim" className="flex-1 min-w-[140px] md:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all hover:scale-105 border border-white/20">
              <CheckCircle className="w-4 h-4" /> Claim Listing
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
