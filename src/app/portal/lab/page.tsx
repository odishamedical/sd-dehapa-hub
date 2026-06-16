"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import AddressBlock, { AddressData } from '@/components/AddressBlock';
import { useAutosave } from '@/hooks/useAutosave';
import AutosaveIndicator from '@/components/AutosaveIndicator';
import ImageUpload from '@/components/ImageUpload';

function LabHomeWidget({ labName }: { labName: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Lab Profile Strength</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">Complete your facility profile to rank higher in the public directory and unlock premium features.</p>
        </div>
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0 bg-white rounded-full shadow-sm">
          <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0" viewBox="0 0 36 36">
            <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
            <path className="text-teal-500" strokeDasharray="10, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="text-xs font-black text-slate-700">10%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Pending Actions
          </h4>
          <ul className="space-y-3">
            <li className="flex items-center justify-between bg-amber-50 border border-amber-100 p-3 rounded-xl">
              <span className="text-sm text-amber-900 font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                Add NABL/ISO Accreditations
              </span>
              <button className="text-xs font-bold text-amber-700 bg-amber-100/50 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">Complete</button>
            </li>
            <li className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-sm text-slate-700 font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                Update Operating Hours
              </span>
              <button className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Complete</button>
            </li>
          </ul>
        </div>
        {/* Mock Chart */}
        <div className="bg-white/50 backdrop-blur-md rounded-[20px] p-5 border border-white shadow-sm hover:shadow-md transition-shadow">
          <h4 className="text-[11px] font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-widest">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            Monthly Tests Processed
          </h4>
          <div className="h-28 flex items-end justify-between gap-2 px-1">
            {[30, 45, 25, 60, 80, 50, 95].map((val, i) => (
              <div key={i} className="w-full bg-gradient-to-t from-blue-100 to-blue-50 hover:from-blue-400 hover:to-blue-300 transition-all rounded-t-md relative group cursor-pointer border border-blue-200/50 hover:border-blue-400" style={{ height: `${val}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                  {val}0
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
            <span>Mon</span>
            <span>Sun</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LabDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [labName, setLabName] = useState("Diagnostic Center");
  const [userEmail, setUserEmail] = useState("");

  const [activeTab, setActiveTab] = useState("home");

  // State: Identity & Certifications
  const [identityData, setIdentityData] = useState({
    logo: "",
    labName: "",
    licenseNumber: "",
    accreditations: "",
    phone: "",
    whatsappNumber: "",
    email: ""
  });
  const identitySaveStatus = useAutosave(identityData, 1000);

  // State: Location & Reach
  const [locationData, setLocationData] = useState<AddressData>({
    country: "India",
    state: "Odisha",
    district: "",
    block: "",
    city: "",
    pincode: "",
    localAddress: ""
  });
  const locationSaveStatus = useAutosave(locationData, 1000);
  
  // State: Services & Catalog
  const [servicesData, setServicesData] = useState({
    testsOffered: "",
    homeCollection: false
  });
  const servicesSaveStatus = useAutosave(servicesData, 1000);

  // State: Operating Hours
  const [hoursData, setHoursData] = useState({
    timings: "",
    holidays: ""
  });
  const hoursSaveStatus = useAutosave(hoursData, 1000);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("sd_current_user_role");
      const name = localStorage.getItem("sd_current_user_name");
      const email = localStorage.getItem("sd_current_user_email");
      
      if (role === "lab" || role === "super_admin") {
        setAccessGranted(true);
        if (name) {
          setLabName(name);
          setIdentityData(prev => ({ ...prev, labName: name }));
        }
        if (email) setUserEmail(email);
      } else {
        setAccessGranted(false);
        router.push("/portal");
      }
      setLoading(false);
    }
  }, [router]);

  if (loading) return null;
  if (!accessGranted) return null;

  const labTabs: DashboardTab[] = [
    {
      id: "identity",
      label: "Identity & Certs",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    },
    {
      id: "location",
      label: "Location & Reach",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
    },
    {
      id: "services",
      label: "Services & Catalog",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
    },
    {
      id: "hours",
      label: "Operating Hours",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    },
    {
      id: "inbox",
      label: "Rx Inbox & Orders",
      section: "ORDERS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path></svg>
    },
    {
      id: "vault",
      label: "Upload Report to Vault",
      section: "REPORTS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <DashboardLayout 
      roleName="Pathology Portal" 
      tabs={labTabs} 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      userProfile={{
        name: labName,
        subtitle: "Diagnostic Center",
      }}
      homeWidget={<LabHomeWidget labName={labName} />}
    >
      <div className="max-w-4xl mx-auto pb-24">
        
        {/* Tab 1: Identity & Certifications */}
        {activeTab === "identity" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Identity & Certifications</h3>
            
            <div className="space-y-6">
              <ImageUpload 
                label="Lab Logo / Building Photo"
                defaultImage={identityData.logo}
                onChange={(url) => setIdentityData(prev => ({...prev, logo: url}))}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Lab Name</label>
                  <input 
                    type="text" 
                    value={identityData.labName}
                    onChange={(e) => setIdentityData(prev => ({...prev, labName: e.target.value}))}
                    placeholder="e.g. Dr. Lal PathLabs" 
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">License Number</label>
                  <input 
                    type="text" 
                    value={identityData.licenseNumber}
                    onChange={(e) => setIdentityData(prev => ({...prev, licenseNumber: e.target.value}))}
                    placeholder="e.g. DL-12345" 
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">NABL / ISO Accreditations</label>
                <input 
                  type="text" 
                  value={identityData.accreditations}
                  onChange={(e) => setIdentityData(prev => ({...prev, accreditations: e.target.value}))}
                  placeholder="e.g. NABL Accredited, ISO 9001:2015" 
                  className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={identityData.phone}
                    onChange={(e) => setIdentityData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="e.g. +91 9876543210" 
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5 flex items-center gap-2">
                    WhatsApp Number
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  </label>
                  <input 
                    type="text" 
                    value={identityData.whatsappNumber}
                    onChange={(e) => setIdentityData(prev => ({...prev, whatsappNumber: e.target.value}))}
                    placeholder="e.g. +91 9876543210" 
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <AutosaveIndicator status={identitySaveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Location & Reach */}
        {activeTab === "location" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Location & Reach</h3>
            <AddressBlock data={locationData} onChange={setLocationData} />
            <div className="flex justify-end mt-6 pt-6 border-t border-slate-100">
              <AutosaveIndicator status={locationSaveStatus} />
            </div>
          </div>
        )}

        {/* Tab 3: Services & Catalog */}
        {activeTab === "services" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Services & Catalog</h3>
            
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Tests & Facilities Offered</label>
                <textarea 
                  value={servicesData.testsOffered}
                  onChange={(e) => setServicesData(prev => ({...prev, testsOffered: e.target.value}))}
                  placeholder="e.g. Blood Tests, Urine Analysis, MRI, CT Scan, X-Ray..." 
                  rows={4}
                  className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all resize-none" 
                />
              </div>

              <div className="pt-6 border-t border-slate-100">
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-teal-500 transition-colors w-fit">
                  <input 
                    type="checkbox" 
                    checked={servicesData.homeCollection}
                    onChange={(e) => setServicesData(prev => ({...prev, homeCollection: e.target.checked}))}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-slate-300"
                  />
                  <span className="font-semibold text-slate-700 text-sm">Offer Home Sample Collection</span>
                </label>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-100">
                <AutosaveIndicator status={servicesSaveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Operating Hours */}
        {activeTab === "hours" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Operating Hours</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Standard Timings</label>
                <input 
                  type="text" 
                  value={hoursData.timings}
                  onChange={(e) => setHoursData(prev => ({...prev, timings: e.target.value}))}
                  placeholder="e.g. Mon-Sat: 8:00 AM - 9:00 PM, Sun: Closed" 
                  className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Holiday Schedule / Exceptions</label>
                <input 
                  type="text" 
                  value={hoursData.holidays}
                  onChange={(e) => setHoursData(prev => ({...prev, holidays: e.target.value}))}
                  placeholder="e.g. Closed on National Holidays" 
                  className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                />
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-100">
                <AutosaveIndicator status={hoursSaveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Vault Uploader */}
        {activeTab === "vault" && (
          <div className="bg-white rounded-3xl p-10 shadow-2xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">Upload to Sovereign Vault</h2>
            <p className="text-slate-500 mb-8">Enter the patient's exact Vault ID (registered email or phone) to push finalized PDF reports securely to their account.</p>

            <form onSubmit={(e) => { e.preventDefault(); alert("Vault connection initiated"); }} className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Patient Vault ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. patient@example.com"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-4 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all font-mono"
                />
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                Lookup Vault
              </button>
            </form>
          </div>
        )}

        {/* Tab: Rx Inbox */}
        {activeTab === "inbox" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Incoming Lab Orders</h3>
                <p className="text-sm text-slate-500 mt-1">Lab tests routed to your center by doctors or patients.</p>
              </div>
              <div className="text-right">
                <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-xs">1 New Order</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Order 1 */}
              <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1 block">Home Collection Requested</span>
                    <h4 className="text-lg font-bold text-slate-900">Patient: Amit Kumar</h4>
                    <p className="text-sm text-slate-500">From: Dr. Rajesh Singh</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">Rx ID: LAB-1042-C</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time Received</p>
                    <p className="text-sm font-bold text-slate-900">Today, 08:30 AM</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Requested Tests:</p>
                  <ul className="space-y-2">
                    <li className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="font-semibold text-sm">1. Complete Blood Count (CBC)</span>
                      <span className="text-xs font-mono text-slate-500">Fasting</span>
                    </li>
                    <li className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="font-semibold text-sm">2. Lipid Profile</span>
                      <span className="text-xs font-mono text-slate-500">Fasting Required</span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Decline Order</button>
                  <button className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all">Accept & Schedule</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
