"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "react-qr-code";
import { Search, Activity, PhoneCall, X, Video, Calendar, ShieldCheck, Stethoscope, Building2, TestTube2, Pill, Ambulance, QrCode, AlertCircle, Syringe, HeartPulse, Globe2, Zap, CheckCircle2 } from "lucide-react";
import dynamic from 'next/dynamic';
import FeatureToggleMap from '@/components/FeatureToggleMap';
import { getNewsArticles, NewsArticle } from '@/lib/news';
import AdSliderRenderer from '@/components/AdSliderRenderer';
import { useRouter } from "next/navigation";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const QRScannerModal = dynamic(() => import('@/components/QRScannerModal'), {
  ssr: false
});

const SEO_PHRASES = [
  "Find top Specialist Doctors across India & Odisha.",
  "Consult experts in Cardiology, Neurology & Oncology.",
  "Book top-rated Orthopedics, Pediatrics & Gynecology.",
  "Access Urology, Dermatology, Nephrology and many more specialists.",
  "Book Hospital ICU beds & advanced Diagnostic X-Ray services.",
  "Access world-class Surgical & Routine Care instantly."
];

export default function DehapaHome() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isPinging, setIsPinging] = useState(false);
  const [ambulanceETA, setAmbulanceETA] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [platformAds, setPlatformAds] = useState<any>({});

  // Typing Effect State
  const [currentPhraseIdx, setCurrentPhraseIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem("sd_current_user_uid") || localStorage.getItem("sd_current_user_email");
    setUserUid(uid);

    const handleOpenQR = () => setIsQrModalOpen(true);
    window.addEventListener('sd_open_qr_modal', handleOpenQR);

    const fetchAds = async () => {
      try {
        const adsQuery = query(collection(db, 'platform_ads'), where('active', '==', true));
        const adsSnap = await getDocs(adsQuery);
        const adsData: any = {};
        
        adsSnap.forEach(d => {
          const ad = d.data();
          const slot = ad.slot || ad.slotId;
          if (slot) {
            if (!adsData[slot]) adsData[slot] = [];
            adsData[slot].push(ad);
          }
        });
        
        setPlatformAds(adsData);
      } catch(e) {
        console.error("Ads fetch failed", e);
      }
    };
    fetchAds();

    return () => window.removeEventListener('sd_open_qr_modal', handleOpenQR);
  }, []);

  // SEO Typing Effect Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentPhrase = SEO_PHRASES[currentPhraseIdx];

    const handleTyping = () => {
      if (isDeleting) {
        setDisplayText(prev => prev.slice(0, -1));
        if (displayText.length === 0) {
          setIsDeleting(false);
          setCurrentPhraseIdx((prev) => (prev + 1) % SEO_PHRASES.length);
        }
      } else {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        if (displayText === currentPhrase) {
          timer = setTimeout(() => setIsDeleting(true), 2500); // Pause before deleting
          return;
        }
      }
      
      const typingSpeed = isDeleting ? 30 : 60; // Deletes faster than it types
      timer = setTimeout(handleTyping, typingSpeed);
    };

    timer = setTimeout(handleTyping, 50);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentPhraseIdx]);

  const handlePingAmbulance = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setAmbulanceETA("3 mins away");
      router.push('/ambulances'); 
    }, 1500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main className="min-h-screen font-sans text-slate-900 overflow-x-hidden bg-white">
      
      {/* Search Hero Section */}
      <section className="relative pt-24 lg:pt-32 pb-16 md:pb-24 z-20 flex justify-center bg-white overflow-hidden">
        
        {/* The Master Container that perfectly aligns with the bottom area */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 relative z-10">
          
          {/* The "Contained Hero Banner" - The image is the background of THIS box, not the whole screen */}
          <div className="relative w-full min-h-[500px] lg:min-h-[600px] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-gradient-to-br from-[#f8faff] to-blue-50 border border-slate-100/50 flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12">
            
            {/* Background Image confined strictly to this banner */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
               <Image src="/home/hero-home.png" alt="Dehapa Hero" fill className="object-cover object-right opacity-90 filter hue-rotate-[5deg]" priority />
            </div>

            {/* Gradient Overlay just to ensure the text on the left is readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent z-0 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white md:hidden z-0 pointer-events-none"></div>

            {/* CONTENT BOX (Left Aligned over the background inside the banner) */}
            <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left max-w-2xl">
              
              <h1 className="text-4xl md:text-5xl lg:text-[64px] font-black text-slate-900 tracking-tight mb-4 leading-[1.1]">
                Connecting You to <br className="hidden md:block" />
                <span className="text-[#0461be]">Better Health</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-700 mb-10 font-medium max-w-xl">
                Empower your health journey with Dehapa Hub. Find doctors, book hospitals, and order medicines instantly.
              </p>

              {/* IT Hub Style "Power" Search Bar */}
              <form onSubmit={handleSearch} className="w-full max-w-2xl relative shadow-[0_20px_40px_rgba(0,0,0,0.06)] rounded-xl bg-white border border-slate-200 focus-within:ring-4 focus-within:ring-blue-400/20 transition-all flex items-center p-1.5 mb-8 group hover:shadow-[0_25px_50px_rgba(0,0,0,0.08)]">
                <div className="flex items-center pl-3 md:pl-4 border-r border-slate-200 shrink-0">
                  <Search className="w-5 h-5 text-slate-400 mr-1 md:mr-2 hidden sm:block" />
                  <select className="bg-transparent border-none outline-none text-slate-700 font-bold text-sm md:text-base cursor-pointer pr-1 md:pr-2 appearance-none focus:ring-0">
                    <option value="all">Directory</option>
                    <option value="doctor">Doctors</option>
                    <option value="hospital">Hospitals</option>
                    <option value="lab">Labs</option>
                    <option value="pharmacy">Pharmacies</option>
                    <option value="ambulance">Ambulance</option>
                  </select>
                  <svg className="w-4 h-4 text-slate-400 ml-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                
                <input 
                  type="text" 
                  placeholder="Search for services..." 
                  className="flex-1 bg-transparent border-none outline-none text-slate-800 px-3 md:px-4 py-3 md:py-4 placeholder-slate-400 font-medium text-base md:text-lg min-w-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <button type="submit" className="bg-[#f39c12] hover:bg-[#d68910] text-white font-bold text-sm md:text-base py-3 md:py-4 px-6 md:px-8 rounded-lg transition-colors mr-1 shadow-md hover:shadow-lg">
                  Search
                </button>
              </form>

              {/* Perfect Single-Row CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                <Link href="/join" className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 py-4 shadow-lg transition-all font-bold text-sm md:text-base hover:-translate-y-0.5">
                   <Stethoscope className="w-4 h-4" /> Join as Doctor
                </Link>
                <Link href="/join" className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#c0392b] to-[#a93226] hover:from-[#a93226] hover:to-[#922b21] text-white rounded-lg px-4 py-4 shadow-lg transition-all font-bold text-sm md:text-base hover:-translate-y-0.5">
                   <Building2 className="w-4 h-4" /> List Hospital
                </Link>
                <Link href="/claim" className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#d68910] to-[#b9770e] hover:from-[#b9770e] hover:to-[#9c640c] text-white rounded-lg px-4 py-4 shadow-lg transition-all font-bold text-sm md:text-base hover:-translate-y-0.5">
                   <ShieldCheck className="w-4 h-4" /> Claim Listing
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 pb-20 bg-white pt-32 md:pt-40 lg:pt-48">

        {/* DIRECTORY CATEGORIES */}
        <section className="px-4 sm:px-8 lg:px-16 max-w-[1400px] mx-auto w-full">
          
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 md:gap-8 border-b-0 sm:border-b border-slate-200 mb-8 w-full">
            <button className="relative text-white bg-[#0461be] font-bold text-base sm:text-lg w-full sm:w-auto px-6 py-4 sm:py-3 rounded-full sm:rounded-t-2xl sm:rounded-b-none sm:pb-4 transition-all">
              Browse Directory
              {/* Little down arrow for the active tab (desktop only) */}
              <div className="hidden sm:block absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0461be] rotate-45"></div>
            </button>
            <button className="text-slate-600 bg-slate-100 hover:bg-slate-200 sm:bg-transparent sm:hover:bg-transparent sm:text-slate-500 sm:hover:text-slate-700 font-bold text-base sm:text-lg w-full sm:w-auto px-6 py-4 sm:py-3 rounded-full sm:rounded-none sm:pb-4 transition-all">
              Book Health Services
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            
            <Link href="/doctors" className="flex flex-col items-center justify-center gap-4 bg-white border border-slate-100 hover:border-blue-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-[2rem] p-6 md:p-8 transition-all group">
              <div className="relative w-28 h-28 group-hover:-translate-y-2 transition-transform duration-300">
                <Image src="/home/directory-doctor.png" alt="Doctors" fill className="object-contain drop-shadow-lg" />
              </div>
              <span className="font-bold text-lg text-slate-800">Doctors</span>
            </Link>

            <Link href="/hospitals" className="flex flex-col items-center justify-center gap-4 bg-white border border-slate-100 hover:border-blue-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-[2rem] p-6 md:p-8 transition-all group">
              <div className="relative w-28 h-28 group-hover:-translate-y-2 transition-transform duration-300">
                <Image src="/home/directory-hospital.png" alt="Hospitals" fill className="object-contain drop-shadow-lg" />
              </div>
              <span className="font-bold text-lg text-slate-800">Hospitals</span>
            </Link>

            <Link href="/pharmacies" className="flex flex-col items-center justify-center gap-4 bg-white border border-slate-100 hover:border-blue-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-[2rem] p-6 md:p-8 transition-all group">
              <div className="relative w-28 h-28 group-hover:-translate-y-2 transition-transform duration-300">
                <Image src="/home/directory-pharmacy.png" alt="Pharmacies" fill className="object-contain drop-shadow-lg" />
              </div>
              <span className="font-bold text-lg text-slate-800">Pharmacies</span>
            </Link>

            <Link href="/labs" className="flex flex-col items-center justify-center gap-4 bg-white border border-slate-100 hover:border-blue-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-[2rem] p-6 md:p-8 transition-all group">
              <div className="relative w-28 h-28 group-hover:-translate-y-2 transition-transform duration-300">
                <Image src="/home/directory-lab.png" alt="Laboratories" fill className="object-contain drop-shadow-lg" />
              </div>
              <span className="font-bold text-lg text-slate-800">Laboratories</span>
            </Link>

            <Link href="/ambulances" className="flex flex-col items-center justify-center gap-4 bg-white border border-slate-100 hover:border-blue-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-[2rem] p-6 md:p-8 transition-all group">
              <div className="relative w-28 h-28 group-hover:-translate-y-2 transition-transform duration-300">
                <Image src="/home/directory-ambulance.png" alt="Ambulances" fill className="object-contain drop-shadow-lg" />
              </div>
              <span className="font-bold text-lg text-slate-800">Ambulances</span>
            </Link>

          </div>
        </section>

        {/* --- AD SLOT: GRID (3 TICKETS) --- */}
        {platformAds['ad_slot_home_grid'] && platformAds['ad_slot_home_grid'].length > 0 && (
          <section className="px-4 sm:px-6 max-w-[1400px] mx-auto w-full mt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {platformAds['ad_slot_home_grid'].slice(0, 3).map((ad: any, idx: number) => (
                <div key={idx} className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-white/10 flex items-center justify-center min-h-[150px] relative">
                  {ad.type === 'image' ? (
                    <a href={ad.linkUrl} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                      <img src={ad.imageUrl} alt="Advertisement" className="w-full h-auto max-h-[250px] object-contain" />
                    </a>
                  ) : ad.type === 'split' ? (
                    <div className="flex flex-col w-full h-full">
                      <div className="w-full h-1/2 flex items-center justify-center p-4 bg-slate-900/50">
                        <img src={ad.imageUrl} alt="Advertisement" className="w-full h-auto max-h-[150px] object-contain" />
                      </div>
                      <div className="w-full h-1/2 flex flex-col justify-center p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-t border-white/5">
                        <h3 className="text-xl font-black text-white mb-2 leading-tight">{ad.headline}</h3>
                        <p className="text-slate-300 text-sm mb-4 line-clamp-2">{ad.subtext}</p>
                        <a href={ad.linkUrl} target="_blank" rel="noreferrer" className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-2 px-6 rounded-full transition-colors w-fit text-xs uppercase tracking-widest shadow-lg">
                          {ad.buttonText}
                        </a>
                      </div>
                    </div>
                  ) : ad.type === 'slider' ? (
                    <AdSliderRenderer images={ad.sliderImages || []} linkUrl={ad.linkUrl} animationStyle={ad.animationStyle || 'fade'} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: ad.htmlCode }} />
                  )}
                  <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[8px] uppercase font-bold text-slate-400">Ad</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- AD SLOT: DISTRIBUTED 1 --- */}
        {platformAds['ad_slot_home_distributed_1'] && platformAds['ad_slot_home_distributed_1'].length > 0 && (
          <section className="px-4 sm:px-6 max-w-[1400px] mx-auto w-full mt-10">
            <div className="w-full bg-slate-900 rounded-[2rem] overflow-hidden shadow-xl border border-white/10 flex items-center justify-center min-h-[120px] relative">
              {platformAds['ad_slot_home_distributed_1'][0].type === 'image' ? (
                <a href={platformAds['ad_slot_home_distributed_1'][0].linkUrl} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                  <img src={platformAds['ad_slot_home_distributed_1'][0].imageUrl} alt="Advertisement" className="w-full h-auto max-h-[250px] object-contain" />
                </a>
              ) : platformAds['ad_slot_home_distributed_1'][0].type === 'split' ? (
                <div className="flex flex-col md:flex-row w-full h-full items-stretch">
                  <div className="w-full md:w-1/3 flex items-center justify-center p-4 bg-slate-900/50">
                    <img src={platformAds['ad_slot_home_distributed_1'][0].imageUrl} alt="Advertisement" className="w-full h-auto max-h-[200px] object-contain" />
                  </div>
                  <div className="w-full md:w-2/3 flex flex-col justify-center p-6 lg:p-8 bg-gradient-to-r from-slate-800 to-slate-900 border-l border-white/5">
                    <h2 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight">{platformAds['ad_slot_home_distributed_1'][0].headline}</h2>
                    <p className="text-slate-300 mb-6">{platformAds['ad_slot_home_distributed_1'][0].subtext}</p>
                    <a href={platformAds['ad_slot_home_distributed_1'][0].linkUrl} target="_blank" rel="noreferrer" className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-2.5 px-6 rounded-full transition-colors w-fit text-xs uppercase tracking-widest shadow-lg">
                      {platformAds['ad_slot_home_distributed_1'][0].buttonText}
                    </a>
                  </div>
                </div>
              ) : platformAds['ad_slot_home_distributed_1'][0].type === 'slider' ? (
                <AdSliderRenderer images={platformAds['ad_slot_home_distributed_1'][0].sliderImages || []} linkUrl={platformAds['ad_slot_home_distributed_1'][0].linkUrl} animationStyle={platformAds['ad_slot_home_distributed_1'][0].animationStyle || 'fade'} />
              ) : (
                <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: platformAds['ad_slot_home_distributed_1'][0].htmlCode }} />
              )}
              <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-400">Sponsored</span>
            </div>
          </section>
        )}



        {/* --- AD SLOT: DISTRIBUTED 2 --- */}
        {platformAds['ad_slot_home_distributed_2'] && platformAds['ad_slot_home_distributed_2'].length > 0 && (
          <section className="px-4 sm:px-6 max-w-[1400px] mx-auto w-full mt-10">
            <div className="w-full bg-slate-900 rounded-[2rem] overflow-hidden shadow-xl border border-white/10 flex items-center justify-center min-h-[120px] relative">
              {platformAds['ad_slot_home_distributed_2'][0].type === 'image' ? (
                <a href={platformAds['ad_slot_home_distributed_2'][0].linkUrl} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                  <img src={platformAds['ad_slot_home_distributed_2'][0].imageUrl} alt="Advertisement" className="w-full h-auto max-h-[250px] object-contain" />
                </a>
              ) : platformAds['ad_slot_home_distributed_2'][0].type === 'split' ? (
                <div className="flex flex-col md:flex-row w-full h-full items-stretch">
                  <div className="w-full md:w-1/3 flex items-center justify-center p-4 bg-slate-900/50">
                    <img src={platformAds['ad_slot_home_distributed_2'][0].imageUrl} alt="Advertisement" className="w-full h-auto max-h-[200px] object-contain" />
                  </div>
                  <div className="w-full md:w-2/3 flex flex-col justify-center p-6 lg:p-8 bg-gradient-to-r from-slate-800 to-slate-900 border-l border-white/5">
                    <h2 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight">{platformAds['ad_slot_home_distributed_2'][0].headline}</h2>
                    <p className="text-slate-300 mb-6">{platformAds['ad_slot_home_distributed_2'][0].subtext}</p>
                    <a href={platformAds['ad_slot_home_distributed_2'][0].linkUrl} target="_blank" rel="noreferrer" className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-2.5 px-6 rounded-full transition-colors w-fit text-xs uppercase tracking-widest shadow-lg">
                      {platformAds['ad_slot_home_distributed_2'][0].buttonText}
                    </a>
                  </div>
                </div>
              ) : platformAds['ad_slot_home_distributed_2'][0].type === 'slider' ? (
                <AdSliderRenderer images={platformAds['ad_slot_home_distributed_2'][0].sliderImages || []} linkUrl={platformAds['ad_slot_home_distributed_2'][0].linkUrl} animationStyle={platformAds['ad_slot_home_distributed_2'][0].animationStyle || 'fade'} />
              ) : (
                <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: platformAds['ad_slot_home_distributed_2'][0].htmlCode }} />
              )}
              <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-400">Sponsored</span>
            </div>
          </section>
        )}

        {/* B2B PROVIDER CARDS (Elite Onboarding Experience) */}
        <section className="px-4 sm:px-8 lg:px-16 max-w-[1400px] mx-auto w-full mt-32 mb-20 relative">
          
          <div className="text-center mb-16 relative">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight">
              Grow Your Practice with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 font-serif italic font-normal">dehapa</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg mt-4 max-w-2xl mx-auto">Join thousands of top-tier healthcare providers delivering better care.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
            
            {/* Doctor Card */}
            <div className="group relative bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden flex flex-col sm:flex-row lg:flex-col shadow-[0_15px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(9,125,235,0.12)] transition-all duration-500 hover:-translate-y-2">
               <div className="absolute inset-0 bg-gradient-to-br from-[#eef7ff] via-white to-white opacity-100 group-hover:opacity-0 transition-opacity duration-500"></div>
               <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-blue-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               
               <div className="w-full sm:w-[45%] lg:w-full h-64 sm:h-auto lg:h-72 relative overflow-hidden flex items-end justify-center z-10 p-6">
                  {/* Precise CSS Framing to crop out the 2nd AI figure */}
                  <div className="relative w-full h-[120%] group-hover:scale-105 group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                    <Image src="/home/provider-doctor-.png" alt="For Doctors" fill className="object-cover object-[20%_100%] scale-[1.3] drop-shadow-xl" />
                  </div>
               </div>
               
               <div className="w-full sm:w-[55%] lg:w-full p-8 lg:p-10 flex flex-col justify-center relative z-10 bg-white/50 backdrop-blur-sm lg:bg-transparent">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">For Doctors</h3>
                  <p className="text-slate-600 text-sm md:text-base mb-8 leading-relaxed font-medium">Elevate your practice, manage appointments, and connect seamlessly with patients.</p>
                  
                  <Link href="/join" className="relative overflow-hidden bg-white text-blue-600 font-bold py-3 px-8 rounded-full w-fit shadow-md border border-blue-100 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-blue-500 group-hover:text-white group-hover:shadow-[0_10px_20px_rgba(9,125,235,0.3)] transition-all duration-300 flex items-center gap-2">
                    <span>Get Started</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
               </div>
            </div>

            {/* Hospital Card */}
            <div className="group relative bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden flex flex-col sm:flex-row lg:flex-col shadow-[0_15px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(4,97,190,0.12)] transition-all duration-500 hover:-translate-y-2 lg:-mt-8">
               <div className="absolute inset-0 bg-gradient-to-br from-[#fff4e5] via-white to-white opacity-100 group-hover:opacity-0 transition-opacity duration-500"></div>
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-indigo-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               
               <div className="w-full sm:w-[45%] lg:w-full h-64 sm:h-auto lg:h-72 relative overflow-hidden flex items-end justify-center z-10 p-6">
                  {/* Precise CSS Framing to crop out the 2nd AI figure */}
                  <div className="relative w-full h-[120%] group-hover:scale-105 group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                    <Image src="/home/provider-hospital.png" alt="For Hospitals" fill className="object-cover object-[20%_100%] scale-[1.3] drop-shadow-xl" />
                  </div>
               </div>
               
               <div className="w-full sm:w-[55%] lg:w-full p-8 lg:p-10 flex flex-col justify-center relative z-10 bg-white/50 backdrop-blur-sm lg:bg-transparent">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">For Hospitals</h3>
                  <p className="text-slate-600 text-sm md:text-base mb-8 leading-relaxed font-medium">List your facilities, manage departments, and streamline patient onboarding.</p>
                  
                  <Link href="/join" className="relative overflow-hidden bg-white text-indigo-600 font-bold py-3 px-8 rounded-full w-fit shadow-md border border-indigo-100 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-indigo-500 group-hover:text-white group-hover:shadow-[0_10px_20px_rgba(79,70,229,0.3)] transition-all duration-300 flex items-center gap-2">
                    <span>Learn More</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
               </div>
            </div>

            {/* Already Listed Card */}
            <div className="group relative bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden flex flex-col sm:flex-row lg:flex-col shadow-[0_15px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(243,156,18,0.12)] transition-all duration-500 hover:-translate-y-2">
               <div className="absolute inset-0 bg-gradient-to-br from-[#fff7dd] via-white to-white opacity-100 group-hover:opacity-0 transition-opacity duration-500"></div>
               <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-orange-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               
               <div className="w-full sm:w-[45%] lg:w-full h-64 sm:h-auto lg:h-72 relative overflow-hidden flex items-end justify-center z-10 p-6">
                  {/* Precise CSS Framing to isolate the middle AI figure from the 3 figures */}
                  <div className="relative w-full h-[120%] group-hover:scale-105 group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                    <Image src="/home/provider-alredylisted.png" alt="Already Listed" fill className="object-cover object-[50%_100%] scale-[1.5] drop-shadow-xl" />
                  </div>
               </div>
               
               <div className="w-full sm:w-[55%] lg:w-full p-8 lg:p-10 flex flex-col justify-center relative z-10 bg-white/50 backdrop-blur-sm lg:bg-transparent">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-3 group-hover:text-orange-500 transition-colors">Already Listed?</h3>
                  <p className="text-slate-600 text-sm md:text-base mb-8 leading-relaxed font-medium">Claim your existing profile, update your details, and take control of your reputation.</p>
                  
                  <Link href="/claim" className="relative overflow-hidden bg-white text-orange-500 font-bold py-3 px-8 rounded-full w-fit shadow-md border border-orange-100 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-orange-400 group-hover:text-white group-hover:shadow-[0_10px_20px_rgba(243,156,18,0.3)] transition-all duration-300 flex items-center gap-2">
                    <span>Claim Now</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
               </div>
            </div>

          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="px-4 sm:px-8 lg:px-16 max-w-[1400px] mx-auto w-full mt-32 mb-20 relative">
          <div className="text-center mb-16 relative">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800">
              How <span className="font-serif italic text-blue-600 font-normal">dehapa</span> Works
            </h2>
            {/* Ask AI Bubble */}
            <div className="hidden md:flex absolute right-0 top-0 items-center gap-3 bg-white border border-slate-200 shadow-md rounded-full pl-6 pr-2 py-2 cursor-pointer hover:shadow-lg transition-all">
               <span className="font-bold text-slate-700 text-sm">Ask dehapa AI</span>
               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                 <img src="/logo.png" alt="AI" className="w-8 h-8 object-contain" />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <span className="text-2xl font-black text-slate-800 absolute top-0 left-[20%] z-20">1.</span>
              <div className="w-40 h-40 rounded-full bg-blue-50/50 flex items-center justify-center mb-6 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <Image src="/home/how-step-1.png" alt="Sign Up" fill className="object-contain p-2" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Sign Up & Create Profile</h4>
              <p className="text-slate-500 text-sm max-w-[250px]">Easy registration for doctors & hospitals.</p>
            </div>

            {/* Arrow 1 (Desktop) */}
            <div className="hidden md:block absolute top-20 left-[30%] w-[10%] text-slate-300">
              <svg className="w-full h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <span className="text-2xl font-black text-slate-800 absolute top-0 left-[20%] z-20">2.</span>
              <div className="w-40 h-40 rounded-full bg-blue-50/50 flex items-center justify-center mb-6 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <Image src="/home/how-step-2.png" alt="Get Verified" fill className="object-contain p-2" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Get Verified & Listed</h4>
              <p className="text-slate-500 text-sm max-w-[250px]">Quick verification to get you online fast.</p>
            </div>

            {/* Arrow 2 (Desktop) */}
            <div className="hidden md:block absolute top-20 right-[30%] w-[10%] text-slate-300">
              <svg className="w-full h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <span className="text-2xl font-black text-slate-800 absolute top-0 left-[20%] z-20">3.</span>
              <div className="w-40 h-40 rounded-full bg-blue-50/50 flex items-center justify-center mb-6 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <Image src="/home/how-step-3.png" alt="Connect with Patients" fill className="object-contain p-2" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Connect with Patients</h4>
              <p className="text-slate-500 text-sm max-w-[250px]">Start receiving bookings & inquiries.</p>
            </div>
          </div>
        </section>

        {/* READY TO JOIN FOOTER CTA */}
        <section className="px-4 sm:px-8 lg:px-16 max-w-[1400px] mx-auto w-full mt-24 mb-16 text-center">
           <div className="flex items-center justify-center gap-4 mb-10">
             <div className="h-px bg-slate-200 w-32"></div>
             <h2 className="text-2xl font-black text-slate-800">Ready to Join <span className="font-serif italic text-blue-600 font-normal">dehapa</span>?</h2>
             <div className="h-px bg-slate-200 w-32"></div>
           </div>
           
           <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link href="/join" className="bg-blue-700 hover:bg-blue-600 text-white rounded-xl px-10 py-4 font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><Stethoscope className="w-4 h-4 text-white" /></div>
                Register as Doctor
             </Link>
             <Link href="/join" className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white rounded-xl px-10 py-4 font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><Building2 className="w-4 h-4 text-white" /></div>
                Add Your Hospital
             </Link>
           </div>
        </section>

        {/* --- AD SLOT: DISTRIBUTED 3 (ABOVE FOOTER) --- */}
        {platformAds['ad_slot_home_distributed_3'] && platformAds['ad_slot_home_distributed_3'].length > 0 && (
          <section className="px-4 sm:px-6 max-w-[1400px] mx-auto w-full mt-16 mb-4">
            <div className="w-full bg-slate-900 rounded-[2rem] overflow-hidden shadow-xl border border-white/10 flex items-center justify-center min-h-[120px] relative">
              {platformAds['ad_slot_home_distributed_3'][0].type === 'image' ? (
                <a href={platformAds['ad_slot_home_distributed_3'][0].linkUrl} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                  <img src={platformAds['ad_slot_home_distributed_3'][0].imageUrl} alt="Advertisement" className="w-full h-auto max-h-[250px] object-contain" />
                </a>
              ) : platformAds['ad_slot_home_distributed_3'][0].type === 'split' ? (
                <div className="flex flex-col md:flex-row w-full h-full items-stretch">
                  <div className="w-full md:w-1/3 flex items-center justify-center p-4 bg-slate-900/50">
                    <img src={platformAds['ad_slot_home_distributed_3'][0].imageUrl} alt="Advertisement" className="w-full h-auto max-h-[200px] object-contain" />
                  </div>
                  <div className="w-full md:w-2/3 flex flex-col justify-center p-6 lg:p-8 bg-gradient-to-r from-slate-800 to-slate-900 border-l border-white/5">
                    <h2 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight">{platformAds['ad_slot_home_distributed_3'][0].headline}</h2>
                    <p className="text-slate-300 mb-6">{platformAds['ad_slot_home_distributed_3'][0].subtext}</p>
                    <a href={platformAds['ad_slot_home_distributed_3'][0].linkUrl} target="_blank" rel="noreferrer" className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-2.5 px-6 rounded-full transition-colors w-fit text-xs uppercase tracking-widest shadow-lg">
                      {platformAds['ad_slot_home_distributed_3'][0].buttonText}
                    </a>
                  </div>
                </div>
              ) : platformAds['ad_slot_home_distributed_3'][0].type === 'slider' ? (
                <AdSliderRenderer images={platformAds['ad_slot_home_distributed_3'][0].sliderImages || []} linkUrl={platformAds['ad_slot_home_distributed_3'][0].linkUrl} animationStyle={platformAds['ad_slot_home_distributed_3'][0].animationStyle || 'fade'} />
              ) : (
                <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: platformAds['ad_slot_home_distributed_3'][0].htmlCode }} />
              )}
              <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-400">Sponsored</span>
            </div>
          </section>
        )}

      </div>

      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative bg-[#050B14] border border-white/20 shadow-2xl rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
            
            <button 
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-1 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-4 border border-cyan-400/30 relative z-10 backdrop-blur-md">
                <QrCode className="w-6 h-6 text-cyan-400" />
              </div>
              
              <h2 className="text-xl font-black text-white mb-1">My Health QR</h2>
              <p className="text-xs text-slate-400 mb-8 max-w-[250px] font-medium">
                Show this code at any Sovereign Network facility for identity verification.
              </p>
              
              <div className="bg-white p-4 rounded-2xl shadow-[0_0_30px_rgba(45,212,191,0.2)] border border-teal-200 mb-6 relative z-10">
                <QRCode 
                  value={`dehapa-auth://scan?uid=${encodeURIComponent(userUid || "guest")}`}
                  size={200}
                  level="H"
                />
              </div>
              
              <div className="inline-block bg-white/10 px-4 py-2 rounded-full border border-white/20 relative z-10 mb-4 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold font-mono">
                  ID: {userUid ? userUid.split('@')[0] : "UNVERIFIED"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
      />

    </main>
  );
}
