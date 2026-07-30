"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { generateUniversalSeoUrl } from '@/lib/urlHelpers';

export default function PremiumEntityTicket({ data, type }: { data: any, type: 'doctors' | 'hospitals' | 'labs' | 'pharmacies' | 'ambulances' }) {
  // Define entity-specific configurations
  const config = {
    doctors: {
      subtitle: data.specialty || "General Physician",
      location: data.hospital || "Independent Practitioner",
      topBoxLabel: "Board Certifications",
      topBoxContent: (
        <div className="flex gap-1">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 border border-yellow-200 shadow-sm flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">★</span>
          </div>
          {data.verified && (
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 border border-slate-200 shadow-sm flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
          )}
        </div>
      ),
      bottomLeftLabel: "Consultation Fee",
      bottomLeftValue: data.fee ? `₹${data.fee}` : "Contact Admin",
      btnSecondary: "Contact",
      btnPrimary: "Book Appt",
      btnPrimaryClass: "bg-teal-700 hover:bg-teal-800 text-white"
    },
    pharmacies: {
      subtitle: data.subCategory || "Medical Store",
      location: data.city || data.district || "Local Region",
      topBoxLabel: "Verification Status",
      topBoxContent: data.verified ? (
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 border border-green-200 shadow-sm flex items-center justify-center" title="Verified">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
      ) : (
        <div className="px-1.5 py-0.5 rounded bg-slate-300 border border-slate-400 shadow-sm flex items-center justify-center">
          <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">Unverified</span>
        </div>
      ),
      bottomLeftLabel: "Delivery Options",
      bottomLeftValue: "In-Store & Delivery",
      btnSecondary: "View Store",
      btnPrimary: "Order Medicine",
      btnPrimaryClass: "bg-teal-700 hover:bg-teal-800 text-white"
    },
    hospitals: {
      subtitle: data.subCategory || "Multi-Specialty Hospital",
      location: data.city || data.district || "Local Region",
      topBoxLabel: "Institution Status",
      topBoxContent: data.verified ? (
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border border-blue-200 shadow-sm flex items-center justify-center" title="Verified">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
      ) : (
        <div className="px-1.5 py-0.5 rounded bg-slate-300 border border-slate-400 shadow-sm flex items-center justify-center">
          <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">Unverified</span>
        </div>
      ),
      bottomLeftLabel: "Facility Scale",
      bottomLeftValue: "Multi-Specialty",
      btnSecondary: "View Details",
      btnPrimary: "Book OPD",
      btnPrimaryClass: "bg-teal-700 hover:bg-teal-800 text-white"
    },
    labs: {
      subtitle: data.subCategory || "Diagnostic Center",
      location: data.city || data.district || "Local Region",
      topBoxLabel: "Lab Accreditation",
      topBoxContent: data.verified ? (
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border border-purple-200 shadow-sm flex items-center justify-center">
          <span className="text-[8px] text-white font-bold">NABL</span>
        </div>
      ) : (
        <div className="px-1.5 py-0.5 rounded bg-slate-300 border border-slate-400 shadow-sm flex items-center justify-center">
          <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">Unverified</span>
        </div>
      ),
      bottomLeftLabel: "Home Collection",
      bottomLeftValue: "Available",
      btnSecondary: "View Lab",
      btnPrimary: "Book Test",
      btnPrimaryClass: "bg-teal-700 hover:bg-teal-800 text-white"
    },
    ambulances: {
      subtitle: data.subCategory || "Emergency Transport",
      location: data.city || data.district || "Local Region",
      topBoxLabel: "Fleet Status",
      topBoxContent: data.verified ? (
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-red-600 border border-red-200 shadow-sm flex items-center justify-center" title="Verified">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
      ) : (
        <div className="px-1.5 py-0.5 rounded bg-slate-300 border border-slate-400 shadow-sm flex items-center justify-center">
          <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">Unverified</span>
        </div>
      ),
      bottomLeftLabel: "Response Area",
      bottomLeftValue: "City Limits",
      btnSecondary: "View Fleet",
      btnPrimary: "Call Emergency",
      btnPrimaryClass: "bg-red-600 hover:bg-red-700 text-white animate-pulse hover:animate-none"
    }
  };

  const c = config[type] || config.doctors;
  const imageSrc = data.image || data.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'H')}&background=random`;

  return (
    <Link href={generateUniversalSeoUrl(data, type)} className="relative h-auto sm:h-[220px] rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)] hover:-translate-y-1 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden group block border border-slate-800 bg-gradient-to-br from-[#0a1229] via-[#040815] to-[#0f172a]">
      {/* Background Glowing Inner Shadow */}
      <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] pointer-events-none rounded-3xl group-hover:shadow-[inset_0_1px_0_rgba(6,182,212,0.2)] transition-shadow"></div>
      
      {/* Subtle brushed texture */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }}></div>

      <div className="flex flex-col sm:flex-row sm:items-center h-full relative z-10 p-3 sm:p-0 sm:pr-3">
        
        {/* Left Side: Floating Vertical Image */}
        <div className="w-full sm:w-[32%] h-[160px] sm:h-[86%] sm:ml-3 mb-3 sm:mb-0 relative shrink-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-[6px_0_15px_rgba(0,0,0,0.5)] border-[3px] sm:border-4 border-slate-800 bg-[#0f172a] group-hover:scale-[1.03] transition-transform duration-300 z-40 flex items-center justify-center">
           <Image src={imageSrc || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'H')}&background=random`} alt={data.name || 'Entity'} fill sizes="(max-width: 640px) 100vw, 32vw" className="object-cover" />
        </div>
        
        {/* Right Side: Data Content */}
        <div className="flex-1 py-1 sm:py-4 sm:pl-5 flex flex-col min-w-0 relative z-30">
          
          {/* Top Row: Name and Icon */}
          <div className="flex justify-between items-start mb-1 sm:mb-0.5">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight truncate drop-shadow-sm pr-1 group-hover:text-cyan-400 transition-colors">{data.name}</h3>
            {type === 'ambulances' ? (
              <span className="text-red-500 font-bold text-lg leading-none">🚨</span>
            ) : type === 'pharmacies' ? (
              <span className="text-green-600 font-bold text-lg leading-none">💊</span>
            ) : type === 'labs' ? (
              <span className="text-purple-600 font-bold text-lg leading-none">🔬</span>
            ) : type === 'hospitals' ? (
              <span className="text-blue-600 font-bold text-lg leading-none">🏥</span>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 drop-shadow-sm shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14h-2v-4H5v-2h4V7h2v4h4v2h-4v4z"/></svg>
            )}
          </div>
          
          <p className="text-cyan-500/80 text-xs sm:text-sm font-semibold mb-2 sm:mb-2 truncate">{c.subtitle}</p>
          
          {/* Top Box (Certifications/Verifications) */}
          <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">{c.topBoxLabel}</span>
            {c.topBoxContent}
          </div>
          
          {/* Location */}
          <div className="mb-3 sm:mb-2.5">
            <p className="text-slate-300 text-xs sm:text-sm font-bold truncate drop-shadow-sm">{c.location}</p>
            <p className="text-slate-500 text-[10px] sm:text-xs flex items-center gap-1 mt-0.5">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {data.district || data.city || "Odisha"}
            </p>
          </div>
          
          {/* Ratings */}
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-bold text-slate-500 mb-3 sm:mb-auto drop-shadow-sm">
             <span className="flex items-center gap-1 text-amber-500 shrink-0">
               ⭐⭐⭐⭐⭐ <span className="text-slate-300 ml-0.5 sm:ml-1">{data.rating || '4.8'}</span>
             </span>
             <span className="flex items-center gap-1 shrink-0 truncate">
               <svg className="w-3 h-3 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
               {data.reviews || Math.floor(Math.random() * 500 + 50)} Ratings
             </span>
          </div>
          
          {/* Bottom Buttons */}
          <div className="flex flex-row items-center gap-2 sm:mt-auto pt-3 border-t border-slate-800">
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-widest">{c.bottomLeftLabel}</span>
              <span className="text-[11px] sm:text-xs text-cyan-400 font-black truncate">{c.bottomLeftValue}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-transparent hover:bg-[#0f172a] text-slate-300 hover:text-white font-bold py-2 px-3 sm:py-1.5 sm:px-2 rounded-lg sm:rounded-md border border-slate-700 text-xs sm:text-[10px] transition-colors whitespace-nowrap shadow-sm text-center">
                {c.btnSecondary}
              </div>
              <div className={`${c.btnPrimaryClass} font-bold py-2 px-4 sm:py-1.5 sm:px-2 rounded-lg sm:rounded-md text-xs sm:text-[10px] transition-all shadow-lg shadow-teal-900/50 whitespace-nowrap text-center`}>
                {c.btnPrimary}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </Link>
  );
}
