"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, HeartPulse, PhoneCall, Youtube, Instagram, Facebook, Twitter, Linkedin, Users, Stethoscope, HelpCircle } from 'lucide-react';

export default function GlobalFooter() {
  return (
    <footer className="bg-[#020810] text-slate-400 pt-16 relative overflow-hidden">
      {/* Glowing top line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50"></div>
      
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1.5fr_1.5fr] gap-8 lg:gap-12 mb-12">
          
          {/* Brand & Contact Column (Drops to bottom on mobile) */}
          <div className="order-last lg:order-first mt-8 lg:mt-0 pt-8 lg:pt-0 border-t border-slate-800 lg:border-none pr-0 lg:pr-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] p-1 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="DehaPa Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-serif font-black text-2xl text-white tracking-tight leading-none mb-1">
                  Dehapa.com
                </h3>
                <p className="text-teal-400 font-bold text-xs tracking-widest uppercase">
                  Your Health Our Mission
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Dehapa is a next-generation Health Care service portal connecting users to top doctors, state-of-the-art hospitals, diagnostic labs, and rapid emergency ambulance response teams.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex gap-3 flex-wrap">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-teal-500 hover:text-teal-400 hover:-translate-y-1 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-teal-500 hover:text-teal-400 hover:-translate-y-1 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-teal-500 hover:text-teal-400 hover:-translate-y-1 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-teal-500 hover:text-teal-400 hover:-translate-y-1 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-teal-500 hover:text-teal-400 hover:-translate-y-1 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* For Patients Column (Desktop) */}
          <div className="hidden lg:block order-1">
            <h4 className="font-black uppercase tracking-[0.1em] text-white text-sm mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-500" />
              For Patients
            </h4>
            <ul className="space-y-4">
              <li><Link href="/doctors" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />Find a Specialist</Link></li>
              <li><Link href="/hospitals" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />Book Hospital Beds</Link></li>
              <li><Link href="/labs" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />Diagnostic Tests & Scans</Link></li>
              <li><Link href="/pharmacies" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />Order Medicines</Link></li>
              <li><Link href="/portal" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />My Health Vault</Link></li>
              <li><Link href="#" className="group flex items-center text-sm font-bold text-rose-400 hover:text-rose-300 transition-colors mt-2"><HeartPulse className="w-4 h-4 mr-2" />Emergency Ambulance</Link></li>
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
          <div className="hidden lg:block order-2">
            <h4 className="font-black uppercase tracking-[0.1em] text-white text-sm mb-6 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-500" />
              For Providers
            </h4>
            <ul className="space-y-4">
              <li><Link href="/join/doctor" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />Join as Doctor</Link></li>
              <li><Link href="/join/hospital" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />Partner Hospital Network</Link></li>
              <li><Link href="/join/lab" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />Diagnostic Lab Partners</Link></li>
              <li><Link href="/join/pharmacy" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />Pharmacy Network</Link></li>
              <li><Link href="/join/ambulance" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />Ambulance Network</Link></li>
              <li><Link href="/portal/doctor" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />Provider Portal Login</Link></li>
            </ul>
          </div>

          {/* For Providers Accordion (Mobile) */}
          <details className="lg:hidden group border-b border-slate-800 pb-4 order-2">
            <summary className="flex justify-between items-center font-black uppercase tracking-[0.1em] text-white text-sm cursor-pointer list-none">
              <div className="flex items-center gap-2"><Stethoscope className="w-4 h-4 text-blue-500" />For Providers</div>
              <span className="transition group-open:rotate-180"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></span>
            </summary>
            <ul className="space-y-4 mt-6 px-2">
              <li><Link href="/join/doctor" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">Join as Doctor</Link></li>
              <li><Link href="/join/hospital" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">Partner Hospital Network</Link></li>
              <li><Link href="/join/lab" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">Diagnostic Lab Partners</Link></li>
              <li><Link href="/join/pharmacy" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">Pharmacy Network</Link></li>
              <li><Link href="/join/ambulance" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">Ambulance Network</Link></li>
              <li><Link href="/portal/doctor" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">Provider Portal Login</Link></li>
            </ul>
          </details>

          {/* Support & Security Column (Desktop) */}
          <div className="hidden lg:block order-3">
            <h4 className="font-black uppercase tracking-[0.1em] text-white text-sm mb-6 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-500" />
              Support & Legal
            </h4>
            <ul className="space-y-4 mb-8">
              <li><Link href="/about" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />About Dehapa</Link></li>
              <li><Link href="/contact" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />Contact Us</Link></li>
              <li><Link href="/privacy" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />Privacy Policy</Link></li>
              <li><Link href="/terms" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"><ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />Terms of Service</Link></li>
            </ul>

            <h4 className="font-black uppercase tracking-[0.1em] text-white text-sm mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Security Standard
            </h4>
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <h5 className="font-bold text-white text-xs mb-1">HIPAA Vault Encryption</h5>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                All telemetry and biometric data is end-to-end encrypted via Medplum nodes executing standard HL7 FHIR protocols.
              </p>
            </div>
          </div>

          {/* Support Accordion (Mobile) */}
          <details className="lg:hidden group pb-4 order-3">
            <summary className="flex justify-between items-center font-black uppercase tracking-[0.1em] text-white text-sm cursor-pointer list-none">
              <div className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-purple-500" />Support & Legal</div>
              <span className="transition group-open:rotate-180"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></span>
            </summary>
            <ul className="space-y-4 mt-6 px-2 mb-8">
              <li><Link href="/about" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">About Dehapa</Link></li>
              <li><Link href="/contact" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">Contact Us</Link></li>
              <li><Link href="/privacy" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">Privacy Policy</Link></li>
              <li><Link href="/terms" className="flex items-center text-sm font-medium text-slate-400 hover:text-teal-400">Terms of Service</Link></li>
            </ul>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mt-4">
              <h5 className="font-bold text-white text-xs mb-1 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> HIPAA Vault Encryption</h5>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                All telemetry and biometric data is end-to-end encrypted via Medplum nodes executing standard HL7 FHIR protocols.
              </p>
            </div>
          </details>

        </div>
      </div>
        
      {/* Bottom Legal/Copyright Area with Distinct Background */}
      <div className="bg-[#030d1a] border-t border-slate-800/80 w-full relative z-10 pt-10 pb-28 lg:pb-10">
        <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6">
            <div className="text-center lg:text-left">
              <strong className="text-white block mb-1 text-sm uppercase tracking-widest font-black">A product by Shyam Dash Creation</strong>
              <p className="text-xs text-slate-500 mb-1 font-medium">R7/A2, Jagannath Mandir Colony, Budharaja, Sambalpur, Odisha, India 768004</p>
              <p className="flex items-center justify-center lg:justify-start gap-2 text-xs text-teal-400 font-bold"><PhoneCall className="w-3 h-3 text-teal-400"/> +91 78479 04847, +91 76848 11120, +91 63713 90831</p>
            </div>
            <div className="flex items-center justify-center gap-3 text-xs font-bold tracking-widest uppercase text-slate-500">
              System Architect
              <span className="text-white bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 shadow-sm">SD IT Services</span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold tracking-widest uppercase text-slate-600 border-t border-slate-800/50 pt-6">
            <p>© 2026 DEHAPA.COM. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Auth</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Op</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
