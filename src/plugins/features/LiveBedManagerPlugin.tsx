"use client";

import React, { useState } from 'react';

// Hardcoded for demo purposes
const INITIAL_BEDS = [
  { id: '1', type: 'ICU', total: 10, occupied: 8 },
  { id: '2', type: 'General Ward', total: 50, occupied: 35 },
  { id: '3', type: 'Private Suite', total: 15, occupied: 14 },
  { id: '4', type: 'NICU', total: 5, occupied: 2 }
];

export function LiveBedManagerPlugin() {
  const [beds, setBeds] = useState(INITIAL_BEDS);

  const adjustBed = (id: string, delta: number) => {
    setBeds(beds.map(bed => {
      if (bed.id === id) {
        const newOccupied = Math.max(0, Math.min(bed.total, bed.occupied + delta));
        return { ...bed, occupied: newOccupied };
      }
      return bed;
    }));
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900">Live Bed Manager</h3>
        <p className="text-slate-500">Update bed availability in real-time. This status reflects immediately on your public hospital profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {beds.map(bed => {
          const available = bed.total - bed.occupied;
          const isFull = available === 0;
          const isCritical = available <= 2 && available > 0;
          
          return (
            <div key={bed.id} className="p-6 border border-slate-200 rounded-2xl flex flex-col bg-slate-50 relative overflow-hidden">
              <h4 className="font-bold text-slate-800 text-lg">{bed.type}</h4>
              
              <div className="mt-4 flex items-end gap-2">
                <span className={`text-4xl font-black ${isFull ? 'text-rose-600' : isCritical ? 'text-amber-500' : 'text-teal-600'}`}>
                  {available}
                </span>
                <span className="text-slate-500 font-bold mb-1">Available</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Total Beds: {bed.total}</p>
              
              <div className="mt-6 flex gap-2">
                <button 
                  onClick={() => adjustBed(bed.id, 1)}
                  disabled={isFull}
                  className="flex-1 bg-white border border-slate-200 hover:border-teal-500 text-slate-700 font-bold py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  Admit
                </button>
                <button 
                  onClick={() => adjustBed(bed.id, -1)}
                  disabled={bed.occupied === 0}
                  className="flex-1 bg-white border border-slate-200 hover:border-teal-500 text-slate-700 font-bold py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  Discharge
                </button>
              </div>

              {isFull && <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">Full</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
