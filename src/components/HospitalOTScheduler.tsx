"use client";

import React, { useState } from 'react';

export default function HospitalOTScheduler() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const OTs = [
    { id: "OT-1", name: "Major OT 1 (Cardio/Neuro)", status: "active" },
    { id: "OT-2", name: "Major OT 2 (Ortho/General)", status: "active" },
    { id: "OT-3", name: "Minor OT (Daycare)", status: "cleaning" },
  ];

  const surgeries = [
    { id: 1, ot: "OT-1", time: "09:00 AM - 12:30 PM", patient: "Rajiv M.", procedure: "CABG", surgeon: "Dr. A. Sharma", status: "completed" },
    { id: 2, ot: "OT-1", time: "01:30 PM - 05:00 PM", patient: "Sujata K.", procedure: "Valve Replacement", surgeon: "Dr. A. Sharma", status: "in-progress" },
    { id: 3, ot: "OT-2", time: "10:00 AM - 11:30 AM", patient: "Amit P.", procedure: "ACL Reconstruction", surgeon: "Dr. B. Das", status: "completed" },
    { id: 4, ot: "OT-2", time: "12:00 PM - 02:00 PM", patient: "Priya S.", procedure: "Laparoscopic Cholecystectomy", surgeon: "Dr. C. Verma", status: "delayed" },
    { id: 5, ot: "OT-2", time: "03:00 PM - 04:30 PM", patient: "Kiran R.", procedure: "Total Knee Replacement", surgeon: "Dr. B. Das", status: "scheduled" },
    { id: 6, ot: "OT-3", time: "09:30 AM - 10:15 AM", patient: "Arif H.", procedure: "Cataract", surgeon: "Dr. M. Patel", status: "completed" },
    { id: 7, ot: "OT-3", time: "11:00 AM - 11:45 AM", patient: "Geeta D.", procedure: "Carpal Tunnel", surgeon: "Dr. B. Das", status: "completed" },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in-progress': return 'bg-sky-100 text-sky-700 border-sky-200 animate-pulse';
      case 'scheduled': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'delayed': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.8)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20 shadow-inner">
              <span className="text-xl">🩺</span>
            </div>
            OT Scheduler
          </h3>
          <p className="text-sm text-slate-600 mt-2 font-medium">Manage and monitor daily Operation Theater schedules.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 shadow-sm font-bold text-slate-700 focus:border-rose-400 outline-none"
          />
          <button className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all flex items-center gap-2">
            + Schedule Surgery
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {OTs.map(ot => (
          <div key={ot.id} className="bg-white/70 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                {ot.name}
              </h4>
              <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${ot.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {ot.status}
              </span>
            </div>
            
            <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {surgeries.filter(s => s.ot === ot.id).map(surgery => (
                <div key={surgery.id} className={`border rounded-xl p-4 flex flex-col justify-between ${getStatusColor(surgery.status)}`}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black bg-white/50 px-2 py-0.5 rounded shadow-sm">{surgery.time}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold">{surgery.status}</span>
                    </div>
                    <p className="font-bold text-lg leading-tight mb-1">{surgery.procedure}</p>
                    <p className="text-sm font-medium opacity-80">{surgery.patient}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-black/10 flex justify-between items-center">
                    <span className="text-xs font-bold flex items-center gap-1">👨‍⚕️ {surgery.surgeon}</span>
                  </div>
                </div>
              ))}
              
              <button className="border-2 border-dashed border-slate-300 hover:border-rose-300 hover:bg-rose-50 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:text-rose-500 transition-colors min-h-[120px]">
                <span className="text-2xl mb-1">+</span>
                <span className="text-xs font-bold uppercase tracking-widest">Book Slot</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
