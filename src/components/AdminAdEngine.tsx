"use client";

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AdminCard, AdminHeader } from '@/components/admin/ui';

interface AdSlot {
  id: string;
  label: string;
}

const AD_SLOTS: AdSlot[] = [
  { id: 'ad_slot_doctor_hero_top', label: 'Doctor Profile - Top Hero (Global)' },
  { id: 'ad_slot_doctor_hero_right', label: 'Doctor Profile - Right Sidebar (Premium)' },
  { id: 'ad_slot_directory_sidebar', label: 'Directory Search - Left Sidebar' },
  { id: 'ad_slot_home_carousel', label: 'Homepage - Main Carousel (Top)' },
  { id: 'ad_slot_home_grid', label: 'Homepage - 3-Ticket Grid (Middle)' },
  { id: 'ad_slot_home_distributed_1', label: 'Homepage - Distributed Slot 1 (Under Top Doctors)' },
  { id: 'ad_slot_home_distributed_2', label: 'Homepage - Distributed Slot 2 (Under Nearby Hospitals)' },
  { id: 'ad_slot_home_distributed_3', label: 'Homepage - Distributed Slot 3 (Above Footer)' }
];

export default function AdminAdEngine() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [slotId, setSlotId] = useState(AD_SLOTS[0].id);
  const [targetType, setTargetType] = useState<'global' | 'category' | 'specific_profile'>('global');
  const [targetId, setTargetId] = useState('');
  const [adType, setAdType] = useState<'image' | 'adsense'>('image');
  
  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  
  // AdSense State
  const [htmlCode, setHtmlCode] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'platform_ads'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAds(data);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching ads:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInjectAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      let finalImageUrl = '';

      if (adType === 'image') {
        if (!imageFile) throw new Error("Please upload an image for the ad.");
        const fileExt = imageFile.name.split('.').pop();
        const storageRef = ref(storage, `ads/${Date.now()}_${slotId}.${fileExt}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(uploadResult.ref);
      } else {
        if (!htmlCode) throw new Error("Please paste the AdSense HTML code.");
      }

      // If global, document ID is just the slotId. If specific, it's slotId_targetId
      const docId = targetType === 'global' ? slotId : `${slotId}_${targetId}`;

      const adData = {
        slotId,
        targetType,
        targetId: targetType === 'global' ? 'all' : targetId,
        type: adType,
        imageUrl: finalImageUrl,
        linkUrl,
        htmlCode,
        active: true,
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'platform_ads', docId), adData);
      
      setSuccessMsg("Ad successfully injected to the platform!");
      setImageFile(null);
      setHtmlCode('');
      setLinkUrl('');
    } catch (err: any) {
      setError(err.message || "Failed to inject ad.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (ad: any) => {
    try {
      await setDoc(doc(db, 'platform_ads', ad.id), { active: !ad.active }, { merge: true });
    } catch (err) {
      console.error("Error toggling ad:", err);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm("Are you sure you want to permanently delete this ad?")) return;
    try {
      await deleteDoc(doc(db, 'platform_ads', adId));
    } catch (err) {
      console.error("Error deleting ad:", err);
    }
  };

  return (
    <AdminCard noPadding>
      <AdminHeader 
        title="Ad Injection Engine"
        description="Monetize the platform globally or target specific premium profiles."
        actions={
          <div className="bg-cyan-900/30 text-cyan-300 px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
            {ads.length} Active Slots
          </div>
        }
      />

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Ad Creation Form */}
          <div className="xl:col-span-1">
            <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border border-white/5 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Inject New Ad
              </h3>

              {error && <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm font-bold mb-6 border border-red-500/20">{error}</div>}
              {successMsg && <div className="bg-teal-500/10 text-teal-400 px-4 py-3 rounded-xl text-sm font-bold mb-6 border border-teal-500/20">{successMsg}</div>}

              <form onSubmit={handleInjectAd} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Slot Location</label>
                  <select 
                    value={slotId}
                    onChange={(e) => setSlotId(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    {AD_SLOTS.map(slot => <option key={slot.id} value={slot.id}>{slot.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Target Scope</label>
                  <select 
                    value={targetType}
                    onChange={(e) => { setTargetType(e.target.value as any); setTargetId(''); }}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    <option value="global">Global (Appears everywhere in this slot)</option>
                    <option value="specific_profile">Specific Doctor/Hospital Profile</option>
                  </select>
                </div>

                {targetType === 'specific_profile' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Target Profile ID</label>
                    <input 
                      type="text" 
                      required
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      placeholder="e.g. dr-deepak-kumar..."
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">This ad will OVERRIDE global ads for this specific profile.</p>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Ad Format</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${adType === 'image' ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-white/10 text-slate-400 hover:bg-slate-800'}`}>
                      <input type="radio" name="adType" value="image" checked={adType === 'image'} onChange={() => setAdType('image')} className="sr-only" />
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <span className="font-bold text-sm">Image Banner</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${adType === 'adsense' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/10 text-slate-400 hover:bg-slate-800'}`}>
                      <input type="radio" name="adType" value="adsense" checked={adType === 'adsense'} onChange={() => setAdType('adsense')} className="sr-only" />
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                      <span className="font-bold text-sm">HTML / AdSense</span>
                    </label>
                  </div>
                </div>

                {adType === 'image' ? (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Upload Image</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        required
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                        }}
                        className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-teal-500/20 file:text-teal-400 hover:file:bg-teal-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Click URL (Where it links to)</label>
                      <input 
                        type="url" 
                        required
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://"
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">AdSense or Custom HTML Code</label>
                    <textarea 
                      required
                      value={htmlCode}
                      onChange={(e) => setHtmlCode(e.target.value)}
                      rows={5}
                      placeholder="<script async src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'></script>..."
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                )}

                <div className="pt-4 mt-2">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white px-6 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(13,148,136,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Inject Ad Live
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Ad Inventory Grid */}
          <div className="xl:col-span-2">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              Live Ad Inventory
            </h3>

            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div></div>
            ) : ads.length === 0 ? (
              <div className="bg-slate-800/40 rounded-3xl p-12 text-center border border-white/10 border-dashed">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <h4 className="text-lg font-bold text-white">No Ads Running</h4>
                <p className="text-slate-400">Inject an ad from the panel to start monetizing.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ads.map(ad => (
                  <div key={ad.id} className={`bg-slate-800/40 rounded-2xl border ${ad.active ? 'border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.15)]' : 'border-white/10 opacity-70'} overflow-hidden transition-all`}>
                    <div className="min-h-[160px] bg-slate-900 relative group flex items-center justify-center overflow-hidden">
                      {ad.type === 'image' ? (
                        <img src={ad.imageUrl} alt="Ad Preview" className="w-full h-auto max-h-40 object-contain p-2" />
                      ) : (
                        <div className="p-4 text-xs font-mono text-slate-400 break-all w-full h-full overflow-hidden">
                          {ad.htmlCode}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                        <button 
                          onClick={() => handleToggleActive(ad)}
                          className={`${ad.active ? 'bg-amber-500 hover:bg-amber-400 text-amber-950' : 'bg-teal-500 hover:bg-teal-400 text-white'} px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors`}
                        >
                          {ad.active ? 'Pause Ad' : 'Resume Ad'}
                        </button>
                        <button 
                          onClick={() => handleDeleteAd(ad.id)}
                          className="bg-red-500/80 hover:bg-red-400 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-red-500/50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${ad.type === 'image' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {ad.type === 'image' ? 'Image Banner' : 'HTML / AdSense'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${ad.active ? 'bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.8)]' : 'bg-slate-500'}`}></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ad.active ? 'Live' : 'Paused'}</span>
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-white text-sm truncate" title={AD_SLOTS.find(s => s.id === ad.slotId)?.label || ad.slotId}>
                        {AD_SLOTS.find(s => s.id === ad.slotId)?.label || ad.slotId}
                      </h4>
                      
                      <div className="mt-3 flex items-center gap-2">
                        {ad.targetType === 'global' ? (
                          <span className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded border border-white/10 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Global
                          </span>
                        ) : (
                          <span className="bg-fuchsia-500/10 text-fuchsia-400 px-2 py-1 rounded border border-fuchsia-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            Target: {ad.targetId.substring(0, 10)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </AdminCard>
  );
}
