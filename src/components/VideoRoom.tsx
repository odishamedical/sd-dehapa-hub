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
  const [isWaiting, setIsWaiting] = useState(true);
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
            setVideoCall(true);
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

  const rtcProps = {
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || '13c9a0c20a454d6faeb06cc945cd1f44', // Using a placeholder if not set
    channel: roomId,
    // When using Agora in test mode, tokens are optional. 
    token: null, 
  };

  const callbacks = {
    EndCall: async () => {
      setVideoCall(false);
      // Mark appointment as completed
      if (userRole === 'doctor' || userRole === 'super_admin') {
         await updateDoc(doc(db, "appointments", roomId), { status: 'Completed' });
      }
    },
  };

  const isDoctor = userRole === 'doctor' || userRole === 'super_admin';

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
       </div>
     );
  }

  if (isWaiting) {
    if (isDoctor) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-md w-full">
             <h2 className="text-2xl font-bold mb-4">Start Consultation</h2>
             <p className="text-slate-500 mb-6">You are about to start the video session. The patient will be notified to join.</p>
             <button onClick={handleDoctorJoin} className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700">
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
              <div className="w-12 h-12 bg-teal-500 rounded-full animate-pulse opacity-50"></div>
            </div>
          </div>
          <h2 className="text-3xl font-serif font-bold text-white mb-2">Virtual Waiting Room</h2>
          <p className="text-slate-400 max-w-sm">Please wait here. Your doctor has been notified and will admit you to the secure video session shortly.</p>
        </div>
      );
    }
  }

  return videoCall ? (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
    </div>
  ) : (
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
