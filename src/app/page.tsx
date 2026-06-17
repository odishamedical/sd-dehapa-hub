"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { Search, MapPin, Activity, Stethoscope, Building2, TestTube2, Pill, Ambulance, Video, QrCode, ShieldCheck, PhoneCall, ChevronRight, UserCircle, Settings, X, HeartPulse } from "lucide-react";
import dynamic from 'next/dynamic';

const QRScannerModal = dynamic(() => import('@/components/QRScannerModal'), {
  ssr: false
});

import { useRouter } from "next/navigation";

export default function DehapaHome() {
  const router = useRouter();
  const [searchType, setSearchType] = useState('doctor');
  const [searchCountry, setSearchCountry] = useState('India');
  const [searchState, setSearchState] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');

  const [activeTab, setActiveTab] = useState<"patients" | "doctors" | "hospitals">("patients");
  const [isPinging, setIsPinging] = useState(false);
  const [ambulanceETA, setAmbulanceETA] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);

  useEffect(() => {
    // Only access localStorage on client
    const uid = localStorage.getItem("sd_current_user_uid") || localStorage.getItem("sd_current_user_email");
    setUserUid(uid); // Will be null if not logged in
  }, []);

  const handlePingAmbulance = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setAmbulanceETA("3 mins away");
    }, 3500);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchType) params.append('type', searchType);
    if (searchCountry) params.append('country', searchCountry);
    if (searchState) params.append('state', searchState);
    if (searchDistrict) params.append('district', searchDistrict);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#020810] font-sans selection:bg-teal-500/30 overflow-x-hidden text-slate-100">
      
      {/* 1. HERO SECTION (The Gateway) - Futuristic Edition */}
      <section className="relative pt-20 pb-24 lg:pt-28 lg:pb-36 overflow-hidden">
        {/* Dynamic Holographic Background Matrix */}
        <div className="absolute inset-0 bg-[#020810] z-0">
          {/* Animated Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_10%,transparent_100%)] animate-[pulse_4s_ease-in-out_infinite_alternate]" />
          
          {/* Deep Space Orbs */}
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite_alternate]" />
        </div>

        {/* Floating Holographic Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block z-0">
           <Activity className="absolute top-[15%] right-[20%] text-teal-400/20 w-32 h-32 transform rotate-12 animate-[bounce_8s_infinite]" />
           <ShieldCheck className="absolute top-[50%] left-[10%] text-blue-400/10 w-48 h-48 transform -rotate-12 animate-[bounce_12s_infinite]" />
           <div className="absolute bottom-[20%] right-[10%] w-24 h-24 border border-teal-500/30 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        </div>

        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-6 lg:px-12 xl:px-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_0_20px_rgba(20,184,166,0.2)] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            Sovereign Health Network
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black font-serif text-white mb-6 leading-[1.1] tracking-tight drop-shadow-2xl">
            The Future of <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-500 animate-gradient-x">Integrated Healthcare.</span>
          </h1>
          <p className="text-base sm:text-xl lg:text-2xl text-slate-400 max-w-3xl mx-auto font-medium mb-16 drop-shadow-sm">
            Access world-class specialists, live hospital metrics, and instant emergency response through a single unified portal.
          </p>

          {/* Holographic Search Console */}
          <div className="max-w-5xl mx-auto bg-slate-900/60 backdrop-blur-2xl border border-teal-500/30 p-4 sm:p-6 rounded-3xl flex flex-col gap-4 shadow-[0_0_50px_rgba(20,184,166,0.15)] relative group transition-all duration-500 hover:shadow-[0_0_80px_rgba(20,184,166,0.25)] hover:bg-slate-900/80">
            {/* Glowing borders effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-3xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 w-full">
              
              {/* Type Dropdown */}
              <div className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 focus-within:border-teal-400/50 focus-within:bg-slate-800/80 transition-colors relative">
                <Search className="w-5 h-5 text-teal-400 shrink-0" />
                <select 
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-white font-medium appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-800 text-slate-400">All Services</option>
                  <option value="doctor" className="bg-slate-800 text-white">Doctors</option>
                  <option value="hospital" className="bg-slate-800 text-white">Hospitals</option>
                  <option value="ambulance" className="bg-slate-800 text-white">Ambulances</option>
                  <option value="pharmacy" className="bg-slate-800 text-white">Pharmacies</option>
                  <option value="lab" className="bg-slate-800 text-white">Pathology Labs</option>
                </select>
              </div>
              
              {/* Country Dropdown */}
              <div className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 focus-within:border-teal-400/50 focus-within:bg-slate-800/80 transition-colors relative">
                <MapPin className="w-5 h-5 text-teal-400 shrink-0" />
                <select 
                  value={searchCountry}
                  onChange={(e) => setSearchCountry(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-white font-medium appearance-none cursor-pointer"
                >
                  <option value="India" className="bg-slate-800 text-white">India</option>
                  <option value="USA" className="bg-slate-800 text-white">USA</option>
                  <option value="UK" className="bg-slate-800 text-white">United Kingdom</option>
                  <option value="UAE" className="bg-slate-800 text-white">UAE</option>
                  <option value="Australia" className="bg-slate-800 text-white">Australia</option>
                  <option value="Canada" className="bg-slate-800 text-white">Canada</option>
                </select>
              </div>

              {/* State Dropdown */}
              <div className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 focus-within:border-teal-400/50 focus-within:bg-slate-800/80 transition-colors relative">
                <MapPin className="w-5 h-5 text-teal-400/50 shrink-0" />
                <select 
                  value={searchState}
                  onChange={(e) => setSearchState(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-white font-medium appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-800 text-slate-400">Any State</option>
                  <option value="Odisha" className="bg-slate-800 text-white">Odisha</option>
                  <option value="Maharashtra" className="bg-slate-800 text-white">Maharashtra</option>
                  <option value="Karnataka" className="bg-slate-800 text-white">Karnataka</option>
                  <option value="Delhi" className="bg-slate-800 text-white">Delhi</option>
                </select>
              </div>

              {/* District Dropdown */}
              <div className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 focus-within:border-teal-400/50 focus-within:bg-slate-800/80 transition-colors relative">
                <MapPin className="w-5 h-5 text-teal-400/50 shrink-0" />
                <select 
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-white font-medium appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-800 text-slate-400">Any District</option>
                  <option value="Bhubaneswar" className="bg-slate-800 text-white">Bhubaneswar</option>
                  <option value="Cuttack" className="bg-slate-800 text-white">Cuttack</option>
                  <option value="Puri" className="bg-slate-800 text-white">Puri</option>
                  <option value="Rourkela" className="bg-slate-800 text-white">Rourkela</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end relative z-10 w-full mt-2">
              <button onClick={handleSearch} className="w-full sm:w-auto relative bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white px-12 py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:shadow-[0_0_50px_rgba(20,184,166,0.6)] hover:scale-105 flex items-center justify-center gap-2 overflow-hidden">
                <span className="relative z-10">Search</span>
                <ChevronRight className="w-5 h-5 relative z-10" />
                {/* Sweep effect on button */}
                <div className="absolute inset-0 h-full w-full bg-white/20 -skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>
            </div>
          </div>

          {/* Giant Living Consult Button */}
          <div className="mt-16 flex flex-col items-center justify-center relative z-20 animate-in zoom-in duration-1000 delay-300">
            <div className="relative group">
              {/* Massive radar ping effect */}
              <div className="absolute -inset-10 bg-red-500/20 rounded-full blur-2xl animate-pulse group-hover:bg-red-500/30 transition-all duration-500"></div>
              <div className="absolute -inset-4 border-2 border-red-500/50 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <div className="absolute -inset-8 border border-red-500/30 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              
              <button 
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event('open-telemedicine-fab'));
                  }
                }}
                className="relative flex items-center gap-4 bg-gradient-to-br from-[#040815] to-[#1a0b12] border border-red-500/50 rounded-full py-5 px-10 shadow-[0_0_40px_rgba(239,68,68,0.3)] hover:shadow-[0_0_60px_rgba(239,68,68,0.5)] transition-all duration-500 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                
                <div className="relative flex items-center justify-center w-14 h-14 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)] group-hover:scale-110 transition-transform">
                  <Video className="w-7 h-7 text-white" />
                </div>
                
                <div className="text-left">
                  <h3 className="text-white font-black uppercase tracking-widest text-xl sm:text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Video Consult</h3>
                  <p className="text-red-400 font-bold tracking-widest text-xs sm:text-sm uppercase flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Live Doctors Online
                  </p>
                </div>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CORE SERVICE TICKETS (Futuristic Cards) */}
      <section className="relative z-20 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 -mt-16 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          
          {[
            { title: "Find Doctors", desc: "Book Specialists", icon: <Stethoscope className="w-10 h-10" />, href: "/doctors", color: "from-blue-600 to-cyan-400", glow: "shadow-cyan-500/50" },
            { title: "Hospitals", desc: "Live Bed Arrays", icon: <Building2 className="w-10 h-10" />, href: "/hospitals", color: "from-teal-600 to-emerald-400", glow: "shadow-emerald-500/50" },
            { title: "Diagnostics", desc: "Digital Lab Scans", icon: <TestTube2 className="w-10 h-10" />, href: "/labs", color: "from-purple-600 to-pink-400", glow: "shadow-pink-500/50" },
            { title: "Medicines", desc: "Drone Pharmacy", icon: <Pill className="w-10 h-10" />, href: "/pharmacies", color: "from-orange-600 to-yellow-400", glow: "shadow-yellow-500/50" },
            { title: "Ambulance", desc: "Hyper-Dispatch", icon: <Ambulance className="w-10 h-10" />, href: "#ambulance-ping", color: "from-red-600 to-rose-400", glow: "shadow-rose-500/50" },
            { title: "Health QR", desc: "Patient Identity", icon: <QrCode className="w-10 h-10" />, href: "#qr-code", action: () => setIsQrModalOpen(true), color: "from-fuchsia-600 to-purple-400", glow: "shadow-purple-500/50" },
          ].map((item, i) => (
            <Link 
              key={i} 
              href={item.href}
              className={`group relative flex flex-col items-start justify-between min-h-[220px] sm:min-h-[260px] bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-8 overflow-hidden transition-all duration-700 hover:-translate-y-4 hover:bg-slate-800/80 hover:border-slate-500 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)]`}
              onClick={(e) => {
                if (item.action) {
                  e.preventDefault();
                  item.action();
                }
              }}
            >
              {/* Dynamic Glow Behind Card on Hover */}
              <div className={`absolute -inset-0.5 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-700 rounded-[2.5rem] pointer-events-none`}></div>
              
              {/* Animated Techno-Grid */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 group-hover:opacity-30 transition-opacity duration-700 mix-blend-overlay"></div>

              {/* Icon Orb */}
              <div className={`relative z-10 w-20 h-20 rounded-[1.5rem] bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-6 shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]`}>
                {item.icon}
                {/* Floating inner glow */}
                <div className="absolute inset-0 bg-white/20 rounded-[1.5rem] blur-md mix-blend-overlay"></div>
              </div>
              
              <div className="relative z-10 w-full">
                <h3 className={`font-black text-xl sm:text-2xl mb-2 tracking-tight text-white transition-all duration-500 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400`}>
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                  {item.desc}
                </p>
                {/* Neon progress bar effect at bottom */}
                <div className={`h-1 w-0 bg-gradient-to-r ${item.color} mt-6 rounded-full group-hover:w-full transition-all duration-700 ease-out shadow-[0_0_10px_currentColor]`}></div>
              </div>
            </Link>
          ))}
          
        </div>
      </section>

      {/* 3. UBER-LIKE AMBULANCE PING (Holographic Map) */}
      <section id="ambulance-ping" className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8 mb-16 scroll-mt-24 relative">
        {/* Background ambient glow for map section */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-red-900/10 blur-[150px] pointer-events-none rounded-full"></div>

        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700/50 flex flex-col lg:flex-row relative z-10">
          
          {/* Left Side: Cyberpunk Interface */}
          <div className="w-full lg:w-5/12 p-8 sm:p-12 lg:p-20 flex flex-col justify-center relative z-20 border-r border-slate-800">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest mb-8 w-max shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Emergency Override
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif text-white mb-6 leading-tight drop-shadow-lg">
              Hyper-Speed <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">Dispatch.</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mb-12 leading-relaxed">
              Our satellite-linked ping system instantly alerts all DehaPa emergency vehicles within a 5km radius. Live holographic tracking engaged.
            </p>
            
            <div className="bg-black/40 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-md shadow-inner relative overflow-hidden group">
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none opacity-50"></div>
              
              <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-800 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-600 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                  <MapPin className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] font-black text-slate-500 block mb-1">Target Coordinates</span>
                  <span className="text-white font-bold text-lg tracking-wide font-mono">20.296° N, 85.824° E</span>
                </div>
              </div>
              
              <button 
                onClick={handlePingAmbulance}
                disabled={isPinging || !!ambulanceETA}
                className={`w-full py-5 rounded-2xl font-black text-base uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden z-10 ${
                  ambulanceETA 
                    ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] border border-emerald-400' 
                    : isPinging 
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' 
                      : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:shadow-[0_0_60px_rgba(239,68,68,0.6)] border border-red-500 hover:-translate-y-1'
                }`}
              >
                {ambulanceETA ? (
                  <><ShieldCheck className="w-6 h-6 animate-pulse" /> Driver Locked (ETA: {ambulanceETA})</>
                ) : isPinging ? (
                  <><div className="w-6 h-6 border-4 border-slate-500 border-t-white rounded-full animate-spin"></div> Scanning Grid...</>
                ) : (
                  <><PhoneCall className="w-6 h-6" /> PING NEAREST AMBULANCE</>
                )}
                
                {/* Button shine */}
                {!ambulanceETA && !isPinging && (
                  <div className="absolute inset-0 h-full w-full bg-white/20 -skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]"></div>
                )}
              </button>
            </div>
          </div>

          {/* Right Side: Holographic Radar Map */}
          <div className="w-full lg:w-7/12 min-h-[500px] lg:min-h-full bg-[#030b14] relative overflow-hidden flex items-center justify-center">
            {/* Base Dark Map Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-30"></div>
            
            {/* The Radar Circle */}
            <div className="relative w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full border border-teal-500/20 shadow-[inset_0_0_50px_rgba(20,184,166,0.1)] flex items-center justify-center">
              
              {/* Inner Rings */}
              <div className="absolute w-[66%] h-[66%] rounded-full border border-teal-500/20"></div>
              <div className="absolute w-[33%] h-[33%] rounded-full border border-teal-500/20"></div>
              
              {/* Crosshairs */}
              <div className="absolute w-full h-px bg-teal-500/20"></div>
              <div className="absolute h-full w-px bg-teal-500/20"></div>

              {/* User Center Pin */}
              <div className="absolute z-30 flex flex-col items-center">
                <div className="w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(45,212,191,0.8)] relative">
                  <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-75"></div>
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Radar Sweep Cone */}
              {isPinging && (
                <div className="absolute w-full h-full rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(20,184,166,0.1)_90deg,rgba(20,184,166,0.8)_360deg)] animate-[spin_3s_linear_infinite] z-20" style={{ transformOrigin: "center" }}>
                  <div className="absolute top-0 right-[50%] w-[50%] h-[50%] border-r-2 border-teal-400"></div>
                </div>
              )}

              {/* Target Found (Ambulance blips appear after ping) */}
              {ambulanceETA && (
                <>
                  <div className="absolute top-[20%] left-[60%] z-40 animate-in zoom-in duration-500 delay-300 flex flex-col items-center">
                    <div className="bg-red-500/20 border border-red-500/50 backdrop-blur-md text-red-100 text-[10px] font-black uppercase px-2 py-1 rounded mb-2 shadow-[0_0_15px_rgba(239,68,68,0.5)]">ALS Unit-42</div>
                    <div className="w-6 h-6 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)] flex items-center justify-center border-2 border-white">
                      <Ambulance className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  {/* Digital path line drawing (simulated with CSS border) */}
                  <div className="absolute top-[35%] left-[55%] w-[80px] h-[80px] border-l-2 border-b-2 border-dashed border-red-400/50 animate-pulse z-10"></div>
                </>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* 4. QR SMART CONNECTION (Cyber-Bridge) */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8 mb-16 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/connected.png')] opacity-5 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
          
          {/* Holographic Phone Scanner */}
          <div className="w-full lg:w-1/2 relative flex justify-center perspective-[2000px]">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full"></div>
            
            <div className="relative w-[320px] h-[650px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_0_20px_rgba(255,255,255,0.1)] transform rotate-y-[-15deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-1000 ease-out z-20 flex flex-col overflow-hidden group">
               
               {/* Phone Screen Notch */}
               <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-50"></div>
               
               {/* Phone Screen Content (Scanner UI) */}
               <div className="flex-1 bg-black relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e18690c5e53b?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
                 
                 {/* Augmented Reality Scanner HUD */}
                 <div className="absolute inset-0 bg-blue-900/40 z-10">
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-cyan-400 rounded-3xl relative shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                     {/* Corner Brackets */}
                     <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                     <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                     <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
                     <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                     
                     {/* Laser Scan Line */}
                     <div className="w-full h-1 bg-white shadow-[0_0_15px_#fff] absolute top-1/2 animate-[pulse_1s_ease-in-out_infinite,slide_2s_linear_infinite]"></div>
                   </div>
                   
                   {/* Scanning Text */}
                   <div className="absolute bottom-32 left-0 w-full text-center">
                     <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase font-bold animate-pulse">Analyzing Code Matrix...</p>
                   </div>
                 </div>
               </div>
            </div>

            {/* Floating Cyber QR Code */}
            <div className="absolute top-[40%] right-[-5%] lg:right-[-10%] bg-slate-900 p-6 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(34,211,238,0.2)] border border-cyan-500/30 z-30 transform rotate-12 hover:rotate-0 hover:scale-110 transition-all duration-700 animate-float">
              <QrCode className="w-32 h-32 text-cyan-400" />
              <div className="mt-4 border-t border-slate-700 pt-3 text-center">
                <span className="text-white font-mono text-[10px] uppercase tracking-widest block font-bold">Node #A7X9</span>
              </div>
            </div>
          </div>
          
          {/* Futuristic Text Content */}
          <div className="w-full lg:w-1/2 relative z-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-widest mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <QrCode className="w-4 h-4" /> Physical-to-Digital Bridge
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif text-white mb-8 leading-tight">
              Scan & Upload <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">to the Matrix.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
              Every DehaPa partner clinic has a unique Smart QR Node. Scan it to instantly bridge the physical clinic desk with your digital health vault.
            </p>
            
            <div className="space-y-6">
              {[
                { title: "Live Holographic Queues", desc: "Instantly join the doctor's digital queue and track your exact waiting number from your device." },
                { title: "Sovereign Health Vault Auth", desc: "Grant the doctor encrypted, temporary access to your medical history via cryptographic handshake." },
                { title: "Frictionless Transactions", desc: "Process consultation fees via instant UPI payment without queuing at the physical counter." }
              ].map((feat, i) => (
                <div key={i} className="flex gap-6 group bg-slate-800/30 p-6 rounded-3xl border border-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-500 cursor-default shadow-lg hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all">
                    <span className="text-cyan-400 font-black font-mono text-xl">0{i + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xl mb-2 group-hover:text-cyan-300 transition-colors">{feat.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. INSTRUCTION PORTAL (Glassmorphic Tabs) */}
      <section className="relative z-20 bg-slate-900/50 backdrop-blur-3xl border-t border-slate-800 py-16 mb-12">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 text-center">
          <h2 className="text-4xl sm:text-5xl font-black font-serif text-white mb-6">DehaPa Operating Protocols</h2>
          <p className="text-slate-400 mb-16 max-w-2xl mx-auto text-lg">Select your entity classification to download operational guidelines and access secure gateways.</p>

          {/* Futuristic Tab Navigation */}
          <div className="inline-flex bg-slate-950 p-2 rounded-[2rem] mb-16 border border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-x-auto max-w-full">
            {[
              { id: "patients", label: "End User (Patient)", icon: <UserCircle className="w-5 h-5" /> },
              { id: "doctors", label: "Specialist Node", icon: <Stethoscope className="w-5 h-5" /> },
              { id: "hospitals", label: "Facility Hub", icon: <Building2 className="w-5 h-5" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]' 
                    : 'text-slate-500 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Holographic Tab Content Box */}
          <div className="max-w-6xl mx-auto bg-slate-900/80 border border-slate-700/50 rounded-[3rem] p-10 sm:p-16 text-left shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden min-h-[400px]">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

            {activeTab === "patients" && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
                <h3 className="text-3xl font-black text-white mb-10 flex items-center gap-4">
                  <UserCircle className="w-8 h-8 text-teal-400" /> Patient Lifecycle
                </h3>
                <div className="grid md:grid-cols-3 gap-10 mb-12">
                  <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
                    <h4 className="font-black text-teal-400 mb-4 text-xl">01 / Search & Locate</h4>
                    <p className="text-slate-400 leading-relaxed">Query the central database using the search matrix or core tickets to locate specialized care modules in your sector.</p>
                  </div>
                  <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
                    <h4 className="font-black text-teal-400 mb-4 text-xl">02 / Secure Booking</h4>
                    <p className="text-slate-400 leading-relaxed">Lock in consultation slots digitally or use the physical clinic QR code to sync with the doctor's live queue dashboard.</p>
                  </div>
                  <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
                    <h4 className="font-black text-teal-400 mb-4 text-xl">03 / Data Vault</h4>
                    <p className="text-slate-400 leading-relaxed">All digital prescriptions and diagnostic logs are automatically compiled and encrypted into your personal Sovereign Vault.</p>
                  </div>
                </div>
                <div className="pt-8 border-t border-slate-800 flex justify-end">
                  <Link href="/portal" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-3 border border-white/10">
                    Access Patient Module <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Doctor and Hospital tabs similarly upgraded... (abbreviated here for symmetry) */}
            {activeTab === "doctors" && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
                <h3 className="text-3xl font-black text-white mb-10 flex items-center gap-4">
                  <Stethoscope className="w-8 h-8 text-cyan-400" /> Specialist Deployment
                </h3>
                <div className="grid md:grid-cols-3 gap-10 mb-12">
                  <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
                    <h4 className="font-black text-cyan-400 mb-4 text-xl">01 / Node Verification</h4>
                    <p className="text-slate-400 leading-relaxed">Authenticate your credentials to claim your digital profile, dictating your public presence and operational hours.</p>
                  </div>
                  <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
                    <h4 className="font-black text-cyan-400 mb-4 text-xl">02 / Queue Sync</h4>
                    <p className="text-slate-400 leading-relaxed">Deploy the Admin CRM at your clinic. Patients scanning your QR code are instantly injected into your digital dashboard.</p>
                  </div>
                  <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
                    <h4 className="font-black text-cyan-400 mb-4 text-xl">03 / Rx Transmission</h4>
                    <p className="text-slate-400 leading-relaxed">Issue cryptographically secure digital prescriptions that bypass paper and load directly into the patient's ecosystem.</p>
                  </div>
                </div>
                <div className="pt-8 border-t border-slate-800 flex justify-end">
                  <Link href="/login?redirect=/portal/verify?role=doctor" className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-3 border border-cyan-500/30">
                    Init Doctor Verification <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "hospitals" && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
                <h3 className="text-3xl font-black text-white mb-10 flex items-center gap-4">
                  <Building2 className="w-8 h-8 text-blue-400" /> Hub Administration
                </h3>
                <div className="grid md:grid-cols-3 gap-10 mb-12">
                  <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
                    <h4 className="font-black text-blue-400 mb-4 text-xl">01 / Infrastructure Sync</h4>
                    <p className="text-slate-400 leading-relaxed">Broadcast your facility's departments, ICU specs, and capabilities to the global DehaPa routing network.</p>
                  </div>
                  <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
                    <h4 className="font-black text-blue-400 mb-4 text-xl">02 / Live Telemetry</h4>
                    <p className="text-slate-400 leading-relaxed">Stream real-time bed availability to the network, allowing instant routing for emergency dispatch modules.</p>
                  </div>
                  <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
                    <h4 className="font-black text-blue-400 mb-4 text-xl">03 / Staff Roster</h4>
                    <p className="text-slate-400 leading-relaxed">Digitally link verified Specialist Nodes (doctors) to your Hub to amplify your institutional authority.</p>
                  </div>
                </div>
                <div className="pt-8 border-t border-slate-800 flex justify-end">
                  <Link href="/login?redirect=/portal/verify?role=hospital" className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-3 border border-blue-500/30">
                    Init Hospital Auth <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#020810]/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative bg-slate-900 border border-slate-700/50 shadow-2xl rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Glowing top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 to-purple-500" />
            
            <button 
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-fuchsia-500/20 rounded-full flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-fuchsia-400" />
              </div>
              
              <h2 className="text-xl font-black text-white mb-1">My Health QR</h2>
              <p className="text-xs text-slate-400 mb-8 max-w-[250px]">
                Show this code at any Sovereign Network hospital or clinic for instant identity verification.
              </p>
              
              <div className="bg-white p-4 rounded-2xl shadow-[0_0_40px_rgba(192,38,211,0.2)] mb-6 ring-4 ring-slate-800">
                <QRCode 
                  value={`dehapa-auth://scan?uid=${encodeURIComponent(userUid || "guest")}`}
                  size={200}
                  level="H"
                />
              </div>
              
              <div className="inline-block bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold font-mono">
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
