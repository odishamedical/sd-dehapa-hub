"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot } from 'firebase/firestore';

interface Affiliation {
  id: string;
  hospitalId: string;
  hospitalName: string;
  status: "pending" | "active";
}

interface HospitalAffiliationWidgetProps {
  doctorUid: string | null;
}

export default function HospitalAffiliationWidget({ doctorUid }: HospitalAffiliationWidgetProps) {
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorUid) return;

    const q = query(
      collection(db, "hospital_affiliations"),
      where("doctorId", "==", doctorUid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results: Affiliation[] = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as Affiliation);
      });
      setAffiliations(results);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [doctorUid]);

  const updateStatus = async (affiliationId: string, newStatus: "active" | "rejected") => {
    try {
      if (newStatus === "rejected") {
        // We could delete the doc or mark it as rejected. 
        // For now, let's mark it as rejected or just delete it. We'll delete it to clean up.
        // Actually, let's just delete the affiliation request if rejected.
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, "hospital_affiliations", affiliationId));
      } else {
        await updateDoc(doc(db, "hospital_affiliations", affiliationId), {
          status: newStatus
        });
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) return null;

  const pending = affiliations.filter(a => a.status === "pending");
  const active = affiliations.filter(a => a.status === "active");

  if (pending.length === 0 && active.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-2">Hospital Affiliations</h3>
        <p className="text-sm text-slate-500">You have no active hospital affiliations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
      <h3 className="font-bold text-slate-900">Hospital Affiliations</h3>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending Invites</h4>
          {pending.map(affil => (
            <div key={affil.id} className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">{affil.hospitalName}</p>
                <p className="text-xs text-amber-700 font-medium">Wants to add you to their roster</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateStatus(affil.id, "active")}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Accept
                </button>
                <button 
                  onClick={() => updateStatus(affil.id, "rejected")}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-3 mt-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Affiliations</h4>
          {active.map(affil => (
            <div key={affil.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{affil.hospitalName}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-md text-[10px] font-bold uppercase tracking-wider">Active</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
