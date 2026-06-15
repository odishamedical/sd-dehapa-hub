"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import AddressBlock, { AddressData } from '@/components/AddressBlock';
import { useAutosave } from '@/hooks/useAutosave';
import AutosaveIndicator from '@/components/AutosaveIndicator';
import ImageUpload from '@/components/ImageUpload';

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
    profilePhoto: "",
    fullName: "",
    phone: "",
    whatsappNumber: "",
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
              <ImageUpload 
                defaultImage={identityData.profilePhoto}
                onChange={(url) => setIdentityData(prev => ({...prev, profilePhoto: url}))}
              />

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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5 flex items-center gap-2">
                    WhatsApp Number
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  </label>
                  <input 
                    type="text" 
                    value={identityData.whatsappNumber}
                    onChange={e => setIdentityData(prev => ({...prev, whatsappNumber: e.target.value}))}
                    placeholder="e.g. +91 9876543210" 
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none" 
                  />
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
