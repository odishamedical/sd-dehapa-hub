"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Activity, ShieldCheck, HeartPulse, Video, AlertCircle, ChevronRight, Stethoscope } from "lucide-react";

type DoctorTier = "Ayush" | "MBBS" | "Specialist" | "Super Specialist" | null;

export default function UrgentCareWizard() {
  const router = useRouter();
  
  // User Data
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userPhone, setUserPhone] = useState<string>("");
  
  // Wizard State
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<DoctorTier>(null);
  const [specialty, setSpecialty] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");
  
  // Simulating check state
  const [isChecking, setIsChecking] = useState(false);
  const [doctorsAvailable, setDoctorsAvailable] = useState(0);
  const [fee, setFee] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Auth check & prefill
    const email = localStorage.getItem("sd_current_user_email");
    const name = localStorage.getItem("sd_current_user_name");
    
    if (!email) {
      router.push("/login?redirect=/urgent-care");
      return;
    }
    
    setUserEmail(email);
    setUserName(name || "");
  }, [router]);

  const handleTierSelect = (tier: DoctorTier) => {
    setSelectedTier(tier);
    
    if (tier === "Ayush") setFee(300);
    else if (tier === "MBBS") setFee(500);
    else if (tier === "Specialist") setFee(1200);
    else if (tier === "Super Specialist") setFee(2500);

    if (tier === "Specialist" || tier === "Super Specialist") {
      setStep(2);
    } else {
      simulateCheckAvailability(tier);
    }
  };

  const handleSpecialtySelect = () => {
    if (!specialty) return alert("Please select a specialty");
    simulateCheckAvailability(selectedTier);
  };

  const simulateCheckAvailability = (tier: DoctorTier) => {
    setStep(3);
    setIsChecking(true);
    setTimeout(() => {
      // Fake number of available doctors based on tier
      let count = 0;
      if (tier === "Ayush") count = Math.floor(Math.random() * 20) + 15;
      if (tier === "MBBS") count = Math.floor(Math.random() * 15) + 10;
      if (tier === "Specialist") count = Math.floor(Math.random() * 5) + 3;
      if (tier === "Super Specialist") count = Math.floor(Math.random() * 3) + 1;
      
      setDoctorsAvailable(count);
      setIsChecking(false);
    }, 1500);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(5);
  };

  const handlePayment = async () => {
    try {
      setIsSubmitting(true);
      
      // We create a razorpay order for the urgent fee
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: fee, receipt: "URGENT_QUEUE" })
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
        name: "DehaPa Urgent Care",
        description: `Instant ${selectedTier} Consultation`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Verify payment
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
              // Add to urgentQueue
              const queueRef = await addDoc(collection(db, "urgentQueue"), {
                patientName: userName,
                patientEmail: userEmail,
                patientPhone: userPhone,
                symptoms,
                requiredTier: selectedTier,
                requiredSpecialty: specialty,
                feePaid: fee,
                paymentId: response.razorpay_payment_id,
                status: "waiting", // 'waiting', 'matched', 'completed'
                timestamp: serverTimestamp()
              });
              
              // Push to radar queue
              router.push(`/urgent-care/queue?id=${queueRef.id}`);
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
          color: "#e11d48" // Rose 600
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


  return (
    <div className="min-h-screen bg-[#050B14] font-sans pb-24 text-slate-200 selection:bg-teal-500/30 overflow-x-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* URGENT RED MESH GRADIENT */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-teal-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-teal-900/40 rounded-full blur-[120px]"></div>
      </div>

      <div className="pt-24 pb-12 px-6 relative z-10 border-b border-teal-500/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/50 text-teal-400 font-bold text-xs uppercase tracking-widest mb-4">
              <AlertCircle className="w-4 h-4 animate-pulse" /> Emergency Line
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 text-white">Instant Video Triage</h1>
            <p className="text-teal-200/70 text-sm md:text-base max-w-xl">Bypass the standard wait times. Connect with a highly qualified doctor within minutes securely.</p>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 relative z-20 mt-12">
        
        {/* Wizard Container */}
        <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
          
          {/* Step Indicators */}
          <div className="flex gap-2 mb-10">
            {[1,2,3,4,5].map((i) => (
               <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.6)]' : 'bg-white/10'}`}></div>
            ))}
          </div>

          {/* STEP 1: Tier Selection */}
          {step === 1 && (
            <div className="animate-in fade-in zoom-in duration-500">
              <h2 className="text-2xl font-black text-white mb-6">Which type of doctor do you need?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <button onClick={() => handleTierSelect('Ayush')} className="text-left bg-black/40 border border-white/10 hover:border-teal-400/50 rounded-2xl p-6 transition-all hover:bg-teal-500/5 group">
                  <h3 className="text-xl font-bold text-teal-300 mb-1 group-hover:text-teal-400">Ayush Doctor</h3>
                  <p className="text-sm text-slate-400">Homeopathy, Ayurveda, General Wellness</p>
                  <p className="text-xs font-bold text-teal-500 mt-4 tracking-widest uppercase">Est. Fee: ₹300</p>
                </button>

                <button onClick={() => handleTierSelect('MBBS')} className="text-left bg-black/40 border border-white/10 hover:border-teal-400/50 rounded-2xl p-6 transition-all hover:bg-teal-500/5 group">
                  <h3 className="text-xl font-bold text-teal-300 mb-1 group-hover:text-teal-400">MBBS Doctor</h3>
                  <p className="text-sm text-slate-400">General Physician, Common Illnesses</p>
                  <p className="text-xs font-bold text-teal-500 mt-4 tracking-widest uppercase">Est. Fee: ₹500</p>
                </button>

                <button onClick={() => handleTierSelect('Specialist')} className="text-left bg-black/40 border border-white/10 hover:border-teal-400/50 rounded-2xl p-6 transition-all hover:bg-teal-500/5 group">
                  <h3 className="text-xl font-bold text-teal-300 mb-1 group-hover:text-teal-400">Specialist</h3>
                  <p className="text-sm text-slate-400">Dermatologist, Pediatrician, Gynecologist, etc.</p>
                  <p className="text-xs font-bold text-teal-500 mt-4 tracking-widest uppercase">Est. Fee: ₹1200</p>
                </button>

                <button onClick={() => handleTierSelect('Super Specialist')} className="text-left bg-black/40 border border-white/10 hover:border-teal-400/50 rounded-2xl p-6 transition-all hover:bg-teal-500/5 group">
                  <h3 className="text-xl font-bold text-teal-300 mb-1 group-hover:text-teal-400">Super Specialist</h3>
                  <p className="text-sm text-slate-400">Cardiologist, Neurologist, Oncologist, etc.</p>
                  <p className="text-xs font-bold text-teal-500 mt-4 tracking-widest uppercase">Est. Fee: ₹2500</p>
                </button>

              </div>
            </div>
          )}

          {/* STEP 2: Sub Specialty */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <button onClick={() => setStep(1)} className="text-xs text-teal-400 font-bold uppercase tracking-widest mb-6 flex items-center gap-1 hover:text-teal-300">
                &larr; Back
              </button>
              <h2 className="text-2xl font-black text-white mb-2">Select a Specialty</h2>
              <p className="text-slate-400 mb-6">Help us route you to the correct {selectedTier?.toLowerCase()} immediately.</p>
              
              <select 
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold appearance-none mb-6"
              >
                <option value="">-- Choose a Specialty --</option>
                {selectedTier === 'Specialist' ? (
                  <>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                  </>
                ) : (
                  <>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Oncologist">Oncologist</option>
                    <option value="Endocrinologist">Endocrinologist</option>
                  </>
                )}
              </select>

              <button 
                onClick={handleSpecialtySelect}
                disabled={!specialty}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-colors shadow-[0_0_20px_rgba(20,184,166,0.4)]"
              >
                Continue to Availability Check
              </button>
            </div>
          )}

          {/* STEP 3: Availability Check */}
          {step === 3 && (
            <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center text-center py-10">
              {isChecking ? (
                <>
                  <div className="w-24 h-24 rounded-full border-4 border-teal-500/30 border-t-teal-500 animate-spin mb-6"></div>
                  <h2 className="text-2xl font-black text-white mb-2">Pinging the Network...</h2>
                  <p className="text-slate-400">Searching for available {specialty ? specialty : selectedTier} doctors online right now.</p>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">Excellent News!</h2>
                  <p className="text-slate-300 text-lg mb-8">
                    <strong className="text-emerald-400">{doctorsAvailable} {specialty ? specialty : selectedTier} Doctors</strong> are currently online and ready to take your call instantly.
                  </p>
                  <button onClick={() => setStep(4)} className="bg-teal-600 hover:bg-teal-500 px-10 py-4 rounded-full text-white font-bold shadow-[0_0_30px_rgba(20,184,166,0.5)] transition-all flex items-center gap-2">
                    Proceed to Registration <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* STEP 4: Symptoms & Details */}
          {step === 4 && (
             <div className="animate-in fade-in slide-in-from-right-8 duration-500">
               <button onClick={() => setStep(3)} className="text-xs text-teal-400 font-bold uppercase tracking-widest mb-6 flex items-center gap-1 hover:text-teal-300">
                 &larr; Back
               </button>
               <h2 className="text-2xl font-black text-white mb-6">Patient Pre-Registration</h2>
               
               <form onSubmit={handleDetailsSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Patient Name</label>
                     <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-teal-500/50 outline-none" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                     <input type="tel" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} required placeholder="+91 9999999999" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-teal-500/50 outline-none" />
                   </div>
                 </div>

                 <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Chief Symptoms (Brief)</label>
                   <textarea rows={3} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} required placeholder="E.g., High fever since morning, severe headache..." className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-teal-500/50 outline-none resize-none"></textarea>
                 </div>

                 <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 flex items-start gap-3">
                   <AlertCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                   <p className="text-xs text-teal-200/80 leading-relaxed">
                     Please ensure all details are accurate. A doctor will review your symptoms instantly. This is a non-refundable emergency consultation fee.
                   </p>
                 </div>

                 <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(20,184,166,0.4)]">
                   Continue to Secure Checkout
                 </button>
               </form>
             </div>
          )}

          {/* STEP 5: Payment */}
          {step === 5 && (
            <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center text-center">
               <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-teal-400 mb-6">
                 <Video className="w-8 h-8" />
               </div>
               <h2 className="text-3xl font-black text-white mb-2">Final Step: Secure Payment</h2>
               <p className="text-slate-400 mb-8 max-w-sm mx-auto">You are about to be connected with the next available <strong className="text-white">{specialty || selectedTier}</strong>.</p>
               
               <div className="w-full max-w-sm bg-black/40 border border-white/10 rounded-2xl p-6 mb-8">
                 <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                   <span className="text-slate-400">Consultation Tier</span>
                   <span className="font-bold text-white">{selectedTier}</span>
                 </div>
                 {specialty && (
                   <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                     <span className="text-slate-400">Specialty</span>
                     <span className="font-bold text-white">{specialty}</span>
                   </div>
                 )}
                 <div className="flex justify-between items-center text-lg">
                   <span className="text-slate-300 font-bold">Total Urgent Fee</span>
                   <span className="font-black text-teal-400">₹{fee}</span>
                 </div>
               </div>

               <button 
                 onClick={handlePayment} 
                 disabled={isSubmitting}
                 className="w-full max-w-sm bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-black text-lg py-4 rounded-xl shadow-[0_0_30px_rgba(20,184,166,0.5)] transition-all disabled:opacity-50"
               >
                 {isSubmitting ? 'Processing...' : `Pay ₹${fee} & Connect`}
               </button>
               <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest">Secured by Razorpay • 256-bit Encryption</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
