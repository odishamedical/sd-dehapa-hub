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
      <section className="relative pt-24 pb-32 z-10 flex flex-col items-center justify-start min-h-[70vh] border-b border-slate-100 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full object-cover z-0">
          <Image src="/home/hero-home.png" alt="Dehapa Hero Background" fill className="object-cover object-top opacity-90" priority />
        </div>
        
        {/* Overlay gradient to ensure text readability if needed */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-transparent z-0"></div>

        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col items-center text-center relative z-10 mt-8">
          
          <h1 className="text-4xl md:text-5xl lg:text-[54px] font-bold text-slate-800 tracking-tight mb-4 drop-shadow-sm">
            Connecting You to Better Health
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 font-medium">
            Find the best healthcare services near you.
          </p>

          {/* Pill Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-4xl relative shadow-xl rounded-full bg-white border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-400/20 transition-all flex items-center p-2 mb-6">
            <Search className="w-6 h-6 text-blue-500 ml-4 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search doctors, hospitals, labs, pharmacies..." 
              className="flex-1 bg-transparent border-none outline-none text-slate-800 px-2 py-3 md:py-4 placeholder-slate-400 font-medium text-lg md:text-xl min-w-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Mockup has a mic icon */}
            <button type="button" className="p-3 hover:bg-slate-50 rounded-full transition-colors mr-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            </button>
          </form>

          {/* Search Toggles */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-16">
            <button className="bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-lg px-4 md:px-6 py-2.5 text-sm font-bold text-slate-700 flex items-center gap-2 transition-all">
              <span className="text-blue-600">🩺</span> Doctors
            </button>
            <button className="bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-lg px-4 md:px-6 py-2.5 text-sm font-bold text-slate-700 flex items-center gap-2 transition-all">
              <span className="text-blue-600">🏥</span> Hospitals
            </button>
            <button className="bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-lg px-4 md:px-6 py-2.5 text-sm font-bold text-slate-700 flex items-center gap-2 transition-all">
              <span className="text-blue-600">💊</span> Pharmacies
            </button>
            <button className="bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-lg px-4 md:px-6 py-2.5 text-sm font-bold text-slate-700 flex items-center gap-2 transition-all">
              <span className="text-blue-600">🔬</span> Labs Ambulances
            </button>
          </div>

          {/* Floating CTAs */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-12 w-full max-w-5xl">
            <Link href="/join" className="flex-1 min-w-[200px] bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-2xl p-4 md:p-5 flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(220,38,38,0.2)] hover:shadow-[0_15px_25px_rgba(220,38,38,0.3)] transition-all group">
               <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Stethoscope className="w-5 h-5 text-white" /></div>
               <span className="font-bold text-lg md:text-xl">Join as Doctor</span>
            </Link>
            <Link href="/join" className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white rounded-2xl p-4 md:p-5 flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(29,78,216,0.2)] hover:shadow-[0_15px_25px_rgba(29,78,216,0.3)] transition-all group">
               <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
               <span className="font-bold text-lg md:text-xl">List Your Hospital</span>
            </Link>
            <Link href="/claim" className="flex-1 min-w-[200px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-2xl p-4 md:p-5 flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(249,115,22,0.2)] hover:shadow-[0_15px_25px_rgba(249,115,22,0.3)] transition-all group">
               <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-white" /></div>
               <span className="font-bold text-lg md:text-xl">Claim Your Listing</span>
            </Link>
          </div>

        </div>
      </section>

      <div className="relative z-10 pb-20 bg-white">

        {/* --- AD SLOT: CAROUSEL --- */}
        {platformAds['ad_slot_home_carousel'] && platformAds['ad_slot_home_carousel'].length > 0 && (
          <section className="px-4 sm:px-8 lg:px-16 2xl:px-24 max-w-[1920px] mx-auto w-full mb-10">
            <div className="w-full h-auto min-h-[120px] md:min-h-[250px] bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center relative group">
              {platformAds['ad_slot_home_carousel'][0].type === 'image' ? (
                <a href={platformAds['ad_slot_home_carousel'][0].linkUrl} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                  <img src={platformAds['ad_slot_home_carousel'][0].imageUrl} alt="Advertisement" className="w-full h-auto max-h-[300px] object-contain" />
                </a>
              ) : platformAds['ad_slot_home_carousel'][0].type === 'split' ? (
                <div className="flex flex-col md:flex-row w-full h-full items-stretch">
                  <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-slate-900/50">
                    <img src={platformAds['ad_slot_home_carousel'][0].imageUrl} alt="Advertisement" className="w-full h-auto max-h-[250px] object-contain" />
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col justify-center p-8 lg:p-12 bg-gradient-to-br from-slate-800 to-slate-900 border-l border-white/5">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-4 leading-tight">{platformAds['ad_slot_home_carousel'][0].headline}</h2>
                    <p className="text-slate-300 md:text-lg mb-8">{platformAds['ad_slot_home_carousel'][0].subtext}</p>
                    <a href={platformAds['ad_slot_home_carousel'][0].linkUrl} target="_blank" rel="noreferrer" className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 px-8 rounded-full transition-colors w-fit shadow-[0_0_20px_rgba(20,184,166,0.3)] text-sm uppercase tracking-widest">
                      {platformAds['ad_slot_home_carousel'][0].buttonText}
                    </a>
                  </div>
                </div>
              ) : platformAds['ad_slot_home_carousel'][0].type === 'slider' ? (
                <AdSliderRenderer images={platformAds['ad_slot_home_carousel'][0].sliderImages || []} linkUrl={platformAds['ad_slot_home_carousel'][0].linkUrl} animationStyle={platformAds['ad_slot_home_carousel'][0].animationStyle || 'fade'} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900" dangerouslySetInnerHTML={{ __html: platformAds['ad_slot_home_carousel'][0].htmlCode }} />
              )}
              <span className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-400">Sponsored</span>
            </div>
          </section>
        )}

        {/* DIRECTORY CATEGORIES */}
        <section className="px-4 sm:px-8 lg:px-16 max-w-[1400px] mx-auto w-full mt-24">
          
          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
            <button className="pb-4 border-b-4 border-blue-600 text-blue-700 font-black text-lg whitespace-nowrap px-4">
              Browse Directory
            </button>
            <button className="pb-4 text-slate-500 hover:text-slate-700 font-bold text-lg whitespace-nowrap px-4">
              Book Health Services
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            
            <Link href="/doctors" className="flex flex-col items-center justify-center gap-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xl rounded-3xl p-6 md:p-8 transition-all group">
              <div className="relative w-24 h-24 group-hover:-translate-y-2 transition-transform duration-300">
                <Image src="/home/directory-doctor.png" alt="Doctors" fill className="object-contain drop-shadow-md" />
              </div>
              <span className="font-bold text-lg text-slate-800">Doctors</span>
            </Link>

            <Link href="/hospitals" className="flex flex-col items-center justify-center gap-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xl rounded-3xl p-6 md:p-8 transition-all group">
              <div className="relative w-24 h-24 group-hover:-translate-y-2 transition-transform duration-300">
                <Image src="/home/directory-hospital.png" alt="Hospitals" fill className="object-contain drop-shadow-md" />
              </div>
              <span className="font-bold text-lg text-slate-800">Hospitals</span>
            </Link>

            <Link href="/pharmacies" className="flex flex-col items-center justify-center gap-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xl rounded-3xl p-6 md:p-8 transition-all group">
              <div className="relative w-24 h-24 group-hover:-translate-y-2 transition-transform duration-300">
                <Image src="/home/directory-pharmacy.png" alt="Pharmacies" fill className="object-contain drop-shadow-md" />
              </div>
              <span className="font-bold text-lg text-slate-800">Pharmacies</span>
            </Link>

            <Link href="/labs" className="flex flex-col items-center justify-center gap-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xl rounded-3xl p-6 md:p-8 transition-all group">
              <div className="relative w-24 h-24 group-hover:-translate-y-2 transition-transform duration-300">
                <Image src="/home/directory-lab.png" alt="Laboratories" fill className="object-contain drop-shadow-md" />
              </div>
              <span className="font-bold text-lg text-slate-800">Laboratories</span>
            </Link>

            <Link href="/ambulances" className="flex flex-col items-center justify-center gap-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xl rounded-3xl p-6 md:p-8 transition-all group">
              <div className="relative w-24 h-24 group-hover:-translate-y-2 transition-transform duration-300">
                <Image src="/home/directory-ambulance.png" alt="Ambulances" fill className="object-contain drop-shadow-md" />
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

        {/* B2B PROVIDER CARDS */}
        <section className="px-4 sm:px-8 lg:px-16 max-w-[1400px] mx-auto w-full mt-24 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Doctor Card */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-3xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-xl transition-all">
               <div className="w-full sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-white/50">
                  <Image src="/home/provider-doctor-.png" alt="For Doctors" fill className="object-cover object-center scale-110" />
               </div>
               <div className="w-full sm:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">For Doctors</h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">Register your practice and connect with more patients.</p>
                  <Link href="/join" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-2.5 px-6 rounded-full w-fit shadow-md hover:shadow-lg transition-all text-sm">
                    Get Started
                  </Link>
               </div>
            </div>

            {/* Hospital Card */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-xl transition-all">
               <div className="w-full sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-white/50">
                  <Image src="/home/provider-hospital.png" alt="For Hospitals" fill className="object-cover object-center scale-110" />
               </div>
               <div className="w-full sm:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">For Hospitals</h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">List your hospital and manage your profile easily.</p>
                  <Link href="/join" className="bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold py-2.5 px-6 rounded-full w-fit shadow-md hover:shadow-lg transition-all text-sm">
                    Learn More
                  </Link>
               </div>
            </div>

            {/* Already Listed Card */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-3xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-xl transition-all">
               <div className="w-full sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-white/50">
                  <Image src="/home/provider-alredylisted.png" alt="Already Listed" fill className="object-cover object-center scale-110" />
               </div>
               <div className="w-full sm:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">Already Listed?</h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">Claim your existing profile and update your details.</p>
                  <Link href="/claim" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-2.5 px-6 rounded-full w-fit shadow-md hover:shadow-lg transition-all text-sm">
                    Claim Now
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
