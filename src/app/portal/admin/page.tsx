"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc, getDoc, serverTimestamp, getDocs, updateDoc, query, orderBy } from 'firebase/firestore';
import { useTenant } from '@/components/TenantContext';
import { indianStates, districtsByState, blocksByDistrict } from '@/lib/locations';
import { platformCategories, subCategoriesByCategory } from '@/lib/categories';
import { getTaxonomyCategory, DOCTOR_TAXONOMY } from '@/lib/taxonomy';
import AddressBlock, { AddressData } from '@/components/AddressBlock';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import AdminDataCRM from '@/components/AdminDataCRM';
import AdminDataCRMV2 from '@/components/dashboard/ui/AdminDataCRMV2';
import AdminVerificationCRM from '@/components/AdminVerificationCRM';
import AdminSlugRegistry from '@/components/AdminSlugRegistry';
import AdminWhatsAppDashboard from '@/components/AdminWhatsAppDashboard';
import AdminAnalyticsOverview from '@/components/AdminAnalyticsOverview';
import AdminStaffManagement from '@/components/AdminStaffManagement';
import AdminUserManagement from '@/components/AdminUserManagement';
import AdminSupportTickets from '@/components/AdminSupportTickets';
import AdminViralAnalytics from '@/components/AdminViralAnalytics';
import AdminAdEngine from '@/components/AdminAdEngine';
import AdminPlatformSettings from '@/components/AdminPlatformSettings';
import AdminPageBuilder from '@/components/AdminPageBuilder';
import AdminMasterSwitchboard from '@/components/AdminMasterSwitchboard';
import AdminTenantGenerator from '@/components/AdminTenantGenerator';
import AdminATSManagement from '@/components/AdminATSManagement';
import { AdminCard, AdminHeader } from '@/components/admin/ui';

