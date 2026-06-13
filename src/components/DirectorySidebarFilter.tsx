"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface DirectorySidebarFilterProps {
  categoryName: string;
  specialtyOptions?: string[];
}

function DirectorySidebarFilterContent({ categoryName, specialtyOptions = [] }: DirectorySidebarFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Geographical State
  const [state, setState] = useState(searchParams?.get("state") || "Odisha");
  const [district, setDistrict] = useState(searchParams?.get("district") || "");
  const [block, setBlock] = useState(searchParams?.get("block") || "");
  const [village, setVillage] = useState(searchParams?.get("village") || "");
  
  // Specific Filter State
  const [specialty, setSpecialty] = useState(searchParams?.get("specialty") || "");

  const handleSearch = () => {
    let url = `/${categoryName.toLowerCase()}?state=${encodeURIComponent(state)}`;
    if (district) url += `&district=${encodeURIComponent(district)}`;
    if (block) url += `&block=${encodeURIComponent(block)}`;
    if (village) url += `&village=${encodeURIComponent(village)}`;
    if (specialty) url += `&specialty=${encodeURIComponent(specialty)}`;
    
    router.push(url);
  };

  const clearAllFilters = () => {
    setState("Odisha");
    setDistrict("");
    setBlock("");
    setVillage("");
    setSpecialty("");
    router.push(`/${categoryName.toLowerCase()}`);
  };

  return (
    <aside className="w-full h-full bg-white border border-slate-200 rounded-2xl p-5 space-y-6 flex flex-col shadow-lg">
      
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-900">
          <svg className="w-4 h-4 text-tenant-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <span>Search Filters</span>
        </span>
        <button 
          onClick={clearAllFilters}
          className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-tenant-accent transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4 flex-1">
        
        {/* Category Specific Filter (e.g. Specialty for Doctors) */}
        {specialtyOptions.length > 0 && (
          <div className="space-y-1.5 pb-4 border-b border-slate-100">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Filter by Specialty</label>
            <select 
              value={specialty} 
              onChange={e => setSpecialty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl outline-none focus:border-tenant-accent focus:ring-1 focus:ring-tenant-accent transition-all appearance-none cursor-pointer"
            >
              <option value="">All Specialties</option>
              {specialtyOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* Geographical Filters */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">State</label>
          <select 
            value={state} 
            onChange={e => {
              setState(e.target.value);
              setDistrict("");
            }}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl outline-none focus:border-tenant-accent focus:ring-1 focus:ring-tenant-accent transition-all appearance-none cursor-pointer"
          >
            <option value="Odisha">Odisha</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">District</label>
          <select 
            value={district} 
            onChange={e => {
              setDistrict(e.target.value);
              setBlock("");
            }}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl outline-none focus:border-tenant-accent focus:ring-1 focus:ring-tenant-accent transition-all appearance-none cursor-pointer"
          >
            <option value="">All Districts</option>
            <option value="Khordha">Khordha</option>
            <option value="Cuttack">Cuttack</option>
            <option value="Puri">Puri</option>
            <option value="Ganjam">Ganjam</option>
            <option value="Sambalpur">Sambalpur</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Town / Block (Optional)</label>
          <input 
            type="text" 
            value={block} 
            onChange={e => setBlock(e.target.value)}
            placeholder="Enter Town/Block"
            disabled={!district}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl outline-none focus:border-tenant-accent focus:ring-1 focus:ring-tenant-accent transition-all disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Village / Locality</label>
          <input 
            type="text" 
            value={village} 
            onChange={e => setVillage(e.target.value)}
            placeholder="Enter Locality"
            disabled={!state}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl outline-none focus:border-tenant-accent focus:ring-1 focus:ring-tenant-accent transition-all disabled:opacity-50"
          />
        </div>

      </div>

      <button 
        onClick={handleSearch}
        className="w-full py-3 mt-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-800 transition-all bg-tenant-accent shadow-[0_4px_16px_var(--tenant-accent-glow)] hover:scale-[1.02] active:scale-[0.98]"
      >
        Apply Filters
      </button>

    </aside>
  );
}

export default function DirectorySidebarFilter(props: DirectorySidebarFilterProps) {
  return (
    <Suspense fallback={<div className="w-full h-full bg-slate-50 border border-slate-200 rounded-2xl p-5 animate-pulse">Loading filters...</div>}>
      <DirectorySidebarFilterContent {...props} />
    </Suspense>
  );
}
