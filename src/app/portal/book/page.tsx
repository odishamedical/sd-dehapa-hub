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
    <div className="min-h-screen bg-[#020610] text-[#f8fafc] font-sans flex flex-col selection:bg-[#06b6d4]/30">
      
      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-16 flex flex-col justify-center">
        
        {!bookingSuccess ? (
          <div className="bg-[#0f172a] border border-[#06b6d4]/30 rounded-3xl p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent" />
            
            <span className="text-[9px] font-mono tracking-widest text-[#06b6d4] uppercase font-bold block mb-1">Secure FHIR Consultation</span>
            <h2 className="text-2xl font-bold font-serif text-white mb-6">Schedule Video Call</h2>

            {/* Doctor info */}
            <div className="bg-[#1e293b]/50 border border-[#334155] rounded-2xl p-4 flex gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/20 flex items-center justify-center text-white font-bold text-lg">
                🏥
              </div>
              <div className="flex-1 leading-normal text-left">
                <h4 className="text-white font-bold text-sm">{doctor.name}</h4>
                <p className="text-[#06b6d4] text-[10px] font-mono uppercase tracking-wider">{doctor.specialty} • {doctor.experience}</p>
                <p className="text-gray-400 text-xs mt-1">{doctor.hospital}</p>
              </div>
            </div>

            <form onSubmit={handleBook} className="space-y-5 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-450 font-bold">Select Date</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full bg-[#1e293b]/50 border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#06b6d4]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-450 font-bold">Available Slots</label>
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
                            ? "bg-[#06b6d4]/20 border-[#06b6d4] text-white" 
                            : "bg-[#1e293b]/40 border-slate-800 text-gray-400 hover:border-slate-700"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-450 font-bold">Chief Symptoms / Reason for Consultation</label>
                <textarea 
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Mild fever since yesterday, headache and cold..."
                  required
                  className="w-full bg-[#1e293b]/50 border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#06b6d4] resize-none"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-[#06b6d4] to-[#0d9488] text-[#020610] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-lg shadow-[#06b6d4]/20 flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-[#020610]/20 border-t-[#020610] rounded-full animate-spin" />
                  ) : `Secure Video Consultation (Fee: ₹${doctor.fee})`}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-[#0f172a] border border-green-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 text-3xl mx-auto animate-pulse">
              ✓
            </div>
            
            <div>
              <h3 className="text-2xl font-bold font-serif text-white">Consultation Booked!</h3>
              <p className="text-xs text-gray-450 mt-2 leading-relaxed">
                Thank you {userName}. Your HIPAA/FHIR-compliant tele-session with <strong className="text-[#06b6d4]">{doctor.name}</strong> is scheduled for <strong className="text-white">{selectedDate}</strong> at <strong className="text-white">{selectedTime}</strong>. We have dispatched a confirmation SMS and calendar invite.
              </p>
            </div>

            <div className="bg-[#1e293b]/40 border border-slate-800 rounded-2xl p-4 text-left font-mono text-[10px] space-y-1">
              <p className="text-gray-400">Consultation ID: <strong className="text-white">CON-{Math.floor(100000 + Math.random() * 900000)}</strong></p>
              <p className="text-gray-400">Doctor: <strong className="text-white">{doctor.name}</strong></p>
              <p className="text-gray-400">Logistics: <strong className="text-[#06b6d4]">Video Link generated (sent via SMS)</strong></p>
            </div>

            <Link href="/portal" className="w-full py-3.5 bg-[#06b6d4] hover:bg-[#0891b2] text-[#020610] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors block shadow-lg shadow-[#06b6d4]/10">
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

