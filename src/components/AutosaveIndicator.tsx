import React from 'react';
import { SaveStatus } from '@/hooks/useAutosave';

interface AutosaveIndicatorProps {
  status: SaveStatus;
}

export default function AutosaveIndicator({ status }: AutosaveIndicatorProps) {
  if (status === 'idle') return <div className="w-24"></div>; // Placeholder to prevent jumping
  
  if (status === 'saving') {
    return (
      <span className="text-sm text-slate-500 font-bold flex items-center gap-2 animate-pulse w-24">
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Saving...
      </span>
    );
  }
  
  if (status === 'error') {
    return (
      <span className="text-sm text-red-500 font-bold flex items-center gap-2 w-24">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Error Saving
      </span>
    );
  }

  // saved
  return (
    <span className="text-sm text-green-600 font-bold flex items-center gap-2 w-24">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
      </svg>
      Autosaved
    </span>
  );
}
