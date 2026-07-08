"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDocs, updateDoc, collection, query, where, onSnapshot, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import MyNetworkHub from './network/MyNetworkHub';
import DigitalRxPad from '@/components/DigitalRxPad';
import SecureMedicalVault from '@/components/SecureMedicalVault';
import DoctorV2Forms from '@/components/DoctorV2Forms';
import IncomingPingWidget from '@/components/IncomingPingWidget';
import ChatInboxWidget from '@/components/chat/ChatInboxWidget';
import WalletDashboard from '@/components/payments/WalletDashboard';
import SupportDashboard from '@/components/SupportDashboard';
import { VaultService } from '@/lib/vault.service';
import BillingInvoice from '@/components/BillingInvoice';

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
  const [userRole, setUserRole] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showAddWalkIn, setShowAddWalkIn] = useState(false);
  const [activeConsult, setActiveConsult] = useState<any>(null);
  const [godMode, setGodMode] = useState(false);
  
  // Walk-in form state
  const [walkInName, setWalkInName] = useState("");
  const [walkInAge, setWalkInAge] = useState("");
  const [walkInSex, setWalkInSex] = useState("M");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  // Entity state for Profile Builder & Vault
  const [entityData, setEntityData] = useState<any>({});
  const [entityDocId, setEntityDocId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Live Data State
  const [queue, setQueue] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [billingPatient, setBillingPatient] = useState<any>(null);

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
      setUserRole(role || "");
      
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

  const handleAddWalkIn = async () => {
    if (!walkInName || !entityData?.id) return;
    try {
      await addDoc(collection(db, "queue"), {
        doctorId: entityData.id,
        name: walkInName,
        age: walkInAge || "--",
        sex: walkInSex,
        phone: walkInPhone || "",
        mode: "Walk-in",
        type: "offline",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "Waiting",
        createdAt: serverTimestamp()
      });
      setShowAddWalkIn(false);
      setWalkInName("");
      setWalkInAge("");
      setWalkInSex("M");
      setWalkInPhone("");
    } catch (err) {
      console.error("Error adding walk-in:", err);
    }
  };

  const handleSaveRx = async (patient: any, pdfBlob?: Blob) => {
    if (!entityData?.id) return;
    try {
      const fee = patient.type === "online" ? (entityData.videoFee || 500) : (entityData.walkInFee || 500);
      await addDoc(collection(db, "transactions"), {
        doctorId: entityData.id,
        patientId: patient.id || "walk-in",
        name: patient.name || "Unknown Patient",
        amount: Number(fee),
        method: patient.type === "online" ? "online" : "cash",
        mode: patient.mode || "Walk-in",
        status: "Completed",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });

      // Upload PDF to Vault
      if (pdfBlob) {
        // If walk-in, save to doctor's own vault. If online, send to patient.
        const recipientId = patient.type === 'online' ? patient.id : entityData.id;
        
        await VaultService.directSendDocument(
          entityData.id,
          entityData.name || "Dehapa Doctor",
          recipientId,
          pdfBlob,
          {
            patientName: patient.name || "Walk-in Patient",
            patientId: patient.id || "walk-in",
            recordType: 'prescription',
            fileName: `Rx_${patient.name}_${new Date().toISOString().split('T')[0]}.pdf`,
            accessLevel: 'permanent'
          }
        );
        
        // After upload, trigger the B2B Forward Modal via a custom event
        const event = new CustomEvent('open-vault-forward', { detail: patient });
        window.dispatchEvent(event);
      }

      if (patient.id && !patient.id.startsWith("demo")) {
        await deleteDoc(doc(db, "queue", patient.id));
      }
    } catch (e) {
      console.error("Error saving rx:", e);
    }
    setActiveConsult(null);
  };

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    window.history.pushState(null, "", `#${id}`);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "#" + activeTab);
      
      // Auto-open Rx Pad if redirected from Video Room
      const urlParams = new URLSearchParams(window.location.search);
      const rxPatientId = urlParams.get('rx');
      if (rxPatientId && entityData?.id) {
         // Auto create a dummy consult object for the Rx Pad
         setActiveConsult({
           id: rxPatientId,
           name: "Telemedicine Patient",
           age: "--",
           sex: "--",
           mode: "Video Call",
           type: "online"
         });
         // Clean URL
         window.history.replaceState(null, "", window.location.pathname + "#" + activeTab);
      }
    }
  }, [activeTab, entityData?.id]);

  const [chatTargetId, setChatTargetId] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setChatTargetId(e.detail);
      setActiveTab('inbox');
    };
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  const [userUid, setUserUid] = useState<string | null>(null);

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
  const isFullySetup = godMode || progress >= 100 || (entityData && entityData.verified);

  const doctorTabs: DashboardTab[] = [
    {
      id: "identity",
      label: "Personal Information",
      section: "CORE SETUP",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
    },
    {
      id: "professional",
      label: "Professional Bio",
      section: "CORE SETUP",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
    },
    {
      id: "consultation_setup",
      label: "Consultations",
      section: "CORE SETUP",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    },
    {
      id: "location",
      label: "Clinic Location",
      section: "CORE SETUP",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
    },
    {
      id: "bank_details",
      label: "Bank & Payout Details",
      section: "FINANCE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
    },
    {
      id: "staff",
      label: "Staff & Receptionists",
      section: "ADMINISTRATION",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    },
    {
      id: "document_vault",
      label: "Document Vault",
      section: "ADMINISTRATION",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    },
    {
      id: "queue",
      label: "Live Queue",
      section: "DOCTOR WORKSPACE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    {
      id: "calendar",
      label: "Smart Calendar",
      section: "DOCTOR WORKSPACE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    },
    {
      id: "telemedicine",
      label: "Telemedicine Hub",
      section: "DOCTOR WORKSPACE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
    },
    {
      id: "patients",
      label: "My Patients",
      section: "CONNECTIONS & NETWORK",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    {
      id: "b2b_network",
      label: "B2B Network",
      section: "CONNECTIONS & NETWORK",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
    },
    {
      id: "inbox",
      label: "Inbox",
      section: "CONNECTIONS & NETWORK",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
    },
    {
      id: "medical_vault",
      label: "Medical Vault",
      section: "CONNECTIONS & NETWORK",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    },
    {
      id: "register",
      label: "Digital Register",
      section: "DOCTOR WORKSPACE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
    },
    {
      id: "payouts",
      label: "Payouts & Billing",
      section: "FINANCE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    },
    {
      id: "faq",
      label: "Help & Support",
      section: "SUPPORT & UTILITIES",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 100 12.728M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    }
  ];

  const availableTabs = doctorTabs;

  if (!isMounted) return null;

  return (
    <DashboardLayout 
      roleName="Doctor OS" 
      tabs={availableTabs} 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      hideDefaultModulesList={true}
      userProfile={{
        name: entityData?.name || userName || "Doctor Profile",
        subtitle: entityData?.primarySpecialty || "Medical Professional",
        image: entityData?.profileImageUrl || ""
      }}
      godMode={godMode}
      onToggleGodMode={() => setGodMode(!godMode)}
      userRole={userRole}
    >
      <IncomingPingWidget 
        doctorId={entityData?.id || ""} 
        doctorSpecialty={entityData?.primarySpecialty || ""} 
      />

      <div className="max-w-7xl space-y-6 pb-20 md:pb-8">
        
        <div className="relative w-full min-h-[600px]">
          
          <div className="transition-all duration-500">
        
        {activeTab === "home" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative rounded-[2rem] bg-gradient-to-br from-indigo-900 via-slate-900 to-teal-900 p-8 md:p-12 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/30 rounded-full blur-[80px]"></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-[80px]"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Welcome back, {userName}</h2>
                <p className="text-indigo-200 text-lg max-w-xl">Your active operations and live patient tracking are running smoothly.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div 
              onClick={() => setActiveTab("queue")}
              className="bg-white/70 backdrop-blur-xl border border-white/80 p-6 rounded-3xl cursor-pointer hover:shadow-xl transition-all duration-300 group shadow-lg"
            >
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-teal-100 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Live Queue</h3>
              <p className="text-slate-500 text-sm">Manage walk-ins and active consultations in real time.</p>
            </div>

            <div 
              onClick={() => setActiveTab("calendar")}
              className="bg-white/70 backdrop-blur-xl border border-white/80 p-6 rounded-3xl cursor-pointer hover:shadow-xl transition-all duration-300 group shadow-lg"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Calendar</h3>
              <p className="text-slate-500 text-sm">Schedule appointments, block surgery time, and sync.</p>
            </div>

            <div 
              onClick={() => setActiveTab("patients")}
              className="bg-white/70 backdrop-blur-xl border border-white/80 p-6 rounded-3xl cursor-pointer hover:shadow-xl transition-all duration-300 group shadow-lg"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-rose-100 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Patient EMR</h3>
              <p className="text-slate-500 text-sm">Securely access medical histories and patient notes.</p>
            </div>

            <div 
              onClick={() => setActiveTab("register")}
              className="bg-white/70 backdrop-blur-xl border border-white/80 p-6 rounded-3xl cursor-pointer hover:shadow-xl transition-all duration-300 group shadow-lg"
            >
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-amber-100 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Digital Register</h3>
              <p className="text-slate-500 text-sm">Automated daily ledger and financial reporting.</p>
            </div>
            
            </div>
          </div>
        )}
        
        {activeTab === "queue" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white font-display">Live Queue</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your walk-ins and virtual consultations</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white/70 text-slate-700 border border-white/80 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-white shadow-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  Scan QR
                </button>
                <button 
                  onClick={() => setShowAddWalkIn(true)}
                  className="px-4 py-2 bg-[#40807b] hover:bg-[#326662] text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-colors shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Walk-in
                </button>
              </div>
            </div>

            <div className="bg-white/70 border border-white/80 rounded-2xl shadow-lg overflow-hidden backdrop-blur-xl">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-white/40 border-b border-slate-200/50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <div className="col-span-1">No.</div>
                <div className="col-span-3">Patient Name</div>
                <div className="col-span-2">Mode</div>
                <div className="col-span-2">Wait Time</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              <div className="divide-y divide-slate-200/50">
                {queue.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-medium">No patients in queue.</div>
                ) : queue.map((patient, idx) => (
                  <div key={patient.id} className="p-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center hover:bg-white/40 transition-colors">
                    <div className="hidden md:block col-span-1 text-slate-500 font-medium text-sm">#{idx + 1}</div>
                    
                    <div className="col-span-12 md:col-span-3 flex items-center w-full md:w-auto">
                      <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center font-bold text-sm mr-3 shrink-0 shadow-sm">
                        {patient.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{patient.name || "Unknown"}</div>
                        <div className="text-xs text-slate-500">{patient.age || "--"}y • {patient.sex || "--"} {patient.phone && `• ${patient.phone}`}</div>
                      </div>
                    </div>
                    
                    <div className="col-span-12 md:col-span-2 w-full md:w-auto flex items-center gap-2">
                      <span className="md:hidden text-xs font-bold text-slate-500 uppercase">Mode:</span>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${patient.type === 'online' || patient.mode === 'Video Call' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                        {patient.mode || "Walk-in"}
                      </span>
                    </div>
                    
                    <div className="col-span-12 md:col-span-2 w-full md:w-auto flex items-center gap-2">
                      <span className="md:hidden text-xs font-bold text-slate-500 uppercase">Wait:</span>
                      <div className="text-sm text-amber-600 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {patient.time || "Just now"}
                      </div>
                    </div>
                    
                    <div className="col-span-12 md:col-span-2 w-full md:w-auto flex items-center gap-2">
                      <span className="md:hidden text-xs font-bold text-slate-500 uppercase">Status:</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${patient.status === 'In Lobby' ? 'bg-teal-500 animate-pulse shadow-[0_0_5px_rgba(20,184,166,0.5)]' : 'bg-amber-400'}`}></span>
                        <span className="text-sm text-slate-600 font-medium">{patient.status || "Waiting"}</span>
                      </div>
                    </div>
                    
                    <div className="col-span-12 md:col-span-2 w-full flex justify-end gap-2 flex-wrap md:flex-nowrap">
                       {(patient.mode === 'Walk-in' || !patient.mode) && (
                         <button className="px-3 py-1.5 bg-white/70 hover:bg-white text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200 shadow-sm" onClick={() => window.print()}>
                           🖨️ Token
                         </button>
                       )}
                       <button onClick={() => setActiveConsult(patient)} className="px-3 py-1.5 bg-white/70 hover:bg-white text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200 shadow-sm">
                         Vitals
                       </button>
                       <button onClick={async () => {
                         try {
                           if (patient.id && !patient.id.startsWith("demo")) {
                             await updateDoc(doc(db, 'queue', patient.id), { status: "In Consultation" });
                           }
                         } catch (e) {
                           console.error(e);
                         }
                         setActiveConsult(patient);
                       }} className="px-3 py-1.5 bg-[#40807b] hover:bg-[#326662] text-white text-xs font-bold rounded-lg shadow-md transition-colors">
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
                 <h1 className="text-2xl font-bold text-white font-display">Smart Calendar</h1>
                 <p className="text-slate-500 text-sm mt-1">Manage your clinic hours, surgery blocks, and appointments</p>
               </div>
               <div className="flex gap-2">
                 <button className="px-4 py-2 bg-white/70 text-slate-700 border border-white/80 rounded-xl font-medium text-sm hover:bg-white shadow-sm transition-colors">
                   Today
                 </button>
                 <button className="px-4 py-2 bg-[#40807b] text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-[#326662] transition-colors shadow-md">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                   Block Time
                 </button>
               </div>
             </div>

             <div className="bg-white/70 border border-white/80 rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[500px] backdrop-blur-xl">
               <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200/50 p-6 bg-white/40">
                 <div className="font-bold text-slate-900 mb-4">July 2026</div>
                 <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 mb-2">
                   <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                 </div>
                 <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
                   {Array.from({length: 31}).map((_, i) => (
                     <div key={i} className={`p-1.5 rounded-lg cursor-pointer ${i+1 === 2 ? 'bg-[#40807b] text-white font-bold shadow-md' : 'text-slate-700 hover:bg-white/60'}`}>
                       {i + 1}
                     </div>
                   ))}
                 </div>
               </div>

               <div className="flex-1 p-6">
                 <div className="text-lg font-bold text-slate-900 mb-6">Thursday, July 2, 2026</div>
                 <div className="space-y-4 relative">
                    <div className="absolute left-16 top-0 bottom-0 w-px bg-slate-200/50"></div>
                    
                    {appointments.length === 0 ? (
                      <div className="flex gap-4 items-start relative z-10 py-8">
                        <div className="flex-1 bg-white/40 border border-slate-200/50 rounded-xl p-8 border-dashed text-center text-slate-500">
                          <p className="font-bold text-slate-700">No appointments scheduled</p>
                          <p className="text-xs text-slate-500 mt-1">Your calendar is currently clear.</p>
                        </div>
                      </div>
                    ) : appointments.map((appt, idx) => (
                      <div key={appt.id || idx} className="flex gap-4 items-start relative z-10">
                        <div className="w-16 text-right text-xs font-bold text-slate-500 pt-3">{appt.time || "TBD"}</div>
                        <div className={`flex-1 ${appt.type === 'online' ? 'bg-indigo-50 border border-indigo-100' : 'bg-teal-50 border border-teal-100'} rounded-xl p-4 shadow-sm`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-bold ${appt.type === 'online' ? 'text-indigo-900' : 'text-teal-900'} text-sm`}>{appt.title || "Appointment"}</h4>
                            <span className={`${appt.type === 'online' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'} text-[10px] uppercase font-bold px-2 py-0.5 rounded-md`}>
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

        {activeTab === "register" && (
           <div className="space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h1 className="text-2xl font-bold text-white font-display">Digital Clinic Register</h1>
                 <p className="text-slate-500 text-sm mt-1">Daily patient ledger and financial summary</p>
               </div>
               <div className="flex gap-2">
                 <button className="px-4 py-2 bg-white/70 text-slate-700 border border-white/80 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-white shadow-sm transition-colors">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                   Export CSV
                 </button>
                 <button className="px-4 py-2 bg-[#40807b] text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-[#326662] transition-colors shadow-md">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                   Scan Document
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white/70 p-6 rounded-2xl shadow-sm border border-white/80 flex items-center justify-between backdrop-blur-xl">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Patients</p>
                    <h3 className="text-3xl font-bold text-slate-900">{transactions.filter(t => t.date === dateFilter || !t.date).length}</h3>
                  </div>
                 <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                 </div>
               </div>
               <div className="bg-white/70 p-6 rounded-2xl shadow-sm border border-white/80 flex items-center justify-between backdrop-blur-xl">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-slate-900">₹{transactions.filter(t => t.date === dateFilter || !t.date).reduce((acc, curr) => acc + (curr.amount || 0), 0)}</h3>
                  </div>
                 <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
               </div>
               <div className="bg-white/70 p-6 rounded-2xl shadow-sm border border-white/80 flex items-center justify-between backdrop-blur-xl">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Cash Collection</p>
                    <h3 className="text-3xl font-bold text-slate-900">₹{transactions.filter(t => (t.date === dateFilter || !t.date) && t.method === 'cash').reduce((acc, curr) => acc + (curr.amount || 0), 0)}</h3>
                  </div>
                 <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
               </div>
             </div>

             <div className="bg-white/70 border border-white/80 rounded-2xl shadow-lg overflow-hidden backdrop-blur-xl mt-6">
               <div className="p-4 border-b border-slate-200/50 flex items-center justify-between bg-white/40">
                 <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-900 outline-none focus:border-teal-500 shadow-sm" />
                 <div className="relative">
                   <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                   <input type="text" placeholder="Search patient..." className="pl-9 pr-4 py-1.5 text-sm bg-white/50 border border-slate-200 text-slate-900 rounded-lg outline-none focus:border-teal-500 w-64 placeholder:text-slate-500 shadow-sm" />
                 </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-white/40 border-b border-slate-200/50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                       <th className="p-4 whitespace-nowrap">Reg No.</th>
                       <th className="p-4 whitespace-nowrap">Time</th>
                       <th className="p-4 whitespace-nowrap">Patient Name</th>
                       <th className="p-4 whitespace-nowrap">Mode</th>
                       <th className="p-4 whitespace-nowrap">Status</th>
                       <th className="p-4 whitespace-nowrap text-right">Fee</th>
                       <th className="p-4 whitespace-nowrap text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200/50">
                      {transactions.filter(t => t.date === dateFilter || !t.date).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">No transactions recorded yet.</td>
                        </tr>
                      ) : transactions.filter(t => t.date === dateFilter || !t.date).map((row, i) => (
                        <tr key={i} className="hover:bg-white/40 transition-colors">
                          <td className="p-4 text-sm font-bold text-slate-600">{row.reg || `REG-${i+1}`}</td>
                          <td className="p-4 text-sm text-slate-500">{row.time || "TBD"}</td>
                          <td className="p-4 text-sm font-bold text-slate-900">{row.name || "Unknown Patient"}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${row.mode === 'Telemedicine' || row.mode === 'Video Call' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                              {row.mode || "Walk-in"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {row.status || "Completed"}
                            </span>
                          </td>
                          <td className="p-4 text-sm font-bold text-slate-900 text-right">₹{row.amount || "0"}</td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => setBillingPatient(row)}
                              className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-colors"
                            >
                              Generate Bill
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
             </div>
           </div>
        )}

        {["identity", "professional", "consultation_setup", "location", "bank_details"].includes(activeTab) && (
           <div className="space-y-6">
             {!isFullySetup && (
               <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center">
                 <div className="w-20 h-20 shrink-0 relative pointer-events-none">
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
                 <h1 className="text-2xl font-bold text-white font-display">Clinic Profile Builder</h1>
                 <p className="text-slate-500 text-sm mt-1">Configure your public page and payouts</p>
               </div>
               <div className="flex gap-4 items-center">
                  {saveStatus === "saving" && <span className="text-sm font-bold text-teal-600 animate-pulse">Autosaving...</span>}
                  {saveStatus === "saved" && <span className="text-sm font-bold text-emerald-500">✓ Saved</span>}
                  
                  {entityData?.adminLocked ? (
                    <button onClick={() => handleTabChange('faq')} className="px-5 py-2 bg-rose-500 text-white font-bold rounded-xl text-sm transition-colors shadow-sm">
                      Locked
                    </button>
                  ) : isFullySetup && !entityData?.verified && (
                    <button onClick={() => setEntityData({...entityData, verified: true})} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm">
                      Publish Profile
                    </button>
                  )}
                  {entityData?.verified && !entityData?.adminLocked && (
                    <div className="px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold uppercase flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live / Published
                    </div>
                  )}
               </div>
             </div>
             
             <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 custom-scrollbar relative z-10">
               {[
                 { id: "identity", label: "Personal Details" },
                 { id: "professional", label: "Professional Bio" },
                 { id: "consultation_setup", label: "Consultations" },
                 { id: "location", label: "Clinic Location" },
                 { id: "bank_details", label: "Bank & Payouts" },
               ].map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => handleTabChange(tab.id)}
                   className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                 >
                   {tab.label}
                 </button>
               ))}
             </div>

             <div className="bg-slate-700/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl">
               {activeTab === 'identity' && (
                 <div className="mb-8 p-4 bg-black/20 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-between">
                   <div>
                     <h4 className="font-bold text-white">Profile Visibility</h4>
                     <p className="text-xs text-slate-500">
                       {progress < 100 
                         ? "Complete all mandatory fields to enable publication." 
                         : "When turned on, your profile will be visible in the public directory."}
                     </p>
                   </div>
                   <label className={`relative inline-flex items-center ${(progress < 100 || entityData?.adminLocked) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                     <input 
                       type="checkbox" 
                       className="sr-only peer" 
                       checked={entityData.isPublished === true && !entityData?.adminLocked}
                       disabled={progress < 100 || entityData?.adminLocked}
                       onChange={(e) => setEntityData({ ...entityData, isPublished: e.target.checked })}
                     />
                     <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                   </label>
                 </div>
               )}
               <DoctorV2Forms activeTab={activeTab} entityData={entityData} setEntityData={setEntityData} />
             </div>
           </div>
        )}

        {activeTab === "patients" && (
           <div className="animate-in fade-in slide-in-from-bottom-4">
             <MyNetworkHub providerId={entityData?.id || null} providerRole="doctor" viewMode="b2c" />
           </div>
        )}
        
        {activeTab === "b2b_network" && (
           <div className="animate-in fade-in slide-in-from-bottom-4">
             <MyNetworkHub providerId={entityData?.id || null} providerRole="doctor" viewMode="b2b" />
           </div>
        )}

        {activeTab === "inbox" && (
           <div className="animate-in fade-in slide-in-from-bottom-4 pt-4">
             <ChatInboxWidget initialTargetId={chatTargetId} />
           </div>
        )}

        {activeTab === "medical_vault" && (
           <div className="animate-in fade-in slide-in-from-bottom-4">
             <SecureMedicalVault providerId={entityData?.id || null} providerName={entityData?.name} />
           </div>
        )}

        {["telemedicine"].includes(activeTab) && (
          <div className="space-y-6">
            <div className="bg-black/20 backdrop-blur-xl p-12 rounded-2xl shadow-lg border border-white/10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="w-20 h-20 bg-teal-500/10 border border-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[inset_0_0_20px_rgba(20,184,166,0.1)]">
                 <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
               </div>
               <h2 className="text-3xl font-black text-white tracking-tight mb-3">Coming Soon in Phase 3</h2>
               <p className="text-slate-400 text-lg max-w-lg mx-auto">We are building this premium feature to give you unparalleled control over your clinic's operations.</p>
            </div>
          </div>
        )}

        {activeTab === "payouts" && (
          <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <WalletDashboard 
               entityId={entityData.id} 
               userRole="doctor" 
               walletBalance={entityData.walletBalance || 0} 
             />
          </div>
        )}

        {activeTab === "staff" && (
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Staff & Receptionists</h3>
                <p className="text-sm text-slate-400 mt-1">Delegate access to your clinic staff</p>
              </div>
              <button 
                onClick={() => {
                  const staff = entityData.staffList || [];
                  setEntityData({ ...entityData, staffList: [...staff, { name: "", email: "", role: "Receptionist" }] });
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors"
              >
                + Add Staff Member
              </button>
            </div>

            <div className="mb-8 bg-teal-500/10 border border-teal-500/20 p-6 rounded-2xl">
              <h4 className="font-bold text-teal-300 mb-2">Role-Based Access Control</h4>
              <p className="text-sm text-teal-400/80">Receptionists can manage your Live Queue and view the Smart Calendar, but they cannot access payouts or your personal settings. Ensure they log in with the exact Google Account you invite here.</p>
            </div>

            <div className="space-y-4">
              {(!entityData.staffList || entityData.staffList.length === 0) ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/20">
                  <p className="text-slate-400 font-medium">No staff members added yet. Click above to add your team.</p>
                </div>
              ) : (
                entityData.staffList.map((staff: any, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-sm relative group hover:bg-white/10 transition-colors">
                    <button 
                      onClick={() => {
                        const newStaff = [...entityData.staffList];
                        newStaff.splice(idx, 1);
                        setEntityData({ ...entityData, staffList: newStaff });
                      }}
                      className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove Staff"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    
                    <div className="grid md:grid-cols-3 gap-6 mr-8">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Rahul Sharma"
                          value={staff.name}
                          onChange={e => {
                            const newStaff = [...entityData.staffList];
                            newStaff[idx].name = e.target.value;
                            setEntityData({ ...entityData, staffList: newStaff });
                          }}
                          className="w-full bg-black/20 backdrop-blur-3xl border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 outline-none transition-all placeholder:text-slate-600" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Google Account Email</label>
                        <input 
                          type="email" 
                          placeholder="rahul@gmail.com"
                          value={staff.email}
                          onChange={e => {
                            const newStaff = [...entityData.staffList];
                            newStaff[idx].email = e.target.value;
                            setEntityData({ ...entityData, staffList: newStaff });
                          }}
                          className="w-full bg-black/20 backdrop-blur-3xl border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 outline-none transition-all placeholder:text-slate-600" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Permissions Role</label>
                        <div className="relative">
                          <select 
                            value={staff.role}
                            onChange={e => {
                              const newStaff = [...entityData.staffList];
                              newStaff[idx].role = e.target.value;
                              setEntityData({ ...entityData, staffList: newStaff });
                            }}
                            className="w-full bg-black/20 backdrop-blur-3xl border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 outline-none transition-all appearance-none"
                          >
                            <option value="Receptionist" className="text-slate-900">Receptionist (Bookings Only)</option>
                            <option value="Clinic Manager" className="text-slate-900">Clinic Manager</option>
                            <option value="Associate Doctor" className="text-slate-900">Associate Doctor</option>
                          </select>
                          <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-end mt-8 border-t border-white/10 pt-6">
               {saveStatus === 'saving' && <div className="text-amber-400 text-sm font-bold flex items-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving Changes...</div>}
               {saveStatus === 'saved' && <div className="text-emerald-400 text-sm font-bold flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> All changes saved to cloud</div>}
               {saveStatus === 'error' && <div className="text-rose-400 text-sm font-bold flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Error saving changes</div>}
               {saveStatus === 'idle' && <div className="text-slate-500 text-sm flex items-center gap-2">Changes are saved automatically</div>}
            </div>
          </div>
        )}

        {activeTab === "faq" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <SupportDashboard userRole="doctor" userName={entityData?.name} faqData={faqData} />
          </div>
        )}
          </div>
        </div>

      </div>

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
                  <input type="text" value={walkInName} onChange={e => setWalkInName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="Patient Name" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Age</label>
                     <input type="text" value={walkInAge} onChange={e => setWalkInAge(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="e.g. 34" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Sex</label>
                     <select value={walkInSex} onChange={e => setWalkInSex(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-3 text-slate-900 focus:border-teal-500 outline-none">
                       <option value="M">M</option>
                       <option value="F">F</option>
                       <option value="O">O</option>
                     </select>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowAddWalkIn(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleAddWalkIn} disabled={!walkInName} className="px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-sm shadow-teal-200 hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Add to Queue</button>
            </div>
          </div>
        </div>
      )}
      {activeConsult && (
        <DigitalRxPad 
          patient={activeConsult} 
          provider={entityData}
          onClose={() => setActiveConsult(null)} 
          onSave={handleSaveRx} 
        />
      )}
      {billingPatient && (
        <BillingInvoice 
          patient={billingPatient}
          provider={entityData}
          onClose={() => setBillingPatient(null)}
        />
      )}
    </DashboardLayout>
  );
}
