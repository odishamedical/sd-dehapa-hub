"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { PluginRegistry, PluginDefinition } from '@/plugins/core/PluginRegistry';
import { Settings, Pill, Bed, ShieldAlert, Calendar, Lightbulb, Bell, Zap, Activity, Box, Search, Package, Check, Shield } from 'lucide-react';

// Helper to map plugin names to relevant icons
const getIconForPlugin = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('pill') || n.includes('med')) return <Pill size={32} className="opacity-80 group-hover:opacity-100 transition-opacity" />;
  if (n.includes('bed')) return <Bed size={32} className="opacity-80 group-hover:opacity-100 transition-opacity" />;
  if (n.includes('safety') || n.includes('shield') || n.includes('security')) return <Shield size={32} className="opacity-80 group-hover:opacity-100 transition-opacity" />;
  if (n.includes('schedule') || n.includes('calendar')) return <Calendar size={32} className="opacity-80 group-hover:opacity-100 transition-opacity" />;
  if (n.includes('light')) return <Lightbulb size={32} className="opacity-80 group-hover:opacity-100 transition-opacity" />;
  if (n.includes('alert') || n.includes('emergency')) return <Bell size={32} className="opacity-80 group-hover:opacity-100 transition-opacity" />;
  if (n.includes('vital')) return <Activity size={32} className="opacity-80 group-hover:opacity-100 transition-opacity" />;
  if (n.includes('inventory')) return <Box size={32} className="opacity-80 group-hover:opacity-100 transition-opacity" />;
  if (n.includes('diagnos')) return <Search size={32} className="opacity-80 group-hover:opacity-100 transition-opacity" />;
  if (n.includes('dispatch') || n.includes('collection')) return <Package size={32} className="opacity-80 group-hover:opacity-100 transition-opacity" />;
  return <Zap size={32} className="opacity-80 group-hover:opacity-100 transition-opacity" />;
};

export default function AdminMasterSwitchboard() {
  const [plugins, setPlugins] = useState<PluginDefinition[]>([]);
  const [activePlugins, setActivePlugins] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load static plugins list
    setPlugins(PluginRegistry.getAllPlugins());

    // Sync live from Firestore
    const docRef = doc(db, 'plugin_settings', 'global_config');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setActivePlugins(snapshot.data() as Record<string, boolean>);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggle = async (pluginId: string) => {
    const currentState = activePlugins[pluginId];
    // If undefined in DB, default is the static registry's default
    const isEnabled = currentState !== undefined ? currentState : plugins.find(p => p.id === pluginId)?.enabled || false;
    const newState = !isEnabled;
    
    // Optimistic update
    setActivePlugins(prev => ({ ...prev, [pluginId]: newState }));

    // Update Firestore
    try {
      const docRef = doc(db, 'plugin_settings', 'global_config');
      await setDoc(docRef, { [pluginId]: newState }, { merge: true });
    } catch (e) {
      console.error("Failed to toggle plugin", e);
      // Revert optimistic update
      setActivePlugins(prev => ({ ...prev, [pluginId]: isEnabled }));
      alert("Failed to save changes. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-[#0B1120] min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] -mx-4 md:-mx-8 -mt-6 md:-mt-8 p-6 md:p-10 relative overflow-hidden bg-[#0A101C]">
      {/* Network Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `
          linear-gradient(to right, #10b981 1px, transparent 1px),
          linear-gradient(to bottom, #10b981 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
      }}></div>
      
      {/* Soft central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl md:text-4xl text-white tracking-widest font-light flex items-center gap-2">
              MASTER <span className="font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">SWITCHBOARD</span>
            </h1>
            <div className="hidden md:block w-px h-8 bg-white/20"></div>
            <div className="text-slate-400 font-medium tracking-[0.2em] text-sm uppercase">
              Global Control Panel
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 transition-all backdrop-blur-md">
            <Settings size={18} />
            <span className="text-sm font-bold tracking-wider">Settings</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {plugins.map(plugin => {
            const isEnabled = activePlugins[plugin.id] !== undefined ? activePlugins[plugin.id] : plugin.enabled;
            
            return (
              <div 
                key={plugin.id} 
                className={`relative overflow-hidden rounded-[2rem] p-8 transition-all duration-500 group flex flex-col h-[280px] ${
                  isEnabled 
                  ? 'bg-gradient-to-br from-emerald-900/40 via-slate-900/80 to-slate-900/90 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50' 
                  : 'bg-slate-800/40 border-white/5 shadow-lg backdrop-blur-md grayscale-[0.4] hover:grayscale-[0.2]'
                }`}
              >
                {/* Active glow effect inside card */}
                {isEnabled && (
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none rounded-t-[2rem]"></div>
                )}
                
                {/* Icon Container */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                  isEnabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-700/50'
                }`}>
                  {getIconForPlugin(plugin.name)}
                </div>
                
                {/* Content */}
                <div className="flex-1 relative z-10">
                  <h3 className="font-bold text-xl text-white mb-2 drop-shadow-sm tracking-wide">{plugin.name}</h3>
                  <p className="text-sm text-slate-400/90 leading-relaxed line-clamp-3">
                    {plugin.description}
                  </p>
                </div>
                
                {/* Footer Controls */}
                <div className="mt-6 flex items-center justify-between relative z-10 pt-4 border-t border-white/5">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border flex items-center gap-1.5 ${
                    isEnabled 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    {isEnabled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></span>}
                    {isEnabled ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                  
                  {/* Large Stylized Toggle Switch */}
                  <button 
                    onClick={() => handleToggle(plugin.id)}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 ${
                      isEnabled 
                      ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-400' 
                      : 'bg-slate-700 border border-slate-600'
                    }`}
                  >
                    <span 
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-out flex items-center justify-center ${
                        isEnabled ? 'translate-x-[2.1rem]' : 'translate-x-1'
                      }`} 
                    >
                      {isEnabled && <Check size={14} className="text-emerald-500" strokeWidth={3} />}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
