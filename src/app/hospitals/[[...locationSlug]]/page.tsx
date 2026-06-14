"use client";

import React, { use } from 'react';
import HospitalListingView from '@/components/views/HospitalListingView';
import HospitalProfileView from '@/components/views/HospitalProfileView';

export default function HospitalsRoute({ params }: { params: Promise<{ locationSlug?: string[] }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.locationSlug || [];
  
  if (slug.length === 4) {
    // It's a profile
    const paramStr = slug[3];
    const parts = paramStr.split('-');
    const id = parts[parts.length - 1]; 
    return <HospitalProfileView id={id} />;
  }

  if (slug.length === 1 && !["india", "usa", "uae", "australia", "england"].includes(slug[0].toLowerCase())) {
    // Premium Custom Slug detected! 
    return <HospitalProfileView customSlug={slug[0]} />;
  }

  // It's a listing
  const country = slug[0] || "";
  const state = slug[1] || "";
  const district = slug[2] || "";

  return (
    <HospitalListingView 
      initialCountry={country} 
      initialState={state} 
      initialDistrict={district} 
    />
  );
}
