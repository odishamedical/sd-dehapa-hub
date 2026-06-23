"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface EndorsementProps {
  targetDoctorId: string;
  currentUserId: string | null;
  currentUserRole: string;
}

export default function DoctorEndorsementWidget({ targetDoctorId, currentUserId, currentUserRole }: EndorsementProps) {
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [hasEndorsed, setHasEndorsed] = useState(false);
  const [loading, setLoading] = useState(true);

  const isSelf = currentUserId === targetDoctorId;
  const canEndorse = !isSelf && currentUserRole === 'doctor';

  useEffect(() => {
    if (!targetDoctorId) return;

    const fetchEndorsements = async () => {
      try {
        const q = query(collection(db, "endorsements"), where("targetId", "==", targetDoctorId));
        const snap = await getDocs(q);
        
        const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setEndorsements(results);
        
        if (currentUserId) {
          setHasEndorsed(results.some(r => r.endorserId === currentUserId));
        }
      } catch (err) {
        console.error("Failed to fetch endorsements", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEndorsements();
  }, [targetDoctorId, currentUserId]);

  const toggleEndorsement = async () => {
    if (!currentUserId || !canEndorse) return;
    
    // In a real app we'd fetch the endorser's name/image. 
    // For now we'll use a placeholder or check localStorage
    const endorserName = localStorage.getItem("sd_current_user_name") || "Dr. Colleague";
    
    const endorsementId = `${currentUserId}_${targetDoctorId}`;
    const docRef = doc(db, "endorsements", endorsementId);

    try {
      if (hasEndorsed) {
        await deleteDoc(docRef);
        setEndorsements(prev => prev.filter(e => e.endorserId !== currentUserId));
        setHasEndorsed(false);
      } else {
        const newEndorsement = {
          endorserId: currentUserId,
          endorserName,
          targetId: targetDoctorId,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, newEndorsement);
        setEndorsements(prev => [...prev, newEndorsement]);
        setHasEndorsed(true);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update endorsement");
    }
  };

  if (loading) return null;

  // If no endorsements and user can't endorse, don't show the widget
  if (endorsements.length === 0 && !canEndorse) return null;

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-6 border border-slate-700/50 shadow-xl mt-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="font-bold text-base text-white font-serif flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          Colleague Endorsements
        </h3>
        <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-md">{endorsements.length}</span>
      </div>

      {canEndorse && (
        <button 
          onClick={toggleEndorsement}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all mb-4 relative z-10 flex items-center justify-center gap-2 ${
            hasEndorsed 
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'
          }`}
        >
          {hasEndorsed ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              Endorsed
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514"></path></svg>
              Endorse Colleague
            </>
          )}
        </button>
      )}

      <div className="flex flex-col gap-3 relative z-10">
        {endorsements.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-2">No endorsements yet.</p>
        ) : (
          endorsements.map((end, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 border border-slate-700/50">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-500/30">
                {end.endorserName?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-white truncate">{end.endorserName}</h4>
                <p className="text-[10px] text-slate-400">Verified Doctor</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
