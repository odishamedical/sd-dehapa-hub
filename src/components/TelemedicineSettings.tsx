"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function TelemedicineSettings({ providerId }: { providerId: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // State matching the new data model
  const [isTelemedicineEnabled, setIsTelemedicineEnabled] = useState(false);
  const [scheduledConsultFee, setScheduledConsultFee] = useState<string>('');
  const [isUrgentPingEnabled, setIsUrgentPingEnabled] = useState(false);
  const [urgentPingFee, setUrgentPingFee] = useState<string>('');

  useEffect(() => {
    const fetchSettings = async () => {
      if (!providerId) return;
      try {
        const docRef = doc(db, 'directory', providerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsTelemedicineEnabled(data.isTelemedicineEnabled || false);
          setScheduledConsultFee(data.scheduledConsultFee || '');
          setIsUrgentPingEnabled(data.isUrgentPingEnabled || false);
          setUrgentPingFee(data.urgentPingFee || '');
        }
      } catch (error) {
        console.error("Error fetching telemedicine settings:", error);
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
        isTelemedicineEnabled,
        scheduledConsultFee,
        isUrgentPingEnabled,
        urgentPingFee
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving telemedicine settings:", error);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between mb-8 border-b border-white/40 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            Telemedicine Clinic
          </h2>
          <p className="text-slate-600 text-sm mt-2">Manage your remote consultation availability and premium instant-ping services.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-900 hover:bg-teal-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-6 bg-teal-50/80 backdrop-blur-md border border-teal-200 text-teal-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          <span className="font-semibold text-sm">Settings saved successfully! Updates are live.</span>
        </div>
      )}

      <div className="space-y-8 relative z-10">
        
        {/* Scheduled Consultations Card */}
        <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.8)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 rounded-l-2xl"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Scheduled Video Consultations</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-lg">Allow patients to book standard online video appointments through your public profile.</p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isTelemedicineEnabled}
                onChange={(e) => setIsTelemedicineEnabled(e.target.checked)}
              />
              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-600 shadow-inner"></div>
              <span className="ml-3 text-sm font-bold text-slate-700 uppercase tracking-widest">{isTelemedicineEnabled ? 'Active' : 'Disabled'}</span>
            </label>
          </div>

          <div className={`transition-all duration-500 overflow-hidden ${isTelemedicineEnabled ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/40">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Consultation Fee (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    value={scheduledConsultFee}
                    onChange={(e) => setScheduledConsultFee(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl pl-10 pr-5 py-3.5 text-sm font-bold text-slate-900 focus:bg-slate-900/10 focus:ring-2 focus:ring-teal-600/30 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Duration (Minutes)</label>
                <div className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm font-bold text-slate-500 flex items-center justify-between cursor-not-allowed">
                  15 Minutes
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Urgent Ping Card */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-amber-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <h3 className="text-lg font-bold text-white">Urgent Ping Service</h3>
                <span className="bg-amber-400/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-amber-400/30">Premium</span>
              </div>
              <p className="text-sm text-slate-400 mt-1 max-w-lg">Act as an "Uber for Doctors". Patients can ping you instantly when you are Online for an immediate, premium-priced consultation.</p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isUrgentPingEnabled}
                onChange={(e) => setIsUrgentPingEnabled(e.target.checked)}
              />
              <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
              <span className="ml-3 text-sm font-bold text-white uppercase tracking-widest">{isUrgentPingEnabled ? 'Active' : 'Disabled'}</span>
            </label>
          </div>

          <div className={`transition-all duration-500 overflow-hidden relative z-10 ${isUrgentPingEnabled ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-700">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Urgent Premium Fee (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-amber-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={urgentPingFee}
                    onChange={(e) => setUrgentPingFee(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full bg-slate-900/50 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-slate-700 rounded-xl pl-10 pr-5 py-3.5 text-sm font-bold text-white focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all placeholder-slate-600"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Recommended: 2x your standard fee to filter non-emergencies.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
