"use client";

import React from 'react';
import UniversalOwnerDashboard from '@/components/UniversalOwnerDashboard';
import { DashboardTab } from '@/components/DashboardLayout';
import DashboardHomeGrid from '@/components/DashboardHomeGrid';
import PatientLeadsWidget from '@/components/PatientLeadsWidget';
import PharmacyFulfillmentWidget from '@/components/PharmacyFulfillmentWidget';
import MyNetworkHub from '@/components/network/MyNetworkHub';
import SecureMedicalVault from '@/components/SecureMedicalVault';
import PharmacyPluginStore from '@/components/PharmacyPluginStore';
import PharmacyB2BSocket from '@/components/PharmacyB2BSocket';
import { ExtensionPoint } from '@/plugins/core/ExtensionPoint';

export default function PharmacyDashboard() {
  const customTabs: DashboardTab[] = [
    {
      id: "inquiries",
      label: "Patient Inquiries",
      section: "ORDERS & REPORTS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
    },
    {
      id: "inbox",
      label: "Rx Inbox & Fulfillment",
      section: "ORDERS & REPORTS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path></svg>
    },
    {
      id: "inventory",
      label: "Smart Inventory",
      section: "MANAGEMENT",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
    },
    {
      id: "b2b_socket",
      label: "Hospital B2B Socket",
      section: "ENTERPRISE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
    },
    {
      id: "plugin_store",
      label: "Pharmacy OS Plans",
      section: "ENTERPRISE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
    }
  ];

  const renderCustomTab = (tabId: string, entityData: any) => {
    if (tabId === "patients") {
      return <MyNetworkHub providerId={entityData.id || null} providerRole="pharmacy" viewMode="b2c" />;
    }
    if (tabId === "b2b_network") {
      return <MyNetworkHub providerId={entityData.id || null} providerRole="pharmacy" viewMode="b2b" />;
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
        <div className="animate-in fade-in slide-in-from-bottom-4 max-w-6xl mx-auto py-8 relative">
          {!(entityData?.activePlugins || []).includes("plugin_pharmacy_fulfillment_pro") && (
            <div className="absolute inset-0 z-50 bg-slate-100/60 backdrop-blur-md rounded-[32px] flex items-center justify-center p-6">
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-2xl text-center max-w-md animate-in zoom-in-95">
                <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-100">
                  <span className="text-3xl">📦</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Fulfillment Pro Required</h3>
                <p className="text-slate-600 text-sm mb-6">Upgrade to Digital Fulfillment Pro to receive digital prescriptions directly from Dehapa Doctors.</p>
                <button onClick={() => {
                  const evt = new CustomEvent('navigate-tab', { detail: 'plugin_store' });
                  window.dispatchEvent(evt);
                }} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-xl w-full shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all">
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}
          <PharmacyFulfillmentWidget providerId={entityData.id || ''} />
        </div>
      );
    }
    if (tabId === "inventory") {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 max-w-5xl mx-auto py-8 relative">
          {!(entityData?.activePlugins || []).includes("plugin_pharmacy_fulfillment_pro") && (
            <div className="absolute inset-0 z-50 bg-slate-100/60 backdrop-blur-md rounded-[32px] flex items-center justify-center p-6">
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-2xl text-center max-w-md animate-in zoom-in-95">
                <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-100">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Fulfillment Pro Required</h3>
                <p className="text-slate-600 text-sm mb-6">Upgrade to Digital Fulfillment Pro to unlock Smart Inventory mapping.</p>
                <button onClick={() => {
                  const evt = new CustomEvent('navigate-tab', { detail: 'plugin_store' });
                  window.dispatchEvent(evt);
                }} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-xl w-full shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all">
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}
          <ExtensionPoint name="pharmacy_inventory" />
        </div>
      );
    }
    if (tabId === "b2b_socket") {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 max-w-6xl mx-auto py-8 relative">
          {!(entityData?.activePlugins || []).includes("plugin_pharmacy_enterprise_os") && (
            <div className="absolute inset-0 z-50 bg-slate-100/60 backdrop-blur-md rounded-[32px] flex items-center justify-center p-6">
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-2xl text-center max-w-md animate-in zoom-in-95">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-100">
                  <span className="text-3xl">🔌</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Enterprise Required</h3>
                <p className="text-slate-600 text-sm mb-6">Upgrade to Enterprise B2B Socket to connect directly with Hospital systems.</p>
                <button onClick={() => {
                  const evt = new CustomEvent('navigate-tab', { detail: 'plugin_store' });
                  window.dispatchEvent(evt);
                }} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl w-full shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all">
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}
          <PharmacyB2BSocket />
        </div>
      );
    }
    if (tabId === "plugin_store") {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 max-w-5xl mx-auto py-8">
          <PharmacyPluginStore entityData={entityData} />
        </div>
      );
    }
    return null;
  };

  const renderHomeWidget = (entityData: any) => (
    <DashboardHomeGrid
      onNavigate={() => {}}
      tabs={customTabs}
      profileStrength={80}
      profileTitle="Pharmacy Profile Strength"
      profileSubtitle="Complete your facility profile to rank higher in the public directory and unlock premium features."
      pendingActions={[]}
    />
  );

  return (
    <UniversalOwnerDashboard 
      expectedRole="pharmacy"
      customTabs={customTabs}
      renderCustomTab={renderCustomTab}
      renderHomeWidget={renderHomeWidget}
    />
  );
}
