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
  // Search & Verified State
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Unverified/Ghost Form State
  const [ghostData, setGhostData] = useState({
    prefix: 'Dr.',
    firstName: '',
    middleName: '',
    lastName: '',
    qualification: '',
    experience: '',
    phone: ''
  });

  // Fuzzy Search Effect
  useEffect(() => {
    // Search using the first name field
    const queryStr = ghostData.firstName.trim();
    if (queryStr.length < 2) {
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
        const filtered = fetched.filter((item: any) => item.name.toLowerCase().includes(queryStr.toLowerCase()));
        setResults(filtered);
      } catch (err) {
        console.error("Search error:", err);
      }
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [ghostData.firstName, targetEntity]);

  const handleSelectVerified = async (item: any) => {
    if (selectedItems.find(s => s.id === item.id)) return;
    
    const newItem: RosterItem = { 
      id: item.id, 
      type: 'verified', 
      name: item.name 
    };
    
    onChange([...selectedItems, newItem]);
    setResults([]);
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
    if (!ghostData.firstName.trim() || !ghostData.phone.trim()) {
      alert("First Name and Phone Number are strictly required.");
      return;
    }

    const fullName = `${ghostData.prefix} ${ghostData.firstName} ${ghostData.middleName ? ghostData.middleName + ' ' : ''}${ghostData.lastName}`.trim();
    const newGhostId = `ghost_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newItem: RosterItem = {
      id: newGhostId,
      type: 'unverified',
      name: fullName,
      phone: ghostData.phone.trim(),
      qualification: ghostData.qualification.trim(),
      experience: ghostData.experience.trim()
    };

    onChange([...selectedItems, newItem]);
    
    // Reset
    setGhostData({ prefix: 'Dr.', firstName: '', middleName: '', lastName: '', qualification: '', experience: '', phone: '' });
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
      
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl relative z-20 shadow-sm max-w-2xl">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Icons.UserPlus className="w-4 h-4 text-emerald-500" />
          Add Doctor to Roster
        </label>
        <p className="text-[10px] text-slate-400 mb-4">Type the doctor's name. If they are already on DehaPa, we will suggest their verified profile!</p>
        
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-5 relative">
          
          {/* Name Row with Smart Dropdown */}
          <div className="grid grid-cols-12 gap-3 relative">
            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">Prefix</label>
              <select 
                value={ghostData.prefix}
                onChange={e => setGhostData({...ghostData, prefix: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2.5 text-sm outline-none focus:border-cyan-500 transition-all"
              >
                <option>Dr.</option>
                <option>Prof.</option>
                <option>Asst. Prof.</option>
                <option>Assoc. Prof.</option>
              </select>
            </div>
            
            <div className="col-span-4 relative">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1 flex justify-between">
                <span>First Name <span className="text-rose-500">*</span></span>
                {isSearching && <Icons.Loader2 className="h-3 w-3 text-cyan-500 animate-spin" />}
              </label>
              <input 
                type="text" 
                value={ghostData.firstName}
                onChange={e => setGhostData({...ghostData, firstName: e.target.value})}
                placeholder="e.g. John"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-inner"
              />
              
              {/* SMART DROPDOWN ABSOLUTELY POSITIONED */}
              {results.length > 0 && ghostData.firstName.length >= 2 && (
                <div className="absolute top-full left-0 right-[-120%] mt-2 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-cyan-200 max-h-60 overflow-y-auto z-[100] animate-in slide-in-from-top-2">
                  <div className="px-4 py-2 bg-cyan-50/50 border-b border-cyan-100 text-xs font-bold text-cyan-700 uppercase tracking-widest flex items-center gap-2 sticky top-0 backdrop-blur-md">
                    <Icons.CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Verified Matches Found!
                  </div>
                  {results.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.preventDefault(); handleSelectVerified(res); setGhostData({...ghostData, firstName: '', middleName: '', lastName: ''}); }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center justify-between group focus:outline-none"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{res.name}</div>
                        <div className="text-xs text-slate-500">{res.city || 'Verified DehaPa Doctor'}</div>
                      </div>
                      <div className="text-xs font-bold text-white bg-cyan-600 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-sm">
                        Connect <Icons.Link className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-3">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">Middle</label>
              <input 
                type="text" 
                value={ghostData.middleName}
                onChange={e => setGhostData({...ghostData, middleName: e.target.value})}
                placeholder="Optional"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            <div className="col-span-3">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">Last Name</label>
              <input 
                type="text" 
                value={ghostData.lastName}
                onChange={e => setGhostData({...ghostData, lastName: e.target.value})}
                placeholder="e.g. Doe"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Qualifications</label>
              <input 
                type="text" 
                value={ghostData.qualification}
                onChange={e => setGhostData({...ghostData, qualification: e.target.value})}
                placeholder="e.g. MBBS, MD"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Experience (Yrs)</label>
              <input 
                type="number" 
                value={ghostData.experience}
                onChange={e => setGhostData({...ghostData, experience: e.target.value})}
                placeholder="e.g. 10"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1 bg-slate-50/80 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
            {/* Accent styling for phone box */}
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
            
            <label className="text-[10px] uppercase font-bold text-slate-700 tracking-widest flex items-center gap-1.5 mb-2">
              <Icons.Phone className="w-3.5 h-3.5 text-emerald-500" /> Phone Number <span className="text-rose-500">*</span>
            </label>
            <input 
              type="tel" 
              value={ghostData.phone}
              onChange={e => setGhostData({...ghostData, phone: e.target.value})}
              placeholder="Required to send WhatsApp invite"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500 transition-all shadow-sm"
            />
            <p className="text-[10px] text-slate-500 italic mt-2 flex items-start gap-1.5 leading-tight">
              <Icons.Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 
              Phone number is NOT visible to the public. It is securely stored and used exclusively to send an automated WhatsApp invite to the doctor.
            </p>
          </div>

          <button 
            onClick={(e) => { e.preventDefault(); handleAddGhost(); }}
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center gap-2"
          >
            <Icons.Plus className="w-4 h-4" />
            Add Doctor to Roster
          </button>
        </div>
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
