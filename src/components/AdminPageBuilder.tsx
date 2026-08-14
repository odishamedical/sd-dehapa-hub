"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AdminCard, AdminHeader } from '@/components/admin/ui';

interface PageLayoutRow {
  id: string;
  order: number;
  type: string;
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  visible: boolean;
  populationType: 'manual' | 'dynamic' | 'static';
  pinnedEntityIds?: string[];
  dynamicRules?: {
    category?: string;
    subCategory?: string;
    location?: string;
    limit?: number;
    sortBy?: string;
  };
  adSlotId?: string;
}

interface PageLayout {
  id: string;
  pageName: string;
  hero: {
    titleStart: string;
    highlight: string;
    subtitle: string;
    desktopBgImage: string;
    mobileBgImage: string;
  };
  rows: PageLayoutRow[];
}

const DEFAULT_HOME_LAYOUT: PageLayout = {
  id: "home",
  pageName: "Homepage",
  hero: {
    titleStart: "Find & Book",
    highlight: "Premium Healthcare.",
    subtitle: "The most trusted medical professionals, instantly available near you.",
    desktopBgImage: "/v2/pc-hero.png",
    mobileBgImage: "/v2/phone-hero.png"
  },
  rows: [
    {
      id: "row-default-1",
      order: 1,
      type: "quick-services-slider",
      visible: true,
      populationType: "static"
    }
  ]
};

