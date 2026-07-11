"use client";

import React, { useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Check } from 'lucide-react';

const AVAILABLE_PLUGINS = [
  {
    id: "plugin_hospital_bed_manager",
    name: "Live Bed Manager Pro",
    description: "Manage hospital beds in real-time. Unlocks the digital bed dashboard.",
    icon: "🛏️",
    price: 1999,
    features: ["Real-time Bed Tracking", "Ward Management", "Admission/Discharge Sync"]
  },
  {
    id: "plugin_hospital_ambulance",
    name: "SOS Ambulance Dispatcher",
    description: "Live track and dispatch ambulances to patients who trigger SOS alerts.",
    icon: "🚑",
    price: 2499,
    features: ["Live Fleet Tracking", "SOS Alerts", "Driver App Integration"]
  },
  {
    id: "plugin_hospital_roster",
    name: "B2B Doctor Roster Network",
    description: "Build an exclusive network of doctors who refer patients to your hospital.",
    icon: "🤝",
    price: 1499,
    features: ["Invite Affiliated Doctors", "Referral Tracking", "Commission Splits"]
  }
];

export default function HospitalPluginStore({ entityData }: { entityData: any }) {
  const [loading, setLoading] = useState<string | null>(null);

  const activePlugins = entityData?.activePlugins || [];

  const handleTogglePlugin = async (pluginId: string) => {
    if (!entityData?.id) return;
    
    setLoading(pluginId);
    try {
      const isCurrentlyActive = activePlugins.includes(pluginId);
      
      const newPlugins = isCurrentlyActive 
        ? activePlugins.filter((p: string) => p !== pluginId)
        : [...activePlugins, pluginId];
        
      await updateDoc(doc(db, "directory", entityData.id), {
        activePlugins: newPlugins
      });
      
    } catch (error) {
      console.error("Error updating plugins:", error);
      alert("Failed to update plugin status.");
    } finally {
      setLoading(null);
    }
  };

  const totalPrice = useMemo(() => {
    return AVAILABLE_PLUGINS.reduce((total, plugin) => {
      if (activePlugins.includes(plugin.id)) {
        return total + plugin.price;
      }
      return total;
    }, 0);
  }, [activePlugins]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24 relative min-h-[85vh]">
      {/* Network Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20 -z-10" style={{
        backgroundImage: `
          linear-gradient(to right, #0ea5e9 1px, transparent 1px),
          linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(circle at top, black, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(circle at top, black, transparent 80%)'
      }}></div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="text-sky-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-2">Hospital Operations Hub</div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Enterprise Upgrades</h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Scale your hospital's operations. Toggle the enterprise modules you need to track beds, dispatch ambulances, and manage your affiliated doctor roster.
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shrink-0 min-w-[200px] text-center shadow-inner">
            <div className="text-slate-500 font-bold tracking-widest text-[10px] uppercase mb-1">Estimated Monthly</div>
            <div className="text-3xl font-black text-white flex justify-center items-end gap-1">
              ₹{totalPrice} <span className="text-sm font-medium text-slate-500 mb-1">/mo</span>
            </div>
            {totalPrice > 0 ? (
              <div className="text-emerald-400 text-[10px] font-bold mt-2 uppercase tracking-widest flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Subscription
              </div>
            ) : (
              <div className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-widest">
                Freemium Tier
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {AVAILABLE_PLUGINS.map((plugin) => {
          const isActive = activePlugins.includes(plugin.id);
          const isToggling = loading === plugin.id;

          return (
            <div 
              key={plugin.id} 
              className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-500 flex flex-col h-full ${
                isActive 
                ? 'bg-gradient-to-br from-sky-900/40 via-slate-900/80 to-slate-900/90 border-sky-500/50 shadow-[0_0_30px_rgba(14,165,233,0.15)] ring-1 ring-sky-500/50' 
                : 'bg-slate-800/40 border border-white/5 hover:border-white/10 shadow-lg backdrop-blur-md grayscale-[0.3] hover:grayscale-[0]'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-sky-500/10 to-transparent pointer-events-none rounded-t-3xl"></div>
              )}

              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-colors ${
                  isActive ? 'bg-sky-500/10 grayscale-0' : 'bg-slate-800 grayscale'
                }`}>
                  {plugin.icon}
                </div>
                
                <button 
                  onClick={() => handleTogglePlugin(plugin.id)}
                  disabled={isToggling}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 disabled:opacity-50 ${
                    isActive 
                    ? 'bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)] border border-sky-400' 
                    : 'bg-slate-700 border border-slate-600'
                  }`}
                >
                  <span 
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-out flex items-center justify-center ${
                      isActive ? 'translate-x-[2.1rem]' : 'translate-x-1'
                    }`} 
                  >
                    {isActive && <Check size={14} className="text-sky-500" strokeWidth={3} />}
                  </span>
                </button>
              </div>
              
              <div className="relative z-10 flex-1">
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide">{plugin.name}</h3>
                <p className="text-slate-400/90 text-sm leading-relaxed mb-6 min-h-[40px]">
                  {plugin.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  {plugin.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-300">
                      <Check size={14} className={isActive ? "text-sky-400" : "text-slate-500"} />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-white/5 relative z-10 flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border flex items-center gap-1.5 ${
                  isActive 
                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' 
                  : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(14,165,233,1)]"></span>}
                  {isActive ? 'ACTIVE MODULE' : 'INACTIVE'}
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-black text-white">₹{plugin.price}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Per Month</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
