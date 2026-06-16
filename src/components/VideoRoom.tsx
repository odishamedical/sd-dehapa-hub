"use client";

import React, { useState } from 'react';
import AgoraUIKit from 'agora-react-uikit';

interface VideoRoomProps {
  roomId: string;
}

export default function VideoRoom({ roomId }: VideoRoomProps) {
  const [videoCall, setVideoCall] = useState(true);

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
        <p className="text-slate-500 mb-8">Thank you for using DehaPa On-Demand Telemedicine. Your digital prescription will be available in your dashboard shortly.</p>
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
