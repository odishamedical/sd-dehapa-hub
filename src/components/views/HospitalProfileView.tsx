"use client";

import React from 'react';
import Link from 'next/link';

import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { useState, useEffect, use } from 'react';

import CategoryNav from '@/components/CategoryNav';
import Breadcrumb from '@/components/Breadcrumb';
import UnverifiedBanner from '@/components/UnverifiedBanner';
import { generateUniversalSeoUrl } from '@/lib/urlHelpers';
import { TicketConfig } from '@/lib/ticketConfig';
import TicketCard from '@/components/TicketCard';
import PhoneRevealButton from '@/components/PhoneRevealButton';
import InlineEditField from '@/components/InlineEditField';
import InlineEditArray from '@/components/InlineEditArray';
import { updateDoc } from 'firebase/firestore';

export default function HospitalProfileView({ id, customSlug }: { id?: string, customSlug?: string }) {
  const [hospital, setHospital] = useState<any>(null);
  const [similarEntities, setSimilarEntities] = useState<any[]>([]);
  const [topHospitals, setTopHospitals] = useState<any[]>([]);
  const [nearbyCenters, setNearbyCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const handleInlineSave = async (field: string, value: any) => {
    if (!hospital || !hospital.id) return;
    try {
      const docRef = doc(db, 'directory', hospital.id);
      await updateDoc(docRef, { [field]: value });
      setHospital((prev: any) => ({ ...prev, [field]: value }));
    } catch (err) {
      console.error("Failed to save field:", err);
      alert("Failed to save changes.");
    }
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        let docSnap: any;
        let docId = id;
        
        if (customSlug) {
          const q = query(collection(db, 'directory'), where('customSlug', '==', customSlug), limit(1));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            docSnap = querySnapshot.docs[0];
            docId = docSnap.id;
          }
        } else if (id) {
          const docRef = doc(db, 'directory', id);
          docSnap = await getDoc(docRef);
        }
        
        if (docSnap && docSnap.exists && docSnap.exists() || (docSnap && docSnap.data)) {
          const rawData = docSnap.data();
          const notVerified = "Not available (Not verified)";
          const docData = {
            id: docId,
            name: rawData.identityData?.hospitalName || rawData.name || "Unknown Hospital",
            specialty: rawData.identityData?.type || rawData.category || "Hospital",
            experience: rawData.identityData?.establishedYear ? `Since ${rawData.identityData.establishedYear}` : notVerified,
            rating: rawData.rating || 4.5,
            reviews: rawData.reviews || 0,
            image: rawData.identityData?.logo || rawData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawData.identityData?.hospitalName || rawData.name || "Hospital")}&background=0f766e&color=fff&size=150`,
            verified: rawData.verified || false,
            about: rawData.identityData?.about || notVerified,
            banner: "https://images.unsplash.com/photo-1551076805-e18690c5e53b?auto=format&fit=crop&w=1200&q=80",
            
            // Clinic/Location Mapping
            clinic: {
              name: rawData.identityData?.hospitalName || notVerified,
              address: rawData.locationData?.localAddress || rawData.address || notVerified,
              phone: rawData.locationData?.receptionPhone || rawData.phone || notVerified,
              website: rawData.identityData?.website || rawData.website || notVerified,
              mapUrl: rawData.locationData?.mapUrl || `https://maps.google.com/maps?q=${encodeURIComponent(rawData.locationData?.localAddress || rawData.identityData?.hospitalName || 'Odisha')}&t=&z=15&ie=UTF8&iwloc=&output=embed`
            },
            
            city: rawData.locationData?.city || rawData.city || "Odisha",
            
            // Hospital Specific Array Fields
            departments: rawData.departments || [],
            infrastructure: rawData.infrastructureData || {},
            insuranceNetworks: rawData.insuranceNetworks || [],
            rosterDoctors: rawData.rosterDoctors || [],
            healthPackages: rawData.healthPackages || [],
            
            // Auth Check
            ownerEmail: rawData.identityData?.contactEmail || rawData.ownerEmail || null,
            galleryImages: rawData.galleryImages || []
          };
          setHospital(docData);

          // Check if current user can edit
          if (typeof window !== 'undefined') {
            const currentUserEmail = localStorage.getItem("sd_current_user_email");
            if (currentUserEmail === "odishamedical@gmail.com" || currentUserEmail === docData.ownerEmail) {
              setCanEdit(true);
            }
          }
          
          // Fetch sidebar widgets safely without needing complex indexes
          try {
            const cityQuery = query(
              collection(db, 'directory'),
              where("city", "==", rawData.city || ""),
              limit(30)
            );
            const citySnap = await getDocs(cityQuery);
            const allCityDocs = citySnap.docs.map(d => ({ id: d.id, ...d.data() as any })).filter(d => d.id !== docId);
            
            setSimilarEntities(allCityDocs.filter(d => d.subCategory === rawData.subCategory).slice(0, 3));
            setTopHospitals(allCityDocs.filter(d => d.category === "Hospital").slice(0, 3));
            setNearbyCenters(allCityDocs.filter(d => d.category !== "Hospital" && d.category !== "Hospital").slice(0, 3));
          } catch (e) {
            console.error("Failed to fetch sidebar widgets", e);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id, customSlug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"></div></div>;
  }

  if (!hospital) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><div className="text-center"><h2 className="text-2xl font-bold text-slate-900 mb-2">Hospital Not Found</h2><Link href="/hospitals" className="text-teal-600 hover:underline">Return to Directory</Link></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      <CategoryNav />
      
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="w-full max-w-[1920px] mx-auto">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: hospital.city || "Odisha", href: "/hospitals" },
            { name: "Hospitals", href: "/hospitals" },
            { name: hospital.specialty || "Specialist", href: "/hospitals" },
            { name: hospital.name }
          ]} />
        </div>
      </div>
      
      {canEdit && (
        <div className="bg-slate-900 text-white px-6 py-2 sticky top-[72px] z-40 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            <span className="font-bold text-sm">You have access to edit this profile</span>
          </div>
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${isEditMode ? 'bg-teal-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isEditMode ? 'Disable Edit Mode' : 'Enable Edit Mode'}
          </button>
        </div>
      )}

      {/* Banner Area */}
      <div className="w-full h-64 md:h-80 relative bg-teal-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-teal-700 opacity-90 z-10"></div>
        <img 
          src={hospital.banner} 
          alt="Clinic Banner" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 xl:px-16 relative -mt-24 z-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left & Center Content (75% Width) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Unified Header Card */}
            <TicketCard 
              entity={hospital} 
              config={TicketConfig.hospital} 
              isEditMode={isEditMode}
              onSave={handleInlineSave}
            />

            {/* Google Extracted Image Gallery */}
            {hospital.galleryImages?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Hospital Photos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {hospital.galleryImages.map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-200">
                      <img src={img} alt={`Hospital Photo ${idx + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Unverified Banner */}
            {!hospital.verified && (
              <UnverifiedBanner entityType="hospital" claimUrl={`/portal/claim?id=${hospital.id}`} />
            )}

            {/* 2-Column Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-8">

                {/* Health Packages */}
                {hospital.healthPackages?.length > 0 && (
                  <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-teal-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 translate-y-1/2"></div>
                    
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                      <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                      Preventive Health Packages
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                      {hospital.healthPackages.map((pkg: any, idx: number) => (
                        <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 hover:bg-white/15 transition-all group">
                          <h3 className="text-lg font-bold text-white mb-2">{pkg.packageName}</h3>
                          <p className="text-sm text-teal-100 mb-4 line-clamp-2">{pkg.description}</p>
                          
                          <div className="mb-4">
                            <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-2">Included Tests</p>
                            <div className="flex flex-wrap gap-1.5">
                              {pkg.includedTests.split(',').map((test: string, tIdx: number) => (
                                <span key={tIdx} className="bg-black/20 text-white text-[10px] font-medium px-2 py-1 rounded border border-white/10">
                                  {test.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-end justify-between mt-6 pt-4 border-t border-white/10">
                            <div>
                              <p className="text-xs text-slate-400 line-through mb-0.5">₹{pkg.price}</p>
                              <p className="text-2xl font-bold text-cyan-400">₹{pkg.discountedPrice}</p>
                            </div>
                            <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-lg">
                              Book Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* About */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative group">
                  {isEditMode && <div className="absolute top-4 right-4 bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Editable</div>}
                  <h2 className="text-xl font-bold text-slate-900 mb-4">About the Hospital</h2>
                  <div className="text-slate-600 leading-relaxed text-sm">
                    <InlineEditField 
                      value={hospital.about} 
                      onSave={(val) => handleInlineSave('about', val)} 
                      isEditMode={isEditMode} 
                      type="textarea"
                    />
                  </div>
                </div>

                {/* Specialties / Departments */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative group">
                  {isEditMode && <div className="absolute top-4 right-4 bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Editable</div>}
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Departments & Specialties</h2>
                  {hospital.departments?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {hospital.departments.map((dept: any, idx: number) => (
                        <span key={idx} className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-teal-100">
                          {dept.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No departments listed.</p>
                  )}
                </div>

                {/* Infrastructure & Facilities */}
                {Object.keys(hospital.infrastructure || {}).length > 0 && ['nursing_home', 'corporate_hospital'].includes(hospital.specialty) && (
                  <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      Infrastructure & Facilities
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {hospital.infrastructure.bedCapacity && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Bed Capacity</p>
                          <p className="text-lg font-bold text-slate-900">{hospital.infrastructure.bedCapacity} Beds</p>
                        </div>
                      )}
                      {hospital.infrastructure.icuCount && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">ICU Units</p>
                          <p className="text-lg font-bold text-slate-900">{hospital.infrastructure.icuCount} Units</p>
                        </div>
                      )}
                      {hospital.infrastructure.hasEmergency && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-2 col-span-2">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">24/7 Emergency Services Available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Insurance & TPA */}
                {hospital.insuranceNetworks?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                      Accepted Insurance & TPAs
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {hospital.insuranceNetworks.map((ins: any, idx: number) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200">
                          {ins.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              <div className="space-y-8">
                
                {/* Rostered Doctors */}
                {hospital.rosterDoctors?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                      Our Doctors
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {hospital.rosterDoctors.map((docObj: any, idx: number) => (
                        <Link href={`/doctors/${docObj.id}`} key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-white hover:border-teal-200 hover:shadow-md transition-all group flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-xl shrink-0 border border-teal-200">👨‍⚕️</div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">{docObj.name}</h4>
                            <p className="text-xs text-slate-600 mt-0.5">{docObj.department || "Specialist"}</p>
                            {docObj.status === "Pending" && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full mt-1 inline-block font-bold">Invite Pending</span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Right Sidebar: Ecosystem (25% Width) */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-[100px]">
            
            {/* Advertisement Placeholder (Hidden until ads are injected) */}
            {false && (
              <div className="w-full h-64 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center shadow-inner">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Advertisement</span>
                <p className="text-sm text-slate-500 font-medium">Google AdSense / Internal Promo Block</p>
              </div>
            )}

            {/* Similar Doctors */}
            {similarEntities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  Recommended Hospitals in {hospital.city}
                </h3>
                <div className="flex flex-col gap-4">
                  {similarEntities.map((sim, idx) => (
                    <Link key={idx} href={generateUniversalSeoUrl(sim, 'hospitals')} className="bg-slate-50 hover:bg-teal-50 rounded-xl p-3 flex items-center gap-3 group transition-colors border border-slate-100 hover:border-teal-100">
                      <img src={sim.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(sim.name || "Doc")}&background=0f766e&color=fff`} alt={sim.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-teal-700 transition-colors">{sim.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] font-bold text-yellow-600">⭐ {sim.rating || 4.5}</span>
                          <span className="text-[10px] font-bold text-slate-400">({sim.reviews || 0})</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Top Hospitals */}
            {topHospitals.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  Top Hospitals in {hospital.city}
                </h3>
                <div className="flex flex-col gap-4">
                  {topHospitals.map((hosp, idx) => (
                    <Link key={idx} href={`/hospitals/${hosp.id}`} className="bg-slate-50 hover:bg-teal-50 rounded-xl p-3 flex items-center gap-3 group transition-colors border border-slate-100 hover:border-teal-100">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-teal-700 transition-colors">{hosp.name}</h4>
                        <p className="text-xs text-slate-500 truncate mt-1">{hosp.address || hosp.district}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Care Centers */}
            {nearbyCenters.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                  Nearby Care Centers
                </h3>
                <div className="flex flex-col gap-4">
                  {nearbyCenters.map((center, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-3 flex flex-col gap-1 border border-slate-100">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{center.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{center.category} • {center.address || center.district}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
