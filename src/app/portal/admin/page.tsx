"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { useTenant } from '@/components/TenantContext';
import { indianStates, districtsByState } from '@/lib/locations';
import { platformCategories, subCategoriesByCategory } from '@/lib/categories';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import AdminDataCRM from '@/components/AdminDataCRM';

interface StagedListing {
  id: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  website?: string;
  image?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { activeTenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  // Crawler State
  const [crawlerCountry, setCrawlerCountry] = useState("India");
  const [crawlerState, setCrawlerState] = useState("Odisha");
  const [crawlerDistrict, setCrawlerDistrict] = useState("Khordha");
  const [crawlerCity, setCrawlerCity] = useState("Bhubaneswar");
  const [crawlerLocality, setCrawlerLocality] = useState("");
  const [crawlerPin, setCrawlerPin] = useState("");
  const [crawlerCategory, setCrawlerCategory] = useState("Doctor");
  const [crawlerSubCategory, setCrawlerSubCategory] = useState("");
  const [customSubCategory, setCustomSubCategory] = useState("");
  const [crawlerQuery, setCrawlerQuery] = useState("");

  // Staging Grid State
  const [stagedListings, setStagedListings] = useState<StagedListing[]>([]);
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("sd_current_user_role");
    
    if (role === "super_admin") {
      setAccessGranted(true);
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
        <h1 className="text-3xl font-serif font-bold mb-2">Restricted Area</h1>
        <p className="text-slate-600 mb-8 max-w-md text-center">This dashboard is exclusively for DehaPa Super Administrators.</p>
        <Link href="/portal" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors">Return to Portal</Link>
      </div>
    );
  }

