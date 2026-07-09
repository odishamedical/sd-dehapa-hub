"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { PluginRegistry, PluginDefinition } from '@/plugins/core/PluginRegistry';

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
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Group plugins by prefix (e.g. 'rx', 'pharmacy', 'hospital', 'lab', 'vault')
  const groupedPlugins: Record<string, PluginDefinition[]> = {};
  plugins.forEach(p => {
    const group = p.id.split('.')[0] || 'other';
    if (!groupedPlugins[group]) groupedPlugins[group] = [];
    groupedPlugins[group].push(p);
  });

  return (
    <div className="text-slate-100 font-sans">
      <header className="mb-10 border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]"></span>
            Super Admin Control
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-md">Master Switchboard</h1>
          <p className="text-slate-400 max-w-2xl text-base">
            Toggle specific plugins on or off for the entire Dehapa platform in real-time. Changes here take effect immediately for all connected users without a page reload.
          </p>
        </div>
        
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Engine Nodes</div>
          <div className="text-3xl font-black text-teal-400 drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]">{plugins.length} Plugins</div>
        </div>
      </header>

      <div className="space-y-12">
        {Object.entries(groupedPlugins).map(([group, groupPlugins]) => (
          <section key={group} className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3 drop-shadow-md">
              <span className="w-8 h-px bg-slate-600"></span>
              {group} Engine
              <span className="flex-1 h-px bg-white/10"></span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupPlugins.map(plugin => {
                const isEnabled = activePlugins[plugin.id] !== undefined ? activePlugins[plugin.id] : plugin.enabled;
                
                return (
                  <div 
                    key={plugin.id} 
                    className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 ${
                      isEnabled 
                      ? 'bg-slate-800/80 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20' 
                      : 'bg-slate-900/50 border-white/5 opacity-60 grayscale-[0.5] hover:grayscale-0'
                    }`}
                  >
                    {/* Background Gradient for Active State */}
                    {isEnabled && <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none"></div>}
                    
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-black/40 border border-white/10 text-slate-300 shadow-inner">
                        {plugin.name.substring(0,2).toUpperCase()}
                      </div>
                      
                      {/* Custom Toggle Switch (Teal/Cyan themed) */}
                      <button 
                        onClick={() => handleToggle(plugin.id)}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${isEnabled ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.6)]' : 'bg-slate-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="font-bold text-base text-white mb-1 drop-shadow-sm">{plugin.name}</h3>
                      <p className="text-xs text-slate-400 mb-4 h-8 overflow-hidden">{plugin.description}</p>
                      
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                        <div className="flex-1">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target Socket</p>
                          <p className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 inline-block px-2 py-0.5 rounded border border-cyan-500/20 shadow-sm">{plugin.targetExtensionPoint}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-right">Status</p>
                          <p className={`text-[10px] font-black px-2 py-0.5 rounded text-right tracking-wider ${isEnabled ? 'text-teal-300 bg-teal-500/20 shadow-[0_0_8px_rgba(45,212,191,0.3)]' : 'text-slate-500 bg-slate-800'}`}>
                            {isEnabled ? 'ONLINE' : 'OFFLINE'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
