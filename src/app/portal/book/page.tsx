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
  
  const [selectedDocId, setSelectedDocId] = useState(docId);
  const doctor = DOCTORS.find(d => d.id === selectedDocId) || DOCTORS[0];

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

    setUserEmail(email || "test@example.com");
    setUserName(name || "Patient");
  }, [router]);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingSuccess(true);
    }, 1500);
  };

  // Temporarily removed auth block for testing

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-24">
      {/* Header Area */}
      <div className="bg-teal-900 text-white pt-24 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 150%, #14b8a6 0%, transparent 50%)' }}></div>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Link href="/doctors" className="inline-flex items-center gap-2 text-teal-200 hover:text-white text-sm font-bold uppercase tracking-widest mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Directory
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">Book Appointment</h1>
            <p className="text-teal-100/80 text-sm md:text-base max-w-xl">Complete your secure booking for a video consultation. All sessions are fully encrypted and HIPAA/FHIR-compliant.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 mt-4 md:mt-0 animate-in fade-in duration-500">
            <div className="text-center sm:text-left">
              <p className="text-white font-bold text-sm uppercase tracking-wider">Need Urgent Help?</p>
              <p className="text-teal-200 text-xs">Connect instantly with available doctors</p>
            </div>
            <button 
              onClick={() => {
                const fabEvent = new CustomEvent('open-telemedicine-fab', { detail: { action: 'urgent' } });
                window.dispatchEvent(fabEvent);
              }}
              className="shrink-0 bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)] group relative w-full sm:w-auto"
            >
              <div className="absolute inset-0 rounded-xl animate-ping bg-red-500/40 opacity-75"></div>
              <span className="relative z-10 animate-pulse group-hover:animate-none flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                Call Urgent
              </span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        {!bookingSuccess ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Doctor Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                
                <div className="w-full mb-6">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left block mb-2">Select a Provider</label>
                  <div className="relative">
                    <select 
                      value={selectedDocId}
                      onChange={(e) => setSelectedDocId(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 pr-10 font-bold text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-sm"
                    >
                      {DOCTORS.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-50 shadow-md mb-4">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0f766e&color=fff&size=150`} alt={doctor.name} className="w-full h-full object-cover" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{doctor.name}</h2>
                <p className="text-teal-600 font-bold text-sm uppercase tracking-wider mt-1">{doctor.specialty}</p>
                <div className="w-12 h-1 bg-slate-100 rounded-full my-4"></div>
                <p className="text-slate-500 text-sm">{doctor.experience} Experience</p>
                <p className="text-slate-500 text-sm mt-1">{doctor.hospital}</p>
                
                <div className="mt-6 w-full bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-between items-center">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Consultation Fee</span>
                  <span className="text-slate-900 font-black text-lg">₹{doctor.fee}</span>
                </div>
              </div>

              <div className="bg-teal-50 rounded-2xl p-6 border border-teal-100">
                <h4 className="font-bold text-teal-900 flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Secure Guarantee
                </h4>
                <p className="text-teal-700/80 text-xs leading-relaxed">Your medical data is protected. This session is fully encrypted and never recorded without your explicit consent.</p>
              </div>
            </div>

            {/* Right Column: Booking Form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="text-2xl font-bold text-slate-900 mb-8">Select Schedule</h3>
                
                <form onSubmit={handleBook} className="space-y-8 text-left">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date of Consultation</label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available Time Slots</label>
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">IST (GMT+5:30)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:30 AM", "02:00 PM", "03:00 PM", "04:30 PM", "06:00 PM"].map((t) => {
                        const isActive = selectedTime === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTime(t)}
                            className={`py-3.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                              isActive 
                                ? "bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/30 scale-[1.02]" 
                                : "bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chief Symptoms / Reason</label>
                    <textarea 
                      rows={4}
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Please briefly describe your symptoms (e.g. Mild fever since yesterday, headache)..."
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold resize-none"
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-5 bg-slate-900 hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                          Confirm & Pay ₹{doctor.fee}
                        </>
                      )}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">By booking, you agree to our Telemedicine Terms of Service.</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 md:p-16 shadow-2xl shadow-emerald-900/10 border border-slate-100 text-center space-y-8 animate-in zoom-in-95 duration-500 mt-12">
            <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-500 text-5xl mx-auto">
              ✓
            </div>
            
            <div>
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Consultation Confirmed</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Thank you, <strong className="text-slate-900">{userName}</strong>. Your video consultation with <strong className="text-teal-600">{doctor.name}</strong> is scheduled for <strong className="text-slate-900">{selectedDate}</strong> at <strong className="text-slate-900">{selectedTime}</strong>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left space-y-3 mx-auto max-w-sm">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">Consultation ID</span>
                <strong className="text-slate-900 font-mono">CON-{Math.floor(100000 + Math.random() * 900000)}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">Amount Paid</span>
                <strong className="text-slate-900">₹{doctor.fee}</strong>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 text-sm">Logistics</span>
                <strong className="text-teal-600 text-sm">Link sent via SMS</strong>
              </div>
            </div>

            <Link href="/portal" className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(13,148,136,0.3)] hover:scale-105">
              Go to Patient Dashboard
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

