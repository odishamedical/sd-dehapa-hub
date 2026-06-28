"use client";

import React, { useState, useEffect, useRef } from 'react';
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { 
  DailyProvider, 
  useLocalParticipant, 
  useParticipantIds, 
  useVideoTrack, 
  useAudioTrack,
  useLocalSessionId
} from '@daily-co/daily-react';

interface VideoRoomProps {
  roomId: string; // appointmentId
}

export default function VideoRoom({ roomId }: VideoRoomProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [appointmentStatus, setAppointmentStatus] = useState<string>('Pending');
  const [dailyUrl, setDailyUrl] = useState<string | null>(null);
  const [videoCall, setVideoCall] = useState(false);
  const [loading, setLoading] = useState(true);
  const [callObject, setCallObject] = useState<DailyCall | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('sd_current_user_role') || 'patient';
      setUserRole(role);

      const docRef = doc(db, "appointments", roomId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAppointmentStatus(data.status);
          if (data.dailyUrl) setDailyUrl(data.dailyUrl);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [roomId]);

  // Create Daily.co call object early so it's ready for synchronous camera start
  useEffect(() => {
    if (typeof window !== 'undefined' && !callObject) {
      const co = DailyIframe.createCallObject();
      setCallObject(co);
    }
  }, [callObject]);

  // Join the room
  useEffect(() => {
    if (callObject && dailyUrl && videoCall) {
      callObject.join({ url: dailyUrl });
      return () => {
        callObject.leave();
        callObject.destroy();
        setCallObject(null);
      };
    }
  }, [callObject, dailyUrl, videoCall]);

  const handleDoctorAdmit = async () => {
    try {
      // Synchronously request camera access immediately on button click to bypass Safari restrictions
      if (callObject) {
         await callObject.startCamera();
      }

      // 1. Generate Daily Room via secure Next.js API
      const res = await fetch('/api/video/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: roomId })
      });
      const data = await res.json();
      
      if (data.url) {
        // 2. Save URL to Firebase so patient can get it
        await updateDoc(doc(db, "appointments", roomId), { 
          status: 'Active',
          dailyUrl: data.url
        });
        setDailyUrl(data.url);
        setVideoCall(true);
      }
    } catch (err) {
      console.error('Failed to start room', err);
    }
  };
  
  const handlePatientJoin = async () => {
    if (callObject) {
       await callObject.startCamera();
    }
    setVideoCall(true); 
  };

  const handleEndCall = async () => {
    setVideoCall(false);
    if (callObject) {
      callObject.leave();
      callObject.destroy();
      setCallObject(null);
    }
    if (userRole === 'doctor' || userRole === 'super_admin') {
      await updateDoc(doc(db, "appointments", roomId), { status: 'Completed' });
      window.location.href = "/portal/doctor";
    } else {
      window.location.href = "/portal";
    }
  };

  const isDoctor = userRole === 'doctor' || userRole === 'super_admin';

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
       </div>
     );
  }

  // 1. LIVE VIDEO CALL (Custom Daily UI)
  if (videoCall && callObject) {
    return (
      <DailyProvider callObject={callObject}>
        <CustomVideoGrid isDoctor={isDoctor} onEndCall={handleEndCall} />
      </DailyProvider>
    );
  }

  // 2. COMPLETED
  if (appointmentStatus === 'Completed') {
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

  // 3. DOCTOR START
  if (isDoctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-center px-4">
        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 max-w-md w-full">
           <h2 className="text-2xl font-bold mb-4 text-white">Start Consultation</h2>
           <p className="text-slate-400 mb-8">You are about to generate a secure 100% white-labeled video room.</p>
           <button onClick={handleDoctorAdmit} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:opacity-90 transition-opacity">
             ADMIT PATIENT & JOIN CALL
           </button>
        </div>
      </div>
    );
  }

  // 4. PATIENT WAITING
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-center px-4">
       {appointmentStatus === 'Active' && dailyUrl ? (
         <div className="bg-emerald-900/40 p-8 rounded-3xl shadow-2xl border border-emerald-500/50 max-w-md w-full">
           <h2 className="text-3xl font-bold text-white mb-4">Doctor is Ready!</h2>
           <p className="text-emerald-200 mb-8">Your secure connection is ready. Tap to connect securely.</p>
           <button onClick={handlePatientJoin} className="w-full bg-emerald-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-emerald-400 transition-colors shadow-lg">
             JOIN SECURE CALL
           </button>
         </div>
       ) : (
         <>
           <div className="relative mb-8">
             <div className="w-24 h-24 border-4 border-slate-700 border-t-teal-500 rounded-full animate-spin"></div>
           </div>
           <h2 className="text-3xl font-bold text-white mb-4">Waiting Room</h2>
           <p className="text-slate-400 text-lg max-w-sm">Please wait while the doctor reviews your file.</p>
         </>
       )}
    </div>
  );
}

// ----------------------------------------------------------------------------------
// Custom Daily.co UI Components (100% White Labeled)
// ----------------------------------------------------------------------------------

function CustomVideoGrid({ isDoctor, onEndCall }: { isDoctor: boolean, onEndCall: () => void }) {
  const localSessionId = useLocalSessionId();
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950 flex flex-col overflow-hidden z-[100]">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 z-50 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 pointer-events-auto">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          <span className="text-white text-xs font-bold tracking-widest uppercase">Live Session</span>
        </div>
      </div>

      {/* Main Remote Video (Full Screen) */}
      <div className="absolute inset-0 w-full h-full bg-slate-900">
        {remoteParticipantIds.length > 0 ? (
          <VideoPlayer id={remoteParticipantIds[0]} isLocal={false} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
             <div className="w-16 h-16 border-4 border-slate-700 border-t-slate-400 rounded-full animate-spin"></div>
             <p className="font-bold tracking-widest">WAITING FOR {isDoctor ? 'PATIENT' : 'DOCTOR'} TO JOIN...</p>
          </div>
        )}
      </div>

      {/* Local Video Picture-in-Picture (Bottom Right) */}
      <div className="absolute bottom-24 right-6 w-28 h-40 md:w-48 md:h-64 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-40">
         {localSessionId && <VideoPlayer id={localSessionId} isLocal={true} />}
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl px-2 py-2 rounded-full border border-white/10">
         <button 
           onClick={onEndCall} 
           className="bg-red-500 hover:bg-red-600 text-white font-bold tracking-widest uppercase text-xs px-8 py-4 rounded-full transition-colors flex items-center gap-2"
         >
            End Call
         </button>
      </div>

    </div>
  );
}

function VideoPlayer({ id, isLocal }: { id: string, isLocal: boolean }) {
  const videoState = useVideoTrack(id);
  const audioState = useAudioTrack(id);
  
  const videoElement = useRef<HTMLVideoElement>(null);
  const audioElement = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (videoElement.current && videoState?.track) {
      videoElement.current.srcObject = new MediaStream([videoState.track]);
    }
  }, [videoState?.track]);

  useEffect(() => {
    if (audioElement.current && audioState?.track && !isLocal) {
      audioElement.current.srcObject = new MediaStream([audioState.track]);
    }
  }, [audioState?.track, isLocal]);

  return (
    <>
      <video 
        autoPlay 
        muted 
        playsInline 
        ref={videoElement} 
        className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`} // Mirror local video
      />
      {!isLocal && <audio autoPlay playsInline ref={audioElement} />}
    </>
  );
}
