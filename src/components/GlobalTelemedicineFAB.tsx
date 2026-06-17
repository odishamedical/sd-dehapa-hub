"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';


import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8",
  authDomain: "sd-auth-center.firebaseapp.com",
  projectId: "sd-auth-center",
  storageBucket: "sd-auth-center.firebasestorage.app",
  messagingSenderId: "393346058191",
  appId: "1:393346058191:web:a5e96e1c481a72f86db4ba"
};
export default function GlobalTelemedicineFAB() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"urgency" | "triage_general" | "triage_specialist" | "availability" | "fallback" | "auth_gate" | "connecting">("urgency");
  
  const [foundDoctorId, setFoundDoctorId] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setUserUid(localStorage.getItem("sd_current_user_uid"));
      setUserName(localStorage.getItem("sd_current_user_name"));
      
      const listener = () => handleOpen();
      window.addEventListener('open-telemedicine-fab', listener);
      return () => window.removeEventListener('open-telemedicine-fab', listener);
    }
  }, []);
  
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

  const checkAvailability = async (type: string, dept: string) => {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app, "default");
    
    try {
      // Find ANY online doctor for testing (In prod, filter by department)
      const q = query(collection(db, "doctor_status"), where("isOnline", "==", true));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Doctor found!
        const docId = snapshot.docs[0].id;
        setFoundDoctorId(docId);
        
        // If user is already logged in, skip auth gate
        if (userUid) {
          initiateConnection(docId, userUid, userName || "Patient");
        } else {
          setStep("auth_gate");
        }
      } else {
        setStep("fallback");
      }
    } catch (err) {
      console.error("Availability check failed", err);
      setStep("fallback");
    }
  };

  const handleFastTrackAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !whatsapp) return alert("Phone and WhatsApp are mandatory for urgent calls.");
    
    setIsAuthenticating(true);
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Save locally to match our ecosystem
      localStorage.setItem("sd_current_user_uid", user.uid);
      localStorage.setItem("sd_current_user_email", user.email || "");
      localStorage.setItem("sd_current_user_name", user.displayName || "Patient");
      localStorage.setItem("sd_current_user_role", "patient");
      
      setUserUid(user.uid);
      setUserName(user.displayName);
      
      if (foundDoctorId) {
        initiateConnection(foundDoctorId, user.uid, user.displayName || "Patient");
      }
    } catch (err) {
      console.error("Auth failed", err);
      alert("Authentication failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const initiateConnection = async (doctorId: string, patientId: string, pName: string) => {
    setStep("connecting");
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app, "default");
    
    try {
      await addDoc(collection(db, "consultation_requests"), {
        doctorId: doctorId,
        patientId: patientId,
        patientName: pName,
        type: doctorType,
        department: department,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      // In a real flow, we'd listen to this doc for status="accepted"
    } catch (err) {
      console.error("Failed to create request", err);
      alert("Failed to connect. Please try again.");
      setStep("urgency");
    }
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex justify-center items-center p-4" onClick={handleClose}>
          {/* Modal Panel - Centered HUD Style */}
          <div 
            className="w-full max-w-lg bg-[#040815] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0a1229] to-[#040815] border-b border-cyan-500/20 p-6 flex justify-between items-center text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
              <div>
                <h2 className="text-2xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-200">Video Consult</h2>
                <p className="text-xs text-cyan-500/70 uppercase tracking-widest mt-1">Encrypted Telemedicine Link</p>
              </div>
              <button onClick={handleClose} className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors border border-white/5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-gradient-to-b from-[#040815] to-[#0a1229]">
              
              {step === "urgency" && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <h3 className="text-xl font-bold text-white text-center mb-8">What type of consultation do you need?</h3>
                  
                  <button 
                    onClick={() => handleUrgencySelect("urgent")}
                    className="w-full bg-[#0a1229]/80 backdrop-blur-md border border-red-500/30 hover:border-red-400 hover:bg-red-950/20 rounded-2xl p-6 text-left flex items-center gap-6 transition-all shadow-[0_0_20px_rgba(239,68,68,0.05)] hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite]"></div>
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-400 group-hover:scale-110 group-hover:bg-red-500/20 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] relative">
                      <div className="absolute inset-0 rounded-full animate-ping bg-red-500/20 opacity-75"></div>
                      <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-black uppercase tracking-wider text-white text-xl group-hover:text-red-400 transition-colors">Urgent Video Call</h4>
                      <p className="text-sm text-slate-400 mt-2 font-medium">Connect with an available doctor immediately.</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleUrgencySelect("schedule")}
                    className="w-full bg-[#0a1229]/80 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/20 rounded-2xl p-6 text-left flex items-center gap-6 transition-all shadow-[0_0_20px_rgba(6,182,212,0.05)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite]"></div>
                    <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-black uppercase tracking-wider text-white text-xl group-hover:text-cyan-400 transition-colors">Schedule Appointment</h4>
                      <p className="text-sm text-slate-400 mt-2 font-medium">Book a specific date and time for a consult.</p>
                    </div>
                  </button>
                </div>
              )}

              {step === "triage_general" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                  <button onClick={() => setStep("urgency")} className="text-xs uppercase tracking-widest font-bold text-cyan-500 hover:text-cyan-300 flex items-center gap-2 mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Back
                  </button>
                  <h3 className="text-xl font-bold text-white mb-6 text-center">Select Provider Type</h3>
                  
                  <button onClick={() => handleDoctorTypeSelect("general")} className="w-full bg-[#0a1229] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 text-left flex items-center justify-between transition-all group hover:bg-[#0f172a]">
                    <div>
                      <h4 className="font-bold text-white text-lg">General Physician</h4>
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Fever, cold, general health</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                      <svg className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </button>

                  <button onClick={() => handleDoctorTypeSelect("specialist")} className="w-full bg-[#0a1229] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 text-left flex items-center justify-between transition-all group hover:bg-[#0f172a]">
                    <div>
                      <h4 className="font-bold text-white text-lg">Specialist</h4>
                      <p className="text-xs text-slate-500 mt-1">Cardiology, Orthopedics, etc.</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>

                  <button onClick={() => handleDoctorTypeSelect("super")} className="w-full bg-[#0a1229] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 text-left flex items-center justify-between transition-all group hover:bg-[#0f172a]">
                    <div>
                      <h4 className="font-bold text-white text-lg">Super Specialist</h4>
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Neurosurgery, Oncology, etc.</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                      <svg className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </button>
                </div>
              )}

              {step === "triage_specialist" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                  <button onClick={() => setStep("triage_general")} className="text-xs uppercase tracking-widest font-bold text-cyan-500 hover:text-cyan-300 flex items-center gap-2 mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Back
                  </button>
                  <h3 className="text-xl font-bold text-white mb-6 text-center">Select Department</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology", "Psychiatry", "Neurosurgery"].map(dept => (
                      <button 
                        key={dept}
                        onClick={() => handleDepartmentSelect(dept)}
                        className="bg-[#0a1229] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-900/20 rounded-xl p-4 text-center transition-all text-sm font-bold text-slate-300 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === "availability" && (
                <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-cyan-950/30 rounded-full flex items-center justify-center mb-8 relative border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                    <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-teal-500/50 border-b-transparent rounded-full animate-[spin_2s_reverse_infinite]"></div>
                    <svg className="w-10 h-10 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">Checking Availability...</h3>
                  <p className="text-cyan-500/80 text-center font-medium">Pinging online <span className="text-cyan-400 font-bold">{department || "General"}</span> doctors in our network.</p>
                </div>
              )}

              {step === "auth_gate" && (
                <div className="h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-500">
                  <div className="w-20 h-20 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 tracking-wide">Doctor Available!</h3>
                  <p className="text-slate-400 mb-8 text-center text-sm font-medium">To connect immediately, please verify your identity. <br/><span className="text-xs text-red-400 font-bold tracking-widest uppercase mt-2 block bg-red-950/30 py-1 px-3 rounded-full border border-red-500/20 inline-block">(Profile builder skipped for urgent calls)</span></p>
                  
                  <form onSubmit={handleFastTrackAuth} className="w-full space-y-5 bg-[#0a1229] p-6 rounded-2xl border border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-cyan-500 mb-2 uppercase tracking-wider">Phone Number *</label>
                      <input 
                        type="tel" 
                        required 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-[#040815] rounded-xl border border-slate-700 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none placeholder:text-slate-600"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-cyan-500 mb-2 uppercase tracking-wider">WhatsApp Number *</label>
                      <input 
                        type="tel" 
                        required 
                        value={whatsapp}
                        onChange={e => setWhatsapp(e.target.value)}
                        className="w-full px-4 py-3 bg-[#040815] rounded-xl border border-slate-700 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none placeholder:text-slate-600"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <button 
                        type="submit" 
                        disabled={isAuthenticating}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
                      >
                        {isAuthenticating ? (
                          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path></svg>
                            Continue with Google
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                  
                  <button onClick={() => setStep("urgency")} className="mt-6 text-xs uppercase tracking-widest font-bold text-slate-500 hover:text-white transition-colors">
                    Cancel & Go Back
                  </button>
                </div>
              )}

              {step === "connecting" && (
                <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                  <div className="w-32 h-32 bg-teal-950/30 rounded-full flex items-center justify-center mb-8 relative border border-teal-500/20 shadow-[0_0_40px_rgba(20,184,166,0.15)]">
                    <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-[-10px] border border-teal-500/30 rounded-full animate-ping opacity-50"></div>
                    <svg className="w-14 h-14 text-teal-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3 tracking-wide">Connecting...</h3>
                  <p className="text-teal-500/80 text-center font-medium max-w-xs">Establishing encrypted video link. Do not close this window.</p>
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
