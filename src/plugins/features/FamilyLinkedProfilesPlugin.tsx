"use client";

import React, { useState } from 'react';

// Mock linked profiles
const LINKED_PROFILES = [
  { id: '1', name: 'Ramesh Das (Father)', relation: 'Parent' },
  { id: '2', name: 'Riya Das (Daughter)', relation: 'Child' }
];

export function FamilyLinkedProfilesPlugin({ providerId }: { providerId?: string }) {
  const [activeProfile, setActiveProfile] = useState<string | null>(null);

  // In a real app, this would fetch from Firebase where masterAccountId == providerId
  
  return (
    <div className="mt-8 px-4">
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Family Profiles</h3>
      <div className="space-y-2">
        <button 
          onClick={() => setActiveProfile(null)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
            activeProfile === null 
            ? 'bg-white/10 text-white shadow-inner border border-white/5' 
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">Me</div>
          My Vault
        </button>
        
        {LINKED_PROFILES.map(profile => (
          <button 
            key={profile.id}
            onClick={() => setActiveProfile(profile.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
              activeProfile === profile.id 
              ? 'bg-white/10 text-white shadow-inner border border-white/5' 
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-900/50 text-indigo-400 flex items-center justify-center text-xs border border-indigo-500/30">
              {profile.name.charAt(0)}
            </div>
            <div className="text-left">
              <div className="text-sm">{profile.name.split(' ')[0]}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{profile.relation}</div>
            </div>
          </button>
        ))}
      </div>
      <button className="w-full mt-4 py-3 border-2 border-dashed border-white/10 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        Link Family Member
      </button>
    </div>
  );
}
