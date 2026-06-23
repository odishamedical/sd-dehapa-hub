"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ConnectionService } from '@/services/connection.service';
import * as Icons from 'lucide-react';

export type RosterItem = {
  id: string; // Firebase ID if verified, or random uuid if unverified
  type: 'verified' | 'unverified';
  name: string;
  phone?: string;
  qualification?: string;
  experience?: string;
  department?: string;
};

interface HybridEntitySelectorProps {
  targetEntity: string;
  placeholder?: string;
  selectedItems: RosterItem[];
  onChange: (items: RosterItem[]) => void;
  currentUserId: string; // Used as initiatorId & ref host
  currentUserRole: string;
  currentUserName: string;
}

export default function HybridEntitySelector({ 
  targetEntity, 
  placeholder, 
  selectedItems = [], 
  onChange, 
  currentUserId, 
  currentUserRole, 
  currentUserName 
}: HybridEntitySelectorProps) {
  
  // Search & Verified State
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Unverified/Ghost Form State
  const [showManualForm, setShowManualForm] = useState(false);
  const [ghostData, setGhostData] = useState({
    qualification: '',
    experience: '',
    department: '',
    phone: ''
  });

  // Fuzzy Search Effect
  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const q = query(
          collection(db, "directory"),
          where("type", "==", targetEntity.toLowerCase()),
          where("isPublished", "==", true)
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Simple client side text search filter
        const filtered = fetched.filter((item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
        setResults(filtered);
      } catch (err) {
        console.error("Search error:", err);
      }
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchQuery, targetEntity]);

  const handleSelectVerified = async (item: any) => {
    if (selectedItems.find(s => s.id === item.id)) return;
    
    const newItem: RosterItem = { 
      id: item.id, 
      type: 'verified', 
      name: item.name 
    };
    
    onChange([...selectedItems, newItem]);
    setSearchQuery("");
    setResults([]);
    setShowManualForm(false);

    // Automatically trigger Connection Request!
    if (currentUserId && item.id) {
      try {
        await ConnectionService.requestConnection({
          initiatorId: currentUserId,
          initiatorRole: currentUserRole,
          initiatorName: currentUserName,
          receiverId: item.id,
          receiverRole: item.type,
          receiverName: item.name,
        });
      } catch (error) {
        console.error("Auto-connection failed", error);
      }
    }
  };

  const handleAddGhost = () => {
    if (!searchQuery.trim() || !ghostData.phone.trim()) {
      alert("Name and Phone Number are strictly required.");
      return;
    }

    const newGhostId = `ghost_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newItem: RosterItem = {
      id: newGhostId,
      type: 'unverified',
      name: searchQuery.trim(),
      phone: ghostData.phone.trim(),
      qualification: ghostData.qualification.trim(),
      experience: ghostData.experience.trim(),
      department: ghostData.department.trim()
    };

    onChange([...selectedItems, newItem]);
    
    // Reset
    setSearchQuery("");
    setGhostData({ qualification: '', experience: '', department: '', phone: '' });
    setShowManualForm(false);
  };

  const handleRemove = (idToRemove: string) => {
    const newItems = selectedItems.filter(s => s.id !== idToRemove);
    onChange(newItems);
  };

  const getWhatsAppLink = (doctor: RosterItem) => {
    if (!doctor.phone) return '#';
    // Format message
    const rawMsg = `Hello ${doctor.name}, ${currentUserName} has added you to their Roster on DehaPa. Claim your verified profile and connect with us here: https://dehapa.com/join/doctor?refHostId=${currentUserId}`;
    const encodedMsg = encodeURIComponent(rawMsg);
    // Sanitize phone (remove non-digits, ensure country code if indian standard)
    let sanitizedPhone = doctor.phone.replace(/\D/g, '');
    if (sanitizedPhone.length === 10) sanitizedPhone = `91${sanitizedPhone}`;
    return `https://wa.me/${sanitizedPhone}?text=${encodedMsg}`;
  };

  return (
    <div className="w-full relative space-y-4">
      
      {/* Search Input Box */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl relative z-20 shadow-sm">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Search or Add New Doctor</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icons.Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder || `Type doctor name...`}
            className="w-full bg-white border border-slate-200 focus:border-cyan-500 rounded-xl pl-10 pr-5 py-3 shadow-inner outline-none transition-all"
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Icons.Loader2 className="h-5 w-5 text-cyan-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Smart DB Matches */}
        {results.length > 0 && searchQuery.length >= 2 && !showManualForm && (
          <div className="mt-2 bg-white rounded-xl shadow-lg border border-slate-200 max-h-60 overflow-y-auto relative z-30">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Icons.CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Verified DehaPa Matches Found
            </div>
            {results.map((res, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); handleSelectVerified(res); }}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center justify-between group focus:outline-none"
              >
                <div>
                  <div className="font-bold text-slate-800">{res.name}</div>
                  <div className="text-xs text-slate-500">{res.city || 'Verified Profile'}</div>
                </div>
                <div className="text-xs font-bold text-cyan-600 bg-cyan-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  Add & Connect +
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Show Manual Entry Trigger if searching but no exact selection made */}
        {searchQuery.length >= 2 && !showManualForm && (
          <div className="mt-3 text-center">
            <p className="text-sm text-slate-500 mb-2">Doctor not listed above?</p>
            <button 
              onClick={(e) => { e.preventDefault(); setShowManualForm(true); }}
              className="text-cyan-600 font-bold hover:text-cyan-700 underline text-sm"
            >
              Add Unverified Doctor Manually
            </button>
          </div>
        )}

        {/* Manual Ghost Form */}
        {showManualForm && (
          <div className="mt-4 bg-slate-100 border border-slate-300 p-4 rounded-xl animate-in slide-in-from-top-2 relative z-10">
            <h4 className="font-bold text-slate-700 text-sm mb-4">Add Unverified Doctor</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Phone Number <span className="text-rose-500">*</span></label>
                <input 
                  type="tel" 
                  value={ghostData.phone}
                  onChange={e => setGhostData({...ghostData, phone: e.target.value})}
                  placeholder="Required for WhatsApp invite"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Department</label>
                <input 
                  type="text" 
                  value={ghostData.department}
                  onChange={e => setGhostData({...ghostData, department: e.target.value})}
                  placeholder="e.g. Cardiology"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Qualifications</label>
                <input 
                  type="text" 
                  value={ghostData.qualification}
                  onChange={e => setGhostData({...ghostData, qualification: e.target.value})}
                  placeholder="e.g. MBBS, MD"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Experience (Years)</label>
                <input 
                  type="number" 
                  value={ghostData.experience}
                  onChange={e => setGhostData({...ghostData, experience: e.target.value})}
                  placeholder="e.g. 10"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={(e) => { e.preventDefault(); setShowManualForm(false); }}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); handleAddGhost(); }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-bold shadow-md"
              >
                Save Doctor
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Items (The Roster) */}
      {selectedItems.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h4 className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2">Current Roster ({selectedItems.length})</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {selectedItems.map((item) => (
              <div key={item.id} className={`flex flex-col p-3 rounded-xl border ${item.type === 'verified' ? 'bg-cyan-50/50 border-cyan-100' : 'bg-slate-50 border-slate-200'}`}>
                
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    {item.type === 'verified' ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                        <Icons.CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                        <Icons.Clock className="w-3 h-3" /> Unverified
                      </span>
                    )}
                  </div>
                  <button onClick={(e) => { e.preventDefault(); handleRemove(item.id); }} className="text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg transition-colors">
                    <Icons.Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details (If unverified) */}
                {item.type === 'unverified' && (
                  <div className="text-xs text-slate-500 mb-3 space-y-0.5">
                    {item.department && <div><span className="font-semibold">Dept:</span> {item.department}</div>}
                    {(item.qualification || item.experience) && (
                      <div>{item.qualification} {item.experience ? `• ${item.experience} yrs exp.` : ''}</div>
                    )}
                  </div>
                )}

                {/* WhatsApp Invite Button for Unverified */}
                {item.type === 'unverified' && item.phone && (
                  <a 
                    href={getWhatsAppLink(item)} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-auto inline-flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    <Icons.MessageCircle className="w-4 h-4" />
                    Invite via WhatsApp
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
