"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PharmacyDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [pharmacyName, setPharmacyName] = useState("Pharmacy Hub");

  useEffect(() => {
    const role = localStorage.getItem("sd_current_user_role");
    const name = localStorage.getItem("sd_current_user_name");
    
    if (role === "pharmacy" || role === "super_admin") {
      setAccessGranted(true);
      if (name) setPharmacyName(name);
    } else {
      setAccessGranted(false);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-tenant-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center font-sans">
        <h1 className="text-3xl font-serif font-bold mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-8">This portal is for verified Chemists and Pharmacies.</p>
        <Link href="/portal" className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase">Return to Portal</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-tenant-accent/30">
      <header className="bg-white border-b border-slate-200 px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/portal" className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold font-serif">{pharmacyName}</h1>
            <p className="text-[10px] text-tenant-accent font-mono uppercase tracking-widest">Rx Inbox & Fulfillment</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold">Digital Prescription Orders</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center py-20 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path></svg>
          </div>
          <p className="font-bold text-slate-900 mb-1">Inbox is Empty</p>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">When patients share their digital prescriptions with your pharmacy for delivery or pickup, they will appear here.</p>
        </div>
      </main>
    </div>
  );
}
