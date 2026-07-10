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
  "Consult Top Indian Doctors from Anywhere.",
  "Instantly Book ICU Beds in Emergencies.",
  "Secure Your Lifetime Health Records.",
  "Access the Best Specialists Globally."
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
      router.push('/ambulance'); 
    }, 1500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#050B14] font-sans text-white selection:bg-teal-500/30 overflow-x-hidden">

      {/* MESH GRADIENT BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-teal-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/30 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[20%] w-[40vw] h-[40vw] bg-cyan-600/20 rounded-full blur-[100px]"></div>
      </div>
      
      {/* GRID OVERLAY */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="relative z-10 pb-20">
        
        {/* HERO & COMMAND CENTER (COMPACT & SEO OPTIMIZED) */}
        <section className="pt-10 pb-6 px-4 sm:px-6 max-w-[1400px] mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-teal-300 font-bold text-xs uppercase tracking-widest mb-4 backdrop-blur-md">
            <Activity className="w-4 h-4" /> Sovereign Health Network
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-3 tracking-tight drop-shadow-lg leading-tight">
            The World's Most Advanced <br className="hidden sm:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">Medical Network.</span>
          </h1>
          
          {/* Dynamic SEO Typing Text */}
          <div className="h-8 mb-6 flex items-center justify-center">
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-medium">
              {displayText}<span className="inline-block w-0.5 h-5 ml-1 bg-teal-400 animate-pulse"></span>
            </p>
          </div>

          {/* Search Console Container */}
          <div className="w-full max-w-3xl mb-4 flex flex-col sm:flex-row gap-3">
            
            {/* Master Search Bar (Glass) */}
            <form onSubmit={handleSearch} className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_40px_rgba(20,184,166,0.15)] rounded-2xl sm:rounded-full p-2 flex items-center relative transition-all focus-within:bg-white/15 focus-within:border-teal-400/50 focus-within:shadow-[0_0_50px_rgba(45,212,191,0.25)]">
              <div className="pl-4 pr-3 text-teal-400">
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What kind of care do you need today?" 
                className="flex-1 bg-transparent border-none outline-none text-white text-base sm:text-lg placeholder:text-slate-400 focus:ring-0 min-w-0" 
              />
              <button 
                type="submit" 
                className="ml-2 px-5 py-3 sm:py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold rounded-xl sm:rounded-full shadow-lg shrink-0 transition-all text-sm sm:text-base"
              >
                Search
              </button>
            </form>
            
            {/* Separate QR Scanner Button */}
            <button 
              onClick={() => setIsScannerOpen(true)} 
              className="h-14 sm:h-[68px] aspect-square bg-white/10 border border-white/20 text-white rounded-2xl sm:rounded-full hover:bg-white/20 hover:border-cyan-400 transition-all flex items-center justify-center backdrop-blur-md shrink-0 shadow-lg mx-auto sm:mx-0" 
              title="Scan QR Identity"
            >
              <QrCode className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>

          {/* Global Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
              <span>🇮🇳</span> Access World-Renowned Indian Doctors
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
              <Globe2 className="w-4 h-4 text-cyan-400" /> Available in 150+ Countries
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-amber-400" /> Instant Live Consults
            </div>
          </div>
        </section>

        {/* --- AD SLOT: CAROUSEL --- */}
        {platformAds['ad_slot_home_carousel'] && platformAds['ad_slot_home_carousel'].length > 0 && (
          <section className="px-4 sm:px-6 max-w-[1400px] mx-auto w-full mb-10">
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
                <AdSliderRenderer images={platformAds['ad_slot_home_carousel'][0].sliderImages || []} linkUrl={platformAds['ad_slot_home_carousel'][0].linkUrl} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900" dangerouslySetInnerHTML={{ __html: platformAds['ad_slot_home_carousel'][0].htmlCode }} />
              )}
              <span className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-400">Sponsored</span>
            </div>
          </section>
        )}

        {/* THE MASTER BENTO BOX GRID */}
        <section className="px-4 sm:px-6 max-w-[1400px] mx-auto w-full">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[250px]">
            
            {/* URGENT CARE BENTO */}
            {/* 1. Large Hero Video Consult (2x2) */}
            <Link href="/urgent-care" className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 relative rounded-[2rem] overflow-hidden group shadow-lg">
              <Image src="/images/cards/card_video_consult.png" alt="Video Consult" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/40 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/20 rounded-[2rem] z-20 group-hover:border-cyan-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transition-colors"></div>
              <div className="absolute top-6 left-6 z-30 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-400 font-bold text-xs uppercase tracking-widest backdrop-blur-md">
                <AlertCircle className="w-4 h-4 animate-pulse" /> Emergency Line
              </div>
              <div className="absolute bottom-0 left-0 w-full p-8 z-30">
                <div className="w-16 h-16 rounded-3xl bg-cyan-500/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mb-6 backdrop-blur-xl">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-4xl font-black text-white mb-2 leading-tight">Instant Video<br/>Consult</h3>
                <p className="text-slate-200 text-lg font-medium">Join the Live Queue and see a doctor right now.</p>
              </div>
            </Link>

            {/* 2. Vertical Ambulance (1x2) */}
            <button onClick={handlePingAmbulance} className="text-left col-span-1 md:col-span-1 lg:col-span-1 row-span-2 relative rounded-[2rem] overflow-hidden group shadow-lg">
              <Image src="/images/cards/card_ambulance.png" alt="Ambulance" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/60 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/20 rounded-[2rem] z-20 group-hover:border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.3)] transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 z-30">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 border border-rose-400 shadow-[0_0_20px_rgba(225,29,72,0.6)] flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {isPinging ? <Activity className="w-7 h-7 animate-spin" /> : <Ambulance className="w-7 h-7" />}
                </div>
                <h3 className="text-3xl font-black text-white mb-2 leading-tight">Live<br/>Ambulance</h3>
                <p className="text-slate-200 text-sm font-medium">Ping SOS & track units.</p>
              </div>
            </button>

            {/* 3. Urgent Doctor (1x1 Square) */}
            <Link href="/search?type=doctor&urgent=true" className="col-span-1 row-span-1 relative rounded-[2rem] overflow-hidden group shadow-lg">
              <Image src="/images/cards/card_urgent_doctor.png" alt="Urgent Doctor" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/70 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/20 rounded-[2rem] z-20 group-hover:border-rose-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 z-30">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/30 border border-rose-400/50 flex items-center justify-center text-rose-300 mb-3 backdrop-blur-xl">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white leading-tight">Doctor Callback</h3>
              </div>
            </Link>

            {/* 4. Urgent ICU Book (1x1 Square) */}
            <Link href="/search?type=hospital&beds=icu" className="col-span-1 row-span-1 relative rounded-[2rem] overflow-hidden group shadow-lg">
              <Image src="/images/cards/card_icu_bed.png" alt="ICU Bed" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/70 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/20 rounded-[2rem] z-20 group-hover:border-blue-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 z-30">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/30 border border-blue-400/50 flex items-center justify-center text-blue-300 mb-3 backdrop-blur-xl">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white leading-tight">ICU Bed Search</h3>
              </div>
            </Link>


            {/* ROUTINE CARE BENTO */}
            {/* 5. Search Directory (2x1 Wide) */}
            <Link href="/search" className="col-span-1 md:col-span-2 row-span-1 relative rounded-[2rem] overflow-hidden group shadow-lg">
              <Image src="/images/cards/card_search_directory.png" alt="Search Directory" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/60 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/20 rounded-[2rem] z-20 group-hover:border-teal-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 z-30 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/30 border border-teal-400/50 flex items-center justify-center text-teal-300 backdrop-blur-xl shrink-0">
                  <Search className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-1">Search Directory</h3>
                  <p className="text-slate-200 text-sm font-medium">Find verified doctors, clinics, and hospitals.</p>
                </div>
              </div>
            </Link>

            {/* 6. Clinic Visit (2x1 Wide) */}
            <Link href="/search?type=doctor" className="col-span-1 md:col-span-2 row-span-1 relative rounded-[2rem] overflow-hidden group shadow-lg">
              <Image src="/images/cards/card_clinic_visit.png" alt="Clinic Visit" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/60 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/20 rounded-[2rem] z-20 group-hover:border-emerald-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 z-30 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center text-emerald-300 backdrop-blur-xl shrink-0">
                  <Calendar className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-1">Schedule Clinic Visit</h3>
                  <p className="text-slate-200 text-sm font-medium">Book physical appointments with smart tokens.</p>
                </div>
              </div>
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
                    <AdSliderRenderer images={ad.sliderImages || []} linkUrl={ad.linkUrl} />
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
                <AdSliderRenderer images={platformAds['ad_slot_home_distributed_1'][0].sliderImages || []} linkUrl={platformAds['ad_slot_home_distributed_1'][0].linkUrl} />
              ) : (
                <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: platformAds['ad_slot_home_distributed_1'][0].htmlCode }} />
              )}
              <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-400">Sponsored</span>
            </div>
          </section>
        )}

        {/* DIAGNOSTICS BENTO */}
        <section className="px-4 sm:px-6 max-w-[1400px] mx-auto w-full mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[250px]">
            {/* 7. Order Medicines (2x1 Wide) */}
            <Link href="/pharmacies" className="col-span-1 md:col-span-2 row-span-1 relative rounded-[2rem] overflow-hidden group shadow-lg">
              <Image src="/images/cards/card_medicines.png" alt="Order Medicines" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/60 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/20 rounded-[2rem] z-20 group-hover:border-amber-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 z-30 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-amber-300 backdrop-blur-xl shrink-0">
                  <Pill className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-1">Order Medicines</h3>
                  <p className="text-slate-200 text-sm font-medium">Forward your digital Rx to local pharmacies.</p>
                </div>
              </div>
            </Link>

            {/* 8. Book Lab Tests (2x1 Wide) */}
            <Link href="/search?type=lab" className="col-span-1 md:col-span-2 row-span-1 relative rounded-[2rem] overflow-hidden group shadow-lg">
              <Image src="/images/cards/card_lab_test.png" alt="Lab Test" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/60 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/20 rounded-[2rem] z-20 group-hover:border-violet-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 z-30 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/30 border border-violet-400/50 flex items-center justify-center text-violet-300 backdrop-blur-xl shrink-0">
                  <Syringe className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-1">Book Lab Tests</h3>
                  <p className="text-slate-200 text-sm font-medium">Schedule home sample collection instantly.</p>
                </div>
              </div>
            </Link>

            {/* IDENTITY BENTO */}
            {/* 9. Health Vault (Full Width Banner 4x1) */}
            <Link href="/portal" className="col-span-1 md:col-span-2 lg:col-span-4 row-span-1 relative rounded-[2rem] overflow-hidden group shadow-lg mt-4">
              <Image src="/images/cards/card_health_vault.png" alt="Health Vault" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/70 to-[#050B14]/30 z-10"></div>
              <div className="absolute inset-0 border border-white/20 rounded-[2rem] z-20 group-hover:border-purple-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-8 z-30 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-purple-500/30 border border-purple-400/50 flex items-center justify-center text-purple-300 backdrop-blur-xl shrink-0">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-white mb-2">My Health Vault</h3>
                  <p className="text-slate-200 text-lg font-medium max-w-2xl">Access your secure Sovereign ID, scan QR codes at clinics, and view all your lifetime medical records in one protected place.</p>
                </div>
              </div>
            </Link>

          </div>
        </section>

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
                <AdSliderRenderer images={platformAds['ad_slot_home_distributed_2'][0].sliderImages || []} linkUrl={platformAds['ad_slot_home_distributed_2'][0].linkUrl} />
              ) : (
                <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: platformAds['ad_slot_home_distributed_2'][0].htmlCode }} />
              )}
              <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-400">Sponsored</span>
            </div>
          </section>
        )}

        {/* B2B PROVIDER SECTION */}
        <section className="pt-16 px-4 sm:px-6 max-w-[1400px] mx-auto w-full">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
              For Healthcare Providers
            </h2>
            <p className="text-slate-400">Manage your practice with the most advanced OS in the world.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Provider Cards (Small elegant squares) */}
            <Link href="/login?redirect=/portal/doctor" className="h-[200px] relative rounded-3xl overflow-hidden group shadow-lg">
              <Image src="/images/cards/card_doctor_os.png" alt="Doctor OS" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/80 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/10 rounded-3xl z-20 group-hover:border-indigo-400 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-5 z-30">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-3 backdrop-blur-md">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white">Doctor OS</h3>
              </div>
            </Link>

            <Link href="/login?redirect=/portal/hospital" className="h-[200px] relative rounded-3xl overflow-hidden group shadow-lg">
              <Image src="/images/cards/card_hospital_admin.png" alt="Hospital Admin" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/80 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/10 rounded-3xl z-20 group-hover:border-blue-400 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-5 z-30">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 mb-3 backdrop-blur-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white">Hospital Admin</h3>
              </div>
            </Link>

            <Link href="/login?redirect=/portal/pharmacy" className="h-[200px] relative rounded-3xl overflow-hidden group shadow-lg">
              <Image src="/images/cards/card_pharmacy_network.png" alt="Pharmacy Network" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/80 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/10 rounded-3xl z-20 group-hover:border-fuchsia-400 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-5 z-30">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/30 flex items-center justify-center text-fuchsia-300 mb-3 backdrop-blur-md">
                  <Pill className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white">Pharmacy OS</h3>
              </div>
            </Link>

            <Link href="/login?redirect=/portal/lab" className="h-[200px] relative rounded-3xl overflow-hidden group shadow-lg">
              <Image src="/images/cards/card_pathology_lab.png" alt="Pathology Labs" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/80 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/10 rounded-3xl z-20 group-hover:border-violet-400 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-5 z-30">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-300 mb-3 backdrop-blur-md">
                  <TestTube2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white">Pathology Labs</h3>
              </div>
            </Link>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-10 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold transition-colors text-center backdrop-blur-xl">
              Join the Network
            </Link>
            <Link href="/login" className="px-10 py-4 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-black transition-all shadow-[0_0_30px_rgba(45,212,191,0.4)] text-center">
              Partner Login
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
                <AdSliderRenderer images={platformAds['ad_slot_home_distributed_3'][0].sliderImages || []} linkUrl={platformAds['ad_slot_home_distributed_3'][0].linkUrl} />
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