export default function AdminPageBuilder() {
  const [activePage, setActivePage] = useState<string>("home");
  const [layout, setLayout] = useState<PageLayout>(DEFAULT_HOME_LAYOUT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Fetch layout on change
  useEffect(() => {
    const fetchLayout = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'page_layouts', activePage);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLayout({ id: docSnap.id, ...docSnap.data() } as PageLayout);
        } else {
          setLayout({ ...DEFAULT_HOME_LAYOUT, id: activePage, pageName: activePage.charAt(0).toUpperCase() + activePage.slice(1) });
        }
      } catch (err) {
        console.error("Failed to load page layout:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLayout();
  }, [activePage]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'page_layouts', activePage), {
        ...layout,
        updatedAt: serverTimestamp()
      });
      alert("Page Layout Saved Successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving layout");
    } finally {
      setSaving(false);
    }
  };

  const addRow = () => {
    const newRow: PageLayoutRow = {
      id: `row-${Date.now()}`,
      order: layout.rows.length + 1,
      type: 'square-grid',
      title: 'New Section',
      visible: true,
      populationType: 'dynamic',
      dynamicRules: {
        category: 'Doctor',
        limit: 4,
        sortBy: 'rating'
      }
    };
    setLayout({ ...layout, rows: [...layout.rows, newRow] });
  };

  const updateRow = (id: string, updates: Partial<PageLayoutRow>) => {
    setLayout({
      ...layout,
      rows: layout.rows.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const removeRow = (id: string) => {
    if (!confirm("Remove this row?")) return;
    setLayout({
      ...layout,
      rows: layout.rows.filter(r => r.id !== id)
    });
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === layout.rows.length - 1) return;
    
    const newRows = [...layout.rows];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newRows[index];
    newRows[index] = newRows[swapIndex];
    newRows[swapIndex] = temp;
    
    // Update orders
    newRows.forEach((r, i) => r.order = i + 1);
    setLayout({ ...layout, rows: newRows });
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading Page Builder...</div>;
  }

  return (
    <AdminCard noPadding>
      <AdminHeader 
        title="Master Page Layout CMS" 
        description="Dynamically control the public pages. Add rows, pin entities, and inject ads."
      />
      
      <div className="p-6 md:p-8 bg-slate-950">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Select Page to Edit</label>
            <select 
              value={activePage}
              onChange={(e) => setActivePage(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:border-teal-500 outline-none w-64"
            >
              <option value="home">Homepage (Root)</option>
              <option value="search_doctors">Doctors Hub</option>
              <option value="search_hospitals">Hospitals Hub</option>
              <option value="search_labs">Labs Hub</option>
              <option value="search_pharmacies">Pharmacies Hub</option>
              <option value="search_ambulances">Ambulances Hub</option>
            </select>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg"
          >
            {saving ? "Saving..." : "Save Published Layout"}
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h3 className="text-xl font-bold text-white tracking-tight">Page Rows</h3>
            <button onClick={addRow} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg">
              + Add New Row
            </button>
          </div>

          <div className="space-y-4">
            {layout.rows.map((row, idx) => (
              <div key={row.id} className="bg-slate-900 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                {/* Row Header */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 items-center">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveRow(idx, 'up')} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-30">▲</button>
                      <button onClick={() => moveRow(idx, 'down')} disabled={idx === layout.rows.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30">▼</button>
                    </div>
                    <span className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-400 text-xs">
                      {row.order}
                    </span>
                    <input 
                      type="text" 
                      value={row.title || ""} 
                      onChange={(e) => updateRow(row.id, { title: e.target.value })}
                      placeholder="Row Title (e.g. Featured Doctors)"
                      className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-teal-500 text-white font-bold text-lg px-2 py-1 outline-none w-64"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={row.visible} onChange={(e) => updateRow(row.id, { visible: e.target.checked })} className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-500" />
                      <span className="text-xs font-bold text-slate-400">Visible</span>
                    </label>
                    <button onClick={() => removeRow(row.id)} className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 bg-red-400/10 rounded">Delete</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-white/5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Row Type / Layout</label>
                    <select 
                      value={row.type} 
                      onChange={(e) => updateRow(row.id, { type: e.target.value })}
                      className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-slate-200 outline-none"
                    >
                      <option value="quick-services-slider">Quick Services Buttons</option>
                      <option value="square-grid">Square Tickets Grid</option>
                      <option value="wide-list">Wide Tickets List</option>
                      <option value="mixed-portrait-square">1 Portrait + Squares Mix</option>
                      <option value="how-it-works-patient">Patient Guide Block</option>
                      <option value="how-it-works-provider">Provider Guide Block</option>
                      <option value="ad-injection">Ad Injection Zone</option>
                    </select>
                  </div>

                  {row.type !== 'ad-injection' && !row.type.startsWith('how-it-works') && row.type !== 'quick-services-slider' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Data Source</label>
                        <select 
                          value={row.populationType} 
                          onChange={(e) => updateRow(row.id, { populationType: e.target.value as any })}
                          className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-slate-200 outline-none"
                        >
                          <option value="dynamic">Dynamic Rule (Auto-fetch)</option>
                          <option value="manual">Manual Selection (Pinned)</option>
                        </select>
                      </div>

                      {row.populationType === 'dynamic' ? (
                        <div className="flex gap-2">
                          <div className="flex-1">
                             <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Category Rule</label>
                             <select 
                               value={row.dynamicRules?.category || "Doctor"} 
                               onChange={(e) => updateRow(row.id, { dynamicRules: { ...row.dynamicRules, category: e.target.value } })}
                               className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-slate-200 outline-none"
                             >
                               <option value="Doctor">Doctors</option>
                               <option value="Hospital">Hospitals</option>
                               <option value="Pharmacy">Pharmacies</option>
                               <option value="Lab">Labs</option>
                               <option value="Ambulance">Ambulances</option>
                             </select>
                          </div>
                          <div className="w-20">
                             <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Limit</label>
                             <input 
                               type="number" 
                               value={row.dynamicRules?.limit || 4} 
                               onChange={(e) => updateRow(row.id, { dynamicRules: { ...row.dynamicRules, limit: parseInt(e.target.value) } })}
                               className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-slate-200 outline-none"
                             />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Pinned Entity IDs (Comma separated)</label>
                          <input 
                            type="text" 
                            value={row.pinnedEntityIds?.join(", ") || ""} 
                            onChange={(e) => updateRow(row.id, { pinnedEntityIds: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                            placeholder="e.g. dir_xyz123, dir_abc987"
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-slate-200 outline-none"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {row.type === 'ad-injection' && (
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Ad Slot ID</label>
                        <input 
                          type="text" 
                          value={row.adSlotId || ""} 
                          onChange={(e) => updateRow(row.id, { adSlotId: e.target.value })}
                          placeholder="e.g. ad_slot_home_distributed_1"
                          className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-slate-200 outline-none"
                        />
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminCard>
  );
}
