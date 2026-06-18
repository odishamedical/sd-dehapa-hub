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
  
  if (slug.length === 4) {
    // It's a profile: /doctors/india/odisha/sambalpur/dr-milan-misra-A1B2C3D4
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
    } // Extract the Firebase ID at the end
    return <DoctorProfileView id={id} />;
  }

  if (slug.length === 1 && !["india", "usa", "uae", "australia", "england"].includes(slug[0].toLowerCase())) {
    // It could be a Google Place ID (starts with ChIJ) or a custom slug
    if (slug[0].startsWith('ChIJ') || (slug[0].length === 20 && !slug[0].includes('-'))) {
      return <DoctorProfileView id={slug[0]} />;
    }
    // Premium Custom Slug detected! (e.g., /doctors/dr-milan)
    return <DoctorProfileView customSlug={slug[0]} />;
  }

  // It's a listing
  const country = slug[0] || "";
  const state = slug[1] || "";
  const district = slug[2] || "";

  return (
    <DoctorListingView 
      initialCountry={country} 
      initialState={state} 
      initialDistrict={district} 
    />
  );
}
