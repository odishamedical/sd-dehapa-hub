"use client";

import React, { useState } from "react";
import { Search, MapPin, Stethoscope, Building2, CheckCircle, ChevronDown, Activity } from "lucide-react";
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

const CATEGORIES = [
  { id: 'all', label: 'All Services', icon: Activity },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope },
  { id: 'hospital', label: 'Hospital', icon: Building2 },
  { id: 'lab', label: 'Lab', icon: Activity },
  { id: 'pharmacy', label: 'Pharmacy', icon: Activity },
  { id: 'ambulance', label: 'Ambulance', icon: Activity },
];

export default function V2Hero({ 
  titleStart, 
  highlight, 
  titleEnd, 
  subtitle, 
  showSearch = true,
  desktopBgImage = "/v2/v2-heropc.png",
  mobileBgImage = "/v2/hero-mobile.png"
}: V2HeroProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  return (
    <section className="relative z-10 w-full px-4 md:px-8 pt-0 pb-12 flex justify-center">
      
      {/* The Constrained Widescreen Hero Container (21:9 PC) & Auto-height Content (Mobile) */}
      {/* Removed overflow-hidden from here so the dropdown menu doesn't get clipped */}
      <div className="relative w-full max-w-[1600px] aspect-auto md:aspect-[21/9] rounded-[40px] shadow-[0_20px_50px_-10px_rgba(0,30,80,0.2)] border border-white/60 flex flex-col md:justify-center bg-white/40 md:bg-transparent backdrop-blur-md md:backdrop-blur-none">
        
        {/* Mobile Inline Image (Visible ONLY on mobile, sits at the top of the card) */}
        <div className="w-full relative aspect-video block md:hidden rounded-t-[40px] overflow-hidden shrink-0">
          <Image 
            src={mobileBgImage}
            alt="Medical Hero Background Mobile"
            fill
            priority
            quality={90}
            className="object-cover object-center"
          />
        </div>

        {/* PC Background Layer (Visible ONLY on PC) */}
        <div className="absolute inset-0 z-0 rounded-[40px] overflow-hidden bg-slate-50 hidden md:block">
          <div className="absolute inset-0 z-0">
            <Image 
              src={desktopBgImage}
              alt="Medical Hero Background"
              fill
              priority
              quality={90}
              className="object-cover object-center"
            />
          </div>
          {/* PC Gradient: Left-to-Right to hide empty hallway */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />
        </div>

        {/* Text Content - strictly 70% on left (PC), 100% flow (Mobile) */}
        <div className="relative z-10 flex flex-col items-start w-full md:w-[70%] p-6 pt-8 md:p-12 lg:p-20 overflow-y-auto custom-scrollbar max-h-full">
          <h1 className="shrink-0 text-4xl md:text-5xl lg:text-7xl font-black text-[#0a2540] tracking-tight mb-4 md:mb-6 drop-shadow-sm leading-tight">
            {titleStart} <span className="text-blue-600">{highlight}</span> {titleEnd}
          </h1>
          <p className="shrink-0 text-slate-700 text-lg md:text-2xl font-bold max-w-2xl mb-6 md:mb-12 drop-shadow-sm">
            {subtitle}
          </p>

          {/* Search Bar */}
          {showSearch && (
            <div className="shrink-0 w-full max-w-5xl bg-white/70 backdrop-blur-3xl border-t-[2px] border-l-[2px] border-white border-r border-b border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.8),0_15px_40px_rgba(0,100,200,0.1)] rounded-3xl md:rounded-full p-2 md:p-3 flex flex-col md:flex-row items-center gap-2 transition-all hover:bg-white/90 mb-6 md:mb-10 relative">
              
              {/* Category Dropdown (Glassmorphism) */}
              <div className="relative w-full md:w-auto md:min-w-[180px] border-b md:border-b-0 md:border-r border-slate-300">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 md:px-6 py-3 text-slate-800 font-bold text-lg outline-none"
                >
                  <span className="flex items-center gap-2 text-blue-600">
                    <selectedCategory.icon className="w-5 h-5" />
                    <span className="text-slate-800">{selectedCategory.label}</span>
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Glassmorphism Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-[120%] left-0 w-full min-w-[200px] bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-2xl overflow-hidden z-50 py-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-6 py-3 text-left font-bold transition-all hover:bg-white/80 ${selectedCategory.id === cat.id ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'}`}
                      >
                        <cat.icon className={`w-5 h-5 ${selectedCategory.id === cat.id ? 'text-blue-600' : 'text-slate-400'}`} />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Query Input */}
              <div className="flex items-center w-full md:flex-1 px-4 md:px-6 py-3 border-b md:border-b-0 md:border-r border-slate-300">
                <Search className="w-6 h-6 text-slate-400 mr-3 md:mr-4 hidden md:block" />
                <input 
                  type="text" 
                  placeholder="Search doctors, clinics..." 
                  className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-500 font-bold text-lg"
                />
              </div>

              {/* Location Input */}
              <div className="flex items-center w-full md:flex-1 px-4 md:px-6 py-3">
                <MapPin className="w-6 h-6 text-slate-400 mr-3 md:mr-4" />
                <input 
                  type="text" 
                  placeholder="Enter location" 
                  className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-500 font-bold text-lg"
                />
              </div>

              {/* Search Button */}
              <Link href={`/search?category=${selectedCategory.id}`} className="w-full md:w-auto mt-2 md:mt-0">
                <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-2xl md:rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_10px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center text-xl hover:scale-105">
                  Search
                </button>
              </Link>
            </div>
          )}

          {/* Quick Action Buttons (2x1 Grid on Mobile, Row on PC) */}
          <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-3 w-full">
            <Link href="/join?role=doctor" className="col-span-1 md:flex-none flex items-center justify-center gap-2 bg-[#0a2540] hover:bg-slate-800 text-white font-bold py-4 px-2 md:px-8 rounded-2xl shadow-lg transition-all hover:scale-105 border border-white/20 text-sm md:text-lg">
              <Stethoscope className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden sm:inline">Join as </span>Doctor
            </Link>
            <Link href="/join?role=hospital" className="col-span-1 md:flex-none flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-2 md:px-8 rounded-2xl shadow-lg transition-all hover:scale-105 border border-white/20 text-sm md:text-lg">
              <Building2 className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden sm:inline">List </span>Hospital
            </Link>
            <Link href="/claim" className="col-span-2 md:col-span-1 md:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-2 md:px-8 rounded-2xl shadow-lg transition-all hover:scale-105 border border-white/20 text-sm md:text-lg">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> Claim Listing
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
