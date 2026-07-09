"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { PluginRegistry, PluginDefinition } from '@/plugins/core/PluginRegistry';

export default function TenantGeneratorPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [plugins, setPlugins] = useState<PluginDefinition[]>([]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [accentColor, setAccentColor] = useState('#06b6d4');
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
      // For any plugin not selected, explicitly save as false
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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 pt-24 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-slate-200 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">White-Label App Generator</h1>
            <p className="text-slate-500 max-w-2xl text-lg">
              Generate fully independent web-apps for clinics and hospitals instantly.
            </p>
          </div>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
          >
            {isCreating ? 'Cancel' : '+ Generate New App'}
          </button>
        </header>

        {isCreating ? (
          <form onSubmit={handleGenerate} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 mb-12">
            <h2 className="text-2xl font-bold mb-6">Create New Tenant</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Clinic/Hospital Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none" placeholder="e.g. Dr. Ramesh Clinic" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Subdomain Slug</label>
                <div className="flex items-center">
                  <input required type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="flex-1 border border-slate-300 rounded-l-xl px-4 py-3 focus:border-indigo-500 outline-none" placeholder="e.g. ramesh" />
                  <div className="bg-slate-100 border border-l-0 border-slate-300 px-4 py-3 rounded-r-xl text-slate-500 font-bold">.dehapa.com</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Logo Text</label>
                <input type="text" value={logoText} onChange={e => setLogoText(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none" placeholder="e.g. RC" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Theme Accent Color</label>
                <div className="flex items-center gap-4">
                  <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-12 h-12 rounded cursor-pointer" />
                  <input type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none font-mono" />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 border-b pb-2">Select Included Plugins</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plugins.map(plugin => (
                  <div key={plugin.id} onClick={() => handleTogglePlugin(plugin.id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPlugins[plugin.id] ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-bold ${selectedPlugins[plugin.id] ? 'text-indigo-900' : 'text-slate-700'}`}>{plugin.name}</h4>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlugins[plugin.id] ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                        {selectedPlugins[plugin.id] && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{plugin.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50">
              {isSaving ? 'Generating App...' : 'Launch Independent App'}
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-3xl shadow-lg text-white">
              <h3 className="text-lg font-bold mb-1">DehaPa General</h3>
              <p className="text-sm opacity-80 mb-4">general.dehapa.com</p>
              <div className="bg-white/20 px-3 py-1 rounded-lg inline-block text-xs font-bold backdrop-blur-md">Master Tenant</div>
            </div>
            
            {tenants.map(t => (
              <div key={t.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 w-16 h-16 opacity-20 transform translate-x-4 -translate-y-4 rounded-full" style={{ backgroundColor: t.accentColor }}></div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{t.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{t.slug}.dehapa.com</p>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: t.accentColor }}></div>
                  <span className="text-xs font-bold text-slate-400">Custom Theme</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
