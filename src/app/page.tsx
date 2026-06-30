"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { Search, MapPin, Activity, Stethoscope, Building2, TestTube2, Pill, Ambulance, QrCode, PhoneCall, ChevronRight, UserCircle, X, HeartPulse, Shield, Network, Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import dynamic from 'next/dynamic';

const QRScannerModal = dynamic(() => import('@/components/QRScannerModal'), {
  ssr: false
});

import { useRouter } from "next/navigation";
import GlassSelect from "@/components/GlassSelect";

export default function DehapaHome() {
  const router = useRouter();
  const [searchType, setSearchType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCountry, setSearchCountry] = useState('India');
  const [searchState, setSearchState] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');

  // Cascading Logic Handlers
  const handleCountryChange = (val: string) => {
    setSearchCountry(val);
    if (val !== 'India') {
      setSearchState('');
      setSearchDistrict('');
    }
  };

  const handleStateChange = (val: string) => {
    setSearchState(val);
    if (val !== 'Odisha') {
      setSearchDistrict('');
    }
  };

  const [isPinging, setIsPinging] = useState(false);
  const [ambulanceETA, setAmbulanceETA] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem("sd_current_user_uid") || localStorage.getItem("sd_current_user_email");
    setUserUid(uid);
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
    if (searchType && searchType !== 'all') params.append('type', searchType);
    if (searchQuery) params.append('q', searchQuery);
    if (searchCountry) params.append('country', searchCountry);
    if (searchState) params.append('state', searchState);
    if (searchDistrict) params.append('district', searchDistrict);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-teal-500/30 text-slate-800 pb-24 overflow-hidden">
      
      {/* 1. HERO SECTION: Split Layout with Abstract Pictorial */}
      <section className="relative pt-12 pb-16 lg:pt-24 lg:pb-32 overflow-hidden bg-white border-b border-slate-200">
        {/* Deep Abstract Backgrounds */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-teal-400/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left: Copy & Search Console */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 font-bold text-xs uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              Sovereign Health Network
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif text-slate-900 mb-6 leading-tight tracking-tight">
              Healthcare <br className="hidden lg:block"/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">Reimagined.</span>
            </h1>
            
            <p className="text-lg text-slate-500 font-medium mb-10 max-w-xl">
              Dehapa is the next-generation sovereign directory. Discover verified doctors, hospitals, and clinics powered by advanced transparency.
            </p>

            {/* Premium Search Console */}
            <div id="search-console" className="w-full bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(20,184,166,0.1)] p-4 sm:p-5 rounded-3xl flex flex-col gap-4 relative z-40 scroll-mt-24">
              
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <div className="w-full sm:w-48 shrink-0 h-14">
                  <GlassSelect 
                    value={searchType}
                    onChange={setSearchType}
                    icon={<Activity className="w-5 h-5 text-teal-500" />}
                    options={[
                      { value: 'all', label: 'All Services' },
                      { value: 'doctor', label: 'Doctors' },
                      { value: 'hospital', label: 'Hospitals' },
                      { value: 'ambulance', label: 'Ambulances' },
                      { value: 'pharmacy', label: 'Pharmacies' },
                      { value: 'lab', label: 'Pathology Labs' },
                    ]}
                  />
                </div>

                <div className="flex-1 flex items-center gap-3 px-4 h-14 bg-slate-50/50 rounded-2xl border border-slate-200 focus-within:bg-white focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search specialists, facilities..." 
                    className="w-full bg-transparent border-none outline-none text-slate-800 text-base font-medium placeholder:text-slate-400 focus:ring-0" 
                  />
                  <button onClick={() => setIsScannerOpen(true)} className="shrink-0 bg-teal-50 text-teal-600 p-2 rounded-xl hover:bg-teal-100 transition-colors" title="Scan QR">
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 flex-1">
                  <div className="h-14">
                    <GlassSelect value={searchCountry} onChange={handleCountryChange} icon={<MapPin className="w-5 h-5 text-slate-400" />} options={[{ value: 'India', label: 'India' }, { value: 'Other', label: 'Other' }]} />
                  </div>
                  {searchCountry === 'India' ? (
                  <div className="h-14">
                    <GlassSelect value={searchState} onChange={handleStateChange} placeholder="State" options={[
                      { value: '', label: 'State' },
                      { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
                      { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
                      { value: 'Assam', label: 'Assam' },
                      { value: 'Bihar', label: 'Bihar' },
                      { value: 'Chhattisgarh', label: 'Chhattisgarh' },
                      { value: 'Goa', label: 'Goa' },
                      { value: 'Gujarat', label: 'Gujarat' },
                      { value: 'Haryana', label: 'Haryana' },
                      { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
                      { value: 'Jharkhand', label: 'Jharkhand' },
                      { value: 'Karnataka', label: 'Karnataka' },
                      { value: 'Kerala', label: 'Kerala' },
                      { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
                      { value: 'Maharashtra', label: 'Maharashtra' },
                      { value: 'Manipur', label: 'Manipur' },
                      { value: 'Meghalaya', label: 'Meghalaya' },
                      { value: 'Mizoram', label: 'Mizoram' },
                      { value: 'Nagaland', label: 'Nagaland' },
                      { value: 'Odisha', label: 'Odisha' },
                      { value: 'Punjab', label: 'Punjab' },
                      { value: 'Rajasthan', label: 'Rajasthan' },
                      { value: 'Sikkim', label: 'Sikkim' },
                      { value: 'Tamil Nadu', label: 'Tamil Nadu' },
                      { value: 'Telangana', label: 'Telangana' },
                      { value: 'Tripura', label: 'Tripura' },
                      { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
                      { value: 'Uttarakhand', label: 'Uttarakhand' },
                      { value: 'West Bengal', label: 'West Bengal' }
                    ]} />
                  </div>
                ) : (
                    <div className="w-full flex items-center px-4 h-14 bg-slate-50/50 rounded-2xl border border-slate-200"><input type="text" value={searchState} onChange={(e) => setSearchState(e.target.value)} placeholder="State" className="w-full bg-transparent border-none outline-none focus:ring-0" /></div>
                  )}
                  {searchCountry === 'India' && searchState === 'Odisha' ? (
                  <div className="h-14">
                    <GlassSelect value={searchDistrict} onChange={setSearchDistrict} placeholder="District" options={[
                      { value: '', label: 'District' },
                      { value: 'Angul', label: 'Angul' }, { value: 'Balangir', label: 'Balangir' }, { value: 'Balasore', label: 'Balasore' },
                      { value: 'Bargarh', label: 'Bargarh' }, { value: 'Bhadrak', label: 'Bhadrak' }, { value: 'Boudh', label: 'Boudh' },
                      { value: 'Cuttack', label: 'Cuttack' }, { value: 'Deogarh', label: 'Deogarh' }, { value: 'Dhenkanal', label: 'Dhenkanal' },
                      { value: 'Gajapati', label: 'Gajapati' }, { value: 'Ganjam', label: 'Ganjam' }, { value: 'Jagatsinghpur', label: 'Jagatsinghpur' },
                      { value: 'Jajpur', label: 'Jajpur' }, { value: 'Jharsuguda', label: 'Jharsuguda' }, { value: 'Kalahandi', label: 'Kalahandi' },
                      { value: 'Kandhamal', label: 'Kandhamal' }, { value: 'Kendrapara', label: 'Kendrapara' }, { value: 'Kendujhar', label: 'Kendujhar' },
                      { value: 'Khordha', label: 'Khordha (Bhubaneswar)' }, { value: 'Koraput', label: 'Koraput' }, { value: 'Malkangiri', label: 'Malkangiri' },
                      { value: 'Mayurbhanj', label: 'Mayurbhanj' }, { value: 'Nabarangpur', label: 'Nabarangpur' }, { value: 'Nayagarh', label: 'Nayagarh' },
                      { value: 'Nuapada', label: 'Nuapada' }, { value: 'Puri', label: 'Puri' }, { value: 'Rayagada', label: 'Rayagada' },
                      { value: 'Sambalpur', label: 'Sambalpur' }, { value: 'Subarnapur', label: 'Subarnapur' }, { value: 'Sundargarh', label: 'Sundargarh' }
                    ]} />
                  </div>
                ) : (
                    <div className="w-full flex items-center px-4 h-14 bg-slate-50/50 rounded-2xl border border-slate-200"><input type="text" value={searchDistrict} onChange={(e) => setSearchDistrict(e.target.value)} placeholder="District" className="w-full bg-transparent border-none outline-none focus:ring-0" /></div>
                  )}
                </div>
                <button onClick={handleSearch} className="sm:w-36 shrink-0 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white h-14 rounded-2xl font-bold text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  Search <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: The Pictorial Representation */}
          <div className="w-full lg:w-1/2 flex justify-center relative mt-12 lg:mt-0">
            <div className="relative w-full max-w-lg aspect-square">
              {/* Central Glowing Shield Base */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-100 to-blue-50 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-pulse"></div>
              
              {/* Floating UI Elements (Glassmorphic) */}
              <div className="absolute top-[5%] left-0 sm:left-[5%] bg-white/70 backdrop-blur-xl border border-white shadow-xl rounded-3xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 z-20">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center"><CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6"/></div>
                <div><p className="text-xs sm:text-sm font-bold text-slate-800">Verified Identity</p><p className="text-[10px] sm:text-xs text-slate-500">Sovereign standard</p></div>
              </div>

              <div className="absolute bottom-[10%] left-0 sm:left-[-5%] bg-white/70 backdrop-blur-xl border border-white shadow-xl rounded-3xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 z-20">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center"><Network className="w-5 h-5 sm:w-6 sm:h-6"/></div>
                <div><p className="text-xs sm:text-sm font-bold text-slate-800">Decentralized</p><p className="text-[10px] sm:text-xs text-slate-500">Immutable records</p></div>
              </div>

              <div className="absolute top-[40%] right-[-5%] sm:right-[-10%] bg-white/70 backdrop-blur-xl border border-white shadow-xl rounded-3xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 z-20">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center"><Globe className="w-5 h-5 sm:w-6 sm:h-6"/></div>
                <div><p className="text-xs sm:text-sm font-bold text-slate-800">Global Reach</p><p className="text-[10px] sm:text-xs text-slate-500">Local expertise</p></div>
              </div>

              {/* Central Abstract Medical Graphic */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-teal-400 to-blue-600 rounded-[3rem] rotate-12 flex items-center justify-center shadow-[0_20px_50px_rgba(13,148,136,0.3)] transition-transform duration-700 hover:rotate-0 hover:scale-105">
                  <HeartPulse className="w-24 h-24 sm:w-32 sm:h-32 text-white opacity-90" strokeWidth={1} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-12 space-y-16">
        
        {/* 2. CORE SERVICES: Premium Visual Cards */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black font-serif text-slate-900 tracking-tight">Explore the Network</h2>
              <p className="text-slate-500 mt-2">Discover high-quality, verified healthcare services.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { title: "Doctors", subtitle: "Specialized care", icon: <Stethoscope />, href: "/doctors", bg: "from-cyan-500 to-blue-600" },
              { title: "Hospitals", subtitle: "World-class facilities", icon: <Building2 />, href: "/hospitals", bg: "from-emerald-400 to-teal-600" },
              { title: "Labs", subtitle: "Accurate testing", icon: <TestTube2 />, href: "/labs", bg: "from-purple-500 to-indigo-600" },
              { title: "Pharmacies", subtitle: "Verified medicines", icon: <Pill />, href: "/pharmacies", bg: "from-amber-400 to-orange-500" },
            ].map((item, i) => (
              <Link 
                key={i} 
                href={item.href}
                className="group relative h-48 sm:h-56 rounded-[2rem] overflow-hidden flex flex-col justify-end p-6 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.bg} opacity-90 group-hover:opacity-100 transition-opacity z-0`}></div>
                
                {/* Glass Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay z-0"></div>
                
                {/* Massive Watermark Icon */}
                <div className="absolute -right-8 -top-8 text-white opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 z-0">
                  {React.cloneElement(item.icon as React.ReactElement, { className: "w-48 h-48" })}
                </div>

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-4 border border-white/30">
                    {React.cloneElement(item.icon as React.ReactElement, { className: "w-6 h-6" })}
                  </div>
                  <h3 className="text-xl font-black text-white">{item.title}</h3>
                  <p className="text-white/80 text-sm font-medium">{item.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. PLATFORM CAPABILITIES (Abstract Network Scale - Bright Edition) */}
        <section className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden shadow-sm">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-bold text-xs uppercase tracking-widest mb-6">
                <Activity className="w-4 h-4" /> Sovereign Trust
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">
                A highly secure, verifiable healthcare ecosystem.
              </h2>
              <p className="text-slate-500 text-lg mb-8 max-w-lg">
                We are mapping the future of medical identity. Every entity on Dehapa undergoes strict verification to ensure you receive authentic and trusted care.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <Shield className="w-8 h-8 text-teal-500 mb-4" />
                  <h4 className="text-slate-800 font-bold text-lg">Anti-Fraud</h4>
                  <p className="text-slate-500 text-sm mt-2">Zero tolerance for fake degrees or unverified clinics.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <UserCircle className="w-8 h-8 text-blue-500 mb-4" />
                  <h4 className="text-slate-800 font-bold text-lg">Your Identity</h4>
                  <p className="text-slate-500 text-sm mt-2">Own your health records with your Dehapa UID.</p>
                </div>
              </div>
            </div>
            
            {/* Visual Network Map */}
            <div className="relative aspect-video lg:aspect-square flex justify-center items-center">
               <div className="w-full max-w-md h-full max-h-md rounded-full border border-teal-100 relative animate-[spin_60s_linear_infinite]">
                 {/* Inner orbits */}
                 <div className="absolute inset-4 rounded-full border border-blue-100 animate-[spin_40s_linear_infinite_reverse]"></div>
                 <div className="absolute inset-12 rounded-full border border-purple-100 animate-[spin_20s_linear_infinite]"></div>
                 
                 {/* Glowing Nodes */}
                 <div className="absolute top-0 left-1/2 w-4 h-4 bg-teal-400 rounded-full blur-[1px] shadow-[0_0_15px_rgba(45,212,191,0.5)] -translate-x-1/2 -translate-y-1/2"></div>
                 <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-blue-400 rounded-full blur-[1px] shadow-[0_0_10px_rgba(96,165,250,0.5)] -translate-x-1/2 translate-y-1/2"></div>
                 <div className="absolute top-1/2 left-4 w-2 h-2 bg-purple-400 rounded-full blur-[1px] shadow-[0_0_10px_rgba(192,132,252,0.5)] -translate-y-1/2"></div>
                 <div className="absolute top-1/4 right-8 w-5 h-5 bg-teal-300 rounded-full blur-[2px] shadow-[0_0_20px_rgba(94,234,212,0.5)]"></div>
                 
                 <div className="absolute inset-0 flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-slate-200 animate-pulse" />
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* 4. SLEEK EMERGENCY BANNER */}
        <section id="ambulance-ping" className="w-full bg-gradient-to-r from-red-600 to-rose-600 rounded-[2.5rem] p-6 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden scroll-mt-24">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/connected.png')] opacity-10 pointer-events-none"></div>
          
          <div className="flex items-center gap-6 relative z-10 text-white">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner shrink-0">
              <Ambulance className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-2xl sm:text-3xl">Emergency Ambulance</h3>
              <p className="text-red-100 text-sm sm:text-base font-medium mt-1">Ping the nearest life-support unit instantly.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
            {ambulanceETA ? (
              <div className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold text-lg w-full md:w-auto text-center shadow-xl animate-pulse">
                ETA: {ambulanceETA}
              </div>
            ) : (
              <button 
                onClick={handlePingAmbulance}
                disabled={isPinging}
                className="bg-white hover:bg-slate-50 text-red-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all w-full md:w-auto flex items-center justify-center gap-3 shadow-xl hover:scale-105"
              >
                {isPinging ? <span className="animate-pulse">Pinging...</span> : <><PhoneCall className="w-5 h-5" /> Send SOS</>}
              </button>
            )}
          </div>
        </section>

        {/* 5. PORTALS: Premium Bright/Glassmorphic Cards */}
        <section className="pt-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black font-serif text-slate-900 mb-3">Sovereign Portals</h2>
            <p className="text-slate-500 font-medium">Secure, encrypted gateways for verified healthcare entities.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/portal" className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-teal-300 hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 group-hover:bg-teal-100 transition-all">
                  <UserCircle className="w-7 h-7" />
                </div>
                <h4 className="font-black text-slate-900 text-xl mb-2">Patient Portal</h4>
                <p className="text-slate-500 text-sm">Access your secure vault and digital health records.</p>
              </div>
              <div className="mt-8 flex items-center justify-between text-teal-600 font-bold text-sm relative z-10">
                <span>Access Vault</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            
            <Link href="/login?redirect=/portal/verify?role=doctor" className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <h4 className="font-black text-slate-900 text-xl mb-2">Doctor Portal</h4>
                <p className="text-slate-500 text-sm">Manage your verified profile, clinic, and appointments.</p>
              </div>
              <div className="mt-8 flex items-center justify-between text-blue-600 font-bold text-sm relative z-10">
                <span>Manage Clinic</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/login?redirect=/portal/verify?role=hospital" className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
                  <Building2 className="w-7 h-7" />
                </div>
                <h4 className="font-black text-slate-900 text-xl mb-2">Hospital Admin</h4>
                <p className="text-slate-500 text-sm">Verify your facility, roster doctors, and capabilities.</p>
              </div>
              <div className="mt-8 flex items-center justify-between text-indigo-600 font-bold text-sm relative z-10">
                <span>Access Dashboard</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

      </div>

      {/* QR Code Modal (Preserved & Styled) */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-fuchsia-500 to-purple-500" />
            
            <button 
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full p-1 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-fuchsia-50 rounded-full flex items-center justify-center mb-4 border border-fuchsia-100 relative z-10">
                <QrCode className="w-6 h-6 text-fuchsia-600" />
              </div>
              
              <h2 className="text-xl font-black text-slate-900 mb-1">My Health QR</h2>
              <p className="text-xs text-slate-600 mb-8 max-w-[250px] font-medium">
                Show this code at any Sovereign Network facility for identity verification.
              </p>
              
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 ring-4 ring-slate-50 relative z-10">
                <QRCode 
                  value={`dehapa-auth://scan?uid=${encodeURIComponent(userUid || "guest")}`}
                  size={200}
                  level="H"
                />
              </div>
              
              <div className="inline-block bg-slate-100 px-4 py-2 rounded-full border border-slate-200 relative z-10">
                <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold font-mono">
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
