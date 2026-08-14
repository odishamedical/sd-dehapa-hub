"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Award, MapPin, Phone, Star, Shield, 
  Clock, Activity, HeartPulse, 
  Navigation, GraduationCap, Briefcase, Building2, Truck, Droplets, Pill,
  Home, ChevronRight
} from 'lucide-react';
import V2SmartConnectModal from './V2SmartConnectModal';
import SquareTicket from './SquareTicket';
import WideTicket from './WideTicket';
import ClaimProfileModal from '@/components/ClaimProfileModal';
import SmartQRWidget from './SmartQRWidget';
import FollowConnectButton from './FollowConnectButton';
import ShareProfileButton from './ShareProfileButton';
import FollowerStatsWidget from './FollowerStatsWidget';

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
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Parse images
  const allImgs = [...(profile.rawImages || []), ...(profile.galleryImages || [])];
  
  // Ensure we have exactly 5 images for the bento grid with unique IDs
  const bentoImgs = Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    src: allImgs[i] || `https://placehold.co/600x400/e2e8f0/64748b.png?text=Photo+${i+1}`
  }));

  // Reorder so the selected mainImageIndex is first (span 2x2)
  const displayImgs = [
    bentoImgs[mainImageIndex],
    ...bentoImgs.filter((img) => img.id !== mainImageIndex)
  ];
  
  const getMetrics = () => {
    switch(type) {
      case 'doctor':
        return [
          { label: 'Experience', value: profile.experience?.replace(/\D/g,'') || '10', postfix: ' Yrs', icon: <Briefcase className="w-5 h-5 text-blue-600" /> },
          { label: 'Patient Rating', value: profile.rating || '4.8', postfix: '', icon: <Star className="w-5 h-5 text-amber-500" /> },
          { label: 'Credential', value: profile.qualification || profile.education?.[0]?.degree || 'MD', postfix: '', icon: <GraduationCap className="w-5 h-5 text-emerald-600" /> },
          { label: 'Reg. Verified', value: profile.registrationNumber || 'Yes', postfix: '', icon: <Shield className="w-5 h-5 text-indigo-600" /> }
        ];
      case 'hospital':
        return [
          { label: 'Total Beds', value: profile.totalBeds?.replace(/\D/g,'') || '100', postfix: '+', icon: <Building2 className="w-5 h-5 text-blue-600" /> },
          { label: 'ICU Capacity', value: profile.icuCapacity?.replace(/\D/g,'') || '20', postfix: '', icon: <Activity className="w-5 h-5 text-rose-500" /> },
          { label: 'Facility', value: profile.facilityType || 'Hospital', postfix: '', icon: <HeartPulse className="w-5 h-5 text-emerald-600" /> },
          { label: 'Emergency', value: profile.emergencyServices || '24/7', postfix: '', icon: <Clock className="w-5 h-5 text-amber-500" /> }
        ];
      case 'lab':
        return [
          { label: 'Lab Type', value: profile.labType || 'Diagnostics', postfix: '', icon: <Droplets className="w-5 h-5 text-cyan-600" /> },
          { label: 'Home Collect', value: profile.homeCollection ? 'Yes' : 'No', postfix: '', icon: <Truck className="w-5 h-5 text-indigo-600" /> },
          { label: 'Timings', value: profile.timings || 'Mon-Sat', postfix: '', icon: <Clock className="w-5 h-5 text-amber-500" /> },
          { label: 'Accredited', value: profile.accreditations?.length ? profile.accreditations[0] : 'NABL', postfix: '', icon: <Award className="w-5 h-5 text-emerald-600" /> }
        ];
      case 'pharmacy':
        return [
          { label: 'Type', value: profile.pharmacyType || 'Retail', postfix: '', icon: <Pill className="w-5 h-5 text-blue-600" /> },
          { label: '24/7 Open', value: profile.is247 ? 'Yes' : 'Standard', postfix: '', icon: <Clock className="w-5 h-5 text-amber-500" /> },
          { label: 'Delivery', value: profile.doorDelivery ? 'Yes' : 'Pickup', postfix: '', icon: <Truck className="w-5 h-5 text-emerald-600" /> },
          { label: 'Registered', value: profile.pharmacistRegNo ? 'Verified' : 'Yes', postfix: '', icon: <Shield className="w-5 h-5 text-indigo-600" /> }
        ];
      case 'ambulance':
        return [
          { label: 'Life Support', value: profile.lifeSupportLevel || 'BLS', postfix: '', icon: <HeartPulse className="w-5 h-5 text-rose-500" /> },
          { label: 'Fleet Size', value: profile.fleetSize || '5', postfix: ' Units', icon: <Truck className="w-5 h-5 text-blue-600" /> },
          { label: 'Radius', value: profile.coverageRadius || '50km', postfix: '', icon: <Navigation className="w-5 h-5 text-emerald-600" /> },
          { label: 'Location', value: profile.baseLocation || 'Odisha', postfix: '', icon: <MapPin className="w-5 h-5 text-amber-500" /> }
        ];
      default:
        return [];
    }
  };

  const metrics = getMetrics();

  return (
    <div className="w-full bg-transparent text-[#0a2540] relative font-sans selection:bg-cyan-500/30 overflow-hidden flex-1">
      
      {/* Custom Breadcrumb for Profiles (Replaces the Global one to inject the Name) */}
      <div className="w-full bg-[#0a2540] text-slate-300 border-b border-[#0a2540] px-4 md:px-8 py-2.5 flex items-center z-40 relative shadow-inner mt-20 md:mt-24">
        <nav className="max-w-7xl mx-auto w-full flex text-[13px] font-medium tracking-wide" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1 md:space-x-2">
            <li>
              <Link href="/" className="flex items-center hover:text-white transition-colors">
                <Home className="w-3.5 h-3.5 mr-1" />
                Home
              </Link>
            </li>
            <li><ChevronRight className="w-4 h-4 text-slate-500 mx-0.5" /></li>
            <li>
              <Link href={`/search/${type}s`} className="hover:text-white transition-colors capitalize">
                {type}s
              </Link>
            </li>
            <li><ChevronRight className="w-4 h-4 text-slate-500 mx-0.5" /></li>
            <li>
              <span className="text-white font-bold" aria-current="page">
                {profile.name}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      {/* V2 Background Elements (Light Mode) */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white/30 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* =========================================================================
              LEFT COLUMN: MAIN PROFILE DETAILS
              ========================================================================= */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* HERO CARD & 5-IMAGE BENTO */}
            <div className="bg-white/40 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/60 to-transparent pointer-events-none"></div>

               {!verified && (
                 <div className="mb-8 w-full bg-orange-50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm relative z-10">
                   <div className="flex items-start sm:items-center gap-3">
                     <div className="bg-orange-100 p-2 rounded-full shrink-0">
                       <Shield className="w-5 h-5 text-orange-500" />
                     </div>
                     <div>
                       <h4 className="text-orange-800 font-bold text-sm">Unverified Profile</h4>
                       <p className="text-orange-600/80 text-xs font-medium mt-0.5">This data was collected from reliable sources, but the profile has not been verified by the owner.</p>
                     </div>
                   </div>
                   <button 
                     onClick={() => setShowClaimModal(true)}
                     className="shrink-0 bg-white border border-orange-200 hover:border-orange-300 text-orange-600 font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all text-sm w-full sm:w-auto"
                   >
                     Claim this Listing
                   </button>
                 </div>
               )}

               <div className="flex flex-col sm:flex-row gap-8 items-start relative z-10 mb-8">
                 {/* Portrait */}
                 <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-3xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.1)] border-4 border-white bg-white relative group-hover:scale-[1.02] transition-transform duration-500">
                   <Image 
                     src={profile.image || profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "User")}&background=0ea5e9&color=fff&size=800`}
                     alt={profile.name}
                     fill
                     className="object-cover"
                   />
                 </div>
                 
                 {/* Text Info */}
                 <div className="flex-1">
                   <FollowerStatsWidget profileId={profile.id} />
                   <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0a2540] mb-2 sm:mb-4 tracking-tight leading-tight">
                     {profile.name}
                   </h1>
                   <div className="text-slate-600 text-lg font-bold mb-4 flex items-center gap-2">
                     <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                       {profile.subtitle || profile.category || "Verified Provider"}
                     </span>
                   </div>
                   
                   <div className="flex items-center gap-4 flex-wrap">
                     <div className="flex items-center bg-white/80 px-4 py-2 rounded-2xl border border-white shadow-[inset_1px_1px_2px_rgba(255,255,255,1),0_5px_10px_rgba(0,0,0,0.05)] backdrop-blur-md">
                       <Star className="w-5 h-5 text-amber-500 fill-amber-500 mr-2" />
                       <span className="text-base font-black text-[#0a2540]">{profile.rating || '4.8'}</span>
                       <span className="text-slate-500 text-xs font-bold ml-1">({profile.reviews || '120'} reviews)</span>
                     </div>
                     {verified && (
                       <div className="flex items-center bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-black border border-emerald-200/50 shadow-sm">
                         <Shield className="w-4 h-4 mr-1.5 text-emerald-500" /> VERIFIED
                       </div>
                     )}
                   </div>
                 </div>
               </div>

               {/* 5-Image Glassmorphism Bento Gallery (Interactive) */}
               <div className="grid grid-cols-4 grid-rows-2 gap-2 h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden border-4 border-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] w-full relative z-10 bg-white/50">
                 {displayImgs.map((imgObj, idx) => {
                   return (
                     <div 
                       key={imgObj.id} 
                       onClick={() => setMainImageIndex(imgObj.id)}
                       className={`relative bg-white/50 overflow-hidden group/img h-full w-full cursor-pointer ${idx === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}`}
                     >
                       <Image 
                         src={imgObj.src} 
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
                <div key={idx} className="bg-white/40 backdrop-blur-2xl border border-white/40 rounded-[2rem] p-5 flex flex-col items-center text-center justify-center shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] hover:-translate-y-1 transition-transform hover:shadow-[0_20px_50px_-10px_rgba(0,20,60,0.15)] hover:bg-white/60">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-3 shadow-[0_5px_15px_rgba(0,0,0,0.05)]">
                    {metric.icon}
                  </div>
                  <p className="text-xl font-black text-[#0a2540] line-clamp-1">{metric.value}<span className="text-sm font-bold text-slate-500">{metric.postfix}</span></p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{metric.label}</p>
                </div>
              ))}
            </div>

            {/* ABOUT SECTION */}
            <div className="bg-white/40 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-8 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] relative">
              <h2 className="text-2xl font-black text-[#0a2540] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><Award className="w-4 h-4 text-blue-600" /></span>
                About the Profile
              </h2>
              <p className="text-slate-600 font-medium leading-loose text-lg">
                {profile.about || profile.description || `Comprehensive details about ${profile.name} are currently being curated. Recognized for providing top-tier services, exceptional patient care, and a long-standing commitment to excellence in the healthcare ecosystem. Our mission is to ensure every patient receives world-class treatment in a comforting environment.`}
              </p>
            </div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: SIDEBAR ACTIONS & ADS
              ========================================================================= */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            
            {/* Map & Contact Card */}
            <div className="bg-white/40 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-6 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] overflow-hidden relative">
              {profile.mapUrl ? (
                <div className="w-full h-56 rounded-3xl mb-6 overflow-hidden relative border-4 border-white shadow-[0_10px_20px_rgba(0,0,0,0.1)] group">
                  <iframe 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(profile.address || profile.clinicName || profile.name || '')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                  <a href={profile.mapUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg transition-transform hover:scale-105">
                     Open in App
                  </a>
                </div>
              ) : (
                <div className="w-full h-56 rounded-3xl mb-6 overflow-hidden relative border-4 border-white shadow-[0_10px_20px_rgba(0,0,0,0.1)] group bg-slate-100 flex flex-col items-center justify-center">
                  <iframe 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(profile.address || profile.clinicName || profile.name || '')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full border-0 absolute inset-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              )}

              <h3 className="font-black text-xl text-[#0a2540] mb-2">{profile.clinicName || profile.name}</h3>
              <p className="text-slate-600 font-medium text-sm mb-6 flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                <span>{profile.address || profile.clinic?.address || `${profile.baseLocation || 'Odisha, India'}`}</span>
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowPhone(!showPhone)}
                  className="w-full bg-white/80 hover:bg-white border border-white text-[#0a2540] font-black py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5 text-blue-600" />
                  {showPhone ? (profile.phone || "+91 9876543210") : "Show Phone Number"}
                </button>
                {profile.mapUrl ? (
                  <a href={profile.mapUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black py-4 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Get Directions
                  </a>
                ) : (
                  <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black py-4 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Get Directions
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions (Connect) */}
            <div className="bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-2xl border-2 border-white rounded-[2.5rem] p-6 shadow-[0_20px_50px_-10px_rgba(0,100,200,0.15)]">
              
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Available for Connect</h3>
              </div>

              <div className="flex flex-col gap-3">
                 <FollowConnectButton profileId={profile.id} profileRole={type} profileName={profile.name} />
                 
                 <div className="flex gap-3 mt-2">
                   <button 
                     onClick={() => setIsConnectModalOpen(true)}
                     className="flex-1 bg-white hover:bg-slate-50 text-blue-600 font-bold px-4 py-3 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow transition-all text-sm flex items-center justify-center gap-2"
                   >
                     Book Appointment
                   </button>
                   <ShareProfileButton />
                 </div>
              </div>
            </div>

            {/* Smart QR Widget */}
            <SmartQRWidget profileUrl={typeof window !== 'undefined' ? window.location.href : `https://dehapa.com/profile/${type}/${profile.id}`} profileName={profile.name} role={type} />

            {/* AD ZONE 1: Sidebar Medium Rectangle (300x250) */}
            <div className="bg-white/40 backdrop-blur-2xl border border-white/40 rounded-3xl p-1 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] h-[280px] flex items-center justify-center overflow-hidden">
               <div className="w-[95%] h-[95%] border-2 border-dashed border-slate-400/30 rounded-2xl flex items-center justify-center bg-white/20 relative group">
                  <div className="absolute top-2 right-3 text-[10px] font-bold text-slate-400 uppercase">Ad</div>
                  <span className="text-slate-500 font-bold tracking-widest uppercase text-xs text-center leading-relaxed">
                     [ SIDEBAR AD ] <br/> 300 x 250
                  </span>
               </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            BOTTOM SECTION: RELATED LISTINGS & GLOBAL ADS
            ========================================================================= */}
        
        <div className="w-full border-t border-blue-900/10 pt-16 mb-16">
           <div className="flex justify-between items-end mb-10">
             <div>
               <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">Similar Providers</h2>
               <p className="text-slate-600 font-medium mt-2">Explore other highly rated {type}s near this location.</p>
             </div>
             <Link href={`/search/${type}s`} className="text-blue-600 font-bold hover:underline hidden sm:block">View All {type}s →</Link>
           </div>

           {/* Render Specific Tickets based on Type */}
           {type === 'hospital' ? (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WideTicket title="Caremax General" subtitle="Multi-Specialty Facility" rating="4.9" icon="🏥" href="/hospital/mock-1" actionText="View Services" stats="450 Beds • 24/7 ER" />
                <WideTicket title="City Hope Hospital" subtitle="Advanced Care Center" rating="4.8" icon="🏨" href="/hospital/mock-2" actionText="View Services" stats="200 Beds • Level 1 Trauma" />
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <SquareTicket title="Alternative Provider 1" subtitle="Top Rated" rating="4.9" icon="⭐" href={`/${type}/mock-1`} actionText="View Profile" />
                <SquareTicket title="Alternative Provider 2" subtitle="Highly Recommended" rating="4.8" icon="🌟" href={`/${type}/mock-2`} actionText="View Profile" />
                <SquareTicket title="Alternative Provider 3" subtitle="Verified" rating="4.7" icon="🛡️" href={`/${type}/mock-3`} actionText="View Profile" />
                <SquareTicket title="Alternative Provider 4" subtitle="Popular Choice" rating="5.0" icon="🔥" href={`/${type}/mock-4`} actionText="View Profile" />
             </div>
           )}
        </div>

        {/* AD ZONE 2: Global Leaderboard (728x90) */}
        <div className="bg-white/40 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-2 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] w-full h-[140px] flex items-center justify-center">
           <div className="w-[95%] h-[90%] border-2 border-dashed border-slate-400/30 rounded-[2rem] flex flex-col items-center justify-center bg-white/20 relative">
              <div className="absolute top-2 right-4 text-[10px] font-bold text-slate-400 uppercase">Sponsored</div>
              <span className="text-slate-500 font-bold tracking-widest uppercase text-sm">[ GLOBAL LEADERBOARD AD INJECTION ZONE ]</span>
              <span className="text-slate-400 text-xs mt-1">728 x 90</span>
           </div>
        </div>

      </div>

      <V2SmartConnectModal 
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        entityType={type}
        entityName={profile.name}
      />

      {showClaimModal && (
        <ClaimProfileModal 
          entityId={profile.id}
          entityName={profile.name}
          onClose={() => setShowClaimModal(false)}
        />
      )}
    </div>
  );
}
