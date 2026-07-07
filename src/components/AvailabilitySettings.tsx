"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

type SettingsTab = 'roster' | 'overrides' | 'blockouts';

type Shift = { id: string; location: string; start: string; end: string };
type DaySchedule = { active: boolean; shifts: Shift[] };

export type Override = { id: string; location: string; startDate: string; endDate: string; start: string; end: string };
export type Blockout = { id: string; startDate: string; endDate: string };

export default function AvailabilitySettings({ providerId }: { providerId: string }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('roster');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Mock Locations (In reality, these would be fetched from the "locations" array in the database)
  const locations = [
    { id: 'loc1', name: 'Primary Clinic - Care Hospital, Bhubaneswar' },
    { id: 'loc2', name: 'Visiting - Rourkela General Hospital' },
    { id: 'loc3', name: 'Visiting - Sambalpur Care Center' },
  ];

  // Interactive State for Weekly Roster
  const [roster, setRoster] = useState<Record<string, DaySchedule>>({
    Monday: { active: true, shifts: [{ id: '1', location: 'loc1', start: '09:00', end: '14:00' }] },
    Tuesday: { active: true, shifts: [{ id: '2', location: 'loc1', start: '09:00', end: '14:00' }] },
    Wednesday: { active: true, shifts: [{ id: '3', location: 'loc1', start: '09:00', end: '14:00' }] },
    Thursday: { active: true, shifts: [{ id: '4', location: 'loc1', start: '09:00', end: '14:00' }] },
    Friday: { active: true, shifts: [{ id: '5', location: 'loc1', start: '09:00', end: '14:00' }] },
    Saturday: { active: true, shifts: [{ id: '6', location: 'loc1', start: '09:00', end: '14:00' }] },
    Sunday: { active: false, shifts: [{ id: '7', location: 'loc1', start: '09:00', end: '14:00' }] },
  });

  // State for Overrides
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [newOverride, setNewOverride] = useState<Partial<Override>>({ location: '', startDate: '', endDate: '', start: '10:00', end: '17:00' });

  // State for Blockouts
  const [blockouts, setBlockouts] = useState<Blockout[]>([]);
  const [newBlockout, setNewBlockout] = useState<Partial<Blockout>>({ startDate: '', endDate: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!providerId) { setLoading(false); return; }
      try {
        const docRef = doc(db, 'directory', providerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.roster) setRoster(data.roster);
          if (data.overrides) setOverrides(data.overrides);
          if (data.blockouts) setBlockouts(data.blockouts);
        }
      } catch (error) {
        console.error("Error fetching availability settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [providerId]);

  const handleSave = async () => {
    if (!providerId) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const docRef = doc(db, 'directory', providerId);
      await updateDoc(docRef, {
        roster,
        overrides,
        blockouts
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving availability settings:", error);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // --- ROSTER HELPERS ---
  const toggleDay = (day: string) => setRoster(prev => ({ ...prev, [day]: { ...prev[day], active: !prev[day].active } }));
  const addShift = (day: string) => setRoster(prev => ({ ...prev, [day]: { ...prev[day], shifts: [...prev[day].shifts, { id: Math.random().toString(), location: 'loc1', start: '17:00', end: '20:00' }] } }));
  const removeShift = (day: string, shiftId: string) => setRoster(prev => ({ ...prev, [day]: { ...prev[day], shifts: prev[day].shifts.filter(s => s.id !== shiftId) } }));
  const updateShift = (day: string, shiftId: string, field: keyof Shift, value: string) => setRoster(prev => ({ ...prev, [day]: { ...prev[day], shifts: prev[day].shifts.map(s => s.id === shiftId ? { ...s, [field]: value } : s) } }));

  // --- OVERRIDES HELPERS ---
  const handleAddOverride = () => {
    if (!newOverride.location || !newOverride.startDate || !newOverride.endDate) return alert("Please fill all override fields");
    setOverrides(prev => [...prev, { id: Math.random().toString(), ...newOverride as Override }]);
    setNewOverride({ location: '', startDate: '', endDate: '', start: '10:00', end: '17:00' });
  };
  const removeOverride = (id: string) => setOverrides(prev => prev.filter(o => o.id !== id));

  // --- BLOCKOUTS HELPERS ---
  const handleAddBlockout = () => {
    if (!newBlockout.startDate || !newBlockout.endDate) return alert("Please fill all blockout dates");
    setBlockouts(prev => [...prev, { id: Math.random().toString(), ...newBlockout as Blockout }]);
    setNewBlockout({ startDate: '', endDate: '' });
  };
  const removeBlockout = (id: string) => setBlockouts(prev => prev.filter(b => b.id !== id));

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden min-h-[600px]">
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/40 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Master Scheduling Engine
          </h2>
          <p className="text-slate-600 text-sm mt-2">Manage your standard weekly roster, multi-town travel overrides, and vacation blockouts.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && <span className="text-teal-600 text-sm font-bold animate-pulse">Saved successfully!</span>}
          <button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-teal-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 w-full md:w-auto justify-center disabled:opacity-50">
            {saving ? "Saving..." : "Save Schedules"}
          </button>
        </div>
      </div>

      <div className="flex bg-white/40 p-1.5 rounded-xl backdrop-blur-md border border-white/60 mb-8 max-w-2xl relative z-10 shadow-sm">
        <button onClick={() => setActiveTab('roster')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'roster' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Weekly Roster</button>
        <button onClick={() => setActiveTab('overrides')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'overrides' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
          Travel Overrides <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-widest hidden md:inline-block">Dynamic</span>
        </button>
        <button onClick={() => setActiveTab('blockouts')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'blockouts' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Vacations</button>
      </div>

      <div className="relative z-10">
        
        {/* TAB 1: WEEKLY ROSTER */}
        {activeTab === 'roster' && (
          <div className="animate-in fade-in">
            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-200 pb-3">Standard Operating Hours</h3>
              <p className="text-sm text-slate-600 mb-6">These hours will repeat every week automatically. Select a day to configure slots.</p>
              
              <div className="space-y-4">
                {daysOrder.map((day) => {
                  const schedule = roster[day];
                  return (
                    <div key={day} className={`flex flex-col gap-4 p-4 rounded-xl border ${schedule.active ? 'border-teal-200 bg-white/80 shadow-sm' : 'border-slate-200 bg-white/40'} transition-all group`}>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer w-32 shrink-0">
                          <input type="checkbox" className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer" checked={schedule.active} onChange={() => toggleDay(day)} />
                          <span className={`font-bold ${schedule.active ? 'text-slate-900' : 'text-slate-400'}`}>{day}</span>
                        </label>
                        {!schedule.active && (
                          <div className="flex-1 text-sm text-slate-400 font-semibold italic flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg> Day Off
                          </div>
                        )}
                      </div>
                      
                      {schedule.active && (
                        <div className="flex flex-col gap-3 pl-7 md:pl-32">
                          {schedule.shifts.map((shift, idx) => (
                            <div key={shift.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center animate-in fade-in slide-in-from-top-2">
                              <div className="md:col-span-6">
                                <select value={shift.location} onChange={(e) => updateShift(day, shift.id, 'location', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none">
                                  {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                              </div>
                              <div className="md:col-span-5 flex items-center gap-2">
                                <input type="time" value={shift.start} onChange={(e) => updateShift(day, shift.id, 'start', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none" />
                                <span className="text-slate-400 text-xs">to</span>
                                <input type="time" value={shift.end} onChange={(e) => updateShift(day, shift.id, 'end', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none" />
                              </div>
                              <div className="md:col-span-1 flex justify-end">
                                <button onClick={() => removeShift(day, shift.id)} disabled={schedule.shifts.length === 1} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent" title="Remove Shift">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                              </div>
                            </div>
                          ))}
                          <div>
                            <button onClick={() => addShift(day)} className="text-teal-600 text-xs font-bold hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Add Split Shift
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRAVEL OVERRIDES */}
        {activeTab === 'overrides' && (
          <div className="animate-in fade-in">
            <div className="bg-gradient-to-br from-indigo-50 to-white backdrop-blur-md rounded-2xl p-6 border border-indigo-100 shadow-[0_8px_30px_rgba(79,70,229,0.05)]">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Dynamic Travel Booking</h3>
                  <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">Are you traveling to a different town to consult? Select the dates and the destination clinic. The system will automatically pause your regular Bhubaneswar bookings and open up live slots for your destination.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-indigo-50 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 uppercase tracking-widest mb-2">1. Select Destination Clinic</label>
                    <select value={newOverride.location} onChange={e => setNewOverride(p => ({...p, location: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="" disabled>Choose visiting location...</option>
                      {locations.filter(l => l.name.includes('Visiting')).map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 uppercase tracking-widest mb-2">2. Select Travel Dates</label>
                    <div className="flex items-center gap-2">
                      <input type="date" value={newOverride.startDate} onChange={e => setNewOverride(p => ({...p, startDate: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                      <span className="text-slate-400 font-bold">to</span>
                      <input type="date" value={newOverride.endDate} onChange={e => setNewOverride(p => ({...p, endDate: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <label className="block text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3">3. Set Booking Slots for these Dates</label>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" value={newOverride.start} onChange={e => setNewOverride(p => ({...p, start: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                      <span className="text-slate-400 font-bold text-sm">to</span>
                      <input type="time" value={newOverride.end} onChange={e => setNewOverride(p => ({...p, end: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <button onClick={handleAddOverride} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all shrink-0">
                      Generate Override
                    </button>
                  </div>
                </div>
              </div>
              
              {overrides.length > 0 && (
                <div className="border border-indigo-100 rounded-xl overflow-hidden">
                  <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Active Travel Schedules</span>
                  </div>
                  {overrides.map(ovr => {
                    const loc = locations.find(l => l.id === ovr.location);
                    return (
                      <div key={ovr.id} className="p-4 bg-white flex items-center justify-between border-b border-indigo-50 last:border-0 group">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{loc?.name || ovr.location}</h4>
                            <p className="text-xs text-slate-500">{ovr.startDate} to {ovr.endDate} • {ovr.start} - {ovr.end}</p>
                          </div>
                        </div>
                        <button onClick={() => removeOverride(ovr.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BLOCKOUTS */}
        {activeTab === 'blockouts' && (
          <div className="animate-in fade-in">
             <div className="bg-gradient-to-br from-rose-50 to-white backdrop-blur-md rounded-2xl p-6 border border-rose-100 shadow-[0_8px_30px_rgba(225,29,72,0.05)]">
               <h3 className="font-bold text-slate-900 text-lg mb-2">Vacation & Blockouts</h3>
               <p className="text-sm text-slate-600 mb-6 max-w-2xl">Block out specific dates if you are on leave or sick. The system will freeze all physical and telemedicine bookings for the selected duration.</p>
               
               <div className="flex flex-col md:flex-row items-end gap-4 bg-white p-5 rounded-xl border border-rose-100 shadow-sm mb-6">
                 <div className="w-full md:flex-1">
                    <label className="block text-xs font-bold text-rose-900 uppercase tracking-widest mb-2">Start Date</label>
                    <input type="date" value={newBlockout.startDate} onChange={e => setNewBlockout(p => ({...p, startDate: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-rose-500 outline-none" />
                 </div>
                 <div className="w-full md:flex-1">
                    <label className="block text-xs font-bold text-rose-900 uppercase tracking-widest mb-2">End Date</label>
                    <input type="date" value={newBlockout.endDate} onChange={e => setNewBlockout(p => ({...p, endDate: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-rose-500 outline-none" />
                 </div>
                 <button onClick={handleAddBlockout} className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all shrink-0 mt-4 md:mt-0">
                    Block Calendar
                 </button>
               </div>

               {blockouts.length > 0 && (
                <div className="border border-rose-100 rounded-xl overflow-hidden">
                  <div className="bg-rose-50 px-4 py-3 border-b border-rose-100">
                    <span className="text-xs font-bold text-rose-900 uppercase tracking-widest">Active Blockouts</span>
                  </div>
                  {blockouts.map(blk => (
                    <div key={blk.id} className="p-4 bg-white flex items-center justify-between border-b border-rose-50 last:border-0 group">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">Vacation / Leave</h4>
                          <p className="text-xs text-slate-500">{blk.startDate} to {blk.endDate}</p>
                        </div>
                      </div>
                      <button onClick={() => removeBlockout(blk.id)} className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
