"use client";

import React from 'react';
import CustomDropdown from '@/components/CustomDropdown';

interface PremiumHeroSearchProps {
  titlePrefix: string;
  titleHighlight: string;
  description: string;
  searchPlaceholder: string;
  search: string;
  setSearch: (val: string) => void;
  searchDistrict: string;
  setSearchDistrict: (val: string) => void;
  searchType: string;
  setSearchType: (val: string) => void;
  uniqueDistricts: string[];
}

export default function PremiumHeroSearch({
  titlePrefix,
  titleHighlight,
  description,
  searchPlaceholder,
  search,
  setSearch,
  searchDistrict,
  setSearchDistrict,
  searchType,
  setSearchType,
  uniqueDistricts
}: PremiumHeroSearchProps) {
  return (
    <div className="pt-10 pb-20 px-6 relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f766e] shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-30">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 drop-shadow-lg tracking-tight md:whitespace-nowrap">
          {titlePrefix} <span className="text-teal-400">{titleHighlight}</span>
        </h1>
        <p className="text-slate-300 text-base md:text-lg mb-8 max-w-5xl mx-auto font-medium md:whitespace-nowrap">
          {description}
        </p>
        
        {/* Floating Expanded Search Bar */}
        <div className="bg-white/95 backdrop-blur-xl border-4 border-white/40 rounded-2xl p-2 shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex flex-col md:flex-row gap-2 max-w-6xl mx-auto transform hover:scale-[1.01] transition-transform duration-300">
           
           {/* Country */}
           <CustomDropdown 
             label="Country"
             options={[{ label: "India", value: "India" }]}
             value="India"
             onChange={() => {}}
             className="hidden lg:block"
           />

           {/* State */}
           <CustomDropdown 
             label="State"
             options={[{ label: "Odisha", value: "Odisha" }]}
             value="Odisha"
             onChange={() => {}}
             className="hidden lg:block"
           />

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
             className="md:w-40"
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
             className="md:w-36"
           />

           {/* Free Text Search */}
           <div className="flex-1 relative px-2 py-1 flex flex-col justify-center">
              <svg className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none pl-12 pr-4 py-3 text-lg text-slate-900 focus:outline-none focus:ring-0 placeholder:text-slate-400 font-bold"
              />
           </div>

           {/* Search Button */}
           <button className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-10 py-4 rounded-xl text-base transition-all shadow-lg hidden md:block border border-teal-600 shrink-0">
             Search
           </button>
        </div>
      </div>
    </div>
  );
}
