"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

type ConsultationMode = 'video_scheduled' | 'clinic' | 'video_urgent';

function BookAppointmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams?.get("doctor") || "";
  
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<any>(null);
  const [platformAds, setPlatformAds] = useState<any>({});

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);
  
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>('video_scheduled');

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
  const [clinicCode, setClinicCode] = useState<string | null>(null);

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

    const fetchAdsAndDoctor = async () => {
      // Fetch Ads
      try {
        const adsSnap = await getDocs(query(collection(db, 'platform_ads'), where('active', '==', true)));
        const adsData: any = {};
        adsSnap.forEach(d => {
          const ad = d.data();
          const slot = ad.slot || ad.slotId;
          if (slot && (ad.targetType === 'global' || !ad.targetType || (ad.targetType === 'specific_profile' && ad.targetId === docId))) {
            adsData[slot] = ad;
          }
        });
        setPlatformAds(adsData);
      } catch(e) {
        console.error("Failed to fetch ads", e);
      }

      // Fetch Doctor
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
    
    fetchAdsAndDoctor();
  }, [router, docId]);

  const getPricing = () => {
    if (!doctor) return { original: 0, discounted: 0 };
    
    let base = 500;
    if (doctor.consultationFee) {
      base = parseInt(doctor.consultationFee.toString());
    } else {
       const cat = (doctor.category || "").toLowerCase();
       if (cat.includes('super')) base = 1200;
       else if (cat.includes('specialist')) base = 800;
       else if (cat.includes('ayush')) base = 300;
       else base = 500;
    }

    if (consultationMode === 'video_urgent') {
      base = Math.floor(base * 1.5);
    }
    
    // Testing Phase Discount 
    const discounted = 500; // Hardcoded testing launch offer
    return { original: base, discounted: discounted };
  };

  const isTestAccount = doctor?.id === "68bKd57pRmlZHQbMdBFq" || doctor?.isTestAccount === true;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !userEmail) return;
    
    setIsSubmitting(true);
    try {
      const code = consultationMode === 'clinic' ? 'DH-' + Math.random().toString(36).substr(2, 5).toUpperCase() : null;
      setClinicCode(code);

      const pricing = getPricing();

      const appointmentData = {
        patientId: userUid,
        patientName: userName,
        patientEmail: userEmail,
        doctorId: doctor.id,
        doctorName: doctor.name,
        date: consultationMode === 'video_urgent' ? new Date().toISOString().split('T')[0] : selectedDate,
        timeSlot: consultationMode === 'video_urgent' ? 'Immediate' : selectedTime,
        symptoms: symptoms,
        status: "Pending", // Pending payment
        type: consultationMode === 'clinic' ? 'Clinic Visit' : (consultationMode === 'video_urgent' ? 'Urgent Video Call' : 'Telemedicine'),
        fee: pricing.discounted,
        originalFee: pricing.original,
        clinicEntryCode: code,
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

  const handleTestBypass = async () => {
    try {
      setIsSubmitting(true);
      await updateDoc(doc(db, "appointments", bookingId), {
        status: "Confirmed",
        paymentId: "TEST_BYPASS_" + Math.random().toString(36).substr(2, 9)
      });
      setPaymentSuccess(true);
    } catch(err) {
      console.error(err);
      alert("Test bypass failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsSubmitting(true);
      const pricing = getPricing();
      
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: pricing.discounted, receipt: bookingId })
      });
      const orderData = await res.json();
      
      if (!orderData.id) {
         alert("Failed to create payment order");
         setIsSubmitting(false);
         return;
      }

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
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center">
         <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center text-white">
         <div className="text-center">
           <h2 className="text-2xl font-bold mb-2">Doctor Not Found</h2>
           <Link href="/search" className="text-cyan-400 underline hover:text-cyan-300">Return to Directory</Link>
         </div>
      </div>
    );
  }

  const pricing = getPricing();

  return (
    <div className="min-h-screen bg-[#050B14] font-sans pb-24 text-slate-200 selection:bg-teal-500/30 overflow-x-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* MESH GRADIENT BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-teal-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/30 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[20%] w-[40vw] h-[40vw] bg-cyan-600/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Header Area */}
      <div className="pt-24 pb-12 px-6 relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Link href={`/profile/doctor/${doctor.id}`} className="inline-flex items-center gap-2 text-teal-300 hover:text-white text-sm font-bold uppercase tracking-widest mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Profile
            </Link>
            <h1 className="text-4xl md:text-5xl font-black mb-2 text-white">Secure Checkout</h1>
            <p className="text-slate-400 text-sm md:text-base max-w-xl">Complete your secure booking. All sessions and data are fully encrypted and HIPAA/FHIR-compliant.</p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 relative z-20 mt-12">
        {!bookingSuccess ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Doctor Summary & Ads */}
            <div className="lg:col-span-4 space-y-6">
              {/* Doctor Summary Card */}
              <div className="bg-white/10 backdrop-blur-3xl rounded-[2rem] p-6 shadow-[0_15px_40px_rgba(20,184,166,0.15)] border border-white/20 flex flex-col items-center text-center group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/20 shadow-[0_0_30px_rgba(20,184,166,0.3)] mb-4 bg-black/20">
                  <img src={doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0f766e&color=fff&size=150`} alt={doctor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h2 className="text-2xl font-black text-white">{doctor.name}</h2>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 font-bold text-sm uppercase tracking-wider mt-1">{doctor.specialty || doctor.category}</p>
                
                <div className="w-12 h-1 bg-white/10 rounded-full my-4"></div>
                
                <p className="text-slate-300 text-sm font-medium">{doctor.experience || "10+ Years"} Experience</p>
                <p className="text-slate-400 text-sm mt-1">{doctor.clinic?.name || "Verified Clinic"}</p>
                
                <div className="mt-8 w-full bg-black/40 rounded-2xl p-5 border border-white/10 flex flex-col gap-2 backdrop-blur-md relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-500/10 blur-xl rounded-full"></div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest text-left">Total Fee</span>
                  <div className="flex flex-col items-start gap-1">
                    <span className="line-through text-slate-500 font-bold">₹{pricing.original}</span>
                    <span className="text-emerald-400 font-black text-3xl">₹{pricing.discounted} <span className="text-xs text-emerald-500 uppercase tracking-widest ml-1">(Launch Offer)</span></span>
                  </div>
                </div>
              </div>

              {/* Secure Guarantee */}
              <div className="bg-emerald-500/10 rounded-[2rem] p-6 border border-emerald-500/30 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 blur-2xl"></div>
                <h4 className="font-bold text-emerald-300 flex items-center gap-2 mb-3 relative z-10">
                  <svg className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Secure Guarantee
                </h4>
                <p className="text-emerald-100/70 text-xs leading-relaxed relative z-10">Your medical data is protected. This session is fully encrypted and never recorded without your explicit consent.</p>
              </div>

              {/* AD SLOT */}
              {platformAds['ad_slot_booking_sidebar'] && (
                <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-4 border border-white/10 group overflow-hidden">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3 text-center">Advertisement</p>
                  <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-[0_5px_20px_rgba(0,0,0,0.3)]">
                    {platformAds['ad_slot_booking_sidebar'].link ? (
                      <a href={platformAds['ad_slot_booking_sidebar'].link} target="_blank" rel="noopener noreferrer">
                        <img src={platformAds['ad_slot_booking_sidebar'].imageUrl} alt="Advertisement" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                      </a>
                    ) : (
                      <img src={platformAds['ad_slot_booking_sidebar'].imageUrl} alt="Advertisement" className="w-full h-auto object-cover" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Booking Form */}
            <div className="lg:col-span-8">
              <div className="bg-white/10 backdrop-blur-3xl rounded-[2rem] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 relative overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 blur-[100px] rounded-full"></div>
                
                <h3 className="text-3xl font-black text-white mb-8 relative z-10">Consultation Setup</h3>
                
                <form onSubmit={handleBook} className="space-y-8 text-left relative z-10">
                  
                  {/* Mode Selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Mode</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Clinic Visit */}
                      <button type="button" onClick={() => setConsultationMode('clinic')} className={`p-4 rounded-2xl border text-left transition-all ${consultationMode === 'clinic' ? 'bg-emerald-500/20 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-black/20 border-white/10 hover:border-emerald-400/30'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${consultationMode === 'clinic' ? 'bg-emerald-400 text-black' : 'bg-white/10 text-emerald-400'}`}>🏥</div>
                        <h4 className={`font-bold ${consultationMode === 'clinic' ? 'text-emerald-300' : 'text-slate-300'}`}>Clinic Visit</h4>
                        <p className="text-xs text-slate-500 mt-1">Visit the doctor in person</p>
                      </button>

                      {/* Scheduled Video */}
                      <button type="button" onClick={() => setConsultationMode('video_scheduled')} className={`p-4 rounded-2xl border text-left transition-all ${consultationMode === 'video_scheduled' ? 'bg-cyan-500/20 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-black/20 border-white/10 hover:border-cyan-400/30'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${consultationMode === 'video_scheduled' ? 'bg-cyan-400 text-black' : 'bg-white/10 text-cyan-400'}`}>📅</div>
                        <h4 className={`font-bold ${consultationMode === 'video_scheduled' ? 'text-cyan-300' : 'text-slate-300'}`}>Video Call</h4>
                        <p className="text-xs text-slate-500 mt-1">Book a secure virtual session</p>
                      </button>

                      {/* Urgent Video */}
                      <button type="button" onClick={() => setConsultationMode('video_urgent')} className={`p-4 rounded-2xl border text-left transition-all ${consultationMode === 'video_urgent' ? 'bg-rose-500/20 border-rose-400/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : 'bg-black/20 border-white/10 hover:border-rose-400/30'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${consultationMode === 'video_urgent' ? 'bg-rose-400 text-black' : 'bg-white/10 text-rose-400'}`}>⚡</div>
                        <h4 className={`font-bold ${consultationMode === 'video_urgent' ? 'text-rose-300' : 'text-slate-300'}`}>Urgent Call</h4>
                        <p className="text-xs text-slate-500 mt-1">Connect immediately (Premium)</p>
                      </button>

                    </div>
                  </div>

                  {consultationMode !== 'video_urgent' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date of Consultation</label>
                        <input 
                          type="date" 
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all font-semibold"
                          style={{ colorScheme: 'dark' }}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time Slot</label>
                          <span className="text-[10px] font-bold text-teal-300 bg-teal-500/20 border border-teal-500/30 px-2 py-1 rounded-md backdrop-blur-md">IST (GMT+5:30)</span>
                        </div>
                        <select 
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          required
                          className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all font-semibold appearance-none"
                        >
                          {["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:30 AM", "02:00 PM", "03:00 PM", "04:30 PM", "06:00 PM"].map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in zoom-in duration-300">
                       <div className="w-10 h-10 rounded-full bg-rose-500/20 flex flex-shrink-0 items-center justify-center text-rose-400 text-xl font-bold">!</div>
                       <div>
                         <h4 className="font-bold text-rose-300">Immediate Consultation Required</h4>
                         <p className="text-sm text-rose-100/70 mt-1">You are requesting an urgent connection. The doctor will be notified immediately upon payment confirmation. Premium pricing (1.5x) is applied.</p>
                       </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chief Symptoms / Reason</label>
                    <textarea 
                      rows={4}
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Please briefly describe your symptoms (e.g. Mild fever since yesterday, headache)..."
                      required
                      className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all font-semibold resize-none placeholder-slate-600"
                    />
                  </div>

                  <div className="pt-8 border-t border-white/10">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-400/50 rounded-2xl shadow-[inset_0_0_20px_rgba(16,185,129,0.2),0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.4),0_0_25px_rgba(16,185,129,0.5)] font-black text-sm uppercase tracking-widest backdrop-blur-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Generating Order...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                          Proceed to Payment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : !paymentSuccess ? (
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-3xl rounded-[2rem] p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 text-center space-y-8 animate-in zoom-in-95 duration-500 mt-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none"></div>
            
            <div className="w-24 h-24 rounded-full bg-black/20 border-2 border-teal-500/30 shadow-[0_0_30px_rgba(20,184,166,0.2)] flex items-center justify-center text-teal-400 mx-auto relative z-10 backdrop-blur-md">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Pending Payment</h3>
              <p className="text-slate-300 leading-relaxed text-lg">
                Your <span className="font-bold text-white uppercase">{consultationMode.replace('_', ' ')}</span> with <strong className="text-teal-400">{doctor.name}</strong> is temporarily reserved. Complete payment to confirm.
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-6 text-left space-y-3 mx-auto max-w-sm relative z-10 backdrop-blur-md">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-slate-400 text-sm">Booking ID</span>
                <strong className="text-white font-mono">{bookingId.substring(0, 8).toUpperCase()}</strong>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400 text-sm">Status</span>
                <strong className="text-amber-400 text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Awaiting Payment
                </strong>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isSubmitting}
              className="w-full py-5 bg-teal-500/20 hover:bg-teal-500/40 text-teal-300 border border-teal-400/50 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-[inset_0_0_20px_rgba(20,184,166,0.2),0_0_15px_rgba(20,184,166,0.2)] hover:shadow-[inset_0_0_20px_rgba(20,184,166,0.4),0_0_25px_rgba(20,184,166,0.5)] backdrop-blur-xl relative z-10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay Now (₹${pricing.discounted})`
              )}
            </button>
            
            {isTestAccount && (
              <button 
                onClick={handleTestBypass}
                disabled={isSubmitting}
                className="w-full py-4 mt-2 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 border border-indigo-400/50 rounded-2xl text-xs font-black uppercase tracking-widest transition-all backdrop-blur-xl relative z-10 flex items-center justify-center gap-2"
              >
                🛠 Bypass Payment (Test Mode)
              </button>
            )}

            <Link href="/portal" className="inline-block mt-4 text-sm text-slate-400 hover:text-white transition-colors relative z-10">
              Cancel & Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-3xl rounded-[2rem] p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 text-center space-y-8 animate-in zoom-in-95 duration-500 mt-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none"></div>

            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center justify-center text-emerald-400 text-5xl mx-auto relative z-10 backdrop-blur-xl">
              ✓
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Consultation Confirmed!</h3>
              <p className="text-slate-300 leading-relaxed text-lg">
                Thank you, <strong className="text-white">{userName}</strong>. Payment received. Your <span className="font-bold text-white uppercase">{consultationMode.replace('_', ' ')}</span> with <strong className="text-teal-400">{doctor.name}</strong> is fully confirmed.
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-6 text-left space-y-3 mx-auto max-w-sm relative z-10 backdrop-blur-md">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-slate-400 text-sm">Booking ID</span>
                <strong className="text-white font-mono">{bookingId.substring(0, 8).toUpperCase()}</strong>
              </div>
              
              {consultationMode === 'clinic' ? (
                <div className="pt-2 text-center">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block mb-2">Clinic Entry Code</span>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 inline-block">
                    <strong className="text-emerald-400 text-3xl font-mono tracking-[0.2em]">{clinicCode}</strong>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">Please show this code at the reception desk.</p>
                </div>
              ) : (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400 text-sm">Logistics</span>
                  <strong className="text-teal-400 text-sm font-bold">Join via Dashboard</strong>
                </div>
              )}
            </div>

            <Link href="/portal" className="inline-block w-full py-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-xl relative z-10">
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
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    }>
      <BookAppointmentForm />
    </Suspense>
  );
}
