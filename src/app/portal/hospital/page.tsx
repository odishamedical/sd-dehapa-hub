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
      section: "HOSPITAL OPERATIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
    },
    {
      id: "network",
      label: "My Network",
      section: "CONNECTIONS & RECORDS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    {
      id: "roster",
      label: "Doctor Roster",
      section: "HOSPITAL OPERATIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    },
    {
      id: "vault",
      label: "Patient Vault",
      section: "CONNECTIONS & RECORDS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    }
  ];

  const renderCustomTab = (tabId: string, entityData: any) => {
    if (tabId === "network") {
      return <MyNetworkHub providerId={entityData.id || null} providerRole="hospital" />;
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
