"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "react-qr-code";
import { Search, MapPin, Activity, PhoneCall, X, ArrowRight, Video, Calendar, ShieldCheck, Stethoscope, Building2, TestTube2, Pill, Ambulance, Globe, Network, QrCode } from "lucide-react";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import GlassSelect from "@/components/GlassSelect";

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
      router.push('/ambulance'); // Redirect to full ambulance tracking page
    }, 1500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#050B14] font-sans text-white overflow-x-hidden selection:bg-teal-500/30">
      
      {/* MESH GRADIENT BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-teal-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/30 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[20%] w-[40vw] h-[40vw] bg-cyan-600/20 rounded-full blur-[100px]"></div>
      </div>
      
      {/* GRID OVERLAY */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="relative z-10">
        
        {/* 1. HERO & COMMAND CENTER */}
        <section className="pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-teal-300 font-bold text-xs uppercase tracking-widest mb-6 backdrop-blur-md">
            <Activity className="w-4 h-4" /> Sovereign Health Network
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 tracking-tight drop-shadow-lg">
            Healthcare <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">Reimagined.</span>
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
              <button onClick={() => setIsScannerOpen(true)} className="h-14 sm:h-16 px-4 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center backdrop-blur-md" title="Scan QR">
                <QrCode className="w-6 h-6" />
              </button>
              
              <button 
                onClick={handlePingAmbulance}
                disabled={isPinging}
                className="flex-1 sm:flex-none h-14 sm:h-16 px-6 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)] flex items-center justify-center gap-2"
              >
                {isPinging ? <span className="animate-pulse">Pinging...</span> : <><PhoneCall className="w-5 h-5" /> SOS</>}
              </button>
            </div>
          </div>
          
          {/* Smart Suggestions */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['General Physician', 'Cardiologist', 'Urgent Video Call', 'Book Ambulance', 'Order Medicines'].map((term) => (
              <button key={term} onClick={() => { setSearchQuery(term); }} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 hover:text-white transition-colors backdrop-blur-md">
                {term}
              </button>
            ))}
          </div>
        </section>

        {/* 2. FOR PATIENTS: NETFLIX-STYLE GRID */}
        <section className="py-12 pl-4 sm:pl-6 max-w-7xl mx-auto w-full overflow-hidden">
          <div className="flex items-end justify-between mb-6 pr-4 sm:pr-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              For Patients <ChevronRightIcon className="w-6 h-6 text-teal-400" />
            </h2>
          </div>

          <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-8 snap-x snap-mandatory hide-scrollbar">
            
            {/* Card 1: Search Directory */}
            <Link href="/search" className="snap-start shrink-0 w-[280px] sm:w-[320px] h-[400px] sm:h-[450px] relative rounded-[2rem] overflow-hidden group">
              <div className="absolute inset-0 bg-slate-800"></div> {/* Fallback bg */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/80 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] z-20 group-hover:border-teal-400/50 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 z-30 transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 mb-4 backdrop-blur-md">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 leading-tight">Search<br/>Directory</h3>
                <p className="text-slate-300 text-sm">Find verified doctors, hospitals, and clinics instantly.</p>
              </div>
            </Link>

            {/* Card 2: Instant Video Consult */}
            <Link href="/urgent-care" className="snap-start shrink-0 w-[280px] sm:w-[320px] h-[400px] sm:h-[450px] relative rounded-[2rem] overflow-hidden group">
              <Image src="/images/cards/card_video_consult.jpg" alt="Video Consult" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/70 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] z-20 group-hover:border-cyan-400/50 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 z-30 transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-4 backdrop-blur-md">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 leading-tight">Instant Video<br/>Consult</h3>
                <p className="text-slate-300 text-sm">Connect with online doctors right now via Live Queue.</p>
              </div>
            </Link>

            {/* Card 3: Schedule Clinic Visit */}
            <Link href="/search?type=doctor" className="snap-start shrink-0 w-[280px] sm:w-[320px] h-[400px] sm:h-[450px] relative rounded-[2rem] overflow-hidden group">
              <Image src="/images/cards/card_clinic_visit.jpg" alt="Clinic Visit" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/70 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] z-20 group-hover:border-emerald-400/50 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 z-30 transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-4 backdrop-blur-md">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 leading-tight">Schedule<br/>Clinic Visit</h3>
                <p className="text-slate-300 text-sm">Book physical appointments with smart calendar tokens.</p>
              </div>
            </Link>

            {/* Card 4: Live Ambulance */}
            <Link href="/ambulance" className="snap-start shrink-0 w-[280px] sm:w-[320px] h-[400px] sm:h-[450px] relative rounded-[2rem] overflow-hidden group">
              <Image src="/images/cards/card_ambulance.jpg" alt="Ambulance" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/70 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] z-20 group-hover:border-rose-400/50 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 z-30 transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 mb-4 backdrop-blur-md">
                  <Ambulance className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 leading-tight">Live<br/>Ambulance</h3>
                <p className="text-slate-300 text-sm">Ping SOS and track emergency units in real-time.</p>
              </div>
            </Link>

            {/* Card 5: Order Medicines */}
            <Link href="/pharmacies" className="snap-start shrink-0 w-[280px] sm:w-[320px] h-[400px] sm:h-[450px] relative rounded-[2rem] overflow-hidden group">
              <Image src="/images/cards/card_medicines.jpg" alt="Medicines" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/70 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] z-20 group-hover:border-amber-400/50 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 z-30 transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 backdrop-blur-md">
                  <Pill className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 leading-tight">Order<br/>Medicines</h3>
                <p className="text-slate-300 text-sm">Forward your digital Rx to verified local pharmacies.</p>
              </div>
            </Link>

            {/* Card 6: My Health Vault */}
            <Link href="/portal" className="snap-start shrink-0 w-[280px] sm:w-[320px] h-[400px] sm:h-[450px] relative rounded-[2rem] overflow-hidden group pr-4 sm:pr-0">
              <Image src="/images/cards/card_health_vault.jpg" alt="Health Vault" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/70 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] z-20 group-hover:border-purple-400/50 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 z-30 transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 mb-4 backdrop-blur-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 leading-tight">My Health<br/>Vault</h3>
                <p className="text-slate-300 text-sm">Access your secure ID, scan QR, and view records.</p>
              </div>
            </Link>

          </div>
        </section>


        {/* 3. FOR PROVIDERS: NETFLIX-STYLE GRID */}
        <section className="py-12 pl-4 sm:pl-6 max-w-7xl mx-auto w-full overflow-hidden">
          <div className="flex items-end justify-between mb-6 pr-4 sm:pr-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              For Healthcare Providers <ChevronRightIcon className="w-6 h-6 text-indigo-400" />
            </h2>
          </div>

          <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-8 snap-x snap-mandatory hide-scrollbar">
            
            {/* Card 1: Doctor OS */}
            <Link href="/login?redirect=/portal/doctor" className="snap-start shrink-0 w-[300px] sm:w-[360px] h-[250px] sm:h-[280px] relative rounded-[2rem] overflow-hidden group">
              <Image src="/images/cards/card_doctor_os.jpg" alt="Doctor OS" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/60 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] z-20 group-hover:border-indigo-400/50 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 z-30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0 backdrop-blur-md">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-1">Doctor OS</h3>
                  <p className="text-slate-300 text-xs line-clamp-1">Manage Live Queue & AI Rx Pad</p>
                </div>
              </div>
            </Link>

            {/* Card 2: Hospital Admin */}
            <Link href="/login?redirect=/portal/hospital" className="snap-start shrink-0 w-[300px] sm:w-[360px] h-[250px] sm:h-[280px] relative rounded-[2rem] overflow-hidden group">
              <Image src="/images/cards/card_hospital_admin.jpg" alt="Hospital Admin" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/60 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] z-20 group-hover:border-blue-400/50 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 z-30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 backdrop-blur-md">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-1">Hospital Admin</h3>
                  <p className="text-slate-300 text-xs line-clamp-1">Manage Beds & Ambulances</p>
                </div>
              </div>
            </Link>

            {/* Card 3: Pharmacy Fulfillment */}
            <Link href="/login?redirect=/portal/pharmacy" className="snap-start shrink-0 w-[300px] sm:w-[360px] h-[250px] sm:h-[280px] relative rounded-[2rem] overflow-hidden group">
              <Image src="/images/cards/card_pharmacy_network.jpg" alt="Pharmacy Network" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/60 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] z-20 group-hover:border-fuchsia-400/50 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 z-30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/30 flex items-center justify-center text-fuchsia-400 shrink-0 backdrop-blur-md">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-1">Pharmacy Network</h3>
                  <p className="text-slate-300 text-xs line-clamp-1">Fulfill Digital Prescriptions</p>
                </div>
              </div>
            </Link>

            {/* Card 4: Pathology Labs */}
            <Link href="/login?redirect=/portal/lab" className="snap-start shrink-0 w-[300px] sm:w-[360px] h-[250px] sm:h-[280px] relative rounded-[2rem] overflow-hidden group pr-4 sm:pr-0">
              <Image src="/images/cards/card_pathology_lab.jpg" alt="Pathology Labs" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/60 to-transparent z-10"></div>
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] z-20 group-hover:border-violet-400/50 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 z-30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-400 shrink-0 backdrop-blur-md">
                  <TestTube2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-1">Pathology Labs</h3>
                  <p className="text-slate-300 text-xs line-clamp-1">Upload Digital Test Reports</p>
                </div>
              </div>
            </Link>

          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold transition-colors text-center backdrop-blur-md">
              Join the Network
            </Link>
            <Link href="/login" className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors text-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              Partner Login
            </Link>
          </div>
        </section>

      </div>

      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
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

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
