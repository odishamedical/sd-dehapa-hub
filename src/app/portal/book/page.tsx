"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";

function BookAppointmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams?.get("doctor") || "";
  
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<any>(null);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // tomorrow
    return d.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState("10:30 AM");
  const [symptoms, setSymptoms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("sd_current_user_email");
    const name = localStorage.getItem("sd_current_user_name");
    const uid = localStorage.getItem("sd_current_user_uid") || email; // fallback to email if uid not present

    if (!email) {
      router.push("/login?redirect=/portal/book?doctor=" + docId);
      return;
    }

    setUserEmail(email);
    setUserName(name || "Patient");
    setUserUid(uid);

    const fetchDoctor = async () => {
      if (!docId) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'directory', docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDoctor({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Failed to fetch doctor details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [router, docId]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !userEmail) return;
    
    setIsSubmitting(true);
    try {
      const appointmentData = {
        patientId: userUid,
        patientName: userName,
        patientEmail: userEmail,
        doctorId: doctor.id,
        doctorName: doctor.name,
        date: selectedDate,
        timeSlot: selectedTime,
        symptoms: symptoms,
        status: "Pending", // Pending payment
        type: "Telemedicine",
        fee: doctor.consultationFee || 500, // Default fee if not set
        timestamp: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "appointments"), appointmentData);
      setBookingId(docRef.id);
      
      setBookingSuccess(true);
    } catch (error) {
      console.error("Error booking appointment", error);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsSubmitting(true);
      // Create Order
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: doctor.consultationFee || 500, receipt: bookingId })
      });
      const orderData = await res.json();
      
      if (!orderData.id) {
         alert("Failed to create payment order");
         setIsSubmitting(false);
         return;
      }

      // Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder_key", 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "DehaPa Healthcare",
        description: `Consultation with ${doctor.name}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              // Update appointment status in Firestore
              await updateDoc(doc(db, "appointments", bookingId), {
                status: "Confirmed",
                paymentId: response.razorpay_payment_id
              });
              setPaymentSuccess(true);
            } else {
              alert("Payment verification failed.");
            }
          } catch(err) {
             console.error(err);
             alert("Error during payment verification");
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: "#0d9488"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
         alert(response.error.description);
      });
      rzp.open();
    } catch(err) {
      console.error(err);
      alert("Error initiating payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
         <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
         <div className="text-center">
           <h2 className="text-2xl font-bold mb-2">Doctor Not Found</h2>
           <Link href="/doctors" className="text-teal-600 underline">Return to Directory</Link>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
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
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        {!bookingSuccess ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Doctor Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-50 shadow-md mb-4">
                  <img src={doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0f766e&color=fff&size=150`} alt={doctor.name} className="w-full h-full object-cover" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{doctor.name}</h2>
                <p className="text-teal-600 font-bold text-sm uppercase tracking-wider mt-1">{doctor.specialty || doctor.category}</p>
                <div className="w-12 h-1 bg-slate-100 rounded-full my-4"></div>
                <p className="text-slate-500 text-sm">{doctor.experience || "10+ Years"} Experience</p>
                <p className="text-slate-500 text-sm mt-1">{doctor.clinic?.name || "Verified Clinic"}</p>
                
                <div className="mt-6 w-full bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-between items-center">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Consultation Fee</span>
                  <span className="text-slate-900 font-black text-lg">₹{doctor.consultationFee || 500}</span>
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
                      min={new Date().toISOString().split('T')[0]}
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
                          Generating Order...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                          Confirm Schedule
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : !paymentSuccess ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 md:p-16 shadow-2xl shadow-emerald-900/10 border border-slate-100 text-center space-y-8 animate-in zoom-in-95 duration-500 mt-12">
            <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-slate-100 flex items-center justify-center text-slate-500 mx-auto">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            </div>
            
            <div>
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Pending Payment</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Your video consultation with <strong className="text-teal-600">{doctor.name}</strong> on <strong className="text-slate-900">{selectedDate}</strong> at <strong className="text-slate-900">{selectedTime}</strong> is temporarily reserved. Complete payment to confirm.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left space-y-3 mx-auto max-w-sm">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">Booking ID</span>
                <strong className="text-slate-900 font-mono">{bookingId.substring(0, 8).toUpperCase()}</strong>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 text-sm">Status</span>
                <strong className="text-amber-500 text-sm font-bold">Awaiting Payment</strong>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isSubmitting}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(13,148,136,0.3)] hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay Now (₹${doctor.consultationFee || 500})`
              )}
            </button>
            <Link href="/portal" className="inline-block mt-4 text-sm text-slate-500 hover:text-slate-900 underline">
              Cancel & Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 md:p-16 shadow-2xl shadow-emerald-900/10 border border-slate-100 text-center space-y-8 animate-in zoom-in-95 duration-500 mt-12">
            <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-500 text-5xl mx-auto">
              ✓
            </div>
            
            <div>
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Consultation Confirmed!</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Thank you, <strong className="text-slate-900">{userName}</strong>. Payment received. Your video consultation with <strong className="text-teal-600">{doctor.name}</strong> is fully confirmed.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left space-y-3 mx-auto max-w-sm">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">Booking ID</span>
                <strong className="text-slate-900 font-mono">{bookingId.substring(0, 8).toUpperCase()}</strong>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 text-sm">Logistics</span>
                <strong className="text-teal-600 text-sm">Join via Dashboard</strong>
              </div>
            </div>

            <Link href="/portal" className="inline-block w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:scale-105">
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
