"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LabDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [labName, setLabName] = useState("Pathology Uploader");
  
  const [vaultId, setVaultId] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("sd_current_user_role");
    const name = localStorage.getItem("sd_current_user_name");
    
    if (role === "lab" || role === "super_admin") {
      setAccessGranted(true);
      if (name) setLabName(name);
    } else {
      setAccessGranted(false);
    }
    setLoading(false);
  }, []);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultId) return;
    alert(`Initiating secure connection to Vault: ${vaultId}\n(Firestore write permission checking)`);
  };

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
        <p className="text-slate-600 mb-8">This portal is for verified Diagnostic Centers and Labs.</p>
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
            <h1 className="text-xl font-bold font-serif">{labName}</h1>
            <p className="text-[10px] text-tenant-accent font-mono uppercase tracking-widest">Diagnostic Report Uploader</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-20">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl shadow-slate-200/50">
          <div className="w-16 h-16 bg-tenant-accent/10 text-tenant-accent rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2">Upload to Sovereign Vault</h2>
          <p className="text-slate-500 mb-8">Enter the patient's exact Vault ID (registered email or phone) to push finalized PDF reports securely to their account.</p>

          <form onSubmit={handleLookup} className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Patient Vault ID</label>
              <input 
                type="text" 
                required
                value={vaultId}
                onChange={e => setVaultId(e.target.value)}
                placeholder="e.g. patient@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:border-tenant-accent focus:ring-1 focus:ring-tenant-accent outline-none transition-all font-mono"
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              Lookup Vault
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
