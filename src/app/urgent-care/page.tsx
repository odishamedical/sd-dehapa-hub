"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Activity, ShieldCheck, HeartPulse, Video, AlertCircle, ChevronRight, Stethoscope, ArrowLeft, Home, User } from "lucide-react";

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
  
  // Dynamic Data
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [availableDoctorsList, setAvailableDoctorsList] = useState<any[]>([]);
  
  // Simulating check state
  const [isChecking, setIsChecking] = useState(false);
  const [fee, setFee] = useState(0);
  const [pricingMap, setPricingMap] = useState<any>({
    ayush: 200,
    ayushMarket: 400,
    mbbs: 250,
    mbbsMarket: 500,
    specialist: 400,
    specialistMarket: 800,
    superSpecialist: 500,
    superSpecialistMarket: 1000
  });

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

  // Load dynamic specialties
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const dirSnap = await getDocs(query(collection(db, 'directory'), where('category', '==', 'Doctor')));
        const specs = new Set<string>();
        dirSnap.forEach(doc => {
          const data = doc.data();
          if (data.primarySpecialty && (data.doctorTier === 'Specialist' || data.doctorTier === 'Super Specialist')) {
            specs.add(data.primarySpecialty);
          }
        });
        setSpecialties(Array.from(specs).sort());
      } catch (err) {
        console.error("Error fetching specialties:", err);
      }
    };
    
    const fetchPricing = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'platform_settings', 'pricing'));
        if (docSnap.exists()) {
          setPricingMap(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching pricing:", err);
      }
    };

    fetchSpecialties();
    fetchPricing();
  }, []);

  const handleTierSelect = (tier: DoctorTier) => {
    setSelectedTier(tier);
    setSpecialty(""); // Reset specialty
    
    // Use dynamic pricing from Firebase
    if (tier === "Ayush") setFee(pricingMap.ayush || 200);
    else if (tier === "MBBS") setFee(pricingMap.mbbs || 250);
    else if (tier === "Specialist") setFee(pricingMap.specialist || 400);
    else if (tier === "Super Specialist") setFee(pricingMap.superSpecialist || 500);

    if (tier === "Specialist" || tier === "Super Specialist") {
      setStep(2);
    } else {
      checkAvailability(tier, "");
    }
  };

  const handleSpecialtySelect = () => {
    if (!specialty) return alert("Please select a specialty");
    checkAvailability(selectedTier, specialty);
  };

  const checkAvailability = async (tier: DoctorTier, spec: string) => {
    setStep(3);
    setIsChecking(true);
    
    try {
      // 1. Find all online doctors from doctor_status
      const statusSnap = await getDocs(query(collection(db, 'doctor_status'), where('isOnline', '==', true)));
      const onlineIds = statusSnap.docs.map(d => d.id);
      
      if (onlineIds.length === 0) {
        setAvailableDoctorsList([]);
        setIsChecking(false);
        return;
      }

      // 2. Fetch those doctors from directory to check tier/specialty
      const dirSnap = await getDocs(query(collection(db, 'directory'), where('category', '==', 'Doctor')));
      const matched: any[] = [];
      
      dirSnap.forEach(doc => {
        const data = doc.data();
        if (onlineIds.includes(doc.id)) {
          // Normalize tier
          let dTier = data.doctorTier;
          if (!dTier) {
             // Fallback inference if missing
             if (data.primarySpecialty) dTier = "Specialist";
             else dTier = "MBBS";
          }
          
          if (tier === "Specialist" || tier === "Super Specialist") {
             if (dTier === tier && data.primarySpecialty === spec) {
                matched.push(data);
             }
          } else {
             if (dTier === tier) {
                matched.push(data);
             }
          }
        }
      });
      
      setAvailableDoctorsList(matched);
      
    } catch (err) {
      console.error("Availability check failed", err);
      setAvailableDoctorsList([]);
    }
    
    setIsChecking(false);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(5);
  };

  const handlePayment = async () => {
    try {
      setIsSubmitting(true);
      
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
              const queueRef = await addDoc(collection(db, "urgentQueue"), {
                patientName: userName,
                patientEmail: userEmail,
                patientPhone: userPhone,
                symptoms,
                requiredTier: selectedTier,
                requiredSpecialty: specialty,
                feePaid: fee,
                paymentId: response.razorpay_payment_id,
                status: "waiting",
                timestamp: serverTimestamp()
              });
              
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
          color: "#0d9488" // teal-600
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
      
      {/* Navigation Top Bar */}
      <div className="fixed top-0 left-0 right-0 p-4 z-50 flex items-center justify-between pointer-events-none">
        <Link href="/" className="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold transition-all shadow-lg">
          <Home className="w-4 h-4" /> Home
        </Link>
      </div>

      {/* URGENT TEAL MESH GRADIENT */}
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
                
                <button onClick={() => handleTierSelect('Ayush')} className="text-left bg-black/40 border border-white/10 hover:border-teal-400/50 rounded-2xl p-6 transition-all hover:bg-teal-500/5 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-teal-600/30 text-teal-300 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg shadow-sm border-l border-b border-teal-500/30 flex items-center gap-1"><HeartPulse className="w-3 h-3" /> Subsidized Care</div>
                  <h3 className="text-xl font-bold text-teal-300 mb-1 group-hover:text-teal-400">Ayush Doctor</h3>
                  <p className="text-sm text-slate-400">Homeopathy, Ayurveda, General Wellness</p>
                  <div className="mt-4 flex flex-col gap-0.5">
                     <p className="text-xs font-medium text-slate-400">Market fee: <span className="line-through">₹{pricingMap.ayushMarket || (pricingMap.ayush ? pricingMap.ayush * 2 : 400)}</span></p>
                     <p className="text-xl font-black text-emerald-400">Subsidized fee: ₹{pricingMap.ayush || 200}</p>
                  </div>
                </button>

                <button onClick={() => handleTierSelect('MBBS')} className="text-left bg-black/40 border border-white/10 hover:border-teal-400/50 rounded-2xl p-6 transition-all hover:bg-teal-500/5 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-teal-600/30 text-teal-300 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg shadow-sm border-l border-b border-teal-500/30 flex items-center gap-1"><HeartPulse className="w-3 h-3" /> Subsidized Care</div>
                  <h3 className="text-xl font-bold text-teal-300 mb-1 group-hover:text-teal-400">MBBS Doctor</h3>
                  <p className="text-sm text-slate-400">General Physician, Common Illnesses</p>
                  <div className="mt-4 flex flex-col gap-0.5">
                     <p className="text-xs font-medium text-slate-400">Market fee: <span className="line-through">₹{pricingMap.mbbsMarket || (pricingMap.mbbs ? pricingMap.mbbs * 2 : 500)}</span></p>
                     <p className="text-xl font-black text-emerald-400">Subsidized fee: ₹{pricingMap.mbbs || 250}</p>
                  </div>
                </button>

                <button onClick={() => handleTierSelect('Specialist')} className="text-left bg-black/40 border border-white/10 hover:border-teal-400/50 rounded-2xl p-6 transition-all hover:bg-teal-500/5 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-teal-600/30 text-teal-300 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg shadow-sm border-l border-b border-teal-500/30 flex items-center gap-1"><HeartPulse className="w-3 h-3" /> Subsidized Care</div>
                  <h3 className="text-xl font-bold text-teal-300 mb-1 group-hover:text-teal-400">Specialist</h3>
                  <p className="text-sm text-slate-400">Dermatologist, Pediatrician, Gynecologist, etc.</p>
                  <div className="mt-4 flex flex-col gap-0.5">
                     <p className="text-xs font-medium text-slate-400">Market fee: <span className="line-through">₹{pricingMap.specialistMarket || (pricingMap.specialist ? pricingMap.specialist * 2 : 800)}</span></p>
                     <p className="text-xl font-black text-emerald-400">Subsidized fee: ₹{pricingMap.specialist || 400}</p>
                  </div>
                </button>

                <button onClick={() => handleTierSelect('Super Specialist')} className="text-left bg-black/40 border border-white/10 hover:border-teal-400/50 rounded-2xl p-6 transition-all hover:bg-teal-500/5 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-teal-600/30 text-teal-300 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg shadow-sm border-l border-b border-teal-500/30 flex items-center gap-1"><HeartPulse className="w-3 h-3" /> Subsidized Care</div>
                  <h3 className="text-xl font-bold text-teal-300 mb-1 group-hover:text-teal-400">Super Specialist</h3>
                  <p className="text-sm text-slate-400">Cardiologist, Neurologist, Oncologist, etc.</p>
                  <div className="mt-4 flex flex-col gap-0.5">
                     <p className="text-xs font-medium text-slate-400">Market fee: <span className="line-through">₹{pricingMap.superSpecialistMarket || (pricingMap.superSpecialist ? pricingMap.superSpecialist * 2 : 1000)}</span></p>
                     <p className="text-xl font-black text-emerald-400">Subsidized fee: ₹{pricingMap.superSpecialist || 500}</p>
                  </div>
                </button>

              </div>
            </div>
          )}

          {/* STEP 2: Sub Specialty */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 relative">
              <button onClick={() => setStep(1)} className="text-xs text-teal-400 font-bold uppercase tracking-widest mb-6 flex items-center gap-1 hover:text-teal-300 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Tiers
              </button>
              <h2 className="text-2xl font-black text-white mb-2">Select a Specialty</h2>
              <p className="text-slate-400 mb-6">Help us route you to the correct {selectedTier?.toLowerCase()} immediately.</p>
              
              <select 
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold appearance-none mb-6"
              >
                <option value="">-- Choose a Specialty --</option>
                {specialties.length > 0 ? (
                  specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))
                ) : (
                  <>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Orthopedic">Orthopedic</option>
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

          {/* STEP 3: Availability Check & Confidence Dashboard */}
          {step === 3 && (
            <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center text-center py-4 relative">
              <div className="w-full flex justify-start mb-4">
                <button onClick={() => setStep(selectedTier === 'Specialist' || selectedTier === 'Super Specialist' ? 2 : 1)} className="text-xs text-teal-400 font-bold uppercase tracking-widest flex items-center gap-1 hover:text-teal-300 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              </div>
              
              {isChecking ? (
                <div className="py-12">
                  <div className="w-24 h-24 rounded-full border-4 border-teal-500/30 border-t-teal-500 animate-spin mb-6 mx-auto"></div>
                  <h2 className="text-2xl font-black text-white mb-2">Pinging the Network...</h2>
                  <p className="text-slate-400">Searching for available {specialty ? specialty : selectedTier} doctors online right now.</p>
                </div>
              ) : (
                <>
                  {availableDoctorsList.length > 0 ? (
                    <>
                      <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] mx-auto">
                        <ShieldCheck className="w-10 h-10" />
                      </div>
                      <h2 className="text-3xl font-black text-white mb-2">Excellent News!</h2>
                      <p className="text-slate-300 text-lg mb-8">
                        <strong className="text-emerald-400">{availableDoctorsList.length} {specialty ? specialty : selectedTier} Doctors</strong> are currently online and ready to take your call instantly.
                      </p>
                      
                      {/* Confidence Dashboard Gallery */}
                      <div className="w-full max-w-2xl bg-black/40 border border-white/10 rounded-2xl p-6 mb-8 overflow-hidden text-left shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                           <h4 className="font-bold text-slate-300 text-sm">Verified Doctors Online Now</h4>
                           <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-500 tracking-widest"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Network</span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                          {availableDoctorsList.map((doc, idx) => (
                            <div key={idx} className="shrink-0 w-32 bg-white/5 border border-white/10 rounded-xl p-3 text-center flex flex-col items-center hover:bg-white/10 transition-colors cursor-default">
                               <div className="w-12 h-12 rounded-full bg-slate-800 mb-2 overflow-hidden border border-slate-600 shadow-sm">
                                  {doc.image ? (
                                     <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                                  ) : (
                                     <User className="w-full h-full p-2 text-slate-500" />
                                  )}
                               </div>
                               <p className="text-xs font-bold text-white truncate w-full">{doc.name || 'Doctor'}</p>
                               <p className="text-[10px] text-teal-400 truncate w-full">{doc.primarySpecialty || doc.doctorTier}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
                          <Link href="/doctors" className="text-xs text-slate-400 hover:text-white font-bold transition-colors">
                            Prefer to choose? Browse Online Directory &rarr;
                          </Link>
                        </div>
                      </div>

                      <button onClick={() => setStep(4)} className="bg-teal-600 hover:bg-teal-500 px-10 py-4 rounded-full text-white font-bold shadow-[0_0_30px_rgba(20,184,166,0.5)] transition-all flex items-center gap-2">
                        Proceed to Registration <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <div className="py-8">
                      {/* Zero Doctors Fallback */}
                      <div className="w-24 h-24 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-6 mx-auto">
                        <AlertCircle className="w-10 h-10" />
                      </div>
                      <h2 className="text-3xl font-black text-white mb-4">System Currently Busy</h2>
                      <p className="text-slate-300 text-lg mb-8 max-w-md mx-auto">
                        We currently have <strong className="text-rose-400">0</strong> {specialty ? specialty : selectedTier} doctors online right now. 
                        Please check back again later or browse our directory to book an appointment.
                      </p>
                      <Link href="/doctors" className="bg-slate-800 hover:bg-slate-700 px-8 py-4 rounded-full text-white font-bold transition-all inline-flex items-center gap-2 shadow-md border border-slate-700">
                        Browse Directory
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 4: Symptoms & Details */}
          {step === 4 && (
             <div className="animate-in fade-in slide-in-from-right-8 duration-500 relative">
               <button onClick={() => setStep(3)} className="text-xs text-teal-400 font-bold uppercase tracking-widest mb-6 flex items-center gap-1 hover:text-teal-300 transition-colors">
                 <ArrowLeft className="w-4 h-4" /> Back
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
            <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center text-center relative">
               <div className="w-full flex justify-start mb-2">
                 <button onClick={() => setStep(4)} className="text-xs text-teal-400 font-bold uppercase tracking-widest flex items-center gap-1 hover:text-teal-300 transition-colors">
                   <ArrowLeft className="w-4 h-4" /> Back
                 </button>
               </div>
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
                   <div className="flex flex-col items-end">
                     <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1 bg-emerald-500/10 px-2 py-0.5 rounded">50% Launch Discount</span>
                     <span className="font-black text-teal-400 text-2xl">₹{fee}</span>
                   </div>
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
