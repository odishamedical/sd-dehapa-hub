"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';

import CategoryNav from '@/components/CategoryNav';
import Breadcrumb from '@/components/Breadcrumb';
import TicketCard from '@/components/TicketCard';
import { TicketConfig } from '@/lib/ticketConfig';
import PhoneRevealButton from '@/components/PhoneRevealButton';
import InlineEditField from '@/components/InlineEditField';
import InlineEditArray from '@/components/InlineEditArray';
import { updateDoc } from 'firebase/firestore';
import { generateUniversalSeoUrl } from '@/lib/urlHelpers';

export default function DoctorProfileView({ id, customSlug }: { id?: string, customSlug?: string }) {
  const [doctor, setDoctor] = useState<any>(null);
  const [similarDoctors, setSimilarDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformAds, setPlatformAds] = useState<any>({});

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  // UX Tabs State
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'experience' | 'research' | 'media'>('locations');

  const handleInlineSave = async (field: string, value: any) => {
    if (!doctor || !doctor.id) return;
    try {
      const docRef = doc(db, 'directory', doctor.id);
      await updateDoc(docRef, { [field]: value });
      setDoctor((prev: any) => ({ ...prev, [field]: value }));
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
          } else {
            const docRef = doc(db, 'directory', customSlug);
            const fallbackSnap = await getDoc(docRef);
            if (fallbackSnap.exists()) {
              docSnap = fallbackSnap;
              docId = fallbackSnap.id;
            }
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
            rating: rawData.rating || 4.8,
            reviews: rawData.reviews || 0,
            fee: rawData.fee || "Contact Clinic",
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
            
            locations: rawData.locations || [],
            experiences: rawData.experiences || [],
            qualificationsList: rawData.qualificationsList || [],
            research: rawData.research || [],
            awards: rawData.awards || [],
            
            dob: rawData.dob || "",
            maritalStatus: rawData.maritalStatus || "",
            registrationNumber: rawData.registrationNumber || "",
            showPersonalDetails: rawData.showPersonalDetails || false,
            
            ownerEmail: rawData.ownerEmail || null,
            galleryImages: rawData.galleryImages || [],
            youtubeLinks: rawData.youtubeLinks || []
          };
          setDoctor(docData);

          if (typeof window !== 'undefined') {
            const currentUserEmail = localStorage.getItem("sd_current_user_email");
            if (currentUserEmail === "odishamedical@gmail.com" || currentUserEmail === docData.ownerEmail) {
              setCanEdit(true);
            }
          }
          
          try {
            const broadQuery = query(collection(db, 'directory'), limit(20));
            const broadSnap = await getDocs(broadQuery);
            const allDocs = broadSnap.docs.map(d => ({ id: d.id, ...d.data() as any })).filter(d => d.id !== docId && !!d.image);
            let similarDocs = allDocs.filter(d => d.category === "Doctor" && d.subCategory === rawData.subCategory);
            if (similarDocs.length === 0) {
              similarDocs = allDocs.filter(d => d.category === "Doctor");
            }
            setSimilarDoctors(similarDocs.slice(0, 3));
          } catch(e) {
            console.error("Failed to fetch similar doctors", e);
          }
          try {
            const adsQuery = query(collection(db, 'platform_ads'), where('active', '==', true));
            const adsSnap = await getDocs(adsQuery);
            const adsData: any = {};
            adsSnap.forEach(d => {
              if (d.data().slot) adsData[d.data().slot] = d.data();
            });
            setPlatformAds(adsData);
          } catch(e) {
            console.error("Ads fetch failed", e);
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
    return <div className="min-h-screen flex items-center justify-center bg-[#0B1121]"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div></div>;
  }

  if (!doctor) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0B1121]"><div className="text-center"><h2 className="text-2xl font-bold text-white mb-2">Doctor Not Found</h2><Link href="/doctors" className="text-cyan-400 hover:underline">Return to Directory</Link></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#060B14] font-sans pb-20 selection:bg-cyan-500/30">
      
      {/* Premium Glassmorphic Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/60 sticky top-0 z-50">
        <CategoryNav />
        <div className="px-6 py-3 w-full max-w-[1920px] mx-auto border-t border-slate-800/40">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: doctor.city || "Odisha", href: "/doctors" },
            { name: "Doctors", href: "/doctors" },
            { name: doctor.specialty || "Specialist", href: "/doctors" },
            { name: doctor.name }
          ]} />
        </div>
      </div>

      {canEdit && (
        <div className="bg-gradient-to-r from-teal-900 to-cyan-900 text-white px-6 py-2 sticky top-[108px] z-40 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            <span className="font-bold text-sm tracking-wide">Doctor Access: You can edit this profile</span>
          </div>
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${isEditMode ? 'bg-cyan-400 text-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isEditMode ? 'Disable Edit Mode' : 'Enable Edit Mode'}
          </button>
        </div>
      )}
      
      {/* Futuristic Banner */}
      <div className="w-full min-h-[400px] relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1121]/40 via-[#0B1121]/80 to-[#060B14] z-10"></div>
        <img 
          src={doctor.banner} 
          alt="Clinic Banner" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none"></div>

        {/* Space 1: Top Hero Space (Unverified Banner OR Top Ad Slot) */}
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 relative z-30 pt-4">
          {!doctor.verified ? (
            <div className="bg-gradient-to-r from-amber-900/60 to-amber-700/60 border border-amber-500/50 backdrop-blur-md rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <span className="text-white text-sm md:text-base font-medium">Data collected from reliable sources. Are you this doctor? Verify this profile. <span className="font-bold text-amber-400 tracking-wider ml-1">(NOW NOT VERIFIED)</span></span>
              </div>
              <Link href={`/login?claim=${doctor.id}`} className="shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                Verify Now
              </Link>
            </div>
          ) : platformAds['ad_slot_doctor_hero_top'] ? (
            <div className="w-full h-[90px] rounded-xl overflow-hidden shadow-lg border border-slate-700/50 bg-black/50 backdrop-blur-md">
               {platformAds['ad_slot_doctor_hero_top'].imageUrl ? (
                 <a href={platformAds['ad_slot_doctor_hero_top'].linkUrl} target="_blank" rel="noreferrer">
                   <img src={platformAds['ad_slot_doctor_hero_top'].imageUrl} alt="Advertisement" className="w-full h-full object-cover" />
                 </a>
               ) : (
                 <div dangerouslySetInnerHTML={{ __html: platformAds['ad_slot_doctor_hero_top'].htmlCode }} />
               )}
            </div>
          ) : null}
        </div>

        <div className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 relative z-20 flex flex-col lg:flex-row gap-8 items-center lg:items-end pb-12 mt-8 lg:mt-auto">
           <div className="flex flex-col md:flex-row gap-8 items-center md:items-end flex-1">
             <div className="relative group">
               <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-3xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
               <img src={doctor.image} alt={doctor.name} className="relative w-40 h-40 md:w-48 md:h-48 rounded-3xl object-cover border-2 border-slate-800/80 shadow-2xl" />
               {doctor.verified && (
                 <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-2 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
               )}
             </div>
             
             <div className="flex-1 text-center md:text-left">
               <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-2">
                 <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight font-serif">{doctor.name}</h1>
                 {doctor.verified && (
                   <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full mb-1 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-[pulse_3s_ease-in-out_infinite]">
                     <div className="relative flex h-4 w-4 items-center justify-center">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                       <svg className="relative w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     </div>
                     <span className="text-emerald-400 text-xs font-black uppercase tracking-widest mt-0.5">Verified</span>
                   </div>
                 )}
               </div>
               <p className="text-xl text-cyan-400 font-medium mb-6">{doctor.specialty}</p>
             
             {/* Trust Strip */}
             <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 text-sm">
                <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <div>
                    <span className="text-white font-bold block leading-none">{doctor.rating} Rating</span>
                    <span className="text-slate-400 text-xs">{doctor.reviews} Reviews</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <div>
                    <span className="text-white font-bold block leading-none">{doctor.experience}</span>
                    <span className="text-slate-400 text-xs">Experience</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  <div>
                    <span className="text-white font-bold block leading-none">{doctor.registrationNumber || "MCI Registered"}</span>
                    <span className="text-slate-400 text-xs">Medical Council</span>
                  </div>
                </div>
             </div>
           </div>
           </div>

           {/* Space 2: Right Side of Banner (Premium Ad Space) */}
           {platformAds['ad_slot_doctor_hero_right'] && (
             <div className="hidden lg:block w-[300px] h-[250px] shrink-0 bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
               {platformAds['ad_slot_doctor_hero_right'].imageUrl ? (
                 <a href={platformAds['ad_slot_doctor_hero_right'].linkUrl} target="_blank" rel="noreferrer">
                   <img src={platformAds['ad_slot_doctor_hero_right'].imageUrl} alt="Premium Advertisement" className="w-full h-full object-cover" />
                 </a>
               ) : (
                 <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: platformAds['ad_slot_doctor_hero_right'].htmlCode }} />
               )}
             </div>
           )}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 relative z-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left & Center Content (75% Width) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Segmented Navigation Tabs */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-2 rounded-2xl flex overflow-x-auto hide-scrollbar sticky top-[72px] z-30 shadow-lg">
              {['locations', 'overview', 'experience', 'research', 'media'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-slate-700/50 shadow-xl relative group">
                  {isEditMode && <div className="absolute top-4 right-4 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest border border-cyan-500/30">Editable</div>}
                  <h2 className="text-2xl font-bold text-white mb-6 font-serif">About the Doctor</h2>
                  <div className="text-slate-300 leading-relaxed text-base">
                    <InlineEditField 
                      value={doctor.about} 
                      onSave={(val) => handleInlineSave('about', val)} 
                      isEditMode={isEditMode} 
                      type="textarea"
                    />
                  </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-slate-700/50 shadow-xl relative group">
                  {isEditMode && <div className="absolute top-4 right-4 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest border border-cyan-500/30">Editable</div>}
                  <h2 className="text-2xl font-bold text-white mb-6 font-serif">Specialties & Services</h2>
                  <div className="text-slate-300">
                    <InlineEditArray 
                      items={doctor.specialties || []} 
                      onSave={(newArr) => handleInlineSave('specialties', newArr)} 
                      isEditMode={isEditMode} 
                      placeholder="Add a specialty (e.g. ENT Surgeon)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: LOCATIONS & CLINIC */}
            {activeTab === 'locations' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                
                {/* Image Gallery (Horizontal Scroll) */}
                {doctor.galleryImages?.length > 0 && (
                  <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 border border-slate-700/50 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 font-serif flex items-center gap-3">
                      <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      Clinic Facilities
                    </h2>
                    <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
                      {doctor.galleryImages.map((img: string, idx: number) => (
                        <div key={idx} className="min-w-[280px] md:min-w-[320px] h-48 md:h-64 rounded-2xl overflow-hidden snap-center border border-slate-700/50 shrink-0 group cursor-pointer relative">
                          <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/20 transition-colors z-10"></div>
                          <img src={img} alt={`Clinic Photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-slate-700/50 shadow-xl overflow-hidden">
                  <div className="w-full h-80 bg-slate-800 relative">
                    <iframe 
                      src={doctor.clinic.mapUrl} 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                  <div className="p-8 md:p-10">
                    <h3 className="font-bold text-2xl text-white mb-2 font-serif">
                      <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest block mb-2">Primary Clinic</span>
                      {doctor.clinic.name}
                    </h3>
                    <div className="space-y-6 mt-6 relative">
                      {isEditMode && <div className="absolute -top-12 right-0 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest border border-cyan-500/30">Editable</div>}
                      <div className="flex items-start gap-4">
                        <svg className="w-6 h-6 text-cyan-400 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <div className="text-base text-slate-300 leading-relaxed">
                          <InlineEditField 
                            value={doctor.clinic.address} 
                            onSave={(val) => handleInlineSave('address', val)} 
                            isEditMode={isEditMode} 
                            type="textarea"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {doctor.locations?.length > 0 && (
                  <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 border border-slate-700/50 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 font-serif">Also Visits</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {doctor.locations.map((loc: any, idx: number) => (
                        <div key={idx} className="border border-slate-700/50 rounded-2xl p-6 bg-slate-800/50 hover:bg-slate-800 transition-colors">
                          <h4 className="font-bold text-white text-lg mb-1">{loc.name}</h4>
                          <p className="text-sm text-slate-400 mb-4">{loc.address}, {loc.city}</p>
                          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                            <span className="text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg">{loc.days}</span>
                            <span className="text-slate-300">{loc.timings}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: EXPERIENCE & EDUCATION */}
            {activeTab === 'experience' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {doctor.experiences?.length > 0 && (
                  <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-slate-700/50 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-8 font-serif">Professional Experience</h2>
                    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-cyan-500/50 before:to-transparent">
                      {doctor.experiences.map((exp: any, idx: number) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#060B14] bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-sm hover:border-cyan-500/30 transition-colors">
                            <h4 className="font-bold text-white text-lg">{exp.role}</h4>
                            <p className="text-sm text-slate-400 mt-1">{exp.hospital}</p>
                            {exp.duration && <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest mt-3 block">{exp.duration}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {doctor.qualificationsList?.length > 0 && (
                  <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-slate-700/50 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 font-serif">Education & Qualifications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {doctor.qualificationsList.map((qual: any, idx: number) => (
                        <div key={idx} className="flex flex-col bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                          <h4 className="font-bold text-white text-lg">{qual.degree}</h4>
                          <p className="text-sm text-slate-400 mt-2">{qual.institution}</p>
                          {qual.year && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit uppercase tracking-widest mt-3">{qual.year}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: MEDIA (YOUTUBE GALLERY) */}
            {activeTab === 'media' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-slate-700/50 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white font-serif flex items-center gap-3">
                      <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.498 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.498-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      Doctor Media & Interviews
                    </h2>
                    {isEditMode && <div className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest border border-cyan-500/30">Editable Array</div>}
                  </div>

                  {(!doctor.youtubeLinks || doctor.youtubeLinks.length === 0) ? (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 text-center">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.498 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.498-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </div>
                      <p className="text-base text-slate-400 font-semibold italic">No media uploaded yet.</p>
                      {isEditMode && <p className="text-xs text-cyan-400 mt-2">Edit mode enabled: Add YouTube links to display them here.</p>}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {doctor.youtubeLinks.slice(0, 10).map((link: string, idx: number) => {
                        let videoId = '';
                        const match = link.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
                        if (match && match[1]) {
                          videoId = match[1];
                        }
                        if (!videoId) return null;

                        return (
                          <div key={idx} className="aspect-video rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.4)] border border-slate-700/50 bg-black group relative">
                            <iframe 
                              width="100%" 
                              height="100%" 
                              src={`https://www.youtube.com/embed/${videoId}`} 
                              title="YouTube video player" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen
                              className="absolute inset-0 w-full h-full"
                            ></iframe>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {isEditMode && (
                    <div className="mt-8 pt-8 border-t border-slate-700/50">
                      <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">Manage YouTube Links</h4>
                      <InlineEditArray 
                        items={doctor.youtubeLinks || []} 
                        onSave={(newArr) => handleInlineSave('youtubeLinks', newArr)} 
                        isEditMode={isEditMode} 
                        placeholder="Paste YouTube Link (https://youtube.com/watch?v=...)"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: RESEARCH & AWARDS */}
            {activeTab === 'research' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-slate-700/50 shadow-xl">
                  <h2 className="text-2xl font-bold text-white mb-6 font-serif text-amber-400">Awards & Recognitions</h2>
                  {(!doctor.awards || doctor.awards.length === 0) ? (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 text-center">
                      <p className="text-sm text-slate-400 font-semibold italic">No awards listed.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {doctor.awards.map((award: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                          <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 shrink-0">
                            <span className="text-amber-400 font-serif font-bold text-lg">🏆</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-base">{award.name}</h4>
                            <p className="text-sm text-slate-400 mt-1">{award.organization} {award.year && `• ${award.year}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-slate-700/50 shadow-xl">
                  <h2 className="text-2xl font-bold text-white mb-6 font-serif">Research & Publications</h2>
                  {(!doctor.research || doctor.research.length === 0) ? (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 text-center">
                      <p className="text-sm text-slate-400 font-semibold italic">No publications listed.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {doctor.research.map((res: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-cyan-500 pl-6 py-2">
                          <h4 className="font-bold text-white text-base leading-snug">{res.title}</h4>
                          <p className="text-sm text-cyan-400/80 mt-2 font-serif italic">{res.journal} {res.year && `(${res.year})`}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar: Sticky Contact / Booking Widget (25% Width) */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-[160px] z-30">
            
            {/* STICKY BOOKING CARD */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-[32px] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700/60 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-[50px]"></div>
               <h3 className="font-bold text-xl text-white mb-2 relative z-10 font-serif">Book Appointment</h3>
               <p className="text-sm text-slate-400 mb-6 relative z-10">Instantly view availability or contact the clinic directly.</p>
               
               <div className="space-y-4 relative z-10">
                 <div className="w-full">
                    <PhoneRevealButton 
                      phoneNumber={doctor.clinic.phone} 
                      providerId={doctor.id} 
                      providerName={doctor.name} 
                      providerType="Doctor" 
                    />
                 </div>
                 <Link href={`/portal/patient/book/${doctor.id}`} className="w-full block text-center bg-white hover:bg-slate-100 text-slate-900 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md">
                   Check Availability
                 </Link>
               </div>
               
               <div className="mt-8 pt-6 border-t border-slate-700/50 relative z-10">
                 <div className="flex items-center gap-3 text-sm text-slate-300">
                    <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Secure Booking via DehaPa</span>
                 </div>
               </div>
            </div>

            {/* Similar Doctors */}
            {similarDoctors.length > 0 && (
              <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-6 border border-slate-700/50 shadow-xl">
                <h3 className="font-bold text-base text-white mb-4 font-serif">Recommended Specialists</h3>
                <div className="flex flex-col gap-4">
                  {similarDoctors.map((sim, idx) => (
                    <Link key={idx} href={generateUniversalSeoUrl(sim, 'doctors')} className="bg-slate-800/50 hover:bg-slate-800 rounded-xl p-3 flex items-center gap-3 group transition-colors border border-slate-700/50 hover:border-cyan-500/30">
                      <img src={sim.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(sim.name || "Doc")}&background=0f766e&color=fff`} alt={sim.name} className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-white truncate group-hover:text-cyan-400 transition-colors">{sim.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] font-bold text-yellow-400">⭐ {sim.rating || 4.8}</span>
                        </div>
                      </div>
                    </Link>
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
