"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { db, storage } from '@/lib/firebase';
import { collection, doc, updateDoc, setDoc, serverTimestamp, getDocs, getDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PremiumSlugModal from '@/components/PremiumSlugModal';
import AddressBlock from '@/components/AddressBlock';
import ImageCropper from '@/components/ImageCropper';
import InlineEditArray from '@/components/InlineEditArray';
import ObjectArrayEditor from '@/components/ObjectArrayEditor';
import { directoryConfig } from '@/lib/directoryConfig';

interface CRMFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: any;
  isNew: boolean;
  onSaveSuccess: () => void;
}

export function CRMFormDrawer({ isOpen, onClose, selectedItem: initialItem, isNew, onSaveSuccess }: CRMFormDrawerProps) {
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [sentInvite, setSentInvite] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  
  // Advanced features state
  const [dynamicFields, setDynamicFields] = useState<{label: string, value: string}[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [qualificationsList, setQualificationsList] = useState<any[]>([]);
  const [research, setResearch] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [healthPackages, setHealthPackages] = useState<any[]>([]);

  // Slug & Image State
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<{status: 'idle' | 'checking' | 'available' | 'taken', message: string}>({status: 'idle', message: ''});
  const [isSlugModalOpen, setIsSlugModalOpen] = useState(false);
  const [imageFileToCrop, setImageFileToCrop] = useState<File | null>(null);
  const [imageUrlToCrop, setImageUrlToCrop] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialItem) {
      setSelectedListing({ ...initialItem });
      setActiveTab("basic");
      setDynamicFields(initialItem.customFields || []);
      setLocations(initialItem.locations || []);
      setExperiences(initialItem.experiences || []);
      setQualificationsList(initialItem.qualificationsList || []);
      setResearch(initialItem.research || []);
      setAwards(initialItem.awards || []);
      setDepartments(initialItem.departments || []);
      setHealthPackages(initialItem.healthPackages || []);
      setSlugAvailability({status: 'idle', message: ''});
    }
  }, [isOpen, initialItem]);

  // Prevent background scrolling when modal is open
  const [leadStatus, setLeadStatus] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Load current item
      if (initialItem) {
        setSelectedListing(initialItem);
        setActiveTab("basic");
        setSentInvite('idle');
        setDynamicFields(initialItem.customFields || []);
        setLocations(initialItem.locations || []);
        setExperiences(initialItem.experiences || []);
        setQualificationsList(initialItem.qualificationsList || []);
        setResearch(initialItem.research || []);
        setAwards(initialItem.awards || []);
        setDepartments(initialItem.departments || []);
        setHealthPackages(initialItem.healthPackages || []);
        setSlugAvailability({status: 'idle', message: ''});
      } else if (isNew) {
        setSelectedListing({
          id: `NEW_${Date.now()}`,
          name: '',
          category: 'Doctor',
          isPublished: false,
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: ''
        });
        setActiveTab("basic");
        setSentInvite('idle');
        setDynamicFields([]);
        setLocations([]);
        setExperiences([]);
        setQualificationsList([]);
        setResearch([]);
        setAwards([]);
        setDepartments([]);
        setHealthPackages([]);
        setSlugAvailability({status: 'idle', message: ''});
      }
    } else {
      setLeadStatus(null);
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, initialItem, isNew]);

  useEffect(() => {
    const targetPhone = selectedListing?.whatsappNumber || selectedListing?.phone;
    if (isOpen && targetPhone) {
      const firstPhone = String(targetPhone).split(/[,/|&-]/)[0];
      let cleanPhone = firstPhone.replace(/\D/g, '');
      if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
      const finalPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
      
      let unsub: any = null;
      const setupListener = async () => {
        const { onSnapshot, doc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        unsub = onSnapshot(doc(db, 'outreach_leads', finalPhone), (docSnap) => {
          if (docSnap.exists()) {
            setLeadStatus(docSnap.data());
          } else {
            setLeadStatus(null);
          }
        });
      };
      setupListener();
      
      return () => {
        if (unsub) unsub();
      };
    }
  }, [isOpen, selectedListing?.phone, selectedListing?.whatsappNumber]);

  const handleSendWhatsAppInvite = async () => {
    const targetPhone = selectedListing?.whatsappNumber || selectedListing?.phone;
    if (!targetPhone) {
      alert("This listing has no phone number or WhatsApp number.");
      return;
    }
    
    if (!confirm(`Send WhatsApp Invite to ${selectedListing.name} at ${targetPhone}?`)) return;

    const firstPhone = String(targetPhone).split(/[,/|&-]/)[0];
    let cleanPhone = firstPhone.replace(/\D/g, '');
    if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    
    try {
      const docRef = doc(db, 'outreach_leads', cleanPhone);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const confirmResend = confirm("You have already sent an invite to this number in the past! Are you sure you want to resend it?");
        if (!confirmResend) return;
      }
      
      setSentInvite('sending');
      
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: cleanPhone, 
          messageType: 'template',
          templateName: 'claim_your_dehapa_profile',
          parameters: [selectedListing.name],
          buttonUrlParameter: cleanPhone
        })
      });
      const data = await res.json();
      if (!res.ok) {
        const detailMsg = data.details ? (typeof data.details === 'string' ? data.details : JSON.stringify(data.details)) : "";
        throw new Error((data.error || "Failed to send WhatsApp message") + (detailMsg ? "\n\nDetails: " + detailMsg : ""));
      }
      
      await setDoc(docRef, {
        businessName: selectedListing.name,
        phone: cleanPhone,
        status: 'invited',
        sentAt: new Date().toISOString()
      });
      
      setSentInvite('success');
    } catch (err: any) {
      alert("Error: " + err.message);
      setSentInvite('error');
    }
  };

  const uniqueCategories = ['Doctor', 'Hospital', 'Pharmacy', 'Lab', 'Ambulance', 'Clinic'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedListing) return;
    setImageFileToCrop(e.target.files[0]);
    setImageUrlToCrop(null);
    e.target.value = ''; 
  };

  const handleRawImageClick = (url: string) => {
    setImageUrlToCrop(url);
    setImageFileToCrop(null);
  };

  const handleCroppedImage = async (croppedBlob: Blob, isPrimary: boolean) => {
    if (!selectedListing) return;
    setImageFileToCrop(null);
    setImageUrlToCrop(null);
    setIsUploadingImage(true);
    try {
      const fileExt = "jpg";
      const fileName = `${isPrimary ? 'profile' : 'gallery'}_crop_${Date.now()}.${fileExt}`;
      const fileRef = ref(storage, `directory/${selectedListing.id || Date.now()}/${fileName}`);
      await uploadBytes(fileRef, croppedBlob);
      const url = await getDownloadURL(fileRef);
      
      if (isPrimary) {
        setSelectedListing({ ...selectedListing, image: url });
      } else {
        const existingGallery = selectedListing.galleryImages || [];
        setSelectedListing({ ...selectedListing, galleryImages: [...existingGallery, url] });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload cropped image");
    }
    setIsUploadingImage(false);
  };

  const checkSlugAvailability = async () => {
    if (!selectedListing?.customSlug) return;
    setIsCheckingSlug(true);
    setSlugAvailability({status: 'checking', message: 'Checking availability...'});
    try {
      const q = query(collection(db, 'directory'), where("customSlug", "==", selectedListing.customSlug.toLowerCase()));
      const snap = await getDocs(q);
      const takenByOthers = snap.docs.filter(doc => doc.id !== selectedListing.id);
      
      if (takenByOthers.length === 0) {
        setSlugAvailability({status: 'available', message: 'Available! You can use this slug.'});
      } else {
        setSlugAvailability({status: 'taken', message: 'Taken! This slug is already in use.'});
      }
    } catch (err) {
      console.error(err);
      setSlugAvailability({status: 'idle', message: 'Error checking slug.'});
    }
    setIsCheckingSlug(false);
  };

  const handleArrayChange = (setter: any, array: any[], index: number, key: string, val: string) => {
    const newArr = [...array];
    newArr[index][key] = val;
    setter(newArr);
  };

  const generateMagicLink = () => {
    if (!selectedListing || !selectedListing.id) return;
    if (selectedListing.id.startsWith("NEW_")) {
      alert("Please Save the listing first before generating a link.");
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dehapa.com';
    const link = `${origin}/invite/${selectedListing.id}`;
    navigator.clipboard.writeText(link);
    alert(`Magic Link Copied!\n\n${link}\n\nSend this via WhatsApp. When the doctor clicks it, they will instantly take ownership of this profile.`);
  };

  const handleInstantVerify = () => {
    if (!selectedListing?.assignedOwnerEmail) {
      alert("Please enter an email address first.");
      return;
    }
    setSelectedListing({
      ...selectedListing,
      ownerEmail: selectedListing.assignedOwnerEmail.toLowerCase().trim(),
      verified: true
    });
    alert("Listing marked as Verified and Assigned! Please click 'Save Changes' below to permanently save to the database.");
  };

  const handleSave = async () => {
    if (!selectedListing) return;
    setIsSaving(true);
    try {
      const cleanDynamicFields = dynamicFields.filter(f => f.label.trim() !== "" && f.value.trim() !== "");
      const cleanLocations = locations.filter(l => l.clinicName?.trim() !== "");
      const cleanExperiences = experiences.filter(e => e.role?.trim() !== "" || e.hospital?.trim() !== "");
      const cleanQualifications = qualificationsList.filter(q => q.degree?.trim() !== "");
      const cleanResearch = research.filter(r => r.title?.trim() !== "");
      const cleanAwards = awards.filter(a => a.name?.trim() !== "");
      
      const updatedData = {
        name: selectedListing.name || "",
        phone: selectedListing.phone || "",
        address: selectedListing.address || "",
        category: selectedListing.category || "",
        subCategory: selectedListing.subCategory || "",
        city: selectedListing.city || "",
        district: selectedListing.district || "",
        verified: selectedListing.verified || false,
        isPublished: selectedListing.isPublished !== undefined ? selectedListing.isPublished : true,
        adminLocked: selectedListing.adminLocked || false,
        customSlug: selectedListing.customSlug?.trim() || "",
        videoFee: selectedListing.videoFee || "",
        consultationFee: selectedListing.consultationFee || "",
        launchFee: selectedListing.launchFee || "",
        isTestAccount: selectedListing.isTestAccount || false,
        clinicName: selectedListing.clinicName || "",
        ...selectedListing,
        customFields: cleanDynamicFields,
        locations: cleanLocations,
        experiences: cleanExperiences,
        qualificationsList: cleanQualifications,
        research: cleanResearch,
        awards: cleanAwards,
        departments: departments.filter(d => d.name?.trim() !== ""),
        healthPackages: healthPackages.filter(h => h.packageName?.trim() !== ""),
        galleryImages: selectedListing.galleryImages || [],
        rawImages: selectedListing.rawImages || [],
        youtubeLinks: selectedListing.youtubeLinks || [],
        totalBeds: selectedListing.totalBeds || "",
        icuCapacity: selectedListing.icuCapacity || "",
        emergencyServices: selectedListing.emergencyServices || "",
        updatedAt: serverTimestamp()
      };

      if (isNew) {
        const newRef = doc(collection(db, 'directory'));
        const fullData = {
          ...updatedData,
          source: 'manual_entry',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await setDoc(newRef, fullData);
        
        if (updatedData.phone) {
          try {
            const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dehapa.com';
            const profileSlug = updatedData.customSlug || newRef.id;
            const profileUrl = `${origin}/directory/${profileSlug}`;
            const displayName = updatedData.category === 'Doctor' ? `Dr. ${updatedData.name}` : updatedData.name;
            
            fetch('/api/whatsapp/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                to: updatedData.phone, 
                messageType: 'template',
                templateName: 'dehapa_listing_notice',
                parameters: [displayName, profileUrl]
              })
            }).catch(err => console.error('WhatsApp auto-invite error:', err));
          } catch (e) {
            console.error('WhatsApp invite block error:', e);
          }
        }
      } else {
        const ref = doc(db, 'directory', selectedListing.id);
        await updateDoc(ref, { ...updatedData, updatedAt: new Date() });
      }

      // Automatically upgrade user role in the global users table if verified
      if (updatedData.ownerEmail && updatedData.verified) {
        try {
          const userRole = updatedData.category === 'Doctor' ? 'Doctor' : 
                           updatedData.category === 'Hospital' ? 'Hospital' : 
                           updatedData.category === 'Lab' ? 'Lab' : 
                           updatedData.category === 'Pharmacy' ? 'Pharmacy' : 'Member';
                           
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', updatedData.ownerEmail));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            const userDoc = snapshot.docs[0];
            await updateDoc(doc(db, 'users', userDoc.id), { role: userRole });
          } else {
            // Create placeholder user so they have the role when they eventually sign up
            const cleanId = updatedData.ownerEmail.replace(/[^a-zA-Z0-9@.]/g, '');
            await setDoc(doc(db, 'users', cleanId), {
              email: updatedData.ownerEmail,
              name: updatedData.name,
              role: userRole,
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date()
            }, { merge: true });
          }
        } catch (roleErr) {
          console.error("Failed to upgrade user role:", roleErr);
        }
      }

      onSaveSuccess();
    } catch (e) {
      console.error("FULL SAVE ERROR:", e);
      alert(`Failed to save listing: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
    setIsSaving(false);
  };

  if (!isOpen || !selectedListing) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
      <div className="bg-[#0B1121] border-l border-slate-800 w-full max-w-4xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-indigo-500/5 to-transparent pointer-events-none z-0"></div>
        
        <div className="p-6 border-b border-slate-800/60 flex justify-between items-center shrink-0 bg-slate-900/80 backdrop-blur-xl shadow-md z-10 relative">
          <h3 className="font-bold text-2xl font-serif text-white drop-shadow-md">{isNew ? "New Record" : selectedListing.name}</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        {/* TABS HEADER */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-8 pt-4 gap-6 shrink-0 overflow-x-auto no-scrollbar relative z-10">
          <button 
            onClick={() => setActiveTab('basic')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'basic' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Basic Info
          </button>
          <button 
            onClick={() => setActiveTab('locations')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'locations' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Locations & Clinics
          </button>
          {selectedListing.category && (directoryConfig as any)[selectedListing.category]?.tabs?.filter((t: any) => t.id !== 'basic').map((tab: any) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
          
          {activeTab === 'basic' && (
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2 flex items-start gap-8 bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 shadow-sm">
                <div className="w-32 h-32 rounded-2xl bg-slate-900/50 flex items-center justify-center border-2 border-dashed border-slate-600 overflow-hidden shrink-0 relative">
                  {selectedListing.image ? (
                    <img src={selectedListing.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  )}
                  {isUploadingImage && <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center"><svg className="animate-spin w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>}
                </div>
                <div className="flex-1">
                  <label className="text-sm font-bold text-slate-300 block mb-1">Profile Image</label>
                  <p className="text-xs text-slate-500 mb-3">Upload a high quality square image. Maximum 2MB.</p>
                  <div className="flex gap-3">
                    <label className="px-5 py-2.5 bg-slate-800 border-2 border-slate-700 hover:border-teal-500 rounded-xl text-sm font-bold text-slate-300 cursor-pointer transition-colors shadow-sm inline-block">
                      {isUploadingImage ? 'Uploading...' : 'Upload / Edit Image'}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                    </label>
                    {selectedListing.image && (
                      <button onClick={() => setSelectedListing({...selectedListing, image: null})} className="px-5 py-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl text-sm font-bold transition-colors">
                        Remove Primary
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {selectedListing.rawImages && selectedListing.rawImages.length > 0 && (
                <div className="col-span-2 bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-sm mt-4">
                  <h4 className="font-bold text-white mb-2">Scraped Images (Crawler)</h4>
                  <p className="text-xs text-slate-400 mb-4">Click any image to crop it and set as Primary or add to Gallery.</p>
                  <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {selectedListing.rawImages.map((rawUrl: string, idx: number) => (
                      <div key={idx} onClick={() => handleRawImageClick(rawUrl)} className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border-2 border-slate-700 hover:border-teal-500 cursor-pointer shadow-sm transition-all hover:scale-105">
                        <Image src={rawUrl} alt={`Scraped ${idx}`} fill sizes="96px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedListing.galleryImages && selectedListing.galleryImages.length > 0 && (
                <div className="col-span-2 bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-sm mt-4">
                  <h4 className="font-bold text-slate-200 mb-4">Gallery Images</h4>
                  <div className="flex flex-wrap gap-4">
                    {selectedListing.galleryImages.map((galUrl: string, idx: number) => (
                      <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-600 shadow-sm group">
                        <img src={galUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              const newGal = [...selectedListing.galleryImages];
                              newGal.splice(idx, 1);
                              setSelectedListing({...selectedListing, galleryImages: newGal});
                            }}
                            className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Name</label>
                <input type="text" value={selectedListing.name || ""} onChange={e => setSelectedListing({...selectedListing, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Owner Email</label>
                  {selectedListing.verified && selectedListing.ownerEmail === selectedListing.assignedOwnerEmail && selectedListing.assignedOwnerEmail ? (
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Verified</span>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={selectedListing.assignedOwnerEmail || ""} onChange={e => setSelectedListing({...selectedListing, assignedOwnerEmail: e.target.value})} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" placeholder="e.g. user@example.com" />
                  <button onClick={handleInstantVerify} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap shadow-[0_4px_15px_rgba(13,148,136,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Verify</button>
                </div>
              </div>
              <div className="relative flex flex-col justify-end">
                <button 
                  onClick={generateMagicLink}
                  className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-4 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  Copy Magic Invite Link
                </button>
                {selectedListing.phone && (() => {
                  const isRead = leadStatus?.deliveryStatus === 'read';
                  const isDelivered = leadStatus?.deliveryStatus === 'delivered';
                  const isSent = leadStatus?.deliveryStatus === 'sent' || leadStatus?.status === 'invited' || sentInvite === 'success';

                  return (
                    <button 
                      onClick={handleSendWhatsAppInvite} 
                      disabled={sentInvite === 'sending'}
                      className={`w-full font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 py-3.5 rounded-xl shadow-lg transition-all border ${
                        isRead ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' : 
                        isDelivered ? 'text-slate-300 bg-slate-700/50 border-slate-600' :
                        isSent ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30' :
                        'text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 border-emerald-500/30 hover:border-emerald-500'
                      }`}
                    >
                      {isRead ? (
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7M5 19l4 4L19 13" /></svg>
                      ) : isDelivered ? (
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7M5 19l4 4L19 13" /></svg>
                      ) : isSent ? (
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      )}
                      {sentInvite === 'sending' ? 'Sending...' : 
                       isRead ? 'WhatsApp Invite Read' : 
                       isDelivered ? 'WhatsApp Invite Delivered' : 
                       isSent ? 'WhatsApp Invite Sent' : 
                       'Send WhatsApp Invite'}
                    </button>
                  );
                })()}
                <p className="text-[10px] text-slate-500 mt-2 text-center">Ghost Onboarding: Send link via WhatsApp to auto-assign profile.</p>
              </div>
              <div className="relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Custom Slug</label>
                <div className="flex gap-2">
                  <input type="text" value={selectedListing.customSlug || ""} onChange={e => setSelectedListing({...selectedListing, customSlug: e.target.value.trim()})} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" />
                  <button onClick={checkSlugAvailability} className="bg-slate-800 text-white px-4 py-1 rounded-lg text-sm font-bold">Check</button>
                  <button onClick={() => setIsSlugModalOpen(true)} className="bg-teal-600 text-white px-4 py-1 rounded-lg text-sm font-bold whitespace-nowrap">Super Search</button>
                </div>
              </div>
              
              {/* Vault Storage Metrics (Read-only) */}
              <div className="col-span-1 md:col-span-2 bg-slate-900/50 border border-white/5 rounded-xl p-5 shadow-inner flex flex-wrap gap-8 items-center backdrop-blur-md">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Vault Storage Usage</div>
                  <div className="text-2xl font-black text-slate-200 flex items-end gap-2">
                    {selectedListing.vaultFilesStored || 0} <span className="text-sm font-medium text-slate-400 mb-1">Files</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Vault Network Forwards</div>
                  <div className="text-2xl font-black text-slate-200 flex items-end gap-2">
                    {selectedListing.vaultFilesSent || 0} <span className="text-sm font-medium text-slate-400 mb-1">Sent</span>
                  </div>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-3 py-1.5 rounded-lg border border-amber-500/30">
                    Tiered Billing Data
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Phone</label>
                  <input type="text" value={selectedListing.phone || ""} onChange={e => setSelectedListing({...selectedListing, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">WhatsApp Number</label>
                  <input type="text" value={selectedListing.whatsappNumber || ""} onChange={e => setSelectedListing({...selectedListing, whatsappNumber: e.target.value})} placeholder="Same as Phone if empty" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Category</label>
                <input 
                  type="text" 
                  list="categoriesList"
                  value={selectedListing.category || ""} 
                  onChange={e => setSelectedListing({...selectedListing, category: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" 
                  placeholder="Type or select a category"
                />
                <datalist id="categoriesList">
                  {uniqueCategories.map((cat: any) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Sub-Category / Specialty</label>
                <input type="text" value={selectedListing.subCategory || ""} onChange={e => setSelectedListing({...selectedListing, subCategory: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" />
              </div>
              {selectedListing.category === 'Doctor' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Primary Specialty</label>
                    <input type="text" value={selectedListing.primarySpecialty || ""} onChange={e => setSelectedListing({...selectedListing, primarySpecialty: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Doctor Tier</label>
                    <select value={selectedListing.doctorTier || ""} onChange={e => setSelectedListing({...selectedListing, doctorTier: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500">
                      <option value="">Select Tier</option>
                      <option value="Ayush">Ayush</option>
                      <option value="MBBS">MBBS</option>
                      <option value="Specialist">Specialist</option>
                      <option value="Super Specialist">Super Specialist</option>
                    </select>
                  </div>
                </>
              )}
              <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-800/40 p-6 rounded-2xl border border-white/10 mt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-1.5">Standard Consultation Fee</label>
                  <input type="number" value={selectedListing.consultationFee || ""} onChange={e => setSelectedListing({...selectedListing, consultationFee: e.target.value})} placeholder="e.g. 800" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-emerald-500 uppercase tracking-widest block mb-1.5">Launch Offer Fee (Discount)</label>
                  <input type="number" value={selectedListing.launchFee || ""} onChange={e => setSelectedListing({...selectedListing, launchFee: e.target.value})} placeholder="e.g. 500" className="w-full bg-emerald-900/20 border border-emerald-700/50 rounded-lg px-4 py-2.5 text-emerald-400 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="col-span-2 mt-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">About / Biography</label>
                <textarea value={selectedListing.about || ""} onChange={e => setSelectedListing({...selectedListing, about: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" rows={4} />
              </div>
              <div className="col-span-2 mt-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">YouTube Video Links (Media Gallery)</label>
                <InlineEditArray 
                  items={selectedListing.youtubeLinks || []} 
                  onSave={(newItems) => setSelectedListing({...selectedListing, youtubeLinks: newItems})} 
                  isEditMode={true}
                  placeholder="Paste YouTube URL here..." 
                />
              </div>
              
              {selectedListing.category && (directoryConfig as any)[selectedListing.category]?.tabs?.find((t: any) => t.id === 'basic')?.fields && (
                <div className="col-span-2 bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-sm mt-4">
                  <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">{selectedListing.category} Specific Basic Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(directoryConfig as any)[selectedListing.category].tabs.find((t: any) => t.id === 'basic')?.fields.map((field: any) => (
                      <div key={field.key} className={field.type === 'textarea' ? "col-span-3" : ""}>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{field.label}</label>
                        {field.type === 'textarea' ? (
                            <textarea 
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" 
                              value={selectedListing[field.key] || ''} 
                              onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.value})} 
                              placeholder={field.placeholder}
                            />
                        ) : field.type === 'boolean' ? (
                            <label className="flex items-center gap-3 mt-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 text-teal-600 rounded border-slate-700 bg-slate-900 focus:ring-teal-500"
                                checked={selectedListing[field.key] || false} 
                                onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.checked})} 
                              />
                              <span className="text-sm font-bold text-slate-300">{field.label}</span>
                            </label>
                        ) : field.type === 'select' ? (
                            <select 
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" 
                              value={selectedListing[field.key] || ''} 
                              onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.value})}
                            >
                                <option value="">Select {field.label}</option>
                                {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        ) : (
                            <input 
                              type="text" 
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" 
                              value={selectedListing[field.key] || ''} 
                              onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.value})} 
                              placeholder={field.placeholder}
                            />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="col-span-2 flex flex-wrap items-center gap-6 mt-2 p-5 bg-slate-800/40 border border-slate-700 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" id="verifiedCheck" checked={selectedListing.verified || false} onChange={e => setSelectedListing({...selectedListing, verified: e.target.checked})} className="w-6 h-6 text-teal-500 rounded border-slate-600 bg-slate-900 focus:ring-teal-500/20" />
                  <span className="text-sm font-bold text-white">Verified Listing</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" id="featuredCheck" checked={selectedListing.featured || false} onChange={e => setSelectedListing({...selectedListing, featured: e.target.checked})} className="w-6 h-6 text-amber-500 rounded border-slate-600 bg-slate-900 focus:ring-amber-500/20" />
                  <span className="text-sm font-bold text-white">Featured / Sponsored</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" id="testCheck" checked={selectedListing.isTestAccount || false} onChange={e => setSelectedListing({...selectedListing, isTestAccount: e.target.checked})} className="w-6 h-6 text-indigo-500 rounded border-slate-600 bg-slate-900 focus:ring-indigo-500/20" />
                  <span className="text-sm font-bold text-indigo-400">Test Account (Bypass Pay)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer ml-auto border-l border-slate-700 pl-6">
                  <div className={`relative inline-block w-12 h-6 rounded-full transition-colors ${selectedListing.isPublished !== false ? 'bg-teal-500' : 'bg-slate-700'}`}>
                    <input type="checkbox" className="absolute opacity-0 w-0 h-0" checked={selectedListing.isPublished !== false} onChange={e => setSelectedListing({...selectedListing, isPublished: e.target.checked})} />
                    <span className={`absolute cursor-pointer top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${selectedListing.isPublished !== false ? 'transform translate-x-6' : ''}`}></span>
                  </div>
                  <span className="text-sm font-bold text-white">{selectedListing.isPublished !== false ? 'Public (Visible)' : 'Hidden (Draft)'}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer ml-auto border-l border-slate-300 pl-6">
                  <div className={`relative inline-block w-12 h-6 rounded-full transition-colors ${selectedListing.adminLocked ? 'bg-rose-500' : 'bg-slate-300'}`}>
                    <input type="checkbox" className="absolute opacity-0 w-0 h-0" checked={selectedListing.adminLocked || false} onChange={e => {
                      const isLocked = e.target.checked;
                      setSelectedListing({
                        ...selectedListing, 
                        adminLocked: isLocked,
                        isPublished: isLocked ? false : selectedListing.isPublished
                      });
                    }} />
                    <span className={`absolute cursor-pointer top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${selectedListing.adminLocked ? 'transform translate-x-6' : ''}`}></span>
                  </div>
                  <span className="text-sm font-bold text-rose-600">System Lock</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="space-y-8">
              <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-sm">
                <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Primary Address & Location Mapping</h4>
                
                <div className="mb-6">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Primary Clinic / Hospital Name</label>
                  <input 
                    type="text" 
                    value={selectedListing.clinicName || ""} 
                    onChange={e => setSelectedListing({...selectedListing, clinicName: e.target.value})} 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" 
                    placeholder="e.g. Sanjivani Hospital"
                  />
                </div>

                <AddressBlock 
                  data={{
                    country: selectedListing.country || '',
                    state: selectedListing.state || '',
                    district: selectedListing.district || '',
                    block: selectedListing.block || '',
                    city: selectedListing.city || '',
                    pincode: selectedListing.pin || '',
                    localAddress: selectedListing.locality || selectedListing.address || ''
                  }}
                  onChange={(newData: any) => setSelectedListing({
                    ...selectedListing,
                    country: newData.country,
                    state: newData.state,
                    district: newData.district,
                    block: newData.block,
                    city: newData.city,
                    pin: newData.pincode,
                    locality: newData.localAddress,
                    address: newData.localAddress
                  })}
                />
              </div>

              {selectedListing.category === 'Doctor' && (
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-sm">
                  <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-widest">Associated Clinics / Hospitals</h4>
                  <p className="text-xs text-slate-400 mb-4">Edit the clinics or hospitals where this entity provides services.</p>
                  <ObjectArrayEditor
                    title="Clinics"
                    items={locations}
                    fields={[
                      { key: "clinicName", label: "Clinic/Hospital Name", type: "text" },
                      { key: "address", label: "Full Address", type: "textarea" },
                      { key: "mapUrl", label: "Google Maps Embed URL", type: "text" },
                      { key: "timings", label: "Timings (e.g. Mon-Sat 10AM-5PM)", type: "text" },
                      { key: "phone", label: "Booking Phone Number", type: "text" }
                    ]}
                    onUpdate={(idx: number, key: string, val: string) => handleArrayChange(setLocations, locations, idx, key, val)}
                    onAdd={() => setLocations([...locations, { clinicName: '', address: '', mapUrl: '', timings: '', phone: '' }])}
                    onRemove={(idx: number) => setLocations(locations.filter((_, i) => i !== idx))}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab !== 'basic' && activeTab !== 'locations' && (
            <div className="space-y-8">
              {selectedListing.category && (directoryConfig as any)[selectedListing.category]?.tabs?.find((t: any) => t.id === activeTab)?.fields?.map((field: any) => (
                <div key={field.key} className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-sm">
                  {field.type === 'object_array' && field.arrayFields ? (
                    <ObjectArrayEditor
                      title={field.label}
                      items={selectedListing[field.key] || []}
                      fields={field.arrayFields}
                      onUpdate={(idx: number, k: string, val: string) => {
                        const newArr = [...(selectedListing[field.key] || [])];
                        newArr[idx] = { ...newArr[idx], [k]: val };
                        setSelectedListing({...selectedListing, [field.key]: newArr});
                      }}
                      onAdd={() => {
                        const emptyObj: any = {};
                        field.arrayFields?.forEach((af: any) => emptyObj[af.key] = '');
                        setSelectedListing({...selectedListing, [field.key]: [...(selectedListing[field.key] || []), emptyObj]});
                      }}
                      onRemove={(idx: number) => {
                        const newArr = [...(selectedListing[field.key] || [])];
                        newArr.splice(idx, 1);
                        setSelectedListing({...selectedListing, [field.key]: newArr});
                      }}
                    />
                  ) : field.type === 'string_array' ? (
                    <>
                      <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-widest">{field.label}</h4>
                      <InlineEditArray 
                        items={selectedListing[field.key] || []} 
                        onSave={(newItems) => setSelectedListing({...selectedListing, [field.key]: newItems})} 
                        isEditMode={true}
                        placeholder={field.placeholder || "Add item..."} 
                      />
                    </>
                  ) : (
                    <div className={field.type === 'textarea' ? "col-span-2" : ""}>
                      <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-widest">{field.label}</h4>
                      {field.type === 'textarea' ? (
                          <textarea 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" 
                            value={selectedListing[field.key] || ''} 
                            onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.value})} 
                            placeholder={field.placeholder}
                          />
                      ) : field.type === 'boolean' ? (
                          <label className="flex items-center gap-3 mt-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 text-teal-600 rounded border-slate-700 bg-slate-900 focus:ring-teal-500"
                              checked={selectedListing[field.key] || false} 
                              onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.checked})} 
                            />
                            <span className="text-sm font-bold text-slate-300">{field.label}</span>
                          </label>
                      ) : field.type === 'select' ? (
                          <select 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" 
                            value={selectedListing[field.key] || ''} 
                            onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.value})}
                          >
                              <option value="">Select {field.label}</option>
                              {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                      ) : (
                          <input 
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" 
                            value={selectedListing[field.key] || ''} 
                            onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.value})} 
                            placeholder={field.placeholder}
                          />
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {(!selectedListing.category || !(directoryConfig as any)[selectedListing.category] || !(directoryConfig as any)[selectedListing.category]?.tabs?.find((t: any) => t.id === activeTab)) && (
                <div className="bg-slate-800/40 border-2 border-dashed border-white/10 p-8 rounded-2xl text-center">
                  <p className="text-slate-400 font-medium">Select a category in Basic Info to unlock specific {activeTab} settings.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end gap-4 shrink-0 bg-slate-900/80 backdrop-blur-xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] z-10">
          <button onClick={onClose} disabled={isSaving} className="px-8 py-3.5 border border-slate-700 hover:border-slate-500 bg-slate-800 font-bold rounded-xl text-slate-300 transition-all hover:bg-slate-700 hover:text-white">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-8 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-teal-500/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <PremiumSlugModal 
        isOpen={isSlugModalOpen} 
        onClose={() => setIsSlugModalOpen(false)} 
        currentName={selectedListing?.name || "Dr. Example"}
        currentUglyUrl={`dehapa.com/india/odisha/category/${selectedListing?.id || "temporary-id-12345"}`}
      />

      {(imageFileToCrop || imageUrlToCrop) && (
        <ImageCropper
          imageFile={imageFileToCrop}
          imageUrl={imageUrlToCrop}
          onCancel={() => { setImageFileToCrop(null); setImageUrlToCrop(null); }}
          onCropComplete={handleCroppedImage}
        />
      )}
    </div>
  );
}
