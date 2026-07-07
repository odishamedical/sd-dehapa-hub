"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

type PatientProfile = {
  id: string; // phone or email or uid
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  totalVisits: number;
};

export default function PatientRecordsCRM({ providerId }: { providerId: string }) {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      if (!providerId) { setLoading(false); return; }
      try {
        // Fetch from appointments to build CRM list dynamically
        const q = query(collection(db, "appointments"), where("providerId", "==", providerId));
        const snapshot = await getDocs(q);
        
        const patientMap = new Map<string, PatientProfile>();
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const patientId = data.patientEmail || data.patientPhone || 'unknown';
          if (!patientMap.has(patientId)) {
            patientMap.set(patientId, {
              id: patientId,
              name: data.patientName || 'Unknown Patient',
              phone: data.patientPhone || '',
              email: data.patientEmail || '',
              lastVisit: data.date || '',
              totalVisits: 1
            });
          } else {
            const existing = patientMap.get(patientId)!;
            existing.totalVisits += 1;
            // Naive last visit update
            if (new Date(data.date) > new Date(existing.lastVisit)) {
              existing.lastVisit = data.date;
            }
          }
        });
        
        setPatients(Array.from(patientMap.values()));
      } catch (err) {
        console.error("Failed to fetch CRM patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [providerId]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 min-h-[600px]">
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/40 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Patient Records CRM
          </h2>
          <p className="text-slate-600 text-sm mt-2">Master list of all your patients. View history and access their Medical Vault.</p>
        </div>
        <div className="relative">
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="Search name or phone..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all focus:bg-white" 
          />
        </div>
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-[24px] border border-white/60 shadow-sm">
             <div className="w-16 h-16 bg-emerald-50 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
             </div>
             <p className="text-slate-900 font-bold text-lg mb-1">No Patients Found</p>
             <p className="text-sm text-slate-500 max-w-sm mx-auto">Patients will automatically appear here once they book an appointment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 text-xs uppercase tracking-widest text-slate-500 border-b border-slate-200/60">
                  <th className="p-5 font-bold">Patient Name</th>
                  <th className="p-5 font-bold">Contact</th>
                  <th className="p-5 font-bold">Total Visits</th>
                  <th className="p-5 font-bold">Last Visit</th>
                  <th className="p-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-white/80 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-sm border border-emerald-200">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{patient.name}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {patient.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-semibold text-slate-700">{patient.phone || "No Phone"}</p>
                      <p className="text-xs text-slate-500">{patient.email}</p>
                    </td>
                    <td className="p-5">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200">{patient.totalVisits}</span>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-semibold text-slate-700">{patient.lastVisit || "N/A"}</p>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200 transition-colors shadow-sm flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                          Open Vault
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
