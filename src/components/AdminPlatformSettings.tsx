"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AdminCard, AdminHeader } from '@/components/admin/ui';

export default function AdminPlatformSettings() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [prices, setPrices] = useState({
    ayush: 200,
    ayushMarket: 400,
    mbbs: 250,
    mbbsMarket: 500,
    specialist: 400,
    specialistMarket: 800,
    superSpecialist: 500,
    superSpecialistMarket: 1000
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, 'platform_settings', 'pricing');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          // Merge with defaults to ensure all keys exist
          setPrices(prev => ({...prev, ...docSnap.data()}));
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
    <AdminCard>
      <AdminHeader 
        title="Platform Settings" 
        description="Configure global pricing, taxes, and system behaviors."
        actions={
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all disabled:opacity-70 border border-cyan-400"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-6">
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800 shadow-inner">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Urgent Care Video Consult Pricing
          </h4>
          <p className="text-xs text-slate-400 mb-6">Set both the 'Market Fee' (shown crossed out) and the 'Subsidized Fee' (what patients actually pay) for each tier.</p>
          
          <div className="space-y-6">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-sm">
              <label className="block text-sm font-black text-slate-200 mb-3">Ayush Doctor</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Market Fee (₹)</label>
                  <input type="number" value={prices.ayushMarket} onChange={(e) => setPrices({...prices, ayushMarket: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Subsidized Fee (₹)</label>
                  <input type="number" value={prices.ayush} onChange={(e) => setPrices({...prices, ayush: Number(e.target.value)})} className="w-full bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm text-cyan-300 focus:outline-none focus:border-cyan-500 font-bold" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-sm">
              <label className="block text-sm font-black text-slate-200 mb-3">MBBS Doctor</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Market Fee (₹)</label>
                  <input type="number" value={prices.mbbsMarket} onChange={(e) => setPrices({...prices, mbbsMarket: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Subsidized Fee (₹)</label>
                  <input type="number" value={prices.mbbs} onChange={(e) => setPrices({...prices, mbbs: Number(e.target.value)})} className="w-full bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm text-cyan-300 focus:outline-none focus:border-cyan-500 font-bold" />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-sm">
              <label className="block text-sm font-black text-slate-200 mb-3">Specialist</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Market Fee (₹)</label>
                  <input type="number" value={prices.specialistMarket} onChange={(e) => setPrices({...prices, specialistMarket: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Subsidized Fee (₹)</label>
                  <input type="number" value={prices.specialist} onChange={(e) => setPrices({...prices, specialist: Number(e.target.value)})} className="w-full bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm text-cyan-300 focus:outline-none focus:border-cyan-500 font-bold" />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-sm">
              <label className="block text-sm font-black text-slate-200 mb-3">Super Specialist</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Market Fee (₹)</label>
                  <input type="number" value={prices.superSpecialistMarket} onChange={(e) => setPrices({...prices, superSpecialistMarket: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Subsidized Fee (₹)</label>
                  <input type="number" value={prices.superSpecialist} onChange={(e) => setPrices({...prices, superSpecialist: Number(e.target.value)})} className="w-full bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm text-cyan-300 focus:outline-none focus:border-cyan-500 font-bold" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800 shadow-inner opacity-60">
          <h4 className="font-bold text-white mb-2">Platform Fees & Tax</h4>
          <p className="text-xs text-slate-400 mb-6">Future configuration for transaction splits and GST.</p>
          <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-xl">
            <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Coming Soon</p>
          </div>
        </div>
      </div>
    </AdminCard>
  );
}
