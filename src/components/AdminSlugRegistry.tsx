"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import PremiumSlugModal from './PremiumSlugModal';

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
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Premium Slug Registry 
            <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-teal-200">
              {slugs.length} Registered
            </span>
          </h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">Track all claimed vanity URLs across the ecosystem.</p>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Book New Slug for User
          </button>
        </div>
        <div className="w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search slugs or names..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-teal-500 shadow-sm transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      ) : filteredSlugs.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Premium Slugs Found</h3>
          <p className="text-sm text-slate-500">There are currently no records with a registered custom slug.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap rounded-tl-xl">Premium Slug</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Entity Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Category</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Tier (Est.)</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-100 shadow-sm">{doc.customSlug}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{doc.name || "Unnamed"}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{doc.district}, {doc.state}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{doc.category || "General"}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        Global Root
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {baseCategoryPath && (
                          <a target="_blank" rel="noopener noreferrer" href={categoryUrl} title="View Category URL" className="w-8 h-8 bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 rounded flex items-center justify-center text-slate-500 transition-colors shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                          </a>
                        )}
                        <a target="_blank" rel="noopener noreferrer" href={globalUrl} title="View Global Root URL" className="w-8 h-8 bg-teal-50 border border-teal-200 hover:border-teal-600 hover:bg-teal-600 hover:text-white rounded flex items-center justify-center text-teal-700 transition-colors shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                        </a>
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
  );
}
