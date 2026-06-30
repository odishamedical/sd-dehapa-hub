"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  Star, MapPin, Clock, Phone, Globe, Shield, 
  Activity, Video, HeartPulse, CheckCircle2, 
  User, GraduationCap, Briefcase, Share2, 
  Stethoscope, Building2, Calendar, FileText, ChevronRight, FileBadge2, X, ExternalLink
} from 'lucide-react';
import CategoryNav from '@/components/CategoryNav';

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
  const [showPhone, setShowPhone] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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

  const getAdSlot = (suffix: string) => {
    return platformAds?.[`ad_slot_${type}_${suffix}`] || platformAds?.[`ad_slot_global_${suffix}`] || null;
  };
  const heroRightAd = getAdSlot('hero_right') || platformAds?.heroRight; // Fallback to old property if new ones don't exist yet

  return (
    <div className="min-h-screen bg-[#FAFAFC] font-sans selection:bg-cyan-100 selection:text-cyan-900 pb-20">
      
      {/* Editorial Navigation with Breadcrumb */}
      <div className="bg-white/90 backdrop-blur-2xl border-b border-slate-200/50 sticky top-0 z-50 transition-all shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-cyan-500" />
        <CategoryNav />
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center gap-2 text-xs font-semibold tracking-widest text-slate-500 uppercase hidden md:flex">
          <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/${type}s`} className="hover:text-teal-600 transition-colors">{type}s</Link>
          <span>/</span>
          <span className="text-slate-900 truncate max-w-[400px]">{profile.name}</span>
        </div>
      </div>

      {/* Main Content Container - Fluid Grid */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-12 mb-20">
        
        {/* HERO CARD - FULL WIDTH (Mockup Style) */}
        <div id="overview" className="bg-gradient-to-r from-cyan-50/80 via-white to-teal-50/80 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden group border-t-[6px] border-t-[#D32F2F] rounded-t-3xl shadow-sm">
          
          {/* Background Decorative SVG */}
          <div className="absolute inset-0 pointer-events-none z-0">
           {/* Background Wave */}
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-[#80DEEA] fill-current opacity-10 translate-y-16">
             <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
           </svg>
           {/* Middle Wave */}
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-[#4DB6AC] fill-current opacity-[0.15] translate-y-8">
             <path d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,149.3C672,117,768,75,864,80C960,85,1056,139,1152,160C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
           </svg>
           <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-emerald-50/40 to-transparent"></div>
           <div className="absolute bottom-0 left-0 w-96 h-32 bg-cyan-100/30 rounded-tr-full blur-3xl"></div>
          </div>

          <div className="relative w-40 h-40 md:w-52 md:h-52 shrink-0 z-10">
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm border-[5px] border-white bg-slate-100">
              <img 
                src={profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0f766e&color=fff&size=800`} 
                className="w-full h-full object-cover" 
                alt={profile.name} 
              />
              {verified && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-1.5 rounded-full border-4 border-white shadow-md" title="Verified Institution">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Title & Stats */}
          <div className="flex-1 text-center md:text-left z-10 w-full flex flex-col justify-center py-2 md:py-4">
            <h1 className="text-3xl md:text-4xl lg:text-[42px] font-black text-[#0A1128] tracking-tight leading-tight mb-1">
              {profile.name}
            </h1>
            <div className="text-slate-600 text-lg md:text-xl font-medium mb-4">
              {profile.about?.substring(0, 80) || "Empowering Care, Every Second."}
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-sm font-medium text-slate-600 ml-2">({profile.stats?.reviews || "1,245"} Reviews)</span>
              </div>
              <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-100">
                <Activity className="w-3 h-3 text-emerald-600" /> {profile.stats?.beds || "500+"} Beds
              </div>
            </div>
          </div>

          {/* Action Stack */}
          <div className="flex flex-col gap-3 w-full lg:w-[280px] shrink-0 justify-center z-10">
            <button className="bg-[#0F9D58] hover:bg-emerald-600 text-white w-full py-3 rounded-lg font-bold text-[15px] transition-all shadow-sm flex items-center justify-between px-5">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4"/> Book Appointment</span>
              <span className="opacity-50 text-[10px]">▼</span>
            </button>
            <button className="bg-[#FF3B30] hover:bg-red-600 text-white w-full py-3 rounded-lg font-bold text-[15px] transition-all shadow-sm flex items-center justify-between px-5">
              <span className="flex items-center gap-2"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Call SOS</span>
              <span className="opacity-50 text-[10px]">▼</span>
            </button>
            <button className="bg-white border-[1.5px] border-slate-200 text-[#5856D6] hover:bg-slate-50 w-full py-3 rounded-lg font-bold text-[15px] transition-all shadow-sm flex items-center justify-between px-5">
              <span className="flex items-center gap-2"><Video className="w-4 h-4"/> Telemedicine</span>
              <span className="opacity-50 text-[10px]">▼</span>
            </button>
          </div>
        </div>

        {/* 2. DYNAMIC TABS BAR (Flush with Hero) */}
        <div className="sticky top-[73px] z-40 bg-white/95 backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.02)] border-b border-slate-200 px-4 rounded-b-3xl">
          <div className="flex overflow-x-auto hide-scrollbar gap-1 items-end pt-3 max-w-[1000px] mx-auto">
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
                className={`whitespace-nowrap px-6 py-3 text-[15px] font-bold tracking-wide transition-all rounded-t-xl border-b-2 shrink-0 ${activeSection === tab.id ? 'bg-[#009688] text-white border-[#00796B] shadow-sm' : 'bg-transparent text-[#0A1128] border-transparent hover:text-[#009688] hover:bg-teal-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 xl:gap-12 items-start mt-8">
          
          {/* LEFT COLUMN (75%) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* OVERVIEW SECTION */}
            <section id="overview" className="relative w-full pt-2">
               {/* Pills Row */}
               <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-3 bg-white mb-6">
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
               {/* Map & Contact Layout */}
               <div className="w-full">
                 {/* Map Banner */}
                 <div className="w-full h-48 md:h-64 rounded-3xl overflow-hidden shadow-sm border border-slate-200 relative mb-6">
                    <iframe 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(profile.address ? `${profile.name}, ${profile.address}` : profile.name || 'Odisha')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      className="absolute inset-0 w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                 </div>
                 
                 {/* Contact Card */}
                 <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-start gap-4 w-full">
                       <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100">
                         <Building2 className="w-6 h-6 text-teal-600" />
                       </div>
                       <div>
                          <h3 className="font-black text-[#0A1128] text-xl md:text-2xl mb-1">{profile.name}</h3>
                          <p className="text-slate-500 font-medium mb-3 max-w-lg">{profile.address || "Address not provided"}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                             {profile.timings && <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"><Clock className="w-3.5 h-3.5 text-blue-500"/> {profile.timings}</span>}
                             <a href={`mailto:${profile.email || "info@hospital.com"}`} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                                <Activity className="w-3.5 h-3.5 text-red-500"/> {profile.email || "Contact via Email"}
                             </a>
                             <a href={profile.website !== "Not available (Not verified)" ? profile.website : "#"} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                                <Globe className="w-3.5 h-3.5 text-emerald-500"/> {profile.website !== "Not available (Not verified)" ? "Visit Website" : "Website N/A"}
                             </a>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(profile.address || profile.name || 'Hospital')}`} target="_blank" rel="noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-black text-sm text-center shadow-lg hover:shadow-emerald-600/30 transition-all flex justify-center items-center gap-2">
                         <MapPin className="w-4 h-4" /> Get Directions
                      </a>
                      <button onClick={() => setShowPhone(!showPhone)} className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl font-bold text-sm text-center hover:bg-slate-50 hover:border-slate-300 transition-colors flex justify-center items-center gap-2">
                         <Phone className="w-4 h-4" /> {showPhone ? (profile.phone || "Not available") : "Call Hospital"}
                      </button>
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

               {!user ? (
                 <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
                   <p className="text-xs text-rose-700 font-bold mb-3">To protect our hospitals from spam, please log in to view contact details.</p>
                   <Link href={`/login?redirect=${encodeURIComponent(pathname || '')}`} className="w-full inline-block bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl text-sm font-black transition-colors">
                     Login / Register
                   </Link>
                 </div>
               ) : (
                 <button onClick={() => alert("Care Connect modal will open here.")} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5">
                   Request Callback
                 </button>
               )}
             </div>

             {/* Ad Space */}
             {heroRightAd && (
               <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white aspect-square md:aspect-[4/3] lg:aspect-[3/4]">
                 {heroRightAd.imageUrl ? (
                   <a href={heroRightAd.linkUrl || '#'} target="_blank" rel="noreferrer">
                     <img src={heroRightAd.imageUrl} alt="Advertisement" className="w-full h-full object-cover" />
                   </a>
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-slate-50" dangerouslySetInnerHTML={{ __html: heroRightAd.htmlCode || '' }} />
                 )}
               </div>
             )}

             {/* Similar Hospitals / Explore Network */}
             {similarEntities && similarEntities.length > 0 && (
               <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl flex flex-col">
                 <h3 className="font-black text-lg text-[#0A1128] mb-4 shrink-0">Similar Hospitals</h3>
                 <div className="flex flex-col gap-4 pr-2">
                   {similarEntities.map((sim, idx) => {
                     const isHospitalOrLab = sim.category === "Hospital" || sim.category === "Diagnostic Center" || sim.category === "Pharmacy";
                     let routePath = `/doctors`;
                     if (sim.category === "Hospital") routePath = `/hospitals`;
                     else if (sim.category === "Diagnostic Center" || sim.category === "Lab") routePath = `/labs`;
                     else if (sim.category === "Pharmacy") routePath = `/pharmacies`;
                     else if (sim.category === "Ambulance") routePath = `/ambulances`;
                     
                     return (
                       <Link key={idx} href={`${routePath}/${sim.id}`} className="group flex items-center gap-4 bg-slate-50 hover:bg-white rounded-2xl p-3 transition-all border border-transparent hover:border-cyan-500/30 hover:shadow-md shrink-0">
                         <img src={sim.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(sim.name || 'Entity')}&background=0f766e&color=fff`} alt={sim.name || 'Entity'} className={`w-14 h-14 object-cover border border-slate-200 shrink-0 ${isHospitalOrLab ? 'rounded-lg' : 'rounded-xl'}`} />
                         <div className="min-w-0 flex-1">
                           <h4 className="font-bold text-sm text-[#0A1128] truncate group-hover:text-cyan-600 transition-colors">{sim.name}</h4>
                           <div className="flex items-center gap-1 mt-1">
                             <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                             <span className="text-[10px] font-bold text-slate-700">{sim.rating || sim.stats?.rating || 4.5}</span>
                             <span className="text-[10px] text-slate-500 truncate ml-1 px-2 border-l border-slate-300">{sim.subtitle || sim.category || sim.subCategory}</span>
                           </div>
                         </div>
                       </Link>
                     )
                   })}
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
