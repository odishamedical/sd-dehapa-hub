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
    <Link href={`/doctors/${data.id}`} className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start group relative overflow-hidden block">
      {/* Availability Accent Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${data.available ? 'bg-teal-500' : 'bg-slate-300'}`}></div>

      {/* Left: Avatar */}
      <div className="relative shrink-0 pl-2">
        <img src={data.image} alt={data.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-sm group-hover:border-teal-50 transition-colors" />
        {data.verified && (
          <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm" title="Verified Professional">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
        )}
      </div>
      
      {/* Center: Info */}
      <div className="flex-1 text-center md:text-left min-w-0">
        <h3 className="text-xl font-bold text-slate-900 truncate mb-1 group-hover:text-teal-700 transition-colors">{data.name}</h3>
        <p className="text-teal-600 font-bold text-sm mb-3 truncate">{data.specialty}</p>
        
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
          <span className="bg-slate-50 text-slate-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-slate-200">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {data.experience} Experience
          </span>
          <span className="bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-yellow-100">
            ⭐ {data.rating} <span className="text-yellow-600/70 ml-1">({data.reviews})</span>
          </span>
        </div>
        
        <p className="text-slate-500 text-sm flex items-start justify-center md:justify-start gap-1">
          <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span className="truncate"><strong className="text-slate-700">{data.hospital}</strong> • {data.address}</span>
        </p>
      </div>
      
      {/* Right: Actions */}
      <div className="w-full md:w-auto flex flex-col justify-center gap-3 shrink-0 md:border-l md:border-slate-100 md:pl-8 md:py-2">
        <div className="text-center md:text-right mb-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Consultation Fee</p>
          <p className="text-2xl font-bold text-slate-900">{typeof data.fee === 'number' || !isNaN(Number(data.fee)) ? `₹${data.fee}` : data.fee}</p>
        </div>
        
        <div className="w-full bg-teal-600 group-hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all text-center shadow-lg shadow-teal-500/30">
          Book Consultation
        </div>
        
        {!data.verified && (
          <div className="w-full bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-600 font-bold py-2.5 px-6 rounded-xl text-xs transition-all text-center group-hover/claim:text-teal-600">
            Verify Your Service
          </div>
        )}
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
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans selection:bg-teal-500/30">
      <CategoryNav />
      
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="w-full max-w-[1920px] mx-auto">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: "Odisha" },
            { name: "Doctors" }
          ]} />
        </div>
      </div>

      {/* Premium Hero Search */}
      <div className="bg-slate-900 pt-16 pb-24 px-6 relative overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Find the Best <span className="text-teal-400">Specialists</span> in Odisha
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
            Book a secure FHIR-compliant video consultation or in-clinic visit with verified medical experts.
          </p>
          
          {/* Floating Search Bar */}
          <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
             <div className="flex-1 relative">
                <svg className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input 
                  type="text" 
                  placeholder="Search by doctor name, specialty, or symptoms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none pl-14 pr-4 py-4 text-base text-slate-900 focus:outline-none focus:ring-0 placeholder:text-slate-400"
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
          <div className="w-full lg:w-1/4 lg:sticky lg:top-[100px] h-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
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
              <div className="flex flex-col gap-4">
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
