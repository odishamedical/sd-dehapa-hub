"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, writeBatch, serverTimestamp, updateDoc } from 'firebase/firestore';
import PremiumSlugModal from './PremiumSlugModal';
import { AdminCard, AdminHeader } from '@/components/admin/ui';

export default function AdminSlugRegistry() {
  const [slugs, setSlugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSlugs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'directory'), where("customSlug", "!=", ""));
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((d: any) => d.customSlug && d.customSlug.trim() !== "");
        
      setSlugs(data);
    } catch (err) {
      console.error("Error fetching premium slugs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlugs();
  }, []);

  const handleDeleteSlug = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to completely remove the premium vanity slug for ${name}? This will instantly revert their profile to the long SEO URL.`)) return;
    try {
      await updateDoc(doc(db, 'directory', id), { customSlug: "" });
      await fetchSlugs();
      alert("Successfully deleted custom slug!");
    } catch (err: any) {
      alert("Failed to delete slug: " + err.message);
    }
  };

  const handleAdminBook = async (urls: any[], ownerDetails: string) => {
    if (urls.length === 0) return;
    try {
      const batch = writeBatch(db);
      const directoryRef = collection(db, 'directory');

      for (const item of urls) {
        const newDocRef = doc(directoryRef);
        batch.set(newDocRef, {
          id: newDocRef.id,
          name: ownerDetails,
          assignedOwnerEmail: ownerDetails,
          customSlug: item.slug,
          category: item.category || item.type,
          source: "admin_registry_booking",
          verified: true,
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
      alert(`Successfully booked ${urls.length} URLs for ${ownerDetails}`);
      setIsModalOpen(false);
      fetchSlugs();
    } catch (err) {
      console.error("Failed to book URLs:", err);
      alert("Failed to book URLs. Check console for details.");
    }
  };

  const filteredSlugs = slugs.filter(s => 
    (s.customSlug?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (s.name?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <AdminCard noPadding>
      <AdminHeader 
        title={
          <div className="flex items-center gap-2">
            Premium Slug Registry 
            <span className="bg-cyan-900/50 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-cyan-500/30">
              {slugs.length} Registered
            </span>
          </div>
        }
        description="Track all claimed vanity URLs across the ecosystem."
        actions={
          <div className="flex flex-col md:flex-row gap-3">
            <button onClick={() => setIsModalOpen(true)} className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center gap-2 border border-slate-800">
              <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Book New Slug
            </button>
            <input 
              type="text" 
              placeholder="Search slugs or names..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-72 border border-slate-800 hover:border-slate-700 rounded-xl px-5 py-2 shadow-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all font-medium placeholder:text-slate-500 bg-slate-950/80"
            />
          </div>
        }
      />
      
      <div className="p-6 md:p-8">

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      ) : filteredSlugs.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-white/20">
          <div className="w-16 h-16 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Premium Slugs Found</h3>
          <p className="text-sm text-slate-500">There are currently no records with a registered custom slug.</p>
        </div>
      ) : (
        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full text-left border-collapse block md:table">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-white/10 bg-slate-50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap rounded-tl-xl">Premium Slug</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Entity Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Category</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Tier (Est.)</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-transparent md:divide-slate-100 p-3 md:p-0">
              {filteredSlugs.map((doc: any) => {
                const isDoctor = doc.category?.toLowerCase() === 'doctor';
                const isHospital = doc.category?.toLowerCase() === 'hospital' || doc.category?.toLowerCase() === 'clinic';
                const isLab = doc.category?.toLowerCase() === 'lab' || doc.category?.toLowerCase() === 'diagnostic center';
                const isPharmacy = doc.category?.toLowerCase() === 'pharmacy' || doc.category?.toLowerCase() === 'medical store';
                const isAmbulance = doc.category?.toLowerCase() === 'ambulance';
                
                let baseCategoryPath = "";
                if (isDoctor) baseCategoryPath = "doctors";
                else if (isHospital) baseCategoryPath = "hospitals";
                else if (isLab) baseCategoryPath = "labs";
                else if (isPharmacy) baseCategoryPath = "pharmacies";
                else if (isAmbulance) baseCategoryPath = "ambulances";

                const globalUrl = `/${doc.customSlug}`;
                const categoryUrl = `/${baseCategoryPath}/${doc.customSlug}`;

                return (
                  <tr key={doc.id} className="block md:table-row bg-slate-800 md:bg-transparent mb-3 md:mb-0 border border-white/10 md:border-none shadow-sm md:shadow-none p-4 md:p-0 rounded-xl md:rounded-none hover:bg-slate-800/40 transition-colors">
                    <td className="block md:table-cell p-0 md:p-4">
                      <div className="flex justify-between items-start md:block">
                        <div>
                          <div className="flex items-center gap-2 mb-1 md:mb-0">
                            <span className="font-mono text-sm font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-100 shadow-sm">{doc.customSlug}</span>
                            <span className="md:hidden text-[10px] font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Global Root</span>
                          </div>
                          <div className="md:hidden mt-2">
                            <p className="font-bold text-white text-sm">{doc.name || "Unnamed"}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{doc.district}, {doc.state}</p>
                            <span className="bg-slate-100 text-slate-300 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mt-2 inline-block">{doc.category || "General"}</span>
                          </div>
                        </div>

                        <div className="md:hidden flex flex-col gap-2 shrink-0">
                          <button onClick={() => handleDeleteSlug(doc.id, doc.name || "Unnamed")} title="Remove Premium Slug" className="w-8 h-8 bg-rose-50 border border-rose-200 hover:border-rose-500 hover:bg-rose-500 hover:text-white rounded flex items-center justify-center text-rose-600 transition-colors shadow-sm ml-auto">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                          <div className="flex gap-2">
                            {baseCategoryPath && (
                              <a target="_blank" rel="noopener noreferrer" href={categoryUrl} title="View Category URL" className="w-8 h-8 bg-slate-900 border border-white/10 hover:border-teal-500 hover:text-teal-600 rounded flex items-center justify-center text-slate-500 transition-colors shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                              </a>
                            )}
                            <a target="_blank" rel="noopener noreferrer" href={globalUrl} title="View Global Root URL" className="w-8 h-8 bg-teal-50 border border-teal-200 hover:border-teal-600 hover:bg-teal-600 hover:text-white rounded flex items-center justify-center text-teal-700 transition-colors shadow-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell p-4">
                      <p className="font-bold text-white">{doc.name || "Unnamed"}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{doc.district}, {doc.state}</p>
                    </td>
                    <td className="hidden md:table-cell p-4">
                      <span className="bg-slate-100 text-slate-300 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{doc.category || "General"}</span>
                    </td>
                    <td className="hidden md:table-cell p-4">
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        Global Root
                      </span>
                    </td>
                    <td className="hidden md:table-cell p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {baseCategoryPath && (
                          <a target="_blank" rel="noopener noreferrer" href={categoryUrl} title="View Category URL" className="w-8 h-8 bg-slate-900 border border-white/10 hover:border-teal-500 hover:text-teal-600 rounded flex items-center justify-center text-slate-500 transition-colors shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                          </a>
                        )}
                        <a target="_blank" rel="noopener noreferrer" href={globalUrl} title="View Global Root URL" className="w-8 h-8 bg-teal-50 border border-teal-200 hover:border-teal-600 hover:bg-teal-600 hover:text-white rounded flex items-center justify-center text-teal-700 transition-colors shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                        </a>
                        <button onClick={() => handleDeleteSlug(doc.id, doc.name || "Unnamed")} title="Remove Premium Slug" className="w-8 h-8 bg-rose-50 border border-rose-200 hover:border-rose-500 hover:bg-rose-500 hover:text-white rounded flex items-center justify-center text-rose-600 transition-colors shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <PremiumSlugModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentName=""
        currentUglyUrl=""
        isAdminMode={true}
        onAdminBook={handleAdminBook}
      />
      </div>
    </AdminCard>
  );
}
