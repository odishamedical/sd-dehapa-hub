"use client";

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface PremiumSlugModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentUglyUrl: string;
}

export default function PremiumSlugModal({ isOpen, onClose, currentName, currentUglyUrl }: PremiumSlugModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  if (!isOpen) return null;

  // Generate clean example URL
  const cleanName = currentName.toLowerCase().replace(/^dr\.?\s*/, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const exampleCleanUrl = cleanName ? `dehapa.com/${cleanName}` : 'dehapa.com/your-name';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // Simulate slight delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Check Firestore to see if slug exists
      const q = query(collection(db, 'directory'), where("customSlug", "==", searchTerm.toLowerCase()));
      const snap = await getDocs(q);
      setIsAvailable(snap.empty);

      // Generate some suggestions
      const newSuggestions = [];
      const baseSearch = searchTerm.toLowerCase();
      
      if (!baseSearch.includes('-')) {
        if (baseSearch.startsWith('dr') && baseSearch.length > 2) {
          newSuggestions.push(`dr-${baseSearch.substring(2)}`);
        } else {
          newSuggestions.push(`dr-${baseSearch}`);
        }
      }
      newSuggestions.push(`${baseSearch}-clinic`);
      newSuggestions.push(`${baseSearch}-odisha`);
      
      setSuggestions(newSuggestions);

    } catch (err) {
      console.error("Error checking slug availability", err);
      setIsAvailable(false); // Default to safe if error
    }

    setHasSearched(true);
    setIsSearching(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Decorative Background */}
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 z-0">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }}></div>
        </div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className="relative z-10 p-8 sm:p-12 pb-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">Reserve Your Dedicated Identity</h2>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto font-medium">Your Name is your Identity. Reserve it before someone else does.</p>
        </div>

        <div className="relative z-10 bg-white px-8 sm:px-12 py-8 flex-1">
          
          {/* Current Ugly URL Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Current Web Address
                </p>
                <p className="text-slate-500 text-sm mb-1">Right now, your profile is hidden behind a long, hard-to-remember link:</p>
                <div className="bg-white border border-amber-200 px-4 py-2 rounded-lg text-amber-900 font-mono text-xs sm:text-sm break-words shadow-inner">
                  {currentUglyUrl}
                </div>
              </div>
              <div className="shrink-0 text-center md:text-right">
                <p className="text-sm font-bold text-slate-700 mb-1">Make it clean.</p>
                <p className="text-lg font-serif font-bold text-teal-700">{exampleCleanUrl}</p>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto mb-10">
            <div className="flex items-center bg-white border-2 border-slate-300 focus-within:border-teal-500 rounded-2xl shadow-lg overflow-hidden transition-colors h-16">
              <div className="px-6 border-r border-slate-200 bg-slate-50 h-full flex items-center text-slate-500 font-bold text-lg">
                dehapa.com/
              </div>
              <input 
                type="text" 
                placeholder="e.g. apollo-hospital or dr-sandeep" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}
                className="flex-1 px-6 h-full outline-none text-xl font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
              />
              <button 
                type="submit" 
                disabled={isSearching || !searchTerm.trim()}
                className="h-full px-8 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-lg transition-colors flex items-center gap-2"
              >
                {isSearching ? (
                  <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : "Search"}
              </button>
            </div>
            <p className="text-center text-slate-500 text-sm mt-3">Only letters, numbers, and hyphens allowed.</p>
          </form>

          {/* Results Area */}
          {hasSearched && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              {!isAvailable ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Sorry, <span className="text-red-600">/{searchTerm}</span> is taken.</h3>
                  <p className="text-slate-600">Another provider has already reserved this premium URL. Try a different variation.</p>
                </div>
              ) : (
                <div>
                  <div className="text-center mb-8">
                    <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      Great news! "{searchTerm}" is available.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Tier 1: State Level */}
                    <div className="border-2 border-slate-200 hover:border-slate-300 rounded-2xl p-6 bg-white transition-colors relative flex flex-col">
                      <h4 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-4">Location URL</h4>
                      <p className="font-mono text-sm text-slate-900 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100 break-words">
                        dehapa.com/india/odisha/<span className="font-bold text-teal-600">{searchTerm}</span>
                      </p>
                      <div className="mt-auto">
                        <p className="text-3xl font-bold text-slate-900 mb-1">₹500<span className="text-sm text-slate-500 font-normal">/yr</span></p>
                        <p className="text-xs text-slate-500 mb-6">Standard localized routing.</p>
                        <button className="w-full py-3 bg-white border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 font-bold rounded-xl transition-all">Select</button>
                      </div>
                    </div>

                    {/* Tier 2: Category Level */}
                    <div className="border-2 border-teal-500 rounded-2xl p-6 bg-teal-50/30 relative flex flex-col shadow-xl shadow-teal-900/5 transform md:-translate-y-4">
                      <div className="absolute -top-3 inset-x-0 flex justify-center">
                        <span className="bg-teal-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">Recommended</span>
                      </div>
                      <h4 className="text-teal-700 font-bold uppercase tracking-widest text-xs mb-4 mt-2">Category URL</h4>
                      <p className="font-mono text-sm text-slate-900 mb-6 bg-white p-3 rounded-lg border border-teal-100 shadow-sm break-words">
                        dehapa.com/doctor/<span className="font-bold text-teal-700">{searchTerm}</span>
                      </p>
                      <div className="mt-auto">
                        <p className="text-3xl font-bold text-slate-900 mb-1">₹2,000<span className="text-sm text-slate-500 font-normal">/yr</span></p>
                        <p className="text-xs text-slate-500 mb-6">Stand out within your specialty.</p>
                        <button className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all">Select</button>
                      </div>
                    </div>

                    {/* Tier 3: Global Root Level */}
                    <div className="border-2 border-amber-400 rounded-2xl p-6 bg-gradient-to-b from-amber-50 to-white relative flex flex-col shadow-lg">
                      <div className="absolute top-4 right-4">
                        <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                      </div>
                      <h4 className="text-amber-700 font-bold uppercase tracking-widest text-xs mb-4">Global Elite URL</h4>
                      <p className="font-mono text-sm text-slate-900 mb-6 bg-white p-3 rounded-lg border border-amber-200 shadow-sm break-words">
                        dehapa.com/<span className="font-bold text-amber-600">{searchTerm}</span>
                      </p>
                      <div className="mt-auto">
                        <p className="text-3xl font-bold text-slate-900 mb-1">₹10,000<span className="text-sm text-slate-500 font-normal">/yr</span></p>
                        <p className="text-xs text-slate-500 mb-6">Maximum global SEO visibility.</p>
                        <button className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg transition-all">Select</button>
                      </div>
                    </div>

                  </div>
                  
                  {/* Suggestions Block */}
                  {suggestions.length > 0 && (
                    <div className="mt-10 border-t border-slate-200 pt-8">
                      <h4 className="text-slate-600 font-bold mb-4 text-sm uppercase tracking-widest">Suggested Variations</h4>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {suggestions.map((sug, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => {
                              setSearchTerm(sug);
                              const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                              // Need to wrap in setTimeout to allow state to update before searching
                              setTimeout(() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 10);
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-800 rounded-lg text-sm font-bold transition-all"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
