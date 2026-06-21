"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, limit, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import GlobalHeader from '@/components/GlobalHeader';
import GlobalFooter from '@/components/GlobalFooter';
import { ArrowRight, CheckCircle2, User, Building2, FileText, Upload } from 'lucide-react';

function DoctorApplyContent() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draftId, setDraftId] = useState<string | null>(null);

  // Step 1: Contact Info
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(false);
  
  // Step 2: Legal Identity & Clinic
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialty, setSpecialty] = useState('General Physician');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [consultationType, setConsultationType] = useState('In-person & Online');
  const [consultationFee, setConsultationFee] = useState('');
  
  // Step 3: Registration
  const [mciNumber, setMciNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [submitted, setSubmitted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAuthChecked(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Hydrate Draft
  useEffect(() => {
    const fetchDraft = async () => {
      if (auth.currentUser) {
        try {
          const q = query(
            collection(db, 'doctor_applications'), 
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
            if (data.officialName?.first) setFirstName(data.officialName.first);
            if (data.officialName?.last) setLastName(data.officialName.last);
            if (data.specialty) setSpecialty(data.specialty);
            if (data.clinic?.name) setClinicName(data.clinic.name);
            if (data.clinic?.address) setClinicAddress(data.clinic.address);
            if (data.clinic?.consultationFee) setConsultationFee(data.clinic.consultationFee.toString());
            // If they already filled step 1, jump to step 2
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
          const docRef = await addDoc(collection(db, 'doctor_applications'), {
            userUid: auth.currentUser.uid,
            userEmail: auth.currentUser.email || auth.currentUser.phoneNumber || "Unknown",
            phone,
            whatsapp,
            status: 'draft',
            timestamp: serverTimestamp(),
            lastUpdated: serverTimestamp()
          });
          setDraftId(docRef.id);
        } else if (draftId) {
          await updateDoc(doc(db, 'doctor_applications', draftId), {
            phone,
            whatsapp,
            lastUpdated: serverTimestamp()
          });
        }
      } catch(e) {
        console.error("Failed to save draft", e);
      }

    } else if (step === 2) {
      if (!firstName || !lastName || !clinicName || !clinicAddress) {
        setError("Please fill out all required fields.");
        return;
      }
      // Update Draft
      try {
        if (draftId) {
          await updateDoc(doc(db, 'doctor_applications', draftId), {
            officialName: {
              first: firstName,
              middle: middleName,
              last: lastName,
              full: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim()
            },
            specialty,
            clinic: {
              name: clinicName,
              address: clinicAddress,
              consultationType,
              consultationFee: Number(consultationFee)
            },
            lastUpdated: serverTimestamp()
          });
        }
      } catch(e) {
        console.error("Failed to save draft", e);
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
    if (!mciNumber || !file) {
      setError("MCI Number and Proof document are required.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Upload Proof Document to Firebase Storage
      const fileExtension = file.name.split('.').pop();
      const fileName = `doctor_applications/${auth.currentUser.uid}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      // 2. Submit Application to Firestore (Update existing draft)
      if (draftId) {
        await updateDoc(doc(db, 'doctor_applications', draftId), {
          credentials: {
            mciNumber,
            proofUrl: downloadUrl
          },
          status: 'pending',
          lastUpdated: serverTimestamp()
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
        <GlobalHeader />
        <div className="flex-1 flex items-center justify-center p-6 py-12">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-teal-500/30 p-8 sm:p-10 rounded-[32px] shadow-[0_0_50px_rgba(20,184,166,0.1)] max-w-2xl w-full text-center relative overflow-hidden">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 relative z-10">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 font-serif relative z-10">Application Received!</h2>
            <p className="text-slate-400 mb-8 leading-relaxed max-w-lg mx-auto relative z-10">
              We have securely received your medical credentials. Our team will review your application and create your official Doctor Profile within 24-48 hours.
            </p>

            <Link href="/" className="inline-flex justify-center items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-8 py-4 rounded-xl transition-all">
              Return to Home
            </Link>
          </div>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col selection:bg-teal-500/30">
      <GlobalHeader />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 py-12 relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-900/20 blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-3xl">
          <div className="mb-8 flex items-center gap-4 text-slate-400">
            <Link href="/join/doctor" className="hover:text-teal-400 transition-colors inline-flex items-center gap-1 text-sm font-bold">
              <ArrowRight className="w-4 h-4 rotate-180" /> Back
            </Link>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[2rem] p-6 sm:p-10 shadow-2xl relative z-10">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-white font-serif mb-2">Doctor Registration</h1>
              <p className="text-slate-400">Complete your profile to join the Dehapa Provider Network.</p>
            </div>

            {/* Auth Check Gate */}
            {authChecked && !auth.currentUser ? (
              <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl text-center">
                <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-500/20">
                  <User className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Authentication Required</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  You must create an account or log into the Dehapa platform before submitting a medical application.
                </p>
                <Link href={`/join/doctor/apply`} className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                  Login / Register
                </Link>
              </div>
            ) : (
              <>
                {/* Progress Bar */}
                <div className="flex justify-between items-center mb-8 relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                  
                  {[1, 2, 3].map((num) => (
                    <div key={num} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= num ? 'bg-teal-500 text-slate-900 border-2 border-[#020810]' : 'bg-slate-800 text-slate-500 border-2 border-[#020810]'}`}>
                      {num}
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-8 font-medium text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
                  {/* STEP 1: Contact Info */}
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <User className="w-5 h-5 text-teal-400" />
                        <h3 className="text-xl font-bold text-white">Contact Information</h3>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Phone Number *</label>
                        <input type="tel" required value={phone} onChange={handlePhoneChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors" placeholder="+91 XXXXX XXXXX" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">WhatsApp Number *</label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-white transition-colors">
                            <input type="checkbox" checked={sameAsPhone} onChange={handleSameAsPhoneChange} className="rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500/20" />
                            Same as Phone
                          </label>
                        </div>
                        <input type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} disabled={sameAsPhone} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors disabled:opacity-50" placeholder="+91 XXXXX XXXXX" />
                      </div>

                      <div className="pt-6">
                        <button type="button" onClick={handleNextStep} className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-900 font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                          Save & Continue <ArrowRight className="w-5 h-5" />
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-4">Your progress is automatically saved.</p>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Legal Identity */}
                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <User className="w-5 h-5 text-teal-400" />
                        <h3 className="text-xl font-bold text-white">Professional Identity</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">First Name *</label>
                          <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors" placeholder="e.g. Ramesh" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Last Name *</label>
                          <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors" placeholder="e.g. Kumar" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Primary Specialty *</label>
                        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none transition-colors">
                          <option>General Physician</option>
                          <option>Cardiologist</option>
                          <option>Dermatologist</option>
                          <option>Pediatrician</option>
                          <option>Orthopedic</option>
                          <option>Dentist</option>
                        </select>
                      </div>

                      <div className="pt-4 border-t border-slate-800">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Clinic / Hospital Name *</label>
                        <input type="text" value={clinicName} onChange={(e) => setClinicName(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none transition-colors mb-4" placeholder="e.g. Apollo Hospital" />
                        
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Full Address *</label>
                        <textarea rows={3} value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none transition-colors resize-none mb-4" placeholder="Street, City, Pincode" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Consultation Mode</label>
                          <select value={consultationType} onChange={(e) => setConsultationType(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none transition-colors">
                            <option value="both">Both (In-Clinic + Online)</option>
                            <option value="offline">In-Clinic Only</option>
                            <option value="online">Online Video Only</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Standard Fee (₹) *</label>
                          <input type="number" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none transition-colors" placeholder="e.g. 500" />
                        </div>
                      </div>

                      <div className="pt-6 flex gap-4">
                        <button type="button" onClick={handlePreviousStep} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-4 rounded-xl transition-all">
                          Back
                        </button>
                        <button type="button" onClick={handleNextStep} className="w-2/3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                          Next Step <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <FileText className="w-5 h-5 text-teal-400" />
                        <h3 className="text-xl font-bold text-white">Medical Credentials</h3>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Medical Registration Number (MCI/SMC) *</label>
                        <input type="text" value={mciNumber} onChange={(e) => setMciNumber(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none transition-colors" placeholder="Registration Number" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Proof Document *</label>
                        <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center bg-slate-800/20 hover:bg-slate-800/40 transition-colors relative cursor-pointer">
                          <input 
                            type="file" 
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
                              <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                              <p className="text-sm font-bold text-teal-400 mb-1">Upload Registration Certificate</p>
                              <p className="text-xs text-slate-500">JPG, PNG or PDF</p>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-teal-500/30">
                                <CheckCircle2 className="w-6 h-6 text-teal-400" />
                              </div>
                              <p className="text-sm font-bold text-teal-400">{file.name}</p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-6 flex gap-4">
                        <button type="button" onClick={handlePreviousStep} disabled={loading} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-4 rounded-xl transition-all disabled:opacity-50">
                          Back
                        </button>
                        <button type="submit" disabled={loading} className="w-2/3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(20,184,166,0.3)]">
                          {loading ? (
                            <><div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div> Submitting...</>
                          ) : (
                            'Submit Application'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      
      <GlobalFooter />
    </div>
  );
}

export default function DoctorApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020810]"></div>}>
      <DoctorApplyContent />
    </Suspense>
  );
}
