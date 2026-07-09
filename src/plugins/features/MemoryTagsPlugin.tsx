"use client";

import React, { useState } from 'react';
import { useConsultation } from '../core/ConsultationContext';

// Hardcoded for demo, normally fetched from the Doctor's "Memory" DB
const SUGGESTED_COMPLAINTS = ["Chest Pain", "Fever", "Cough", "Headache", "Acidity", "Body Ache"];
const SUGGESTED_DIAGNOSIS = ["Hypertension", "Viral Fever", "Migraine", "GERD", "Type 2 Diabetes"];

export function MemoryTagsPlugin() {
  const { state, addComplaint, removeComplaint, addDiagnosis, removeDiagnosis } = useConsultation();
  const [activeTab, setActiveTab] = useState<'complaints' | 'diagnosis'>('complaints');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 border-b border-slate-200 w-full">
          <button 
            onClick={() => setActiveTab('complaints')}
            className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'complaints' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Smart Complaints
          </button>
          <button 
            onClick={() => setActiveTab('diagnosis')}
            className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'diagnosis' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Smart Diagnosis
          </button>
        </div>
      </div>

      {activeTab === 'complaints' && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {state.complaints.map(c => (
              <span key={c} className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 border border-teal-100">
                {c}
                <button onClick={() => removeComplaint(c)} className="hover:text-red-500 font-bold">&times;</button>
              </span>
            ))}
          </div>
          
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Remembered Tags (1 Click Add)</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_COMPLAINTS.filter(c => !state.complaints.includes(c)).map(c => (
              <button 
                key={c}
                onClick={() => addComplaint(c)}
                className="bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 px-3 py-1 rounded-full text-xs font-medium transition-colors"
              >
                + {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'diagnosis' && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {state.diagnosis.map(d => (
              <span key={d} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 border border-purple-100">
                {d}
                <button onClick={() => removeDiagnosis(d)} className="hover:text-red-500 font-bold">&times;</button>
              </span>
            ))}
          </div>
          
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Remembered Diagnosis</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_DIAGNOSIS.filter(d => !state.diagnosis.includes(d)).map(d => (
              <button 
                key={d}
                onClick={() => addDiagnosis(d)}
                className="bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 px-3 py-1 rounded-full text-xs font-medium transition-colors"
              >
                + {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
