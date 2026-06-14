"use client";

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface EntitySearchInputProps {
  category: string; // e.g. "college", "hospital", "association", "journal"
  placeholder: string;
  valueId: string; // The selected entity's ID
  valueName: string; // The selected entity's Name
  onChange: (id: string, name: string) => void;
  className?: string;
}

export default function EntitySearchInput({
  category,
  placeholder,
  valueId,
  valueName,
  onChange,
  className = ""
}: EntitySearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(valueName || "");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState<{id: string, name: string, status?: string}[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(valueName || "");
  }, [valueName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchTerm || searchTerm === valueName) {
      setResults([]);
      return;
    }

    const searchEntities = async () => {
      setIsSearching(true);
      try {
        const q = query(
          collection(db, 'directory'),
          where("category", "==", category)
        );
        const snapshot = await getDocs(q);
        const allEntities = snapshot.docs.map(d => ({ 
          id: d.id, 
          name: d.data().name || "",
          status: d.data().status
        }));

        // Client-side text search for better partial matching
        const filtered = allEntities.filter(e => 
          e.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setResults(filtered.slice(0, 10)); // Top 10 matches
      } catch (err) {
        console.error("Entity search failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchEntities, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, category, valueName]);

  const handleCreateGhostEntity = async () => {
    setIsSearching(true);
    try {
      const newRef = doc(collection(db, 'directory'));
      await setDoc(newRef, {
        id: newRef.id,
        name: searchTerm,
        category: category,
        status: "unverified_stub",
        source: "user_generated",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      onChange(newRef.id, searchTerm);
      setShowDropdown(false);
    } catch (err) {
      console.error("Failed to create ghost entity:", err);
      alert("Failed to create new entry. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const exactMatchExists = results.some(r => r.name.toLowerCase() === searchTerm.toLowerCase());

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
            if (e.target.value === "") {
              onChange("", ""); // Clear selection
            } else if (e.target.value !== valueName) {
              onChange("", ""); // Deselect if they start typing something else
            }
          }}
          onFocus={() => {
            if (searchTerm && searchTerm !== valueName) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition-all pr-10"
        />
        {isSearching && (
          <div className="absolute right-3 top-3.5">
            <svg className="animate-spin w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        )}
        {!isSearching && valueId && (
          <div className="absolute right-3 top-3.5 text-green-500" title="Linked to Database">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        )}
      </div>

      {showDropdown && searchTerm && !valueId && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {results.length > 0 && (
            <div className="p-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 pt-2 pb-1">Database Matches</p>
              {results.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    onChange(r.id, r.name);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors flex items-center justify-between group"
                >
                  <span>{r.name}</span>
                  {r.status === 'unverified_stub' ? (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">User Added</span>
                  ) : (
                    <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Verified</span>
                  )}
                </button>
              ))}
            </div>
          )}
          
          {!exactMatchExists && searchTerm.length > 2 && (
            <div className="p-2 border-t border-slate-100 bg-slate-50">
              <button
                onClick={handleCreateGhostEntity}
                className="w-full text-left px-4 py-3 text-sm text-slate-900 font-medium hover:bg-white border border-transparent hover:border-teal-200 hover:shadow-sm rounded-lg transition-all flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <span>Add <span className="font-bold">"{searchTerm}"</span> as a new entry</span>
              </button>
            </div>
          )}
          
          {results.length === 0 && exactMatchExists && (
            <div className="p-4 text-center text-sm text-slate-500">
              No results found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
