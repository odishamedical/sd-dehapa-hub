"use client";

import React, { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Use the shared instance to avoid init issues

export default function DoctorCommandDock() {
  const [isOnline, setIsOnline] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [pendingPings, setPendingPings] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("sd_current_user_role"));
      setUserUid(localStorage.getItem("sd_current_user_uid"));
    }
  }, []);

  useEffect(() => {
    if ((userRole !== "doctor" && userRole !== "super_admin") || !userUid) return;

    // Listen to Online Status
    const statusRef = doc(db, "doctor_status", userUid);
    const unsubStatus = onSnapshot(statusRef, (docSnap) => {
      if (docSnap.exists()) setIsOnline(docSnap.data().isOnline === true);
    }, (err) => console.error("Error listening to doctor status:", err));

    // Listen to Pending Pings
    const pingsRef = collection(db, "consultation_requests");
    const q = query(pingsRef, where("doctorId", "==", userUid), where("status", "==", "pending"));
    const unsubPings = onSnapshot(q, (snap) => {
      setPendingPings(snap.docs.length);
    }, (err) => console.error("Error listening to pings:", err));

    return () => { unsubStatus(); unsubPings(); };
  }, [userRole, userUid]);

  const toggleStatus = async () => {
    if (!userUid) {
      alert("Doctor identity not found. Please log in again.");
      return;
    }
    const statusRef = doc(db, "doctor_status", userUid);
    const newStatus = !isOnline;
    
    // Optimistic update
    setIsOnline(newStatus);
    
    try {
      await setDoc(statusRef, { 
        isOnline: newStatus, 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Could not update online status. Check your connection.");
      setIsOnline(!newStatus); // Revert
    }
  };

  if (userRole !== "doctor" && userRole !== "super_admin") return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 md:top-auto md:translate-x-0 md:bottom-10 md:left-6 animate-in slide-in-from-top-4 md:slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-slate-900/90 backdrop-blur-3xl border border-teal-500/30 shadow-[0_10px_30px_rgba(20,184,166,0.25)] hover:shadow-[0_15px_40px_rgba(20,184,166,0.4)] hover:border-teal-400/60 transition-all duration-300 rounded-full px-6 py-3 md:px-2.5 md:py-4 flex flex-row md:flex-col items-center gap-6 md:gap-4">
        
        {/* Dashboard Quick Link */}
        <button 
          onClick={() => window.location.href = "/portal/doctor"}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          title="Go to Dashboard"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
        </button>

        {/* Round Online Toggle */}
        <button 
          onClick={toggleStatus}
          className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all border ${
            isOnline 
              ? "bg-green-500 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-[pulse_2s_ease-in-out_infinite]" 
              : "bg-slate-500 border-slate-400 hover:bg-slate-400 opacity-70"
          }`}
          title={isOnline ? "Go Offline" : "Go Online"}
        >
          {isOnline && (
            <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping opacity-40"></div>
          )}
          <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full"></div>
        </button>

        {/* Notifications */}
        <button 
          onClick={() => window.location.href = "/portal/doctor"}
          className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all border relative ${
            pendingPings > 0 
              ? "bg-red-500 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" 
              : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          {pendingPings > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-red-500 shadow-sm">
              {pendingPings}
            </span>
          )}
        </button>

      </div>
    </div>
  );
}
