"use client";

import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TestItem {
  id?: string;
  category: string;
  name: string;
  price: string;
  turnaroundTime: string;
  instructions: string;
}

interface HybridTestMenuEditorProps {
  items: TestItem[];
  onChange: (items: TestItem[]) => void;
  labId: string;
}

const CATEGORIES = [
  "Blood Test / Pathology",
  "Urine / Stool Test",
  "X-Ray",
  "MRI Scan",
  "CT Scan",
  "Ultrasound / Sonography",
  "Cardiology (ECG/ECHO)",
  "Health Package",
  "Other"
];

export default function HybridTestMenuEditor({ items, onChange, labId }: HybridTestMenuEditorProps) {
  const [dictionary, setDictionary] = useState<{name: string, category: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<{name: string, category: string}[]>([]);
  
  const [newItem, setNewItem] = useState<TestItem>({
    category: "Blood Test / Pathology",
    name: "",
    price: "",
    turnaroundTime: "Same Day",
    instructions: "No fasting required"
  });

  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch global dictionary
  useEffect(() => {
    const fetchDictionary = async () => {
      try {
        const snap = await getDocs(collection(db, 'lab_test_dictionary'));
        const dict = snap.docs.map(doc => doc.data() as {name: string, category: string});
        setDictionary(dict);
      } catch (err) {
        console.error("Error fetching test dictionary:", err);
      }
    };
    fetchDictionary();
  }, []);

  // Handle outside click for suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter suggestions
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSuggestions([]);
      return;
    }
    const filtered = dictionary.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredSuggestions(filtered.slice(0, 5));
  }, [searchTerm, dictionary]);

  const handleAddTest = async () => {
    if (!newItem.name || !newItem.price) return;

    // Check if it exists in dictionary, if not, add it for future users
    const exists = dictionary.some(t => t.name.toLowerCase() === newItem.name.toLowerCase());
    if (!exists) {
      try {
        await addDoc(collection(db, 'lab_test_dictionary'), {
          name: newItem.name,
          category: newItem.category,
          addedByLab: labId,
          createdAt: serverTimestamp()
        });
        setDictionary([...dictionary, { name: newItem.name, category: newItem.category }]);
      } catch (e) {
        console.error("Failed to add to dictionary", e);
      }
    }

    onChange([...items, { ...newItem, id: Date.now().toString() }]);
    
    // Reset form
    setNewItem({
      category: "Blood Test / Pathology",
      name: "",
      price: "",
      turnaroundTime: "Same Day",
      instructions: "No fasting required"
    });
    setSearchTerm("");
    setShowSuggestions(false);
  };

  const handleRemove = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="w-full">
      <h4 className="font-bold text-slate-800 mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
        <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
        Diagnostic Test Menu
      </h4>

      {/* Add New Test Form */}
      <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-slate-200 mb-8 shadow-sm">
        <h5 className="font-bold text-slate-700 mb-4 text-xs uppercase tracking-wider">Add a Test or Package</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Category</label>
            <select 
              value={newItem.category}
              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="relative" ref={searchRef}>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Test Name</label>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setNewItem({...newItem, name: e.target.value});
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="e.g. Lipid Profile, MRI Brain..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
            
            {/* Auto-Suggest Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {filteredSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setNewItem({...newItem, name: sug.name, category: sug.category});
                      setSearchTerm(sug.name);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex flex-col border-b border-slate-50 last:border-0"
                  >
                    <span className="font-bold text-slate-800">{sug.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase">{sug.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Price (₹)</label>
            <input 
              type="number"
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price: e.target.value})}
              placeholder="e.g. 500"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Turnaround Time (TAT)</label>
            <input 
              type="text"
              value={newItem.turnaroundTime}
              onChange={(e) => setNewItem({...newItem, turnaroundTime: e.target.value})}
              placeholder="e.g. 4 Hours, Same Day"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Fasting / Patient Instructions</label>
            <input 
              type="text"
              value={newItem.instructions}
              onChange={(e) => setNewItem({...newItem, instructions: e.target.value})}
              placeholder="e.g. 10-12 hours fasting required"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>

        <button 
          onClick={handleAddTest}
          disabled={!newItem.name || !newItem.price}
          className="mt-6 w-full bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
        >
          Add Test to Menu
        </button>
      </div>

      {/* Active Test List */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm group">
            <div className="mb-3 sm:mb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-md">
                  {item.category}
                </span>
                <span className="text-xs font-bold text-teal-600">₹{item.price}</span>
              </div>
              <h5 className="font-bold text-slate-800">{item.name}</h5>
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-medium text-slate-700">TAT:</span> {item.turnaroundTime} • <span className="font-medium text-slate-700">Rules:</span> {item.instructions}
              </p>
            </div>
            <button 
              onClick={() => handleRemove(idx)}
              className="p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
            <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            <p className="text-sm font-medium text-slate-500">No tests added yet.</p>
            <p className="text-xs text-slate-400 mt-1">Add your first test using the form above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
