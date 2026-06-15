"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import EcosystemSwitcher from '@/components/EcosystemSwitcher';
import { useRouter } from 'next/navigation';

export default function PatientPortal() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>("Patient");
  const [userRole, setUserRole] = useState<string>("patient");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      let role = localStorage.getItem("sd_current_user_role") || "patient";
      if (email === 'odishamedical@gmail.com') role = 'super_admin';
      
      if (!email) {
        // Redirect to Auth Center if not logged in
        window.location.href = "/login";
      } else {
        setUserEmail(email);
        setUserName(name || email.split("@")[0]);
        setUserRole(role);
      }
    }
  }, [router]);

  if (!userEmail) return null; // Loading state

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-tenant-accent/30">
      {/* Global Header */}
      <header className="relative z-50 h-[80px] border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-12 sticky top-0">
        <Link href="/" className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tenant-accent to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_var(--tenant-accent-glow)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-widest text-slate-900 uppercase font-serif">DehaPa <span className="text-tenant-accent">Health</span></span>
            <span className="text-[9px] text-slate-500 tracking-[0.2em] uppercase font-mono">Patient Portal</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <EcosystemSwitcher />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-4 flex flex-col items-center text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 border-2 border-tenant-accent rounded-full mb-3 flex items-center justify-center text-2xl font-bold text-tenant-accent">
              {userName?.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{userName}</h3>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{userEmail}</p>
          </div>
          
          <nav className="flex flex-col gap-2">
            <button className="bg-tenant-accent/10 text-tenant-accent border border-tenant-accent/30 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors text-left">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              Dashboard
            </button>
            <Link href="/doctors" className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              Find a Doctor
            </Link>
            <Link href={`/portal/vault/${encodeURIComponent(userEmail)}`} className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors text-left">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Sovereign Health Vault
            </Link>
            <Link href={`/portal/vault/${encodeURIComponent(userEmail)}`} className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors text-left">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              Lab Results
            </Link>

            {/* Role Based Links */}
            {userRole === "patient" && (
              <Link href="/portal/claim" className="text-tenant-accent hover:bg-slate-100 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors text-left mt-4 border border-tenant-accent/30 bg-tenant-accent/5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                Join Provider Network
              </Link>
            )}

            {userRole === "super_admin" && (
              <Link href="/portal/admin" className="text-tenant-accent hover:bg-slate-100 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors text-left mt-4 border border-tenant-accent/30 bg-slate-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Super Admin Panel
              </Link>
            )}
            
            {(userRole === "hospital" || userRole === "super_admin") && (
              <Link href="/portal/hospital" className="text-tenant-accent hover:bg-slate-100 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors text-left mt-2 border border-tenant-accent/30 bg-slate-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                Hospital Dashboard
              </Link>
            )}

            {(userRole === "lab" || userRole === "super_admin") && (
              <Link href="/portal/lab" className="text-tenant-accent hover:bg-slate-100 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors text-left mt-2 border border-tenant-accent/30 bg-slate-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                Pathology Dashboard
              </Link>
            )}

            {(userRole === "pharmacy" || userRole === "super_admin") && (
              <Link href="/portal/pharmacy" className="text-tenant-accent hover:bg-slate-100 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors text-left mt-2 border border-tenant-accent/30 bg-slate-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                Pharmacy Dashboard
              </Link>
            )}
          </nav>
        </aside>

        {/* Main Dashboard Content */}
        <div className="flex-1 flex flex-col gap-8">
          
          <div className="bg-gradient-to-r from-tenant-accent/10 to-teal-600/5 border border-tenant-accent/20 rounded-2xl p-8 flex justify-between items-center relative overflow-hidden shadow-sm">
             <div className="z-10">
               <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Welcome back, {userName}</h2>
               <p className="text-slate-500 text-sm">Your FHIR-compliant medical records are up to date.</p>
             </div>
             <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-tenant-accent/10 to-transparent pointer-events-none" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Upcoming Appointments */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 text-lg font-serif">Upcoming Consultations</h3>
                <Link href="/doctors" className="text-tenant-accent text-xs uppercase tracking-widest font-bold hover:underline">Book New</Link>
              </div>
              
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                 <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                 <p className="text-sm font-bold text-slate-500 mb-1">No upcoming appointments</p>
                 <p className="text-xs text-slate-400">Book a specialist to see it here.</p>
              </div>
            </div>

            {/* Recent Prescriptions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 text-lg font-serif">Active Prescriptions</h3>
                <button className="text-tenant-accent text-xs uppercase tracking-widest font-bold hover:underline">View Vault</button>
              </div>
              
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                 <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                 <p className="text-sm font-bold text-slate-500 mb-1">No active prescriptions</p>
                 <p className="text-xs text-slate-400">Doctors will push Rx here.</p>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
