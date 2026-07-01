"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDocs, collection, query, where } from 'firebase/firestore';

export default function DoctorOSDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("queue");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      const role = localStorage.getItem("sd_current_user_role");
      
      if (!email || (role !== "doctor" && role !== "super_admin")) {
        window.location.href = "/login";
        return;
      }
      setUserEmail(email);
      setUserName(name || email.split("@")[0]);
      
      const hash = window.location.hash.replace("#", "");
      if (hash) setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    window.history.pushState(null, "", `#${id}`);
  };

  const doctorTabs: DashboardTab[] = [
    {
      id: "queue",
      label: "Live Queue",
      section: "Workspace",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    {
      id: "calendar",
      label: "Smart Calendar",
      section: "Workspace",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    },
    {
      id: "patients",
      label: "Patient EMR",
      section: "Practice Management",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    },
    {
      id: "register",
      label: "Digital Register",
      section: "Practice Management",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
    },
    {
      id: "settings",
      label: "Clinic Profile",
      section: "Configuration",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    }
  ];

  if (!isMounted) return null;

  return (
    <DashboardLayout 
      roleName="Doctor OS" 
      tabs={doctorTabs} 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      userProfile={{
        name: userName || "Dr. Name",
        email: userEmail || "",
        avatar: "",
        isVerified: true
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-8">
        
        {/* TAB ROUTING */}
        
        {activeTab === "queue" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 font-display">Live Queue</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your walk-ins and virtual consultations</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-slate-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  Scan QR
                </button>
                <button className="px-4 py-2 bg-teal-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Walk-in
                </button>
              </div>
            </div>

            {/* QUEUE CONTENT GOES HERE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
              <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Queue is empty</h3>
              <p className="text-sm">No patients are currently waiting in the clinic or virtual lobby.</p>
            </div>
          </div>
        )}

        {activeTab === "calendar" && (
           <div className="space-y-6">
             <h1 className="text-2xl font-bold text-slate-900 font-display">Smart Calendar</h1>
             <p className="text-slate-500 text-sm mt-1">Coming soon...</p>
           </div>
        )}

        {activeTab === "patients" && (
           <div className="space-y-6">
             <h1 className="text-2xl font-bold text-slate-900 font-display">Patient EMR</h1>
             <p className="text-slate-500 text-sm mt-1">Coming soon...</p>
           </div>
        )}
        
        {activeTab === "register" && (
           <div className="space-y-6">
             <h1 className="text-2xl font-bold text-slate-900 font-display">Digital Clinic Register</h1>
             <p className="text-slate-500 text-sm mt-1">Coming soon...</p>
           </div>
        )}

        {activeTab === "settings" && (
           <div className="space-y-6">
             <h1 className="text-2xl font-bold text-slate-900 font-display">Clinic Profile & Settings</h1>
             <p className="text-slate-500 text-sm mt-1">Link to setup components here...</p>
           </div>
        )}

      </div>
    </DashboardLayout>
  );
}
