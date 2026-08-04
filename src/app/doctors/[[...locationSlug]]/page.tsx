import React from 'react';
import DoctorListingView from '@/components/views/DoctorListingView';
import DoctorProfileView from '@/components/views/DoctorProfileView';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locationSlug?: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.locationSlug || [];
  
  if (slug.length === 4 || (slug.length === 1 && !["india", "usa", "uae", "australia", "england"].includes(slug[0].toLowerCase()))) {
    let doctorData = null;
    
    if (slug.length === 4) {
      const doctorParam = slug[3];
      let id;
      const chijIndex = doctorParam.indexOf('-ChIJ');
      if (chijIndex !== -1) {
        id = doctorParam.substring(chijIndex + 1);
      } else if (doctorParam.startsWith('ChIJ')) {
        id = doctorParam;
      } else {
        const parts = doctorParam.split('-');
        id = parts[parts.length - 1];
      }
      
      const docRef = doc(db, 'directory', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        doctorData = docSnap.data();
      }
    } else if (slug.length === 1) {
      if (slug[0].startsWith('ChIJ') || (slug[0].length === 20 && !slug[0].includes('-'))) {
        const docRef = doc(db, 'directory', slug[0]);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          doctorData = docSnap.data();
        }
      } else {
        const q = query(collection(db, 'directory'), where('customSlug', '==', slug[0]), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          doctorData = querySnapshot.docs[0].data();
        }
      }
    }

    if (doctorData) {
      return {
        title: `${doctorData.name} | DehaPa Hub`,
        description: doctorData.about || `Book an appointment with ${doctorData.name} on DehaPa.`,
        openGraph: {
          title: `${doctorData.name} - ${doctorData.subtitle || 'Healthcare Professional'}`,
          description: doctorData.about || `Book an appointment with ${doctorData.name} on DehaPa.`,
          images: doctorData.image ? [{ url: doctorData.image, width: 800, height: 600, alt: doctorData.name }] : undefined,
        }
      };
    }
  }

  return {
    title: 'Find Doctors | DehaPa Hub',
    description: 'Find and book appointments with top doctors on DehaPa.',
  };
}

export default async function DoctorsRoute({ params }: { params: Promise<{ locationSlug?: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.locationSlug || [];
  
  // Check if the last slug element is a profile ID or custom slug
  const lastParam = slug[slug.length - 1];
  let isProfile = false;
  let profileId = "";

  if (lastParam) {
    if (lastParam.indexOf('-ChIJ') !== -1) {
      isProfile = true;
      profileId = lastParam.substring(lastParam.indexOf('-ChIJ') + 1);
    } else if (lastParam.startsWith('ChIJ') || (lastParam.length === 20 && !lastParam.includes('-'))) {
      isProfile = true;
      profileId = lastParam;
    } else if (lastParam.includes('-') && slug.length > 2) {
      // Possible fallback for old ID format at the end of a long slug
      const parts = lastParam.split('-');
      const potentialId = parts[parts.length - 1];
      if (potentialId.length >= 15) { // Firebase ID or similar
        isProfile = true;
        profileId = potentialId;
      }
    }
  }

  if (isProfile) {
    return <DoctorProfileView id={profileId} />;
  }

  if (slug.length === 1 && !["ayush", "mbbs", "specialist", "super-specialist", "india", "usa", "uae"].includes(slug[0].toLowerCase())) {
    // Premium Custom Slug detected! (e.g., /doctors/dr-milan)
    return <DoctorProfileView customSlug={slug[0]} />;
  }

  // It's a listing! Parse the hierarchical SEO structure:
  // /[country]/[state]/[district]/[city]/[specialty]
  let country = slug[0] || "";
  let state = slug[1] || "";
  let district = slug[2] || "";
  let city = slug[3] || "";
  let specialty = slug[4] || "";

  return (
    <DoctorListingView 
      initialCountry={country}
      initialState={state} 
      initialDistrict={district}
      initialCity={city}
      initialSpecialty={specialty}
    />
  );
}
