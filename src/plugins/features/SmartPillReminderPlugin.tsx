"use client";

import React, { useState } from 'react';

export function SmartPillReminderPlugin() {
  const [isReminderSet, setIsReminderSet] = useState(false);

  return (
    <div className="mt-8 px-4">
      <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border border-teal-500/20 p-4 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>
        </div>
        
        <h3 className="text-sm font-black text-teal-400 uppercase tracking-widest mb-1 relative z-10">Smart Reminders</h3>
        <p className="text-xs text-slate-300 mb-4 relative z-10">Auto-detects active prescriptions and sends WhatsApp reminders.</p>
        
        <button 
          onClick={() => setIsReminderSet(!isReminderSet)}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${
            isReminderSet 
            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30' 
            : 'bg-teal-600 text-white hover:bg-teal-500 shadow-lg'
          }`}
        >
          {isReminderSet ? 'Reminders Active ✅' : 'Enable WhatsApp Alerts'}
        </button>
      </div>
    </div>
  );
}
