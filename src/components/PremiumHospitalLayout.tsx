import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CategoryNav from '@/components/CategoryNav';
import Breadcrumb from '@/components/Breadcrumb';
import { Calendar, Phone, MapPin, Star, Shield, Activity, Clock, CheckCircle2, ChevronRight, Share2, HeartPulse, Stethoscope, Video, Heart, Syringe, Eye, Brain } from 'lucide-react';
import BookingEngine from '@/components/BookingEngine';

export default function PremiumHospitalLayout({ profile, unwrappedParams }: { profile: any, unwrappedParams: any }) {
  const [activeTab, setActiveTab] = useState('overview');

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

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&q=80')] bg-cover bg-center mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#040815] via-[#0a1229]/90 to-transparent"></div>
        
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-[#040815] p-2 shadow-2xl border border-slate-700 shrink-0">
            <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center bg-slate-800 border border-slate-600">
               {profile.image ? (
                 <div className="relative w-full h-full">
                   <Image src={profile.image} alt="Logo" fill sizes="(max-width: 768px) 128px, 160px" className="object-cover" />
                 </div>
               ) : (
                 <span className="text-4xl">🏥</span>
               )}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-400 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              Premium Partner
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 drop-shadow-md text-white">{profile.name}</h1>
            <p className="text-xl text-cyan-400 font-medium mb-6 drop-shadow-sm">{profile.subtitle}</p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {Object.entries(profile.stats || {}).map(([k, v]) => (
                <div key={k} className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-xl shadow-inner">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">{k}</p>
                  <p className="font-bold text-slate-200 text-lg">{v as string}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-[#0a1229] border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 flex gap-8 overflow-x-auto hide-scrollbar">
          {['overview', 'departments', 'health-packages'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 font-black tracking-widest text-sm whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'overview' && (
              <>
                <section className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-slate-800">
                  <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-3">About Us</h3>
                  <p className="text-slate-300 leading-relaxed text-lg">{profile.about}</p>
                </section>

                {profile.rawImages && profile.rawImages.length > 0 && (
                  <section>
                     <h3 className="text-xl font-bold text-white mb-4">Facility Gallery</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       {profile.rawImages.map((img: string, idx: number) => (
                         <div key={idx} className="relative group overflow-hidden rounded-2xl shadow-md border border-slate-700">
                           <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none mix-blend-overlay"></div>
                           <div className="relative w-full h-48">
                             <Image src={img} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" alt="Facility" />
                           </div>
                         </div>
                       ))}
                     </div>
                  </section>
                )}
              </>
            )}

            {activeTab === 'departments' && (
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-slate-800">
                 <h3 className="text-2xl font-serif font-bold text-white mb-6">Our Centers of Excellence</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {profile.roster?.map((dept: string, i: number) => (
                     <div key={i} className="bg-[#040815] border border-slate-700 p-6 rounded-2xl hover:border-cyan-500/50 hover:bg-slate-800 transition-all group cursor-pointer shadow-inner">
                       <div className="w-12 h-12 bg-slate-900 rounded-xl shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] border border-slate-700 flex items-center justify-center mb-4 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                       </div>
                       <h4 className="font-bold text-white text-lg group-hover:text-cyan-300 transition-colors">{dept}</h4>
                       <p className="text-xs text-slate-500 mt-3 font-bold uppercase tracking-widest group-hover:text-cyan-500">View Specialists &rarr;</p>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {activeTab === 'health-packages' && (
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-slate-800">
                <h3 className="text-2xl font-serif font-bold text-white mb-6">Preventive Health Packages</h3>
                {profile.healthPackages ? (
                  <div className="grid grid-cols-1 gap-6">
                    {profile.healthPackages.map((pkg: any, i: number) => (
                      <div key={i} className="bg-[#040815] rounded-2xl p-6 md:p-8 shadow-inner border border-slate-700 flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1 w-full">
                          <h4 className="text-xl font-bold text-white mb-2">{pkg.name}</h4>
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Includes</p>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                            {pkg.included.split(',').map((test: string, j: number) => (
                              <li key={j} className="flex items-start gap-2 text-slate-300 text-sm">
                                <svg className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span>{test.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="w-full md:w-64 bg-slate-900/80 p-6 rounded-2xl border border-slate-700 text-center shrink-0">
                           <p className="text-3xl font-black text-cyan-400 mb-4">{pkg.price}</p>
                           {profile.verified ? (
                            <button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-black tracking-widest uppercase text-xs py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                              Book Package
                            </button>
                          ) : (
                            <button disabled className="w-full bg-slate-800 text-slate-500 font-bold py-3 rounded-xl cursor-not-allowed border border-slate-700 text-xs tracking-widest uppercase">
                              Booking Disabled
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#040815] rounded-2xl p-12 text-center border border-slate-700 shadow-inner">
                    <p className="text-slate-500 text-lg font-medium">No health packages have been listed yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar (Sticky) */}
          <div className="space-y-6">
             <div className="bg-[#0a1229] border border-amber-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(245,158,11,0.05)] text-center sticky top-[100px]">
               <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6 flex items-center justify-center gap-2">
                 <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                 Premium Connect
               </h3>
               
               {profile.verified ? (
                 <>
                   <button className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black tracking-widest uppercase text-xs py-4 rounded-2xl transition-all mb-3 shadow-[0_0_20px_rgba(239,68,68,0.3)] border border-red-500/50 flex items-center justify-center gap-2">
                     <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                     Emergency Dispatch
                   </button>
                   <button className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black tracking-widest uppercase text-xs py-4 rounded-2xl transition-all mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)] border border-cyan-500/50">
                     Book an Appointment
                   </button>
                 </>
               ) : (
                 <div className="bg-slate-900/80 p-5 rounded-2xl mb-4 border border-rose-500/20 shadow-inner">
                   <p className="text-xs text-rose-300 font-bold leading-relaxed uppercase tracking-widest">
                     Premium Services Disabled<br/>(Unverified Facility)
                   </p>
                 </div>
               )}

               {/* Contact Info */}
               <div className="mt-8 pt-6 border-t border-slate-800 text-left">
                  <h3 className="font-black text-slate-300 mb-4 uppercase tracking-widest text-xs">Direct Info</h3>
                  <div className="space-y-4">
                    {profile.details?.map((item: any, i: number) => (
                      <div key={i}>
                        <p className="text-[10px] text-cyan-500/70 font-black uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="font-bold text-slate-200 text-sm">{item.value}</p>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
