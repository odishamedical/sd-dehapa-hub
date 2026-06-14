"use client";

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = collection(db, 'directory');
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by newest first safely
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
      
      // Auto-save just the image so it's not lost
      const docRef = doc(db, 'directory', selectedListing.id);
      await updateDoc(docRef, { image: url });
      setData(data.map(d => d.id === selectedListing.id ? { ...d, image: url } : d));
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    }
    setIsUploadingImage(false);
  };

  const handleSave = async () => {
    if (!selectedListing) return;
    setIsSaving(true);
    try {
      const ref = doc(db, 'directory', selectedListing.id);
      await updateDoc(ref, {
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
        website: selectedListing.website || ""
      });
      // update local
      setData(data.map(d => d.id === selectedListing.id ? selectedListing : d));
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

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[80vh]">
      {/* Header & Filters */}
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Directory Data CRM</h3>
          <p className="text-sm text-slate-500">Manage all {data.length} injected records</p>
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Listing</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 group transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-slate-400 text-xs">No Img</span>}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.name}</p>
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
                    <button 
                      onClick={() => openDrawer(item)}
                      className="px-4 py-2 bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 text-slate-600 rounded-lg text-sm font-bold transition-colors shadow-sm"
                    >
                      View / Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-out Drawer */}
      {isDrawerOpen && selectedListing && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in-right">
            
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center z-10 shadow-sm">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Edit Listing</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">ID: {selectedListing.id}</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
              
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="relative group w-16 h-16 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                   {selectedListing.image ? <img src={selectedListing.image} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300">No Img</div>}
                   <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                     {isUploadingImage ? (
                       <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     ) : (
                       <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                     )}
                     <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} className="hidden" />
                   </label>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{selectedListing.name}</h4>
                  <p className="text-xs text-slate-500">{selectedListing.source === 'google_crawler' ? 'Sourced from Google Places' : 'Manual Entry'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name / Title</label>
                  <input type="text" value={selectedListing.name} onChange={e => setSelectedListing({...selectedListing, name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                  <input type="text" value={selectedListing.phone} onChange={e => setSelectedListing({...selectedListing, phone: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                  <input type="text" value={selectedListing.category} onChange={e => setSelectedListing({...selectedListing, category: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sub Category / Specialty</label>
                  <input type="text" value={selectedListing.subCategory} onChange={e => setSelectedListing({...selectedListing, subCategory: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">City</label>
                  <input type="text" value={selectedListing.city} onChange={e => setSelectedListing({...selectedListing, city: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">District</label>
                  <input type="text" value={selectedListing.district} onChange={e => setSelectedListing({...selectedListing, district: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Address</label>
                  <textarea value={selectedListing.address} onChange={e => setSelectedListing({...selectedListing, address: e.target.value})} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white resize-none"></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Clinic / Hospital Name</label>
                  <input type="text" value={selectedListing.clinicName || ""} onChange={e => setSelectedListing({...selectedListing, clinicName: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Experience</label>
                  <input type="text" value={selectedListing.experience || ""} onChange={e => setSelectedListing({...selectedListing, experience: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white" placeholder="e.g. 15 Years" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Qualification</label>
                  <input type="text" value={selectedListing.qualification || ""} onChange={e => setSelectedListing({...selectedListing, qualification: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white" placeholder="e.g. MBBS, MD" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">About</label>
                  <textarea value={selectedListing.about || ""} onChange={e => setSelectedListing({...selectedListing, about: e.target.value})} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Website</label>
                  <input type="text" value={selectedListing.website || ""} onChange={e => setSelectedListing({...selectedListing, website: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white" placeholder="https://" />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 p-4 border border-blue-200 bg-blue-50/50 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                    <input type="checkbox" checked={selectedListing.verified} onChange={e => setSelectedListing({...selectedListing, verified: e.target.checked})} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    <div>
                      <p className="font-bold text-blue-900 text-sm">Mark as Verified</p>
                      <p className="text-xs text-blue-700/70">Activates the blue verified badge on their public profile.</p>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex items-center gap-3 z-10 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
              <button onClick={handleDelete} disabled={isSaving} className="px-4 py-3 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl font-bold text-sm border border-transparent transition-colors mr-auto disabled:opacity-50 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Delete
              </button>
              <button onClick={() => setIsDrawerOpen(false)} disabled={isSaving} className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm bg-slate-50 border border-slate-200 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-teal-500/20 disabled:opacity-50 flex items-center gap-2">
                {isSaving ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Save Changes</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
