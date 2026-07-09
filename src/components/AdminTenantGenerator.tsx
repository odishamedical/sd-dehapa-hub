"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { PluginRegistry, PluginDefinition } from '@/plugins/core/PluginRegistry';

export default function AdminTenantGenerator() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [plugins, setPlugins] = useState<PluginDefinition[]>([]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [accentColor, setAccentColor] = useState('#14b8a6');
  const [logoText, setLogoText] = useState('');
  const [selectedPlugins, setSelectedPlugins] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPlugins(PluginRegistry.getAllPlugins());
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const snap = await getDocs(collection(db, 'tenants'));
      setTenants(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePlugin = (pluginId: string) => {
    setSelectedPlugins(prev => ({
      ...prev,
      [pluginId]: !prev[pluginId]
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return alert("Name and Subdomain are required");
    
    setIsSaving(true);
    try {
      // 1. Save Tenant Branding to `tenants`
      const tenantData = {
        id: slug,
        name,
        slug,
        domainKeyword: slug,
        accentColor,
        accentColorGlow: `${accentColor}33`,
        gradientFrom: accentColor,
        gradientTo: '#0f172a',
        logoText: logoText || name,
        logoSubText: 'Powered by Dehapa',
        hospitalName: name,
        tagline: 'Premium Healthcare',
        description: `Dedicated portal for ${name}.`
      };
      await setDoc(doc(db, 'tenants', slug), tenantData);

      // 2. Save Plugin Config to `plugin_settings`
      const pluginConfig: Record<string, boolean> = {};
      plugins.forEach(p => {
        pluginConfig[p.id] = selectedPlugins[p.id] || false;
      });
      
      await setDoc(doc(db, 'plugin_settings', slug), pluginConfig);

      alert(`Success! ${name} app generated. It is now live at ${slug}.dehapa.com`);
      setIsCreating(false);
      fetchTenants();
      // Reset
      setName(''); setSlug(''); setLogoText(''); setSelectedPlugins({});
    } catch (err) {
      console.error(err);
      alert("Failed to generate tenant.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="text-slate-100 font-sans">
      <header className="mb-10 border-b border-white/10 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-md">White-Label App Generator</h1>
          <p className="text-slate-400 max-w-2xl text-base">
            Generate fully independent web-apps for clinics and hospitals instantly.
          </p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)] border border-cyan-400 hover:scale-105"
        >
          {isCreating ? 'Cancel' : '+ Generate New App'}
        </button>
      </header>

      {isCreating ? (
        <form onSubmit={handleGenerate} className="bg-slate-800/80 rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-white/10 animate-in fade-in slide-in-from-bottom-4 mb-12 backdrop-blur-xl">
          <h2 className="text-2xl font-bold mb-6 text-white drop-shadow-sm flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]"></span>
            Create New Tenant Engine
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clinic/Hospital Name</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-inner placeholder-slate-600" placeholder="e.g. Dr. Ramesh Clinic" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subdomain Slug</label>
              <div className="flex items-center">
                <input required type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="flex-1 bg-black/40 border border-white/10 border-r-0 text-white rounded-l-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-inner placeholder-slate-600" placeholder="e.g. ramesh" />
                <div className="bg-white/5 border border-white/10 border-l-0 px-4 py-3 rounded-r-xl text-slate-500 font-bold">.dehapa.com</div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Logo Text</label>
              <input type="text" value={logoText} onChange={e => setLogoText(e.target.value)} className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-inner placeholder-slate-600" placeholder="e.g. RC" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Theme Accent Color</label>
              <div className="flex items-center gap-4">
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0" />
                <input type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="flex-1 bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-inner font-mono" />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Select Included Plugins</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plugins.map(plugin => {
                const isActive = selectedPlugins[plugin.id];
                return (
                  <div 
                    key={plugin.id} 
                    onClick={() => handleTogglePlugin(plugin.id)} 
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${isActive ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-bold ${isActive ? 'text-cyan-300 drop-shadow-sm' : 'text-slate-300'}`}>{plugin.name}</h4>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isActive ? 'border-teal-400 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.6)]' : 'border-slate-600 bg-black/40'}`}>
                        {isActive && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{plugin.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all hover:-translate-y-0.5 disabled:opacity-50 border border-cyan-400">
            {isSaving ? 'Generating App Engine...' : 'Launch Independent App'}
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg text-white border border-white/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"></div>
            <h3 className="text-lg font-bold mb-1 drop-shadow-sm">DehaPa General</h3>
            <p className="text-sm opacity-80 mb-4 font-mono text-cyan-300">general.dehapa.com</p>
            <div className="bg-white/10 px-3 py-1 rounded-lg inline-block text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/20">Master Tenant</div>
          </div>
          
          {tenants.map(t => (
            <div key={t.id} className="bg-slate-800/60 p-6 rounded-2xl shadow-sm border border-white/10 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:bg-slate-800 transition-all backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-20 transform translate-x-8 -translate-y-8 rounded-full blur-xl transition-all group-hover:scale-150" style={{ backgroundColor: t.accentColor }}></div>
              <h3 className="text-lg font-bold text-white mb-1 drop-shadow-sm relative z-10">{t.name}</h3>
              <p className="text-sm text-slate-400 mb-4 font-mono relative z-10">{t.slug}.dehapa.com</p>
              <div className="flex items-center gap-2 relative z-10">
                <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)] border border-white/20" style={{ backgroundColor: t.accentColor }}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custom Theme Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
