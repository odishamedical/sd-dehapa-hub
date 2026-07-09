"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// The Data Bus Interface
export interface ConsultationState {
  patientId: string;
  patientName: string;
  vitals: {
    bp: string;
    pulse: string;
    spo2: string;
    temp: string;
    weight: string;
  };
  complaints: string[];
  diagnosis: string[];
  medicines: any[];
  notes: string;
  language: string;
}

interface ConsultationContextType {
  state: ConsultationState;
  updateVitals: (key: keyof ConsultationState['vitals'], value: string) => void;
  addComplaint: (complaint: string) => void;
  removeComplaint: (complaint: string) => void;
  addDiagnosis: (diag: string) => void;
  removeDiagnosis: (diag: string) => void;
  addMedicine: (medicine: any) => void;
  removeMedicine: (index: number) => void;
  updateState: (updates: Partial<ConsultationState>) => void;
}

const defaultState: ConsultationState = {
  patientId: "",
  patientName: "",
  vitals: { bp: "", pulse: "", spo2: "", temp: "", weight: "" },
  complaints: [],
  diagnosis: [],
  medicines: [],
  notes: "",
  language: "en"
};

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

export function ConsultationProvider({ children, initialPatientName = "Unknown" }: { children: ReactNode, initialPatientName?: string }) {
  const [state, setState] = useState<ConsultationState>({
    ...defaultState,
    patientName: initialPatientName
  });

  const updateVitals = (key: keyof ConsultationState['vitals'], value: string) => {
    setState(prev => ({ ...prev, vitals: { ...prev.vitals, [key]: value } }));
  };

  const addComplaint = (complaint: string) => {
    if (!state.complaints.includes(complaint)) {
      setState(prev => ({ ...prev, complaints: [...prev.complaints, complaint] }));
    }
  };

  const removeComplaint = (complaint: string) => {
    setState(prev => ({ ...prev, complaints: prev.complaints.filter(c => c !== complaint) }));
  };

  const addDiagnosis = (diag: string) => {
    if (!state.diagnosis.includes(diag)) {
      setState(prev => ({ ...prev, diagnosis: [...prev.diagnosis, diag] }));
    }
  };

  const removeDiagnosis = (diag: string) => {
    setState(prev => ({ ...prev, diagnosis: prev.diagnosis.filter(d => d !== diag) }));
  };

  const addMedicine = (medicine: any) => {
    setState(prev => ({ ...prev, medicines: [...prev.medicines, medicine] }));
  };

  const removeMedicine = (index: number) => {
    setState(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const updateState = (updates: Partial<ConsultationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <ConsultationContext.Provider value={{ state, updateVitals, addComplaint, removeComplaint, addDiagnosis, removeDiagnosis, addMedicine, removeMedicine, updateState }}>
      {children}
    </ConsultationContext.Provider>
  );
}

export function useConsultation() {
  const context = useContext(ConsultationContext);
  if (context === undefined) {
    throw new Error('useConsultation must be used within a ConsultationProvider');
  }
  return context;
}
