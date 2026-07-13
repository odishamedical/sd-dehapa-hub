'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export default function ClaimDynamicPage({ params }: { params: { phone: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processClaim = async () => {
      const phoneParam = params.phone;
      
      if (!phoneParam) {
        setError('No phone number provided in the link.');
        return;
      }

      // 1. Clean the incoming phone number
      const cleanPhone = phoneParam.replace(/\D/g, '');

      try {
        // 2. Search the directory
        const q = query(collection(db, 'directory'), where('phone', '==', cleanPhone), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data();
          const urlBase = data.customSlug || docSnap.id;
          router.replace(`/${urlBase}?action=claim`);
        } else {
          // Fallback formats
          let alternatePhone = cleanPhone;
          if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
            alternatePhone = '+' + cleanPhone;
          } else if (cleanPhone.length === 10) {
            alternatePhone = '+91' + cleanPhone;
          }

          const q2 = query(collection(db, 'directory'), where('phone', '==', alternatePhone), limit(1));
          const querySnapshot2 = await getDocs(q2);

          if (!querySnapshot2.empty) {
            const docSnap = querySnapshot2.docs[0];
            const data = docSnap.data();
            const urlBase = data.customSlug || docSnap.id;
            router.replace(`/${urlBase}?action=claim`);
          } else {
            setError('We could not find a business profile associated with this phone number.');
          }
        }
      } catch (err) {
        console.error('Error finding profile for claim:', err);
        setError('An error occurred while looking up your profile. Please try again.');
      }
    };

    processClaim();
  }, [params.phone, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B1121] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Profile Not Found</h1>
        <p className="text-slate-400 max-w-md mb-8">{error}</p>
        <button onClick={() => router.push('/')} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-8 py-3 rounded-xl transition-all">
          Go to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1121] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-xl font-bold text-white mb-2">Locating Your Profile...</h2>
      <p className="text-slate-400">Please wait while we redirect you to your dashboard.</p>
    </div>
  );
}
