"use client";

import React, { useState } from 'react';

interface DigitalRxPadProps {
  patient: any;
  onClose: () => void;
}

export default function DigitalRxPad({ patient, onClose }: DigitalRxPadProps) {
  const [step, setStep] = useState(1);
  const [isPiPExpanded, setIsPiPExpanded] = useState(true);
  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };
  
  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">{patient.name}</h2>
            <div className="text-xs text-slate-500 font-medium">{patient.age}y • {patient.sex} {patient.phone && `• ${patient.phone}`}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${patient.type === 'online' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
             {patient.mode}
           </span>
           <button className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-teal-200 hover:bg-teal-700">
             End Consult
           </button>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="h-1 bg-slate-100 w-full">
         <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
      </div>

      {/* CONTENT AREA - Mobile Wizard Style */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[60vh]">
          
          {/* STEP 1: VITALS */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Vitals & Measurements</h3>
                <p className="text-sm text-slate-500">Collected by receptionist or inputted manually.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Blood Pressure</label>
                  <div className="relative">
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-teal-500 outline-none" placeholder="120/80" defaultValue="120/80" />
                    <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">mmHg</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Pulse Rate</label>
                  <div className="relative">
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-teal-500 outline-none" placeholder="72" defaultValue="72" />
                    <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">bpm</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Temperature</label>
                  <div className="relative">
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-teal-500 outline-none" placeholder="98.6" defaultValue="98.6" />
                    <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">°F</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Weight</label>
                  <div className="relative">
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-teal-500 outline-none" placeholder="70" defaultValue="70" />
                    <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CLINICAL NOTES & AI */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Clinical Notes</h3>
                  <p className="text-sm text-slate-500">Record complaints and patient history.</p>
                </div>
                <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Ask AI Co-Pilot
                </button>
              </div>
              <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Chief Complaints</label>
                   <textarea rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none resize-none" placeholder="E.g., Fever since 3 days, body ache..."></textarea>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Diagnosis</label>
                   <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-teal-500 outline-none" placeholder="E.g., Viral Pyrexia" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RX GRID */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Medication</h3>
                <p className="text-sm text-slate-500">Search and add drugs to the prescription.</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3">
                 <div className="flex-1">
                   <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:border-teal-500 outline-none" placeholder="Search Medicine (e.g. Paracetamol 500mg)" />
                 </div>
                 <div className="w-full md:w-32">
                   <select className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-sm text-slate-900 focus:border-teal-500 outline-none">
                     <option>1-0-1</option>
                     <option>1-1-1</option>
                     <option>1-0-0</option>
                   </select>
                 </div>
                 <div className="w-full md:w-32">
                   <select className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-sm text-slate-900 focus:border-teal-500 outline-none">
                     <option>5 Days</option>
                     <option>3 Days</option>
                     <option>SOS</option>
                   </select>
                 </div>
                 <button className="px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 shrink-0">
                   Add
                 </button>
              </div>

              {/* Added Medications Mock */}
              <div className="space-y-2 mt-4">
                 <div className="p-3 border border-slate-100 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Tab. Paracetamol 500mg</div>
                      <div className="text-xs text-slate-500">1-0-1 (After Food) • 5 Days</div>
                    </div>
                    <button className="text-slate-300 hover:text-red-500">
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
                <h3 className="text-xl font-bold text-slate-900">Investigations & Advice</h3>
                <p className="text-sm text-slate-500">Order lab tests and provide lifestyle advice.</p>
              </div>
              <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Lab Tests (Pathology/Radiology)</label>
                   <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="E.g., Complete Blood Count (CBC)" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Diet & Lifestyle Advice</label>
                   <textarea rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none resize-none" placeholder="Drink plenty of warm water..."></textarea>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* FOOTER WIZARD CONTROLS */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={handlePrev}
            disabled={step === 1}
            className={`px-5 py-3 rounded-xl font-bold text-sm transition-colors ${step === 1 ? 'text-slate-300 bg-slate-50 cursor-not-allowed' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}
          >
            ← Back
          </button>
          
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(s => (
               <div key={s} className={`w-2 h-2 rounded-full ${step === s ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
            ))}
          </div>

          <button 
            onClick={step === totalSteps ? onClose : handleNext}
            className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm shadow-sm shadow-teal-200 hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            {step === totalSteps ? (
              <>Save Rx <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></>
            ) : (
              <>Next →</>
            )}
          </button>
        </div>
      </div>

      {/* Telemedicine Video Shell (Picture-in-Picture) */}
      {patient.type === 'online' && (
        <div className={`fixed z-[60] transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 ${isPiPExpanded ? 'bottom-20 right-4 md:right-8 w-64 h-80' : 'bottom-20 right-4 md:right-8 w-24 h-24 rounded-full border-2 border-teal-500'}`}>
          {isPiPExpanded ? (
            <div className="relative w-full h-full flex flex-col">
              {/* Fake Video Stream (Patient) */}
              <div className="flex-1 bg-slate-800 relative flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
                <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-500 text-3xl">
                  {patient.name.charAt(0)}
                </div>
                <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded font-bold backdrop-blur-sm">
                  {patient.name}
                </div>
                <button onClick={() => setIsPiPExpanded(false)} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors backdrop-blur-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
              </div>
              
              {/* Fake Video Stream (Doctor/Self) - Smaller overlay */}
              <div className="absolute bottom-16 right-2 w-16 h-24 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-lg flex items-center justify-center text-[10px] text-slate-500 font-bold">
                You
              </div>
              
              {/* Controls */}
              <div className="h-14 bg-slate-900 flex items-center justify-center gap-3 shrink-0">
                <button className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                </button>
                <button className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"></path></svg>
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsPiPExpanded(true)} className="w-full h-full flex items-center justify-center bg-slate-800 text-teal-400 relative group overflow-hidden">
              <div className="absolute inset-0 bg-teal-500/20 group-hover:bg-teal-500/40 transition-colors"></div>
              <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
