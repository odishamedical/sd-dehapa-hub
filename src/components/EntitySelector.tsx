"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ConnectionService } from '@/services/connection.service';
import * as Icons from 'lucide-react';

interface EntitySelectorProps {
  targetEntity: string;
  placeholder?: string;
  selectedItems: { id: string; name: string }[];
  onChange: (items: { id: string; name: string }[]) => void;
  currentUserId: string; // Used as initiatorId
  currentUserRole: string;
  currentUserName: string;
}

export default function EntitySelector({ targetEntity, placeholder, selectedItems, onChange, currentUserId, currentUserRole, currentUserName }: EntitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSelect = async (item: any) => {
    if ((selectedItems || []).find(s => s.id === item.id)) return; // Already selected
    
    const newItems = [...(selectedItems || []), { id: item.id, name: item.name }];
    onChange(newItems);
    setSearchQuery("");
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

  const handleRemove = (idToRemove: string) => {
    const newItems = (selectedItems || []).filter(s => s.id !== idToRemove);
    onChange(newItems);
    // Note: We don't automatically delete the connection doc to maintain history, 
    // it just gets removed from this specific roster array.
  };

  return (
    <div className="w-full relative">
      {/* Selected Items */}
      {(selectedItems || []).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {(selectedItems || []).map(item => (
            <div key={item.id} className="flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg border border-teal-200">
              <span className="text-sm font-bold">{item.name}</span>
              <button onClick={() => handleRemove(item.id)} className="text-teal-500 hover:text-teal-800 focus:outline-none">
                <Icons.X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icons.Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder || `Search for ${targetEntity}...`}
          className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl pl-10 pr-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Icons.Loader2 className="h-5 w-5 text-teal-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {results.length > 0 && searchQuery.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-2xl border border-slate-200 max-h-60 overflow-y-auto">
          {results.map((res, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.preventDefault(); handleSelect(res); }}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center justify-between group focus:outline-none"
            >
              <div>
                <div className="font-bold text-slate-800">{res.name}</div>
                <div className="text-xs text-slate-500">{res.city || 'Verified Profile'}</div>
              </div>
              <div className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Add to Roster +
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
