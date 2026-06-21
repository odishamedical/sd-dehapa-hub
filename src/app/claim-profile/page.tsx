"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, query, where, limit, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import GlobalHeader from '@/components/GlobalHeader';
import GlobalFooter from '@/components/GlobalFooter';
import Link from 'next/link';
import RazorpayCheckout from '@/components/payments/RazorpayCheckout';

function ClaimProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('id');

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [step, setStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>(null);

  // Form State
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(false);
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

  // Hydrate Draft
  useEffect(() => {
    const fetchDraft = async () => {
      if (auth.currentUser && doctorId) {
        try {
          const q = query(
            collection(db, 'listing_claims'), 
            where('userUid', '==', auth.currentUser.uid),
            where('listingId', '==', doctorId),
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
    // Let firebase auth initialize
    const timer = setTimeout(() => {
      if (auth.currentUser) fetchDraft();
    }, 1000);
    return () => clearTimeout(timer);
  }, [doctorId]);

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
        if (!draftId && auth.currentUser && doctor) {
          const docRef = await addDoc(collection(db, 'listing_claims'), {
            userUid: auth.currentUser.uid,
            userEmail: auth.currentUser.email || auth.currentUser.phoneNumber || "Unknown",
            listingId: doctor.id,
            legalName: doctor.name,
            entityType: 'Doctor',
            address: doctor.clinic?.address || doctor.city || 'Odisha',
            phone,
            whatsapp,
            status: 'draft',
            timestamp: serverTimestamp(),
            lastUpdated: serverTimestamp()
          });
          setDraftId(docRef.id);
        } else if (draftId) {
          await updateDoc(doc(db, 'listing_claims', draftId), {
            phone,
            whatsapp,
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

      // 2. Save Verification Request to Firestore (Update existing draft)
      if (draftId) {
        await updateDoc(doc(db, 'listing_claims', draftId), {
          licenseNumber: `WhatsApp: ${whatsapp}`,
          proofUrl: downloadUrl,
          status: 'pending',
          lastUpdated: serverTimestamp()
        });
      } else {
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
          timestamp: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      }

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
        <div className="flex-1 flex items-center justify-center p-6 py-12">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 sm:p-10 rounded-[32px] shadow-2xl max-w-2xl w-full text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 relative z-10">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 font-serif relative z-10">Profile Claim Initiated!</h2>
            <p className="text-slate-400 mb-8 leading-relaxed max-w-lg mx-auto relative z-10">
              We have securely received your medical documents. Our administration team will manually review them within 24-48 hours.
            </p>

            {/* Premium Upsell Card */}
            <div className="bg-slate-800/50 border border-teal-500/30 rounded-2xl p-6 text-left mb-8 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center border border-teal-500/30">
                  <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Skip the wait. Go Premium!</h3>
                  <p className="text-teal-400 text-sm">Get instantly verified today.</p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Instant Blue Tick Verification
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Rank #1 in search results in your city
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Unlock unlimited Telemedicine Video Calls
                </li>
              </ul>

              <RazorpayCheckout 
                amount={500}
                buttonText="UPGRADE TO PREMIUM (₹500/MO)"
                paymentType="DOCTOR_SUBSCRIPTION"
                onSuccess={(res) => {
                  alert('Payment Verified! You are now Premium.');
                  router.push('/portal/admin');
                }}
                className="w-full py-4 rounded-xl shadow-lg shadow-teal-500/20"
              />
            </div>

            <Link href="/" className="text-slate-500 hover:text-white text-sm font-medium transition-colors relative z-10 underline underline-offset-4">
              No thanks, I'll wait 48 hours for the free basic review.
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

          {!auth.currentUser ? (
            <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Authentication Required</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                You must be logged into the Dehapa platform to securely claim and manage this profile.
              </p>
              <Link href={`/login?redirect=/claim-profile?id=${doctor.id}`} className="inline-flex justify-center items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                Login / Register to Continue
              </Link>
            </div>
          ) : <form onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
            
            {/* STEP 1: Contact Info */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <h3 className="text-xl font-bold text-white">Contact Information</h3>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Phone Number *</label>
                  <input type="tel" required value={phone} onChange={handlePhoneChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors" placeholder="+91 XXXXX XXXXX" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">WhatsApp Number *</label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-white transition-colors">
                      <input type="checkbox" checked={sameAsPhone} onChange={handleSameAsPhoneChange} className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500/20" />
                      Same as Phone
                    </label>
                  </div>
                  <input type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} disabled={sameAsPhone} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors disabled:opacity-50" placeholder="+91 XXXXX XXXXX" />
                </div>

                <div className="pt-6 border-t border-slate-700/50">
                  <button type="button" onClick={handleNextStep} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    Save & Continue <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-4">Your progress is automatically saved.</p>
                </div>
              </div>
            )}

            {/* STEP 2: Proof Upload */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <h3 className="text-xl font-bold text-white">Identity Verification</h3>
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

                <div className="pt-6 border-t border-slate-700/50 flex gap-4">
                  <button type="button" onClick={handlePreviousStep} disabled={submitting} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-4 rounded-xl transition-all disabled:opacity-50">
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-2/3 bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Verification'
                    )}
                  </button>
                </div>
              </div>
            )}
    <p className="text-xs text-center text-slate-500 mt-4 font-medium">
                By submitting, you confirm that you are the authorized representative for this profile.
              </p>
            </div>

          </form>
          )}
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
