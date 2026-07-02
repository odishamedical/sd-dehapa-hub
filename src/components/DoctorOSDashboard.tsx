"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDocs, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import DigitalRxPad from '@/components/DigitalRxPad';
import SecureMedicalVault from '@/components/SecureMedicalVault';
import DoctorV2Forms from '@/components/DoctorV2Forms';
import IncomingPingWidget from '@/components/IncomingPingWidget';

const faqData = [
  {
    category: "Configuration",
    question: "What is the Clinic Profile page used for?",
    answer: "This is the core onboarding page. You use this to fill out your public-facing details (Name, Specializations, Consultation Fees, Available Timings, and Bank Details). You must reach 100% completion to unlock premium features."
  },
  {
    category: "Configuration",
    question: "How do I add Staff & Receptionists?",
    answer: "This page allows you to add secondary users (like a clinic receptionist) who can log in and manage the Live Queue or appointments on your behalf. It's the logical next step after completing your profile."
  },
  {
    category: "Clinical Workspace",
    question: "How does the Live Queue work?",
    answer: "The Live Queue is your real-time patient token management system. You or your receptionist can use this to mark patients as 'In Consultation', 'Completed', or to add Walk-in patients. It acts as your digital waiting room."
  },
  {
    category: "Clinical Workspace",
    question: "When should I use the Smart Calendar?",
    answer: "The Smart Calendar provides a view of all your upcoming advance bookings and appointments. Use it primarily for future planning, blocking out vacation days, or seeing tomorrow's workload."
  },
  {
    category: "Clinical Workspace",
    question: "What is the Telemedicine Hub?",
    answer: "The Telemedicine Hub is your central command for conducting video and audio consultations directly with patients."
  },
  {
    category: "Patient Management",
    question: "What is the 'My Network' tool?",
    answer: "My Network is a Customer Relationship Management (CRM) tool where you can view all patients who have connected with your profile via QR code or past visits. It helps you see your growing patient base and send bulk health updates."
  },
  {
    category: "Patient Management",
    question: "How do I use the Patient EMR?",
    answer: "The Electronic Medical Records (EMR) system is a highly secure search engine for past medical records. You can pull up any patient's previous prescriptions, lab reports, and consultation notes, which is essential for follow-up visits."
  },
  {
    category: "Financial & Admin",
    question: "What is the Digital Register?",
    answer: "The Digital Register is a logbook of every single transaction and completed consultation. It completely replaces the physical paper register clinics traditionally use to track daily and weekly patient volume."
  },
  {
    category: "Financial & Admin",
    question: "How do I track Payouts & Billing?",
    answer: "The Payouts & Billing page is your financial dashboard where you track how much money you have earned through the DehaPa platform, pending settlements, and download tax reports."
  }
];

