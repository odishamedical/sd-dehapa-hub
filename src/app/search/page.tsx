"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, MapPin, Filter, ShieldCheck, Star, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialType = searchParams.get('type') || 'all';
  const initialQuery = searchParams.get('q') || '';
  const initialCountry = searchParams.get('country') || 'India';
  const initialState = searchParams.get('state') || '';
  const initialDistrict = searchParams.get('district') || '';

  const [type, setType] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [country, setCountry] = useState(initialCountry);
  const [state, setState] = useState(initialState);
  const [district, setDistrict] = useState(initialDistrict);

  // Firebase Data States
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update state when URL params change
  useEffect(() => {
    setType(searchParams.get('type') || 'all');
    setSearchQuery(searchParams.get('q') || '');
    setCountry(searchParams.get('country') || 'India');
    setState(searchParams.get('state') || '');
    setDistrict(searchParams.get('district') || '');
  }, [searchParams]);

  // Fetch from Firebase
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, 'directory'));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const mappedData = docsData.map((d: any) => ({
          id: d.id,
          type: d.category ? d.category.toLowerCase() : 'unknown',
          name: d.name || "Unknown Entity",
          subtitle: d.subCategory || d.specialty || d.category || "Service Provider",
          location: `${d.city || d.district || "Unknown"}, ${d.state || "Odisha"}`,
          rating: d.rating || 0,
          verified: d.verified || false,
          experience: d.experience,
          beds: d.beds,
          tests: d.tests,
          delivery: d.delivery,
          response: d.response,
          country: d.country || "India",
          state: d.state || "Odisha",
          district: d.district || "Unknown",
        }));

        setResults(mappedData);
      } catch (err: any) {
        console.error("Error fetching search results:", err);
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const handleCountryChange = (val: string) => {
    setCountry(val);
    if (val !== 'India') {
      setState('');
      setDistrict('');
    }
  };

  const handleStateChange = (val: string) => {
    setState(val);
    if (val !== 'Odisha') {
      setDistrict('');
    }
  };

  const handleUpdateFilter = () => {
    const params = new URLSearchParams();
    if (type !== 'all') params.append('type', type);
    if (searchQuery) params.append('q', searchQuery);
    if (country) params.append('country', country);
    if (state) params.append('state', state);
    if (district) params.append('district', district);
    
    router.push(`/search?${params.toString()}`);
  };

  const filteredResults = results.filter(item => {
    if (type !== "all" && item.type !== type) return false;
    if (searchQuery) {
      const queryTerms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      const name = item.name.toLowerCase();
      const subtitle = item.subtitle.toLowerCase();
      
      const matches = queryTerms.every(term => name.includes(term) || subtitle.includes(term));
      if (!matches) return false;
    }
    
    // Cascading Location Logic Match
    if (district && item.district.toLowerCase() !== district.toLowerCase()) return false;
    if (state && item.state.toLowerCase() !== state.toLowerCase()) return false;
    if (country && item.country.toLowerCase() !== country.toLowerCase()) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-24">
      {/* Header Area */}
      <div className="bg-teal-900 text-white pt-24 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 150%, #14b8a6 0%, transparent 50%)' }}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-teal-200 hover:text-white text-sm font-bold uppercase tracking-widest mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Search Results
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-teal-800/50 border border-teal-700/50 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-300" />
              <span className="capitalize">{type === 'all' ? 'All Services' : type}</span>
            </div>
            <div className="bg-teal-800/50 border border-teal-700/50 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-300" />
              <span>{district ? district + ', ' : ''}{state ? state + ', ' : ''}{country}</span>
            </div>
            {searchQuery && (
              <div className="bg-teal-800/50 border border-teal-700/50 px-4 py-2 rounded-full text-sm font-medium">
                "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar: Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 uppercase tracking-widest text-sm">Refine Search</h3>
                <Filter className="w-4 h-4 text-slate-400" />
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Listing Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
                    <option value="all">All Services</option>
                    <option value="doctor">Doctors</option>
                    <option value="hospital">Hospitals</option>
                    <option value="ambulance">Ambulances</option>
                    <option value="pharmacy">Pharmacies</option>
                    <option value="lab">Pathology Labs</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Search</label>
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name, specialty..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location</label>
                  <div className="space-y-2">
                    <select value={country} onChange={(e) => handleCountryChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">United Kingdom</option>
                      <option value="UAE">UAE</option>
                      <option value="Australia">Australia</option>
                      <option value="Canada">Canada</option>
                      <option value="Other">Other</option>
                    </select>
                    
                    {country === 'India' ? (
                      <select value={state} onChange={(e) => handleStateChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
                        <option value="">Any State</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Delhi">Delhi</option>
                      </select>
                    ) : (
                      <input 
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Enter State"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      />
                    )}

                    {country === 'India' && state === 'Odisha' ? (
                      <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
                        <option value="">Any District</option>
                        <option value="Bhubaneswar">Bhubaneswar</option>
                        <option value="Cuttack">Cuttack</option>
                        <option value="Puri">Puri</option>
                        <option value="Rourkela">Rourkela</option>
                      </select>
                    ) : (
                      <input 
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Enter District/City"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      />
                    )}
                  </div>
                </div>

                <button onClick={handleUpdateFilter} className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md">
                  Update Results
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Results Grid */}
          <div className="lg:col-span-3">
            
            <div className="mb-6 flex justify-between items-center">
              <p className="text-slate-500 font-medium">Found {loading ? "..." : filteredResults.length} result(s) for your search.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {loading ? (
                <div className="col-span-full py-20 flex justify-center items-center">
                  <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="col-span-full py-20 text-center bg-red-50 rounded-3xl border border-red-100 shadow-sm">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-red-900 mb-2">Database Error</h3>
                  <p className="text-red-500 max-w-sm mx-auto">{error}</p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Results Found</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any listings matching your specific filters. Try broadening your location or entity type.</p>
                </div>
              ) : (
                filteredResults.map(result => (
                  <div key={result.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 group flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 text-2xl shadow-inner">
                        {result.type === 'doctor' && '👨‍⚕️'}
                        {result.type === 'hospital' && '🏥'}
                        {result.type === 'lab' && '🔬'}
                        {result.type === 'pharmacy' && '💊'}
                        {result.type === 'ambulance' && '🚑'}
                        {result.type === 'unknown' && '✨'}
                      </div>
                      <div className="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-amber-100">
                        <Star className="w-3 h-3 fill-current" /> {result.rating}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-teal-600 transition-colors">{result.name}</h3>
                    <p className="text-teal-600 font-bold text-xs uppercase tracking-wider mb-4">{result.subtitle}</p>
                    
                    <div className="space-y-2 mb-6 mt-auto">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{result.location}</span>
                      </div>
                      {result.verified ? (
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-600 font-medium">DehaPa Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                           <Activity className="w-4 h-4 text-slate-400" />
                           <span className="text-slate-500 font-medium">Standard Listing</span>
                        </div>
                      )}
                    </div>

                    <Link href={result.type === 'doctor' ? `/portal/book?doctor=${result.id}` : "#"} className="w-full py-3 bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white text-center font-bold text-sm uppercase tracking-widest rounded-xl transition-all block shadow-sm hover:shadow-md">
                      View Profile
                    </Link>
                  </div>
                ))
              )}

            </div>
            
            <div className="mt-8 text-center bg-teal-50 rounded-2xl p-8 border border-teal-100">
               <h4 className="text-teal-900 font-bold mb-2">Can't find what you're looking for?</h4>
               <p className="text-teal-700 text-sm mb-4">Our concierge team can help you find the right provider.</p>
               <button onClick={() => window.dispatchEvent(new Event('open-telemedicine-fab'))} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-105">
                 Contact Concierge
               </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
