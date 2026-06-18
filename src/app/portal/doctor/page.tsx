"use client";

import React, { useState } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import PremiumSlugModal from '@/components/PremiumSlugModal';
import EntitySearchInput from '@/components/EntitySearchInput';
import { useAutosave } from '@/hooks/useAutosave';
import AutosaveIndicator from '@/components/AutosaveIndicator';
import AddressBlock, { AddressData } from '@/components/AddressBlock';
import ImageUpload from '@/components/ImageUpload';
import MultiImageUploader from '@/components/MultiImageUploader';
import PatientLeadsWidget from '@/components/PatientLeadsWidget';
import TelemedicineSettings from '@/components/TelemedicineSettings';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import AvailabilitySettings from '@/components/AvailabilitySettings';
import SecureMedicalVault from '@/components/SecureMedicalVault';
import DoctorAppointments from '@/components/DoctorAppointments';
import PatientRecordsCRM from '@/components/PatientRecordsCRM';
import InviteWidget from '@/components/InviteWidget';
import DoctorStatusToggle from '@/components/DoctorStatusToggle';
import IncomingPingWidget from '@/components/IncomingPingWidget';
import DashboardHomeGrid from '@/components/DashboardHomeGrid';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [isSlugModalOpen, setIsSlugModalOpen] = useState(false);
  const [doctorUid, setDoctorUid] = useState<string | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const uid = localStorage.getItem("sd_current_user_uid") || localStorage.getItem("sd_current_user_email");
      if (!uid) {
        window.location.href = "/login";
      } else {
        setDoctorUid(uid);
      }
    }
  }, []);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!doctorUid) return;
      try {
        const docRef = doc(db, 'directory', doctorUid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data);
          
          if (data.basicInfo) setIdentityData(data.basicInfo);
          if (data.qualifications) setQualificationsData(data.qualifications);
          if (data.locationAddress) setLocationAddress(data.locationAddress);
          if (data.experience) setExperienceData(data.experience);
          if (data.research) setResearchData(data.research);
          if (data.memberships) setMembershipsData(data.memberships);
          if (data.awards) setAwardsData(data.awards);
          if (data.specialties) setSpecialtiesData(data.specialties);
          // bindings
        }
      } catch (err) {
        console.error("Failed to fetch doctor profile", err);
      } finally {
        setIsProfileLoaded(true);
      }
    };
    fetchProfile();
  }, [doctorUid]);

  // Autosave State for Qualifications Tab
  const [qualificationsData, setQualificationsData] = useState<any[]>([]);
  const qualificationsSaveStatus = useAutosave(qualificationsData, doctorUid, "qualifications", 1000);

  const addQualification = () => {
    setQualificationsData(prev => [...prev, { degreeName: "", passingYear: "", collegeId: "", collegeName: "" }]);
  };

  const removeQualification = (index: number) => {
    setQualificationsData(prev => prev.filter((_, i) => i !== index));
  };

  const moveQualification = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === qualificationsData.length - 1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setQualificationsData(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[newIndex];
      copy[newIndex] = temp;
      return copy;
    });
  };

  const updateQualification = (index: number, field: string, value: any) => {
    setQualificationsData(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Identity State
  const [identityData, setIdentityData] = useState({
    profilePhoto: "",
    fullName: "",
    phone: "",
    whatsappNumber: "",
    specialityId: "",
    specialityName: ""
  });
  const identitySaveStatus = useAutosave(identityData, doctorUid, "basicInfo", 1000);

  // Practice Location State
  const [locationAddress, setLocationAddress] = useState<AddressData>({
    country: "India",
    state: "Odisha",
    district: "",
    block: "",
    city: "",
    pincode: "",
    localAddress: ""
  });
  const locationSaveStatus = useAutosave(locationAddress, doctorUid, "locationAddress", 1000);

  // Experience State
  const [experienceData, setExperienceData] = useState<any[]>([]);
  const experienceSaveStatus = useAutosave(experienceData, doctorUid, "experience", 1000);

  const addExperience = () => setExperienceData(prev => [...prev, { hospitalId: "", hospitalName: "", position: "", duration: "" }]);
  const removeExperience = (index: number) => setExperienceData(prev => prev.filter((_, i) => i !== index));
  const moveExperience = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === experienceData.length - 1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setExperienceData(prev => { const copy = [...prev]; const temp = copy[index]; copy[index] = copy[newIndex]; copy[newIndex] = temp; return copy; });
  };
  const updateExperience = (index: number, field: string, value: any) => setExperienceData(prev => { const copy = [...prev]; copy[index] = { ...copy[index], [field]: value }; return copy; });

  // Research State
  const [researchData, setResearchData] = useState<any[]>([]);
  const researchSaveStatus = useAutosave(researchData, doctorUid, "research", 1000);
  const addResearch = () => setResearchData(prev => [...prev, { paperTitle: "", journalId: "", journalName: "", publicationYear: "" }]);
  const removeResearch = (index: number) => setResearchData(prev => prev.filter((_, i) => i !== index));
  const moveResearch = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === researchData.length - 1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setResearchData(prev => { const copy = [...prev]; const temp = copy[index]; copy[index] = copy[newIndex]; copy[newIndex] = temp; return copy; });
  };
  const updateResearch = (index: number, field: string, value: any) => setResearchData(prev => { const copy = [...prev]; copy[index] = { ...copy[index], [field]: value }; return copy; });

  // Memberships State
  const [membershipsData, setMembershipsData] = useState<any[]>([]);
  const membershipsSaveStatus = useAutosave(membershipsData, doctorUid, "memberships", 1000);
  const addMembership = () => setMembershipsData(prev => [...prev, { associationId: "", associationName: "", role: "" }]);
  const removeMembership = (index: number) => setMembershipsData(prev => prev.filter((_, i) => i !== index));
  const moveMembership = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === membershipsData.length - 1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setMembershipsData(prev => { const copy = [...prev]; const temp = copy[index]; copy[index] = copy[newIndex]; copy[newIndex] = temp; return copy; });
  };
  const updateMembership = (index: number, field: string, value: any) => setMembershipsData(prev => { const copy = [...prev]; copy[index] = { ...copy[index], [field]: value }; return copy; });

  // Awards State
  const [awardsData, setAwardsData] = useState<any[]>([]);
  const awardsSaveStatus = useAutosave(awardsData, doctorUid, "awards", 1000);
  const addAward = () => setAwardsData(prev => [...prev, { awardName: "", awardingBody: "", year: "" }]);
  const removeAward = (index: number) => setAwardsData(prev => prev.filter((_, i) => i !== index));
  const moveAward = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === awardsData.length - 1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setAwardsData(prev => { const copy = [...prev]; const temp = copy[index]; copy[index] = copy[newIndex]; copy[newIndex] = temp; return copy; });
  };
  const updateAward = (index: number, field: string, value: any) => setAwardsData(prev => { const copy = [...prev]; copy[index] = { ...copy[index], [field]: value }; return copy; });

  // Specialties State
  const [specialtiesData, setSpecialtiesData] = useState<{ id: string; name: string; isPrimary: boolean }[]>([]);
  const specialtiesSaveStatus = useAutosave(specialtiesData, doctorUid, "specialties", 1000);
  const addSpecialty = () => setSpecialtiesData(prev => [...prev, { id: Math.random().toString(), name: "", isPrimary: prev.length === 0 }]);
  const removeSpecialty = (id: string) => setSpecialtiesData(prev => prev.filter(s => s.id !== id));
  const updateSpecialty = (id: string, name: string) => setSpecialtiesData(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  const setPrimarySpecialty = (id: string) => setSpecialtiesData(prev => prev.map(s => ({ ...s, isPrimary: s.id === id })));

  // Bookings State
  const [bookingsData, setBookingsData] = useState({
    appointmentType: "Video Consultation",
    duration: "15 Mins",
    noticePeriod: "1 Hour"
  });
  const bookingsSaveStatus = useAutosave(bookingsData, 1000);

  const doctorTabs: DashboardTab[] = [
    // 1. QUICK ACCESS
    { id: "home", label: "Dashboard Home", section: "QUICK ACCESS", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> },
    { id: "appointments", label: "Appointments", section: "QUICK ACCESS", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> },
    { id: "inquiries", label: "Patient Inquiries", section: "QUICK ACCESS", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg> },

    // 2. CLINIC MANAGEMENT
    { id: "settings", label: "Availability Settings", section: "CLINIC MANAGEMENT", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
    { id: "telemedicine", label: "Telemedicine Clinic", section: "CLINIC MANAGEMENT", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> },
    { id: "records", label: "Patient Records", section: "CLINIC MANAGEMENT", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg> },
    { id: "vault", label: "Secure Medical Vault", section: "CLINIC MANAGEMENT", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> },

    // 3. PROFILE BUILDER
    { id: "identity", label: "Identity & Bio", section: "PROFILE BUILDER", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> },
    { id: "qualifications", label: "Qualifications", section: "PROFILE BUILDER", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg> },
    { id: "experience", label: "Experience & Positions", section: "PROFILE BUILDER", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> },
    { id: "locations", label: "Practice Locations", section: "PROFILE BUILDER", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> },
    { id: "specialties", label: "Specialties & Services", section: "PROFILE BUILDER", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg> },
    { id: "research", label: "Awards & Publications", section: "PROFILE BUILDER", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg> },

    // 4. REPUTATION & REVENUE
    { id: "reviews", label: "Reviews & Ratings", section: "REPUTATION & REVENUE", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg> },
    { id: "earnings", label: "Earnings & Payouts", section: "REPUTATION & REVENUE", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },

    // 5. ACCOUNT
    { id: "identity_premium", label: "Premium Identity", section: "ACCOUNT SETTINGS", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg> },
    { id: "account_settings", label: "General Settings", section: "ACCOUNT SETTINGS", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> }
  ];

  
  // Dynamic Profile Metrics
  const calculateProfileStrength = () => {
    let score = 0;
    if (identityData?.fullName) score += 20;
    if (identityData?.profilePhoto) score += 20;
    if (identityData?.phone) score += 10;
    if (qualificationsData?.length > 0) score += 25;
    if (locationAddress?.city) score += 25;
    return score;
  };
  
  const getPendingActions = () => {
    const actions = [];
    if (!identityData?.fullName) actions.push({ id: 'a1', label: 'Add Full Name', tabId: 'identity' });
    if (!identityData?.profilePhoto) actions.push({ id: 'a2', label: 'Upload Profile Photo', tabId: 'identity' });
    if (!qualificationsData || qualificationsData.length === 0) actions.push({ id: 'a3', label: 'Add Qualifications', tabId: 'qualifications' });
    if (!locationAddress?.city) actions.push({ id: 'a4', label: 'Add Practice Locations', tabId: 'locations' });
    return actions;
  };
  
  const getCompletedActions = () => {
    const actions = [];
    if (identityData?.fullName) actions.push({ id: 'c1', label: 'Identity Information Added' });
    if (identityData?.profilePhoto) actions.push({ id: 'c2', label: 'Profile Photo Uploaded' });
    if (qualificationsData?.length > 0) actions.push({ id: 'c3', label: 'Qualifications Added' });
    if (locationAddress?.city) actions.push({ id: 'c4', label: 'Locations Added' });
    return actions;
  };
  
  if (!doctorUid || !isProfileLoaded) {
    return (
      <div className="min-h-screen bg-[#040815] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }


  return (
    <>
      <IncomingPingWidget doctorId={doctorUid} doctorSpecialty="Super-specialist Doctor" />
      <DashboardLayout 
        roleName="Doctor Dashboard" 
        tabs={doctorTabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        userProfile={{
          name: profileData?.basicInfo?.fullName || profileData?.name || "Dr. Unnamed Profile",
          subtitle: profileData?.basicInfo?.specialityName || profileData?.speciality || "Update your identity info",
          image: profileData?.basicInfo?.profilePhoto || profileData?.image || null
        }}
        homeWidget={
          <DashboardHomeGrid 
            onNavigate={setActiveTab} 
            tabs={doctorTabs}
            profileStrength={calculateProfileStrength()}
            profileTitle="Profile Strength"
            profileSubtitle="Complete your profile to unlock the 'Verified DehaPa Doctor' badge."
            pendingActions={getPendingActions()}
            completedActions={getCompletedActions()}
            topRightWidget={<InviteWidget userUid={null} />}
            middleRightWidget={<DoctorStatusToggle />}
          />
        }
        hideDefaultModulesList={true}
      >
        <div className="w-full">
        {/* Header Alert */}
        <div className="bg-gradient-to-r from-[#0f172a] to-cyan-950 backdrop-blur-xl border border-cyan-800 text-white rounded-2xl p-6 mb-8 flex items-start gap-4 shadow-xl shadow-cyan-900/20">
          <svg className="w-8 h-8 text-cyan-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h4 className="font-serif font-bold text-lg tracking-wide text-cyan-50">Welcome to your Portal</h4>
            <p className="text-sm mt-1.5 opacity-80 leading-relaxed text-cyan-100/80">The information you fill out here instantly maps to your public profile. Ensure it is accurate to maintain your "Verified" badge.</p>
          </div>
        </div>

        {/* Tab: Patient Inquiries */}
        {activeTab === "inquiries" && (
          <div className="w-full">
             <PatientLeadsWidget providerId={doctorUid} />
          </div>
        )}

        {/* Tab: Patient Records (CRM) */}
        {activeTab === "records" && (
          <div className="w-full">
             <PatientRecordsCRM providerId={doctorUid || ''} />
          </div>
        )}

        {/* Tab: Appointments */}
        {activeTab === "appointments" && (
          <div className="w-full">
             <DoctorAppointments providerId={doctorUid || ''} />
          </div>
        )}

        {/* Tab: Telemedicine Clinic */}
        {activeTab === "telemedicine" && (
          <div className="w-full">
             <TelemedicineSettings providerId={doctorUid} />
          </div>
        )}

        {/* Tab: Secure Medical Vault */}
        {activeTab === "vault" && (
          <div className="w-full">
             <SecureMedicalVault providerId={doctorUid || ''} />
          </div>
        )}

        {/* Tab: Availability Settings */}
        {activeTab === "settings" && (
          <div className="w-full">
             <AvailabilitySettings providerId={doctorUid || ''} />
          </div>
        )}

        {/* Tab 1: Identity & Hero */}
        {activeTab === "identity" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Premium Ticket Call to Action */}
            <div 
              onClick={() => setIsSlugModalOpen(true)}
              className="bg-gradient-to-r from-slate-900 to-teal-900 rounded-2xl p-6 mb-8 cursor-pointer hover:shadow-xl hover:shadow-teal-900/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }}></div>
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Reserve Your Dedicated Name</h3>
                    <p className="text-teal-100 text-sm">Your Name is your Identity. Reserve it before it's too late! Search for your premium URL now.</p>
                  </div>
                </div>
                <button className="shrink-0 px-6 py-3 bg-white text-teal-900 font-bold rounded-xl shadow-lg hover:bg-teal-50 transition-colors whitespace-nowrap">
                  Check Availability
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Identity & Hero Header</h3>
            
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
                    onChange={(e) => setIdentityData(prev => ({...prev, fullName: e.target.value}))}
                    placeholder="e.g. Dr. Sandeep Sharma" 
                    className="w-full bg-white/60 backdrop-blur-xl border-2 border-slate-200/60 hover:border-cyan-300 rounded-xl px-5 py-3.5 shadow-inner text-slate-900 text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Primary Speciality</label>
                  <EntitySearchInput 
                    category="speciality"
                    placeholder="Search your specialty..."
                    valueId={identityData.specialityId}
                    valueName={identityData.specialityName}
                    onChange={(id, name) => setIdentityData(prev => ({...prev, specialityId: id, specialityName: name}))}
                  />
                  <p className="text-xs text-slate-500 mt-2">If your specialty is not listed, you can add it to the global directory.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={identityData.phone}
                    onChange={(e) => setIdentityData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="e.g. +91 9876543210" 
                    className="w-full bg-white/60 backdrop-blur-xl border-2 border-slate-200/60 hover:border-cyan-300 rounded-xl px-5 py-3.5 shadow-inner text-slate-900 text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all" 
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
                    className="w-full bg-white/60 backdrop-blur-xl border-2 border-slate-200/60 hover:border-cyan-300 rounded-xl px-5 py-3.5 shadow-inner text-slate-900 text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Degrees</label>
                  <input type="text" placeholder="e.g. MBBS, MD (Medicine)" className="w-full bg-white/60 backdrop-blur-xl border-2 border-slate-200/60 hover:border-cyan-300 rounded-xl px-5 py-3.5 shadow-inner text-slate-900 text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Medical Registration No.</label>
                  <input type="text" placeholder="e.g. MCI-12345" className="w-full bg-white/60 backdrop-blur-xl border-2 border-slate-200/60 hover:border-cyan-300 rounded-xl px-5 py-3.5 shadow-inner text-slate-900 text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all" />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button className="px-6 py-3 bg-[#0a1229] hover:bg-[#040815] text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] font-bold rounded-xl shadow-lg transition-all">Save Identity Info</button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Qualifications */}
        {activeTab === "qualifications" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Qualifications</h3>
                <p className="text-sm text-slate-500 mt-1">Add your degrees and link them to medical colleges.</p>
              </div>
              <button onClick={addQualification} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">+ Add Qualification</button>
            </div>
            
            <div className="space-y-6">
              {qualificationsData.map((qual, index) => (
                <div key={index} className="border border-white/50 rounded-[24px] p-8 relative bg-white/20 backdrop-blur-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300">
                  <div className="absolute top-4 right-4 flex gap-3 items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    {/* Move Up/Down Buttons */}
                    <div className="flex bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                      <button onClick={() => moveQualification(index, 'up')} disabled={index === 0} className={`px-3 py-2 hover:bg-slate-200 transition-colors flex items-center gap-1 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-800'}`} title="Move Up">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg>
                      </button>
                      <div className="w-px bg-slate-300"></div>
                      <button onClick={() => moveQualification(index, 'down')} disabled={index === qualificationsData.length - 1} className={`px-3 py-2 hover:bg-slate-200 transition-colors flex items-center gap-1 ${index === qualificationsData.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-800'}`} title="Move Down">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                    </div>

                    <button className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors shadow-sm" title="Profile is Public">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      Public View
                    </button>
                    
                    <button onClick={() => removeQualification(index)} className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors shadow-sm" title="Delete Qualification">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 mt-2">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Degree Name</label>
                      <input 
                        type="text" 
                        value={qual.degreeName}
                        onChange={(e) => updateQualification(index, 'degreeName', e.target.value)}
                        placeholder="e.g. MBBS, MD" 
                        className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Passing Year</label>
                      <input 
                        type="number" 
                        value={qual.passingYear}
                        onChange={(e) => updateQualification(index, 'passingYear', e.target.value)}
                        placeholder="e.g. 2010" 
                        className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Medical College / University</label>
                    <EntitySearchInput 
                      category="college"
                      placeholder="Search or add college name..."
                      valueId={qual.collegeId}
                      valueName={qual.collegeName}
                      onChange={(id, name) => {
                        updateQualification(index, 'collegeId', id);
                        updateQualification(index, 'collegeName', name);
                      }}
                    />
                    <p className="text-xs text-slate-500 mt-2">Type to search the DehaPa network. If it doesn't exist, you can add it as a new entry.</p>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 h-12">
                <AutosaveIndicator status={qualificationsSaveStatus} />
                {/* Save button becomes optional but kept for reassurance */}
                <button 
                  className={`px-6 py-2.5 font-bold rounded-xl shadow-sm transition-all text-sm ${
                    qualificationsSaveStatus === 'saving' 
                      ? 'bg-slate-100/50 text-slate-400 cursor-not-allowed' 
                      : 'bg-[#0a1229] hover:bg-[#040815] text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  }`}
                  disabled={qualificationsSaveStatus === 'saving'}
                >
                  {qualificationsSaveStatus === 'saving' ? 'Saving...' : 'Save Qualifications'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Experience & Positions */}
        {activeTab === "experience" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Experience & Positions</h3>
                <p className="text-sm text-slate-500 mt-1">List your past and current professional roles and hospital affiliations.</p>
              </div>
              <button onClick={addExperience} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">+ Add Experience</button>
            </div>
            
            <div className="space-y-6">
              {experienceData.map((exp, index) => (
                <div key={index} className="border border-white/50 rounded-[24px] p-8 relative bg-white/20 backdrop-blur-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300">
                  <div className="absolute top-4 right-4 flex gap-3 items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    {/* Move Up/Down Buttons */}
                    <div className="flex bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                      <button onClick={() => moveExperience(index, 'up')} disabled={index === 0} className={`px-3 py-2 hover:bg-slate-200 transition-colors flex items-center gap-1 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-800'}`} title="Move Up">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg>
                      </button>
                      <div className="w-px bg-slate-300"></div>
                      <button onClick={() => moveExperience(index, 'down')} disabled={index === experienceData.length - 1} className={`px-3 py-2 hover:bg-slate-200 transition-colors flex items-center gap-1 ${index === experienceData.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-800'}`} title="Move Down">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                    </div>

                    <button className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors shadow-sm" title="Profile is Public">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      Public View
                    </button>
                    
                    <button onClick={() => removeExperience(index)} className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors shadow-sm" title="Delete Experience">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Remove
                    </button>
                  </div>
                  
                  <div className="mb-4 mt-2">
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Hospital or Institution</label>
                    <EntitySearchInput 
                      category="hospital"
                      placeholder="Search or add hospital name..."
                      valueId={exp.hospitalId}
                      valueName={exp.hospitalName}
                      onChange={(id, name) => {
                        updateExperience(index, 'hospitalId', id);
                        updateExperience(index, 'hospitalName', name);
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Title / Position</label>
                      <input type="text" value={exp.position} onChange={(e) => updateExperience(index, 'position', e.target.value)} placeholder="e.g. HOD, Senior Consultant" className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Years (e.g. 2015-2020)</label>
                      <input type="text" value={exp.duration} onChange={(e) => updateExperience(index, 'duration', e.target.value)} placeholder="e.g. 2015 - Present" className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all" />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <AutosaveIndicator status={experienceSaveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Practice Locations */}
        {activeTab === "locations" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-white/30 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Practice Locations</h3>
                <p className="text-sm text-slate-500 mt-1">Manage the clinics and hospitals where you currently practice.</p>
              </div>
              <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">+ Add Clinic</button>
            </div>
            
            <div className="space-y-6">
              <div className="border border-white/50 rounded-[24px] p-8 relative bg-white/20 backdrop-blur-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300">
                <div className="absolute top-4 right-4 flex gap-3 items-center">
                  <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Mandatory Public</span>
                </div>
                
                <div className="mb-4 mt-2">
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Clinic or Hospital Name</label>
                  <EntitySearchInput 
                    category="clinic"
                    placeholder="Search or add clinic name..."
                    valueId=""
                    valueName="Shyam Care Clinic"
                    onChange={(id, name) => console.log(id, name)}
                  />
                </div>

                <div className="mb-4 mt-8">
                  <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Location Details</h4>
                  <AddressBlock 
                    data={locationAddress}
                    onChange={setLocationAddress}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 mt-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Timings</label>
                    <input type="text" defaultValue="Mon-Sat, 10 AM - 2 PM" className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Consultation Fee (₹)</label>
                    <input type="number" defaultValue="800" className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all" />
                  </div>
                </div>

                <div className="mt-10 border-t border-slate-200/60 pt-8">
                  <MultiImageUploader 
                    providerId={doctorUid || undefined}
                    initialImages={[
                      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    ]}
                    onUpload={async (urls) => {
                      if (doctorUid) {
                        try {
                          await updateDoc(doc(db, 'directory', doctorUid), { galleryImages: urls });
                        } catch (e) {
                          console.error("Failed to save gallery URLs to directory:", e);
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <AutosaveIndicator status={locationSaveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Research & Publications */}
        {activeTab === "research" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-xl font-bold text-slate-900">Research & Publications</h3>
              <button onClick={addResearch} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">+ Add Publication</button>
            </div>
            
            <div className="space-y-6">
              {researchData.map((research, index) => (
                <div key={index} className="border border-white/50 rounded-[24px] p-8 relative bg-white/20 backdrop-blur-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300">
                  <div className="absolute top-4 right-4 flex gap-3 items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                      <button onClick={() => moveResearch(index, 'up')} disabled={index === 0} className={`px-3 py-2 hover:bg-slate-200 transition-colors flex items-center gap-1 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-800'}`} title="Move Up">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg>
                      </button>
                      <div className="w-px bg-slate-300"></div>
                      <button onClick={() => moveResearch(index, 'down')} disabled={index === researchData.length - 1} className={`px-3 py-2 hover:bg-slate-200 transition-colors flex items-center gap-1 ${index === researchData.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-800'}`} title="Move Down">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                    </div>

                    <button className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors shadow-sm" title="Profile is Public">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      Public View
                    </button>
                    
                    <button onClick={() => removeResearch(index)} className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors shadow-sm" title="Delete Research">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Remove
                    </button>
                  </div>
                  
                  <div className="mb-4 mt-2">
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Paper Title</label>
                    <input type="text" value={research.paperTitle} onChange={(e) => updateResearch(index, 'paperTitle', e.target.value)} placeholder="Title of your research paper" className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Journal Name</label>
                      <EntitySearchInput 
                        category="journal"
                        placeholder="Search or add journal..."
                        valueId={research.journalId}
                        valueName={research.journalName}
                        onChange={(id, name) => {
                          updateResearch(index, 'journalId', id);
                          updateResearch(index, 'journalName', name);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Publication Year</label>
                      <input type="number" value={research.publicationYear} onChange={(e) => updateResearch(index, 'publicationYear', e.target.value)} placeholder="e.g. 2021" className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
                <AutosaveIndicator status={researchSaveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Memberships */}
        {activeTab === "memberships" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-xl font-bold text-slate-900">Memberships</h3>
              <button onClick={addMembership} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">+ Add Membership</button>
            </div>
            
            <div className="space-y-6">
              {membershipsData.map((membership, index) => (
                <div key={index} className="border border-slate-300 rounded-2xl p-6 relative bg-slate-100 shadow-inner hover:border-teal-400 hover:shadow-md transition-all duration-300">
                  <div className="absolute top-4 right-4 flex gap-3 items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                      <button onClick={() => moveMembership(index, 'up')} disabled={index === 0} className={`px-3 py-2 hover:bg-slate-200 transition-colors flex items-center gap-1 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-800'}`} title="Move Up">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg>
                      </button>
                      <div className="w-px bg-slate-300"></div>
                      <button onClick={() => moveMembership(index, 'down')} disabled={index === membershipsData.length - 1} className={`px-3 py-2 hover:bg-slate-200 transition-colors flex items-center gap-1 ${index === membershipsData.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-800'}`} title="Move Down">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                    </div>

                    <button className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors shadow-sm" title="Profile is Public">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      Public View
                    </button>
                    
                    <button onClick={() => removeMembership(index)} className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors shadow-sm" title="Delete Membership">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 mt-2">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Association / Organization</label>
                      <EntitySearchInput 
                        category="association"
                        placeholder="e.g. IMA, API..."
                        valueId={membership.associationId}
                        valueName={membership.associationName}
                        onChange={(id, name) => {
                          updateMembership(index, 'associationId', id);
                          updateMembership(index, 'associationName', name);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Role / Status</label>
                      <input type="text" value={membership.role} onChange={(e) => updateMembership(index, 'role', e.target.value)} placeholder="e.g. Life Member, Secretary" className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
                <AutosaveIndicator status={membershipsSaveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Networking & Invites */}
        {activeTab === "networking" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Networking & Invites</h3>
            
            <div className="space-y-8">
              {/* Pending Invites */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  Pending Roster Invites
                </h4>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl shadow-sm border border-amber-100">🏥</div>
                    <div>
                      <p className="font-bold text-slate-900">Apollo Super Specialty</p>
                      <p className="text-sm text-slate-600">Invited you to join their Cardiology Department</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Decline</button>
                    <button className="bg-tenant-accent hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">Accept Invite</button>
                  </div>
                </div>
              </div>

              {/* Active Connections */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Associated Hospitals
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between group hover:border-teal-400 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-lg">🏥</div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-tenant-accent transition-colors">LifeCare Clinic</p>
                        <p className="text-xs text-slate-500">Active Roster • Since Jan 2023</p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-red-500 transition-colors p-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Specialties & Services */}
        {activeTab === "specialties" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Specialties & Services</h3>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <AutosaveIndicator status={specialtiesSaveStatus} />
                  Add specific treatments and surgeries you perform.
                </p>
              </div>
              <button onClick={addSpecialty} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">+ Add Service</button>
            </div>
            
            <div className="space-y-4">
              {specialtiesData.map((spec) => (
                <div key={spec.id} className="flex flex-col md:flex-row md:items-center gap-4 bg-white/50 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-sm transition-all group hover:bg-white hover:shadow-md">
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <input 
                      type="text" 
                      value={spec.name}
                      onChange={(e) => updateSpecialty(spec.id, e.target.value)}
                      placeholder="e.g. Knee Replacement Surgery" 
                      className="w-full bg-transparent border-none focus:ring-0 outline-none font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal text-sm md:text-base" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 border-slate-200 pt-3 md:pt-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="primarySpecialty" 
                        checked={spec.isPrimary}
                        onChange={() => setPrimarySpecialty(spec.id)}
                        className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-slate-300" 
                      />
                      <span className={`text-xs font-bold uppercase tracking-widest ${spec.isPrimary ? 'text-cyan-700' : 'text-slate-400'}`}>
                        {spec.isPrimary ? 'Primary' : 'Make Primary'}
                      </span>
                    </label>
                    <button 
                      onClick={() => removeSpecialty(spec.id)} 
                      className="text-slate-400 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-50"
                      title="Remove Service"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {specialtiesData.length === 0 && (
                <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-sm text-slate-500 mb-4">No specialties or services added yet.</p>
                  <button onClick={addSpecialty} className="text-cyan-600 font-bold text-sm hover:underline">Add your first service</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Awards & Achievements */}
        {activeTab === "awards" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Awards & Achievements</h3>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <AutosaveIndicator status={awardsSaveStatus} />
                  Highlight your professional recognition.
                </p>
              </div>
              <button onClick={addAward} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">+ Add Award</button>
            </div>
            
            <div className="space-y-6">
              {awardsData.map((award, index) => (
                <div key={index} className="border border-white/50 rounded-[24px] p-8 relative bg-white/20 backdrop-blur-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300 group hover:bg-white/40">
                  <div className="absolute top-4 right-4 flex gap-3 items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                      <button onClick={() => moveAward(index, 'up')} disabled={index === 0} className={`px-3 py-2 hover:bg-slate-200 transition-colors flex items-center gap-1 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-800'}`} title="Move Up">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg>
                      </button>
                      <div className="w-px bg-slate-300"></div>
                      <button onClick={() => moveAward(index, 'down')} disabled={index === awardsData.length - 1} className={`px-3 py-2 hover:bg-slate-200 transition-colors flex items-center gap-1 ${index === awardsData.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-800'}`} title="Move Down">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                    </div>
                    <button onClick={() => removeAward(index)} className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors shadow-sm" title="Delete Award">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Award / Title Name</label>
                      <input 
                        type="text" 
                        value={award.awardName}
                        onChange={(e) => updateAward(index, 'awardName', e.target.value)}
                        placeholder="e.g. Best Surgeon Award" 
                        className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Year</label>
                      <input 
                        type="number" 
                        value={award.year}
                        onChange={(e) => updateAward(index, 'year', e.target.value)}
                        placeholder="e.g. 2024" 
                        className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all" 
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Awarding Organization</label>
                      <input 
                        type="text" 
                        value={award.awardingBody}
                        onChange={(e) => updateAward(index, 'awardingBody', e.target.value)}
                        placeholder="e.g. Medical Council of India" 
                        className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {awardsData.length === 0 && (
                <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-sm text-slate-500 mb-4">No awards added yet.</p>
                  <button onClick={addAward} className="text-cyan-600 font-bold text-sm hover:underline">Add your first award</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Premium Slug Modal */}
      <PremiumSlugModal 
        isOpen={isSlugModalOpen} 
        onClose={() => setIsSlugModalOpen(false)} 
        currentName="Dr. Sandeep Sharma"
        currentUglyUrl="dehapa.com/india/odisha/sambalpur/drsandeep.3gtyuibhyu4768"
      />
    </DashboardLayout>
    </>
  );
}

// Trigger HMR
