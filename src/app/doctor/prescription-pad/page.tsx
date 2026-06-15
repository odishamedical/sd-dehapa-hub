"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Predefined favorite medicines (In reality, fetched from Doctor's personal settings)
const FAVORITE_MEDICINES = [
  "Paracetamol 650mg (Fever)",
  "Azithromycin 500mg (Antibiotic)",
  "Pantoprazole 40mg (Antacid)",
  "Amlodipine 5mg (Blood Pressure)",
  "Metformin 500mg (Diabetes)",
  "Cetirizine 10mg (Allergy)"
];

export const dynamic = 'force-dynamic';

function PrescriptionPadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientVaultId = searchParams?.get("patient") || "";

  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [allMedicinesList, setAllMedicinesList] = useState<string[]>(FAVORITE_MEDICINES);

  const [rxData, setRxData] = useState({
    history: "",
    diagnosis: "",
    medicines: [{ name: "", dosage: "", frequency: "", duration: "" }],
    tests: [{ name: "", instructions: "" }],
    advice: "",
    routing: {
      pharmacyId: "",
      labId: ""
    }
  });

  // Mock Data for Proactive Routing
  const myRosteredPharmacies = [
    { id: "pharm_1", name: "Apollo In-house Pharmacy" },
    { id: "pharm_2", name: "LifeCare Meds (Partner)" }
  ];
  
  const myRosteredLabs = [
    { id: "lab_1", name: "Apollo Diagnostics" },
    { id: "lab_2", name: "Dr. Lal PathLabs (Partner)" }
  ];

  useEffect(() => {
    // Authentication & Role Check
    const role = localStorage.getItem("sd_current_user_role");
    const name = localStorage.getItem("sd_current_user_name");

    if (role !== "doctor" && role !== "super_admin") {
      setAccessGranted(false);
      setLoading(false);
      return;
    }

    setDoctorName(name || "Dr. Authorized Provider");

    // Load custom learned medicines from local storage
    const savedMeds = localStorage.getItem("sd_custom_medicines");
    if (savedMeds) {
      try {
        const parsedMeds = JSON.parse(savedMeds);
        setAllMedicinesList([...FAVORITE_MEDICINES, ...parsedMeds]);
      } catch (e) {}
    }

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

  const handleAddTest = () => {
    setRxData(prev => ({
      ...prev,
      tests: [...prev.tests, { name: "", instructions: "" }]
    }));
  };

  const handleTestChange = (index: number, field: string, value: string) => {
    const newTests = [...rxData.tests];
    newTests[index] = { ...newTests[index], [field]: value };
    setRxData(prev => ({ ...prev, tests: newTests }));
  };

  const handleSaveAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientVaultId) {
      alert("Error: No patient selected.");
      return;
    }

    // Self-Learning Medicine Feature
    const currentMeds = localStorage.getItem("sd_custom_medicines");
    let customMedsArray = currentMeds ? JSON.parse(currentMeds) : [];
    
    rxData.medicines.forEach(m => {
      const medString = m.name.trim();
      if (medString && !allMedicinesList.includes(medString)) {
        customMedsArray.push(medString);
      }
    });

    if (customMedsArray.length > 0) {
      // Remove duplicates
      customMedsArray = Array.from(new Set(customMedsArray));
      localStorage.setItem("sd_custom_medicines", JSON.stringify(customMedsArray));
      setAllMedicinesList([...FAVORITE_MEDICINES, ...customMedsArray]);
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
      
      <header className="border-b border-slate-200 bg-white px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-50 print:hidden">
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

      <main className="max-w-4xl mx-auto px-6 py-12 print:hidden">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          
          <div className="sticky top-[73px] z-40 bg-slate-50/95 backdrop-blur-md border-b border-tenant-accent/20 p-6 flex justify-between items-center shadow-sm">
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
            
            {/* Patient History */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Patient Medical History
              </label>
              <textarea 
                value={rxData.history}
                onChange={e => setRxData({...rxData, history: e.target.value})}
                placeholder="First time visit? Enter past medical history, allergies, surgeries, etc. (Optional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:border-tenant-accent focus:ring-1 focus:ring-tenant-accent outline-none transition-all min-h-[80px]"
              />
            </div>

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
                placeholder="Enter primary diagnosis and current symptoms..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:border-tenant-accent focus:ring-1 focus:ring-tenant-accent outline-none transition-all min-h-[100px]"
              />
            </div>

            {/* Medicines */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-tenant-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    Rx (Medications)
                  </label>
                  <button type="button" onClick={handleAddMedicine} className="text-xs font-bold uppercase text-white bg-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">+ Add</button>
                </div>
                
                {/* Proactive Routing: Pharmacy */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 uppercase">Send to Pharmacy:</span>
                  <select 
                    value={rxData.routing.pharmacyId}
                    onChange={e => setRxData(prev => ({...prev, routing: {...prev.routing, pharmacyId: e.target.value}}))}
                    className="bg-white border border-teal-200 text-teal-800 text-sm font-bold rounded-lg px-3 py-1.5 focus:border-tenant-accent outline-none cursor-pointer"
                  >
                    <option value="">Do Not Send (Give to Patient)</option>
                    {myRosteredPharmacies.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-3">
                {rxData.medicines.map((med, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex-1 w-full relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <span className="text-xs font-bold text-slate-300">{index + 1}.</span>
                      </div>
                      {/* Datalist for Predefined & Learned Medicines */}
                      <datalist id="favorite-medicines">
                        {allMedicinesList.map((m, i) => <option key={i} value={m} />)}
                      </datalist>
                      <input list="favorite-medicines" type="text" placeholder="Medicine Name (e.g., Paracetamol 650mg)" value={med.name} onChange={e => handleMedicineChange(index, "name", e.target.value)} required className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:border-tenant-accent outline-none" />
                    </div>
                    <div className="w-full md:w-24">
                      <input type="text" placeholder="Dosage" value={med.dosage} onChange={e => handleMedicineChange(index, "dosage", e.target.value)} required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-tenant-accent outline-none" />
                    </div>
                    <div className="w-full md:w-32">
                      <select value={med.frequency} onChange={e => handleMedicineChange(index, "frequency", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-tenant-accent outline-none">
                        <option value="">Frequency</option>
                        <option value="1-0-0">1-0-0 (Morning)</option>
                        <option value="1-0-1">1-0-1 (Morn/Night)</option>
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

            {/* Lab Tests */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    Lab Tests & Investigations
                  </label>
                  <button type="button" onClick={handleAddTest} className="text-xs font-bold uppercase text-white bg-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">+ Add</button>
                </div>
                
                {/* Proactive Routing: Lab */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 uppercase">Send to Lab:</span>
                  <select 
                    value={rxData.routing.labId}
                    onChange={e => setRxData(prev => ({...prev, routing: {...prev.routing, labId: e.target.value}}))}
                    className="bg-white border border-blue-200 text-blue-800 text-sm font-bold rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="">Do Not Send (Give to Patient)</option>
                    {myRosteredLabs.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-3">
                {rxData.tests.map((test, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <div className="w-full md:w-1/2 relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <span className="text-xs font-bold text-slate-300">{index + 1}.</span>
                      </div>
                      <input type="text" placeholder="Test Name (e.g., CBC, Lipid Profile)" value={test.name} onChange={e => handleTestChange(index, "name", e.target.value)} required className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <div className="flex-1 w-full">
                      <input type="text" placeholder="Instructions (e.g., Fasting)" value={test.instructions} onChange={e => handleTestChange(index, "instructions", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
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

            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-4 print:hidden z-50 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] -mx-8 -mb-8 rounded-b-2xl">
              <button type="button" onClick={() => window.print()} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Print PDF
              </button>
              <button type="submit" className="bg-tenant-accent hover:bg-teal-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest shadow-[0_4px_16px_var(--tenant-accent-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Secure & Send to Vault
              </button>
            </div>

          </form>
        </div>
      </main>

      {/* PRINT LAYOUT (Hidden on screen, visible only when printing) */}
      <div className="hidden print:block bg-white text-black p-8 min-h-screen">
        {/* Letterhead Header */}
        <div className="border-b-2 border-slate-800 pb-6 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-bold uppercase text-slate-900">{doctorName}</h1>
            <p className="font-bold text-slate-600 mt-1">MBBS, MD (Specialist)</p>
            <p className="text-sm text-slate-500 mt-1">Reg No: MCI-123456</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold font-serif uppercase tracking-widest text-tenant-accent">Dehapa Clinic</h2>
            <p className="text-sm text-slate-600 mt-1">123 Health Avenue, Medical District</p>
            <p className="text-sm text-slate-600">Bhubaneswar, Odisha 751001</p>
            <p className="text-sm font-bold text-slate-800 mt-1">Ph: +91 98765 43210</p>
          </div>
        </div>

        {/* Patient Details Row */}
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg mb-8 border border-slate-200">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Patient Name</p>
            <p className="font-bold text-lg">{decodeURIComponent(patientVaultId).split("@")[0] || "Unknown Patient"}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Date</p>
            <p className="font-bold">{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Vault ID</p>
            <p className="font-mono text-sm">{patientVaultId || "N/A"}</p>
          </div>
        </div>

        {/* Clinical Data */}
        <div className="space-y-8">
          {rxData.history && (
            <div>
              <h3 className="font-bold border-b border-slate-200 pb-2 mb-2 uppercase tracking-widest text-sm text-slate-500">Medical History</h3>
              <p className="text-sm whitespace-pre-wrap">{rxData.history}</p>
            </div>
          )}

          {rxData.diagnosis && (
            <div>
              <h3 className="font-bold border-b border-slate-200 pb-2 mb-2 uppercase tracking-widest text-sm text-slate-500">Clinical Diagnosis</h3>
              <p className="text-sm font-bold whitespace-pre-wrap">{rxData.diagnosis}</p>
            </div>
          )}

          {rxData.medicines.length > 0 && rxData.medicines[0].name !== "" && (
            <div>
              <h3 className="font-bold border-b border-slate-200 pb-2 mb-4 text-2xl font-serif text-slate-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-tenant-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                Rx
              </h3>
              <ul className="space-y-4">
                {rxData.medicines.map((med, i) => (
                  med.name && (
                    <li key={i} className="flex justify-between items-end border-b border-dashed border-slate-300 pb-2">
                      <div>
                        <span className="font-bold text-lg mr-2">{i+1}.</span>
                        <span className="font-bold text-lg uppercase tracking-wide">{med.name}</span>
                        {med.dosage && <span className="text-slate-600 ml-2">({med.dosage})</span>}
                      </div>
                      <div className="text-right">
                        <span className="font-bold bg-slate-100 px-3 py-1 rounded">{med.frequency}</span>
                        <span className="ml-4 italic text-sm">x {med.duration}</span>
                      </div>
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}

          {rxData.tests.length > 0 && rxData.tests[0].name !== "" && (
            <div>
              <h3 className="font-bold border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest text-sm text-slate-500">Lab Investigations</h3>
              <ul className="list-disc pl-5 space-y-2">
                {rxData.tests.map((test, i) => (
                  test.name && (
                    <li key={i}>
                      <span className="font-bold">{test.name}</span>
                      {test.instructions && <span className="text-slate-600 italic ml-2">({test.instructions})</span>}
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}

          {rxData.advice && (
            <div>
              <h3 className="font-bold border-b border-slate-200 pb-2 mb-2 uppercase tracking-widest text-sm text-slate-500">General Advice & Follow Up</h3>
              <p className="text-sm whitespace-pre-wrap">{rxData.advice}</p>
            </div>
          )}
        </div>

        {/* Footer Signature */}
        <div className="mt-24 flex justify-end">
          <div className="text-center border-t border-slate-800 pt-2 w-48">
            <p className="font-bold">{doctorName}</p>
            <p className="text-xs text-slate-500">Signature</p>
          </div>
        </div>
      </div>


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
