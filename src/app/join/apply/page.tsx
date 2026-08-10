"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, query, where, limit, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import GlobalHeader from '@/components/GlobalHeader';
import GlobalFooter from '@/components/GlobalFooter';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Phone, FileText, Building2, User, MapPin } from 'lucide-react';
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
            collection(db, 'provider_applications'), 
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
      
      // Save Draft
      try {
        if (!draftId && auth.currentUser) {
          const docRef = await addDoc(collection(db, 'provider_applications'), {
            userUid: auth.currentUser.uid,
            userEmail: auth.currentUser.email || auth.currentUser.phoneNumber || "Unknown",
            phone,
            whatsapp,
            role,
            status: 'draft',
            timestamp: serverTimestamp(),
            lastUpdated: serverTimestamp()
          });
          setDraftId(docRef.id);
        } else if (draftId) {
          await updateDoc(doc(db, 'provider_applications', draftId), {
            phone,
            whatsapp,
            role,
            lastUpdated: serverTimestamp()
          });
        }
      } catch(e) {
        console.error("Failed to save draft", e);
      }
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
    
    setError('');
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setError("Authentication lost. Please log in again.");
      return;
    }
    if (!country || !addressState || !district || !localAddress) {
      setError("Please fill out your complete location details.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Upload Proof Document to Firebase Storage
      const fileExtension = file.name.split('.').pop();
      const fileName = `provider_applications/${auth.currentUser.uid}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      // 2. Prepare Final Data
      const applicationData = {
        role,
        status: 'pending',
        registrationNumber,
        country,
        state: addressState,
        district,
        block,
        localAddress,
        proofUrl: downloadUrl,
        lastUpdated: serverTimestamp(),
        ...(isDoctor ? {
            legalName: `Dr. ${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
            firstName,
            middleName,
            lastName,
            passingYear,
            college
        } : {
            legalName: `${finalPrefix ? finalPrefix + ' ' : ''}${orgName}`.trim(),
            ownerName,
            orgName,
            yearEstablished,
            prefix: finalPrefix
        })
      };

      // 3. Submit Application to Firestore (Update existing draft or create new)
      if (draftId) {
        await updateDoc(doc(db, 'provider_applications', draftId), applicationData);
      } else {
        await addDoc(collection(db, 'provider_applications'), {
            userUid: auth.currentUser.uid,
            userEmail: auth.currentUser.email || auth.currentUser.phoneNumber || "Unknown",
            phone,
            whatsapp,
            timestamp: serverTimestamp(),
            ...applicationData
        });
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error("Error submitting application:", err);
      setError(err.message || "An error occurred while submitting your application.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#020810] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6 py-12">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-teal-500/30 p-8 sm:p-10 rounded-[32px] shadow-[0_0_50px_rgba(20,184,166,0.1)] max-w-2xl w-full text-center relative overflow-hidden">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 relative z-10">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 font-serif relative z-10">Application Received!</h2>
            <p className="text-slate-400 mb-8 leading-relaxed max-w-lg mx-auto relative z-10">
              We have securely received your details. Our team will review your application and notify you soon so you can complete your full profile.
            </p>

            <Link href="/portal" className="inline-flex justify-center items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-8 py-4 rounded-xl transition-all">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (authChecked && !auth.currentUser) {
    return (
      <div className="min-h-screen bg-[#020810] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 p-8 sm:p-10 rounded-[32px] max-w-lg w-full text-center">
            <h2 className="text-2xl font-black text-white mb-4">Authentication Required</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              You must be securely logged in to Dehapa to submit a verified provider application. Please log in first.
            </p>
            <Link href="/portal" className="inline-flex justify-center items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-8 py-3 rounded-xl transition-all">
              Access Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col selection:bg-teal-500/30">
      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 py-12 relative">
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none"></div>

        <div className="w-full max-w-3xl">
          {/* Progress Header */}
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center gap-3 ${step >= 1 ? 'text-teal-400' : 'text-slate-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-teal-400 bg-teal-400/10' : 'border-slate-700 bg-slate-800'}`}>
                <Phone className="w-5 h-5" />
              </div>
              <span className="font-bold hidden sm:block">1. Contact</span>
            </div>
            <div className={`h-1 flex-1 mx-4 rounded-full ${step >= 2 ? 'bg-teal-500/50' : 'bg-slate-800'}`}></div>
            <div className={`flex items-center gap-3 ${step >= 2 ? 'text-teal-400' : 'text-slate-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-teal-400 bg-teal-400/10' : 'border-slate-700 bg-slate-800'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-bold hidden sm:block">2. Identity</span>
            </div>
            <div className={`h-1 flex-1 mx-4 rounded-full ${step >= 3 ? 'bg-teal-500/50' : 'bg-slate-800'}`}></div>
            <div className={`flex items-center gap-3 ${step >= 3 ? 'text-teal-400' : 'text-slate-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-teal-400 bg-teal-400/10' : 'border-slate-700 bg-slate-800'}`}>
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-bold hidden sm:block">3. Location</span>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-[32px] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-black text-white font-serif mb-4 capitalize">
                Join as {role}
              </h1>
              <p className="text-slate-400 text-lg">
                Fast and secure application. We will verify your details.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-8 font-medium flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
              
              {/* STEP 1: CONTACT */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Phone Number *</label>
                    <input type="tel" required value={phone} onChange={handlePhoneChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors" placeholder="+91 XXXXX XXXXX" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">WhatsApp Number *</label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-white transition-colors">
                        <input type="checkbox" checked={sameAsPhone} onChange={handleSameAsPhoneChange} className="rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500/20" />
                        Same as Phone
                      </label>
                    </div>
                    <input type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} disabled={sameAsPhone} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors disabled:opacity-50" placeholder="+91 XXXXX XXXXX" />
                  </div>

                  <div className="pt-6 border-t border-slate-700/50 mt-8">
                    <button type="button" onClick={handleNextStep} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-black text-lg px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                      Continue to Details <ChevronRight className="w-6 h-6" />
                    </button>
                    <p className="text-center text-sm text-slate-500 mt-4 font-medium">Your progress is automatically saved.</p>
                  </div>
                </div>
              )}

              {/* STEP 2: VERIFICATION DETAILS */}
              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  
                  {isDoctor ? (
                    <>
                      {/* Doctor Specific Fields */}
                      <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><User className="w-5 h-5 text-teal-400"/> Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Prefix</label>
                            <input type="text" value="Dr." disabled className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-500 font-bold" />
                          </div>
                          <div className="md:col-span-2 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">First Name *</label>
                                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Last Name *</label>
                                <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" />
                            </div>
                          </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Middle Name (Optional)</label>
                            <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" />
                        </div>
                      </div>

                      <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-teal-400"/> Medical Registration</h3>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Registration Number (MCI/State) *</label>
                            <input type="text" required value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Passing Year *</label>
                                <input type="text" required value={passingYear} onChange={(e) => setPassingYear(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" placeholder="YYYY" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">College Name *</label>
                                <input type="text" required value={college} onChange={(e) => setCollege(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" />
                            </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Organization Specific Fields */}
                      <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-teal-400"/> Organization Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Prefix</label>
                            <select value={prefix} onChange={(e) => setPrefix(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none appearance-none">
                                <option value="M/S">M/S</option>
                                <option value="Pvt Ltd">Pvt Ltd</option>
                                <option value="Trust">Trust</option>
                                <option value="Govt">Govt</option>
                                <option value="Custom">Other (Type your own)</option>
                                <option value="">None (Leave blank)</option>
                            </select>
                          </div>
                          {prefix === 'Custom' && (
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Custom Prefix</label>
                                <input type="text" value={customPrefix} onChange={(e) => setCustomPrefix(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" placeholder="Enter custom prefix..." />
                            </div>
                          )}
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Organization Name *</label>
                            <input type="text" required value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Owner / Representative Name *</label>
                            <input type="text" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" />
                        </div>
                      </div>

                      <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-teal-400"/> Registration Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Registration/License No. *</label>
                                <input type="text" required value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Year Established *</label>
                                <input type="text" required value={yearEstablished} onChange={(e) => setYearEstablished(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" placeholder="YYYY" />
                            </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Shared Global Address Removed from Step 2 */}

                  {/* Document Upload */}
                  <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Official Document Proof (PDF/JPG) *</label>
                    <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center bg-slate-800/20 hover:bg-slate-800/40 transition-colors relative cursor-pointer">
                      <input 
                        type="file" 
                        required 
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFile(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {!file ? (
                        <>
                          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                          </div>
                          <p className="text-sm font-bold text-teal-400 mb-1">Click to upload document</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Registration Certificate or Valid ID</p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-teal-500/30">
                            <CheckCircle2 className="w-6 h-6 text-teal-400" />
                          </div>
                          <p className="text-sm font-bold text-teal-400">{file.name}</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Click to replace</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-700/50 flex gap-4 mt-8">
                    <button type="button" onClick={handlePreviousStep} disabled={loading} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-4 rounded-xl transition-all disabled:opacity-50">
                      Back
                    </button>
                    <button 
                      type="button" 
                      onClick={handleNextStep}
                      disabled={loading}
                      className="w-2/3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-black text-lg px-6 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      Location Details <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: LOCATION DETAILS (5-TIER) */}
              {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 space-y-6">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><MapPin className="w-5 h-5 text-teal-400"/> Clinic/Facility Location</h3>
                    <p className="text-slate-400 text-sm mb-6">This strict location format helps patients find you easily and powers our Directory SEO.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Country *</label>
                        <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none appearance-none">
                          <option value="India">India</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {country === 'India' ? (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">State *</label>
                          <select value={addressState} onChange={(e) => setAddressState(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none appearance-none">
                            <option value="">Select State</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">State / Province *</label>
                          <input type="text" value={addressState} onChange={(e) => setAddressState(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" required />
                        </div>
                      )}

                      {country === 'India' && addressState === 'Odisha' ? (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">District *</label>
                          <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none appearance-none">
                            <option value="">Select District</option>
                            {ODISHA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">District / City *</label>
                          <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" required />
                        </div>
                      )}

                      {country === 'India' && addressState === 'Odisha' && district && ODISHA_DISTRICT_BLOCKS[district] ? (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Block / Municipality</label>
                          <select value={block} onChange={(e) => setBlock(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none appearance-none">
                            <option value="">Select Block</option>
                            {ODISHA_DISTRICT_BLOCKS[district].map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Block / Area</label>
                          <input type="text" value={block} onChange={(e) => setBlock(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" />
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Local Address & Pincode *</label>
                      <textarea required value={localAddress} onChange={(e) => setLocalAddress(e.target.value)} rows={3} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none resize-none" placeholder="Building name, street, pincode..." />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-700/50 flex gap-4 mt-8">
                    <button type="button" onClick={handlePreviousStep} disabled={loading} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-4 rounded-xl transition-all disabled:opacity-50">
                      Back
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-2/3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-black text-lg uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Verification'
                      )}
                    </button>
                  </div>
                  <p className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                    By submitting, you agree to our verification terms.
                  </p>
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
    <Suspense fallback={<div className="min-h-screen bg-[#020810]"></div>}>
      <ApplyContent />
    </Suspense>
  );
}
