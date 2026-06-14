"use client";

import React from 'react';
import Link from 'next/link';

interface UnverifiedBannerProps {
  entityType?: string; // e.g. "Doctor", "Hospital", "Clinic"
  claimUrl?: string;
}

export default function UnverifiedBanner({ entityType = "listing", claimUrl = "#" }: UnverifiedBannerProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p className="text-sm text-amber-800 font-medium">
          This {entityType} data was collected from reliable sources but has not yet been verified.
        </p>
      </div>
      <Link href={claimUrl} className="shrink-0 bg-white border border-amber-300 hover:bg-amber-100 text-amber-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm">
        Are you the owner? Verify Now
      </Link>
    </div>
  );
}
