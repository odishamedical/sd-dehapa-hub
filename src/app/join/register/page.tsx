"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import GlobalHeader from '@/components/GlobalHeader';
import GlobalFooter from '@/components/GlobalFooter';
import Link from 'next/link';

export default function RegisterProviderPage() {
  const router = useRouter();
  
  // Steps: 1 (Type), 2 (Details), 3 (Verification), 4 (Success)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Data
  const [providerType, setProviderType] = useState('Doctor');
  const [legalName, setLegalName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // Ensure the user is logged in
    const checkAuth = () => {
      const email = localStorage.getItem("sd_current_user_email");
      if (!email) {
        // We could redirect to login, but let's let them fill the form and login at the end,
        // or redirect them. Let's redirect to login for simplicity.
        window.location.href = `/login?redirect=/join/register`;
      }
    };
    checkAuth();
  }, []);

  const handleNext = () => {
    if (step === 1 && !providerType) return;
    if (step === 2 && (!legalName || !city || !fullAddress)) {
      setError("Please fill in all required fields.");
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setError("Authentication error. Please log in again.");
      return;
    }
    if (!whatsapp || !phone || !file || !licenseNumber) {
      setError("Please fill out all fields and attach your medical document.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Upload Proof Document to Firebase Storage
      const fileExtension = file.name.split('.').pop();
      const fileName = `verification_proofs/${auth.currentUser.uid}_new_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      // 2. Save Verification Request to Firestore (listing_claims with NEW_PROFILE)
      await addDoc(collection(db, 'listing_claims'), {
        listingId: 'NEW_PROFILE', // Flag for admin to create a new directory listing
        legalName: legalName,
        entityType: providerType,
        specialty: specialty || 'General',
        city: city,
        address: fullAddress,
        userEmail: auth.currentUser.email || auth.currentUser.phoneNumber || localStorage.getItem("sd_current_user_email") || "Unknown",
        userUid: auth.currentUser.uid,
        whatsapp: whatsapp,
        phone: phone,
        licenseNumber: licenseNumber,
        proofUrl: downloadUrl,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      setStep(4); // Success step
    } catch (err: any) {
      console.error("Error submitting registration:", err);
      setError(err.message || "An error occurred while submitting your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B14] flex flex-col selection:bg-amber-500/30">
      <GlobalHeader />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 py-12 relative mt-16">
        <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-teal-900/20 via-slate-900/10 to-transparent pointer-events-none"></div>

        <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-[32px] p-6 sm:p-10 shadow-2xl relative z-10">
          
          {step < 4 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={step === 1 ? () => router.push('/join') : handleBack}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-sm font-bold transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  Back
                </button>
                <div className="flex gap-2">
                  <div className={`h-2 rounded-full transition-all ${step >= 1 ? 'w-8 bg-teal-500' : 'w-2 bg-slate-700'}`}></div>
                  <div className={`h-2 rounded-full transition-all ${step >= 2 ? 'w-8 bg-teal-500' : 'w-2 bg-slate-700'}`}></div>
                  <div className={`h-2 rounded-full transition-all ${step >= 3 ? 'w-8 bg-teal-500' : 'w-2 bg-slate-700'}`}></div>
                </div>
              </div>
              <h1 className="text-3xl font-black text-white font-serif mb-2">
                {step === 1 && "What are you registering?"}
                {step === 2 && "Basic Information"}
                {step === 3 && "Verification & Security"}
              </h1>
              <p className="text-slate-400">
                {step === 1 && "Select the type of healthcare entity you operate."}
                {step === 2 && "Help patients find you in their area."}
                {step === 3 && "We need to verify your identity to ensure network security."}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-8 font-medium">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {['Doctor', 'Hospital', 'Diagnostic Lab', 'Pharmacy', 'Ambulance'].map((type) => (
                <div 
                  key={type}
                  onClick={() => setProviderType(type)}
                  className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between ${
                    providerType === type 
                      ? 'border-teal-500 bg-teal-500/10' 
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${providerType === type ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {type === 'Doctor' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
                      {type === 'Hospital' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>}
                      {type === 'Diagnostic Lab' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>}
                      {type === 'Pharmacy' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>}
                      {type === 'Ambulance' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${providerType === type ? 'text-teal-400' : 'text-white'}`}>{type}</h3>
                      <p className="text-sm text-slate-500">Register a new {type.toLowerCase()} profile.</p>
                    </div>
                  </div>
                  {providerType === type && (
                    <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  )}
                </div>
              ))}
              
              <button 
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-black tracking-wide px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]"
              >
                CONTINUE
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Legal Name</label>
                <input 
                  type="text" 
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
                  placeholder={providerType === 'Doctor' ? "Dr. Full Name" : "Name of the Facility"}
                />
              </div>

              {(providerType === 'Doctor' || providerType === 'Hospital') && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Specialty (Optional)</label>
                  <input 
                    type="text" 
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
                    placeholder="e.g. Cardiologist, Multi-Specialty"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">City / Town</label>
                  <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
                    placeholder="e.g. Bhubaneswar"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Full Address</label>
                  <textarea 
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors resize-none"
                    placeholder="Street, Landmark, Pincode"
                    rows={3}
                  />
                </div>
              </div>

              <button 
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-black tracking-wide px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]"
              >
                CONTINUE
              </button>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">WhatsApp Number</label>
                  <input 
                    type="tel" 
                    required 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
                    placeholder="+91"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Alternative Phone</label>
                  <input 
                    type="tel" 
                    required 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
                    placeholder="+91"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Medical License / Reg No.</label>
                  <input 
                    type="text" 
                    required 
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
                    placeholder="e.g. ORMC-12345"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Upload Proof Document</label>
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
                      <svg className="w-10 h-10 text-slate-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      <p className="text-sm font-bold text-teal-400 mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500">Medical License, Clinic Registration, or Valid Photo ID</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-teal-500/30">
                        <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <p className="text-sm font-bold text-teal-400">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-1">Click to replace</p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-700/50">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 px-6 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full"></div>
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Verification Request'
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              
              <h2 className="text-3xl font-black text-white mb-4 font-serif">Application Submitted!</h2>
              <p className="text-slate-400 mb-8 leading-relaxed max-w-md mx-auto">
                We have securely received your details for <strong className="text-cyan-400">{legalName}</strong>. Our medical verification team will review your application and generate your profile within 24-48 hours.
              </p>

              <button 
                onClick={() => router.push('/portal')}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-4 rounded-xl transition-colors border border-slate-700 shadow-lg"
              >
                Go to Dashboard
              </button>
            </div>
          )}

        </div>
      </div>
      
      <GlobalFooter />
    </div>
  );
}
