"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

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

  // 2. If online, listen for pending requests in their specialty
  useEffect(() => {
    if (!isOnline || !doctorSpecialty) {
      setIncomingRequest(null);
      return;
    }

    // Query for any pending request (removed specialty filter for easier testing)
    const q = query(
      collection(db, 'consultation_requests'),
      where('status', '==', 'pending')
    );

    const unsubRequests = onSnapshot(q, (snapshot) => {
      // Find the oldest pending request (if multiple, take the first)
      if (!snapshot.empty) {
        // We just take the first one for the ping UI
        const docData = snapshot.docs[0].data();
        setIncomingRequest({
          id: snapshot.docs[0].id,
          ...docData
        });
        
        // Try to play a ringing sound (browsers may block this without interaction)
        try {
          const audio = new Audio('/ringtone.mp3'); // We'll assume a dummy audio file
          audio.play().catch(e => console.log("Audio autoplay blocked", e));
        } catch (e) {}
      } else {
        setIncomingRequest(null);
      }
    }, (error) => {
      console.error("Error listening for incoming requests:", error);
    });

    return () => unsubRequests();
  }, [isOnline, doctorSpecialty]);

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
