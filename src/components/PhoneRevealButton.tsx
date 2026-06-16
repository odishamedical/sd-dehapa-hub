import React, { useState } from 'react';
import CareCoordinatorModal from './CareCoordinatorModal';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface PhoneRevealButtonProps {
  phoneNumber: string;
  providerId: string;
  providerName: string;
  providerType: string;
}

export default function PhoneRevealButton({ phoneNumber, providerId, providerName, providerType }: PhoneRevealButtonProps) {
  const [revealed, setRevealed] = useState(false);
  const [showCoordinatorModal, setShowCoordinatorModal] = useState(false);

  const handleReveal = async () => {
    // 1. Check if logged in
    const email = localStorage.getItem("sd_current_user_email");
    if (!email) {
      window.location.href = `/login?redirect=${window.location.pathname}`;
      return;
    }

    // 2. Check if profile complete
    const isComplete = localStorage.getItem("sd_current_user_profile_complete");
    if (isComplete !== "true") {
      window.location.href = "/portal";
      return;
    }

    // 3. Check rate limit
    const today = new Date().toISOString().split('T')[0];
    let limitData = JSON.parse(localStorage.getItem("sd_contact_limits") || '{"date":"","count":0}');
    
    if (limitData.date !== today) {
      limitData = { date: today, count: 0 };
    }

    if (limitData.count >= 7) {
      setShowCoordinatorModal(true);
      return;
    }

    // Increment count and reveal
    limitData.count += 1;
    localStorage.setItem("sd_contact_limits", JSON.stringify(limitData));
    
    // Log to Firebase for Provider Dashboard
    try {
      await addDoc(collection(db, "contact_leads"), {
        providerId,
        providerName,
        providerType,
        patientEmail: email,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Failed to log contact lead", e);
    }
    
    setRevealed(true);
  };

  if (revealed) {
    return (
      <a href={`tel:${phoneNumber}`} className="text-sm font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-xl border-2 border-teal-200 inline-flex items-center gap-2 hover:bg-teal-100 transition-colors shadow-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
        {phoneNumber}
      </a>
    );
  }

  const getButtonText = () => {
    switch(providerType) {
      case "Doctor": return "Call to Book";
      case "Hospital": return "Call for Admission/OPD";
      case "Pharmacy": return "Call to Order Medicine";
      case "Lab": return "Call to Book Test";
      case "Ambulance": return "Call for Emergency";
      default: return "Call to Contact";
    }
  };

  return (
    <>
      <button 
        onClick={handleReveal}
        className="text-sm font-bold text-white bg-slate-900 px-4 py-2 rounded-xl shadow-md hover:bg-slate-800 transition-colors inline-flex items-center gap-2 transform active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
        {getButtonText()}
      </button>

      <CareCoordinatorModal 
        isOpen={showCoordinatorModal} 
        onClose={() => setShowCoordinatorModal(false)} 
        providerType={providerType}
      />
    </>
  );
}
