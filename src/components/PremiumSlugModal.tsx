"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface PremiumSlugModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentUglyUrl: string;
  isAdminMode?: boolean;
  onAdminBook?: (urls: CartItem[], ownerDetails: string) => void;
}

type Term = 'monthly' | '1yr' | '2yr' | '3yr';

interface CartItem {
  id: string; // e.g. "doctor-apollo"
  slug: string;
  type: string; // "Global", "Category", "Location"
  category?: string; // "doctor", "hospitals", "labs", "pharmacy"
  basePrice: number;
  urlPreview: string;
}

export default function PremiumSlugModal({ isOpen, onClose, currentName, currentUglyUrl, isAdminMode = false, onAdminBook }: PremiumSlugModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Cart & Subscription State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [term, setTerm] = useState<Term>('1yr');

  // Custom Location Builder State
  const [customLocations, setCustomLocations] = useState<CartItem[]>([]);
  const [isBuildingLocation, setIsBuildingLocation] = useState(false);
  const [locState, setLocState] = useState('westbengal');
  const [locCategory, setLocCategory] = useState('none');
  const [ownerContact, setOwnerContact] = useState("");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setHasSearched(false);
      setCart([]);
      setTerm('1yr');
      setCustomLocations([]);
      setIsBuildingLocation(false);
      setOwnerContact("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate clean example URL
  const cleanName = currentName.toLowerCase().replace(/^dr\.?\s*/, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const exampleCleanUrl = cleanName ? `dehapa.com/${cleanName}` : 'dehapa.com/your-name';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
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
      setIsAvailable(false);
    }

    setHasSearched(true);
    setIsSearching(false);
  };

  // Pricing Logic
  const calculateItemPrice = (basePrice: number) => {
    if (term === 'monthly') return Math.ceil(basePrice / 10); // 2000/yr -> 200/mo
    if (term === '1yr') return basePrice;
    if (term === '2yr') return Math.ceil(basePrice * 1.8); // 10% off 2 years
    if (term === '3yr') return Math.ceil(basePrice * 2.5); // 16% off 3 years
    return basePrice;
  };

  const termMultiplierForSavings = () => {
    if (term === 'monthly') return 1/10;
    if (term === '1yr') return 1;
    if (term === '2yr') return 2;
    if (term === '3yr') return 3;
    return 1;
  };

  const rawTotal = cart.reduce((sum, item) => sum + calculateItemPrice(item.basePrice), 0);
  const isCombo = cart.length >= 2;
  const comboDiscount = isCombo ? Math.ceil(rawTotal * 0.15) : 0;
  const finalTotal = rawTotal - comboDiscount;

  // Calculate generic savings
  const undiscountedBaseTotal = cart.reduce((sum, item) => sum + (item.basePrice * termMultiplierForSavings()), 0);
  const totalSavings = Math.ceil(undiscountedBaseTotal - finalTotal);

  const toggleCart = (item: CartItem) => {
    setCart(prev => {
      if (prev.find(i => i.id === item.id)) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  // Generate the table rows for the current search term
  const availableOptions: CartItem[] = hasSearched && isAvailable ? [
    { id: `doc-${searchTerm}`, slug: searchTerm, type: 'Category', category: 'Doctor', basePrice: 2000, urlPreview: `dehapa.com/doctor/${searchTerm}` },
    { id: `hosp-${searchTerm}`, slug: searchTerm, type: 'Category', category: 'Hospital', basePrice: 2000, urlPreview: `dehapa.com/hospitals/${searchTerm}` },
    { id: `lab-${searchTerm}`, slug: searchTerm, type: 'Category', category: 'Lab', basePrice: 2000, urlPreview: `dehapa.com/labs/${searchTerm}` },
    { id: `pharm-${searchTerm}`, slug: searchTerm, type: 'Category', category: 'Pharmacy', basePrice: 2000, urlPreview: `dehapa.com/pharmacies/${searchTerm}` },
    { id: `global-${searchTerm}`, slug: searchTerm, type: 'Global Elite', basePrice: 10000, urlPreview: `dehapa.com/${searchTerm}` },
    { id: `loc-${searchTerm}`, slug: searchTerm, type: 'Location', basePrice: 500, urlPreview: `dehapa.com/india/odisha/${searchTerm}` },
    ...customLocations
  ] : [];

  const handleAddCustomLocation = () => {
    let preview = `dehapa.com/india/${locState}`;
    if (locCategory !== 'none') preview += `/${locCategory}`;
    preview += `/${searchTerm}`;

    const newLoc: CartItem = {
      id: `custom-loc-${Date.now()}`,
      slug: searchTerm,
      type: 'Location',
      category: 'Custom',
      basePrice: 500,
      urlPreview: preview
    };
    
    setCustomLocations(prev => [...prev, newLoc]);
    setCart(prev => [...prev, newLoc]); // auto add to cart
    setIsBuildingLocation(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-4xl overflow-hidden sm:rounded-3xl shadow-2xl relative flex flex-col">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 shrink-0 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-center p-6 shadow-md">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }}></div>
          <button onClick={onClose} className="absolute top-4 right-4 z-50 w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">Reserve Your Dedicated Identity</h2>
            <p className="text-teal-100 text-sm sm:text-base font-medium">Your Name is your Identity. Reserve it before someone else does.</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-8 py-8">
          
          {/* Current Ugly URL Warning */}
          <div className="bg-white border border-amber-200 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Current Web Address
                </p>
                <p className="text-slate-500 text-sm mb-1">Right now, your profile is hidden behind a long, hard-to-remember link:</p>
                <div className="bg-slate-50 border border-amber-100 px-4 py-2 rounded-lg text-amber-900 font-mono text-xs sm:text-sm break-words">
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
            <div className="flex items-center bg-white border-2 border-slate-300 focus-within:border-teal-500 rounded-2xl shadow-sm overflow-hidden transition-colors h-14 sm:h-16">
              <div className="px-4 sm:px-6 border-r border-slate-200 bg-slate-50 h-full flex items-center text-slate-500 font-bold text-base sm:text-lg">
                dehapa.com/
              </div>
              <input 
                type="text" 
                placeholder="e.g. apollo or dr-sandeep" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}
                className="flex-1 px-4 sm:px-6 h-full outline-none text-lg sm:text-xl font-bold text-slate-900 placeholder:text-slate-300"
              />
              <button 
                type="submit" 
                disabled={isSearching || !searchTerm.trim()}
                className="h-full px-6 sm:px-8 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold transition-colors flex items-center gap-2"
              >
                {isSearching ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : "Search"}
              </button>
            </div>
          </form>

          {/* Search Results */}
          {hasSearched && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
              {!isAvailable ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Sorry, <span className="text-red-600">/{searchTerm}</span> is taken.</h3>
                  <p className="text-slate-600">Another provider has already reserved this premium URL. Try a different variation.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-teal-50 border-b border-teal-100 px-6 py-4 flex items-center gap-3">
                    <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <h3 className="text-lg font-bold text-teal-900">"{searchTerm}" is available!</h3>
                  </div>
                  
                  <div className="divide-y divide-slate-100">
                    {availableOptions.map(opt => {
                      const isSelected = cart.some(c => c.id === opt.id);
                      const isGlobal = opt.type === 'Global Elite';
                      return (
                        <label key={opt.id} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-6 cursor-pointer transition-colors hover:bg-slate-50 ${isSelected ? 'bg-teal-50/50' : ''}`}>
                          <div className="flex items-center gap-4 flex-1">
                            <div className="relative flex items-center justify-center shrink-0">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => toggleCart(opt)}
                                className="w-6 h-6 appearance-none border-2 border-slate-300 rounded-md checked:bg-teal-600 checked:border-teal-600 transition-colors"
                              />
                              {isSelected && <svg className="w-4 h-4 text-white absolute pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {isGlobal ? (
                                  <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    {opt.type}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                    {opt.type} {opt.category && `· ${opt.category}`}
                                  </span>
                                )}
                              </div>
                              <p className="font-mono text-sm sm:text-base text-slate-800 break-words font-medium">{opt.urlPreview}</p>
                            </div>
                          </div>
                          <div className="shrink-0 text-left sm:text-right pl-10 sm:pl-0">
                            <p className="text-xl font-bold text-slate-900">₹{opt.basePrice.toLocaleString()}<span className="text-xs text-slate-500 font-normal">/yr</span></p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Location Builder */}
                  <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-6 flex flex-col justify-center">
                    {!isBuildingLocation ? (
                      <button 
                        onClick={() => setIsBuildingLocation(true)}
                        className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center justify-center gap-2 py-2 px-4 border border-dashed border-teal-300 hover:border-teal-400 rounded-xl bg-white hover:bg-teal-50 transition-colors self-center mx-auto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Add another Location URL
                      </button>
                    ) : (
                      <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Build Location URL</h4>
                          <button onClick={() => setIsBuildingLocation(false)} className="text-slate-400 hover:text-red-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 items-end">
                          <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-slate-600 mb-1">State / Region</label>
                            <select value={locState} onChange={e => setLocState(e.target.value)} className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 text-sm focus:border-teal-500 outline-none transition-all shadow-sm">
                              <option value="westbengal">West Bengal</option>
                              <option value="bihar">Bihar</option>
                              <option value="jharkhand">Jharkhand</option>
                              <option value="chhattisgarh">Chhattisgarh</option>
                              <option value="andhrapradesh">Andhra Pradesh</option>
                              <option value="telangana">Telangana</option>
                              <option value="maharashtra">Maharashtra</option>
                              <option value="delhi">Delhi</option>
                            </select>
                          </div>
                          <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-slate-600 mb-1">Category (Optional)</label>
                            <select value={locCategory} onChange={e => setLocCategory(e.target.value)} className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 text-sm focus:border-teal-500 outline-none transition-all shadow-sm">
                              <option value="none">None (Root Location)</option>
                              <option value="doctor">Doctor</option>
                              <option value="hospitals">Hospital</option>
                              <option value="labs">Lab</option>
                              <option value="pharmacies">Pharmacy</option>
                            </select>
                          </div>
                          <button onClick={handleAddCustomLocation} className="w-full sm:w-auto px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap">
                            Add URL
                          </button>
                        </div>
                        <p className="font-mono text-xs text-slate-500 mt-3 bg-slate-50 p-2 rounded border border-slate-100">
                          Preview: dehapa.com/india/{locState}{locCategory !== 'none' ? `/${locCategory}` : ''}/{searchTerm}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Suggestions Block */}
              {suggestions.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h4 className="text-slate-500 font-bold mb-3 text-xs uppercase tracking-widest text-center">Suggested Variations</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.map((sug, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => {
                          setSearchTerm(sug);
                          setTimeout(() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 10);
                        }}
                        className="px-5 py-2 bg-white border-2 border-slate-200 hover:border-teal-500 text-slate-600 hover:text-teal-700 rounded-full text-sm font-bold transition-all shadow-sm"
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

        {/* Sticky Cart Footer */}
        {cart.length > 0 && (
          <div className="sticky bottom-0 z-50 shrink-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] p-4 sm:p-6 animate-in slide-in-from-bottom-full duration-300">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                  {cart.length}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">URLs Selected</p>
                  <select 
                    value={term}
                    onChange={(e) => setTerm(e.target.value as Term)}
                    className="mt-2 text-sm bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2 outline-none focus:border-teal-500 w-full sm:w-auto shadow-sm transition-all"
                  >
                    <option value="monthly">Monthly Subscription</option>
                    <option value="1yr">1 Year Plan</option>
                    <option value="2yr">2 Year Plan (10% Off)</option>
                    <option value="3yr">3 Year Plan (16% Off)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-0 border-slate-100 pt-4 md:pt-0">
                <div className="text-right">
                  {totalSavings > 0 && (
                    <p className="text-green-600 text-xs font-bold uppercase tracking-wider mb-0.5">
                      You save ₹{totalSavings.toLocaleString()}! {isCombo && "(Combo Applied)"}
                    </p>
                  )}
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 leading-none">
                    <span className="text-sm text-slate-500 font-normal mr-1">{term === 'monthly' ? '₹' : '₹'}</span>
                    {finalTotal.toLocaleString()}
                    <span className="text-sm text-slate-500 font-normal ml-1">{term === 'monthly' ? '/mo' : ''}</span>
                  </p>
                </div>
                {isAdminMode ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <input 
                      type="text" 
                      placeholder="User Email or WhatsApp" 
                      value={ownerContact}
                      onChange={e => setOwnerContact(e.target.value)}
                      className="w-full sm:w-64 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-teal-500 shadow-sm transition-all"
                    />
                    <button 
                      onClick={() => {
                        if (!ownerContact.trim()) {
                          alert("Please enter the user's Email or WhatsApp to assign these URLs.");
                          return;
                        }
                        if (onAdminBook) onAdminBook(cart, ownerContact);
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-colors shrink-0"
                    >
                      Book for User
                    </button>
                  </div>
                ) : (
                  <button className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 shrink-0 mt-4 md:mt-0">
                    Checkout
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
