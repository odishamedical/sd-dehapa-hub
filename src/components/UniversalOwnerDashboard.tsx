"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import AddressBlock, { AddressData } from '@/components/AddressBlock';
import { useAutosave } from '@/hooks/useAutosave';
import AutosaveIndicator from '@/components/AutosaveIndicator';
import ImageUpload from '@/components/ImageUpload';
import ObjectArrayEditor from '@/components/ObjectArrayEditor';
import InlineEditArray from '@/components/InlineEditArray';
import HybridEntitySelector from '@/components/HybridEntitySelector';
import HybridTestMenuEditor from '@/components/HybridTestMenuEditor';
import { doc, getDocs, updateDoc, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { directoryConfig } from '@/lib/directoryConfig';
import EntitySelector from '@/components/EntitySelector';
import PremiumSlugModal from '@/components/PremiumSlugModal';

interface UniversalOwnerDashboardProps {
  expectedRole: string; // e.g. "pharmacy", "lab", "ambulance", "doctor", "hospital"
  customTabs?: DashboardTab[];
  renderCustomTab?: (tabId: string, entityData: any) => React.ReactNode;
  renderHomeWidget?: (entityData: any) => React.ReactNode;
}

export default function UniversalOwnerDashboard({ expectedRole, customTabs = [], renderCustomTab, renderHomeWidget }: UniversalOwnerDashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [entityDocId, setEntityDocId] = useState<string | null>(null);
  const [origin, setOrigin] = useState("https://dehapa.com");
  const [userEmail, setUserEmail] = useState("");
  const [activeTab, setActiveTab] = useState("home");

  // Sync tab with URL Hash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      const email = localStorage.getItem("sd_current_user_email");
      if (!email) {
        window.location.href = "/login";
        return;
      }
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
  // Dynamic State for the Entity
  const [entityData, setEntityData] = useState<any>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isSlugModalOpen, setIsSlugModalOpen] = useState(false);
  const isInitialMount = React.useRef(true);
  
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
        console.error("Autosave error:", err);
        setSaveStatus("error");
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [entityData, entityDocId]);

  const categoryConfig = directoryConfig[expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1)];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("sd_current_user_role");
      const email = localStorage.getItem("sd_current_user_email");
      
      if ((role === expectedRole || role === "super_admin") && email) {
        setAccessGranted(true);
        setUserEmail(email);
        fetchEntity(email);
      } else {
        setAccessGranted(false);
        router.push("/portal");
      }
    }
  }, [router, expectedRole]);

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
      console.error("Error fetching entity for dashboard:", err);
    }
    setLoading(false);
  };

  if (loading) return null;
  if (!accessGranted) return null;

  // Check if a field should be hidden based on dynamic schema rules
  const isFieldHidden = (field: any, data: any) => {
    if (field.showIf) {
      const targetValue = data[field.showIf.field];
      if (!targetValue) return true; // Hide if no value
      
      const conditionValues = field.showIf.contains;
      const conditionArr = Array.isArray(conditionValues) ? conditionValues : [conditionValues];
      
      if (Array.isArray(targetValue)) {
        // If target is array (multi-select), check if it shares ANY elements with the condition array
        return !targetValue.some(val => conditionArr.includes(val));
      } else {
        return !conditionArr.includes(targetValue);
      }
    }

    if (field.hiddenIf) {
      const targetValue = data[field.hiddenIf.field];
      if (!targetValue) return false;
      
      const conditionValues = field.hiddenIf.in;
      const conditionArr = Array.isArray(conditionValues) ? conditionValues : [conditionValues];

      if (Array.isArray(targetValue)) {
        return targetValue.some(val => conditionArr.includes(val));
      } else {
        return conditionArr.includes(targetValue);
      }
    }
    
    return false;
  };

  // Calculate Progress
  const calculateCompletion = () => {
    let requiredFieldsCount = 0;
    let completedFieldsCount = 0;

    // Base KYC & Identity fields
    const baseMandatoryKeys = ['ownerName', 'legalEntityName', 'ownerPersonalId', 'businessRegistrationProof', 'name', 'phone', 'about', 'image', 'city'];
    baseMandatoryKeys.forEach(k => {
      requiredFieldsCount++;
      if (entityData[k] && entityData[k].toString().trim() !== '') {
        completedFieldsCount++;
      }
    });

    categoryConfig?.tabs.forEach(tab => {
      tab.fields.forEach(field => {
        if (isFieldHidden(field, entityData)) return; // Skip if dynamically hidden
        
        if (field.mandatory) {
          requiredFieldsCount++;
          const val = entityData[field.key];
          if (Array.isArray(val) && val.length > 0) {
            completedFieldsCount++;
          } else if (val && val.toString().trim() !== '') {
            completedFieldsCount++;
          }
        }
      });
    });

    return requiredFieldsCount === 0 ? 100 : Math.round((completedFieldsCount / requiredFieldsCount) * 100);
  };
  
  const completionPercentage = calculateCompletion();
  const isReady = completionPercentage === 100;

  const defaultPulseHero = (
    <div className="sd-glass-panel overflow-hidden relative p-8 md:p-12 mb-8 bg-white border border-slate-200 rounded-3xl shadow-sm animate-in fade-in zoom-in-95 duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-indigo-500/5 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
            {entityData.isPublished ? "Your profile is Live." : "Activate Your Profile."}
          </h1>
          <p className="text-slate-600 text-lg max-w-xl font-medium">
            {entityData.isPublished 
              ? "Patients can now find you in the directory. Access your tools below." 
              : "Complete your setup to unlock the 'Publish' switch. Auto-save is always on."}
          </p>
        </div>

        <div className="shrink-0 bg-white/80 backdrop-blur-md border border-slate-100 p-6 rounded-3xl shadow-lg flex flex-col items-center gap-4 w-full lg:min-w-[280px]">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Profile Strength</div>
          
          <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-4 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${Math.max(5, completionPercentage)}%` }}>
               {completionPercentage > 10 && <span className="absolute right-2 top-0 text-[10px] text-white font-bold leading-4">{completionPercentage}%</span>}
            </div>
          </div>

          <button 
            onClick={() => {
              if (!isReady) return;
              setEntityData({ ...entityData, isPublished: !entityData.isPublished });
            }}
            disabled={!isReady}
            className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-md ${
              entityData.isPublished 
                ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-500" 
                : isReady 
                  ? "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 hover:scale-105" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed border-2 border-slate-200"
            }`}
          >
            {entityData.isPublished ? "✓ Public & Live" : isReady ? "Publish Now" : "Locked"}
          </button>
          {!isReady && <p className="text-xs text-rose-500 font-bold">Reach 100% to unlock</p>}
        </div>
      </div>
    </div>
  );

  // Build Tabs Dynamically
  const baseTabs: DashboardTab[] = [
    {
      id: "owner_kyc",
      label: "Owner KYC & Verification",
      section: "BUSINESS & OWNERSHIP",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
    },
    {
      id: "staff_management",
      label: "Staff & Team Access",
      section: "BUSINESS & OWNERSHIP",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    {
      id: "identity",
      label: "Property Identity & Info",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
    },
    {
      id: "location",
      label: "Location & Address",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
    },
    {
      id: "bank_details",
      label: "Bank & Payout Details",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
    },
    {
      id: "document_vault",
      label: "Document Vault",
      section: "BUSINESS & OWNERSHIP",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    }
  ];

  const schemaTabs: DashboardTab[] = categoryConfig?.tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    section: "PROFILE BUILDER",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
  })) || [];

  const guideTabs: DashboardTab[] = [
    {
      id: "guide-overview",
      label: "Platform Overview",
      section: "HELP & GUIDES",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    },
    {
      id: "guide-profile",
      label: "Profile Optimization",
      section: "HELP & GUIDES",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
    },
    {
      id: "guide-faqs",
      label: "FAQs & Support",
      section: "HELP & GUIDES",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    }
  ];

  const allTabs = [...baseTabs, ...schemaTabs, ...customTabs, ...guideTabs];

  return (
    <DashboardLayout 
      roleName={`${expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1)} Portal`} 
      tabs={allTabs} 
      activeTab={activeTab} 
      onTabChange={(tabId) => {
        if (tabId === "home") setActiveTab("home");
        else setActiveTab(tabId);
      }}
      userProfile={entityData.id ? {
        name: entityData.name || "Provider",
        subtitle: userEmail,
        profileUrl: `${origin}/profile/${expectedRole}/${entityData.id}`
      } : undefined}
      homeWidget={entityData.isPublished && renderHomeWidget ? renderHomeWidget(entityData) : defaultPulseHero}
      hideDefaultModulesList={!entityData.isPublished}
    >
      <div className="max-w-4xl mx-auto pb-24">

        {/* BREADCRUMBS */}
        {activeTab !== "home" && (
          <div className="flex items-center gap-3 mb-8 text-sm font-bold text-slate-500 animate-in fade-in slide-in-from-top-2">
            <button onClick={() => setActiveTab("home")} className="hover:text-slate-900 transition-colors">Dashboard Home</button>
            <span>/</span>
            <span className="text-teal-600">{allTabs.find(t => t.id === activeTab)?.label || "Step"}</span>
          </div>
        )}
        
        {/* PROGRESS BAR WIDGET */}
        {(activeTab === "identity" || activeTab === "location" || categoryConfig?.tabs.some(t => t.id === activeTab)) && (
          <div className="bg-white/50 backdrop-blur-[40px] rounded-[32px] p-6 mb-8 shadow-sm border border-white/60 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-slate-800">Profile Completion</h3>
                <p className="text-xs text-slate-500 font-medium">Reach 100% on mandatory fields to publish your directory page.</p>
              </div>
              <span className="text-2xl font-black text-teal-600">{completionPercentage}%</span>
            </div>
            <div className="bg-slate-200/50 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-1000 ease-out relative ${completionPercentage === 100 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-sky-400 to-cyan-500'}`}
                style={{ width: `${Math.max(5, completionPercentage)}%` }}
              >
                <div className="absolute inset-0 bg-white/30 -skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>
        )}

        {/* OWNER KYC TAB */}
        {activeTab === "owner_kyc" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Owner Verification (KYC)</h3>
            
            <div className="mb-8 bg-amber-50 border border-amber-200 p-6 rounded-2xl">
              <h4 className="text-amber-800 font-bold mb-2">Legal Verification Required</h4>
              <p className="text-sm text-amber-700">To maintain trust in the DehaPa platform, you must verify your identity as the legal owner/director of this business before you can publish its directory listing.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                    Owner / Director Full Name <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={entityData.ownerName || ''}
                    onChange={e => setEntityData({ ...entityData, ownerName: e.target.value })}
                    className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                    Legal Entity Name (e.g. XYZ Pvt Ltd) <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={entityData.legalEntityName || ''}
                    onChange={e => setEntityData({ ...entityData, legalEntityName: e.target.value })}
                    className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                    Owner Personal ID (Aadhaar/PAN) <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <ImageUpload 
                    defaultImage={entityData.ownerPersonalId}
                    onChange={(url) => setEntityData({ ...entityData, ownerPersonalId: url })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                    Business Registration / GST <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <ImageUpload 
                    defaultImage={entityData.businessRegistrationProof}
                    onChange={(url) => setEntityData({ ...entityData, businessRegistrationProof: url })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <AutosaveIndicator status={saveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* STAFF MANAGEMENT TAB */}
        {activeTab === "staff_management" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Staff & Team Access</h3>
              <button 
                onClick={() => {
                  const staff = entityData.staffList || [];
                  setEntityData({ ...entityData, staffList: [...staff, { name: "", email: "", role: "Admin" }] });
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-colors"
              >
                + Add Staff Member
              </button>
            </div>

            <div className="mb-6 bg-slate-50 border border-slate-200 p-6 rounded-2xl">
              <h4 className="font-bold text-slate-800 mb-2">Delegated Access</h4>
              <p className="text-sm text-slate-600">Invite your receptionists, managers, or doctors to access this dashboard. You can revoke their access at any time.</p>
            </div>

            <div className="space-y-4">
              {(!entityData.staffList || entityData.staffList.length === 0) ? (
                <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-500 font-medium">No staff members added yet. Click above to add your team.</p>
                </div>
              ) : (
                entityData.staffList.map((staff: any, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative group">
                    <button 
                      onClick={() => {
                        const newStaff = [...entityData.staffList];
                        newStaff.splice(idx, 1);
                        setEntityData({ ...entityData, staffList: newStaff });
                      }}
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove Staff"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    
                    <div className="grid md:grid-cols-3 gap-4 mr-8">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-widest">Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Rahul Sharma"
                          value={staff.name}
                          onChange={e => {
                            const newStaff = [...entityData.staffList];
                            newStaff[idx].name = e.target.value;
                            setEntityData({ ...entityData, staffList: newStaff });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-widest">Gmail / Google Account</label>
                        <input 
                          type="email" 
                          placeholder="rahul@gmail.com"
                          value={staff.email}
                          onChange={e => {
                            const newStaff = [...entityData.staffList];
                            newStaff[idx].email = e.target.value;
                            setEntityData({ ...entityData, staffList: newStaff });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-widest">Role</label>
                        <div className="flex items-center gap-3">
                          <select 
                            value={staff.role}
                            onChange={e => {
                              const newStaff = [...entityData.staffList];
                              newStaff[idx].role = e.target.value;
                              setEntityData({ ...entityData, staffList: newStaff });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                          >
                            <option value="Admin">Full Admin</option>
                            <option value="Receptionist">Receptionist (Bookings Only)</option>
                          </select>
                          
                          <button 
                            onClick={() => {
                              if (!staff.email) return alert("Please enter an email first.");
                              if (confirm(`CAUTION: Sending this invitation will grant ${staff.email} access to this dashboard.\n\nAre you sure you want to send the invitation?`)) {
                                alert(`Invitation sent to ${staff.email}!`);
                              }
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm"
                          >
                            Send Invite
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
              <AutosaveIndicator status={saveStatus} />
            </div>
          </div>
        )}

        {/* IDENTITY TAB */}
        {activeTab === "identity" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Property Identity & Info</h3>
            
            <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">Profile Visibility</h4>
                <p className="text-xs text-slate-500">
                  {completionPercentage < 100 
                    ? "Complete all mandatory fields to enable publication." 
                    : "When turned on, your profile will be visible in the public directory."}
                </p>
              </div>
              <label className={`relative inline-flex items-center ${completionPercentage < 100 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={entityData.isPublished === true}
                  disabled={completionPercentage < 100}
                  onChange={(e) => setEntityData({ ...entityData, isPublished: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
              </label>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                  Profile Photo <span className="text-rose-500 ml-1">*</span>
                </label>
                <ImageUpload 
                  defaultImage={entityData.image}
                  onChange={(url) => setEntityData({ ...entityData, image: url })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                    Business/Provider Name <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={entityData.name || ''}
                    onChange={e => setEntityData({ ...entityData, name: e.target.value })}
                    className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                    Phone Number <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={entityData.phone || ''}
                    onChange={e => setEntityData({ ...entityData, phone: e.target.value })}
                    className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="sd-label-v3 flex justify-between">
                    Custom Vanity URL
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Premium</span>
                  </label>
                  <div className="flex w-full">
                    <span className="inline-flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 text-slate-500 rounded-l-2xl font-mono text-sm shrink-0">dehapa.com/{expectedRole === 'pharmacy' ? 'pharmacies' : `${expectedRole}s`}/</span>
                    <input type="text" className="sd-input-v3 rounded-none bg-slate-50" disabled value={entityData.customSlug || ""} />
                    <button onClick={() => setIsSlugModalOpen(true)} className="px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-r-2xl text-sm transition-colors whitespace-nowrap shadow-sm">
                      Reserve URL
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Reserve your exclusive {expectedRole} web address.</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                  About / Description <span className="text-rose-500 ml-1">*</span>
                </label>
                <textarea 
                  value={entityData.about || ''}
                  onChange={e => setEntityData({ ...entityData, about: e.target.value })}
                  rows={4}
                  className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all resize-none" 
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
                <AutosaveIndicator status={saveStatus} />
              </div>
            </div>

            <PremiumSlugModal 
              isOpen={isSlugModalOpen} 
              onClose={() => setIsSlugModalOpen(false)} 
              currentName={entityData.name || ""} 
              currentUglyUrl={`dehapa.com/${expectedRole === 'pharmacy' ? 'pharmacies' : `${expectedRole}s`}/${entityData.id || "new"}`} 
            />
          </div>
        )}

        {/* BANK DETAILS TAB */}
        {activeTab === "bank_details" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Bank & Payout Details</h3>
            
            <div className="mb-8 bg-emerald-50 border border-emerald-200 p-6 rounded-2xl">
              <h4 className="text-emerald-800 font-bold mb-2">Payouts Information</h4>
              <p className="text-sm text-emerald-700">DehaPa will deposit all online booking payments directly into this bank account. Please ensure the account name matches your registered legal entity name.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                    Account Holder Name
                  </label>
                  <input 
                    type="text" 
                    value={entityData.bankAccountName || ''}
                    onChange={e => setEntityData({ ...entityData, bankAccountName: e.target.value })}
                    placeholder="e.g. XYZ Pvt Ltd"
                    className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                    Bank Name
                  </label>
                  <input 
                    type="text" 
                    value={entityData.bankName || ''}
                    onChange={e => setEntityData({ ...entityData, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank"
                    className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                    Account Number
                  </label>
                  <input 
                    type="text" 
                    value={entityData.bankAccountNumber || ''}
                    onChange={e => setEntityData({ ...entityData, bankAccountNumber: e.target.value })}
                    placeholder="14-digit Account No."
                    className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                    IFSC Code
                  </label>
                  <input 
                    type="text" 
                    value={entityData.bankIfscCode || ''}
                    onChange={e => setEntityData({ ...entityData, bankIfscCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. HDFC0001234"
                    className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                  Cancelled Cheque Photo
                </label>
                <ImageUpload 
                  defaultImage={entityData.cancelledChequeImage}
                  onChange={(url) => setEntityData({ ...entityData, cancelledChequeImage: url })}
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
                <AutosaveIndicator status={saveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT VAULT TAB */}
        {activeTab === "document_vault" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Document Vault</h3>
            
            <div className="mb-8 bg-blue-50 border border-blue-200 p-6 rounded-2xl">
              <h4 className="text-blue-800 font-bold mb-2">Secure Operational Licenses</h4>
              <p className="text-sm text-blue-700">Upload your operational licenses (e.g. NABH, Fire Safety, Trade License, Pollution Control). These documents remain strictly confidential and are used only for internal verification and compliance checks by DehaPa administration.</p>
            </div>

            <div className="space-y-6">
              <ObjectArrayEditor 
                title="Operational Licenses & Certificates"
                description="Add multiple operational certificates. Click below to upload a new document."
                items={entityData.documentVault || []}
                onChange={(items) => setEntityData({ ...entityData, documentVault: items })}
                fields={[
                  { key: "documentName", label: "Document Name (e.g. Fire Safety Certificate)", type: "text" },
                  { key: "documentImage", label: "Upload Document Scan", type: "image_upload" }
                ]}
              />

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
                <AutosaveIndicator status={saveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* LOCATION TAB */}
        {activeTab === "location" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Location & Address</h3>
            <AddressBlock 
              data={{
                country: entityData.country || 'India',
                state: entityData.state || 'Odisha',
                district: entityData.district || '',
                block: entityData.block || '',
                city: entityData.city || '',
                pincode: entityData.pin || '',
                localAddress: entityData.address || ''
              }} 
              onChange={(newData) => {
                setEntityData({
                  ...entityData,
                  country: newData.country,
                  state: newData.state,
                  district: newData.district,
                  block: newData.block,
                  city: newData.city,
                  pin: newData.pincode,
                  address: newData.localAddress
                });
              }} 
            />
            <div className="mt-6">
               <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">Google Maps Embed URL</label>
               <input 
                 type="text" 
                 value={entityData.mapUrl || ''}
                 onChange={e => setEntityData({ ...entityData, mapUrl: e.target.value })}
                 placeholder="<iframe src='...' /> or https://www.google.com/maps/embed?pb=..."
                 className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all" 
               />
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
              <AutosaveIndicator status={saveStatus} />
            </div>
          </div>
        )}

        {/* SCHEMA DYNAMIC TABS */}
        {categoryConfig?.tabs.map(tab => {
          if (activeTab === tab.id) {
            return (
              <div key={tab.id} className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">{tab.label}</h3>

                <div className="space-y-8">
                  {tab.fields.map(field => {
                    if (isFieldHidden(field, entityData)) return null;
                    return (
                    <div key={field.key} className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm hover:border-white transition-all">
                      {field.type === 'object_array' && field.arrayFields ? (
                        <ObjectArrayEditor
                          title={field.label}
                          items={entityData[field.key] || []}
                          fields={field.arrayFields}
                          onUpdate={(idx, k, val) => {
                            const newArr = [...(entityData[field.key] || [])];
                            newArr[idx] = { ...newArr[idx], [k]: val };
                            setEntityData({...entityData, [field.key]: newArr});
                          }}
                          onAdd={() => {
                            const emptyObj: any = {};
                            field.arrayFields?.forEach(af => emptyObj[af.key] = '');
                            setEntityData({...entityData, [field.key]: [...(entityData[field.key] || []), emptyObj]});
                          }}
                          onRemove={(idx) => {
                            const newArr = [...(entityData[field.key] || [])];
                            newArr.splice(idx, 1);
                            setEntityData({...entityData, [field.key]: newArr});
                          }}
                          currentUserId={entityData.id || ''}
                          currentUserRole={expectedRole}
                          currentUserName={entityData.name || ''}
                        />
                      ) : field.type === 'string_array' ? (
                        <>
                          <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-widest">{field.label}</h4>
                          <InlineEditArray 
                            items={entityData[field.key] || []} 
                            onSave={(newItems) => setEntityData({...entityData, [field.key]: newItems})} 
                            isEditMode={true}
                            placeholder={field.placeholder || "Add item..."} 
                            suggestions={field.options}
                          />
                        </>
                      ) : (
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                            {field.label} {field.mandatory && <span className="text-rose-500 ml-1">*</span>}
                          </label>
                          {field.type === 'entity_selector' ? (
                              <HybridEntitySelector
                                targetEntity={field.targetEntity || 'Doctor'}
                                placeholder={field.placeholder}
                                selectedItems={entityData[field.key] || []}
                                onChange={(items) => setEntityData({...entityData, [field.key]: items})}
                                currentUserId={entityData.id || ''}
                                currentUserRole={expectedRole}
                                currentUserName={entityData.name || ''}
                              />
                          ) : field.type === 'textarea' ? (
                              <textarea 
                                value={entityData[field.key] || ''} 
                                onChange={e => setEntityData({...entityData, [field.key]: e.target.value})} 
                                placeholder={field.placeholder}
                                rows={3}
                                className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all resize-none"
                              />
                          ) : field.type === 'image_upload' ? (
                              <ImageUpload 
                                defaultImage={entityData[field.key] || ''}
                                onChange={(url) => setEntityData({...entityData, [field.key]: url})}
                              />
                          ) : field.type === 'hybrid_test_array' ? (
                              <HybridTestMenuEditor
                                items={entityData[field.key] || []}
                                onChange={(items) => setEntityData({...entityData, [field.key]: items})}
                                labId={entityData.id || ''}
                              />
                          ) : field.type === 'select' ? (
                              <select 
                                value={entityData[field.key] || ''} 
                                onChange={e => setEntityData({...entityData, [field.key]: e.target.value})}
                                className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all"
                              >
                                <option value="">Select option</option>
                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                          ) : field.type === 'boolean' ? (
                              <label className="flex items-center gap-3 mt-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={entityData[field.key] || false} 
                                  onChange={e => setEntityData({...entityData, [field.key]: e.target.checked})} 
                                  className="w-5 h-5 text-cyan-500 rounded border-slate-300 focus:ring-cyan-500"
                                />
                                <span className="text-sm font-bold text-slate-700">Yes, this applies</span>
                              </label>
                          ) : (
                              <input 
                                type={field.type === 'number' ? 'number' : 'text'}
                                value={entityData[field.key] || ''} 
                                onChange={e => setEntityData({...entityData, [field.key]: e.target.value})} 
                                placeholder={field.placeholder}
                                className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all"
                              />
                          )}
                        </div>
                      )}
                    </div>
                  )})}
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
                  <AutosaveIndicator status={saveStatus} />
                </div>
              </div>
            );
          }
          return null;
        })}

        {/* CUSTOM TABS RENDERER */}
        {renderCustomTab && renderCustomTab(activeTab, entityData)}

        {/* GUIDES RENDERER */}
        {activeTab === "guide-overview" && (
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-black text-slate-900 mb-6 font-serif">Platform Overview</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
              <p className="text-lg">Welcome to the DehaPa Healthcare Network! This dashboard is your central command center for managing your digital presence.</p>
              
              <div className="bg-teal-50 border border-teal-100 p-6 rounded-2xl">
                <h3 className="text-teal-800 font-bold mb-2">How it works</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Profile Builder:</strong> Use the tabs above to enter your facility details. Our smart system will dynamically ask you for specific licenses based on the services you claim to offer.</li>
                  <li><strong>Auto-Save:</strong> Don't worry about losing data. Every field saves automatically the moment you stop typing.</li>
                  <li><strong>Publishing:</strong> You must complete 100% of the mandatory fields before you can flip the switch to go Live!</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "guide-profile" && (
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-black text-slate-900 mb-6 font-serif">Optimizing Your Profile</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
              <p className="text-lg">A completed profile is only the beginning. Here is how you ensure you stand out and build trust with patients.</p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">High-Quality Imagery</h3>
                  <p className="text-sm">Upload bright, clear photos of your facade, ICU, and machinery. Profiles with high-quality images receive 3x more patient engagement.</p>
                </div>
                
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Verify Licenses</h3>
                  <p className="text-sm">Ensure your uploaded licenses are legible. Our moderation team reviews these manually to award you the "Verified" badge.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "guide-faqs" && (
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-black text-slate-900 mb-6 font-serif">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                <h3 className="font-bold text-slate-800 mb-2">Why can't I select multiple Primary Facility Types?</h3>
                <p className="text-sm text-slate-600">To maintain directory integrity, you must choose your core identity (e.g. Nursing Home). You can then use the "Add-On Services" field to indicate additional capabilities like an In-House Pharmacy or Blood Bank.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                <h3 className="font-bold text-slate-800 mb-2">Why do I need to upload my PCPNDT Certificate?</h3>
                <p className="text-sm text-slate-600">If you claim to offer "Radiology & Imaging", Indian law mandates a valid PCPNDT registration. This document verification is required to maintain the safety and legality of the DehaPa network.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                <h3 className="font-bold text-slate-800 mb-2">How do I get help?</h3>
                <p className="text-sm text-slate-600">You can reach our dedicated support team 24/7 at support@dehapa.com or call our partner hotline.</p>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM WIZARD NAVIGATION */}
        {activeTab !== "home" && (
          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 mt-12 mb-20 animate-in fade-in slide-in-from-bottom-2">
            <button onClick={() => setActiveTab("home")} className="text-slate-500 hover:text-slate-900 font-bold px-6 py-4 transition-colors">
              Return to Dashboard
            </button>
            
            <button 
              onClick={() => {
                const currentIndex = allTabs.findIndex(t => t.id === activeTab);
                if (currentIndex >= 0 && currentIndex < allTabs.length - 1) {
                  setActiveTab(allTabs[currentIndex + 1].id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setActiveTab("home");
                }
              }} 
              className="w-full md:w-auto sd-btn-premium bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all"
            >
              {allTabs.findIndex(t => t.id === activeTab) === allTabs.length - 1 ? "Save & Finish ➔" : "Save & Continue ➔"}
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
