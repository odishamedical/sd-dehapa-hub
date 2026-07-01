"use client";

import React, { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DoctorStatusToggle() {
  const [isOnline, setIsOnline] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

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

    // 1. Listen to own status in Firestore to sync across tabs
    const statusRef = doc(db, "doctor_status", userUid);
    const unsubStatus = onSnapshot(statusRef, (docSnap) => {
      if (docSnap.exists()) {
        setIsOnline(docSnap.data().isOnline === true);
      }
    });

    return () => {
      unsubStatus();
    };
  }, [userRole, userUid]);

  const toggleStatus = async () => {
    if (!userUid) return;
    
    // Unlock and share a resumed AudioContext for incoming ringtones
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
        (window as any).sd_shared_audio_ctx = audioCtx;
        
        // Play a short pleasant confirmation beep (increased volume for mobile speakers)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      }
    } catch (e) {
      console.warn("Audio context unlock error:", e);
    }

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
      alert("Failed to update online status. Please check your connection.");
      setIsOnline(!newStatus); // Revert
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

    </>
  );
}
