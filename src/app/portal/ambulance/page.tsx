"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import AddressBlock, { AddressData } from '@/components/AddressBlock';
import { useAutosave } from '@/hooks/useAutosave';
import AutosaveIndicator from '@/components/AutosaveIndicator';
import ImageUpload from '@/components/ImageUpload';
import PatientLeadsWidget from '@/components/PatientLeadsWidget';
import InviteWidget from '@/components/InviteWidget';

interface Vehicle {
  id: string;
  registrationNumber: string;
  type: string; // ALS or BLS
  hasAC: boolean;
  hasOxygen: boolean;
}

function AmbulanceHomeWidget({ agencyName }: { agencyName: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 border border-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.05)] rounded-[24px] p-8 relative overflow-hidden">
        {/* Metallic Shine Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 hover:translate-x-full duration-1000 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">EMS Profile Strength</h3>
            <p className="text-sm text-slate-500 mt-1">Complete your agency profile to rank higher in the public directory.</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-red-500">25%</span>
          </div>
        </div>
        
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-400 to-red-600 h-full rounded-full w-[25%]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Pending Actions
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center justify-between bg-amber-50 border border-amber-100 p-3 rounded-xl">
                <span className="text-sm text-amber-900 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  Register your Fleet Vehicles
                </span>
                <button className="text-xs font-bold text-amber-700 bg-amber-100/50 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">Complete</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-1">
        <InviteWidget userUid={null} />
      </div>
    </div>
  );
}

export default function AmbulanceDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [agencyName, setAgencyName] = useState("Ambulance Service");
  const [userEmail, setUserEmail] = useState("");

  const [activeTab, setActiveTab] = useState("home");

  // State: Agency Identity
  const [identityData, setIdentityData] = useState({
    logo: "",
    agencyName: "",
    tradeLicense: "",
    phone: "",
    whatsappNumber: "",
    email: ""
  });
  const identitySaveStatus = useAutosave(identityData, 1000);

  // State: Service Areas
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
  
  // State: Fleet Management
  const [fleetData, setFleetData] = useState<Vehicle[]>([]);
  const fleetSaveStatus = useAutosave(fleetData, 1000);

  // State: Contact Protocol
  const [contactData, setContactData] = useState({
    dispatchNumber1: "",
    dispatchNumber2: "",
    serviceRadius: "" // in KM
  });
  const contactSaveStatus = useAutosave(contactData, 1000);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("sd_current_user_role");
      const name = localStorage.getItem("sd_current_user_name");
      const email = localStorage.getItem("sd_current_user_email");
      
      if (role === "ambulance" || role === "super_admin") {
        setAccessGranted(true);
        if (name) {
          setAgencyName(name);
          setIdentityData(prev => ({ ...prev, agencyName: name }));
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

  const ambulanceTabs: DashboardTab[] = [
    {
      id: "inquiries",
      label: "Patient Inquiries",
      section: "PATIENT INQUIRIES",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
    },
    {
      id: "identity",
      label: "Agency Identity",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
    },
    {
      id: "fleet",
      label: "Fleet Management",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
    },
    {
      id: "location",
      label: "Base & Service Area",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
    },
    {
      id: "contact",
      label: "Contact Protocol",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    },
    {
      id: "dispatch",
      label: "Live Dispatch",
      section: "OPERATIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // --- Dynamic Array Handlers ---
  const addVehicle = () => setFleetData(prev => [...prev, { id: Date.now().toString(), registrationNumber: "", type: "BLS", hasAC: false, hasOxygen: false }]);
  const updateVehicle = (id: string, field: keyof Vehicle, value: any) => {
    setFleetData(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };
  const removeVehicle = (id: string) => setFleetData(prev => prev.filter(v => v.id !== id));

  return (
    <DashboardLayout 
      roleName="Ambulance Portal" 
      tabs={ambulanceTabs} 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      userProfile={{
        name: agencyName,
        subtitle: "EMS Agency",
      }}
      homeWidget={<AmbulanceHomeWidget agencyName={agencyName} />}
    >
      <div className="max-w-4xl mx-auto pb-24">
        
        {/* Tab: Patient Inquiries */}
        {activeTab === "inquiries" && (
          <div className="max-w-5xl mx-auto">
             <PatientLeadsWidget providerId="amb-1" />
          </div>
        )}

        {/* Tab 1: Agency Identity */}
        {activeTab === "identity" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Agency Identity</h3>
            
            <div className="space-y-6">
              <ImageUpload 
                label="Agency Logo / Base Photo"
                defaultImage={identityData.logo}
                onChange={(url) => setIdentityData(prev => ({...prev, logo: url}))}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Agency Name</label>
                  <input 
                    type="text" 
                    value={identityData.agencyName}
                    onChange={(e) => setIdentityData(prev => ({...prev, agencyName: e.target.value}))}
                    placeholder="e.g. LifeLine EMS" 
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-red-500 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Trade License Number</label>
                  <input 
                    type="text" 
                    value={identityData.tradeLicense}
                    onChange={(e) => setIdentityData(prev => ({...prev, tradeLicense: e.target.value}))}
                    placeholder="e.g. TL-12345" 
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-red-500 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Primary Contact</label>
                  <input 
                    type="text" 
                    value={identityData.phone}
                    onChange={(e) => setIdentityData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="e.g. +91 9876543210" 
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-red-500 outline-none transition-all" 
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
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-red-500 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <AutosaveIndicator status={identitySaveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Fleet Management */}
        {activeTab === "fleet" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Fleet Management</h3>
                <p className="text-sm text-slate-500 mt-1">Register the vehicles in your ambulance fleet.</p>
              </div>
              <button onClick={addVehicle} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest shadow-sm transition-colors">+ Add Vehicle</button>
            </div>
            
            {fleetData.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                </div>
                <p className="font-bold text-slate-900 mb-1">No Vehicles Registered</p>
                <p className="text-sm text-slate-500">Add ALS/BLS vehicles to your directory profile.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {fleetData.map((vehicle) => (
                  <div key={vehicle.id} className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col md:flex-row gap-6 relative">
                    <button onClick={() => removeVehicle(vehicle.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vehicle Reg. Number</label>
                        <input 
                          type="text" 
                          value={vehicle.registrationNumber} 
                          onChange={(e) => updateVehicle(vehicle.id, "registrationNumber", e.target.value)} 
                          placeholder="e.g. OD-02-AB-1234" 
                          className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none uppercase font-mono" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                          <select 
                            value={vehicle.type} 
                            onChange={(e) => updateVehicle(vehicle.id, "type", e.target.value)}
                            className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none cursor-pointer"
                          >
                            <option value="BLS">BLS (Basic Life Support)</option>
                            <option value="ALS">ALS (Advanced Life Support)</option>
                            <option value="Mortuary">Mortuary Van</option>
                          </select>
                        </div>
                        
                        <label className="flex items-center gap-3 p-3 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-red-500 transition-colors mt-5">
                          <input 
                            type="checkbox" 
                            checked={vehicle.hasAC}
                            onChange={(e) => updateVehicle(vehicle.id, "hasAC", e.target.checked)}
                            className="w-4 h-4 text-red-500 rounded focus:ring-red-500 border-slate-300"
                          />
                          <span className="font-semibold text-slate-700 text-sm">Has A/C</span>
                        </label>
                        
                        <label className="flex items-center gap-3 p-3 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-red-500 transition-colors mt-5">
                          <input 
                            type="checkbox" 
                            checked={vehicle.hasOxygen}
                            onChange={(e) => updateVehicle(vehicle.id, "hasOxygen", e.target.checked)}
                            className="w-4 h-4 text-red-500 rounded focus:ring-red-500 border-slate-300"
                          />
                          <span className="font-semibold text-slate-700 text-sm">Has Oxygen</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
              <AutosaveIndicator status={fleetSaveStatus} />
            </div>
          </div>
        )}

        {/* Tab 3: Base Location & Service Area */}
        {activeTab === "location" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Base Operations</h3>
            <AddressBlock data={locationData} onChange={setLocationData} />
            <div className="flex justify-end mt-6 pt-6 border-t border-slate-100">
              <AutosaveIndicator status={locationSaveStatus} />
            </div>
          </div>
        )}

        {/* Tab 4: Contact Protocol */}
        {activeTab === "contact" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Emergency Protocol</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Dispatch Number 1 (Primary)</label>
                  <input 
                    type="text" 
                    value={contactData.dispatchNumber1}
                    onChange={(e) => setContactData(prev => ({...prev, dispatchNumber1: e.target.value}))}
                    placeholder="e.g. 108 or +91 9999999999" 
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-red-500 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Dispatch Number 2 (Backup)</label>
                  <input 
                    type="text" 
                    value={contactData.dispatchNumber2}
                    onChange={(e) => setContactData(prev => ({...prev, dispatchNumber2: e.target.value}))}
                    placeholder="e.g. +91 8888888888" 
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-red-500 outline-none transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Operating Radius (in KM)</label>
                <input 
                  type="number" 
                  value={contactData.serviceRadius}
                  onChange={(e) => setContactData(prev => ({...prev, serviceRadius: e.target.value}))}
                  placeholder="e.g. 50" 
                  className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-red-500 outline-none transition-all" 
                />
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-100">
                <AutosaveIndicator status={contactSaveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Live Dispatch */}
        {activeTab === "dispatch" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Emergency Dispatch Queue</h3>
                <p className="text-sm text-slate-500">Manage incoming ambulance requests in real-time.</p>
              </div>
              <div className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-red-200 animate-pulse">
                Live Feed Active
              </div>
            </div>
            
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p className="font-bold text-slate-900 mb-1">No Active Emergencies</p>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">Standby for incoming dispatch requests from patients or hospitals.</p>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
