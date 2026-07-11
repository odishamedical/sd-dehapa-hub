'use client';

import React, { useState } from 'react';

export default function HospitalLiveBedManager() {
  const [beds, setBeds] = useState([
    { id: '101', type: 'General', status: 'Occupied', patient: 'Rahul S.', date: '10 Oct' },
    { id: '102', type: 'General', status: 'Available', patient: null, date: null },
    { id: '103', type: 'General', status: 'Maintenance', patient: null, date: null },
    { id: '201', type: 'ICU', status: 'Occupied', patient: 'Anita M.', date: '12 Oct' },
    { id: '202', type: 'ICU', status: 'Available', patient: null, date: null },
    { id: '301', type: 'Private', status: 'Occupied', patient: 'Vikas K.', date: '14 Oct' },
  ]);

  const stats = {
    total: beds.length,
    occupied: beds.filter(b => b.status === 'Occupied').length,
    available: beds.filter(b => b.status === 'Available').length,
    icuAvailable: beds.filter(b => b.status === 'Available' && b.type === 'ICU').length
  };

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.8)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
              <span className="text-xl">🛏️</span>
            </div>
            Live Bed Manager
          </h3>
          <p className="text-sm text-slate-600 mt-2 font-medium">Manage IPD admissions, discharges, and real-time bed tracking.</p>
        </div>
        
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Admit Patient
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Total Beds</p>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 mb-1">Available</p>
          <p className="text-3xl font-black text-emerald-700">{stats.available}</p>
        </div>
        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-rose-600 mb-1">Occupied</p>
          <p className="text-3xl font-black text-rose-700">{stats.occupied}</p>
        </div>
        <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-sky-600 mb-1">ICU Available</p>
          <p className="text-3xl font-black text-sky-700">{stats.icuAvailable}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {beds.map(bed => (
          <div key={bed.id} className={`rounded-2xl p-5 border transition-all ${
            bed.status === 'Occupied' ? 'bg-white border-slate-200 shadow-sm' : 
            bed.status === 'Available' ? 'bg-emerald-50/50 border-emerald-200 shadow-inner' : 
            'bg-amber-50/50 border-amber-200 opacity-60'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <span className="font-black text-lg text-slate-900">#{bed.id}</span>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                bed.type === 'ICU' ? 'bg-rose-100 text-rose-700' : 
                bed.type === 'Private' ? 'bg-purple-100 text-purple-700' : 
                'bg-slate-100 text-slate-700'
              }`}>{bed.type}</span>
            </div>
            
            {bed.status === 'Occupied' ? (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-xs font-bold text-slate-500 uppercase">Patient</p>
                <p className="font-bold text-slate-900 mt-0.5">{bed.patient}</p>
                <p className="text-[10px] text-slate-500 mt-1">Since {bed.date}</p>
                <button className="mt-3 w-full bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 py-1.5 rounded-lg text-xs font-bold transition-colors">
                  Discharge
                </button>
              </div>
            ) : bed.status === 'Available' ? (
              <div className="mt-4 border-t border-emerald-100/50 pt-3 flex flex-col items-center justify-center py-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-2 text-emerald-600">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p className="text-xs font-bold text-emerald-600 uppercase">Ready for Admission</p>
              </div>
            ) : (
              <div className="mt-4 border-t border-amber-100/50 pt-3 flex flex-col items-center justify-center py-4">
                <p className="text-xs font-bold text-amber-600 uppercase">Under Maintenance</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
