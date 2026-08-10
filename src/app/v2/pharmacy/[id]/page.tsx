"use client";

import React, { useState, useEffect } from 'react';
import V2UnifiedProfileLayout from '../../components/V2UnifiedProfileLayout';
import V2Header from '../../components/V2Header';

export default function V2PharmacyProfile({ params }: { params: Promise<{ id: string }> }) {
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
        
        if (docSnap.exists()) setProfile({ id: unwrappedParams.id, ...docSnap.data() });
        else setProfile({ id: unwrappedParams.id, name: "Apollo Pharmacy (Mock)", pharmacyType: "Retail Store", is247: true, doorDelivery: true, rating: "4.8" });
      } catch (e) {
        setProfile({ id: unwrappedParams.id, name: "Error Loading Profile" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [unwrappedParams.id]);

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-[#cff3f8] via-[#e2f9fb] to-[#91d1e4] flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return <><V2Header /><V2UnifiedProfileLayout profile={profile} type="pharmacy" /></>;
}
