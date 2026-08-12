"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, HeartPulse, PhoneCall, Youtube, Instagram, Facebook, Twitter, Linkedin, Users, Stethoscope, HelpCircle, Mail, MessageCircle, ArrowUp } from 'lucide-react';
import Image from 'next/image';

export default function GlobalFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full relative pt-10 pb-20 px-4 md:px-8 mt-10 bg-gradient-to-br from-[#cff3f8] via-[#85d8ce] to-[#0891b2]">
      
      {/* 3D Ambient Glowing Orbs (BEHIND THE GLASS) */}
      <div className="absolute bottom-0 left-1/4 w-[50%] h-[300px] bg-white/40 rounded-[100%] blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-[40%] h-[250px] bg-teal-300/40 rounded-[100%] blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[200px] bg-cyan-200/50 rounded-[100%] blur-[100px] pointer-events-none z-0"></div>

      {/* Floating 3D Glass Card */}
      <div className="w-full max-w-[1400px] mx-auto bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 shadow-xl relative overflow-hidden flex flex-col z-10">
        
        {/* Inner Glass Highlights */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 pointer-events-none rounded-[2.5rem]"></div>
        
        <div className="w-full px-6 lg:px-12 pt-12 relative z-10">
        
        {/* =========================================================================
            SUBSCRIPTION BANNER (Top of Footer)
           ========================================================================= */}
        <div className="mb-8 bg-white/40 backdrop-blur-2xl border border-white/40 hover:border-white/60 rounded-3xl p-4 lg:py-5 lg:px-6 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group cursor-default">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none"></div>
          
          <div className="w-full lg:w-1/3 text-center lg:text-left z-10">
            <h3 className="text-lg font-black text-[#0a2540] mb-0.5">Get Health Insights</h3>
            <p className="text-xs text-slate-600">Updates on healthcare, new hospitals, and wellness tips.</p>
          </div>
          
          <form className="w-full lg:w-2/3 flex flex-col md:flex-row gap-3 z-10" onSubmit={(e) => e.preventDefault()}>
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="email" placeholder="Your Email Address" className="w-full bg-white/50 border border-white/40 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500 text-sm font-medium shadow-sm" />
            </div>
            <div className="flex-1 relative">
              <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="tel" placeholder="WhatsApp Number" className="w-full bg-white/50 border border-white/40 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500 text-sm font-medium shadow-sm" />
            </div>
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all whitespace-nowrap active:scale-95 text-sm">
              Subscribe Free
            </button>
          </form>
        </div>

        {/* =========================================================================
            MAIN NAVIGATION GRID
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1.5fr_1.5fr] gap-8 lg:gap-10 mb-8">
          
          {/* Brand & Contact Column (Drops to bottom on mobile) */}
          <div className="order-last lg:order-first mt-8 lg:mt-0 pt-8 lg:pt-0 border-t border-slate-300/40 lg:border-none pr-0 lg:pr-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/50 rounded-xl shadow-sm border border-white/40 p-1 flex items-center justify-center shrink-0 relative">
                <Image src="/logo.png" alt="DehaPa Logo" fill sizes="48px" className="object-contain" />
              </div>
              <div>
                <h3 className="font-serif font-black text-2xl text-[#0a2540] tracking-tight leading-none mb-1">
                  Dehapa.com
                </h3>
                <p className="text-cyan-400 font-bold text-xs tracking-widest uppercase">
                  Your Health Our Mission
                </p>
              </div>
            </div>
            <p className="text-slate-600 font-medium text-sm leading-relaxed mb-8">
              Dehapa is a next-generation Health Care service portal connecting users to top doctors, state-of-the-art hospitals, diagnostic labs, and rapid emergency ambulance response teams.
            </p>
            
            {/* App Store Badges */}
            <div className="flex flex-wrap gap-4">
              <button className="h-12 flex items-center bg-black border border-white/10 hover:border-cyan-500/50 rounded-xl px-4 py-2 transition-all hover:-translate-y-1 shadow-lg">
                <svg className="w-6 h-6 mr-2 text-white" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"></path></svg>
                <div className="flex flex-col items-start justify-center">
                  <span className="text-[9px] font-medium leading-none text-slate-300">Download on the</span>
                  <span className="text-sm font-bold leading-none text-white mt-1">App Store</span>
                </div>
              </button>
              <button className="h-12 flex items-center bg-black border border-white/10 hover:border-cyan-500/50 rounded-xl px-4 py-2 transition-all hover:-translate-y-1 shadow-lg">
                <svg className="w-6 h-6 mr-2" viewBox="0 0 512 512">
                  <path fill="#4caf50" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"></path>
                  <path fill="#2196f3" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"></path>
                  <path fill="#ffc107" d="M425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z"></path>
                  <path fill="#f44336" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z"></path>
                </svg>
                <div className="flex flex-col items-start justify-center">
                  <span className="text-[9px] font-medium leading-none text-slate-300">GET IT ON</span>
                  <span className="text-sm font-bold leading-none text-white mt-1">Google Play</span>
                </div>
              </button>
            </div>
          </div>

          {/* For Patients Column (Desktop) */}
          <div className="hidden lg:block order-1 lg:border-l lg:border-slate-300/40 lg:pl-8">
            <h4 className="font-black uppercase tracking-[0.1em] text-[#0a2540] text-sm mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-500" />
              For Patients
            </h4>
            <ul className="space-y-4">
              <li><Link href="/doctors" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />Find a Specialist</Link></li>
              <li><Link href="/hospitals" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />Book Hospital Beds</Link></li>
              <li><Link href="/labs" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />Diagnostic Tests & Scans</Link></li>
              <li><Link href="/pharmacies" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />Order Medicines</Link></li>
              <li><Link href="/portal" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />My Health Vault</Link></li>
              <li><Link href="#" className="group flex items-center text-sm font-bold text-rose-500 hover:text-rose-400 transition-colors mt-2"><HeartPulse className="w-4 h-4 mr-2" />Emergency Ambulance</Link></li>
            </ul>
          </div>

          {/* For Patients Accordion (Mobile) */}
          <details className="lg:hidden group border-b border-slate-800 pb-4 order-1">
            <summary className="flex justify-between items-center font-black uppercase tracking-[0.1em] text-white text-sm cursor-pointer list-none">
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-rose-500" />For Patients</div>
              <span className="transition group-open:rotate-180"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></span>
            </summary>
            <ul className="space-y-4 mt-6 px-2">
              <li><Link href="/doctors" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">Find a Specialist</Link></li>
              <li><Link href="/hospitals" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">Book Hospital Beds</Link></li>
              <li><Link href="/labs" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">Diagnostic Tests & Scans</Link></li>
              <li><Link href="/pharmacies" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">Order Medicines</Link></li>
              <li><Link href="/portal" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">My Health Vault</Link></li>
              <li><Link href="#" className="flex items-center text-sm font-bold text-rose-400 hover:text-rose-300"><HeartPulse className="w-4 h-4 mr-2" />Emergency Ambulance</Link></li>
            </ul>
          </details>

          {/* For Providers Column (Desktop) */}
          <div className="hidden lg:block order-2 lg:border-l lg:border-slate-300/40 lg:pl-8">
            <h4 className="font-black uppercase tracking-[0.1em] text-[#0a2540] text-sm mb-6 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              For Providers
            </h4>
            <ul className="space-y-4">
              <li><Link href="/join/doctor" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />Join as Doctor</Link></li>
              <li><Link href="/join/hospital" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />Partner Hospital Network</Link></li>
              <li><Link href="/join/lab" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />Diagnostic Lab Partners</Link></li>
              <li><Link href="/join/pharmacy" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />Pharmacy Network</Link></li>
              <li><Link href="/join/ambulance" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />Ambulance Network</Link></li>
              <li><Link href="/portal/doctor" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />Provider Portal Login</Link></li>
            </ul>
          </div>

          {/* For Providers Accordion (Mobile) */}
          <details className="lg:hidden group border-b border-white/10 pb-4 order-2">
            <summary className="flex justify-between items-center font-black uppercase tracking-[0.1em] text-white text-sm cursor-pointer list-none">
              <div className="flex items-center gap-2"><Stethoscope className="w-4 h-4 text-cyan-400" />For Providers</div>
              <span className="transition group-open:rotate-180"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></span>
            </summary>
            <ul className="space-y-4 mt-6 px-2">
              <li><Link href="/join/doctor" className="flex items-center text-sm font-medium text-slate-400 hover:text-cyan-400">Join as Doctor</Link></li>
              <li><Link href="/join/hospital" className="flex items-center text-sm font-medium text-slate-400 hover:text-cyan-400">Partner Hospital Network</Link></li>
              <li><Link href="/join/lab" className="flex items-center text-sm font-medium text-slate-400 hover:text-cyan-400">Diagnostic Lab Partners</Link></li>
              <li><Link href="/join/pharmacy" className="flex items-center text-sm font-medium text-slate-400 hover:text-cyan-400">Pharmacy Network</Link></li>
              <li><Link href="/join/ambulance" className="flex items-center text-sm font-medium text-slate-400 hover:text-cyan-400">Ambulance Network</Link></li>
              <li><Link href="/portal/doctor" className="flex items-center text-sm font-medium text-slate-400 hover:text-cyan-400">Provider Portal Login</Link></li>
            </ul>
          </details>

          {/* Support & Security Column (Desktop) */}
          <div className="hidden lg:block order-3 lg:border-l lg:border-slate-300/40 lg:pl-8">
            <h4 className="font-black uppercase tracking-[0.1em] text-[#0a2540] text-sm mb-6 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              Support & Legal
            </h4>
            <ul className="space-y-4 mb-0 lg:mb-8">
              <li><Link href="/about" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />About Dehapa</Link></li>
              <li><Link href="/contact" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />Contact Us</Link></li>
              <li><Link href="/privacy" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />Privacy Policy</Link></li>
              <li><Link href="/terms" className="group flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-600" />Terms of Service</Link></li>
            </ul>
          </div>

          {/* Support Accordion (Mobile) */}
          <details className="lg:hidden group pb-4 order-3">
            <summary className="flex justify-between items-center font-black uppercase tracking-[0.1em] text-white text-sm cursor-pointer list-none">
              <div className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-purple-400" />Support & Legal</div>
              <span className="transition group-open:rotate-180"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></span>
            </summary>
            <ul className="space-y-4 mt-6 px-2 mb-4">
              <li><Link href="/about" className="flex items-center text-sm font-medium text-slate-400 hover:text-cyan-400">About Dehapa</Link></li>
              <li><Link href="/contact" className="flex items-center text-sm font-medium text-slate-400 hover:text-cyan-400">Contact Us</Link></li>
              <li><Link href="/privacy" className="flex items-center text-sm font-medium text-slate-400 hover:text-cyan-400">Privacy Policy</Link></li>
              <li><Link href="/terms" className="flex items-center text-sm font-medium text-slate-400 hover:text-cyan-400">Terms of Service</Link></li>
            </ul>
          </details>

        </div>
      </div>
        
      {/* Bottom Legal/Copyright Area with Distinct Background */}
      <div className="bg-white/30 backdrop-blur-xl border-t border-white/40 w-full relative z-10 pt-8 pb-48 lg:pb-8">
        <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-8">
          
          {/* Company Info & Socials Row */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8 w-full">
            
            {/* Left: Product & Address (Inline) */}
            <div className="text-center lg:text-left flex flex-col md:flex-row items-center gap-6 max-w-full">
              
              {/* Premium Transparent Logo (Matches Header) */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/50 rounded-xl shadow-sm border border-white/40 p-1">
                  <Image src="/logo.png" alt="DehaPa Logo" fill sizes="48px" className="object-contain relative z-10" />
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-lg pointer-events-none"></div>
                </div>
                <div className="flex flex-col justify-center text-left">
                  <span className="text-lg sm:text-xl font-black tracking-wide text-[#0a2540] font-serif drop-shadow-sm leading-none">
                    Dehapa
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-cyan-700 tracking-[0.1em] font-bold mt-1">Your Health Our Mission</span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-10 bg-slate-300 hidden md:block shrink-0"></div>

              {/* Company Info */}
              <div className="flex-1 overflow-hidden">
                <strong className="text-[#0a2540] block mb-2 text-[10px] sm:text-[11px] uppercase tracking-widest font-black">
                  <span className="text-cyan-700">Dehapa : India's own Health Network</span> <span className="text-slate-400 mx-1">{'}'}</span> A product by : Shyam Dash Creation
                </strong>
                <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start gap-1 lg:gap-3 text-[10px] sm:text-[11px] text-slate-600 font-bold">
                  <span className="truncate">R7/A2, Jagannath Mandir Colony, Budharaja, Sambalpur, Odisha, India 768004</span>
                  <span className="hidden lg:block text-slate-400 shrink-0">•</span>
                  <span className="flex items-center gap-1 text-cyan-700 font-black shrink-0"><PhoneCall className="w-3 h-3"/> +91 78479 04847, +91 76848 11120, +91 63713 90831</span>
                </div>
              </div>
            </div>

            {/* Right: Social Media Icons */}
            <div className="flex gap-2.5 shrink-0 mt-4 lg:mt-0">
              <a href="#" className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FF0000]/40 transition-all shadow-md" title="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center hover:-translate-y-1 hover:shadow-lg hover:shadow-[#ee2a7b]/40 transition-all shadow-md" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1877F2]/40 transition-all shadow-md" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-800/20 border border-slate-700 transition-all shadow-md" title="X (Twitter)">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:-translate-y-1 hover:shadow-lg hover:shadow-[#0A66C2]/40 transition-all shadow-md" title="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
            
          </div>
          
          {/* Very Bottom Row: Socials, Copyright, Links, Back to Top */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold tracking-widest uppercase text-slate-600 border-t border-white/40 pt-6">
            
            {/* Left side: Copyright -> Links */}
            <div className="flex flex-col md:flex-row items-center justify-start gap-6 md:gap-8 w-full">

              <p className="text-center xl:text-left whitespace-nowrap shrink-0">© 2026 DEHAPA.COM. ALL RIGHTS RESERVED.</p>

              <div className="w-px h-4 bg-slate-300 hidden xl:block shrink-0"></div>

              <div className="flex items-center gap-6 shrink-0">
                <Link href="/privacy" className="hover:text-cyan-700 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-cyan-700 transition-colors">Terms of Service</Link>
              </div>

            </div>

            {/* Right side: Badges & Back to Top */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 shadow-sm" title="All telemetry and biometric data is end-to-end encrypted">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 text-[9px] uppercase tracking-widest font-bold hidden xl:block">HIPAA Encrypted</span>
                <span className="text-emerald-700 text-[9px] uppercase tracking-widest font-bold xl:hidden hidden sm:block">HIPAA</span>
              </div>
              <div className="flex items-center gap-2 text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 shadow-sm">
                <span className="text-slate-400 text-[9px] uppercase tracking-widest font-bold hidden xl:block">Architect</span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-white">SD IT Services</span>
              </div>
              
              <div className="w-px h-6 bg-slate-300 mx-1 hidden md:block"></div>
              
              <button 
                onClick={scrollToTop}
                className="hidden md:flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-white/60 hover:bg-cyan-600 hover:text-white text-slate-500 transition-all border border-white/40 hover:border-cyan-500 shadow-sm group"
                title="Back to Top"
              >
                <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            
          </div>
          
          {/* Mobile Back to Top */}
          <div className="md:hidden flex justify-center mt-8 border-t border-white/40 pt-6">
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#0a2540] hover:text-white transition-colors bg-white/60 hover:bg-cyan-600 px-4 py-2 rounded-full border border-white/40 shadow-sm"
            >
              <ArrowUp className="w-3 h-3" /> Back to Top
            </button>
          </div>

        </div>
        </div>
      </div>
    </footer>
  );
}
