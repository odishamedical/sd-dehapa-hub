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
        const { doc, getDoc, collection, query, where, limit, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const docRef = doc(db, 'directory', unwrappedParams.id);
        const docSnap = await getDoc(docRef);
        
        let fetchedProfile = null;
        if (docSnap.exists()) {
          fetchedProfile = { id: unwrappedParams.id, ...docSnap.data() };
          setProfile(fetchedProfile);
        } else {
          // Fallback mock if not in DB for UI testing
          fetchedProfile = {
            id: unwrappedParams.id,
            name: "Dr. John Doe (Mock)",
            category: "Cardiologist",
            experience: "15 Years",
            qualification: "MBBS, MD",
            rating: "4.9",
            reviews: "342",
            about: "This is a fallback mock profile because the ID was not found in the database.",
          };
          setProfile(fetchedProfile);
        }

        // Fetch Related Providers
        try {
          const cat = fetchedProfile.category || fetchedProfile.primarySpecialty || "Doctor";
          const dirRef = collection(db, 'directory');
          // Try fetching doctors first
          let q = query(dirRef, where('type', '==', 'doctor'), limit(5));
          let qSnap = await getDocs(q);
          const related: any[] = [];
          
          qSnap.forEach(d => {
            if (d.id !== unwrappedParams.id && related.length < 4) {
              related.push({ id: d.id, ...d.data() });
            }
          });

          // If no doctors found, fetch ANY other directory listing (Hospitals, Labs, etc)
          if (related.length === 0) {
             const fallbackQ = query(dirRef, limit(5));
             const fallbackSnap = await getDocs(fallbackQ);
             fallbackSnap.forEach(d => {
               if (d.id !== unwrappedParams.id && related.length < 4) {
                 related.push({ id: d.id, ...d.data() });
               }
             });
          }

          setProfile((prev: any) => ({ ...prev, relatedProfiles: related }));
        } catch (err) {
          console.error("Failed to fetch related profiles", err);
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
