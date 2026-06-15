const fs = require('fs');
const path = require('path');

const code = `"use client";

import React from 'react';
import Link from 'next/link';
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
      bottomLeftValue: data.fee ? \`₹\${data.fee}\` : "Contact Admin",
      btnSecondary: "Contact",
      btnPrimary: "Book Appt",
      btnPrimaryClass: "bg-teal-700 hover:bg-teal-800 text-white"
    },
    pharmacies: {
      subtitle: data.subCategory || "Medical Store",
      location: data.city || data.district || "Local Region",
      topBoxLabel: "Verification Status",
      topBoxContent: (
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 border border-green-200 shadow-sm flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
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
      topBoxContent: (
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border border-blue-200 shadow-sm flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
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
      topBoxContent: (
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border border-purple-200 shadow-sm flex items-center justify-center">
          <span className="text-[8px] text-white font-bold">NABL</span>
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
      topBoxContent: (
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-red-600 border border-red-200 shadow-sm flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
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
  const imageSrc = data.image || data.img || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(data.name || 'H')}&background=random\`;

  return (
    <Link href={generateUniversalSeoUrl(data, type)} className="relative h-[220px] rounded-[24px] shadow-xl hover:shadow-cyan-900/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden group block border border-slate-300/60 bg-[#e2e8f0]">
      {/* Background Metal Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff] via-[#e2e8f0] to-[#94a3b8] opacity-90 transition-colors"></div>
      
      {/* Subtle brushed texture */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #000 2px, #000 4px)' }}></div>

      <div className="flex items-center h-full relative z-10 pr-2 sm:pr-3">
        
        {/* Left Side: Floating Vertical Image */}
        <div className="w-[110px] sm:w-[32%] h-[90%] sm:h-[86%] ml-2 sm:ml-3 relative shrink-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-[6px_0_15px_rgba(0,0,0,0.2)] border-[3px] sm:border-4 border-[#f8fafc] bg-slate-200 group-hover:scale-[1.03] transition-transform duration-300 z-40 flex items-center justify-center">
           <img src={imageSrc} alt={data.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(data.name || 'H')}&background=random\` }} />
        </div>
        
        {/* Right Side: Data Content */}
        <div className="flex-1 h-full py-3 sm:py-4 pl-3 sm:pl-5 flex flex-col min-w-0 relative z-30">
          
          {/* Top Row: Name and Icon */}
          <div className="flex justify-between items-start mb-0.5">
            <h3 className="text-[15px] sm:text-lg md:text-xl font-bold text-slate-800 tracking-tight truncate drop-shadow-sm pr-1">{data.name}</h3>
            {type === 'ambulances' ? (
              <span className="text-red-500 font-bold text-lg leading-none">🚨</span>
            ) : type === 'pharmacies' ? (
              <span className="text-green-600 font-bold text-lg leading-none">💊</span>
            ) : type === 'labs' ? (
              <span className="text-purple-600 font-bold text-lg leading-none">🔬</span>
            ) : type === 'hospitals' ? (
              <span className="text-blue-600 font-bold text-lg leading-none">🏥</span>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 drop-shadow-sm shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14h-2v-4H5v-2h4V7h2v4h4v2h-4v4z"/></svg>
            )}
          </div>
          
          <p className="text-slate-600 text-xs font-semibold mb-2 truncate">{c.subtitle}</p>
          
          {/* Top Box (Certifications/Verifications) */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[10px] font-bold text-slate-700">{c.topBoxLabel}</span>
            {c.topBoxContent}
          </div>
          
          {/* Location */}
          <div className="mb-2.5">
            <p className="text-slate-800 text-xs font-bold truncate drop-shadow-sm">{c.location}</p>
            <p className="text-slate-600 text-[10px] flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {data.district || data.city || "Odisha"}
            </p>
          </div>
          
          {/* Ratings */}
          <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-bold text-slate-600 mb-auto drop-shadow-sm">
             <span className="flex items-center gap-1 text-amber-500 shrink-0">
               ⭐⭐⭐⭐⭐ <span className="text-slate-700 ml-0.5 sm:ml-1">{data.rating || '4.8'}</span>
             </span>
             <span className="flex items-center gap-1 shrink-0 truncate">
               <svg className="w-3 h-3 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
               {data.reviews || Math.floor(Math.random() * 500 + 50)} Ratings
             </span>
          </div>
          
          {/* Bottom Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 mt-auto pt-2 sm:pt-3 border-t border-slate-400/30">
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-widest">{c.bottomLeftLabel}</span>
              <span className="text-[10px] sm:text-xs text-slate-900 font-black truncate">{c.bottomLeftValue}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="bg-transparent hover:bg-slate-300 text-slate-700 font-bold py-1.5 px-2 rounded-md border border-slate-400 text-[9px] sm:text-[10px] transition-colors whitespace-nowrap shadow-sm text-center">
                {c.btnSecondary}
              </div>
              <div className={\`\${c.btnPrimaryClass} font-bold py-1.5 px-2 rounded-md text-[9px] sm:text-[10px] transition-all shadow-lg shadow-teal-900/20 whitespace-nowrap text-center\`}>
                {c.btnPrimary}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </Link>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src/components/PremiumEntityTicket.tsx'), code, 'utf8');
console.log('Created PremiumEntityTicket.tsx');
