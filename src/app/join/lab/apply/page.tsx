"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import GlobalHeader from '@/components/GlobalHeader';
import GlobalFooter from '@/components/GlobalFooter';
import { ArrowRight, CheckCircle2, FlaskConical, MapPin, FileText, Upload } from 'lucide-react';

function LabApplyContent() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1: Legal Identity
  const [labName, setLabName] = useState('');
  const [headDoctorName, setHeadDoctorName] = useState('');
  const [labType, setLabType] = useState('Pathology');
  
  // Step 2: Operations
  const [labAddress, setLabAddress] = useState('');
  const [homeCollection, setHomeCollection] = useState('Yes');
  const [is247, setIs247] = useState('No');
  
  // Step 3: Accreditations
  const [accreditation, setAccreditation] = useState('NABL');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [submitted, setSubmitted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAuthChecked(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleNextStep = () => {
    if (step === 1) {
      if (!labName || !headDoctorName) {
        setError("Lab name and Head Pathologist/Radiologist are required.");
        return;
      }
    } else if (step === 2) {
      if (!labAddress) {
        setError("Full address is required.");
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
    if (!registrationNumber || !file) {
      setError("Registration Number and Proof document are required.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `lab_applications/${auth.currentUser.uid}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      await addDoc(collection(db, 'lab_applications'), {
        userUid: auth.currentUser.uid,
        userEmail: auth.currentUser.email || auth.currentUser.phoneNumber || "Unknown",
        legalIdentity: {
          name: labName,
          headDoctorName,
          labType
        },
        operations: {
          address: labAddress,
          homeCollection: homeCollection === 'Yes',
          is247: is247 === 'Yes'
        },
        credentials: {
          accreditation,
          registrationNumber,
          proofUrl: downloadUrl
        },
        status: 'pending',
        timestamp: serverTimestamp()
      });

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
      <div className="min-h-screen bg-[#020810] flex flex-col selection:bg-purple-500/30">
        <GlobalHeader />
        <div className="flex-1 flex items-center justify-center p-6 py-12">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-8 sm:p-10 rounded-[32px] shadow-[0_0_50px_rgba(168,85,247,0.1)] max-w-2xl w-full text-center relative overflow-hidden">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/20 relative z-10">
              <CheckCircle2 className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 font-serif relative z-10">Application Received!</h2>
            <p className="text-slate-400 mb-8 leading-relaxed max-w-lg mx-auto relative z-10">
              We have securely received your lab's credentials. Our team will review your application and create your official Diagnostic Lab Profile within 24-48 hours.
            </p>
            <Link href="/" className="inline-flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-4 rounded-xl transition-all">
              Return to Home
            </Link>
          </div>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col selection:bg-purple-500/30">
      <GlobalHeader />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 py-12 relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-3xl">
          <div className="mb-8 flex items-center gap-4 text-slate-400">
            <Link href="/join/lab" className="hover:text-purple-400 transition-colors inline-flex items-center gap-1 text-sm font-bold">
              <ArrowRight className="w-4 h-4 rotate-180" /> Back
            </Link>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[2rem] p-6 sm:p-10 shadow-2xl relative z-10">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-white font-serif mb-2">Diagnostic Lab Registration</h1>
              <p className="text-slate-400">Partner your lab with the Dehapa Network.</p>
            </div>

            {authChecked && !auth.currentUser ? (
              <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl text-center">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                  <FlaskConical className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Authentication Required</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  You must create an account or log into the Dehapa platform before submitting a lab application.
                </p>
                <Link href={`/login?redirect=/join/lab/apply`} className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  Login / Register
                </Link>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8 relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                  
                  {[1, 2, 3].map((num) => (
                    <div key={num} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= num ? 'bg-purple-500 text-white border-2 border-[#020810]' : 'bg-slate-800 text-slate-500 border-2 border-[#020810]'}`}>
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
                  {/* STEP 1 */}
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <FlaskConical className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xl font-bold text-white">Legal Identity</h3>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Lab / Diagnostic Center Name *</label>
                        <input type="text" required value={labName} onChange={(e) => setLabName(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors" placeholder="e.g. Dr. Lal PathLabs" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Head Pathologist / Radiologist *</label>
                          <input type="text" required value={headDoctorName} onChange={(e) => setHeadDoctorName(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors" placeholder="Doctor's Name" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Lab Type *</label>
                          <select value={labType} onChange={(e) => setLabType(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors">
                            <option>Pathology</option>
                            <option>Radiology</option>
                            <option>Both (Pathology & Radiology)</option>
                            <option>Blood Bank</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-6">
                        <button type="button" onClick={handleNextStep} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                          Next Step <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <MapPin className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xl font-bold text-white">Operations</h3>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Full Address *</label>
                        <textarea rows={3} value={labAddress} onChange={(e) => setLabAddress(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors resize-none" placeholder="Street, City, District, Pincode" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Offer Home Sample Collection?</label>
                          <select value={homeCollection} onChange={(e) => setHomeCollection(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors">
                            <option value="Yes">Yes, we provide home collection</option>
                            <option value="No">No, walk-in only</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Open 24/7?</label>
                          <select value={is247} onChange={(e) => setIs247(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors">
                            <option value="No">Standard Timings</option>
                            <option value="Yes">Yes, 24/7</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-6 flex gap-4">
                        <button type="button" onClick={handlePreviousStep} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-4 rounded-xl transition-all">
                          Back
                        </button>
                        <button type="button" onClick={handleNextStep} className="w-2/3 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                          Next Step <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xl font-bold text-white">Accreditations</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Primary Accreditation *</label>
                          <select value={accreditation} onChange={(e) => setAccreditation(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors">
                            <option>NABL</option>
                            <option>CAP</option>
                            <option>ISO 15189</option>
                            <option>None / Pending</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Registration No. *</label>
                          <input type="text" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors" placeholder="Registration/License Number" />
                        </div>
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
                              <p className="text-sm font-bold text-purple-400 mb-1">Upload Accreditation / Trade License</p>
                              <p className="text-xs text-slate-500">JPG, PNG or PDF</p>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
                                <CheckCircle2 className="w-6 h-6 text-purple-400" />
                              </div>
                              <p className="text-sm font-bold text-purple-400">{file.name}</p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-6 flex gap-4">
                        <button type="button" onClick={handlePreviousStep} disabled={loading} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-4 rounded-xl transition-all disabled:opacity-50">
                          Back
                        </button>
                        <button type="submit" disabled={loading} className="w-2/3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
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

export default function LabApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020810]"></div>}>
      <LabApplyContent />
    </Suspense>
  );
}
