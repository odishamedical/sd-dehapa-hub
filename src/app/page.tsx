"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Video, Building2, Pill, TestTube2, Ambulance, Star, Calendar, MessageCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import SquareTicket from "@/components/v2/SquareTicket";
import WideTicket from "@/components/v2/WideTicket";
import PortraitTicket from "@/components/v2/PortraitTicket";
import V2Hero from "@/components/v2/V2Hero";

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
        desktopBgImage="/pc-hero.png"
        mobileBgImage="/phone-hero.png"
      />

      {/* =========================================
          NEW ROW: QUICK SERVICES GRID (FOR PATIENTS)
          ========================================= */}
      <section className="relative z-10 w-full px-4 md:px-8 pb-6 pt-2 max-w-7xl mx-auto">
        {/* Mobile: Horizontal Scroll (Slider), Desktop: 6-Col Grid */}
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-6 gap-4 w-full pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 md:mx-0 md:px-0">
          
          {/* Service 1: Instant Video Call */}
          <Link href="/search/doctors?mode=instant" className="min-w-[150px] lg:min-w-0 snap-center group flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-blue-400 rounded-3xl p-6 shadow-[0_8px_30px_-10px_rgba(0,20,60,0.1)] transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-3">
              <Video className="w-7 h-7" />
            </div>
            <span className="font-bold text-[#0a2540] text-center text-sm group-hover:text-blue-600 transition-colors">Instant Video Call</span>
          </Link>

          {/* Service 2: Schedule Video Call */}
          <Link href="/search/doctors?mode=schedule" className="min-w-[150px] lg:min-w-0 snap-center group flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-blue-400 rounded-3xl p-6 shadow-[0_8px_30px_-10px_rgba(0,20,60,0.1)] transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-3">
              <Calendar className="w-7 h-7" />
            </div>
            <span className="font-bold text-[#0a2540] text-center text-sm group-hover:text-indigo-600 transition-colors">Schedule Video</span>
          </Link>

          {/* Service 3: Book Clinic Visit */}
          <Link href="/search/doctors?mode=in-clinic" className="min-w-[150px] lg:min-w-0 snap-center group flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-blue-400 rounded-3xl p-6 shadow-[0_8px_30px_-10px_rgba(0,20,60,0.1)] transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-3">
              <Building2 className="w-7 h-7" />
            </div>
            <span className="font-bold text-[#0a2540] text-center text-sm group-hover:text-teal-600 transition-colors">Book Clinic Visit</span>
          </Link>

          {/* Service 4: Find Hospitals */}
          <Link href="/search/hospitals" className="min-w-[150px] lg:min-w-0 snap-center group flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-blue-400 rounded-3xl p-6 shadow-[0_8px_30px_-10px_rgba(0,20,60,0.1)] transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-3">
              <span className="text-2xl">🏥</span>
            </div>
            <span className="font-bold text-[#0a2540] text-center text-sm group-hover:text-rose-600 transition-colors">Find Hospitals</span>
          </Link>

          {/* Service 5: Order Medicines */}
          <Link href="/search/pharmacies" className="min-w-[150px] lg:min-w-0 snap-center group flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-blue-400 rounded-3xl p-6 shadow-[0_8px_30px_-10px_rgba(0,20,60,0.1)] transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-3">
              <Pill className="w-7 h-7" />
            </div>
            <span className="font-bold text-[#0a2540] text-center text-sm group-hover:text-amber-600 transition-colors">Order Medicines</span>
          </Link>

          {/* Service 6: Book Labs */}
          <Link href="/search/labs" className="min-w-[150px] lg:min-w-0 snap-center group flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-blue-400 rounded-3xl p-6 shadow-[0_8px_30px_-10px_rgba(0,20,60,0.1)] transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-3">
              <TestTube2 className="w-7 h-7" />
            </div>
            <span className="font-bold text-[#0a2540] text-center text-sm group-hover:text-purple-600 transition-colors">Book Lab Tests</span>
          </Link>
        </div>
      </section>

      {/* =========================================
          ROW 1: FEATURED DOCTORS (Portrait & Square Mix)
          ========================================= */}
      <section className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 pb-10 pt-4 max-w-7xl mx-auto">
        <div className="w-full flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">Featured Professionals</h2>
            <p className="text-slate-600 font-medium mt-1">Top-rated doctors available for consultation</p>
          </div>
          <Link href="/search/doctors" className="text-blue-600 font-bold hover:underline">View All →</Link>
        </div>
        
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1 Portrait (VIP) */}
          <div className="lg:col-span-1">
             <PortraitTicket 
               title="Dr. Sarah Jenkins" 
               subtitle="Senior Cardiologist" 
               rating="4.9" 
               imageSrc="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=600" 
               href="/doctor/sarah-jenkins" 
               actionText="Book Consultation" 
             />
          </div>
          
          {/* 6 Squares (2 rows of 3 to perfectly align with 1 Portrait ticket) */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
             <SquareTicket title="Dr. Rahul Sharma" subtitle="Neurologist" rating="4.8" icon="👨‍⚕️" href="/doctor/rahul" actionText="Book Now" />
             <SquareTicket title="Dr. Priya Patel" subtitle="Dermatologist" rating="5.0" icon="👩‍⚕️" href="/doctor/priya" actionText="Book Now" />
             <SquareTicket title="Dr. Amit Kumar" subtitle="Pediatrician" rating="4.7" icon="👨‍⚕️" href="/doctor/amit" actionText="Book Now" />
             <SquareTicket title="Dr. Kavita Reddy" subtitle="Gynecologist" rating="4.9" icon="👩‍⚕️" href="/doctor/kavita" actionText="Book Now" />
             <SquareTicket title="Dr. James Wilson" subtitle="Orthopedic" rating="4.6" icon="👨‍⚕️" href="/doctor/james" actionText="Book Now" />
             <SquareTicket title="Dr. Ananya Singh" subtitle="Psychiatrist" rating="5.0" icon="👩‍⚕️" href="/doctor/ananya" actionText="Book Now" />
          </div>
        </div>
      </section>

      {/* =========================================
          ROW 2: HOSPITALS (Wide Tickets)
          ========================================= */}
      <section className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 py-10 max-w-7xl mx-auto">
        <div className="w-full flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">Top Hospitals</h2>
            <p className="text-slate-600 font-medium mt-1">Multi-specialty facilities near you</p>
          </div>
          <Link href="/search/hospitals" className="text-blue-600 font-bold hover:underline">View All →</Link>
        </div>
        
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
           <WideTicket title="Apollo City Hospital" subtitle="Multi-Specialty Facility" rating="5.0" icon="🏥" href="/hospital/apollo" actionText="View Services" stats="450 Beds • 24/7 ER" />
           <WideTicket title="Caremax General" subtitle="Advanced Care Center" rating="4.6" icon="🏨" href="/hospital/caremax" actionText="View Services" stats="200 Beds • Level 1 Trauma" />
        </div>
      </section>

      {/* =========================================
          ROW 3: LABS/PHARMACY + 50% AD BANNER
          ========================================= */}
      <section className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 py-10 max-w-7xl mx-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Side: 50% Tickets */}
          <div>
            <h2 className="text-2xl font-black text-[#0a2540] tracking-tight mb-6">Labs & Pharmacies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SquareTicket title="MediCare Pharmacy" subtitle="24/7 Delivery" rating="4.9" icon="💊" href="/pharmacy/medicare" actionText="Order Meds" />
              <SquareTicket title="AccuPath Labs" subtitle="Home Collection" rating="4.8" icon="🔬" href="/lab/accupath" actionText="Book Test" />
              <SquareTicket title="Apollo Pharmacy" subtitle="Express Delivery" rating="4.7" icon="💊" href="/pharmacy/apollo" actionText="Order Meds" />
              <SquareTicket title="City Diagnostics" subtitle="Full Body Scans" rating="4.9" icon="🔬" href="/lab/city" actionText="Book Test" />
            </div>
          </div>

          {/* Right Side: 50% Ad Banner */}
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-slate-500 tracking-widest uppercase mb-6 opacity-0 hidden lg:block">Sponsored</h2>
            <div className="flex-1 bg-white/40 backdrop-blur-2xl border border-white rounded-3xl p-1 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] relative overflow-hidden flex items-center justify-center min-h-[260px]">
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
      <section className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 py-4 max-w-7xl mx-auto">
        <div className="w-full flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">Emergency Services</h2>
            <p className="text-slate-600 font-medium mt-1">Instant ambulance dispatch</p>
          </div>
          <Link href="/search/ambulances" className="text-blue-600 font-bold hover:underline">View All →</Link>
        </div>
        
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
             <SquareTicket title="City Rescue ALS" subtitle="Advanced Life Support" rating="5.0" icon="🚑" href="/ambulance/city-rescue" actionText="Call Now" />
             <SquareTicket title="Metro BLS" subtitle="Basic Life Support" rating="4.7" icon="🚑" href="/ambulance/metro" actionText="Call Now" />
             <SquareTicket title="AeroMed Evac" subtitle="Air Ambulance" rating="4.9" icon="🚁" href="/ambulance/aero" actionText="Call Now" />
             <SquareTicket title="Care Transport" subtitle="Patient Transfer" rating="4.8" icon="🚐" href="/ambulance/care" actionText="Call Now" />
        </div>
      </section>

      {/* =========================================
          ROW 5: PATIENT GUIDE (How it Works)
          ========================================= */}
      <section className="relative z-10 w-full px-4 md:px-8 pt-4 pb-4 max-w-7xl mx-auto">
        <div className="bg-white/40 backdrop-blur-2xl border border-white rounded-[40px] p-12 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] flex flex-col items-center text-center relative overflow-hidden">
          {/* Subtle Glows to keep it interesting but light */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-300/30 rounded-full blur-[80px]"></div>
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-teal-300/30 rounded-full blur-[80px]"></div>

          <h2 className="text-4xl font-black tracking-tight mb-4 relative z-10 text-[#0a2540]">Your Health Journey, Simplified</h2>
          <p className="text-lg text-slate-600 font-medium mb-12 max-w-2xl relative z-10">Access premium healthcare from the comfort of your home. Search, book, and consult with the best professionals in seconds.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12 relative z-10">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm text-blue-600">🔍</div>
              <h4 className="font-bold text-[#0a2540] text-xl mb-2">Find Services</h4>
              <p className="text-slate-600 text-sm">Search for doctors, hospitals, pharmacies, or instant video consultations.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm text-indigo-600">📅</div>
              <h4 className="font-bold text-[#0a2540] text-xl mb-2">Book & Consult</h4>
              <p className="text-slate-600 text-sm">Schedule a clinic visit or start an immediate video call with verified experts.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm text-teal-600">❤️</div>
              <h4 className="font-bold text-[#0a2540] text-xl mb-2">Get Care</h4>
              <p className="text-slate-600 text-sm">Receive prescriptions, order medicines, and track your health progress seamlessly.</p>
            </div>
          </div>

          <Link href="/search" className="relative z-10">
             <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-12 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-transform hover:-translate-y-1">
                Explore Services Now
             </button>
          </Link>
        </div>
      </section>

      {/* =========================================
          ROW 6: PROVIDER GUIDE (How it Works)
          ========================================= */}
      <section className="relative z-10 w-full px-4 md:px-8 pt-4 pb-4 max-w-7xl mx-auto">
        <div className="bg-white/40 backdrop-blur-2xl border border-white rounded-[40px] p-12 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] flex flex-col items-center text-center">
          
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

          <Link href="/join">
             <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-12 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-transform hover:-translate-y-1">
                Start Onboarding Now
             </button>
          </Link>
        </div>
      </section>

      {/* =========================================
          ROW 7: GLOBAL BOTTOM AD BANNER
          ========================================= */}
      <section className="relative z-10 w-full px-4 md:px-8 pt-4 pb-24 max-w-7xl mx-auto">
        <div className="bg-white/40 backdrop-blur-2xl border border-white rounded-[40px] p-2 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] w-full h-[120px] flex items-center justify-center">
           {/* Placeholder for standard 728x90 Leaderboard Ad */}
           <div className="w-[95%] h-[90%] border-2 border-dashed border-slate-400/50 rounded-2xl flex items-center justify-center bg-white/20">
              <span className="text-slate-500 font-bold tracking-widest uppercase text-sm">[ GLOBAL 100% AD INJECTION ZONE ]</span>
           </div>
        </div>
      </section>

    </div>
  );
}
