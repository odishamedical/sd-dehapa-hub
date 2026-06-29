"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDocs, updateDoc, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AddressBlock from '@/components/AddressBlock';
import RxPadWidget from '@/components/RxPadWidget';
import MyNetworkHub from '@/components/network/MyNetworkHub';
import DoctorV2Forms from '@/components/DoctorV2Forms';
import ContextHelpDrawer from '@/components/ContextHelpDrawer';
import { QRCodeSVG } from 'qrcode.react';

const WIZARD_STEPS = [
  { id: "identity", label: "Identity & Media" },
  { id: "professional", label: "Professional Bio" },
  { id: "consultation_setup", label: "Consultations" },
  { id: "location", label: "Clinic Location" },
  { id: "bank_details", label: "Bank & Payouts" }
];

export default function DoctorV2OwnerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [entityDocId, setEntityDocId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Dashboard State
  const [activeTab, setActiveTab] = useState("home");
  const [entityData, setEntityData] = useState<any>({});
  
  // Auto-save logic
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const isInitialMount = useRef(true);

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
        
        // Cache in localStorage to support synchronous global alerts
        localStorage.setItem("sd_current_doctor_id", docSnap.id);
        const data = docSnap.data();
        if (data && data.primarySpecialty) {
          localStorage.setItem("sd_current_doctor_specialty", data.primarySpecialty);
        }
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
    }, 1000);
    return () => clearTimeout(timeout);
  }, [entityData, entityDocId]);

  // Completion Logic (0 - 100%)
  const calculateProgress = () => {
    let score = 0;
    if (entityData.name && entityData.primarySpecialty && entityData.image) score += 20;
    if (entityData.registrationNumber) score += 20;
    if (entityData.qualificationsList?.length > 0) score += 20;
    if (entityData.offersPhysical || entityData.offersDigital) score += 20;
    if (entityData.accountNumber && entityData.ifscCode) score += 20;
    return score;
  };
  
  const progress = calculateProgress();
  const isReady = progress === 100;

  const handlePublishToggle = async () => {
    if (!isReady) return;
    const newStatus = !entityData.isPublic;
    setEntityData({ ...entityData, isPublic: newStatus });
    // Autosave will handle the DB update
  };

  // Wizard Navigation
  const currentStepIndex = WIZARD_STEPS.findIndex(s => s.id === activeTab);
  const handleNextStep = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setActiveTab(WIZARD_STEPS[currentStepIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab("home");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!accessGranted) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans relative overflow-x-hidden flex flex-col">
      
      {/* Background Orbs for Glassmorphism effect */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-200/40 rounded-full blur-[120px] animate-float-slow"></div>
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] bg-indigo-200/40 rounded-full blur-[100px] animate-float-slow-reverse"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] bg-rose-200/30 rounded-full blur-[100px] animate-float-slow"></div>
      </div>

      {/* Main Header (Sticky) */}
      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/80 shadow-sm px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <button onClick={() => setActiveTab("home")} className="text-xl md:text-2xl font-black text-slate-800 tracking-tight hover:text-teal-600 transition-colors">
            DehaPa Portal
          </button>
          
          {/* Incoming Ping Service is now loaded globally via GlobalDoctorAlerts in RootLayout */}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          {saveStatus === "saving" && <span className="text-sm font-bold text-teal-600 animate-pulse hidden md:inline">Autosaving...</span>}
          {saveStatus === "saved" && <span className="text-sm font-bold text-emerald-500 hidden md:inline">✓ Saved</span>}
          
          <button 
            onClick={() => setIsHelpOpen(true)}
            className="hidden md:flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Help & Guide
          </button>
          
          <button 
            onClick={() => setIsHelpOpen(true)}
            className="md:hidden p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>

          <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900">
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative z-10 w-full max-w-[1400px] mx-auto">
        
        {/* =========================================================================
            LEFT SIDEBAR (Glassmorphism)
           ========================================================================= */}
        <aside className="hidden lg:block w-72 shrink-0 p-6">
          <div className="sticky top-[100px] sd-glass-panel p-6">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200/50">
              <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                {entityData.name ? entityData.name.charAt(0).toUpperCase() : "D"}
              </div>
              <div className="overflow-hidden flex-1 group cursor-pointer" onClick={() => setShowQRModal(true)}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">{entityData.name || "Doctor"}</h3>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{entityData.primarySpecialty || "Setup Required"}</p>
              </div>
            </div>

            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('home')} 
                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'home' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                🏠 Dashboard Home
              </button>
              
              <div className="pt-4 pb-2">
                <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Wizard Steps</p>
              </div>
              
              {WIZARD_STEPS.map(step => (
                <button 
                  key={step.id}
                  onClick={() => setActiveTab(step.id)} 
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === step.id ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${activeTab === step.id ? 'bg-teal-500' : 'bg-slate-300'}`}></span>
                  {step.label}
                </button>
              ))}

              <div className="pt-6 pb-2 border-t border-slate-200/50 mt-4">
                <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Tools</p>
              </div>

              <button 
                onClick={() => setActiveTab('rxpad')} 
                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'rxpad' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                📝 Digital Rx Pad
              </button>
              <button 
                onClick={() => setActiveTab('network')} 
                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'network' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                🤝 My Network
              </button>
              <button 
                onClick={() => setActiveTab('vault')} 
                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'vault' ? 'bg-orange-50 text-orange-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                🗄️ Patient Vault
              </button>
            </nav>
          </div>
        </aside>

        {/* =========================================================================
            MOBILE SLIDE-IN SIDEBAR (Drawer)
           ========================================================================= */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden flex">
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="relative w-72 max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left-full duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-lg">
                    {entityData.name ? entityData.name.charAt(0).toUpperCase() : "D"}
                  </div>
                  <div className="overflow-hidden flex-1 group" onClick={() => setShowQRModal(true)}>
                    <div className="flex items-center justify-between cursor-pointer">
                      <h3 className="font-bold text-slate-900 truncate text-sm group-hover:text-teal-600 transition-colors">{entityData.name || "Doctor"}</h3>
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <nav className="space-y-1">
                  <button 
                    onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} 
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'home' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    🏠 Dashboard Home
                  </button>
                  
                  <div className="pt-4 pb-2">
                    <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Wizard Steps</p>
                  </div>
                  
                  {WIZARD_STEPS.map(step => (
                    <button 
                      key={step.id}
                      onClick={() => { setActiveTab(step.id); setIsMobileMenuOpen(false); }} 
                      className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === step.id ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${activeTab === step.id ? 'bg-teal-500' : 'bg-slate-300'}`}></span>
                      {step.label}
                    </button>
                  ))}

                  <div className="pt-6 pb-2 border-t border-slate-100 mt-4">
                    <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Tools</p>
                  </div>

                  <button 
                    onClick={() => { setActiveTab('rxpad'); setIsMobileMenuOpen(false); }} 
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'rxpad' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    📝 Digital Rx Pad
                  </button>
                  <button 
                    onClick={() => { setActiveTab('network'); setIsMobileMenuOpen(false); }} 
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'network' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    🤝 My Network
                  </button>
                  <button 
                    onClick={() => { setActiveTab('vault'); setIsMobileMenuOpen(false); }} 
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'vault' ? 'bg-orange-50 text-orange-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    🗄️ Patient Vault
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MAIN CONTENT AREA
           ========================================================================= */}
        <main className="flex-1 px-4 py-8 md:px-8 md:py-12 max-w-5xl">
          
          {/* =========================================================================
              HOME TAB: THE "SMART GUIDED ONBOARDING" PULSE UI 
             ========================================================================= */}
          {activeTab === "home" && (
            <div className="space-y-8 md:space-y-12 animate-in fade-in zoom-in-95 duration-500">
              
              {/* Massive Glassmorphism Hero */}
              <div className="sd-glass-panel overflow-hidden relative p-8 md:p-16">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-indigo-500/10 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center justify-between">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                      {entityData.isPublic ? "Your profile is Live." : "Activate Your Doctor Profile."}
                    </h1>
                    <p className="text-slate-600 text-lg md:text-xl max-w-xl font-medium">
                      {entityData.isPublic 
                        ? "Patients can now find you in the directory. Keep your app open to receive emergency video calls." 
                        : "Complete your setup to unlock the 'Publish' button. Auto-save is always on."}
                    </p>
                  </div>

                  {/* The Giant Publish Switch */}
                  <div className="shrink-0 bg-white/80 backdrop-blur-md border border-white p-6 rounded-3xl shadow-xl flex flex-col items-center gap-4 w-full lg:min-w-[280px]">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Profile Strength</div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden shadow-inner">
                      <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-4 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${progress}%` }}>
                         {progress > 10 && <span className="absolute right-2 top-0 text-[10px] text-white font-bold leading-4">{progress}%</span>}
                      </div>
                    </div>

                    <button 
                      onClick={handlePublishToggle}
                      disabled={!isReady}
                      className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-lg ${
                        entityData.isPublic 
                          ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-500 shadow-emerald-500/20" 
                          : isReady 
                            ? "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 hover:scale-105" 
                            : "bg-slate-200 text-slate-400 cursor-not-allowed border-2 border-slate-200"
                      }`}
                    >
                      {entityData.isPublic ? "✓ Public & Live" : isReady ? "Publish Now" : "Locked"}
                    </button>
                    {!isReady && <p className="text-xs text-rose-500 font-bold">Reach 100% to unlock</p>}
                  </div>
                </div>
              </div>

              {/* Mobile Quick Actions Grid (Since sidebar is hidden on mobile) */}
              <div className="grid lg:hidden grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => setActiveTab("identity")} className="sd-glass-panel p-6 text-left hover:scale-105 transition-all group">
                   <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:rotate-12 transition-transform">👤</div>
                   <h3 className="text-lg font-black text-slate-900 mb-1">Setup Profile</h3>
                   <p className="text-xs text-slate-500 font-medium">Identity, Media & Bio</p>
                </button>
                <button onClick={() => setActiveTab("rxpad")} className="sd-glass-panel p-6 text-left hover:scale-105 transition-all group">
                   <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:rotate-12 transition-transform">📝</div>
                   <h3 className="text-lg font-black text-slate-900 mb-1">Digital Rx Pad</h3>
                   <p className="text-xs text-slate-500 font-medium">Write Prescriptions</p>
                </button>
              </div>

            </div>
          )}

          {/* =========================================================================
              WIZARD SETUP TABS
             ========================================================================= */}
          {WIZARD_STEPS.map(s => s.id).includes(activeTab) && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              
              {/* Top Breadcrumbs */}
              <div className="flex items-center gap-3 mb-8 text-sm font-bold text-slate-500">
                <button onClick={() => setActiveTab("home")} className="hover:text-slate-900 transition-colors">Dashboard Home</button>
                <span>/</span>
                <span className="text-teal-600">{WIZARD_STEPS.find(s => s.id === activeTab)?.label}</span>
              </div>

              <div className="sd-glass-panel p-6 md:p-12 mb-8">
                
                {/* Form Content Wrapper */}
                {activeTab === "location" ? (
                  <>
                    <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Clinic Location</h2>
                    <AddressBlock 
                      data={{
                        country: entityData.country || 'India',
                        state: entityData.state || 'Odisha',
                        district: entityData.district || '',
                        block: entityData.block || '',
                        city: entityData.city || '',
                        pincode: entityData.pincode || '',
                        localAddress: entityData.address || ''
                      }}
                      onChange={(addr) => {
                        setEntityData({ 
                          ...entityData, 
                          country: addr.country,
                          state: addr.state,
                          district: addr.district,
                          block: addr.block,
                          city: addr.city,
                          pincode: addr.pincode,
                          address: addr.localAddress
                        });
                      }}
                    />
                  </>
                ) : (
                  <DoctorV2Forms 
                    activeTab={activeTab} 
                    entityData={entityData} 
                    setEntityData={setEntityData} 
                  />
                )}

              </div>

              {/* Bottom Wizard Navigation (Psychological Save) */}
              <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 mt-12 mb-20">
                <button onClick={() => setActiveTab("home")} className="text-slate-500 hover:text-slate-900 font-bold px-6 py-4 transition-colors">
                  Return to Dashboard
                </button>
                
                <button onClick={handleNextStep} className="w-full md:w-auto sd-btn-premium">
                  {currentStepIndex === WIZARD_STEPS.length - 1 ? "Save & Finish ➔" : "Save & Continue ➔"}
                </button>
              </div>

            </div>
          )}

          {/* =========================================================================
              CLINICAL TOOLS
             ========================================================================= */}
          {activeTab === "rxpad" && (
            <div className="animate-in fade-in slide-in-from-bottom-8">
              <div className="flex items-center gap-3 mb-8 text-sm font-bold text-slate-500">
                <button onClick={() => setActiveTab("home")} className="hover:text-slate-900 transition-colors">Dashboard Home</button>
                <span>/</span>
                <span className="text-teal-600">Digital Rx Pad</span>
              </div>
              <div className="sd-glass-panel p-6">
                <RxPadWidget 
                  doctorData={{
                    id: entityData.id,
                    name: entityData.name || "Dr. Name",
                    speciality: entityData.primarySpecialty || "Specialty",
                    degrees: entityData.credentials || "MBBS",
                    registrationNo: entityData.registrationNo || "",
                    phone: entityData.phone || "",
                    address: entityData.address || "Clinic Address"
                  }} 
                />
              </div>
            </div>
          )}

          {activeTab === "network" && (
            <div className="animate-in fade-in slide-in-from-bottom-8">
              <div className="flex items-center gap-3 mb-8 text-sm font-bold text-slate-500">
                <button onClick={() => setActiveTab("home")} className="hover:text-slate-900 transition-colors">Dashboard Home</button>
                <span>/</span>
                <span className="text-teal-600">My Network</span>
              </div>
              <div className="sd-glass-panel p-8">
                <MyNetworkHub providerId={entityData.id} providerRole="doctor" />
              </div>
            </div>
          )}

          {activeTab === "vault" && (
             <div className="animate-in fade-in slide-in-from-bottom-8">
               <div className="flex items-center gap-3 mb-8 text-sm font-bold text-slate-500">
                 <button onClick={() => setActiveTab("home")} className="hover:text-slate-900 transition-colors">Dashboard Home</button>
                 <span>/</span>
                 <span className="text-teal-600">Patient Vault</span>
               </div>
               <div className="sd-glass-panel p-8 md:p-12 text-center py-16 md:py-24">
                 <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-6 shadow-inner">🗄️</div>
                 <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Sovereign Vault Access</h2>
                 <p className="text-slate-600 text-lg max-w-lg mx-auto mb-10 font-medium">Enter a Patient's Vault ID to securely access their medical history or upload prescriptions.</p>
                 <div className="flex flex-col md:flex-row max-w-lg mx-auto gap-4">
                   <input type="text" placeholder="patient@example.com" className="sd-input-v3 text-center md:text-left" />
                   <button className="sd-btn-v3 bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/30 whitespace-nowrap">Lookup</button>
                 </div>
               </div>
             </div>
          )}

        </main>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm cursor-pointer transition-opacity"
            onClick={() => setShowQRModal(false)}
          ></div>
          
          <div className="relative bg-white rounded-3xl p-10 flex flex-col items-center shadow-2xl max-w-sm w-full animate-in zoom-in-95">
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1 text-center">{entityData.name || 'Doctor'}'s Profile</h3>
            <p className="text-sm text-teal-600 mb-8 text-center">{entityData.primarySpecialty || 'Setup Required'}</p>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
              <QRCodeSVG 
                value={(entityData.profileUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/profile/doctor/${entityData.id}`) + '?action=connect'} 
                size={200} 
                level="L"
                fgColor="#0f172a" 
              />
            </div>

            <button 
              onClick={() => {
                const link = (entityData.profileUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/profile/doctor/${entityData.id}`) + '?action=connect';
                navigator.clipboard.writeText(link);
                alert("Invitation Link Copied to Clipboard!");
              }}
              className="w-full bg-slate-900 hover:bg-teal-600 text-white rounded-xl py-3 font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              Copy Invitation Link
            </button>
          </div>
        </div>
      )}

      {/* Context-Aware Help Drawer */}
      <ContextHelpDrawer 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        activeTab={activeTab}
        userProfile={{ name: entityData.name, email: userEmail }}
        roleName="Doctor"
      />

    </div>
  );
}
