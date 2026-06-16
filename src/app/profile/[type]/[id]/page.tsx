"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock DB Fetch
const getMockProfile = (type: string, id: string) => {
  if (type === 'doctor') {
    if (id === 'dr-deepak-kumar-mishra') {
      return {
        name: "Dr. Deepak Kumar Mishra",
        subtitle: "Senior Consultant Surgical Oncology",
        image: "/images/drdeepak.jpg",
        verified: false,
        stats: { patients: "1k+", experience: "5+ Yrs", rating: "4.9" },
        about: "Dr. Deepak Kumar Mishra is a leading Surgical Oncologist based in Bhubaneswar, Odisha.",
        details: [
          { label: "Education", value: "MBBS, MS, MCh (Surgical Oncology)" },
          { label: "Registration", value: "Medical Council of India" },
          { label: "Languages", value: "English, Hindi, Odia" }
        ],
        roster: ["Apollo Hospital, Bhubaneswar", "Sparsh Hospital, Bhubaneswar"]
      };
    }
    if (id === 'dr-satyabrata-das') {
      return {
        name: "Dr. Satyabrata Das",
        subtitle: "Surgical Oncologist and General Surgeon",
        image: "/images/drsatybrata.PNG",
        verified: false,
        stats: { patients: "10k+", experience: "18+ Yrs", rating: "4.8" },
        about: "Dr. Satyabrata Das is a highly experienced Surgical Oncologist and General Surgeon based in Bhubaneswar, Odisha, with over 18 years of clinical experience. He is recognized for his expertise in complex laparoscopic and open cancer surgeries, particularly in head and neck, breast, gastrointestinal, and gynecological cancers.",
        details: [
          { label: "Education", value: "MBBS, MS (General Surgery), MCh (Surgical Oncology)" },
          { label: "Specialty", value: "Oncoplastic, Thoracic, Hepatobiliary" },
          { label: "Languages", value: "English, Hindi, Odia" }
        ],
        roster: ["Utkal Hospital, Bhubaneswar"]
      };
    }
    if (id === 'dr-sunil-sharma') {
      return {
        name: "Dr. Sunil Kumar Sharma",
        subtitle: "Professor & Senior Consultant Cardiologist",
        image: "/images/drsunilsharma.PNG",
        verified: false,
        stats: { patients: "50k+", experience: "25+ Yrs", rating: "4.9" },
        about: "Dr. Sunil Kumar Sharma is widely regarded as one of the most prominent, trusted, and experienced cardiology experts in Western Odisha. He holds advanced academic and super-specialty medical designations, practicing concurrently in both public healthcare and private consultation.",
        details: [
          { label: "Education", value: "MBBS, MD (General Medicine), DM (Cardiology)" },
          { label: "Specialty", value: "Invasive Cardiology" },
          { label: "Languages", value: "English, Hindi, Odia" }
        ],
        roster: ["VIMSAR, Burla", "Sambalpur Heart Clinic"]
      };
    }
    if (id === 'dr-bansidhar-mulia') {
      return {
        name: "Dr. Bansidhar Mulia",
        subtitle: "Plastic, Cosmetic, and Reconstructive Surgeon",
        image: "/images/Dr banshidhara.PNG",
        verified: false,
        stats: { patients: "15k+", experience: "24+ Yrs", rating: "4.8" },
        about: "Dr. Bansidhar Mulia is a highly experienced Plastic, Cosmetic, and Reconstructive Surgeon based in Bhubaneswar, Odisha. With over 24 years of overall medical experience, he is currently associated with the Kalinga Institute of Medical Sciences (KIMS) and Pradyumna Bal Memorial Hospital.",
        details: [
          { label: "Education", value: "MBBS, MS, MCh (Plastic Surgery)" },
          { label: "Specialty", value: "Aesthetic Surgery, Trauma & Microsurgery" },
          { label: "Languages", value: "English, Hindi, Odia" }
        ],
        roster: ["Pradyumna Bal Memorial Hospital", "KIMS, Bhubaneswar"]
      };
    }

    return {
      name: "Dr. A. K. Sharma",
      subtitle: "Senior Cardiologist",
      image: "",
      verified: true,
      stats: { patients: "5k+", experience: "15 Yrs", rating: "4.8" },
      about: "Dr. Sharma is a leading interventional cardiologist specializing in angioplasty and heart failure management.",
      details: [
        { label: "Education", value: "MBBS, MD, DM (Cardiology)" },
        { label: "Registration", value: "MCI-12345" },
        { label: "Languages", value: "English, Hindi, Odia" }
      ],
      roster: ["Apollo Super Specialty, Bhubaneswar", "LifeCare Clinic, Sambalpur"]
    };
  }
  
  if (type === 'hospital') {
    return {
      name: "Apollo Super Specialty",
      subtitle: "NABH Accredited Hospital",
      image: "",
      verified: true,
      stats: { beds: "250", icu: "50", emergency: "24/7" },
      about: "A premier multi-specialty healthcare facility providing world-class medical services.",
      details: [
        { label: "Established", value: "2010" },
        { label: "License No", value: "HOSP/2010/89" },
        { label: "Insurance Accepted", value: "Star Health, HDFC Ergo, BSKY" }
      ],
      roster: ["Cardiology", "Neurology", "Orthopedics", "Emergency Medicine"]
    };
  }

  // Generic fallback
  return {
    name: "Medical Facility",
    subtitle: "Healthcare Provider",
    image: "",
    verified: false,
    stats: { rating: "4.5", status: "Active" },
    about: "A registered healthcare provider on the Dehapa Health Hub network.",
    details: [],
    roster: []
  };
};

