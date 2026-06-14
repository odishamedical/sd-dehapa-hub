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
      <div className="relative z-10 w-full bg-[#0d9488] text-white pt-24 pb-36 overflow-hidden">
        {/* Deep Glowing Background Accents */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-teal-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-900/50 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
        
        {/* Abstract Floating 3D Panels (Right Side) */}
        <div className="absolute top-[10%] right-[5%] lg:right-[15%] w-64 h-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl transform rotate-12 shadow-[0_0_40px_rgba(255,255,255,0.1)] pointer-events-none hidden md:block">
           <div className="absolute top-4 left-4 w-12 h-12 rounded-full border-4 border-teal-300/30 border-t-teal-300"></div>
           <div className="absolute bottom-4 right-4 w-32 h-1 bg-white/20 rounded-full"></div>
           <div className="absolute bottom-8 right-4 w-24 h-1 bg-white/20 rounded-full"></div>
        </div>
        <div className="absolute top-[30%] right-[2%] lg:right-[5%] w-56 h-40 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl transform -rotate-6 shadow-[0_0_30px_rgba(0,0,0,0.1)] pointer-events-none hidden lg:block">
           <div className="flex gap-2 items-end h-16 absolute bottom-4 left-4">
              <div className="w-4 h-8 bg-teal-300/40 rounded-sm"></div>
              <div className="w-4 h-12 bg-teal-300/60 rounded-sm"></div>
              <div className="w-4 h-16 bg-white/80 rounded-sm"></div>
           </div>
        </div>
        <div className="absolute top-[5%] left-[5%] lg:left-[10%] w-72 h-72 bg-gradient-to-br from-white/10 to-transparent rounded-3xl transform -rotate-12 border border-white/10 pointer-events-none hidden md:block"></div>

        <div className="container mx-auto px-6 lg:px-12 text-center relative z-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-6 leading-tight drop-shadow-md">
            Your Gateway to Integrated Healthcare.
          </h1>
          <p className="text-lg md:text-xl text-teal-50 max-w-2xl mx-auto font-medium drop-shadow-sm">
            Explore services or Claim Your Listing.
          </p>
        </div>
      </div>

      {/* Overlapping Content: Cards & Search Bar */}
      <div className="relative z-20 container mx-auto px-6 lg:px-12 -mt-16">
          {/* 5 Category Cards - Glassmorphism UI */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-12 w-full">
            {/* Card 1: Doctors */}
            <Link href="/doctors" className="bg-white/90 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-5 flex flex-col items-center hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-300 group">
              <div className="flex items-center gap-3 w-full mb-4">
                <div className="text-2xl bg-teal-50 w-10 h-10 rounded-full flex items-center justify-center border border-teal-100">👨‍⚕️</div>
                <span className="text-sm font-bold text-slate-800">Book Doctors</span>
              </div>
              <div className="w-full bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group-hover:border-teal-200 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Top Speciality</span>
                    <div className="text-amber-400 text-xs tracking-widest">⭐⭐⭐⭐⭐</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">&lt; Availability &gt;</span>
                    <div className="grid grid-cols-7 gap-0.5 text-[7px] text-slate-300 font-mono text-center">
                      <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                      <span></span><span></span><span>1</span><span>2</span><span className="bg-teal-600 text-white rounded">3</span><span>4</span><span>5</span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-700">Specialist ratings</span>
                </div>
              </div>
            </Link>

            {/* Card 2: Hospitals */}
            <Link href="/hospitals" className="bg-white/90 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-5 flex flex-col items-center hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-300 group">
              <div className="flex items-center gap-3 w-full mb-4">
                <div className="text-2xl bg-teal-50 w-10 h-10 rounded-full flex items-center justify-center border border-teal-100">🏥</div>
                <span className="text-sm font-bold text-slate-800">Hospitals</span>
              </div>
              <div className="w-full bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group-hover:border-teal-200 transition-colors">
                <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-0.5">Nearby facilities</span>
                    <span className="text-[11px] font-bold text-slate-800">DehaPa Health</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-bold block mb-0.5">Live status</span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-bold text-slate-700 leading-tight">Real-time bed<br/>Availability</span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Sample</span>
                    <span className="text-[11px] font-bold text-slate-800">1 to 24</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 3: Labs */}
            <Link href="/labs" className="bg-white/90 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-5 flex flex-col items-center hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-300 group">
              <div className="flex items-center gap-3 w-full mb-4">
                <div className="text-2xl bg-teal-50 w-10 h-10 rounded-full flex items-center justify-center border border-teal-100">🔬</div>
                <span className="text-sm font-bold text-slate-800">Labs</span>
              </div>
              <div className="w-full bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group-hover:border-teal-200 transition-colors">
                <div className="flex justify-between items-center bg-slate-100 rounded-lg p-2">
                  <span className="text-[10px] text-slate-400">&lt;</span>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-700 font-bold block">Available Test types 🧪</span>
                    <span className="text-[9px] text-slate-500">Reach Test Results</span>
                  </div>
                  <span className="text-[10px] text-slate-400">&gt;</span>
                </div>
                <div className="text-center mt-1">
                  <span className="text-[11px] font-bold text-slate-700">Integrated results access</span>
                </div>
              </div>
            </Link>

            {/* Card 4: Medicine */}
            <Link href="/pharmacies" className="bg-white/90 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-5 flex flex-col items-center hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-300 group">
              <div className="flex items-center gap-3 w-full mb-4">
                <div className="text-2xl bg-teal-50 w-10 h-10 rounded-full flex items-center justify-center border border-teal-100">💊</div>
                <span className="text-sm font-bold text-slate-800">Medicine</span>
              </div>
              <div className="w-full bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group-hover:border-teal-200 transition-colors">
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[11px] text-slate-700 font-medium">Basic shopping list</span>
                    <div className="w-3 h-3 border border-slate-300 rounded-sm"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-700 font-medium">Recent prescriptions</span>
                    <div className="w-3 h-3 border border-slate-300 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 5: Ambulances */}
            <Link href="/ambulances" className="bg-white/90 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-5 flex flex-col items-center hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-300 group relative">
              <div className="flex items-center gap-3 w-full mb-4">
                <div className="text-2xl bg-red-50 w-10 h-10 rounded-full flex items-center justify-center border border-red-100">🚑</div>
                <span className="text-sm font-bold text-slate-800">Ambulances</span>
              </div>
              <div className="w-full bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group-hover:border-red-200 transition-colors">
                <button className="w-full bg-white border border-slate-200 text-[10px] font-bold text-slate-700 py-1.5 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors">
                  Request Immediate Help
                </button>
                <div className="flex justify-between items-center mt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">ETA</span>
                    <span className="text-[11px] font-bold text-slate-800">4:04 Min</span>
                  </div>
                  <div className="w-10 h-10 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 relative">
                     {/* Fake Map Background */}
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-20"></div>
                     <svg className="w-4 h-4 text-red-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                  </div>
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
