"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EcosystemSwitcher from '@/components/EcosystemSwitcher';
import ProfileBlockerModal from '@/components/ProfileBlockerModal';
import { useTenant } from '@/components/TenantContext';
import CategoryNav from '@/components/CategoryNav';
import Breadcrumb from '@/components/Breadcrumb';
import CustomDropdown from '@/components/CustomDropdown';
import PremiumHeroSearch from '@/components/PremiumHeroSearch';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { generateUniversalSeoUrl } from '@/lib/urlHelpers';

export const dynamic = 'force-dynamic';

export default function LabsDirectory({ 
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
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [searchCountry, setSearchCountry] = useState(initialCountry || "");
  const [searchState, setSearchState] = useState(initialState || "");
  const [searchDistrict, setSearchDistrict] = useState(initialDistrict);
  const [searchType, setSearchType] = useState("");

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const q = query(collection(db, 'directory'));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const mappedData = docsData
          .filter((d: any) => d.category?.toLowerCase() === "lab")
          .map((d: any) => ({
            id: d.id,
            name: d.name || "Unknown Lab",
            specialty: d.subCategory || d.category || "Lab",
            experience: d.experience || "Google Verified", 
            rating: d.rating || 0,
            reviews: d.reviews || 0,
            hospital: d.clinicName || d.city || d.district || "Odisha",
            address: d.address || "No Address Provided",
            fee: d.fee || "Contact Admin", 
            img: d.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || "Lab")}&background=f0fdf4&color=166534&size=150`,
            verified: d.verified || false,
            available: true,
            phone: d.phone,
            district: d.district || "Unknown",
            state: d.state || "Odisha",
            country: d.country || "India"
        }));

        setLabs(mappedData);
      } catch (err: any) {
        console.error("Error fetching labs:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLabs();
  }, []);

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

  const filteredLabs = labs.filter(doc => {
    const nameMatch = doc.name ? doc.name.toLowerCase().includes(search.toLowerCase()) : false;
    const specMatch = doc.specialty ? doc.specialty.toLowerCase().includes(search.toLowerCase()) : false;
    const searchMatch = nameMatch || specMatch;
    
    const matchTenant = activeTenant.hospitalName === "All" || doc.hospital === activeTenant.hospitalName;
    
    if (selectedDistricts.length > 0) {
      if (!selectedDistricts.includes(doc.district)) return false;
    }
    
    if (searchDistrict && doc.district !== searchDistrict) {
      return false;
    }

    if (initialCountry && doc.country?.toLowerCase() !== initialCountry.toLowerCase()) return false;
    if (initialState && doc.state?.toLowerCase() !== initialState.toLowerCase()) return false;
    if (initialDistrict && doc.district?.toLowerCase() !== initialDistrict.toLowerCase()) return false;

    return searchMatch && matchTenant;
  });

  const uniqueCountries = Array.from(new Set(labs.map((d: any) => d.country).filter(Boolean)));
  const uniqueStates = Array.from(new Set(labs.map((d: any) => d.state).filter(Boolean)));
  const uniqueDistricts = Array.from(new Set(labs.map(d => d.district).filter(d => d !== "Unknown"))).sort();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-teal-500/30">
      <CategoryNav />
      
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm relative z-20">
        <div className="w-full max-w-[1920px] mx-auto">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: "Labs", href: "/labs" },
            ...(initialCountry ? [{ name: initialCountry.charAt(0).toUpperCase() + initialCountry.slice(1), href: `/labs/${initialCountry}` }] : []),
            ...(initialState ? [{ name: initialState.charAt(0).toUpperCase() + initialState.slice(1), href: `/labs/${initialCountry}/${initialState}` }] : []),
            ...(initialDistrict ? [{ name: initialDistrict.charAt(0).toUpperCase() + initialDistrict.slice(1) }] : [])
          ]} />
        </div>
      </div>

      <PremiumHeroSearch 
        titlePrefix="Find a"
        titleHighlight="Lab"
        description="Find accredited diagnostic centers and pathology labs near you."
        searchPlaceholder="e.g. Dr Lal PathLabs..."
        search={search}
        setSearch={setSearch}
        searchDistrict={searchDistrict}
        setSearchDistrict={setSearchDistrict}
        searchType={searchType}
        setSearchType={setSearchType}
        searchCountry={searchCountry}
        setSearchCountry={setSearchCountry}
        uniqueCountries={uniqueCountries as string[]}
        searchState={searchState}
        setSearchState={setSearchState}
        uniqueStates={uniqueStates as string[]}
        uniqueDistricts={uniqueDistricts as string[]}
      />

      <main className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 xl:px-16 py-12 relative z-10 -mt-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar Filters - 25% */}
          <div className="w-full lg:w-1/4 lg:sticky lg:top-[100px] h-auto bg-white border border-slate-200 rounded-[24px] p-6 shadow-xl relative overflow-hidden">
            {/* Metallic top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-slate-400"></div>

            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs border-b border-slate-100 pb-4">
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              Smart Filters
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Popular Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {["Pathology", "Radiology", "MRI & CT Scan", "Blood Bank"].map(spec => (
                    <button key={spec} className="bg-slate-100 hover:bg-white text-slate-700 hover:text-teal-700 border border-slate-200 hover:border-teal-300 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md">
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Locality / District</label>
                <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {uniqueDistricts.map((dist: any) => (
                    <label key={dist} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700 cursor-pointer shadow-sm" 
                        checked={selectedDistricts.includes(dist)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedDistricts([...selectedDistricts, dist]);
                          else setSelectedDistricts(selectedDistricts.filter(d => d !== dist));
                        }}
                      />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-teal-700 transition-colors">{dist}</span>
                    </label>
                  ))}
                  {uniqueDistricts.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No locations available.</p>
                  )}
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Availability</label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded border-2 border-slate-300 bg-slate-50 group-hover:border-teal-600 group-hover:bg-white flex items-center justify-center transition-all shadow-inner"></div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-teal-700 transition-colors">Available Today</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group mt-3">
                  <div className="w-5 h-5 rounded border-2 border-slate-300 bg-slate-50 group-hover:border-teal-600 group-hover:bg-white flex items-center justify-center transition-all shadow-inner"></div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-teal-700 transition-colors">Video Consult</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Content - 75% */}
          <div className="w-full lg:w-3/4 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredLabs.length > 0 ? (
                filteredLabs.map(doc => (
                  <Link href={generateUniversalSeoUrl(doc, 'labs')} key={doc.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-tenant-accent/50 transition-colors shadow-lg group block">
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
                  <p className="text-slate-600 font-mono text-sm uppercase tracking-widest font-bold">No labs found</p>
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
