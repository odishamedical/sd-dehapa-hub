"use client";

import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function FollowerStatsWidget({ profileId }: { profileId: string }) {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, labs: 0, hospitals: 0, pharmacies: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const q = query(collection(db, "connections"), where("receiverId", "==", profileId), where("status", "==", "approved"));
        const snap = await getDocs(q);
        
        let counts = { patients: 0, doctors: 0, labs: 0, hospitals: 0, pharmacies: 0 };
        snap.forEach(doc => {
          const role = doc.data().initiatorRole;
          if (role === 'patient') counts.patients++;
          else if (role === 'doctor') counts.doctors++;
          else if (role === 'lab') counts.labs++;
          else if (role === 'hospital') counts.hospitals++;
          else if (role === 'pharmacy') counts.pharmacies++;
        });
        setStats(counts);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchStats();
  }, [profileId]);

  if (loading) return null;

  const total = stats.patients + stats.doctors + stats.labs + stats.hospitals + stats.pharmacies;
  if (total === 0) return null;

  const parts = [];
  if (stats.patients > 0) parts.push(`${stats.patients} Patients`);
  if (stats.doctors > 0) parts.push(`${stats.doctors} Doctors`);
  if (stats.hospitals > 0) parts.push(`${stats.hospitals} Hospitals`);
  if (stats.labs > 0) parts.push(`${stats.labs} Labs`);

  return (
    <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-4 bg-white/40 backdrop-blur-sm w-max px-4 py-2 rounded-full border border-white/60 shadow-sm">
      <Users className="w-4 h-4 text-indigo-500" />
      <span>Followed by {parts.slice(0, 3).join(' • ')} {parts.length > 3 ? '...' : ''}</span>
    </div>
  );
}
