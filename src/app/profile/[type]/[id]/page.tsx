"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock DB Fetch
const getMockProfile = (type: string, id: string) => {
  if (type === 'doctor') {
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
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-slate-900"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-end mt-12">
            <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-lg border border-slate-100 shrink-0">
              <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-4xl">
                {params.type === 'doctor' && '👨‍⚕️'}
                {params.type === 'hospital' && '🏥'}
                {params.type !== 'doctor' && params.type !== 'hospital' && '⚕️'}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-serif font-bold text-slate-900">{profile.name}</h1>
                {profile.verified && (
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
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
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">About</h3>
              <p className="text-slate-600 leading-relaxed">{profile.about}</p>
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
