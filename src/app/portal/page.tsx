"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import AddressBlock, { AddressData } from '@/components/AddressBlock';
import { useAutosave } from '@/hooks/useAutosave';
import AutosaveIndicator from '@/components/AutosaveIndicator';
import ImageUpload from '@/components/ImageUpload';
import PatientOnboardingModal from '@/components/PatientOnboardingModal'; // Keeping import just in case, but unused here
import PatientVaultWidget from '@/components/PatientVaultWidget';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import InviteWidget from '@/components/InviteWidget';
import PatientConsultWidget from '@/components/PatientConsultWidget';
import PatientAppointments from '@/components/PatientAppointments';
import MyNetworkHub from '@/components/network/MyNetworkHub';

function UserHomeWidget({ userName, userUid, userRole, onTabChange }: { userName: string | null, userUid: string | null, userRole: string | null, onTabChange: (id: string) => void }) {
  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">
        
        {/* 0. Notification Banner for Providers */}
        {userRole && userRole !== 'patient' && userRole !== 'super_admin' && userRole !== 'admin' && (
          <div className="md:col-span-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">Congratulations!</h3>
                <p className="text-sm font-medium text-emerald-50">Your application has been approved. Your official {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard is now unlocked.</p>
              </div>
            </div>
            <a href={`/portal/${userRole.toLowerCase()}`} className="bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-sm transition-colors whitespace-nowrap">
              Go to Dashboard
            </a>
          </div>
        )}

        {/* 1. Welcome Banner (Top on both) */}
        <div className="order-1 md:col-span-2 bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm rounded-[24px] p-6 md:p-8 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="z-10 relative">
              <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-800 mb-2">Welcome back, {userName}</h2>
              <p className="text-sm md:text-base text-slate-500 font-medium">Your medical profile is secure and up to date.</p>
            </div>
        </div>

        {/* 2. Quick Actions (Middle on mobile, Bottom on desktop) */}
        <div className="order-2 md:order-3 md:col-span-3 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[24px] p-6 md:p-8 shadow-sm">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                    { id: 'find_doctor', label: 'Find a Doctor', icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>, color: 'text-teal-600', bg: 'bg-teal-50' },
                    { id: 'network', label: 'My Network', icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { id: 'appointments', label: 'My Appointments', icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { id: 'settings', label: 'Family Members', icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { id: 'vault', label: 'Health Vault', icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(action => (
                    <button 
                        key={action.id}
                        onClick={() => onTabChange(action.id)}
                        className="flex flex-col items-center justify-center p-4 md:p-6 bg-slate-50 border border-slate-200 hover:border-teal-300 hover:bg-white rounded-xl md:rounded-2xl transition-all hover:shadow-md group"
                    >
                        <div className={`w-12 h-12 md:w-14 md:h-14 ${action.bg} ${action.color} rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                            {action.icon}
                        </div>
                        <span className="font-bold text-slate-700 text-xs md:text-sm text-center">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* 3. Invite Widget (Bottom on mobile, Top Right on desktop) */}
        <div className="order-3 md:order-2 md:col-span-1">
            <InviteWidget userUid={userUid} userName={userName} />
        </div>



    </div>
  );
}

export default function UserDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>("User");
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState("home");

  // Sync tab with URL Hash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash && ["home", "identity", "address", "family", "appointments", "billing", "vault", "telemedicine", "find_doctor"].includes(hash)) {
        setActiveTab(hash);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "#" + activeTab);
    }
  }, [activeTab]);

  const [userUid, setUserUid] = useState<string | null>(null);

  // State for Identity
  const [identityData, setIdentityData] = useState({
    profilePhoto: "",
    fullName: "",
    phone: "",
    whatsappNumber: "",
    email: ""
  });
  const identitySaveStatus = useAutosave(identityData, userUid, 'identity', 1000, 'users');

  // State for Address
  const [addressData, setAddressData] = useState<AddressData>({
    country: "India",
    state: "Odisha",
    district: "",
    block: "",
    city: "",
    pincode: "",
    localAddress: ""
  });
  const addressSaveStatus = useAutosave(addressData, userUid, 'address', 1000, 'users');

  // State for Family Members
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const familySaveStatus = useAutosave(familyMembers, userUid, 'familyMembers', 1000, 'users');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      const uid = localStorage.getItem("sd_current_user_uid");
      const role = localStorage.getItem("sd_current_user_role");
      
      if (!email) {
        window.location.href = "/login";
      } else {
        setUserEmail(email);
        setUserName(name || email.split("@")[0]);
        setUserRole(role);
        if (uid) {
           setUserUid(uid);
        } else {
           // Fallback if they haven't logged in recently to get the new uid localstorage
           import('firebase/auth').then(({ getAuth, onAuthStateChanged }) => {
              const auth = getAuth();
              onAuthStateChanged(auth, (user) => {
                 if (user) {
                    setUserUid(user.uid);
                    localStorage.setItem("sd_current_user_uid", user.uid);
                 }
              });
           });
        }
        setIdentityData(prev => ({ ...prev, fullName: name || "", email }));
        
        const handleRoleUpgrade = () => {
           const newRole = localStorage.getItem("sd_current_user_role");
           setUserRole(newRole);
        };
        window.addEventListener("sd_role_upgraded", handleRoleUpgrade);
        // Check if profile is complete. If not, send to our brand new /portal/setup page (unless they are a provider/admin)
        const checkRoleAndRedirect = async () => {
           let currentRole = localStorage.getItem("sd_current_user_role") || "user";
           const isComplete = localStorage.getItem("sd_current_user_profile_complete");
           const exemptRoles = ["doctor", "hospital", "admin", "super_admin", "lab", "pharmacy", "ambulance"];

           // CRITICAL FIX: If they are a provider, immediately boot them out of the patient portal to their correct dashboard!
           if (exemptRoles.includes(currentRole) && currentRole !== "admin" && currentRole !== "super_admin") {
              window.location.href = `/portal/${currentRole}`;
              return;
           }

           if (isComplete === "true") return;

           // Double-check Firebase directly to prevent race conditions on immediate post-approval navigation
           if (!exemptRoles.includes(currentRole.toLowerCase())) {
             try {
                const { query, collection, where, getDocs } = await import('firebase/firestore');
                const { db } = await import('@/lib/firebase');
                const q = query(collection(db, "users"), where("email", "==", email));
                const snap = await getDocs(q);
                if (!snap.empty) {
                   // If user has multiple profiles, check if ANY of them are exempt
                   const roles = snap.docs.map(d => d.data().role?.toLowerCase() || 'user');
                   const hasExemptRole = roles.find(r => exemptRoles.includes(r));
                   if (hasExemptRole) {
                      currentRole = hasExemptRole;
                      localStorage.setItem("sd_current_user_role", currentRole);
                   }
                }
             } catch(e) {
                console.error("Role verify failed", e);
             }
           }
           
           if (!exemptRoles.includes(currentRole.toLowerCase())) {
              window.location.href = '/portal/setup';
           }
        };
        checkRoleAndRedirect();

        return () => {
            window.removeEventListener("sd_role_upgraded", handleRoleUpgrade);
        };
      }
    }
  }, [router]);

  const handleTabChange = (tabId: string) => {
    if (tabId === "find_doctor") {
      router.push("/doctors");
      return;
    }
    setActiveTab(tabId);
  };

  useEffect(() => {
    return () => {
       if (typeof window !== "undefined") {
         window.removeEventListener("sd_role_upgraded", () => setUserRole(localStorage.getItem("sd_current_user_role")));
       }
    };
  }, []);

  if (!isMounted) return null;
  if (!userEmail) return null;

  const userTabs: DashboardTab[] = [
    {
      id: "settings",
      label: "Account Settings",
      section: "PROFILE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    },
    {
      id: "appointments",
      label: "My Appointments",
      section: "QUICK ACTIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    },
    {
      id: "billing",
      label: "Billing & Invoices",
      section: "QUICK ACTIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
    },
    {
      id: "vault",
      label: "Health Vault",
      section: "QUICK ACTIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    },
    {
      id: "network",
      label: "My Network",
      section: "GLOBAL NETWORK",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    {
      id: "telemedicine",
      label: "Instant Consult",
      section: "QUICK ACTIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
    },
    {
      id: "find_doctor",
      label: "Find a Doctor",
      section: "QUICK ACTIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
    }
  ];

  const addFamilyMember = () => {
    if (familyMembers.length >= 5) {
      alert("You can only add up to 5 family members.");
      return;
    }
    setFamilyMembers(prev => [...prev, {
      id: Date.now().toString(),
      name: "",
      age: "",
      sex: "",
      relationship: "",
      bloodGroup: "",
      medicalHistory: ""
    }]);
  };

  const updateFamilyMember = (index: number, field: string, value: string) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const removeFamilyMember = (index: number) => {
    const updated = familyMembers.filter((_, i) => i !== index);
    setFamilyMembers(updated);
  };

  return (
    <DashboardLayout 
      roleName="User Portal" 
      tabs={userTabs} 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      userProfile={{
        name: userName || "User",
        subtitle: userEmail,
      }}
      hideDefaultModulesList={true}
      homeWidget={<UserHomeWidget userName={userName} userUid={userEmail} userRole={userRole} onTabChange={handleTabChange} />}
    >
      <div className="max-w-4xl mx-auto pb-24">
        
        {activeTab === "settings" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4 text-center py-16">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Account Settings</h3>
            <p className="text-slate-500 mb-6">Manage your identity, address, and family members here.</p>
            <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm">
              Edit Profile Details
            </button>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">My Appointments</h3>
            <PatientAppointments patientId={userEmail || ''} />
          </div>
        )}

        {activeTab === "billing" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Billing & Invoices</h3>
            <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-[24px] border border-white/60 shadow-sm">
              <div className="w-16 h-16 bg-white/80 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </div>
              <p className="text-slate-900 font-bold text-lg mb-1">No Transactions</p>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">Your payment history and invoices will securely appear here.</p>
            </div>
          </div>
        )}

        {activeTab === "vault" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <PatientVaultWidget />
          </div>
        )}

        {activeTab === "telemedicine" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <PatientConsultWidget patientId={userEmail || 'unknown-patient'} />
          </div>
        )}

        {activeTab === "network" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <MyNetworkHub providerId={userUid} providerRole="patient" />
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
