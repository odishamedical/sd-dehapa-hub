"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import AddressBlock, { AddressData } from '@/components/AddressBlock';
import { useAutosave } from '@/hooks/useAutosave';
import AutosaveIndicator from '@/components/AutosaveIndicator';

function UserHomeWidget({ userName }: { userName: string | null }) {
  return (
    <div className="bg-gradient-to-r from-tenant-accent/10 to-teal-600/5 border border-tenant-accent/20 rounded-2xl p-8 flex justify-between items-center relative overflow-hidden shadow-sm">
      <div className="z-10">
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Welcome back, {userName}</h2>
        <p className="text-slate-500 text-sm">Your FHIR-compliant medical records are up to date.</p>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-tenant-accent/10 to-transparent pointer-events-none" />
    </div>
  );
}

export default function UserDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>("User");
  
  const [activeTab, setActiveTab] = useState("home");

  // State for Identity
  const [identityData, setIdentityData] = useState({
    fullName: "",
    phone: "",
    email: ""
  });
  const identitySaveStatus = useAutosave(identityData, 1000);

  // State for Address
  const [addressData, setAddressData] = useState<AddressData>({
    country: "India",
    state: "Odisha",
    district: "",
    block: "",
    city: "",
    pincode: "",
    localAddress: ""
  });
  const addressSaveStatus = useAutosave(addressData, 1000);

  // State for Family Members
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const familySaveStatus = useAutosave(familyMembers, 1000);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      
      if (!email) {
        window.location.href = "/login";
      } else {
        setUserEmail(email);
        setUserName(name || email.split("@")[0]);
        setIdentityData(prev => ({ ...prev, fullName: name || "", email }));
      }
    }
  }, [router]);

  const handleTabChange = (tabId: string) => {
    if (tabId === "find_doctor") {
      router.push("/doctors");
      return;
    }
    if (tabId === "vault" && userEmail) {
      router.push(`/portal/vault/${encodeURIComponent(userEmail)}`);
      return;
    }
    setActiveTab(tabId);
  };

  if (!userEmail) return null;

  const userTabs: DashboardTab[] = [
    {
      id: "identity",
      label: "Identity & Contact",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
    },
    {
      id: "address",
      label: "Location & Address",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    },
    {
      id: "family",
      label: "Family Members",
      section: "PROFILE BUILDER",
      badge: familyMembers.length > 0 ? familyMembers.length : undefined,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    {
      id: "find_doctor",
      label: "Find a Doctor",
      section: "QUICK ACTIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
    },
    {
      id: "vault",
      label: "Health Vault",
      section: "QUICK ACTIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    }
  ];

  const addFamilyMember = () => {
    if (familyMembers.length >= 5) {
      alert("You can only add up to 5 family members.");
      return;
    }
    setFamilyMembers(prev => [...prev, {
      id: Date.now().toString(),
      name: "",
      age: "",
      sex: "",
      relationship: "",
      bloodGroup: "",
      medicalHistory: ""
    }]);
  };

  const updateFamilyMember = (index: number, field: string, value: string) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const removeFamilyMember = (index: number) => {
    const updated = familyMembers.filter((_, i) => i !== index);
    setFamilyMembers(updated);
  };

  return (
    <DashboardLayout 
      roleName="User Portal" 
      tabs={userTabs} 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      userProfile={{
        name: userName || "User",
        subtitle: userEmail,
      }}
      homeWidget={<UserHomeWidget userName={userName} />}
    >
      <div className="max-w-4xl mx-auto pb-24">
        
        {activeTab === "identity" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Identity & Contact</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors">Upload Photo</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    value={identityData.fullName}
                    onChange={e => setIdentityData(prev => ({...prev, fullName: e.target.value}))}
                    placeholder="e.g. Shyam Dash" 
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={identityData.phone}
                    onChange={e => setIdentityData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="e.g. +91 9876543210" 
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={identityData.email}
                  disabled
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-5 py-3.5 shadow-sm text-sm text-slate-500 outline-none cursor-not-allowed" 
                />
                <p className="text-xs text-slate-400 mt-2">Email cannot be changed as it is linked to your DehaPa Auth.</p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <AutosaveIndicator status={identitySaveStatus} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "address" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Location & Address</h3>
            <AddressBlock data={addressData} onChange={setAddressData} />
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
              <AutosaveIndicator status={addressSaveStatus} />
            </div>
          </div>
        )}

        {activeTab === "family" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Family Members</h3>
                <p className="text-sm text-slate-500 mt-1">Add up to 5 family members to book appointments on their behalf.</p>
              </div>
              <button 
                onClick={addFamilyMember}
                disabled={familyMembers.length >= 5}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-lg text-sm transition-colors shadow-sm"
              >
                + Add Member ({familyMembers.length}/5)
              </button>
            </div>
            
            <div className="space-y-6">
              {familyMembers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  <p className="font-bold text-slate-900 mb-1">No family members added</p>
                  <p className="text-sm text-slate-500">You can add your spouse, children, or parents.</p>
                </div>
              ) : (
                familyMembers.map((member, index) => (
                  <div key={member.id} className="border border-slate-300 rounded-2xl p-6 relative bg-slate-50 shadow-inner">
                    <button 
                      onClick={() => removeFamilyMember(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    
                    <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Family Member {index + 1}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Full Name</label>
                        <input 
                          type="text" 
                          value={member.name}
                          onChange={e => updateFamilyMember(index, 'name', e.target.value)}
                          placeholder="e.g. Anjali Dash" 
                          className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 shadow-sm text-sm focus:border-teal-500 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Relationship</label>
                        <select 
                          value={member.relationship}
                          onChange={e => updateFamilyMember(index, 'relationship', e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 shadow-sm text-sm focus:border-teal-500 outline-none"
                        >
                          <option value="">Select Relationship</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Parent">Parent</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Age</label>
                        <input 
                          type="number" 
                          value={member.age}
                          onChange={e => updateFamilyMember(index, 'age', e.target.value)}
                          placeholder="e.g. 35" 
                          className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 shadow-sm text-sm focus:border-teal-500 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Sex</label>
                        <select 
                          value={member.sex}
                          onChange={e => updateFamilyMember(index, 'sex', e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 shadow-sm text-sm focus:border-teal-500 outline-none"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Blood Group</label>
                        <select 
                          value={member.bloodGroup}
                          onChange={e => updateFamilyMember(index, 'bloodGroup', e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 shadow-sm text-sm focus:border-teal-500 outline-none"
                        >
                          <option value="">Select</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Medical History</label>
                      <textarea 
                        value={member.medicalHistory}
                        onChange={e => updateFamilyMember(index, 'medicalHistory', e.target.value)}
                        placeholder="e.g. Diabetic, allergic to penicillin..." 
                        rows={3}
                        className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 shadow-sm text-sm focus:border-teal-500 outline-none resize-none" 
                      />
                    </div>
                  </div>
                ))
              )}

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
                <AutosaveIndicator status={familySaveStatus} />
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
