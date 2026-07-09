"use client";

import React from 'react';
import { useConsultation } from '../core/ConsultationContext';

export function MultiLingualPlugin() {
  const { state, updateState } = useConsultation();

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:block">Output Lang:</label>
      <select 
        value={state.language}
        onChange={(e) => updateState({ language: e.target.value })}
        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-teal-500 shadow-sm"
      >
        <option value="en">English (Default)</option>
        <option value="or">Oriya / ଓଡିଆ</option>
        <option value="hi">Hindi / हिंदी</option>
        <option value="bn">Bengali / বাংলা</option>
      </select>
    </div>
  );
}
