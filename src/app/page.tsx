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
      <section className="relative pt-12 pb-16 z-10 flex flex-col items-center justify-center min-h-[40vh] border-b border-slate-100 bg-slate-50">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 2xl:px-32 flex flex-col items-center text-center mt-8">
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-4">
            Find the Best Doctors in India
          </h1>
          
          {/* Dynamic SEO Typing Text */}
          <div className="h-8 mb-8 flex items-center justify-center">
            <p className="text-base sm:text-lg lg:text-xl text-blue-600 font-medium tracking-tight">
              {displayText}<span className="inline-block w-0.5 h-5 ml-1 bg-blue-600 animate-pulse"></span>
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-3xl relative group shadow-lg rounded-2xl bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all">
            <div className="relative flex items-center p-2">
              <Search className="w-6 h-6 text-slate-400 ml-4 mr-2" />
              <input 
                type="text" 
                placeholder="Search Doctors, Hospitals, Specialties..." 
                className="flex-1 bg-transparent border-none outline-none text-slate-900 px-2 py-4 placeholder-slate-400 font-medium text-lg min-w-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="sd-btn-nav hidden md:block mr-2">
                Search Directory
              </button>
            </div>
          </form>
          <div className="mt-8 flex gap-4">
             <Link href="/services" className="text-blue-600 font-bold hover:underline flex items-center gap-2">
                Looking to Book an Appointment or Service? Click Here <Zap className="w-4 h-4"/>
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
        <section className="px-4 sm:px-8 lg:px-16 2xl:px-24 max-w-[1920px] mx-auto w-full mt-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 px-2">Browse Directory</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            <Link href="/doctors" className="flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg rounded-2xl p-6 transition-all group">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
              <span className="font-bold text-slate-800">Doctors</span>
            </Link>

            <Link href="/hospitals" className="flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-lg rounded-2xl p-6 transition-all group">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-indigo-600" />
              </div>
              <span className="font-bold text-slate-800">Hospitals</span>
            </Link>

            <Link href="/pharmacies" className="flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-lg rounded-2xl p-6 transition-all group">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Pill className="w-8 h-8 text-emerald-600" />
              </div>
              <span className="font-bold text-slate-800">Pharmacies</span>
            </Link>

            <Link href="/labs" className="flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 hover:border-violet-400 hover:shadow-lg rounded-2xl p-6 transition-all group">
              <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TestTube2 className="w-8 h-8 text-violet-600" />
              </div>
              <span className="font-bold text-slate-800">Laboratories</span>
            </Link>

            <Link href="/ambulances" className="flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 hover:border-rose-400 hover:shadow-lg rounded-2xl p-6 transition-all group">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Ambulance className="w-8 h-8 text-rose-600" />
              </div>
              <span className="font-bold text-slate-800">Ambulances</span>
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

        {/* B2B PROVIDER SECTION */}
        <section className="pt-16 px-4 sm:px-6 max-w-[1400px] mx-auto w-full">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-3">
              For Healthcare Providers
            </h2>
            <p className="text-slate-600">Join India's most trusted healthcare network.</p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-10 py-4 rounded-full bg-white border border-slate-300 text-slate-800 font-bold hover:bg-slate-50 transition-colors text-center shadow-sm">
              Join the Network
            </Link>
            <Link href="/login" className="px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-md text-center">
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
