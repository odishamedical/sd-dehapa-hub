"use client";

import React, { useState, useEffect } from 'react';
import UniversalOwnerDashboard from '@/components/UniversalOwnerDashboard';
import { DashboardTab } from '@/components/DashboardLayout';
import DashboardHomeGrid from '@/components/DashboardHomeGrid';
import PatientLeadsWidget from '@/components/PatientLeadsWidget';
import InviteWidget from '@/components/InviteWidget';
import MyNetworkHub from '@/components/network/MyNetworkHub';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import SecureMedicalVault from '@/components/SecureMedicalVault';
import { ExtensionPoint } from '@/plugins/core/ExtensionPoint';
import HospitalPluginStore from '@/components/HospitalPluginStore';
import HospitalLiveBedManager from '@/components/HospitalLiveBedManager';

export default function HospitalDashboard() {
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search doctors in Firestore directory
  useEffect(() => {
    const searchDoctors = async () => {
      if (doctorSearchQuery.length < 3) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const q = query(
          collection(db, "directory"),
          where("role", "==", "doctor")
        );
        const querySnapshot = await getDocs(q);
        const results: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const name = data.name || "";
          
          if (name.toLowerCase().includes(doctorSearchQuery.toLowerCase())) {
            results.push({ id: doc.id, name });
          }
        });
        setSearchResults(results);
      } catch (err) {
        console.error("Error searching doctors:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchDoctors, 500); // debounce
    return () => clearTimeout(timeoutId);
  }, [doctorSearchQuery]);

  const handleInviteDoctor = async (docObj: any, hospitalData: any) => {
    if (!hospitalData?.id) return;
    
    // Write to hospital_affiliations collection
    try {
      await addDoc(collection(db, "hospital_affiliations"), {
        hospitalId: hospitalData.id,
        hospitalName: hospitalData.name || "Hospital",
        doctorId: docObj.id,
        doctorName: docObj.name,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      setDoctorSearchQuery("");
      alert("Invitation sent to doctor!");
    } catch (err) {
      console.error("Failed to send invite:", err);
    }
  };


  const customTabs: DashboardTab[] = [
    {
      id: "inquiries",
      label: "Patient Inquiries",
      section: "BASIC HOSPITAL HUB",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
    },
    {
      id: "roster",
      label: "Doctor Roster",
      section: "BASIC HOSPITAL HUB",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    },
    {
      id: "bed_manager",
      label: "Live Bed Manager",
      section: "CLINIC & IPD PRO",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
    },
    {
      id: "ot_scheduler",
      label: "OT Scheduler",
      section: "CLINIC & IPD PRO",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
    },
    {
      id: "ambulance_dispatch",
      label: "Ambulance Dispatch",
      section: "ENTERPRISE OS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
    },
    {
      id: "plugin_store",
      label: "Upgrades & Add-ons",
      section: "SYSTEM CONTROL",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
    }
  ];

  const renderCustomTab = (tabId: string, entityData: any) => {
    if (tabId === "patients") {
      return <MyNetworkHub providerId={entityData.id || null} providerRole="hospital" viewMode="b2c" />;
    }
    if (tabId === "b2b_network") {
      return <MyNetworkHub providerId={entityData.id || null} providerRole="hospital" viewMode="b2b" />;
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
    
    if (tabId === "roster") {
      return (
        <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Manage Doctors Roster</h3>
              <p className="text-sm text-slate-600 mt-1">Invite doctors to affiliate with your hospital.</p>
            </div>
          </div>
          
          <div className="bg-white/60 p-6 rounded-2xl border border-white shadow-sm mb-8">
            <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-widest">Invite Doctor</h4>
            <div className="relative">
              <input 
                type="text" 
                value={doctorSearchQuery}
                onChange={(e) => setDoctorSearchQuery(e.target.value)}
                placeholder="Search registered doctors by name..."
                className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 focus:border-cyan-500 outline-none transition-all"
              />
              {isSearching && <div className="absolute right-4 top-4 text-slate-400">Searching...</div>}
              
              {searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 overflow-y-auto">
                  {searchResults.map(docObj => (
                    <div key={docObj.id} className="flex justify-between items-center p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="font-bold text-slate-900">{docObj.name}</p>
                      </div>
                      <button 
                        onClick={() => handleInviteDoctor(docObj, entityData)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                      >
                        Send Invite
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    if (tabId === "bed_manager") {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 max-w-6xl mx-auto py-8 relative">
          {!(entityData?.activePlugins || []).includes("plugin_hospital_ipd_pro") && (
            <div className="absolute inset-0 z-50 bg-slate-100/60 backdrop-blur-md rounded-[32px] flex items-center justify-center p-6">
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-2xl text-center max-w-md animate-in zoom-in-95">
                <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-100">
                  <span className="text-3xl">🛏️</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">IPD Pro Required</h3>
                <p className="text-slate-600 text-sm mb-6">Upgrade to Clinic & IPD Pro to unlock the Live Bed Manager and manage patient admissions seamlessly.</p>
                <button onClick={() => {
                  const evt = new CustomEvent('navigate-tab', { detail: 'plugin_store' });
                  window.dispatchEvent(evt);
                }} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-xl w-full shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all">
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}
          <HospitalLiveBedManager />
        </div>
      );
    }

    if (tabId === "plugin_store") {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 max-w-5xl mx-auto py-8">
          <HospitalPluginStore entityData={entityData} />
        </div>
      );
    }

    return null;
  };

  const renderHomeWidget = (entityData: any) => (
    <DashboardHomeGrid
      onNavigate={() => {}}
      tabs={customTabs}
      profileStrength={100}
      profileTitle="Profile Live"
      profileSubtitle="Your hospital profile is fully visible in the public directory."
      pendingActions={[]}
      topRightWidget={<InviteWidget userUid={null} />}
    />
  );

  return (
    <UniversalOwnerDashboard 
      expectedRole="hospital"
      customTabs={customTabs}
      renderCustomTab={renderCustomTab}
      renderHomeWidget={renderHomeWidget}
    />
  );
}
