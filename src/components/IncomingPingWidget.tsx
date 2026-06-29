"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ConnectionService } from '@/services/connection.service';

interface IncomingPingWidgetProps {
  doctorId: string;
  doctorSpecialty: string;
}

export default function IncomingPingWidget({ doctorId, doctorSpecialty }: IncomingPingWidgetProps) {
  const [incomingRequest, setIncomingRequest] = useState<any | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();

  // 1. Listen to this doctor's online status
  useEffect(() => {
    if (!doctorId) return;
    const docRef = doc(db, 'doctor_status', doctorId);
    const unsubStatus = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setIsOnline(snap.data().isOnline === true);
      }
    }, (error) => {
      console.error("Error listening to doctor status in ping widget:", error);
    });
    return () => unsubStatus();
  }, [doctorId]);

  // 2. Listen for pending requests (direct pings always ring, broadcast pings only ring if online)
  useEffect(() => {
    if (!doctorId) {
      setIncomingRequest(null);
      return;
    }

    const q = query(
      collection(db, 'consultation_requests'),
      where('status', '==', 'pending')
    );

    const unsubRequests = onSnapshot(q, (snapshot) => {
      let validRequests = [];
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // INSTANT GHOST CLEAR: Ignore any pings older than 30 minutes!
        const pingTime = data.createdAt?.toMillis ? data.createdAt.toMillis() : 0;
        if (pingTime > 0 && pingTime < thirtyMinutesAgo) {
           continue; // Skip the ghost ping
        }
        
        const isDirect = data.pingType === 'direct' && data.doctorId === doctorId;
        
        // Support legacy requests and new broadcast requests
        const isBroadcast = isOnline && 
                            doctorSpecialty && 
                            (data.pingType === 'broadcast' || !data.pingType) && 
                            (data.targetCategory === doctorSpecialty || 
                             data.department === doctorSpecialty || 
                             data.specialtyTier === doctorSpecialty);
        
        if (isDirect || isBroadcast) {
          validRequests.push({ id: doc.id, ...data });
        }
      }

      if (validRequests.length > 0) {
        // Sort in memory by createdAt descending to always answer the newest ping
        validRequests.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        
        setIncomingRequest(validRequests[0]);
      } else {
        setIncomingRequest(null);
      }
    }, (error) => {
      console.error("Error listening for incoming requests:", error);
    });

    return () => unsubRequests();
  }, [doctorId, isOnline, doctorSpecialty]);

  // 3. Play audible ringtone loop during active incoming request
  useEffect(() => {
    let isPlaying = true;
    let audioCtx: AudioContext | null = null;
    let osc1: OscillatorNode | null = null;
    let osc2: OscillatorNode | null = null;
    let gain: GainNode | null = null;
    
    if (incomingRequest) {
      const playRing = async () => {
        // Read the globally shared and already unlocked context, or fall back to creating one
        const sharedCtx = (window as any).sd_shared_audio_ctx;
        if (sharedCtx) {
          audioCtx = sharedCtx;
        } else {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContextClass) return;
          audioCtx = new AudioContextClass();
        }
        
        while (isPlaying) {
          try {
            if (audioCtx.state === 'suspended') {
              await audioCtx.resume();
            }
            
            // Generate telephone double ring (440Hz + 480Hz)
            osc1 = audioCtx.createOscillator();
            osc2 = audioCtx.createOscillator();
            gain = audioCtx.createGain();
            
            osc1.type = 'sine';
            osc2.type = 'sine';
            osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc2.frequency.setValueAtTime(480, audioCtx.currentTime);
            
            gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc1.start();
            osc2.start();
            
            // Ring duration: 1.5 seconds
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            if (osc1) { osc1.stop(); osc1.disconnect(); }
            if (osc2) { osc2.stop(); osc2.disconnect(); }
            
            // Pause duration: 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (e) {
            console.error("Ringtone synth error:", e);
            break;
          }
        }
      };
      
      playRing();
    }
    
    return () => {
      isPlaying = false;
      if (osc1) { try { osc1.stop(); } catch(e){} }
      if (osc2) { try { osc2.stop(); } catch(e){} }
      // Only close if it's not the globally shared context
      if (audioCtx && audioCtx !== (window as any).sd_shared_audio_ctx) { 
        audioCtx.close().catch(() => {}); 
      }
    };
  }, [incomingRequest]);

  const handleAccept = async () => {
    if (!incomingRequest) return;
    
    try {
      const reqRef = doc(db, 'consultation_requests', incomingRequest.id);
      
      // In a real production app, we would use a Firestore Transaction here to prevent race conditions.
      // For now, we do a quick read-then-update.
      const snap = await getDoc(reqRef);
      if (snap.exists() && snap.data().status === 'pending') {
        await updateDoc(reqRef, {
          status: 'accepted',
          acceptedByDoctorId: doctorId,
          acceptedAt: new Date()
        });
        
        // IMPLICIT CONNECTION: Automatically connect the patient and doctor
        try {
          // In real life we'd want the doctor's name, but we might just have ID here.
          // We can just pass "Doctor" as a fallback, it will be pulled from directory later.
          await ConnectionService.createApprovedConnection({
            initiatorId: incomingRequest.patientId,
            initiatorRole: 'patient',
            initiatorName: incomingRequest.patientName || 'Patient',
            receiverId: doctorId,
            receiverRole: 'doctor',
            receiverName: 'Doctor'
          });
        } catch (connErr) {
          console.error("Failed to implicitly connect:", connErr);
        }
        
        // Success! Route the doctor to the video consultation room
        router.push(`/consultation/${incomingRequest.id}`);
      } else {
        alert("Sorry, another doctor already accepted this request!");
        setIncomingRequest(null);
      }
    } catch (err) {
      console.error("Error accepting ping:", err);
      alert("Failed to accept. Please try again.");
    }
  };

  const handleDecline = () => {
    // Just hide it locally for this doctor
    setIncomingRequest(null);
  };

  if (!incomingRequest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">
          {/* Pulsing Icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-rose-600 text-white p-4 rounded-full">
              <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-2">Incoming Patient Ping!</h2>
          <p className="text-slate-500 mb-8">
            A patient is waiting for a <strong>{doctorSpecialty}</strong> right now. First to accept claims the consultation fee.
          </p>

          <div className="flex gap-4 w-full">
            <button
              onClick={handleDecline}
              className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Ignore
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 py-4 px-6 rounded-2xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
            >
              ACCEPT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