interface StagedListing {
  id: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  website?: string;
  image?: string;
  rawImages?: string[];
  galleryImages?: string[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { activeTenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [userRole, setUserRole] = useState<string>("none");
  const [activeTab, setActiveTab] = useState("home");
  const [isSimulator, setIsSimulator] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSimulator(window !== window.parent);
    }
  }, []);

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

  // Crawler State
  const [crawlerAddress, setCrawlerAddress] = useState<AddressData>({
    country: "India",
    state: "Odisha",
    district: "Khordha",
    block: "",
    city: "Bhubaneswar",
    pincode: "",
    localAddress: ""
  });
  const [crawlerCategory, setCrawlerCategory] = useState("Doctor");
  const [crawlerSubCategory, setCrawlerSubCategory] = useState("");
  const [crawlerTier, setCrawlerTier] = useState("Specialist");
  const [customSubCategory, setCustomSubCategory] = useState("");
  const [crawlerQuery, setCrawlerQuery] = useState("");

  // Staging Grid State
  const [stagedListings, setStagedListings] = useState<StagedListing[]>([]);
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  // Claims State Removed (Moved to AdminVerificationCRM)

  useEffect(() => {
    let role = localStorage.getItem("sd_current_user_role") || "none";
    const email = localStorage.getItem("sd_current_user_email");
    if (email === 'odishamedical@gmail.com') role = 'super_admin';
    
    // Accept any admin role
    if (["super_admin", "data_entry", "verification_officer", "auditor"].includes(role)) {
      setAccessGranted(true);
      setUserRole(role);
      
      // Auto-set the active tab based on role if they enter with "overview" but don't have access
      if (role === "data_entry") setActiveTab("data-crm");
      if (role === "verification_officer") setActiveTab("verification");
      if (role === "auditor") setActiveTab("audit");
    } else {
      setAccessGranted(false);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-tenant-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center font-sans">
        <div className="w-20 h-20 bg-red-100 border border-red-200 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h1 className="text-3xl font-serif font-bold mb-1.5">Restricted Area</h1>
        <p className="text-slate-600 mb-8 max-w-md text-center">This dashboard is exclusively for DehaPa Super Administrators.</p>
        <Link href="/portal" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors">Return to Portal</Link>
      </div>
    );
  }

  // Approval Functions Removed (Moved to AdminVerificationCRM)

  const handleExtractLive = async (isNextPage: boolean = false) => {
    setIsExtracting(true);
    if (!isNextPage) {
      setStagedListings([]);
      setSelectedListingIds([]);
    }
    
    try {
      const payload: any = {
        country: crawlerAddress.country,
        state: crawlerAddress.state,
        district: crawlerAddress.district,
        city: crawlerAddress.city,
        locality: crawlerAddress.localAddress,
        pin: crawlerAddress.pincode,
        category: crawlerCategory,
        subCategory: crawlerSubCategory === "Other" ? customSubCategory : crawlerSubCategory,
        query: crawlerQuery
      };

      if (isNextPage && nextPageToken) {
        payload.pageToken = nextPageToken;
      }

      const res = await fetch('/api/crawler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (!res.ok) {
        alert(`Error: ${data.error}`);
        setIsExtracting(false);
        return;
      }

      if (data.results && data.results.length > 0) {
        const formattedResults = data.results.map((r: any) => {
          let formattedPhone = r.phone || "";
          if (formattedPhone) {
            let digits = formattedPhone.replace(/\D/g, '');
            if (digits.length === 11 && digits.startsWith('0')) digits = digits.substring(1);
            if (digits.length === 10) {
              formattedPhone = '+91' + digits;
            } else if (digits.length === 12 && digits.startsWith('91')) {
              formattedPhone = '+' + digits;
            }
          }
          return { ...r, phone: formattedPhone };
        });

        if (isNextPage) {
          setStagedListings([...stagedListings, ...formattedResults]);
        } else {
          setStagedListings(formattedResults);
          setSelectedListingIds(formattedResults.map((d: any) => d.id));
        }
        setNextPageToken(data.nextPageToken || null);
      } else if (!isNextPage) {
        alert(`No results found for: ${data.query || 'your query'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the crawler backend.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleToggleSelection = (id: string) => {
    if (selectedListingIds.includes(id)) {
      setSelectedListingIds(selectedListingIds.filter(itemId => itemId !== id));
    } else {
      setSelectedListingIds([...selectedListingIds, id]);
    }
  };

  const handleDeleteSelected = () => {
    const remaining = stagedListings.filter(item => !selectedListingIds.includes(item.id));
    setStagedListings(remaining);
    setSelectedListingIds([]);
  };

  const handleInject = async () => {
    if (selectedListingIds.length === 0) return;
    setIsInjecting(true);
    try {
      const batch = writeBatch(db);
      const directoryRef = collection(db, 'directory');

      const toInject = stagedListings.filter(l => selectedListingIds.includes(l.id));

      for (const listing of toInject) {
        const newDocRef = doc(directoryRef, listing.id);
        
        batch.set(newDocRef, {
          googlePlaceId: listing.id,
          name: listing.name,
          address: listing.address,
          phone: listing.phone || "",
          rating: listing.rating || 0,
          reviews: listing.reviews || 0,
          website: listing.website || "",
          image: listing.image || "",
          category: crawlerCategory,
          subCategory: crawlerSubCategory === "Other" ? customSubCategory : crawlerSubCategory,
          
          // Strict Schema Subcategory Mappings
          ...(crawlerCategory === "Pharmacy" && { pharmacyType: crawlerSubCategory === "Other" ? customSubCategory : crawlerSubCategory }),
          ...(crawlerCategory === "Hospital" && { facilityType: crawlerSubCategory === "Other" ? customSubCategory : crawlerSubCategory }),
          ...(crawlerCategory === "Lab" && { labType: crawlerSubCategory === "Other" ? customSubCategory : crawlerSubCategory }),
          ...(crawlerCategory === "Doctor" && { 
            taxonomy: getTaxonomyCategory(crawlerSubCategory === "Other" ? customSubCategory : crawlerSubCategory) || crawlerTier.toLowerCase().replace(' ', '-'),
            primarySpecialty: crawlerSubCategory === "Other" ? customSubCategory : crawlerSubCategory,
            doctorLevel: crawlerTier,
            qualificationsList: (crawlerTier === "MBBS" || crawlerTier === "Ayush") ? [{ degree: crawlerTier, institution: "Map Later", year: "" }] : []
          }),

          country: crawlerAddress.country,
          state: crawlerAddress.state,
          district: crawlerAddress.district,
          block: crawlerAddress.block || "",
          city: crawlerAddress.city,
          locality: crawlerAddress.localAddress,
          pin: crawlerAddress.pincode,
          verified: false,
          source: "google_crawler",
          rawImages: listing.rawImages || [],
          galleryImages: listing.galleryImages || [],
          // Dynamic Fields from Crawler
          ...(listing.hours && { hours: listing.hours }),
          ...(listing.about && { about: listing.about }),
          ...(listing.clinicMapUrl && { mapUrl: listing.clinicMapUrl }),
          ...(listing.specialties && { specialties: listing.specialties }),
          ...(listing.businessStatus && { businessStatus: listing.businessStatus }),
          tenantId: activeTenant?.id || "default",
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      await batch.commit();

      setStagedListings(stagedListings.filter(l => !selectedListingIds.includes(l.id)));
      setSelectedListingIds([]);
      alert(`Successfully injected ${toInject.length} records into the live database!`);
    } catch (err) {
      console.error("Injection error:", err);
      alert("Failed to inject into the database. Check console for details.");
    } finally {
      setIsInjecting(false);
    }
  };

  const allAdminTabs: DashboardTab[] = [
    {
      id: "users",
      label: "User Directory",
      section: "User Management",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    },
    {
      id: "viral-analytics",
      label: "Viral Analytics",
      section: "Marketing",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
    },
    {
      id: "ads",
      label: "Ad Engine",
      section: "Marketing",
      badge: "New",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
    },
    {
      id: "verification",
      label: "Verification Queue",
      section: "User Management",
      badge: 0,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    },
    {
      id: "support",
      label: "Patient Support Tickets",
      section: "User Management",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    },
    {
      id: "crawler",
      label: "Google Data Crawler",
      section: "Data Operations",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
    },
    {
      id: "ats",
      label: "ATS Job Board",
      section: "Data Operations",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
    },
    {
      id: "data-crm",
      label: "Directory Data CRM",
      section: "Data Operations",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
    },
    {
      id: "slug-registry",
      label: "Premium Slug Registry",
      section: "Data Operations",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
    },
        {
      id: "staff",
      label: "Staff Management",
      section: "System Controls",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    },
    {
      id: "plugins",
      label: "Master Switchboard",
      section: "System Controls",
      badge: "Engine",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    },
    {
      id: "page-builder",
      label: "Page Builder",
      section: "System Controls",
      badge: "CMS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
    },
    {
      id: "tenants",
      label: "App Generator",
      section: "System Controls",
      badge: "New",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
    },
    {
      id: "audit",
      label: "Vault Audit Logs",
      section: "System Controls",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
    },
        {
      id: "settings",
      label: "Platform Settings",
      section: "System Controls",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    },
    {
      id: "god-mode",
      label: "Portal Testing Hub",
      section: "System Controls",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
    },
    {
      id: "whatsapp",
      label: "WhatsApp Bot",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>,
      section: "Marketing",
      badge: "Live"
    }
  ];

  // RBAC Tab Filtering
  const adminTabs = allAdminTabs.filter(tab => {
    if (userRole === "super_admin") return true;
    
    if (userRole === "data_entry") {
      return ["crawler", "data-crm"].includes(tab.id);
    }
    
    if (userRole === "verification_officer") {
      return ["verification"].includes(tab.id);
    }

    if (userRole === "auditor") {
      return ["audit"].includes(tab.id);
    }

    return false;
  });

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'data_entry': return 'Data Manager';
      case 'verification_officer': return 'Verification Officer';
      case 'auditor': return 'System Auditor';
      default: return 'Administrator';
    }
  };

  return (
    <DashboardLayout 
      roleName={getRoleDisplayName(userRole)} 
      tabs={adminTabs} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      homeWidget={userRole === "super_admin" ? <AdminAnalyticsOverview /> : undefined}
    >

          {activeTab === "users" && <AdminUserManagement />}

          {activeTab === "support" && (
            <AdminSupportTickets />
          )}

          {activeTab === "page-builder" && (
            <AdminPageBuilder />
          )}

          {activeTab === "ads" && (
            <AdminAdEngine />
          )}

          {activeTab === "viral-analytics" && (
            <AdminViralAnalytics />
          )}

          {activeTab === "verification" && (
            <AdminVerificationCRM />
          )}

          {activeTab === "audit" && (
            <AdminCard>
               <AdminHeader title="Sovereign Vault Audit Logs" description="System-wide immutable logs of health record access for legal compliance." />
               <div className="text-center py-16 border border-slate-800 rounded-xl bg-slate-950/50">
                 <p className="font-mono text-xs uppercase tracking-widest text-slate-500">No Logs Generated Yet</p>
               </div>
            </AdminCard>
          )}

          {activeTab === "crawler" && (
            <AdminCard>
              <AdminHeader 
                title="Google Maps Data Crawler" 
                description="Automatically fetch and publish Hospitals, Labs, and Clinics from Google Places API."
                actions={
                  <div className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    API Connected
                  </div>
                }
              />
              
              <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-6 mb-8 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
                  <div className="md:col-span-3 lg:col-span-5">
                    <AddressBlock data={crawlerAddress} onChange={setCrawlerAddress} darkTheme={true} />
                  </div>
                  
                  <div className="md:col-span-3 lg:col-span-5 grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-800">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                      <select 
                        value={crawlerCategory} 
                        onChange={(e) => { setCrawlerCategory(e.target.value); setCrawlerSubCategory(""); setCustomSubCategory(""); }}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 hover:border-slate-700 rounded-xl px-5 py-3.5 shadow-sm text-sm font-semibold focus:border-cyan-500 outline-none transition-all"
                      >
                        {platformCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    {crawlerCategory === "Doctor" && (
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Doctor Tier</label>
                        <select 
                          value={crawlerTier} 
                          onChange={(e) => { setCrawlerTier(e.target.value); setCrawlerSubCategory(""); setCustomSubCategory(""); }}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 hover:border-slate-700 rounded-xl px-5 py-3.5 shadow-sm text-sm font-semibold focus:border-cyan-500 outline-none transition-all"
                        >
                          <option value="Ayush">Ayush</option>
                          <option value="MBBS">MBBS</option>
                          <option value="Specialist">Specialist</option>
                          <option value="Super Specialist">Super Specialist</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sub-category</label>
                      <select 
                        value={crawlerSubCategory} 
                        onChange={(e) => setCrawlerSubCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 hover:border-slate-700 rounded-xl px-5 py-3.5 shadow-sm text-sm font-semibold focus:border-cyan-500 outline-none transition-all"
                      >
                        <option value="">Any {crawlerCategory}</option>
                        {crawlerCategory === "Doctor" 
                          ? DOCTOR_TAXONOMY[crawlerTier.toLowerCase().replace(' ', '-') as keyof typeof DOCTOR_TAXONOMY]?.map((sub: string) => <option key={sub} value={sub}>{sub}</option>)
                          : subCategoriesByCategory[crawlerCategory]?.map((sub: string) => <option key={sub} value={sub}>{sub}</option>)
                        }
                        <option value="Other">Other (Add Custom)</option>
                      </select>
                    </div>

                    {crawlerSubCategory === "Other" && (
                      <div className={crawlerCategory === "Doctor" ? "md:col-span-3" : ""}>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Custom Sub-category</label>
                        <input type="text" value={customSubCategory} onChange={(e) => setCustomSubCategory(e.target.value)} placeholder="Type custom specialty..." className="w-full bg-slate-950 border border-slate-800 text-slate-200 hover:border-slate-700 rounded-xl px-5 py-3.5 shadow-sm text-sm font-semibold focus:border-cyan-500 outline-none transition-all" />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Custom Query Name</label>
                      <input 
                        type="text" 
                        value={crawlerQuery} 
                        onChange={(e) => setCrawlerQuery(e.target.value)} 
                        placeholder="e.g. Top Doctors, Apollo..." 
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 hover:border-slate-700 rounded-xl px-5 py-3.5 shadow-sm text-sm font-semibold focus:border-cyan-500 outline-none transition-all" 
                      />
                    </div>
                  </div>


                  <div className="md:col-span-3 lg:col-span-5 mt-6">
                    <button 
                      onClick={() => handleExtractLive(false)}
                      disabled={isExtracting}
                      className="w-full md:w-auto md:px-12 bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl text-base font-bold shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isExtracting ? (
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                      )}
                      {isExtracting ? "Extracting..." : crawlerQuery ? `Extract "${crawlerQuery}"` : `Extract ${customSubCategory || crawlerSubCategory || crawlerCategory} in ${[crawlerAddress.localAddress, crawlerAddress.district, crawlerAddress.state, crawlerAddress.country, crawlerAddress.pincode].filter(Boolean).join(", ")}`}
                    </button>
                  </div>
                </div>
              </div>

              {stagedListings.length > 0 && (
                <div className="mt-12 border-t border-slate-200 pt-8">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Data Staging Pipeline</h3>
                      <p className="text-sm text-slate-500">Review {stagedListings.length} extracted results before injecting into the live database.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                      <button onClick={handleDeleteSelected} disabled={selectedListingIds.length === 0} className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg text-sm border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Delete Selected ({selectedListingIds.length})
                      </button>
                      <button onClick={handleInject} disabled={selectedListingIds.length === 0} className="flex-1 md:flex-none px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
                        {isInjecting ? "Injecting..." : `Inject ${selectedListingIds.length} to Database`}
                      </button>
                      {nextPageToken && (
                        <button 
                          onClick={() => handleExtractLive(true)} 
                          disabled={isExtracting}
                          className="flex-1 md:flex-none px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 font-bold rounded-lg text-sm disabled:opacity-50 transition-colors shadow-md"
                        >
                          {isExtracting ? "Loading..." : "Load More Results"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {stagedListings.map((listing) => (
                      <div key={listing.id} className={`relative bg-white border ${selectedListingIds.includes(listing.id) ? 'border-teal-500 ring-1 ring-teal-500' : 'border-slate-200'} rounded-xl p-4 shadow-sm transition-all flex gap-4`}>
                        <div className="absolute top-4 right-4 z-10">
                          <input 
                            type="checkbox" 
                            checked={selectedListingIds.includes(listing.id)}
                            onChange={() => handleToggleSelection(listing.id)}
                            className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                          />
                        </div>
                        
                        <div className="w-20 h-20 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200 flex items-center justify-center">
                          {listing.image ? (
                            <img src={listing.image} alt={listing.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 pr-8">
                          <h4 className="font-bold text-slate-900 truncate" title={listing.name}>{listing.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2" title={listing.address}>{listing.address}</p>
                          
                          <div className="mt-2 flex items-center gap-2">
                            {listing.phone ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-2 py-1 rounded-md border border-teal-100">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                {listing.phone}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-red-700 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                                No Phone Number
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                              ⭐ {listing.rating} ({listing.reviews})
                            </span>
                          </div>
                          
                          {crawlerCategory === "Doctor" && (
                            <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-100 pt-3">
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Premium Fields Extracted:</div>
                              <div className="flex flex-wrap gap-1.5">
                                {listing.hours ? (
                                  <span className="text-[9px] bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded border border-green-200">Hours ✓</span>
                                ) : (
                                  <span className="text-[9px] bg-slate-50 text-slate-400 font-semibold px-2 py-0.5 rounded border border-slate-200">No Hours</span>
                                )}
                                
                                {listing.about ? (
                                  <span className="text-[9px] bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded border border-green-200">About ✓</span>
                                ) : (
                                  <span className="text-[9px] bg-slate-50 text-slate-400 font-semibold px-2 py-0.5 rounded border border-slate-200">No About</span>
                                )}
                                
                                {listing.clinicMapUrl ? (
                                  <span className="text-[9px] bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded border border-green-200">Map Pin ✓</span>
                                ) : (
                                  <span className="text-[9px] bg-slate-50 text-slate-400 font-semibold px-2 py-0.5 rounded border border-slate-200">No Map Pin</span>
                                )}

                                {listing.specialties ? (
                                  <span className="text-[9px] bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded border border-green-200">Specialties ({listing.specialties.length}) ✓</span>
                                ) : (
                                  <span className="text-[9px] bg-slate-50 text-slate-400 font-semibold px-2 py-0.5 rounded border border-slate-200">No Specialties</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {stagedListings.length > 5 && (
                    <div className="flex flex-wrap justify-center gap-3 pt-6 border-t border-slate-200">
                      <button onClick={handleDeleteSelected} disabled={selectedListingIds.length === 0} className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl text-sm border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Delete Selected ({selectedListingIds.length})
                      </button>
                      <button onClick={handleInject} disabled={selectedListingIds.length === 0} className="px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
                        {isInjecting ? "Injecting..." : `Inject ${selectedListingIds.length} to Database`}
                      </button>
                      {nextPageToken && (
                        <button 
                          onClick={() => handleExtractLive(true)} 
                          disabled={isExtracting}
                          className="px-6 py-3 bg-teal-600 text-white hover:bg-teal-700 font-bold rounded-xl text-sm disabled:opacity-50 transition-colors shadow-md"
                        >
                          {isExtracting ? "Loading..." : "Load More Results"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </AdminCard>
          )}
          {activeTab === "ads" && (
            <AdminAdEngine />
          )}

          {activeTab === "staff" && (
            <AdminStaffManagement />
          )}

          {activeTab === "settings" && (
            <AdminPlatformSettings />
          )}

          {activeTab === "god-mode" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Portal Testing Hub (God Mode)</h3>
                  <p className="text-sm text-slate-500">Bypass auth restrictions to test all user portal experiences directly.</p>
                </div>
                <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-indigo-200">
                  Dev Tool
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <Link target={isSimulator ? "_self" : "_blank"} rel="noopener noreferrer" href="/admin/simulator" className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-start group relative overflow-hidden">
                   <div className="absolute -right-6 top-4 bg-teal-500 text-slate-900 text-[8px] font-bold uppercase tracking-widest px-8 py-1 rotate-45 shadow-sm">NEW</div>
                   <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform border border-teal-200">📱</div>
                   <h4 className="font-bold text-slate-900 mb-1">Mobile Simulator</h4>
                   <p className="text-xs text-slate-500 mb-6">Test the responsive mobile views of any page in an interactive frame.</p>
                   <span className="text-teal-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-auto group-hover:underline">Launch Simulator <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span>
                </Link>

                <Link target={isSimulator ? "_self" : "_blank"} rel="noopener noreferrer" href="/portal/doctor" className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-start group">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform border border-indigo-200">👨‍⚕️</div>
                   <h4 className="font-bold text-slate-900 mb-1">Doctor Portal</h4>
                   <p className="text-xs text-slate-500 mb-6">Test the Premium Slug UI, Doctor workspace, Rx Pad, and Video waiting room.</p>
                   <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-auto group-hover:underline">Launch Portal <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span>
                </Link>
                
                <Link target={isSimulator ? "_self" : "_blank"} rel="noopener noreferrer" href="/portal/hospital" className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-start group">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform border border-indigo-200">🏥</div>
                   <h4 className="font-bold text-slate-900 mb-1">Hospital Portal</h4>
                   <p className="text-xs text-slate-500 mb-6">Test bed management, department listings, and hospital admin.</p>
                   <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-auto group-hover:underline">Launch Portal <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span>
                </Link>

                <Link target={isSimulator ? "_self" : "_blank"} rel="noopener noreferrer" href="/portal/lab" className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-start group">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform border border-indigo-200">🔬</div>
                   <h4 className="font-bold text-slate-900 mb-1">Lab Portal</h4>
                   <p className="text-xs text-slate-500 mb-6">Test home collection schedules and report uploads.</p>
                   <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-auto group-hover:underline">Launch Portal <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span>
                </Link>

                <Link target={isSimulator ? "_self" : "_blank"} rel="noopener noreferrer" href="/portal/pharmacy" className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-start group">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform border border-indigo-200">💊</div>
                   <h4 className="font-bold text-slate-900 mb-1">Pharmacy Portal</h4>
                   <p className="text-xs text-slate-500 mb-6">Test prescription fulfillment and delivery dispatch.</p>
                   <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-auto group-hover:underline">Launch Portal <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span>
                </Link>

                <Link target={isSimulator ? "_self" : "_blank"} rel="noopener noreferrer" href="/portal/ambulance" className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-start group relative overflow-hidden">
                   <div className="absolute -right-6 top-4 bg-red-500 text-white text-[8px] font-bold uppercase tracking-widest px-8 py-1 rotate-45 shadow-sm">NEW</div>
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform border border-indigo-200">🚑</div>
                   <h4 className="font-bold text-slate-900 mb-1">Ambulance Hub</h4>
                   <p className="text-xs text-slate-500 mb-6">Test the brand new emergency fleet dispatch system.</p>
                   <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-auto group-hover:underline">Launch Prototype <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span>
                </Link>
                
                <Link target={isSimulator ? "_self" : "_blank"} rel="noopener noreferrer" href="/portal" className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-start group">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform border border-indigo-200">🧑‍🤝‍🧑</div>
                   <h4 className="font-bold text-slate-900 mb-1">Patient Portal</h4>
                   <p className="text-xs text-slate-500 mb-6">Test the default patient experience and Vault.</p>
                   <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-auto group-hover:underline">Launch Portal <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span>
                </Link>
              </div>
            </div>
          )}

          {activeTab === "data-crm" && (
            <AdminDataCRMV2 />
          )}

          {activeTab === "slug-registry" && (
            <AdminSlugRegistry />
          )}

          {activeTab === "slugs" && (
            <AdminSlugRegistry />
          )}
          {activeTab === "ats" && (
            <AdminATSManagement />
          )}
          {activeTab === "whatsapp" && (
            <AdminWhatsAppDashboard />
          )}
          {activeTab === "plugins" && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <AdminMasterSwitchboard />
            </div>
          )}
          {activeTab === "tenants" && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <AdminTenantGenerator />
            </div>
          )}
    </DashboardLayout>
  );
}
