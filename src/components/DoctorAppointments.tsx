"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

type Appointment = {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  date: string;
  time: string;
  type: 'physical' | 'telemedicine';
  status: AppointmentStatus;
  reason: string;
  timestamp: any;
};

export default function DoctorAppointments({ providerId }: { providerId: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'telemedicine'>('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!providerId) { setLoading(false); return; }
      try {
        const q = query(
          collection(db, "appointments"),
          where("providerId", "==", providerId),
          // orderBy requires an index if combining with where, so we sort client side if needed
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Appointment[];
        
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
  }, [providerId]);

  const updateStatus = async (id: string, newStatus: AppointmentStatus) => {
    try {
      await updateDoc(doc(db, "appointments", id), { status: newStatus });
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update appointment status.");
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'pending') return apt.status === 'pending';
    if (filter === 'confirmed') return apt.status === 'confirmed';
    if (filter === 'telemedicine') return apt.type === 'telemedicine';
    return true;
  });

  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 min-h-[600px]">
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/40 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Appointments Manager
          </h2>
          <p className="text-slate-600 text-sm mt-2">Manage incoming bookings for physical visits and telemedicine.</p>
        </div>
        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-xl border border-white/60 shadow-sm">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>All</button>
          <button onClick={() => setFilter('pending')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'pending' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Pending</button>
          <button onClick={() => setFilter('confirmed')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'confirmed' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Confirmed</button>
          <button onClick={() => setFilter('telemedicine')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'telemedicine' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Telemedicine</button>
        </div>
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-[24px] border border-white/60 shadow-sm">
             <div className="w-16 h-16 bg-white/80 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-purple-300">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
             </div>
             <p className="text-slate-900 font-bold text-lg mb-1">No Appointments Found</p>
             <p className="text-sm text-slate-500 max-w-sm mx-auto">There are no bookings matching your current filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAppointments.map(apt => (
              <div key={apt.id} className="bg-white/60 backdrop-blur-xl border border-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                {apt.type === 'telemedicine' && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                    Virtual
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{apt.patientName || "Unknown Patient"}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      {apt.patientPhone || "No Phone"}
                    </p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    apt.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    apt.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                    'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {apt.status}
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

                {apt.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateStatus(apt.id, 'confirmed')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
                      Accept
                    </button>
                    <button onClick={() => updateStatus(apt.id, 'cancelled')} className="flex-1 bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 py-2.5 rounded-xl text-sm font-bold transition-colors">
                      Decline
                    </button>
                  </div>
                )}
                {apt.status === 'confirmed' && (
                  <div className="flex items-center gap-2">
                    {apt.type === 'telemedicine' ? (
                      <button 
                        onClick={() => window.location.href = `/consultation/${apt.id}`}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex justify-center items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        Join Call
                      </button>
                    ) : (
                      <button onClick={() => updateStatus(apt.id, 'completed')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
                        Mark Completed
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
