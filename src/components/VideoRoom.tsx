"use client";

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

interface VideoRoomProps {
  roomId: string;
}

export default function VideoRoom({ roomId }: VideoRoomProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [appointmentStatus, setAppointmentStatus] = useState<string>('Pending');
  const [videoCall, setVideoCall] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('sd_current_user_role') || 'patient';
      setUserRole(role);

      const docRef = doc(db, "appointments", roomId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAppointmentStatus(data.status);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [roomId]);

  const handleDoctorAdmit = () => {
    const docRef = doc(db, "appointments", roomId);
    updateDoc(docRef, { status: 'Active' }).catch(console.error);
    setVideoCall(true); // Mount iframe synchronously on click!
  };
  
  const handlePatientJoin = () => {
    setVideoCall(true); // Mount iframe synchronously on click!
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

  // 1. If user is in the actual Video Call
  if (videoCall) {
    const jitsiUrl = `https://meet.jit.si/dehapa-${roomId}#config.prejoinPageEnabled=false&userInfo.displayName="${isDoctor ? 'Doctor' : 'Patient'}"`;

    return (
      <div className="fixed inset-0 w-full h-full bg-black z-[100] flex flex-col">
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

  // 2. If Doctor hasn't joined yet
  if (isDoctor && appointmentStatus !== 'Completed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-center px-4">
        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 max-w-md w-full">
           <div className="w-20 h-20 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
           </div>
           <h2 className="text-2xl font-bold mb-4 text-white">Start Consultation</h2>
           <p className="text-slate-400 mb-8">You are about to start the video session. The patient will be notified to join the room.</p>
           <button onClick={handleDoctorAdmit} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:opacity-90 transition-opacity">
             Admit Patient & Join Call
           </button>
        </div>
      </div>
    );
  }

  // 3. If Patient is waiting
  if (!isDoctor && appointmentStatus !== 'Completed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-center px-4">
         {appointmentStatus === 'Active' ? (
           <div className="bg-emerald-900/40 p-8 rounded-3xl shadow-2xl border border-emerald-500/50 max-w-md w-full">
             <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.5)]">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
             </div>
             <h2 className="text-3xl font-bold text-white mb-4">Doctor is Ready!</h2>
             <p className="text-emerald-200 mb-8">Your doctor has admitted you to the secure video session. Tap below to securely connect your camera and join.</p>
             <button onClick={handlePatientJoin} className="w-full bg-emerald-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-emerald-400 transition-colors shadow-lg">
               JOIN SECURE CALL
             </button>
           </div>
         ) : (
           <>
             <div className="relative mb-8">
               <div className="w-24 h-24 border-4 border-slate-700 border-t-teal-500 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 bg-teal-500 rounded-full animate-ping opacity-75"></div>
               </div>
             </div>
             <h2 className="text-3xl font-bold text-white mb-4">Waiting Room</h2>
             <p className="text-slate-400 text-lg max-w-sm">Please wait while the doctor reviews your file. The video call will start automatically when they admit you.</p>
           </>
         )}
      </div>
    );
  }

  // 4. Completed State
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-md w-full">
        <h1 className="text-2xl font-black text-slate-900 mb-4">Consultation Ended</h1>
        <button 
          onClick={() => window.location.href = '/portal'}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
