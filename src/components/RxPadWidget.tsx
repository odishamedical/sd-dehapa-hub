"use client";

import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PrescriptionTemplate from '@/components/PrescriptionTemplate';

interface RxPadProps {
  doctorData: {
    id: string;
    name: string;
    speciality: string;
    degrees: string;
    registrationNo: string;
    phone: string;
    address: string;
  };
}

export default function RxPadWidget({ doctorData }: RxPadProps) {
  const [patientMode, setPatientMode] = useState<'guest' | 'registered'>('guest');
  
  // Form State
  const [patientInfo, setPatientInfo] = useState({ name: '', age: '', gender: 'Male', phone: '', id: '' });
  const [clinical, setClinical] = useState({ chiefComplaint: '', clinicalFindings: '', diagnosis: '', icdCode: '', history: '' });
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '', route: 'Oral', instructions: '', substitutionAllowed: true }]);
  const [tests, setTests] = useState([{ name: '', type: 'Lab', priority: 'Routine', notes: '' }]);
  const [advice, setAdvice] = useState('');
  
  const [connectedPatients, setConnectedPatients] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedRx, setGeneratedRx] = useState<any>(null);

  // Fetch connected patients for dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const q1 = query(collection(db, "connections"), where("initiatorId", "==", doctorData.id), where("receiverRole", "==", "patient"), where("status", "==", "approved"));
        const q2 = query(collection(db, "connections"), where("receiverId", "==", doctorData.id), where("initiatorRole", "==", "patient"), where("status", "==", "approved"));
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const pats = [...snap1.docs, ...snap2.docs].map(d => {
          const data = d.data();
          return data.initiatorId === doctorData.id ? 
            { id: data.receiverId, name: data.receiverName } : 
            { id: data.initiatorId, name: data.initiatorName };
        });
        setConnectedPatients(pats);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      }
    };
    fetchPatients();
  }, [doctorData.id]);

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', route: 'Oral', instructions: '', substitutionAllowed: true }]);
  const updateMedicine = (index: number, field: string, value: any) => {
    const newMeds = [...medicines];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setMedicines(newMeds);
  };
  const removeMedicine = (index: number) => setMedicines(medicines.filter((_, i) => i !== index));

  const addTest = () => setTests([...tests, { name: '', type: 'Lab', priority: 'Routine', notes: '' }]);
  const updateTest = (index: number, field: string, value: any) => {
    const newTests = [...tests];
    newTests[index] = { ...newTests[index], [field]: value };
    setTests(newTests);
  };
  const removeTest = (index: number) => setTests(tests.filter((_, i) => i !== index));

  const [draftSaved, setDraftSaved] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem('rxpad_draft');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPatientInfo(data.patientInfo || patientInfo);
        setClinical(data.clinical || clinical);
        setMedicines(data.medicines || medicines);
        setTests(data.tests || tests);
        setPatientMode(data.patientMode || 'guest');
      } catch(e){}
    }
  }, []);

  const saveDraft = () => {
    localStorage.setItem('rxpad_draft', JSON.stringify({ patientInfo, clinical, medicines, tests, patientMode }));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleGenerate = async () => {
    if (!patientInfo.name) return alert("Patient name is required");
    setGenerating(true);

    const rxDoc = {
      doctorId: doctorData.id,
      doctorName: doctorData.name,
      registrationNo: doctorData.registrationNo,
      patientMode,
      patientInfo,
      clinical,
      medicines: medicines.filter(m => m.name.trim() !== ''),
      tests: tests.filter(t => t.name.trim() !== ''),
      advice,
      createdAt: serverTimestamp(),
      dateString: new Date().toLocaleDateString('en-IN')
    };

    try {
      const docRef = await addDoc(collection(db, "prescriptions"), rxDoc);
      setGeneratedRx({ ...rxDoc, id: docRef.id });
      // In a real app we'd auto-trigger the print window after slight delay
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (err) {
      console.error(err);
      alert("Failed to save prescription");
    } finally {
      setGenerating(false);
    }
  };

  if (generatedRx) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-[24px] p-6 md:p-8 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-xl font-bold text-emerald-800">Prescription Generated!</h3>
            <p className="text-emerald-600 mt-1">Successfully saved to database {patientMode === 'registered' && "and sent to patient's vault"}.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Print Rx
            </button>
            <button onClick={() => setGeneratedRx(null)} className="bg-white border border-emerald-200 text-emerald-700 font-bold py-3 px-6 rounded-xl hover:bg-emerald-100 transition-colors">
              New Prescription
            </button>
          </div>
        </div>

        {/* Hidden Print Template */}
        <div className="hidden print:block">
           <PrescriptionTemplate doctorData={doctorData} rxData={generatedRx} date={generatedRx.dateString} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] relative">
      
      {/* Header */}
      <div className="bg-slate-900 p-6 md:p-8 flex items-center justify-between text-white rounded-t-[32px]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center border border-teal-500/30">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-black">Digital Rx Pad</h2>
            <p className="text-slate-400 text-sm">Lightning fast prescription entry</p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 bg-slate-50">

        {/* 1. PATIENT SELECTION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">1</span>
              Patient Details
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setPatientMode('guest')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${patientMode === 'guest' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Guest (Walk-in)
              </button>
              <button 
                onClick={() => setPatientMode('registered')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${patientMode === 'registered' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Network Vault
              </button>
            </div>
          </div>

          {patientMode === 'registered' ? (
            <div className="mb-4 relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Search Connected Patients</label>
              <input 
                type="text"
                placeholder="Type patient name to search..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium mb-2"
                onChange={(e) => {
                  const val = e.target.value.toLowerCase();
                  // simple search filter for UI demonstration
                  const p = connectedPatients.find(x => x.name.toLowerCase().includes(val));
                  if (p) setPatientInfo({ ...patientInfo, id: p.id, name: p.name });
                }}
              />
              <div className="text-xs text-slate-500 font-medium">Selected: <strong className="text-slate-800">{patientInfo.name || 'None'}</strong></div>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name *</label>
                  <input type="text" value={patientInfo.name} onChange={e => setPatientInfo({...patientInfo, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" placeholder="e.g. Amaar Halchal" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Age</label>
                  <input type="text" value={patientInfo.age} onChange={e => setPatientInfo({...patientInfo, age: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" placeholder="e.g. 34" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gender</label>
                  <select value={patientInfo.gender} onChange={e => setPatientInfo({...patientInfo, gender: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:border-teal-500 outline-none">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
             </div>
          )}
        </div>

        {/* 2. CLINICAL DETAILS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">2</span>
            Clinical Details
          </h3>
          <div className="space-y-4">
             <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Chief Complaint & History</label>
                <textarea value={clinical.history} onChange={e => setClinical({...clinical, history: e.target.value})} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:border-teal-500 outline-none resize-none" placeholder="Patient reports fever and cough for 3 days..."></textarea>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Provisional Diagnosis</label>
                  <input type="text" value={clinical.diagnosis} onChange={e => setClinical({...clinical, diagnosis: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:border-teal-500 outline-none" placeholder="e.g. Viral URI" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex justify-between">
                    <span>ICD-10 Code</span>
                    <span className="text-teal-600 font-normal lowercase bg-teal-50 px-1 rounded">optional</span>
                  </label>
                  <input type="text" value={clinical.icdCode} onChange={e => setClinical({...clinical, icdCode: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:border-teal-500 outline-none" placeholder="e.g. J06.9" />
                </div>
             </div>
          </div>
        </div>

        {/* 3. MEDICINES */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">3</span>
              Medicines
            </h3>
            <button onClick={addMedicine} className="text-xs font-bold bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600 px-3 py-1.5 rounded-lg transition-colors">
              + Add Medicine
            </button>
          </div>
          
          <div className="space-y-3">
            {medicines.map((med, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-slate-50 p-3 rounded-xl border border-slate-100 relative group">
                <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="col-span-2 md:col-span-2 relative">
                    <input type="text" value={med.name} onChange={e => updateMedicine(idx, 'name', e.target.value)} placeholder="Medicine Name (e.g. Paracetamol 500mg)" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" />
                  </div>
                  <div className="col-span-1">
                    <input type="text" value={med.dosage} onChange={e => updateMedicine(idx, 'dosage', e.target.value)} placeholder="Dose (1 tab)" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-teal-500" />
                  </div>
                  <div className="col-span-1">
                    <input type="text" value={med.frequency} onChange={e => updateMedicine(idx, 'frequency', e.target.value)} placeholder="Freq (1-0-1)" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-teal-500" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <input type="text" value={med.duration} onChange={e => updateMedicine(idx, 'duration', e.target.value)} placeholder="Days (5 days)" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-teal-500" />
                  </div>
                </div>
                <button onClick={() => removeMedicine(idx)} className="md:opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 transition-all absolute md:relative right-2 top-2 md:right-auto md:top-auto bg-white md:bg-transparent rounded-lg shadow-sm md:shadow-none border border-slate-200 md:border-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. INVESTIGATIONS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">4</span>
              Investigations / Lab Tests
            </h3>
            <button onClick={addTest} className="text-xs font-bold bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600 px-3 py-1.5 rounded-lg transition-colors">
              + Add Test
            </button>
          </div>
          <div className="space-y-2">
            {tests.map((test, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="text" value={test.name} onChange={e => updateTest(idx, 'name', e.target.value)} placeholder="e.g. CBC, Lipid Profile" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" />
                <button onClick={() => removeTest(idx)} className="p-2 text-slate-400 hover:text-rose-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sticky Footer Actions */}
      <div className="sticky bottom-4 z-50 bg-white/95 backdrop-blur-xl border border-slate-200 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[24px] mx-4 mb-4">
         <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            End-to-End Encrypted
         </div>
         <div className="flex gap-3 w-full md:w-auto">
           <button 
             onClick={saveDraft}
             className="w-full md:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 md:py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
           >
             {draftSaved ? "✓ Saved" : "Save Draft"}
           </button>
           <button 
             onClick={handleGenerate}
             disabled={generating}
             className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 md:py-4 px-10 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
           >
             {generating ? (
               <span className="animate-pulse">Generating...</span>
             ) : (
               <>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                 {patientMode === 'registered' ? "Send to Vault" : "Generate & Print Rx"}
               </>
             )}
           </button>
         </div>
      </div>
    </div>
  );
}
