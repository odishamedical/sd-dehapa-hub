"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDocs, collection, query, where } from 'firebase/firestore';
import DigitalRxPad from '@/components/DigitalRxPad';

export default function DoctorOSDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("queue");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showAddWalkIn, setShowAddWalkIn] = useState(false);
  const [activeConsult, setActiveConsult] = useState<any>(null);

  // Mock Data for UI presentation
  const mockQueue = [
    { id: "Q1", name: "Rahul Sharma", age: 34, sex: "M", mode: "Walk-in", time: "10 mins ago", status: "Waiting", type: "offline", phone: "+91 9876543210" },
    { id: "Q2", name: "Priya Singh", age: 28, sex: "F", mode: "Video Call", time: "5 mins ago", status: "In Lobby", type: "online", phone: "" }
  ];

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
                <button 
                  onClick={() => setShowAddWalkIn(true)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Walk-in
                </button>
              </div>
            </div>

            {/* QUEUE CONTENT */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <div className="col-span-1">No.</div>
                <div className="col-span-3">Patient Name</div>
                <div className="col-span-2">Mode</div>
                <div className="col-span-2">Wait Time</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {mockQueue.map((patient, idx) => (
                  <div key={patient.id} className="p-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors">
                    <div className="hidden md:block col-span-1 text-slate-400 font-medium text-sm">#{idx + 1}</div>
                    
                    <div className="col-span-12 md:col-span-3 flex items-center w-full md:w-auto">
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm mr-3 shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{patient.name}</div>
                        <div className="text-xs text-slate-500">{patient.age}y • {patient.sex} {patient.phone && `• ${patient.phone}`}</div>
                      </div>
                    </div>
                    
                    <div className="col-span-12 md:col-span-2 w-full md:w-auto flex items-center gap-2">
                      <span className="md:hidden text-xs font-bold text-slate-400 uppercase">Mode:</span>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${patient.type === 'online' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                        {patient.mode}
                      </span>
                    </div>
                    
                    <div className="col-span-12 md:col-span-2 w-full md:w-auto flex items-center gap-2">
                      <span className="md:hidden text-xs font-bold text-slate-400 uppercase">Wait:</span>
                      <div className="text-sm text-amber-600 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {patient.time}
                      </div>
                    </div>
                    
                    <div className="col-span-12 md:col-span-2 w-full md:w-auto flex items-center gap-2">
                      <span className="md:hidden text-xs font-bold text-slate-400 uppercase">Status:</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${patient.status === 'In Lobby' ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`}></span>
                        <span className="text-sm text-slate-600 font-medium">{patient.status}</span>
                      </div>
                    </div>
                    
                    <div className="col-span-12 md:col-span-2 w-full flex justify-end gap-2">
                       <button onClick={() => setActiveConsult(patient)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                         Vitals
                       </button>
                       <button onClick={() => setActiveConsult(patient)} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
                         Consult
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "calendar" && (
           <div className="space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h1 className="text-2xl font-bold text-slate-900 font-display">Smart Calendar</h1>
                 <p className="text-slate-500 text-sm mt-1">Manage your clinic hours, surgery blocks, and appointments</p>
               </div>
               <div className="flex gap-2">
                 <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors">
                   Today
                 </button>
                 <button className="px-4 py-2 bg-teal-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                   Block Time
                 </button>
               </div>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
               {/* Mini Calendar Sidebar */}
               <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 p-6 bg-slate-50">
                 <div className="font-bold text-slate-900 mb-4">July 2026</div>
                 <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                   <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                 </div>
                 <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
                   {Array.from({length: 31}).map((_, i) => (
                     <div key={i} className={`p-1.5 rounded-lg cursor-pointer ${i+1 === 2 ? 'bg-teal-600 text-white font-bold shadow-sm shadow-teal-200' : 'text-slate-700 hover:bg-slate-200'}`}>
                       {i + 1}
                     </div>
                   ))}
                 </div>
               </div>

               {/* Day View */}
               <div className="flex-1 p-6">
                 <div className="text-lg font-bold text-slate-900 mb-6">Thursday, July 2, 2026</div>
                 <div className="space-y-4 relative">
                    <div className="absolute left-16 top-0 bottom-0 w-px bg-slate-100"></div>
                    
                    {/* Time block 1 */}
                    <div className="flex gap-4 items-start relative z-10">
                      <div className="w-16 text-right text-xs font-bold text-slate-400 pt-3">09:00 AM</div>
                      <div className="flex-1 bg-teal-50 border border-teal-100 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-teal-900 text-sm">Morning Walk-in Clinic</h4>
                          <span className="bg-teal-200 text-teal-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">General</span>
                        </div>
                        <p className="text-xs text-teal-700">09:00 AM - 01:00 PM</p>
                      </div>
                    </div>

                    {/* Time block 2 */}
                    <div className="flex gap-4 items-start relative z-10">
                      <div className="w-16 text-right text-xs font-bold text-slate-400 pt-3">01:00 PM</div>
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 border-dashed">
                        <div className="font-bold text-slate-500 text-sm">Lunch & Rest</div>
                        <p className="text-xs text-slate-400">01:00 PM - 02:30 PM</p>
                      </div>
                    </div>

                    {/* Time block 3 */}
                    <div className="flex gap-4 items-start relative z-10">
                      <div className="w-16 text-right text-xs font-bold text-slate-400 pt-3">03:00 PM</div>
                      <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-indigo-900 text-sm">Scheduled Telemedicine</h4>
                          <span className="bg-indigo-200 text-indigo-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">Online</span>
                        </div>
                        <p className="text-xs text-indigo-700">03:00 PM - 05:00 PM</p>
                        <div className="mt-3 flex -space-x-2">
                           <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                           <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                           <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">+4</div>
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
             </div>
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

      {/* Add Walk-in Modal */}
      {showAddWalkIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Add Walk-in Patient</h3>
              <button onClick={() => setShowAddWalkIn(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone Number (Mapping ID)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-medium">+91</span>
                  <input type="tel" className="w-full bg-white border border-slate-200 rounded-r-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="Enter patient mobile" />
                </div>
                <p className="text-xs text-slate-400 mt-2">If number is registered with Dehapa, profile will auto-sync.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="Patient Name" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Age</label>
                     <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="e.g. 34" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Sex</label>
                     <select className="w-full bg-white border border-slate-200 rounded-xl px-2 py-3 text-slate-900 focus:border-teal-500 outline-none">
                       <option>M</option>
                       <option>F</option>
                       <option>O</option>
                     </select>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowAddWalkIn(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => setShowAddWalkIn(false)} className="px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-sm shadow-teal-200 hover:bg-teal-700 transition-colors">Add to Queue</button>
            </div>
          </div>
        </div>
      )}
      {/* Digital Rx Pad Overlay */}
      {activeConsult && (
        <DigitalRxPad patient={activeConsult} onClose={() => setActiveConsult(null)} />
      )}
    </DashboardLayout>
  );
}
