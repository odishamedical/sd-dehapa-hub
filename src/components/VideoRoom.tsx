"use client";

import React, { useState, useEffect } from 'react';
import AgoraUIKit from 'agora-react-uikit';

interface VideoRoomProps {
  roomId: string;
}

export default function VideoRoom({ roomId }: VideoRoomProps) {
  const [videoCall, setVideoCall] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserRole(localStorage.getItem('sd_current_user_role'));
    }
  }, []);

  const rtcProps = {
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || '',
    channel: roomId,
    // When using Agora in test mode, tokens are optional. 
    // In production with a security certificate, we would fetch a token here.
    token: null, 
  };

  const callbacks = {
    EndCall: () => setVideoCall(false),
  };

  const isDoctor = userRole === 'doctor' || userRole === 'super_admin';

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
