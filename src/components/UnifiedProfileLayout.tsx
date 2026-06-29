"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Award, MapPin, Phone, Star, CheckCircle2, Shield, 
  Stethoscope, Clock, FileText, Activity, 
  HeartPulse, Navigation, GraduationCap, Globe, Fingerprint,
  Briefcase, Medal, Video, Image as ImageIcon, Banknote
} from 'lucide-react';
import CategoryNav from '@/components/CategoryNav';

interface UnifiedProfileProps {
  profile: any;
  type: 'doctor' | 'hospital' | 'lab' | 'pharmacy' | 'ambulance';
}

export default function UnifiedProfileLayout({ profile, type }: UnifiedProfileProps) {
  const verified = profile.verified || profile.isPremium;
  const isDoctor = type === 'doctor';
  const isHospital = type === 'hospital';
  const isLab = type === 'lab';

  const [showPhone, setShowPhone] = useState(false);

  const hasValidData = (arr: any[]) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return false;
    if (typeof arr[0] === 'string' && arr[0].includes('Not available')) return false;
    if (typeof arr[0] === 'object' && Object.values(arr[0]).some(v => typeof v === 'string' && v.includes('Not available'))) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] font-sans pb-[160px] selection:bg-teal-900 selection:text-white">
      
      {/* Editorial Navigation */}
      <div className="bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 sticky top-0 z-50 transition-all">
        <CategoryNav />
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center gap-2 text-xs font-semibold tracking-widest text-slate-400 uppercase">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/${type}s`} className="hover:text-slate-900 transition-colors">{type}s</Link>
          <span>/</span>
          <span className="text-slate-900 truncate max-w-[200px]">{profile.name}</span>
        </div>
      </div>

      {/* The Cinematic Hero */}
      <div className="relative w-full bg-white border-b border-slate-200/50 overflow-hidden">
        {/* Editorial Background Motif */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-slate-100 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70 pointer-events-none"></div>
        
        <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-16 relative z-20">
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
            
            {/* The Prestige Portrait */}
            <div className="relative shrink-0 group">
              <div className="absolute inset-0 bg-slate-900 rounded-[2rem] rotate-2 opacity-5 group-hover:rotate-4 transition-transform duration-700"></div>
              <img 
                src={profile.image || profile.avatar || "https://ui-avatars.com/api/?name=Doc&background=0f766e&color=fff&size=400"} 
                alt={profile.name}
                className="relative w-48 h-48 md:w-64 md:h-64 rounded-[2rem] object-cover shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 bg-white z-10 transition-transform duration-700 group-hover:-translate-y-2"
              />
              
              {/* Platinum / Gold Seal */}
              {verified && (
                <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-[#4A3B00] rounded-full p-1 shadow-[0_10px_30px_rgba(212,175,55,0.4)] border-4 border-white z-20 hover:scale-105 transition-transform cursor-default group/badge">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center border border-white/40">
                    <CheckCircle2 className="w-6 h-6 drop-shadow-sm" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover/badge:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap font-bold pointer-events-none">
                    Dehapa Verified
                  </div>
                </div>
              )}
            </div>

            {/* The Headline (Editorial Typography) */}
            <div className="flex-1 w-full text-center md:text-left mt-2 md:mt-4">
              <h1 className="text-4xl md:text-6xl font-black text-[#0A1128] tracking-tight leading-[1.1]">
                {profile.name}
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 font-serif italic mt-3">
                {profile.subtitle || profile.category || profile.specialty || "Eminent Healthcare Specialist"}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-8">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                    <MapPin className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-600 font-semibold uppercase tracking-wider">
                    {profile.city || profile.address?.split(',')[0] || "Location unavailable"}
                  </p>
                </div>
                {profile.fee && profile.fee !== "Contact Clinic" && (
                  <div className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-sm text-emerald-700 font-bold uppercase tracking-wider">
                      Consultation: ₹{profile.fee}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Prestige Trust Bar (Data as Art) */}
      <div className="max-w-[1200px] mx-auto px-6 -mt-8 relative z-30">
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-100 p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-slate-100">
            
            {/* Metric 1 */}
            <div className="flex flex-col items-center justify-center text-center px-4">
              <p className="text-4xl font-black text-[#0A1128] tracking-tighter">
                {isDoctor ? profile.experience?.replace(/\D/g,'') || '10' : profile.totalBeds?.replace(/\D/g,'') || '24'}
                <span className="text-2xl text-teal-600 font-serif italic">+</span>
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
                {isDoctor ? 'Years Experience' : (isHospital ? 'Total Beds' : 'Service')}
              </p>
            </div>

            {/* Metric 2 */}
            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="flex items-center justify-center gap-1">
                <p className="text-4xl font-black text-[#0A1128] tracking-tighter">{profile.rating || '4.8'}</p>
                <Star className="w-6 h-6 text-amber-400 fill-current -mt-3" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
                {profile.reviews ? `${profile.reviews} Patient Reviews` : 'Patient Rating'}
              </p>
            </div>

            {/* Metric 3 */}
            <div className="flex flex-col items-center justify-center text-center px-4">
              <p className="text-2xl md:text-3xl font-black text-[#0A1128] tracking-tight line-clamp-1">
                {profile.qualification || profile.category || 'Specialist'}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
                {isDoctor ? 'Primary Credential' : 'Category'}
              </p>
            </div>

            {/* Metric 4 */}
            <div className="flex flex-col items-center justify-center text-center px-4">
              {profile.registrationNumber && profile.registrationNumber !== "Not available (Not verified)" ? (
                <>
                  <p className="text-xl md:text-2xl font-black text-[#0A1128] tracking-tight line-clamp-1 font-mono">
                    {profile.registrationNumber}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
                    Medical Council Reg.
                  </p>
                </>
              ) : (
                <>
                  <Shield className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Basic Profile
                  </p>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* The Narrative Content */}
      <div className="max-w-[1000px] mx-auto px-6 py-16">
        
        {/* Claim Profile Upsell */}
        {!verified && (
          <div className="bg-[#0A1128] rounded-[2rem] p-8 md:p-12 mb-16 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-900/20 to-amber-900/20"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors"></div>
            
            <div className="relative z-10 text-center sm:text-left">
              <h4 className="font-black text-white text-2xl md:text-3xl">Are you {profile.name}?</h4>
              <p className="text-slate-400 mt-2 max-w-lg text-lg">Claim your digital stage. Verify your credentials, add exclusive clinic media, and unlock the Dehapa VIP Rx Pad.</p>
            </div>
            <Link href={`/claim-profile?id=${profile.id}`} className="relative z-10 shrink-0 bg-white text-[#0A1128] px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-[0_10px_30px_rgba(255,255,255,0.2)]">
              Claim Exclusivity
            </Link>
          </div>
        )}

        <div className="space-y-24">
          
          {/* About / Bio Narrative */}
          <section className="relative pl-0 md:pl-16">
            <div className="hidden md:block absolute left-0 top-2 w-[1px] h-full bg-slate-200"></div>
            <h2 className="text-3xl font-black text-[#0A1128] mb-8">The Profile</h2>
            <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-loose font-serif">
              <p>{profile.about || profile.bio || `Eminent detailed information about ${profile.name} is currently being curated. Recognized for their dedication to advancing healthcare and patient outcomes.`}</p>
            </div>
          </section>

          {/* Specializations (Elegant Pills) */}
          {hasValidData(profile.specialties) && (
            <section className="relative pl-0 md:pl-16">
              <div className="hidden md:block absolute left-0 top-2 w-[1px] h-full bg-slate-200"></div>
              <h2 className="text-3xl font-black text-[#0A1128] mb-8">Areas of Excellence</h2>
              <div className="flex flex-wrap gap-4">
                {profile.specialties.map((spec: string, index: number) => (
                  <span key={index} className="bg-slate-100 text-slate-800 px-6 py-3 rounded-full text-sm font-bold tracking-wide shadow-sm hover:bg-slate-200 transition-colors cursor-default">
                    {spec}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education Timeline */}
          {hasValidData(profile.education) && (
            <section className="relative pl-0 md:pl-16">
              <div className="hidden md:block absolute left-0 top-2 w-[1px] h-full bg-slate-200"></div>
              <h2 className="text-3xl font-black text-[#0A1128] mb-8">Academic Pedigree</h2>
              <div className="space-y-8">
                {profile.education.map((edu: any, index: number) => (
                  <div key={index} className="flex gap-6 group">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="pt-2">
                      <h3 className="font-black text-[#0A1128] text-xl">{edu.degree}</h3>
                      <p className="text-slate-500 mt-2 text-lg font-serif italic">{edu.institution || edu.college || 'Institution not specified'}</p>
                      {edu.year && <p className="text-slate-400 text-sm mt-1 font-bold tracking-widest">{edu.year}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Past Experience Timeline */}
          {hasValidData(profile.experiences) && (
            <section className="relative pl-0 md:pl-16">
              <div className="hidden md:block absolute left-0 top-2 w-[1px] h-full bg-slate-200"></div>
              <h2 className="text-3xl font-black text-[#0A1128] mb-8">Professional Trajectory</h2>
              <div className="space-y-8">
                {profile.experiences.map((exp: any, index: number) => (
                  <div key={index} className="flex gap-6 group">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="pt-2">
                      <h3 className="font-black text-[#0A1128] text-xl">{exp.role || exp.title}</h3>
                      <p className="text-slate-500 mt-2 text-lg font-serif italic">{exp.hospital || exp.organization}</p>
                      <p className="text-slate-400 text-sm mt-1 font-bold tracking-widest">{exp.duration || exp.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Awards (Art Gallery Style) */}
          {hasValidData(profile.awards) && (
            <section className="relative pl-0 md:pl-16">
              <div className="hidden md:block absolute left-0 top-2 w-[1px] h-full bg-slate-200"></div>
              <h2 className="text-3xl font-black text-[#0A1128] mb-8">Accolades & Honors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.awards.map((award: any, index: number) => (
                  <div key={index} className="bg-white border border-slate-200 p-8 rounded-[2rem] flex flex-col justify-between h-full shadow-sm hover:shadow-xl transition-shadow">
                    <Medal className="w-8 h-8 text-[#D4AF37] mb-6" />
                    <div>
                      <p className="font-black text-[#0A1128] text-lg leading-snug">{award.title || award.name}</p>
                      <p className="text-sm text-slate-400 mt-2 font-bold tracking-widest">{award.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {hasValidData(profile.languages) && (
            <section className="relative pl-0 md:pl-16">
              <div className="hidden md:block absolute left-0 top-2 w-[1px] h-full bg-slate-200"></div>
              <h2 className="text-3xl font-black text-[#0A1128] mb-8">Languages Spoken</h2>
              <div className="flex flex-wrap gap-4">
                {profile.languages.map((lang: string, index: number) => (
                  <div key={index} className="bg-white border border-slate-200 px-6 py-3 rounded-full flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-default">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-[#0A1128] text-sm">{lang}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Media / Gallery (Editorial Strip) */}
          {((profile.galleryImages && profile.galleryImages.length > 0) || (profile.rawImages && profile.rawImages.length > 0) || (profile.youtubeLinks && profile.youtubeLinks.length > 0)) && (
            <section className="relative pl-0 md:pl-16">
              <div className="hidden md:block absolute left-0 top-2 w-[1px] h-full bg-slate-200"></div>
              <h2 className="text-3xl font-black text-[#0A1128] mb-8">Visual Narrative</h2>
              
              {/* Images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {[...(profile.galleryImages || []), ...(profile.rawImages || [])].slice(0, 6).map((img: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-[2rem] overflow-hidden bg-slate-100 shadow-sm">
                    <img src={img} alt="Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 grayscale hover:grayscale-0" />
                  </div>
                ))}
              </div>
              
              {/* Videos */}
              {profile.youtubeLinks && profile.youtubeLinks.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-8 hide-scrollbar snap-x">
                  {profile.youtubeLinks.map((link: string, idx: number) => {
                    const videoId = link.split('v=')[1]?.split('&')[0] || link.split('youtu.be/')[1];
                    return videoId ? (
                      <div key={idx} className="w-[320px] shrink-0 snap-center rounded-[2rem] overflow-hidden bg-slate-900 aspect-video relative group shadow-lg">
                        <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Video thumbnail" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <a href={link} target="_blank" rel="noreferrer" className="absolute inset-0 z-10"></a>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </section>
          )}

          {/* Location & Map (Cinematic Presentation) */}
          <section className="relative pl-0 md:pl-16">
            <div className="hidden md:block absolute left-0 top-2 w-[1px] h-full bg-slate-200"></div>
            <h2 className="text-3xl font-black text-[#0A1128] mb-8">Practice Location</h2>
            
            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                
                {/* Text Details */}
                <div className="p-8 md:p-12 lg:w-1/2 flex flex-col justify-center">
                  <h3 className="font-black text-[#0A1128] text-2xl mb-4">{profile.clinicName || profile.name}</h3>
                  <p className="text-slate-500 font-serif text-lg leading-relaxed mb-8">{profile.address || profile.clinic?.address || "Address not provided"}</p>
                  
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => setShowPhone(!showPhone)}
                      className="w-full bg-[#0A1128] text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-3"
                    >
                      <Phone className="w-5 h-5" />
                      {showPhone ? (profile.phone || profile.clinic?.phone || "Not available") : "Reveal Private Number"}
                    </button>
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(profile.address || profile.clinic?.address || profile.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-slate-50 text-slate-800 border border-slate-200 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-colors flex items-center justify-center gap-3"
                    >
                      <Navigation className="w-5 h-5" />
                      Get Directions
                    </a>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-5 h-5 text-slate-400" />
                      <h4 className="font-black text-[#0A1128] uppercase tracking-widest text-xs">Operating Hours</h4>
                    </div>
                    <p className="text-slate-600 font-serif italic text-lg">{profile.timings || profile.clinic?.timings || "Mon - Sat: 10:00 AM - 08:00 PM"}</p>
                  </div>
                </div>

                {/* Live Google Map */}
                <div className="lg:w-1/2 min-h-[300px] lg:min-h-full relative bg-slate-100">
                  <iframe 
                    src={profile.clinic?.mapUrl || `https://maps.google.com/maps?q=${encodeURIComponent(profile.address || profile.name || 'Odisha')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="absolute inset-0 w-full h-full border-0 filter grayscale contrast-125 hover:grayscale-0 hover:contrast-100 transition-all duration-1000"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Floating Glassmorphic VIP Pill */}
      <div className="fixed bottom-[100px] md:bottom-10 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-40 pointer-events-none">
        <div className="bg-white/70 backdrop-blur-3xl border border-white/60 p-2 md:p-3 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] rounded-full pointer-events-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block pl-6">
            <p className="font-black text-slate-900 text-base">{profile.name}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Priority Access</p>
          </div>
          <div className="flex-1 sm:flex-none">
            {verified ? (
              <button className="w-full sm:w-auto bg-[#0A1128] hover:bg-slate-800 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3">
                <HeartPulse className="w-5 h-5" />
                Book VIP Consult
              </button>
            ) : (
              <button 
                onClick={() => setShowPhone(true)}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-900 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-3"
              >
                <Phone className="w-5 h-5" />
                Contact Directly
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </div>
  );
}
