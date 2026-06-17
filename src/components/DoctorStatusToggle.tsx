"use client";

import React, { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, query, collection, where, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8",
  authDomain: "sd-auth-center.firebaseapp.com",
  projectId: "sd-auth-center",
  storageBucket: "sd-auth-center.firebasestorage.app",
  messagingSenderId: "393346058191",
  appId: "1:393346058191:web:a5e96e1c481a72f86db4ba"
};

export default function DoctorStatusToggle() {
  const [isOnline, setIsOnline] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [incomingPing, setIncomingPing] = useState<any | null>(null);

  useEffect(() => {
    // Check if user is doctor
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("sd_current_user_role");
      const uid = localStorage.getItem("sd_current_user_uid");
      
      setUserRole(role);
      setUserUid(uid);
    }
  }, []);

  useEffect(() => {
    if (userRole !== "doctor" || !userUid) return;

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app, "default");

    // 1. Listen to own status in Firestore to sync across tabs
    const statusRef = doc(db, "doctor_status", userUid);
    const unsubStatus = onSnapshot(statusRef, (docSnap) => {
      if (docSnap.exists()) {
        setIsOnline(docSnap.data().isOnline === true);
      }
    });

    // 2. Listen for incoming pings (consultation requests)
    const pingsRef = collection(db, "consultation_requests");
    const q = query(pingsRef, where("doctorId", "==", userUid), where("status", "==", "pending"));
    
    const unsubPings = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        // Just take the first pending request
        const req = snap.docs[0];
        setIncomingPing({ id: req.id, ...req.data() });
        
        // Play sound
        try {
          const audio = new Audio('/ping-sound.mp3'); // We'll assume this exists or fails gracefully
          audio.play();
        } catch(e) {}
      } else {
        setIncomingPing(null);
      }
    });

    return () => {
      unsubStatus();
      unsubPings();
    };
  }, [userRole, userUid]);

  const toggleStatus = async () => {
    if (!userUid) return;
    
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app, "default");
    const statusRef = doc(db, "doctor_status", userUid);
    
    const newStatus = !isOnline;
    setIsOnline(newStatus); // Optimistic update
    
    try {
      await setDoc(statusRef, { 
        isOnline: newStatus,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Failed to update status", err);
      setIsOnline(!newStatus); // Revert
    }
  };

  const acceptPing = async () => {
    if (!incomingPing || !userUid) return;
    
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app, "default");
    const reqRef = doc(db, "consultation_requests", incomingPing.id);
    
    try {
      await updateDoc(reqRef, {
        status: "accepted",
        acceptedAt: new Date().toISOString()
      });
      alert(`Connecting to patient: ${incomingPing.patientName}...`);
      setIncomingPing(null);
      // In Phase 4, we will route to the secure video room
    } catch (err) {
      console.error("Failed to accept ping", err);
    }
  };

  const declinePing = async () => {
    if (!incomingPing || !userUid) return;
    
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app, "default");
    const reqRef = doc(db, "consultation_requests", incomingPing.id);
    
    try {
      await updateDoc(reqRef, {
        status: "declined",
        declinedAt: new Date().toISOString()
      });
      setIncomingPing(null);
    } catch (err) {
      console.error("Failed to decline ping", err);
    }
  };

  if (userRole !== "doctor") return null;

  return (
    <>
      <div className="hidden sm:flex items-center gap-3 mr-4 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700 shadow-inner">
        <span className="text-xs font-bold text-slate-300">Status:</span>
        <button 
          onClick={toggleStatus}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isOnline ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'bg-slate-600'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-teal-400' : 'text-slate-500'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Global Incoming Ping Modal */}
      {incomingPing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 border-red-500 animate-in zoom-in duration-300 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>
            
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10">
              <svg className="w-10 h-10 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-2 relative z-10">Incoming Urgent Call!</h2>
            <p className="text-slate-500 font-medium mb-8 relative z-10">
              Patient: <span className="font-bold text-slate-900">{incomingPing.patientName || "Unknown"}</span><br/>
              Urgency: <span className="text-red-500 font-bold uppercase">High</span>
            </p>
            
            <div className="flex gap-4 relative z-10">
              <button 
                onClick={declinePing}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-colors"
              >
                Decline
              </button>
              <button 
                onClick={acceptPing}
                className="flex-[2] bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-[0_10px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_10px_25px_rgba(239,68,68,0.5)] hover:-translate-y-1 transition-all"
              >
                ACCEPT & CONNECT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
