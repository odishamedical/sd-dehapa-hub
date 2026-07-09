"use client";

import React, { useState } from 'react';
import { useConsultation } from '../core/ConsultationContext';

export function AIDiagnosisPlugin({ patient }: { patient: any }) {
  const { state, updateState } = useConsultation();
  const [isAILoading, setIsAILoading] = useState(false);

  const handleAIAssistant = async () => {
    const complaintsStr = state.complaints.join(', ');
    if (!complaintsStr.trim()) return alert("Please enter Chief Complaints first.");
    
    setIsAILoading(true);
    try {
      const res = await fetch('/api/cdss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientDetails: patient, chiefComplaints: complaintsStr })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.suggestedDiagnosis) updateState({ diagnosis: [data.suggestedDiagnosis] });
        // The core plugin handles diagnosis, we could add a new field for 'suggestedLabs' to context later
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

  return (
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
          AI Diagnosis
        </>
      )}
    </button>
  );
}
