"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, HeartPulse, PhoneCall } from 'lucide-react';

export default function GlobalFooter() {
  return (
    <footer className="bg-[#020810] text-slate-400 pt-16 pb-24 md:pb-8 border-t border-slate-800 relative overflow-hidden">
      {/* Glowing top line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50"></div>
      
      <div className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 xl:px-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] p-1 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="DehaPa Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-serif font-black text-2xl text-white tracking-tight leading-none mb-1">
                  DehaPa.com
                </h3>
                <p className="text-teal-400 font-bold text-xs tracking-widest uppercase">
                  Your Health Our Mission
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-4">
              Dehapa is a next-generation Health Care service portal connecting users to top doctors, state-of-the-art hospitals, diagnostic labs, and rapid emergency ambulance response teams.
            </p>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 max-w-sm text-xs text-slate-400">
              <strong className="text-white block mb-1">A product by Shyam Dash Creation</strong>
              <p>Plot No - 28/A, Kanan Vihar, Patia</p>
              <p>Bhubaneswar, Odisha, India 751024</p>
              <p className="mt-1 flex items-center gap-2"><PhoneCall className="w-3 h-3 text-teal-400"/> +91 78479 04847</p>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-teal-500 hover:text-teal-400 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-teal-500 hover:text-teal-400 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-[0.1em] text-white text-sm mb-6 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              Ecosystem
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/doctors" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Specialist Search
                </Link>
              </li>
              <li>
                <Link href="/hospitals" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Hospital Matrix
                </Link>
              </li>
              <li>
                <Link href="/labs" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Diagnostics Centers
                </Link>
              </li>
              <li>
                <Link href="/pharmacies" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Pharmacy Network
                </Link>
              </li>
              <li>
                <Link href="/portal" className="group flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  Patient Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-[0.1em] text-white text-sm mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Security Standard
            </h4>
            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-colors group">
              <h5 className="font-bold text-white text-sm mb-2 group-hover:text-emerald-400 transition-colors">HIPAA Vault Encryption</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                All telemetry and biometric data is end-to-end encrypted via Medplum nodes executing standard HL7 FHIR protocols.
              </p>
            </div>
          </div>

        </div>
        
        <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-bold tracking-widest uppercase text-slate-500">
          <p>© 2026 DehaPa.com. All Rights Reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-white transition-colors">Privacy Auth</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Op</Link>
          </div>
          <p className="flex items-center gap-2">
            System Architect: <span className="text-white bg-slate-800 px-3 py-1 rounded-md border border-slate-700">SD IT Services</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
