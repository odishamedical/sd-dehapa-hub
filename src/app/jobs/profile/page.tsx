"use client";

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { jobSeekersCollection } from '@/lib/jobs';
import MedicalSeekerWizard from '@/components/ats/MedicalSeekerWizard';
import GlobalHeader from '@/components/GlobalHeader';

export default function SeekerProfilePage() {
  const [user, setUser] = useState<{uid: string, email: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [seekerData, setSeekerData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('sd_current_user_email');
      const uid = localStorage.getItem('sd_current_user_uid');
      if (email && uid) {
        setUser({ email, uid });
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.uid) {
      getDoc(doc(jobSeekersCollection, user.uid)).then((docSnap) => {
        setHasProfile(docSnap.exists());
        if (docSnap.exists()) {
          setSeekerData(docSnap.data());
        }
      }).catch(err => {
        console.error(err);
        setHasProfile(false);
      });
    }
  }, [user]);

  if (loading || (user && hasProfile === null)) {
    return (
      <div className="min-h-screen bg-[#020810] flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#020810] pt-32 pb-20 flex flex-col items-center justify-center relative">
        <GlobalHeader activeProject="Telemedicine" />
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        </div>
        <div className="relative z-10 text-center max-w-md mx-auto px-4 text-white">
          <User className="w-16 h-16 text-teal-400 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-serif font-bold mb-4">Login Required</h2>
          <p className="text-white/60 mb-8">You need to be logged in to create a Medical Profile.</p>
          <Link href="/login" className="bg-teal-600 text-white font-bold px-8 py-4 rounded-xl w-full hover:bg-teal-500 transition-all text-center block shadow-[0_0_20px_rgba(20,184,166,0.3)]">
            Sign In to Apply
          </Link>
        </div>
      </main>
    );
  }

  // If they have a profile, we should ideally show a Seeker Dashboard.
  // For now, we'll just show a success message since we haven't built the Dashboard component yet.
  if (hasProfile && seekerData) {
    return (
      <main className="min-h-screen bg-[#020810] pt-32 pb-20 relative overflow-hidden flex flex-col">
        <GlobalHeader activeProject="Telemedicine" />
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        </div>
        <div className="relative z-10 px-4 text-center mt-20">
          <div className="bg-[#0a111a]/95 backdrop-blur-xl border border-teal-500/30 p-10 rounded-3xl max-w-2xl mx-auto shadow-[0_0_50px_rgba(20,184,166,0.15)]">
            <h1 className="text-3xl font-bold text-white mb-4">Profile Completed!</h1>
            <p className="text-slate-400 mb-8">Your medical profile is successfully created. You can now apply to any job on the portal with a single click.</p>
            <Link href="/jobs" className="bg-teal-500 text-white px-8 py-3 rounded-full font-bold hover:bg-teal-400 transition-colors shadow-[0_0_20px_rgba(20,184,166,0.4)] inline-block">
              Browse Jobs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020810] pt-24 pb-20 relative overflow-hidden">
      <GlobalHeader activeProject="Telemedicine" />
      <div className="absolute inset-0 z-0">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      </div>
      <div className="relative z-10 px-4 mt-6">
        <MedicalSeekerWizard 
          userUid={user.uid} 
          userEmail={user.email || ""} 
          onSuccess={() => {
             getDoc(doc(jobSeekersCollection, user.uid)).then(d => {
               setSeekerData(d.data());
               setHasProfile(true);
             });
          }} 
        />
      </div>
    </main>
  );
}
