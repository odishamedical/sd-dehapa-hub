"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function PatientConsultWidget({ patientId }: { patientId: string | null }) {
  const [step, setStep] = useState<'tier' | 'payment' | 'pinging'>('tier');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [price, setPrice] = useState(0);
  
  // Hardware & Location States
  const [hasVideo, setHasVideo] = useState(true);
  const [hasAudio, setHasAudio] = useState(true);
  const [hardwareChecking, setHardwareChecking] = useState(false);
  const [hardwareStep, setHardwareStep] = useState<'intro' | 'checking' | 'fallback_prompt' | 'location' | 'ready'>('intro');
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  const router = useRouter();

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  const tiers = [
    { id: 'General Doctor', name: 'General Physician', price: 299, desc: 'Platform fixed rate for general instant care.' },
    { id: 'Specialist Doctor', name: 'Specialist', price: 599, desc: 'Platform fixed rate for urgent specialized care.' },
    { id: 'Super-specialist Doctor', name: 'Super Specialist', price: 999, desc: 'Platform fixed rate for advanced emergency consults.' }
  ];

  // Listen to the request once created to see if a doctor accepted
  useEffect(() => {
    if (!requestId || step !== 'pinging') return;

    const unsub = onSnapshot(doc(db, 'consultation_requests', requestId), (snap) => {
      if (snap.exists() && snap.data().status === 'accepted') {
        // Success! Redirect to the video room
        router.push(`/consultation/${requestId}`);
      }
    });

    return () => unsub();
  }, [requestId, step, router]);

  const handleSelectTier = (tier: any) => {
    if (!patientId) {
      window.location.href = '/login?redirect_uri=' + encodeURIComponent(window.location.href);
      return;
    }
    setSelectedTier(tier.id);
    setPrice(tier.price);
    setStep('hardware_check');
    setHardwareStep('intro');
  };

  const startHardwareTest = async () => {
    setHardwareStep('checking');
    setHardwareChecking(true);
    try {
      // 1. Try testing both Video and Audio
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setHasVideo(true);
      setHasAudio(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHardwareChecking(false);
      setHardwareStep('location');
      requestLocation();
    } catch (err) {
      console.warn("Camera/Mic denied, trying Audio-only", err);
      try {
        // 2. Try testing Audio-only
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStream.getTracks().forEach(t => t.stop()); // release instantly
        setHasVideo(false);
        setHasAudio(true);
        setHardwareChecking(false);
        setHardwareStep('fallback_prompt');
      } catch (audioErr) {
        console.error("Both Video and Audio blocked", audioErr);
        setHasVideo(false);
        setHasAudio(false);
        setHardwareChecking(false);
        setHardwareStep('fallback_prompt');
      }
    }
  };

  const requestLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          setHardwareStep('ready');
        },
        (err) => {
          console.error("Location error", err);
          alert("Location is required for emergency dispatch. Please allow location access to continue.");
          // Still let them proceed for normal consult, but record lack of coordinates
          setHardwareStep('ready');
        }
      );
    } else {
      setHardwareStep('ready');
    }
  };

  const handlePaymentSuccess = async () => {
    // In Phase 4, this is where Razorpay logic goes.
    // For now, we mock success and create the request.
    try {
      const docRef = await addDoc(collection(db, 'consultation_requests'), {
        patientId,
        specialtyTier: selectedTier,
        status: 'pending',
        pricePaid: price,
        createdAt: new Date(),
        hasVideo,
        hasAudio,
        latitude: userLocation?.latitude || null,
        longitude: userLocation?.longitude || null,
      });
      setRequestId(docRef.id);
      setStep('pinging');
    } catch (err) {
      console.error('Error creating request', err);
      alert('Failed to initiate consultation. Please try again.');
      setStep('tier');
    }
  };

  if (step === 'pinging') {
    return (
      <div className="bg-white/30 backdrop-blur-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 rounded-[32px] p-8 md:p-12 text-center animate-in zoom-in duration-500 relative overflow-hidden">
        {/* Radar Animation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-64 h-64 border-[4px] border-sky-400 rounded-full animate-[ping_3s_ease-out_infinite]"></div>
          <div className="absolute w-48 h-48 border-[4px] border-sky-400 rounded-full animate-[ping_3s_ease-out_infinite_0.5s]"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <svg className="w-16 h-16 text-sky-600 animate-pulse mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Pinging Doctors...</h2>
          <p className="text-slate-600 font-medium">We are contacting available {selectedTier}s in the network.</p>
          <p className="text-sm text-slate-500 mt-4 max-w-sm">
            Please stay on this screen. You will be automatically redirected to the secure video room as soon as a doctor accepts.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'hardware_check') {
    return (
      <div className="bg-white/30 backdrop-blur-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 rounded-[32px] p-8 md:p-10 relative overflow-hidden text-center max-w-lg mx-auto">
        <button onClick={() => setStep('tier')} className="text-slate-400 hover:text-slate-600 mb-4 flex items-center text-sm font-bold absolute left-6 top-6">
          &larr; Back
        </button>

        {hardwareStep === 'intro' && (
          <div className="pt-6">
            <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Check Camera & Mic</h2>
            <p className="text-slate-500 mb-6 text-sm">
              We need to make sure your camera and microphone work so the doctor can see and hear you.
            </p>
            <button 
              onClick={startHardwareTest}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            >
              START CAMERA TEST
            </button>
          </div>
        )}

        {hardwareStep === 'checking' && (
          <div className="py-12">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Testing Hardware...</h2>
            <p className="text-slate-500 text-sm">
              Please click "Allow" on your phone screen if it asks for Camera/Mic permission.
            </p>
          </div>
        )}

        {hardwareStep === 'fallback_prompt' && (
          <div className="pt-6">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Camera Access Blocked</h2>
            {hasAudio ? (
              <>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                  Your phone is blocking the camera. Do you want to proceed with an <strong>Audio-Only</strong> voice call instead?
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setHardwareStep('location')}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all"
                  >
                    Yes, Audio Call
                  </button>
                  <button 
                    onClick={() => setHardwareStep('intro')}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all"
                  >
                    Retry Setup
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                  Both camera and microphone are blocked. You will still be able to see the doctor, but you will have to type. Continue?
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setHardwareStep('location')}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all"
                  >
                    Continue Anyway
                  </button>
                  <button 
                    onClick={() => setHardwareStep('intro')}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all"
                  >
                    Retry Setup
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {hardwareStep === 'location' && (
          <div className="pt-6">
            <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Location Required</h2>
            <p className="text-slate-500 mb-6 text-sm">
              We need your GPS location to connect you with nearby doctors and dispatch emergency services if needed.
            </p>
            <button 
              onClick={requestLocation}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all"
            >
              ALLOW LOCATION
            </button>
          </div>
        )}

        {hardwareStep === 'ready' && (
          <div className="pt-6">
            {hasVideo && (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full max-w-[240px] h-40 bg-slate-900 rounded-2xl mx-auto mb-6 object-cover border border-white shadow-md scale-x-[-1]"
              />
            )}
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Setup Complete!</h2>
            <p className="text-slate-500 mb-6 text-sm">
              Your camera, mic, and GPS are verified. Tap below to proceed to checkout.
            </p>
            <button 
              onClick={() => {
                if (localStream) {
                  localStream.getTracks().forEach(t => t.stop()); // release camera before call starts
                }
                setStep('payment');
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all"
            >
              PROCEED TO PAYMENT
            </button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="bg-white/30 backdrop-blur-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 rounded-[32px] p-8 md:p-10 relative overflow-hidden">
        <button onClick={() => setStep('tier')} className="text-slate-400 hover:text-slate-600 mb-4 flex items-center text-sm font-bold">
          &larr; Back
        </button>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Complete Payment</h2>
        <p className="text-slate-500 mb-6">You are requesting a <strong>{selectedTier}</strong>.</p>
        
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] mb-8 flex justify-between items-center">
          <span className="font-bold text-slate-700">Consultation Fee</span>
          <span className="text-2xl font-black text-slate-900">₹{price}</span>
        </div>

        <button 
          onClick={handlePaymentSuccess}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all"
        >
          Pay Securely with Razorpay
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 rounded-[32px] p-8 md:p-10 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-rose-100 text-rose-600 rounded-full">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">Instant Video Consult</h2>
          <p className="text-slate-500 text-sm mt-1">Connect with an online doctor in less than 2 minutes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier) => (
          <div 
            key={tier.id}
            onClick={() => handleSelectTier(tier)}
            className="border border-white/20 hover:border-teal-400 bg-white/5 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg hover:bg-white/10 group backdrop-blur-sm"
          >
            <h3 className="font-bold text-lg text-white group-hover:text-teal-400 transition-colors">{tier.name}</h3>
            <div className="text-2xl font-black text-white my-2">₹{tier.price}</div>
            <p className="text-xs text-slate-300">{tier.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
