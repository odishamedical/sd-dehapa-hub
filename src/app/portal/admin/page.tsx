"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    const role = localStorage.getItem("sd_current_user_role");
    
    if (role === "super_admin") {
      setAccessGranted(true);
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
        <div className="w-20 h-20 bg-red-100 border border-red-200 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h1 className="text-3xl font-serif font-bold mb-2">Restricted Area</h1>
        <p className="text-slate-600 mb-8 max-w-md text-center">This dashboard is exclusively for DehaPa Super Administrators.</p>
        <Link href="/portal" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors">Return to Portal</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-tenant-accent/30 flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white shrink-0 hidden md:flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-tenant-accent flex items-center justify-center text-white font-bold shadow-[0_0_15px_var(--tenant-accent-glow)]">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
             </div>
             <span className="font-serif font-bold tracking-widest uppercase">DehaPa <span className="text-tenant-accent">Admin</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab("users")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === 'users' ? 'bg-tenant-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            User & Patient Directory
          </button>
          <button onClick={() => setActiveTab("verification")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === 'verification' ? 'bg-tenant-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Verification Queue
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">0</span>
          </button>
          <button onClick={() => setActiveTab("audit")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === 'audit' ? 'bg-tenant-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            Vault Audit Logs
          </button>
          <div className="pt-4 mt-4 border-t border-slate-800">
            <p className="px-4 text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">Automations</p>
            <button onClick={() => setActiveTab("crawler")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === 'crawler' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
              Google Data Crawler
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-serif font-bold text-slate-900 capitalize">
            {activeTab.replace("-", " ")}
          </h2>
          <div className="flex items-center gap-4">
            <Link href="/portal" className="text-sm font-bold text-tenant-accent hover:underline">Exit to Portal</Link>
          </div>
        </header>

        <div className="p-8 flex-1">
          {activeTab === "users" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Registered Platform Users</h3>
                  <p className="text-sm text-slate-500">By default, all new users are assigned the "Patient" role.</p>
                </div>
                <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">Export CSV</button>
              </div>
              
              {/* Zero Mock Data: Empty State */}
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <p className="font-bold text-slate-900 mb-1">No Active Users</p>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">Users fetched from Firebase Auth will appear here.</p>
              </div>
            </div>
          )}

          {activeTab === "verification" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Verification Queue</h3>
                  <p className="text-sm text-slate-500">Approve requests to upgrade Patients to Doctors/Hospitals/Pharmacies.</p>
                </div>
              </div>
              
              {/* Zero Mock Data: Empty State */}
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg className="w-8 h-8 text-tenant-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <p className="font-bold text-slate-900 mb-1">Queue is Empty</p>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">There are no pending role upgrade requests.</p>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
               <h3 className="text-lg font-bold mb-1">Sovereign Vault Audit Logs</h3>
               <p className="text-sm text-slate-500 mb-6">System-wide immutable logs of health record access for legal compliance.</p>
               
               <div className="text-center py-16 border border-slate-200 rounded-xl bg-slate-50">
                 <p className="font-mono text-xs uppercase tracking-widest text-slate-500">No Logs Generated Yet</p>
               </div>
            </div>
          )}

          {activeTab === "crawler" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Google Maps Data Crawler</h3>
                  <p className="text-sm text-slate-500">Automatically fetch and publish Hospitals, Labs, and Clinics from Google Places API.</p>
                </div>
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-blue-200">
                  API Connected
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Search Query</label>
                    <input type="text" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. Cardiologists in Bhubaneswar" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Category Mapping</label>
                    <select className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                      <option>Doctors</option>
                      <option>Hospitals</option>
                      <option>Labs</option>
                      <option>Pharmacies</option>
                    </select>
                  </div>
                  <div>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      Crawl Maps
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg className="w-8 h-8 text-blue-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <p className="font-bold text-slate-900 mb-1">Ready to Crawl</p>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">Enter a search query above to fetch data. You can review and publish items directly to Firebase.</p>
              </div>

            </div>
          )}
        </div>
      </main>

    </div>
  );
}
