"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Stethoscope, Building2, ShieldCheck, Pill, Ambulance, TestTube2, ArrowRight } from "lucide-react";

export default function V2Homepage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("Directory");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col w-full bg-white font-sans">
      
      {/* V2 Hero Section (Premium Light Theme, Contained Grid) */}
      <section className="relative pt-12 pb-16 z-20 flex justify-center w-full px-4 sm:px-8 lg:px-16">
        
        {/* Contained Hero Box (1400px Max Width) */}
        <div className="w-full max-w-[1400px] min-h-[500px] lg:min-h-[600px] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-gradient-to-br from-[#f8faff] to-blue-50 border border-slate-100/50 flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12 relative">
          
          {/* Placeholder for Custom Mobile Art / Desktop Art */}
          <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-end px-12 opacity-50 pointer-events-none">
             <div className="w-full md:w-1/2 h-full border-2 border-dashed border-blue-200 rounded-3xl flex flex-col items-center justify-center text-blue-400 font-bold bg-blue-50/50">
               <span>Hero Image Space (9:16 Mobile, 16:9 Desktop)</span>
               <span className="text-sm font-normal mt-2">Generate image with subject strictly at edges to prevent text overlap.</span>
             </div>
          </div>

          <div className="relative z-10 max-w-2xl mt-8 md:mt-0">
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-black text-slate-900 tracking-tight mb-4 leading-[1.1]">
              Connecting You to <br className="hidden md:block" />
              <span className="text-[#0461be]">Better Health</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-700 mb-10 font-medium">
              Empower your health journey with Dehapa Hub. Find doctors, book hospitals, and order medicines instantly.
            </p>

            {/* V2 Custom Glassmorphism Search Bar */}
            <form onSubmit={(e) => e.preventDefault()} className="w-full relative shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-xl bg-white/95 backdrop-blur-xl border border-white focus-within:ring-4 focus-within:ring-blue-400/20 transition-all flex items-center p-1.5 mb-8 group hover:shadow-[0_15px_40px_rgba(0,0,0,0.15)]">
                <div className="flex items-center pl-2 md:pl-4 border-r border-slate-200 shrink-0 relative">
                  <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-400 mr-1 md:mr-2 hidden sm:block" />
                  
                  {/* Custom React Dropdown */}
                  <div 
                    className="flex items-center cursor-pointer group/dropdown"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="text-slate-700 font-bold text-xs sm:text-sm md:text-base pr-1 md:pr-2 select-none">
                      {searchCategory}
                    </span>
                    <svg className={`w-3 h-3 md:w-4 md:h-4 text-slate-400 ml-0.5 md:ml-1 mr-1 md:mr-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>

                  {/* Dropdown Menu - Custom UI */}
                  {isDropdownOpen && (
                    <>
                      {/* Invisible backdrop to close dropdown when clicking outside */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                      
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-xl border border-white/50 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        {['Directory', 'Doctors', 'Hospitals', 'Labs', 'Pharmacies', 'Ambulance'].map((cat) => (
                          <div 
                            key={cat}
                            className={`px-4 py-2.5 text-sm md:text-base font-medium cursor-pointer transition-colors ${searchCategory === cat ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            onClick={() => {
                              setSearchCategory(cat);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {cat}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <input 
                  type="text" 
                  placeholder="Search for services..." 
                  className="flex-1 bg-transparent border-none outline-none text-slate-800 px-3 md:px-4 py-3 md:py-4 placeholder-slate-400 font-medium text-sm sm:text-base md:text-lg min-w-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <button type="submit" className="bg-[#f39c12] hover:bg-[#d68910] text-white font-bold text-xs sm:text-sm md:text-base py-3 md:py-4 px-6 md:px-8 rounded-lg transition-colors mr-0.5 sm:mr-1 shadow-md hover:shadow-lg shadow-orange-500/20">
                  Search
                </button>
            </form>

            {/* Tactile 3D Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
              <Link href="/join" className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 py-3 sm:py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.2)] transition-all font-bold text-sm md:text-base hover:-translate-y-0.5">
                 <Stethoscope className="w-4 h-4" /> Join as Doctor
              </Link>
              <Link href="/join" className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#c0392b] to-[#a93226] hover:from-[#a93226] hover:to-[#922b21] text-white rounded-lg px-4 py-3 sm:py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_10px_rgba(231,76,60,0.3)] transition-all font-bold text-sm md:text-base hover:-translate-y-0.5">
                 <Building2 className="w-4 h-4" /> List Hospital
              </Link>
              <Link href="/claim" className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#d68910] to-[#b9770e] hover:from-[#b9770e] hover:to-[#9c640c] text-white rounded-lg px-4 py-3 sm:py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_10px_rgba(243,156,18,0.3)] transition-all font-bold text-sm md:text-base hover:-translate-y-0.5">
                 <ShieldCheck className="w-4 h-4" /> Claim Listing
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* V2 Browse Categories (Strict Grid Cards) */}
      <section className="w-full flex justify-center py-16 px-4 sm:px-8 lg:px-16 bg-white relative z-10">
        <div className="w-full max-w-[1400px]">
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Explore Network</h2>
            <Link href="/search" className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1 group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            
            <Link href="/search?type=doctor" className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-4 hover:border-blue-200">
              <div className="w-14 h-14 bg-blue-50 group-hover:bg-blue-100 rounded-full flex items-center justify-center text-blue-600 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,1)]">
                <Stethoscope className="w-7 h-7" />
              </div>
              <span className="font-bold text-slate-800 group-hover:text-blue-700">Doctors</span>
            </Link>

            <Link href="/search?type=hospital" className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-4 hover:border-red-200">
              <div className="w-14 h-14 bg-red-50 group-hover:bg-red-100 rounded-full flex items-center justify-center text-red-600 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,1)]">
                <Building2 className="w-7 h-7" />
              </div>
              <span className="font-bold text-slate-800 group-hover:text-red-700">Hospitals</span>
            </Link>

            <Link href="/search?type=pharmacy" className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-4 hover:border-emerald-200">
              <div className="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,1)]">
                <Pill className="w-7 h-7" />
              </div>
              <span className="font-bold text-slate-800 group-hover:text-emerald-700">Pharmacies</span>
            </Link>

            <Link href="/search?type=lab" className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-4 hover:border-purple-200">
              <div className="w-14 h-14 bg-purple-50 group-hover:bg-purple-100 rounded-full flex items-center justify-center text-purple-600 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,1)]">
                <TestTube2 className="w-7 h-7" />
              </div>
              <span className="font-bold text-slate-800 group-hover:text-purple-700">Labs & Diagnostics</span>
            </Link>

            <Link href="/search?type=ambulance" className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-4 hover:border-orange-200">
              <div className="w-14 h-14 bg-orange-50 group-hover:bg-orange-100 rounded-full flex items-center justify-center text-orange-600 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,1)]">
                <Ambulance className="w-7 h-7" />
              </div>
              <span className="font-bold text-slate-800 group-hover:text-orange-700">Ambulance</span>
            </Link>

          </div>
        </div>
      </section>

      {/* AD INJECTION ZONE 1 */}
      <div className="w-full flex justify-center py-4 bg-slate-50">
        <div className="w-full max-w-[1400px] h-[100px] bg-slate-200/50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-sm">
          [ Ad Injection Zone 1 / AdSense Placeholder ]
        </div>
      </div>

      {/* V2 Provider Guide ("How to Grow Your Practice") */}
      <section className="w-full flex justify-center py-24 px-4 sm:px-8 lg:px-16 bg-slate-900 text-white relative overflow-hidden">
        {/* Soft dark mode glowing background blobs */}
        <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[150%] bg-teal-600/20 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-[1400px] relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="flex flex-col items-start max-w-xl">
            <div className="text-blue-400 font-bold tracking-widest uppercase mb-2 text-sm">For Providers</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-[1.1]">
              Grow Your Medical Practice Nationally
            </h2>
            <p className="text-slate-300 text-lg mb-8 font-medium">
              Join India's most trusted healthcare network. Reach thousands of patients, manage your bookings, and build your digital reputation instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link href="/join" className="bg-white hover:bg-slate-100 text-slate-900 font-bold py-4 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group hover:-translate-y-0.5">
                Onboard Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/claim" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2">
                Claim Existing Listing
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4">
                <span className="font-black text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Create Profile</h3>
              <p className="text-slate-400 text-sm">Use our 5-Tier wizard to accurately map your services down to the block level.</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl mt-0 sm:mt-8">
              <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 mb-4">
                <span className="font-black text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Get Verified</h3>
              <p className="text-slate-400 text-sm">Our admin team verifies your credentials to grant you the trusted blue checkmark.</p>
            </div>
          </div>

        </div>
      </section>

      {/* V2 National SEO Block */}
      <section className="w-full flex justify-center py-20 px-4 sm:px-8 lg:px-16 bg-white border-t border-slate-100">
        <div className="w-full max-w-[1400px] flex flex-col items-center text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-6">India's Premium Healthcare Network</h2>
          <p className="text-slate-500 max-w-4xl text-lg leading-relaxed mb-8">
            Dehapa Hub is a nationally recognized medical directory designed to connect patients with top-tier specialists, advanced hospitals, and emergency ambulance services. Whether you are looking for a highly-rated Cardiologist in Delhi, an advanced Orthopedic Surgeon in Odisha, or a 24/7 Pharmacy in Bangalore, our 5-Tier Location Architecture ensures you find precisely what you need, exactly where you need it.
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl">
            {['Delhi', 'Mumbai', 'Odisha', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'].map((city) => (
              <span key={city} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-bold text-slate-600 cursor-pointer hover:bg-slate-100">
                Doctors in {city}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
