"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, query, where, limit, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Phone, FileText, Building2, User, MapPin, Image as ImageIcon, UploadCloud, AlertCircle } from 'lucide-react';
import { INDIAN_STATES, ODISHA_DISTRICTS, ODISHA_DISTRICT_BLOCKS } from '@/constants/locations';
import V2GlassBackground from '@/components/V2GlassBackground';

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
      <V2GlassBackground>
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-white/60 backdrop-blur-3xl border border-white p-12 rounded-[40px] shadow-[0_20px_50px_rgba(0,30,80,0.15)] max-w-2xl w-full text-center relative z-10">
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-4xl font-black text-[#0a2540] mb-4 font-serif tracking-tight">Application Received!</h2>
            <p className="text-slate-600 text-lg mb-8 font-medium">Your premium V2 profile request has been securely submitted. Our team will verify your details shortly.</p>
            <Link href="/portal" className="inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-full shadow-md transition-all">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </V2GlassBackground>
    );
  }

  return (
    <V2GlassBackground>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 py-12 relative z-10 w-full">
        <div className="w-full max-w-4xl flex justify-center">
          
          {/* THE TRUE GLASSMORPHISM FORM CONTAINER */}
          <div className="relative w-full rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,100,200,0.15)] border border-white/80 bg-white/50 backdrop-blur-2xl flex flex-col py-10 px-6 sm:px-12">
              {/* Progress Header */}
              <div className="flex items-center justify-between mb-10 px-2 sm:px-4">
                {[
                  { num: 1, icon: Phone, label: 'Contact' },
                  { num: 2, icon: FileText, label: 'Identity' },
                  { num: 3, icon: MapPin, label: 'Location' },
                  { num: 4, icon: ImageIcon, label: 'V2 Profile' }
                ].map((s, idx) => (
                  <React.Fragment key={s.num}>
                    <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${step >= s.num ? 'text-blue-600' : 'text-slate-500'}`}>
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${step >= s.num ? 'bg-white border-blue-600 shadow-md text-blue-600' : 'bg-white/50 border-white text-slate-500'}`}>
                        <s.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] hidden sm:block">{s.label}</span>
                    </div>
                    {idx < 3 && (
                      <div className="flex-1 mx-2 sm:mx-4 h-1 bg-white/50 rounded-full relative overflow-hidden">
                        <div className={`absolute top-0 left-0 h-full bg-blue-600 transition-all duration-1000 ${step > s.num ? 'w-full' : 'w-0'}`}></div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-black text-[#0a2540] mb-3 capitalize font-serif tracking-tight drop-shadow-sm">Join as {role}</h1>
                <p className="text-slate-700 font-bold text-lg max-w-lg mx-auto drop-shadow-sm">Complete your V2 Premium Profile setup.</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl mb-8 font-medium flex items-center gap-3 shadow-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
                
                {/* STEP 1: CONTACT */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-2">Primary Phone Number *</label>
                      <input type="tel" required value={phone} onChange={handlePhoneChange} className="w-full bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl px-6 py-4 text-[#0a2540] focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-bold placeholder:text-slate-400 shadow-sm text-lg" placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2 px-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700">WhatsApp Number *</label>
                        <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-slate-700 hover:text-blue-600 transition-colors bg-white/50 px-3 py-1.5 rounded-full border border-white">
                          <input type="checkbox" checked={sameAsPhone} onChange={handleSameAsPhoneChange} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          Same as Phone
                        </label>
                      </div>
                      <input type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} disabled={sameAsPhone} className="w-full bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl px-6 py-4 text-[#0a2540] focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-bold placeholder:text-slate-400 shadow-sm text-lg disabled:opacity-50 disabled:bg-slate-100" placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div className="pt-8 mt-10">
                      <button type="button" onClick={handleNextStep} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-6 py-5 rounded-full flex items-center justify-center gap-2 transition-all shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_10px_rgba(37,99,235,0.3)] hover:scale-[1.02]">
                        Continue to Details <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: VERIFICATION DETAILS */}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    {isDoctor ? (
                      <div className="bg-white/50 backdrop-blur-md border border-white/80 p-6 sm:p-8 rounded-[32px] space-y-6 shadow-sm">
                        <h3 className="text-sm font-bold text-[#0a2540] uppercase tracking-widest flex items-center gap-3 mb-4"><User className="w-5 h-5 text-blue-600"/> Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                               <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">First Name *</label>
                               <input type="text" required value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium" />
                           </div>
                           <div>
                               <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">Last Name *</label>
                               <input type="text" required value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium" />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                               <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">MCI Registration *</label>
                               <input type="text" required value={registrationNumber} onChange={e=>setRegistrationNumber(e.target.value)} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">Year *</label>
                                   <input type="text" required value={passingYear} onChange={e=>setPassingYear(e.target.value)} placeholder="YYYY" className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium" />
                               </div>
                               <div>
                                   <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">College *</label>
                                   <input type="text" required value={college} onChange={e=>setCollege(e.target.value)} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium" />
                               </div>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/50 backdrop-blur-md border border-white/80 p-6 sm:p-8 rounded-[32px] space-y-6 shadow-sm">
                        <h3 className="text-sm font-bold text-[#0a2540] uppercase tracking-widest flex items-center gap-3 mb-4"><Building2 className="w-5 h-5 text-blue-600"/> Organization Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                               <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">Organization Name *</label>
                               <input type="text" required value={orgName} onChange={e=>setOrgName(e.target.value)} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium" />
                           </div>
                           <div>
                               <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">Owner Name *</label>
                               <input type="text" required value={ownerName} onChange={e=>setOwnerName(e.target.value)} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium" />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                               <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">License / Reg No *</label>
                               <input type="text" required value={registrationNumber} onChange={e=>setRegistrationNumber(e.target.value)} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium" />
                           </div>
                           <div>
                               <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">Established Year *</label>
                               <input type="text" required value={yearEstablished} onChange={e=>setYearEstablished(e.target.value)} placeholder="YYYY" className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium" />
                           </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-white/50 backdrop-blur-md border border-white/80 p-6 sm:p-8 rounded-[32px] shadow-sm">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-4 ml-1">Official Document Proof (PDF/JPG) *</label>
                      <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-white/60 hover:bg-white transition-colors relative cursor-pointer group">
                        <input type="file" required accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        {!file ? (
                          <>
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                              <UploadCloud className="w-8 h-8 text-blue-600" />
                            </div>
                            <p className="text-sm font-bold text-slate-700 mb-1">Tap to upload document</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Max size 5MB</p>
                          </>
                        ) : (
                          <div className="flex flex-col items-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
                            <p className="text-sm font-bold text-slate-800">{file.name}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                      <button type="button" onClick={handlePreviousStep} className="w-1/3 bg-white/60 hover:bg-white text-slate-700 font-bold px-6 py-4 rounded-full transition-all border border-white shadow-sm">Back</button>
                      <button type="button" onClick={handleNextStep} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-6 py-4 rounded-full transition-all shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_10px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 hover:scale-[1.02]">
                        Location <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: LOCATION DETAILS (5-TIER) */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="bg-white/50 backdrop-blur-md border border-white/80 p-6 sm:p-8 rounded-[32px] shadow-sm space-y-6">
                      <h3 className="text-sm font-bold text-[#0a2540] uppercase tracking-widest mb-4 flex items-center gap-3"><MapPin className="w-5 h-5 text-blue-600" /> 5-Tier Geo Routing</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">Country *</label>
                          <select value={country} onChange={e=>setCountry(e.target.value)} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 outline-none">
                            <option value="India">India</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        {country === 'India' ? (
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">State *</label>
                            <select value={addressState} onChange={e=>setAddressState(e.target.value)} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 outline-none">
                              <option value="">Select State</option>
                              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">State *</label>
                            <input type="text" value={addressState} onChange={e=>setAddressState(e.target.value)} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 outline-none" required />
                          </div>
                        )}
                        
                        {country === 'India' && addressState === 'Odisha' ? (
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">District *</label>
                            <select value={district} onChange={e=>setDistrict(e.target.value)} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 outline-none">
                              <option value="">Select District</option>
                              {ODISHA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">District / City *</label>
                            <input type="text" value={district} onChange={e=>setDistrict(e.target.value)} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 outline-none" required />
                          </div>
                        )}

                        {country === 'India' && addressState === 'Odisha' && district && ODISHA_DISTRICT_BLOCKS[district] ? (
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">Block</label>
                            <select value={block} onChange={e=>setBlock(e.target.value)} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 outline-none">
                              <option value="">Select Block</option>
                              {ODISHA_DISTRICT_BLOCKS[district].map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">Block / Area</label>
                            <input type="text" value={block} onChange={e=>setBlock(e.target.value)} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 outline-none" />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">Local Address & Pincode *</label>
                        <textarea required value={localAddress} onChange={e=>setLocalAddress(e.target.value)} rows={3} className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 outline-none resize-none" placeholder="Street, building, pincode..." />
                      </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                      <button type="button" onClick={handlePreviousStep} className="w-1/3 bg-white/60 hover:bg-white text-slate-700 font-bold px-6 py-4 rounded-full transition-all border border-white shadow-sm">Back</button>
                      <button type="button" onClick={handleNextStep} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-6 py-4 rounded-full transition-all shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_10px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 hover:scale-[1.02]">
                        Media & Profile <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: V2 PROFILE MEDIA AND METRICS */}
                {step === 4 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="bg-white/50 backdrop-blur-md border border-white/80 p-6 sm:p-8 rounded-[32px] shadow-sm space-y-6">
                      <div className="mb-4">
                        <h3 className="text-sm font-bold text-[#0a2540] uppercase tracking-widest flex items-center gap-3 mb-1"><ImageIcon className="w-5 h-5 text-blue-600"/> Bento Grid Images</h3>
                        <p className="text-[10px] text-slate-500 tracking-widest uppercase">Upload images for your premium V2 layout.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="border-2 border-dashed border-blue-300 bg-blue-50/80 rounded-2xl p-6 text-center hover:bg-blue-100 transition-colors relative cursor-pointer flex flex-col items-center justify-center group">
                            <input type="file" accept="image/*" onChange={e => setHeroImage(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                            {!heroImage ? (
                              <><UploadCloud className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" /><span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Main Hero Image *</span></>
                            ) : (
                              <span className="text-xs font-bold text-blue-600 flex flex-col items-center"><CheckCircle2 className="w-8 h-8 mb-2" /> {heroImage.name}</span>
                            )}
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                           <div className="border border-dashed border-slate-300 bg-white/60 rounded-2xl p-4 text-center hover:bg-white transition-colors relative cursor-pointer flex flex-col items-center justify-center">
                              <input type="file" accept="image/*" onChange={e => setGallery1(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              {!gallery1 ? <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">+ Gallery 1</span> : <span className="text-[10px] font-bold text-emerald-600">✓ Selected</span>}
                           </div>
                           <div className="border border-dashed border-slate-300 bg-white/60 rounded-2xl p-4 text-center hover:bg-white transition-colors relative cursor-pointer flex flex-col items-center justify-center">
                              <input type="file" accept="image/*" onChange={e => setGallery2(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              {!gallery2 ? <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">+ Gallery 2</span> : <span className="text-[10px] font-bold text-emerald-600">✓ Selected</span>}
                           </div>
                         </div>
                      </div>
                    </div>

                    <div className="bg-white/50 backdrop-blur-md border border-white/80 p-6 sm:p-8 rounded-[32px] shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-[#0a2540] uppercase tracking-widest">Operational Metrics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isDoctor ? (
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2 ml-1">Years of Experience</label>
                            <input type="text" value={experience} onChange={e=>setExperience(e.target.value)} placeholder="e.g. 10 Years" className="w-full bg-white/80 border border-white rounded-xl px-5 py-3.5 text-slate-800 outline-none" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 bg-white/80 border border-white p-4 rounded-xl">
                            <input type="checkbox" checked={is24x7} onChange={e=>setIs24x7(e.target.checked)} className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <label className="text-sm font-bold text-slate-700">Open 24/7 for Emergencies</label>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                      <button type="button" onClick={handlePreviousStep} disabled={loading} className="w-1/3 bg-white/60 hover:bg-white text-slate-700 font-bold px-6 py-4 rounded-full transition-all border border-white shadow-sm disabled:opacity-50">Back</button>
                      <button type="submit" disabled={loading} className="w-2/3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg uppercase tracking-widest rounded-full transition-all shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_10px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02]">
                        {loading ? 'Submitting...' : 'Complete Profile'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </V2GlassBackground>
    );
  }

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]"></div>}>
      <ApplyContent />
    </Suspense>
  );
}
