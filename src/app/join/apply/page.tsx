"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, query, where, limit, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Phone, FileText, Building2, User, MapPin, Image as ImageIcon, UploadCloud, AlertCircle } from 'lucide-react';
import { INDIAN_STATES, ODISHA_DISTRICTS, ODISHA_DISTRICT_BLOCKS } from '@/constants/locations';

function ApplyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'doctor';
  
  const isDoctor = role === 'doctor';
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draftId, setDraftId] = useState<string | null>(null);

  // Common Contact Info
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(false);

  // Doctor Specific Fields
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [college, setCollege] = useState('');

  // Organization Specific Fields
  const [prefix, setPrefix] = useState('M/S');
  const [customPrefix, setCustomPrefix] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [yearEstablished, setYearEstablished] = useState('');

  // Shared Form Fields
  const [registrationNumber, setRegistrationNumber] = useState('');
  
  // 5-Tier Location Schema
  const [country, setCountry] = useState('India');
  const [addressState, setAddressState] = useState('Odisha');
  const [district, setDistrict] = useState('');
  const [block, setBlock] = useState('');
  const [localAddress, setLocalAddress] = useState('');

  const [file, setFile] = useState<File | null>(null);

  // V2 specific: Bento Grid Images
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [gallery1, setGallery1] = useState<File | null>(null);
  const [gallery2, setGallery2] = useState<File | null>(null);
  
  // V2 specific: Metrics
  const [experience, setExperience] = useState('');
  const [is24x7, setIs24x7] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // Hydrate Draft
  useEffect(() => {
    const fetchDraft = async () => {
      if (auth.currentUser) {
        try {
          const q = query(
            collection(db, 'v2_providers'), 
            where('userUid', '==', auth.currentUser.uid),
            where('status', '==', 'draft'),
            limit(1)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const draftDoc = snap.docs[0];
            const data = draftDoc.data();
            setDraftId(draftDoc.id);
            if (data.phone) setPhone(data.phone);
            if (data.whatsapp) setWhatsapp(data.whatsapp);
            if (data.phone) setStep(2);
          }
        } catch(e) {
          console.error("Draft fetch error", e);
        }
      }
    };
    if (authChecked && auth.currentUser) {
      fetchDraft();
    }
  }, [authChecked, auth.currentUser]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (sameAsPhone) {
      setWhatsapp(e.target.value);
    }
  };

  const handleSameAsPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSameAsPhone(e.target.checked);
    if (e.target.checked) {
      setWhatsapp(phone);
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!phone || !whatsapp) {
        setError("Phone number and WhatsApp number are required.");
        return;
      }
      try {
        if (!draftId && auth.currentUser) {
          const docRef = await addDoc(collection(db, 'v2_providers'), {
            userUid: auth.currentUser.uid,
            userEmail: auth.currentUser.email || auth.currentUser.phoneNumber || "Unknown",
            phone, whatsapp, role, status: 'draft', timestamp: serverTimestamp(), lastUpdated: serverTimestamp()
          });
          setDraftId(docRef.id);
        } else if (draftId) {
          await updateDoc(doc(db, 'v2_providers', draftId), { phone, whatsapp, role, lastUpdated: serverTimestamp() });
        }
      } catch(e) { console.error("Failed to save draft", e); }
    }
    
    if (step === 2) {
      if (isDoctor && (!firstName || !lastName || !passingYear || !college || !registrationNumber)) {
        setError("Please fill out all required professional fields.");
        return;
      }
      if (!isDoctor && (!ownerName || !orgName || !yearEstablished || !registrationNumber)) {
        setError("Please fill out all required organization fields.");
        return;
      }
      if (!file) {
        setError("Please upload your official document proof.");
        return;
      }
    }

    if (step === 3) {
      if (!country || !addressState || !district || !localAddress) {
        setError("Please fill out your complete location details.");
        return;
      }
    }
    
    setError('');
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setError('');
    setStep(step - 1);
  };

  const uploadFile = async (f: File, folder: string) => {
    const fileExt = f.name.split('.').pop();
    const fileName = `${folder}/${auth.currentUser!.uid}_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, fileName);
    const result = await uploadBytes(storageRef, f);
    return await getDownloadURL(result.ref);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setError("Authentication lost. Please log in again.");
      return;
    }
    if (!heroImage) {
      setError("Please upload a Main Hero Image for your profile.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const proofUrl = file ? await uploadFile(file, 'provider_proofs') : '';
      const heroUrl = heroImage ? await uploadFile(heroImage, 'provider_gallery') : '';
      const g1Url = gallery1 ? await uploadFile(gallery1, 'provider_gallery') : '';
      const g2Url = gallery2 ? await uploadFile(gallery2, 'provider_gallery') : '';

      const finalPrefix = prefix === 'Custom' ? customPrefix : prefix;

      const applicationData = {
        role, status: 'pending_verification', registrationNumber,
        country, state: addressState, district, block, localAddress,
        proofUrl,
        gallery: { heroImage: heroUrl, thumbnails: [g1Url, g2Url].filter(Boolean) },
        metrics: { experienceYears: experience, is24x7: is24x7 },
        lastUpdated: serverTimestamp(),
        ...(isDoctor ? {
            legalName: `Dr. ${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
            firstName, middleName, lastName, passingYear, college
        } : {
            legalName: `${finalPrefix ? finalPrefix + ' ' : ''}${orgName}`.trim(),
            ownerName, orgName, yearEstablished, prefix: finalPrefix
        })
      };

      if (draftId) {
        await updateDoc(doc(db, 'v2_providers', draftId), applicationData);
      } else {
        await addDoc(collection(db, 'v2_providers'), {
            userUid: auth.currentUser.uid, userEmail: auth.currentUser.email || auth.currentUser.phoneNumber || "Unknown",
            phone, whatsapp, timestamp: serverTimestamp(), ...applicationData
        });
      }
      setSubmitted(true);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-12 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] max-w-2xl w-full text-center relative z-10">
          <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
          <h2 className="text-4xl font-black text-white mb-4 font-serif tracking-tight">Application Received!</h2>
          <p className="text-slate-400 text-lg mb-8 font-medium">Your premium V2 profile request has been securely submitted. Our team will verify your details shortly.</p>
          <Link href="/portal" className="inline-flex justify-center items-center bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-black px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(52,211,153,0.3)] transition-all uppercase tracking-widest text-sm">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col font-sans text-white relative overflow-hidden">
      
      {/* TRUE PREMIUM DARK GLASSMORPHISM BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Massive vibrant orbs in the deep background */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[140px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[900px] h-[900px] bg-teal-500/30 rounded-full blur-[150px] animate-pulse-slow delay-1000"></div>
        <div className="absolute top-[40%] left-[20%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px]"></div>
        {/* Subtle noise texture overlay for realism */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)' }}></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 py-12 relative z-10">
        <div className="w-full max-w-4xl">
          
          {/* Progress Header */}
          <div className="flex items-center justify-between mb-10 px-4">
            {[
              { num: 1, icon: Phone, label: 'Contact' },
              { num: 2, icon: FileText, label: 'Identity' },
              { num: 3, icon: MapPin, label: 'Location' },
              { num: 4, icon: ImageIcon, label: 'V2 Profile' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${step >= s.num ? 'text-white' : 'text-slate-600'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md transition-all duration-500 shadow-xl ${step >= s.num ? 'bg-white/10 border border-white/30 text-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.2)]' : 'bg-slate-900/50 border border-white/5 text-slate-500'}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] hidden sm:block">{s.label}</span>
                </div>
                {idx < 3 && (
                  <div className="flex-1 mx-4 sm:mx-6 h-px bg-slate-800 relative">
                    <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-1000 ${step > s.num ? 'w-full shadow-[0_0_10px_rgba(45,212,191,0.5)]' : 'w-0'}`}></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* THE TRUE GLASSMORPHISM CONTAINER */}
          <div className="bg-[#0f172a]/40 backdrop-blur-3xl backdrop-saturate-[150%] border border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden ring-1 ring-black/50">
            {/* Top highlight for 3D effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-6 backdrop-blur-md">
                Dehapa Ecosystem
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 capitalize font-serif tracking-tight drop-shadow-md">Join as {role}</h1>
              <p className="text-slate-400 font-medium text-lg max-w-lg mx-auto">Complete your secure V2 Premium Profile setup to join the network.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl mb-8 font-medium flex items-center gap-3 backdrop-blur-md">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()} className="space-y-8 relative z-10">
              
              {/* STEP 1: CONTACT */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-2">Primary Phone Number *</label>
                    <input type="tel" required value={phone} onChange={handlePhoneChange} className="w-full bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-5 text-white focus:border-teal-400 focus:bg-black/40 outline-none transition-all font-bold placeholder:text-slate-600 shadow-inner text-lg" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2 px-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">WhatsApp Number *</label>
                      <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-slate-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                        <input type="checkbox" checked={sameAsPhone} onChange={handleSameAsPhoneChange} className="rounded bg-black/50 border-white/20 text-teal-500 focus:ring-teal-500 focus:ring-offset-0" />
                        Same as Phone
                      </label>
                    </div>
                    <input type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} disabled={sameAsPhone} className="w-full bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-5 text-white focus:border-teal-400 focus:bg-black/40 outline-none transition-all font-bold placeholder:text-slate-600 shadow-inner text-lg disabled:opacity-30 disabled:cursor-not-allowed" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="pt-8 mt-10 border-t border-white/5">
                    <button type="button" onClick={handleNextStep} className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white font-black text-lg px-6 py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:shadow-[0_0_40px_rgba(20,184,166,0.5)] hover:scale-[1.02]">
                      Continue to Details <ChevronRight className="w-6 h-6" />
                    </button>
                    <p className="text-center text-[10px] text-slate-500 mt-6 font-bold uppercase tracking-[0.2em]">Progress is automatically saved</p>
                  </div>
                </div>
              )}

              {/* STEP 2: VERIFICATION DETAILS */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                  {isDoctor ? (
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl space-y-6 shadow-inner">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3 mb-6"><User className="w-5 h-5 text-teal-400"/> Personal Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">First Name *</label>
                             <input type="text" required value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-teal-400 outline-none" />
                         </div>
                         <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Last Name *</label>
                             <input type="text" required value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-teal-400 outline-none" />
                         </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">MCI Registration *</label>
                             <input type="text" required value={registrationNumber} onChange={e=>setRegistrationNumber(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-teal-400 outline-none" />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Year *</label>
                                 <input type="text" required value={passingYear} onChange={e=>setPassingYear(e.target.value)} placeholder="YYYY" className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-teal-400 outline-none" />
                             </div>
                             <div>
                                 <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">College *</label>
                                 <input type="text" required value={college} onChange={e=>setCollege(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-teal-400 outline-none" />
                             </div>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl space-y-6 shadow-inner">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3 mb-6"><Building2 className="w-5 h-5 text-teal-400"/> Organization Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Organization Name *</label>
                             <input type="text" required value={orgName} onChange={e=>setOrgName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-teal-400 outline-none" />
                         </div>
                         <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Owner Name *</label>
                             <input type="text" required value={ownerName} onChange={e=>setOwnerName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-teal-400 outline-none" />
                         </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">License / Reg No *</label>
                             <input type="text" required value={registrationNumber} onChange={e=>setRegistrationNumber(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-teal-400 outline-none" />
                         </div>
                         <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Established Year *</label>
                             <input type="text" required value={yearEstablished} onChange={e=>setYearEstablished(e.target.value)} placeholder="YYYY" className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-teal-400 outline-none" />
                         </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-inner">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1">Official Document Proof (PDF/JPG) *</label>
                    <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center bg-black/20 hover:bg-black/40 transition-colors relative cursor-pointer group">
                      <input type="file" required accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {!file ? (
                        <>
                          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-white/10">
                            <UploadCloud className="w-8 h-8 text-teal-400" />
                          </div>
                          <p className="text-sm font-bold text-white mb-1">Tap to upload document</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Max size 5MB</p>
                        </>
                      ) : (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 className="w-12 h-12 text-teal-400 mb-3 drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                          <p className="text-sm font-bold text-white">{file.name}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-8 mt-10 border-t border-white/5 flex gap-4">
                    <button type="button" onClick={handlePreviousStep} className="w-1/3 bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-5 rounded-2xl transition-all border border-white/10">Back</button>
                    <button type="button" onClick={handleNextStep} className="w-2/3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white font-black text-lg px-6 py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)] flex items-center justify-center gap-2 hover:scale-[1.02]">
                      Location <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: LOCATION DETAILS (5-TIER) */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-inner space-y-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3"><MapPin className="w-5 h-5 text-teal-400" /> 5-Tier Geo Routing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Country *</label>
                        <select value={country} onChange={e=>setCountry(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white outline-none">
                          <option value="India" className="bg-slate-900">India</option>
                          <option value="Other" className="bg-slate-900">Other</option>
                        </select>
                      </div>
                      {country === 'India' ? (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">State *</label>
                          <select value={addressState} onChange={e=>setAddressState(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white outline-none">
                            <option value="" className="bg-slate-900">Select State</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">State *</label>
                          <input type="text" value={addressState} onChange={e=>setAddressState(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white outline-none" required />
                        </div>
                      )}
                      
                      {country === 'India' && addressState === 'Odisha' ? (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">District *</label>
                          <select value={district} onChange={e=>setDistrict(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white outline-none">
                            <option value="" className="bg-slate-900">Select District</option>
                            {ODISHA_DISTRICTS.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">District / City *</label>
                          <input type="text" value={district} onChange={e=>setDistrict(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white outline-none" required />
                        </div>
                      )}

                      {country === 'India' && addressState === 'Odisha' && district && ODISHA_DISTRICT_BLOCKS[district] ? (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Block</label>
                          <select value={block} onChange={e=>setBlock(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white outline-none">
                            <option value="" className="bg-slate-900">Select Block</option>
                            {ODISHA_DISTRICT_BLOCKS[district].map(b => <option key={b} value={b} className="bg-slate-900">{b}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Block / Area</label>
                          <input type="text" value={block} onChange={e=>setBlock(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white outline-none" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Local Address & Pincode *</label>
                      <textarea required value={localAddress} onChange={e=>setLocalAddress(e.target.value)} rows={3} className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white outline-none resize-none" placeholder="Street, building, pincode..." />
                    </div>
                  </div>

                  <div className="pt-8 mt-10 border-t border-white/5 flex gap-4">
                    <button type="button" onClick={handlePreviousStep} className="w-1/3 bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-5 rounded-2xl transition-all border border-white/10">Back</button>
                    <button type="button" onClick={handleNextStep} className="w-2/3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white font-black text-lg px-6 py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)] flex items-center justify-center gap-2 hover:scale-[1.02]">
                      Media & Profile <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: V2 PROFILE MEDIA AND METRICS */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-inner space-y-6">
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3 mb-2"><ImageIcon className="w-5 h-5 text-teal-400"/> Bento Grid Images</h3>
                      <p className="text-[10px] text-slate-400 tracking-widest uppercase">Upload high-quality images for your premium V2 layout.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="border-2 border-dashed border-teal-500/30 bg-teal-500/5 rounded-2xl p-8 text-center hover:bg-teal-500/10 transition-colors relative cursor-pointer flex flex-col items-center justify-center group">
                          <input type="file" accept="image/*" onChange={e => setHeroImage(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                          {!heroImage ? (
                            <><UploadCloud className="w-8 h-8 text-teal-400 mb-3 group-hover:scale-110 transition-transform" /><span className="text-xs font-bold text-white uppercase tracking-widest">Main Hero Image *</span></>
                          ) : (
                            <span className="text-xs font-bold text-teal-400 flex flex-col items-center"><CheckCircle2 className="w-8 h-8 mb-2" /> {heroImage.name}</span>
                          )}
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                         <div className="border border-dashed border-white/20 bg-black/20 rounded-2xl p-4 text-center hover:bg-white/5 transition-colors relative cursor-pointer flex flex-col items-center justify-center">
                            <input type="file" accept="image/*" onChange={e => setGallery1(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            {!gallery1 ? <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">+ Gallery 1</span> : <span className="text-[10px] font-bold text-teal-400">✓ Selected</span>}
                         </div>
                         <div className="border border-dashed border-white/20 bg-black/20 rounded-2xl p-4 text-center hover:bg-white/5 transition-colors relative cursor-pointer flex flex-col items-center justify-center">
                            <input type="file" accept="image/*" onChange={e => setGallery2(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            {!gallery2 ? <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">+ Gallery 2</span> : <span className="text-[10px] font-bold text-teal-400">✓ Selected</span>}
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-inner space-y-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Operational Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {isDoctor ? (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Years of Experience</label>
                          <input type="text" value={experience} onChange={e=>setExperience(e.target.value)} placeholder="e.g. 10 Years" className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white outline-none" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 bg-black/30 border border-white/10 p-4 rounded-xl">
                          <input type="checkbox" checked={is24x7} onChange={e=>setIs24x7(e.target.checked)} className="w-6 h-6 rounded bg-black/50 border-white/20 text-teal-500 focus:ring-teal-500" />
                          <label className="text-sm font-bold text-white">Open 24/7 for Emergencies</label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-8 mt-10 border-t border-white/5 flex gap-4">
                    <button type="button" onClick={handlePreviousStep} disabled={loading} className="w-1/3 bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-5 rounded-2xl transition-all border border-white/10 disabled:opacity-50">Back</button>
                    <button type="submit" disabled={loading} className="w-2/3 bg-teal-500 hover:bg-teal-400 text-[#020617] font-black text-lg uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)] disabled:opacity-50 flex items-center justify-center gap-3 hover:scale-[1.02]">
                      {loading ? 'Submitting...' : 'Complete Profile'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617]"></div>}>
      <ApplyContent />
    </Suspense>
  );
}
