"use client";

import React, { useState } from "react";
import { Search, ShieldCheck, Edit3, Users, Zap, CheckCircle } from "lucide-react";
import V2Hero from "@/components/v2/V2Hero";
import SquareTicket from "@/components/v2/SquareTicket";
import Link from "next/link";

export default function ClaimListingPage() {
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Simulated Database Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim() && !searchPhone.trim() && !searchLocation.trim()) return;
    
    setIsSearching(true);
    setHasSearched(false);
    
    // Simulate network delay
    setTimeout(() => {
      // Mock result: if phone contains "9876543210" OR name includes "rahul"
      if (searchPhone.includes("9876543210") || searchName.toLowerCase().includes("rahul")) {
        setSearchResult({
          id: "mock-123",
          name: "Dr. Rahul Sharma",
          specialty: "Neurology",
          rating: "4.8",
          role: "doctor"
        });
      } else {
        setSearchResult(null);
      }
      setIsSearching(false);
      setHasSearched(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full min-h-screen text-slate-800 font-sans pb-24 relative z-10">
      
      <V2Hero 
        titleStart="Claim Your"
        highlight="Public Profile"
        subtitle="Take control of your directory listing. Update your timings, receive direct appointments, and earn the Verified Trust Badge."
        showSearch={false}
        desktopBgImage="/pc-hero.png" 
        mobileBgImage="/phone-hero.png"
      />

      <section className="relative z-10 w-full px-4 md:px-8 max-w-4xl mx-auto -mt-16">
         {/* The Search Bar Box */}
         <div className="bg-white/60 backdrop-blur-3xl border border-white/80 shadow-[0_20px_50px_-12px_rgba(0,20,60,0.15)] rounded-[32px] p-8 md:p-12">
            <h2 className="text-2xl font-black text-[#0a2540] mb-6 text-center">Find Your Clinic or Practice</h2>
            
            <form onSubmit={handleSearch} className="flex flex-col gap-4 mb-8 relative z-20">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-slate-400" />
                     </div>
                     <input
                        type="text"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        placeholder="Clinic or Doctor Name"
                     />
                  </div>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                     </div>
                     <input
                        type="tel"
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        placeholder="Registered Phone Number"
                     />
                  </div>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                     </div>
                     <input
                        type="text"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        placeholder="City or District (e.g. Bhubaneswar)"
                     />
                  </div>
               </div>
               <button 
                  type="submit" 
                  disabled={isSearching || (!searchName && !searchPhone && !searchLocation)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-lg py-4 px-10 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1 flex items-center justify-center w-full md:w-auto md:mx-auto mt-2"
               >
                  {isSearching ? (
                     <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                     "Search Directory"
                  )}
               </button>
            </form>

            {/* Results Area */}
            {hasSearched && !isSearching && (
              <div className="w-full bg-slate-50/50 rounded-2xl border border-slate-200 p-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
                {searchResult ? (
                   <div className="flex flex-col md:flex-row items-center gap-8">
                     <div className="w-full md:w-1/2">
                        <div className="text-sm font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <CheckCircle className="w-4 h-4" /> Profile Found
                        </div>
                        <div className="pointer-events-none scale-95 origin-left">
                          <SquareTicket 
                            title={searchResult.name}
                            subtitle={searchResult.specialty}
                            rating={searchResult.rating}
                            icon="👨‍⚕️"
                            href="#"
                            actionText="Preview"
                          />
                        </div>
                     </div>
                     <div className="w-full md:w-1/2 flex flex-col items-start">
                        <h3 className="text-2xl font-bold text-[#0a2540] mb-3">Is this you?</h3>
                        <p className="text-slate-600 font-medium mb-6">
                           Claim this listing to unlock your dashboard, update your photo, and start managing your direct patient bookings.
                        </p>
                        <Link href={`/join?role=${searchResult.role}`} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg shadow-emerald-500/30 transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
                           <ShieldCheck className="w-6 h-6" /> Claim This Profile
                        </Link>
                     </div>
                   </div>
                ) : (
                   <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                         <Search className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">No Profile Found</h3>
                      <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                         We couldn't find a listing matching that query. You can add your practice manually.
                      </p>
                      <Link href="/join" className="text-blue-600 font-bold hover:underline">
                         Create a New Listing →
                      </Link>
                   </div>
                )}
              </div>
            )}
         </div>
      </section>

      {/* Explainer Grid */}
      <section className="relative z-10 w-full px-4 md:px-8 max-w-6xl mx-auto mt-24 mb-12">
         <h2 className="text-3xl md:text-4xl font-black text-center text-[#0a2540] mb-12">Why Claim Your Profile?</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-8 text-center hover:border-blue-300 transition-all hover:-translate-y-1 shadow-sm">
               <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Edit3 className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-[#0a2540] mb-3">Update Your Details</h3>
               <p className="text-slate-600 font-medium text-sm leading-relaxed">Fix outdated contact numbers, correct your clinic address, and upload high-quality photos of your facility.</p>
            </div>
            
            <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-8 text-center hover:border-emerald-300 transition-all hover:-translate-y-1 shadow-sm">
               <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-[#0a2540] mb-3">Receive Patients</h3>
               <p className="text-slate-600 font-medium text-sm leading-relaxed">Unlock your free dashboard to start accepting direct online appointments and telemedicine calls.</p>
            </div>

            <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-8 text-center hover:border-indigo-300 transition-all hover:-translate-y-1 shadow-sm">
               <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-[#0a2540] mb-3">Get Verified</h3>
               <p className="text-slate-600 font-medium text-sm leading-relaxed">Earning the blue Trust Badge increases your visibility in local search results and builds patient trust.</p>
            </div>
         </div>
      </section>

    </div>
  );
}
