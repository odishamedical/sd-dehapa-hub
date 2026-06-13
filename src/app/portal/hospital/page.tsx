"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HospitalDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [hospitalName, setHospitalName] = useState("Enterprise Dashboard");

  useEffect(() => {
    const role = localStorage.getItem("sd_current_user_role");
    const name = localStorage.getItem("sd_current_user_name");
    
    if (role === "hospital" || role === "super_admin") {
      setAccessGranted(true);
      if (name) setHospitalName(name);
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
        <h1 className="text-3xl font-serif font-bold mb-2">Enterprise Access Required</h1>
        <p className="text-slate-600 mb-8">This portal is for verified Hospital Administrators.</p>
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
            <h1 className="text-xl font-bold font-serif">{hospitalName}</h1>
            <p className="text-[10px] text-tenant-accent font-mono uppercase tracking-widest">Enterprise Management</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold">Doctor Roster</h2>
          <button className="bg-tenant-accent hover:bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg">+ Invite Doctor</button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <p className="font-bold text-slate-900 mb-1">No Doctors on Roster</p>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">Invite doctors to link their DehaPa profiles to your hospital. They will appear in the directory under your facility.</p>
        </div>
      </main>
    </div>
  );
}
