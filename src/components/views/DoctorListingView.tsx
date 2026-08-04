"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import EcosystemSwitcher from '@/components/EcosystemSwitcher';
import ProfileBlockerModal from '@/components/ProfileBlockerModal';
import { useTenant } from '@/components/TenantContext';
import CategoryNav from '@/components/CategoryNav';
import PremiumEntityTicket from '@/components/PremiumEntityTicket';
import Breadcrumb from '@/components/Breadcrumb';
import DirectorySidebarFilter from '@/components/DirectorySidebarFilter';
import CustomDropdown from '@/components/CustomDropdown';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { generateUniversalSeoUrl } from '@/lib/urlHelpers';
import PremiumHeroSearch from '@/components/PremiumHeroSearch';
import AdSliderRenderer from '@/components/AdSliderRenderer';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X } from 'lucide-react';

export function DoctorListingView({ data }: { data: any }) {
  const [showQR, setShowQR] = useState(false);
  
  // Wrap Google Places images with our proxy to bypass Next.js redirect errors
  let initialImg = data.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || "Dr")}&background=0f172a&color=fff&size=150`;
  if (initialImg.includes('places.googleapis.com')) {
     initialImg = `/api/image-proxy?url=${encodeURIComponent(initialImg)}`;
  }
  
  const [imgSrc, setImgSrc] = useState(initialImg);
  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}${generateUniversalSeoUrl(data, 'doctors')}` : '';

  return (
    <Link href={generateUniversalSeoUrl(data, 'doctors')} className={`relative h-[220px] rounded-[24px] shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group block border ${data.verified ? 'border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] bg-[#0a1229]' : 'border-slate-300/60 bg-[#e2e8f0] hover:shadow-cyan-900/20'}`}>
      {/* Background Metal Gradient */}
      <div className={`absolute inset-0 opacity-90 transition-colors ${data.verified ? 'bg-gradient-to-br from-[#0f172a] via-[#0a1229] to-[#1e1b4b]' : 'bg-gradient-to-br from-[#ffffff] via-[#e2e8f0] to-[#94a3b8]'}`}></div>
      
      {/* Subtle brushed texture */}
      <div className={`absolute inset-0 mix-blend-overlay pointer-events-none ${data.verified ? 'opacity-[0.08]' : 'opacity-[0.04]'}`} style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, ${data.verified ? '#ffffff' : '#000000'} 2px, ${data.verified ? '#ffffff' : '#000000'} 4px)` }}></div>

      <div className="flex items-center h-full relative z-10 pr-2 sm:pr-3">
        
        {/* Left Side: Floating Vertical Image */}
        <div className={`w-[110px] sm:w-[32%] h-[90%] sm:h-[86%] ml-2 sm:ml-3 relative shrink-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-[6px_0_15px_rgba(0,0,0,0.2)] border-[3px] sm:border-4 group-hover:scale-[1.03] transition-transform duration-300 z-40 ${data.verified ? 'border-amber-400/80 bg-slate-800' : 'border-[#f8fafc] bg-slate-200'}`}>
           <Image 
             src={imgSrc} 
             alt={data.name} 
             fill
             sizes="(max-width: 768px) 100vw, 33vw"
             className="object-cover" 
             onError={() => {
               setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || "Dr")}&background=0f172a&color=fff&size=150`);
             }}
           />
           {data.verified && (
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 flex justify-center">
               <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                 Available
               </span>
             </div>
           )}
        </div>
        
        {/* Right Side: Data Content */}
        <div className="flex-1 h-full py-3 sm:py-4 pl-3 sm:pl-5 flex flex-col min-w-0 relative z-30">
          
          {/* Top Row: Name and Icon */}
          <div className="flex justify-between items-start mb-0.5">
            <h3 className={`text-[15px] sm:text-lg md:text-xl font-bold tracking-tight truncate drop-shadow-sm pr-1 ${data.verified ? 'text-white' : 'text-slate-800'}`}>{data.name}</h3>
            {data.verified ? (
              <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/50 px-2 py-0.5 rounded-full shrink-0">
                <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest hidden sm:inline-block">Verified</span>
              </div>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 drop-shadow-sm shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14h-2v-4H5v-2h4V7h2v4h4v2h-4v4z"/></svg>
            )}
          </div>
          
          <p className={`text-xs font-semibold mb-2 truncate ${data.verified ? 'text-slate-300' : 'text-slate-600'}`}>{data.specialty}</p>
          
          {/* Board Certifications (Medals) */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className={`text-[10px] font-bold ${data.verified ? 'text-slate-400' : 'text-slate-700'}`}>Board Certifications</span>
            <div className="flex gap-1">
               <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 border border-yellow-200 shadow-sm flex items-center justify-center">
                 <span className="text-[8px] text-white font-bold">★</span>
               </div>
               {data.verified && (
                 <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 shadow-sm flex items-center justify-center">
                   <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                 </div>
               )}
            </div>
          </div>
          
          {/* Clinic & Location */}
          <div className="mb-2.5">
            <p className={`text-xs font-bold truncate drop-shadow-sm ${data.verified ? 'text-slate-200' : 'text-slate-800'}`}>{data.hospital || "Independent Practitioner"}</p>
            <p className={`text-[10px] flex items-center gap-1 ${data.verified ? 'text-slate-400' : 'text-slate-600'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {data.district || "Angul"}
            </p>
          </div>
          
          {/* Ratings */}
          <div className={`flex items-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-bold mb-auto drop-shadow-sm ${data.verified ? 'text-slate-400' : 'text-slate-600'}`}>
             <span className="flex items-center gap-1 text-amber-500 shrink-0">
               ⭐⭐⭐⭐⭐ <span className={data.verified ? 'text-slate-300 ml-0.5 sm:ml-1' : 'text-slate-700 ml-0.5 sm:ml-1'}>{data.rating}</span>
             </span>
             <span className="flex items-center gap-1 shrink-0 truncate">
               <svg className="w-3 h-3 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
               {data.reviews} Ratings
             </span>
          </div>
          
          {/* Bottom Buttons */}
          <div className={`flex items-center gap-1.5 sm:gap-2 mt-auto pt-2 sm:pt-3 border-t ${data.verified ? 'border-slate-700/50' : 'border-slate-400/30'}`}>
            <button 
              onClick={(e) => {
                e.preventDefault();
                setShowQR(true);
              }}
              className={`font-bold py-1.5 px-2 rounded-md border transition-colors shadow-sm flex items-center justify-center shrink-0 ${data.verified ? 'bg-transparent text-slate-300 border-slate-600 hover:bg-slate-800' : 'bg-transparent hover:bg-slate-300 text-slate-700 border-slate-400'}`}
            >
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className={`font-bold py-1.5 px-2 sm:px-4 rounded-md border text-[9px] sm:text-[10px] transition-colors whitespace-nowrap shadow-sm text-center ${data.verified ? 'bg-transparent text-slate-300 border-slate-600 hover:bg-slate-800' : 'bg-transparent hover:bg-slate-300 text-slate-700 border-slate-400'}`}>
              Contact
            </div>
            {data.verified ? (
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-900 font-black py-1.5 px-2 sm:px-4 rounded-md text-[9px] sm:text-[10px] transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] whitespace-nowrap text-center flex-1 truncate flex items-center justify-center gap-1.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                Book via WhatsApp
              </div>
            ) : (
              <div className="bg-teal-700 hover:bg-teal-800 text-white font-bold py-1.5 px-2 sm:px-4 rounded-md text-[9px] sm:text-[10px] transition-all shadow-lg shadow-teal-900/20 whitespace-nowrap text-center flex-1 truncate">
                View Details
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* QR Code Modal (Rendered conditionally but ignores Link clicks via stopPropagation) */}
      {showQR && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-[24px]"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowQR(false);
          }}
        >
          <div 
            className="bg-white p-4 rounded-2xl shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center w-full mb-3">
              <span className="text-sm font-bold text-slate-800">Scan to Connect</span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowQR(false);
                }}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <QRCodeSVG 
                value={profileUrl}
                size={120}
                bgColor={"#f8fafc"}
                fgColor={"#0f172a"}
                level={"H"}
                includeMargin={false}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-3 font-medium text-center">
              Scan this code to instantly view<br/> {data.name}'s profile.
            </p>
          </div>
        </div>
      )}
    </Link>
  );
};

export const dynamic = 'force-dynamic';

export default function DoctorsDirectory({ 
  initialCountry = "",
  initialState = "", 
  initialDistrict = "",
  initialCity = "",
  initialSpecialty = ""
}: { 
  initialCountry?: string;
  initialState?: string;
  initialDistrict?: string;
  initialCity?: string;
  initialSpecialty?: string;
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
  const [searchDistrict, setSearchDistrict] = useState(initialDistrict || "");
  const [searchCity, setSearchCity] = useState(initialCity || "");
  const [searchSpecialty, setSearchSpecialty] = useState(initialSpecialty || "");
  const [searchType, setSearchType] = useState(""); // Holds the taxonomy/category mapping
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
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
          .filter((d: any) => {
            const isDocType = d.category?.toLowerCase() === "doctor" || d.role?.toLowerCase() === "doctor" || d.isPublic !== undefined;
            const isLive = d.isPublic === true || d.isPublished === true || (d.isPublished !== false && d.adminLocked !== true && d.isPublic !== false);
            return isDocType && isLive;
          })
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
          image: d.image || (d.rawImages && d.rawImages.length > 0 ? d.rawImages[0] : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || "Doc")}&background=0f766e&color=fff&size=150`,
          verified: d.verified || false,
          available: true,
          phone: d.phone,
          district: d.district || "Unknown",
          state: d.state || "Odisha",
          country: d.country || "India",
          tier: d.tier || null,
          customSlug: d.customSlug
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
      if (!selectedDistricts.map(d => d.toLowerCase()).includes(doc.district?.toLowerCase())) return false;
    }
    
    if (selectedTiers.length > 0) {
      const docTier = (doc.tier || doc.taxonomy || "specialist").toLowerCase(); 
      let isTierMatch = false;
      if (selectedTiers.includes("general") && (docTier === "ayush" || docTier === "mbbs" || docTier === "general")) isTierMatch = true;
      if (selectedTiers.includes("specialist") && (docTier === "specialist" || docTier === "speciality")) isTierMatch = true;
      if (selectedTiers.includes("super-specialist") && docTier === "super-specialist") isTierMatch = true;
      
      if (!isTierMatch) return false;
    }
    
    if (searchDistrict && doc.district?.toLowerCase() !== searchDistrict.toLowerCase()) {
      return false;
    }

    if (initialCountry && doc.country?.toLowerCase() !== initialCountry.toLowerCase()) return false;
    if (initialState && doc.state?.toLowerCase() !== initialState.toLowerCase()) return false;
    if (initialDistrict && doc.district?.toLowerCase() !== initialDistrict.toLowerCase()) return false;
    if (initialCity && doc.city?.toLowerCase() !== initialCity.toLowerCase()) return false;
    if (initialSpecialty && !(doc.subCategory || doc.specialty || "").toLowerCase().replace(/[^a-z0-9]/g, '').includes(initialSpecialty.toLowerCase().replace(/[^a-z0-9]/g, ''))) return false;

    return searchMatch;
  });
  
  const uniqueCountries = Array.from(new Set(doctors.map((d: any) => d.country).filter(Boolean)));
  const uniqueStates = Array.from(new Set(doctors.map((d: any) => d.state).filter(Boolean)));
  const uniqueDistricts = Array.from(new Set(doctors.map(d => d.district).filter(d => d !== "Unknown"))).sort();

  // Dynamic SEO Hero Construction
  const activeLocation = initialCity || initialDistrict || initialState || initialCountry || "Odisha";
  const formattedLocation = activeLocation.charAt(0).toUpperCase() + activeLocation.slice(1).replace(/-/g, ' ');
  const activeSpecialty = initialSpecialty ? (initialSpecialty.charAt(0).toUpperCase() + initialSpecialty.slice(1).replace(/-/g, ' ')) + (initialSpecialty.toLowerCase().endsWith('s') ? '' : 's') : "Doctors";
  
  const seoTitleHighlight = `${activeSpecialty} in ${formattedLocation}`;

  return (
    <div className="min-h-screen bg-[#040815] text-slate-200 font-sans selection:bg-cyan-500/30">
      <CategoryNav />
      
      <div className="bg-[#0a1229] border-b border-cyan-500/20 px-6 py-3 shadow-[0_4px_20px_rgba(6,182,212,0.1)] relative z-20">
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
        titlePrefix="Find Top"
        titleHighlight={seoTitleHighlight}
        description="Connect with renowned medical experts through secure video consultations or physical appointments."
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
        bgImage="/stock/hero-doctors.png"
      />

      <main className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 xl:px-16 py-12 relative z-10 -mt-12">
        {platformAds['ad_slot_doctors_list_top'] && (
          <div className="w-full h-[150px] md:h-[200px] mb-8 rounded-2xl overflow-hidden border border-slate-800 shadow-sm relative bg-[#0a1229]">
            {platformAds['ad_slot_doctors_list_top'].type === 'slider' ? (
              <AdSliderRenderer images={platformAds['ad_slot_doctors_list_top'].sliderImages || []} linkUrl={platformAds['ad_slot_doctors_list_top'].linkUrl} animationStyle={platformAds['ad_slot_doctors_list_top'].animationStyle || 'fade'} />
            ) : (
              <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: platformAds['ad_slot_doctors_list_top'].htmlCode }} />
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
              <button onClick={() => setIsFiltersOpen(!isFiltersOpen)} className="lg:hidden text-cyan-400 bg-cyan-950/30 px-3 py-1.5 rounded-lg text-xs font-bold border border-cyan-500/30 hover:bg-cyan-900/40 transition-colors">
                {isFiltersOpen ? "Hide" : "Show"} Filters
              </button>
            </div>
            
            <div className={`space-y-6 ${isFiltersOpen ? "block" : "hidden lg:block"}`}>
              <div>
                <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest block mb-3">Popular Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {["❤️ Cardiology", "🧠 Neurology", "🦴 Orthopedics", "👶 Pediatrics", "🦷 Dentistry"].map(spec => (
                    <button key={spec} className="bg-[#0f172a] hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/50 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-800">
                <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest block mb-3">Provider Tier</label>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "General Doctors", value: "general" },
                    { label: "Specialists", value: "specialist" },
                    { label: "Surgeons / Super Specialists", value: "super-specialist" }
                  ].map((tier) => (
                    <label key={tier.value} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-700 bg-[#040815] text-cyan-500 focus:ring-cyan-500 cursor-pointer shadow-sm" 
                        checked={selectedTiers.includes(tier.value)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedTiers([...selectedTiers, tier.value]);
                          else setSelectedTiers(selectedTiers.filter(t => t !== tier.value));
                        }}
                      />
                      <span className="text-sm font-bold text-slate-300 group-hover:text-cyan-400 transition-colors">{tier.label}</span>
                    </label>
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
            
            {/* Design Preview Section - Shows strictly ONE ticket as a template to avoid blank screen */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : fetchError ? (
              <div className="text-center py-20 bg-red-950/20 border-2 border-dashed border-red-500/30 rounded-2xl shadow-sm">
                  <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <p className="text-red-400 font-bold text-lg mb-1">Database Read Error</p>
                  <p className="text-sm text-red-300 max-w-lg mx-auto font-mono bg-[#040815] p-4 rounded-lg mt-4 border border-red-500/20 text-left">{fetchError}</p>
                  <p className="text-xs text-slate-500 mt-4">Screenshot this error to the agent so they can fix Firebase Rules.</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <>
                <div className="mb-4 border-2 border-dashed border-cyan-500/30 bg-cyan-950/10 p-6 rounded-2xl relative shadow-sm">
                  <div className="absolute -top-3 left-6 bg-cyan-600 text-white text-[10px] px-4 py-1 font-bold uppercase rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Design Template Preview (Waiting for Real Data)
                  </div>
                  <PremiumEntityTicket type="doctors" data={{
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
                <div className="text-center py-20 bg-[#0a1229] border border-slate-800 rounded-2xl shadow-sm">
                  <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </div>
                  <p className="text-white font-bold text-lg mb-1">Database Empty</p>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">The crawler has not injected any live data yet. Once injected, listings will appear here in the premium ticket format.</p>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {filteredDoctors.map(doc => (
                  <PremiumEntityTicket type="doctors" key={doc.id} data={doc} />
                ))}
              </div>
            )}



          </div>
        </div>
        
        {platformAds['ad_slot_doctors_list_bottom'] && (
          <div className="w-full h-[150px] md:h-[200px] mt-12 rounded-2xl overflow-hidden border border-slate-800 shadow-sm relative bg-[#0a1229]">
            {platformAds['ad_slot_doctors_list_bottom'].type === 'slider' ? (
              <AdSliderRenderer images={platformAds['ad_slot_doctors_list_bottom'].sliderImages || []} linkUrl={platformAds['ad_slot_doctors_list_bottom'].linkUrl} animationStyle={platformAds['ad_slot_doctors_list_bottom'].animationStyle || 'fade'} />
            ) : (
              <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: platformAds['ad_slot_doctors_list_bottom'].htmlCode }} />
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
