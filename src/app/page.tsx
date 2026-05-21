import Image from "next/image";
import EcosystemSwitcher from "../components/EcosystemSwitcher";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#020610] text-[#f8fafc] overflow-hidden font-sans selection:bg-[#06b6d4]/30">
      
      {/* Dark Theme Ambient Background */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-[#06b6d4]/10 blur-[150px] rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#0d9488]/10 blur-[150px] rounded-full z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-0"></div>

      {/* Global Header */}
      <header className="relative z-50 h-[80px] border-b border-[#06b6d4]/20 bg-[#020610]/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0d9488] flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-widest text-white uppercase font-serif">DehaPa <span className="text-[#06b6d4]">Health</span></span>
            <span className="text-[9px] text-[#0d9488] tracking-[0.2em] uppercase font-mono">Sovereign Medical Network</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest font-mono text-[#94a3b8]">
          <Link href="/doctors" className="hover:text-[#06b6d4] transition-colors">Find Specialists</Link>
          <Link href="/portal" className="hover:text-[#06b6d4] transition-colors">Patient Portal</Link>
          <a href="#" className="hover:text-[#06b6d4] transition-colors flex items-center gap-2">
            Medplum Cloud <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse"></span>
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <EcosystemSwitcher />
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="flex flex-col items-start z-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[#06b6d4] text-[10px] uppercase font-bold tracking-widest font-mono mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#06b6d4]"></span>
              </span>
              FHIR-Compliant Telemedicine OS
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif text-white font-bold leading-[1.1] mb-6">
              Healthcare <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06b6d4] to-[#0d9488]">
                Without Boundaries.
              </span>
            </h1>
            
            <p className="text-base md:text-lg text-[#94a3b8] mb-10 max-w-xl leading-relaxed font-light">
              The next-generation health operating system for the SD Ecosystem. 
              Secure patient records, real-time video consultations, and 
              AI-driven diagnostics—powered securely by Medplum.
            </p>
            
            {/* Search Bar / Action Area */}
            <div className="w-full max-w-xl bg-[#0f172a]/80 backdrop-blur-xl border border-[#1e293b] rounded-2xl p-2 flex items-center gap-2 mb-12 shadow-2xl">
              <div className="flex-1 flex items-center gap-3 px-4">
                <svg className="w-5 h-5 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input 
                  type="text" 
                  placeholder="Search doctors, specialties, or symptoms..." 
                  className="w-full bg-transparent border-none outline-none text-white text-sm placeholder-[#64748b] font-sans"
                />
              </div>
              <Link href="/doctors" className="bg-[#06b6d4] hover:bg-[#0891b2] text-[#020610] px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] whitespace-nowrap">
                Find Care
              </Link>
            </div>
            
            <div className="flex items-center gap-6 pt-6 border-t border-[#1e293b]/50">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020610] bg-[#1e293b] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#94a3b8] font-mono uppercase tracking-widest">
                <strong className="text-white">2,400+</strong> Specialists Online
              </p>
            </div>
          </div>

          {/* Right Content - Floating UI Cards */}
          <div className="relative h-[600px] hidden lg:block z-20">
            {/* Main Doctor Image / Abstract */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/20 to-[#0d9488]/5 rounded-[3rem] border border-[#06b6d4]/20 backdrop-blur-sm overflow-hidden flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.1)]">
               <svg className="w-64 h-64 text-[#06b6d4]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>

            {/* Floating Card 1: Video Consultation */}
            <div className="absolute top-12 -left-12 bg-[#0f172a]/90 backdrop-blur-xl border border-[#1e293b] p-6 rounded-2xl shadow-2xl animate-[bounce_8s_ease-in-out_infinite] w-72">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Video Consult</h4>
                  <p className="text-[10px] text-[#06b6d4] font-mono tracking-widest uppercase">Live Session</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-[#1e293b] rounded-full w-full"></div>
                <div className="h-2 bg-[#1e293b] rounded-full w-4/5"></div>
              </div>
              <Link href="/portal" className="mt-4 w-full block text-center py-2 bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/30 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#06b6d4]/20 transition-colors">
                Join Waiting Room
              </Link>
            </div>

            {/* Floating Card 2: Patient Portal */}
            <div className="absolute bottom-12 -right-8 bg-[#0f172a]/90 backdrop-blur-xl border border-[#1e293b] p-6 rounded-2xl shadow-2xl animate-[bounce_10s_ease-in-out_infinite_reverse] w-80">
              <div className="flex justify-between items-center mb-6 border-b border-[#1e293b] pb-4">
                <h4 className="text-white font-bold text-sm">Patient Portal</h4>
                <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30 uppercase tracking-widest font-mono">Secured</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#1e293b] flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                    </div>
                    <div>
                      <p className="text-xs text-white font-medium">Recent Lab Results</p>
                      <p className="text-[10px] text-[#64748b]">Dr. S. Mohanty • 2h ago</p>
                    </div>
                  </div>
                  <button className="text-[#06b6d4] text-[10px] uppercase font-bold tracking-wider hover:underline">View</button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#1e293b] flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <div>
                      <p className="text-xs text-white font-medium">Active Prescription</p>
                      <p className="text-[10px] text-[#64748b]">Azithromycin 500mg</p>
                    </div>
                  </div>
                  <button className="text-[#06b6d4] text-[10px] uppercase font-bold tracking-wider hover:underline">Refill</button>
                </div>
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </main>
  );
}
