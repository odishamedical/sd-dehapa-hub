"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ClaimListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('id');
  
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userEmail = localStorage.getItem("sd_current_user_email");
    if (!userEmail) {
      // Redirect to native DehaPa login
      const redirectUrl = listingId ? `/portal/claim?id=${listingId}` : '/portal/claim';
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
    } else {
      setAuthChecked(true);
      // Auto-skip to step 2 if we already have the listing ID
      if (listingId) {
        setStep(2);
      }
    }
  }, [router, listingId]);

  const ROLES = [
    { id: "doctor", name: "Medical Practitioner", icon: "👨‍⚕️", desc: "For individual doctors and specialists." },
    { id: "hospital", name: "Hospital / Clinic", icon: "🏥", desc: "For medical facilities and nursing homes." },
    { id: "lab", name: "Diagnostic Center", icon: "🔬", desc: "For pathology and radiology labs." },
    { id: "pharmacy", name: "Pharmacy", icon: "💊", desc: "For chemists and medical stores." },
    { id: "ambulance", name: "Ambulance Service", icon: "🚑", desc: "For emergency vehicle providers." }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3); // Go to success step
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-tenant-accent/30 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/portal" className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold font-serif text-slate-900">Join DehaPa Ecosystem</h1>
            <p className="text-[10px] text-tenant-accent font-mono uppercase tracking-widest">Partner Onboarding</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 md:py-20 flex flex-col items-center justify-center">
        
        {step === 1 && (
          <div className="w-full animate-fade-in">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 rounded-full bg-tenant-accent/10 text-tenant-accent text-[10px] font-bold uppercase tracking-widest mb-4">Step 1 of 2</span>
              <h2 className="text-3xl font-serif font-bold mb-2 text-slate-900">Choose your entity type</h2>
              <p className="text-slate-500">Select the category that best describes your healthcare service.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ROLES.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-6 rounded-2xl border text-left transition-all ${selectedRole === role.id ? 'border-tenant-accent bg-tenant-accent/5 ring-1 ring-tenant-accent shadow-md' : 'border-slate-200 bg-white hover:border-tenant-accent/30'}`}
                >
                  <div className="text-3xl mb-3">{role.icon}</div>
                  <h3 className="font-bold text-slate-900 mb-1">{role.name}</h3>
                  <p className="text-xs text-slate-500">{role.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-10 flex justify-end">
              <button 
                disabled={!selectedRole}
                onClick={() => setStep(2)}
                className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${selectedRole ? 'bg-tenant-accent text-white hover:bg-teal-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full animate-fade-in">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 rounded-full bg-tenant-accent/10 text-tenant-accent text-[10px] font-bold uppercase tracking-widest mb-4">Verification</span>
              <h2 className="text-3xl font-serif font-bold mb-2 text-slate-900">Verify your listing</h2>
              <p className="text-slate-500">Submit this data to prove ownership of {listingId ? <span className="font-bold">Listing ID: {listingId}</span> : 'this listing'}.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Legal Entity Name</label>
                  <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-tenant-accent focus:ring-1 focus:ring-tenant-accent outline-none" placeholder="e.g. Apollo Hospitals" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Contact Number</label>
                  <input type="tel" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-tenant-accent focus:ring-1 focus:ring-tenant-accent outline-none" placeholder="+91" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Registration / License Number</label>
                <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-tenant-accent focus:ring-1 focus:ring-tenant-accent outline-none" placeholder="Medical council registration or GSTIN" />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Location / Address</label>
                <textarea required rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-tenant-accent focus:ring-1 focus:ring-tenant-accent outline-none" placeholder="Complete address including District and PIN code"></textarea>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                {!listingId && (
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs text-slate-500 hover:bg-slate-100 transition-colors">Back</button>
                )}
                <button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors shadow-lg">Submit for Verification</button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="w-full text-center py-16 animate-fade-in">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 border-4 border-white shadow-xl">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-3xl font-serif font-bold mb-4 text-slate-900">Application Received</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">Your verification status is under process. Once our verification officer approves it, you will get access to your listing and manage the listing.</p>
            <Link href="/portal" className="inline-block bg-tenant-accent hover:opacity-90 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors shadow-lg">
              Return to Portal
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}

export default function ClaimListingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <ClaimListingContent />
    </Suspense>
  );
}
