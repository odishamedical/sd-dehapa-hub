"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, HeartPulse, PhoneCall, Youtube, Instagram, Facebook, Twitter, Linkedin, Users, Stethoscope, HelpCircle } from 'lucide-react';

export default function GlobalFooter() {
  return (
    <footer className="bg-[#020810] text-slate-400 pt-16 pb-32 md:pb-8 border-t border-slate-800 relative overflow-hidden">
      {/* Glowing top line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50"></div>
      
      <div className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 xl:px-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-8">
          
          {/* Brand & Contact Column (Drops to bottom on mobile) */}
          <div className="lg:col-span-1 order-last lg:order-first mt-8 lg:mt-0 pt-8 lg:pt-0 border-t border-slate-800 lg:border-none">
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
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-8">
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

          {/* For Patients Column */}
          <div className="order-1">
            <h4 className="font-black uppercase tracking-[0.1em] text-white text-sm mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-500" />
              For Patients
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/doctors" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Find a Specialist
                </Link>
              </li>
              <li>
                <Link href="/hospitals" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Book Hospital Beds
                </Link>
              </li>
              <li>
                <Link href="/labs" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Diagnostic Tests & Scans
                </Link>
              </li>
              <li>
                <Link href="/pharmacies" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Order Medicines
                </Link>
              </li>
              <li>
                <Link href="/portal" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  My Health Vault
                </Link>
              </li>
              <li>
                <Link href="#" className="group flex items-center text-sm font-bold text-rose-400 hover:text-rose-300 transition-colors mt-2">
                  <HeartPulse className="w-4 h-4 mr-2" />
                  Emergency Ambulance
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers Column */}
          <div className="order-2">
            <h4 className="font-black uppercase tracking-[0.1em] text-white text-sm mb-6 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-500" />
              For Providers
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/join/doctor" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Join as Doctor
                </Link>
              </li>
              <li>
                <Link href="/join/hospital" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Partner Hospital Network
                </Link>
              </li>
              <li>
                <Link href="/join/lab" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Diagnostic Lab Partners
                </Link>
              </li>
              <li>
                <Link href="/join/pharmacy" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Pharmacy Network
                </Link>
              </li>
              <li>
                <Link href="/join/ambulance" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Ambulance Network
                </Link>
              </li>
              <li>
                <Link href="/portal/doctor" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Provider Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Security Column */}
          <div className="order-3">
            <h4 className="font-black uppercase tracking-[0.1em] text-white text-sm mb-6 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-500" />
              Support & Legal
            </h4>
            <ul className="space-y-4 mb-8">
              <li>
                <Link href="/about" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  About Dehapa
                </Link>
              </li>
              <li>
                <Link href="/contact" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Terms of Service
                </Link>
              </li>
            </ul>

            <h4 className="font-black uppercase tracking-[0.1em] text-white text-sm mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Security Standard
            </h4>
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-colors group">
              <h5 className="font-bold text-white text-xs mb-1 group-hover:text-emerald-400 transition-colors">HIPAA Vault Encryption</h5>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                All telemetry and biometric data is end-to-end encrypted via Medplum nodes executing standard HL7 FHIR protocols.
              </p>
            </div>
          </div>

        </div>
        
        {/* Bottom Bar / Official Legal Notice */}
        <div className="pt-10 mt-12 border-t border-slate-800/80">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
            <div className="text-center lg:text-left">
              <strong className="text-white block mb-2 text-sm uppercase tracking-widest font-black">A product by Shyam Dash Creation</strong>
              <p className="text-xs text-slate-500 mb-2 font-medium">R7/A2, Jagannath Mandir Colony, Budharaja, Sambalpur, Odisha, India 768004</p>
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
