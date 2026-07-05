"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import SecureMedicalVault from '@/components/SecureMedicalVault';
import { ConnectionService } from '@/services/connection.service';
import DashboardLayout from '@/components/DashboardLayout';

export default function VaultViewerPage() {
  const router = useRouter();
  const params = useParams();
  const vaultId = (params?.vaultId as string) || '';
  const [user, authLoading] = useAuthState(auth);
  
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [denialReason, setDenialReason] = useState('');

  useEffect(() => {
    const verifyAccess = async () => {
      if (authLoading) return;
      if (!user) {
        router.push('/login');
        return;
      }
      
      if (!vaultId) {
        setDenialReason("Invalid Vault ID.");
        setLoading(false);
        return;
      }

      // If viewing own vault, grant immediately
      if (user.uid === vaultId) {
        setAccessGranted(true);
        setLoading(false);
        return;
      }

      // Allow super_admins full access
      const role = localStorage.getItem("sd_current_user_role");
      if (role === "super_admin") {
        setAccessGranted(true);
        setLoading(false);
        return;
      }

      // Check CRM Connection Permissions
      try {
        const connection = await ConnectionService.getConnectionDetails(user.uid, vaultId);
        
        if (!connection || connection.status !== 'approved') {
          setDenialReason("You are not connected with this patient.");
          setLoading(false);
          return;
        }

        const accessType = connection.vaultAccessType || 'lifelong';
        const expiresAtStr = connection.vaultAccessExpiresAt;
        
        if (accessType === 'none') {
          setDenialReason("The patient has explicitly denied vault access.");
          setLoading(false);
          return;
        }

        if (expiresAtStr) {
          const expiresAt = new Date(expiresAtStr);
          if (expiresAt < new Date()) {
            setDenialReason("Your 24-hour access window has expired.");
            setLoading(false);
            return;
          }
        }

        setAccessGranted(true);
      } catch (err) {
        console.error("Failed to verify permissions:", err);
        setDenialReason("Failed to verify access permissions.");
      }
      setLoading(false);
    };

    verifyAccess();
  }, [user, authLoading, vaultId, router]);

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!accessGranted) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in zoom-in-95">
          <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">Access Denied</h1>
          <p className="text-slate-500 max-w-md text-center">{denialReason}</p>
          <button 
            onClick={() => router.back()}
            className="mt-8 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-in fade-in slide-in-from-bottom-4 pt-4">
        <SecureMedicalVault providerId={vaultId} providerName="Patient" />
      </div>
    </DashboardLayout>
  );
}
