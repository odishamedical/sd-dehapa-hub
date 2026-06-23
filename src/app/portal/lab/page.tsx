"use client";

import React from 'react';
import UniversalOwnerDashboard from '@/components/UniversalOwnerDashboard';
import { DashboardTab } from '@/components/DashboardLayout';
import DashboardHomeGrid from '@/components/DashboardHomeGrid';
import PatientLeadsWidget from '@/components/PatientLeadsWidget';
import InviteWidget from '@/components/InviteWidget';
import LiveOrderWidget from '@/components/LiveOrderWidget';
import MyNetworkHub from '@/components/network/MyNetworkHub';

export default function LabDashboard() {
  const customTabs: DashboardTab[] = [
    {
      id: "inquiries",
      label: "Patient Inquiries",
      section: "PATIENT INQUIRIES",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
    },
    {
      id: "network",
      label: "My Network",
      section: "PATIENT INQUIRIES",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    {
      id: "inbox",
      label: "Rx Inbox & Orders",
      section: "ORDERS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path></svg>
    },
    {
      id: "vault",
      label: "Upload Report to Vault",
      section: "REPORTS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
    }
  ];

  const renderCustomTab = (tabId: string, entityData: any) => {
    if (tabId === "network") {
      return <MyNetworkHub providerId={entityData.id || null} providerRole="lab" />;
    }

    if (tabId === "inquiries") {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <PatientLeadsWidget providerId={entityData.id || ''} />
        </div>
      );
    }
    
    if (tabId === "vault") {
      return (
        <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 bg-white/60 text-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2 text-slate-800">Upload to Sovereign Vault</h2>
          <p className="text-slate-600 mb-8">Enter the patient's exact Vault ID (registered email or phone) to push finalized PDF reports securely to their account.</p>

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

    if (tabId === "inbox") {
      return (
        <LiveOrderWidget providerId={entityData.id || ''} providerType="lab" />
      );
    }
    return null;
  };

  const renderHomeWidget = (entityData: any) => (
    <DashboardHomeGrid
      onNavigate={() => {}}
      tabs={customTabs}
      profileStrength={80}
      profileTitle="Lab Profile Strength"
      profileSubtitle="Complete your facility profile to rank higher in the public directory and unlock premium features."
      pendingActions={[]}
      topRightWidget={<InviteWidget userUid={null} />}
      extraContent={
        <div className="bg-white/60 backdrop-blur-md rounded-[20px] p-5 border border-white shadow-sm mt-6">
          <h4 className="text-[11px] font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-widest">
            <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            Monthly Tests Processed
          </h4>
          <div className="h-28 flex items-center justify-center border-2 border-dashed border-cyan-200/50 rounded-xl bg-cyan-50/30">
            <p className="text-xs font-bold text-slate-400">Not enough data to display</p>
          </div>
        </div>
      }
    />
  );

  return (
    <UniversalOwnerDashboard 
      expectedRole="lab"
      customTabs={customTabs}
      renderCustomTab={renderCustomTab}
      renderHomeWidget={renderHomeWidget}
    />
  );
}
