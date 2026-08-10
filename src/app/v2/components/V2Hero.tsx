"use client";

import React from "react";
import { Search, MapPin, Stethoscope, Building2, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  desktopBgImage = "/v2/v2-heropc.png",
  mobileBgImage = "/v2/hero-mobile.png"
}: V2HeroProps) {
  return (
    <section className="relative z-10 w-full px-4 md:px-8 pt-8 pb-12 flex justify-center">
      
      {/* The Constrained Widescreen Hero Container (21:9) */}
      <div className="relative w-full max-w-[1600px] aspect-auto md:aspect-[21/9] rounded-[40px] overflow-hidden shadow-[0_20px_50px_-10px_rgba(0,30,80,0.2)] border border-white/60 bg-slate-50 flex flex-col justify-center">
        
        {/* Desktop Background Image - Next.js Optimized */}
        <div className="absolute inset-0 z-0 hidden md:block">
          <Image 
            src={desktopBgImage}
            alt="Medical Hero Background"
            fill
            priority
            quality={90}
            className="object-cover object-center"
          />
        </div>
        
        {/* Mobile Background Image - Next.js Optimized */}
        <div className="absolute inset-0 z-0 block md:hidden">
          <Image 
            src={mobileBgImage}
            alt="Medical Hero Background Mobile"
            fill
            priority
            quality={90}
            className="object-cover object-center"
          />
        </div>

        {/* Very subtle gradient ONLY to guarantee text readability, without ruining the image's native glass effect */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent hidden md:block" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/90 via-white/70 to-transparent block md:hidden" />

        {/* Text Content - strictly 70% on left */}
        <div className="relative z-10 flex flex-col items-start w-full md:w-[70%] p-8 md:p-12 lg:p-20">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-[#0a2540] tracking-tight mb-4 md:mb-6 drop-shadow-sm leading-tight">
            {titleStart} <span className="text-blue-600">{highlight}</span> {titleEnd}
          </h1>
          <p className="text-slate-700 text-lg md:text-2xl font-bold max-w-2xl mb-8 md:mb-12 drop-shadow-sm">
            {subtitle}
          </p>

          {/* Search Bar */}
          {showSearch && (
            <div className="w-full max-w-4xl bg-white/70 backdrop-blur-3xl border-t-[2px] border-l-[2px] border-white border-r border-b border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.8),0_15px_40px_rgba(0,100,200,0.1)] rounded-3xl md:rounded-full p-2 md:p-3 flex flex-col md:flex-row items-center gap-2 transition-all hover:bg-white/90 mb-8 md:mb-10">
              
              <div className="flex items-center w-full md:flex-1 px-4 md:px-6 py-3 border-b md:border-b-0 md:border-r border-slate-300">
                <Search className="w-6 h-6 text-blue-600 mr-3 md:mr-4" />
                <input 
                  type="text" 
                  placeholder="Search doctors, clinics..." 
                  className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-500 font-bold text-lg"
                />
              </div>

              <div className="flex items-center w-full md:flex-1 px-4 md:px-6 py-3">
                <MapPin className="w-6 h-6 text-blue-600 mr-3 md:mr-4" />
                <input 
                  type="text" 
                  placeholder="Enter location" 
                  className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-500 font-bold text-lg"
                />
              </div>

              <Link href="/v2/search" className="w-full md:w-auto">
                <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-2xl md:rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_10px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center text-xl hover:scale-105">
                  Search
                </button>
              </Link>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 md:gap-5 w-full">
            <Link href="/join/apply?role=doctor" className="flex-1 min-w-[160px] md:flex-none flex items-center justify-center gap-3 bg-[#0a2540] hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all hover:scale-105 border border-white/20 text-lg">
              <Stethoscope className="w-5 h-5" /> Join as Doctor
            </Link>
            <Link href="/join/apply?role=hospital" className="flex-1 min-w-[160px] md:flex-none flex items-center justify-center gap-3 bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all hover:scale-105 border border-white/20 text-lg">
              <Building2 className="w-5 h-5" /> List Hospital
            </Link>
            <Link href="/claim" className="flex-1 min-w-[160px] md:flex-none flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all hover:scale-105 border border-white/20 text-lg">
              <CheckCircle className="w-5 h-5" /> Claim Listing
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
