"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "react-qr-code";
import { Search, Activity, PhoneCall, X, Video, Calendar, ShieldCheck, Stethoscope, Building2, TestTube2, Pill, Ambulance, QrCode, AlertCircle, Syringe, HeartPulse } from "lucide-react";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";

const QRScannerModal = dynamic(() => import('@/components/QRScannerModal'), {
  ssr: false
});

export default function DehapaHome() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isPinging, setIsPinging] = useState(false);
  const [ambulanceETA, setAmbulanceETA] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem("sd_current_user_uid") || localStorage.getItem("sd_current_user_email");
    setUserUid(uid);

    const handleOpenQR = () => setIsQrModalOpen(true);
    window.addEventListener('sd_open_qr_modal', handleOpenQR);
    return () => window.removeEventListener('sd_open_qr_modal', handleOpenQR);
  }, []);

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
        
        {/* HERO & COMMAND CENTER */}
        <section className="pt-24 pb-12 px-4 sm:px-6 max-w-[1400px] mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-teal-300 font-bold text-xs uppercase tracking-widest mb-6 backdrop-blur-md">
            <Activity className="w-4 h-4" /> Sovereign Health Network
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-4 tracking-tight drop-shadow-lg leading-tight">
            Healthcare <br className="hidden sm:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">Reimagined.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-300 font-medium mb-12 max-w-2xl">
            The next-generation sovereign directory. Discover verified doctors, hospitals, and clinics powered by advanced transparency.
          </p>

          {/* Master Search Console (Glass) */}
          <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_40px_rgba(20,184,166,0.15)] rounded-[2rem] p-3 flex flex-col sm:flex-row items-center gap-3 relative transition-all focus-within:bg-white/15 focus-within:border-teal-400/50 focus-within:shadow-[0_0_50px_rgba(45,212,191,0.25)]">
            <form onSubmit={handleSearch} className="flex-1 flex items-center w-full px-4 h-14 sm:h-16">
              <Search className="w-6 h-6 text-teal-400 shrink-0 mr-3" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What kind of care do you need today?" 
                className="w-full bg-transparent border-none outline-none text-white text-lg placeholder:text-slate-400 focus:ring-0" 
              />
            </form>
            
            <div className="w-full sm:w-auto flex gap-2">
              <button onClick={() => setIsScannerOpen(true)} className="h-14 sm:h-16 px-4 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center backdrop-blur-md" title="Scan QR">
                <QrCode className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>

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


            {/* DIAGNOSTICS BENTO */}
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
