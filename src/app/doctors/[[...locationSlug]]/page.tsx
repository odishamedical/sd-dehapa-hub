"use client";

import React, { use } from 'react';
import DoctorListingView from '@/components/views/DoctorListingView';
import DoctorProfileView from '@/components/views/DoctorProfileView';

export default function DoctorsRoute({ params }: { params: Promise<{ locationSlug?: string[] }> }) {
  const resolvedParams = use(params);
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
