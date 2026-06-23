"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDocs, updateDoc, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AddressBlock from '@/components/AddressBlock';
import ImageUpload from '@/components/ImageUpload';
import RxPadWidget from '@/components/RxPadWidget';
import MyNetworkHub from '@/components/network/MyNetworkHub';
import { directoryConfig } from '@/lib/directoryConfig';
import DoctorV2Forms from '@/components/DoctorV2Forms'; // We will create this next

export default function DoctorV2OwnerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [entityDocId, setEntityDocId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [entityData, setEntityData] = useState<any>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const isInitialMount = useRef(true);

  // Sync tab with URL Hash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      const email = localStorage.getItem("sd_current_user_email");
      const role = localStorage.getItem("sd_current_user_role");
      
      if (!email || (role !== "doctor" && role !== "super_admin")) {
        window.location.href = "/portal";
        return;
      }
      setAccessGranted(true);
      setUserEmail(email);
      if (hash) setActiveTab(hash);
      fetchEntity(email);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "#" + activeTab);
    }
  }, [activeTab]);

  const fetchEntity = async (email: string) => {
    setLoading(true);
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
    setLoading(false);
  };

  // Autosave
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
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
    }, 1500);
    return () => clearTimeout(timeout);
  }, [entityData, entityDocId]);

  // Completion Logic
  const hasIdentity = !!(entityData.name && entityData.phone && entityData.primarySpecialty);
  const hasLocation = !!(entityData.address && entityData.city);
  const hasBank = !!(entityData.accountNumber && entityData.ifscCode);
  const isReady = hasIdentity && hasLocation && hasBank;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!accessGranted) return null;

  // Sidebar Tabs Config
  const sidebarNav = [
    {
      section: "Day-to-Day Clinical",
      colorClass: "text-blue-600 bg-blue-50 hover:bg-blue-100",
      tabs: [
        { id: "rxpad", label: "📝 Write Prescription" },
        { id: "vault", label: "🗄️ Patient Vaults" },
      ]
    },
    {
      section: "Growth & Network",
      colorClass: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100",
      tabs: [
        { id: "network", label: "🤝 My Network Hub" },
      ]
    },
    {
      section: "Clinic Setup & Admin",
      colorClass: "text-orange-600 bg-orange-50 hover:bg-orange-100",
      tabs: [
        { id: "identity", label: "👤 Public Profile" },
        { id: "location", label: "📍 Address & Location" },
        { id: "professional", label: "💼 Professional Details" },
        { id: "consultation_setup", label: "💻 Consultation Modes" },
        { id: "bank_details", label: "🏦 Bank & Payouts" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      
      {/* V2 Sidebar - Clean White */}
      <aside className="w-72 bg-white border-r border-slate-200 shrink-0 hidden lg:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div>
            <h1 className="font-black text-lg text-slate-800 leading-tight">DehaPa V2</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Provider Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {sidebarNav.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">{group.section}</h3>
              <div className="space-y-1">
                {group.tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                      activeTab === tab.id 
                        ? `${group.colorClass} shadow-sm border border-black/5` 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile Mini */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
             {entityData.image ? (
               <img src={entityData.image} className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200" />
             ) : (
               <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">👤</div>
             )}
             <div className="flex-1 min-w-0">
               <p className="font-bold text-sm text-slate-800 truncate">{entityData.name || "Setup Required"}</p>
               <p className="text-xs text-slate-500 truncate">{userEmail}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Header with Autosave Status */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-2xl font-black text-slate-800 capitalize flex items-center gap-3">
            {activeTab === 'home' ? "Welcome back, Doctor." : activeTab.replace('_', ' ')}
          </h2>
          
          <div className="flex items-center gap-4">
            {saveStatus === "saving" && <span className="text-sm font-bold text-indigo-500 flex items-center gap-2"><div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div> Saving changes...</span>}
            {saveStatus === "saved" && <span className="text-sm font-bold text-emerald-500 flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Saved</span>}
            
            <button onClick={() => setActiveTab("home")} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              Dashboard Home
            </button>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full">
          
          {/* =========================================================================
              HOME TAB: THE "SMART GUIDED ONBOARDING" PULSE UI 
             ========================================================================= */}
          {activeTab === "home" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              
              <div className="bg-indigo-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <h1 className="text-3xl md:text-5xl font-black mb-4 relative z-10">
                  {isReady ? "Your Clinic is Live." : "Let's activate your clinic."}
                </h1>
                <p className="text-indigo-100 text-lg max-w-xl relative z-10">
                  {isReady 
                    ? "Your public directory page is active and your Rx Pad is ready. Start growing your network today." 
                    : "Complete the 3 critical steps below to activate your public directory page and start writing digital prescriptions."}
                </p>
              </div>

              {/* The Visual Journey */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Step 1: Identity */}
                <div 
                  onClick={() => setActiveTab("identity")}
                  className={`bg-white rounded-3xl p-8 cursor-pointer transition-all border-2 ${hasIdentity ? 'border-emerald-500' : 'border-indigo-100 hover:border-indigo-300'} ${!hasIdentity ? 'pulse-guide' : ''} shadow-sm hover:shadow-xl`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${hasIdentity ? 'bg-emerald-100 text-emerald-500' : 'bg-indigo-100 text-indigo-600'}`}>
                      {hasIdentity ? '✓' : '1'}
                    </div>
                    {hasIdentity && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">Completed</span>}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Public Profile</h3>
                  <p className="text-slate-500 text-sm">Add your name, photo, and primary specialty to build trust with patients.</p>
                </div>

                {/* Step 2: Location */}
                <div 
                  onClick={() => setActiveTab("location")}
                  className={`bg-white rounded-3xl p-8 cursor-pointer transition-all border-2 ${hasLocation ? 'border-emerald-500' : 'border-indigo-100 hover:border-indigo-300'} ${hasIdentity && !hasLocation ? 'pulse-guide' : ''} shadow-sm hover:shadow-xl`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${hasLocation ? 'bg-emerald-100 text-emerald-500' : 'bg-indigo-100 text-indigo-600'}`}>
                      {hasLocation ? '✓' : '2'}
                    </div>
                    {hasLocation && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">Completed</span>}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Clinic Location</h3>
                  <p className="text-slate-500 text-sm">Provide your physical address so patients and ambulances can find you.</p>
                </div>

                {/* Step 3: Bank Details */}
                <div 
                  onClick={() => setActiveTab("bank_details")}
                  className={`bg-white rounded-3xl p-8 cursor-pointer transition-all border-2 ${hasBank ? 'border-emerald-500' : 'border-indigo-100 hover:border-indigo-300'} ${hasIdentity && hasLocation && !hasBank ? 'pulse-guide' : ''} shadow-sm hover:shadow-xl`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${hasBank ? 'bg-emerald-100 text-emerald-500' : 'bg-orange-100 text-orange-600'}`}>
                      {hasBank ? '✓' : '3'}
                    </div>
                    {hasBank && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">Completed</span>}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Bank & Payouts</h3>
                  <p className="text-slate-500 text-sm">Add your secure bank details to receive payments for digital consultations.</p>
                </div>

              </div>

            </div>
          )}

          {/* =========================================================================
              CLINICAL TABS (BLUE ZONE)
             ========================================================================= */}
          {activeTab === "rxpad" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 zone-clinical p-6 rounded-3xl border-2">
              <RxPadWidget 
                doctorData={{
                  id: entityData.id,
                  name: entityData.name || "Dr. Setup Required",
                  speciality: entityData.primarySpecialty || "Specialist",
                  degrees: entityData.credentials || "MBBS",
                  registrationNo: entityData.registrationNo || "",
                  phone: entityData.phone || "",
                  address: entityData.address || "Clinic Address"
                }} 
              />
            </div>
          )}

          {activeTab === "vault" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 zone-clinical p-8 rounded-3xl border-2 text-center py-20">
              <div className="text-6xl mb-4">🗄️</div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Patient Vault Access</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-8">Enter a Patient's Sovereign Vault ID to view their medical history or upload documents securely.</p>
              <div className="flex max-w-md mx-auto gap-2">
                <input type="text" placeholder="patient@example.com" className="sd-input-v2" />
                <button className="sd-btn-v2 sd-btn-primary">Lookup</button>
              </div>
            </div>
          )}

          {/* =========================================================================
              NETWORK TAB (GREEN ZONE)
             ========================================================================= */}
          {activeTab === "network" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 zone-network p-6 rounded-3xl border-2">
               <MyNetworkHub providerId={entityData.id} providerRole="doctor" />
            </div>
          )}

          {/* =========================================================================
              SETUP TABS (ORANGE ZONE)
             ========================================================================= */}
          {["identity", "professional", "consultation_setup", "bank_details"].includes(activeTab) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 zone-admin p-8 rounded-3xl border-2">
              <DoctorV2Forms 
                activeTab={activeTab} 
                entityData={entityData} 
                setEntityData={setEntityData} 
              />
            </div>
          )}

          {activeTab === "location" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 zone-admin p-8 rounded-3xl border-2">
               <h2 className="text-2xl font-black text-slate-800 mb-6">Clinic Location</h2>
               <AddressBlock 
                 initialData={entityData}
                 onSave={(addr) => setEntityData({ ...entityData, ...addr })}
                 isInline={false}
               />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
