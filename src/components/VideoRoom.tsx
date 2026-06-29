"use client";

import React, { useState, useEffect, useRef } from 'react';
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";
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
  const [patientHasVideo, setPatientHasVideo] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);

  // Fetch consultation request details to see if patient camera is blocked and get patientId
  useEffect(() => {
    if (typeof window !== 'undefined' && roomId) {
      const getReqDetails = async () => {
        try {
          const snap = await getDoc(doc(db, 'consultation_requests', roomId));
          if (snap.exists()) {
            const data = snap.data();
            setPatientHasVideo(data.hasVideo !== false);
            if (data.patientId) setPatientId(data.patientId);
          }
        } catch (e) {
          console.warn("Failed to fetch consultation request info:", e);
        }
      };
      getReqDetails();
    }
  }, [roomId]);

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
      // Only join if we are not already joined or joining
      const state = callObject.meetingState();
      if (state !== 'joining-meeting' && state !== 'joined-meeting') {
         callObject.join({ url: dailyUrl }).catch(err => console.error("Daily join error:", err));
      }
    }
  }, [callObject, dailyUrl, videoCall]);

  const handleDoctorAdmit = async () => {
    try {
      // Synchronously request camera access immediately on button click to bypass Safari restrictions
      if (callObject) {
         try {
           await callObject.startCamera();
         } catch (camErr) {
           console.warn("Doctor camera block during startCamera:", camErr);
         }
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
        await setDoc(doc(db, "appointments", roomId), { 
          status: 'Active',
          dailyUrl: data.url
        }, { merge: true });
        setDailyUrl(data.url);
        setVideoCall(true);
      }
    } catch (err) {
      console.error('Failed to start room', err);
    }
  };
  
  const handlePatientJoin = async () => {
    if (callObject) {
       try {
         await callObject.startCamera();
       } catch (camErr) {
         console.warn("Patient camera block during startCamera:", camErr);
       }
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
      if (patientId) {
        window.location.href = `/doctor/prescription-pad?patient=${patientId}&request=${roomId}`;
      } else {
        window.location.href = "/portal/doctor";
      }
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
        <CustomVideoGrid isDoctor={isDoctor} onEndCall={handleEndCall} dailyUrl={dailyUrl} patientHasVideo={patientHasVideo} />
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

function CustomVideoGrid({ isDoctor, onEndCall, dailyUrl, patientHasVideo }: { isDoctor: boolean, onEndCall: () => void, dailyUrl: string | null, patientHasVideo: boolean }) {
  const localSessionId = useLocalSessionId();
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
  const localVideo = useVideoTrack(localSessionId || '');
  
  // Audio/Video control states
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(patientHasVideo || isDoctor);

  const [meetingState, setMeetingState] = useState<string>('unknown');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const callObject = DailyIframe.getCallInstance();
  
  useEffect(() => {
    if (!callObject) return;
    const updateState = () => setMeetingState(callObject.meetingState());
    const handleError = (e: any) => {
      console.error("Daily error event:", e);
      setErrorMessage(e?.errorMsg || JSON.stringify(e));
    };
    
    updateState();
    callObject.on('joining-meeting', updateState);
    callObject.on('joined-meeting', updateState);
    callObject.on('left-meeting', updateState);
    callObject.on('error', handleError);
    return () => {
      callObject.off('joining-meeting', updateState);
      callObject.off('joined-meeting', updateState);
      callObject.off('left-meeting', updateState);
      callObject.off('error', handleError);
    };
  }, [callObject]);

  const toggleMic = () => {
    if (callObject) {
      const next = !micActive;
      callObject.setLocalAudio(next);
      setMicActive(next);
    }
  };

  const toggleCam = () => {
    if (callObject) {
      const next = !camActive;
      callObject.setLocalVideo(next);
      setCamActive(next);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950 flex flex-col overflow-hidden z-[100]">
      
      {/* Doctor Warning Banner: Patient Camera Blocked */}
      {isDoctor && !patientHasVideo && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[210] w-[90%] max-w-sm bg-rose-600 border border-rose-500 text-white rounded-2xl p-4 shadow-xl flex items-start gap-3 animate-in slide-in-from-top duration-300">
          <span className="text-xl">⚠️</span>
          <div>
            <h5 className="font-bold text-sm uppercase tracking-wider">Patient Camera Blocked</h5>
            <p className="text-xs text-rose-100 mt-0.5 leading-relaxed">
              They can see you and hear you, but their phone is blocking their own camera.
            </p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 z-50 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 pointer-events-auto">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          <span className="text-white text-xs font-bold tracking-widest uppercase">Live Session</span>
        </div>
        <div className="text-[10px] text-white/45 font-mono pointer-events-auto text-right max-w-[65%] overflow-hidden">
          ID: {window.location.pathname.split('/').pop()} <br/>
          STATE: {meetingState} <br/>
          {errorMessage && <span className="text-red-400 font-bold">ERROR: {errorMessage}</span>}
        </div>
      </div>

      {/* Main Remote Video (Full Screen) */}
      <div className="absolute inset-0 w-full h-full bg-slate-900">
        {remoteParticipantIds.length > 0 ? (
          <VideoPlayer id={remoteParticipantIds[0]} isLocal={false} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
             <div className="w-16 h-16 border-4 border-slate-700 border-t-slate-400 rounded-full animate-spin"></div>
             <p className="font-black text-xs md:text-sm tracking-widest text-center px-8 uppercase text-slate-400 animate-pulse">
               Connecting... Please Wait / कृपया प्रतीक्षा करें
             </p>
          </div>
        )}
      </div>

      {/* Local Video Picture-in-Picture (Bottom Right) */}
      {camActive && (
        <div className="absolute bottom-28 right-6 w-28 h-40 md:w-48 md:h-64 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-40">
           {localSessionId && <VideoPlayer id={localSessionId} isLocal={true} />}
        </div>
      )}

      {/* Bottom Control Bar (Village-Friendly, Massive Buttons) */}
      <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center items-center gap-6 px-4">
        <div className="bg-slate-900/90 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-6 shadow-2xl">
          {/* Mute Button */}
          <button 
            onClick={toggleMic}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              micActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white animate-pulse'
            }`}
          >
            {micActive ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>

          {/* End Call Button (Big Red Centerpiece) */}
          <button 
            onClick={onEndCall} 
            className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-red-900/35"
          >
            <svg className="w-8 h-8 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 15.46l-5.27-.61-2.52 2.52c-2.83-1.44-5.15-3.75-6.59-6.59l2.53-2.53L8.54 3H3.03C2.45 3 2 3.45 2 4.03 2 13.4 9.6 21 18.97 21c.58 0 1.03-.45 1.03-1.03v-4.51z" />
            </svg>
          </button>

          {/* Camera Button */}
          <button 
            onClick={toggleCam}
            disabled={!patientHasVideo && !isDoctor}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              !patientHasVideo && !isDoctor ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed' :
              camActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white animate-pulse'
            }`}
          >
            {camActive ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            )}
          </button>
        </div>
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
