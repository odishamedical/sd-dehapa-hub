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

      {/* Global Header */}
      <header className="relative z-50 h-[80px] border-b border-tenant-accent/20 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tenant-gradient-from to-tenant-gradient-to flex items-center justify-center text-slate-900 font-bold text-xl shadow-[0_0_20px_var(--tenant-accent-glow)] transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-widest text-slate-900 uppercase font-serif">
              {activeTenant.logoText} <span className="text-tenant-accent">{activeTenant.id === "general" ? "Health" : "Care"}</span>
            </span>
            <span className="text-[9px] text-tenant-accent/80 tracking-[0.2em] uppercase font-mono transition-all">{activeTenant.logoSubText}</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest font-mono text-slate-600">
          <Link href="/doctors" className="hover:text-tenant-accent transition-colors">Find Specialists</Link>
          <Link href="/portal" className="hover:text-tenant-accent transition-colors">Patient Portal</Link>
          <a href="#" className="hover:text-tenant-accent transition-colors flex items-center gap-2">
            Medplum Cloud <span className="w-2 h-2 rounded-full bg-tenant-accent animate-pulse"></span>
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <EcosystemSwitcher />
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="flex flex-col items-start z-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tenant-accent/10 border border-tenant-accent/30 text-tenant-accent text-[10px] uppercase font-bold tracking-widest font-mono mb-8 backdrop-blur-sm shadow-[0_0_15px_var(--tenant-accent-glow)] transition-all">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tenant-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tenant-accent"></span>
              </span>
              FHIR-Compliant Telemedicine OS
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 font-bold leading-[1.1] mb-6 text-left">
              {activeTenant.id === "general" ? (
                <>
                  Healthcare <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-tenant-gradient-from to-tenant-gradient-to">
                    Without Boundaries.
                  </span>
                </>
              ) : (
                <>
                  {activeTenant.name} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-tenant-gradient-from to-tenant-gradient-to">
                    Telemedicine Hub.
                  </span>
                </>
              )}
            </h1>
            
            <p className="text-base md:text-lg text-slate-600 mb-10 max-w-xl leading-relaxed font-light text-left">
              {activeTenant.description}
            </p>
            
            {/* Search Bar / Action Area */}
            <div className="w-full max-w-xl bg-slate-50/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-2 flex items-center gap-2 mb-12 shadow-2xl">
              <div className="flex-1 flex items-center gap-3 px-4">
                <svg className="w-5 h-5 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input 
                  type="text" 
                  placeholder={activeTenant.id === "general" ? "Search doctors, specialties, or symptoms..." : `Search ${activeTenant.name} specialists...`}
                  className="w-full bg-transparent border-none outline-none text-slate-900 text-sm placeholder-[#64748b] font-sans"
                />
              </div>
              <Link href="/doctors" className="bg-tenant-accent hover:opacity-90 text-slate-800 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_var(--tenant-accent-glow)] whitespace-nowrap">
                Find Care
              </Link>
            </div>
            
            <div className="flex items-center gap-6 pt-6 border-t border-slate-200/50">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020610] bg-slate-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 font-mono uppercase tracking-widest">
                <strong className="text-slate-900">
                  {activeTenant.id === "general" ? "2,400+" : "120+"}
                </strong> Specialists Online
              </p>
            </div>
          </div>

          {/* Right Content - Floating UI Cards */}
          <div className="relative h-[600px] hidden lg:block z-20">
            {/* Main Doctor Image / Abstract */}
            <div className="absolute inset-0 bg-gradient-to-br from-tenant-accent/20 to-tenant-accent/5 rounded-[3rem] border border-tenant-accent/20 backdrop-blur-sm overflow-hidden flex items-center justify-center shadow-[0_0_50px_var(--tenant-accent-glow)]">
               <svg className="w-64 h-64 text-tenant-accent/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>

            {/* Floating Card 1: Video Consultation */}
            <div className="absolute top-12 -left-12 bg-white/90 backdrop-blur-xl border border-slate-200 p-6 rounded-2xl shadow-2xl animate-[bounce_8s_ease-in-out_infinite] w-72">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-tenant-accent/20 flex items-center justify-center text-tenant-accent">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold text-sm">Video Consult</h4>
                  <p className="text-[10px] text-tenant-accent font-mono tracking-widest uppercase">Live Session</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-slate-100 rounded-full w-full"></div>
                <div className="h-2 bg-slate-100 rounded-full w-4/5"></div>
              </div>
              <Link href="/portal" className="mt-4 w-full block text-center py-2 bg-tenant-accent/10 text-tenant-accent border border-tenant-accent/30 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-tenant-accent/20 transition-all">
                Join Waiting Room
              </Link>
            </div>

            {/* Floating Card 2: Patient Portal */}
            <div className="absolute bottom-12 -right-8 bg-white/90 backdrop-blur-xl border border-slate-200 p-6 rounded-2xl shadow-2xl animate-[bounce_10s_ease-in-out_infinite_reverse] w-80">
              <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                <h4 className="text-slate-900 font-bold text-sm">Patient Portal</h4>
                <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30 uppercase tracking-widest font-mono">Secured</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-900 font-medium">Recent Lab Results</p>
                      <p className="text-[10px] text-[#64748b]">Dr. S. Mohanty • 2h ago</p>
                    </div>
                  </div>
                  <button className="text-tenant-accent text-[10px] uppercase font-bold tracking-wider hover:underline">View</button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-900 font-medium">Active Prescription</p>
                      <p className="text-[10px] text-tenant-accent">Azithromycin 500mg</p>
                    </div>
                  </div>
                  <button className="text-tenant-accent text-[10px] uppercase font-bold tracking-wider hover:underline">Refill</button>
                </div>
              </div>
            </div>

          </div>
          
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
