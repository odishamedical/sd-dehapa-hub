"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AdminPlatformSettings() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [prices, setPrices] = useState({
    generalPhysician: 299,
    specialist: 599,
    superSpecialist: 999
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, 'platform_settings', 'pricing');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPrices(docSnap.data() as any);
        } else {
          // Initialize if it doesn't exist
          await setDoc(docRef, prices);
        }
      } catch (err) {
        console.error("Failed to load platform settings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'platform_settings', 'pricing'), prices);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Platform Settings</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Configure global pricing, taxes, and system behaviors.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Telemedicine Consultation Pricing
          </h4>
          <p className="text-xs text-slate-500 mb-6">These prices are dynamically shown to patients in the Instant Consult widget.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">General Physician (₹)</label>
              <input 
                type="number" 
                value={prices.generalPhysician} 
                onChange={(e) => setPrices({...prices, generalPhysician: Number(e.target.value)})}
                className="w-full bg-white border border-slate-300 hover:border-teal-400 rounded-xl px-4 py-3 shadow-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-bold" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Specialist (₹)</label>
              <input 
                type="number" 
                value={prices.specialist} 
                onChange={(e) => setPrices({...prices, specialist: Number(e.target.value)})}
                className="w-full bg-white border border-slate-300 hover:border-teal-400 rounded-xl px-4 py-3 shadow-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-bold" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Super Specialist (₹)</label>
              <input 
                type="number" 
                value={prices.superSpecialist} 
                onChange={(e) => setPrices({...prices, superSpecialist: Number(e.target.value)})}
                className="w-full bg-white border border-slate-300 hover:border-teal-400 rounded-xl px-4 py-3 shadow-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-bold" 
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 opacity-60">
          <h4 className="font-bold text-slate-900 mb-2">Platform Fees & Tax</h4>
          <p className="text-xs text-slate-500 mb-6">Future configuration for transaction splits and GST.</p>
          <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
