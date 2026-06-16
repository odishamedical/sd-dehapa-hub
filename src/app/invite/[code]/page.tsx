"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, ShieldCheck } from 'lucide-react';

export default function InvitePage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const { code } = params;

  useEffect(() => {
    const handleRoute = async () => {
      // Small artificial delay for the UX animation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const currentUser = localStorage.getItem("sd_current_user_email");
      
      if (!currentUser) {
        // SCENARIO A: Unregistered user clicks link
        // Redirect to login with referral code
        router.push(`/login?ref=${code}`);
        return;
      }

      // SCENARIO B & C: Registered User (Doctor or Patient)
      const userType = localStorage.getItem("sd_current_user_role") || "patient";

      if (userType === "doctor" || userType === "hospital" || userType === "lab") {
        // Doctor clicked Patient's link
        // Redirect to search or profile view. In our mock, the code is the patient's ID prefix.
        // E.g. DH-8A9B2 -> we look up this patient and request vault access.
        // For the mock demo, we'll redirect to the vault portal and open a mock profile.
        alert(`You followed an invite link for patient ${code}. In a full implementation, this opens their secure profile so you can Request Vault Access.`);
        router.push(`/portal/doctor`);
      } else {
        // Patient clicked Doctor/Hospital link
        alert(`You followed an invite link from ${code}. In a full implementation, this opens their booking page.`);
        router.push(`/portal`);
      }
    };

    handleRoute();
  }, [code, router]);

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 shadow-2xl rounded-3xl overflow-hidden p-8 text-center animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500" />
        
        <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
          <Activity className="w-10 h-10 text-indigo-400 animate-pulse" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-white mb-2">Connecting...</h1>
        <p className="text-sm text-slate-400 mb-8">Establishing secure FHIR handshake with referral identity <span className="font-mono text-indigo-400 font-bold">{code}</span></p>

        <div className="w-full bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 h-2 rounded-full w-full animate-[progress_2s_ease-in-out]" style={{ transformOrigin: 'left' }} />
        </div>
        <p className="text-xs uppercase tracking-widest font-bold text-slate-500">Decrypting Payload</p>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}} />
    </div>
  );
}
