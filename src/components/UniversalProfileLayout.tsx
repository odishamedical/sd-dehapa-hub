import React, { useState } from 'react';
import Link from 'next/link';
import CategoryNav from '@/components/CategoryNav';
import Breadcrumb from '@/components/Breadcrumb';
import HorizontalScrollGallery from '@/components/HorizontalScrollGallery';
import PhoneRevealButton from '@/components/PhoneRevealButton';

export default function UniversalProfileLayout({ profile, unwrappedParams }: { profile: any, unwrappedParams: any }) {

  return (
    <div className="min-h-screen bg-[#040815] font-sans text-slate-200 selection:bg-cyan-500/30 pb-20">
      <CategoryNav />
      
      {/* Header & Breadcrumb */}
      <div className="bg-[#0a1229] border-b border-cyan-500/20 px-6 py-3 shadow-[0_4px_20px_rgba(6,182,212,0.1)] relative z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: unwrappedParams.type === 'doctor' ? "Doctors" : "Hospitals", href: `/${unwrappedParams.type}s` },
            { name: profile.name }
          ]} />
          
          <Link href="/search" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-bold text-sm bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-500/30">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
             Back to Search
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 mt-4">
        
        {/* Identity Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-3xl p-8 border border-slate-800 mb-8 relative overflow-hidden group">
          {/* Metallic Shine Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>
          
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#0a1229] to-slate-900 border-b border-slate-800"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-end mt-12">
            <div className="w-32 h-32 rounded-3xl bg-[#040815] p-2 shadow-2xl border border-slate-700 shrink-0 relative overflow-hidden">
              <div className="w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center text-5xl shadow-inner overflow-hidden border border-slate-600">
                {profile.image ? (
                  <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <>
                    {unwrappedParams.type === 'doctor' && '👨‍⚕️'}
                    {unwrappedParams.type === 'hospital' && '🏥'}
                    {unwrappedParams.type !== 'doctor' && unwrappedParams.type !== 'hospital' && '⚕️'}
                  </>
                )}
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between w-full flex-wrap gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-serif font-bold text-white drop-shadow-sm">{profile.name}</h1>
                  {profile.verified && (
                    <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-full shadow-sm">
                      <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Verified</span>
                    </div>
                  )}
                </div>
                
                {/* The Unverified Workflow */}
                {!profile.verified && (
                  <Link href="/login" className="flex items-center gap-2 bg-rose-950/30 border border-rose-500/30 text-rose-400 hover:bg-rose-900/40 hover:text-rose-300 px-4 py-2 rounded-xl transition-all shadow-sm font-bold animate-pulse group">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    Claim & Verify
                  </Link>
                )}
              </div>
              <p className="text-lg font-medium text-cyan-400 mb-6">{profile.subtitle}</p>
              
              <div className="flex flex-wrap gap-4">
                {Object.entries(profile.stats || {}).map(([key, val]) => (
                  <div key={key} className="bg-[#040815] border border-slate-700 px-4 py-2 rounded-xl shadow-inner">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">{key}</p>
                    <p className="font-bold text-slate-200">{val as string}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                About
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg">{profile.about}</p>
            </section>
            
            <HorizontalScrollGallery images={profile.galleryImages?.length > 0 ? profile.galleryImages : (profile.rawImages || [])} />

            {profile.roster && profile.roster.length > 0 && (
              <section className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-3">
                  {unwrappedParams.type === 'doctor' ? 'Associated Hospitals' : 'Available Departments / Doctors'}
                </h3>
                <ul className="space-y-3">
                  {profile.roster.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 bg-[#040815] p-4 rounded-xl border border-slate-700 shadow-inner">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                      <span className="font-bold">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {profile.healthPackages && profile.healthPackages.length > 0 && (
              <section className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-3">Health Packages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.healthPackages.map((pkg: any, i: number) => (
                    <div key={i} className="border border-slate-700 rounded-2xl p-6 bg-[#040815] shadow-inner flex flex-col h-full">
                      <h4 className="font-bold text-white text-lg">{pkg.name}</h4>
                      <p className="text-3xl font-black text-cyan-400 my-3 drop-shadow-md">{pkg.price}</p>
                      <p className="text-sm text-slate-400 mb-6 flex-1">{pkg.included}</p>
                      <button 
                        disabled={!profile.verified}
                        className={`w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all shadow-md ${
                          profile.verified 
                          ? 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white shadow-cyan-900/20' 
                          : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {profile.verified ? 'Book Package' : 'Booking Disabled'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Map Section */}
            {profile.mapUrl && (
              <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
                <div className="p-8 md:p-10 border-b border-slate-700/50">
                  <h3 className="font-bold text-2xl text-white mb-2 font-serif">
                    <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest block mb-2">Location Map</span>
                    {profile.clinic?.name || profile.name}
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
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8 lg:sticky lg:top-[160px] z-30 h-fit">
            
            {/* STICKY BOOKING CARD */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-[32px] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700/60 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-[50px]"></div>
               <h3 className="font-bold text-xl text-white mb-2 relative z-10 font-serif">Book Appointment</h3>
               <p className="text-sm text-slate-400 mb-6 relative z-10">Instantly view availability or contact the clinic directly.</p>
               
               <div className="space-y-4 relative z-10">
                 <div className="w-full">
                    <PhoneRevealButton 
                      phoneNumber={profile.phone || "Not available (Not verified)"} 
                      providerId={unwrappedParams.id} 
                      providerName={profile.name} 
                      providerType={unwrappedParams.type === 'doctor' ? 'Doctor' : 'Hospital'} 
                    />
                 </div>
                 {profile.verified ? (
                   <Link href={`/portal/book?id=${unwrappedParams.id}&type=${unwrappedParams.type}`} className="w-full block text-center bg-white hover:bg-slate-100 text-slate-900 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md">
                     Check Availability
                   </Link>
                 ) : (
                   <button onClick={() => alert('Profile Unverified - Please claim profile first.')} className="w-full block text-center bg-white hover:bg-slate-100 text-slate-900 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md">
                     Check Availability
                   </button>
                 )}
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
                     onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('View profile of ' + profile.name + ' on DehaPa Hub: https://sd-dehapa-hub.vercel.app/profile/' + unwrappedParams.type + '/' + unwrappedParams.id)}`, '_blank')}
                     className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                   >
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                   </button>
                   <button 
                     onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://sd-dehapa-hub.vercel.app/profile/' + unwrappedParams.type + '/' + unwrappedParams.id)}`, '_blank')}
                     className="flex-1 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                   >
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                   </button>
                 </div>
               </div>
            </div>

            {/* Details List */}
            {profile.details && profile.details.length > 0 && (
              <div className="bg-[#0a1229] border border-cyan-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(6,182,212,0.05)] text-left">
                <h3 className="font-black text-slate-300 mb-4 uppercase tracking-widest text-xs">Information</h3>
                <div className="space-y-4">
                  {profile.details.map((item: any, i: number) => (
                    <div key={i}>
                      <p className="text-[10px] text-cyan-500/70 font-black uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="font-bold text-slate-200 text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
