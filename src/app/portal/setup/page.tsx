"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { UserCircle, Phone, MapPin, Activity, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

function SetupHealthPassportInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/portal';

  const [whatsapp, setWhatsapp] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Protect route
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      }
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    if (!whatsapp || !age || !sex || !address) {
      setError("Please complete all fields to secure your health passport.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        whatsapp,
        age: parseInt(age),
        sex,
        address,
        isProfileComplete: true,
        updatedAt: new Date()
      });

      // Update local storage so future logins know it's complete
      localStorage.setItem("sd_current_user_profile_complete", "true");
      
      // Redirect back to wherever they were going (or to portal)
      router.push(redirectUrl);
    } catch (err: any) {
      console.error(err);
      setError("Failed to save profile. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1128] font-sans selection:bg-teal-500/30 selection:text-teal-200">
      
      <main className="pt-24 pb-20 px-4 flex justify-center items-center min-h-screen relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-teal-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-xl relative z-10">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-[0_10px_30px_rgba(20,184,166,0.3)]">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">Health Passport</h1>
              <p className="text-slate-400 text-sm">
                Complete this one-time setup to unlock 1-Click Booking. We will never ask for this information again.
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Age</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Activity className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                      placeholder="e.g. 34"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Biological Sex</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserCircle className="h-5 w-5 text-slate-500" />
                    </div>
                    <select
                      value={sex}
                      onChange={(e) => setSex(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3.5 pl-12 pr-10 appearance-none focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                      required
                    >
                      <option value="" disabled>Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Current Location (City / Area)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="e.g. Bhubaneswar, Odisha"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-slate-900 py-4 rounded-xl font-black text-sm transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] hover:-translate-y-1 flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving Identity...' : 'Save & Continue'}
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
            
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SetupHealthPassport() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A1128] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    }>
      <SetupHealthPassportInner />
    </Suspense>
  );
}
