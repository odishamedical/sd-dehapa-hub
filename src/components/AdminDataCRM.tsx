"use client";

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';

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
    setSelectedListing({ ...listing });
    setDynamicFields(listing.customFields || []);
    setLocations(listing.locations || []);
    setExperiences(listing.experiences || []);
    setQualificationsList(listing.qualificationsList || []);
    setResearch(listing.research || []);
    setAwards(listing.awards || []);
    setIsDrawerOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedListing) return;
    setIsUploadingImage(true);
    try {
      const fileRef = ref(storage, `directory/${selectedListing.id}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setSelectedListing({ ...selectedListing, image: url });
      
      const docRef = doc(db, 'directory', selectedListing.id);
      await updateDoc(docRef, { image: url });
      setData(data.map(d => d.id === selectedListing.id ? { ...d, image: url } : d));
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    }
    setIsUploadingImage(false);
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
      const ref = doc(db, 'directory', selectedListing.id);
      
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
        clinicName: selectedListing.clinicName || "",
        experience: selectedListing.experience || "",
        qualification: selectedListing.qualification || "",
        about: selectedListing.about || "",
        website: selectedListing.website || "",
        fee: selectedListing.fee || "",
        internalNotes: selectedListing.internalNotes || "",
        featured: selectedListing.featured || false,
        customFields: cleanDynamicFields,
        locations: cleanLocations,
        experiences: cleanExperiences,
        qualificationsList: cleanQualifications,
        research: cleanResearch,
        awards: cleanAwards
      };

      await updateDoc(ref, updatedData);
      setData(data.map(d => d.id === selectedListing.id ? { ...d, ...updatedData } : d));
      setIsDrawerOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to update listing.");
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
      {/* Header & Filters */}
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Directory Data CRM</h3>
          <p className="text-sm text-slate-500">Manage all {data.length} injected records</p>
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
              className="mt-2 text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded flex items-center gap-1 font-bold transition-colors disabled:opacity-50"
            >
              {isDeletingBulk ? (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              )}
              Delete {selectedIds.length} Selected
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search name or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm flex-1 md:w-64 focus:outline-none focus:border-teal-500"
          />
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select 
            value={verifiedFilter} 
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            <p>No records found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input type="checkbox" onChange={handleSelectAll} checked={filteredData.length > 0 && selectedIds.length === filteredData.length} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer" />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Listing</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map(item => (
                <tr key={item.id} className={`group transition-colors ${selectedIds.includes(item.id) ? 'bg-teal-50/30' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4">
                    <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-slate-400 text-xs">No Img</span>}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          {item.name}
                          {item.featured && <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Featured</span>}
                        </p>
                        <p className="text-xs text-slate-500">{item.category} • {item.subCategory}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900 font-medium">{item.phone || <span className="text-slate-400 italic">No phone</span>}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">{item.city}</p>
                    <p className="text-xs text-slate-500">{item.district}</p>
                  </td>
                  <td className="px-6 py-4">
                    {item.verified ? (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-amber-200">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openDrawer(item)}
                        className="px-4 py-2 bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 text-slate-600 rounded-lg text-sm font-bold transition-colors shadow-sm"
                      >
                        View / Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Are you sure you want to permanently delete "${item.name}"?`)) return;
                          try {
                            await deleteDoc(doc(db, 'directory', item.id));
                            setData(data.filter(d => d.id !== item.id));
                            setSelectedIds(selectedIds.filter(id => id !== item.id));
                          } catch (e) {
                            console.error(e);
                            alert("Failed to delete.");
                          }
                        }}
                        className="px-3 py-2 bg-white border border-slate-200 hover:border-red-500 hover:text-red-600 hover:bg-red-50 text-slate-400 rounded-lg transition-colors shadow-sm"
                        title="Delete Listing"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Centered Modal */}
      {isDrawerOpen && selectedListing && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex justify-center items-center p-4 sm:p-6 md:p-12 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-5xl max-h-full rounded-2xl shadow-2xl flex flex-col animate-scale-in overflow-hidden border border-slate-200">
            
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="relative group w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                   {selectedListing.image ? <img src={selectedListing.image} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300">No Img</div>}
                   <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                     {isUploadingImage ? (
                       <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     ) : (
                       <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                     )}
                     <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} className="hidden" />
                   </label>
                 </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900">{selectedListing.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedListing.id} • {selectedListing.source === 'google_crawler' ? 'Google Sourced' : 'Manual Entry'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {selectedListing.ownerId && (
                  <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors border border-slate-200">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Owner Dashboard
                  </button>
                )}
                <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>
            
            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                
                {/* Column 1: Basic & Location Info */}
                <div className="space-y-5">
                  <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Basic Information</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name / Title</label>
                    <input type="text" value={selectedListing.name} onChange={e => setSelectedListing({...selectedListing, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                    <input type="text" value={selectedListing.phone} onChange={e => setSelectedListing({...selectedListing, phone: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white shadow-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                      <input type="text" value={selectedListing.category} onChange={e => setSelectedListing({...selectedListing, category: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Specialty</label>
                      <input type="text" value={selectedListing.subCategory} onChange={e => setSelectedListing({...selectedListing, subCategory: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white shadow-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">City</label>
                      <input type="text" value={selectedListing.city} onChange={e => setSelectedListing({...selectedListing, city: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">District</label>
                      <input type="text" value={selectedListing.district} onChange={e => setSelectedListing({...selectedListing, district: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Full Address</label>
                    <textarea value={selectedListing.address} onChange={e => setSelectedListing({...selectedListing, address: e.target.value})} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white resize-none shadow-sm"></textarea>
                  </div>
                </div>

                {/* Column 2: Professional Details */}
                <div className="space-y-5">
                  <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Professional Details</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Clinic Name</label>
                    <input type="text" value={selectedListing.clinicName || ""} onChange={e => setSelectedListing({...selectedListing, clinicName: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white shadow-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Experience</label>
                      <input type="text" value={selectedListing.experience || ""} onChange={e => setSelectedListing({...selectedListing, experience: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white shadow-sm" placeholder="e.g. 15 Years" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Fee</label>
                      <input type="text" value={selectedListing.fee || ""} onChange={e => setSelectedListing({...selectedListing, fee: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white shadow-sm" placeholder="e.g. 500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Short Qualification (e.g. MBBS)</label>
                    <input type="text" value={selectedListing.qualification || ""} onChange={e => setSelectedListing({...selectedListing, qualification: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white shadow-sm" placeholder="e.g. MBBS, MD" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">About / Bio</label>
                    <textarea value={selectedListing.about || ""} onChange={e => setSelectedListing({...selectedListing, about: e.target.value})} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white resize-none shadow-sm"></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Website URL</label>
                    <input type="text" value={selectedListing.website || ""} onChange={e => setSelectedListing({...selectedListing, website: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white shadow-sm" placeholder="https://" />
                  </div>
                </div>

              </div>

              {/* Advanced Elite Fields */}
              
              {/* 1. Visiting Locations */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900">Multiple Visiting Locations</h4>
                  <button onClick={() => setLocations([...locations, {name:'', address:'', city:'', days:'', timings:'', fee:''}])} className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Location
                  </button>
                </div>
                {locations.length === 0 && <p className="text-xs text-slate-500 italic">No additional locations added.</p>}
                <div className="space-y-3">
                  {locations.map((loc, idx) => (
                    <div key={idx} className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm relative pr-12">
                      <button onClick={() => setLocations(locations.filter((_, i) => i !== idx))} className="absolute right-3 top-3 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input type="text" placeholder="Clinic/Hospital Name" value={loc.name} onChange={e => handleArrayChange(setLocations, locations, idx, 'name', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                        <input type="text" placeholder="City" value={loc.city} onChange={e => handleArrayChange(setLocations, locations, idx, 'city', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                      </div>
                      <input type="text" placeholder="Full Address" value={loc.address} onChange={e => handleArrayChange(setLocations, locations, idx, 'address', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none mb-3" />
                      <div className="grid grid-cols-3 gap-3">
                        <input type="text" placeholder="Days (e.g. Mon, Wed)" value={loc.days} onChange={e => handleArrayChange(setLocations, locations, idx, 'days', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                        <input type="text" placeholder="Timings (e.g. 5 PM - 8 PM)" value={loc.timings} onChange={e => handleArrayChange(setLocations, locations, idx, 'timings', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                        <input type="text" placeholder="Fee (₹)" value={loc.fee} onChange={e => handleArrayChange(setLocations, locations, idx, 'fee', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Chronological Experience */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900">Chronological Experience</h4>
                  <button onClick={() => setExperiences([...experiences, {role:'', hospital:'', duration:''}])} className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Experience
                  </button>
                </div>
                {experiences.length === 0 && <p className="text-xs text-slate-500 italic">No experiences added.</p>}
                <div className="space-y-3">
                  {experiences.map((exp, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                      <input type="text" placeholder="Role (e.g. Senior Surgeon)" value={exp.role} onChange={e => handleArrayChange(setExperiences, experiences, idx, 'role', e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                      <input type="text" placeholder="Hospital/Institution" value={exp.hospital} onChange={e => handleArrayChange(setExperiences, experiences, idx, 'hospital', e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                      <input type="text" placeholder="Duration (2015 - 2020)" value={exp.duration} onChange={e => handleArrayChange(setExperiences, experiences, idx, 'duration', e.target.value)} className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                      <button onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Qualifications & Fellowships */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900">Qualifications & Fellowships</h4>
                  <button onClick={() => setQualificationsList([...qualificationsList, {degree:'', institution:'', year:''}])} className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Qualification
                  </button>
                </div>
                {qualificationsList.length === 0 && <p className="text-xs text-slate-500 italic">No structured qualifications added.</p>}
                <div className="space-y-3">
                  {qualificationsList.map((qual, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                      <input type="text" placeholder="Degree (e.g. MD)" value={qual.degree} onChange={e => handleArrayChange(setQualificationsList, qualificationsList, idx, 'degree', e.target.value)} className="w-1/4 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                      <input type="text" placeholder="Institution Name" value={qual.institution} onChange={e => handleArrayChange(setQualificationsList, qualificationsList, idx, 'institution', e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                      <input type="text" placeholder="Year" value={qual.year} onChange={e => handleArrayChange(setQualificationsList, qualificationsList, idx, 'year', e.target.value)} className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                      <button onClick={() => setQualificationsList(qualificationsList.filter((_, i) => i !== idx))} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Research & Publications */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900">Research & Publications</h4>
                  <button onClick={() => setResearch([...research, {title:'', journal:'', year:''}])} className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Publication
                  </button>
                </div>
                {research.length === 0 && <p className="text-xs text-slate-500 italic">No publications added.</p>}
                <div className="space-y-3">
                  {research.map((res, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                      <input type="text" placeholder="Paper Title" value={res.title} onChange={e => handleArrayChange(setResearch, research, idx, 'title', e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                      <input type="text" placeholder="Journal/Conference" value={res.journal} onChange={e => handleArrayChange(setResearch, research, idx, 'journal', e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                      <input type="text" placeholder="Year" value={res.year} onChange={e => handleArrayChange(setResearch, research, idx, 'year', e.target.value)} className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                      <button onClick={() => setResearch(research.filter((_, i) => i !== idx))} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Awards */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900">Awards & Recognitions</h4>
                  <button onClick={() => setAwards([...awards, {name:'', organization:'', year:''}])} className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Award
                  </button>
                </div>
                {awards.length === 0 && <p className="text-xs text-slate-500 italic">No awards added.</p>}
                <div className="space-y-3">
                  {awards.map((awa, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                      <input type="text" placeholder="Award Name" value={awa.name} onChange={e => handleArrayChange(setAwards, awards, idx, 'name', e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                      <input type="text" placeholder="Issuing Organization" value={awa.organization} onChange={e => handleArrayChange(setAwards, awards, idx, 'organization', e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                      <input type="text" placeholder="Year" value={awa.year} onChange={e => handleArrayChange(setAwards, awards, idx, 'year', e.target.value)} className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
                      <button onClick={() => setAwards(awards.filter((_, i) => i !== idx))} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>


              {/* Status & Toggles Section */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-6">Listing Status & Controls</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors shadow-sm">
                    <input type="checkbox" checked={selectedListing.verified} onChange={e => setSelectedListing({...selectedListing, verified: e.target.checked})} className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-blue-500" />
                    <div>
                      <p className="font-bold text-slate-900 text-base">Verified Listing</p>
                      <p className="text-sm text-slate-500 mt-1">Activates the blue verified badge on their public profile.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-amber-300 hover:bg-amber-50/30 transition-colors shadow-sm">
                    <input type="checkbox" checked={selectedListing.featured} onChange={e => setSelectedListing({...selectedListing, featured: e.target.checked})} className="w-5 h-5 mt-0.5 text-amber-500 rounded focus:ring-amber-500" />
                    <div>
                      <p className="font-bold text-slate-900 text-base">Featured Placement</p>
                      <p className="text-sm text-slate-500 mt-1">Pins this listing to the top of directory searches.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dynamic Custom Fields */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900">Dynamic Custom Fields</h4>
                  <button onClick={addDynamicField} className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Field
                  </button>
                </div>
                
                {dynamicFields.length === 0 ? (
                  <div className="text-center p-6 bg-white border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm">
                    No custom fields added.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dynamicFields.map((field, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                        <div className="w-1/3">
                          <input type="text" placeholder="Label" value={field.label} onChange={e => updateDynamicField(idx, 'label', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 outline-none bg-slate-50" />
                        </div>
                        <div className="flex-1">
                          <input type="text" placeholder="Value" value={field.value} onChange={e => updateDynamicField(idx, 'value', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 outline-none bg-slate-50" />
                        </div>
                        <button onClick={() => removeDynamicField(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-0.5">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Internal Notes */}
              <div className="mt-8 pt-8 border-t border-slate-200 mb-8">
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  Internal Admin Notes <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full ml-2">Private</span>
                </h4>
                <textarea 
                  value={selectedListing.internalNotes || ""} 
                  onChange={e => setSelectedListing({...selectedListing, internalNotes: e.target.value})} 
                  rows={4} 
                  placeholder="Leave hidden notes here..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-amber-50/30 resize-none shadow-sm"
                ></textarea>
              </div>

            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between z-20 shadow-[0_-10px_15px_-3px_rgb(0,0,0,0.05)]">
              <button onClick={handleDelete} disabled={isSaving} className="px-5 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2 border border-transparent hover:border-red-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Delete
              </button>
              
              <div className="flex items-center gap-3">
                <Link href={`/${selectedListing.category === 'Hospital' ? 'hospitals' : 'doctors'}/${selectedListing.id}`} target="_blank" className="hidden md:flex px-5 py-2.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl font-bold text-sm transition-colors border border-slate-200 hover:border-teal-200 items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  Public Profile
                </Link>
                <button onClick={() => setIsDrawerOpen(false)} disabled={isSaving} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm bg-slate-50 border border-slate-200 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isSaving} className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-500/20 hover:shadow-lg disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Save Changes</>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
