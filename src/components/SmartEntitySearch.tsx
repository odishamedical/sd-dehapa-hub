"use client";

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

interface SmartEntitySearchProps {
  category: "Hospital" | "College"; // What type of entity are we searching for?
  placeholder: string;
  value: string; // The text value (name of hospital/college)
  onChangeText: (text: string) => void;
  onSelectEntity: (id: string, name: string) => void;
}

export default function SmartEntitySearch({ category, placeholder, value, onChangeText, onSelectEntity }: SmartEntitySearchProps) {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (text: string) => {
    setSearchTerm(text);
    onChangeText(text); // Keep parent updated with raw text
    
    if (text.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    try {
      // Create a case-insensitive prefix search trick for Firebase
      // or just fetch by category and filter client-side for better UX if dataset is small
      // We will do a basic query for the category and filter client side
      // In production with large datasets, Algolia or full-text search is better.
      const q = query(collection(db, 'directory'), where("category", "==", category), limit(50));
      const snap = await getDocs(q);
      
      const rawMatches = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const matches = rawMatches.filter((d: any) => 
        (d.name || "").toLowerCase().includes(text.toLowerCase())
      );
      
      setResults(matches.slice(0, 5));
    } catch (err) {
      console.error("Search error", err);
    }
    setIsSearching(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input 
          type="text" 
          className="sd-input-v3 py-3 w-full pr-10" 
          placeholder={placeholder} 
          value={searchTerm} 
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin inline-block"></span>
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            DehaPa Database
          </div>
          {results.map((res, i) => (
            <button 
              key={i}
              onClick={() => {
                setSearchTerm(res.name);
                onChangeText(res.name);
                onSelectEntity(res.id, res.name);
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-slate-800 text-sm group-hover:text-teal-700">{res.name}</div>
                <div className="text-xs text-slate-500">{res.city || 'Location N/A'}</div>
              </div>
              <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">
                Link
              </span>
            </button>
          ))}
        </div>
      )}
      
      {showDropdown && results.length === 0 && searchTerm.length >= 2 && !isSearching && (
         <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-center">
           <p className="text-sm text-slate-500 font-medium">No verified {category.toLowerCase()} found.</p>
           <p className="text-xs text-slate-400 mt-1">We will save your text entry anyway.</p>
         </div>
      )}
    </div>
  );
}