export default function DoctorOSDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showAddWalkIn, setShowAddWalkIn] = useState(false);
  const [activeConsult, setActiveConsult] = useState<any>(null);

  // Entity state for Profile Builder & Vault
  const [entityData, setEntityData] = useState<any>({});
  const [entityDocId, setEntityDocId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [settingsTab, setSettingsTab] = useState("identity");

  // Live Data State
  const [queue, setQueue] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      const role = localStorage.getItem("sd_current_user_role");
      
      if (!email || (role !== "doctor" && role !== "super_admin")) {
        window.location.href = "/login";
        return;
      }
      setUserEmail(email);
      setUserName(name || email.split("@")[0]);
      
      const hash = window.location.hash.replace("#", "");
      if (hash) setActiveTab(hash);
      
      fetchEntity(email);
    }
  }, []);

  const fetchEntity = async (email: string) => {
    try {
      const q = query(collection(db, "directory"), where("ownerEmail", "==", email));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setEntityDocId(docSnap.id);
        setEntityData({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (err) {
      console.error("Error fetching entity:", err);
    }
  };

  // Autosave for Settings (DoctorV2Forms)
  useEffect(() => {
    if (!entityDocId) return;
    setSaveStatus("saving");
    const timeout = setTimeout(async () => {
      try {
        const docRef = doc(db, 'directory', entityDocId);
        await updateDoc(docRef, entityData);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } catch (err) {
        setSaveStatus("error");
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [entityData, entityDocId]);

  // Live Firebase Listeners
  useEffect(() => {
    if (!entityData?.id) return;
    
    // Listen to live queue
    const qQueue = query(collection(db, "queue"), where("doctorId", "==", entityData.id));
    const unsubQueue = onSnapshot(qQueue, (snap) => {
      const qData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQueue(qData);
    });

    // Listen to live appointments
    const qAppts = query(collection(db, "appointments"), where("doctorId", "==", entityData.id));
    const unsubAppts = onSnapshot(qAppts, (snap) => {
      const aData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(aData);
    });

    // Listen to live transactions
    const qTrans = query(collection(db, "transactions"), where("doctorId", "==", entityData.id));
    const unsubTrans = onSnapshot(qTrans, (snap) => {
      const tData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(tData);
    });

    return () => {
      unsubQueue();
      unsubAppts();
      unsubTrans();
    };
  }, [entityData?.id]);

  const handleAcceptPing = (request: any) => {
    // Transform ping request into activeConsult queue item
    const newPatient = {
      id: request.id,
      name: request.patientName || "Unknown Patient",
      age: "--",
      sex: "--",
      mode: "Video Call",
      time: "Just now",
      status: "In Lobby",
      type: "online",
      phone: ""
    };
    
    // Switch to queue tab and open rx pad immediately with video shell
    setActiveTab("queue");
    setActiveConsult(newPatient);
  };

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    window.history.pushState(null, "", `#${id}`);
  };

  // Calculate Profile Completion
  const getProfileProgress = () => {
    if (!entityData || !entityData.id) return 0;
    let completed = 0;
    const requiredFields = [
      'name', 'primarySpecialty', 'clinicName', 'phone', 
      'state', 'district', 'block', 'address',
      'walkInFee', 'videoFee'
    ];
    requiredFields.forEach(field => {
      if (entityData[field]) completed++;
    });
    return Math.round((completed / requiredFields.length) * 100);
  };
  
  const progress = getProfileProgress();
  const isFullySetup = progress >= 100 || (entityData && entityData.verified);

  // Let users freely navigate the sidebar to see the locked features as teasers.
  // We handle the lockout in the main render block.

  const doctorTabs: DashboardTab[] = [
    {
      id: "settings",
      label: "Clinic Profile",
      section: "Configuration",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    },
    {
      id: "staff",
      label: "Staff & Receptionists",
      section: "Configuration",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    },
    {
      id: "queue",
      label: "Live Queue",
      section: "Clinical Workspace",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    {
      id: "calendar",
      label: "Smart Calendar",
      section: "Clinical Workspace",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    },
    {
      id: "telemedicine",
      label: "Telemedicine Hub",
      section: "Clinical Workspace",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
    },
    {
      id: "network",
      label: "My Network",
      section: "Patient Management",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
    },
    {
      id: "patients",
      label: "Patient EMR",
      section: "Patient Management",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    },
    {
      id: "register",
      label: "Digital Register",
      section: "Financial & Admin",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
    },
    {
      id: "payouts",
      label: "Payouts & Billing",
      section: "Financial & Admin",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    }
  ];

  // Show all tabs so the user knows what features exist!
  const availableTabs = doctorTabs;

  if (!isMounted) return null;

  const getLockedFeatureContent = (tabId: string) => {
    switch (tabId) {
      case 'queue':
        return {
          title: "Live Queue",
          description: "Manage walk-ins and active consultations in real time. Track waiting times, issue digital tokens, and streamline your clinic flow.",
          benefits: ["✓ Real-time patient tracking", "✓ Digital token generation", "✓ Walk-in management"]
        };
      case 'calendar':
        return {
          title: "Smart Calendar",
          description: "Never miss a booking. Manage your time, block out surgery hours, and let patients book you directly.",
          benefits: ["✓ Automated patient bookings", "✓ Surgery & vacation blocks", "✓ Daily schedule overview"]
        };
      case 'patients':
        return {
          title: "Patient EMR",
          description: "Access complete medical histories. View past prescriptions, lab reports, and consultation notes securely.",
          benefits: ["✓ Global health records", "✓ Secure data storage", "✓ Instant patient history"]
        };
      case 'register':
        return {
          title: "Digital Register",
          description: "Automate your daily accounting. Track every consultation, offline payment, and generate instant reports.",
          benefits: ["✓ Daily financial ledger", "✓ Exportable CSV reports", "✓ Cash & online tracking"]
        };
      case 'network':
        return {
          title: "My Network",
          description: "Grow your patient base. Send bulk health updates, SMS broadcasts, and manage your connected patients.",
          benefits: ["✓ Bulk SMS broadcasts", "✓ Patient CRM & tagging", "✓ Campaign management"]
        };
      case 'telemedicine':
        return {
          title: "Telemedicine Hub",
          description: "Conduct secure video and audio consultations directly from your dashboard.",
          benefits: ["✓ HD Video consultations", "✓ Secure chat & file sharing", "✓ Integrated billing"]
        };
      case 'payouts':
        return {
          title: "Payouts & Billing",
          description: "Track your earnings. View pending settlements, platform revenue, and download tax reports easily.",
          benefits: ["✓ Earnings dashboard", "✓ Automated bank settlements", "✓ Tax report generation"]
        };
      case 'staff':
        return {
          title: "Staff & Receptionists",
          description: "Delegate tasks securely. Let your receptionist manage the queue and calendar while you focus on care.",
          benefits: ["✓ Role-based access control", "✓ Receptionist accounts", "✓ Activity logging"]
        };
      default:
        return {
          title: "Premium Module",
          description: "This powerful module is part of the DehaPa Premium Suite.",
          benefits: ["✓ Premium features", "✓ Advanced analytics", "✓ Priority support"]
        };
    }
  };

  return (
    <DashboardLayout 
      roleName="Doctor OS" 
      tabs={availableTabs} 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      hideDefaultModulesList={true}
      userProfile={{
        name: userName || "Dr. Name",
        email: userEmail || "",
        avatar: "",
        isVerified: true
      }}
    >
      <IncomingPingWidget 
        doctorId={entityData?.id || ""} 
        doctorSpecialty={entityData?.primarySpecialty || ""} 
        onAcceptPing={handleAcceptPing} 
      />

      <div className="max-w-7xl space-y-6 pb-20 md:pb-8">
        
        {/* TAB ROUTING */}
        
        {/* TAB ROUTING */}
        
        <div className="relative w-full min-h-[600px]">
          {/* Top Banner & Educational Lock Overlay */}
          {!isFullySetup && activeTab !== "settings" && activeTab !== "home" && activeTab !== "faq" && (() => {
            const feature = getLockedFeatureContent(activeTab);
            return (
              <div className="absolute inset-0 z-50 flex flex-col items-center p-6 bg-slate-900/5 backdrop-blur-[6px] rounded-[2rem] overflow-hidden">
                {/* The Red Top Banner as requested by user */}
                <div className="w-full bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl p-4 shadow-lg shadow-rose-500/20 text-white flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                   <div className="flex items-center gap-4 relative z-10">
                     <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-md">
                       <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                     </div>
                     <div>
                       <h3 className="font-black text-lg md:text-xl tracking-tight">Dehapa feature: {feature.title}</h3>
                       <p className="text-rose-100 text-sm font-medium mt-0.5">This module will be unlocked when you complete the previous step.</p>
                     </div>
                   </div>
                   <button onClick={() => setActiveTab('settings')} className="shrink-0 px-6 py-2.5 bg-white text-rose-600 hover:bg-rose-50 font-black rounded-xl shadow-sm transition-colors text-sm flex items-center gap-2 relative z-10">
                     Resume Profile Setup <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md text-xs">{progress}%</span>
                   </button>
                </div>
                
                {/* The Educational Spotlight Card (Floating in center over the blurred UI) */}
                <div className="mt-auto mb-auto bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] max-w-2xl w-full border border-slate-200/60 animate-in zoom-in-95 duration-700 delay-150 relative z-10">
                  <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest rounded-lg mb-4">Why use this?</div>
                  <h2 className="text-3xl font-black text-slate-900 mb-4 font-display">How {feature.title} Works</h2>
                  <p className="text-slate-600 text-lg leading-relaxed mb-8">{feature.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-700 leading-tight">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button onClick={() => setActiveTab('settings')} className="w-full py-4 bg-slate-900 text-white font-black text-lg rounded-xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-transform">
                    Unlock {feature.title} Now
                  </button>
                </div>
              </div>
            );
          })()}
          
          <div className={`transition-all duration-500 ${!isFullySetup && activeTab !== "settings" && activeTab !== "home" && activeTab !== "faq" ? "pointer-events-none select-none opacity-50 grayscale-[0.3]" : ""}`}>
        
        {activeTab === "home" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Premium Welcome Banner */}
            <div className="relative rounded-[2rem] bg-gradient-to-br from-indigo-900 via-slate-900 to-teal-900 p-8 md:p-12 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/30 rounded-full blur-[80px]"></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-[80px]"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Welcome back, {userName}</h2>
                <p className="text-indigo-200 text-lg max-w-xl">Your active operations and live patient tracking are running smoothly.</p>
              </div>
            </div>

            {/* Quick Action Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              
              {/* Live Queue Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">Live Queue</h3>
                </div>
                <div className="px-5 py-6 flex-1 flex flex-col justify-center bg-gradient-to-b from-white to-slate-50/50">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">{queue.length}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patients</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{queue.length > 0 ? "Live Updates Active" : "No patients waiting"}</p>
                </div>
                <div className="p-4 bg-white border-t border-slate-100">
                  <button onClick={() => handleTabChange('queue')} className="w-full py-2.5 bg-[#FF3B30] hover:bg-[#E0352B] text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-red-500/20 text-center">
                    View Queue
                  </button>
                </div>
              </div>

              {/* Smart Calendar Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">Calendar</h3>
                </div>
                <div className="px-5 py-6 flex-1 flex flex-col justify-center bg-gradient-to-b from-white to-slate-50/50">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">{appointments.length}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Appts Today</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium truncate">{appointments.length > 0 ? "Live Appointments Syncing" : "Schedule is clear"}</p>
                </div>
                <div className="p-4 bg-white border-t border-slate-100">
                  <button onClick={() => handleTabChange('calendar')} className="w-full py-2.5 bg-[#007AFF] hover:bg-[#0062CC] text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-blue-500/20 text-center">
                    Add Event
                  </button>
                </div>
              </div>

              {/* Patient EMR Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#00C7BE] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">Patient EMR</h3>
                </div>
                <div className="px-5 py-6 flex-1 flex flex-col justify-center bg-gradient-to-b from-white to-slate-50/50">
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Search and access comprehensive patient medical records, history, and test results.</p>
                </div>
                <div className="p-4 bg-white border-t border-slate-100">
                  <button onClick={() => handleTabChange('patients')} className="w-full py-2.5 bg-[#00C7BE] hover:bg-[#009F98] text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-teal-500/20 text-center">
                    Open EMR
                  </button>
                </div>
              </div>

              {/* Digital Register Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#FF9500] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">Register</h3>
                </div>
                <div className="px-5 py-6 flex-1 flex flex-col justify-center bg-gradient-to-b from-white to-slate-50/50">
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Manage daily billing, transaction logs, and patient visit ledgers seamlessly.</p>
                </div>
                <div className="p-4 bg-white border-t border-slate-100">
                  <button onClick={() => handleTabChange('register')} className="w-full py-2.5 bg-[#FF9500] hover:bg-[#CC7700] text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-amber-500/20 text-center">
                    Export Report
                  </button>
                </div>
              </div>

              {/* Clinic Profile Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow md:col-span-2 xl:col-span-1">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#5856D6] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">Clinic Profile</h3>
                </div>
                <div className="px-5 py-6 flex-1 flex flex-col justify-center bg-gradient-to-b from-white to-slate-50/50">
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Customize your public clinic information, services, and operating hours.</p>
                </div>
                <div className="p-4 bg-white border-t border-slate-100">
                  <button onClick={() => handleTabChange('settings')} className="w-full py-2.5 bg-[#5856D6] hover:bg-[#4644AB] text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-indigo-500/20 text-center">
                    Edit Profile
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
        
        {activeTab === "queue" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 font-display">Live Queue</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your walk-ins and virtual consultations</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-slate-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  Scan QR
                </button>
                <button 
                  onClick={() => setShowAddWalkIn(true)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Walk-in
                </button>
              </div>
            </div>

            {/* QUEUE CONTENT */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <div className="col-span-1">No.</div>
                <div className="col-span-3">Patient Name</div>
                <div className="col-span-2">Mode</div>
                <div className="col-span-2">Wait Time</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {queue.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    <p className="font-bold text-slate-600">No patients in queue</p>
                    <p className="text-sm mt-1">The live queue is currently empty.</p>
                  </div>
                ) : queue.map((patient, idx) => (
                  <div key={patient.id} className="p-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors">
                    <div className="hidden md:block col-span-1 text-slate-400 font-medium text-sm">#{idx + 1}</div>
                    
                    <div className="col-span-12 md:col-span-3 flex items-center w-full md:w-auto">
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm mr-3 shrink-0">
                        {patient.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{patient.name || "Unknown"}</div>
                        <div className="text-xs text-slate-500">{patient.age || "--"}y • {patient.sex || "--"} {patient.phone && `• ${patient.phone}`}</div>
                      </div>
                    </div>
                    
                    <div className="col-span-12 md:col-span-2 w-full md:w-auto flex items-center gap-2">
                      <span className="md:hidden text-xs font-bold text-slate-400 uppercase">Mode:</span>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${patient.type === 'online' || patient.mode === 'Video Call' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                        {patient.mode || "Walk-in"}
                      </span>
                    </div>
                    
                    <div className="col-span-12 md:col-span-2 w-full md:w-auto flex items-center gap-2">
                      <span className="md:hidden text-xs font-bold text-slate-400 uppercase">Wait:</span>
                      <div className="text-sm text-amber-600 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {patient.time || "Just now"}
                      </div>
                    </div>
                    
                    <div className="col-span-12 md:col-span-2 w-full md:w-auto flex items-center gap-2">
                      <span className="md:hidden text-xs font-bold text-slate-400 uppercase">Status:</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${patient.status === 'In Lobby' ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`}></span>
                        <span className="text-sm text-slate-600 font-medium">{patient.status || "Waiting"}</span>
                      </div>
                    </div>
                    
                    <div className="col-span-12 md:col-span-2 w-full flex justify-end gap-2 flex-wrap md:flex-nowrap">
                       {(patient.mode === 'Walk-in' || !patient.mode) && (
                         <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200 shadow-sm" onClick={() => window.print()}>
                           🖨️ Token
                         </button>
                       )}
                       <button onClick={() => setActiveConsult(patient)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                         Vitals
                       </button>
                       <button onClick={() => setActiveConsult(patient)} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
                         Consult
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "calendar" && (
           <div className="space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h1 className="text-2xl font-bold text-slate-900 font-display">Smart Calendar</h1>
                 <p className="text-slate-500 text-sm mt-1">Manage your clinic hours, surgery blocks, and appointments</p>
               </div>
               <div className="flex gap-2">
                 <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors">
                   Today
                 </button>
                 <button className="px-4 py-2 bg-teal-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                   Block Time
                 </button>
               </div>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
               {/* Mini Calendar Sidebar */}
               <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 p-6 bg-slate-50">
                 <div className="font-bold text-slate-900 mb-4">July 2026</div>
                 <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                   <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                 </div>
                 <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
                   {Array.from({length: 31}).map((_, i) => (
                     <div key={i} className={`p-1.5 rounded-lg cursor-pointer ${i+1 === 2 ? 'bg-teal-600 text-white font-bold shadow-sm shadow-teal-200' : 'text-slate-700 hover:bg-slate-200'}`}>
                       {i + 1}
                     </div>
                   ))}
                 </div>
               </div>

               {/* Day View */}
               <div className="flex-1 p-6">
                 <div className="text-lg font-bold text-slate-900 mb-6">Thursday, July 2, 2026</div>
                 <div className="space-y-4 relative">
                    <div className="absolute left-16 top-0 bottom-0 w-px bg-slate-100"></div>
                    
                    {appointments.length === 0 ? (
                      <div className="flex gap-4 items-start relative z-10 py-8">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-8 border-dashed text-center text-slate-500">
                          <p className="font-bold">No appointments scheduled</p>
                          <p className="text-xs text-slate-400 mt-1">Your calendar is currently clear.</p>
                        </div>
                      </div>
                    ) : appointments.map((appt, idx) => (
                      <div key={appt.id || idx} className="flex gap-4 items-start relative z-10">
                        <div className="w-16 text-right text-xs font-bold text-slate-400 pt-3">{appt.time || "TBD"}</div>
                        <div className={`flex-1 ${appt.type === 'online' ? 'bg-indigo-50 border border-indigo-100' : 'bg-teal-50 border border-teal-100'} rounded-xl p-4 shadow-sm`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-bold ${appt.type === 'online' ? 'text-indigo-900' : 'text-teal-900'} text-sm`}>{appt.title || "Appointment"}</h4>
                            <span className={`${appt.type === 'online' ? 'bg-indigo-200 text-indigo-800' : 'bg-teal-200 text-teal-800'} text-[10px] uppercase font-bold px-2 py-0.5 rounded-md`}>
                              {appt.type || "General"}
                            </span>
                          </div>
                          <p className={`text-xs ${appt.type === 'online' ? 'text-indigo-700' : 'text-teal-700'}`}>{appt.duration || "1 hr"}</p>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             </div>
           </div>
        )}

        {activeTab === "patients" && (
           <div className="space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h1 className="text-2xl font-bold text-slate-900 font-display">Patient EMR & Vault</h1>
                 <p className="text-slate-500 text-sm mt-1">Access global health records via Dehapa QR</p>
               </div>
             </div>
             <SecureMedicalVault providerId={entityData?.id || ""} providerName={entityData?.name || userName} />
           </div>
        )}
        
        {activeTab === "register" && (
           <div className="space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h1 className="text-2xl font-bold text-slate-900 font-display">Digital Clinic Register</h1>
                 <p className="text-slate-500 text-sm mt-1">Daily patient ledger and financial summary</p>
               </div>
               <div className="flex gap-2">
                 <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-slate-200 transition-colors">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                   Export CSV
                 </button>
                 <button className="px-4 py-2 bg-teal-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                   Scan Document
                 </button>
               </div>
             </div>

             {/* Financial Summary Widgets */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Patients</p>
                    <h3 className="text-3xl font-bold text-slate-900">{transactions.length}</h3>
                  </div>
                 <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                 </div>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Telemedicine</p>
                    <h3 className="text-3xl font-bold text-slate-900">₹{transactions.filter(t => t.mode === 'Telemedicine').reduce((acc, curr) => acc + (curr.amount || 0), 0)}</h3>
                  </div>
                 <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                   <span className="font-bold text-xl">₹</span>
                 </div>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Offline Cash</p>
                    <h3 className="text-3xl font-bold text-slate-900">₹{transactions.filter(t => t.mode !== 'Telemedicine').reduce((acc, curr) => acc + (curr.amount || 0), 0)}</h3>
                  </div>
                 <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
               </div>
             </div>

             {/* Ledger Table */}
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                 <input type="date" className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 outline-none focus:border-teal-500" defaultValue="2026-07-02" />
                 <div className="relative">
                   <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                   <input type="text" placeholder="Search patient..." className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-teal-500 w-64" />
                 </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-white border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                       <th className="p-4 whitespace-nowrap">Reg No.</th>
                       <th className="p-4 whitespace-nowrap">Time</th>
                       <th className="p-4 whitespace-nowrap">Patient Name</th>
                       <th className="p-4 whitespace-nowrap">Mode</th>
                       <th className="p-4 whitespace-nowrap">Status</th>
                       <th className="p-4 whitespace-nowrap text-right">Fee</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">No transactions recorded yet.</td>
                        </tr>
                      ) : transactions.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-sm font-bold text-slate-600">{row.reg || `REG-${i+1}`}</td>
                          <td className="p-4 text-sm text-slate-500">{row.time || "TBD"}</td>
                          <td className="p-4 text-sm font-bold text-slate-900">{row.name || "Unknown Patient"}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${row.mode === 'Telemedicine' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                              {row.mode || "Walk-in"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {row.status || "Completed"}
                            </span>
                          </td>
                          <td className="p-4 text-sm font-bold text-slate-600 text-right">₹{row.amount || "0"}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
             </div>
           </div>
        )}

        {activeTab === "settings" && (
           <div className="space-y-6">
             {!isFullySetup && (
               <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center">
                 <div className="w-20 h-20 shrink-0">
                   {/* Circular Progress */}
                   <svg viewBox="0 0 36 36" className="w-full h-full text-teal-500">
                      <path className="text-teal-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-teal-500 transition-all duration-1000 ease-out" strokeDasharray={`${progress}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center font-bold text-teal-800 text-sm mt-6 ml-6">{progress}%</div>
                 </div>
                 <div className="flex-1">
                   <h2 className="text-xl font-black text-slate-900 mb-1">Welcome to DehaPa, {userName}! Let's get you set up.</h2>
                   <p className="text-slate-600 text-sm">Please complete your clinic profile and pricing setup. Once you reach 100%, your public profile will go live and your dashboard features will unlock.</p>
                 </div>
               </div>
             )}

             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h1 className="text-2xl font-bold text-slate-900 font-display">Clinic Profile Builder</h1>
                 <p className="text-slate-500 text-sm mt-1">Configure your public page and payouts</p>
               </div>
               <div className="flex gap-4 items-center">
                  {saveStatus === "saving" && <span className="text-sm font-bold text-teal-600 animate-pulse">Autosaving...</span>}
                  {saveStatus === "saved" && <span className="text-sm font-bold text-emerald-500">✓ Saved</span>}
                  
                  {isFullySetup && !entityData?.verified && (
                    <button onClick={() => setEntityData({...entityData, verified: true})} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm">
                      Publish Profile
                    </button>
                  )}
                  {entityData?.verified && (
                    <div className="px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold uppercase flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live / Published
                    </div>
                  )}
               </div>
             </div>
             
             <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
               {[
                 { id: "identity", label: "Identity & Media" },
                 { id: "professional", label: "Professional Bio" },
                 { id: "consultation_setup", label: "Consultations" },
                 { id: "location", label: "Clinic Location" },
               ].map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setSettingsTab(tab.id)}
                   className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${settingsTab === tab.id ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                 >
                   {tab.label}
                 </button>
               ))}
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
               <DoctorV2Forms activeTab={settingsTab} entityData={entityData} setEntityData={setEntityData} />
             </div>
           </div>
        )}

        {/* My Network View (UI Only) */}
        {activeTab === "network" && (
           <div className="space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h1 className="text-2xl font-bold text-slate-900 font-display">My Network</h1>
                 <p className="text-slate-500 text-sm mt-1">Manage and engage with your connected patient base</p>
               </div>
               <div className="flex gap-2">
                 <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm">Import Contacts</button>
                 <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium text-sm shadow-sm">Send Broadcast</button>
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Network</p>
                  <h3 className="text-3xl font-black text-slate-900">2,451</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">New This Month</p>
                  <h3 className="text-3xl font-black text-emerald-600">+128</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 md:col-span-2 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Health Camp Broadcast</h4>
                    <p className="text-sm text-slate-500">Reach all 2,451 patients instantly via SMS & App Notification.</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm">Draft Message</button>
                </div>
             </div>
             
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                 <div className="relative">
                   <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                   <input type="text" placeholder="Search by name, phone, or tags..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none w-80" />
                 </div>
                 <div className="flex gap-2">
                   <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none">
                     <option>All Tags</option>
                     <option>Diabetic</option>
                     <option>Hypertension</option>
                   </select>
                 </div>
               </div>
               
               <div className="p-6">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[1,2,3,4,5,6,7,8].map(i => (
                     <div key={i} className="border border-slate-100 rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xl mb-3">
                          {String.fromCharCode(64 + i)}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">Patient Name</h4>
                        <p className="text-xs text-slate-500 mb-3">+91 98765 43210</p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">VIP</span>
                          <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">Cardiac</span>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </div>
        )}

        {/* Skeleton Temptation UIs for Unbuilt Tabs */}
        {["telemedicine", "payouts", "staff"].includes(activeTab) && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
               <div>
                 <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
                 <div className="h-4 w-64 bg-slate-100 rounded-md animate-pulse"></div>
               </div>
               <div className="flex gap-3">
                 <div className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse"></div>
                 <div className="h-10 w-32 bg-indigo-100 rounded-xl animate-pulse"></div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="h-4 w-24 bg-slate-100 rounded mb-4 animate-pulse"></div>
                  <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
                  <div className="h-3 w-40 bg-slate-50 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
               <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                 <div className="h-10 w-64 bg-slate-50 rounded-xl animate-pulse"></div>
                 <div className="h-10 w-32 bg-slate-50 rounded-xl animate-pulse"></div>
               </div>
               <div className="p-0">
                 {[1, 2, 3, 4, 5].map(i => (
                   <div key={i} className="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50/50">
                     <div className="flex items-center gap-4">
                       <div className="h-12 w-12 bg-slate-100 rounded-full animate-pulse"></div>
                       <div>
                         <div className="h-5 w-32 bg-slate-200 rounded mb-1 animate-pulse"></div>
                         <div className="h-3 w-20 bg-slate-100 rounded animate-pulse"></div>
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse"></div>
                       <div className="h-8 w-8 bg-slate-50 rounded-lg animate-pulse"></div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* FAQ View */}
        {activeTab === "faq" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="mb-8 text-center pt-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Doctor OS Dashboard FAQ</h2>
              <p className="text-slate-500 mt-2 text-lg">Everything you need to know about navigating your premium operating system.</p>
            </div>
            
            <div className="space-y-4">
              {faqData.map((faq, idx) => (
                <details key={idx} className="group bg-slate-50 rounded-2xl border border-transparent hover:bg-slate-100 open:bg-white open:border-slate-200 transition-all shadow-sm">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-slate-800 text-[15px]">
                    {faq.question}
                    <span className="transition-transform duration-300 group-open:rotate-180 bg-white group-open:bg-slate-100 p-1 rounded-full shadow-sm">
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed text-sm animate-in fade-in duration-300">
                    <div className="h-px bg-slate-100 w-full mb-4"></div>
                    <p className="font-black text-slate-800 mb-2 uppercase text-[10px] tracking-widest text-teal-600 bg-teal-50 inline-block px-2 py-1 rounded-lg">{faq.category}</p>
                    <p>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
          </div>
        </div>

      </div>

      {/* Add Walk-in Modal */}
      {showAddWalkIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Add Walk-in Patient</h3>
              <button onClick={() => setShowAddWalkIn(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone Number (Mapping ID)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-medium">+91</span>
                  <input type="tel" className="w-full bg-white border border-slate-200 rounded-r-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="Enter patient mobile" />
                </div>
                <p className="text-xs text-slate-400 mt-2">If number is registered with Dehapa, profile will auto-sync.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="Patient Name" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Age</label>
                     <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="e.g. 34" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Sex</label>
                     <select className="w-full bg-white border border-slate-200 rounded-xl px-2 py-3 text-slate-900 focus:border-teal-500 outline-none">
                       <option>M</option>
                       <option>F</option>
                       <option>O</option>
                     </select>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowAddWalkIn(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => setShowAddWalkIn(false)} className="px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-sm shadow-teal-200 hover:bg-teal-700 transition-colors">Add to Queue</button>
            </div>
          </div>
        </div>
      )}
      {/* Digital Rx Pad Overlay */}
      {activeConsult && (
        <DigitalRxPad patient={activeConsult} onClose={() => setActiveConsult(null)} />
      )}
    </DashboardLayout>
  );
}
