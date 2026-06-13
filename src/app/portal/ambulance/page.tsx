"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function AmbulanceDashboard() {
  const [activeTab, setActiveTab] = useState("dispatch");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-500/30 flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white shrink-0 hidden md:flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.5)]">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
             </div>
             <span className="font-serif font-bold tracking-widest uppercase">DehaPa <span className="text-red-400">EMS</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab("dispatch")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === 'dispatch' ? 'bg-red-500 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Live Dispatch
          </button>
          <button onClick={() => setActiveTab("fleet")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === 'fleet' ? 'bg-red-500 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            Fleet Management
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-serif font-bold text-slate-900 capitalize">
            {activeTab.replace("-", " ")}
          </h2>
          <div className="flex items-center gap-4">
            <Link href="/portal" className="text-sm font-bold text-red-500 hover:underline">Exit to Portal</Link>
          </div>
        </header>

        <div className="p-8 flex-1">
          {activeTab === "dispatch" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Emergency Dispatch Queue</h3>
                  <p className="text-sm text-slate-500">Manage incoming ambulance requests in real-time.</p>
                </div>
                <div className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-red-200 animate-pulse">
                  Live Feed Active
                </div>
              </div>
              
              {/* Empty State */}
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <p className="font-bold text-slate-900 mb-1">No Active Emergencies</p>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">Standby for incoming dispatch requests from patients or hospitals.</p>
              </div>
            </div>
          )}

          {activeTab === "fleet" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-bold mb-1">Fleet Roster</h3>
              <p className="text-sm text-slate-500 mb-6">Manage your drivers, vehicles, and their active status.</p>
              
              <div className="text-center py-16 border border-slate-200 rounded-xl bg-slate-50">
                <p className="font-mono text-xs uppercase tracking-widest text-slate-500">No Vehicles Registered</p>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
