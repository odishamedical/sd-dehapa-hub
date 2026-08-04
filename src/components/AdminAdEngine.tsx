"use client";

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AdminCard, AdminHeader } from '@/components/admin/ui';

interface AdSlot {
  id: string;
  label: string;
  dimensions?: string;
  group: string;
}

const AD_SLOTS: AdSlot[] = [
  // Homepage
  { id: 'ad_slot_home_carousel', label: 'Main Carousel (Top)', dimensions: '1200x400px (Widescreen)', group: 'Homepage' },
  { id: 'ad_slot_home_grid', label: '3-Ticket Grid (Middle)', dimensions: '800x800px (Square)', group: 'Homepage' },
  { id: 'ad_slot_home_distributed_1', label: 'Distributed Slot 1 (Under Top Doctors)', dimensions: '1200x300px (Widescreen)', group: 'Homepage' },
  { id: 'ad_slot_home_distributed_2', label: 'Distributed Slot 2 (Under Nearby Hospitals)', dimensions: '1200x300px (Widescreen)', group: 'Homepage' },
  { id: 'ad_slot_home_distributed_3', label: 'Distributed Slot 3 (Above Footer)', dimensions: '1200x300px (Widescreen)', group: 'Homepage' },

  // Global Search
  { id: 'ad_slot_directory_top', label: 'Global Search - Top Banner', dimensions: '1200x200px (Widescreen)', group: 'Directory Search' },
  { id: 'ad_slot_directory_sidebar', label: 'Global Search - Left Sidebar', dimensions: '600x800px (Vertical)', group: 'Directory Search' },
  { id: 'ad_slot_directory_bottom', label: 'Global Search - Bottom Banner', dimensions: '1200x200px (Widescreen)', group: 'Directory Search' },

  // Doctors
  { id: 'ad_slot_doctors_list_top', label: 'Doctors Directory - Top Banner', dimensions: '1200x200px (Widescreen)', group: 'Doctors Directory' },
  { id: 'ad_slot_doctors_list_bottom', label: 'Doctors Directory - Bottom Banner', dimensions: '1200x200px (Widescreen)', group: 'Doctors Directory' },
  { id: 'ad_slot_doctor_hero_top', label: 'Doctor Profile - Top Hero', dimensions: '1200x300px (Widescreen)', group: 'Doctor Profiles' },
  { id: 'ad_slot_doctor_hero_right', label: 'Doctor Profile - Right Sidebar', dimensions: '600x600px (Square)', group: 'Doctor Profiles' },
  { id: 'ad_slot_doctor_hero_bottom', label: 'Doctor Profile - Bottom Hero', dimensions: '1200x300px (Widescreen)', group: 'Doctor Profiles' },

  // Hospitals
  { id: 'ad_slot_hospitals_list_top', label: 'Hospitals Directory - Top Banner', dimensions: '1200x200px (Widescreen)', group: 'Hospitals Directory' },
  { id: 'ad_slot_hospitals_list_bottom', label: 'Hospitals Directory - Bottom Banner', dimensions: '1200x200px (Widescreen)', group: 'Hospitals Directory' },
  { id: 'ad_slot_hospital_hero_top', label: 'Hospital Profile - Top Hero', dimensions: '1200x300px (Widescreen)', group: 'Hospital Profiles' },
  { id: 'ad_slot_hospital_hero_right', label: 'Hospital Profile - Right Sidebar', dimensions: '600x600px (Square)', group: 'Hospital Profiles' },
  { id: 'ad_slot_hospital_hero_bottom', label: 'Hospital Profile - Bottom Hero', dimensions: '1200x300px (Widescreen)', group: 'Hospital Profiles' },

  // Pharmacies
  { id: 'ad_slot_pharmacies_list_top', label: 'Pharmacies Directory - Top Banner', dimensions: '1200x200px (Widescreen)', group: 'Pharmacies Directory' },
  { id: 'ad_slot_pharmacies_list_bottom', label: 'Pharmacies Directory - Bottom Banner', dimensions: '1200x200px (Widescreen)', group: 'Pharmacies Directory' },
  { id: 'ad_slot_pharmacy_hero_top', label: 'Pharmacy Profile - Top Hero', dimensions: '1200x300px (Widescreen)', group: 'Pharmacy Profiles' },
  { id: 'ad_slot_pharmacy_hero_right', label: 'Pharmacy Profile - Right Sidebar', dimensions: '600x600px (Square)', group: 'Pharmacy Profiles' },
  { id: 'ad_slot_pharmacy_hero_bottom', label: 'Pharmacy Profile - Bottom Hero', dimensions: '1200x300px (Widescreen)', group: 'Pharmacy Profiles' },

  // Ambulances
  { id: 'ad_slot_ambulances_list_top', label: 'Ambulances Directory - Top Banner', dimensions: '1200x200px (Widescreen)', group: 'Ambulances Directory' },
  { id: 'ad_slot_ambulances_list_bottom', label: 'Ambulances Directory - Bottom Banner', dimensions: '1200x200px (Widescreen)', group: 'Ambulances Directory' },
  { id: 'ad_slot_ambulance_hero_top', label: 'Ambulance Profile - Top Hero', dimensions: '1200x300px (Widescreen)', group: 'Ambulance Profiles' },
  { id: 'ad_slot_ambulance_hero_right', label: 'Ambulance Profile - Right Sidebar', dimensions: '600x600px (Square)', group: 'Ambulance Profiles' },
  { id: 'ad_slot_ambulance_hero_bottom', label: 'Ambulance Profile - Bottom Hero', dimensions: '1200x300px (Widescreen)', group: 'Ambulance Profiles' },

  // Labs
  { id: 'ad_slot_labs_list_top', label: 'Labs Directory - Top Banner', dimensions: '1200x200px (Widescreen)', group: 'Labs Directory' },
  { id: 'ad_slot_labs_list_bottom', label: 'Labs Directory - Bottom Banner', dimensions: '1200x200px (Widescreen)', group: 'Labs Directory' },
  { id: 'ad_slot_lab_hero_top', label: 'Lab Profile - Top Hero', dimensions: '1200x300px (Widescreen)', group: 'Lab Profiles' },
  { id: 'ad_slot_lab_hero_right', label: 'Lab Profile - Right Sidebar', dimensions: '600x600px (Square)', group: 'Lab Profiles' },
  { id: 'ad_slot_lab_hero_bottom', label: 'Lab Profile - Bottom Hero', dimensions: '1200x300px (Widescreen)', group: 'Lab Profiles' }
];

