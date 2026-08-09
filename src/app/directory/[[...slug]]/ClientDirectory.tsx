"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Filter, Star, ShieldCheck, Activity } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ClientDirectory({ 
  initialCountry = 'global', 
  initialState = '', 
  initialDistrict = '',
  initialCategory = ''
}: { 
  initialCountry?: string, 
  initialState?: string, 
  initialDistrict?: string,
  initialCategory?: string
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [category, setCategory] = useState(initialCategory || 'all');
  const [country, setCountry] = useState(initialCountry === 'global' ? 'India' : initialCountry);
  const [state, setState] = useState(initialState);
  const [district, setDistrict] = useState(initialDistrict);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const q = query(collection(db, 'directory'));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((d: any) => d.adminLocked !== true);

        const mappedData = docsData.map((d: any) => {
          const name = d.name || d.legalName || d.basicInfo?.fullName || d.firstName || "Unknown Entity";
          const subtitle = d.subCategory || d.specialty || d.category || d.basicInfo?.specialityName || "Service Provider";
          const city = d.city || d.district || "Unknown";
          const state = d.state || "Odisha";
          const country = d.country || "India";
          
          const tags = Array.isArray(d.tags) ? d.tags.join(' ') : '';
          const services = Array.isArray(d.services) ? d.services.join(' ') : '';
          const about = d.about || d.description || '';

          const searchableString = `${name} ${subtitle} ${city} ${state} ${country} ${tags} ${services} ${about} ${d.category || ''}`.toLowerCase();

          return {
            id: d.id,
            type: d.category ? d.category.toLowerCase() : 'unknown',
            name: name,
            subtitle: subtitle,
            location: `${city}, ${state}`,
            rating: d.rating || 0,
            verified: d.verified || false,
            country: country,
            state: state,
            district: city, // treat city as district
            searchableString: searchableString,
            profileImage: d.profileImage || d.logoUrl || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
            experience: d.experience,
          };
        });

        setResults(mappedData);
      } catch (err: any) {
        console.error("Error fetching search results:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, []);

  const handleUpdateFilter = () => {
    // Generate the URL based on the current filters
    let newUrl = "/directory";
    if (country && country !== 'global') {
      newUrl += `/${encodeURIComponent(country)}`;
      if (state) {
        newUrl += `/${encodeURIComponent(state)}`;
        if (district) {
          newUrl += `/${encodeURIComponent(district)}`;
          if (category && category !== 'all') {
            newUrl += `/${encodeURIComponent(category)}`;
          }
        }
      }
    } else if (category && category !== 'all') {
      // If no location but category exists, default country
      newUrl += `/india/odisha/any/${encodeURIComponent(category)}`;
    }
    router.push(newUrl);
  };

  const filteredResults = results.filter(item => {
    let matches = true;
    
    // Category match
    if (category !== "all" && item.type !== category.toLowerCase()) matches = false;
    
    // Search match
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!item.searchableString.includes(q)) matches = false;
    }

    // Location match
    if (country && country !== 'global') {
      if (item.country.toLowerCase() !== country.toLowerCase()) matches = false;
    }
    if (state) {
      if (item.state.toLowerCase() !== state.toLowerCase()) matches = false;
    }
    if (district && district !== 'any') {
      if (item.district.toLowerCase() !== district.toLowerCase()) matches = false;
    }

    return matches;
  });

  const formatLocation = (loc: string) => loc.charAt(0).toUpperCase() + loc.slice(1);
  const getHeading = () => {
    let base = category !== 'all' && category ? formatLocation(category) : "Healthcare Providers";
    if (district && district !== 'any') return `${base} in ${formatLocation(district)}`;
    if (state) return `Top ${base} in ${formatLocation(state)}`;
    if (country !== 'global' && country) return `Verified ${base} - ${formatLocation(country)}`;
    return "Global Healthcare Directory";
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header Area */}
      <div className="bg-blue-600 text-white pt-12 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 150%, #60a5fa 0%, transparent 50%)' }}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-teal-200 hover:text-white text-sm font-bold uppercase tracking-widest mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {getHeading()}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-blue-700/50 border border-blue-500/50 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-200" />
              <span className="capitalize">{category === 'all' ? 'All Services' : category}</span>
            </div>
            {country !== 'global' && (
              <div className="bg-blue-700/50 border border-blue-500/50 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-200" />
                <span className="capitalize">{district && district !== 'any' ? district + ', ' : ''}{state ? state + ', ' : ''}{country}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-20">
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
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-teal-500">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location</label>
                  <div className="space-y-2">
                    <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-teal-500">
                      <option value="global">Anywhere</option>
                      <option value="India">India</option>
                    </select>
                    
                    {country === 'India' && (
                      <select value={state} onChange={(e) => setState(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-teal-500">
                        <option value="">Any State</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                      </select>
                    )}

                    {country === 'India' && state === 'Odisha' && (
                      <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-teal-500">
                        <option value="">Any District</option>
                        <option value="Bhubaneswar">Bhubaneswar</option>
                        <option value="Cuttack">Cuttack</option>
                        <option value="Puri">Puri</option>
                        <option value="Rourkela">Rourkela</option>
                        <option value="Sambalpur">Sambalpur</option>
                        <option value="Jharsuguda">Jharsuguda</option>
                      </select>
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleUpdateFilter}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors text-sm tracking-wide"
                >
                  Apply SEO Filters
                </button>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResults.map((item) => (
                  <div key={item.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                    <Link href={`/profile/${item.type}/${item.id}`} className="block group flex-1">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden relative shrink-0">
                          <Image src={item.profileImage} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              {item.type}
                            </span>
                            {item.verified && (
                              <ShieldCheck className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-lg truncate group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-500 mb-2 truncate">{item.subtitle}</p>
                          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}</span>
                            {item.rating > 0 && (
                              <span className="flex items-center gap-1 text-amber-500"><Star className="w-3.5 h-3.5 fill-current" /> {item.rating}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <Link href={`/profile/${item.type}/${item.id}?action=book`} className="sd-btn-book w-full text-center block">
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  We couldn't find any {category !== 'all' ? category : 'services'} matching your search criteria in {district || state || country}. Try adjusting your filters.
                </p>
                <button 
                  onClick={() => { setCategory('all'); setCountry('global'); setState(''); setDistrict(''); setSearchQuery(''); router.push('/directory'); }}
                  className="mt-6 text-teal-600 font-bold hover:text-teal-700 text-sm"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
