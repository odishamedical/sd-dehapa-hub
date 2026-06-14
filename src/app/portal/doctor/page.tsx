"use client";

import React, { useState } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import PremiumSlugModal from '@/components/PremiumSlugModal';
import EntitySearchInput from '@/components/EntitySearchInput';
import { useAutosave } from '@/hooks/useAutosave';
import AutosaveIndicator from '@/components/AutosaveIndicator';
import AddressBlock, { AddressData } from '@/components/AddressBlock';

function DoctorHomeWidget({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Profile Strength</h3>
          <p className="text-sm text-slate-500 mt-1">Complete your profile to unlock the "Verified DehaPa Doctor" badge.</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-teal-600">35%</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-teal-400 to-teal-600 h-full rounded-full w-[35%]"></div>
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
                Add Medical Registration No.
              </span>
              <button onClick={() => onNavigate('identity')} className="text-xs font-bold text-amber-700 bg-amber-100/50 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">Complete</button>
            </li>
            <li className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl hover:border-slate-200 transition-colors">
              <span className="text-sm text-slate-700 font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                Add Practice Locations
              </span>
              <button onClick={() => onNavigate('locations')} className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Complete</button>
            </li>
            <li className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl hover:border-slate-200 transition-colors">
              <span className="text-sm text-slate-700 font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                Upload Profile Photo
              </span>
              <button onClick={() => onNavigate('identity')} className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Complete</button>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Completed
          </h4>
          <ul className="space-y-3">
            <li className="flex items-center justify-between opacity-50 p-3 border border-transparent">
              <span className="text-sm text-slate-500 font-medium flex items-center gap-2 line-through">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                Basic Identity Added
              </span>
            </li>
            <li className="flex items-center justify-between opacity-50 p-3 border border-transparent">
              <span className="text-sm text-slate-500 font-medium flex items-center gap-2 line-through">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                Qualifications Saved
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [isSlugModalOpen, setIsSlugModalOpen] = useState(false);

  // Autosave State for Qualifications Tab
  const [qualificationsData, setQualificationsData] = useState({
    degreeName: "MBBS",
    passingYear: "2010",
    collegeId: "",
    collegeName: "SCB Medical College"
  });
  const qualificationsSaveStatus = useAutosave(qualificationsData, 1000);

  // Identity State
  const [identityData, setIdentityData] = useState({
    specialityId: "",
    specialityName: ""
  });
  const identitySaveStatus = useAutosave(identityData, 1000);

  // Practice Location State
  const [locationAddress, setLocationAddress] = useState<AddressData>({
    country: "India",
    state: "Odisha",
    district: "Khordha",
    block: "",
    city: "Bhubaneswar",
    pincode: "751001",
    localAddress: "Unit 15, Near Sainik School"
  });
  const locationSaveStatus = useAutosave(locationAddress, 1000);

  // Experience State
  const [experienceData, setExperienceData] = useState({
    hospitalId: "",
    hospitalName: "Apollo Hospitals",
    position: "Head of Cardiology",
    duration: "2015-2020"
  });
  const experienceSaveStatus = useAutosave(experienceData, 1000);

  // Research State
  const [researchData, setResearchData] = useState({
    paperTitle: "",
    journalId: "",
    journalName: "",
    publicationYear: ""
  });
  const researchSaveStatus = useAutosave(researchData, 1000);

  // Memberships State
  const [membershipsData, setMembershipsData] = useState({
    associationId: "",
    associationName: "",
    role: ""
  });
  const membershipsSaveStatus = useAutosave(membershipsData, 1000);

  // Awards State
  const [awardsData, setAwardsData] = useState({
    awardName: "",
    awardingBody: "",
    year: ""
  });
  const awardsSaveStatus = useAutosave(awardsData, 1000);

  // Bookings State
  const [bookingsData, setBookingsData] = useState({
    appointmentType: "Video Consultation",
    duration: "15 Mins",
    noticePeriod: "1 Hour"
  });
  const bookingsSaveStatus = useAutosave(bookingsData, 1000);

  const doctorTabs: DashboardTab[] = [
    {
      id: "identity",
      label: "Identity & Bio",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
    },
    {
      id: "qualifications",
      label: "Qualifications",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
    },
    {
      id: "experience",
      label: "Experience & Positions",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
    },
    {
      id: "locations",
      label: "Practice Locations",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    },
    {
      id: "research",
      label: "Research & Publications",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
    },
    {
      id: "memberships",
      label: "Memberships",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    {
      id: "awards",
      label: "Awards & Achievements",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
    },
    {
      id: "techniques",
      label: "Special Techniques",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
    },
    {
      id: "hobbies",
      label: "Hobbies & Interests",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    }
  ];

  return (
    <DashboardLayout 
      roleName="Doctor Dashboard" 
      tabs={doctorTabs} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      userProfile={{
        name: "Dr. Sandeep Sharma",
        subtitle: "MBBS, MD - Cardiology",
        image: "https://i.pravatar.cc/150?u=a042581f4e29026704d" // Mock image
      }}
      homeWidget={<DoctorHomeWidget onNavigate={setActiveTab} />}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Alert */}
        <div className="bg-sky-50 border border-sky-200 text-sky-800 rounded-xl p-4 mb-8 flex items-start gap-3">
          <svg className="w-5 h-5 text-sky-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h4 className="font-bold text-sm">Welcome to your Portal</h4>
            <p className="text-xs mt-1">The information you fill out here instantly maps to your public profile. Ensure it is accurate to maintain your "Verified" badge.</p>
          </div>
        </div>

        {/* Tab 1: Identity & Hero */}
        {activeTab === "identity" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            
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
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors">Upload Photo</button>
                  <p className="text-xs text-slate-500">Square image. Recommended size 400x400px.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Full Name</label>
                  <input type="text" placeholder="e.g. Dr. Sandeep Sharma" className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-4 py-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-slate-900 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" />
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
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Degrees</label>
                  <input type="text" placeholder="e.g. MBBS, MD (Medicine)" className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-4 py-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-slate-900 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">Medical Registration No.</label>
                  <input type="text" placeholder="e.g. MCI-12345" className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-4 py-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-slate-900 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all">Save Identity Info</button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Qualifications */}
        {activeTab === "qualifications" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Qualifications</h3>
                <p className="text-sm text-slate-500 mt-1">Add your degrees and link them to medical colleges.</p>
              </div>
              <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">+ Add Qualification</button>
            </div>
            
            <div className="space-y-6">
              <div className="border border-slate-300 rounded-2xl p-6 relative bg-slate-100 shadow-inner hover:border-teal-400 hover:shadow-md transition-all duration-300">
                <div className="absolute top-4 right-4 flex gap-3 items-center">
                  <button className="text-slate-400 hover:text-teal-600 flex items-center gap-1 text-xs font-bold transition-colors" title="Toggle Public Visibility">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Public
                  </button>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <button className="text-slate-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest tracking-wider mb-1.5">Degree Name</label>
                    <input 
                      type="text" 
                      value={qualificationsData.degreeName}
                      onChange={(e) => setQualificationsData(prev => ({...prev, degreeName: e.target.value}))}
                      placeholder="e.g. MBBS, MD" 
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest tracking-wider mb-1.5">Passing Year</label>
                    <input 
                      type="number" 
                      value={qualificationsData.passingYear}
                      onChange={(e) => setQualificationsData(prev => ({...prev, passingYear: e.target.value}))}
                      placeholder="e.g. 2010" 
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest tracking-wider mb-1.5">Medical College / University</label>
                  <EntitySearchInput 
                    category="college"
                    placeholder="Search or add college name..."
                    valueId={qualificationsData.collegeId}
                    valueName={qualificationsData.collegeName}
                    onChange={(id, name) => setQualificationsData(prev => ({...prev, collegeId: id, collegeName: name}))}
                  />
                  <p className="text-xs text-slate-500 mt-2">Type to search the DehaPa network. If it doesn't exist, you can add it as a new entry.</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 h-12">
                <AutosaveIndicator status={qualificationsSaveStatus} />
                {/* Save button becomes optional but kept for reassurance */}
                <button 
                  className={`px-6 py-2.5 font-bold rounded-xl shadow-sm transition-all text-sm ${
                    qualificationsSaveStatus === 'saving' 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
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
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Experience & Positions</h3>
                <p className="text-sm text-slate-500 mt-1">List your past and current professional roles and hospital affiliations.</p>
              </div>
              <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">+ Add Experience</button>
            </div>
            
            <div className="space-y-6">
              <div className="border border-slate-300 rounded-2xl p-6 relative bg-slate-100 shadow-inner hover:border-teal-400 hover:shadow-md transition-all duration-300">
                <div className="absolute top-4 right-4 flex gap-3 items-center">
                  <button className="text-slate-400 hover:text-teal-600 flex items-center gap-1 text-xs font-bold transition-colors" title="Toggle Public Visibility">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Public
                  </button>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <button className="text-slate-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
                
                <div className="mb-4 mt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest tracking-wider mb-1.5">Hospital or Institution</label>
                  <EntitySearchInput 
                    category="hospital"
                    placeholder="Search or add hospital name..."
                    valueId={experienceData.hospitalId}
                    valueName={experienceData.hospitalName}
                    onChange={(id, name) => setExperienceData(prev => ({...prev, hospitalId: id, hospitalName: name}))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest tracking-wider mb-1.5">Title / Position</label>
                    <input type="text" value={experienceData.position} onChange={(e) => setExperienceData(prev => ({...prev, position: e.target.value}))} placeholder="e.g. HOD, Senior Consultant" className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest tracking-wider mb-1.5">Years (e.g. 2015-2020)</label>
                    <input type="text" defaultValue="2018 - Present" placeholder="e.g. 2015 - Present" className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <AutosaveIndicator status={experienceSaveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Practice Locations */}
        {activeTab === "locations" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Practice Locations</h3>
                <p className="text-sm text-slate-500 mt-1">Manage the clinics and hospitals where you currently practice.</p>
              </div>
              <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">+ Add Clinic</button>
            </div>
            
            <div className="space-y-6">
              <div className="border border-slate-300 rounded-2xl p-6 relative bg-slate-100 shadow-inner hover:border-teal-400 hover:shadow-md transition-all duration-300">
                <div className="absolute top-4 right-4 flex gap-3 items-center">
                  <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Mandatory Public</span>
                </div>
                
                <div className="mb-4 mt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest tracking-wider mb-1.5">Clinic or Hospital Name</label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest tracking-wider mb-1.5">Timings</label>
                    <input type="text" defaultValue="Mon-Sat, 10 AM - 2 PM" className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest tracking-wider mb-1.5">Consultation Fee (₹)</label>
                    <input type="number" defaultValue="800" className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all" />
                  </div>
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
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-xl font-bold text-slate-900">Research & Publications</h3>
              <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">+ Add Publication</button>
            </div>
            
            <div className="space-y-6">
              <div className="border border-slate-300 rounded-2xl p-6 relative bg-slate-100 shadow-inner hover:border-teal-400 hover:shadow-md transition-all duration-300">
                <div className="absolute top-4 right-4 flex gap-3 items-center">
                  <button className="text-slate-400 hover:text-teal-600 flex items-center gap-1 text-xs font-bold transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> Public</button>
                </div>
                
                <div className="mb-4 mt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest tracking-wider mb-1.5">Paper Title</label>
                  <input type="text" value={researchData.paperTitle} onChange={(e) => setResearchData(prev => ({...prev, paperTitle: e.target.value}))} placeholder="Title of your research paper" className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest tracking-wider mb-1.5">Journal Name</label>
                    <EntitySearchInput 
                      category="journal"
                      placeholder="Search or add journal..."
                      valueId={researchData.journalId}
                      valueName={researchData.journalName}
                      onChange={(id, name) => setResearchData(prev => ({...prev, journalId: id, journalName: name}))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest tracking-wider mb-1.5">Publication Year</label>
                    <input type="number" value={researchData.publicationYear} onChange={(e) => setResearchData(prev => ({...prev, publicationYear: e.target.value}))} placeholder="e.g. 2021" className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all" />
                  </div>
                </div>
                </div>
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
              <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">+ Add Membership</button>
            </div>
            
            <div className="space-y-6">
              <div className="border border-slate-300 rounded-2xl p-6 relative bg-slate-100 shadow-inner hover:border-teal-400 hover:shadow-md transition-all duration-300">
                <div className="absolute top-4 right-4 flex gap-3 items-center">
                  <button className="text-slate-400 hover:text-teal-600 flex items-center gap-1 text-xs font-bold transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> Public</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest tracking-wider mb-1.5">Association / Organization</label>
                    <EntitySearchInput 
                      category="association"
                      placeholder="e.g. IMA, API..."
                      valueId={membershipsData.associationId}
                      valueName={membershipsData.associationName}
                      onChange={(id, name) => setMembershipsData(prev => ({...prev, associationId: id, associationName: name}))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest tracking-wider mb-1.5">Role / Status</label>
                    <input type="text" value={membershipsData.role} onChange={(e) => setMembershipsData(prev => ({...prev, role: e.target.value}))} placeholder="e.g. Life Member, Secretary" className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all" />
                  </div>
                </div>
                </div>
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
                <AutosaveIndicator status={membershipsSaveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* Catch-all for remaining tabs */}
        {["awards", "techniques", "hobbies"].includes(activeTab) && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="font-bold text-slate-900 mb-1 capitalize">{activeTab} Modulue Skeleton</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">This section uses the exact same UI structure as the other tabs. You can easily duplicate the array field components here.</p>
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
  );
}
