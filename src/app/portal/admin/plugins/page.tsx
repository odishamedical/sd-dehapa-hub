"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { PluginRegistry, PluginDefinition } from '@/plugins/core/PluginRegistry';

export default function MasterSwitchboardPage() {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
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
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 pt-24 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-12 border-b border-slate-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-indigo-500/20">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Super Admin Control
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">Master Switchboard</h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Toggle specific plugins on or off for the entire Dehapa platform in real-time. Changes here take effect immediately for all connected users without a page reload.
            </p>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Engine Nodes</div>
            <div className="text-3xl font-black text-teal-400">{plugins.length} Plugins</div>
          </div>
        </header>

        <div className="space-y-12">
          {Object.entries(groupedPlugins).map(([group, groupPlugins]) => (
            <section key={group} className="animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-slate-700"></span>
                {group} Engine
                <span className="flex-1 h-px bg-slate-800"></span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupPlugins.map(plugin => {
                  const isEnabled = activePlugins[plugin.id] !== undefined ? activePlugins[plugin.id] : plugin.enabled;
                  
                  return (
                    <div 
                      key={plugin.id} 
                      className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 ${
                        isEnabled 
                        ? 'bg-slate-800/80 border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.1)]' 
                        : 'bg-slate-900/50 border-slate-800 opacity-60 grayscale-[0.5]'
                      }`}
                    >
                      {/* Background Gradient for Active State */}
                      {isEnabled && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>}
                      
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm bg-slate-950 border border-slate-800 text-slate-300">
                          {plugin.name.substring(0,2).toUpperCase()}
                        </div>
                        
                        {/* Custom Toggle Switch */}
                        <button 
                          onClick={() => handleToggle(plugin.id)}
                          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${isEnabled ? 'bg-indigo-500' : 'bg-slate-700'}`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      
                      <div className="relative z-10">
                        <h3 className="font-bold text-lg text-white mb-2">{plugin.name}</h3>
                        <p className="text-sm text-slate-400 mb-4 h-10">{plugin.description}</p>
                        
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-700/50">
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target Socket</p>
                            <p className="text-xs font-mono text-indigo-300 bg-indigo-500/10 inline-block px-2 py-1 rounded-md border border-indigo-500/20">{plugin.targetExtensionPoint}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-right">Status</p>
                            <p className={`text-xs font-bold px-2 py-1 rounded-md text-right ${isEnabled ? 'text-teal-400 bg-teal-400/10' : 'text-slate-500 bg-slate-800'}`}>
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
    </div>
  );
}
