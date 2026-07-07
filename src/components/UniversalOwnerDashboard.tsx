"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import { useRouter, useSearchParams } from 'next/navigation';
import AddressBlock, { AddressData } from '@/components/AddressBlock';
import { useAutosave } from '@/hooks/useAutosave';
import ChatInboxWidget from '@/components/chat/ChatInboxWidget';
import OrderInboxWidget from '@/components/chat/OrderInboxWidget';
import AutosaveIndicator from '@/components/AutosaveIndicator';
import ImageUpload from '@/components/ImageUpload';
import ObjectArrayEditor from '@/components/ObjectArrayEditor';
import InlineEditArray from '@/components/InlineEditArray';
import HybridEntitySelector from '@/components/HybridEntitySelector';
import HybridTestMenuEditor from '@/components/HybridTestMenuEditor';
import { doc, getDocs, updateDoc, collection, query, where, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { directoryConfig } from '@/lib/directoryConfig';
import EntitySelector from '@/components/EntitySelector';
import PremiumSlugModal from '@/components/PremiumSlugModal';
import UniversalPersonalForm from '@/components/UniversalPersonalForm';
import WalletDashboard from '@/components/payments/WalletDashboard';
import MyNetworkHub from '@/components/network/MyNetworkHub';
import SupportDashboard from '@/components/SupportDashboard';

interface UniversalOwnerDashboardProps {
  expectedRole: string; // e.g. "pharmacy", "lab", "ambulance", "doctor", "hospital"
  customTabs?: DashboardTab[];
  renderCustomTab?: (tabId: string, entityData: any) => React.ReactNode;
  renderHomeWidget?: (entityData: any) => React.ReactNode;
}

function UniversalOwnerDashboardContent({ expectedRole, customTabs = [], renderCustomTab, renderHomeWidget }: UniversalOwnerDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminViewId = searchParams?.get('adminViewId') || null;
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
      setUserEmail(email);
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

  const [chatTargetId, setChatTargetId] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setChatTargetId(e.detail);
      setActiveTab('inbox');
    };
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  // Dynamic State for the Entity
  const [entityData, setEntityData] = useState<any>({});
  const [currentUserRole, setCurrentUserRole] = useState<string>('Owner');

  useEffect(() => {
    if (currentUserRole === "Driver" && activeTab === "home") {
      setActiveTab("dispatch");
    }
  }, [currentUserRole, activeTab]);
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
        const staffEmails = (entityData.staffList || []).map((s: any) => s.email).filter(Boolean);
        const driverEmails = (entityData.driverMapping || []).map((d: any) => d.driverEmail).filter(Boolean);
        const allStaffEmails = Array.from(new Set([...staffEmails, ...driverEmails]));
        const dataToSave = { ...entityData, staffEmails: allStaffEmails };
        await updateDoc(docRef, dataToSave);
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
      
      if ((role === expectedRole || role === "super_admin" || (expectedRole === "ambulance" && role === "ambulance_driver") || role === "staff") && email) {
        setAccessGranted(true);
        setUserEmail(email);
        fetchEntity(email, role === "super_admin" ? adminViewId : null);
      } else {
        setAccessGranted(false);
        router.push("/portal");
      }
    }
  }, [router, expectedRole, adminViewId]);

  const fetchEntity = async (email: string, impersonateId: string | null = null) => {
    setLoading(true);
    try {
      let snap: any;
      if (impersonateId) {
        const docRef = doc(db, "directory", impersonateId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          snap = { empty: false, docs: [docSnap] };
        } else {
          snap = { empty: true };
        }
      } else {
        let q = query(collection(db, "directory"), where("ownerEmail", "==", email));
        snap = await getDocs(q);
        
        if (snap.empty) {
          // Fallback to checking if the user is a staff member
          q = query(collection(db, "directory"), where("staffEmails", "array-contains", email));
          snap = await getDocs(q);
        }
      }

      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setEntityDocId(docSnap.id);
        const data = docSnap.data();
        
        // Find the specific staff member's role if they are staff
        if (data.ownerEmail !== email) {
          let roleAssigned = false;
          if (data.staffList) {
            const staffMember = data.staffList.find((s: any) => s.email === email);
            if (staffMember) {
               setCurrentUserRole(staffMember.role);
               roleAssigned = true;
            }
          }
          if (!roleAssigned && data.driverMapping) {
            const driver = data.driverMapping.find((d: any) => d.driverEmail === email);
            if (driver) {
               setCurrentUserRole('ambulance_driver');
               roleAssigned = true;
            }
          }
          if (!roleAssigned) setCurrentUserRole('Owner');
        } else {
             setCurrentUserRole('Owner');
        }

        setEntityData({ id: docSnap.id, ...data });
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
              {entityData.adminLocked ? "Locked by System Administration" : (entityData.isPublished ? "Your profile is Live." : entityData.status === 'pending_approval' ? "Under Review" : "Activate Your Profile.")}
            </h1>
            <p className="text-slate-600 text-lg max-w-xl font-medium">
              {entityData.adminLocked 
                ? "Your profile has been locked due to an administrative action or policy violation." 
                : (entityData.isPublished 
                  ? "Patients can now find you in the directory. Access your tools below." 
                  : entityData.status === 'pending_approval'
                  ? "Your profile has been submitted and is currently being reviewed by our verification team."
                  : "Complete your setup to unlock the 'Submit' switch. Auto-save is always on.")}
            </p>
        </div>

        <div className="shrink-0 bg-white/80 backdrop-blur-md border border-slate-100 p-6 rounded-3xl shadow-lg flex flex-col items-center gap-4 w-full lg:min-w-[280px]">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Profile Strength</div>
          
          <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-4 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${Math.max(5, completionPercentage)}%` }}>
               {completionPercentage > 10 && <span className="absolute right-2 top-0 text-[10px] text-white font-bold leading-4">{completionPercentage}%</span>}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {entityData.adminLocked ? (
              <button 
                onClick={() => setActiveTab("help")}
                className="w-full py-4 px-8 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-md bg-rose-50 text-rose-600 border-2 border-rose-500 hover:bg-rose-100"
              >
                Contact Support
              </button>
            ) : (
              <button 
                onClick={() => {
                  if (!isReady) return;
                  if (entityData.status === 'draft' || !entityData.status) {
                    setEntityData({ ...entityData, status: 'pending_approval' });
                  } else if (entityData.isPublished) {
                    setEntityData({ ...entityData, isPublished: false, status: 'draft' });
                  }
                }}
                disabled={!isReady}
                className={`w-full py-4 px-8 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-md ${
                  entityData.isPublished 
                    ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-500" 
                    : entityData.status === 'pending_approval'
                      ? "bg-amber-50 text-amber-600 border-2 border-amber-500 cursor-not-allowed opacity-90"
                      : isReady 
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-xl hover:scale-105" 
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {entityData.isPublished ? "✓ Public & Live" : entityData.status === 'pending_approval' ? "Pending Admin Approval" : isReady ? "Submit for Approval" : "Locked"}
              </button>
            )}
            {!isReady && !entityData.adminLocked && <p className="text-xs text-rose-500 font-bold">Reach 100% to unlock</p>}
          </div>
        </div>
      </div>
    </div>
  );

  // Build Tabs Dynamically
  const baseTabs: DashboardTab[] = [
    {
      id: "owner_kyc",
      label: "Owner KYC & Verification",
      section: "CORE SETUP",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
    },
    {
      id: "staff_management",
      label: "Staff & Team Access",
      section: "ADMINISTRATION",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    {
      id: "personal",
      label: "Personal Information",
      section: "CORE SETUP",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
    },
    {
      id: "identity",
      label: "Property Identity & Info",
      section: "CORE SETUP",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
    },

    {
      id: "bank_details",
      label: "Bank & Payout Details",
      section: "FINANCE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
    },
    {
      id: "document_vault",
      label: "Document Vault",
      section: "ADMINISTRATION",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
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
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
    },
    {
      id: "wallet",
      label: "Wallet & Payouts",
      section: "FINANCE",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    }
  ];

  const capitalizedRole = expectedRole ? expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1) : "";
  const schemaTabs: DashboardTab[] = directoryConfig[capitalizedRole as keyof typeof directoryConfig]?.tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    section: "CORE SETUP",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
  })) || [];



  const guideTabs: DashboardTab[] = [
    {
      id: "guide-overview",
      label: "Platform Overview",
      section: "SUPPORT & UTILITIES",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    },
    {
      id: "guide-profile",
      label: "Profile Optimization",
      section: "SUPPORT & UTILITIES",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
    },
    {
      id: "help",
      label: "Help & Support",
      section: "SUPPORT & UTILITIES",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 100 12.728M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    }
  ];

  const faqData = [
    {
      question: "Why can't I select multiple Primary Facility Types?",
      answer: "To maintain directory integrity, you must choose your core identity (e.g. Nursing Home). You can then use the \"Add-On Services\" field to indicate additional capabilities like an In-House Pharmacy or Blood Bank.",
      category: "Configuration"
    },
    {
      question: "Why do I need to upload my PCPNDT Certificate?",
      answer: "If you claim to offer \"Radiology & Imaging\", Indian law mandates a valid PCPNDT registration. This document verification is required to maintain the safety and legality of the DehaPa network.",
      category: "Compliance"
    }
  ];

  const frontBaseTabs = baseTabs.filter(t => t.id === "personal" || t.id === "identity");
  const rearBaseTabs = baseTabs.filter(t => t.id === "bank_details");
  const otherBaseTabs = baseTabs.filter(t => !["personal", "identity", "bank_details"].includes(t.id));

  let allTabs = [...frontBaseTabs, ...schemaTabs, ...rearBaseTabs, ...otherBaseTabs, ...customTabs, ...guideTabs];

  // ROLE-BASED ACCESS CONTROL (RBAC)
  if (currentUserRole === "Driver" || currentUserRole === "ambulance_driver") {
    allTabs = allTabs.filter(t => ["dispatch", "medical_vault", "driver_wallet", "help"].includes(t.id));
  } else {
    allTabs = allTabs.filter(t => t.id !== "driver_wallet");
  }

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
        {(activeTab === "identity" || categoryConfig?.tabs.some(t => t.id === activeTab)) && (
          <div className="bg-black/20 backdrop-blur-[40px] rounded-[32px] p-6 mb-8 shadow-sm border border-white/10 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-white">Profile Completion</h3>
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
          <div className="bg-slate-700/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-black text-white mb-6 border-b border-slate-100 pb-4 tracking-tight">Owner Verification (KYC)</h3>
            
            <div className="mb-8 bg-amber-50 border border-amber-200 p-6 rounded-2xl">
              <h4 className="text-amber-800 font-bold mb-2">Legal Verification Required</h4>
              <p className="text-sm text-amber-700">To maintain trust in the DehaPa platform, you must verify your identity as the legal owner/director of this business before you can publish its directory listing.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="sd-label-v3">
                    Owner / Director Full Name <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={entityData.ownerName || ''}
                    onChange={e => setEntityData({ ...entityData, ownerName: e.target.value })}
                    className="sd-input-v3" 
                  />
                </div>
                <div>
                  <label className="sd-label-v3">
                    Legal Entity Name (e.g. XYZ Pvt Ltd) <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={entityData.legalEntityName || ''}
                    onChange={e => setEntityData({ ...entityData, legalEntityName: e.target.value })}
                    className="sd-input-v3" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <label className="sd-label-v3">
                    Owner Personal ID (Aadhaar/PAN) <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <ImageUpload 
                    defaultImage={entityData.ownerPersonalId}
                    onChange={(url) => setEntityData({ ...entityData, ownerPersonalId: url })}
                  />
                </div>
                <div>
                  <label className="sd-label-v3">
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
          <div className="bg-slate-700/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-white">Staff & Team Access</h3>
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

            <div className="mb-6 bg-black/20 backdrop-blur-3xl border border-white/10 p-6 rounded-2xl">
              <h4 className="font-bold text-white mb-2">Delegated Access</h4>
              <p className="text-sm text-slate-300">Invite your receptionists, managers, or doctors to access this dashboard. You can revoke their access at any time.</p>
            </div>

            <div className="space-y-4">
              {(!entityData.staffList || entityData.staffList.length === 0) ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/20">
                  <p className="text-slate-400 font-medium">No staff members added yet. Click above to add your team.</p>
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
                          className="w-full bg-black/20 backdrop-blur-3xl border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" 
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
                          className="w-full bg-black/20 backdrop-blur-3xl border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" 
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
                            className="w-full bg-black/20 backdrop-blur-3xl border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                          >
                            <option value="Admin">Full Admin</option>
                            <option value="Receptionist">Receptionist (Bookings Only)</option>
                            {expectedRole === "ambulance" && <option value="Driver">Ambulance Driver</option>}
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
                    {staff.role === "Driver" && expectedRole === "ambulance" && (
                      <div className="grid md:grid-cols-2 gap-4 mt-4 bg-black/5 p-4 rounded-xl border border-white/10">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-widest">Vehicle Reg No.</label>
                          <input 
                            type="text" 
                            placeholder="e.g. OD-02-AB-1234"
                            value={staff.vehicleRegNo || ""}
                            onChange={e => {
                              const newStaff = [...entityData.staffList];
                              newStaff[idx].vehicleRegNo = e.target.value;
                              setEntityData({ ...entityData, staffList: newStaff });
                            }}
                            className="w-full bg-black/20 backdrop-blur-3xl border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-widest">Vehicle Type</label>
                          <select
                            value={staff.vehicleType || ""}
                            onChange={e => {
                              const newStaff = [...entityData.staffList];
                              newStaff[idx].vehicleType = e.target.value;
                              setEntityData({ ...entityData, staffList: newStaff });
                            }}
                            className="w-full bg-black/20 backdrop-blur-3xl border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                          >
                            <option value="">Select Type</option>
                            <option value="Basic Life Support">Basic Life Support</option>
                            <option value="Advanced Life Support (ICU)">Advanced Life Support (ICU)</option>
                            <option value="Patient Transport">Patient Transport</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
              <AutosaveIndicator status={saveStatus} />
            </div>
          </div>
        )}

        {/* PERSONAL INFORMATION TAB */}
        {activeTab === "personal" && (
          <div className="bg-slate-700/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-black text-white mb-6 border-b border-slate-100 pb-4 tracking-tight">Personal Information</h3>
            <UniversalPersonalForm 
              entityData={entityData} 
              onChange={setEntityData} 
              portalType={expectedRole as any} 
              isFamilyMember={false} 
            />
          </div>
        )}

        {activeTab === "inbox" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-[#0A1128] mb-8">Inbox & Live Orders</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Patient Chat Inbox */}
              <div>
                 <h3 className="text-xl font-bold text-[#0A1128] mb-4">Patient Chats</h3>
                 <ChatInboxWidget initialTargetId={chatTargetId} />
              </div>
              
              {/* Live Booking Orders */}
              <div>
                 <h3 className="text-xl font-bold text-[#0A1128] mb-4">Live Service Requests</h3>
                 <OrderInboxWidget ownerEmail={userEmail || ''} />
              </div>
            </div>
          </div>
        )}

        {/* IDENTITY TAB */}
        {activeTab === "identity" && (
          <div className="bg-slate-700/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-black text-white mb-6 border-b border-slate-100 pb-4 tracking-tight">Property Identity & Info</h3>
            
            <div className="mb-8 p-4 bg-black/20 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">Profile Visibility</h4>
                <p className="text-xs text-slate-500">
                  {completionPercentage < 100 
                    ? "Complete all mandatory fields to enable publication." 
                    : "When turned on, your profile will be visible in the public directory."}
                </p>
              </div>
              <label className={`relative inline-flex items-center ${(completionPercentage < 100 || entityData.adminLocked) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={entityData.isPublished === true && !entityData.adminLocked}
                  disabled={completionPercentage < 100 || entityData.adminLocked}
                  onChange={(e) => setEntityData({ ...entityData, isPublished: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
              </label>
            </div>

            <div className="space-y-6">
              <div>
                <label className="sd-label-v3">
                  Profile Photo <span className="text-rose-500 ml-1">*</span>
                </label>
                <ImageUpload 
                  defaultImage={entityData.image}
                  onChange={(url) => setEntityData({ ...entityData, image: url })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="sd-label-v3">
                    Business/Provider Name <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={entityData.name || ''}
                    onChange={e => setEntityData({ ...entityData, name: e.target.value })}
                    className="sd-input-v3" 
                  />
                </div>
                <div>
                  <label className="sd-label-v3">
                    Phone Number <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={entityData.phone || ''}
                    onChange={e => setEntityData({ ...entityData, phone: e.target.value })}
                    className="sd-input-v3" 
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
                <label className="sd-label-v3">
                  About / Description <span className="text-rose-500 ml-1">*</span>
                </label>
                <textarea 
                  value={entityData.about || ''}
                  onChange={e => setEntityData({ ...entityData, about: e.target.value })}
                  rows={4}
                  className="sd-input-v3 resize-none" 
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 mt-8">
                <AutosaveIndicator status={saveStatus} />
                <button onClick={() => setActiveTab("help")} className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl transition-colors border border-amber-200 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Need help filling up this form?
                </button>
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
          <div className="bg-slate-700/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-black text-white mb-6 border-b border-slate-100 pb-4 tracking-tight">Bank & Payout Details</h3>
            
            <div className="mb-8 bg-emerald-50 border border-emerald-200 p-6 rounded-2xl">
              <h4 className="text-emerald-800 font-bold mb-2">Payouts Information</h4>
              <p className="text-sm text-emerald-700">DehaPa will deposit all online booking payments directly into this bank account. Please ensure the account name matches your registered legal entity name.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="sd-label-v3">
                    Account Holder Name
                  </label>
                  <input 
                    type="text" 
                    value={entityData.bankAccountName || ''}
                    onChange={e => setEntityData({ ...entityData, bankAccountName: e.target.value })}
                    placeholder="e.g. XYZ Pvt Ltd"
                    className="sd-input-v3" 
                  />
                </div>
                <div>
                  <label className="sd-label-v3">
                    Bank Name
                  </label>
                  <input 
                    type="text" 
                    value={entityData.bankName || ''}
                    onChange={e => setEntityData({ ...entityData, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank"
                    className="sd-input-v3" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="sd-label-v3">
                    Account Number
                  </label>
                  <input 
                    type="text" 
                    value={entityData.bankAccountNumber || ''}
                    onChange={e => setEntityData({ ...entityData, bankAccountNumber: e.target.value })}
                    placeholder="14-digit Account No."
                    className="sd-input-v3" 
                  />
                </div>
                <div>
                  <label className="sd-label-v3">
                    IFSC Code
                  </label>
                  <input 
                    type="text" 
                    value={entityData.bankIfscCode || ''}
                    onChange={e => setEntityData({ ...entityData, bankIfscCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. HDFC0001234"
                    className="sd-input-v3" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="sd-label-v3">
                    Standard UPI ID
                  </label>
                  <input 
                    type="text" 
                    value={entityData.bankUpiId || ''}
                    onChange={e => setEntityData({ ...entityData, bankUpiId: e.target.value })}
                    placeholder="e.g. hospital@upi"
                    className="sd-input-v3" 
                  />
                </div>
                <div>
                  <label className="sd-label-v3">
                    Google Pay Number
                  </label>
                  <input 
                    type="text" 
                    value={entityData.gpayNumber || ''}
                    onChange={e => setEntityData({ ...entityData, gpayNumber: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="sd-input-v3" 
                  />
                </div>
                <div>
                  <label className="sd-label-v3">
                    PhonePe Number
                  </label>
                  <input 
                    type="text" 
                    value={entityData.phonepeNumber || ''}
                    onChange={e => setEntityData({ ...entityData, phonepeNumber: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="sd-input-v3" 
                  />
                </div>
              </div>
              
              <div>
                <label className="sd-label-v3">
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
          <div className="bg-slate-700/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-black text-white mb-6 border-b border-slate-100 pb-4 tracking-tight">Document Vault</h3>
            
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

        {/* WALLET TAB */}
        {activeTab === "wallet" && (
           <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
             <WalletDashboard 
               entityId={entityData.id} 
               userRole={expectedRole} 
               walletBalance={entityData.walletBalance || 0} 
             />
           </div>
        )}



        {/* SCHEMA DYNAMIC TABS */}
        {categoryConfig?.tabs.map(tab => {
          if (activeTab === tab.id) {
            return (
              <div key={tab.id} className="bg-slate-700/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-2xl font-black text-white mb-6 border-b border-slate-100 pb-4 tracking-tight">{tab.label}</h3>

                <div className="space-y-8">
                  {tab.fields.map(field => {
                    if (isFieldHidden(field, entityData)) return null;
                    return (
                    <div key={field.key} className="bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-sm hover:border-white/30 transition-all">
                      {field.type === 'object_array' && field.arrayFields ? (
                        <ObjectArrayEditor
                          title={field.label}
                          items={entityData[field.key] || []}
                          fields={field.arrayFields}
                          contextData={entityData}
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
                          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">{field.label}</h4>
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
                          <label className="sd-label-v3">
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
                                className="sd-input-v3 resize-none"
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
                                className="sd-input-v3"
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
                                <span className="text-sm font-bold text-slate-400">Yes, this applies</span>
                              </label>
                          ) : (
                              <input 
                                type={field.type === 'number' ? 'number' : 'text'}
                                value={entityData[field.key] || ''} 
                                onChange={e => setEntityData({...entityData, [field.key]: e.target.value})} 
                                placeholder={field.placeholder}
                                className="sd-input-v3"
                              />
                          )}
                        </div>
                      )}
                    </div>
                  )})}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 mt-8">
                  <AutosaveIndicator status={saveStatus} />
                  <button onClick={() => setActiveTab("help")} className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl transition-colors border border-amber-200 shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Need help filling up this form?
                  </button>
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
                  <h3 className="font-bold text-white mb-2">High-Quality Imagery</h3>
                  <p className="text-sm">Upload bright, clear photos of your facade, ICU, and machinery. Profiles with high-quality images receive 3x more patient engagement.</p>
                </div>
                
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  </div>
                  <h3 className="font-bold text-white mb-2">Verify Licenses</h3>
                  <p className="text-sm">Ensure your uploaded licenses are legible. Our moderation team reviews these manually to award you the "Verified" badge.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "help" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <SupportDashboard userRole={expectedRole} userName={entityData.name} faqData={faqData} />
          </div>
        )}

        {/* BOTTOM WIZARD NAVIGATION */}
        {activeTab !== "home" && (
          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 mt-12 mb-20 animate-in fade-in slide-in-from-bottom-2">
            <button onClick={() => setActiveTab("home")} className="text-slate-400 hover:text-white font-bold px-6 py-4 transition-colors">
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

export default function UniversalOwnerDashboard(props: UniversalOwnerDashboardProps) {
  return (
    <React.Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <UniversalOwnerDashboardContent {...props} />
    </React.Suspense>
  );
}

