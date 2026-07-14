"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Square, Play, Trash2, CheckCircle2, ShieldCheck, Activity, UserCircle, MapPin, Loader2 } from 'lucide-react';
import { db, auth, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/firestore'; // Note: storage imports usually from firebase/storage, let's mock the upload for safety if storage not fully set up.
import { useRouter } from 'next/navigation';

interface FrictionlessBookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityName: string;
  entityType: string;
  bookingMode: 'clinic' | 'schedule_video' | 'instant_video' | null;
  fee?: number;
}

export default function FrictionlessBookingDrawer({ 
  isOpen, onClose, entityId, entityName, entityType, bookingMode, fee = 500 
}: FrictionlessBookingDrawerProps) {
  
  const router = useRouter();
  const [patientData, setPatientData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [textSymptom, setTextSymptom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      fetchPatientData();
    }
  }, [isOpen]);

  const fetchPatientData = async () => {
    try {
      if (!auth.currentUser) return;
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        if (!data.isProfileComplete) {
          // If somehow they bypassed the guard, redirect them now
          router.push(`/portal/setup?redirect=${encodeURIComponent(window.location.pathname)}`);
        } else {
          setPatientData({
            name: auth.currentUser.displayName || localStorage.getItem('sd_current_user_name') || 'Patient',
            age: data.age,
            sex: data.sex,
            whatsapp: data.whatsapp
          });
        }
      }
    } catch (err) {
      console.error("Error fetching patient data", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to release mic
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const handlePaymentAndBook = async () => {
    if (!auth.currentUser || !patientData) return;
    setIsSubmitting(true);
    
    try {
      // 1. Mock Upload Audio to Storage (In real app, use firebase/storage)
      let finalAudioUrl = null;
      if (audioBlob) {
        // Mocking the upload delay
        await new Promise(r => setTimeout(r, 800)); 
        finalAudioUrl = "mock_storage_url_audio.webm";
      }

      // 2. Create Booking Document
      const bookingData = {
        patientId: auth.currentUser.uid,
        patientName: patientData.name,
        patientAge: patientData.age,
        patientSex: patientData.sex,
        patientWhatsapp: patientData.whatsapp,
        providerId: entityId,
        providerName: entityName,
        entityType,
        bookingMode,
        fee,
        symptomsText: textSymptom,
        symptomsAudioUrl: finalAudioUrl,
        status: 'pending', // would become 'confirmed' after actual payment gateway
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Clear form
        setTextSymptom('');
        deleteRecording();
      }, 3000);

    } catch (err) {
      console.error(err);
      alert("Failed to confirm booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const getAccentColor = () => {
    if (bookingMode === 'instant_video') return 'from-rose-500 to-pink-600 border-rose-500/50 shadow-[0_0_30px_rgba(225,29,72,0.15)] text-rose-400';
    if (bookingMode === 'schedule_video') return 'from-cyan-500 to-blue-600 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] text-cyan-400';
    return 'from-emerald-400 to-teal-500 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] text-emerald-400';
  };

  const getTitle = () => {
    if (bookingMode === 'instant_video') return 'Urgent Triage & Connect';
    if (bookingMode === 'schedule_video') return 'Schedule Telemedicine';
    return 'Book Clinic Visit';
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`relative w-full max-w-md bg-slate-900 border-l border-white/10 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out translate-x-0`}>
        
        {/* Header */}
        <div className={`p-6 border-b border-white/10 bg-gradient-to-br ${getAccentColor().split(' ')[0]} ${getAccentColor().split(' ')[1]} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-slate-950/40"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-white/80" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Secure Checkout</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{getTitle()}</h2>
              <p className="text-white/70 text-sm mt-1 font-medium">with {entityName}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Smart Identity Card (Auto-filled) */}
          {loadingProfile ? (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-slate-500 animate-spin" /></div>
          ) : patientData ? (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient Identity</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Auto-Verified</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center border border-slate-600">
                  <UserCircle className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <div className="font-black text-white text-lg">{patientData.name}</div>
                  <div className="text-slate-400 text-sm font-medium">
                    {patientData.age} yrs • {patientData.sex} • {patientData.whatsapp}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Voice Triage Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chief Symptoms</h3>
            
            {!audioBlob ? (
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                    isRecording 
                      ? 'bg-rose-500 shadow-[0_0_40px_rgba(225,29,72,0.6)] scale-110 animate-pulse' 
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-105 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                  }`}
                >
                  {isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-8 h-8 text-white" />}
                </button>
                <div className="text-center">
                  <div className={`font-bold ${isRecording ? 'text-rose-400' : 'text-indigo-400'}`}>
                    {isRecording ? 'Recording... Tap to stop' : 'Tap to speak your symptoms'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Our AI will summarize this for the doctor.</div>
                </div>
                
                <div className="w-full flex items-center gap-4 my-2">
                  <div className="flex-1 h-px bg-slate-800"></div>
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">OR TYPE</span>
                  <div className="flex-1 h-px bg-slate-800"></div>
                </div>

                <textarea
                  value={textSymptom}
                  onChange={(e) => setTextSymptom(e.target.value)}
                  placeholder="e.g. Mild fever since yesterday with headache..."
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl p-4 focus:outline-none focus:border-indigo-500 min-h-[100px] resize-none"
                />
              </div>
            ) : (
              <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Mic className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="font-bold text-indigo-300 text-sm">Voice Note Attached</span>
                  </div>
                  <button onClick={deleteRecording} className="text-slate-400 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <audio src={audioUrl!} controls className="w-full h-10 rounded-full" />
              </div>
            )}
          </div>
        </div>

        {/* Footer / Payment Action */}
        <div className="p-6 bg-slate-950 border-t border-slate-800">
          {success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
              <h3 className="text-xl font-black text-white">Booking Confirmed!</h3>
              <p className="text-sm text-emerald-300/70 mt-1">Your slot has been secured.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 font-medium">Total Payable</span>
                <span className="text-3xl font-black text-white">₹{fee}</span>
              </div>
              <button 
                onClick={handlePaymentAndBook}
                disabled={isSubmitting || loadingProfile}
                className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-900 py-4 rounded-xl font-black text-[15px] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing Secure Payment...</>
                ) : (
                  <>Secure Payment & Book Slot</>
                )}
              </button>
              <div className="text-center mt-3 flex items-center justify-center gap-1 opacity-50">
                <ShieldCheck className="w-3 h-3 text-white" />
                <span className="text-[10px] text-white font-medium tracking-widest uppercase">100% Secure Transaction via UPI/Cards</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
