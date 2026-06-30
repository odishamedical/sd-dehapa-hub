"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Star, MapPin, Clock, Phone, Globe, Shield, 
  Activity, Video, HeartPulse, CheckCircle2, 
  User, GraduationCap, Briefcase, Share2, 
  Stethoscope, Building2, Calendar, FileText, ChevronRight, FileBadge2
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
      
      {/* 1. HERO SECTION (Mockup Style - Cyan to Peach Gradient) */}
      <div className="relative w-full pt-16 pb-20 md:pb-28 overflow-hidden bg-gradient-to-r from-cyan-100/50 via-teal-50/50 to-orange-100/50">
        
        {/* Background Decorative SVG */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-white fill-current translate-y-10">
            <path d="M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,144C672,149,768,203,864,224C960,245,1056,235,1152,197.3C1248,160,1344,96,1392,64L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start">
          
          {/* Logo Box */}
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-white rounded-3xl p-2 shadow-lg border-2 border-white relative">
            <img src={profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0f766e&color=fff`} className="w-full h-full object-cover rounded-2xl" alt={profile.name} />
            {verified && (
              <div className="absolute -bottom-3 -right-3 bg-emerald-500 p-2 rounded-full border-4 border-white shadow-sm" title="Verified Institution">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Title & Stats */}
          <div className="flex-1 text-center md:text-left mt-2">
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-none mb-3">
              {profile.name}
            </h1>
            <p className="text-lg text-slate-600 font-medium mb-4">
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
                  <HeartPulse className="w-4 h-4" /> Emergency Call
               </button>
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-between gap-2">
               <span className="flex items-center gap-2"><Video className="w-4 h-4" /> Video Consultation</span>
               <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
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
                className={`whitespace-nowrap px-4 py-2 sm:py-5 text-sm sm:text-[15px] font-bold tracking-wide transition-all border-b-[3px] shrink-0 ${activeSection === tab.id ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50 sm:bg-transparent rounded-lg sm:rounded-none' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
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
               <div className="p-6 border-b border-slate-100 flex flex-wrap gap-3">
                  <div className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                     <Building2 className="w-3.5 h-3.5 text-cyan-600" /> Multi-Specialty Hospital
                  </div>
                  <div className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                     <FileBadge2 className="w-3.5 h-3.5 text-cyan-600" /> NABH Accredited
                  </div>
                  <div className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                     <Calendar className="w-3.5 h-3.5 text-cyan-600" /> Established: 1995
                  </div>
                  <div className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                     <Building2 className="w-3.5 h-3.5 text-cyan-600" /> Private Hospital
                  </div>
               </div>
               
               <div className="flex flex-col md:flex-row">
                  {/* Contact Info */}
                  <div className="p-6 md:p-8 w-full md:w-1/3 flex flex-col gap-6 md:border-r border-slate-100">
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
                        <Activity className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Emergency</p>
                           <p className="font-bold text-red-600">24/7 Service Available</p>
                        </div>
                     </div>
                  </div>

                  {/* Wide Map/Banner Image */}
                  <div className="flex-1 relative bg-slate-200 min-h-[250px]">
                     {/* Placeholder logic for map/image blend from mockup */}
                     <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80" className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Hospital Building" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                     <div className="absolute bottom-6 right-6">
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(profile.address || profile.name)}`} target="_blank" rel="noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-0.5">
                           <MapPin className="w-4 h-4" /> Get Directions
                        </a>
                     </div>
                  </div>
               </div>
            </section>

            {/* DEPARTMENTS CARD */}
            <section id="departments" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-800">Our Departments</h2>
                  <Link href="#" className="text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors">Explore All</Link>
               </div>
               
               {/* Pastel Grid */}
               <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {['Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics', 'Oncology'].map((dept, i) => {
                     const colors = [
                        'bg-gradient-to-b from-teal-50 to-white border-teal-100 text-teal-700',
                        'bg-gradient-to-b from-cyan-50 to-white border-cyan-100 text-cyan-700',
                        'bg-gradient-to-b from-blue-50 to-white border-blue-100 text-blue-700',
                        'bg-gradient-to-b from-purple-50 to-white border-purple-100 text-purple-700',
                        'bg-gradient-to-b from-orange-50 to-white border-orange-100 text-orange-700',
                     ];
                     const icons = [<HeartPulse key={1}/>, <Activity key={2}/>, <Shield key={3}/>, <User key={4}/>, <FileText key={5}/>];
                     
                     return (
                        <div key={i} className={`rounded-2xl border p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer ${colors[i % colors.length]}`}>
                           <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                              <span className="w-6 h-6">{icons[i % icons.length]}</span>
                           </div>
                           <h4 className="font-black text-sm mb-3">{dept}</h4>
                           <button className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full hover:bg-slate-50 transition-colors">
                              Explore
                           </button>
                        </div>
                     );
                  })}
               </div>
            </section>

            {/* DOCTORS SCROLL */}
            <section id="doctors" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-800">Meet Our Doctors</h2>
                  <Link href="#" className="text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors">View All</Link>
               </div>
               
               <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 snap-x">
                  {[1, 2, 3, 4].map((i) => (
                     <div key={i} className="w-64 shrink-0 snap-center bg-slate-50 rounded-2xl border border-slate-100 p-4 flex flex-col hover:border-cyan-200 hover:shadow-md transition-all">
                        <div className="flex gap-4 items-center mb-4">
                           <img src={`https://ui-avatars.com/api/?name=Dr+${i}&background=e2e8f0`} className="w-14 h-14 rounded-xl object-cover shadow-sm" alt="Doctor" />
                           <div>
                              <h4 className="font-bold text-slate-800 leading-tight">Dr. Anjali Patel</h4>
                              <p className="text-xs text-slate-500 font-medium mt-1">Cardiologist</p>
                           </div>
                        </div>
                        <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-2.5 rounded-lg transition-colors mt-auto shadow-sm">
                           View Profile
                        </button>
                     </div>
                  ))}
               </div>
            </section>

            {/* FACILITIES & TESTIMONIALS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <section id="facilities" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                  <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-cyan-600"/> Facilities & Services</h2>
                  <div className="grid grid-cols-2 gap-4">
                     {['ICU & Trauma Care', 'MRI & CT Scan', '24/7 Pharmacy', 'Deluxe Rooms', 'Blood Bank', 'Ambulance'].map((fac, i) => (
                        <div key={i} className="flex items-center gap-2">
                           <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                           <span className="text-sm font-bold text-slate-700">{fac}</span>
                        </div>
                     ))}
                  </div>
               </section>

               <section id="reviews" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col justify-between">
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
      
      {/* CSS for hiding scrollbars easily inline */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
