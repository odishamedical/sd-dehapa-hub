"use client";

import React from 'react';
import { useConsultation } from '../core/ConsultationContext';

export function VitalsPlugin() {
  const { state, updateVitals } = useConsultation();

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 items-center shadow-sm">
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase">BP</label>
        <input 
          type="text" 
          placeholder="120/80"
          value={state.vitals.bp}
          onChange={(e) => updateVitals('bp', e.target.value)}
          className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
        />
        <span className="text-xs text-slate-400">mmHg</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase">Pulse</label>
        <input 
          type="text" 
          placeholder="72"
          value={state.vitals.pulse}
          onChange={(e) => updateVitals('pulse', e.target.value)}
          className="w-16 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
        />
        <span className="text-xs text-slate-400">bpm</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase">SPO2</label>
        <input 
          type="text" 
          placeholder="98"
          value={state.vitals.spo2}
          onChange={(e) => updateVitals('spo2', e.target.value)}
          className="w-16 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
        />
        <span className="text-xs text-slate-400">%</span>
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase">Temp</label>
        <input 
          type="text" 
          placeholder="98.6"
          value={state.vitals.temp}
          onChange={(e) => updateVitals('temp', e.target.value)}
          className="w-16 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
        />
        <span className="text-xs text-slate-400">°F</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase">Weight</label>
        <input 
          type="text" 
          placeholder="70"
          value={state.vitals.weight}
          onChange={(e) => updateVitals('weight', e.target.value)}
          className="w-16 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
        />
        <span className="text-xs text-slate-400">kg</span>
      </div>
    </div>
  );
}
