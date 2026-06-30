"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs, updateDoc } from 'firebase/firestore';
import HospitalProfileLayout from '@/components/HospitalProfileLayout';

export default function HospitalProfileView({ id, customSlug }: { id?: string, customSlug?: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [similarHospitals, setSimilarHospitals] = useState<any[]>([]);
  const [platformAds, setPlatformAds] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Edit Mode State
  const [canEdit, setCanEdit] = useState(false);

  const handleInlineSave = async (field: string, value: any) => {
    if (!profile || !profile.id) return;
    try {
      const docRef = doc(db, 'directory', profile.id);
      await updateDoc(docRef, { [field]: value });
      setProfile((prev: any) => ({ ...prev, [field]: value }));
    } catch (err) {
      console.error("Failed to save field:", err);
      alert("Failed to save changes.");
    }
  };

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        let docSnap: any;
        let docId = id;
        
        if (customSlug) {
          const q = query(collection(db, 'directory'), where('customSlug', '==', customSlug), limit(1));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            docSnap = querySnapshot.docs[0];
            docId = docSnap.id;
          }
        } else if (id) {
          const docRef = doc(db, 'directory', id);
          docSnap = await Promise.race([
            getDoc(docRef),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 3000))
          ]) as any;
        }
        
        if (docSnap && docSnap.exists && docSnap.exists() || (docSnap && docSnap.data)) {
          const rawData = docSnap.data();
          
          const detailsArray = [];
          if (rawData.locationData?.receptionPhone || rawData.phone) detailsArray.push({ label: "Phone", value: rawData.locationData?.receptionPhone || rawData.phone });
          if (rawData.locationData?.localAddress || rawData.address) detailsArray.push({ label: "Address", value: rawData.locationData?.localAddress || rawData.address });
          if (rawData.infrastructureData?.bedCapacity) detailsArray.push({ label: "Beds", value: rawData.infrastructureData.bedCapacity });
          if (rawData.infrastructureData?.hasEmergency) detailsArray.push({ label: "Emergency", value: "24/7 Available" });

          const rosterArray = (rawData.rosterDoctors || []).map((docObj: any) => `${docObj.name} (${docObj.department})`);
          if (rosterArray.length === 0 && rawData.departments?.length > 0) {
             rawData.departments.forEach((dept: any) => rosterArray.push(dept.name));
          }

          const docData = {
            id: docId,
            name: rawData.identityData?.hospitalName || rawData.name || "Unknown Hospital",
            subtitle: rawData.identityData?.type || rawData.category || "Hospital",
            image: rawData.identityData?.logo || rawData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawData.identityData?.hospitalName || rawData.name || "Hospital")}&background=0f766e&color=fff&size=150`,
            verified: rawData.verified || false,
            about: rawData.identityData?.about || rawData.about || "No description available.",
            stats: { 
              rating: rawData.rating || "4.5", 
              reviews: rawData.reviews || "0",
              beds: rawData.infrastructureData?.bedCapacity || "N/A"
            },
            details: detailsArray,
            roster: rosterArray,
            galleryImages: rawData.galleryImages || [],
            rawImages: rawData.rawImages || [],
            healthPackages: (rawData.healthPackages || []).map((pkg: any) => ({
              name: pkg.packageName,
              price: `₹${pkg.discountedPrice || pkg.price}`,
              included: pkg.includedTests
            })),
            mapUrl: rawData.locationData?.mapUrl || rawData.clinicMapUrl || `https://maps.google.com/maps?q=${encodeURIComponent(rawData.locationData?.localAddress || rawData.identityData?.hospitalName || 'Odisha')}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
            phone: rawData.locationData?.receptionPhone || rawData.phone || "Not available"
          };
          setProfile(docData);

          try {
            const broadQuery = query(collection(db, 'directory'), limit(50));
            const broadSnap = await getDocs(broadQuery);
            const allDocs = broadSnap.docs.map(d => ({ id: d.id, ...d.data() as any })).filter(d => d.id !== docId && !!d.image);
            let similarDocs = allDocs.filter(d => 
              d.category === "Hospital" || 
              d.category === "Diagnostic Center" ||
              d.category === "Pharmacy"
            );
            
            if (similarDocs.length < 5) {
              similarDocs = allDocs;
            }
            
            similarDocs.sort(() => 0.5 - Math.random());
            setSimilarHospitals(similarDocs.slice(0, 15)); // Increased to 15 to make sidebar longer
          } catch(e) {
            console.error("Failed to fetch similar hospitals", e);
          }

          try {
            const adsQuery = query(collection(db, 'platform_ads'), where('active', '==', true));
            const adsSnap = await getDocs(adsQuery);
            const adsData: any = {};
            
            adsSnap.forEach(d => {
              const ad = d.data();
              const slot = ad.slot || ad.slotId;
              if (slot && (ad.targetType === 'global' || !ad.targetType)) {
                adsData[slot] = ad;
              }
            });

            adsSnap.forEach(d => {
              const ad = d.data();
              const slot = ad.slot || ad.slotId;
              if (slot && ad.targetType === 'specific_profile' && ad.targetId === docId) {
                adsData[slot] = ad; 
              }
            });
            
            setPlatformAds(adsData);
          } catch(e) {
            console.error("Ads fetch failed", e);
          }

          return;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
      
      // Fallback Mock Data for testing if document does not exist
      setProfile({
        id: id || "mock-hospital",
        name: "Health Village Hospital",
        subtitle: "Corporate Hospital",
        image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80",
        verified: false,
        stats: { rating: "4.7", reviews: "128" },
        about: "State-of-the-art medical care facility offering comprehensive health services.",
        details: [
          { label: "Phone", value: "+91 98765 43210" },
          { label: "Address", value: "Bhubaneswar, Odisha" },
          { label: "Hours", value: "24/7 Open" }
        ],
        roster: ["Cardiology", "Neurology", "General Surgery"],
        rawImages: ["https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80"],
        galleryImages: [],
        healthPackages: [
          { name: "Master Health Check", price: "₹4,500", included: "CBC, Lipid, Liver" }
        ],
        mapUrl: "https://maps.google.com/maps?q=Odisha&t=&z=15&ie=UTF8&iwloc=&output=embed",
        phone: "+91 98765 43210"
      });
      setLoading(false);
    };
    fetchHospital();
  }, [id, customSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040815] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-cyan-500 font-medium tracking-widest uppercase text-sm">Loading Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#040815]">
        <h2 className="text-2xl font-bold text-white mb-2">Hospital Not Found</h2>
        <Link href="/hospitals" className="text-cyan-400 hover:underline font-bold uppercase tracking-widest text-sm">Return to Directory</Link>
      </div>
    );
  }

  return <HospitalProfileLayout profile={profile} type="hospital" canEdit={canEdit} onInlineSave={handleInlineSave} similarEntities={similarHospitals} platformAds={platformAds} />;
}
