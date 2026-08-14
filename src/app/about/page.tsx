"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Target, Users, HeartPulse, Building2, ShieldCheck, Mail, MapPin, PhoneCall } from "lucide-react";
import V2Header from "@/components/v2/V2Header";
import GlobalFooter from "@/components/GlobalFooter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-cyan-500/30">
      <V2Header />
      
      <main className="flex-1 pt-24 md:pt-32 pb-16 px-4 md:px-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
        
        {/* Navigation & Title */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-[#0a2540] tracking-tight">About Dehapa</h1>
          <p className="text-lg text-slate-600 font-medium mt-3">Your Health, Our Mission</p>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] border border-slate-100 overflow-hidden">
          
          {/* Header Image Area */}
          <div className="w-full h-48 md:h-64 bg-gradient-to-r from-cyan-600 to-blue-700 relative overflow-hidden flex items-center justify-center p-8 text-center">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <h2 className="relative z-10 text-3xl md:text-4xl font-serif font-black text-white drop-shadow-sm">
               Bridging the Gap in Indian Healthcare
             </h2>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            
            {/* Introduction */}
            <section className="prose prose-slate max-w-none prose-lg">
              <p className="text-slate-700 font-medium leading-relaxed">
                <strong className="text-[#0a2540] font-black text-xl">Dehapa</strong> is India's next-generation Health Care service network, proudly developed and maintained by <strong className="text-cyan-700">Shyam Dash Creation</strong>. We are a unified digital ecosystem dedicated to connecting patients with top-tier medical professionals, hospitals, diagnostic labs, and emergency services instantly.
              </p>
            </section>

            {/* Aims & Objectives Grid */}
            <section>
              <h3 className="text-2xl font-black text-[#0a2540] mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-rose-500" /> Aims & Objectives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                  <h4 className="font-bold text-lg text-slate-800 mb-2">Universal Access</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">To provide every citizen with instant digital access to verified healthcare professionals, regardless of their geographic location.</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                  <h4 className="font-bold text-lg text-slate-800 mb-2">Streamlined Care</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">To eliminate the friction of traditional clinic visits by offering instant video consultations, scheduled appointments, and home-collection lab testing.</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                  <h4 className="font-bold text-lg text-slate-800 mb-2">Emergency Readiness</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">To build the fastest and most reliable ambulance dispatch network, ensuring rapid response times during critical medical emergencies.</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                  <h4 className="font-bold text-lg text-slate-800 mb-2">Provider Empowerment</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">To empower doctors and hospitals with modern digital tools, allowing them to manage their schedules, records, and patient outreach securely.</p>
                </div>
              </div>
            </section>

            {/* Who Can Use */}
            <section>
              <h3 className="text-2xl font-black text-[#0a2540] mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" /> Who Can Use Dehapa?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center shrink-0">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Patients & Families</h4>
                    <p className="text-sm text-slate-600 mt-1">Anyone looking to manage their family's health. Search for specialists, maintain secure medical vaults, order prescriptions, and book hospital beds from a single dashboard.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Healthcare Providers</h4>
                    <p className="text-sm text-slate-600 mt-1">Doctors, Hospitals, Diagnostic Labs, Pharmacies, and Ambulance Fleet Operators. Join our network to receive verified patient leads, manage bookings, and increase your visibility.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* How to Use */}
            <section>
              <h3 className="text-2xl font-black text-[#0a2540] mb-6 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" /> How to Use
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0a2540] text-white font-bold text-sm shrink-0">1</span>
                  <div>
                    <strong className="text-slate-800 block text-lg">Search or Connect</strong>
                    <span className="text-slate-600 text-sm mt-1 block">Use the global search bar on the homepage to find specific doctors, or browse categories like Hospitals and Pharmacies.</span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0a2540] text-white font-bold text-sm shrink-0">2</span>
                  <div>
                    <strong className="text-slate-800 block text-lg">Register & Profile Setup</strong>
                    <span className="text-slate-600 text-sm mt-1 block">Click "Login/Sign Up" to create your secure Patient Dashboard. Fill in your basic identity and contact details to unlock the Medical Vault.</span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0a2540] text-white font-bold text-sm shrink-0">3</span>
                  <div>
                    <strong className="text-slate-800 block text-lg">Book Consultations</strong>
                    <span className="text-slate-600 text-sm mt-1 block">Select "Instant Video Call" for immediate telehealth, or schedule an in-clinic visit with your chosen specialist. Manage all appointments directly from your portal.</span>
                  </div>
                </li>
              </ul>
            </section>

            {/* Organization Info */}
            <section className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-slate-800 to-transparent pointer-events-none"></div>
               <h3 className="text-2xl font-black text-cyan-400 mb-6 relative z-10">Our Organization</h3>
               
               <div className="space-y-4 relative z-10">
                 <div className="flex items-start gap-3">
                   <Building2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                   <div>
                     <strong className="block text-white font-bold">Shyam Dash Creation</strong>
                     <span className="text-sm text-slate-400">Parent Organization</span>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-3">
                   <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                   <div>
                     <strong className="block text-white font-bold">Headquarters</strong>
                     <span className="text-sm text-slate-400">R7/A2, Jagannath Mandir Colony, Budharaja,<br/>Sambalpur, Odisha, India 768004</span>
                   </div>
                 </div>

                 <div className="flex items-start gap-3">
                   <PhoneCall className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                   <div className="flex flex-col gap-1">
                     <strong className="block text-white font-bold">Contact Numbers</strong>
                     <span className="text-sm text-slate-400">+91 78479 04847</span>
                     <span className="text-sm text-slate-400">+91 76848 11120</span>
                     <span className="text-sm text-slate-400">+91 63713 90831</span>
                   </div>
                 </div>
               </div>
            </section>

          </div>
        </div>
      </main>

      <GlobalFooter />
    </div>
  );
}
