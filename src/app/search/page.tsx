"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, Filter } from "lucide-react";
import V2Hero from "@/components/v2/V2Hero";
import SquareTicket from "@/components/v2/SquareTicket";
import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";

function SearchEngineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL State Syncing
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [country, setCountry] = useState(searchParams.get('country') || 'India');
  const [state, setState] = useState(searchParams.get('state') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');

  // Mobile Filter Modal State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Firebase Data States
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state when URL params change
  useEffect(() => {
    setType(searchParams.get('type') || 'all');
    setSearchQuery(searchParams.get('q') || '');
    setCountry(searchParams.get('country') || 'India');
    setState(searchParams.get('state') || '');
    setDistrict(searchParams.get('district') || '');
  }, [searchParams]);

  // Fetch Live Data from Firebase
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'directory'));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const mappedData = docsData.map((d: any) => {
          const name = d.name || d.legalName || d.basicInfo?.fullName || d.firstName || "Unknown Entity";
          const subtitle = d.subCategory || d.specialty || d.category || d.basicInfo?.specialityName || "Service Provider";
          const city = d.city || d.district || "Unknown";
          const state = d.state || "Odisha";
          const country = d.country || "India";
          
          const searchableString = `${name} ${subtitle} ${city} ${state} ${country} ${d.category || ''}`.toLowerCase();

          return {
            id: d.id,
            type: d.category ? d.category.toLowerCase() : 'unknown',
            name: name,
            subtitle: subtitle,
            location: `${city}, ${state}`,
            rating: d.rating || "4.8", // Default for demo
            country: country,
            state: state,
            district: d.district || "Unknown",
            searchableString: searchableString
          };
        });

        setResults(mappedData);
      } catch (err) {
        console.error("Error fetching search results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Update URL parameters to trigger a new search shareable link
  const handleUpdateFilter = () => {
    const params = new URLSearchParams();
    if (type !== 'all') params.append('type', type);
    if (searchQuery) params.append('q', searchQuery);
    if (country) params.append('country', country);
    if (state) params.append('state', state);
    if (district) params.append('district', district);
    
    router.push(`/v2/search?${params.toString()}`);
    setIsMobileFilterOpen(false); // Close modal on apply
  };

  // Client-Side Filtering Engine
  const filteredResults = results.filter(item => {
    if (type !== "all" && item.type !== type) return false;
    if (searchQuery) {
      const queryTerms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      const matches = queryTerms.every(term => item.searchableString.includes(term));
      if (!matches) return false;
    }
    if (district && item.district.toLowerCase() !== district.toLowerCase()) return false;
    if (state && item.state.toLowerCase() !== state.toLowerCase()) return false;
    if (country && item.country.toLowerCase() !== country.toLowerCase()) return false;

    return true;
  });

  // Extracted Filter UI to reuse in both Sidebar and Mobile Modal
  const renderFilters = () => (
    <div className="space-y-6">
      {/* Keyword Search */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Search</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Names, specialties..."
            className="w-full bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl pl-9 pr-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Listing Type Dropdown */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type</label>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)} 
          className="w-full bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all shadow-inner appearance-none"
        >
          <option value="all">All Services</option>
          <option value="doctor">Doctors</option>
          <option value="hospital">Hospitals</option>
          <option value="ambulance">Ambulances</option>
          <option value="pharmacy">Pharmacies</option>
          <option value="lab">Pathology Labs</option>
        </select>
      </div>

      {/* 5-Tier Location: State */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">State</label>
        <div className="relative">
          <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select 
            value={state} 
            onChange={(e) => setState(e.target.value)}
            className="w-full bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl pl-9 pr-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all shadow-inner appearance-none"
          >
            <option value="">All States</option>
            <option value="Odisha">Odisha</option>
          </select>
        </div>
      </div>

      {/* 5-Tier Location: District */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">District</label>
        <select 
          value={district} 
          onChange={(e) => setDistrict(e.target.value)}
          disabled={!state}
          className="w-full bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all shadow-inner disabled:opacity-50 appearance-none"
        >
          <option value="">All Districts</option>
          <option value="Khordha">Khordha</option>
          <option value="Cuttack">Cuttack</option>
          <option value="Ganjam">Ganjam</option>
          <option value="Puri">Puri</option>
        </select>
      </div>

      {/* Apply Filter Button */}
      <button 
        onClick={handleUpdateFilter}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all mt-4"
      >
        Apply Filters
      </button>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Shared Modular Hero (Search Bar Disabled to prevent duplication with Sidebar) */}
      <V2Hero 
        titleStart="Find"
        highlight="Specialists"
        subtitle="Search thousands of verified medical professionals across the state."
        showSearch={false}
        desktopBgImage="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=2000&h=600"
        mobileBgImage="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800&h=800"
      />

      {/* 2-Column Search Layout */}
      <div className="w-full max-w-[1400px] px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* ==============================
            LEFT: THE GLASS SIDEBAR (Hidden on Mobile)
            ============================== */}
        <div className="hidden lg:block w-1/4 flex-shrink-0">
          <div className="bg-[linear-gradient(135deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.2)_100%)] backdrop-blur-2xl border border-white/50 rounded-3xl p-6 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),0_15px_35px_rgba(0,100,200,0.08)] sticky top-24">
            
            <div className="flex items-center justify-between mb-6 border-b border-white/40 pb-4">
              <h3 className="font-black text-[#0a2540] text-xl">Filters</h3>
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            
            {renderFilters()}
          </div>
        </div>

        {/* ==============================
            RIGHT: THE RESULTS GRID 
            ============================== */}
        <div className="w-full lg:w-3/4 flex flex-col">
          <div className="mb-6 flex justify-between items-end border-b border-white/40 pb-2">
            <h2 className="text-2xl font-black text-[#0a2540]">Search Results</h2>
            <span className="text-sm font-bold text-slate-500">{filteredResults.length} Found</span>
          </div>

          {loading ? (
            <div className="w-full flex justify-center py-20">
               <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((item) => (
                <SquareTicket 
                  key={item.id}
                  title={item.name}
                  subtitle={item.subtitle}
                  rating={item.rating}
                  icon={item.type === 'hospital' ? '🏥' : item.type === 'pharmacy' ? '💊' : '👨‍⚕️'}
                  href={`/v2/${item.type}/${item.id}`}
                  actionText="View Profile"
                />
              ))}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-20 bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 text-center px-4">
              <span className="text-6xl mb-4">🔍</span>
              <h3 className="text-xl font-black text-slate-700 mb-2">No results found</h3>
              <p className="text-slate-500 font-medium">Try adjusting your filters or searching for a different term.</p>
              <button 
                onClick={() => router.push('/v2/search')}
                className="mt-6 text-blue-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ==============================
          MOBILE FLOATING FILTER BUTTON
          ============================== */}
      <div className="fixed bottom-6 right-6 lg:hidden z-40">
        <button 
          onClick={() => setIsMobileFilterOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-[0_10px_25px_rgba(37,99,235,0.5)] flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Filter className="w-6 h-6" />
        </button>
      </div>

      {/* ==============================
          MOBILE BOTTOM SHEET MODAL
          ============================== */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="relative w-full bg-[linear-gradient(135deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.7)_100%)] backdrop-blur-3xl border-t border-white/80 rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-12 max-h-[85vh] overflow-y-auto slide-up-animation">
            
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
            </div>

            <div className="flex items-center justify-between mb-6 border-b border-white/40 pb-4">
              <h3 className="font-black text-[#0a2540] text-2xl">Refine Search</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-slate-500 font-bold bg-white/50 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            </div>
            
            {renderFilters()}
          </div>
        </div>
      )}

      <style jsx>{`
        .slide-up-animation {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function V2SearchPage() {
  return (
    <div className="min-h-screen pb-20 relative">
      <Suspense fallback={
        <div className="w-full h-screen flex items-center justify-center bg-transparent">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <SearchEngineContent />
      </Suspense>
    </div>
  );
}
