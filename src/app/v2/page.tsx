"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Video, Building2, Pill, TestTube2, Ambulance, Star, Calendar, MessageCircle, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function V2GlassHomepage() {
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  return (
    <div className="flex flex-col w-full min-h-screen text-slate-800 font-sans pb-24">
      
      {/* --- HERO SECTION --- */}
      <section className="w-full pt-16 pb-12 flex flex-col items-center justify-center px-4 relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-slate-900 tracking-tight text-center leading-tight mb-2">
          Find & Book <br className="md:hidden" />
          <span className="text-blue-700">Premium Healthcare.</span>
        </h1>
        <p className="text-slate-600 text-lg font-medium mb-12 text-center">
          The most trusted medical professionals, instantly available near you.
        </p>

        {/* PILL-SHAPED GLASS SEARCH BAR (Inspired by Image 3) */}
        <div className="w-full max-w-4xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,100,200,0.15)] rounded-full p-2 flex flex-col md:flex-row items-center gap-2 transition-all hover:bg-white/50 hover:shadow-[0_12px_40px_rgba(0,100,200,0.2)]">
          
          {/* Location Input */}
          <div className="flex items-center w-full md:w-1/3 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-300/30">
            <MapPin className="w-5 h-5 text-slate-500 shrink-0 mr-3" />
            <div className="flex flex-col w-full">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Location</span>
              <input 
                type="text" 
                placeholder="(e.g., London, UK)" 
                className="bg-transparent border-none outline-none text-slate-900 placeholder-slate-500 font-medium w-full"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Specialty Input */}
          <div className="flex items-center w-full md:flex-1 px-4 py-2">
            <span className="text-xl mr-3">🧑‍⚕️</span>
            <div className="flex flex-col w-full">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Specialty</span>
              <input 
                type="text" 
                placeholder="(e.g., Cardiologist)" 
                className="bg-transparent border-none outline-none text-slate-900 placeholder-slate-500 font-medium w-full"
                value={searchSpecialty}
                onChange={(e) => setSearchSpecialty(e.target.value)}
              />
            </div>
          </div>

          {/* Search Button */}
          <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-2 shrink-0">
            <Search className="w-5 h-5" />
            <span>Search Now</span>
          </button>
        </div>
      </section>

      {/* --- SERVICES ROW (True Glassmorphism Cards) --- */}
      <section className="w-full flex flex-col items-center px-4 lg:px-8 mt-12 z-10">
        <div className="w-full max-w-[1400px]">
          <h2 className="text-xl font-bold text-slate-800 mb-6 pl-2">Explore Healthcare Services</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {/* Service 1 */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 flex flex-col items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,100,200,0.1)] transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-blue-100/50 rounded-2xl flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform shadow-inner border border-white/50">
                <Video className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Consult Doctor</h3>
              <p className="text-xs text-slate-600 font-medium px-2 py-1 bg-white/50 rounded-full w-full">Instant Video Call</p>
            </div>

            {/* Service 2 */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 flex flex-col items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,100,200,0.1)] transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-teal-100/50 rounded-2xl flex items-center justify-center mb-4 text-teal-600 group-hover:scale-110 transition-transform shadow-inner border border-white/50">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Clinic Visit</h3>
              <p className="text-xs text-slate-600 font-medium px-2 py-1 bg-white/50 rounded-full w-full">Book Appointment</p>
            </div>

            {/* Service 3 */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 flex flex-col items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,100,200,0.1)] transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-emerald-100/50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 group-hover:scale-110 transition-transform shadow-inner border border-white/50">
                <Pill className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Medicines</h3>
              <p className="text-xs text-slate-600 font-medium px-2 py-1 bg-white/50 rounded-full w-full">Order Online</p>
            </div>

            {/* Service 4 */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 flex flex-col items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,100,200,0.1)] transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-purple-100/50 rounded-2xl flex items-center justify-center mb-4 text-purple-600 group-hover:scale-110 transition-transform shadow-inner border border-white/50">
                <TestTube2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Lab Tests</h3>
              <p className="text-xs text-slate-600 font-medium px-2 py-1 bg-white/50 rounded-full w-full">Home Collection</p>
            </div>

            {/* Service 5 */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 flex flex-col items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,100,200,0.1)] transition-all cursor-pointer group col-span-2 md:col-span-1 lg:col-span-1">
              <div className="w-16 h-16 bg-orange-100/50 rounded-2xl flex items-center justify-center mb-4 text-orange-600 group-hover:scale-110 transition-transform shadow-inner border border-white/50">
                <Ambulance className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Ambulance</h3>
              <p className="text-xs text-slate-600 font-medium px-2 py-1 bg-white/50 rounded-full w-full">24/7 Emergency</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURED PROFESSIONALS ROW --- */}
      <section className="w-full flex flex-col items-center px-4 lg:px-8 mt-20 z-10">
        <div className="w-full max-w-[1400px]">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-black text-slate-900">Featured Professionals</h2>
            <div className="flex gap-2">
               <button className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-white flex items-center justify-center text-slate-700 hover:bg-white/80 transition-colors shadow-sm">&lt;</button>
               <button className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-white flex items-center justify-center text-slate-700 hover:bg-white/80 transition-colors shadow-sm">&gt;</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Doctor Card 1 */}
            <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,50,100,0.08)] flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-100/50 to-transparent"></div>
              
              <div className="flex items-center gap-4 relative z-10 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-blue-200 border-4 border-white shadow-md flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xs text-slate-400">Photo</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-current" /><span className="text-sm font-bold text-slate-700">4.9</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">Dr. Sarah Jenkins</h3>
                  <p className="text-blue-700 font-medium text-sm">Senior Cardiologist</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all">
                  Book Appointment
                </button>
                <button className="w-full bg-white/50 hover:bg-white border border-white text-slate-700 font-bold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Get Quote
                </button>
              </div>
            </div>

            {/* Doctor Card 2 */}
            <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,50,100,0.08)] flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-teal-100/50 to-transparent"></div>
              
              <div className="flex items-center gap-4 relative z-10 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-teal-200 border-4 border-white shadow-md flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xs text-slate-400">Photo</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-current" /><span className="text-sm font-bold text-slate-700">4.8</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">Dr. Rahul Sharma</h3>
                  <p className="text-teal-700 font-medium text-sm">Neurologist</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all">
                  Book Appointment
                </button>
                <button className="w-full bg-white/50 hover:bg-white border border-white text-slate-700 font-bold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Get Quote
                </button>
              </div>
            </div>

            {/* Hospital Card */}
            <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,50,100,0.08)] flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-100/50 to-transparent"></div>
              
              <div className="flex items-center gap-4 relative z-10 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-emerald-200 border-4 border-white shadow-md flex-shrink-0 overflow-hidden flex items-center justify-center">
                   <Building2 className="w-10 h-10 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-current" /><span className="text-sm font-bold text-slate-700">5.0</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">Apollo City Hospital</h3>
                  <p className="text-emerald-700 font-medium text-sm">Multi-Specialty</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all">
                  Book Facility
                </button>
                <button className="w-full bg-white/50 hover:bg-white border border-white text-slate-700 font-bold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" /> Get Directions
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- ADVERT AREA --- */}
      <section className="w-full flex justify-center mt-20 px-4 z-10">
         <div className="w-full max-w-[1400px] h-32 bg-white/30 backdrop-blur-md border border-white/50 rounded-3xl flex items-center justify-center shadow-inner">
            <span className="text-slate-500/70 font-black tracking-widest uppercase text-lg">[ Advertisement Space ]</span>
         </div>
      </section>

    </div>
  );
}
