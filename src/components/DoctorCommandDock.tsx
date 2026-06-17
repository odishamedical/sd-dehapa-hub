"use client";

import React, { useState, useEffect } from "react";
import { getApps, initializeApp, getApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, updateDoc, collection, query, where, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8",
  authDomain: "sd-auth-center.firebaseapp.com",
  projectId: "sd-auth-center",
  storageBucket: "sd-auth-center.firebasestorage.app",
  messagingSenderId: "393346058191",
  appId: "1:393346058191:web:a5e96e1c481a72f86db4ba"
};

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

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app, "default");

    // Listen to Online Status
    const statusRef = doc(db, "doctor_status", userUid);
    const unsubStatus = onSnapshot(statusRef, (docSnap) => {
      if (docSnap.exists()) setIsOnline(docSnap.data().isOnline === true);
    });

    // Listen to Pending Pings
    const pingsRef = collection(db, "consultation_requests");
    const q = query(pingsRef, where("doctorId", "==", userUid), where("status", "==", "pending"));
    const unsubPings = onSnapshot(q, (snap) => {
      setPendingPings(snap.docs.length);
    });

    return () => { unsubStatus(); unsubPings(); };
  }, [userRole, userUid]);

  const toggleStatus = async () => {
    if (!userUid) return;
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app, "default");
    const statusRef = doc(db, "doctor_status", userUid);
    
    const newStatus = !isOnline;
    setIsOnline(newStatus); // Optimistic update
    try {
      await setDoc(statusRef, { isOnline: newStatus, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.error("Failed to update status", err);
      setIsOnline(!newStatus); // Revert
    }
  };

  if (userRole !== "doctor" && userRole !== "super_admin") return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-white/70 backdrop-blur-3xl border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] rounded-full px-2 py-2 flex items-center gap-2">
        
        {/* Dashboard Quick Link */}
        <button 
          onClick={() => window.location.href = "/portal/doctor"}
          className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          title="Go to Dashboard"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
        </button>

        <div className="w-px h-6 bg-slate-200"></div>

        {/* The Toggle */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-full shadow-inner cursor-pointer" onClick={toggleStatus}>
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOnline ? "bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]" : "bg-slate-600"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOnline ? "translate-x-6" : "translate-x-1"}`} />
          </div>
          <span className={`text-[11px] font-black uppercase tracking-widest ${isOnline ? "text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" : "text-slate-400"}`}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        <div className="w-px h-6 bg-slate-200"></div>

        {/* Notifications */}
        <button 
          onClick={() => window.location.href = "/portal/doctor"}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative ${pendingPings > 0 ? "bg-red-50 text-red-500 hover:bg-red-100 animate-pulse" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          {pendingPings > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {pendingPings}
            </span>
          )}
        </button>

      </div>
    </div>
  );
}
