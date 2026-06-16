"use client";

import React from 'react';
import Link from 'next/link';

export default function DirectoryHub() {
  const states = [
    { name: "Odisha", count: 1245 },
    { name: "West Bengal", count: 890 },
    { name: "Chhattisgarh", count: 450 },
    { name: "Andhra Pradesh", count: 670 }
  ];

  const specialties = [
    "Cardiologist", "Neurologist", "Orthopedic Surgeon", "Pediatrician", "Dermatologist",
    "General Physician", "Dentist", "Gynecologist", "Psychiatrist", "Ophthalmologist"
  ];

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
             </div>
          </Link>
          <Link href="/search" className="text-sm font-bold text-slate-600 hover:text-tenant-accent transition-colors">
            Interactive Search
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Healthcare Directory Index</h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Browse the comprehensive Dehapa Health network. Find top-rated, verified doctors, clinics, and diagnostic labs organized by location and medical specialty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Browse By Location */}
          <section className="col-span-1 lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              Browse by State
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {states.map(state => (
                <Link href={`/search?loc=${state.name}`} key={state.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-tenant-accent hover:bg-teal-50 transition-colors group">
                  <span className="font-bold text-slate-700 group-hover:text-teal-900">{state.name}</span>
                  <span className="text-xs font-bold bg-white text-slate-500 px-2.5 py-1 rounded-lg border border-slate-200">{state.count} Providers</span>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">Popular Districts in Odisha</h3>
              <div className="flex flex-wrap gap-2">
                {["Khordha", "Cuttack", "Sambalpur", "Ganjam", "Sundargarh", "Balasore", "Puri"].map(dist => (
                  <Link href={`/search?loc=${dist}`} key={dist} className="text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full hover:bg-tenant-accent hover:text-white hover:border-tenant-accent transition-all">
                    {dist}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Browse By Specialty */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              Top Specialties
            </h2>
            <div className="flex flex-col gap-2">
              {specialties.map(spec => (
                <Link href={`/search?q=${spec}`} key={spec} className="flex items-center gap-3 text-slate-600 hover:text-tenant-accent py-2 border-b border-slate-50 last:border-0 group transition-colors">
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-tenant-accent group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  <span className="font-medium text-sm">{spec}</span>
                </Link>
              ))}
            </div>
            <button className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors text-sm">
              View All Specialties
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
