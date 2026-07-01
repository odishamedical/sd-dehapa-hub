"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, addDoc, doc, getDoc, onSnapshot } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8",
  authDomain: "sd-auth-center.firebaseapp.com",
  projectId: "sd-auth-center",
  storageBucket: "sd-auth-center.firebasestorage.app",
  messagingSenderId: "393346058191",
  appId: "1:393346058191:web:a5e96e1c481a72f86db4ba"
};

type FlowStep = "urgency" | "triage_tier" | "triage_dept" | "doctor_list" | "datetime_picker" | "payment_gate" | "auth_gate" | "connecting";

export default function GlobalTelemedicineFAB() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<FlowStep>("urgency");
  
  // Selections
  const [urgencyMode, setUrgencyMode] = useState<"urgent" | "schedule" | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Schedule Specific State
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");

  // Data
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [selectedDoctorForDirectCall, setSelectedDoctorForDirectCall] = useState<any | null>(null);
  
  // Auth
  const [userUid, setUserUid] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Smart Patient Selector State
  const [patientOptions, setPatientOptions] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("myself");

  // Payment State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<"direct" | "broadcast">("direct");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserUid(localStorage.getItem("sd_current_user_uid"));
      setUserName(localStorage.getItem("sd_current_user_name"));
      
      const listener = (e: any) => {
        setIsOpen(true);
        resetSelections();
        
        const action = e.detail?.action;
        const doctorId = e.detail?.doctorId;
        const doctorName = e.detail?.doctorName;
        
        if (action === 'urgent' || action === 'schedule') {
          setUrgencyMode(action);
          
          if (doctorId) {
            // Direct ping from profile bypasses triage
            const mockDoc = { id: doctorId, name: doctorName || 'Doctor', fee: action === 'urgent' ? 999 : 500 };
            initiateDirectCall(mockDoc, action);
          } else {
            setStep("triage_tier");
          }
        } else {
          setStep("urgency");
        }
      };
      
      window.addEventListener('open-telemedicine-fab', listener);

      // Fetch User Identity and Family Members for Smart Selector
      const uid = localStorage.getItem("sd_current_user_uid");
      if (uid) {
        const fetchPatientData = async () => {
          try {
            const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
            const db = getFirestore(app);
            
            const options: any[] = [];
            
            // Fetch Primary Identity & Family Members from User Document
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const identity = userData.identity || {};
              const family = userData.familyMembers || [];

              // Primary User
              options.push({
                id: "myself",
                name: identity.fullName || localStorage.getItem("sd_current_user_name") || "Myself",
                age: identity.age || "",
                sex: identity.sex || "",
                phone: identity.phone || "",
                whatsapp: identity.whatsappNumber || ""
              });
              
              // Pre-fill if myself
              setPhone(identity.phone || "");
              setWhatsapp(identity.whatsappNumber || "");
              setAge(identity.age || "");
              setGender(identity.sex || "");

              // Family Members
              if (Array.isArray(family)) {
                family.forEach((member: any) => {
                  if (member && member.name) {
                    options.push({
                      id: member.id || Math.random().toString(),
                      name: member.name || "Family Member",
                      age: member.age || "",
                      sex: member.gender || "",
                      phone: options[0]?.phone || "",
                      whatsapp: options[0]?.whatsapp || ""
                    });
                  }
                });
              }
            } else {
              options.push({ id: "myself", name: "Myself", age: "", sex: "", phone: "", whatsapp: "" });
            }

            setPatientOptions(options);
          } catch (e) {
            console.error("Error fetching patient data", e);
          }
        };
        fetchPatientData();
      }

      return () => window.removeEventListener('open-telemedicine-fab', listener);
    }
  }, []);

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedPatientId(val);
    const selected = patientOptions.find(p => p.id === val);
    if (selected) {
      setAge(selected.age || "");
      setGender(selected.sex || "");
      setPhone(selected.phone || "");
      setWhatsapp(selected.whatsapp || "");
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setStep("urgency");
    resetSelections();
  };

  const handleClose = () => setIsOpen(false);

  const resetSelections = () => {
    setUrgencyMode(null);
    setSelectedTier("");
    setSelectedDept("");
    setScheduledDate("");
    setScheduledTime("");
    setDoctorsList([]);
    setSelectedDoctorForDirectCall(null);
    setSearchQuery("");
  };

  const handleBack = () => {
    if (step === "triage_tier") setStep("urgency");
    else if (step === "triage_dept") setStep("triage_tier");
    else if (step === "doctor_list") {
      if (!selectedTier) setStep("urgency");
      else setStep(selectedTier === "General" ? "triage_tier" : "triage_dept");
    }
    else if (step === "datetime_picker") setStep("doctor_list");
    else if (step === "payment_gate") setStep(urgencyMode === "schedule" ? "datetime_picker" : "doctor_list");
    else if (step === "auth_gate") setStep("payment_gate");
  };

  // 1. Initial Selection or Quick Jump
  const handleUrgencySelect = (mode: "urgent" | "schedule") => {
    setUrgencyMode(mode);
    setStep("triage_tier");
  };

  const handleQuickJump = (dept: string) => {
    setUrgencyMode("urgent");
    setSelectedDept(dept);
    fetchDoctors("urgent", dept);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 2) {
      handleQuickJump(searchQuery.trim());
    }
  };

  // 2. Triage Steps
  const handleTierSelect = (tier: string) => {
    setSelectedTier(tier);
    if (tier === "General") {
      setSelectedDept("General Physician");
      fetchDoctors(urgencyMode!, "General Physician");
    } else {
      setStep("triage_dept");
    }
  };

  const handleDeptSelect = (dept: string) => {
    setSelectedDept(dept);
    fetchDoctors(urgencyMode!, dept);
  };

  // 3. Fetch Data
  const fetchDoctors = async (mode: "urgent" | "schedule", dept: string) => {
    setStep("doctor_list");
    setIsLoadingDoctors(true);
    
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app, "default");
    
    try {
      // Step 1: Find online doctors (for schedule we could skip this and just search directory, but let's assume we want active doctors)
      const statusQuery = query(collection(db, "doctor_status"), where("isOnline", "==", true));
      const statusSnap = await getDocs(statusQuery);
      
      const onlineUids = statusSnap.docs.map(doc => doc.id);
      
      if (onlineUids.length === 0) {
        setDoctorsList([]);
        setIsLoadingDoctors(false);
        return;
      }

      // Step 2: Fetch their profiles from directory (mocking the join for UI demonstration, in production use Cloud Function or limit(10) in queries)
      // For real flow, we iterate over onlineUids and getDoc
      const fetchedDoctors = [];
      for (const uid of onlineUids) {
        const docRef = doc(db, "directory", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Filter logic
          const matchesDept = data.specialty?.toLowerCase().includes(dept.toLowerCase()) || dept === "General Physician";
          const hasTelemedicine = mode === "schedule" ? data.isTelemedicineEnabled : data.isUrgentPingEnabled;
          
          if (matchesDept && hasTelemedicine) {
            fetchedDoctors.push({
              id: uid,
              name: data.entityName || "Dr. Online",
              specialty: data.specialty || dept,
              qualifications: data.qualifications || "MBBS, MD",
              fee: mode === "schedule" ? (data.scheduledConsultFee || 500) : (data.urgentPingFee || 999),
              rating: data.rating || 4.8,
              reviews: data.reviewCount || 120,
              photo: data.logoUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(data.entityName || "Doctor") + "&background=0D8ABC&color=fff"
            });
          }
        }
      }

      // If no data exists, we provide mock data just so the UI can be tested robustly without seeding Firestore
      if (fetchedDoctors.length === 0) {
        setDoctorsList([
          { id: "mock_doc_1", name: "Dr. Anjali Dash", specialty: dept, qualifications: "MBBS, MD (Med)", fee: mode === "schedule" ? 500 : 1200, rating: 4.9, reviews: 342, photo: "https://ui-avatars.com/api/?name=Anjali+Dash&background=047857&color=fff" },
          { id: "mock_doc_2", name: "Dr. Rajesh Kumar", specialty: dept, qualifications: "MBBS, MS", fee: mode === "schedule" ? 400 : 999, rating: 4.7, reviews: 156, photo: "https://ui-avatars.com/api/?name=Rajesh+Kumar&background=be123c&color=fff" },
          { id: "mock_doc_3", name: "Dr. Sarah Mishra", specialty: dept, qualifications: "MBBS, DNB", fee: mode === "schedule" ? 600 : 1500, rating: 4.9, reviews: 520, photo: "https://ui-avatars.com/api/?name=Sarah+Mishra&background=1d4ed8&color=fff" }
        ]);
      } else {
        setDoctorsList(fetchedDoctors);
      }

    } catch (err) {
      console.error("Error fetching doctors", err);
      // Fallback mock data for beautiful UI demonstration if DB fails
      setDoctorsList([
        { id: "mock_doc_1", name: "Dr. Anjali Dash", specialty: dept, qualifications: "MBBS, MD (Med)", fee: mode === "schedule" ? 500 : 1200, rating: 4.9, reviews: 342, photo: "https://ui-avatars.com/api/?name=Anjali+Dash&background=047857&color=fff" },
      ]);
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  // 4. Action Decision (Direct vs Broadcast)
  const initiateDirectCall = (doctor: any, modeOverride?: string) => {
    setSelectedDoctorForDirectCall(doctor);
    setPaymentAmount(Number(doctor.fee));
    setPaymentType("direct");
    
    if ((modeOverride || urgencyMode) === "schedule") {
      setStep("datetime_picker");
    } else {
      // Direct call bypasses payment, but must always collect contact info & symptoms
      setStep("auth_gate");
    }
  };

  const confirmDateTime = () => {
    if (!scheduledDate || !scheduledTime) return alert("Please select both date and time.");
    setStep("payment_gate");
  };

  const initiateBroadcastPing = () => {
    if (doctorsList.length === 0) return;
    
    // Find the maximum fee among available doctors for the Auth & Capture hold
    const maxFee = Math.max(...doctorsList.map(d => Number(d.fee)));
    
    setSelectedDoctorForDirectCall(null);
    setPaymentAmount(maxFee);
    setPaymentType("broadcast");
    setStep("payment_gate");
  };

  // 5. Payment Gate
  const handlePaymentSuccess = () => {
    setIsProcessingPayment(true);
    // Mocking Razorpay delay
    setTimeout(() => {
      setIsProcessingPayment(false);
      // If user not logged in, go to auth gate. Otherwise straight to connecting.
      if (userUid) {
        createConsultationRequest(userUid, userName || "Patient");
      } else {
        setStep("auth_gate");
      }
    }, 1500);
  };

  // 6. Auth Gate
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !whatsapp) return alert("Phone and WhatsApp are mandatory.");
    
    setIsAuthenticating(true);

    if (userUid) {
      // User is already logged in, just submit the form
      createConsultationRequest(userUid, userName || "Patient", false);
      return;
    }

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      localStorage.setItem("sd_current_user_uid", user.uid);
      localStorage.setItem("sd_current_user_email", user.email || "");
      localStorage.setItem("sd_current_user_name", user.displayName || "Patient");
      
      setUserUid(user.uid);
      setUserName(user.displayName);
      
      createConsultationRequest(user.uid, user.displayName || "Patient", false);
    } catch (err) {
      console.error("Auth failed", err);
      alert("Authentication failed.");
      setIsAuthenticating(false);
    }
  };

  // 7. Final Connecting State
  const createConsultationRequest = async (patientId: string, pName: string, forceDirectTest = false) => {
    setStep("connecting");
    // Use imported db instead of re-initializing to avoid named DB errors
    const { db } = await import('@/lib/firebase');
    
    try {
      if (urgencyMode === "schedule") {
        const appointmentPayload = {
          providerId: selectedDoctorForDirectCall?.id || "",
          patientName: pName,
          patientPhone: phone,
          patientEmail: "",
          date: scheduledDate,
          time: scheduledTime,
          type: "telemedicine",
          status: "pending",
          reason: symptoms,
          age,
          gender,
          timestamp: new Date().toISOString()
        };
        await addDoc(collection(db, "appointments"), appointmentPayload);
        setTimeout(() => {
          router.push("/portal");
          setIsOpen(false);
        }, 1500);
        return;
      }

      const payload = {
        patientId,
        patientName: pName,
        patientPhone: phone,
        patientWhatsapp: whatsapp,
        age,
        gender,
        symptoms,
        urgency: urgencyMode,
        department: selectedDept,
        status: "pending",
        pingType: paymentType,
        maxAuthorizedFee: paymentAmount,
        createdAt: new Date().toISOString()
      };

      if (paymentType === "direct" && selectedDoctorForDirectCall) {
        Object.assign(payload, { doctorId: selectedDoctorForDirectCall.id });
      } else {
        Object.assign(payload, { targetCategory: selectedDept });
      }

      const docRef = await addDoc(collection(db, "consultation_requests"), payload);
      
      if (forceDirectTest) {
        setIsOpen(false);
        router.push(`/consultation/${docRef.id}`);
        return;
      }

      const unsubscribe = onSnapshot(doc(db, "consultation_requests", docRef.id), (snapshot) => {
        const data = snapshot.data();
        if (data && data.status === "accepted") {
          unsubscribe();
          setStep("connecting_success"); // Show instant feedback
          // Let Next.js handle the route transition while showing the success UI
          router.push(`/consultation/${docRef.id}`);
        }
      });

    } catch (err: any) {
      console.error("Failed to create request", err);
      alert(`Failed to connect: ${err.message || String(err)}. Please try again.`);
      setStep("doctor_list");
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[100] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
        <button 
          onClick={handleOpen}
          className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-4 rounded-full shadow-2xl hover:shadow-red-500/50 hover:scale-105 transition-all flex items-center justify-center group"
        >
          <svg className="w-6 h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          <span className="hidden md:block ml-2 font-bold uppercase tracking-wider text-sm">Consult Doctor</span>
        </button>
      </div>

      {/* Slide-over Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex justify-center items-center p-4 sm:p-6 animate-in fade-in duration-200" onClick={handleClose}>
          
          {/* Main Modal Container */}
          <div 
            className="w-full max-w-xl bg-white/30 backdrop-blur-[40px] border border-white/60 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2),inset_0_1px_3px_rgba(255,255,255,0.7)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 h-[85vh] sm:h-auto sm:max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-6 flex justify-between items-center relative overflow-hidden transition-colors duration-500 ${urgencyMode === 'schedule' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'}`}>
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-black tracking-wider uppercase flex items-center gap-3">
                  <img src="/logo.png" alt="Dehapa Logo" className="h-12 object-contain drop-shadow-md" />
                  {urgencyMode === 'schedule' ? 'DehaPa Schedule Consult' : 'DehaPa Instant Consult'}
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-80 pl-11">
                  {step === "urgency" ? "Select Option" : 
                   step === "doctor_list" ? "Select Doctor" : 
                   step === "payment_gate" ? "Secure Checkout" : 
                   step === "connecting" ? "Encrypted Link" : "Guided Triage"}
                </p>
              </div>
              <button onClick={handleClose} className="relative z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors backdrop-blur-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-white/40 relative">
              
              {step !== "urgency" && step !== "connecting" && (
                <button onClick={handleBack} className="bg-white/60 hover:bg-white/90 text-slate-900 border border-white/80 shadow-sm backdrop-blur-md px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest font-black flex items-center gap-2 mb-6 transition-all hover:-translate-x-1 hover:shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                  BACK
                </button>
              )}

              {/* STEP 1: INITIAL URGENCY & QUICK JUMP */}
              {step === "urgency" && (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  
                  {/* Quick Search Bar */}
                  <form onSubmit={handleSearchSubmit} className="relative shadow-sm">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search symptom, doctor, or specialty..." 
                      className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                    />
                    <svg className="w-6 h-6 text-slate-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </form>

                  {/* High Urgency Quick Jump Grid */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      High Urgency Quick Jump
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { name: "General Med", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
                        { name: "Cardiology", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
                        { name: "Pediatrics", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                        { name: "Trauma/ER", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                      ].map(dept => (
                        <button 
                          key={dept.name}
                          onClick={() => handleQuickJump(dept.name)}
                          className="bg-white/40 backdrop-blur-md border border-white/60 hover:bg-white/60 hover:border-red-400 hover:shadow-[0_4px_15px_rgba(239,68,68,0.2)] rounded-2xl p-3 flex flex-col items-center justify-center gap-2 transition-all group shadow-sm"
                        >
                          <div className="p-2 bg-red-50 text-red-500 rounded-full group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={dept.icon}></path></svg>
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider text-center">{dept.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>

                  {/* Guided Triage Buttons */}
                  <div className="space-y-4">
                    <button 
                      onClick={() => handleUrgencySelect("urgent")}
                      className="w-full bg-white/40 backdrop-blur-md border border-white/60 hover:bg-white/60 hover:border-red-400 rounded-3xl p-6 text-left flex items-center gap-6 transition-all shadow-sm hover:shadow-lg group relative overflow-hidden"
                    >
                      <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-black uppercase tracking-wider text-slate-900 text-lg group-hover:text-red-500 transition-colors">Guided Urgent Consult</h4>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Browse online doctors to connect with immediately.</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleUrgencySelect("schedule")}
                      className="w-full bg-white/40 backdrop-blur-md border border-white/60 hover:bg-white/60 hover:border-teal-400 rounded-3xl p-6 text-left flex items-center gap-6 transition-all shadow-sm hover:shadow-lg group relative overflow-hidden"
                    >
                      <div className="w-14 h-14 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-black uppercase tracking-wider text-slate-900 text-lg group-hover:text-teal-500 transition-colors">Schedule Appointment</h4>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Book a specific date and time with a doctor.</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: TRIAGE TIER */}
              {step === "triage_tier" && (
                <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Select Provider Tier</h3>
                  {[
                    { id: "General", title: "General Physician", desc: "MBBS, BHMS, BAMS for general health issues." },
                    { id: "Specialist", title: "Specialist", desc: "Cardiology, Orthopedics, Pediatrics, etc." },
                    { id: "Super Specialist", title: "Super Specialist", desc: "Neurosurgery, Oncology, specialized care." }
                  ].map(tier => (
                    <button 
                      key={tier.id}
                      onClick={() => handleTierSelect(tier.id)} 
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-400 rounded-2xl p-5 text-left flex items-center justify-between transition-all group shadow-sm"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{tier.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">{tier.desc}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 3: TRIAGE DEPARTMENT */}
              {step === "triage_dept" && (
                <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Select {selectedTier} Department</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "Dermatology", "Psychiatry", "Oncology"].map(dept => (
                      <button 
                        key={dept}
                        onClick={() => handleDeptSelect(dept)}
                        className="bg-white border-2 border-slate-200 hover:border-slate-400 rounded-xl p-4 text-center transition-all text-sm font-bold text-slate-700 hover:shadow-sm"
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: DOCTOR LIST VIEW */}
              {step === "doctor_list" && (
                <div className="animate-in slide-in-from-right-8 duration-300 flex flex-col h-full">
                  <div className="mb-6 flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Available Doctors</h3>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{selectedDept}</p>
                    </div>
                    {urgencyMode === "urgent" && doctorsList.length > 0 && (
                      <span className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Live Now
                      </span>
                    )}
                  </div>

                  {isLoadingDoctors ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-12 h-12 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Searching Network...</p>
                    </div>
                  ) : doctorsList.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                      <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <h4 className="text-lg font-bold text-slate-900 mb-2">No Doctors Available</h4>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto">There are currently no doctors online for this specialty. Please try scheduling an appointment or check back later.</p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-4 pb-24">
                      {doctorsList.map(doctor => (
                        <div key={doctor.id} className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          {/* Doctor Avatar */}
                          <div className="w-16 h-16 rounded-full bg-slate-100 shrink-0 border border-slate-200 overflow-hidden">
                            <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover" />
                          </div>
                          
                          {/* Doctor Info */}
                          <div className="flex-1">
                            <h4 className="font-black text-slate-900">{doctor.name}</h4>
                            <p className="text-xs font-bold text-slate-500 mb-1">{doctor.qualifications}</p>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                              {doctor.rating} ({doctor.reviews})
                            </div>
                          </div>

                          {/* Fee & CTA */}
                          <div className="flex flex-col items-end justify-between">
                            <div className="text-lg font-black text-slate-900">₹{doctor.fee}</div>
                            <button 
                              onClick={() => initiateDirectCall(doctor)}
                              className="text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors"
                            >
                              Direct Call
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ping All Broadcast Button Fixed at Bottom */}
                  {doctorsList.length > 0 && urgencyMode === "urgent" && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-12 border-t border-slate-200/50">
                      <button 
                        onClick={initiateBroadcastPing}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-[0_10px_20px_rgba(239,68,68,0.2)] flex items-center justify-center gap-3 transition-all hover:-translate-y-1"
                      >
                        <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        PING ALL AVAILABLE DOCTORS
                      </button>
                      <p className="text-[10px] text-center text-slate-500 mt-2 font-semibold">
                        First doctor to accept connects instantly. We pre-authorize the maximum fee.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4.5: DATETIME PICKER */}
              {step === "datetime_picker" && (
                <div className="h-full flex flex-col justify-center animate-in slide-in-from-right-8 duration-300 py-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Select Date & Time</h3>
                    <p className="text-sm font-medium text-slate-500 mb-8">Scheduling an appointment with {selectedDoctorForDirectCall?.name || 'Doctor'}</p>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Date *</label>
                        <input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          value={scheduledDate}
                          onChange={e => setScheduledDate(e.target.value)}
                          className="w-full px-4 py-3 bg-white rounded-xl border-2 border-slate-200 text-slate-900 focus:border-teal-500 outline-none transition-colors font-medium"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Time Slot *</label>
                        <input 
                          type="time" 
                          value={scheduledTime}
                          onChange={e => setScheduledTime(e.target.value)}
                          className="w-full px-4 py-3 bg-white rounded-xl border-2 border-slate-200 text-slate-900 focus:border-teal-500 outline-none transition-colors font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-8">
                      <button 
                        onClick={confirmDateTime}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-black py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(20,184,166,0.3)]"
                      >
                        CONFIRM & PROCEED
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: PAYMENT GATE (Mock Razorpay) */}
              {step === "payment_gate" && (
                <div className="h-full flex flex-col justify-center animate-in slide-in-from-right-8 duration-300">
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">Checkout</h3>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
                          {paymentType === "direct" ? "Direct Call Payment" : "Broadcast Ping Pre-Auth"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 uppercase">Amount</span>
                        <div className="text-3xl font-black text-slate-900">₹{paymentAmount}</div>
                      </div>
                    </div>

                    {paymentType === "broadcast" && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex gap-3 text-amber-800 text-sm font-medium">
                        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p>Because doctor fees vary, we are placing an <strong>authorization hold</strong> for the maximum fee (₹{paymentAmount}). You will only be charged the exact fee of the doctor who accepts your call.</p>
                      </div>
                    )}

                    <div className="space-y-4 mb-8">
                      <div className="border-2 border-slate-900 rounded-xl p-4 flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-black italic">UP</div>
                          <span className="font-bold text-slate-900">UPI / QR Code</span>
                        </div>
                        <div className="w-4 h-4 rounded-full border-4 border-slate-900"></div>
                      </div>
                      <div className="border-2 border-slate-100 rounded-xl p-4 flex items-center justify-between opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-3">
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                          <span className="font-bold text-slate-500">Credit / Debit Card</span>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                      </div>
                    </div>

                    <button 
                      onClick={handlePaymentSuccess}
                      disabled={isProcessingPayment}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          PROCESSING...
                        </>
                      ) : (
                        <>AUTHORIZE ₹{paymentAmount}</>
                      )}
                    </button>
                    
                    {/* TEST BYPASS */}
                    <button 
                      onClick={() => {
                        if (userUid) {
                          createConsultationRequest(userUid, userName || "Patient", true);
                        } else {
                          setStep("auth_gate");
                        }
                      }}
                      className="w-full mt-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-teal-200"
                    >
                      Bypass Payment (Test Video Call)
                    </button>

                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 flex items-center justify-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      Secured by Razorpay
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 6: AUTH GATE */}
              {step === "auth_gate" && (
                <div className="h-full flex flex-col items-center justify-center animate-in slide-in-from-bottom-8 duration-500 py-8">
                  <div className="w-16 h-16 bg-slate-100 text-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-200 shadow-sm">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Final Step: Contact Info</h3>
                  <p className="text-slate-500 mb-8 text-center text-sm font-medium">Verify your identity to connect with the doctor immediately.</p>
                  
                  <form onSubmit={handleAuth} className="w-full space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Chief Symptoms *</label>
                      <textarea 
                        required 
                        value={symptoms}
                        onChange={e => setSymptoms(e.target.value)}
                        className="w-full px-4 py-3 bg-white rounded-xl border-2 border-slate-200 text-slate-900 focus:border-slate-900 focus:ring-0 transition-all outline-none resize-none h-20 shadow-sm"
                        placeholder="e.g. Mild fever since yesterday..."
                      ></textarea>
                    </div>

                    {userUid && patientOptions.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-2">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                          <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                          Who is this for?
                        </label>
                        <select 
                          value={selectedPatientId}
                          onChange={handlePatientSelect}
                          className="w-full px-4 py-3 bg-white rounded-xl border-2 border-slate-200 text-slate-900 focus:border-teal-500 outline-none font-bold"
                        >
                          {patientOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Age (Years) *</label>
                        <input 
                          type="number" 
                          required 
                          value={age}
                          onChange={e => setAge(e.target.value)}
                          className="w-full px-4 py-3 bg-white rounded-xl border-2 border-slate-200 text-slate-900 focus:border-slate-900 outline-none"
                          placeholder="e.g. 34"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Biological Sex *</label>
                        <select 
                          required 
                          value={gender}
                          onChange={e => setGender(e.target.value)}
                          className="w-full px-4 py-3 bg-white rounded-xl border-2 border-slate-200 text-slate-900 focus:border-slate-900 outline-none"
                        >
                          <option value="">Select...</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Phone *</label>
                        <input 
                          type="tel" 
                          required 
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full px-4 py-3 bg-white rounded-xl border-2 border-slate-200 text-slate-900 focus:border-slate-900 outline-none"
                          placeholder="+91"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">WhatsApp *</label>
                        <input 
                          type="tel" 
                          required 
                          value={whatsapp}
                          onChange={e => setWhatsapp(e.target.value)}
                          className="w-full px-4 py-3 bg-white rounded-xl border-2 border-slate-200 text-slate-900 focus:border-slate-900 outline-none"
                          placeholder="+91"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-6">
                      <button 
                        type="submit" 
                        disabled={isAuthenticating}
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-900 hover:shadow-md text-slate-900 font-bold py-4 px-4 rounded-xl transition-all"
                      >
                        {isAuthenticating ? (
                          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        ) : userUid ? (
                          <>
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Submit & Connect
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path></svg>
                            Verify with Google
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 7: CONNECTING */}
              {step === "connecting" && (
                <div className="h-full flex flex-col items-center justify-center animate-in zoom-in duration-500 py-12">
                  <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-8 relative border border-slate-200 shadow-inner">
                    <div className="absolute inset-0 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-[-10px] border-2 border-slate-900/10 rounded-full animate-ping"></div>
                    <svg className="w-12 h-12 text-slate-900 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                    {paymentType === "direct" ? "Calling Doctor..." : "Pinging Network..."}
                  </h3>
                  <p className="text-slate-500 text-center font-medium max-w-xs">Establishing encrypted video link. Do not close this window.</p>
                </div>
              )}

              {/* STEP 8: SUCCESS / ENTERING ROOM */}
              {step === "connecting_success" && (
                <div className="h-full flex flex-col items-center justify-center animate-in zoom-in duration-300 py-12">
                  <div className="w-32 h-32 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-8 relative border border-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <div className="absolute inset-[-10px] border-4 border-emerald-500/20 rounded-full animate-ping"></div>
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-3xl font-black text-emerald-600 mb-3 tracking-tight">
                    Doctor Accepted!
                  </h3>
                  <p className="text-slate-500 text-center font-bold uppercase tracking-widest text-xs animate-pulse">Entering Video Room...</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
