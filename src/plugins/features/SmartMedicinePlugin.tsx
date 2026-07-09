"use client";

import React, { useState } from 'react';
import { useConsultation } from '../core/ConsultationContext';

// Hardcoded for demo, normally fetched from the Doctor's "Memory" DB
const SMART_DATABASE = [
  { name: "Tab. Paracetamol 500mg", defaultDosage: "1-0-1", defaultDuration: "3 Days" },
  { name: "Tab. Pantoprazole 40mg", defaultDosage: "1-0-0", defaultDuration: "5 Days" },
  { name: "Syp. Cough Relief", defaultDosage: "1-1-1", defaultDuration: "5 Days" },
  { name: "Cap. Amoxicillin 500mg", defaultDosage: "1-0-1", defaultDuration: "7 Days" },
  { name: "Tab. Cetirizine 10mg", defaultDosage: "0-0-1", defaultDuration: "5 Days" }
];

export function SmartMedicinePlugin() {
  const { state, addMedicine, removeMedicine } = useConsultation();
  const [searchTerm, setSearchTerm] = useState("");
  const [dosage, setDosage] = useState("1-0-1");
  const [duration, setDuration] = useState("5 Days");
  
  const [suggestions, setSuggestions] = useState<typeof SMART_DATABASE>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    
    if (val.length > 2) {
      const matches = SMART_DATABASE.filter(m => m.name.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (med: typeof SMART_DATABASE[0]) => {
    setSearchTerm(med.name);
    setDosage(med.defaultDosage);
    setDuration(med.defaultDuration);
    setSuggestions([]);
  };

  const handleAdd = () => {
    if (!searchTerm) return;
    addMedicine({
      name: searchTerm,
      dosage,
      duration
    });
    setSearchTerm("");
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900">Medication (Smart Suggest)</h3>
        <p className="text-slate-500">Auto-completes from your memory database.</p>
      </div>
      
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 relative">
         <div className="flex-1 relative">
           <input 
             type="text" 
             value={searchTerm}
             onChange={handleSearch}
             className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 transition-all outline-none" 
             placeholder="Search Medicine (e.g. Parac...)" 
           />
           {suggestions.length > 0 && (
             <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg mt-2 z-50 overflow-hidden">
                {suggestions.map(s => (
                  <button 
                    key={s.name}
                    onClick={() => selectSuggestion(s)}
                    className="w-full text-left px-4 py-3 hover:bg-teal-50 focus:bg-teal-50 outline-none flex justify-between items-center border-b border-slate-100 last:border-0"
                  >
                    <span className="font-bold text-slate-700">{s.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{s.defaultDosage} • {s.defaultDuration}</span>
                  </button>
                ))}
             </div>
           )}
         </div>
         <div className="w-full md:w-32">
           <input 
             type="text" 
             value={dosage}
             onChange={e => setDosage(e.target.value)}
             className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 transition-all outline-none"
             placeholder="Dosage"
           />
         </div>
         <div className="w-full md:w-32">
           <input 
             type="text" 
             value={duration}
             onChange={e => setDuration(e.target.value)}
             className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 transition-all outline-none"
             placeholder="Duration"
           />
         </div>
         <button onClick={handleAdd} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all">
           Add
         </button>
      </div>

      {/* Added Medications */}
      <div className="space-y-3 mt-6">
         {state.medicines.map((med, idx) => (
           <div key={idx} className="p-5 border border-slate-200 rounded-xl flex items-center justify-between bg-white hover:border-teal-300 transition-colors shadow-sm">
              <div>
                <div className="font-bold text-slate-900 text-lg">{med.name}</div>
                <div className="text-sm text-slate-500 mt-1">{med.dosage} (After Food) • {med.duration}</div>
              </div>
              <button onClick={() => removeMedicine(idx)} className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
           </div>
         ))}
      </div>
    </div>
  );
}
