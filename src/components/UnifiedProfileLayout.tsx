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
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-[120px] selection:bg-teal-500/30">
      
      {/* Light Glassmorphic Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <CategoryNav />
        <div className="px-4 py-3 max-w-5xl mx-auto border-t border-slate-100">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: type.charAt(0).toUpperCase() + type.slice(1) + "s", href: `/${type}s` },
            { name: profile.name }
          ]} />
        </div>
      </div>

      {/* Hero Banner Section (Premium Light Theme) */}
      <div className="relative w-full overflow-hidden bg-white border-b border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0f766e 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 z-0 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 pt-12 pb-10 relative z-20">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            
            {/* Premium Avatar Frame */}
            <div className="relative shrink-0 group">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-200 to-emerald-200 rounded-[2.5rem] rotate-3 opacity-50 group-hover:rotate-6 transition-transform duration-500 blur-sm"></div>
              <img 
                src={profile.image || profile.avatar || "https://ui-avatars.com/api/?name=Doc&background=0f766e&color=fff&size=200"} 
                alt={profile.name}
                className="relative w-40 h-40 md:w-48 md:h-48 rounded-[2rem] object-cover shadow-[0_10px_40px_rgb(0,0,0,0.1)] border-4 border-white bg-white"
              />
              {verified && (
                <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full p-2.5 shadow-[0_8px_20px_rgba(245,158,11,0.3)] border-4 border-white flex items-center gap-1.5 z-10">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest pr-1">Verified</span>
                </div>
              )}
            </div>

            {/* Title & Core Details */}
            <div className="flex-1 w-full text-center md:text-left mt-2">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                {profile.name}
              </h1>
              <p className="text-lg md:text-xl text-teal-600 font-bold mt-2 font-serif">
                {profile.subtitle || profile.category || profile.specialty || "Healthcare Specialist"}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-5">
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <p className="text-sm text-slate-700 font-medium line-clamp-1 max-w-[250px]">
                    {profile.city || profile.address?.split(',')[0] || "Location unavailable"}
                  </p>
                </div>
                {profile.fee && profile.fee !== "Contact Clinic" && (
                  <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100 shadow-sm">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <p className="text-sm text-emerald-700 font-bold">Consultation: ₹{profile.fee}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Premium Trust Bar (Light Glassmorphic Jewel Design) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {isDoctor && (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <p className="text-lg font-bold text-slate-900">{profile.experience || '10+ Years'}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-bold">Experience</p>
              </div>
            )}
            {(isHospital || isLab) && (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <p className="text-lg font-bold text-slate-900">{profile.totalBeds || '24/7'}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-bold">{isHospital ? 'Total Beds' : 'Service'}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <p className="text-lg font-bold text-slate-900">{profile.rating || '4.8'} <span className="text-sm text-slate-500 font-normal">({profile.reviews || '120'})</span></p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-bold">Patient Rating</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900 line-clamp-1">{profile.qualification || profile.category || 'Specialist'}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-bold">{isDoctor ? 'Education' : 'Category'}</p>
            </div>

            {profile.registrationNumber && profile.registrationNumber !== "Not available (Not verified)" ? (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-900 line-clamp-1">{profile.registrationNumber}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-bold">Reg. Number</p>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center opacity-70">
                <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">Basic Listing</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-bold">Trust Level</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Claim Profile Banner */}
        {!verified && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 md:p-8 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <h4 className="font-bold text-amber-900 text-xl">Are you {profile.name}?</h4>
              <p className="text-sm text-amber-800/80 mt-2 max-w-lg">Claim this profile to verify your details, add clinic photos, manage patient appointments, and unlock the digital Rx Pad.</p>
            </div>
            <Link href={`/claim-profile?id=${profile.id}`} className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_8px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.35)] hover:-translate-y-0.5">
              Claim Profile
            </Link>
          </div>
        )}

        {/* Detailed Sections Container */}
        <div className="space-y-8">
          
          {/* About Section */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 border-l-4 border-teal-500 pl-3">
              About & Expertise
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
              <p>{profile.about || profile.bio || `Detailed information about ${profile.name} is currently being updated. They specialize in providing top-tier healthcare services.`}</p>
            </div>
          </div>

          {/* Specialties (Tags) */}
          {hasValidData(profile.specialties) && (
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 border-l-4 border-purple-500 pl-3">
                Core Specializations
              </h2>
              <div className="flex flex-wrap gap-3">
                {profile.specialties.map((spec: string, index: number) => (
                  <span key={index} className="bg-purple-50 text-purple-700 border border-purple-100 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education & Qualifications */}
          {hasValidData(profile.education) && (
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 border-l-4 border-indigo-500 pl-3">
                Education & Qualifications
              </h2>
              <div className="space-y-6">
                {profile.education.map((edu: any, index: number) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="w-[3px] bg-slate-100 group-hover:bg-indigo-500 rounded-full transition-colors mt-2"></div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{edu.degree}</h3>
                      <p className="text-slate-500 mt-1 font-medium">{edu.institution || edu.college || 'Institution not specified'}</p>
                      {edu.year && <p className="text-indigo-600 text-sm mt-1 font-bold">{edu.year}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Experience */}
          {hasValidData(profile.experiences) && (
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 border-l-4 border-teal-500 pl-3">
                Professional Experience
              </h2>
              <div className="space-y-6">
                {profile.experiences.map((exp: any, index: number) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="w-[3px] bg-slate-100 group-hover:bg-teal-500 rounded-full transition-colors mt-2"></div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{exp.role || exp.title}</h3>
                      <p className="text-slate-500 mt-1 font-medium">{exp.hospital || exp.organization}</p>
                      <p className="text-teal-600 text-sm mt-1 font-bold">{exp.duration || exp.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards & Recognitions */}
          {hasValidData(profile.awards) && (
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 border-l-4 border-amber-400 pl-3">
                Awards & Recognitions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.awards.map((award: any, index: number) => (
                  <div key={index} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Medal className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-snug">{award.title || award.name}</p>
                      <p className="text-sm text-slate-500 mt-1 font-medium">{award.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {hasValidData(profile.languages) && (
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 border-l-4 border-emerald-500 pl-3">
                Languages Spoken
              </h2>
              <div className="flex flex-wrap gap-3">
                {profile.languages.map((lang: string, index: number) => (
                  <span key={index} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Image & Video Gallery */}
          {((profile.galleryImages && profile.galleryImages.length > 0) || (profile.rawImages && profile.rawImages.length > 0) || (profile.youtubeLinks && profile.youtubeLinks.length > 0)) && (
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 border-l-4 border-pink-500 pl-3">
                Gallery & Media
              </h2>
              
              {/* Videos */}
              {profile.youtubeLinks && profile.youtubeLinks.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Video className="w-4 h-4" /> Videos</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                    {profile.youtubeLinks.map((link: string, idx: number) => {
                      const videoId = link.split('v=')[1]?.split('&')[0] || link.split('youtu.be/')[1];
                      return videoId ? (
                        <div key={idx} className="w-[280px] shrink-0 snap-center rounded-2xl overflow-hidden border border-slate-200 aspect-video relative group shadow-sm hover:shadow-md transition-shadow">
                          <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} className="w-full h-full object-cover" alt="Video thumbnail" />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-all">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                              <Video className="w-5 h-5 text-red-600" />
                            </div>
                          </div>
                          <a href={link} target="_blank" rel="noreferrer" className="absolute inset-0 z-10"></a>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Images */}
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Clinic Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...(profile.galleryImages || []), ...(profile.rawImages || [])].slice(0, 6).map((img: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                    <img src={img} alt="Gallery" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location & Contact */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 border-l-4 border-blue-500 pl-3">
              Location & Contact
            </h2>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 text-xl mb-2">{profile.clinicName || profile.name}</h3>
              <p className="text-slate-600 font-medium mb-6">{profile.address || profile.clinic?.address || "Address not provided"}</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowPhone(!showPhone)}
                  className="flex-1 bg-white border border-slate-200 hover:border-teal-500 text-slate-700 hover:text-teal-600 px-4 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Phone className="w-5 h-5" />
                  {showPhone ? (profile.phone || profile.clinic?.phone || "Not available") : "Show Phone Number"}
                </button>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(profile.address || profile.clinic?.address || profile.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(15,23,42,0.2)]"
                >
                  <MapPin className="w-5 h-5" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* Timings */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 border-l-4 border-rose-500 pl-3">
              Timings
            </h2>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <p className="text-slate-700 font-bold text-lg">{profile.timings || profile.clinic?.timings || "Mon - Sat: 10:00 AM - 08:00 PM"}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Bottom Booking Bar (Light Mode Frosted Glass) */}
      <div className="fixed bottom-[80px] md:bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="font-black text-slate-900 text-lg">{profile.name}</p>
            <p className="text-xs text-teal-600 font-bold font-serif">{profile.subtitle || profile.category}</p>
          </div>
          <div className="flex-1 flex gap-3 justify-end max-w-sm ml-auto">
            {verified ? (
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-black text-sm md:text-base uppercase tracking-widest transition-all shadow-[0_8px_20px_rgba(13,148,136,0.3)] flex items-center justify-center gap-2 hover:-translate-y-0.5">
                <HeartPulse className="w-5 h-5" />
                Book Consult
              </button>
            ) : (
              <button 
                onClick={() => setShowPhone(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white py-3.5 rounded-xl font-bold text-sm md:text-base uppercase tracking-wider transition-all shadow-[0_8px_20px_rgba(15,23,42,0.2)] flex items-center justify-center gap-2 hover:-translate-y-0.5"
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
