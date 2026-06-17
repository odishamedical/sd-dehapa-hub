"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalTelemedicineFAB() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"urgency" | "triage_general" | "triage_specialist" | "availability" | "fallback">("urgency");
  
  // State for selections
  const [selectedUrgency, setSelectedUrgency] = useState<"urgent" | "schedule" | null>(null);
  const [doctorType, setDoctorType] = useState<"general" | "specialist" | "super" | null>(null);
  const [department, setDepartment] = useState("");

  const handleOpen = () => {
    setIsOpen(true);
    setStep("urgency");
    setSelectedUrgency(null);
    setDoctorType(null);
    setDepartment("");
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleUrgencySelect = (urgency: "urgent" | "schedule") => {
    setSelectedUrgency(urgency);
    if (urgency === "schedule") {
      // For schedule, redirect to booking flow
      setIsOpen(false);
      router.push("/portal/book");
    } else {
      setStep("triage_general");
    }
  };

  const handleDoctorTypeSelect = (type: "general" | "specialist" | "super") => {
    setDoctorType(type);
    if (type === "general") {
      setStep("availability");
      checkAvailability(type, "");
    } else {
      setStep("triage_specialist");
    }
  };

  const handleDepartmentSelect = (dept: string) => {
    setDepartment(dept);
    setStep("availability");
    checkAvailability(doctorType!, dept);
  };

  const checkAvailability = (type: string, dept: string) => {
    // Mocking an availability check
    setTimeout(() => {
      // Fake logic: Neurosurgery is never available
      if (dept === "Neurosurgery") {
        setStep("fallback");
      } else {
        // Proceed to payment / connection mock
        alert(`Connecting you to an available ${dept || type} doctor... (Auth & Payment coming in Phase 3)`);
        setIsOpen(false);
      }
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-full shadow-2xl hover:shadow-red-500/50 hover:scale-105 transition-all flex items-center justify-center group"
      >
        <svg className="w-6 h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        <span className="hidden md:block ml-2 font-bold uppercase tracking-wider text-sm">Consult Doctor</span>
      </button>

      {/* Slide-over Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-end" onClick={handleClose}>
          {/* Modal Panel */}
          <div 
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold">Video Consult</h2>
                <p className="text-sm text-slate-300 mt-1">Connect with a doctor instantly</p>
              </div>
              <button onClick={handleClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              
              {step === "urgency" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">What type of consultation do you need?</h3>
                  
                  <button 
                    onClick={() => handleUrgencySelect("urgent")}
                    className="w-full bg-white border-2 border-red-100 hover:border-red-500 rounded-2xl p-6 text-left flex items-start gap-4 transition-all shadow-sm group"
                  >
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">Urgent Call (Now)</h4>
                      <p className="text-sm text-slate-500 mt-1">Connect with an available doctor immediately via video call.</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleUrgencySelect("schedule")}
                    className="w-full bg-white border-2 border-blue-100 hover:border-blue-500 rounded-2xl p-6 text-left flex items-start gap-4 transition-all shadow-sm group"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">Schedule Call</h4>
                      <p className="text-sm text-slate-500 mt-1">Book an appointment for a specific date and time.</p>
                    </div>
                  </button>
                </div>
              )}

              {step === "triage_general" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <button onClick={() => setStep("urgency")} className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Back
                  </button>
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Select Provider Type</h3>
                  
                  <button onClick={() => handleDoctorTypeSelect("general")} className="w-full bg-white border-2 border-slate-200 hover:border-teal-500 rounded-2xl p-4 text-left flex items-center justify-between transition-all group">
                    <div>
                      <h4 className="font-bold text-slate-900">General Physician</h4>
                      <p className="text-xs text-slate-500 mt-1">Fever, cold, general health issues</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>

                  <button onClick={() => handleDoctorTypeSelect("specialist")} className="w-full bg-white border-2 border-slate-200 hover:border-teal-500 rounded-2xl p-4 text-left flex items-center justify-between transition-all group">
                    <div>
                      <h4 className="font-bold text-slate-900">Specialist</h4>
                      <p className="text-xs text-slate-500 mt-1">Cardiology, Orthopedics, etc.</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>

                  <button onClick={() => handleDoctorTypeSelect("super")} className="w-full bg-white border-2 border-slate-200 hover:border-teal-500 rounded-2xl p-4 text-left flex items-center justify-between transition-all group">
                    <div>
                      <h4 className="font-bold text-slate-900">Super Specialist</h4>
                      <p className="text-xs text-slate-500 mt-1">Neurosurgery, Oncology, etc.</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              )}

              {step === "triage_specialist" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right">
                  <button onClick={() => setStep("triage_general")} className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Back
                  </button>
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Select Department</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology", "Psychiatry", "Neurosurgery"].map(dept => (
                      <button 
                        key={dept}
                        onClick={() => handleDepartmentSelect(dept)}
                        className="bg-white border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50 rounded-xl p-3 text-center transition-colors text-sm font-bold text-slate-700"
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === "availability" && (
                <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <svg className="w-8 h-8 text-teal-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Checking Availability...</h3>
                  <p className="text-slate-500 text-center">Pinging online {department || "General"} doctors in our network.</p>
                </div>
              )}

              {step === "fallback" && (
                <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">No Doctors Available</h3>
                  <p className="text-slate-500 mb-8 max-w-xs mx-auto">There are currently no {department} specialists online for an urgent call.</p>
                  
                  <div className="space-y-3 w-full">
                    {department === "Neurosurgery" && (
                      <button onClick={() => handleDepartmentSelect("Neurology")} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition-colors shadow-sm">
                        Consult Neurology Instead
                      </button>
                    )}
                    <button onClick={() => handleUrgencySelect("schedule")} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors shadow-sm">
                      Schedule an Appointment
                    </button>
                    <button onClick={handleClose} className="w-full bg-transparent hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

            </div>
            
            {/* Footer */}
            <div className="p-4 bg-white border-t border-slate-100 text-center text-xs text-slate-400 font-semibold uppercase tracking-widest">
              Secure Telemedicine Link
            </div>
          </div>
        </div>
      )}
    </>
  );
}
