"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import GlobalHeader from '@/components/GlobalHeader';
import GlobalFooter from '@/components/GlobalFooter';
import { ArrowRight, CheckCircle2, Building2, MapPin, FileText, Upload } from 'lucide-react';

function HospitalApplyContent() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1: Legal Identity
  const [hospitalName, setHospitalName] = useState('');
  const [orgType, setOrgType] = useState('Private Hospital');
  const [yearEstablished, setYearEstablished] = useState('');
  
  // Step 2: Facility Overview
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [totalBeds, setTotalBeds] = useState('');
  const [emergencyServices, setEmergencyServices] = useState('Yes');
  
  // Step 3: Registration
  const [ceaNumber, setCeaNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [submitted, setSubmitted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAuthChecked(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleNextStep = () => {
    if (step === 1) {
      if (!hospitalName || !yearEstablished) {
        setError("Hospital name and Year Established are required.");
        return;
      }
    } else if (step === 2) {
      if (!hospitalAddress || !totalBeds) {
        setError("Full address and total beds are required.");
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
    if (!ceaNumber || !file) {
      setError("CEA Number and Proof document are required.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `hospital_applications/${auth.currentUser.uid}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      await addDoc(collection(db, 'hospital_applications'), {
        userUid: auth.currentUser.uid,
        userEmail: auth.currentUser.email || auth.currentUser.phoneNumber || "Unknown",
        legalIdentity: {
          name: hospitalName,
          orgType,
          yearEstablished: Number(yearEstablished)
        },
        facility: {
          address: hospitalAddress,
          totalBeds: Number(totalBeds),
          emergencyServices: emergencyServices === 'Yes'
        },
        credentials: {
          ceaNumber,
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
      <div className="min-h-screen bg-[#020810] flex flex-col selection:bg-blue-500/30">
        <GlobalHeader />
        <div className="flex-1 flex items-center justify-center p-6 py-12">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 p-8 sm:p-10 rounded-[32px] shadow-[0_0_50px_rgba(59,130,246,0.1)] max-w-2xl w-full text-center relative overflow-hidden">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20 relative z-10">
              <CheckCircle2 className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 font-serif relative z-10">Application Received!</h2>
            <p className="text-slate-400 mb-8 leading-relaxed max-w-lg mx-auto relative z-10">
              We have securely received your hospital's credentials. Our team will review your application and create your official Hospital Profile within 24-48 hours.
            </p>
            <Link href="/" className="inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-all">
              Return to Home
            </Link>
          </div>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col selection:bg-blue-500/30">
      <GlobalHeader />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 py-12 relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-3xl">
          <div className="mb-8 flex items-center gap-4 text-slate-400">
            <Link href="/join/hospital" className="hover:text-blue-400 transition-colors inline-flex items-center gap-1 text-sm font-bold">
              <ArrowRight className="w-4 h-4 rotate-180" /> Back
            </Link>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[2rem] p-6 sm:p-10 shadow-2xl relative z-10">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-white font-serif mb-2">Hospital Registration</h1>
              <p className="text-slate-400">Partner your facility with the Dehapa Network.</p>
            </div>

            {authChecked && !auth.currentUser ? (
              <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                  <Building2 className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Authentication Required</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  You must create an account or log into the Dehapa platform before submitting a hospital application.
                </p>
                <Link href={`/login?redirect=/join/hospital/apply`} className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  Login / Register
                </Link>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8 relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                  
                  {[1, 2, 3].map((num) => (
                    <div key={num} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= num ? 'bg-blue-500 text-white border-2 border-[#020810]' : 'bg-slate-800 text-slate-500 border-2 border-[#020810]'}`}>
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
                        <Building2 className="w-5 h-5 text-blue-400" />
                        <h3 className="text-xl font-bold text-white">Legal Identity</h3>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Hospital Name (Legal) *</label>
                        <input type="text" required value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" placeholder="e.g. Apollo Hospitals" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Organization Type *</label>
                          <select value={orgType} onChange={(e) => setOrgType(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors">
                            <option>Private Hospital</option>
                            <option>Trust / NGO Hospital</option>
                            <option>Corporate Chain</option>
                            <option>Government Hospital</option>
                            <option>Nursing Home</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Year Established *</label>
                          <input type="number" required value={yearEstablished} onChange={(e) => setYearEstablished(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" placeholder="e.g. 1995" />
                        </div>
                      </div>

                      <div className="pt-6">
                        <button type="button" onClick={handleNextStep} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                          Next Step <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        <h3 className="text-xl font-bold text-white">Facility Overview</h3>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Full Address *</label>
                        <textarea rows={3} value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors resize-none" placeholder="Street, City, District, Pincode" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Beds *</label>
                          <input type="number" value={totalBeds} onChange={(e) => setTotalBeds(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors" placeholder="e.g. 500" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">24/7 Emergency Services?</label>
                          <select value={emergencyServices} onChange={(e) => setEmergencyServices(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors">
                            <option value="Yes">Yes, Available</option>
                            <option value="No">No Emergency Dept</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-6 flex gap-4">
                        <button type="button" onClick={handlePreviousStep} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-4 rounded-xl transition-all">
                          Back
                        </button>
                        <button type="button" onClick={handleNextStep} className="w-2/3 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                          Next Step <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <h3 className="text-xl font-bold text-white">Registration & Credentials</h3>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Clinical Establishment Act (CEA) Number *</label>
                        <input type="text" value={ceaNumber} onChange={(e) => setCeaNumber(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors" placeholder="CEA Registration Number" />
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
                              <p className="text-sm font-bold text-blue-400 mb-1">Upload CEA Certificate</p>
                              <p className="text-xs text-slate-500">JPG, PNG or PDF</p>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
                                <CheckCircle2 className="w-6 h-6 text-blue-400" />
                              </div>
                              <p className="text-sm font-bold text-blue-400">{file.name}</p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-6 flex gap-4">
                        <button type="button" onClick={handlePreviousStep} disabled={loading} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-4 rounded-xl transition-all disabled:opacity-50">
                          Back
                        </button>
                        <button type="submit" disabled={loading} className="w-2/3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
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

export default function HospitalApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020810]"></div>}>
      <HospitalApplyContent />
    </Suspense>
  );
}
