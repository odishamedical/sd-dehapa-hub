"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import UniversalProfileLayout from '@/components/UniversalProfileLayout';



export default function PublicProfile({ params }: { params: Promise<{ type: string, id: string }> }) {
  const unwrappedParams = React.use(params);
  const [profile, setProfile] = useState<any>(null);
  const [platformAds, setPlatformAds] = useState<any>({});
  const [similarEntities, setSimilarEntities] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { doc, getDoc, collection, query, limit, getDocs, where } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        // Fetch ads in background
        getDocs(query(collection(db, 'platform_ads'), where('active', '==', true))).then(adsSnap => {
          const adsData: any = {};
          adsSnap.forEach(d => {
            const ad = d.data();
            const slot = ad.slot || ad.slotId;
            if (slot && (ad.targetType === 'global' || !ad.targetType || (ad.targetType === 'specific_profile' && ad.targetId === unwrappedParams.id))) {
              adsData[slot] = ad;
            }
          });
          setPlatformAds(adsData);
        }).catch(e => console.error("Ads fetch failed", e));

        const docRef = doc(db, 'directory', unwrappedParams.id);
        const docSnap = await Promise.race([
          getDoc(docRef),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 3000))
        ]) as any;
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const p = {
            ...data,
            name: data.name || data.basicInfo?.fullName || "Unnamed",
            subtitle: data.category || data.basicInfo?.specialityName || "Data not provided",
            image: data.image || data.basicInfo?.profilePhoto || "/logo.png",
            about: data.about || data.description || "Data not provided.",
            stats: data.stats || {},
            details: data.details || [],
            roster: data.roster || [],
            verified: data.verified || false,
            galleryImages: data.galleryImages || [],
            rawImages: data.rawImages || [],
            youtubeLinks: data.youtubeLinks || [],
            mapUrl: data.mapUrl || data.clinicMapUrl || "",
            phone: data.phone || data.receptionPhone || "Data not provided"
          };
          setProfile(p);

          // Fetch similar entities
          try {
            const broadQuery = query(collection(db, 'directory'), limit(50));
            const broadSnap = await getDocs(broadQuery);
            const allDocs = broadSnap.docs.map(d => ({ id: d.id, ...d.data() as any })).filter(d => d.id !== unwrappedParams.id && !!d.image);
            let similarDocs = allDocs.filter(d => d.category?.toLowerCase() === unwrappedParams.type);
            setSimilarEntities(similarDocs.slice(0, 6));
          } catch(e) {
            console.error("Failed to fetch similar entities", e);
          }

          return;
        } else {
          // No doc found, show empty state instead of mock data
          setProfile({
            id: unwrappedParams.id,
            name: "Profile Not Found",
            subtitle: "Data not provided",
            image: "/logo.png",
            about: "This profile does not exist or has not been published yet.",
            stats: {},
            details: [],
            roster: [],
            verified: false,
            rawImages: [],
            galleryImages: [],
            phone: "Data not provided"
          });
        }
      } catch(err) {
        console.log("Failed to fetch from DB", err);
        setProfile({
            id: unwrappedParams.id,
            name: "Error loading profile",
            subtitle: "Data not provided",
            image: "/logo.png",
            about: "There was an error loading this profile.",
            stats: {},
            details: [],
            roster: [],
            verified: false,
            rawImages: [],
            galleryImages: [],
            phone: "Data not provided"
        });
      }
    };
    fetchProfile();
  }, [unwrappedParams.type, unwrappedParams.id]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#060B14] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Use the exact same layout for ALL profiles (Hospitals, Doctors, Clinics, Labs)
  return <UniversalProfileLayout profile={profile} unwrappedParams={unwrappedParams} platformAds={platformAds} similarEntities={similarEntities} />;
}

