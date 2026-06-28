"use client";

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

interface VideoRoomProps {
  roomId: string; // This is the appointmentId
}

export default function VideoRoom({ roomId }: VideoRoomProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [videoCall, setVideoCall] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('sd_current_user_role') || 'patient';
      setUserRole(role);

      // Listen to the appointment status
      const docRef = doc(db, "appointments", roomId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (role === 'doctor' || role === 'super_admin') {
            // Doctors can join immediately
            setIsWaiting(false);
            if (data.status === 'Active') {
              setVideoCall(true);
            }
          } else {
            // Patients wait until status is 'Active' (Doctor joined)
            if (data.status === 'Active') {
               setIsWaiting(false);
               setVideoCall(true);
            }
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [roomId]);

  const handleDoctorJoin = async () => {
    try {
      const docRef = doc(db, "appointments", roomId);
      await updateDoc(docRef, { status: 'Active' });
      setIsWaiting(false);
      setVideoCall(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndCall = async () => {
    setVideoCall(false);
    if (userRole === 'doctor' || userRole === 'super_admin') {
      await updateDoc(doc(db, "appointments", roomId), { status: 'Completed' });
    }
    window.location.href = "/portal";
  };

  const isDoctor = userRole === 'doctor' || userRole === 'super_admin';

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
       </div>
     );
  }

  if (isWaiting) {
    if (isDoctor) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-center px-4">
          <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 max-w-md w-full">
             <div className="w-20 h-20 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
             </div>
             <h2 className="text-2xl font-bold mb-4 text-white">Start Consultation</h2>
             <p className="text-slate-400 mb-8">You are about to start the video session. The patient will be notified to join the room.</p>
             <button onClick={handleDoctorJoin} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:opacity-90 transition-opacity">
               Admit Patient & Join Call
             </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-center px-4">
           <div className="relative mb-8">
             <div className="w-24 h-24 border-4 border-slate-700 border-t-teal-500 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-12 h-12 bg-teal-500 rounded-full animate-ping opacity-75"></div>
             </div>
           </div>
           <h2 className="text-3xl font-bold text-white mb-4">Waiting Room</h2>
           <p className="text-slate-400 text-lg max-w-sm">Please wait while the doctor reviews your file. The video call will start automatically when they admit you.</p>
        </div>
      );
    }
  }

  if (videoCall) {
    // Generate a secure Jitsi URL
    // We append #config.prejoinPageEnabled=false to skip the jitsi pre-join screen and jump straight in
    const jitsiUrl = `https://meet.jit.si/dehapa-${roomId}#config.prejoinPageEnabled=false&userInfo.displayName="${userRole === 'doctor' ? 'Doctor' : 'Patient'}"`;

    return (
      <div className="fixed inset-0 w-full h-full bg-black z-[100] flex flex-col">
        {/* Top Control Bar */}
        <div className="w-full h-16 bg-slate-900 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="text-white font-bold tracking-widest flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            LIVE CONSULTATION
          </div>
          <button 
            onClick={handleEndCall}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold transition-colors"
          >
            End Call
          </button>
        </div>
        
        {/* Secure Video Iframe */}
        <div className="flex-1 w-full relative bg-slate-950">
          <iframe
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture"
            className="absolute inset-0 w-full h-full border-none"
          />
        </div>
      </div>
    );
  }

  return null;
}
