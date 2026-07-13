"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HorizontalScrollGallery from '@/components/HorizontalScrollGallery';

import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';

import CategoryNav from '@/components/CategoryNav';
import Breadcrumb from '@/components/Breadcrumb';
import TicketCard from '@/components/TicketCard';
import { TicketConfig } from '@/lib/ticketConfig';
import PhoneRevealButton from '@/components/PhoneRevealButton';
import InlineEditField from '@/components/InlineEditField';
import InlineEditArray from '@/components/InlineEditArray';
import { updateDoc } from 'firebase/firestore';
import { generateUniversalSeoUrl } from '@/lib/urlHelpers';
import UnifiedProfileLayout from '@/components/UnifiedProfileLayout';

export default function DoctorProfileView({ id, customSlug }: { id?: string, customSlug?: string }) {
  const [doctor, setDoctor] = useState<any>(null);
  const [similarDoctors, setSimilarDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformAds, setPlatformAds] = useState<any>({});

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  // UX Tabs State
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'experience' | 'research' | 'media'>('locations');
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);

  const handleInlineSave = async (field: string, value: any) => {
    if (!doctor || !doctor.id) return;
    try {
      const docRef = doc(db, 'directory', doctor.id);
      await updateDoc(docRef, { [field]: value });
      
      setDoctor((prev: any) => {
        const updated = { ...prev, [field]: value };
        // Sync root fields with the nested clinic object so the UI updates instantly
        if (field === 'address' || field === 'phone' || field === 'website' || field === 'clinicName') {
           updated.clinic = {
             ...prev.clinic,
             [field === 'clinicName' ? 'name' : field]: value
           };
        }
        return updated;
      });
    } catch (err) {
      console.error("Failed to save field:", err);
      alert("Failed to save changes.");
    }
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        let docSnap: any;
        let docId = id;
        
        if (customSlug) {
          let q = query(collection(db, 'directory'), where('customSlug', '==', customSlug), limit(1));
          let querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            // Hotfix: catch older documents that accidentally saved with a trailing space
            q = query(collection(db, 'directory'), where('customSlug', '==', customSlug + ' '), limit(1));
            querySnapshot = await getDocs(q);
          }

          if (!querySnapshot.empty) {
            docSnap = querySnapshot.docs[0];
            docId = docSnap.id;
          } else {
            const docRef = doc(db, 'directory', customSlug);
            const fallbackSnap = await getDoc(docRef);
            if (fallbackSnap.exists()) {
              docSnap = fallbackSnap;
              docId = fallbackSnap.id;
            }
          }
        } else if (id) {
          const docRef = doc(db, 'directory', id);
          docSnap = await getDoc(docRef);
        }
        
        if (docSnap && docSnap.exists && docSnap.exists() || (docSnap && docSnap.data)) {
          const rawData = docSnap.data();
          const notVerified = "Not available (Not verified)";
          const docData = {
            id: docId,
            name: rawData.firstName 
                    ? [rawData.prefix, rawData.firstName, rawData.middleName, rawData.lastName].filter(Boolean).join(" ") 
                    : (rawData.name || "Unknown Doctor"),
            specialty: rawData.subCategory || rawData.category || "Specialist",
            experience: rawData.experience || notVerified,
            qualification: rawData.qualification || notVerified,
            rating: rawData.rating || 4.8,
            reviews: rawData.reviews || 0,
            fee: rawData.fee || "Contact Clinic",
            image: rawData.image || (rawData.rawImages && rawData.rawImages.length > 0 ? rawData.rawImages[0] : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawData.name || "Doc")}&background=0f766e&color=fff&size=150`,
            verified: rawData.verified || false,
            about: rawData.about || notVerified,
            specialties: rawData.specialties || [rawData.subCategory || notVerified],
            education: rawData.education || [{ degree: notVerified, institution: notVerified }],
            languages: rawData.languages || [notVerified],
            banner: "https://images.unsplash.com/photo-1551076805-e18690c5e53b?auto=format&fit=crop&w=1200&q=80",
            clinic: {
              name: rawData.clinicName || rawData.address?.split(',')[0] || notVerified,
              address: rawData.address || notVerified,
              phone: rawData.phone || notVerified,
              website: rawData.website || notVerified,
              mapUrl: (rawData.mapUrl || rawData.clinicMapUrl || "").includes('output=embed') || (rawData.mapUrl || rawData.clinicMapUrl || "").includes('pb=') 
                ? (rawData.mapUrl || rawData.clinicMapUrl)
                : `https://maps.google.com/maps?q=${encodeURIComponent(rawData.address || rawData.name || 'Odisha')}&t=&z=15&ie=UTF8&iwloc=&output=embed`
            },
            hours: rawData.hours || [
              { day: "Operating Hours", time: notVerified }
            ],
            city: rawData.city || rawData.district || "Odisha",
            
            locations: rawData.locations || [],
            experiences: rawData.experiences || [],
            qualificationsList: rawData.qualificationsList || [],
            research: rawData.research || [],
            awards: rawData.awards || [],
            
            dob: rawData.dob || "",
            maritalStatus: rawData.maritalStatus || "",
            registrationNumber: rawData.registrationNumber || "",
            showPersonalDetails: rawData.showPersonalDetails || false,
            
            ownerEmail: rawData.ownerEmail || null,
            galleryImages: rawData.galleryImages || [],
            rawImages: rawData.rawImages || [],
            youtubeLinks: rawData.youtubeLinks || []
          };
          setDoctor(docData);

          if (typeof window !== 'undefined') {
            const currentUserEmail = localStorage.getItem("sd_current_user_email");
            if (currentUserEmail === "odishamedical@gmail.com" || currentUserEmail === docData.ownerEmail) {
              setCanEdit(true);
            }
          }
          
          try {
            const broadQuery = query(collection(db, 'directory'), limit(50));
            const broadSnap = await getDocs(broadQuery);
            const allDocs = broadSnap.docs.map(d => ({ id: d.id, ...d.data() as any })).filter(d => d.id !== docId && !!d.image);
            let similarDocs = allDocs.filter(d => 
              (d.category === "Doctor" && d.subCategory === rawData.subCategory) ||
              d.category === "Hospital" || 
              d.category === "Diagnostic Center" ||
              d.category === "Pharmacy"
            );
            
            // If we don't have enough mixed types, fallback to any verified directory entity
            if (similarDocs.length < 5) {
              similarDocs = allDocs;
            }
            
            // Shuffle the array to show a random mix
            similarDocs.sort(() => 0.5 - Math.random());
            setSimilarDoctors(similarDocs.slice(0, 15));
          } catch(e) {
            console.error("Failed to fetch similar doctors", e);
          }
          try {
            const adsQuery = query(collection(db, 'platform_ads'), where('active', '==', true));
            const adsSnap = await getDocs(adsQuery);
            const adsData: any = {};
            
            // 1. First pass: Apply global ads
            adsSnap.forEach(d => {
              const ad = d.data();
              const slot = ad.slot || ad.slotId;
              if (slot && (ad.targetType === 'global' || !ad.targetType)) {
                adsData[slot] = ad;
              }
            });

            // 2. Second pass: Override with specific profile ads if they match docId
            adsSnap.forEach(d => {
              const ad = d.data();
              const slot = ad.slot || ad.slotId;
              if (slot && ad.targetType === 'specific_profile' && ad.targetId === docId) {
                adsData[slot] = ad; // Overrides the global ad
              }
            });
            
            setPlatformAds(adsData);
          } catch(e) {
            console.error("Ads fetch failed", e);
          }

        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id, customSlug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0B1121]"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div></div>;
  }

  if (!doctor) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0B1121]"><div className="text-center"><h2 className="text-2xl font-bold text-white mb-2">Doctor Not Found</h2><Link href="/doctors" className="text-cyan-400 hover:underline">Return to Directory</Link></div></div>;
  }

  return (
    <UnifiedProfileLayout 
      profile={doctor} 
      type="doctor" 
      canEdit={canEdit} 
      onInlineSave={handleInlineSave}
      similarEntities={similarDoctors}
      platformAds={platformAds}
    />
  );
}
