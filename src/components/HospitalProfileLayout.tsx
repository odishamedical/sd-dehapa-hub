"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Star, MapPin, Clock, Phone, Globe, Shield, 
  Activity, Video, HeartPulse, CheckCircle2, 
  User, GraduationCap, Briefcase, Share2, 
  Stethoscope, Building2, Calendar, FileText, ChevronRight, FileBadge2, X, ExternalLink
} from 'lucide-react';

interface HospitalProfileLayoutProps {
  profile: any;
  type: string; // 'hospital', 'lab', 'pharmacy'
  similarEntities?: any[];
  platformAds?: any;
  canEdit?: boolean;
  onInlineSave?: (field: string, value: any) => Promise<void>;
}

export default function HospitalProfileLayout({ 
  profile, 
  type, 
  similarEntities, 
  platformAds, 
  canEdit, 
  onInlineSave 
}: HospitalProfileLayoutProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'departments', 'doctors', 'facilities', 'academic', 'reviews'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const verified = profile.verified;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-100 selection:text-cyan-900 pb-20">
      
      {/* 1. HERO SECTION (Mockup Style - Vibrant Cyan to Peach Gradient) */}
      <div className="relative w-full pt-16 pb-20 md:pb-28 overflow-hidden bg-gradient-to-r from-cyan-400 via-cyan-50 to-orange-200">
        
        {/* Background Decorative SVG */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-white fill-current translate-y-10">
            <path d="M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,144C672,149,768,203,864,224C960,245,1056,235,1152,197.3C1248,160,1344,96,1392,64L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start">
          
          {/* Logo Box */}
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-white rounded-3xl p-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border-4 border-white relative">
            <img src={profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0f766e&color=fff`} className="w-full h-full object-cover rounded-2xl" alt={profile.name} />
            {verified && (
              <div className="absolute -bottom-3 -right-3 bg-emerald-500 p-2 rounded-full border-4 border-white shadow-md" title="Verified Institution">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Title & Stats */}
          <div className="flex-1 text-center md:text-left mt-2">
            <h1 className="text-3xl md:text-5xl font-black text-[#0A1128] tracking-tight leading-none mb-3 drop-shadow-sm">
              {profile.name}
            </h1>
            <p className="text-lg text-[#0A1128] font-bold mb-4 opacity-80">
              {profile.about?.substring(0, 60) || "Empowering Care, Every Second."}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-1 bg-white/60 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-slate-700 ml-1">({profile.stats?.reviews || "1,245"} Reviews)</span>
              </div>
              <div className="flex items-center gap-1 bg-white/60 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700 ml-1">({profile.stats?.beds || "500+"} Beds)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full sm:w-auto mt-6 md:mt-0">
            <div className="flex gap-3 w-full">
               <button className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 whitespace-nowrap">
                  <Calendar className="w-4 h-4" /> Book Appointment
               </button>
               <button className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-md shadow-red-600/20 flex items-center justify-center gap-2 whitespace-nowrap">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Call SOS
               </button>
            </div>
            <div className="flex w-full rounded-xl shadow-md overflow-hidden bg-[#5856D6] text-white">
              <button className="flex-1 px-6 py-3 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                 <Video className="w-4 h-4" /> Telemedicine
              </button>
              <div className="w-[1px] bg-white/20"></div>
              <button className="px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-center">
                 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z"/></svg>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. DYNAMIC TABS BAR */}
      <div className="sticky top-[73px] z-40 bg-white/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 sm:gap-6 lg:gap-8 items-center py-2 sm:py-0 h-16">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'departments', label: 'Departments' },
              { id: 'doctors', label: 'Doctors' },
              { id: 'facilities', label: 'Facilities' },
              { id: 'academic', label: 'Academic' },
              { id: 'reviews', label: 'Reviews' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  const el = document.getElementById(tab.id);
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 160;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className={`whitespace-nowrap px-5 py-2 text-sm sm:text-[15px] font-bold tracking-wide transition-all rounded-full shrink-0 ${activeSection === tab.id ? 'bg-emerald-500 text-white shadow-md' : 'bg-transparent text-[#0A1128] hover:text-cyan-600 hover:bg-slate-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 xl:gap-12 items-start">
          
          {/* LEFT COLUMN (75%) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* OVERVIEW CARD */}
            <section id="overview" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               {/* Pills Row */}
               <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap gap-3 bg-white">
                  <div className="text-[#0A1128] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                     <Building2 className="w-4 h-4 text-teal-600" /> {profile.type || "Multi-Specialty Hospital"}
                  </div>
                  <div className="text-[#0A1128] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                     <FileBadge2 className="w-4 h-4 text-blue-600" /> {profile.accreditations?.[0] || "NABH Accredited"}
                  </div>
                  <div className="text-[#0A1128] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                     <Calendar className="w-4 h-4 text-red-500" /> Established: {profile.establishedYear || "1995"}
                  </div>
                  <div className="text-[#0A1128] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                     <Building2 className="w-4 h-4 text-cyan-600" /> {profile.ownershipType || "Private Hospital"}
                  </div>
               </div>
               
               <div className="flex flex-col md:flex-row">
                  {/* Contact Info */}
                  <div className="p-6 md:p-8 w-full md:w-1/3 flex flex-col gap-6 md:border-r border-slate-100 bg-gradient-to-br from-cyan-50 via-teal-50/50 to-emerald-50 shadow-inner">
                     <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Contact Us</p>
                           <p className="font-bold text-slate-800">{profile.phone || "+91 98765 43210"}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="overflow-hidden">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Website</p>
                           <a href={profile.website !== "Not available (Not verified)" ? profile.website : "#"} target="_blank" rel="noreferrer" className="font-bold text-blue-600 truncate block hover:underline">
                              {profile.website !== "Not available (Not verified)" ? profile.website : "www.hospital.com"}
                           </a>
                        </div>
                     </div>
                     <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        <div className="overflow-hidden">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Address</p>
                           <a href={`mailto:${profile.email || "info@hospital.com"}`} className="font-bold text-slate-800 truncate block hover:underline">
                              {profile.email || "info@hospital.com"}
                           </a>
                        </div>
                     </div>
                     <div className="flex items-start gap-3">
                        <Activity className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Emergency</p>
                           <p className="font-bold text-red-600">24/7 Service Available</p>
                        </div>
                     </div>
                  </div>

                  {/* Map Container */}
                  <div className="flex-1 p-6 md:p-8 bg-white flex flex-col">
                     <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        {profile.mapUrl && profile.mapUrl.includes('http') ? (
                          <iframe src={profile.mapUrl} className="absolute inset-0 w-full h-full border-0 grayscale-[20%] contrast-125 opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500" loading="lazy" allowFullScreen />
                        ) : (
                          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119743.53374959132!2d85.7380517!3d20.2960587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a1909d2d5170aa5%3A0xfc580e2b68b33fa8!2sBhubaneswar%2C%20Odisha!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" className="absolute inset-0 w-full h-full border-0 grayscale-[20%] contrast-125 opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500" loading="lazy" allowFullScreen />
                        )}
                        <div className="absolute top-4 left-4 z-10">
                           <a href={`https://maps.google.com/?q=${encodeURIComponent(profile.address || profile.name)}`} target="_blank" rel="noreferrer" className="bg-white hover:bg-slate-50 text-blue-600 px-4 py-2 rounded border border-slate-200 font-bold text-sm shadow-sm flex items-center gap-1.5 transition-colors">
                              Open in Maps <ExternalLink className="w-3.5 h-3.5" />
                           </a>
                        </div>
                        <div className="absolute bottom-4 right-4 z-10">
                           <a href={`https://maps.google.com/?q=${encodeURIComponent(profile.address || profile.name)}`} target="_blank" rel="noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-0.5">
                              <MapPin className="w-4 h-4" /> Get Directions
                           </a>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* DEPARTMENTS CARD */}
            {(!verified || (profile.departmentsArray && profile.departmentsArray.length > 0)) && (
              <section id="departments" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-800">Our Departments</h2>
                    {profile.departmentsArray && profile.departmentsArray.length > 0 && <Link href="#" className="text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors">Explore All</Link>}
                 </div>
                 
                 {(!profile.departmentsArray || profile.departmentsArray.length === 0) ? (
                   <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative">
                      {/* Transparent overlay for the whole grid to catch clicks easily if needed, but clicking cards is better */}
                      {['Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics', 'Oncology', 'Gynecology'].map((dept, i) => {
                         const themes = [
                            { bg: 'bg-gradient-to-br from-teal-100 to-emerald-200', text: 'text-teal-900', icon: 'text-teal-600' },
                            { bg: 'bg-gradient-to-br from-cyan-100 to-sky-200', text: 'text-cyan-900', icon: 'text-cyan-600' },
                            { bg: 'bg-gradient-to-br from-blue-100 to-indigo-200', text: 'text-blue-900', icon: 'text-blue-600' },
                            { bg: 'bg-gradient-to-br from-purple-100 to-fuchsia-200', text: 'text-purple-900', icon: 'text-purple-600' },
                            { bg: 'bg-gradient-to-br from-orange-100 to-amber-200', text: 'text-orange-900', icon: 'text-orange-600' },
                            { bg: 'bg-gradient-to-br from-rose-100 to-pink-200', text: 'text-rose-900', icon: 'text-rose-600' },
                         ];
                         const theme = themes[i % themes.length];
                         const icons = [
                            <HeartPulse key={1} className={`w-10 h-10 ${theme.icon} fill-current/20`} />, 
                            <Activity key={2} className={`w-10 h-10 ${theme.icon} fill-current/20`} />, 
                            <Shield key={3} className={`w-10 h-10 ${theme.icon} fill-current/20`} />, 
                            <User key={4} className={`w-10 h-10 ${theme.icon} fill-current/20`} />, 
                            <FileText key={5} className={`w-10 h-10 ${theme.icon} fill-current/20`} />, 
                            <HeartPulse key={6} className={`w-10 h-10 ${theme.icon} fill-current/20`} />
                         ];
                         
                         return (
                            <div key={i} onClick={() => setShowUnverifiedModal(true)} className={`rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition-all cursor-pointer ${theme.bg}`}>
                               <div className="mb-3">
                                  {icons[i % icons.length]}
                               </div>
                               <h4 className={`font-black text-sm md:text-[15px] mb-4 ${theme.text}`}>{dept}</h4>
                               <button className={`bg-white shadow-sm border-2 border-white ${theme.icon} text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full hover:bg-white/90 transition-colors w-full`}>
                                  Explore
                               </button>
                            </div>
                         );
                      })}
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      {profile.departmentsArray.map((dept: any, i: number) => {
                         const themes = [
                            { bg: 'bg-gradient-to-br from-teal-100 to-emerald-200', text: 'text-teal-900', icon: 'text-teal-600' },
                            { bg: 'bg-gradient-to-br from-cyan-100 to-sky-200', text: 'text-cyan-900', icon: 'text-cyan-600' },
                            { bg: 'bg-gradient-to-br from-blue-100 to-indigo-200', text: 'text-blue-900', icon: 'text-blue-600' },
                            { bg: 'bg-gradient-to-br from-purple-100 to-fuchsia-200', text: 'text-purple-900', icon: 'text-purple-600' },
                            { bg: 'bg-gradient-to-br from-orange-100 to-amber-200', text: 'text-orange-900', icon: 'text-orange-600' },
                            { bg: 'bg-gradient-to-br from-rose-100 to-pink-200', text: 'text-rose-900', icon: 'text-rose-600' },
                         ];
                         const nameLen = dept.name ? dept.name.length : i;
                         const theme = themes[nameLen % themes.length];
                         const icons = [
                            <HeartPulse key={1} className={`w-10 h-10 ${theme.icon} fill-current/20`} />, 
                            <Activity key={2} className={`w-10 h-10 ${theme.icon} fill-current/20`} />, 
                            <Shield key={3} className={`w-10 h-10 ${theme.icon} fill-current/20`} />, 
                            <User key={4} className={`w-10 h-10 ${theme.icon} fill-current/20`} />, 
                            <FileText key={5} className={`w-10 h-10 ${theme.icon} fill-current/20`} />, 
                            <HeartPulse key={6} className={`w-10 h-10 ${theme.icon} fill-current/20`} />
                         ];
                         const icon = icons[nameLen % icons.length];
                         
                         return (
                            <div key={i} className={`rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition-all cursor-pointer ${theme.bg}`}>
                               <div className="mb-3">
                                  {icon}
                               </div>
                               <h4 className={`font-black text-sm md:text-[15px] mb-4 ${theme.text}`}>{dept.name}</h4>
                               <button className={`bg-white shadow-sm border-2 border-white ${theme.icon} text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full hover:bg-white/90 transition-colors w-full`}>
                                  Explore
                               </button>
                            </div>
                         );
                      })}
                   </div>
                 )}
              </section>
            )}

            {/* DOCTORS SCROLL */}
            {(!verified || (profile.rosterDoctors && profile.rosterDoctors.length > 0)) && (
              <section id="doctors" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-800">Meet Our Doctors</h2>
                    {profile.rosterDoctors && profile.rosterDoctors.length > 0 && <Link href="#" className="text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors">View All</Link>}
                 </div>
                 
                 {(!profile.rosterDoctors || profile.rosterDoctors.length === 0) ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 pb-2">
                      {[1, 2, 3, 4, 5].map((_, i) => {
                         const bgColors = ['bg-blue-400', 'bg-orange-400', 'bg-emerald-400', 'bg-purple-400', 'bg-pink-400'];
                         return (
                           <div key={i} onClick={() => setShowUnverifiedModal(true)} className="bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-3xl border border-white shadow-sm p-5 flex flex-col hover:border-cyan-200 hover:shadow-md transition-all cursor-pointer">
                              <div className="flex gap-4 items-center mb-5">
                                 {/* Faceless Silhouette with colorful background */}
                                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-sm ${bgColors[i % 5]}`}>
                                    <User className="w-8 h-8 opacity-90" />
                                 </div>
                                 <div className="overflow-hidden">
                                    <h4 className="font-bold text-slate-800 text-[15px] leading-tight truncate">Doctor {i + 1}</h4>
                                    <p className="text-[13px] text-cyan-600 font-bold mt-1 truncate">Specialist</p>
                                 </div>
                              </div>
                              <button className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold text-xs py-3 rounded-full mt-auto flex items-center justify-center shadow-[0_4px_10px_rgba(6,182,212,0.3)] transition-all pointer-events-none">
                                 Book Now
                              </button>
                           </div>
                         );
                      })}
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 pb-2">
                      {profile.rosterDoctors.map((doc: any, i: number) => (
                         <div key={i} className="bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-3xl border border-white shadow-sm p-5 flex flex-col hover:border-cyan-200 hover:shadow-md transition-all">
                            <div className="flex gap-4 items-center mb-5">
                               <img src={doc.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=e2e8f0`} className="w-16 h-16 rounded-2xl object-cover shadow-sm" alt={doc.name} />
                               <div className="overflow-hidden">
                                  <h4 className="font-bold text-slate-800 text-[15px] leading-tight truncate" title={doc.name}>{doc.name}</h4>
                                  <p className="text-[13px] text-cyan-600 font-bold mt-1 truncate" title={doc.specialty}>{doc.specialty}</p>
                               </div>
                            </div>
                            {doc.slug ? (
                              <Link href={`/profile/${doc.slug}`} className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold text-xs py-3 rounded-full transition-all mt-auto shadow-[0_4px_10px_rgba(6,182,212,0.3)] flex items-center justify-center">
                                 View Profile
                              </Link>
                            ) : (
                              <button className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white opacity-80 font-bold text-xs py-3 rounded-full mt-auto shadow-[0_4px_10px_rgba(6,182,212,0.3)] cursor-not-allowed">
                                 Profile Unavailable
                              </button>
                            )}
                         </div>
                      ))}
                   </div>
                 )}
              </section>
            )}

            {/* FACILITIES & TESTIMONIALS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
               {(!verified || (profile.facilities && profile.facilities.length > 0)) && (
                 <section id="facilities" className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-3xl border border-blue-100 shadow-sm p-6 md:p-8 flex flex-col">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-cyan-600"/> Facilities & Services</h2>
                    {(!profile.facilities || profile.facilities.length === 0) ? (
                      <div className="grid grid-cols-2 gap-4">
                         {['ICU & Trauma Care', 'MRI & CT Scan', '24/7 Pharmacy', 'Deluxe Rooms', 'Blood Bank', 'Ambulance'].map((fac, i) => (
                            <div key={i} onClick={() => setShowUnverifiedModal(true)} className="flex items-center gap-2 cursor-pointer group p-2 hover:bg-slate-50 rounded-lg transition-colors">
                               <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-200 group-hover:bg-cyan-500 transition-colors shadow-inner">
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                               </div>
                               <span className="text-sm font-bold text-slate-400 group-hover:text-cyan-700">{fac}</span>
                            </div>
                         ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                         {profile.facilities.map((fac: string, i: number) => {
                            const iconColors = ['text-orange-500', 'text-blue-500', 'text-emerald-500', 'text-purple-500'];
                            const color = iconColors[i % iconColors.length];
                            return (
                              <div key={i} className="flex items-center gap-2">
                                 <svg className={`w-4 h-4 shrink-0 ${color}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                 <span className="text-sm font-bold text-slate-700">{fac}</span>
                              </div>
                            )
                         })}
                      </div>
                    )}
                 </section>
               )}

               <section id="reviews" className="bg-gradient-to-br from-rose-50/80 to-orange-50/80 rounded-3xl border border-orange-100 shadow-sm p-6 md:p-8 flex flex-col justify-between">
                  <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><User className="w-5 h-5 text-cyan-600"/> Patient Testimonials</h2>
                  <div className="flex items-start gap-4">
                     <img src="https://ui-avatars.com/api/?name=Patient&background=e2e8f0" className="w-12 h-12 rounded-full shadow-sm" alt="Patient" />
                     <div>
                        <p className="font-bold text-sm text-slate-800">Excellent medical care and staff!</p>
                        <div className="flex gap-1 mt-1 mb-2">
                           {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-amber-500 fill-amber-500" />)}
                        </div>
                        <p className="text-xs text-slate-500 italic">"The doctors were very attentive and the facilities are world-class."</p>
                     </div>
                  </div>
               </section>
            </div>
            
            {/* BOTTOM VERIFICATION TICKET */}
            {!verified && (
              <div className="bg-[#0A1128] rounded-3xl shadow-xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden mt-8 border border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 border border-cyan-500/30">
                    <Shield className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-lg md:text-xl mb-1">Are you the hospital owner?</h4>
                    <p className="text-slate-400 text-sm max-w-md">Claim and verify this profile to update information, customize sections, and unlock premium features.</p>
                  </div>
                </div>
                <button onClick={() => setShowUnverifiedModal(true)} className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-[#0A1128] font-black px-8 py-4 rounded-full transition-colors whitespace-nowrap shadow-[0_4px_15px_rgba(6,182,212,0.4)] relative z-10">
                  Claim Profile
                </button>
              </div>
            )}
            
          </div>

          {/* RIGHT COLUMN (25% Sidebar ported from UnifiedProfileLayout) */}
          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-[160px] lg:self-start">
             {/* Care Connect Booking Hub */}
             <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl overflow-hidden relative group">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
               <h3 className="font-black text-xl text-[#0A1128] mb-1">Care Connect</h3>
               <p className="text-xs text-slate-500 font-bold mb-6">Secure Priority Booking</p>
               
               <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 text-center">
                 <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Clinic Direct Line</p>
                 <div className="flex items-center justify-center gap-2">
                   <Phone className="w-4 h-4 text-emerald-600" />
                   <p className="text-lg font-black text-[#0A1128] font-mono">+91 98765 <span className="opacity-40">*****</span></p>
                 </div>
               </div>

               <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5">
                 Request Callback
               </button>
             </div>

             {/* Ad Space */}
             {platformAds?.heroRight && (
               <div className="w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white aspect-[3/4]">
                 {platformAds.heroRight.imageUrl ? (
                   <img src={platformAds.heroRight.imageUrl} alt="Ad" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-slate-50" dangerouslySetInnerHTML={{ __html: platformAds.heroRight.htmlCode }} />
                 )}
               </div>
             )}

             {/* Explore Network */}
             {similarEntities && similarEntities.length > 0 && (
               <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl flex flex-col">
                 <h3 className="font-black text-lg text-[#0A1128] mb-4">Explore Network</h3>
                 <div className="flex flex-col gap-4">
                   {similarEntities.slice(0,4).map((sim, idx) => (
                     <Link key={idx} href={`/hospitals/${sim.id}`} className="group flex items-center gap-4 bg-slate-50 hover:bg-white rounded-2xl p-3 transition-all border border-transparent hover:border-cyan-500/30 hover:shadow-md">
                       <img src={sim.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(sim.name)}`} alt={sim.name} className="w-12 h-12 object-cover border border-slate-200 rounded-lg shrink-0" />
                       <div className="min-w-0 flex-1">
                         <h4 className="font-bold text-sm text-[#0A1128] truncate group-hover:text-cyan-600">{sim.name}</h4>
                         <div className="flex items-center gap-1 mt-0.5">
                           <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                           <span className="text-[10px] font-bold text-slate-700">{sim.rating || 4.5}</span>
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
      
      {/* UNVERIFIED MODAL */}
      {showUnverifiedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowUnverifiedModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6 border border-cyan-200 shadow-sm mx-auto">
              <Shield className="w-8 h-8 text-cyan-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 text-center mb-2">Unverified Data</h3>
            <p className="text-slate-500 text-center mb-8 font-medium">This section's information is currently unverified. Are you the authorized representative for this institution?</p>
            <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm py-4 rounded-xl transition-all shadow-lg shadow-cyan-600/30 flex justify-center items-center gap-2">
              Claim Profile to Update
            </button>
          </div>
        </div>
      )}

      
      {/* CSS for hiding scrollbars easily inline */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
