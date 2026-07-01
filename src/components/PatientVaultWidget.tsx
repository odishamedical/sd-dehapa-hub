"use client";

import React, { useState, useEffect } from 'react';
import SecureMedicalVault from '@/components/SecureMedicalVault';

export default function PatientVaultWidget() {
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('sd_current_user_email');
      if (email) {
        setUserEmail(email);
      }
    }
  }, []);

  if (!userEmail) {
    return (
      <div className="flex justify-center py-20 relative z-10">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <SecureMedicalVault providerId={userEmail} providerName="My Personal Vault" />
    </div>
  );
}
