"use client";

import React from 'react';
import UniversalOwnerDashboard from '@/components/UniversalOwnerDashboard';
import { DashboardTab } from '@/components/DashboardLayout';
import DashboardHomeGrid from '@/components/DashboardHomeGrid';
import PatientLeadsWidget from '@/components/PatientLeadsWidget';
import InviteWidget from '@/components/InviteWidget';
import LiveDispatchWidget from '@/components/LiveDispatchWidget';
import MyNetworkHub from '@/components/network/MyNetworkHub';
import SecureMedicalVault from '@/components/SecureMedicalVault';
import DriverEarningsWidget from '@/components/DriverEarningsWidget';
import OwnerFleetEarningsWidget from '@/components/OwnerFleetEarningsWidget';
import FleetCommandMap from '@/components/FleetCommandMap';
import AmbulanceGuideView from '@/components/views/AmbulanceGuideView';
import AmbulancePluginStore from '@/components/AmbulancePluginStore';
import AmbulanceLiveDispatch from '@/components/AmbulanceLiveDispatch';
import AmbulanceFleetSocket from '@/components/AmbulanceFleetSocket';

export default function AmbulanceDashboard() {
  const customTabs: DashboardTab[] = [
    {
      id: "inquiries",
      label: "Patient Inquiries",
      section: "DISPATCH & OPERATIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
    },
    {
      id: "dispatch",
      label: "Live Dispatch",
      section: "DISPATCH & OPERATIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
    },
    {
      id: "fleet_command",
      label: "Fleet Command Map",
      section: "DISPATCH & OPERATIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7l6-3 5.553 2.776A1 1 0 0121 7.618v10.764a1 1 0 01-1.447.894L15 17l-6 3z"></path></svg>
    },
    {
      id: "b2b_socket",
      label: "Hospital Fleet Socket",
      section: "ENTERPRISE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
    },
    {
      id: "plugin_store",
      label: "Ambulance OS Plans",
      section: "ENTERPRISE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
    },
    {
      id: "driver_wallet",
      label: "My Earnings & Collections",
      section: "FINANCE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    },
    {
      id: "owner_fleet_earnings",
      label: "Fleet Earnings Ledger",
      section: "FINANCE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    },
    {
      id: "ambulance_guide",
      label: "Ambulance User Guide",
      section: "SUPPORT & UTILITIES",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
    }
  ];

  const renderCustomTab = (tabId: string, entityData: any) => {
    if (tabId === "patients") {
      return <MyNetworkHub providerId={entityData.id || null} providerRole="ambulance" viewMode="b2c" />;
    }
    if (tabId === "b2b_network") {
      return <MyNetworkHub providerId={entityData.id || null} providerRole="ambulance" viewMode="b2b" />;
    }
    
    if (tabId === "inquiries") {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <PatientLeadsWidget providerId={entityData.id || ''} />
        </div>
      );
    }
    
    if (tabId === "dispatch") {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 max-w-6xl mx-auto py-8 relative">
          {!(entityData?.activePlugins || []).includes("plugin_ambulance_dispatch_pro") && (
            <div className="absolute inset-0 z-50 bg-slate-100/60 backdrop-blur-md rounded-[32px] flex items-center justify-center p-6">
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-2xl text-center max-w-md animate-in zoom-in-95">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                  <span className="text-3xl">🚨</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Dispatch Pro Required</h3>
                <p className="text-slate-600 text-sm mb-6">Upgrade to Live Dispatch Pro to unlock real-time SOS alerts and patient GPS routing.</p>
                <button onClick={() => {
                  const evt = new CustomEvent('navigate-tab', { detail: 'plugin_store' });
                  window.dispatchEvent(evt);
                }} className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-xl w-full shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all">
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}
          <AmbulanceLiveDispatch />
        </div>
      );
    }
    
    if (tabId === "fleet_command") {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 max-w-6xl mx-auto py-8 relative">
          {!(entityData?.activePlugins || []).includes("plugin_ambulance_fleet_os") && (
            <div className="absolute inset-0 z-50 bg-slate-100/60 backdrop-blur-md rounded-[32px] flex items-center justify-center p-6">
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-2xl text-center max-w-md animate-in zoom-in-95">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏢</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Fleet OS Required</h3>
                <p className="text-slate-600 text-sm mb-6">Upgrade to Fleet Manager OS to manage multiple vehicles and socket into Hospitals.</p>
                <button onClick={() => {
                  const evt = new CustomEvent('navigate-tab', { detail: 'plugin_store' });
                  window.dispatchEvent(evt);
                }} className="bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl w-full shadow-[0_0_15px_rgba(15,23,42,0.3)] transition-all">
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}
          <FleetCommandMap providerId={entityData.id || ''} />
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
    
    if (tabId === "driver_wallet") {
      let userEmail = null;
      if (typeof window !== "undefined") {
        userEmail = localStorage.getItem("sd_current_user_email");
      }
      return <DriverEarningsWidget providerId={entityData.id || ''} userEmail={userEmail} entityData={entityData} />;
    }
    
    if (tabId === "owner_fleet_earnings") {
      return <OwnerFleetEarningsWidget providerId={entityData.id || ''} entityData={entityData} />;
    }
    
    if (tabId === "ambulance_guide") {
      return <AmbulanceGuideView />;
    }

    if (tabId === "b2b_socket") {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 max-w-6xl mx-auto py-8 relative">
          {!(entityData?.activePlugins || []).includes("plugin_ambulance_fleet_os") && (
            <div className="absolute inset-0 z-50 bg-slate-100/60 backdrop-blur-md rounded-[32px] flex items-center justify-center p-6">
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-2xl text-center max-w-md animate-in zoom-in-95">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔌</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Fleet OS Required</h3>
                <p className="text-slate-600 text-sm mb-6">Upgrade to Fleet Manager OS to socket directly into a Hospital's internal dispatch system.</p>
                <button onClick={() => {
                  const evt = new CustomEvent('navigate-tab', { detail: 'plugin_store' });
                  window.dispatchEvent(evt);
                }} className="bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl w-full shadow-[0_0_15px_rgba(15,23,42,0.3)] transition-all">
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}
          <AmbulanceFleetSocket />
        </div>
      );
    }

    if (tabId === "plugin_store") {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 max-w-5xl mx-auto py-8">
          <AmbulancePluginStore entityData={entityData} />
        </div>
      );
    }

    return null;
  };

  const renderHomeWidget = (entityData: any) => (
    <DashboardHomeGrid
      onNavigate={() => {}}
      tabs={customTabs}
      profileStrength={25}
      profileTitle="EMS Profile Strength"
      profileSubtitle="Complete your agency profile to rank higher in the public directory."
      pendingActions={[]}
      topRightWidget={<InviteWidget userUid={null} />}
    />
  );

  return (
    <UniversalOwnerDashboard 
      expectedRole="ambulance"
      customTabs={customTabs}
      renderCustomTab={renderCustomTab}
      renderHomeWidget={renderHomeWidget}
    />
  );
}
