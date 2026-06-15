"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EcosystemSwitcher from '@/components/EcosystemSwitcher';
import ProfileBlockerModal from '@/components/ProfileBlockerModal';
import { useTenant } from '@/components/TenantContext';
import CategoryNav from '@/components/CategoryNav';
import PremiumHeroSearch from '@/components/PremiumHeroSearch';
import Breadcrumb from '@/components/Breadcrumb';
import DirectorySidebarFilter from '@/components/DirectorySidebarFilter';
import CustomDropdown from '@/components/CustomDropdown';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { generateUniversalSeoUrl } from '@/lib/urlHelpers';

const PremiumDoctorTicket = ({ data }: { data: any }) => {
  return (
    <Link href={generateUniversalSeoUrl(data, 'doctors')} className="relative h-[220px] rounded-[24px] shadow-xl hover:shadow-cyan-900/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden group block border border-slate-300/60 bg-[#e2e8f0]">
      {/* Background Metal Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff] via-[#e2e8f0] to-[#94a3b8] opacity-90 transition-colors"></div>
      
      {/* Subtle brushed texture */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #000 2px, #000 4px)' }}></div>

      <div className="flex items-center h-full relative z-10 pr-2 sm:pr-3">
        
        {/* Left Side: Floating Vertical Image */}
        <div className="w-[110px] sm:w-[32%] h-[90%] sm:h-[86%] ml-2 sm:ml-3 relative shrink-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-[6px_0_15px_rgba(0,0,0,0.2)] border-[3px] sm:border-4 border-[#f8fafc] bg-slate-200 group-hover:scale-[1.03] transition-transform duration-300 z-40">
           <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
        </div>
        
        {/* Right Side: Data Content */}
        <div className="flex-1 h-full py-3 sm:py-4 pl-3 sm:pl-5 flex flex-col min-w-0 relative z-30">
          
          {/* Top Row: Name and Icon */}
          <div className="flex justify-between items-start mb-0.5">
            <h3 className="text-[15px] sm:text-lg md:text-xl font-bold text-slate-800 tracking-tight truncate drop-shadow-sm pr-1">{data.name}</h3>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 drop-shadow-sm shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14h-2v-4H5v-2h4V7h2v4h4v2h-4v4z"/></svg>
          </div>
          
          <p className="text-slate-600 text-xs font-semibold mb-2 truncate">{data.specialty}</p>
          
          {/* Board Certifications (Medals) */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[10px] font-bold text-slate-700">Board Certifications</span>
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
          </div>
          
          {/* Clinic & Location */}
          <div className="mb-2.5">
            <p className="text-slate-800 text-xs font-bold truncate drop-shadow-sm">{data.hospital || "Independent Practitioner"}</p>
            <p className="text-slate-600 text-[10px] flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {data.district || "Angul"}
            </p>
          </div>
          
          {/* Ratings */}
          <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-bold text-slate-600 mb-auto drop-shadow-sm">
             <span className="flex items-center gap-1 text-amber-500 shrink-0">
               ⭐⭐⭐⭐⭐ <span className="text-slate-700 ml-0.5 sm:ml-1">{data.rating}</span>
             </span>
             <span className="flex items-center gap-1 shrink-0 truncate">
               <svg className="w-3 h-3 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
               {data.reviews} Ratings
             </span>
          </div>
          
          {/* Bottom Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-auto pt-2 sm:pt-3 border-t border-slate-400/30">
            <div className="bg-transparent hover:bg-slate-300 text-slate-700 font-bold py-1.5 px-2 sm:px-4 rounded-md border border-slate-400 text-[9px] sm:text-[10px] transition-colors whitespace-nowrap shadow-sm text-center">
              Contact
            </div>
            <div className="bg-teal-700 hover:bg-teal-800 text-white font-bold py-1.5 px-2 sm:px-4 rounded-md text-[9px] sm:text-[10px] transition-all shadow-lg shadow-teal-900/20 whitespace-nowrap text-center flex-1 truncate">
              Book Appt
            </div>
          </div>
          
        </div>
      </div>
    </Link>
  );
};

export const dynamic = 'force-dynamic';

export default function DoctorsDirectory({ 
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
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [searchCountry, setSearchCountry] = useState(initialCountry || "");
  const [searchState, setSearchState] = useState(initialState || "");
  const [searchDistrict, setSearchDistrict] = useState(initialDistrict);
  const [searchType, setSearchType] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Removed orderBy to prevent any Missing Index errors
        const q = query(collection(db, 'directory'));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Map the backend schema to what PremiumDoctorTicket expects
        const mappedData = docsData
          .filter((d: any) => d.category?.toLowerCase() === "doctor")
          .map((d: any) => ({
          id: d.id,
          name: d.name || "Unknown Doctor",
          specialty: d.subCategory || d.category || "Specialist",
          experience: d.experience || "Google Verified", 
          rating: d.rating || 0,
          reviews: d.reviews || 0,
          hospital: d.clinicName || d.city || d.district || "Odisha",
          address: d.address || "No Address Provided",
          fee: d.fee || "Contact Clinic", 
          image: d.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || "Doc")}&background=0f766e&color=fff&size=150`,
          verified: d.verified || false,
          available: true,
          phone: d.phone,
          district: d.district || "Unknown",
          state: d.state || "Odisha",
          country: d.country || "India"
        }));

        setDoctors(mappedData);
      } catch (err: any) {
        console.error("Error fetching directory:", err);
        setFetchError(err.message || "Unknown Firebase Error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const nameMatch = doc.name ? doc.name.toLowerCase().includes(search.toLowerCase()) : false;
    const specMatch = doc.specialty ? doc.specialty.toLowerCase().includes(search.toLowerCase()) : false;
    const searchMatch = nameMatch || specMatch;
    
    if (selectedDistricts.length > 0) {
      if (!selectedDistricts.includes(doc.district)) return false;
    }
    
    if (searchDistrict && doc.district !== searchDistrict) {
      return false;
    }

    if (initialCountry && doc.country?.toLowerCase() !== initialCountry.toLowerCase()) return false;
    if (initialState && doc.state?.toLowerCase() !== initialState.toLowerCase()) return false;
    if (initialDistrict && doc.district?.toLowerCase() !== initialDistrict.toLowerCase()) return false;

    return searchMatch;
  });
  
  const uniqueCountries = Array.from(new Set(doctors.map((d: any) => d.country).filter(Boolean)));
  const uniqueStates = Array.from(new Set(doctors.map((d: any) => d.state).filter(Boolean)));
  const uniqueDistricts = Array.from(new Set(doctors.map(d => d.district).filter(d => d !== "Unknown"))).sort();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-teal-500/30">
      <CategoryNav />
      
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm relative z-20">
        <div className="w-full max-w-[1920px] mx-auto">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: "Doctors", href: "/doctors" },
            ...(initialCountry ? [{ name: initialCountry.charAt(0).toUpperCase() + initialCountry.slice(1), href: `/doctors/${initialCountry}` }] : []),
            ...(initialState ? [{ name: initialState.charAt(0).toUpperCase() + initialState.slice(1), href: `/doctors/${initialCountry}/${initialState}` }] : []),
            ...(initialDistrict ? [{ name: initialDistrict.charAt(0).toUpperCase() + initialDistrict.slice(1) }] : [])
          ]} />
        </div>
      </div>

      <PremiumHeroSearch 
        titlePrefix="DehaPa.com :"
        titleHighlight="Your Health Our Mission"
        description="Connect with renowned specialists through secure video consultations or physical appointments."
        searchPlaceholder="e.g. Dr Abhishek, Kalinga Hospital..."
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
                  {["❤️ Cardiology", "🧠 Neurology", "🦴 Orthopedics", "👶 Pediatrics", "🦷 Dentistry"].map(spec => (
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
            
            {/* Design Preview Section - Shows strictly ONE ticket as a template to avoid blank screen */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : fetchError ? (
              <div className="text-center py-20 bg-red-50 border-2 border-dashed border-red-200 rounded-2xl shadow-sm">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <p className="text-red-900 font-bold text-lg mb-1">Database Read Error</p>
                  <p className="text-sm text-red-600 max-w-lg mx-auto font-mono bg-white p-4 rounded-lg mt-4 border border-red-200 text-left">{fetchError}</p>
                  <p className="text-xs text-slate-500 mt-4">Screenshot this error to the agent so they can fix Firebase Rules.</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <>
                <div className="mb-4 border-2 border-dashed border-teal-200 bg-teal-50/30 p-6 rounded-2xl relative shadow-sm">
                  <div className="absolute -top-3 left-6 bg-teal-500 text-white text-[10px] px-4 py-1 font-bold uppercase rounded-full shadow-md flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Design Template Preview (Waiting for Real Data)
                  </div>
                  <PremiumDoctorTicket data={{
                      id: "mock123",
                      name: "Dr. Sandeep Sharma",
                      specialty: "Cardiology & Internal Medicine",
                      experience: "15+ Years",
                      rating: 4.8,
                      reviews: 124,
                      hospital: "Apollo Hospitals",
                      address: "Unit 15, Near Sainik School, Bhubaneswar",
                      fee: 800,
                      image: "https://ui-avatars.com/api/?name=Dr+Sandeep+Sharma&background=0f766e&color=fff&size=150",
                      verified: false,
                      available: true
                  }} />
                </div>
                <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </div>
                  <p className="text-slate-900 font-bold text-lg mb-1">Database Empty</p>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">The crawler has not injected any live data yet. Once injected, listings will appear here in the premium ticket format.</p>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {filteredDoctors.map(doc => (
                  <PremiumDoctorTicket key={doc.id} data={doc} />
                ))}
              </div>
            )}



          </div>
        </div>
      </main>
      {showProfileBlocker && (
        <ProfileBlockerModal onClose={() => setShowProfileBlocker(false)} />
      )}
    </div>
  );
}
