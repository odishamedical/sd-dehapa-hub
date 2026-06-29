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
import Breadcrumb from '@/components/Breadcrumb';

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

  // Helper to check if array has real data
  const hasValidData = (arr: any[]) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return false;
    if (typeof arr[0] === 'string' && arr[0].includes('Not available')) return false;
    if (typeof arr[0] === 'object' && Object.values(arr[0]).some(v => typeof v === 'string' && v.includes('Not available'))) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#050B14] font-sans pb-[120px] selection:bg-cyan-500/30">
      
      {/* Premium Glassmorphic Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/60 sticky top-0 z-40">
        <CategoryNav />
        <div className="px-4 py-3 max-w-5xl mx-auto border-t border-slate-800/40">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: type.charAt(0).toUpperCase() + type.slice(1) + "s", href: `/${type}s` },
            { name: profile.name }
          ]} />
        </div>
      </div>

      {/* Hero Banner Section (Premium Dark Theme) */}
      <div className="relative w-full overflow-hidden">
        {/* Background Gradients & Patterns */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1426]/90 to-[#050B14] z-10"></div>
        <img 
          src={profile.banner || profile.facadeImage || "https://images.unsplash.com/photo-1551076805-e18690c5e53b?auto=format&fit=crop&w=1200&q=80"} 
          alt="Banner" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20"
        />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 pt-12 pb-8 relative z-20">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            
            {/* Premium Avatar Frame */}
            <div className="relative shrink-0 group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-[2.5rem] rotate-3 opacity-70 group-hover:rotate-6 transition-transform duration-500 blur-sm"></div>
              <img 
                src={profile.image || profile.avatar || "https://ui-avatars.com/api/?name=Doc&background=0f766e&color=fff&size=200"} 
                alt={profile.name}
                className="relative w-40 h-40 md:w-48 md:h-48 rounded-[2rem] object-cover shadow-2xl border-4 border-slate-900"
              />
              {verified && (
                <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-full p-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] border-4 border-[#050B14] flex items-center gap-1 z-10">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest pr-1">Verified</span>
                </div>
              )}
            </div>

            {/* Title & Core Details */}
            <div className="flex-1 w-full text-center md:text-left mt-2">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                {profile.name}
              </h1>
              <p className="text-lg md:text-xl text-cyan-400 font-medium mt-2 font-serif italic">
                {profile.subtitle || profile.category || profile.specialty || "Healthcare Specialist"}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-300 font-medium line-clamp-1 max-w-[250px]">
                    {profile.city || profile.address?.split(',')[0] || "Location unavailable"}
                  </p>
                </div>
                {profile.fee && profile.fee !== "Contact Clinic" && (
                  <div className="flex items-center gap-2 bg-emerald-900/30 backdrop-blur-md px-4 py-2 rounded-xl border border-emerald-500/30">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <p className="text-sm text-emerald-300 font-bold">Consultation: ₹{profile.fee}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Premium Trust Bar (Glassmorphic) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {isDoctor && (
              <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 flex flex-col items-center justify-center text-center hover:bg-slate-800/60 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <p className="text-lg font-bold text-white">{profile.experience || '10+ Years'}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Experience</p>
              </div>
            )}
            {(isHospital || isLab) && (
              <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 flex flex-col items-center justify-center text-center hover:bg-slate-800/60 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <p className="text-lg font-bold text-white">{profile.totalBeds || '24/7'}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">{isHospital ? 'Total Beds' : 'Service'}</p>
              </div>
            )}

            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 flex flex-col items-center justify-center text-center hover:bg-slate-800/60 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <p className="text-lg font-bold text-white">{profile.rating || '4.8'} <span className="text-sm text-slate-400 font-normal">({profile.reviews || '120'})</span></p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Patient Rating</p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 flex flex-col items-center justify-center text-center hover:bg-slate-800/60 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white line-clamp-1">{profile.qualification || profile.category || 'Specialist'}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">{isDoctor ? 'Education' : 'Category'}</p>
            </div>

            {profile.registrationNumber && profile.registrationNumber !== "Not available (Not verified)" ? (
              <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 flex flex-col items-center justify-center text-center hover:bg-slate-800/60 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white line-clamp-1">{profile.registrationNumber}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Reg. Number</p>
              </div>
            ) : (
              <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 flex flex-col items-center justify-center text-center hover:bg-slate-800/60 transition-colors group opacity-50">
                <div className="w-12 h-12 rounded-full bg-slate-500/10 text-slate-400 flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white">Basic Listing</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Trust Level</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Claim Profile Banner */}
        {!verified && (
          <div className="bg-gradient-to-r from-amber-900/40 to-amber-800/40 border border-amber-500/30 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg backdrop-blur-sm">
            <div>
              <h4 className="font-bold text-amber-400 text-lg">Are you {profile.name}?</h4>
              <p className="text-sm text-amber-200/70 mt-1">Claim this profile to verify your details, add photos, manage appointments, and unlock the digital Rx Pad.</p>
            </div>
            <Link href={`/claim-profile?id=${profile.id}`} className="shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-900 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]">
              Claim Profile
            </Link>
          </div>
        )}

        {/* Detailed Sections Container */}
        <div className="space-y-8">
          
          {/* About Section */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center"><FileText className="w-4 h-4 text-cyan-400" /></div>
              About & Expertise
            </h2>
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed font-light">
              <p>{profile.about || profile.bio || `Detailed information about ${profile.name} is currently being updated. They specialize in providing top-tier healthcare services.`}</p>
            </div>
          </div>

          {/* Specialties (Tags) */}
          {hasValidData(profile.specialties) && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center"><Stethoscope className="w-4 h-4 text-purple-400" /></div>
                Core Specializations
              </h2>
              <div className="flex flex-wrap gap-3">
                {profile.specialties.map((spec: string, index: number) => (
                  <span key={index} className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-5 py-2.5 rounded-xl text-sm font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education & Qualifications */}
          {hasValidData(profile.education) && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-indigo-400" /></div>
                Education & Qualifications
              </h2>
              <div className="space-y-6">
                {profile.education.map((edu: any, index: number) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="w-[2px] bg-slate-800 group-hover:bg-indigo-500 transition-colors mt-2"></div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{edu.degree}</h3>
                      <p className="text-slate-400 mt-1 font-medium">{edu.institution || edu.college || 'Institution not specified'}</p>
                      {edu.year && <p className="text-indigo-400/80 text-sm mt-1 font-mono">{edu.year}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Experience */}
          {hasValidData(profile.experiences) && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center"><Briefcase className="w-4 h-4 text-teal-400" /></div>
                Professional Experience
              </h2>
              <div className="space-y-6">
                {profile.experiences.map((exp: any, index: number) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="w-[2px] bg-slate-800 group-hover:bg-teal-500 transition-colors mt-2"></div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{exp.role || exp.title}</h3>
                      <p className="text-slate-400 mt-1 font-medium">{exp.hospital || exp.organization}</p>
                      <p className="text-teal-400/80 text-sm mt-1 font-mono">{exp.duration || exp.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards & Recognitions */}
          {hasValidData(profile.awards) && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center"><Medal className="w-4 h-4 text-amber-400" /></div>
                Awards & Recognitions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.awards.map((award: any, index: number) => (
                  <div key={index} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-start gap-3">
                    <Medal className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-200">{award.title || award.name}</p>
                      <p className="text-sm text-slate-400 mt-1">{award.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {hasValidData(profile.languages) && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center"><Globe className="w-4 h-4 text-emerald-400" /></div>
                Languages Spoken
              </h2>
              <div className="flex flex-wrap gap-3">
                {profile.languages.map((lang: string, index: number) => (
                  <span key={index} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-5 py-2.5 rounded-xl text-sm font-medium">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Image & Video Gallery */}
          {((profile.galleryImages && profile.galleryImages.length > 0) || (profile.rawImages && profile.rawImages.length > 0) || (profile.youtubeLinks && profile.youtubeLinks.length > 0)) && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-pink-400" /></div>
                Gallery & Media
              </h2>
              
              {/* Videos */}
              {profile.youtubeLinks && profile.youtubeLinks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Video className="w-4 h-4" /> Videos</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                    {profile.youtubeLinks.map((link: string, idx: number) => {
                      const videoId = link.split('v=')[1]?.split('&')[0] || link.split('youtu.be/')[1];
                      return videoId ? (
                        <div key={idx} className="w-[280px] shrink-0 snap-center rounded-2xl overflow-hidden border border-slate-700 aspect-video relative group">
                          <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} className="w-full h-full object-cover" alt="Video thumbnail" />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-all">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg"><Video className="w-5 h-5 text-white" /></div>
                          </div>
                          <a href={link} target="_blank" rel="noreferrer" className="absolute inset-0 z-10"></a>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Images */}
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Clinic Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...(profile.galleryImages || []), ...(profile.rawImages || [])].slice(0, 6).map((img: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-700 bg-slate-800">
                    <img src={img} alt="Gallery" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location & Contact */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center"><Navigation className="w-4 h-4 text-blue-400" /></div>
              Location & Contact
            </h2>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="font-bold text-white text-xl mb-2">{profile.clinicName || profile.name}</h3>
              <p className="text-slate-400 mb-6">{profile.address || profile.clinic?.address || "Address not provided"}</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowPhone(!showPhone)}
                  className="flex-1 bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  {showPhone ? (profile.phone || profile.clinic?.phone || "Not available") : "Show Phone Number"}
                </button>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(profile.address || profile.clinic?.address || profile.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(8,145,178,0.3)]"
                >
                  <MapPin className="w-5 h-5" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* Timings */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center"><Clock className="w-4 h-4 text-rose-400" /></div>
              Timings
            </h2>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
              <p className="text-slate-300 font-medium text-lg">{profile.timings || profile.clinic?.timings || "Mon - Sat: 10:00 AM - 08:00 PM"}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Bottom Booking Bar */}
      <div className="fixed bottom-[80px] md:bottom-0 left-0 right-0 bg-[#0B1426]/95 backdrop-blur-xl border-t border-slate-800 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="font-bold text-white text-lg">{profile.name}</p>
            <p className="text-xs text-cyan-400 font-medium font-serif italic">{profile.subtitle || profile.category}</p>
          </div>
          <div className="flex-1 flex gap-3 justify-end max-w-sm ml-auto">
            {verified ? (
              <button className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white py-3.5 rounded-xl font-black text-sm md:text-base uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2">
                <HeartPulse className="w-5 h-5" />
                Book Consult
              </button>
            ) : (
              <button 
                onClick={() => setShowPhone(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white py-3.5 rounded-xl font-bold text-sm md:text-base uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call Clinic Directly
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
