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
import { collection, getDocs, query, where } from 'firebase/firestore';
import { generateUniversalSeoUrl } from '@/lib/urlHelpers';
import AdSliderRenderer from '@/components/AdSliderRenderer';

export const dynamic = 'force-dynamic';

export default function HospitalsDirectory({ 
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
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [searchCountry, setSearchCountry] = useState(initialCountry || "");
  const [searchState, setSearchState] = useState(initialState || "");
  const [searchDistrict, setSearchDistrict] = useState(initialDistrict);
  const [searchType, setSearchType] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [platformAds, setPlatformAds] = useState<any>({});

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const adsQuery = query(collection(db, 'platform_ads'), where('active', '==', true));
        const adsSnap = await getDocs(adsQuery);
        const adsData: any = {};
        adsSnap.forEach(d => {
          const ad = d.data();
          const slot = ad.slot || ad.slotId;
          if (slot && (ad.targetType === 'global' || !ad.targetType || ad.targetType === 'category')) {
             adsData[slot] = ad;
          }
        });
        setPlatformAds(adsData);
      } catch (e) {
        console.error("Ads fetch failed", e);
      }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const q = query(collection(db, 'directory'));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const mappedData = docsData
          .filter((d: any) => d.category?.toLowerCase() === "hospital" && d.isPublished !== false && d.adminLocked !== true)
          .map((d: any) => ({
            id: d.id,
            name: d.name || "Unknown Hospital",
            specialty: d.subCategory || d.category || "Hospital",
            experience: d.experience || "Google Verified", 
            rating: d.rating || 0,
            reviews: d.reviews || 0,
            hospital: d.clinicName || d.city || d.district || "Odisha",
            address: d.address || "No Address Provided",
            fee: d.fee || "Contact Admin", 
            img: d.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || "Hosp")}&background=e2e8f0&color=0f766e&size=150`,
            verified: d.verified || false,
            available: true,
            phone: d.phone,
            district: d.district || "Unknown",
            state: d.state || "Odisha",
            country: d.country || "India"
        }));

        setHospitals(mappedData);
      } catch (err: any) {
        console.error("Error fetching hospitals:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHospitals();
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

  const filteredHospitals = hospitals.filter(doc => {
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

  const uniqueCountries = Array.from(new Set(hospitals.map((d: any) => d.country).filter(Boolean)));
  const uniqueStates = Array.from(new Set(hospitals.map((d: any) => d.state).filter(Boolean)));
  const uniqueDistricts = Array.from(new Set(hospitals.map(d => d.district).filter(d => d !== "Unknown"))).sort();

  return (
    <div className="min-h-screen bg-[#040815] text-slate-200 font-sans selection:bg-cyan-500/30">
      <CategoryNav />
      
      <div className="bg-[#0a1229] border-b border-cyan-500/20 px-6 py-3 shadow-[0_4px_20px_rgba(6,182,212,0.1)] relative z-20">
        <div className="w-full max-w-[1920px] mx-auto">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: "Hospitals", href: "/hospitals" },
            ...(initialCountry ? [{ name: initialCountry.charAt(0).toUpperCase() + initialCountry.slice(1), href: `/hospitals/${initialCountry}` }] : []),
            ...(initialState ? [{ name: initialState.charAt(0).toUpperCase() + initialState.slice(1), href: `/hospitals/${initialCountry}/${initialState}` }] : []),
            ...(initialDistrict ? [{ name: initialDistrict.charAt(0).toUpperCase() + initialDistrict.slice(1) }] : [])
          ]} />
        </div>
      </div>

      <PremiumHeroSearch 
        titlePrefix="Find a"
        titleHighlight="Hospital"
        description="Book a secure FHIR-compliant video consultation with top medical experts."
        searchPlaceholder="e.g. Apollo, KIMS..."
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
        bgImage="/stock/hero-hospitals.png"
      />

      <main className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 xl:px-16 py-12 relative z-10 -mt-12">
        {platformAds['ad_slot_hospitals_list_top'] && (
          <div className="w-full h-[150px] md:h-[200px] mb-8 rounded-2xl overflow-hidden border border-slate-800 shadow-sm relative bg-[#0a1229]">
            {platformAds['ad_slot_hospitals_list_top'].type === 'slider' ? (
              <AdSliderRenderer images={platformAds['ad_slot_hospitals_list_top'].sliderImages || []} linkUrl={platformAds['ad_slot_hospitals_list_top'].linkUrl} animationStyle={platformAds['ad_slot_hospitals_list_top'].animationStyle || 'fade'} />
            ) : (
              <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: platformAds['ad_slot_hospitals_list_top'].htmlCode }} />
            )}
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar Filters - 25% */}
          <div className="w-full lg:w-1/4 lg:sticky lg:top-[100px] h-auto bg-[#0a1229] border border-slate-800 rounded-[24px] p-4 lg:p-6 shadow-2xl shadow-cyan-900/10 relative overflow-hidden">
            {/* Metallic top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-800"></div>

            <div className={`flex justify-between items-center border-slate-800 ${isFiltersOpen ? 'mb-6 border-b pb-4' : 'lg:mb-6 lg:border-b lg:pb-4'}`}>
              <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-widest text-xs">
                <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                Smart Filters
              </h3>
              <button onClick={() => setIsFiltersOpen(!isFiltersOpen)} className="lg:hidden text-cyan-500 bg-teal-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-teal-200 hover:bg-teal-100 transition-colors">
                {isFiltersOpen ? "Hide" : "Show"} Filters
              </button>
            </div>
            
            <div className={`space-y-6 ${isFiltersOpen ? "block" : "hidden lg:block"}`}>
              <div>
                <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest block mb-3">Popular Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {["Multispecialty", "General", "Maternity", "Trauma Care"].map(spec => (
                    <button key={spec} className="bg-[#0f172a] hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/50 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md">
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-800">
                <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest block mb-3">Locality / District</label>
                <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {uniqueDistricts.map((dist: any) => (
                    <label key={dist} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-700 bg-[#040815] text-cyan-500 focus:ring-cyan-500 cursor-pointer shadow-sm" 
                        checked={selectedDistricts.includes(dist)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedDistricts([...selectedDistricts, dist]);
                          else setSelectedDistricts(selectedDistricts.filter(d => d !== dist));
                        }}
                      />
                      <span className="text-sm font-bold text-slate-300 group-hover:text-cyan-400 transition-colors">{dist}</span>
                    </label>
                  ))}
                  {uniqueDistricts.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No locations available.</p>
                  )}
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-800">
                <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest block mb-3">Availability</label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded border-2 border-slate-700 bg-[#040815] group-hover:border-cyan-500 flex items-center justify-center transition-all shadow-inner"></div>
                  <span className="text-sm font-bold text-slate-300 group-hover:text-cyan-400 transition-colors">Available Today</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group mt-3">
                  <div className="w-5 h-5 rounded border-2 border-slate-700 bg-[#040815] group-hover:border-cyan-500 flex items-center justify-center transition-all shadow-inner"></div>
                  <span className="text-sm font-bold text-slate-300 group-hover:text-cyan-400 transition-colors">Video Consult</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Content - 75% */}
          <div className="w-full lg:w-3/4 flex flex-col gap-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredHospitals.length > 0 ? (
                filteredHospitals.map(doc => (
                  <PremiumEntityTicket type="hospitals" key={doc.id} data={doc} />
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-[#0a1229] border border-slate-800 rounded-2xl shadow-sm">
                  <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <p className="text-white font-bold text-lg mb-1">No hospitals found</p>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">Try adjusting your sidebar filters or search term.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {platformAds['ad_slot_hospitals_list_bottom'] && (
          <div className="w-full h-[150px] md:h-[200px] mt-12 rounded-2xl overflow-hidden border border-slate-800 shadow-sm relative bg-[#0a1229]">
            {platformAds['ad_slot_hospitals_list_bottom'].type === 'slider' ? (
              <AdSliderRenderer images={platformAds['ad_slot_hospitals_list_bottom'].sliderImages || []} linkUrl={platformAds['ad_slot_hospitals_list_bottom'].linkUrl} animationStyle={platformAds['ad_slot_hospitals_list_bottom'].animationStyle || 'fade'} />
            ) : (
              <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: platformAds['ad_slot_hospitals_list_bottom'].htmlCode }} />
            )}
          </div>
        )}
      </main>
      {showProfileBlocker && (
        <ProfileBlockerModal onClose={() => setShowProfileBlocker(false)} />
      )}
    </div>
  );
}