export default function PublicProfile({ params }: { params: { type: string, id: string } }) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setProfile(getMockProfile(params.type, params.id));
    }, 500);
    return () => clearTimeout(timer);
  }, [params.type, params.id]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-tenant-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-tenant-accent/30 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/search" className="flex items-center gap-2 text-slate-600 hover:text-tenant-accent transition-colors font-bold text-sm">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
             Back to Search
          </Link>

          <Link href="/" className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-tenant-accent flex items-center justify-center text-white font-bold shadow-sm">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             </div>
             <span className="font-serif font-bold tracking-widest uppercase text-sm">Dehapa <span className="text-tenant-accent">Hub</span></span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 mt-4">
        
        {/* Identity Card */}
        <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.05)] rounded-3xl p-8 border border-slate-300 mb-8 relative overflow-hidden">
          {/* Metallic Shine Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 hover:translate-x-full duration-1000 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>
          
          <div className="absolute top-0 left-0 w-full h-32 bg-slate-900 border-b border-slate-700"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-end mt-12">
            <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-xl border border-slate-200 shrink-0 relative overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center text-5xl shadow-inner overflow-hidden">
                {profile.image ? (
                  <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <>
                    {params.type === 'doctor' && '👨‍⚕️'}
                    {params.type === 'hospital' && '🏥'}
                    {params.type !== 'doctor' && params.type !== 'hospital' && '⚕️'}
                  </>
                )}
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between w-full flex-wrap gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-serif font-bold text-slate-900">{profile.name}</h1>
                  {profile.verified && (
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 px-3 py-1.5 rounded-full shadow-sm">
                      <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">Dehapa Verified</span>
                    </div>
                  )}
                </div>
                
                {/* The Unverified Workflow */}
                {!profile.verified && (
                  <Link href="/login" className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 px-4 py-2 rounded-xl transition-all shadow-sm font-bold animate-pulse group">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    Verify your page
                  </Link>
                )}
              </div>
              <p className="text-lg font-medium text-tenant-accent mb-6">{profile.subtitle}</p>
              
              <div className="flex flex-wrap gap-4">
                {Object.entries(profile.stats).map(([key, val]) => (
                  <div key={key} className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">{key}</p>
                    <p className="font-bold text-slate-900">{val as string}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                About
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">{profile.about}</p>
            </section>

            {profile.roster.length > 0 && (
              <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
                  {params.type === 'doctor' ? 'Associated Hospitals' : 'Available Departments / Doctors'}
                </h3>
                <ul className="space-y-3">
                  {profile.roster.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-tenant-accent"></div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-slate-900 rounded-2xl p-6 shadow-md text-center">
              <h3 className="text-white font-bold mb-4">Connect</h3>
              {params.type === 'doctor' && (
                <button className="w-full bg-tenant-accent hover:bg-teal-400 text-slate-900 font-bold py-3 rounded-xl transition-colors mb-3">
                  Book Appointment
                </button>
              )}
              {params.type === 'hospital' && (
                <button className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-xl transition-colors mb-3">
                  Send Emergency Alert
                </button>
              )}
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors border border-slate-700">
                Share Profile
              </button>
            </div>

            {/* Details List */}
            {profile.details.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">Information</h3>
                <div className="space-y-4">
                  {profile.details.map((item: any, i: number) => (
                    <div key={i}>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="font-medium text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
