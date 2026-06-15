"use client";

import React, { useState } from 'react';
import Link from 'next/link';

// Mock Data
const MOCK_RESULTS = [
  { id: "doc_1", type: "doctor", name: "Dr. A. K. Sharma", subtitle: "Cardiologist", location: "Sambalpur, Odisha", rating: 4.8, experience: "15 Yrs" },
  { id: "hosp_1", type: "hospital", name: "Apollo Super Specialty", subtitle: "NABH Accredited", location: "Bhubaneswar, Odisha", rating: 4.5, beds: "250 Beds" },
  { id: "lab_1", type: "lab", name: "SRL Diagnostics", subtitle: "NABL Certified", location: "Cuttack, Odisha", rating: 4.7, tests: "200+ Tests" },
  { id: "rx_1", type: "pharmacy", name: "LifeCare Pharmacy", subtitle: "Retail & 24/7", location: "Jharsuguda, Odisha", rating: 4.9, delivery: "Free Delivery" },
  { id: "amb_1", type: "ambulance", name: "Speed Rescue EMS", subtitle: "ALS/BLS Fleet", location: "Rourkela, Odisha", rating: 4.6, response: "10 Min ETA" }
];

export default function SearchDirectory() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [district, setDistrict] = useState("");

  const filteredResults = MOCK_RESULTS.filter(item => {
    if (activeCategory !== "all" && item.type !== activeCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (district && !item.location.toLowerCase().includes(district.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-tenant-accent/30">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-tenant-accent flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)]">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             </div>
             <div>
               <span className="font-serif font-bold text-xl tracking-widest uppercase">Global <span className="text-tenant-accent">Directory</span></span>
               <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Dehapa Health Hub</p>
             </div>
          </Link>

          <Link href="/portal" className="text-sm font-bold text-slate-600 hover:text-tenant-accent transition-colors">
            Back to Portal
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Search Engine Hero */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 mb-12 shadow-xl relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-tenant-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">Find exactly what you need, <span className="text-tenant-accent">instantly.</span></h1>
            <p className="text-slate-400 mb-8">Search the entire Dehapa Medical Ecosystem for doctors, hospitals, labs, and more.</p>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, specialty, or hospital..." 
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-4 focus:border-tenant-accent outline-none transition-colors"
                />
              </div>
              <div className="md:w-64 relative">
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                <input 
                  type="text" 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Enter District/City" 
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-4 focus:border-tenant-accent outline-none transition-colors"
                />
              </div>
              <button className="bg-tenant-accent hover:bg-teal-400 text-slate-900 font-bold px-8 py-4 rounded-xl transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          {[
            { id: "all", label: "All Results", icon: "🌐" },
            { id: "doctor", label: "Doctors", icon: "👨‍⚕️" },
            { id: "hospital", label: "Hospitals & Clinics", icon: "🏥" },
            { id: "lab", label: "Diagnostic Labs", icon: "🔬" },
            { id: "pharmacy", label: "Pharmacies", icon: "💊" },
            { id: "ambulance", label: "Ambulances", icon: "🚑" },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat.id 
                  ? "bg-slate-900 text-white shadow-md scale-105" 
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Results Found</h3>
              <p className="text-slate-500">Try adjusting your search terms or location.</p>
            </div>
          ) : (
            filteredResults.map(result => (
              <div key={result.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-tenant-accent/50 transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl shadow-inner">
                    {result.type === 'doctor' && '👨‍⚕️'}
                    {result.type === 'hospital' && '🏥'}
                    {result.type === 'lab' && '🔬'}
                    {result.type === 'pharmacy' && '💊'}
                    {result.type === 'ambulance' && '🚑'}
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    {result.rating}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-tenant-accent transition-colors">{result.name}</h3>
                <p className="text-sm font-semibold text-tenant-accent mb-3">{result.subtitle}</p>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                  {result.location}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {result.experience || result.beds || result.tests || result.delivery || result.response}
                  </span>
                  <button className="text-sm font-bold text-slate-900 group-hover:text-tenant-accent flex items-center gap-1 transition-colors">
                    View Profile
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}
