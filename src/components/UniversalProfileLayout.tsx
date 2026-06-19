"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import CategoryNav from '@/components/CategoryNav';
import Breadcrumb from '@/components/Breadcrumb';
import HorizontalScrollGallery from '@/components/HorizontalScrollGallery';
import PhoneRevealButton from '@/components/PhoneRevealButton';

const TABS_DOCTOR = ['locations', 'overview', 'experience', 'research', 'media'];
const TABS_HOSPITAL = ['overview', 'packages', 'departments', 'facilities', 'media'];

export default function UniversalProfileLayout({ profile, unwrappedParams }: { profile: any, unwrappedParams: any }) {
  const [activeTab, setActiveTab] = useState(unwrappedParams.type === 'doctor' ? 'locations' : 'overview');
  const tabs = unwrappedParams.type === 'doctor' ? TABS_DOCTOR : TABS_HOSPITAL;
  const isDoctor = unwrappedParams.type === 'doctor';

  const verified = profile.verified;

  return (
    <div className="min-h-screen bg-[#060B14] font-sans pb-20 selection:bg-cyan-500/30">
      
      {/* Premium Glassmorphic Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/60 sticky top-0 z-50">
        <CategoryNav />
        <div className="px-6 py-3 w-full max-w-[1920px] mx-auto border-t border-slate-800/40">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: isDoctor ? "Doctors" : "Hospitals", href: `/${unwrappedParams.type}s` },
            { name: profile.subtitle || "Specialist", href: `/${unwrappedParams.type}s` },
            { name: profile.name }
          ]} />
        </div>
      </div>

      {/* Futuristic Banner */}
      <div className="w-full min-h-[400px] relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1121]/40 via-[#0B1121]/80 to-[#060B14] z-10"></div>
        <img 
          src={profile.banner || "https://images.unsplash.com/photo-1551076805-e18690c5e53b?auto=format&fit=crop&w=1200&q=80"} 
          alt="Banner" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none"></div>

        {/* Top Hero Space (Unverified Banner) */}
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 relative z-30 pt-4">
          {!verified && (
            <div className="bg-gradient-to-r from-amber-900/60 to-amber-700/60 border border-amber-500/50 backdrop-blur-md rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <span className="text-white text-sm md:text-base font-medium">Data collected from reliable sources. Are you this {unwrappedParams.type}? Verify this profile. <span className="font-bold text-amber-400 tracking-wider ml-1">(NOW NOT VERIFIED)</span></span>
              </div>
              <Link href={`/portal/claim?id=${profile.id}`} className="shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                Verify Now
              </Link>
            </div>
          )}
        </div>

        <div className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 relative z-20 flex flex-col lg:flex-row gap-8 items-center lg:items-end pb-12 mt-8 lg:mt-auto">
           <div className="flex flex-col md:flex-row gap-8 items-center md:items-end flex-1">
             <div className="relative group shrink-0">
               <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-3xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
               <img src={profile.image} alt={profile.name} className="relative w-40 h-40 md:w-48 md:h-48 rounded-3xl object-cover border-2 border-slate-800/80 shadow-2xl" />
               {verified && (
                 <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-2 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
               )}
             </div>
             
             <div className="flex-1 text-center md:text-left">
               <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-2">
                 <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight font-serif">{profile.name}</h1>
                 {verified && (
                   <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full mb-1 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-[pulse_3s_ease-in-out_infinite]">
                     <div className="relative flex h-4 w-4 items-center justify-center">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                       <svg className="relative w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     </div>
                     <span className="text-emerald-400 text-xs font-black uppercase tracking-widest mt-0.5">Verified</span>
                   </div>
                 )}
               </div>
               <p className="text-xl text-cyan-400 font-medium mb-6">{profile.subtitle}</p>
             
               {/* Trust Strip */}
               <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 text-sm">
                  {Object.entries(profile.stats || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50">
                      <div className="w-5 h-5 text-cyan-400 flex items-center justify-center shrink-0">
                         {key.toLowerCase().includes('rating') ? '⭐' : '📊'}
                      </div>
                      <div>
                        <span className="text-white font-bold block leading-none">{val as string}</span>
                        <span className="text-slate-400 text-[10px] uppercase tracking-widest">{key}</span>
                      </div>
                    </div>
                  ))}
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 relative z-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left & Center Content (75% Width) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Segmented Navigation Tabs */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-2 rounded-2xl flex overflow-x-auto hide-scrollbar sticky top-[72px] z-30 shadow-lg">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
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
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-slate-700/50 shadow-xl">
                  <h2 className="text-2xl font-bold text-white mb-6 font-serif">About</h2>
                  <p className="text-slate-300 leading-relaxed text-base">
                    {profile.about}
                  </p>
                </div>

                {(!isDoctor && profile.details?.length > 0) && (
                  <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-slate-700/50 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 font-serif">Contact Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.details.map((det: any, idx: number) => (
                        <div key={idx} className="flex flex-col bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                          <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest">{det.label}</h4>
                          <p className="text-base text-white mt-2">{det.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(!isDoctor && profile.mapUrl) && (
                  <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-700/50">
                      <h3 className="font-bold text-2xl text-white mb-2 font-serif">Location</h3>
                    </div>
                    <div className="w-full h-80 bg-slate-800 relative">
                      <iframe 
                        src={profile.mapUrl} 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} 
                        allowFullScreen 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: PACKAGES (Hospital only) */}
            {activeTab === 'packages' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-slate-700/50 shadow-xl">
                  <h2 className="text-2xl font-bold text-white mb-6 font-serif">Preventive Health Packages</h2>
                  {profile.healthPackages?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                      {profile.healthPackages.map((pkg: any, idx: number) => (
                        <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/30 transition-all group">
                          <h3 className="text-lg font-bold text-white mb-2">{pkg.name}</h3>
                          
                          <div className="mb-4">
                            <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Included Tests</p>
                            <div className="flex flex-wrap gap-1.5">
                              {pkg.included.split(',').map((test: string, tIdx: number) => (
                                <span key={tIdx} className="bg-slate-900 text-slate-300 text-[10px] font-medium px-2 py-1 rounded border border-slate-700">
                                  {test.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-end justify-between mt-6 pt-4 border-t border-slate-700/50">
                            <div>
                              <p className="text-2xl font-bold text-cyan-400">{pkg.price}</p>
                            </div>
                            <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-lg">
                              Book Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 text-center">
                      <p className="text-sm text-slate-400 font-semibold italic">No packages listed.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: DEPARTMENTS (Hospital only) */}
            {activeTab === 'departments' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-slate-700/50 shadow-xl">
                  <h2 className="text-2xl font-bold text-white mb-6 font-serif">Departments & Roster</h2>
                  {profile.roster?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.roster.map((dept: string, idx: number) => (
                        <div key={idx} className="flex flex-col bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl">
                          <h4 className="font-bold text-white text-base">{dept}</h4>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 text-center">
                      <p className="text-sm text-slate-400 font-semibold italic">No departments listed.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: LOCATIONS (Doctor only) */}
            {activeTab === 'locations' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
                  <div className="p-8 md:p-10 border-b border-slate-700/50">
                    <h3 className="font-bold text-2xl text-white mb-2 font-serif">
                      <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest block mb-2">Primary Clinic</span>
                      {(profile.clinic && profile.clinic.name) ? profile.clinic.name : "Clinic"}
                    </h3>
                  </div>
                  <div className="w-full h-80 bg-slate-800 relative">
                    <iframe 
                      src={profile.mapUrl} 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: MEDIA */}
            {activeTab === 'media' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-slate-700/50 shadow-xl">
                  <h2 className="text-2xl font-bold text-white mb-8 font-serif flex items-center gap-3">
                     Media & Gallery
                  </h2>
                  <div className="w-full -mx-4 sm:mx-0">
                    <HorizontalScrollGallery images={profile.galleryImages?.length > 0 ? profile.galleryImages : (profile.rawImages || [])} />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Tabs for Doctor (Experience, Research) - Minimal fallbacks since data is unstructured in Universal */}
            {(activeTab === 'experience' || activeTab === 'research' || activeTab === 'facilities') && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-slate-700/50 shadow-xl text-center">
                   <h2 className="text-2xl font-bold text-white mb-2 font-serif capitalize">{activeTab}</h2>
                   <p className="text-slate-400 italic mt-4">Information is currently being updated by the provider.</p>
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
               <p className="text-sm text-slate-400 mb-6 relative z-10">Instantly view availability or contact the facility directly.</p>
               
               <div className="space-y-4 relative z-10">
                 <div className="w-full">
                    <PhoneRevealButton 
                      phoneNumber={profile.phone} 
                      providerId={profile.id || ""} 
                      providerName={profile.name} 
                      providerType={unwrappedParams.type} 
                    />
                 </div>
                 <Link href={`/portal/book?id=${profile.id}&type=${unwrappedParams.type}`} className="w-full block text-center bg-white hover:bg-slate-100 text-slate-900 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md">
                   Check Availability
                 </Link>
               </div>
               
               <div className="mt-8 pt-6 border-t border-slate-700/50 relative z-10">
                 <div className="flex items-center gap-3 text-sm text-slate-300">
                    <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Secure Booking via DehaPa</span>
                 </div>
               </div>

               {/* Share Buttons */}
               <div className="mt-6 pt-6 border-t border-slate-700/50 relative z-10 flex flex-col gap-3">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Share Profile</p>
                 <div className="flex gap-3">
                   <button 
                     onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Book an appointment with ' + profile.name + ' on DehaPa Hub.')}`, '_blank')}
                     className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                   >
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://sd-dehapa-hub.vercel.app')}`, '_blank')}
                    className="flex-1 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                    Facebook
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
