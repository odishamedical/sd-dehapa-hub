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
          { label: 'Years Experience', value: profile.experience?.replace(/\D/g,'') || '10', icon: <Briefcase className="w-5 h-5 text-blue-600" /> },
          { label: 'Patient Rating', value: profile.rating || '4.8', icon: <Star className="w-5 h-5 text-amber-500" /> },
          { label: 'Primary Credential', value: profile.qualification || profile.education?.[0]?.degree || 'Specialist', icon: <GraduationCap className="w-5 h-5 text-emerald-600" /> },
          { label: 'Medical Council Reg.', value: profile.registrationNumber || 'Verified', icon: <Shield className="w-5 h-5 text-indigo-600" /> }
        ];
      case 'hospital':
        return [
          { label: 'Total Beds', value: profile.totalBeds?.replace(/\D/g,'') || '100', icon: <Building2 className="w-5 h-5 text-blue-600" /> },
          { label: 'ICU Capacity', value: profile.icuCapacity?.replace(/\D/g,'') || '20', icon: <Activity className="w-5 h-5 text-rose-500" /> },
          { label: 'Facility Type', value: profile.facilityType || 'Hospital', icon: <HeartPulse className="w-5 h-5 text-emerald-600" /> },
          { label: 'Emergency Services', value: profile.emergencyServices || '24/7 Available', icon: <Clock className="w-5 h-5 text-amber-500" /> }
        ];
      case 'lab':
        return [
          { label: 'Lab Identity', value: profile.labType || 'Diagnostics', icon: <Droplets className="w-5 h-5 text-cyan-600" /> },
          { label: 'Home Collection', value: profile.homeCollection ? 'Available' : 'No', icon: <Truck className="w-5 h-5 text-indigo-600" /> },
          { label: 'Timings', value: profile.timings || 'Mon-Sat', icon: <Clock className="w-5 h-5 text-amber-500" /> },
          { label: 'Accreditations', value: profile.accreditations?.length ? profile.accreditations[0] : 'NABL/ISO', icon: <Award className="w-5 h-5 text-emerald-600" /> }
        ];
      case 'pharmacy':
        return [
          { label: 'Pharmacy Type', value: profile.pharmacyType || 'Retail', icon: <Pill className="w-5 h-5 text-blue-600" /> },
          { label: 'Availability', value: profile.is247 ? '24/7 Open' : 'Standard', icon: <Clock className="w-5 h-5 text-amber-500" /> },
          { label: 'Delivery', value: profile.doorDelivery ? 'Yes' : 'Pickup Only', icon: <Truck className="w-5 h-5 text-emerald-600" /> },
          { label: 'Registered', value: profile.pharmacistRegNo ? 'Verified' : 'Yes', icon: <Shield className="w-5 h-5 text-indigo-600" /> }
        ];
      case 'ambulance':
        return [
          { label: 'Life Support', value: profile.lifeSupportLevel || 'BLS', icon: <HeartPulse className="w-5 h-5 text-rose-500" /> },
          { label: 'Fleet Size', value: profile.fleetSize || '5', icon: <Truck className="w-5 h-5 text-blue-600" /> },
          { label: 'Coverage Radius', value: profile.coverageRadius || '50km', icon: <Navigation className="w-5 h-5 text-emerald-600" /> },
          { label: 'Base Location', value: profile.baseLocation || 'Odisha', icon: <MapPin className="w-5 h-5 text-amber-500" /> }
        ];
      default:
        return [];
    }
  };

  const metrics = getMetrics();

  return (
    <div className="w-full bg-transparent text-[#0a2540] relative font-sans selection:bg-cyan-500/30 overflow-hidden flex-1">
      
      {/* V2 Background Elements (Light Mode) */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white/30 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase mb-8">
          <Link href="/v2" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/v2/${type}s`} className="hover:text-blue-600 transition-colors">{type}s</Link>
          <span>/</span>
          <span className="text-[#0a2540]">{profile.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* HERO CARD & 5-IMAGE BENTO */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
               {/* Decorative Gradient */}
               <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/60 to-transparent pointer-events-none"></div>

               <div className="flex flex-col sm:flex-row gap-8 items-start relative z-10 mb-8">
                 {/* Portrait */}
                 <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-white relative">
                   <Image 
                     src={profile.image || profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "User")}&background=0ea5e9&color=fff&size=800`}
                     alt={profile.name}
                     fill
                     className="object-cover"
                   />
                 </div>
                 
                 {/* Titles */}
                 <div className="flex-1 flex flex-col justify-center">
                   <h1 className="text-3xl sm:text-4xl font-black text-[#0a2540] tracking-tight leading-tight mb-2">
                     {profile.name}
                   </h1>
                   <div className="text-slate-600 text-lg font-medium mb-4">
                     {profile.subtitle || profile.category || "Verified Provider"}
                   </div>
                   
                   <div className="flex items-center gap-4 flex-wrap">
                     <div className="flex items-center bg-white/80 px-3 py-1.5 rounded-full border border-slate-200 backdrop-blur-md shadow-sm">
                       <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-2" />
                       <span className="text-sm font-black text-[#0a2540]">{profile.rating || '4.8'}</span>
                       <span className="text-slate-500 text-xs font-bold ml-1">({profile.reviews || '120'} reviews)</span>
                     </div>
                     {verified && (
                       <div className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-black border border-emerald-200 shadow-sm">
                         <Shield className="w-3 h-3 mr-1" /> VERIFIED
                       </div>
                     )}
                   </div>
                 </div>
               </div>

               {/* 5-Image Glassmorphism Bento Gallery */}
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl overflow-hidden border border-white/60 shadow-inner w-full relative z-10">
                 {Array.from({ length: 5 }).map((_, i) => {
                   const img = allImgs[i] || `https://placehold.co/600x400/e2e8f0/64748b.png?text=Photo+${i+1}`;
                   return (
                     <div key={i} className={`relative bg-slate-100 overflow-hidden group/img ${i === 0 ? 'col-span-2 row-span-2 aspect-square sm:aspect-video' : 'col-span-1 row-span-1 aspect-square'}`}>
                       <Image 
                         src={img} 
                         fill 
                         className="object-cover opacity-90 group-hover/img:opacity-100 group-hover/img:scale-105 transition-all duration-700" 
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
                <div key={idx} className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl p-4 flex flex-col items-center text-center justify-center shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:bg-white/80 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 border border-slate-100 shadow-sm">
                    {metric.icon}
                  </div>
                  <p className="text-lg font-black text-[#0a2540] line-clamp-1">{metric.value}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{metric.label}</p>
                </div>
              ))}
            </div>

            {/* ABOUT SECTION */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
              <h2 className="text-2xl font-black text-[#0a2540] mb-6">About</h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                {profile.about || profile.description || `Comprehensive details about ${profile.name} are currently being updated. Recognized for providing top-tier services and commitment to excellence in the healthcare ecosystem.`}
              </p>
            </div>

          </div>

          {/* Right Column (Sidebar Actions) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            
            {/* Map & Contact Card */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
              <div className="w-full h-40 bg-slate-200 rounded-2xl mb-6 overflow-hidden relative border border-slate-300">
                 {/* Fake Map */}
                 <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800&h=400" fill className="object-cover opacity-80" alt="Map" />
                 <div className="absolute inset-0 flex items-center justify-center bg-white/20">
                   <div className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
                     <MapPin className="w-6 h-6 text-blue-600" />
                   </div>
                 </div>
              </div>

              <h3 className="font-black text-xl text-[#0a2540] mb-2">{profile.clinicName || profile.name}</h3>
              <p className="text-slate-600 font-medium text-sm mb-6 flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                <span>{profile.address || profile.clinic?.address || `${profile.baseLocation || 'Odisha, India'}`}</span>
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowPhone(!showPhone)}
                  className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-black py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {showPhone ? (profile.phone || "+91 9876543210") : "Show Phone Number"}
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-xl border border-blue-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <h3 className="font-black text-[#0a2540] text-lg mb-4">Connect</h3>
               <button className="w-full bg-[#0a2540] text-white font-black py-3.5 rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-1 mb-3">
                 Send Inquiry
               </button>
               {isDoctor && (
                 <button className="w-full bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 font-black py-3.5 rounded-xl transition-all shadow-sm">
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
