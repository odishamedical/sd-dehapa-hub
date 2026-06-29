"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Award, MapPin, Phone, Star, CheckCircle2, Shield, 
  Stethoscope, Clock, FileText, Activity, 
  HeartPulse, Navigation, GraduationCap, Globe, Fingerprint 
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

  // Dynamic Trust Bar Metrics
  const renderTrustBar = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
        {/* Dynamic Metric 1: Experience / Beds */}
        {isDoctor && (
          <div className="bg-teal-50/50 rounded-2xl p-4 flex items-center gap-3 border border-teal-100">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{profile.experience || '10+ Years'}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Experience</p>
            </div>
          </div>
        )}
        {(isHospital || isLab) && (
          <div className="bg-blue-50/50 rounded-2xl p-4 flex items-center gap-3 border border-blue-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{profile.totalBeds || '24/7'}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">{isHospital ? 'Total Beds' : 'Service'}</p>
            </div>
          </div>
        )}

        {/* Dynamic Metric 2: Ratings */}
        <div className="bg-amber-50/50 rounded-2xl p-4 flex items-center gap-3 border border-amber-100">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{profile.rating || '4.8'} ({profile.reviews || '120'})</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Patient Rating</p>
          </div>
        </div>

        {/* Dynamic Metric 3: Qualification / Specialty */}
        <div className="bg-purple-50/50 rounded-2xl p-4 flex items-center gap-3 border border-purple-100">
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 line-clamp-1">{profile.qualification || profile.category || 'Specialist'}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{isDoctor ? 'Education' : 'Category'}</p>
          </div>
        </div>

        {/* Verification Status */}
        <div className={`rounded-2xl p-4 flex items-center gap-3 border ${verified ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${verified ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-sm font-bold ${verified ? 'text-emerald-700' : 'text-slate-600'}`}>
              {verified ? 'Verified Profile' : 'Basic Listing'}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Dehapa Trust</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-[160px]">
      {/* Header Area */}
      <div className="bg-slate-50 border-b border-slate-200 sticky top-0 z-40">
        <CategoryNav />
        <div className="px-4 py-3 max-w-5xl mx-auto">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: type.charAt(0).toUpperCase() + type.slice(1) + "s", href: `/${type}s` },
            { name: profile.name }
          ]} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Profile Header Block */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative shrink-0">
            <img 
              src={profile.image || profile.avatar || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80"} 
              alt={profile.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover shadow-lg border border-slate-100"
            />
            {verified && (
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-md border-2 border-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="flex-1 w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {profile.name}
            </h1>
            <p className="text-lg text-teal-600 font-medium mt-1">
              {profile.subtitle || profile.category || profile.specialty || "Healthcare Provider"}
            </p>
            <div className="flex items-center gap-2 mt-3 text-slate-500">
              <MapPin className="w-4 h-4 shrink-0" />
              <p className="text-sm line-clamp-1">
                {profile.address || profile.clinic?.address || "Location unavailable"}
              </p>
            </div>
          </div>
        </div>

        {/* The Trust Bar (No Tabs) */}
        {renderTrustBar()}

        {/* Claim Profile Banner (Dual Listing Logic) */}
        {!verified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-amber-900">Are you {profile.name}?</h4>
              <p className="text-sm text-amber-700 mt-1">Claim this profile to verify your details, manage appointments, and unlock the digital Rx Pad.</p>
            </div>
            <Link href={`/claim-profile?id=${profile.id}`} className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm">
              Claim Profile
            </Link>
          </div>
        )}

        {/* Vertical Flow: About Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-500" />
            About & Expertise
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
            <p>{profile.about || profile.bio || `Detailed information about ${profile.name} is currently being updated. They specialize in providing top-tier healthcare services.`}</p>
          </div>
        </div>

        {/* Vertical Flow: Education (Conditionally Rendered) */}
        {profile.education && profile.education.length > 0 && profile.education[0].degree && profile.education[0].degree !== "Not available (Not verified)" && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-teal-500" />
              Education & Qualifications
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="space-y-4">
                {profile.education.map((edu: any, index: number) => (
                  <div key={index} className={`pb-4 ${index !== profile.education.length - 1 ? 'border-b border-slate-200' : ''}`}>
                    <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                    <p className="text-slate-600 text-sm mt-1">{edu.institution || edu.college || 'Institution not specified'}</p>
                    {edu.year && <p className="text-slate-400 text-xs mt-1">{edu.year}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vertical Flow: Languages (Conditionally Rendered) */}
        {profile.languages && profile.languages.length > 0 && profile.languages[0] !== "Not available (Not verified)" && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-500" />
              Languages Spoken
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((lang: string, index: number) => (
                <span key={index} className="bg-teal-50 text-teal-700 border border-teal-100 px-4 py-2 rounded-xl text-sm font-bold">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Vertical Flow: Registration (Conditionally Rendered) */}
        {profile.registrationNumber && profile.registrationNumber !== "Not available (Not verified)" && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-teal-500" />
              Medical Registration
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
               <Shield className="w-6 h-6 text-emerald-500" />
               <div>
                 <p className="font-bold text-slate-900">{profile.registrationNumber}</p>
                 <p className="text-xs text-slate-500 uppercase tracking-widest">Verified Registration</p>
               </div>
            </div>
          </div>
        )}


        {/* Vertical Flow: Location & Contact */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-teal-500" />
            Location & Contact
          </h2>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-2">{profile.clinicName || profile.name}</h3>
            <p className="text-slate-600 mb-6">{profile.address || profile.clinic?.address || "Address not provided"}</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowPhone(!showPhone)}
                className="flex-1 bg-white border border-slate-200 hover:border-teal-300 text-slate-700 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Phone className="w-5 h-5 text-teal-600" />
                {showPhone ? (profile.phone || profile.clinic?.phone || "Not available") : "Show Phone Number"}
              </button>
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(profile.address || profile.clinic?.address || profile.name)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <MapPin className="w-5 h-5" />
                Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Vertical Flow: Timings */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-500" />
            Timings
          </h2>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <p className="text-slate-700 font-medium">{profile.timings || profile.clinic?.timings || "Mon - Sat: 10:00 AM - 08:00 PM"}</p>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Booking Bar */}
      <div className="fixed bottom-[80px] md:bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="font-bold text-slate-900">{profile.name}</p>
            <p className="text-xs text-teal-600 font-medium">{profile.subtitle || profile.category}</p>
          </div>
          <div className="flex-1 flex gap-3">
            {verified ? (
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-bold text-sm md:text-base tracking-wider transition-colors shadow-md flex items-center justify-center gap-2">
                <HeartPulse className="w-5 h-5" />
                Book Consult
              </button>
            ) : (
              <button 
                onClick={() => setShowPhone(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold text-sm md:text-base tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call Clinic Directly
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
