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
import PhoneRevealButton from '@/components/PhoneRevealButton';
import InlineEditField from '@/components/InlineEditField';
import InlineEditArray from '@/components/InlineEditArray';
import { updateDoc } from 'firebase/firestore';

export default function LabProfileView({ id, customSlug }: { id?: string, customSlug?: string }) {
  const [lab, setLab] = useState<any>(null);
  const [similarEntities, setSimilarEntities] = useState<any[]>([]);
  const [topHospitals, setTopHospitals] = useState<any[]>([]);
  const [nearbyCenters, setNearbyCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const handleInlineSave = async (field: string, value: any) => {
    if (!lab || !lab.id) return;
    try {
      const docRef = doc(db, 'directory', lab.id);
      await updateDoc(docRef, { [field]: value });
      setLab((prev: any) => ({ ...prev, [field]: value }));
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
            name: rawData.name || "Unknown Doctor",
            specialty: rawData.subCategory || rawData.category || "Specialist",
            experience: rawData.experience || notVerified,
            qualification: rawData.qualification || notVerified,
            rating: rawData.rating || 4.5,
            reviews: rawData.reviews || 0,
            fee: rawData.fee || "Contact Lab",
            image: rawData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawData.name || "Doc")}&background=0f766e&color=fff&size=150`,
            verified: rawData.verified || false,
            about: rawData.about || notVerified,
            specialties: rawData.specialties || [rawData.subCategory || notVerified],
            education: rawData.education || [{ degree: notVerified, institution: notVerified }],
            languages: rawData.languages || [notVerified],
            banner: "https://images.unsplash.com/photo-1551076805-e18690c5e53b?auto=format&fit=crop&w=1200&q=80",
            clinic: {
              name: rawData.clinicName || notVerified,
              address: rawData.address || notVerified,
              phone: rawData.phone || notVerified,
              website: rawData.website || notVerified,
              mapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(rawData.address || rawData.name || 'Odisha')}&t=&z=15&ie=UTF8&iwloc=&output=embed`
            },
            hours: rawData.hours || [
              { day: "Operating Hours", time: notVerified }
            ],
            city: rawData.city || rawData.district || "Odisha",
            
            // New Advanced Array Fields
            locations: rawData.locations || [],
            experiences: rawData.experiences || [],
            qualificationsList: rawData.qualificationsList || [],
            research: rawData.research || [],
            awards: rawData.awards || [],
            
            // Auth Check
            ownerEmail: rawData.ownerEmail || null,
            galleryImages: rawData.galleryImages || []
          };
          setLab(docData);

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
            setNearbyCenters(allCityDocs.filter(d => d.category !== "Lab" && d.category !== "Hospital").slice(0, 3));
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

  if (!lab) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><div className="text-center"><h2 className="text-2xl font-bold text-slate-900 mb-2">Lab Not Found</h2><Link href="/labs" className="text-teal-600 hover:underline">Return to Directory</Link></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      <CategoryNav />
      
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="w-full max-w-[1920px] mx-auto">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: lab.city || "Odisha", href: "/labs" },
            { name: "Labs", href: "/labs" },
            { name: lab.specialty || "Specialist", href: "/labs" },
            { name: lab.name }
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
          src={lab.banner} 
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
              entity={lab} 
              config={TicketConfig.lab} 
              isEditMode={isEditMode}
              onSave={handleInlineSave}
            />

            {/* Google Extracted Image Gallery */}
            {lab.galleryImages?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Lab Photos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {lab.galleryImages.map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-200">
                      <img src={img} alt={`Lab Photo ${idx + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Unverified Banner */}
            {!lab.verified && (
              <UnverifiedBanner entityType="diagnostic lab" claimUrl={`/portal/claim?id=${lab.id}`} />
            )}

            {/* 2-Column Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-8">
                {/* About */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative group">
                  {isEditMode && <div className="absolute top-4 right-4 bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Editable</div>}
                  <h2 className="text-xl font-bold text-slate-900 mb-4">About the Lab</h2>
                  <div className="text-slate-600 leading-relaxed text-sm">
                    <InlineEditField 
                      value={lab.about} 
                      onSave={(val) => handleInlineSave('about', val)} 
                      isEditMode={isEditMode} 
                      type="textarea"
                    />
                  </div>
                </div>

                {/* Specialties */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative group">
                  {isEditMode && <div className="absolute top-4 right-4 bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Editable</div>}
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Specialties & Services</h2>
                  <InlineEditArray 
                    items={lab.specialties || []} 
                    onSave={(newArr) => handleInlineSave('specialties', newArr)} 
                    isEditMode={isEditMode} 
                    placeholder="Add a service (e.g. Blood Test, MRI)"
                  />
                </div>

                {/* Detailed Qualifications */}
                {lab.qualificationsList?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                      Qualifications & Fellowships
                    </h2>
                    <div className="space-y-4">
                      {lab.qualificationsList.map((qual: any, idx: number) => (
                        <div key={idx} className="flex flex-col bg-slate-50 border border-slate-100 p-4 rounded-xl">
                          <h4 className="font-bold text-slate-900 text-sm">{qual.degree}</h4>
                          <p className="text-xs text-slate-600 mt-1">{qual.institution}</p>
                          {qual.year && <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mt-2">{qual.year}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Fallback Legacy Education */}
                {!lab.qualificationsList?.length && lab.education.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Education & Training</h2>
                    <div className="space-y-6">
                      {lab.education.map((edu: any, idx: number) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-teal-500 rounded-full mt-1.5"></div>
                            {idx !== lab.education.length - 1 && <div className="w-0.5 h-full bg-slate-200 mt-2"></div>}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{edu.degree}</h4>
                            <p className="text-xs text-slate-500 mt-1">{edu.institution}</p>
                            {edu.year && <span className="text-xs font-bold text-slate-400 mt-1 block">{edu.year}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Awards & Recognitions */}
                {lab.awards?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                      Awards & Recognitions
                    </h2>
                    <div className="space-y-4">
                      {lab.awards.map((award: any, idx: number) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-1.5 shrink-0"></div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{award.name}</h4>
                            <p className="text-xs text-slate-600 mt-1">{award.organization} {award.year && `• ${award.year}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              <div className="space-y-8">
                
                {/* Advanced Experience Timeline */}
                {lab.experiences?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      Professional Experience
                    </h2>
                    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                      {lab.experiences.map((exp: any, idx: number) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-slate-200 text-slate-500 group-[.is-active]:bg-teal-600 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                          </div>
                          <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <h4 className="font-bold text-slate-900 text-sm">{exp.role}</h4>
                            <p className="text-xs text-slate-600 mt-1">{exp.hospital}</p>
                            {exp.duration && <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mt-2 block">{exp.duration}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Legacy Location Card (Primary) */}
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                  <div className="w-full h-48 bg-slate-100 relative">
                    <iframe 
                      src={lab.clinic.mapUrl} 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-slate-900 mb-2">
                    <span className="text-sm font-semibold text-slate-500 block mb-1">Primary Lab</span>
                    {lab.clinic.name}
                  </h3>
                    <div className="space-y-4 mt-4 relative">
                      {isEditMode && <div className="absolute -top-12 right-0 bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest hidden md:block">Editable</div>}
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <div className="text-sm text-slate-600 leading-relaxed">
                          <InlineEditField 
                            value={lab.clinic.address} 
                            onSave={(val) => handleInlineSave('address', val)} 
                            isEditMode={isEditMode} 
                            type="textarea"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <PhoneRevealButton 
                          phoneNumber={lab.clinic.phone} 
                          providerId={lab.id} 
                          providerName={lab.name} 
                          providerType="Lab" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multiple Visiting Locations */}
                {lab.locations?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      Also Visits
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {lab.locations.map((loc: any, idx: number) => (
                        <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-white transition-colors">
                          <h4 className="font-bold text-slate-900 text-sm mb-1">{loc.name}</h4>
                          <p className="text-xs text-slate-500 mb-3">{loc.address}, {loc.city}</p>
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-teal-700 bg-teal-50 px-2 py-1 rounded">{loc.days}</span>
                            <span className="text-slate-600">{loc.timings}</span>
                          </div>
                          {loc.fee && <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">Consultation Fee: <span className="font-bold text-slate-900">₹{loc.fee}</span></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Research & Publications */}
                {lab.research?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                      Research & Publications
                    </h2>
                    <div className="space-y-4">
                      {lab.research.map((res: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-teal-500 pl-4 py-1">
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">{res.title}</h4>
                          <p className="text-xs text-slate-600 mt-2 font-serif italic">{res.journal} {res.year && `(${res.year})`}</p>
                        </div>
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
                  Recommended Labs in {lab.city}
                </h3>
                <div className="flex flex-col gap-4">
                  {similarEntities.map((sim, idx) => (
                    <Link key={idx} href={generateUniversalSeoUrl(sim, 'labs')} className="bg-slate-50 hover:bg-teal-50 rounded-xl p-3 flex items-center gap-3 group transition-colors border border-slate-100 hover:border-teal-100">
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
                  Top Hospitals in {lab.city}
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
