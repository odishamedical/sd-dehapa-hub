"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import GlobalHeader from '@/components/GlobalHeader';
import GlobalFooter from '@/components/GlobalFooter';
import Link from 'next/link';

function ClaimProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('id');

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'directory', doctorId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDoctor({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setError("You must be logged in to submit a verification request.");
      return;
    }
    if (!whatsapp || !phone || !file) {
      setError("Please fill out all fields and attach a proof document.");
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Upload Proof Document to Firebase Storage
      const fileExtension = file.name.split('.').pop();
      const fileName = `verification_proofs/${auth.currentUser.uid}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      // 2. Save Verification Request to Firestore
      await addDoc(collection(db, 'listing_claims'), {
        listingId: doctor.id,
        legalName: doctor.name,
        entityType: 'Doctor',
        address: doctor.clinic?.address || doctor.city || 'Odisha',
        userEmail: auth.currentUser.email || auth.currentUser.phoneNumber || "Unknown",
        userUid: auth.currentUser.uid,
        whatsapp,
        phone,
        licenseNumber: `WhatsApp: ${whatsapp}`,
        proofUrl: downloadUrl,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error("Error submitting claim:", err);
      setError(err.message || "An error occurred while submitting your request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060B14] flex flex-col">
        <GlobalHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#060B14] flex flex-col">
        <GlobalHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Doctor Profile Not Found</h2>
          <p className="text-slate-400 mb-6">We could not find the doctor profile you are trying to claim.</p>
          <Link href="/doctors" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-xl font-bold transition-colors">
            Return to Directory
          </Link>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#060B14] flex flex-col">
        <GlobalHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-emerald-500/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.1)] max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 className="text-3xl font-black text-white mb-4 font-serif">Request Submitted!</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Thank you for verifying your profile. Our administration team has received your documents and will review them shortly. You will be notified via email or WhatsApp once approved.
            </p>
            <Link href="/" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-colors w-full inline-block">
              Return to Home
            </Link>
          </div>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060B14] flex flex-col selection:bg-amber-500/30">
      <GlobalHeader />
      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 py-12 relative">
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none"></div>

        <div className="w-full max-w-2xl bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-[32px] p-6 sm:p-10 shadow-2xl relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-white font-serif mb-4">Verify Your Profile</h1>
            <p className="text-slate-400">
              You are requesting to securely claim and manage the profile for <strong className="text-cyan-400">{doctor.name}</strong>.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-8 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">WhatsApp Number</label>
                <input 
                  type="tel" 
                  required 
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
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
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
                  placeholder="+91"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Medical Proof / ID</label>
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
                    <p className="text-sm font-bold text-cyan-400 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500">Medical Council Registration or Photo ID (PNG, JPG, PDF)</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-500/30">
                      <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p className="text-sm font-bold text-amber-400">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">Click to replace</p>
                  </>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700/50">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full"></div>
                    Submitting Proof...
                  </>
                ) : (
                  'Submit Verification Request'
                )}
              </button>
              <p className="text-xs text-center text-slate-500 mt-4 font-medium">
                By submitting, you confirm that you are the authorized representative for this profile.
              </p>
            </div>

          </form>
        </div>
      </div>
      
      <GlobalFooter />
    </div>
  );
}

export default function ClaimProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060B14]"></div>}>
      <ClaimProfileContent />
    </Suspense>
  );
}
