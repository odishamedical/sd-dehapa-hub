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
import PremiumEntityTicket from '@/components/PremiumEntityTicket';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { generateUniversalSeoUrl } from '@/lib/urlHelpers';

export const dynamic = 'force-dynamic';

export default function PharmacysDirectory({ 
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
  const [pharmacies, setPharmacys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [searchCountry, setSearchCountry] = useState(initialCountry || "");
  const [searchState, setSearchState] = useState(initialState || "");
  const [searchDistrict, setSearchDistrict] = useState(initialDistrict);
  const [searchType, setSearchType] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchPharmacys = async () => {
      try {
        const q = query(collection(db, 'directory'));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const mappedData = docsData
          .filter((d: any) => d.category?.toLowerCase() === "pharmacy")
          .map((d: any) => ({
            id: d.id,
            name: d.name || "Unknown Pharmacy",
            specialty: d.subCategory || d.category || "Pharmacy",
            experience: d.experience || "Google Verified", 
            rating: d.rating || 0,
            reviews: d.reviews || 0,
            hospital: d.clinicName || d.city || d.district || "Odisha",
            address: d.address || "No Address Provided",
            fee: d.fee || "Contact Admin", 
            img: d.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || "Phar")}&background=fef3c7&color=b45309&size=150`,
            verified: d.verified || false,
            available: true,
            phone: d.phone,
            district: d.district || "Unknown",
            state: d.state || "Odisha",
            country: d.country || "India"
        }));

        setPharmacys(mappedData);
      } catch (err: any) {
        console.error("Error fetching pharmacies:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPharmacys();
  }, []);

  const handleBookClick = (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("sd_current_user_email");
    const isProfileComplete = localStorage.getItem("sd_current_user_profile_complete") === "true";

    if (!userEmail) {
      const currentUrl = window.location.href;
      const authCenterBase = window.location.hostname === "localhost" 
        ? "http://localhost:3000" 
        : "/login";
      window.location.href = `${authCenterBase}?redirect_uri=${encodeURIComponent(currentUrl)}`;
      return;
    }

    if (!isProfileComplete) {
      setShowProfileBlocker(true);
      return;
    }

    router.push(`/portal/book?doctor=${docId}`);
  };

  const filteredPharmacys = pharmacies.filter(doc => {
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

  const uniqueCountries = Array.from(new Set(pharmacies.map((d: any) => d.country).filter(Boolean)));
  const uniqueStates = Array.from(new Set(pharmacies.map((d: any) => d.state).filter(Boolean)));
  const uniqueDistricts = Array.from(new Set(pharmacies.map(d => d.district).filter(d => d !== "Unknown"))).sort();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-teal-500/30">
      <CategoryNav />
      
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm relative z-20">
        <div className="w-full max-w-[1920px] mx-auto">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: "Pharmacys", href: "/pharmacies" },
            ...(initialCountry ? [{ name: initialCountry.charAt(0).toUpperCase() + initialCountry.slice(1), href: `/pharmacies/${initialCountry}` }] : []),
            ...(initialState ? [{ name: initialState.charAt(0).toUpperCase() + initialState.slice(1), href: `/pharmacies/${initialCountry}/${initialState}` }] : []),
            ...(initialDistrict ? [{ name: initialDistrict.charAt(0).toUpperCase() + initialDistrict.slice(1) }] : [])
          ]} />
        </div>
      </div>

      <PremiumHeroSearch 
        titlePrefix="Find a"
        titleHighlight="Pharmacy"
        description="Locate 24/7 pharmacies and order authentic medicines."
        searchPlaceholder="e.g. Apollo Pharmacy..."
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
          <div className="w-full lg:w-1/4 lg:sticky lg:top-[100px] h-auto bg-white border border-slate-200 rounded-[24px] p-4 lg:p-6 shadow-xl relative overflow-hidden">
            {/* Metallic top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-slate-400"></div>

            <div className={`flex justify-between items-center border-slate-100 ${isFiltersOpen ? 'mb-6 border-b pb-4' : 'lg:mb-6 lg:border-b lg:pb-4'}`}>
              <h3 className="font-bold text-slate-900 flex items-center gap-2 uppercase tracking-widest text-xs">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                Smart Filters
              </h3>
              <button onClick={() => setIsFiltersOpen(!isFiltersOpen)} className="lg:hidden text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-teal-200 hover:bg-teal-100 transition-colors">
                {isFiltersOpen ? "Hide" : "Show"} Filters
              </button>
            </div>
            
            <div className={`space-y-6 ${isFiltersOpen ? "block" : "hidden lg:block"}`}>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Popular Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {["24/7 Open", "Home Delivery", "Ayurvedic", "Surgical Supplies"].map(spec => (
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
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredPharmacys.length > 0 ? (
                filteredPharmacys.map(doc => (
                  <PremiumEntityTicket type="pharmacies" key={doc.id} data={doc} />
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
