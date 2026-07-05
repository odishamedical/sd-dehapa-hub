"use client";

import React from 'react';
import UniversalOwnerDashboard from '@/components/UniversalOwnerDashboard';
import { DashboardTab } from '@/components/DashboardLayout';
import DashboardHomeGrid from '@/components/DashboardHomeGrid';
import PatientLeadsWidget from '@/components/PatientLeadsWidget';
import InviteWidget from '@/components/InviteWidget';
import LiveOrderWidget from '@/components/LiveOrderWidget';
import MyNetworkHub from '@/components/network/MyNetworkHub';
import SecureMedicalVault from '@/components/SecureMedicalVault';

export default function LabDashboard() {
  const customTabs: DashboardTab[] = [
    {
      id: "medical_vault",
      label: "Medical Vault",
      section: "CONNECTIONS & NETWORK",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
    },
    {
      id: "inbox",
      label: "Rx Inbox & Orders",
      section: "ORDERS & REPORTS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path></svg>
    }
  ];

  const renderCustomTab = (tabId: string, entityData: any) => {
    if (tabId === "patients") {
      return <MyNetworkHub providerId={entityData.id || null} providerRole="lab" viewMode="b2c" />;
    }
    if (tabId === "b2b_network") {
      return <MyNetworkHub providerId={entityData.id || null} providerRole="lab" viewMode="b2b" />;
    }

    if (tabId === "inquiries") {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <PatientLeadsWidget providerId={entityData.id || ''} />
        </div>
      );
    }
    
    if (tabId === "medical_vault") {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <SecureMedicalVault providerId={entityData.id || ''} />
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
