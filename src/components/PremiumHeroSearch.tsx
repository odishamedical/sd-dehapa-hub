"use client";

import React from 'react';
import CustomDropdown from '@/components/CustomDropdown';
import Image from 'next/image';

interface PremiumHeroSearchProps {
  titlePrefix: string;
  titleHighlight: string;
  description: string;
  searchPlaceholder: string;
  search: string;
  setSearch: (val: string) => void;
  searchCountry: string;
  setSearchCountry: (val: string) => void;
  uniqueCountries: string[];
  searchState: string;
  setSearchState: (val: string) => void;
  uniqueStates: string[];
  searchDistrict: string;
  setSearchDistrict: (val: string) => void;
  searchType: string;
  setSearchType: (val: string) => void;
  uniqueDistricts: string[];
  bgImage?: string;
}

export default function PremiumHeroSearch({
  titlePrefix,
  titleHighlight,
  description,
  searchPlaceholder,
  search,
  setSearch,
  searchCountry,
  setSearchCountry,
  uniqueCountries,
  searchState,
  setSearchState,
  uniqueStates,
  searchDistrict,
  setSearchDistrict,
  searchType,
  setSearchType,
  uniqueDistricts,
  bgImage
}: PremiumHeroSearchProps) {
  return (
    <div className="pt-10 pb-20 px-6 relative bg-[#0a1229] shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-30 overflow-hidden">
      {bgImage && (
        <>
          <Image 
            src={bgImage} 
            alt="Medical Hero Background" 
            fill 
            className="object-cover absolute inset-0 z-0" 
            priority={true}
            quality={85}
          />
          {/* Dark gradient overlay so text remains readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1229] via-[#0a1229]/80 to-[#0a1229]/50 z-0"></div>
          <div className="absolute inset-0 bg-cyan-900/10 mix-blend-color z-0"></div>
        </>
      )}
      {!bgImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f766e] opacity-80 z-0"></div>
      )}
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h1 className="text-2xl md:text-5xl font-serif font-black text-white mb-3 md:mb-4 drop-shadow-lg tracking-tight md:whitespace-nowrap">
          {titlePrefix} <span className="text-cyan-400">{titleHighlight}</span>
        </h1>
        <p className="text-slate-300 text-sm md:text-lg mb-6 md:mb-8 max-w-5xl mx-auto font-medium md:whitespace-nowrap">
          {description}
        </p>
        
        {/* Floating Expanded Search Bar */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(34,211,238,0.1)] flex flex-col md:flex-row gap-2 max-w-6xl mx-auto transform hover:scale-[1.01] transition-transform duration-300">
           
           {/* Country */}
           <CustomDropdown 
             label="Country"
             placeholder="All Countries"
             options={[
               { label: "All Countries", value: "" },
               ...uniqueCountries.map(c => ({ label: c, value: c }))
             ]}
             value={searchCountry}
             onChange={setSearchCountry}
             className="hidden lg:block md:w-36"
           />

           {/* State */}
           <CustomDropdown 
             label="State"
             placeholder="All States"
             options={[
               { label: "All States", value: "" },
               ...uniqueStates.map(s => ({ label: s, value: s }))
             ]}
             value={searchState}
             onChange={setSearchState}
             className="hidden lg:block md:w-36"
           />

           {/* Mobile Grid for District & Type */}
           <div className="flex gap-2 w-full md:w-auto">
             {/* District */}
             <CustomDropdown 
               label="District"
               placeholder="All Districts"
               options={[
                 { label: "All Districts", value: "" },
                 ...uniqueDistricts.map(d => ({ label: d as string, value: d as string }))
               ]}
               value={searchDistrict}
               onChange={setSearchDistrict}
               className="flex-1 md:flex-none md:w-40"
             />

             {/* Type */}
             <CustomDropdown 
               label="Type"
               placeholder="All Types"
               options={[
                 { label: "All Types", value: "" },
                 { label: "Doctors", value: "doctors" },
                 { label: "Hospitals", value: "hospitals" },
                 { label: "Clinics", value: "clinics" },
                 { label: "Labs", value: "labs" }
               ]}
               value={searchType}
               onChange={setSearchType}
               className="flex-1 md:flex-none md:w-36"
             />
           </div>

           {/* Free Text Search */}
           <div className="flex-1 relative px-2 py-1 flex flex-col justify-center">
              <svg className="w-6 h-6 text-cyan-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none pl-12 pr-4 py-3 text-lg text-white focus:outline-none focus:ring-0 placeholder:text-slate-500 font-bold"
              />
           </div>

           {/* Search Button */}
           <button className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold px-10 py-4 rounded-xl text-base transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hidden md:block shrink-0 border border-cyan-400/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]">
             Search
           </button>
        </div>
      </div>
    </div>
  );
}
