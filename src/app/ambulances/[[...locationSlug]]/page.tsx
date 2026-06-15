"use client";

import React, { use } from 'react';
import AmbulanceListingView from '@/components/views/AmbulanceListingView';
import AmbulanceProfileView from '@/components/views/AmbulanceProfileView';

export default function AmbulancesRoute({ params }: { params: Promise<{ locationSlug?: string[] }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.locationSlug || [];
  
  if (slug.length === 4) {
    // It's a profile
    const paramStr = slug[3];
    let id;
    const chijIndex = paramStr.indexOf('-ChIJ');
    if (chijIndex !== -1) {
      id = paramStr.substring(chijIndex + 1);
    } else if (paramStr.startsWith('ChIJ')) {
      id = paramStr;
    } else {
      const parts = paramStr.split('-');
      id = parts[parts.length - 1];
    } 
    return <AmbulanceProfileView id={id} />;
  }

  if (slug.length === 1 && !["india", "usa", "uae", "australia", "england"].includes(slug[0].toLowerCase())) {
    // Premium Custom Slug detected! 
    return <AmbulanceProfileView customSlug={slug[0]} />;
  }

  // It's a listing
  const country = slug[0] || "";
  const state = slug[1] || "";
  const district = slug[2] || "";

  return (
    <AmbulanceListingView 
      initialCountry={country} 
      initialState={state} 
      initialDistrict={district} 
    />
  );
}
