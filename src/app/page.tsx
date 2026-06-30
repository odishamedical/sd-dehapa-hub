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
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-teal-500/30 overflow-x-hidden text-slate-800">
      
      {/* 1. HERO SECTION (The Premium Medical Gateway) */}
      <section className="relative pt-8 pb-12 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Soft Medical Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-teal-50/50 z-0">
          {/* Subtle Clean Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_20%,transparent_100%)]" />
          
          {/* Soft Glow Orbs */}
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-teal-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[80px] pointer-events-none" />
        </div>

        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            Sovereign Health Network
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black font-serif text-slate-900 mb-6 leading-[1.15] tracking-tight">
            Your Health, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Perfectly Connected.</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto font-medium mb-10">
            Access world-class specialists, instantly book appointments, and carry your encrypted medical vault in your pocket.
          </p>

          {/* Primary Call to Action Buttons (Mobile First) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button 
              onClick={() => {
                const searchEl = document.getElementById('search-console');
                searchEl?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_10px_30px_rgba(20,184,166,0.3)] hover:shadow-[0_15px_40px_rgba(20,184,166,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              Start Your Journey <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-teal-500 px-8 py-4 rounded-2xl font-bold text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <QrCode className="w-5 h-5 text-teal-600" />
              </div>
              Scan Clinic QR
            </button>
          </div>

          {/* Premium Glass Search Console */}
          <div id="search-console" className="max-w-5xl mx-auto bg-white/70 backdrop-blur-2xl border border-white p-4 sm:p-6 rounded-[2rem] flex flex-col gap-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),inset_0_1px_3px_rgba(255,255,255,1)] relative z-40 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
            
            {/* Row 1: The "What" */}
            <div className="flex flex-col sm:flex-row gap-4 relative z-20 w-full">
              <div className="w-full sm:w-64 shrink-0">
                <GlassSelect 
                  value={searchType}
                  onChange={setSearchType}
                  icon={<Activity className="w-5 h-5 text-slate-500" />}
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
              <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 h-[52px] bg-white rounded-2xl border border-slate-200 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all relative z-10 shadow-sm">
                <Search className="w-5 h-5 text-teal-500 shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, specialty, or condition..." 
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-sm font-medium placeholder:text-slate-400 focus:ring-0" 
                />
              </div>
            </div>

            {/* Row 2: The "Where" */}
            <div className="flex flex-col lg:flex-row gap-4 relative z-10 w-full">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                {/* Country Dropdown */}
                <GlassSelect 
                  value={searchCountry}
                  onChange={handleCountryChange}
                  icon={<MapPin className="w-5 h-5" />}
                  options={[
                    { value: 'India', label: 'India' },
                    { value: 'USA', label: 'USA' },
                    { value: 'UAE', label: 'UAE' },
                    { value: 'Australia', label: 'Australia' },
                    { value: 'England', label: 'England' },
                    { value: 'Other', label: 'Other Country' },
                  ]}
                />

                {/* State (Conditional Input/Select) */}
                {searchCountry === 'India' ? (
                  <GlassSelect 
                    value={searchState}
                    onChange={handleStateChange}
                    placeholder="Any State"
                    options={[
                      { value: '', label: 'Any State' },
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
                      { value: 'West Bengal', label: 'West Bengal' },
                      { value: 'Andaman and Nicobar', label: 'Andaman and Nicobar' },
                      { value: 'Chandigarh', label: 'Chandigarh' },
                      { value: 'Dadra and Nagar Haveli', label: 'Dadra and Nagar Haveli' },
                      { value: 'Daman and Diu', label: 'Daman and Diu' },
                      { value: 'Delhi', label: 'Delhi' },
                      { value: 'Lakshadweep', label: 'Lakshadweep' },
                      { value: 'Puducherry', label: 'Puducherry' },
                    ]}
                  />
                ) : (
                  <div className="w-full flex items-center px-4 py-3 h-[52px] bg-white rounded-2xl border border-slate-200 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all shadow-sm">
                    <input 
                      type="text" 
                      value={searchState}
                      onChange={(e) => setSearchState(e.target.value)}
                      placeholder="Enter State/Region" 
                      className="w-full bg-transparent border-none outline-none text-slate-800 text-sm font-medium placeholder:text-slate-400 focus:ring-0" 
                    />
                  </div>
                )}

                {/* District (Conditional Input/Select) */}
                {searchCountry === 'India' && searchState === 'Odisha' ? (
                  <GlassSelect 
                    value={searchDistrict}
                    onChange={setSearchDistrict}
                    placeholder="Any District"
                    options={[
                      { value: '', label: 'Any District' },
                      { value: 'Angul', label: 'Angul' },
                      { value: 'Balangir', label: 'Balangir' },
                      { value: 'Balasore', label: 'Balasore' },
                      { value: 'Bargarh', label: 'Bargarh' },
                      { value: 'Bhadrak', label: 'Bhadrak' },
                      { value: 'Boudh', label: 'Boudh' },
                      { value: 'Cuttack', label: 'Cuttack' },
                      { value: 'Deogarh', label: 'Deogarh' },
                      { value: 'Dhenkanal', label: 'Dhenkanal' },
                      { value: 'Gajapati', label: 'Gajapati' },
                      { value: 'Ganjam', label: 'Ganjam' },
                      { value: 'Jagatsinghpur', label: 'Jagatsinghpur' },
                      { value: 'Jajpur', label: 'Jajpur' },
                      { value: 'Jharsuguda', label: 'Jharsuguda' },
                      { value: 'Kalahandi', label: 'Kalahandi' },
                      { value: 'Kandhamal', label: 'Kandhamal' },
                      { value: 'Kendrapara', label: 'Kendrapara' },
                      { value: 'Kendujhar', label: 'Kendujhar (Keonjhar)' },
                      { value: 'Khordha', label: 'Khordha (Bhubaneswar)' },
                      { value: 'Koraput', label: 'Koraput' },
                      { value: 'Malkangiri', label: 'Malkangiri' },
                      { value: 'Mayurbhanj', label: 'Mayurbhanj' },
                      { value: 'Nabarangpur', label: 'Nabarangpur' },
                      { value: 'Nayagarh', label: 'Nayagarh' },
                      { value: 'Nuapada', label: 'Nuapada' },
                      { value: 'Puri', label: 'Puri' },
                      { value: 'Rayagada', label: 'Rayagada' },
                      { value: 'Sambalpur', label: 'Sambalpur' },
                      { value: 'Subarnapur', label: 'Subarnapur (Sonepur)' },
                      { value: 'Sundargarh', label: 'Sundargarh (Rourkela)' },
                    ]}
                  />
                ) : (
                  <div className="w-full flex items-center px-4 py-3 h-[52px] bg-white rounded-2xl border border-slate-200 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all shadow-sm">
                    <input 
                      type="text" 
                      value={searchDistrict}
                      onChange={(e) => setSearchDistrict(e.target.value)}
                      placeholder="Enter District/City" 
                      className="w-full bg-transparent border-none outline-none text-slate-800 text-sm font-medium placeholder:text-slate-400 focus:ring-0" 
                    />
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button onClick={handleSearch} className="lg:w-48 shrink-0 relative bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white px-8 py-3 h-[52px] rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:shadow-[0_0_50px_rgba(20,184,166,0.6)] hover:scale-105 flex items-center justify-center gap-2 overflow-hidden">
                <span className="relative z-10">Search</span>
                <ChevronRight className="w-5 h-5 relative z-10" />
                {/* Sweep effect on button */}
              </button>
            </div>
          </div>

          {/* Shareable Banner Image */}
          <div className="mt-8 md:mt-16 max-w-5xl mx-auto rounded-[32px] overflow-hidden border border-slate-200 shadow-sm relative group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10 pointer-events-none"></div>
            <img src="/og-home.png" alt="DehaPa Hub - Sovereign Health Network" className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
            <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <button 
                onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('DehaPa Hub: Your Health, Our Mission. Instantly find and book verified top-rated doctors, premium hospitals, pharmacies, and emergency services. https://sd-dehapa-hub.vercel.app/')}`, '_blank')}
                className="bg-[#25D366] text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-[#20b958] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                Share on WhatsApp
              </button>
              <button 
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://sd-dehapa-hub.vercel.app/')}`, '_blank')}
                className="bg-[#1877F2] text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-[#166fe5] transition-colors ml-4"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                Share on Facebook
              </button>
            </div>
          </div>

          {/* Giant Living Consult Button */}
          <div className="mt-8 md:mt-16 flex flex-col items-center justify-center relative z-20 animate-in zoom-in duration-1000 delay-300">
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

      {/* 2. HOW DEHAPA WORKS (Mobile-First Visual Explainer) */}
      <section className="relative z-20 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 -mt-4 lg:-mt-12 mb-16 lg:mb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-black font-serif text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600 font-medium">Your entire healthcare journey in 3 simple steps.</p>
          </div>

          <div className="relative border-l-2 border-teal-100 ml-4 md:ml-0 md:border-l-0">
            {/* Step 1 */}
            <div className="mb-12 relative flex flex-col md:flex-row md:items-center gap-6 pl-8 md:pl-0">
              <div className="absolute left-[-9px] md:static md:w-1/2 flex justify-start md:justify-end md:pr-10">
                <div className="hidden md:flex w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 items-center justify-center shadow-sm relative z-10">
                  <Search className="w-8 h-8 text-teal-600" />
                </div>
                <div className="md:hidden w-4 h-4 rounded-full bg-teal-500 border-4 border-white shadow-sm mt-1 z-10"></div>
              </div>
              <div className="md:w-1/2 md:pl-10 relative">
                {/* Connecting Line for Desktop */}
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-10 h-0.5 bg-teal-100"></div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">1. Find or Scan</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">Search for a doctor above, or physically visit a clinic and scan their DehaPa QR Code using the scanner on this page.</p>
                  <div className="h-24 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <QrCode className="w-10 h-10 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-12 relative flex flex-col md:flex-row-reverse md:items-center gap-6 pl-8 md:pl-0">
              <div className="absolute left-[-9px] md:static md:w-1/2 flex justify-start md:justify-start md:pl-10">
                <div className="hidden md:flex w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 items-center justify-center shadow-sm relative z-10">
                  <UserCircle className="w-8 h-8 text-blue-600" />
                </div>
                <div className="md:hidden w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm mt-1 z-10"></div>
              </div>
              <div className="md:w-1/2 md:pr-10 relative text-left md:text-right">
                {/* Connecting Line for Desktop */}
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-10 h-0.5 bg-blue-100"></div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 md:left-0 w-1 h-full bg-blue-500"></div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">2. Connect & Book</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">Tap "Request Connection" on their profile. Once approved, your Health Vault is linked and you can instantly book appointments.</p>
                  <div className="h-24 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs pointer-events-none">Request Connection</button>
                  </div>
                </div>
              </div>
              {/* Desktop center line connector */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-100 -translate-x-1/2 -z-10"></div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col md:flex-row md:items-center gap-6 pl-8 md:pl-0">
              <div className="absolute left-[-9px] md:static md:w-1/2 flex justify-start md:justify-end md:pr-10">
                <div className="hidden md:flex w-16 h-16 rounded-2xl bg-fuchsia-50 border border-fuchsia-200 items-center justify-center shadow-sm relative z-10">
                  <ShieldCheck className="w-8 h-8 text-fuchsia-600" />
                </div>
                <div className="md:hidden w-4 h-4 rounded-full bg-fuchsia-500 border-4 border-white shadow-sm mt-1 z-10"></div>
              </div>
              <div className="md:w-1/2 md:pl-10 relative">
                {/* Connecting Line for Desktop */}
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-10 h-0.5 bg-fuchsia-100"></div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500"></div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">3. Consult & Store</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">Complete your visit. The doctor's digital prescription and any lab requests are instantly saved to your encrypted Vault.</p>
                  <div className="h-24 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-fuchsia-500" />
                      <span className="text-xs font-bold text-slate-700">Vault Synced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICE TICKETS (Premium Medical Aesthetic) */}
      <section className="relative z-20 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 mb-8 lg:mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">Explore Services</h2>
          <div className="h-px flex-1 bg-slate-200 ml-6 hidden sm:block"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
          
          {[
            { title: "Find Doctors", desc: "Book Specialists", icon: <Stethoscope className="w-10 h-10" />, href: "/doctors", color: "from-blue-500 to-cyan-500" },
            { title: "Hospitals", desc: "Live Bed Arrays", icon: <Building2 className="w-10 h-10" />, href: "/hospitals", color: "from-teal-500 to-emerald-500" },
            { title: "Diagnostics", desc: "Digital Lab Scans", icon: <TestTube2 className="w-10 h-10" />, href: "/labs", color: "from-purple-500 to-pink-500" },
            { title: "Medicines", desc: "Drone Pharmacy", icon: <Pill className="w-10 h-10" />, href: "/pharmacies", color: "from-orange-500 to-yellow-500" },
            { title: "Ambulance", desc: "Hyper-Dispatch", icon: <Ambulance className="w-10 h-10" />, href: "#ambulance-ping", color: "from-red-500 to-rose-500" },
            { title: "Health QR", desc: "Patient Identity", icon: <QrCode className="w-10 h-10" />, href: "#qr-code", action: () => setIsQrModalOpen(true), color: "from-fuchsia-500 to-purple-500" },
          ].map((item, i) => (
            <Link 
              key={i} 
              href={item.href}
              className={`group relative flex flex-col items-start justify-between min-h-[180px] sm:min-h-[260px] bg-white border border-slate-200 rounded-[2.5rem] p-5 sm:p-8 overflow-hidden transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-slate-300`}
              onClick={(e) => {
                if (item.action) {
                  e.preventDefault();
                  item.action();
                }
              }}
            >
              {/* Dynamic Glow Behind Card on Hover */}
              <div className={`absolute -inset-0.5 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-500 rounded-[2.5rem] pointer-events-none`}></div>
              
              {/* Icon Orb */}
              <div className={`relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-6 shadow-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]`}>
                {item.icon}
                <div className="absolute inset-0 bg-white/20 rounded-[1.5rem] blur-sm mix-blend-overlay"></div>
              </div>
              
              <div className="relative z-10 w-full">
                <h3 className={`font-black text-xl sm:text-2xl mb-1 sm:mb-2 tracking-tight text-slate-900 transition-colors duration-500 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${item.color}`}>
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
                  {item.desc}
                </p>
                <div className={`h-1 w-0 bg-gradient-to-r ${item.color} mt-4 sm:mt-6 rounded-full group-hover:w-full transition-all duration-700 ease-out`}></div>
              </div>
            </Link>
          ))}
          
        </div>
      </section>

      {/* 4. UBER-LIKE AMBULANCE PING (Emergency Module) */}
      <section id="ambulance-ping" className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-2 lg:py-8 mb-2 lg:mb-16 scroll-mt-24 relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-red-100 blur-[150px] pointer-events-none rounded-full"></div>

        <div className="bg-white rounded-[3rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(239,68,68,0.15)] border border-red-100 flex flex-col lg:flex-row relative z-10">
          
          {/* Left Side: Clean Interface */}
          <div className="w-full lg:w-5/12 p-5 sm:p-12 lg:p-20 flex flex-col justify-center relative z-20 border-r border-slate-100">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-black uppercase tracking-widest mb-8 w-max">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Emergency Override
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif text-slate-900 mb-6 leading-tight">
              Hyper-Speed <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500">Dispatch.</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mb-8 sm:mb-12 leading-relaxed font-medium">
              Our satellite-linked ping system instantly alerts all DehaPa emergency vehicles within a 5km radius.
            </p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-200 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                  <MapPin className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest font-bold text-slate-500 block mb-1">Target Coordinates</span>
                  <span className="text-slate-900 font-bold text-lg tracking-wide font-mono">20.296° N, 85.824° E</span>
                </div>
              </div>
              
              <button 
                onClick={handlePingAmbulance}
                disabled={isPinging || !!ambulanceETA}
                className={`w-full py-5 rounded-2xl font-black text-base uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden z-10 ${
                  ambulanceETA 
                    ? 'bg-emerald-500 text-white shadow-[0_10px_20px_rgba(16,185,129,0.2)]' 
                    : isPinging 
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300' 
                      : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-[0_10px_20px_rgba(239,68,68,0.2)] hover:shadow-[0_15px_30px_rgba(239,68,68,0.3)] hover:-translate-y-1'
                }`}
              >
                {ambulanceETA ? (
                  <><ShieldCheck className="w-6 h-6 animate-pulse" /> Driver Locked (ETA: {ambulanceETA})</>
                ) : isPinging ? (
                  <><div className="w-6 h-6 border-4 border-slate-400 border-t-slate-700 rounded-full animate-spin"></div> Scanning Grid...</>
                ) : (
                  <><PhoneCall className="w-6 h-6" /> PING NEAREST AMBULANCE</>
                )}
              </button>
            </div>
          </div>

          {/* Right Side: Clean Radar Map */}
          <div className="w-full lg:w-7/12 min-h-[300px] lg:min-h-full bg-slate-50 relative overflow-hidden flex items-center justify-center py-4 lg:py-0 border-t lg:border-t-0 border-slate-100">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-60"></div>
            
            {/* The Radar Circle */}
            <div className="relative w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] rounded-full border border-red-200 shadow-inner flex items-center justify-center bg-white/50 backdrop-blur-sm">
              <div className="absolute w-[66%] h-[66%] rounded-full border border-red-100"></div>
              <div className="absolute w-[33%] h-[33%] rounded-full border border-red-100"></div>
              <div className="absolute w-full h-px bg-red-100"></div>
              <div className="absolute h-full w-px bg-red-100"></div>

              {/* User Center Pin */}
              <div className="absolute z-30 flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg relative">
                  <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Radar Sweep Cone */}
              {isPinging && (
                <div className="absolute w-full h-full rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(239,68,68,0.05)_90deg,rgba(239,68,68,0.2)_360deg)] animate-[spin_3s_linear_infinite] z-20" style={{ transformOrigin: "center" }}>
                  <div className="absolute top-0 right-[50%] w-[50%] h-[50%] border-r-2 border-red-400"></div>
                </div>
              )}

              {/* Target Found */}
              {ambulanceETA && (
                <>
                  <div className="absolute top-[20%] left-[60%] z-40 animate-in zoom-in duration-500 delay-300 flex flex-col items-center">
                    <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase px-2 py-1 rounded mb-2 shadow-sm">ALS Unit-42</div>
                    <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-500">
                      <Ambulance className="w-4 h-4 text-red-500" />
                    </div>
                  </div>
                  <div className="absolute top-[35%] left-[55%] w-[80px] h-[80px] border-l-2 border-b-2 border-dashed border-red-300 animate-pulse z-10"></div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. QR SMART CONNECTION (Cyber-Bridge) */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-2 lg:py-8 mb-4 lg:mb-16 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/connected.png')] opacity-5 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-24 relative z-10">
          
          {/* Holographic Phone Scanner */}
          <div className="w-full lg:w-1/2 relative flex justify-center perspective-[2000px]">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full"></div>
            
            <div className="relative w-[240px] h-[480px] sm:w-[320px] sm:h-[650px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_0_20px_rgba(255,255,255,0.1)] transform rotate-y-[-15deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-1000 ease-out z-20 flex flex-col overflow-hidden group">
               
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
            <div className="absolute top-[40%] right-[-5%] lg:right-[-10%] bg-slate-900 p-4 sm:p-6 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(34,211,238,0.2)] border border-cyan-500/30 z-30 transform rotate-12 hover:rotate-0 hover:scale-110 transition-all duration-700 animate-float">
              <QrCode className="w-32 h-32 text-cyan-400" />
              <div className="mt-4 border-t border-slate-700 pt-3 text-center">
                <span className="text-white font-mono text-[10px] uppercase tracking-widest block font-bold">Node #A7X9</span>
              </div>
            </div>
          </div>
          
          {/* Futuristic Text Content */}
          <div className="w-full lg:w-1/2 relative z-20 mt-12 lg:mt-0 lg:pl-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-black uppercase tracking-widest mb-8 shadow-sm">
              <QrCode className="w-4 h-4" /> Seamless Clinic Sync
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif text-slate-900 mb-8 leading-tight">
              Scan & Instantly <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Connect.</span>
            </h2>
            <p className="text-slate-600 text-lg mb-10 leading-relaxed font-medium">
              Every DehaPa partner clinic has a unique Smart QR. Scan it to instantly bridge the physical clinic desk with your digital health vault.
            </p>
            
            <div className="space-y-6">
              {[
                { title: "Live Digital Queues", desc: "Instantly join the doctor's queue and track your exact waiting number from your phone." },
                { title: "Secure Vault Access", desc: "Grant the doctor temporary access to your medical history via cryptographic handshake." },
                { title: "Frictionless Payments", desc: "Process consultation fees via instant UPI payment without waiting at the physical counter." }
              ].map((feat, i) => (
                <div key={i} className="flex gap-4 sm:gap-6 group bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 hover:border-cyan-300 hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0 group-hover:border-cyan-300 transition-all">
                    <span className="text-cyan-600 font-black font-mono text-xl">0{i + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xl mb-2 group-hover:text-cyan-700 transition-colors">{feat.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. INSTRUCTION PORTAL (Premium Medical Tabs) */}
      <section className="relative z-20 bg-white border-t border-slate-200 py-12 lg:py-20 mb-6 lg:mb-12">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 text-center">
          <h2 className="text-4xl sm:text-5xl font-black font-serif text-slate-900 mb-6">Operating Protocols</h2>
          <p className="text-slate-600 mb-12 max-w-2xl mx-auto text-lg font-medium">Select your role to view operational guidelines and access secure gateways.</p>

          {/* Premium Tab Navigation */}
          <div className="inline-flex bg-slate-100 p-2 rounded-[2rem] mb-12 border border-slate-200 shadow-sm overflow-x-auto max-w-full">
            {[
              { id: "patients", label: "Patient Portal", icon: <UserCircle className="w-5 h-5" /> },
              { id: "doctors", label: "Doctor Portal", icon: <Stethoscope className="w-5 h-5" /> },
              { id: "hospitals", label: "Hospital Portal", icon: <Building2 className="w-5 h-5" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-sm font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Light Tab Content Box */}
          <div className="max-w-6xl mx-auto bg-slate-50 border border-slate-200 rounded-[3rem] p-6 sm:p-10 lg:p-16 text-left shadow-lg relative overflow-hidden min-h-[400px]">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

            {activeTab === "patients" && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 relative z-10">
                <h3 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4">
                  <UserCircle className="w-8 h-8 text-teal-500" /> Patient Lifecycle
                </h3>
                <div className="grid md:grid-cols-3 gap-6 sm:gap-10 mb-8 sm:mb-12">
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="font-black text-teal-600 mb-4 text-xl">01 / Find Care</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">Use the search system to locate highly-rated doctors, hospitals, and pharmacies in your local area.</p>
                  </div>
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="font-black text-teal-600 mb-4 text-xl">02 / Book Online</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">Instantly book consultation slots or use the physical clinic QR code to sync with the doctor's live queue.</p>
                  </div>
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="font-black text-teal-600 mb-4 text-xl">03 / Secure Vault</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">All digital prescriptions and diagnostic logs are automatically saved directly into your personal Health Vault.</p>
                  </div>
                </div>
                <div className="pt-8 border-t border-slate-200 flex justify-end">
                  <Link href="/portal" className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-3 border border-teal-200">
                    Access Patient Portal <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "doctors" && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 relative z-10">
                <h3 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4">
                  <Stethoscope className="w-8 h-8 text-blue-500" /> Doctor Onboarding
                </h3>
                <div className="grid md:grid-cols-3 gap-10 mb-12">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="font-black text-blue-600 mb-4 text-xl">01 / Profile Verification</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">Verify your medical credentials to claim your digital profile, manage your hours, and build patient trust.</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="font-black text-blue-600 mb-4 text-xl">02 / Queue Management</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">Deploy our digital token system at your clinic to effortlessly manage patient queues and walk-ins.</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="font-black text-blue-600 mb-4 text-xl">03 / Digital Rx</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">Write digital prescriptions that sync directly to the patient's vault and local pharmacies automatically.</p>
                  </div>
                </div>
                <div className="pt-8 border-t border-slate-200 flex justify-end">
                  <Link href="/login?redirect=/portal/verify?role=doctor" className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-3 border border-blue-200">
                    Verify Your Practice <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "hospitals" && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 relative z-10">
                <h3 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4">
                  <Building2 className="w-8 h-8 text-indigo-500" /> Hospital Administration
                </h3>
                <div className="grid md:grid-cols-3 gap-10 mb-12">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="font-black text-indigo-600 mb-4 text-xl">01 / Facility Broadcast</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">Publish your hospital's departments, specialists, and surgical capabilities to the entire DehaPa network.</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="font-black text-indigo-600 mb-4 text-xl">02 / Live Bed Tracking</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">Update real-time ICU and ward bed availability so ambulances can route critical patients instantly.</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="font-black text-indigo-600 mb-4 text-xl">03 / Staff Management</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">Digitally link verified doctors to your hospital to showcase your world-class medical team to patients.</p>
                  </div>
                </div>
                <div className="pt-8 border-t border-slate-200 flex justify-end">
                  <Link href="/login?redirect=/portal/verify?role=hospital" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-3 border border-indigo-200">
                    Register Hospital <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Glowing top border */}
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
                Show this code at any Sovereign Network hospital or clinic for instant identity verification.
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
