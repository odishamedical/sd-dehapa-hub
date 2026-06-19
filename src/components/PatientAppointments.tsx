"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function PatientAppointments({ patientId }: { patientId: string }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!patientId) return;
      try {
        const q = query(
          collection(db, "appointments"),
          where("patientId", "==", patientId)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by date/time (naive sort for MVP)
        data.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());
        
        setAppointments(data);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-[24px] border border-white/60 shadow-sm">
        <div className="w-16 h-16 bg-white/80 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <p className="text-slate-900 font-bold text-lg mb-1">No Appointments Found</p>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">You have no upcoming or past visits recorded in the system.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {appointments.map(apt => (
        <div key={apt.id} className="bg-white/60 backdrop-blur-xl border border-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          {apt.type === 'telemedicine' && (
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl">
              Virtual
            </div>
          )}
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">{apt.providerName || "Doctor"}</h3>
              <p className="text-xs text-slate-500 mt-1">{apt.type === 'telemedicine' ? 'Video Consultation' : 'In-Clinic Visit'}</p>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
              apt.status === 'confirmed' || apt.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
              apt.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
              apt.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
              'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {apt.status === 'Active' ? 'In Progress' : apt.status}
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-4 mb-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</p>
                <p className="font-bold text-slate-800">{apt.date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time</p>
                <p className="font-bold text-slate-800">{apt.time}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Reason for visit</p>
              <p className="text-sm text-slate-700 line-clamp-2">{apt.reason || "General Consultation"}</p>
            </div>
          </div>

          {(apt.status === 'confirmed' || apt.status === 'Active') && apt.type === 'telemedicine' && (
            <button 
              onClick={() => window.location.href = `/consultation/${apt.id}`}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl text-sm font-bold shadow-sm transition-colors flex justify-center items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Join Virtual Waiting Room
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
