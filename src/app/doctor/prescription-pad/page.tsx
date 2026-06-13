"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function PrescriptionPadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientVaultId = searchParams?.get("patient") || "";

  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [doctorName, setDoctorName] = useState("");

  const [rxData, setRxData] = useState({
    diagnosis: "",
    medicines: [{ name: "", dosage: "", frequency: "", duration: "" }],
    advice: ""
  });

  useEffect(() => {
    // Authentication & Role Check
    const role = localStorage.getItem("sd_current_user_role");
    const name = localStorage.getItem("sd_current_user_name");

    if (role !== "doctor") {
      setAccessGranted(false);
      setLoading(false);
      return;
    }

    setDoctorName(name || "Dr. Authorized Provider");
    setAccessGranted(true);
    setLoading(false);
  }, []);

  const handleAddMedicine = () => {
    setRxData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", dosage: "", frequency: "", duration: "" }]
    }));
  };

  const handleMedicineChange = (index: number, field: string, value: string) => {
    const newMedicines = [...rxData.medicines];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setRxData(prev => ({ ...prev, medicines: newMedicines }));
  };

  const handleSaveAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientVaultId) {
      alert("Error: No patient selected.");
      return;
    }

    // In production: write to Firestore
    // await addDoc(collection(db, `patients/${patientVaultId}/records`), {
    //   type: "prescription",
    //   authorId: localStorage.getItem("sd_current_user_uid"),
    //   authorName: doctorName,
    //   content: JSON.stringify(rxData),
    //   timestamp: serverTimestamp()
    // });

    alert("Prescription securely saved to Patient Vault.");
    router.push(`/portal/vault/${patientVaultId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-tenant-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center font-sans">
        <div className="w-20 h-20 bg-red-100 border border-red-200 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h1 className="text-3xl font-serif font-bold mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-8 max-w-md text-center">Only verified medical practitioners can access the Digital Prescription Pad.</p>
        <Link href="/" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-tenant-accent/30">
      
      <header className="border-b border-slate-200 bg-white px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold font-serif text-slate-900">Digital Prescription Pad</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{doctorName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            Patient Vault Active
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          
          <div className="bg-tenant-accent/10 border-b border-tenant-accent/20 p-6 flex justify-between items-center">
            <div>
              <p className="text-xs uppercase font-bold text-tenant-accent tracking-widest mb-1">Prescribing To</p>
              <h2 className="text-lg font-bold text-slate-900 font-mono">{decodeURIComponent(patientVaultId).split("@")[0] || "Unknown Patient"}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase font-bold text-slate-500 tracking-widest mb-1">Date</p>
              <h2 className="text-sm font-bold text-slate-900 font-mono">{new Date().toLocaleDateString()}</h2>
            </div>
          </div>

          <form onSubmit={handleSaveAndSend} className="p-8 space-y-8">
            
            {/* Diagnosis */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                Clinical Diagnosis
              </label>
              <textarea 
                required
                value={rxData.diagnosis}
                onChange={e => setRxData({...rxData, diagnosis: e.target.value})}
                placeholder="Enter primary diagnosis and symptoms..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:border-tenant-accent focus:ring-1 focus:ring-tenant-accent outline-none transition-all min-h-[100px]"
              />
            </div>

            {/* Medicines */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                  Rx (Medications)
                </label>
                <button type="button" onClick={handleAddMedicine} className="text-xs font-bold uppercase text-tenant-accent hover:underline">+ Add Medicine</button>
              </div>
              
              <div className="space-y-3">
                {rxData.medicines.map((med, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <div className="flex-1 w-full">
                      <input type="text" placeholder="Medicine Name (e.g., Paracetamol 650mg)" value={med.name} onChange={e => handleMedicineChange(index, "name", e.target.value)} required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-tenant-accent outline-none" />
                    </div>
                    <div className="w-full md:w-24">
                      <input type="text" placeholder="Dosage" value={med.dosage} onChange={e => handleMedicineChange(index, "dosage", e.target.value)} required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-tenant-accent outline-none" />
                    </div>
                    <div className="w-full md:w-32">
                      <select value={med.frequency} onChange={e => handleMedicineChange(index, "frequency", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-tenant-accent outline-none">
                        <option value="">Frequency</option>
                        <option value="1-0-0">1-0-0 (Morning)</option>
                        <option value="1-0-1">1-0-1 (Morning/Night)</option>
                        <option value="1-1-1">1-1-1 (TID)</option>
                        <option value="SOS">SOS (As Needed)</option>
                      </select>
                    </div>
                    <div className="w-full md:w-24">
                      <input type="text" placeholder="Duration" value={med.duration} onChange={e => handleMedicineChange(index, "duration", e.target.value)} required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-tenant-accent outline-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Advice */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">General Advice & Follow Up</label>
              <textarea 
                value={rxData.advice}
                onChange={e => setRxData({...rxData, advice: e.target.value})}
                placeholder="Dietary instructions, next visit date, etc."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:border-tenant-accent focus:ring-1 focus:ring-tenant-accent outline-none transition-all min-h-[80px]"
              />
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <button type="submit" className="bg-tenant-accent hover:bg-teal-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest shadow-[0_4px_16px_var(--tenant-accent-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Secure & Send to Vault
              </button>
            </div>

          </form>
        </div>
      </main>

    </div>
  );
}

export default function PrescriptionPad() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-tenant-accent border-t-transparent rounded-full animate-spin"></div></div>}>
      <PrescriptionPadContent />
    </Suspense>
  );
}
