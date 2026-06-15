"use client";

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';
import PremiumSlugModal from './PremiumSlugModal';
import { indianStates, districtsByState, blocksByDistrict } from '@/lib/locations';
import ImageCropper from './ImageCropper';

export default function AdminDataCRM() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("all");

  // Drawer state
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isNewListing, setIsNewListing] = useState(false);
  
  // Custom Slug Check
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<{status: 'idle' | 'checking' | 'available' | 'taken', message: string}>({status: 'idle', message: ''});
  const [isSlugModalOpen, setIsSlugModalOpen] = useState(false);

  // Image Cropping
  const [imageFileToCrop, setImageFileToCrop] = useState<File | null>(null);
  const [imageUrlToCrop, setImageUrlToCrop] = useState<string | null>(null);
  
  // Selection and bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  
  // Advanced features state
  const [dynamicFields, setDynamicFields] = useState<{label: string, value: string}[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [qualificationsList, setQualificationsList] = useState<any[]>([]);
  const [research, setResearch] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = collection(db, 'directory');
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a: any, b: any) => {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        return timeB - timeA;
      });
      setData(docs);
    } catch (e) {
      console.error("Failed to fetch CRM data:", e);
    }
    setLoading(false);
  };

  const filteredData = data.filter(item => {
    if (search && !item.name?.toLowerCase().includes(search.toLowerCase()) && !item.phone?.includes(search)) return false;
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (verifiedFilter !== "all") {
      if (verifiedFilter === "verified" && !item.verified) return false;
      if (verifiedFilter === "unverified" && item.verified) return false;
    }
    return true;
  });

  const uniqueCategories = Array.from(new Set(data.map(d => d.category).filter(Boolean)));

  const openDrawer = (listing: any) => {
    setIsNewListing(false);
    setSelectedListing({ ...listing });
    setDynamicFields(listing.customFields || []);
    setLocations(listing.locations || []);
    setExperiences(listing.experiences || []);
    setQualificationsList(listing.qualificationsList || []);
    setResearch(listing.research || []);
    setAwards(listing.awards || []);
    setSlugAvailability({status: 'idle', message: ''});
    setIsDrawerOpen(true);
  };

  const handleCreateNew = () => {
    setIsNewListing(true);
    setSelectedListing({
      id: "NEW_" + Date.now().toString(),
      name: "",
      phone: "",
      address: "",
      category: "",
      subCategory: "",
      city: "",
      district: "",
      verified: false,
      customSlug: "",
      source: "manual_entry",
      tenantId: "default"
    });
    setDynamicFields([]);
    setLocations([]);
    setExperiences([]);
    setQualificationsList([]);
    setResearch([]);
    setAwards([]);
    setSlugAvailability({status: 'idle', message: ''});
    setIsDrawerOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedListing) return;
    setImageFileToCrop(e.target.files[0]);
    setImageUrlToCrop(null);
    e.target.value = ''; // Reset input so same file can be selected again
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

  const addDynamicField = () => setDynamicFields([...dynamicFields, { label: "", value: "" }]);
  const updateDynamicField = (index: number, key: 'label' | 'value', val: string) => {
    const newFields = [...dynamicFields];
    newFields[index][key] = val;
    setDynamicFields(newFields);
  };
  const removeDynamicField = (index: number) => setDynamicFields(dynamicFields.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!selectedListing) return;
    setIsSaving(true);
    try {
      const cleanDynamicFields = dynamicFields.filter(f => f.label.trim() !== "" && f.value.trim() !== "");
      const cleanLocations = locations.filter(l => l.name?.trim() !== "");
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
        customSlug: selectedListing.customSlug || "",
        clinicName: selectedListing.clinicName || "",
        ...selectedListing,
        customFields: cleanDynamicFields,
        locations: cleanLocations,
        experiences: cleanExperiences,
        qualificationsList: cleanQualifications,
        research: cleanResearch,
        awards: cleanAwards,
        galleryImages: selectedListing.galleryImages || [],
        rawImages: selectedListing.rawImages || [],
        updatedAt: serverTimestamp()
      };

      if (isNewListing) {
        const newRef = doc(collection(db, 'directory'));
        const fullData = {
          ...updatedData,
          source: 'manual_entry',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await setDoc(newRef, fullData);
        setData([{ id: newRef.id, ...fullData }, ...data]);
      } else {
        const ref = doc(db, 'directory', selectedListing.id);
        await updateDoc(ref, { ...updatedData, updatedAt: new Date() });
        setData(data.map(d => d.id === selectedListing.id ? { ...d, ...updatedData } : d));
      }
      setIsDrawerOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save listing.");
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedListing) return;
    if (!confirm(`Are you sure you want to permanently delete "${selectedListing.name}"?`)) return;
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, 'directory', selectedListing.id));
      setData(data.filter(d => d.id !== selectedListing.id));
      setIsDrawerOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to delete listing.");
    }
    setIsSaving(false);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} selected listings?`)) return;
    setIsDeletingBulk(true);
    try {
      await Promise.all(selectedIds.map(id => deleteDoc(doc(db, 'directory', id))));
      setData(data.filter(d => !selectedIds.includes(d.id)));
      setSelectedIds([]);
    } catch (e) {
      console.error(e);
      alert("Failed to delete selected listings.");
    }
    setIsDeletingBulk(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[80vh]">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Directory Data CRM</h3>
          <p className="text-sm text-slate-500">Manage all {data.length} records</p>
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
              className="mt-2 text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded flex items-center gap-1 font-bold transition-colors disabled:opacity-50"
            >
              {isDeletingBulk ? <span className="animate-spin">...</span> : "Delete Selected"}
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search name or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 md:w-64 border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium placeholder:text-slate-400 bg-white"
          />
          <button onClick={handleCreateNew} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors">
            Create Record
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-64">Loading...</div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">No records found.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4"><input type="checkbox" onChange={handleSelectAll} /></th>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Listing</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} /></td>
                  <td className="px-6 py-4">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">{item.name}</td>
                  <td className="px-6 py-4 text-sm">{item.phone}</td>
                  <td className="px-6 py-4">{item.verified ? <span className="text-green-600 font-bold text-xs uppercase tracking-widest bg-green-50 px-2 py-1 rounded">Verified</span> : <span className="text-slate-500 font-bold text-xs uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Unverified</span>}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <Link href={`/doctors/${item.customSlug || item.id}`} target="_blank" className="text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        View Live
                      </Link>
                      <button onClick={() => openDrawer(item)} className="text-teal-600 hover:text-teal-700 font-bold text-sm bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">Edit Data</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isDrawerOpen && selectedListing && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center shrink-0 bg-gradient-to-r from-slate-900 to-teal-900 text-white shadow-md z-10">
              <h3 className="font-bold text-2xl font-serif">{isNewListing ? "New Record" : selectedListing.name}</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              <div className="grid grid-cols-2 gap-8">
                
                <div className="col-span-2 flex items-start gap-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden shrink-0 relative">
                    {selectedListing.image ? (
                      <img src={selectedListing.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    )}
                    {isUploadingImage && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><svg className="animate-spin w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>}
                  </div>
                  <div className="flex-1">
                    <label className="form-label">Profile Image</label>
                    <p className="text-xs text-slate-500 mb-3">Upload a high quality square image. Maximum 2MB.</p>
                    <div className="flex gap-3">
                      <label className="px-5 py-2.5 bg-white border-2 border-slate-200 hover:border-teal-500 rounded-xl text-sm font-bold text-slate-700 cursor-pointer transition-colors shadow-sm inline-block">
                        {isUploadingImage ? 'Uploading...' : 'Upload / Edit Image'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                      </label>
                      {selectedListing.image && (
                        <button onClick={() => setSelectedListing({...selectedListing, image: null})} className="px-5 py-2.5 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors">
                          Remove Primary
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scraped Raw Images Section */}
                {selectedListing.rawImages && selectedListing.rawImages.length > 0 && (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm mt-4">
                    <h4 className="font-bold text-slate-900 mb-2">Scraped Images (Crawler)</h4>
                    <p className="text-xs text-slate-500 mb-4">Click any image to crop it and set as Primary or add to Gallery.</p>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                      {selectedListing.rawImages.map((rawUrl: string, idx: number) => (
                        <div key={idx} onClick={() => handleRawImageClick(rawUrl)} className="w-24 h-24 shrink-0 rounded-lg overflow-hidden border-2 border-transparent hover:border-teal-500 cursor-pointer shadow-sm transition-all hover:scale-105">
                          <img src={rawUrl} alt={`Scraped ${idx}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery Images Section */}
                {selectedListing.galleryImages && selectedListing.galleryImages.length > 0 && (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm mt-4">
                    <h4 className="font-bold text-slate-900 mb-4">Gallery Images</h4>
                    <div className="flex flex-wrap gap-4">
                      {selectedListing.galleryImages.map((galUrl: string, idx: number) => (
                        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm group">
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
                  <label className="form-label">Name</label>
                  <input type="text" value={selectedListing.name} onChange={e => setSelectedListing({...selectedListing, name: e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Assigned Owner Email</label>
                  <input type="text" value={selectedListing.assignedOwnerEmail || ""} onChange={e => setSelectedListing({...selectedListing, assignedOwnerEmail: e.target.value})} className="form-input" placeholder="e.g. user@example.com" />
                </div>
                <div className="relative">
                  <label className="form-label">Custom Slug</label>
                  <div className="flex gap-2">
                    <input type="text" value={selectedListing.customSlug || ""} onChange={e => setSelectedListing({...selectedListing, customSlug: e.target.value})} className="form-input" />
                    <button onClick={checkSlugAvailability} className="bg-slate-800 text-white px-4 py-1 rounded-lg text-sm font-bold">Check</button>
                    <button onClick={() => setIsSlugModalOpen(true)} className="bg-teal-600 text-white px-4 py-1 rounded-lg text-sm font-bold whitespace-nowrap">Super Search</button>
                  </div>
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input type="text" value={selectedListing.phone || ""} onChange={e => setSelectedListing({...selectedListing, phone: e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select value={selectedListing.category || ""} onChange={e => setSelectedListing({...selectedListing, category: e.target.value})} className="form-select">
                    <option value="">Select Category</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Sub-Category / Specialty</label>
                  <input type="text" value={selectedListing.subCategory || ""} onChange={e => setSelectedListing({...selectedListing, subCategory: e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Country</label>
                  <select value={selectedListing.country || "India"} onChange={e => setSelectedListing({...selectedListing, country: e.target.value})} className="form-select">
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UAE">UAE</option>
                    <option value="Australia">Australia</option>
                    <option value="England">England</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {selectedListing.country === "Other" ? (
                  <div>
                    <label className="form-label">Custom Country</label>
                    <input type="text" value={selectedListing.customCountry || ""} onChange={e => setSelectedListing({...selectedListing, customCountry: e.target.value})} className="form-input" />
                  </div>
                ) : null}

                <div>
                  <label className="form-label">State</label>
                  {selectedListing.country === "India" || !selectedListing.country ? (
                    <select value={selectedListing.state || ""} onChange={e => setSelectedListing({...selectedListing, state: e.target.value, district: "", city: ""})} className="form-select">
                      <option value="">Select State</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={selectedListing.state || ""} onChange={e => setSelectedListing({...selectedListing, state: e.target.value})} className="form-input" />
                  )}
                </div>

                <div>
                  <label className="form-label">District</label>
                  {selectedListing.state && districtsByState[selectedListing.state] ? (
                    <select 
                      value={districtsByState[selectedListing.state].includes(selectedListing.district) ? selectedListing.district : (selectedListing.district ? "Other" : "")} 
                      onChange={e => {
                        if (e.target.value === "Other") {
                          setSelectedListing({...selectedListing, district: "", city: ""});
                        } else {
                          setSelectedListing({...selectedListing, district: e.target.value, city: ""});
                        }
                      }} 
                      className="form-select mb-2"
                    >
                      <option value="">Select District</option>
                      {districtsByState[selectedListing.state].map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <input type="text" value={selectedListing.district || ""} onChange={e => setSelectedListing({...selectedListing, district: e.target.value})} className="form-input" />
                  )}
                  {selectedListing.state && districtsByState[selectedListing.state] && !districtsByState[selectedListing.state].includes(selectedListing.district) && selectedListing.district !== "" && selectedListing.district !== undefined && (
                    <input type="text" value={selectedListing.district || ""} onChange={e => setSelectedListing({...selectedListing, district: e.target.value})} placeholder="Type Custom District..." className="form-input animate-in fade-in" />
                  )}
                </div>

                <div>
                  <label className="form-label">City / Block</label>
                  {selectedListing.district && blocksByDistrict[selectedListing.district] ? (
                    <select 
                      value={blocksByDistrict[selectedListing.district].includes(selectedListing.city) ? selectedListing.city : (selectedListing.city ? "Other" : "")} 
                      onChange={e => {
                        if (e.target.value === "Other") {
                          setSelectedListing({...selectedListing, city: ""});
                        } else {
                          setSelectedListing({...selectedListing, city: e.target.value});
                        }
                      }} 
                      className="form-select mb-2"
                    >
                      <option value="">Select City / Block</option>
                      {blocksByDistrict[selectedListing.district].map(block => (
                        <option key={block} value={block}>{block}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <input type="text" value={selectedListing.city || ""} onChange={e => setSelectedListing({...selectedListing, city: e.target.value})} className="form-input" />
                  )}
                  {selectedListing.district && blocksByDistrict[selectedListing.district] && !blocksByDistrict[selectedListing.district].includes(selectedListing.city) && selectedListing.city !== "" && selectedListing.city !== undefined && (
                    <input type="text" value={selectedListing.city || ""} onChange={e => setSelectedListing({...selectedListing, city: e.target.value})} placeholder="Type Custom City/Block..." className="form-input animate-in fade-in" />
                  )}
                </div>
                <div className="col-span-2">
                  <label className="form-label">Full Address</label>
                  <textarea value={selectedListing.address || ""} onChange={e => setSelectedListing({...selectedListing, address: e.target.value})} className="form-input" rows={2} />
                </div>
                <div className="col-span-2">
                  <label className="form-label">About / Biography</label>
                  <textarea value={selectedListing.about || ""} onChange={e => setSelectedListing({...selectedListing, about: e.target.value})} className="form-input" rows={4} />
                </div>
                <div className="col-span-2 flex flex-wrap items-center gap-6 mt-2 p-5 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" id="verifiedCheck" checked={selectedListing.verified || false} onChange={e => setSelectedListing({...selectedListing, verified: e.target.checked})} className="w-6 h-6 text-teal-600 rounded border-slate-300" />
                    <span className="text-sm font-bold text-slate-900">Verified Listing</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" id="featuredCheck" checked={selectedListing.featured || false} onChange={e => setSelectedListing({...selectedListing, featured: e.target.checked})} className="w-6 h-6 text-amber-500 rounded border-slate-300" />
                    <span className="text-sm font-bold text-slate-900">Featured / Sponsored</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-4 shrink-0 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10">
              <button onClick={() => setIsDrawerOpen(false)} disabled={isSaving} className="px-8 py-3.5 border-2 border-slate-200 hover:border-slate-300 bg-white font-bold rounded-xl text-slate-600 transition-all hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-teal-600/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

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
