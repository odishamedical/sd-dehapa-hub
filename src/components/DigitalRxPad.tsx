"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DigitalRxPadProps {
  patient: any;
  provider?: any;
  onClose: () => void;
  onSave?: (patient: any, pdfBlob?: Blob) => void;
}

export default function DigitalRxPad({ patient, provider, onClose, onSave }: DigitalRxPadProps) {
  const [mounted, setMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  
  // Clinical States
  const [vitals, setVitals] = useState({ bp: '120/80', pulse: '72', temp: '98.6', weight: '70' });
  const [complaints, setComplaints] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState([{ name: 'Tab. Paracetamol 500mg', dosage: '1-0-1', duration: '5 Days' }]);
  const [labs, setLabs] = useState('');
  const [advice, setAdvice] = useState('');

  const pdfRef = useRef<HTMLDivElement>(null);

  const handleAIAssistant = async () => {
    if (!complaints.trim()) return alert("Please enter Chief Complaints first.");
    setIsAILoading(true);
    try {
      const res = await fetch('/api/cdss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientDetails: patient, chiefComplaints: complaints })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.suggestedDiagnosis) setDiagnosis(data.suggestedDiagnosis);
        if (data.suggestedLabs && Array.isArray(data.suggestedLabs)) setLabs(data.suggestedLabs.join(', '));
        if (data.suggestedMedicines && Array.isArray(data.suggestedMedicines)) setMedications(data.suggestedMedicines);
      } else {
        alert(data.error || "AI failed to generate suggestions.");
      }
    } catch (e) {
      console.error("AI Error:", e);
      alert("Could not connect to AI Assistant.");
    } finally {
      setIsAILoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleEndConsult = async () => {
    if (patient?.id) {
       try {
         await updateDoc(doc(db, "appointments", patient.id), { status: 'Completed' });
       } catch (e) {}
    }
    onClose();
  };

  const generatePDF = async () => {
    if (!pdfRef.current) return null;
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const blob = pdf.output('blob');
      return blob;
    } catch (e) {
      console.error("PDF generation failed:", e);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    const blob = await generatePDF();
    if (onSave) {
      await onSave({
         ...patient,
         clinicalData: { vitals, complaints, diagnosis, medications, labs, advice }
      }, blob || undefined);
    }
    handleEndConsult();
  };

  if (!patient || !mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-30 shrink-0 relative">
        <div className="flex items-center gap-4">
          <button onClick={handleEndConsult} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h2 className="font-bold text-slate-900 text-xl">{patient.name}</h2>
            <div className="text-sm text-slate-500 font-medium">{patient.age}y • {patient.sex} {patient.phone && `• ${patient.phone}`}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <span className="px-3 py-1 text-xs uppercase font-bold rounded-full border bg-slate-100 text-slate-600 border-slate-200">
             {patient.mode || 'Walk-in'}
           </span>
           <button onClick={handleEndConsult} className="px-5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-sm font-bold transition-all border border-rose-200">
             Close Rx Pad
           </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA - Centered Wizard */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8 pb-32">
          
          {/* STEP 1: VITALS */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Vitals & Measurements</h3>
                <p className="text-slate-500">Collected by receptionist or inputted manually.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Blood Pressure</label>
                  <div className="relative">
                    <input type="text" value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-teal-500 focus:bg-white transition-all outline-none" />
                    <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">mmHg</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Pulse Rate</label>
                  <div className="relative">
                    <input type="text" value={vitals.pulse} onChange={e => setVitals({...vitals, pulse: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-teal-500 focus:bg-white transition-all outline-none" />
                    <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">bpm</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Temperature</label>
                  <div className="relative">
                    <input type="text" value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-teal-500 focus:bg-white transition-all outline-none" />
                    <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">°F</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Weight</label>
                  <div className="relative">
                    <input type="text" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-teal-500 focus:bg-white transition-all outline-none" />
                    <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">kg</span>
                  </div>
                </div>
              </div>
            </div>

          {/* STEP 2: CLINICAL NOTES & AI */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Clinical Notes</h3>
                  <p className="text-slate-500">Record complaints and patient history.</p>
                </div>
                <button 
                  onClick={handleAIAssistant} 
                  disabled={isAILoading}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-xl border border-indigo-100 hover:bg-indigo-100 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isAILoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      AI Assistant
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-6">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Chief Complaints</label>
                   <textarea value={complaints} onChange={e => setComplaints(e.target.value)} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-teal-500 focus:bg-white transition-all outline-none resize-none" placeholder="E.g., Fever since 3 days, body ache..."></textarea>
                </div>
                
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Diagnosis</label>
                   <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 font-bold focus:border-teal-500 focus:bg-white transition-all outline-none" placeholder="E.g., Viral Pyrexia" />
                </div>
              </div>
            </div>

          {/* STEP 3: RX GRID */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Medication</h3>
                <p className="text-slate-500">Search and add drugs to the prescription.</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4">
                 <div className="flex-1">
                   <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 transition-all outline-none" placeholder="Search Medicine (e.g. Paracetamol 500mg)" />
                 </div>
                 <div className="w-full md:w-32">
                   <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 transition-all outline-none">
                     <option>1-0-1</option>
                     <option>1-1-1</option>
                     <option>1-0-0</option>
                   </select>
                 </div>
                 <div className="w-full md:w-32">
                   <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 transition-all outline-none">
                     <option>5 Days</option>
                     <option>3 Days</option>
                     <option>SOS</option>
                   </select>
                 </div>
                 <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
                   Add
                 </button>
              </div>

              {/* Added Medications Mock */}
              <div className="space-y-3 mt-6">
                 {medications.map((med, idx) => (
                   <div key={idx} className="p-5 border border-slate-200 rounded-xl flex items-center justify-between bg-white hover:border-teal-300 transition-colors shadow-sm">
                      <div>
                        <div className="font-bold text-slate-900 text-lg">{med.name}</div>
                        <div className="text-sm text-slate-500 mt-1">{med.dosage} (After Food) • {med.duration}</div>
                      </div>
                      <button className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                   </div>
                 ))}
              </div>
            </div>

          {/* STEP 4: LABS & ADVICE */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Investigations & Advice</h3>
                <p className="text-slate-500">Order lab tests and provide lifestyle advice.</p>
              </div>
              
              <div className="space-y-6">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Lab Tests (Pathology/Radiology)</label>
                   <input type="text" value={labs} onChange={e => setLabs(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:border-teal-500 transition-all outline-none" placeholder="E.g., Complete Blood Count (CBC)" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Diet & Lifestyle Advice</label>
                   <textarea value={advice} onChange={e => setAdvice(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-teal-500 transition-all outline-none resize-none" placeholder="Drink plenty of warm water..."></textarea>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* FLOATING SAVE BUTTON */}
      <div className="absolute bottom-8 right-8 z-50 pointer-events-auto">
        <button 
          onClick={handleSave}
          disabled={isGenerating}
          className="px-8 py-5 bg-teal-600 hover:bg-teal-500 text-white rounded-full font-black text-base shadow-[0_10px_30px_rgba(13,148,136,0.3)] transition-all flex items-center gap-3 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
        >
          {isGenerating ? "GENERATING PDF..." : "SAVE & GENERATE Rx"}
          {!isGenerating && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
        </button>
      </div>

      {/* HIDDEN PDF LAYOUT */}
      <div className="absolute top-[-9999px] left-[-9999px]">
         <div ref={pdfRef} className="w-[800px] bg-white p-12 font-sans text-slate-900 relative">
            <div className="flex justify-between items-start border-b-2 border-teal-600 pb-6 mb-8">
               <div>
                  <h1 className="text-4xl font-black text-teal-800 tracking-tight">{provider?.name || "Dehapa Clinic"}</h1>
                  <p className="text-lg font-medium text-slate-600 mt-2">{provider?.primarySpecialty || "General Medicine"}</p>
                  <p className="text-sm text-slate-500 mt-1">{provider?.address || "Bhubaneswar, Odisha"}</p>
               </div>
               <div className="text-right">
                  <p className="text-xl font-bold">{new Date().toLocaleDateString()}</p>
                  <p className="text-sm text-slate-500 mt-1">Reg No: {provider?.registrationNumber || "MED12345"}</p>
               </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
               <div>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Patient Name</p>
                 <p className="text-lg font-bold">{patient.name}</p>
               </div>
               <div>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Age / Sex</p>
                 <p className="text-lg font-bold">{patient.age}y / {patient.sex}</p>
               </div>
               <div>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Vitals</p>
                 <p className="text-sm font-bold">BP: {vitals.bp} | HR: {vitals.pulse}</p>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-12 min-h-[500px]">
               {/* Left Sidebar (Notes & Labs) */}
               <div className="col-span-1 border-r border-slate-200 pr-8">
                  <div className="mb-8">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Complaints</h4>
                    <p className="text-sm whitespace-pre-wrap">{complaints || "N/A"}</p>
                  </div>
                  <div className="mb-8">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Diagnosis</h4>
                    <p className="text-sm font-bold">{diagnosis || "N/A"}</p>
                  </div>
                  <div className="mb-8">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Lab Tests</h4>
                    <p className="text-sm">{labs || "None"}</p>
                  </div>
               </div>

               {/* Right Main Area (Rx) */}
               <div className="col-span-2">
                  <h2 className="text-4xl font-serif italic font-bold text-slate-300 mb-6">Rx</h2>
                  <div className="space-y-6">
                    {medications.map((med, i) => (
                      <div key={i}>
                        <p className="text-lg font-bold text-slate-900">{i+1}. {med.name}</p>
                        <p className="text-sm text-slate-600 mt-1">{med.dosage} — {med.duration}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-16 pt-8 border-t border-slate-200">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3">Advice</h4>
                    <p className="text-sm whitespace-pre-wrap">{advice || "Take medications as prescribed."}</p>
                  </div>
               </div>
            </div>

            <div className="mt-20 flex justify-between items-end">
               <p className="text-xs text-slate-400 font-bold tracking-widest">Powered by Dehapa Health</p>
               <div className="text-center">
                  <div className="w-48 border-b-2 border-slate-800 mb-2"></div>
                  <p className="text-sm font-bold">{provider?.name || "Doctor's Signature"}</p>
               </div>
            </div>
         </div>
      </div>

    </div>
  );

  return createPortal(content, document.body);
}
