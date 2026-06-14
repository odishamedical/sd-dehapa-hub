"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EcosystemSwitcher from '@/components/EcosystemSwitcher';
import ProfileBlockerModal from '@/components/ProfileBlockerModal';
import { useTenant } from '@/components/TenantContext';
import CategoryNav from '@/components/CategoryNav';
import Breadcrumb from '@/components/Breadcrumb';
import DirectorySidebarFilter from '@/components/DirectorySidebarFilter';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const PremiumDoctorTicket = ({ data }: { data: any }) => {
  return (
    <Link href={`/doctors/${data.id}`} className="relative h-[220px] rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group block border border-slate-300/50">
      {/* Background Metal Gradient (Right Side Base) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e2e8f0] via-[#f1f5f9] to-[#cbd5e1] group-hover:to-[#94a3b8] transition-colors"></div>
      
      {/* Optional: Faint Map Watermark */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

      <div className="flex h-full relative z-10">
        {/* Left Side: Image (32% width) */}
        <div className="w-[32%] relative shrink-0 h-full bg-slate-200">
          <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
          
          {/* Thick Metallic Swoosh Frame */}
          <svg className="absolute top-0 -right-[2px] h-full drop-shadow-[-6px_0_10px_rgba(0,0,0,0.3)] z-20" preserveAspectRatio="none" viewBox="0 0 100 100" style={{ width: '60px' }}>
            <defs>
              <linearGradient id="metalEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" /> {/* dark edge shadow */}
                <stop offset="25%" stopColor="#f8fafc" /> {/* bright highlight */}
                <stop offset="60%" stopColor="#94a3b8" /> {/* mid metal */}
                <stop offset="100%" stopColor="#e2e8f0" /> {/* blends into right side */}
              </linearGradient>
            </defs>
            <path d="M100,0 H40 C-10,30 -10,70 40,100 H100 Z" fill="url(#metalEdge)" />
          </svg>
        </div>
        
        {/* Right Side: Data (68% width) */}
        <div className="flex-1 py-4 pr-4 pl-6 flex flex-col min-w-0 relative z-30">
          
          <div className="min-w-0 mb-1">
            <h3 className="text-base md:text-lg font-extrabold text-slate-800 truncate">{data.name}</h3>
            <p className="text-slate-600 text-[11px] md:text-xs font-semibold truncate">{data.specialty}</p>
          </div>
          
          <div className="flex flex-col gap-1.5 mb-auto mt-2">
            <span className="text-slate-700 text-[11px] font-bold flex items-center gap-1.5 truncate">
              <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              {data.hospital || "Independent Practitioner"}
            </span>
            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5 truncate">
              <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {data.district || "Angul"}
            </span>
            <div className="flex items-center gap-4 text-[11px] mt-0.5">
               <span className="text-amber-500 font-bold flex items-center gap-0.5">
                 ⭐ {data.rating}
               </span>
               <span className="text-slate-500 flex items-center gap-1">
                 💬 {data.reviews} Ratings
               </span>
            </div>
          </div>
          
          {/* Verification Badge */}
          <div className="mt-1 mb-3">
            {data.verified ? (
              <span className="inline-flex bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                ✓ Verified Partner
              </span>
            ) : (
              <span className="inline-flex bg-slate-200/80 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-300">
                Verification Pending
              </span>
            )}
          </div>
          
          {/* Bottom Controls */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-300/50 mt-auto">
            <div className="shrink-0 mr-2">
              <p className="text-[8px] uppercase tracking-widest text-slate-500">Fee</p>
              <p className="text-sm font-bold text-slate-800">{typeof data.fee === 'number' || !isNaN(Number(data.fee)) ? `₹${data.fee}` : data.fee}</p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {!data.verified && (
                <div className="bg-transparent hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-2 md:px-3 rounded border border-slate-400 text-[10px] transition-colors whitespace-nowrap hidden sm:block">
                  Verify Now
                </div>
              )}
              <div className="bg-[#1e293b] hover:bg-black text-white font-bold py-1.5 px-3 md:px-4 rounded text-[10px] transition-all shadow-md whitespace-nowrap">
                Book Consult
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </Link>
  );
};

export const dynamic = 'force-dynamic';

export default function DoctorsDirectory() {
  const router = useRouter();
  const { activeTenant } = useTenant();
  const [search, setSearch] = useState("");
  const [showProfileBlocker, setShowProfileBlocker] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Removed orderBy to prevent any Missing Index errors
        const q = query(collection(db, 'directory'));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Map the backend schema to what PremiumDoctorTicket expects
        const mappedData = docsData.map((d: any) => ({
          id: d.id,
          name: d.name || "Unknown Doctor",
          specialty: d.subCategory || d.category || "Specialist",
          experience: d.experience || "Google Verified", 
          rating: d.rating || 0,
          reviews: d.reviews || 0,
          hospital: d.clinicName || d.city || d.district || "Odisha",
          address: d.address || "No Address Provided",
          fee: d.fee || "Contact Clinic", 
          image: d.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || "Doc")}&background=0f766e&color=fff&size=150`,
          verified: d.verified || false,
          available: true,
          phone: d.phone,
          district: d.district || "Unknown"
        }));

        setDoctors(mappedData);
      } catch (err: any) {
        console.error("Error fetching directory:", err);
        setFetchError(err.message || "Unknown Firebase Error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const nameMatch = doc.name ? doc.name.toLowerCase().includes(search.toLowerCase()) : false;
    const specMatch = doc.specialty ? doc.specialty.toLowerCase().includes(search.toLowerCase()) : false;
    const searchMatch = nameMatch || specMatch;
    
    if (selectedDistricts.length > 0) {
      if (!selectedDistricts.includes(doc.district)) return false;
    }
    return searchMatch;
  });
  
  const uniqueDistricts = Array.from(new Set(doctors.map(d => d.district).filter(d => d !== "Unknown"))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-blue-200 text-slate-900 font-sans selection:bg-teal-500/30">
      <CategoryNav />
      
      <div className="bg-white/60 backdrop-blur-md border-b border-white/50 px-6 py-3 shadow-sm">
        <div className="w-full max-w-[1920px] mx-auto">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: "Odisha" },
            { name: "Doctors" }
          ]} />
        </div>
      </div>

      {/* Premium Hero Search */}
      <div className="pt-16 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6 drop-shadow-sm">
            Find the Best <span className="text-teal-600">Specialists</span> in Odisha
          </h1>
          <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto">
            Book a secure FHIR-compliant video consultation or in-clinic visit with verified medical experts.
          </p>
          
          {/* Floating Search Bar */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-2 shadow-xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
             <div className="flex-1 relative">
                <svg className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input 
                  type="text" 
                  placeholder="Search by doctor name, specialty, or symptoms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none pl-14 pr-4 py-4 text-base text-slate-900 focus:outline-none focus:ring-0 placeholder:text-slate-500 font-medium"
                />
             </div>
             <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all shadow-lg hidden md:block">
               Search
             </button>
          </div>
        </div>
      </div>

      <main className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 xl:px-16 py-12 relative z-10 -mt-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar Filters - 25% */}
          <div className="w-full lg:w-1/4 lg:sticky lg:top-[100px] h-auto bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              Smart Filters
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Popular Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {["❤️ Cardiology", "🧠 Neurology", "🦴 Orthopedics", "👶 Pediatrics", "🦷 Dentistry"].map(spec => (
                    <button key={spec} className="bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 hover:border-teal-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors">
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Locality / District</label>
                <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {uniqueDistricts.map((dist: any) => (
                    <label key={dist} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer" 
                        checked={selectedDistricts.includes(dist)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedDistricts([...selectedDistricts, dist]);
                          else setSelectedDistricts(selectedDistricts.filter(d => d !== dist));
                        }}
                      />
                      <span className="text-sm font-semibold text-slate-700">{dist}</span>
                    </label>
                  ))}
                  {uniqueDistricts.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No locations available.</p>
                  )}
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Availability</label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded border-2 border-slate-300 group-hover:border-teal-500 flex items-center justify-center transition-colors"></div>
                  <span className="text-sm font-semibold text-slate-700">Available Today</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group mt-3">
                  <div className="w-5 h-5 rounded border-2 border-slate-300 group-hover:border-teal-500 flex items-center justify-center transition-colors"></div>
                  <span className="text-sm font-semibold text-slate-700">Video Consult</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Content - 75% */}
          <div className="w-full lg:w-3/4 flex flex-col gap-6">
            
            {/* Design Preview Section - Shows strictly ONE ticket as a template to avoid blank screen */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : fetchError ? (
              <div className="text-center py-20 bg-red-50 border-2 border-dashed border-red-200 rounded-2xl shadow-sm">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <p className="text-red-900 font-bold text-lg mb-1">Database Read Error</p>
                  <p className="text-sm text-red-600 max-w-lg mx-auto font-mono bg-white p-4 rounded-lg mt-4 border border-red-200 text-left">{fetchError}</p>
                  <p className="text-xs text-slate-500 mt-4">Screenshot this error to the agent so they can fix Firebase Rules.</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <>
                <div className="mb-4 border-2 border-dashed border-teal-200 bg-teal-50/30 p-6 rounded-2xl relative shadow-sm">
                  <div className="absolute -top-3 left-6 bg-teal-500 text-white text-[10px] px-4 py-1 font-bold uppercase rounded-full shadow-md flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Design Template Preview (Waiting for Real Data)
                  </div>
                  <PremiumDoctorTicket data={{
                      id: "mock123",
                      name: "Dr. Sandeep Sharma",
                      specialty: "Cardiology & Internal Medicine",
                      experience: "15+ Years",
                      rating: 4.8,
                      reviews: 124,
                      hospital: "Apollo Hospitals",
                      address: "Unit 15, Near Sainik School, Bhubaneswar",
                      fee: 800,
                      image: "https://ui-avatars.com/api/?name=Dr+Sandeep+Sharma&background=0f766e&color=fff&size=150",
                      verified: false,
                      available: true
                  }} />
                </div>
                <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </div>
                  <p className="text-slate-900 font-bold text-lg mb-1">Database Empty</p>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">The crawler has not injected any live data yet. Once injected, listings will appear here in the premium ticket format.</p>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {filteredDoctors.map(doc => (
                  <PremiumDoctorTicket key={doc.id} data={doc} />
                ))}
              </div>
            )}



          </div>
        </div>
      </main>
      {showProfileBlocker && (
        <ProfileBlockerModal onClose={() => setShowProfileBlocker(false)} />
      )}
    </div>
  );
}