const ITEMS_PER_PAGE = 8;

export default function AdminAdEngine() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout State
  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [slotId, setSlotId] = useState(AD_SLOTS[0].id);
  const [targetType, setTargetType] = useState<'global' | 'category' | 'specific_profile'>('global');
  const [targetId, setTargetId] = useState('');
  const [adType, setAdType] = useState<'image' | 'adsense' | 'split' | 'slider' | 'youtube'>('image');
  const [animationStyle, setAnimationStyle] = useState<'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom'>('fade');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  // Geographic Targeting State
  const [targetCountry, setTargetCountry] = useState("all");
  const [targetState, setTargetState] = useState("all");
  const [targetDistrict, setTargetDistrict] = useState("all");
  const [targetCity, setTargetCity] = useState("all");
  
  // Layout State
  const [layoutSize, setLayoutSize] = useState<'full' | 'half' | 'third' | 'quarter'>('full');
  const [impressionLimitStr, setImpressionLimitStr] = useState("");
  
  // Image Upload State
  const [uploadMode, setUploadMode] = useState<'new' | 'vault'>('new');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]); // For Slider
  const [vaultImageUrl, setVaultImageUrl] = useState('');
  const [vaultImageUrls, setVaultImageUrls] = useState<string[]>([]); // For Slider
  const [linkUrl, setLinkUrl] = useState('');
  
  // Split Layout State
  const [headline, setHeadline] = useState('');
  const [subtext, setSubtext] = useState('');
  const [buttonText, setButtonText] = useState('Learn More');

  // AdSense State
  const [htmlCode, setHtmlCode] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const selectedSlot = AD_SLOTS.find(s => s.id === slotId);

  // Extract unique vault images. Since some ads are sliders with an array of images, flatmap them.
  const vaultImages = Array.from(new Set(ads.flatMap(ad => ad.sliderImages || [ad.imageUrl]).filter(url => Boolean(url))));

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'platform_ads'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort ads by updatedAt descending for the library
      data.sort((a: any, b: any) => {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        return timeB - timeA;
      });
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
      let finalSliderImages: string[] = [];

      if (adType === 'slider') {
        if (uploadMode === 'new') {
          if (imageFiles.length < 2) throw new Error("Please upload at least 2 images for the slider.");
          const uploadPromises = imageFiles.map(async (file, idx) => {
            const fileExt = file.name.split('.').pop();
            const storageRef = ref(storage, `ads/${Date.now()}_${slotId}_${idx}.${fileExt}`);
            const uploadResult = await uploadBytes(storageRef, file);
            return getDownloadURL(uploadResult.ref);
          });
          finalSliderImages = await Promise.all(uploadPromises);
        } else {
          if (vaultImageUrls.length < 2) throw new Error("Please select at least 2 images from the vault.");
          finalSliderImages = vaultImageUrls;
        }
      } else if (adType === 'image' || adType === 'split') {
        if (uploadMode === 'new') {
          if (!imageFile) throw new Error("Please upload an image for the ad.");
          const fileExt = imageFile.name.split('.').pop();
          const storageRef = ref(storage, `ads/${Date.now()}_${slotId}.${fileExt}`);
          const uploadResult = await uploadBytes(storageRef, imageFile);
          finalImageUrl = await getDownloadURL(uploadResult.ref);
        } else {
          if (!vaultImageUrl) throw new Error("Please select an image from the vault.");
          finalImageUrl = vaultImageUrl;
        }
      } else if (adType === 'youtube') {
        if (!youtubeUrl) throw new Error("Please provide a YouTube URL.");
      } else {
        if (!htmlCode) throw new Error("Please paste the AdSense HTML code.");
      }

      // If global, document ID is just the slotId. If specific, it's slotId_targetId
      const docId = targetType === 'global' ? slotId : `${slotId}_${targetId}`;

      const adData: any = {
        slotId,
        targetType,
        targetId: targetType === 'global' ? 'all' : targetId,
        targetCountry,
        targetState,
        targetDistrict,
        targetCity,
        layoutSize,
        impressionLimit: impressionLimitStr ? parseInt(impressionLimitStr) : null,
        type: adType,
        active: true,
        updatedAt: serverTimestamp(),
      };

      if (adType === 'slider') {
        adData.sliderImages = finalSliderImages;
        adData.linkUrl = linkUrl;
        adData.animationStyle = animationStyle;
      } else if (adType === 'image' || adType === 'split') {
        adData.imageUrl = finalImageUrl;
        adData.linkUrl = linkUrl;
      } else if (adType === 'youtube') {
        adData.youtubeUrl = youtubeUrl;
      } else {
        adData.htmlCode = htmlCode;
      }

      if (adType === 'split') {
        adData.headline = headline;
        adData.subtext = subtext;
        adData.buttonText = buttonText;
      }

      await setDoc(doc(db, 'platform_ads', docId), adData);
      
      setSuccessMsg("Ad successfully injected to the platform!");
      setImageFile(null);
      setImageFiles([]);
      setVaultImageUrl('');
      setVaultImageUrls([]);
      setHtmlCode('');
      setHeadline('');
      setSubtext('');
      setButtonText('Learn More');
      setLinkUrl('');
      setYoutubeUrl('');
      setTargetCountry('all');
      setTargetState('all');
      setTargetDistrict('all');
      setTargetCity('all');
      setLayoutSize('full');
      setImpressionLimitStr('');
      
      // Navigate to library after short delay
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('library');
      }, 1500);

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

  const handleDuplicate = (ad: any) => {
    setSlotId(ad.slotId || AD_SLOTS[0].id);
    setTargetType(ad.targetType || 'global');
    setTargetId(ad.targetId === 'all' ? '' : (ad.targetId || ''));
    setAdType(ad.type || 'image');
    setUploadMode('vault');
    if (ad.type === 'slider') {
      setVaultImageUrls(ad.sliderImages || []);
      setAnimationStyle(ad.animationStyle || 'fade');
    } else {
      setVaultImageUrl(ad.imageUrl || '');
    }
    setLinkUrl(ad.linkUrl || '');
    setHtmlCode(ad.htmlCode || '');
    setHeadline(ad.headline || '');
    setSubtext(ad.subtext || '');
    setButtonText(ad.buttonText || 'Learn More');
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination Logic
  const totalPages = Math.ceil(ads.length / ITEMS_PER_PAGE);
  const paginatedAds = ads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Render Ad Preview Block
  const renderAdPreview = (ad: any) => {
    return (
      <div className="min-h-[160px] bg-slate-900 relative group flex items-center justify-center overflow-hidden w-full h-full">
        {ad.type === 'image' ? (
          <img src={ad.imageUrl} alt="Ad Preview" className="w-full h-auto max-h-40 object-contain p-2" />
        ) : ad.type === 'split' ? (
          <div className="flex w-full h-full">
            <div className="w-1/2 h-full flex items-center justify-center p-2">
              <img src={ad.imageUrl} alt="Ad Preview" className="w-full h-auto max-h-40 object-contain" />
            </div>
            <div className="w-1/2 h-full flex flex-col justify-center p-4 bg-slate-800">
              <h5 className="font-bold text-white text-xs truncate">{ad.headline}</h5>
              <p className="text-[10px] text-slate-400 truncate mt-1">{ad.subtext}</p>
              <span className="mt-2 inline-block bg-teal-500 text-white text-[8px] font-bold px-2 py-1 rounded w-fit">{ad.buttonText}</span>
            </div>
          </div>
        ) : ad.type === 'slider' ? (
          <div className="relative w-full h-full p-2 flex items-center justify-center">
            {ad.sliderImages && ad.sliderImages.length > 0 && (
              <img src={ad.sliderImages[0]} alt="Slider Preview" className="w-full h-auto max-h-40 object-contain opacity-50" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-fuchsia-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg border border-fuchsia-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                Slider ({ad.sliderImages?.length || 0} Images)
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 text-xs font-mono text-slate-400 break-all w-full h-full overflow-hidden">
            {ad.htmlCode}
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminCard noPadding>
      <AdminHeader 
        title="Ad Injection Engine"
        description="Monetize the platform globally or target specific premium profiles."
        actions={
          <div className="bg-cyan-900/30 text-cyan-300 px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
            {ads.filter(a => a.active).length} Active Slots
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex px-6 md:px-8 mt-6 border-b border-white/10 gap-8">
        <button 
          onClick={() => setActiveTab('create')}
          className={`pb-4 font-bold text-sm tracking-wider uppercase transition-colors flex items-center gap-2 relative ${activeTab === 'create' ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          Create Campaign
          {activeTab === 'create' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-t-full shadow-[0_0_10px_rgba(45,212,191,0.8)]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          className={`pb-4 font-bold text-sm tracking-wider uppercase transition-colors flex items-center gap-2 relative ${activeTab === 'library' ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          Ad Library ({ads.length})
          {activeTab === 'library' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-t-full shadow-[0_0_10px_rgba(45,212,191,0.8)]"></div>}
        </button>
      </div>

      <div className="p-6 md:p-8">
        
        {/* --- TAB 1: CREATE CAMPAIGN --- */}
        {activeTab === 'create' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-white/5">
              
              {error && <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm font-bold mb-6 border border-red-500/20">{error}</div>}
              {successMsg && <div className="bg-teal-500/10 text-teal-400 px-4 py-3 rounded-xl text-sm font-bold mb-6 border border-teal-500/20">{successMsg}</div>}

              <form onSubmit={handleInjectAd} className="space-y-8">
                
                {/* STEP 1: TARGETING */}
                <div>
                  <h4 className="text-teal-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">1</span>
                    Targeting (Where & Who)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>Slot Location</span>
                        {selectedSlot?.dimensions && <span className="text-teal-400 hidden sm:inline">{selectedSlot.dimensions}</span>}
                      </label>
                      <select 
                        value={slotId}
                        onChange={(e) => setSlotId(e.target.value)}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                      >
                        {Array.from(new Set(AD_SLOTS.map(s => s.group))).map(group => (
                          <optgroup key={group} label={group} className="text-slate-400 font-bold bg-slate-900">
                            {AD_SLOTS.filter(s => s.group === group).map(slot => (
                              <option key={slot.id} value={slot.id} className="text-white">{slot.label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      {selectedSlot?.dimensions && <p className="text-teal-400 text-[10px] mt-1 sm:hidden">{selectedSlot.dimensions}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Target Scope</label>
                      <select 
                        value={targetType}
                        onChange={(e) => { setTargetType(e.target.value as any); setTargetId(''); }}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                      >
                        <option value="global">Global (Appears everywhere in this slot)</option>
                        <option value="category">Specific Category/Specialty</option>
                        <option value="specific_profile">Specific Doctor/Hospital/Pharmacy Profile</option>
                      </select>
                    </div>

                    {(targetType === 'specific_profile' || targetType === 'category') && (
                      <div className="animate-in fade-in slide-in-from-top-2 md:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                          {targetType === 'category' ? 'Target Category (e.g. Cardiologist, 24/7)' : 'Target Profile ID (e.g. dr-deepak-kumar)'}
                        </label>
                        <input 
                          type="text" 
                          required
                          value={targetId}
                          onChange={(e) => setTargetId(e.target.value)}
                          placeholder={targetType === 'category' ? 'e.g. Cardiologist' : 'e.g. dr-deepak-kumar...'}
                          className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">This ad will OVERRIDE global ads for this specific target.</p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Target Country</label>
                      <select value={targetCountry} onChange={(e) => setTargetCountry(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-teal-500 outline-none">
                        <option value="all">Global / All Countries</option>
                        <option value="India">India</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Target State</label>
                      <input type="text" value={targetState} onChange={(e) => setTargetState(e.target.value)} placeholder="e.g. Odisha or 'all'" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-teal-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Target District</label>
                      <input type="text" value={targetDistrict} onChange={(e) => setTargetDistrict(e.target.value)} placeholder="e.g. Khordha or 'all'" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-teal-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Target City</label>
                      <input type="text" value={targetCity} onChange={(e) => setTargetCity(e.target.value)} placeholder="e.g. Bhubaneswar or 'all'" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-teal-500 outline-none" />
                    </div>
                  </div>
                </div>

                <hr className="border-white/10" />

                {/* STEP 2: FORMAT & CREATIVE */}
                <div>
                  <h4 className="text-teal-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">2</span>
                    Ad Format & Creative
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <label className={`flex flex-col items-center justify-center text-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${adType === 'image' ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-white/10 text-slate-400 hover:bg-slate-800'}`}>
                      <input type="radio" name="adType" value="image" checked={adType === 'image'} onChange={() => setAdType('image')} className="sr-only" />
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <span className="font-bold text-xs">Image Banner</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center text-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${adType === 'split' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-white/10 text-slate-400 hover:bg-slate-800'}`}>
                      <input type="radio" name="adType" value="split" checked={adType === 'split'} onChange={() => setAdType('split')} className="sr-only" />
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
                      <span className="font-bold text-[10px] leading-tight">Split Layout<br/>(50/50)</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center text-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${adType === 'slider' ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400' : 'border-white/10 text-slate-400 hover:bg-slate-800'}`}>
                      <input type="radio" name="adType" value="slider" checked={adType === 'slider'} onChange={() => setAdType('slider')} className="sr-only" />
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                      <span className="font-bold text-[10px] leading-tight">Animated Slider</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center text-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${adType === 'youtube' ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-white/10 text-slate-400 hover:bg-slate-800'}`}>
                      <input type="radio" name="adType" value="youtube" checked={adType === 'youtube'} onChange={() => setAdType('youtube')} className="sr-only" />
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span className="font-bold text-xs">YouTube</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center text-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${adType === 'adsense' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/10 text-slate-400 hover:bg-slate-800'}`}>
                      <input type="radio" name="adType" value="adsense" checked={adType === 'adsense'} onChange={() => setAdType('adsense')} className="sr-only" />
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                      <span className="font-bold text-xs">AdSense</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Layout Size / Screen Width</label>
                      <select value={layoutSize} onChange={(e) => setLayoutSize(e.target.value as any)} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-teal-500 outline-none">
                        <option value="full">Full Width (100%)</option>
                        <option value="half">Half Width (50%)</option>
                        <option value="third">One Third (33%)</option>
                        <option value="quarter">One Quarter (25%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Impression Limit (Optional)</label>
                      <input type="number" value={impressionLimitStr} onChange={(e) => setImpressionLimitStr(e.target.value)} placeholder="e.g. 10000 views (Leave empty for infinite)" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-teal-500 outline-none" />
                    </div>
                  </div>

                  {adType === 'youtube' && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">YouTube Video URL</label>
                      <input 
                        type="url" 
                        required
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-red-500 outline-none"
                      />
                      <p className="text-[10px] text-slate-500 mt-2">Paste the full YouTube link. It will automatically be embedded securely.</p>
                    </div>
                  )}

                  {adType === 'slider' && (
                    <div className="animate-in fade-in slide-in-from-top-2 mb-6 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-2xl p-6">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Animation Style</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {['fade', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'zoom'].map((style) => (
                          <label key={style} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${animationStyle === style ? 'border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-400' : 'border-white/10 text-slate-400 hover:bg-slate-800'}`}>
                            <input type="radio" name="animationStyle" value={style} checked={animationStyle === style} onChange={() => setAnimationStyle(style as any)} className="sr-only" />
                            <span className="font-bold text-xs capitalize">{style.replace('-', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {adType === 'image' || adType === 'split' || adType === 'slider' ? (
                    <div className="space-y-6 animate-in fade-in">
                      
                      <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6">
                        <div className="flex bg-slate-900 rounded-lg p-1 border border-white/5 w-fit mb-4 mx-auto sm:mx-0">
                          <button 
                            type="button"
                            onClick={() => setUploadMode('new')}
                            className={`px-6 py-2 rounded-md text-xs font-bold transition-colors ${uploadMode === 'new' ? 'bg-white/10 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                          >
                            Upload New
                          </button>
                          <button 
                            type="button"
                            onClick={() => setUploadMode('vault')}
                            className={`px-6 py-2 rounded-md text-xs font-bold transition-colors ${uploadMode === 'vault' ? 'bg-white/10 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                          >
                            Media Vault
                          </button>
                        </div>

                        {uploadMode === 'new' ? (
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex justify-between">
                              <span>Upload Image{adType === 'slider' ? 's (Select Multiple)' : ''}</span>
                              {adType === 'slider' && imageFiles.length > 0 && <span className="text-fuchsia-400">{imageFiles.length} selected</span>}
                            </label>
                            <input 
                              type="file" 
                              accept="image/*"
                              multiple={adType === 'slider'}
                              required={uploadMode === 'new' && (adType === 'slider' ? imageFiles.length === 0 : !imageFile)}
                              onChange={(e) => {
                                if (e.target.files) {
                                  if (adType === 'slider') {
                                    setImageFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
                                  } else {
                                    setImageFile(e.target.files[0]);
                                  }
                                }
                                e.target.value = ''; // Reset input to allow selecting same file again if removed
                              }}
                              className="w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-teal-500/20 file:text-teal-400 hover:file:bg-teal-500/30 transition-colors cursor-pointer border border-white/5 bg-slate-900/50 p-2 rounded-2xl"
                            />
                            {adType === 'slider' && imageFiles.length > 0 && (
                              <div className="mt-4 space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Selected Sequence</label>
                                <div className="flex flex-wrap gap-2">
                                  {imageFiles.map((file, idx) => (
                                    <div key={idx} className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-slate-300">
                                      <span className="bg-fuchsia-500/20 text-fuchsia-400 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                                      <span className="truncate max-w-[100px]">{file.name}</span>
                                      <button type="button" onClick={() => setImageFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 ml-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {adType !== 'slider' && imageFile && (
                              <div className="mt-2 text-xs text-teal-400 font-bold">{imageFile.name}</div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex justify-between">
                              <span>Select from Vault</span>
                              {adType === 'slider' && vaultImageUrls.length > 0 && <span className="text-fuchsia-400">{vaultImageUrls.length} selected</span>}
                            </label>
                            {vaultImages.length === 0 ? (
                              <p className="text-xs text-slate-500 italic p-4 bg-slate-900 rounded-xl text-center">No previous images found in the vault.</p>
                            ) : (
                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {vaultImages.map((url, i) => {
                                  const isSelected = adType === 'slider' ? vaultImageUrls.includes(url) : vaultImageUrl === url;
                                  return (
                                    <button 
                                      type="button" 
                                      key={i} 
                                      onClick={() => {
                                        if (adType === 'slider') {
                                          setVaultImageUrls(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
                                        } else {
                                          setVaultImageUrl(url);
                                        }
                                      }}
                                      className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all group ${isSelected ? 'border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)] scale-105 z-10' : 'border-transparent hover:border-white/30 hover:scale-105'}`}
                                    >
                                      <img src={url} alt={`Vault Image ${i}`} className="w-full h-full object-cover" />
                                      {isSelected && adType === 'slider' && (
                                        <div className="absolute top-1 right-1 bg-teal-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                                          {vaultImageUrls.indexOf(url) + 1}
                                        </div>
                                      )}
                                      {!isSelected && (
                                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                         </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {adType === 'split' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Headline</label>
                            <input type="text" required value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="E.g., 50% Off Full Body Checkup" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Subtext</label>
                            <input type="text" required value={subtext} onChange={(e) => setSubtext(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Valid until Friday. Walk-ins welcome." />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Button Text</label>
                            <input type="text" required value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Learn More" />
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Click URL (Where it links to)</label>
                        <input 
                          type="url" 
                          required
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://..."
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
                        rows={6}
                        placeholder="<script async src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'></script>..."
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-4 text-sm font-mono text-emerald-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  )}
                </div>

                <hr className="border-white/10" />

                {/* STEP 3: ACTION */}
                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white px-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(13,148,136,0.4)] hover:shadow-[0_0_30px_rgba(13,148,136,0.6)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
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

            {/* Recently Injected */}
            {ads.length > 0 && (
              <div className="mt-12">
                <h4 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Recently Injected</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {ads.slice(0, 3).map(ad => (
                    <div key={ad.id} className="bg-slate-800/40 rounded-2xl border border-white/5 overflow-hidden flex flex-col h-32 opacity-80 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setActiveTab('library')}>
                       {renderAdPreview(ad)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


        {/* --- TAB 2: AD LIBRARY --- */}
        {activeTab === 'library' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div></div>
            ) : ads.length === 0 ? (
              <div className="bg-slate-800/40 rounded-3xl p-16 text-center border border-white/10 border-dashed max-w-2xl mx-auto mt-10">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <h4 className="text-xl font-black text-white mb-2">Library is Empty</h4>
                <p className="text-slate-400 mb-8">You haven't injected any ads yet. Switch to the Create Campaign tab to get started.</p>
                <button onClick={() => setActiveTab('create')} className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors text-sm uppercase tracking-wider">
                  Create Campaign
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {paginatedAds.map(ad => (
                    <div key={ad.id} className={`bg-slate-800/40 rounded-2xl border flex flex-col ${ad.active ? 'border-teal-500/30 shadow-[0_5px_15px_rgba(20,184,166,0.1)]' : 'border-white/5 opacity-75 grayscale-[30%]'} overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1`}>
                      
                      {/* Preview Region */}
                      <div className="h-[140px] border-b border-white/5 bg-slate-900 group relative">
                        {renderAdPreview(ad)}
                        {/* Hover Overlay for Quick Actions */}
                        <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm z-30">
                          <button onClick={() => handleDuplicate(ad)} className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 w-32 justify-center shadow-lg">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            Duplicate
                          </button>
                          <button onClick={() => handleDeleteAd(ad.id)} className="bg-red-500/80 hover:bg-red-400 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 w-32 justify-center shadow-lg">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      {/* Meta Region */}
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${ad.type === 'image' ? 'bg-indigo-500/20 text-indigo-300' : ad.type === 'split' ? 'bg-teal-500/20 text-teal-300' : ad.type === 'slider' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-amber-500/20 text-amber-300'}`}>
                            {ad.type}
                          </span>
                          
                          <button 
                            onClick={() => handleToggleActive(ad)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors ${ad.active ? 'bg-teal-500/10 border-teal-500/30 text-teal-400 hover:bg-teal-500/20' : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                            title={ad.active ? "Click to Pause" : "Click to Resume"}
                          >
                            <div className={`w-2 h-2 rounded-full ${ad.active ? 'bg-teal-400 animate-pulse' : 'bg-slate-500'}`}></div>
                            <span className="text-[9px] font-bold uppercase tracking-widest">{ad.active ? 'Live' : 'Paused'}</span>
                          </button>
                        </div>
                        
                        <h4 className="font-bold text-white text-xs leading-tight mb-2 line-clamp-2" title={AD_SLOTS.find(s => s.id === ad.slotId)?.label || ad.slotId}>
                          {AD_SLOTS.find(s => s.id === ad.slotId)?.label || ad.slotId}
                        </h4>
                        
                        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"></path></svg>
                            {ad.targetType === 'global' ? 'Global' : 'Specific'}
                          </div>
                          <span>
                            {ad.updatedAt?.toDate ? ad.updatedAt.toDate().toLocaleDateString() : 'Just now'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none transition-colors border border-white/5"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 rounded-xl font-bold text-sm transition-colors border ${currentPage === i + 1 ? 'bg-teal-500/20 text-teal-400 border-teal-500/50' : 'bg-slate-800 text-slate-400 border-white/5 hover:bg-slate-700 hover:text-white'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none transition-colors border border-white/5"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminCard>
  );
}
