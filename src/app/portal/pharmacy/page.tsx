"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import AddressBlock, { AddressData } from '@/components/AddressBlock';
import { useAutosave } from '@/hooks/useAutosave';
import AutosaveIndicator from '@/components/AutosaveIndicator';
import ImageUpload from '@/components/ImageUpload';

interface AuthorizedCompany {
  id: string;
  name: string;
  address: string;
}

interface PharmaProduct {
  id: string;
  name: string;
  composition: string;
}

interface Distributor {
  id: string;
  cfName: string;
  superstockistName: string;
  stockistName: string;
}

function PharmaHomeWidget({ businessName, businessType }: { businessName: string, businessType: string }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 border border-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.05)] rounded-[24px] p-6 relative overflow-hidden">
      {/* Metallic Shine Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 hover:translate-x-full duration-1000 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>
      <div className="flex justify-between items-end mb-3 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{businessType} Profile</h3>
          <p className="text-xs text-slate-500 mt-0.5">Complete your facility profile to rank higher in the public directory.</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-teal-600">15%</span>
        </div>
      </div>
      
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-5 relative z-10">
        <div className="bg-gradient-to-r from-teal-400 to-teal-600 h-full rounded-full w-[15%]"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Pending Actions
          </h4>
          <ul className="space-y-3">
            <li className="flex items-center justify-between bg-amber-50 border border-amber-100 p-3 rounded-xl">
              <span className="text-sm text-amber-900 font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                Add valid License Number
              </span>
              <button className="text-xs font-bold text-amber-700 bg-amber-100/50 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">Complete</button>
            </li>
          </ul>
        </div>
        
        {/* Mock Chart */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Weekly Prescriptions Filled
          </h4>
          <div className="h-24 flex items-end justify-between gap-2 px-2">
            {[40, 20, 65, 80, 55, 90, 70].map((val, i) => (
              <div key={i} className="w-full bg-teal-100 hover:bg-teal-400 transition-all rounded-t-sm relative group cursor-pointer" style={{ height: `${val}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {val}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2">
            <span>Mon</span>
            <span>Sun</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PharmacyDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [businessName, setBusinessName] = useState("Pharma Business");
  const [userEmail, setUserEmail] = useState("");

  const [activeTab, setActiveTab] = useState("home");

  // State: Identity & Licenses
  const [identityData, setIdentityData] = useState({
    businessType: "Retail Pharmacy",
    logo: "",
    businessName: "",
    pharmacistName: "",
    retailLicense: "",
    wholesaleLicense: "",
    gstin: "",
    manufacturingLicense: "",
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
  
  // State: Services & Logistics
  const [servicesData, setServicesData] = useState({
    homeDeliveryRadius: "", // Retail
    bulkOrderCapacity: "", // Wholesaler
    authorizedCompanies: [] as AuthorizedCompany[], // Wholesaler Dynamic Array
    factoryLocations: "", // Manufacturer
    products: [] as PharmaProduct[], // Manufacturer Dynamic Array
    distributors: [] as Distributor[] // Manufacturer Dynamic Array
  });
  const servicesSaveStatus = useAutosave(servicesData, 1000);

  // State: Operating Hours
  const [hoursData, setHoursData] = useState({
    timings: "",
    is247: false
  });
  const hoursSaveStatus = useAutosave(hoursData, 1000);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("sd_current_user_role");
      const name = localStorage.getItem("sd_current_user_name");
      const email = localStorage.getItem("sd_current_user_email");
      
      if (role === "pharmacy" || role === "super_admin") {
        setAccessGranted(true);
        if (name) {
          setBusinessName(name);
          setIdentityData(prev => ({ ...prev, businessName: name }));
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

  const pharmaTabs: DashboardTab[] = [
    {
      id: "identity",
      label: "Identity & Licenses",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
    },
    {
      id: "location",
      label: "Location & Reach",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
    },
    {
      id: "services",
      label: "Services & Logistics",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
    },
    {
      id: "hours",
      label: "Operating Hours",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    },
    {
      id: "inbox",
      label: "Rx Inbox & Fulfillment",
      section: "ORDERS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path></svg>
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleBusinessTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    const confirmChange = window.confirm(
      "WARNING: Are you sure you want to change your Business Category?\n\nChanging this will erase any data (licenses, catalogs, etc.) you have saved under your current category. Please select carefully."
    );

    if (confirmChange) {
      setIdentityData(prev => ({
        ...prev,
        businessType: newType,
        pharmacistName: "",
        retailLicense: "",
        wholesaleLicense: "",
        gstin: "",
        manufacturingLicense: ""
      }));
      setServicesData({
        homeDeliveryRadius: "",
        bulkOrderCapacity: "",
        authorizedCompanies: [],
        factoryLocations: "",
        products: [],
        distributors: []
      });
    }
  };

  // --- Dynamic Array Handlers ---
  const addCompany = () => setServicesData(prev => ({ ...prev, authorizedCompanies: [...prev.authorizedCompanies, { id: Date.now().toString(), name: "", address: "" }] }));
  const updateCompany = (id: string, field: keyof AuthorizedCompany, value: string) => {
    setServicesData(prev => ({
      ...prev, authorizedCompanies: prev.authorizedCompanies.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };
  const removeCompany = (id: string) => setServicesData(prev => ({ ...prev, authorizedCompanies: prev.authorizedCompanies.filter(c => c.id !== id) }));

  const addProduct = () => setServicesData(prev => ({ ...prev, products: [...prev.products, { id: Date.now().toString(), name: "", composition: "" }] }));
  const updateProduct = (id: string, field: keyof PharmaProduct, value: string) => {
    setServicesData(prev => ({
      ...prev, products: prev.products.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };
  const removeProduct = (id: string) => setServicesData(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));

  const addDistributor = () => setServicesData(prev => ({ ...prev, distributors: [...prev.distributors, { id: Date.now().toString(), cfName: "", superstockistName: "", stockistName: "" }] }));
  const updateDistributor = (id: string, field: keyof Distributor, value: string) => {
    setServicesData(prev => ({
      ...prev, distributors: prev.distributors.map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  };
  const removeDistributor = (id: string) => setServicesData(prev => ({ ...prev, distributors: prev.distributors.filter(d => d.id !== id) }));

  return (
    <DashboardLayout 
      roleName="Pharma Portal" 
      tabs={pharmaTabs} 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      userProfile={{
        name: businessName,
        subtitle: identityData.businessType,
      }}
      homeWidget={<PharmaHomeWidget businessName={businessName} businessType={identityData.businessType} />}
    >
      <div className="max-w-4xl mx-auto pb-24">
        
        {/* Tab 1: Identity & Licenses */}
        {activeTab === "identity" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Identity & Licenses</h3>
                <p className="text-sm text-slate-500 mt-1">Please carefully select your category below.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
                <p className="text-sm text-amber-800 font-medium flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span><strong>Important:</strong> Once you select and save your Business Type, changing it later will erase your old category's data.</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-tenant-accent uppercase tracking-widest mb-2">Business Type</label>
                <select 
                  value={identityData.businessType}
                  onChange={handleBusinessTypeChange}
                  className="w-full bg-slate-50 border-2 border-slate-200 hover:border-tenant-accent rounded-xl px-5 py-3.5 shadow-sm text-slate-900 font-bold text-sm focus:border-tenant-accent outline-none transition-all cursor-pointer"
                >
                  <option value="Retail Pharmacy">Retail Pharmacy</option>
                  <option value="Wholesaler / Distributor">Wholesaler / Distributor</option>
                  <option value="Pharma Manufacturer">Pharma Manufacturer</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <ImageUpload 
                  label="Business Logo / Storefront Photo"
                  defaultImage={identityData.logo}
                  onChange={(url) => setIdentityData(prev => ({...prev, logo: url}))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Business Name</label>
                  <input 
                    type="text" 
                    value={identityData.businessName}
                    onChange={(e) => setIdentityData(prev => ({...prev, businessName: e.target.value}))}
                    placeholder="e.g. Apollo Pharmacy" 
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                  />
                </div>
                
                {identityData.businessType === "Retail Pharmacy" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">Registered Pharmacist Name</label>
                    <input 
                      type="text" 
                      value={identityData.pharmacistName}
                      onChange={(e) => setIdentityData(prev => ({...prev, pharmacistName: e.target.value}))}
                      placeholder="e.g. Rahul Sharma" 
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                    />
                  </div>
                )}

                {(identityData.businessType === "Wholesaler / Distributor" || identityData.businessType === "Pharma Manufacturer") && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">GSTIN Number</label>
                    <input 
                      type="text" 
                      value={identityData.gstin}
                      onChange={(e) => setIdentityData(prev => ({...prev, gstin: e.target.value}))}
                      placeholder="e.g. 21ABCDE1234F1Z5" 
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {identityData.businessType === "Retail Pharmacy" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">Retail Drug License No.</label>
                    <input 
                      type="text" 
                      value={identityData.retailLicense}
                      onChange={(e) => setIdentityData(prev => ({...prev, retailLicense: e.target.value}))}
                      placeholder="e.g. OD/RDL/2023/123" 
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                    />
                  </div>
                )}

                {identityData.businessType === "Wholesaler / Distributor" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">Wholesale Drug License No.</label>
                    <input 
                      type="text" 
                      value={identityData.wholesaleLicense}
                      onChange={(e) => setIdentityData(prev => ({...prev, wholesaleLicense: e.target.value}))}
                      placeholder="e.g. OD/WDL/2023/456" 
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                    />
                  </div>
                )}

                {identityData.businessType === "Pharma Manufacturer" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">Manufacturing License No.</label>
                    <input 
                      type="text" 
                      value={identityData.manufacturingLicense}
                      onChange={(e) => setIdentityData(prev => ({...prev, manufacturingLicense: e.target.value}))}
                      placeholder="e.g. MFG/2023/789" 
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
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

        {/* Tab 3: Services & Logistics (DYNAMIC) */}
        {activeTab === "services" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Services & Logistics</h3>
            
            <div className="space-y-8">
              {/* --- RETAIL --- */}
              {identityData.businessType === "Retail Pharmacy" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Home Delivery Radius</label>
                  <input 
                    type="text" 
                    value={servicesData.homeDeliveryRadius}
                    onChange={(e) => setServicesData(prev => ({...prev, homeDeliveryRadius: e.target.value}))}
                    placeholder="e.g. 5 KM around Sambalpur" 
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                  />
                </div>
              )}

              {/* --- WHOLESALER --- */}
              {identityData.businessType === "Wholesaler / Distributor" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">Bulk Order Capacity</label>
                    <input 
                      type="text" 
                      value={servicesData.bulkOrderCapacity}
                      onChange={(e) => setServicesData(prev => ({...prev, bulkOrderCapacity: e.target.value}))}
                      placeholder="e.g. Min order ₹50,000" 
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-bold text-slate-900">Authorized Companies Network</h4>
                      <button onClick={addCompany} className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition-colors">+ Add Company</button>
                    </div>
                    
                    {servicesData.authorizedCompanies.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-sm font-bold text-slate-500">No companies added</p>
                        <p className="text-xs text-slate-400">Add companies you are authorized to distribute for.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {servicesData.authorizedCompanies.map((comp, index) => (
                          <div key={comp.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex gap-4">
                            <div className="flex-1 space-y-3">
                              <input type="text" value={comp.name} onChange={(e) => updateCompany(comp.id, "name", e.target.value)} placeholder="Company Name (e.g. Sun Pharma)" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                              <input type="text" value={comp.address} onChange={(e) => updateCompany(comp.id, "address", e.target.value)} placeholder="Company Address / Region" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                            </div>
                            <button onClick={() => removeCompany(comp.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg h-fit transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* --- MANUFACTURER --- */}
              {identityData.businessType === "Pharma Manufacturer" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">Factory Locations</label>
                    <textarea 
                      value={servicesData.factoryLocations}
                      onChange={(e) => setServicesData(prev => ({...prev, factoryLocations: e.target.value}))}
                      placeholder="e.g. Plant 1: Baddi, HP. Plant 2: Jharsuguda, Odisha." 
                      rows={2}
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all resize-none" 
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-bold text-slate-900">Product Catalog</h4>
                      <button onClick={addProduct} className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition-colors">+ Add Product</button>
                    </div>
                    
                    {servicesData.products.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-sm font-bold text-slate-500">No products added</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {servicesData.products.map((prod) => (
                          <div key={prod.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex gap-4">
                            <div className="flex-1 space-y-3">
                              <input type="text" value={prod.name} onChange={(e) => updateProduct(prod.id, "name", e.target.value)} placeholder="Product Name (e.g. Para 500)" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                              <input type="text" value={prod.composition} onChange={(e) => updateProduct(prod.id, "composition", e.target.value)} placeholder="Composition (e.g. Paracetamol 500mg)" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                            </div>
                            <button onClick={() => removeProduct(prod.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg h-fit transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-bold text-slate-900">Distributor Network</h4>
                      <button onClick={addDistributor} className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition-colors">+ Add Distributor</button>
                    </div>
                    
                    {servicesData.distributors.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-sm font-bold text-slate-500">No distributors added</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {servicesData.distributors.map((dist) => (
                          <div key={dist.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex gap-4">
                            <div className="flex-1 space-y-3">
                              <input type="text" value={dist.cfName} onChange={(e) => updateDistributor(dist.id, "cfName", e.target.value)} placeholder="C&F Name" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                              <div className="grid grid-cols-2 gap-3">
                                <input type="text" value={dist.superstockistName} onChange={(e) => updateDistributor(dist.id, "superstockistName", e.target.value)} placeholder="Superstockist Name" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                                <input type="text" value={dist.stockistName} onChange={(e) => updateDistributor(dist.id, "stockistName", e.target.value)} placeholder="Stockist Name" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                              </div>
                            </div>
                            <button onClick={() => removeDistributor(dist.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg h-fit transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

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
                  placeholder="e.g. Mon-Sat: 8:00 AM - 9:00 PM" 
                  className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-teal-500 transition-colors w-fit">
                  <input 
                    type="checkbox" 
                    checked={hoursData.is247}
                    onChange={(e) => setHoursData(prev => ({...prev, is247: e.target.checked}))}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-slate-300"
                  />
                  <span className="font-semibold text-slate-700 text-sm">Open 24/7</span>
                </label>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-100">
                <AutosaveIndicator status={hoursSaveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Rx Inbox */}
        {activeTab === "inbox" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Incoming e-Prescriptions</h3>
                <p className="text-sm text-slate-500 mt-1">Prescriptions routed to your pharmacy by doctors or patients.</p>
              </div>
              <div className="text-right">
                <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-xs">2 New Orders</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Order 1 */}
              <div className="border border-slate-200 rounded-xl p-5 hover:border-teal-400 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-1 block">Urgent Fulfillment</span>
                    <h4 className="text-lg font-bold text-slate-900">Patient: Sandeep Sharma</h4>
                    <p className="text-sm text-slate-500">From: Dr. Anjali Das (Apollo Hospital)</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">Rx ID: RX-9942-A</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time Received</p>
                    <p className="text-sm font-bold text-slate-900">Today, 10:45 AM</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Requested Medicines:</p>
                  <ul className="space-y-2">
                    <li className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="font-semibold text-sm">1. Azithromycin 500mg</span>
                      <span className="text-xs font-mono text-slate-500">1-0-1 x 5 Days</span>
                    </li>
                    <li className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="font-semibold text-sm">2. Paracetamol 650mg</span>
                      <span className="text-xs font-mono text-slate-500">SOS x 3 Days</span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Decline Order</button>
                  <button className="px-6 py-2 text-sm font-bold text-white bg-teal-600 rounded-lg shadow-sm hover:bg-teal-700 hover:shadow-md transition-all">Accept & Prepare</button>
                </div>
              </div>

              {/* Order 2 */}
              <div className="border border-slate-200 rounded-xl p-5 hover:border-teal-400 hover:shadow-md transition-all opacity-80">
                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 block">Standard Fulfillment</span>
                    <h4 className="text-lg font-bold text-slate-900">Patient: Priya Patel</h4>
                    <p className="text-sm text-slate-500">From: Self-Routed via Patient Vault</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">Rx ID: RX-8812-B</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time Received</p>
                    <p className="text-sm font-bold text-slate-900">Yesterday, 4:20 PM</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Requested Medicines:</p>
                  <ul className="space-y-2">
                    <li className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="font-semibold text-sm">1. Amlodipine 5mg</span>
                      <span className="text-xs font-mono text-slate-500">1-0-0 x 30 Days</span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Decline Order</button>
                  <button className="px-6 py-2 text-sm font-bold text-white bg-teal-600 rounded-lg shadow-sm hover:bg-teal-700 hover:shadow-md transition-all">Accept & Prepare</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
