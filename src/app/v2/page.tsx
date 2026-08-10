"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Video, Building2, Pill, TestTube2, Ambulance, Star, Calendar, MessageCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import SquareTicket from "./components/SquareTicket";
import WideTicket from "./components/WideTicket";
import PortraitTicket from "./components/PortraitTicket";
import V2Hero from "./components/V2Hero";

export default function V2GlassHomepage() {
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  return (
    <div className="flex flex-col w-full min-h-screen text-slate-800 font-sans pb-24">
      
      {/* --- REUSABLE HERO SECTION --- */}
      <V2Hero 
        titleStart="Find & Book"
        highlight="Premium Healthcare."
        subtitle="The most trusted medical professionals, instantly available near you."
        showSearch={true}
        desktopBgImage="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=2000&h=600"
        mobileBgImage="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800&h=800"
      />

      {/* =========================================
          ROW 1: FEATURED DOCTORS (Portrait & Square Mix)
          ========================================= */}
      <section className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 py-16 pt-24 max-w-7xl mx-auto">
        <div className="w-full flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">Featured Professionals</h2>
            <p className="text-slate-600 font-medium mt-1">Top-rated doctors available for consultation</p>
          </div>
          <Link href="/v2/search/doctors" className="text-blue-600 font-bold hover:underline">View All →</Link>
        </div>
        
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1 Portrait (VIP) */}
          <div className="lg:col-span-1">
             <PortraitTicket 
               title="Dr. Sarah Jenkins" 
               subtitle="Senior Cardiologist" 
               rating="4.9" 
               imageSrc="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=600" 
               href="/v2/doctor/sarah-jenkins" 
               actionText="Book Consultation" 
             />
          </div>
          
          {/* 3 Squares */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
             <SquareTicket title="Dr. Rahul Sharma" subtitle="Neurologist" rating="4.8" icon="👨‍⚕️" href="/v2/doctor/rahul" actionText="Book Now" />
             <SquareTicket title="Dr. Priya Patel" subtitle="Dermatologist" rating="5.0" icon="👩‍⚕️" href="/v2/doctor/priya" actionText="Book Now" />
             <SquareTicket title="Dr. Amit Kumar" subtitle="Pediatrician" rating="4.7" icon="👨‍⚕️" href="/v2/doctor/amit" actionText="Book Now" />
          </div>
        </div>
      </section>

      {/* =========================================
          ROW 2: HOSPITALS (Wide Tickets)
          ========================================= */}
      <section className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 py-12 max-w-7xl mx-auto">
        <div className="w-full flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">Top Hospitals</h2>
            <p className="text-slate-600 font-medium mt-1">Multi-specialty facilities near you</p>
          </div>
          <Link href="/v2/search/hospitals" className="text-blue-600 font-bold hover:underline">View All →</Link>
        </div>
        
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
           <WideTicket title="Apollo City Hospital" subtitle="Multi-Specialty Facility" rating="5.0" icon="🏥" href="/v2/hospital/apollo" actionText="View Services" stats="450 Beds • 24/7 ER" />
           <WideTicket title="Caremax General" subtitle="Advanced Care Center" rating="4.6" icon="🏨" href="/v2/hospital/caremax" actionText="View Services" stats="200 Beds • Level 1 Trauma" />
        </div>
      </section>

      {/* =========================================
          ROW 3: LABS/PHARMACY + 50% AD BANNER
          ========================================= */}
      <section className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 py-12 max-w-7xl mx-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Side: 50% Tickets */}
          <div>
            <h2 className="text-2xl font-black text-[#0a2540] tracking-tight mb-6">Labs & Pharmacies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SquareTicket title="MediCare Pharmacy" subtitle="24/7 Delivery" rating="4.9" icon="💊" href="/v2/pharmacy/medicare" actionText="Order Meds" />
              <SquareTicket title="AccuPath Labs" subtitle="Home Collection" rating="4.8" icon="🔬" href="/v2/lab/accupath" actionText="Book Test" />
            </div>
          </div>

          {/* Right Side: 50% Ad Banner */}
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-slate-500 tracking-widest uppercase mb-6 opacity-0 hidden lg:block">Sponsored</h2>
            <div className="flex-1 bg-[linear-gradient(135deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.1)_40%,rgba(255,255,255,0.0)_100%)] backdrop-blur-2xl border border-white/50 rounded-3xl p-1 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),0_15px_35px_rgba(0,100,200,0.12)] relative overflow-hidden flex items-center justify-center min-h-[260px]">
               {/* Placeholder dashed box for AdSense */}
               <div className="w-[90%] h-[90%] border-2 border-dashed border-slate-400/50 rounded-xl flex items-center justify-center bg-white/20">
                  <span className="text-slate-500 font-bold tracking-widest uppercase">[ 50% AD INJECTION ZONE ]</span>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================
          ROW 4: AMBULANCES (Square Grid)
          ========================================= */}
      <section className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 py-12 max-w-7xl mx-auto">
        <div className="w-full flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">Emergency Services</h2>
            <p className="text-slate-600 font-medium mt-1">Instant ambulance dispatch</p>
          </div>
          <Link href="/v2/search/ambulances" className="text-blue-600 font-bold hover:underline">View All →</Link>
        </div>
        
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
             <SquareTicket title="City Rescue ALS" subtitle="Advanced Life Support" rating="5.0" icon="🚑" href="/v2/ambulance/city-rescue" actionText="Call Now" />
             <SquareTicket title="Metro BLS" subtitle="Basic Life Support" rating="4.7" icon="🚑" href="/v2/ambulance/metro" actionText="Call Now" />
             <SquareTicket title="AeroMed Evac" subtitle="Air Ambulance" rating="4.9" icon="🚁" href="/v2/ambulance/aero" actionText="Call Now" />
             <SquareTicket title="Care Transport" subtitle="Patient Transfer" rating="4.8" icon="🚐" href="/v2/ambulance/care" actionText="Call Now" />
        </div>
      </section>

      {/* =========================================
          ROW 5: PROVIDER GUIDE (How it Works)
          ========================================= */}
      <section className="relative z-10 w-full px-4 md:px-8 py-16 mt-8 max-w-7xl mx-auto">
        <div className="bg-[linear-gradient(135deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.1)_40%,rgba(255,255,255,0.0)_100%)] backdrop-blur-2xl border border-white/50 rounded-[40px] p-12 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),0_20px_50px_rgba(0,100,200,0.15)] flex flex-col items-center text-center">
          
          <h2 className="text-4xl font-black text-[#0a2540] tracking-tight mb-4">Grow Your Medical Practice</h2>
          <p className="text-lg text-slate-600 font-medium mb-12 max-w-2xl">Join the largest healthcare network in the region. Reach thousands of patients, manage appointments, and grow your digital presence.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/40 border border-white/60 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm">1️⃣</div>
              <h4 className="font-bold text-[#0a2540] text-xl mb-2">Create Profile</h4>
              <p className="text-slate-600 text-sm">Add your specialties, timing, and clinic details to our directory.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/40 border border-white/60 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm">2️⃣</div>
              <h4 className="font-bold text-[#0a2540] text-xl mb-2">Get Verified</h4>
              <p className="text-slate-600 text-sm">Our team verifies your credentials to grant the Trust Badge.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/40 border border-white/60 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm">3️⃣</div>
              <h4 className="font-bold text-[#0a2540] text-xl mb-2">Receive Patients</h4>
              <p className="text-slate-600 text-sm">Start accepting online appointments directly through your portal.</p>
            </div>
          </div>

          <Link href="/v2/join">
             <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-12 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-transform hover:-translate-y-1">
                Start Onboarding Now
             </button>
          </Link>
        </div>
      </section>

      {/* =========================================
          ROW 6: GLOBAL BOTTOM AD BANNER
          ========================================= */}
      <section className="relative z-10 w-full px-4 md:px-8 py-12 pb-24 max-w-7xl mx-auto">
        <div className="bg-[linear-gradient(135deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.1)_40%,rgba(255,255,255,0.0)_100%)] backdrop-blur-2xl border border-white/50 rounded-[40px] p-2 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),0_15px_35px_rgba(0,100,200,0.12)] w-full h-[120px] flex items-center justify-center">
           {/* Placeholder for standard 728x90 Leaderboard Ad */}
           <div className="w-[95%] h-[90%] border-2 border-dashed border-slate-400/50 rounded-2xl flex items-center justify-center bg-white/20">
              <span className="text-slate-500 font-bold tracking-widest uppercase text-sm">[ GLOBAL 100% AD INJECTION ZONE ]</span>
           </div>
        </div>
      </section>

    </div>
  );
}
