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
import DashboardHomeGrid from '@/components/DashboardHomeGrid';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { GlobalFormCard, GlobalInput, GlobalLabel } from '@/components/ui/FormElements';

interface RosteredDoctor {
  id: string;
  name: string;
  department: string;
  status: "Pending" | "Active";
}

export default function HospitalDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [hospitalName, setHospitalName] = useState("Enterprise Dashboard");
  const [userEmail, setUserEmail] = useState("");

  const [activeTab, setActiveTab] = useState("home");

  const [hospitalUid, setHospitalUid] = useState<string | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // State: Identity & Bio
  const [identityData, setIdentityData] = useState({
    logo: "",
    hospitalName: "",
    establishmentYear: "",
    registrationNumber: "",
    phone: "",
    whatsappNumber: "",
    email: ""
  });
  const identitySaveStatus = useAutosave(identityData, hospitalUid, "identityData", 1000);

  // State: Location & Infrastructure
  const [locationData, setLocationData] = useState<AddressData>({
    country: "India",
    state: "Odisha",
    district: "",
    block: "",
    city: "",
    pincode: "",
    localAddress: ""
  });
  const locationSaveStatus = useAutosave(locationData, hospitalUid, "locationData", 1000);
  
  const [infrastructureData, setInfrastructureData] = useState({
    totalBeds: "",
    hasIcu: false,
    hasEmergency: false,
    is247: false
  });
  const infrastructureSaveStatus = useAutosave(infrastructureData, hospitalUid, "infrastructureData", 1000);

  // State: Departments
  const [departments, setDepartments] = useState([{ name: "" }]);
  const departmentsSaveStatus = useAutosave(departments, hospitalUid, "departments", 1000);
  const addDepartment = () => setDepartments(prev => [...prev, { name: "" }]);
  const removeDepartment = (index: number) => setDepartments(prev => prev.filter((_, i) => i !== index));
  const moveDepartment = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === departments.length - 1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setDepartments(prev => { const copy = [...prev]; const temp = copy[index]; copy[index] = copy[newIndex]; copy[newIndex] = temp; return copy; });
  };
  const updateDepartment = (index: number, value: string) => setDepartments(prev => { const copy = [...prev]; copy[index].name = value; return copy; });

  // State: Insurance
  const [insuranceNetworks, setInsuranceNetworks] = useState([{ name: "" }]);
  const insuranceSaveStatus = useAutosave(insuranceNetworks, hospitalUid, "insuranceNetworks", 1000);
  const addInsurance = () => setInsuranceNetworks(prev => [...prev, { name: "" }]);
  const removeInsurance = (index: number) => setInsuranceNetworks(prev => prev.filter((_, i) => i !== index));
  const moveInsurance = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === insuranceNetworks.length - 1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setInsuranceNetworks(prev => { const copy = [...prev]; const temp = copy[index]; copy[index] = copy[newIndex]; copy[newIndex] = temp; return copy; });
  };
  const updateInsurance = (index: number, value: string) => setInsuranceNetworks(prev => { const copy = [...prev]; copy[index].name = value; return copy; });

  // State: Roster
  const [rosterDoctors, setRosterDoctors] = useState<RosteredDoctor[]>([]);
  const rosterSaveStatus = useAutosave(rosterDoctors, hospitalUid, "rosterDoctors", 1000);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search doctors in Firestore directory
  useEffect(() => {
    const searchDoctors = async () => {
      if (doctorSearchQuery.length < 3) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const q = query(
          collection(db, "directory"),
          where("role", "==", "doctor")
        );
        const querySnapshot = await getDocs(q);
        const results: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const name = data.basicInfo?.fullName || data.name || "";
          const specialty = data.basicInfo?.specialityName || data.specialty || "";
          
          if (name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) || 
              specialty.toLowerCase().includes(doctorSearchQuery.toLowerCase())) {
            results.push({ id: doc.id, name, specialty });
          }
        });
        setSearchResults(results);
      } catch (err) {
        console.error("Error searching doctors:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchDoctors, 500); // debounce
    return () => clearTimeout(timeoutId);
  }, [doctorSearchQuery]);

  const handleInviteDoctor = async (docObj: any) => {
    if (!hospitalUid) return;
    if (rosterDoctors.find(r => r.id === docObj.id)) return;
    
    // Add locally as Pending
    setRosterDoctors(prev => [...prev, { id: docObj.id, name: docObj.name, department: docObj.specialty, status: "Pending" }]);
    setShowInviteModal(false);
    setDoctorSearchQuery("");

    // Write to hospital_affiliations collection
    try {
      await addDoc(collection(db, "hospital_affiliations"), {
        hospitalId: hospitalUid,
        hospitalName: hospitalName,
        doctorId: docObj.id,
        doctorName: docObj.name,
        doctorSpecialty: docObj.specialty,
        status: "pending",
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to send invite:", err);
    }
  };

  const removeDoctor = (id: string) => setRosterDoctors(prev => prev.filter(d => d.id !== id));

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("sd_current_user_role");
      const name = localStorage.getItem("sd_current_user_name");
      const email = localStorage.getItem("sd_current_user_email");
      const uid = localStorage.getItem("sd_current_user_uid") || localStorage.getItem("sd_current_user_email");
      
      if (role === "hospital" || role === "super_admin") {
        setAccessGranted(true);
        if (uid) setHospitalUid(uid);
        if (name) {
          setHospitalName(name);
          setIdentityData(prev => ({ ...prev, hospitalName: name }));
        }
        if (email) setUserEmail(email);
      } else {
        setAccessGranted(false);
        router.push("/portal");
      }
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!hospitalUid) return;
      try {
        const docRef = doc(db, 'directory', hospitalUid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.identityData) setIdentityData(data.identityData);
          if (data.locationData) setLocationData(data.locationData);
          if (data.infrastructureData) setInfrastructureData(data.infrastructureData);
          if (data.departments) setDepartments(data.departments);
          if (data.insuranceNetworks) setInsuranceNetworks(data.insuranceNetworks);
          if (data.rosterDoctors) setRosterDoctors(data.rosterDoctors);
        }
      } catch (err) {
        console.error("Failed to fetch hospital profile", err);
      } finally {
        setIsProfileLoaded(true);
      }
    };
    fetchProfile();
  }, [hospitalUid]);

  if (loading) return null;
  if (!accessGranted) return null;
  if (hospitalUid && !isProfileLoaded) return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const hospitalTabs: DashboardTab[] = [
    {
      id: "inquiries",
      label: "Patient Inquiries",
      section: "PATIENT INQUIRIES",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
    },
    {
      id: "identity",
      label: "Identity & Bio",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
    },
    {
      id: "infrastructure",
      label: "Location & Infra",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
    },
    {
      id: "departments",
      label: "Departments",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
    },
    {
      id: "roster",
      label: "Associated Doctors",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    },
    {
      id: "insurance",
      label: "Insurance & TPA",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <DashboardLayout 
      roleName="Hospital Portal" 
      tabs={hospitalTabs} 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      userProfile={{
        name: hospitalName,
        subtitle: "Enterprise Account",
      }}
      homeWidget={
        <DashboardHomeGrid
          onNavigate={setActiveTab}
          tabs={hospitalTabs}
          profileStrength={20}
          profileTitle="Hospital Profile Strength"
          profileSubtitle="Complete your facility profile to rank higher in the public directory."
          pendingActions={[
            { id: '1', label: 'Add Clinical Registration No.', tabId: 'identity' },
            { id: '2', label: 'Invite Doctors to Roster', tabId: 'team' }
          ]}
          topRightWidget={<InviteWidget userUid={null} />}
        />
      }
      hideDefaultModulesList={true}
    >
      <div className="max-w-4xl mx-auto pb-24">
        
        {/* Tab: Patient Inquiries */}
        {activeTab === "inquiries" && (
          <div className="max-w-5xl mx-auto">
             <PatientLeadsWidget providerId="hospital-1" />
          </div>
        )}

        {/* Tab 1: Identity & Bio */}
        {activeTab === "identity" && (
          <GlobalFormCard className="animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200/50 pb-4">Identity & Bio</h3>
            
            <div className="space-y-6">
              <ImageUpload 
                label="Hospital Logo / Front Image"
                defaultImage={identityData.logo}
                onChange={(url) => setIdentityData(prev => ({...prev, logo: url}))}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <GlobalLabel>Hospital Name</GlobalLabel>
                  <GlobalInput 
                    type="text" 
                    value={identityData.hospitalName}
                    onChange={(e) => setIdentityData(prev => ({...prev, hospitalName: e.target.value}))}
                    placeholder="e.g. Apollo Hospitals" 
                  />
                </div>
                <div>
                  <GlobalLabel>Clinical Registration Number</GlobalLabel>
                  <GlobalInput 
                    type="text" 
                    value={identityData.registrationNumber}
                    onChange={(e) => setIdentityData(prev => ({...prev, registrationNumber: e.target.value}))}
                    placeholder="e.g. CLINIC-12345" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <GlobalLabel>Phone Number</GlobalLabel>
                  <GlobalInput 
                    type="text" 
                    value={identityData.phone}
                    onChange={(e) => setIdentityData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="e.g. +91 9876543210" 
                  />
                </div>
                <div>
                  <GlobalLabel className="flex items-center gap-2">
                    WhatsApp Number
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  </GlobalLabel>
                  <GlobalInput 
                    type="text" 
                    value={identityData.whatsappNumber}
                    onChange={(e) => setIdentityData(prev => ({...prev, whatsappNumber: e.target.value}))}
                    placeholder="e.g. +91 9876543210" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200/50">
                <AutosaveIndicator status={identitySaveStatus} />
              </div>
            </div>
          </GlobalFormCard>
        )}

        {/* Tab 2: Location & Infrastructure */}
        {activeTab === "infrastructure" && (
          <GlobalFormCard className="animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200/50 pb-4">Location & Infrastructure</h3>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-4">Physical Address</h4>
                <AddressBlock data={locationData} onChange={setLocationData} />
                <div className="flex justify-end mt-2">
                  <AutosaveIndicator status={locationSaveStatus} />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200/50">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Facility Capabilities</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <GlobalLabel>Total Beds Capacity</GlobalLabel>
                    <GlobalInput 
                      type="number" 
                      value={infrastructureData.totalBeds}
                      onChange={(e) => setInfrastructureData(prev => ({...prev, totalBeds: e.target.value}))}
                      placeholder="e.g. 50" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-teal-500 transition-colors bg-white shadow-sm">
                    <input 
                      type="checkbox" 
                      checked={infrastructureData.hasIcu}
                      onChange={(e) => setInfrastructureData(prev => ({...prev, hasIcu: e.target.checked}))}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-slate-300"
                    />
                    <span className="font-bold text-slate-700 text-sm">Has ICU</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-teal-500 transition-colors bg-white shadow-sm">
                    <input 
                      type="checkbox" 
                      checked={infrastructureData.hasEmergency}
                      onChange={(e) => setInfrastructureData(prev => ({...prev, hasEmergency: e.target.checked}))}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-slate-300"
                    />
                    <span className="font-bold text-slate-700 text-sm">24/7 Emergency Ward</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-teal-500 transition-colors bg-white shadow-sm">
                    <input 
                      type="checkbox" 
                      checked={infrastructureData.is247}
                      onChange={(e) => setInfrastructureData(prev => ({...prev, is247: e.target.checked}))}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-slate-300"
                    />
                    <span className="font-bold text-slate-700 text-sm">Open 24/7</span>
                  </label>
                </div>
                <div className="flex justify-end mt-4">
                  <AutosaveIndicator status={infrastructureSaveStatus} />
                </div>
              </div>
            </div>
          </GlobalFormCard>
        )}

        {/* Tab 3: Departments */}
        {activeTab === "departments" && (
          <GlobalFormCard className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-200/50 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Departments & Specialties</h3>
                <p className="text-sm text-slate-500 mt-1">Select the active medical departments in your facility.</p>
              </div>
              <button onClick={addDepartment} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">+ Add Department</button>
            </div>
            
            <div className="space-y-6">
              {departments.map((dept, index) => (
                <div key={index} className="border border-slate-300 rounded-2xl p-6 relative bg-slate-50 shadow-inner hover:border-teal-400 hover:shadow-md transition-all duration-300">
                  <div className="absolute top-4 right-4 flex gap-3 items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                      <button onClick={() => moveDepartment(index, 'up')} disabled={index === 0} className={`px-3 py-2 hover:bg-slate-200 transition-colors flex items-center gap-1 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-800'}`} title="Move Up">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg>
                      </button>
                      <div className="w-px bg-slate-300"></div>
                      <button onClick={() => moveDepartment(index, 'down')} disabled={index === departments.length - 1} className={`px-3 py-2 hover:bg-slate-200 transition-colors flex items-center gap-1 ${index === departments.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-800'}`} title="Move Down">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                    </div>

                    <button onClick={() => removeDepartment(index)} className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors shadow-sm" title="Delete Department">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Remove
                    </button>
                  </div>
                  
                  <div className="mt-2 pr-48">
                    <GlobalLabel>Department Name</GlobalLabel>
                    <GlobalInput type="text" value={dept.name} onChange={(e) => updateDepartment(index, e.target.value)} placeholder="e.g. Cardiology" />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200/50 mt-6">
                <AutosaveIndicator status={departmentsSaveStatus} />
              </div>
            </div>
          </GlobalFormCard>
        )}

        {/* Tab 4: Associated Doctors */}
        {activeTab === "roster" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Doctor Roster</h3>
                <p className="text-sm text-slate-500 mt-1">Manage the doctors linked to your hospital profile.</p>
              </div>
              <button onClick={() => setShowInviteModal(true)} className="bg-tenant-accent hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest shadow-sm transition-colors">+ Invite Doctor</button>
            </div>
            
            {/* Invite Modal Overlay */}
            {showInviteModal && (
              <div className="absolute inset-0 bg-white z-10 p-8 rounded-2xl flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Search & Invite Doctor</h3>
                  <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-red-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                
                <div className="relative mb-6">
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  <input 
                    type="text" 
                    autoFocus
                    value={doctorSearchQuery}
                    onChange={(e) => setDoctorSearchQuery(e.target.value)}
                    placeholder="Search doctor by name or specialty..." 
                    className="w-full bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-xl pl-12 pr-4 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all" 
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                  {isSearching ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : doctorSearchQuery.length > 0 && searchResults.length === 0 && doctorSearchQuery.length >= 3 ? (
                    <p className="text-center text-slate-500 py-4">No doctors found matching "{doctorSearchQuery}"</p>
                  ) : doctorSearchQuery.length < 3 && doctorSearchQuery.length > 0 ? (
                    <p className="text-center text-slate-500 py-4">Type at least 3 characters to search</p>
                  ) : (
                    searchResults.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">👨‍⚕️</div>
                          <div>
                            <p className="font-bold text-slate-900">{doc.name}</p>
                            <p className="text-xs text-slate-500">{doc.specialty}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleInviteDoctor(doc)}
                          disabled={rosterDoctors.some(r => r.id === doc.id)}
                          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                        >
                          {rosterDoctors.some(r => r.id === doc.id) ? 'Invited' : 'Send Invite'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {rosterDoctors.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                 </div>
                 <p className="font-bold text-slate-900 mb-1">No Doctors on Roster</p>
                 <p className="text-sm text-slate-500 max-w-sm mx-auto">Invite doctors to link their DehaPa profiles to your hospital.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rosterDoctors.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xl">👨‍⚕️</div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{doc.name}</p>
                        <p className="text-sm font-medium text-slate-600 mb-1">{doc.department}</p>
                        {doc.status === 'Pending' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Pending Acceptance
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700 border border-teal-200">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => removeDoctor(doc.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
              <AutosaveIndicator status={rosterSaveStatus} />
            </div>
          </div>
        )}

        {/* Tab 5: Insurance & TPA */}
        {activeTab === "insurance" && (
          <GlobalFormCard className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-200/50 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Insurance & TPA</h3>
                <p className="text-sm text-slate-500 mt-1">List accepted health insurance networks for cashless facilities.</p>
              </div>
              <button onClick={addInsurance} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">+ Add Insurance</button>
            </div>
            
            <div className="space-y-6">
              {insuranceNetworks.map((ins, index) => (
                <div key={index} className="border border-slate-300 rounded-2xl p-6 relative bg-slate-50 shadow-inner hover:border-teal-400 hover:shadow-md transition-all duration-300">
                  <div className="absolute top-4 right-4 flex gap-3 items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                      <button onClick={() => moveInsurance(index, 'up')} disabled={index === 0} className={`px-3 py-2 hover:bg-slate-200 transition-colors flex items-center gap-1 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-800'}`} title="Move Up">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg>
                      </button>
                      <div className="w-px bg-slate-300"></div>
                      <button onClick={() => moveInsurance(index, 'down')} disabled={index === insuranceNetworks.length - 1} className={`px-3 py-2 hover:bg-slate-200 transition-colors flex items-center gap-1 ${index === insuranceNetworks.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-800'}`} title="Move Down">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                    </div>

                    <button onClick={() => removeInsurance(index)} className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors shadow-sm" title="Delete Insurance">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Remove
                    </button>
                  </div>
                  
                  <div className="mt-2 pr-48">
                    <GlobalLabel>Network Name</GlobalLabel>
                    <GlobalInput type="text" value={ins.name} onChange={(e) => updateInsurance(index, e.target.value)} placeholder="e.g. BSKY, Star Health" />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200/50 mt-6">
                <AutosaveIndicator status={insuranceSaveStatus} />
              </div>
            </div>
          </GlobalFormCard>
        )}

      </div>
    </DashboardLayout>
  );
}
