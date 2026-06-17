"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";

const DOCTORS = [
  { id: "dr-01", name: "Dr. Sandeep Mohanty", specialty: "Cardiologist", experience: "15 Years", hospital: "Apollo Hospitals, Bhubaneswar", fee: 800 },
  { id: "dr-02", name: "Dr. Ananya Das", specialty: "Pediatrician", experience: "8 Years", hospital: "KIMS, Bhubaneswar", fee: 600 },
  { id: "dr-03", name: "Dr. Rajesh Pattnaik", specialty: "Neurologist", experience: "22 Years", hospital: "SUM Ultimate, Bhubaneswar", fee: 1200 },
  { id: "dr-04", name: "Dr. Meera Nanda", specialty: "Dermatologist", experience: "12 Years", hospital: "Care Hospitals, Cuttack", fee: 500 },
  { id: "dr-05", name: "Dr. Prateek Mishra", specialty: "Orthopedic Surgeon", experience: "18 Years", hospital: "AMRI Hospitals, Bhubaneswar", fee: 1000 }
];

function BookAppointmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get("doctor") || "dr-01";
  
  const doctor = DOCTORS.find(d => d.id === docId) || DOCTORS[0];

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("2026-05-26");
  const [selectedTime, setSelectedTime] = useState("10:30 AM");
  const [symptoms, setSymptoms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("sd_current_user_email");
    const name = localStorage.getItem("sd_current_user_name");
    const isComplete = localStorage.getItem("sd_current_user_profile_complete") === "true";

    if (!email) {
      const authCenterBase = window.location.hostname === "localhost" 
        ? "http://localhost:3000" 
        : "/login";
      window.location.href = `${authCenterBase}?redirect_uri=${encodeURIComponent(window.location.href)}`;
    } else if (!isComplete) {
      router.push("/doctors");
    } else {
      setUserEmail(email);
      setUserName(name || email.split("@")[0]);
    }
  }, [router]);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingSuccess(true);
    }, 1500);
  };

  if (!userEmail) return null;

  return (
    <div className="min-h-screen bg-black/80 backdrop-blur-md text-[#f8fafc] font-sans flex flex-col items-center justify-center p-4 selection:bg-[#06b6d4]/30">
      
      <main className="w-full max-w-lg mx-auto flex flex-col justify-center animate-in zoom-in-95 duration-300">
        
        {!bookingSuccess ? (
          <div className="bg-[#040815] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0a1229] to-[#040815] border-b border-cyan-500/20 p-6 flex justify-between items-center text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
              <div>
                <h2 className="text-2xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-200">Schedule Video Call</h2>
                <p className="text-xs text-cyan-500/70 uppercase tracking-widest mt-1">Secure FHIR Consultation</p>
              </div>
              <button onClick={() => router.back()} className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors border border-white/5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-gradient-to-b from-[#040815] to-[#0a1229]">
              
              <button onClick={() => router.back()} className="text-xs uppercase tracking-widest font-bold text-cyan-500 hover:text-cyan-300 flex items-center gap-2 mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                BACK
              </button>

            {/* Doctor info */}
            <div className="bg-[#0a1229] border border-slate-800 rounded-2xl p-4 flex gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-lg">
                🏥
              </div>
              <div className="flex-1 leading-normal text-left">
                <h4 className="text-white font-bold text-sm">{doctor.name}</h4>
                <p className="text-cyan-500 text-[10px] font-mono uppercase tracking-wider">{doctor.specialty} • {doctor.experience}</p>
                <p className="text-slate-400 text-xs mt-1">{doctor.hospital}</p>
              </div>
            </div>

            <form onSubmit={handleBook} className="space-y-5 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-cyan-500 font-bold">Select Date</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full bg-[#0a1229] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-cyan-500 font-bold">Available Slots</label>
                <div className="grid grid-cols-3 gap-2">
                  {["09:30 AM", "10:30 AM", "03:00 PM", "04:30 PM", "06:00 PM"].map((t) => {
                    const isActive = selectedTime === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`py-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                          isActive 
                            ? "bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
                            : "bg-[#0a1229] border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-cyan-500 font-bold">Chief Symptoms / Reason for Consultation</label>
                <textarea 
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Mild fever since yesterday, headache and cold..."
                  required
                  className="w-full bg-[#0a1229] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                />
              </div>

            </form>
            </div>
            
            {/* Footer */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 text-center mt-auto shadow-[0_-5px_20px_rgba(6,182,212,0.3)] border-t border-cyan-400 cursor-pointer hover:brightness-110 transition-all" onClick={handleBook}>
              <p className="text-xs font-black text-white uppercase tracking-widest drop-shadow-md">
                {isSubmitting ? "Booking..." : `Secure Video Consultation (Fee: ₹${doctor.fee})`}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#040815] border border-cyan-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              ✓
            </div>
            
            <div>
              <h3 className="text-2xl font-black text-white mb-2">Consultation Booked!</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Thank you {userName}. Your HIPAA/FHIR-compliant tele-session with <strong className="text-cyan-400">{doctor.name}</strong> is scheduled for <strong className="text-white">{selectedDate}</strong> at <strong className="text-white">{selectedTime}</strong>. We have dispatched a confirmation SMS and calendar invite.
              </p>
            </div>

            <div className="bg-[#0a1229] border border-slate-800 rounded-2xl p-4 text-left font-mono text-[10px] space-y-1">
              <p className="text-slate-500">Consultation ID: <strong className="text-white">CON-{Math.floor(100000 + Math.random() * 900000)}</strong></p>
              <p className="text-slate-500">Doctor: <strong className="text-white">{doctor.name}</strong></p>
              <p className="text-slate-500">Logistics: <strong className="text-cyan-500">Video Link generated (sent via SMS)</strong></p>
            </div>

            <Link href="/portal" className="w-full py-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:brightness-110 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all block shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              Return to Patient Dashboard
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}

export default function BookAppointment() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020610] text-[#f8fafc] font-sans flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#06b6d4]/20 border-t-[#06b6d4] rounded-full animate-spin" />
      </div>
    }>
      <BookAppointmentForm />
    </Suspense>
  );
}

