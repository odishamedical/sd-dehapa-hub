"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EcosystemSwitcher from '@/components/EcosystemSwitcher';
import ProfileBlockerModal from '@/components/ProfileBlockerModal';
import { useTenant } from '@/components/TenantContext';
import DirectorySidebarFilter from '@/components/DirectorySidebarFilter';

const PHARMACIES: any[] = [
  // Zero Mock Data Protocol: Data will be fetched from Firestore CMS
];

import { generateUniversalSeoUrl } from '@/lib/urlHelpers';

export const dynamic = 'force-dynamic';

export default function PharmaciesDirectory({ 
  initialCountry = "", 
  initialState = "", 
  initialDistrict = "" 
}: { 
  initialCountry?: string;
  initialState?: string;
  initialDistrict?: string;
}) {
  const router = useRouter();
  const { activeTenant } = useTenant();
  const [search, setSearch] = useState("");
  const [showProfileBlocker, setShowProfileBlocker] = useState(false);

  const handleBookClick = (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("sd_current_user_email");
    const isProfileComplete = localStorage.getItem("sd_current_user_profile_complete") === "true";

    if (!userEmail) {
      const currentUrl = window.location.href;
      const authCenterBase = window.location.hostname === "localhost" 
        ? "http://localhost:3000" 
        : "https://sd-auth-center.vercel.app";
      window.location.href = `${authCenterBase}?redirect_uri=${encodeURIComponent(currentUrl)}`;
      return;
    }

    if (!isProfileComplete) {
      setShowProfileBlocker(true);
      return;
    }

    router.push(`/portal/book?doctor=${docId}`);
  };

  const filteredPharmacies = PHARMACIES.filter(doc => {
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || doc.hospital.toLowerCase().includes(search.toLowerCase());
    
    // Filter by tenant hospital unless the tenant is "general" (DehaPa general network)
    const matchTenant = activeTenant.hospitalName === "All" || doc.hospital === activeTenant.hospitalName;
    
    return matchSearch && matchTenant;
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-tenant-accent/30">
      {/* Global Header */}
      <header className="relative z-50 h-[80px] border-b border-tenant-accent/20 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-12 sticky top-0">
        <Link href="/" className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tenant-gradient-from to-tenant-gradient-to flex items-center justify-center text-slate-900 font-bold text-xl shadow-[0_0_20px_var(--tenant-accent-glow)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-widest text-slate-900 uppercase font-serif">
              {activeTenant.logoText} <span className="text-tenant-accent">{activeTenant.id === "general" ? "Health" : "Care"}</span>
            </span>
            <span className="text-[9px] text-tenant-accent/80 tracking-[0.2em] uppercase font-mono">{activeTenant.logoSubText}</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <EcosystemSwitcher />
        </div>
      </header>

      <main className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 xl:px-16 py-12 relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
            Find a <span className="text-tenant-accent">Pharmacy</span>
          </h1>
          <p className="text-slate-600">
            {activeTenant.id === "general" 
              ? "Book a secure FHIR-compliant video consultation with top medical experts across Odisha."
              : `Book a secure FHIR-compliant video consultation with top medical experts at ${activeTenant.name}.`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar Filters - 25% */}
          <div className="w-full lg:w-1/4 lg:sticky lg:top-[100px] h-auto lg:h-[calc(100vh-120px)]">
            <DirectorySidebarFilter 
              categoryName="Pharmacies" 
              specialtyOptions={["24/7 Pharmacy", "Ayurvedic", "Allopathic", "Homeopathic"]} 
            />
          </div>

          {/* Right Content - 75% */}
          <div className="w-full lg:w-3/4 flex flex-col gap-6">
            
            {/* Search Bar Top */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-4 items-center shadow-md">
              <div className="flex-1 w-full relative">
                <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input 
                  type="text" 
                  placeholder={activeTenant.id === "general" ? "Search by doctor name or hospital..." : `Search by doctor name...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-tenant-accent transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* Directory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPharmacies.length > 0 ? (
                filteredPharmacies.map(doc => (
                  <Link href={generateUniversalSeoUrl(doc, 'pharmacies')} key={doc.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-tenant-accent/50 transition-colors shadow-lg group block">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <img src={doc.img} alt={doc.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 group-hover:border-tenant-accent transition-colors" />
                        <div className="flex items-center gap-1 bg-[#1e293b] px-2 py-1 rounded text-xs font-bold text-yellow-400">
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                          {doc.rating}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{doc.name}</h3>
                      <p className="text-tenant-accent text-xs uppercase tracking-widest font-mono mb-3">{doc.specialty}</p>
                      <div className="space-y-1 mb-6">
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                          {doc.hospital}
                        </p>
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {doc.experience} Experience
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#64748b] uppercase tracking-widest font-mono">Consultation Fee</span>
                        <span className="text-slate-900 font-bold text-lg">₹{doc.fee}</span>
                      </div>
                      {doc.available ? (
                        <button 
                          onClick={(e) => handleBookClick(e, doc.id)}
                          className="bg-tenant-accent/10 hover:bg-tenant-accent text-tenant-accent hover:text-slate-800 border border-tenant-accent/30 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Book Now
                        </button>
                      ) : (
                        <button disabled className="bg-[#1e293b] text-[#64748b] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-not-allowed">
                          Waitlist
                        </button>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <p className="text-slate-600 font-mono text-sm uppercase tracking-widest font-bold">No pharmacies found</p>
                  <p className="text-xs text-slate-500 mt-2">Try adjusting your sidebar filters or search term.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {showProfileBlocker && (
        <ProfileBlockerModal onClose={() => setShowProfileBlocker(false)} />
      )}
    </div>
  );
}
