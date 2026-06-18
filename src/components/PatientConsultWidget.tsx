"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function PatientConsultWidget({ patientId }: { patientId: string | null }) {
  const [step, setStep] = useState<'tier' | 'payment' | 'pinging'>('tier');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [price, setPrice] = useState(0);
  const router = useRouter();

  const tiers = [
    { id: 'General Doctor', name: 'General Physician', price: 299, desc: 'Fever, cold, basic medical advice.' },
    { id: 'Specialist Doctor', name: 'Specialist', price: 599, desc: 'Dermatologist, Pediatrician, Orthopedist, etc.' },
    { id: 'Super-specialist Doctor', name: 'Super Specialist', price: 999, desc: 'Cardiologist, Neurologist, Oncologist, etc.' }
  ];

  // Listen to the request once created to see if a doctor accepted
  useEffect(() => {
    if (!requestId || step !== 'pinging') return;

    const unsub = onSnapshot(doc(db, 'consultation_requests', requestId), (snap) => {
      if (snap.exists() && snap.data().status === 'accepted') {
        // Success! Redirect to the video room
        router.push(`/consultation/${requestId}`);
      }
    });

    return () => unsub();
  }, [requestId, step, router]);

  const handleSelectTier = (tier: any) => {
    if (!patientId) {
      window.location.href = '/login?redirect_uri=' + encodeURIComponent(window.location.href);
      return;
    }
    setSelectedTier(tier.id);
    setPrice(tier.price);
    setStep('payment');
  };

  const handlePaymentSuccess = async () => {
    // In Phase 4, this is where Razorpay logic goes.
    // For now, we mock success and create the request.
    try {
      const docRef = await addDoc(collection(db, 'consultation_requests'), {
        patientId,
        specialtyTier: selectedTier,
        status: 'pending',
        pricePaid: price,
        createdAt: new Date(),
      });
      setRequestId(docRef.id);
      setStep('pinging');
    } catch (err) {
      console.error('Error creating request', err);
      alert('Failed to initiate consultation. Please try again.');
      setStep('tier');
    }
  };

  if (step === 'pinging') {
    return (
      <div className="bg-white/30 backdrop-blur-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 rounded-[32px] p-8 md:p-12 text-center animate-in zoom-in duration-500 relative overflow-hidden">
        {/* Radar Animation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-64 h-64 border-[4px] border-sky-400 rounded-full animate-[ping_3s_ease-out_infinite]"></div>
          <div className="absolute w-48 h-48 border-[4px] border-sky-400 rounded-full animate-[ping_3s_ease-out_infinite_0.5s]"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <svg className="w-16 h-16 text-sky-600 animate-pulse mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Pinging Doctors...</h2>
          <p className="text-slate-600 font-medium">We are contacting available {selectedTier}s in the network.</p>
          <p className="text-sm text-slate-500 mt-4 max-w-sm">
            Please stay on this screen. You will be automatically redirected to the secure video room as soon as a doctor accepts.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="bg-white/30 backdrop-blur-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 rounded-[32px] p-8 md:p-10 relative overflow-hidden">
        <button onClick={() => setStep('tier')} className="text-slate-400 hover:text-slate-600 mb-4 flex items-center text-sm font-bold">
          &larr; Back
        </button>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Complete Payment</h2>
        <p className="text-slate-500 mb-6">You are requesting a <strong>{selectedTier}</strong>.</p>
        
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] mb-8 flex justify-between items-center">
          <span className="font-bold text-slate-700">Consultation Fee</span>
          <span className="text-2xl font-black text-slate-900">₹{price}</span>
        </div>

        <button 
          onClick={handlePaymentSuccess}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all"
        >
          Pay Securely with Razorpay
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 rounded-[32px] p-8 md:p-10 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-rose-100 text-rose-600 rounded-full">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">Instant Video Consult</h2>
          <p className="text-slate-500 text-sm mt-1">Connect with an online doctor in less than 2 minutes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier) => (
          <div 
            key={tier.id}
            onClick={() => handleSelectTier(tier)}
            className="border-2 border-slate-200 hover:border-sky-500 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-md group"
          >
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-sky-700">{tier.name}</h3>
            <div className="text-2xl font-black text-slate-900 my-2">₹{tier.price}</div>
            <p className="text-xs text-slate-500">{tier.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
