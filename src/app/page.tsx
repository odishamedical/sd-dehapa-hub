"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Activity, Stethoscope, Building2, TestTube2, Pill, Ambulance, Video, QrCode, ShieldCheck, PhoneCall, ChevronRight, UserCircle, Settings } from "lucide-react";

export default function DehapaHome() {
  const [activeTab, setActiveTab] = useState<"patients" | "doctors" | "hospitals">("patients");
  const [isPinging, setIsPinging] = useState(false);
  const [ambulanceETA, setAmbulanceETA] = useState<string | null>(null);

  const handlePingAmbulance = () => {
    setIsPinging(true);
    // Simulate network delay and finding ambulance
    setTimeout(() => {
      setIsPinging(false);
      setAmbulanceETA("3 mins away");
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      
      {/* 1. HERO SECTION (The Gateway) */}
      <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 bg-gradient-to-b from-slate-900 via-teal-950 to-teal-900 overflow-hidden">
        {/* Background Ambient Effects */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-300/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

        {/* Floating Medical Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
           <Activity className="absolute top-[20%] right-[15%] text-white/5 w-24 h-24 transform rotate-12" />
           <ShieldCheck className="absolute top-[60%] left-[10%] text-white/5 w-32 h-32 transform -rotate-12" />
        </div>

        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-6 lg:px-12 xl:px-16 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-serif text-white mb-6 leading-tight drop-shadow-lg">
            Your Integrated <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-100">Healthcare Ecosystem</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-teal-50 max-w-2xl mx-auto font-medium mb-12 drop-shadow-sm">
            Search doctors, check live hospital beds, book lab tests, and ping emergency ambulances instantly across Odisha.
          </p>

          {/* Glass-morphic Unified Search Bar */}
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-2 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all focus-within:bg-white/20 focus-within:border-teal-300/50">
            <div className="flex-1 w-full flex items-center gap-3 px-4 py-2 sm:py-0">
              <Search className="w-5 h-5 text-teal-300" />
              <input 
                type="text" 
                placeholder="Search doctors, hospitals, specialties..." 
                className="w-full bg-transparent border-none outline-none text-white text-base font-medium placeholder:text-teal-100/70 focus:ring-0" 
              />
            </div>
            <div className="h-px sm:h-8 w-full sm:w-px bg-white/20 my-2 sm:my-0"></div>
            <div className="flex-1 w-full flex items-center gap-3 px-4 py-2 sm:py-0">
              <MapPin className="w-5 h-5 text-teal-300" />
              <input 
                type="text" 
                placeholder="Location (e.g. Bhubaneswar)" 
                className="w-full bg-transparent border-none outline-none text-white text-base font-medium placeholder:text-teal-100/70 focus:ring-0" 
              />
            </div>
            <Link href="/portal" className="w-full sm:w-auto bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-teal-950 px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:scale-[1.02] text-center mt-2 sm:mt-0">
              Search
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CORE SERVICE TICKETS (App-Like Navigation) */}
      <section className="relative z-20 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 -mt-16 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
          
          {[
            { title: "Find Doctors", desc: "Book Specialists", icon: <Stethoscope className="w-8 h-8" />, href: "/doctors", color: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/20" },
            { title: "Hospitals", desc: "Live Bed Availability", icon: <Building2 className="w-8 h-8" />, href: "/hospitals", color: "from-teal-500 to-teal-600", shadow: "shadow-teal-500/20" },
            { title: "Diagnostics", desc: "Lab Tests & Scans", icon: <TestTube2 className="w-8 h-8" />, href: "/labs", color: "from-purple-500 to-purple-600", shadow: "shadow-purple-500/20" },
            { title: "Medicines", desc: "Fast Pharmacy Delivery", icon: <Pill className="w-8 h-8" />, href: "/pharmacies", color: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-500/20" },
            { title: "Ambulance", desc: "1-Click Emergency", icon: <Ambulance className="w-8 h-8" />, href: "#ambulance-ping", color: "from-red-500 to-red-600", shadow: "shadow-red-500/20" },
            { title: "Telemedicine", desc: "Launching Soon", icon: <Video className="w-8 h-8" />, href: "#", color: "from-slate-400 to-slate-500", shadow: "shadow-slate-500/10", disabled: true },
          ].map((item, i) => (
            <Link 
              key={i} 
              href={item.href}
              className={`bg-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-xl transition-all duration-300 group flex flex-col items-start justify-between border border-slate-100 min-h-[160px] sm:min-h-[180px] relative overflow-hidden ${item.disabled ? 'opacity-70 cursor-not-allowed grayscale' : 'hover:-translate-y-1 hover:border-teal-200'}`}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} ${item.shadow} shadow-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                {item.icon}
              </div>
              <div className="relative z-10">
                <h3 className="text-slate-900 font-bold text-base sm:text-lg leading-tight mb-1">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">{item.desc}</p>
              </div>
              
              {/* Decorative Background Blob */}
              <div className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br ${item.color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity`}></div>
            </Link>
          ))}
          
        </div>
      </section>

      {/* 3. UBER-LIKE AMBULANCE PING SYSTEM */}
      <section id="ambulance-ping" className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-16 mb-24 scroll-mt-24">
        <div className="bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border border-slate-800 flex flex-col lg:flex-row relative">
          
          {/* Left Side: Content & Actions */}
          <div className="w-full lg:w-5/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative z-20 bg-slate-900">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest mb-6 w-max">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Emergency Dispatch
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white mb-4 leading-tight">
              Get an Ambulance <br/><span className="text-red-400">in Minutes.</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mb-10 leading-relaxed">
              Our Uber-like ping system instantly alerts all verified DehaPa ambulances within a 5km radius. Track your driver live on the map.
            </p>
            
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block mb-1">Your Location</span>
                  <span className="text-white font-medium text-sm">Patia, Bhubaneswar, Odisha</span>
                </div>
              </div>
              
              <button 
                onClick={handlePingAmbulance}
                disabled={isPinging || !!ambulanceETA}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                  ambulanceETA 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                    : isPinging 
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-1'
                }`}
              >
                {ambulanceETA ? (
                  <><ShieldCheck className="w-5 h-5" /> Driver Dispatched (ETA: {ambulanceETA})</>
                ) : isPinging ? (
                  <><div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> Locating Vehicles...</>
                ) : (
                  <><PhoneCall className="w-5 h-5" /> PING NEAREST AMBULANCE</>
                )}
              </button>
            </div>
          </div>

          {/* Right Side: Map Visualization */}
          <div className="w-full lg:w-7/12 min-h-[400px] lg:min-h-full bg-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 opacity-40 mix-blend-luminosity bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=20.296,85.824&zoom=13&size=800x600&style=feature:all|element:labels.text.fill|color:0xffffff&style=feature:all|element:labels.text.stroke|color:0x000000&style=feature:all|element:labels.icon|visibility:off&style=feature:administrative|element:geometry.fill|color:0x000000&style=feature:administrative|element:geometry.stroke|color:0x144b53&style=feature:landscape|element:all|color:0x08304b&style=feature:poi|element:geometry|color:0x0c4152&style=feature:road.highway|element:geometry.fill|color:0x000000&style=feature:road.highway|element:geometry.stroke|color:0x0b434f&style=feature:water|element:geometry|color:0x021019')] bg-cover bg-center"></div>
            
            {/* User Pin */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="bg-teal-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full mb-2 shadow-lg whitespace-nowrap">You are here</div>
              <div className="w-6 h-6 bg-teal-400 rounded-full border-4 border-slate-900 shadow-[0_0_0_2px_rgba(45,212,191,0.5)] relative">
                <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>

            {/* Radar Sweep Effect */}
            {isPinging && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(239,68,68,0.4)_360deg)] rounded-full animate-[spin_2s_linear_infinite] z-10 pointer-events-none"></div>
            )}

            {/* Mock Ambulances */}
            <div className="absolute top-[30%] left-[60%] w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-500 z-20">
              <span className="text-lg">🚑</span>
            </div>
            <div className="absolute top-[70%] left-[20%] w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-500 z-20">
              <span className="text-lg">🚑</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. QR SMART CONNECTION (Offline to Online) */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-16 mb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Graphic Side */}
          <div className="w-full lg:w-1/2 relative">
            <div className="aspect-[4/3] rounded-[40px] bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center border-4 border-white shadow-2xl relative overflow-hidden">
               {/* Mockup Frame */}
               <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
               <div className="w-64 h-[500px] bg-slate-900 rounded-[40px] shadow-2xl border-8 border-slate-800 flex flex-col relative z-10 transform rotate-12 translate-x-12 translate-y-12">
                 <div className="flex-1 bg-white rounded-[32px] overflow-hidden relative">
                    {/* Scanner UI Mock */}
                    <div className="absolute inset-0 bg-black/60 z-10">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-teal-400 rounded-3xl">
                        <div className="w-full h-0.5 bg-teal-400 absolute top-1/2 animate-[pulse_1s_ease-in-out_infinite]"></div>
                      </div>
                    </div>
                    <img src="https://images.unsplash.com/photo-1551076805-e18690c5e53b?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" alt="Clinic Desk" />
                 </div>
               </div>
               {/* Floating QR */}
               <div className="absolute top-1/4 left-1/4 bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 z-20 transform -rotate-6 hover:rotate-0 transition-transform">
                 <QrCode className="w-24 h-24 text-slate-800" />
                 <p className="text-center text-[8px] font-bold mt-2 uppercase tracking-widest text-slate-500">Scan to Connect</p>
               </div>
            </div>
          </div>
          
          {/* Content Side */}
          <div className="w-full lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest mb-6">
              <QrCode className="w-4 h-4" /> Offline to Online
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-slate-900 mb-6 leading-tight">
              Scan & Connect <br/><span className="text-teal-600">Instantly.</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed">
              Every DehaPa partner clinic has a unique Smart QR Code on their front desk. Simply open your phone camera and scan it to bridge the physical and digital world.
            </p>
            
            <div className="space-y-6">
              {[
                { title: "Live Digital Queues", desc: "Scan to instantly join the doctor's queue and track your exact waiting number from your phone." },
                { title: "Sovereign Health Vault", desc: "Grant the doctor temporary access to your digital health records directly from your vault." },
                { title: "Instant Fee Payments", desc: "Pay consultation fees securely via UPI without waiting at the billing counter." }
              ].map((feat, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                    <span className="text-teal-600 font-bold font-serif">{i + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-1">{feat.title}</h4>
                    <p className="text-sm text-slate-500">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. PARTNER & INSTRUCTION PORTAL */}
      <section className="bg-white border-y border-slate-200 py-24 mb-24">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 mb-4">How DehaPa Works</h2>
          <p className="text-slate-500 mb-12 max-w-xl mx-auto">Select your profile below to see exactly how you can use the platform and access your dedicated gateways.</p>

          {/* Tab Navigation */}
          <div className="inline-flex bg-slate-100 p-1.5 rounded-full mb-12 overflow-x-auto max-w-full">
            {[
              { id: "patients", label: "For Patients", icon: <UserCircle className="w-4 h-4" /> },
              { id: "doctors", label: "For Doctors", icon: <Stethoscope className="w-4 h-4" /> },
              { id: "hospitals", label: "For Hospitals", icon: <Building2 className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white text-teal-700 shadow-md' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-5xl mx-auto bg-slate-50 border border-slate-100 rounded-3xl p-8 sm:p-12 text-left shadow-sm min-h-[300px]">
            {activeTab === "patients" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Patient Journey</h3>
                <div className="grid sm:grid-cols-3 gap-8 mb-8">
                  <div>
                    <h4 className="font-bold text-teal-700 mb-2">1. Find Care</h4>
                    <p className="text-sm text-slate-600">Use the top search bar or service tickets to find the right specialist or hospital near you.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-teal-700 mb-2">2. Book & Track</h4>
                    <p className="text-sm text-slate-600">Book appointments online or scan the clinic QR code to track your live queue status.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-teal-700 mb-2">3. Health Vault</h4>
                    <p className="text-sm text-slate-600">All your prescriptions, lab reports, and consultation notes are automatically saved to your secure digital vault.</p>
                  </div>
                </div>
                <div className="pt-8 border-t border-slate-200">
                  <Link href="/portal" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 uppercase tracking-widest text-sm">
                    Access Patient Portal <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "doctors" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Doctor / Specialist Features</h3>
                <div className="grid sm:grid-cols-3 gap-8 mb-8">
                  <div>
                    <h4 className="font-bold text-teal-700 mb-2">1. Claim Profile</h4>
                    <p className="text-sm text-slate-600">Verify your facility to take control of your public page, update timings, and manage photos.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-teal-700 mb-2">2. Queue Management</h4>
                    <p className="text-sm text-slate-600">Use our Admin CRM to manage daily patient queues. Patients can track their turn from their phone.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-teal-700 mb-2">3. Digital Rx</h4>
                    <p className="text-sm text-slate-600">Write digital prescriptions that instantly sync to the patient's vault and connected pharmacies.</p>
                  </div>
                </div>
                <div className="pt-8 border-t border-slate-200">
                  <Link href="/login?redirect=/portal/verify?role=doctor" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 uppercase tracking-widest text-sm">
                    Verify Your Facility / Login <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "hospitals" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Hospital Network Portal</h3>
                <div className="grid sm:grid-cols-3 gap-8 mb-8">
                  <div>
                    <h4 className="font-bold text-teal-700 mb-2">1. Infrastructure Panel</h4>
                    <p className="text-sm text-slate-600">Publish your hospital infrastructure, ICUs, and specialized departments to attract patients.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-teal-700 mb-2">2. Live Bed Capacity</h4>
                    <p className="text-sm text-slate-600">Update your live bed availability so patients and ambulances know exactly where to go during emergencies.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-teal-700 mb-2">3. Doctor Rosters</h4>
                    <p className="text-sm text-slate-600">Link verified doctors to your hospital profile to showcase your elite medical staff.</p>
                  </div>
                </div>
                <div className="pt-8 border-t border-slate-200">
                  <Link href="/login?redirect=/portal/verify?role=hospital" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 uppercase tracking-widest text-sm">
                    Hospital Admin Login <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. TRUST & SECURITY FOOTER */}
      <footer className="bg-slate-900 text-white pt-16 pb-8 border-t-4 border-teal-500">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            
            <div>
              <h3 className="font-serif font-bold text-2xl mb-4 text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-teal-400" /> DehaPa Health
              </h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm">
                Sovereign Medical Network bridging offline clinical excellence with modern digital health infrastructure.
              </p>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-widest text-slate-500 text-xs mb-4">Security & Compliance</h4>
              <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h5 className="font-bold text-sm text-white">HIPAA Compliant Vaults</h5>
                  <p className="text-[10px] text-slate-400 mt-1">All health records are encrypted via Medplum infrastructure and strictly adhere to HL7 FHIR standards.</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-widest text-slate-500 text-xs mb-4">Quick Links</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                <Link href="/doctors" className="hover:text-teal-400">Find Doctors</Link>
                <Link href="/hospitals" className="hover:text-teal-400">Hospitals</Link>
                <Link href="/labs" className="hover:text-teal-400">Labs & Tests</Link>
                <Link href="/pharmacies" className="hover:text-teal-400">Pharmacies</Link>
                <Link href="/portal" className="hover:text-teal-400">Patient Portal</Link>
                <Link href="/login" className="hover:text-teal-400">Partner Login</Link>
              </div>
            </div>

          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 Shyam Dash Creation. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact Us</Link>
            </div>
            <p>Powered by <strong className="text-teal-400">SD IT Services</strong></p>
          </div>
        </div>
      </footer>

    </main>
  );
}
