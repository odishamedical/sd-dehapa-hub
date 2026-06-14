"use client";

import Image from "next/image";
import EcosystemSwitcher from "../components/EcosystemSwitcher";
import Link from "next/link";
import { useTenant } from "@/components/TenantContext";

const DEPARTMENTS: any[] = [
  // Zero Mock Data Protocol: Data will be fetched from Firestore CMS
];

export default function Home() {
  const { activeTenant, isLoaded } = useTenant();

  return (
    <main className="relative min-h-screen bg-white text-slate-900 overflow-hidden font-sans selection:bg-tenant-accent/30 flex flex-col justify-between">
      
      {/* Dark Theme Ambient Background */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-tenant-accent/5 blur-[150px] rounded-full z-0 pointer-events-none transition-colors duration-500" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-tenant-accent/5 blur-[150px] rounded-full z-0 pointer-events-none transition-colors duration-500" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-0"></div>

      {/* Global Header is handled by layout.tsx -> GlobalHeader.tsx */}

      {/* Hero Section - DehaPa Web Marketplace Redesign */}
      {/* Dark Teal Background Area with Glassmorphism floating panels */}
      <div className="relative z-10 w-full bg-[#0d9488] text-white pt-16 pb-24 overflow-hidden">
        {/* Deep Glowing Background Accents */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-teal-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-900/50 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
        
        {/* Animated Medical Floating Icons (Right Side) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           {/* Cross */}
           <div className="absolute top-[15%] right-[20%] text-white/10 text-6xl animate-[pulse_4s_ease-in-out_infinite] transform rotate-12 blur-[2px]">✚</div>
           {/* Heartbeat */}
           <div className="absolute top-[40%] right-[10%] text-white/10 text-8xl animate-[pulse_6s_ease-in-out_infinite] transform -rotate-12 blur-[3px]">💓</div>
           {/* Shield */}
           <div className="absolute top-[60%] right-[25%] text-white/5 text-7xl animate-[pulse_5s_ease-in-out_infinite] transform rotate-6 blur-[1px]">🛡️</div>
           {/* Ambulance */}
           <div className="absolute top-[25%] left-[10%] text-white/5 text-6xl animate-[pulse_7s_ease-in-out_infinite] transform -rotate-6 blur-[2px]">🚑</div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 text-center relative z-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-4 leading-tight drop-shadow-md">
            Your Gateway to Integrated Healthcare.
          </h1>
          <p className="text-lg md:text-xl text-teal-50 max-w-2xl mx-auto font-medium drop-shadow-sm">
            Your Health Our Mission
          </p>
        </div>
      </div>

      {/* Overlapping Content: Hyper-Realistic Service Cards */}
      <div className="relative z-20 container mx-auto px-6 lg:px-12 -mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12 w-full">
            
            {/* Card 1: Book Doctor Consultation */}
            <Link href="/doctors" className="bg-gradient-to-b from-slate-100 to-slate-300 rounded-[32px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-2 hover:shadow-[0_30px_50px_rgba(0,0,0,0.3)] transition-all duration-300 group flex flex-col h-[480px] border border-white/50 relative">
              <div className="absolute inset-0 bg-white/40 shadow-[inset_0_0_20px_rgba(255,255,255,0.8)] pointer-events-none rounded-[32px] z-10"></div>
              {/* Top Image Section */}
              <div className="h-44 relative w-full flex-shrink-0">
                <img src="/images/doctor.png" alt="Doctor" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-200/90 via-slate-100/20 to-black/40"></div>
                <h3 className="absolute top-6 left-6 text-white font-serif text-lg font-bold leading-tight drop-shadow-md">BOOK DOCTOR<br/>CONSULTATION</h3>
              </div>
              
              {/* Bottom Data Section */}
              <div className="flex-1 px-5 pb-5 pt-2 flex flex-col gap-3 relative z-20">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Rating</span>
                  <div className="text-amber-400 text-[10px] tracking-widest drop-shadow-sm">⭐⭐⭐⭐⭐</div>
                </div>
                
                {/* Verified Ratings Box */}
                <div className="bg-gradient-to-r from-teal-50 to-white border border-teal-100/50 rounded-xl p-3 flex justify-between items-center shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-teal-900 block mb-0.5">VERIFIED EXPERT RATINGS:</span>
                    <span className="text-[10px] text-slate-600 font-medium">4.9 Stars from 230 Reviews</span>
                  </div>
                  <div className="text-2xl text-teal-600 drop-shadow-md">🎖️</div>
                </div>

                {/* Availability Section */}
                <div className="bg-gradient-to-b from-slate-50 to-slate-200 border border-white rounded-xl p-3 shadow-inner">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-800 uppercase">Availability</span>
                    <div className="text-[9px] text-slate-500 font-mono tracking-widest font-bold">S M <span className="text-teal-600 border-b-2 border-teal-600 pb-0.5">T</span> W T F S</div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-800 text-white text-[8px] px-2 py-1 rounded-full font-bold">NEXT SLOT: Today, 3:15 PM</span>
                  </div>
                  <div className="flex gap-1 justify-between mt-2">
                    {['030', '9A3', '1:00', '1:00', 'PM', '2:M', 'AM'].map((time, i) => (
                      <span key={i} className={`text-[8px] px-1.5 py-1 rounded-md font-bold ${time === 'PM' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 shadow-sm'}`}>{time}</span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-auto flex justify-between items-end">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Specialty Tags:</span>
                    <span className="text-[8px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Primary Care</span>
                  </div>
                  <button className="bg-teal-800 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-md hover:bg-teal-700 transition-colors uppercase">Full Availability</button>
                </div>
              </div>
            </Link>

            {/* Card 2: Hospital & Facility Network */}
            <Link href="/hospitals" className="bg-gradient-to-b from-slate-100 to-slate-300 rounded-[32px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-2 hover:shadow-[0_30px_50px_rgba(0,0,0,0.3)] transition-all duration-300 group flex flex-col h-[480px] border border-white/50 relative">
              <div className="absolute inset-0 bg-white/40 shadow-[inset_0_0_20px_rgba(255,255,255,0.8)] pointer-events-none rounded-[32px] z-10"></div>
              {/* Top Image Section */}
              <div className="h-44 relative w-full flex-shrink-0">
                <img src="/images/hospital.png" alt="Hospital" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-200/90 via-slate-100/20 to-black/40"></div>
                <h3 className="absolute top-6 left-6 text-white font-serif text-lg font-bold leading-tight drop-shadow-md">HOSPITAL<br/>& FACILITY<br/>NETWORK</h3>
              </div>
              
              {/* Bottom Data Section */}
              <div className="flex-1 px-5 pb-5 pt-0 flex flex-col gap-4 relative z-20">
                {/* Map Box */}
                <div className="bg-white rounded-2xl p-3 shadow-md border border-slate-200 relative overflow-hidden flex items-center justify-between -mt-6">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]"></div>
                  <div className="relative z-10">
                     <span className="text-teal-700 text-2xl drop-shadow-md">📍</span>
                     <span className="text-[10px] font-bold text-slate-800 block mt-1">DehaPa Health</span>
                  </div>
                  <div className="relative z-10 flex flex-col gap-2">
                     <span className="bg-white text-slate-700 text-[8px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 border border-slate-100"><span className="text-[10px]">📍</span> 2 Nearby facilities</span>
                     <span className="bg-white text-slate-700 text-[8px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 border border-slate-100"><span className="text-[10px]">📍</span> 2 Nearby facilities</span>
                  </div>
                </div>

                {/* Live Status */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-800 uppercase">Live Status:</span>
                  <div className="bg-teal-700 text-white text-[10px] font-medium px-3 py-1.5 rounded-lg shadow-sm">
                    Live Capacity: ICU 12/20, General <span className="font-bold">45/60</span>
                  </div>
                </div>

                {/* Bed Availability */}
                <div className="mt-2 border-t border-slate-300/50 pt-3">
                  <span className="text-[10px] font-bold text-slate-800 uppercase block mb-1">Real-Time Bed Availability Range:</span>
                  <span className="text-lg font-bold text-slate-900">1 to 24 Beds</span>
                </div>

                {/* Bottom Action */}
                <div className="mt-auto text-center">
                  <button className="bg-teal-800 text-white text-[10px] font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-teal-700 transition-colors uppercase w-[80%]">View Live Capacity</button>
                </div>
              </div>
            </Link>

            {/* Card 3: Lab Services */}
            <Link href="/labs" className="bg-gradient-to-b from-slate-100 to-slate-300 rounded-[32px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-2 hover:shadow-[0_30px_50px_rgba(0,0,0,0.3)] transition-all duration-300 group flex flex-col h-[480px] border border-white/50 relative">
              <div className="absolute inset-0 bg-white/40 shadow-[inset_0_0_20px_rgba(255,255,255,0.8)] pointer-events-none rounded-[32px] z-10"></div>
              {/* Top Image Section */}
              <div className="h-44 relative w-full flex-shrink-0">
                <img src="/images/lab.png" alt="Lab" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-200/90 via-slate-100/20 to-black/40"></div>
                <h3 className="absolute top-6 left-6 text-white font-serif text-lg font-bold leading-tight drop-shadow-md">LAB SERVICES<br/>& TEST PANELS</h3>
              </div>
              
              {/* Bottom Data Section */}
              <div className="flex-1 px-5 pb-5 pt-3 flex flex-col gap-3 relative z-20">
                {/* Available Tests Title */}
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-800 uppercase">Available Test Types</span>
                  <span className="text-xl drop-shadow-sm transform -rotate-45 text-teal-600">💉</span>
                </div>

                {/* Test List */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-10 bg-teal-500 rounded-full mt-0.5"></div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-800 block leading-none">Wellness</span>
                      <span className="text-[8px] text-slate-500 leading-tight block mt-0.5">Categorize define ideologies, wellness, preparation and wellness.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-8 bg-sky-500 rounded-full mt-0.5"></div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-800 block leading-none">Diagnostic</span>
                      <span className="text-[8px] text-slate-500 leading-tight block mt-0.5">Diagnostic class, diagnostic, and rewards modellanel spectromonis.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-6 bg-red-500 rounded-full mt-0.5"></div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-800 block leading-none">Blood Panels</span>
                      <span className="text-[8px] text-slate-500 leading-tight block mt-0.5">Cateroper, vaystabite, Diagnostic, mancct and blood panels.</span>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-auto space-y-2">
                  <div className="bg-gradient-to-r from-white to-slate-100 border border-slate-300 rounded-xl p-2.5 shadow-sm flex items-center gap-3">
                    <span className="text-2xl text-teal-700 drop-shadow-sm">📋</span>
                    <div>
                      <span className="text-[9px] font-bold text-slate-800 uppercase block leading-tight">Integrated Results Portal</span>
                      <span className="text-[8px] text-slate-500 block">Reach Filtered Results Portal</span>
                    </div>
                  </div>
                  <div className="bg-transparent p-1 flex items-center gap-3 border-t border-slate-300/50 pt-2">
                    <span className="text-2xl text-teal-700 drop-shadow-sm">🛵</span>
                    <div>
                      <span className="text-[9px] font-bold text-slate-800 uppercase block leading-tight">Home Pickup Service</span>
                      <span className="text-[8px] text-slate-500 block">New ocr on home pickup service</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 4: Prescription & Medication */}
            <Link href="/pharmacies" className="bg-gradient-to-b from-slate-100 to-slate-300 rounded-[32px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-2 hover:shadow-[0_30px_50px_rgba(0,0,0,0.3)] transition-all duration-300 group flex flex-col h-[480px] border border-white/50 relative">
              <div className="absolute inset-0 bg-white/40 shadow-[inset_0_0_20px_rgba(255,255,255,0.8)] pointer-events-none rounded-[32px] z-10"></div>
              {/* Top Image Section */}
              <div className="h-44 relative w-full flex-shrink-0">
                <img src="/images/medicine.png" alt="Medicine" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-200/90 via-slate-100/20 to-black/40"></div>
                <h3 className="absolute top-6 left-6 text-slate-800 font-serif text-lg font-bold leading-tight drop-shadow-md text-shadow-white">PRESCRIPTION<br/>& MEDICATION</h3>
              </div>
              
              {/* Bottom Data Section */}
              <div className="flex-1 px-5 pb-5 pt-3 flex flex-col gap-4 relative z-20">
                
                {/* Shopping List Box */}
                <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-800 uppercase block mb-2 border-b border-slate-200 pb-1">Basic Shopping List</span>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-700 font-medium">Basic shopping list</span>
                      <div className="w-3.5 h-3.5 border border-slate-400 bg-white rounded-sm shadow-inner"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-700 font-medium">Medication</span>
                      <div className="w-3.5 h-3.5 border border-slate-400 bg-white rounded-sm shadow-inner"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-700 font-medium">Medication list</span>
                      <div className="w-3.5 h-3.5 border border-slate-400 bg-white rounded-sm shadow-inner"></div>
                    </div>
                  </div>
                </div>

                {/* Recent Prescriptions */}
                <div>
                  <span className="text-[10px] font-bold text-slate-800 uppercase block mb-2 border-b border-slate-300/50 pb-1">Recent Prescriptions</span>
                  <div className="space-y-1.5 text-[9px] text-slate-700 font-medium">
                    <div className="flex justify-between"><span>1. <strong className="text-slate-900">Metformin</strong> 500mg</span><span className="text-slate-500">Rx12345</span></div>
                    <div className="flex justify-between"><span>2. <strong className="text-slate-900">Atorvastatin</strong> 20mg</span><span className="text-slate-500">Rx67890</span></div>
                    <div className="flex justify-between"><span>3. <strong className="text-slate-900">Atorvastatin</strong> 20mg</span><span className="text-slate-500">Rx67890</span></div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-auto text-center">
                  <button className="bg-teal-800 text-white text-[10px] font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-teal-700 transition-colors uppercase w-[90%]">Refill Prescriptions</button>
                </div>
              </div>
            </Link>

            {/* Card 5: Emergency Services */}
            <Link href="/ambulances" className="bg-gradient-to-b from-slate-900 via-slate-800 to-black rounded-[32px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_30px_50px_rgba(220,38,38,0.2)] transition-all duration-300 group flex flex-col h-[480px] border border-slate-700 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
              {/* Top Image Section */}
              <div className="h-44 relative w-full flex-shrink-0">
                <img src="/images/ambulance.png" alt="Ambulance" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-black/40 to-black/80"></div>
                <h3 className="absolute top-6 left-6 text-white font-serif text-lg font-bold leading-tight drop-shadow-md">EMERGENCY<br/>SERVICES</h3>
              </div>
              
              {/* Bottom Data Section */}
              <div className="flex-1 px-5 pb-5 pt-4 flex flex-col gap-4 relative z-20">
                
                {/* Huge Red Button */}
                <button className="w-full bg-gradient-to-b from-red-600 to-red-800 border border-red-500/50 text-white text-xs font-bold py-3.5 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.4),inset_0_2px_5px_rgba(255,255,255,0.3)] hover:brightness-110 transition-all uppercase tracking-wide">
                  Request Immediate Help
                </button>

                {/* Live ETA Box */}
                <div className="bg-black/40 border border-slate-700 rounded-2xl p-4 flex justify-between items-center backdrop-blur-md shadow-inner mt-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Live ETA:</span>
                    <span className="text-2xl font-bold text-white leading-none block mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">3:55 Min</span>
                    <span className="text-[9px] text-teal-400 border-b border-teal-400/50 hover:text-teal-300 cursor-pointer">Track Ambulance Live</span>
                  </div>
                  <div className="w-16 h-16 bg-slate-800 rounded-xl overflow-hidden border border-slate-600 relative shadow-inner">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-30"></div>
                     <span className="text-sky-400 text-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">📍</span>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-auto flex justify-between items-end border-t border-slate-700/50 pt-3">
                  <span className="text-[9px] text-slate-400">Dispatch type: <strong className="text-white">Advanced Life Support</strong></span>
                  <span className="text-slate-500 text-lg">✨</span>
                </div>
              </div>
            </Link>

          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white p-2 md:p-3 rounded-full flex items-center shadow-[0_10px_40px_rgba(0,0,0,0.08)] mb-8 border border-slate-100">
            <div className="flex-1 px-4 flex items-center gap-3 text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Find Doctors, Hospitals, Labs near you" className="w-full bg-transparent border-none outline-none text-slate-900 text-sm md:text-base font-sans" />
            </div>
            <button className="bg-[#0d9488] hover:bg-[#0f766e] text-white px-6 py-2 md:py-3 rounded-full font-bold text-sm transition-colors whitespace-nowrap">
              Search
            </button>
          </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-16 bg-white relative z-10">
        <h3 className="text-2xl font-bold font-serif text-slate-900 mb-8">Claim Your Business</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: "Doctors & Clinics", desc: "Build trust and attract new patients in your area.", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
            { title: "Hospitals", desc: "Showcase your facilities, beds, and specialists.", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
            { title: "Diagnostic Labs", desc: "Publish test pricing and home collection services.", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
            { title: "Pharmacies", desc: "Highlight your fast delivery and medicine stock.", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start text-left">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 border border-teal-100">
                 <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon}></path></svg>
              </div>
              <h4 className="text-slate-900 font-bold mb-1">{item.title}</h4>
              <p className="text-xs text-slate-500 mb-6 flex-1">{item.desc}</p>
              <Link href="/portal/claim" className="mt-auto text-teal-600 font-bold text-xs uppercase tracking-widest border border-teal-200 hover:bg-teal-50 px-4 py-2 rounded-lg w-full text-center transition-colors">
                Claim Now
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* NEW SECTION 1: Advanced Medical Grid Departments */}
      <section className="relative z-10 container mx-auto px-6 lg:px-12 py-16 border-t border-slate-200 bg-slate-50/50 rounded-3xl mb-16 backdrop-blur-sm">
        <div className="mb-12 text-left">
          <span className="text-[9px] font-mono tracking-widest text-tenant-accent uppercase font-bold block mb-1">Clinical Specialties</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">Advanced Medical Grid</h2>
          <p className="text-slate-600 text-sm">Select a department to view online specialist schedules, fees, and diagnostic features.</p>
        </div>

        {DEPARTMENTS.length === 0 ? (
          <div className="w-full text-center py-16 border-2 border-dashed border-tenant-accent/20 rounded-2xl bg-white shadow-sm">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-widest font-bold">No Specialties Configured</p>
            <p className="text-xs text-slate-400 mt-2">Awaiting CMS Data Seeding via Firebase...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {DEPARTMENTS.map(dept => (
              <div 
                key={dept.id} 
                className="bg-slate-50 border border-tenant-accent/15 rounded-2xl p-5 hover:border-tenant-accent/40 hover:shadow-[0_0_20px_var(--tenant-accent-glow)] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 bg-tenant-accent/10 border border-tenant-accent/20 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform">
                    {dept.icon}
                  </div>
                  <h4 className="text-slate-900 font-bold text-base mb-1 group-hover:text-tenant-accent transition-colors text-left">{dept.name}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-4 text-left">{dept.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/60">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {dept.features.map((feat: string, idx: number) => (
                      <span key={idx} className="bg-slate-900 text-[8px] font-mono px-2 py-0.5 rounded text-gray-400">
                        {feat}
                      </span>
                    ))}
                  </div>
                  <Link 
                    href="/doctors"
                    className="w-full py-2 bg-tenant-accent/10 text-tenant-accent hover:bg-tenant-accent hover:text-slate-800 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all text-center block"
                  >
                    Consult Specialists
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NEW SECTION 2: How it Works (1-2-3 Consultation Flow) */}
      <section className="relative z-10 container mx-auto px-6 lg:px-12 py-16 mb-16">
        <div className="mb-12 text-center">
          <span className="text-[9px] font-mono tracking-widest text-tenant-accent uppercase font-bold block mb-1">Workflow Overview</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">HIPAA Secure Video Consults</h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">Get treated securely from home in three simple steps, connected to the central SD SSO identity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Single Sign-On", desc: "Sign in with Google. Complete your free WhatsApp contact profile to unlock clinical slots instantly." },
            { step: "02", title: "Choose Specialist", desc: "Search the advanced grid. Filter by hospital (Apollo, KIMS, Care) or search by chief symptoms." },
            { step: "03", title: "Video Consult & Rx", desc: "Join your secure telehealth waiting room. Write prescriptions dispatched directly to your vault." }
          ].map((flow, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col items-start relative group hover:border-tenant-accent transition-colors shadow-sm hover:shadow-xl">
              <span className="text-4xl font-serif font-black text-slate-100 group-hover:text-tenant-accent/20 transition-colors font-mono mb-4 block">
                {flow.step}
              </span>
              <h4 className="text-slate-900 font-bold text-lg mb-2 font-serif text-left">{flow.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed text-left">{flow.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEW SECTION 3: Medplum Trust Compliance Plaque */}
      <section className="relative z-10 container mx-auto px-6 lg:px-12 py-4 mb-24">
        <div className="bg-gradient-to-r from-tenant-accent/10 via-white to-tenant-accent/5 border border-tenant-accent/20 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl leading-none pointer-events-none">
            🛡️
          </div>
          <div className="space-y-4 max-w-2xl text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tenant-accent/10 border border-tenant-accent/20 text-tenant-accent text-[10px] font-bold uppercase tracking-widest font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-tenant-accent animate-pulse"></span>
              <span>100% HIPAA & FHIR Certified</span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 leading-tight">
              Sovereign Health Vaults <br />
              <span className="text-tenant-accent">Secured via Medplum Infrastructure.</span>
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              All health charts, diagnostics, and prescription dispatches are encrypted using industry-standard HL7 FHIR formats. Rest assured that your private medical data is restricted only to verified clinicians.
            </p>
          </div>

          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <Link 
              href="/portal"
              className="px-6 py-3.5 bg-tenant-accent hover:opacity-90 text-slate-800 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_var(--tenant-accent-glow)] block text-center"
            >
              Access Patient Vault
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-8 px-6 text-center w-full">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 Shyam Dash Creation. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-tenant-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-tenant-accent transition-colors">HIPAA Disclosures</a>
            <span className="flex items-center gap-1">Powered by <strong className="text-tenant-accent">SD IT Services</strong></span>
          </div>
        </div>
      </footer>

    </main>
  );
}
