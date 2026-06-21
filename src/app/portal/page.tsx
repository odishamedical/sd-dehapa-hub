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

function UserHomeWidget({ userName, userUid }: { userName: string | null, userUid: string | null }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 border border-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.05)] rounded-[24px] p-8 flex flex-col justify-center relative overflow-hidden">
        {/* Metallic Shine Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 hover:translate-x-full duration-1000 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>
        <div className="z-10 relative">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Welcome back, {userName}</h2>
          <p className="text-slate-500 text-sm">Your FHIR-compliant medical records are up to date.</p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-tenant-accent/10 to-transparent pointer-events-none" />
      </div>
      <div className="md:col-span-1">
        <InviteWidget userUid={userUid} userName={userName} />
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>("User");
  
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
      
      if (!email) {
        window.location.href = "/login";
      } else {
        setUserEmail(email);
        setUserName(name || email.split("@")[0]);
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
        
        // Check if profile is complete. If not, send to our brand new /portal/setup page
        const isComplete = localStorage.getItem("sd_current_user_profile_complete");
        if (isComplete !== "true") {
           window.location.href = '/portal/setup';
        }
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

  if (!isMounted) return null;
  if (!userEmail) return null;

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
      homeWidget={<UserHomeWidget userName={userName} userUid={userEmail} />}
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

      </div>
    </DashboardLayout>
  );
}
