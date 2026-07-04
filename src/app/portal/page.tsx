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
import { indianStates, districtsByState, blocksByDistrict } from '@/lib/locations';
import UniversalPersonalForm from '@/components/UniversalPersonalForm';

import InviteWidget from '@/components/InviteWidget';
import PatientConsultWidget from '@/components/PatientConsultWidget';
import PatientAppointments from '@/components/PatientAppointments';
import MyNetworkHub from '@/components/network/MyNetworkHub';
import CareTeamSeatingChart from '@/components/network/CareTeamSeatingChart';
import SupportDashboard from '@/components/SupportDashboard';
import LiveHealthFeed from '@/components/network/LiveHealthFeed';
import WalletDashboard from '@/components/payments/WalletDashboard';

function UserHomeWidget({ userName, userUid, userRole, userPhoto, onTabChange }: { userName: string | null, userUid: string | null, userRole: string | null, userPhoto: string | null, onTabChange: (id: string) => void }) {
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
            <div className="z-10 relative flex items-center gap-6">
              {userPhoto ? (
                <img src={userPhoto} alt={userName || "Profile"} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-sm object-cover" />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-3xl shadow-sm border-4 border-white">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-800 mb-2">Welcome back, {userName}</h2>
                <p className="text-sm md:text-base text-slate-500 font-medium">Your medical profile is secure and up to date.</p>
              </div>
            </div>
        </div>

        {/* 2. Quick Actions (Simplified for Village Users) */}
        <div className="order-2 md:order-3 md:col-span-3">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-telemedicine-fab', { detail: { action: 'urgent' } }))}
                  className="flex flex-col justify-between p-6 bg-[#ff1c43] hover:bg-red-600 rounded-[16px] shadow-lg shadow-red-500/20 text-white transition-all transform hover:-translate-y-1 group min-h-[160px]"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="text-xl font-bold mb-1 leading-tight">Consult a<br/>Doctor Now</h4>
                    </div>
                  </div>
                  <div className="w-full mt-4 bg-white text-red-600 py-2 rounded-full font-bold text-sm text-center shadow-sm hover:bg-red-50 transition-colors">
                    Connect
                  </div>
                </button>

                <button 
                  onClick={() => window.dispatchEvent(new Event('sd_open_qr_modal'))}
                  className="flex flex-col justify-between p-6 bg-[#00b894] hover:bg-teal-500 rounded-[16px] shadow-lg shadow-teal-500/20 text-white transition-all transform hover:-translate-y-1 group min-h-[160px] relative overflow-hidden"
                >
                  <div className="absolute right-0 bottom-0 opacity-10 w-32 h-32 pointer-events-none">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  </div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform shrink-0 text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="text-lg font-bold mb-1 leading-tight text-white">Show My<br/>QR Code</h4>
                      <p className="text-teal-100 text-[10px] font-bold uppercase tracking-widest mt-1">For hospital check-in</p>
                    </div>
                  </div>
                  <div className="w-full mt-4 bg-white text-teal-600 py-2 rounded-full font-bold text-sm text-center shadow-sm hover:bg-teal-50 transition-colors">
                    View
                  </div>
                </button>
                
                <button 
                  onClick={() => onTabChange('appointments')}
                  className="flex flex-col justify-between p-6 bg-[#6c5ce7] hover:bg-indigo-600 rounded-[16px] shadow-lg shadow-indigo-500/20 text-white transition-all transform hover:-translate-y-1 group min-h-[160px]"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="text-lg font-bold mb-1 leading-tight">My<br/>Appointments</h4>
                      <p className="text-indigo-200 text-xs mt-1">View upcoming</p>
                    </div>
                  </div>
                  <div className="w-full mt-4 bg-white text-indigo-600 py-2 rounded-full font-bold text-sm text-center shadow-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                    Connect <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                </button>
            </div>
        </div>

        {/* 3. Care Team Seating Chart (Full width) */}
        <div className="order-3 md:col-span-3">
            <CareTeamSeatingChart currentUserId={userUid} />
        </div>

        {/* 4. Live Health Feed (Left side desktop) */}
        <div className="order-4 md:col-span-2">
            <LiveHealthFeed userName={userName} userEmail={userUid} />
        </div>

        {/* 5. Invite Widget (Right side desktop) */}
        <div className="order-5 md:col-span-1">
            <InviteWidget userUid={userUid} userName={userName} />
        </div>

        {/* 6. Recent Tickets / Appointments */}
        <div className="order-6 md:col-span-3 mt-4">
            <div className="bg-white/40 backdrop-blur-xl rounded-[24px] p-6 shadow-sm border border-white/60">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-bold text-slate-800">Recent Tickets & Appointments</h3>
                    <button onClick={() => onTabChange('appointments')} className="text-sm font-bold text-teal-600 hover:text-teal-700">View All</button>
                </div>
                <PatientAppointments patientId={userUid || ''} />
            </div>
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
      if (hash) {
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
  const [identityData, setIdentityData] = useState<any>({
    profilePhoto: "",
    prefix: "",
    firstName: "",
    middleName: "",
    lastName: "",
    fullName: "",
    phone: "",
    whatsappNumber: "",
    email: "",
    dob: "",
    age: "",
    sex: "",
    bloodGroup: "",
    languages: "",
    isDoctor: false,
    address: {
      country: "India",
      state: "Odisha",
      district: "",
      block: "",
      cityTownVillage: "",
      streetAddress: "",
      pincode: "",
      mapPin: ""
    }
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
    if (tabId === "add-family") {
      addFamilyMember();
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
      label: `Self - ${identityData.firstName || identityData.fullName || 'User'}`,
      section: "Profile Builder",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    },
    ...familyMembers.map((member, idx) => ({
      id: `family-${idx}`,
      label: (member.relationship && member.firstName) ? `${member.relationship} - ${member.firstName}` : `Add Family Member`,
      section: "Profile Builder",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    })),
    ...(familyMembers.length < 5 ? [{
      id: "add-family",
      label: "+ Add Family Member",
      section: "Profile Builder",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
    }] : []),
    {
      id: "appointments",
      label: "My Appointments",
      section: "Healthcare & Consults",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    },
    {
      id: "telemedicine",
      label: "Video Call",
      section: "Healthcare & Consults",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
    },
    {
      id: "find_doctor",
      label: "Find a Doctor",
      section: "Healthcare & Consults",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
    },
    {
      id: "vault",
      label: "Medical Records",
      section: "Medical Records",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    },
    {
      id: "network",
      label: "My Doctors",
      section: "Network & Financials",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    {
      id: "wallet",
      label: "Wallet & Refunds",
      section: "Network & Financials",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
    },
    {
      id: "bank_details",
      label: "Bank Details (Refunds)",
      section: "Network & Financials",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    {
      id: "support",
      label: "Help & Support",
      section: "Network & Financials",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 100 12.728M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
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

  const updateFamilyMember = (index: number, newData: any) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], ...newData };
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
        uid: userUid || undefined,
        image: identityData.profilePhoto || undefined
      }}
      hideDefaultModulesList={true}
      homeWidget={<UserHomeWidget userName={userName} userUid={userEmail} userRole={userRole} userPhoto={identityData.profilePhoto || null} onTabChange={handleTabChange} />}
    >
      <div className="max-w-4xl mx-auto pb-24">
        
        {activeTab === "settings" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4 flex items-center justify-between">
              Profile Builder - Self
              <AutosaveIndicator status={identitySaveStatus} />
            </h3>

            {/* Profile Photo Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-teal-50 flex items-center justify-center">
                  {identityData.profilePhoto ? (
                    <img src={identityData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-10 h-10 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setIdentityData({...identityData, profilePhoto: event.target.result as string});
                        }
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-bold text-slate-800 text-lg">Profile Picture</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">Upload a square image. A high-quality photo builds trust with doctors during telemedicine calls.</p>
              </div>
            </div>
            
            <UniversalPersonalForm 
              entityData={{...identityData, ...addressData}} 
              onChange={data => {
                const { country, state, district, block, city, pincode, localAddress, mapUrl, mapPin, ...rest } = data;
                setIdentityData(rest);
                setAddressData({ country, state, district, block, city, pincode, localAddress });
              }} 
              portalType="patient" 
            />
          </div>
        )}

        {activeTab.startsWith("family-") && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4 flex items-center justify-between">
              Profile Builder - Family Member
              <AutosaveIndicator status={familySaveStatus} />
            </h3>
            {(() => {
              const idx = parseInt(activeTab.split('-')[1]);
              const member = familyMembers[idx];
              if (!member) return null;
              
              return (
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Relationship <span className="text-rose-500">*</span></label>
                       <select 
                          value={member.relationship || ''} 
                          onChange={e => updateFamilyMember(idx, { relationship: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none"
                       >
                          <option value="">Select Relationship</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Parent">Parent</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Other">Other</option>
                       </select>
                     </div>
                   </div>
                   <UniversalPersonalForm 
                     entityData={member} 
                     onChange={(newData) => updateFamilyMember(idx, newData)} 
                     portalType="patient" 
                     isFamilyMember={true}
                   />
                   <div className="mt-8 flex justify-end">
                      <button onClick={() => {
                        const updated = familyMembers.filter((_, i) => i !== idx);
                        setFamilyMembers(updated);
                        setActiveTab("settings");
                      }} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 text-sm transition-colors">
                        Remove this Member
                      </button>
                   </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">My Appointments</h3>
            <PatientAppointments patientId={userEmail || ''} />
          </div>
        )}

        {activeTab === "wallet" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <WalletDashboard 
               entityId={userUid || ''} 
               userRole="patient" 
               walletBalance={identityData.walletBalance || 0} 
            />
          </div>
        )}

        {activeTab === "bank_details" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Bank Details for Refunds</h3>
            
            <div className="mb-8 bg-emerald-50 border border-emerald-200 p-6 rounded-2xl">
              <h4 className="text-emerald-800 font-bold mb-2">Refund Information</h4>
              <p className="text-sm text-emerald-700">Add your bank details so we can process instant refunds for cancelled consultations directly to your account.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                  Account Holder Name
                </label>
                <input 
                  type="text" 
                  value={identityData.bankAccountName || ''}
                  onChange={e => setIdentityData({...identityData, bankAccountName: e.target.value})}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl px-5 py-3.5 shadow-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                  Bank Name
                </label>
                <input 
                  type="text" 
                  value={identityData.bankName || ''}
                  onChange={e => setIdentityData({...identityData, bankName: e.target.value})}
                  placeholder="e.g. HDFC Bank"
                  className="w-full bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl px-5 py-3.5 shadow-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                  Account Number
                </label>
                <input 
                  type="password" 
                  value={identityData.bankAccountNumber || ''}
                  onChange={e => setIdentityData({...identityData, bankAccountNumber: e.target.value})}
                  placeholder="14-digit Account No."
                  className="w-full bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl px-5 py-3.5 shadow-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                  IFSC Code
                </label>
                <input 
                  type="text" 
                  value={identityData.bankIfscCode || ''}
                  onChange={e => setIdentityData({...identityData, bankIfscCode: e.target.value.toUpperCase()})}
                  placeholder="e.g. HDFC0001234"
                  className="w-full bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl px-5 py-3.5 shadow-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                  UPI ID (Optional)
                </label>
                <input 
                  type="text" 
                  value={identityData.bankUpiId || ''}
                  onChange={e => setIdentityData({...identityData, bankUpiId: e.target.value})}
                  placeholder="e.g. patient@upi"
                  className="w-full bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl px-5 py-3.5 shadow-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
                />
              </div>
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

        {activeTab === "support" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <SupportDashboard userRole="patient" userName={identityData.fullName || identityData.firstName} />
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