  const handleExtractLive = async (isNextPage: boolean = false) => {
    setIsExtracting(true);
    if (!isNextPage) {
      setStagedListings([]);
      setSelectedListingIds([]);
    }
    
    try {
      const payload: any = {
        country: crawlerCountry,
        state: crawlerState,
        district: crawlerDistrict,
        city: crawlerCity,
        locality: crawlerLocality,
        pin: crawlerPin,
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
        if (isNextPage) {
          setStagedListings([...stagedListings, ...data.results]);
        } else {
          setStagedListings(data.results);
          setSelectedListingIds(data.results.map((d: any) => d.id));
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
          country: crawlerCountry,
          state: crawlerState,
          district: crawlerDistrict,
          city: crawlerCity,
          locality: crawlerLocality,
          pin: crawlerPin,
          verified: false,
          source: "google_crawler",
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

  const adminTabs: DashboardTab[] = [
    {
      id: "users",
      label: "User & Patient Directory",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    },
    {
      id: "verification",
      label: "Verification Queue",
      badge: 0,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    },
    {
      id: "audit",
      label: "Vault Audit Logs",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
    },
    {
      id: "god-mode",
      label: "Portal Testing Hub",
      section: "Automations & God Mode",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
    },
    {
      id: "crawler",
      label: "Google Data Crawler",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
    },
    {
      id: "data-crm",
      label: "Directory Data CRM",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
    }
  ];

  return (
    <DashboardLayout 
      roleName="Admin" 
      tabs={adminTabs} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
    >

          {activeTab === "users" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Registered Platform Users</h3>
                  <p className="text-sm text-slate-500">By default, all new users are assigned the "Patient" role.</p>
                </div>
                <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">Export CSV</button>
              </div>
              
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <p className="font-bold text-slate-900 mb-1">No Active Users</p>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">Users fetched from Firebase Auth will appear here.</p>
              </div>
            </div>
          )}

          {activeTab === "verification" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Verification Queue</h3>
                  <p className="text-sm text-slate-500">Approve requests to upgrade Patients to Doctors/Hospitals/Pharmacies.</p>
                </div>
              </div>
              
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg className="w-8 h-8 text-tenant-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <p className="font-bold text-slate-900 mb-1">Queue is Empty</p>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">There are no pending role upgrade requests.</p>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
               <h3 className="text-lg font-bold mb-1">Sovereign Vault Audit Logs</h3>
               <p className="text-sm text-slate-500 mb-6">System-wide immutable logs of health record access for legal compliance.</p>
               
               <div className="text-center py-16 border border-slate-200 rounded-xl bg-slate-50">
                 <p className="font-mono text-xs uppercase tracking-widest text-slate-500">No Logs Generated Yet</p>
               </div>
            </div>
          )}

          {activeTab === "crawler" && (
            <div className="bg-white border-0 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Google Maps Data Crawler</h3>
                  <p className="text-sm text-slate-500">Automatically fetch and publish Hospitals, Labs, and Clinics from Google Places API.</p>
                </div>
                <div className="bg-teal-50 text-teal-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-teal-100">
                  API Connected
                </div>
              </div>
              
              <div className="bg-[#F9FAFB] border-0 rounded-xl p-6 mb-8 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
                  <div>
                    <label className="text-sm font-semibold text-slate-800 block mb-2">Country</label>
                    <input 
                      type="text" 
                      value={crawlerCountry} 
                      onChange={(e) => setCrawlerCountry(e.target.value)}
                      placeholder="e.g. USA, India"
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-800 block mb-2">State / Region</label>
                    <input 
                      type="text" 
                      value={crawlerState} 
                      onChange={(e) => setCrawlerState(e.target.value)}
                      placeholder="e.g. New York, Karnataka"
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-800 block mb-2">District / Area</label>
                    <input 
                      type="text" 
                      value={crawlerDistrict} 
                      onChange={(e) => setCrawlerDistrict(e.target.value)}
                      placeholder="e.g. Manhattan, Bangalore"
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-800 block mb-2">Category</label>
                    <select 
                      value={crawlerCategory} 
                      onChange={(e) => { setCrawlerCategory(e.target.value); setCrawlerSubCategory(""); setCustomSubCategory(""); }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-all"
                    >
                      {platformCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-800 block mb-2">Sub-category</label>
                    <select 
                      value={crawlerSubCategory} 
                      onChange={(e) => setCrawlerSubCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-all"
                    >
                      <option value="">Any {crawlerCategory}</option>
                      {subCategoriesByCategory[crawlerCategory]?.map((sub: string) => <option key={sub} value={sub}>{sub}</option>)}
                      <option value="Other">Other (Add Custom)</option>
                    </select>
                    {crawlerSubCategory === "Other" && (
                      <input type="text" value={customSubCategory} onChange={(e) => setCustomSubCategory(e.target.value)} placeholder="Type custom specialty..." className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 mt-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500 shadow-sm transition-all" />
                    )}
                  </div>

                  <div className="md:col-span-3 lg:col-span-5 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">City / Town</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Bhubaneswar"
                        value={crawlerCity}
                        onChange={(e) => setCrawlerCity(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Locality / Village / Street</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Sahidnagar"
                        value={crawlerLocality}
                        onChange={(e) => setCrawlerLocality(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-800 block mb-2">PIN Code</label>
                      <input 
                        type="text" 
                        value={crawlerPin} 
                        onChange={(e) => setCrawlerPin(e.target.value)} 
                        placeholder="e.g. 751007" 
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-800 block mb-2">Custom Query Name</label>
                      <input 
                        type="text" 
                        value={crawlerQuery} 
                        onChange={(e) => setCrawlerQuery(e.target.value)} 
                        placeholder="e.g. Top Doctors, Apollo..." 
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-all" 
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
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      )}
                      {isExtracting ? "Extracting..." : crawlerQuery ? `Extract "${crawlerQuery}"` : `Extract ${customSubCategory || crawlerSubCategory || crawlerCategory} in ${[crawlerLocality, crawlerDistrict, crawlerState, crawlerCountry, crawlerPin].filter(Boolean).join(", ")}`}
                    </button>
                    
                    {nextPageToken && (
                      <div className="mt-4 flex justify-center">
                        <button 
                          onClick={() => handleExtractLive(true)} 
                          disabled={isExtracting}
                          className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg text-sm disabled:opacity-50 transition-colors border border-slate-300"
                        >
                          {isExtracting ? "Loading..." : "Load More Results"}
                        </button>
                      </div>
                    )}
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
                    <div className="flex gap-3 w-full md:w-auto">
                      <button onClick={handleDeleteSelected} disabled={selectedListingIds.length === 0} className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg text-sm border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Delete Selected ({selectedListingIds.length})
                      </button>
                      <button onClick={handleInject} disabled={selectedListingIds.length === 0} className="flex-1 md:flex-none px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
                        {isInjecting ? "Injecting..." : `Inject ${selectedListingIds.length} to Database`}
                      </button>
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
                        </div>
                      </div>
                    ))}
                  </div>

                  {stagedListings.length > 5 && (
                    <div className="flex justify-center gap-3 pt-6 border-t border-slate-200">
                      <button onClick={handleDeleteSelected} disabled={selectedListingIds.length === 0} className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl text-sm border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Delete Selected ({selectedListingIds.length})
                      </button>
                      <button onClick={handleInject} disabled={selectedListingIds.length === 0} className="px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
                        {isInjecting ? "Injecting..." : `Inject ${selectedListingIds.length} to Database`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
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
                <Link target="_blank" href="/portal/os" className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-start group">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform border border-indigo-200">👨‍⚕️</div>
                   <h4 className="font-bold text-slate-900 mb-1">Telemedicine OS</h4>
                   <p className="text-xs text-slate-500 mb-6">Test the Doctor workspace, Rx Pad, and Video waiting room.</p>
                   <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-auto group-hover:underline">Launch Portal <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span>
                </Link>
                
                <Link target="_blank" href="/portal/hospital" className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-start group">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform border border-indigo-200">🏥</div>
                   <h4 className="font-bold text-slate-900 mb-1">Hospital Portal</h4>
                   <p className="text-xs text-slate-500 mb-6">Test bed management, department listings, and hospital admin.</p>
                   <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-auto group-hover:underline">Launch Portal <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span>
                </Link>

                <Link target="_blank" href="/portal/lab" className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-start group">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform border border-indigo-200">🔬</div>
                   <h4 className="font-bold text-slate-900 mb-1">Lab Portal</h4>
                   <p className="text-xs text-slate-500 mb-6">Test home collection schedules and report uploads.</p>
                   <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-auto group-hover:underline">Launch Portal <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span>
                </Link>

                <Link target="_blank" href="/portal/pharmacy" className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-start group">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform border border-indigo-200">💊</div>
                   <h4 className="font-bold text-slate-900 mb-1">Pharmacy Portal</h4>
                   <p className="text-xs text-slate-500 mb-6">Test prescription fulfillment and delivery dispatch.</p>
                   <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-auto group-hover:underline">Launch Portal <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span>
                </Link>

                <Link target="_blank" href="/portal/ambulance" className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-start group relative overflow-hidden">
                   <div className="absolute -right-6 top-4 bg-red-500 text-white text-[8px] font-bold uppercase tracking-widest px-8 py-1 rotate-45 shadow-sm">NEW</div>
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform border border-indigo-200">🚑</div>
                   <h4 className="font-bold text-slate-900 mb-1">Ambulance Hub</h4>
                   <p className="text-xs text-slate-500 mb-6">Test the brand new emergency fleet dispatch system.</p>
                   <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-auto group-hover:underline">Launch Prototype <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span>
                </Link>
                
                <Link target="_blank" href="/portal" className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-start group">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform border border-indigo-200">🧑‍🤝‍🧑</div>
                   <h4 className="font-bold text-slate-900 mb-1">Patient Portal</h4>
                   <p className="text-xs text-slate-500 mb-6">Test the default patient experience and Vault.</p>
                   <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-auto group-hover:underline">Launch Portal <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span>
                </Link>
              </div>
            </div>
          )}

          {activeTab === "data-crm" && (
            <AdminDataCRM />
          )}
    </DashboardLayout>
  );
}
