"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { DailyProvider, useParticipantIds, useVideoTrack, useAudioTrack, useLocalSessionId } from '@daily-co/daily-react';
import { db } from "@/lib/firebase";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";

interface DigitalRxPadProps {
  patient: any;
  onClose: () => void;
  onSave?: (patient: any) => void;
}

export default function DigitalRxPad({ patient, onClose, onSave }: DigitalRxPadProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [mounted, setMounted] = useState(false);
  
  // Video Integration States
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [dailyUrl, setDailyUrl] = useState<string | null>(null);
  const [videoCall, setVideoCall] = useState(false);
  const [patientHasVideo, setPatientHasVideo] = useState(true);

  // Mobile View State
  const [mobileView, setMobileView] = useState<'video' | 'rx'>('video');

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 1. Fetch patient camera capability
  useEffect(() => {
    if (patient?.id) {
      const getReqDetails = async () => {
        try {
          const snap = await getDoc(doc(db, 'consultation_requests', patient.id));
          if (snap.exists()) {
            const data = snap.data();
            setPatientHasVideo(data.hasVideo !== false);
          }
        } catch (e) {
          console.warn("Failed to fetch consultation request info:", e);
        }
      };
      getReqDetails();
    }
  }, [patient]);

  // 2. Create Call Object Early
  useEffect(() => {
    if (!callObject) {
      const co = DailyIframe.createCallObject();
      setCallObject(co);
    }
  }, [callObject]);

  // 3. Generate Room & Join when Rx Pad opens for an Online Patient
  useEffect(() => {
    const startVideo = async () => {
      if (patient?.id && (patient.type === 'online' || patient.mode === 'Video Call') && !videoCall && callObject) {
        try {
          // Pre-emptively start doctor camera
          try {
            await callObject.startCamera();
          } catch (camErr) {
            console.warn("Doctor camera block during startCamera:", camErr);
          }
          
          // Generate room URL
          const res = await fetch('/api/video/create-room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appointmentId: patient.id })
          });
          const data = await res.json();
          
          if (data.url) {
            // Save URL to Firebase
            await setDoc(doc(db, "appointments", patient.id), { 
              status: 'Active',
              dailyUrl: data.url
            }, { merge: true });
            
            setDailyUrl(data.url);
            
            // Join the Daily Room
            await callObject.join({ url: data.url });
            setVideoCall(true);
          }
        } catch (err) {
          console.error('Failed to start room', err);
        }
      }
    };
    
    startVideo();
  }, [patient, callObject, videoCall]);

  // 4. Handle End Call / Close
  const handleEndConsult = async () => {
    if (callObject) {
      callObject.leave();
      callObject.destroy();
      setCallObject(null);
    }
    if (patient?.id) {
       try {
         await updateDoc(doc(db, "appointments", patient.id), { status: 'Completed' });
       } catch (e) {}
    }
    onClose();
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };
  
  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  if (!patient || !mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-gradient-to-br from-slate-900 via-[#0a2e38] to-[#1e1b4b] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* HEADER (Glass) */}
      <div className="bg-white/10 backdrop-blur-2xl border-b border-white/20 px-4 py-3 flex items-center justify-between shadow-lg z-30 shrink-0 relative">
        <div className="flex items-center gap-3">
          <button onClick={handleEndConsult} className="p-2 -ml-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h2 className="font-bold text-white text-lg drop-shadow-md">{patient.name}</h2>
            <div className="text-xs text-teal-100 font-medium">{patient.age}y • {patient.sex} {patient.phone && `• ${patient.phone}`}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full border ${patient.type === 'online' || patient.mode === 'Video Call' ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' : 'bg-white/10 text-white/70 border-white/20'}`}>
             {patient.mode}
           </span>
           <button onClick={handleEndConsult} className="px-4 py-1.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-rose-500/20 transition-all backdrop-blur-md border border-rose-400/30">
             End Consult
           </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        
        {/* TELEMEDICINE VIDEO (Top on Mobile, Left on Desktop) */}
        {(patient.type === 'online' || patient.mode === 'Video Call') && (
          <div 
             className={`
                ${mobileView === 'video' ? 'w-full h-full relative flex flex-col' : 'fixed top-[72px] right-4 w-28 h-40 z-[60] rounded-2xl overflow-hidden shadow-2xl border border-white/20 cursor-pointer'}
                lg:!static lg:!w-1/2 lg:!h-full lg:!relative lg:!flex lg:!flex-col lg:!shrink-0 lg:!rounded-none lg:!border-none lg:!shadow-none lg:!z-0 lg:!cursor-default
             `}
             onClick={() => { if(mobileView === 'rx' && window.innerWidth < 1024) setMobileView('video'); }}
          >
            <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-900 pointer-events-auto">
              {callObject && videoCall ? (
                <DailyProvider callObject={callObject}>
                  <InlineVideoGrid patientName={patient.name} patientHasVideo={patientHasVideo} isMini={mobileView === 'rx'} />
                  {mobileView === 'rx' && (
                    <div className="absolute inset-0 z-40 bg-black/10 hover:bg-black/20 flex items-center justify-center lg:hidden transition-colors">
                       <svg className="w-8 h-8 text-white/70 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                    </div>
                  )}
                </DailyProvider>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full bg-black/40">
                  <div className="w-12 h-12 border-4 border-slate-700 border-t-teal-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400 font-bold animate-pulse text-sm tracking-widest uppercase">Connecting...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WRITE PRESCRIPTION FAB (Mobile only when in Video mode) */}
        {(patient.type === 'online' || patient.mode === 'Video Call') && mobileView === 'video' && (
           <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[60] lg:hidden pointer-events-auto">
              <button onClick={() => setMobileView('rx')} className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-4 px-8 rounded-full shadow-xl shadow-teal-500/30 flex items-center gap-2 tracking-widest uppercase text-xs transition-transform active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Write Prescription
              </button>
           </div>
        )}

        {/* RX PAD SIDE (Glass Card overlapping on mobile) */}
        <div className={`flex-1 flex flex-col relative transition-all duration-500
           ${(patient.type === 'online' || patient.mode === 'Video Call') 
              ? `${mobileView === 'video' ? 'hidden lg:flex' : 'flex w-full'} lg:w-1/2 lg:rounded-none z-20` 
              : 'w-full flex'
           }
           bg-white/85 backdrop-blur-3xl lg:border-l border-white/50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)]
        `}>
          {/* PROGRESS BAR */}
          <div className="h-1 bg-slate-100 w-full shrink-0">
             <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
          </div>
          
          {/* CONTENT AREA - Mobile Wizard Style */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto bg-white/40 backdrop-blur-md rounded-3xl shadow-sm border border-white/50 p-6 md:p-8 min-h-[60vh] relative">
              
              {/* STEP 1: VITALS */}
              {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Vitals & Measurements</h3>
                    <p className="text-sm text-slate-500">Collected by receptionist or inputted manually.</p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Blood Pressure</label>
                      <div className="relative">
                        <input type="text" className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-slate-800 font-bold focus:border-teal-400 focus:bg-white/80 transition-all outline-none shadow-sm shadow-slate-100/50" placeholder="120/80" defaultValue="120/80" />
                        <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">mmHg</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Pulse Rate</label>
                      <div className="relative">
                        <input type="text" className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-slate-800 font-bold focus:border-teal-400 focus:bg-white/80 transition-all outline-none shadow-sm shadow-slate-100/50" placeholder="72" defaultValue="72" />
                        <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">bpm</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Temperature</label>
                      <div className="relative">
                        <input type="text" className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-slate-800 font-bold focus:border-teal-400 focus:bg-white/80 transition-all outline-none shadow-sm shadow-slate-100/50" placeholder="98.6" defaultValue="98.6" />
                        <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">°F</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Weight</label>
                      <div className="relative">
                        <input type="text" className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-slate-800 font-bold focus:border-teal-400 focus:bg-white/80 transition-all outline-none shadow-sm shadow-slate-100/50" placeholder="70" defaultValue="70" />
                        <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: CLINICAL NOTES & AI */}
              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Clinical Notes</h3>
                      <p className="text-sm text-slate-500">Record complaints and patient history.</p>
                    </div>
                    <button className="px-3 py-1.5 bg-indigo-500/10 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-500/20 hover:bg-indigo-500/20 flex items-center gap-1 shadow-sm transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      AI Assistant
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Chief Complaints</label>
                       <textarea rows={4} className="w-full bg-white/50 border border-white/60 rounded-2xl px-4 py-3 text-slate-800 focus:border-teal-400 focus:bg-white/80 transition-all outline-none resize-none shadow-sm shadow-slate-100/50" placeholder="E.g., Fever since 3 days, body ache..."></textarea>
                    </div>
                    
                    {/* AI CDSS Suggestions Block */}
                    <div className="bg-gradient-to-r from-indigo-500/10 to-blue-500/5 backdrop-blur-md p-5 rounded-2xl border border-indigo-500/20 shadow-[0_4px_20px_rgba(99,102,241,0.05)] animate-in fade-in zoom-in-95 duration-500">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="text-xs font-bold text-indigo-800 uppercase tracking-widest">AI Suggested Diagnosis</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="bg-white/80 backdrop-blur-sm border border-indigo-200/50 text-indigo-800 px-4 py-2 rounded-xl text-sm font-bold shadow-[0_4px_12px_rgba(99,102,241,0.1)] hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1.5">
                           Viral Pyrexia <span className="ml-1 flex items-center justify-center bg-indigo-100 text-indigo-700 w-5 h-5 rounded-md text-[10px]">+</span>
                        </button>
                        <button className="bg-white/80 backdrop-blur-sm border border-indigo-200/50 text-indigo-800 px-4 py-2 rounded-xl text-sm font-bold shadow-[0_4px_12px_rgba(99,102,241,0.1)] hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1.5">
                           Dengue Fever <span className="ml-1 flex items-center justify-center bg-indigo-100 text-indigo-700 w-5 h-5 rounded-md text-[10px]">+</span>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Diagnosis</label>
                       <input type="text" className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-slate-800 font-bold focus:border-teal-400 focus:bg-white/80 transition-all outline-none shadow-sm shadow-slate-100/50" placeholder="E.g., Viral Pyrexia" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: RX GRID */}
              {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Medication</h3>
                    <p className="text-sm text-slate-500">Search and add drugs to the prescription.</p>
                  </div>
                  
                  <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 flex flex-col md:flex-row gap-3 shadow-sm shadow-slate-100/50">
                     <div className="flex-1">
                       <input type="text" className="w-full bg-white/80 border border-white/80 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-teal-400 focus:bg-white transition-all outline-none" placeholder="Search Medicine (e.g. Paracetamol 500mg)" />
                     </div>
                     <div className="w-full md:w-28 lg:w-32">
                       <select className="w-full bg-white/80 border border-white/80 rounded-xl px-2 py-2.5 text-sm text-slate-800 focus:border-teal-400 focus:bg-white transition-all outline-none">
                         <option>1-0-1</option>
                         <option>1-1-1</option>
                         <option>1-0-0</option>
                       </select>
                     </div>
                     <div className="w-full md:w-28 lg:w-32">
                       <select className="w-full bg-white/80 border border-white/80 rounded-xl px-2 py-2.5 text-sm text-slate-800 focus:border-teal-400 focus:bg-white transition-all outline-none">
                         <option>5 Days</option>
                         <option>3 Days</option>
                         <option>SOS</option>
                       </select>
                     </div>
                     <button className="px-4 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 shrink-0 shadow-lg shadow-slate-800/20 transition-all">
                       Add
                     </button>
                  </div>

                  {/* Added Medications Mock */}
                  <div className="space-y-2 mt-4">
                     <div className="p-4 border border-white/60 rounded-xl flex items-center justify-between hover:border-teal-200 transition-colors bg-white/60 backdrop-blur-sm shadow-sm">
                        <div>
                          <div className="font-bold text-slate-800 text-sm">Tab. Paracetamol 500mg</div>
                          <div className="text-xs text-slate-500 mt-0.5">1-0-1 (After Food) • 5 Days</div>
                        </div>
                        <button className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50/50 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                     </div>
                  </div>
                </div>
              )}

              {/* STEP 4: LABS & ADVICE */}
              {step === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Investigations & Advice</h3>
                    <p className="text-sm text-slate-500">Order lab tests and provide lifestyle advice.</p>
                  </div>
                  
                  {/* AI Lab Suggestions */}
                  <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/5 backdrop-blur-md p-5 rounded-2xl border border-teal-500/20 shadow-[0_4px_20px_rgba(20,184,166,0.05)] mb-4 animate-in fade-in duration-500">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                      <span className="text-xs font-bold text-teal-800 uppercase tracking-widest">AI Recommended Tests</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="bg-white/80 backdrop-blur-sm border border-teal-200/50 text-teal-800 px-4 py-2 rounded-xl text-sm font-bold shadow-[0_4px_12px_rgba(20,184,166,0.1)] hover:bg-teal-600 hover:text-white transition-colors flex items-center gap-1.5">
                         CBC <span className="ml-1 flex items-center justify-center bg-teal-100 text-teal-700 w-5 h-5 rounded-md text-[10px]">+</span>
                      </button>
                      <button className="bg-white/80 backdrop-blur-sm border border-teal-200/50 text-teal-800 px-4 py-2 rounded-xl text-sm font-bold shadow-[0_4px_12px_rgba(20,184,166,0.1)] hover:bg-teal-600 hover:text-white transition-colors flex items-center gap-1.5">
                         Dengue NS1 <span className="ml-1 flex items-center justify-center bg-teal-100 text-teal-700 w-5 h-5 rounded-md text-[10px]">+</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Lab Tests (Pathology/Radiology)</label>
                       <input type="text" className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-slate-800 focus:border-teal-400 focus:bg-white/80 transition-all outline-none shadow-sm shadow-slate-100/50" placeholder="E.g., Complete Blood Count (CBC)" />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Diet & Lifestyle Advice</label>
                       <textarea rows={3} className="w-full bg-white/50 border border-white/60 rounded-2xl px-4 py-3 text-slate-800 focus:border-teal-400 focus:bg-white/80 transition-all outline-none resize-none shadow-sm shadow-slate-100/50" placeholder="Drink plenty of warm water..."></textarea>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* FOOTER WIZARD CONTROLS (Glass) */}
          <div className="bg-white/40 backdrop-blur-2xl border-t border-white/40 p-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-30">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button 
                onClick={handlePrev}
                disabled={step === 1}
                className={`px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${step === 1 ? 'text-slate-400 bg-white/30 border border-white/20 cursor-not-allowed' : 'text-slate-700 bg-white/80 border border-white/60 hover:bg-white'}`}
              >
                ← Back
              </button>
              
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(s => (
                   <div key={s} className={`w-2.5 h-2.5 rounded-full transition-colors shadow-inner ${step === s ? 'bg-teal-500 shadow-teal-500/50' : 'bg-white/50 border border-white/40'}`}></div>
                ))}
              </div>

              <button 
                onClick={step === totalSteps ? () => { if(onSave) onSave(patient); handleEndConsult(); } : handleNext}
                className="px-6 py-3 bg-teal-500/90 hover:bg-teal-500 backdrop-blur-md border border-teal-400/50 text-white rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(20,184,166,0.3)] transition-all flex items-center gap-2"
              >
                {step === totalSteps ? (
                  <>Save Rx <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></>
                ) : (
                  <>Next →</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// ----------------------------------------------------------------------------------
// Inline Video Grid Component
// ----------------------------------------------------------------------------------

function InlineVideoGrid({ patientName, patientHasVideo, isMini = false }: { patientName: string, patientHasVideo: boolean, isMini?: boolean }) {
  const localSessionId = useLocalSessionId();
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
  
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const callObject = DailyIframe.getCallInstance();

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
    <div className="absolute inset-0 w-full h-full bg-slate-900 flex flex-col z-10 overflow-hidden pointer-events-auto">
      {/* Remote Video (Full Size) */}
      {remoteParticipantIds.length > 0 ? (
        <InlineVideoPlayer id={remoteParticipantIds[0]} isLocal={false} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-black/40">
           <div className={`border-4 border-slate-700 border-t-slate-400 rounded-full animate-spin ${isMini ? 'w-6 h-6 mb-1' : 'w-12 h-12 mb-3'}`}></div>
           {!isMini && <p className="text-xs tracking-widest uppercase text-slate-400 animate-pulse">Waiting for Patient...</p>}
        </div>
      )}

      {/* Patient Name Overlay */}
      {!isMini && (
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold border border-white/10 flex items-center gap-2 shadow-lg z-30 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          {patientName}
        </div>
      )}

      {/* Local Video (PiP) */}
      {!isMini && camActive && localSessionId && (
        <div className="absolute bottom-24 lg:bottom-28 right-4 lg:right-6 w-24 h-36 lg:w-32 lg:h-48 bg-slate-800 rounded-2xl border border-white/20 overflow-hidden shadow-2xl z-20 pointer-events-auto">
          <InlineVideoPlayer id={localSessionId} isLocal={true} />
        </div>
      )}

      {/* Controls */}
      {!isMini && (
        <div className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-2xl border border-white/10 rounded-full px-4 lg:px-6 py-2.5 flex items-center justify-center gap-3 lg:gap-4 shadow-2xl z-30 pointer-events-auto">
        <button onClick={toggleMic} className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-colors ${micActive ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
          {micActive ? (
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          ) : (
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>
          )}
        </button>
        <button onClick={toggleCam} className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-colors ${camActive ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
          {camActive ? (
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          ) : (
             <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
          )}
        </button>
      </div>
      )}
    </div>
  );
}

function InlineVideoPlayer({ id, isLocal }: { id: string, isLocal: boolean }) {
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
        muted={isLocal} 
        playsInline 
        ref={videoElement} 
        className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`} 
      />
      {!isLocal && <audio autoPlay playsInline ref={audioElement} />}
    </>
  );
}
