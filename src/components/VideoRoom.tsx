"use client";

import React, { useState, useEffect } from 'react';
import AgoraUIKit from 'agora-react-uikit';
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

interface VideoRoomProps {
  roomId: string; // This is the appointmentId
}

export default function VideoRoom({ roomId }: VideoRoomProps) {
  const [videoCall, setVideoCall] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [appointmentStatus, setAppointmentStatus] = useState<string>('Pending');
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

  const rtcProps = {
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || '13c9a0c20a454d6faeb06cc945cd1f44', // Dehapa Agora App ID
    channel: roomId,
    token: null, // Tokens are optional in test mode
  };

  const callbacks = {
    EndCall: async () => {
      setVideoCall(false);
      // Mark appointment as completed
      if (userRole === 'doctor' || userRole === 'super_admin') {
         await updateDoc(doc(db, "appointments", roomId), { status: 'Completed' });
      } else {
         // Patient leaves, but we don't end the appointment globally, just locally
      }
      setAppointmentStatus('Completed');
    },
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
    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#000' }}>
        <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
      </div>
    );
  }

  // 2. If Completed State
  if (appointmentStatus === 'Completed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-md w-full">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Consultation Ended</h1>
          
          {isDoctor ? (
            <>
              <p className="text-slate-500 mb-8">The consultation has ended. Please proceed to write the e-Prescription for the patient.</p>
              <button 
                onClick={() => window.location.href = `/doctor/prescription-pad?request=${roomId}`}
                className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Write e-Prescription
              </button>
              <button 
                onClick={() => window.location.href = '/portal'}
                className="w-full mt-4 bg-white text-slate-600 border border-slate-200 font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Return to Dashboard
              </button>
            </>
          ) : (
            <>
              <p className="text-slate-500 mb-8">Thank you for using DehaPa On-Demand Telemedicine. Your digital prescription will be available in your dashboard shortly.</p>
              <button 
                onClick={() => window.location.href = '/portal'}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Return to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // 3. If Doctor hasn't joined yet
  if (isDoctor) {
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

  // 4. If Patient is waiting
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
