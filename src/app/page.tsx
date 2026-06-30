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
    if (searchType && searchType !== 'all') params.append('type', searchType);
    if (searchQuery) params.append('q', searchQuery);
    if (searchCountry) params.append('country', searchCountry);
    if (searchState) params.append('state', searchState);
    if (searchDistrict) params.append('district', searchDistrict);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-teal-500/30 text-slate-800 pb-20">
      
      {/* 1. MICRO-HERO & SEARCH (Compact & Dense) */}
      <section className="relative pt-6 pb-6 bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-teal-100/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-[400px] h-[300px] bg-blue-100/30 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 text-center">
          
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 mb-2 tracking-tight">
            Find and book the <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">best doctors</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mb-6">
            Access world-class specialists and instantly book appointments.
          </p>

          {/* Compact Search Console */}
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 p-2 sm:p-3 rounded-2xl flex flex-col gap-3 shadow-md relative z-40">
            
            {/* Search Input Row (High Density) */}
            <div className="flex flex-col sm:flex-row gap-2 relative z-20 w-full">
              
              <div className="w-full sm:w-48 shrink-0 h-12">
                <GlassSelect 
                  value={searchType}
                  onChange={setSearchType}
                  icon={<Activity className="w-4 h-4 text-slate-500" />}
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

              <div className="flex-1 flex items-center gap-2 px-3 h-12 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                <Search className="w-4 h-4 text-teal-500 shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctors, specialties, symptoms..." 
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-sm font-medium placeholder:text-slate-400 focus:ring-0" 
                />
                {/* Embedded Scan QR Action */}
                <button 
                  onClick={() => setIsScannerOpen(true)}
                  className="shrink-0 flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-teal-200"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Scan QR</span>
                </button>
              </div>

            </div>

            {/* Location Row (High Density) */}
            <div className="flex flex-col sm:flex-row gap-2 relative z-10 w-full">
              
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 flex-1">
                <div className="h-12">
                  <GlassSelect 
                    value={searchCountry}
                    onChange={handleCountryChange}
                    icon={<MapPin className="w-4 h-4" />}
                    options={[{ value: 'India', label: 'India' }, { value: 'Other', label: 'Other' }]}
                  />
                </div>

                {searchCountry === 'India' ? (
                  <div className="h-12">
                    <GlassSelect 
                      value={searchState}
                      onChange={handleStateChange}
                      placeholder="State"
                      options={[
                        { value: '', label: 'State' },
                        { value: 'Odisha', label: 'Odisha' },
                        { value: 'Maharashtra', label: 'Maharashtra' }
                      ]}
                    />
                  </div>
                ) : (
                  <div className="w-full flex items-center px-3 h-12 bg-slate-50 rounded-xl border border-slate-200"><input type="text" value={searchState} onChange={(e) => setSearchState(e.target.value)} placeholder="State" className="w-full bg-transparent border-none outline-none text-sm focus:ring-0" /></div>
                )}

                {searchCountry === 'India' && searchState === 'Odisha' ? (
                  <div className="h-12">
                    <GlassSelect 
                      value={searchDistrict}
                      onChange={setSearchDistrict}
                      placeholder="District"
                      options={[
                        { value: '', label: 'District' },
                        { value: 'Cuttack', label: 'Cuttack' },
                        { value: 'Khordha', label: 'Bhubaneswar' },
                        { value: 'Sambalpur', label: 'Sambalpur' }
                      ]}
                    />
                  </div>
                ) : (
                  <div className="w-full flex items-center px-3 h-12 bg-slate-50 rounded-xl border border-slate-200"><input type="text" value={searchDistrict} onChange={(e) => setSearchDistrict(e.target.value)} placeholder="District" className="w-full bg-transparent border-none outline-none text-sm focus:ring-0" /></div>
                )}
              </div>

              {/* Search Button */}
              <button onClick={handleSearch} className="sm:w-32 shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-4 h-12 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5">
                Search <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-8">
        
        {/* 2. CORE SERVICES RIBBON (Compact Cards) */}
        <section>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
            {[
              { title: "Doctors", icon: <Stethoscope className="w-6 h-6" />, href: "/doctors", color: "text-blue-600", bg: "bg-blue-50" },
              { title: "Hospitals", icon: <Building2 className="w-6 h-6" />, href: "/hospitals", color: "text-teal-600", bg: "bg-teal-50" },
              { title: "Lab Tests", icon: <TestTube2 className="w-6 h-6" />, href: "/labs", color: "text-purple-600", bg: "bg-purple-50" },
              { title: "Medicines", icon: <Pill className="w-6 h-6" />, href: "/pharmacies", color: "text-orange-600", bg: "bg-orange-50" },
              { title: "Ambulance", icon: <Ambulance className="w-6 h-6" />, href: "#ambulance-ping", color: "text-red-600", bg: "bg-red-50" },
              { title: "My QR", icon: <QrCode className="w-6 h-6" />, href: "#qr-code", action: () => setIsQrModalOpen(true), color: "text-fuchsia-600", bg: "bg-fuchsia-50" },
            ].map((item, i) => (
              <Link 
                key={i} 
                href={item.href}
                className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl hover:border-teal-300 hover:shadow-[0_8px_20px_rgba(20,184,166,0.15)] transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-95 group"
                onClick={(e) => { if (item.action) { e.preventDefault(); item.action(); } }}
              >
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  {React.cloneElement(item.icon as React.ReactElement, { className: `w-6 h-6 ${item.color}` })}
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-700 text-center">{item.title}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 2.5 VISUAL EXPLANATORY GUIDE */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-900">How to use Dehapa</h2>
            <p className="text-sm text-slate-500 font-medium">Your healthcare journey in 3 simple steps.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            <div className="hidden sm:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-slate-100 -z-10 transform -translate-y-1/2"></div>
            
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border-2 border-blue-100 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <Search className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">1. Find Service</h4>
              <p className="text-xs text-slate-500 max-w-[200px]">Search for doctors, hospitals, or symptoms in your area.</p>
            </div>
            
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 border-2 border-teal-100 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
                <UserCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">2. Select & Book</h4>
              <p className="text-xs text-slate-500 max-w-[200px]">Compare options and instantly book an appointment.</p>
            </div>
            
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 border-2 border-purple-100 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                <HeartPulse className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">3. Get Care</h4>
              <p className="text-xs text-slate-500 max-w-[200px]">Visit the clinic or consult online seamlessly.</p>
            </div>
          </div>
        </section>

        {/* 2.6 PREMIUM ADVERTISEMENT BANNER */}
        <section className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 transform hover:-translate-y-1 transition-transform">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-500/20 rounded-full blur-[60px] pointer-events-none"></div>
          
          <div className="relative z-10 text-white max-w-lg text-center sm:text-left">
            <span className="inline-block px-3 py-1 bg-white/10 text-teal-300 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 backdrop-blur-md border border-white/10">Sponsored</span>
            <h3 className="text-xl sm:text-2xl font-black mb-2">Ira Jewels Mega Health Checkup Camp</h3>
            <p className="text-slate-300 text-sm">Free full-body checkups for all Sovereign network patients this weekend in Sambalpur.</p>
          </div>
          
          <div className="relative z-10 w-full sm:w-auto">
            <Link href="/search?q=Ira+Jewels" className="block w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-white px-8 py-3.5 rounded-xl font-bold text-sm text-center transition-all shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(20,184,166,0.6)]">
              Register Now
            </Link>
          </div>
        </section>

        {/* 3. HIGH-DENSITY ACTION GRIDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Specialties Carousel */}
          <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-500" /> Top Specialties
            </h3>
            <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
              {[
                { name: "Dentist", img: "🦷" },
                { name: "Cardiologist", img: "🫀" },
                { name: "Dermatologist", img: "✨" },
                { name: "Pediatrician", img: "👶" },
                { name: "Orthopedic", img: "🦴" },
                { name: "Neurologist", img: "🧠" }
              ].map((spec, i) => (
                <button key={i} onClick={() => { setSearchQuery(spec.name); const el = document.getElementById('search-console'); el?.scrollIntoView({behavior: 'smooth'}); }} className="flex flex-col items-center gap-2 min-w-[80px] group">
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl group-hover:border-teal-400 group-hover:bg-teal-50 transition-all shadow-sm group-hover:shadow-md">
                    {spec.img}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-teal-700">{spec.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Common Symptoms Pills */}
          <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Common Symptoms
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Fever", "Cough", "Headache", "Toothache", "Skin Rash", "Stomach Pain", "Joint Pain", "Acne", "Cold"].map((symptom, i) => (
                <button 
                  key={i} 
                  onClick={() => { setSearchQuery(symptom); const el = document.getElementById('search-console'); el?.scrollIntoView({behavior: 'smooth'}); }}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                >
                  {symptom}
                </button>
              ))}
            </div>
          </section>

        </div>

        {/* 4. SLEEK EMERGENCY BANNER */}
        <section id="ambulance-ping" className="w-full bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl p-4 sm:p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden scroll-mt-24">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/connected.png')] opacity-10 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Ambulance className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl">Emergency Ambulance</h3>
              <p className="text-red-100 text-xs sm:text-sm font-medium">Ping nearest life-support unit in 1 click.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
            {ambulanceETA ? (
              <div className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold text-sm w-full sm:w-auto text-center shadow-md animate-pulse">
                ETA: {ambulanceETA}
              </div>
            ) : (
              <button 
                onClick={handlePingAmbulance}
                disabled={isPinging}
                className="bg-white hover:bg-slate-50 text-red-600 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all w-full sm:w-auto flex items-center justify-center gap-2 shadow-md hover:scale-105"
              >
                {isPinging ? <span className="animate-pulse">Pinging...</span> : <><PhoneCall className="w-4 h-4" /> Send SOS</>}
              </button>
            )}
          </div>
        </section>

        {/* 5. COMPACT PORTAL ACCESS */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black font-serif text-slate-900">Sovereign Portals</h2>
            <p className="text-sm text-slate-500 font-medium">Secure gateways for healthcare entities.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/portal" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-all group">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600"><UserCircle className="w-6 h-6" /></div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-teal-700">Patient Portal</h4>
                <p className="text-xs text-slate-500">Access your vault</p>
              </div>
            </Link>
            
            <Link href="/login?redirect=/portal/verify?role=doctor" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Stethoscope className="w-6 h-6" /></div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-blue-700">Doctor Portal</h4>
                <p className="text-xs text-slate-500">Manage your clinic</p>
              </div>
            </Link>

            <Link href="/login?redirect=/portal/verify?role=hospital" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600"><Building2 className="w-6 h-6" /></div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-indigo-700">Hospital Admin</h4>
                <p className="text-xs text-slate-500">Manage facility</p>
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
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-fuchsia-50 rounded-full flex items-center justify-center mb-4 border border-fuchsia-100">
                <QrCode className="w-6 h-6 text-fuchsia-600" />
              </div>
              
              <h2 className="text-xl font-black text-slate-900 mb-1">My Health QR</h2>
              <p className="text-xs text-slate-600 mb-8 max-w-[250px] font-medium">
                Show this code at any Sovereign Network facility for identity verification.
              </p>
              
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 ring-4 ring-slate-50">
                <QRCode 
                  value={`dehapa-auth://scan?uid=${encodeURIComponent(userUid || "guest")}`}
                  size={200}
                  level="H"
                />
              </div>
              
              <div className="inline-block bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
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
