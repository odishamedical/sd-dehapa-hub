"use client";

import React from 'react';
import Link from 'next/link';

import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { useState, useEffect, use } from 'react';

import CategoryNav from '@/components/CategoryNav';
import Breadcrumb from '@/components/Breadcrumb';
import UnverifiedBanner from '@/components/UnverifiedBanner';
import { generateUniversalSeoUrl } from '@/lib/urlHelpers';
import { TicketConfig } from '@/lib/ticketConfig';
import TicketCard from '@/components/TicketCard';
import PhoneRevealButton from '@/components/PhoneRevealButton';
import InlineEditField from '@/components/InlineEditField';
import InlineEditArray from '@/components/InlineEditArray';
import { updateDoc } from 'firebase/firestore';
import UniversalProfileLayout from '@/components/UniversalProfileLayout';

export default function PharmacyProfileView({ id, customSlug }: { id?: string, customSlug?: string }) {
  const [pharmacy, setPharmacy] = useState<any>(null);
  const [similarEntities, setSimilarEntities] = useState<any[]>([]);
  const [topHospitals, setTopHospitals] = useState<any[]>([]);
  const [nearbyCenters, setNearbyCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const handleInlineSave = async (field: string, value: any) => {
    if (!pharmacy || !pharmacy.id) return;
    try {
      const docRef = doc(db, 'directory', pharmacy.id);
      await updateDoc(docRef, { [field]: value });
      setPharmacy((prev: any) => ({ ...prev, [field]: value }));
    } catch (err) {
      console.error("Failed to save field:", err);
      alert("Failed to save changes.");
    }
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        if (id === 'cipla' || customSlug === 'cipla') {
          setPharmacy({
            id: 'cipla',
            name: "Cipla Limited",
            subtitle: "Global Pharmaceutical Company",
            image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=400&auto=format&fit=crop",
            verified: false,
            isPremium: true,
            stats: { products: "1,500+", network: "80+ Countries", founded: "1935" },
            about: "Cipla is a leading Indian multinational pharmaceutical company. Guided by its core purpose of \"Caring for Life,\" the company is dedicated to providing high-quality, affordable medicines to patients across the globe.",
            details: [
              { label: "Phone", value: "+91 22 4191 6000" },
              { label: "Email", value: "contactus@cipla.com" },
              { label: "Address", value: "Peninsula Business Park, Lower Parel, Mumbai" }
            ],
            roster: ["Respiratory", "Cardiovascular", "Oncology", "Anti-infectives", "HIV/AIDS"],
            rawImages: [
              "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1200&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1200&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1200&auto=format&fit=crop"
            ],
            healthPackages: [
              { name: "Asthalin Inhaler", price: "Respiratory", included: "Widely used reliever inhaler for Asthma and COPD management." },
              { name: "Foracort Inhaler", price: "Respiratory", included: "Combination maintenance inhaler for chronic asthma." },
              { name: "Triomune", price: "Anti-retroviral", included: "Pioneering affordable 3-in-1 fixed-dose combination for HIV/AIDS." }
            ],
            // Fully populated data for premium showcase:
            homeDeliveryRadius: "Global Distribution",
            registrationNumber: "WHO-GMP / US FDA Approved",
            hours: [
              { day: "Corporate", time: "Mon-Fri: 09:00 AM - 06:00 PM" },
              { day: "Manufacturing", time: "24/7 Operations" }
            ],
            topProducts: ["Asthalin Inhaler", "Foracort", "Triomune", "Ciplox", "Omnigel", "Aerocort", "Cofils", "Montair LC"],
            pharmacyType: "Distributor",
            distributorBrands: ["Cipla Limited", "Cipla Health", "InvaGen Pharmaceuticals", "GoApples"],
            clinic: {
              name: "Cipla Global Headquarters",
              address: "Cipla House, Peninsula Business Park, Ganpatrao Kadam Marg, Lower Parel, Mumbai-400013",
              phone: "+91 22 4191 6000",
              website: "https://www.cipla.com",
              mapUrl: "https://maps.google.com/maps?q=Cipla+House+Mumbai&t=&z=15&ie=UTF8&iwloc=&output=embed"
            },
            youtubeLinks: [
              { title: "Caring for Life - The Cipla Story", url: "https://www.youtube.com/watch?v=1234567890" },
              { title: "Manufacturing Excellence", url: "https://www.youtube.com/watch?v=0987654321" }
            ]
          });
          setLoading(false);
          return;
        }

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
          docSnap = await getDoc(docRef);
        }
        
        if (docSnap && docSnap.exists && docSnap.exists() || (docSnap && docSnap.data)) {
          const rawData = docSnap.data();
          const notVerified = "Not available (Not verified)";
          const docData = {
            id: docId,
            name: rawData.name || "Unknown Doctor",
            specialty: rawData.subCategory || rawData.category || "Specialist",
            experience: rawData.experience || notVerified,
            qualification: rawData.qualification || notVerified,
            rating: rawData.rating || 4.5,
            reviews: rawData.reviews || 0,
            fee: rawData.fee || "Contact Pharmacy",
            image: rawData.image || (rawData.rawImages && rawData.rawImages.length > 0 ? rawData.rawImages[0] : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawData.name || "Pharmacy")}&background=0f766e&color=fff&size=150`,
            verified: rawData.verified || false,
            about: rawData.about || notVerified,
            specialties: rawData.specialties || [rawData.subCategory || notVerified],
            education: rawData.education || [{ degree: notVerified, institution: notVerified }],
            languages: rawData.languages || [notVerified],
            banner: "https://images.unsplash.com/photo-1551076805-e18690c5e53b?auto=format&fit=crop&w=1200&q=80",
            clinic: {
              name: rawData.clinicName || notVerified,
              address: rawData.address || notVerified,
              phone: rawData.phone || notVerified,
              website: rawData.website || notVerified,
              mapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(rawData.address || rawData.name || 'Odisha')}&t=&z=15&ie=UTF8&iwloc=&output=embed`
            },
            hours: rawData.hours || [
              { day: "Operating Hours", time: notVerified }
            ],
            city: rawData.city || rawData.district || "Odisha",
            
            // New Advanced Array Fields
            locations: rawData.locations || [],
            experiences: rawData.experiences || [],
            qualificationsList: rawData.qualificationsList || [],
            research: rawData.research || [],
            awards: rawData.awards || [],
            
            // Auth Check
            ownerEmail: rawData.ownerEmail || null,
            galleryImages: rawData.galleryImages || [],
            rawImages: rawData.rawImages || []
          };
          setPharmacy(docData);

          // Check if current user can edit
          if (typeof window !== 'undefined') {
            const currentUserEmail = localStorage.getItem("sd_current_user_email");
            if (currentUserEmail === "odishamedical@gmail.com" || currentUserEmail === docData.ownerEmail) {
              setCanEdit(true);
            }
          }
          
          // Fetch sidebar widgets safely without needing complex indexes
          try {
            const cityQuery = query(
              collection(db, 'directory'),
              where("city", "==", rawData.city || ""),
              limit(30)
            );
            const citySnap = await getDocs(cityQuery);
            const allCityDocs = citySnap.docs.map(d => ({ id: d.id, ...d.data() as any })).filter(d => d.id !== docId);
            
            setSimilarEntities(allCityDocs.filter(d => d.subCategory === rawData.subCategory).slice(0, 3));
            setTopHospitals(allCityDocs.filter(d => d.category === "Hospital").slice(0, 3));
            setNearbyCenters(allCityDocs.filter(d => d.category !== "Pharmacy" && d.category !== "Hospital").slice(0, 3));
          } catch (e) {
            console.error("Failed to fetch sidebar widgets", e);
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
    return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"></div></div>;
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#040815]">
        <h2 className="text-2xl font-bold text-white mb-2">Pharmacy Not Found</h2>
        <Link href="/pharmacies" className="text-cyan-400 hover:underline font-bold uppercase tracking-widest text-sm">Return to Directory</Link>
      </div>
    );
  }

  return <UniversalProfileLayout profile={pharmacy} unwrappedParams={{ type: 'pharmacy', id: pharmacy.id }} similarEntities={similarEntities} canEdit={canEdit} onInlineSave={handleInlineSave} />;
}
