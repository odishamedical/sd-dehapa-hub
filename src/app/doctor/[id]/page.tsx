"use client";

import React, { useState, useEffect } from 'react';
import V2UnifiedProfileLayout from '@/components/v2/V2UnifiedProfileLayout';
import V2Header from '@/components/v2/V2Header';

export default function V2DoctorProfile({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const docRef = doc(db, 'directory', unwrappedParams.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({ id: unwrappedParams.id, ...data });
        } else {
          // Fallback mock if not in DB for UI testing
          setProfile({
            id: unwrappedParams.id,
            name: "Dr. John Doe (Mock)",
            category: "Cardiologist",
            experience: "15 Years",
            qualification: "MBBS, MD",
            rating: "4.9",
            reviews: "342",
            about: "This is a fallback mock profile because the ID was not found in the database.",
          });
        }
      } catch (e) {
        setProfile({ id: unwrappedParams.id, name: "Error Loading Profile" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#cff3f8] via-[#e2f9fb] to-[#91d1e4] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <V2Header />
      <V2UnifiedProfileLayout profile={profile} type="doctor" />
    </>
  );
}
