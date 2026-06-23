"use client";

import React from 'react';
import UniversalOwnerDashboard from '@/components/UniversalOwnerDashboard';
import { DashboardTab } from '@/components/DashboardLayout';
import DashboardHomeGrid from '@/components/DashboardHomeGrid';
import PatientLeadsWidget from '@/components/PatientLeadsWidget';
import InviteWidget from '@/components/InviteWidget';
import PendingConnectionsWidget from '@/components/PendingConnectionsWidget';
import { auth } from '@/lib/firebase';

export default function DoctorDashboard() {
  const customTabs: DashboardTab[] = [
    {
      id: "appointments",
      label: "Appointments",
      section: "QUICK ACCESS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    },

    {
      id: "inquiries",
      label: "Patient Inquiries",
      section: "QUICK ACCESS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
    },
    {
      id: "vault",
      label: "Secure Medical Vault",
      section: "CLINIC MANAGEMENT",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
    }
  ];

  const renderCustomTab = (tabId: string, entityData: any) => {

    if (tabId === "inquiries") {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <PatientLeadsWidget providerId={entityData.id || ''} />
        </div>
      );
    }
    
    if (tabId === "appointments") {
      return (
        <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
             <h3 className="text-xl font-bold text-slate-900">Upcoming Appointments</h3>
             <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-3 py-1 rounded-full border border-cyan-200">2 Today</span>
          </div>
          <div className="text-center py-16 border-2 border-dashed border-white/60 rounded-xl bg-white/40">
            <div className="w-16 h-16 bg-white/60 border border-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
               <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <p className="font-bold text-slate-900 mb-1">No upcoming appointments</p>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">Your schedule is clear. Make sure your availability settings are updated.</p>
          </div>
        </div>
      );
    }

    if (tabId === "vault") {
      return (
        <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 bg-white/60 text-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2 text-slate-800">Secure Medical Vault</h2>
          <p className="text-slate-600 mb-8">Access patient records or upload prescriptions securely.</p>

          <form onSubmit={(e) => { e.preventDefault(); alert("Vault connection initiated"); }} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">Patient Vault ID</label>
              <input 
                type="text" 
                required
                placeholder="e.g. patient@example.com"
                className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all font-mono"
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              Lookup Vault
            </button>
          </form>
        </div>
      );
    }

    return null;
  };

  const renderHomeWidget = (entityData: any) => (
    <DashboardHomeGrid
      onNavigate={() => {}}
      tabs={customTabs}
      profileStrength={75}
      profileTitle="Doctor Profile Strength"
      profileSubtitle="Complete your profile to rank higher in the public directory."
      pendingActions={[]}
      topRightWidget={<InviteWidget userUid={null} />}
      middleRightWidget={<PendingConnectionsWidget providerId={entityData?.id || null} />}
    />
  );

  return (
    <UniversalOwnerDashboard 
      expectedRole="doctor"
      customTabs={customTabs}
      renderCustomTab={renderCustomTab}
      renderHomeWidget={renderHomeWidget}
    />
  );
}
