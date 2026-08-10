"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Award, MapPin, Phone, Star, Shield, 
  Stethoscope, Clock, Activity, HeartPulse, 
  Navigation, GraduationCap, Briefcase, Video, Building2, Truck, Droplets, Pill
} from 'lucide-react';

interface V2UnifiedProfileProps {
  profile: any;
  type: 'doctor' | 'hospital' | 'lab' | 'pharmacy' | 'ambulance';
}

export default function V2UnifiedProfileLayout({ profile, type }: V2UnifiedProfileProps) {
  const verified = profile.verified || profile.isPremium;
  const isDoctor = type === 'doctor';
  const isHospital = type === 'hospital';
  const isLab = type === 'lab';
  const isPharmacy = type === 'pharmacy';
  const isAmbulance = type === 'ambulance';

  const [showPhone, setShowPhone] = useState(false);

  // Parse images
  const allImgs = [...(profile.rawImages || []), ...(profile.galleryImages || [])];
  
  const getMetrics = () => {
    switch(type) {
      case 'doctor':
        return [
          { label: 'Years Experience', value: profile.experience?.replace(/\D/g,'') || '10', icon: <Briefcase className="w-5 h-5 text-blue-400" /> },
          { label: 'Patient Rating', value: profile.rating || '4.8', icon: <Star className="w-5 h-5 text-amber-400" /> },
          { label: 'Primary Credential', value: profile.qualification || profile.education?.[0]?.degree || 'Specialist', icon: <GraduationCap className="w-5 h-5 text-emerald-400" /> },
          { label: 'Medical Council Reg.', value: profile.registrationNumber || 'Verified', icon: <Shield className="w-5 h-5 text-indigo-400" /> }
        ];
      case 'hospital':
        return [
          { label: 'Total Beds', value: profile.totalBeds?.replace(/\D/g,'') || '100', icon: <Building2 className="w-5 h-5 text-blue-400" /> },
          { label: 'ICU Capacity', value: profile.icuCapacity?.replace(/\D/g,'') || '20', icon: <Activity className="w-5 h-5 text-rose-400" /> },
          { label: 'Facility Type', value: profile.facilityType || 'Hospital', icon: <HeartPulse className="w-5 h-5 text-emerald-400" /> },
          { label: 'Emergency Services', value: profile.emergencyServices || '24/7 Available', icon: <Clock className="w-5 h-5 text-amber-400" /> }
        ];
      case 'lab':
        return [
          { label: 'Lab Identity', value: profile.labType || 'Diagnostics', icon: <Droplets className="w-5 h-5 text-cyan-400" /> },
          { label: 'Home Collection', value: profile.homeCollection ? 'Available' : 'No', icon: <Truck className="w-5 h-5 text-indigo-400" /> },
          { label: 'Timings', value: profile.timings || 'Mon-Sat', icon: <Clock className="w-5 h-5 text-amber-400" /> },
          { label: 'Accreditations', value: profile.accreditations?.length ? profile.accreditations[0] : 'NABL/ISO', icon: <Award className="w-5 h-5 text-emerald-400" /> }
        ];
      case 'pharmacy':
        return [
          { label: 'Pharmacy Type', value: profile.pharmacyType || 'Retail', icon: <Pill className="w-5 h-5 text-blue-400" /> },
          { label: 'Availability', value: profile.is247 ? '24/7 Open' : 'Standard', icon: <Clock className="w-5 h-5 text-amber-400" /> },
          { label: 'Delivery', value: profile.doorDelivery ? 'Yes' : 'Pickup Only', icon: <Truck className="w-5 h-5 text-emerald-400" /> },
          { label: 'Registered', value: profile.pharmacistRegNo ? 'Verified' : 'Yes', icon: <Shield className="w-5 h-5 text-indigo-400" /> }
        ];
      case 'ambulance':
        return [
          { label: 'Life Support', value: profile.lifeSupportLevel || 'BLS', icon: <HeartPulse className="w-5 h-5 text-rose-400" /> },
          { label: 'Fleet Size', value: profile.fleetSize || '5', icon: <Truck className="w-5 h-5 text-blue-400" /> },
          { label: 'Coverage Radius', value: profile.coverageRadius || '50km', icon: <Navigation className="w-5 h-5 text-emerald-400" /> },
          { label: 'Base Location', value: profile.baseLocation || 'Odisha', icon: <MapPin className="w-5 h-5 text-amber-400" /> }
        ];
      default:
        return [];
    }
  };

  const metrics = getMetrics();

  return (
    <div className="w-full min-h-screen bg-[#060B14] text-white relative font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* V2 Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent"></div>
         <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]"></div>
         <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-slate-400 uppercase mb-8">
          <Link href="/v2" className="hover:text-cyan-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/v2/${type}s`} className="hover:text-cyan-400 transition-colors">{type}s</Link>
          <span>/</span>
          <span className="text-slate-100">{profile.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* HERO CARD & 5-IMAGE BENTO */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
               {/* Decorative Gradient */}
               <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>

               <div className="flex flex-col sm:flex-row gap-8 items-start relative z-10 mb-8">
                 {/* Portrait */}
                 <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-2xl overflow-hidden shadow-xl border-4 border-white/20 bg-white/10 relative">
                   <Image 
                     src={profile.image || profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "User")}&background=0ea5e9&color=fff&size=800`}
                     alt={profile.name}
                     fill
                     className="object-cover"
                   />
                 </div>
                 
                 {/* Titles */}
                 <div className="flex-1 flex flex-col justify-center">
                   <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2">
                     {profile.name}
                   </h1>
                   <div className="text-slate-300 text-lg font-medium mb-4">
                     {profile.subtitle || profile.category || "Verified Provider"}
                   </div>
                   
                   <div className="flex items-center gap-4 flex-wrap">
                     <div className="flex items-center bg-black/30 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                       <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-2" />
                       <span className="text-sm font-bold">{profile.rating || '4.8'}</span>
                       <span className="text-slate-400 text-xs ml-1">({profile.reviews || '120'} reviews)</span>
                     </div>
                     {verified && (
                       <div className="flex items-center bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-400/30">
                         <Shield className="w-3 h-3 mr-1" /> VERIFIED
                       </div>
                     )}
                   </div>
                 </div>
               </div>

               {/* 5-Image Glassmorphism Bento Gallery */}
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl overflow-hidden border border-white/10 shadow-inner w-full relative z-10">
                 {Array.from({ length: 5 }).map((_, i) => {
                   const img = allImgs[i] || `https://placehold.co/600x400/0f172a/334155.png?text=Photo+${i+1}`;
                   return (
                     <div key={i} className={`relative bg-slate-900 overflow-hidden group/img ${i === 0 ? 'col-span-2 row-span-2 aspect-square sm:aspect-video' : 'col-span-1 row-span-1 aspect-square'}`}>
                       <Image 
                         src={img} 
                         fill 
                         className="object-cover opacity-80 group-hover/img:opacity-100 group-hover/img:scale-110 transition-all duration-700" 
                         alt="Gallery Image" 
                       />
                     </div>
                   );
                 })}
               </div>
            </div>

            {/* DYNAMIC TRUST BAR (Metrics Engine) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
              {metrics.map((metric, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center justify-center shadow-lg hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 border border-white/5">
                    {metric.icon}
                  </div>
                  <p className="text-lg font-black text-white line-clamp-1">{metric.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{metric.label}</p>
                </div>
              ))}
            </div>

            {/* ABOUT SECTION */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <h2 className="text-2xl font-black text-white mb-6">About</h2>
              <p className="text-slate-300 leading-relaxed">
                {profile.about || profile.description || `Comprehensive details about ${profile.name} are currently being updated. Recognized for providing top-tier services and commitment to excellence in the healthcare ecosystem.`}
              </p>
            </div>

          </div>

          {/* Right Column (Sidebar Actions) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            
            {/* Map & Contact Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative">
              <div className="w-full h-40 bg-slate-800 rounded-2xl mb-6 overflow-hidden relative">
                 {/* Fake Map */}
                 <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800&h=400" fill className="object-cover opacity-60 mix-blend-luminosity" alt="Map" />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                     <MapPin className="w-6 h-6 text-white" />
                   </div>
                 </div>
              </div>

              <h3 className="font-black text-xl text-white mb-2">{profile.clinicName || profile.name}</h3>
              <p className="text-slate-400 text-sm mb-6 flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                <span>{profile.address || profile.clinic?.address || `${profile.baseLocation || 'Odisha, India'}`}</span>
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowPhone(!showPhone)}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {showPhone ? (profile.phone || "+91 9876543210") : "Show Phone Number"}
                </button>
                <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 shadow-2xl">
               <h3 className="font-black text-white text-lg mb-4">Connect</h3>
               <button className="w-full bg-white text-slate-900 font-black py-3.5 rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-1 mb-3">
                 Send Inquiry
               </button>
               {isDoctor && (
                 <button className="w-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30 font-bold py-3.5 rounded-xl transition-all">
                   Book Appointment
                 </button>
               )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
