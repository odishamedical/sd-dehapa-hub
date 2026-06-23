"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function CareTeamSeatingChart({ currentUserId }: { currentUserId: string | null }) {
  const [careTeam, setCareTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchCareTeam = async () => {
      try {
        // Fetch approved connections where current user is involved
        const q1 = query(collection(db, "connections"), where("initiatorId", "==", currentUserId), where("status", "==", "approved"));
        const q2 = query(collection(db, "connections"), where("receiverId", "==", currentUserId), where("status", "==", "approved"));
        
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        
        const connections = [...snap1.docs, ...snap2.docs].map(d => ({ id: d.id, ...d.data() }));
        
        // Filter to only include providers (doctors, hospitals, labs, pharmacies)
        const team = connections.map(c => {
          if (c.initiatorId === currentUserId) {
            return { id: c.receiverId, name: c.receiverName, role: c.receiverRole };
          } else {
            return { id: c.initiatorId, name: c.initiatorName, role: c.initiatorRole };
          }
        }).filter(member => member.role !== 'patient');
        
        setCareTeam(team);
      } catch (err) {
        console.error("Failed to fetch care team", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCareTeam();
  }, [currentUserId]);

  if (loading) return null;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[24px] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Your Care Team</h3>
        <Link href="#network" className="text-sm font-bold text-teal-600 hover:text-teal-700">Manage</Link>
      </div>
      
      {careTeam.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
          <p className="text-sm text-slate-500 font-medium">No providers in your care team yet.</p>
          <Link href="#find_doctor" className="text-teal-600 font-bold text-sm mt-2 inline-block">Find a Doctor</Link>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {careTeam.map((member, idx) => (
            <Link key={idx} href={`/portal/${member.role}s/${member.id}`} className="min-w-[120px] bg-white border border-slate-100 hover:border-teal-300 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md group shrink-0">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                {member.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-center w-full">
                <p className="font-bold text-slate-800 text-xs truncate w-full block">{member.name}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest truncate">{member.role}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
