"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ConnectionService, ConnectionStatus } from '@/services/connection.service';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Award, MapPin, Phone, Star, CheckCircle2, Shield, 
  Stethoscope, Clock, FileText, Activity, 
  HeartPulse, Navigation, GraduationCap, Globe, Fingerprint,
  Briefcase, Medal, Video, Image as ImageIcon, Banknote,
  Share2, QrCode, UserPlus, X, Facebook, MessageCircle, Settings
} from 'lucide-react';
import CategoryNav from '@/components/CategoryNav';
import InlineEditField from '@/components/InlineEditField';
import EmergencyIntakeModal from '@/components/EmergencyIntakeModal';
import ClaimProfileModal from '@/components/ClaimProfileModal';

interface UnifiedProfileProps {
  profile: any;
  type: 'doctor' | 'hospital' | 'lab' | 'pharmacy' | 'ambulance';
  canEdit?: boolean;
  onInlineSave?: (field: string, val: string) => void;
  platformAds?: any;
  similarEntities?: any[];
}

export default function UnifiedProfileLayout({ 
  profile, 
  type,
  canEdit = false,
  onInlineSave = () => {},
  platformAds = {},
  similarEntities = []
}: UnifiedProfileProps) {
  const verified = profile.verified || profile.isPremium;
  const isDoctor = type === 'doctor';
  const isHospital = type === 'hospital';
  const isLab = type === 'lab';
  const isPharmacy = type === 'pharmacy';
  const isAmbulance = type === 'ambulance';

  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'location', 'education', 'experience', 'media', 'reviews'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isEditMode, setIsEditMode] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isRequestingConnection, setIsRequestingConnection] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && profile.id) {
      ConnectionService.checkConnectionStatus(user.uid, profile.id).then(status => {
        setConnectionStatus(status);
      });
    }
  }, [user, profile.id]);

  useEffect(() => {
    if (searchParams?.get('action') === 'connect') {
      if (connectionStatus !== 'approved' && connectionStatus !== 'pending' && user?.uid !== profile.id) {
        setShowInviteModal(true);
      }
    }
  }, [searchParams, connectionStatus, user, profile.id]);

  useEffect(() => {
    const checkPendingConnection = async () => {
      const pendingAction = localStorage.getItem('pendingConnectAction');
      if (pendingAction === profile.id && user) {
        localStorage.removeItem('pendingConnectAction');
        if (connectionStatus !== 'approved' && connectionStatus !== 'pending' && user.uid !== profile.id) {
           await handleRequestConnection(true);
        }
      }
    };
    if (user && profile.id) {
      setTimeout(() => checkPendingConnection(), 1000);
    }
  }, [user, profile.id, connectionStatus]);

  const handleRequestConnection = async (isAutoRun = false) => {
    if (!user) {
      localStorage.setItem('pendingConnectAction', profile.id);
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setIsRequestingConnection(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let currentRole = 'patient';
      let currentName = user.displayName || 'Dehapa Patient';
      if (userDoc.exists()) {
        const userData = userDoc.data();
        currentRole = userData.role || 'patient';
        currentName = userData.fullName || userData.name || currentName;
      }
      await ConnectionService.requestConnection({
        initiatorId: user.uid,
        initiatorRole: currentRole,
        initiatorName: currentName,
        receiverId: profile.id,
        receiverRole: type,
        receiverName: profile.name,
      });
      setConnectionStatus('pending');
      if (isAutoRun) {
        alert("Connection request sent automatically!");
      } else {
        setShowInviteModal(false);
      }
    } catch (error) {
      console.error("Error requesting connection:", error);
      alert("Failed to send connection request.");
    } finally {
      setIsRequestingConnection(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href.split('?')[0]; // Clean URL
    if (navigator.share && window.innerWidth < 768) {
      try {
        await navigator.share({
          title: profile.name,
          text: `Check out ${profile.name}'s profile on Dehapa`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href.split('?')[0]);
    alert("Profile link copied to clipboard!");
    setShowShareModal(false);
  };

  const hasValidData = (arr: any[]) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return false;
    if (typeof arr[0] === 'string' && arr[0].includes('Not available')) return false;
    if (typeof arr[0] === 'object' && Object.values(arr[0]).some(v => typeof v === 'string' && v.includes('Not available'))) return false;
    return true;
  };

  const getAdSlot = (suffix: string) => {
    return platformAds[`ad_slot_${type}_${suffix}`] || platformAds[`ad_slot_global_${suffix}`];
  };

  const heroRightAd = getAdSlot('hero_right');

  return (
    <div className="min-h-screen bg-[#FAFAFC] font-sans pb-[160px] selection:bg-teal-900 selection:text-white">
      
      {/* Owner Edit Banner */}
      {canEdit && (
        <div className="bg-[#0A1128] text-white py-3 px-6 flex items-center justify-between z-[60] relative border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Settings className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-bold">You are editing your profile</p>
              <p className="text-xs text-slate-400">Click highlighted text to edit directly</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors border ${isEditMode ? 'bg-cyan-500 text-white border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-transparent text-slate-300 border-slate-600 hover:border-slate-400'}`}
          >
            {isEditMode ? 'Exit Edit Mode' : 'Enable Edit Mode'}
          </button>
        </div>
      )}

      {/* Editorial Navigation */}
      <div className="bg-white/90 backdrop-blur-2xl border-b border-slate-200/50 sticky top-0 z-50 transition-all shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-cyan-500" />
        <CategoryNav />
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center gap-2 text-xs font-semibold tracking-widest text-slate-500 uppercase">
          <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/${type}s`} className="hover:text-teal-600 transition-colors">{type}s</Link>
          <span>/</span>
          <span className="text-slate-900 truncate max-w-[200px]">{profile.name}</span>
        </div>
      </div>



      {/* Main Content Container - Fluid Grid */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-12 mb-20">
        
        {/* HERO CARD - FULL WIDTH (Mockup Style) */}
        <div id="overview" className="bg-gradient-to-r from-cyan-50/80 via-white to-teal-50/80 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden group border-t-[6px] border-t-[#D32F2F] rounded-t-3xl shadow-sm">
          
          {/* SVG Waves Background embedded inside the Hero Card */}
          <div className="absolute inset-0 pointer-events-none z-0">
           {/* Background Wave - Tall, Faint Cyan */}
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-[#80DEEA] fill-current opacity-10 translate-y-16">
             <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
           </svg>
           {/* Middle Wave - Sweeping Teal */}
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-[#4DB6AC] fill-current opacity-[0.15] translate-y-8">
             <path d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,149.3C672,117,768,75,864,80C960,85,1056,139,1152,160C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
           </svg>
           {/* Foreground Wave - Deep, Rich Teal Mix */}
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-[#009688] fill-current opacity-5">
             <path d="M0,192L48,192C96,192,192,192,288,208C384,224,480,256,576,245.3C672,235,768,181,864,170.7C960,160,1056,192,1152,192C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
           </svg>
           <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-emerald-50/40 to-transparent"></div>
           <div className="absolute bottom-0 left-0 w-96 h-32 bg-cyan-100/30 rounded-tr-full blur-3xl"></div>
          </div>
              
              {/* Left: The Prestige Portrait */}
              <div className="relative w-40 h-40 md:w-52 md:h-52 shrink-0 z-10">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm border-[5px] border-white bg-slate-100">
                  <img 
                    src={profile.image || profile.avatar || "https://ui-avatars.com/api/?name=Doc&background=0f766e&color=fff&size=800"} 
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Center: Details */}
              <div className="flex-1 text-center md:text-left z-10 w-full flex flex-col justify-center py-2 md:py-4">
                <h1 className="text-3xl md:text-4xl lg:text-[42px] font-black text-[#0A1128] tracking-tight leading-tight mb-1">
                  {profile.name}
                </h1>
                
                <div className="text-slate-600 text-lg md:text-xl font-medium mb-4">
                  {profile.specialties && profile.specialties.length > 0 ? (
                    <span>{profile.specialties.join(", ")}</span>
                  ) : profile.category ? (
                    <span>{profile.category}</span>
                  ) : null}
                  {profile.education && profile.education.length > 0 && (
                    <span>, {profile.education[0]?.degree || "MBBS, MD"}</span>
                  )}
                </div>

                {/* Simple Stars and Verified (Mockup Style) */}
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                    </div>
                    <span className="text-sm font-medium text-slate-600 ml-2">{profile.reviews || "4,325"} Reviews)</span>
                  </div>
                  
                  {verified && (
                    <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-100">
                      <Shield className="w-3 h-3 fill-emerald-600 text-white" /> Verified
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Action Stack (Mockup Style) */}
              <div className="flex flex-col gap-3 w-full lg:w-[280px] shrink-0 justify-center">
                <button 
                  onClick={() => {
                    if (!verified) {
                      setShowUnverifiedModal(true);
                    } else {
                      window.location.href = `tel:${profile.phone || '9999999999'}`;
                    }
                  }} 
                  className="bg-[#0F9D58] hover:bg-emerald-600 text-white w-full py-3 rounded-lg font-bold text-[15px] transition-all shadow-sm flex items-center justify-between px-5"
                >
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4"/> Book Appointment</span>
                  <span className="opacity-50 text-[10px]">▼</span>
                </button>
                
                <button 
                  onClick={() => {
                    if (verified) {
                      window.dispatchEvent(new CustomEvent('open-telemedicine-fab', { detail: { action: 'schedule', doctorId: profile.id, doctorName: profile.name } }));
                    } else {
                      setShowUnverifiedModal(true);
                    }
                  }}
                  className="bg-[#FF3B30] hover:bg-red-600 text-white w-full py-3 rounded-lg font-bold text-[15px] transition-all shadow-sm flex items-center justify-between px-5"
                >
                  <span className="flex items-center gap-2"><Video className="w-4 h-4"/> Urgent Video Call</span>
                  <span className="opacity-50 text-[10px]">▼</span>
                </button>
                
                <button 
                  onClick={() => {
                    if (!verified) {
                      setShowUnverifiedModal(true);
                    } else {
                      window.dispatchEvent(new CustomEvent('open-telemedicine-fab', { detail: { action: 'schedule', doctorId: profile.id, doctorName: profile.name } }));
                    }
                  }} 
                  className="bg-white border-[1.5px] border-slate-200 text-[#5856D6] hover:bg-slate-50 w-full py-3 rounded-lg font-bold text-[15px] transition-all shadow-sm flex items-center justify-between px-5"
                >
                  <span className="flex items-center gap-2"><Stethoscope className="w-4 h-4"/> Schedule Telemedicine</span>
                  <span className="opacity-50 text-[10px]">▼</span>
                </button>
              </div>
            </div>

            {/* Scroll-Spy Sticky Navigation (Mockup Folder Style) - Flush with Hero Banner */}
            <div className="sticky top-[73px] z-40 bg-white/95 backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.02)] border-b border-slate-200 px-4 rounded-b-3xl">
              <div className="flex overflow-x-auto hide-scrollbar gap-1 items-end pt-3 max-w-[1000px] mx-auto">
                {[
                  { id: 'overview', label: 'Profile' },
                  { id: 'education', label: 'Education' },
                  { id: 'experience', label: 'Experience' },
                  { id: 'media', label: 'Expertise' },
                  { id: 'location', label: 'Associations' },
                  { id: 'reviews', label: 'Reviews' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      const el = document.getElementById(tab.id);
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.scrollY - 140;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }}
                    className={`px-8 py-3 text-[14px] font-bold tracking-wide transition-all shrink-0 rounded-t-lg ${activeSection === tab.id ? 'bg-[#00897B] text-white' : 'bg-transparent text-[#2c3e50] hover:bg-slate-50'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 xl:gap-12 items-start">
          
          {/* Main Content (75%) */}
          <div className="lg:col-span-3 space-y-6 mt-6">

            {/* The Prestige Trust Bar (Data as Art) */}
            <div className="w-full relative z-30 group">
              <div className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-sm border border-slate-200 hover:border-teal-300/50 p-8 hover:shadow-[0_15px_40px_rgba(20,184,166,0.15)] transition-all duration-500">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-slate-100">
                  
                  {/* Metric 1 */}
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    {verified ? (
                      <p className="text-4xl font-black text-[#0A1128] tracking-tighter">
                        {isDoctor ? profile.experience?.replace(/\D/g,'') : profile.totalBeds?.replace(/\D/g,'')}
                        <span className="text-2xl text-teal-600 font-serif italic">+</span>
                      </p>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2 border border-slate-200">
                         <Lock className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
                      {isDoctor ? 'Years Experience' : (isHospital ? 'Total Beds' : 'Service')}
                    </p>
                  </div>

                  {/* Metric 2 */}
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    {verified ? (
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-4xl font-black text-[#0A1128] tracking-tighter">{profile.rating || '4.0'}</p>
                        <Star className="w-6 h-6 text-amber-400 fill-current -mt-3" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2 border border-slate-200">
                         <Lock className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
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


            <div className="space-y-24">
              
              {/* Location & Map (Horizontal Banner Mockup Style) */}
              <section id="location" className="relative w-full pt-2">
                {/* Wide Map Banner */}
                <div className="w-full h-48 md:h-64 rounded-3xl overflow-hidden shadow-sm border border-slate-200 relative mb-6">
                  <iframe 
                    src={profile.clinic?.mapUrl || `https://maps.google.com/maps?q=${encodeURIComponent(profile.address || profile.name || 'Odisha')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                
                {/* Clinic Cards */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-12">
                   <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-start gap-4 w-full">
                         <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                           <MapPin className="w-5 h-5 text-teal-600" />
                         </div>
                         <div>
                            <h3 className="font-black text-[#0A1128] text-xl mb-1">{profile.clinicName || profile.name}</h3>
                            <p className="text-slate-500 font-medium mb-3">{profile.address || profile.clinic?.address || "Address not provided"}</p>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                               <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {profile.timings || "Mon-Sat: 10AM-8PM"}</span>
                               <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {profile.phone || "+91 98765 *****"}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(profile.address || profile.clinic?.address || profile.name)}`} target="_blank" rel="noreferrer" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-sm text-center shadow-md transition-colors">
                           Get Directions
                        </a>
                        <button onClick={() => setShowPhone(!showPhone)} className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold text-sm text-center hover:bg-slate-50 hover:border-slate-300 transition-colors">
                           {showPhone ? (profile.phone || "Not available") : "Call Clinic"}
                        </button>
                      </div>
                   </div>
                </div>
              </section>

              {/* About / Bio Narrative */}
              <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8 mb-6">
                <h2 className="text-2xl font-black text-[#0A1128] mb-6">The Profile</h2>
                <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-loose font-serif">
                  {isEditMode ? (
                    <InlineEditField 
                      value={profile.about || profile.bio || ''} 
                      onSave={(val) => onInlineSave('about', val)}
                      isEditMode={true}
                      type="textarea"
                      placeholder="Enter your professional biography here..."
                      className="w-full bg-white border border-cyan-500/30 p-4 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <p>{profile.about || profile.bio || `Eminent detailed information about ${profile.name} is currently being curated. Recognized for their dedication to advancing healthcare and patient outcomes.`}</p>
                  )}
                </div>
              </section>

              {/* Specializations (Elegant Pills) */}
              {isDoctor && (!verified || hasValidData(profile.specialties)) && (
                <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8 mb-6">
                  <h2 className="text-2xl font-black text-[#0A1128] mb-6">Areas of Excellence</h2>
                  
                  {!hasValidData(profile.specialties) ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                       <Lock className="w-8 h-8 text-slate-300 mb-3" />
                       <h3 className="text-base font-bold text-slate-700 mb-1">Unverified Specialties</h3>
                       <p className="text-slate-500 text-xs max-w-sm mb-4">Areas of excellence are currently unavailable as this profile is unverified.</p>
                       <button onClick={() => setShowClaimModal(true)} className="bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-full text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">Verify to Unlock</button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      {profile.specialties.map((spec: string, index: number) => (
                        <Link 
                          key={index} 
                          href={`/doctors?specialty=${encodeURIComponent(spec)}`}
                          className="bg-slate-50 border border-slate-200 text-slate-700 px-6 py-3 rounded-full text-sm font-bold tracking-wide shadow-sm hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 hover:shadow-[0_10px_20px_rgba(20,184,166,0.15)] hover:-translate-y-0.5 transition-all group"
                        >
                          <span className="border-b border-transparent group-hover:border-teal-700 pb-0.5">{spec}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Education Timeline */}
              {isDoctor && (!verified || hasValidData(profile.education)) && (
                <section id="education" className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8 mb-6">
                  <h2 className="text-2xl font-black text-[#0A1128] mb-6">Academic Pedigree</h2>
                  
                  {!hasValidData(profile.education) ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                       <GraduationCap className="w-8 h-8 text-slate-300 mb-3" />
                       <h3 className="text-base font-bold text-slate-700 mb-1">Unverified Education</h3>
                       <p className="text-slate-500 text-xs max-w-sm mb-4">Educational history is currently unavailable as this profile is unverified.</p>
                       <button onClick={() => setShowClaimModal(true)} className="bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-full text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">Verify to Unlock</button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {profile.education.map((edu: any, index: number) => (
                        <div key={index} className="flex gap-6 group">
                          <div className="w-12 h-12 shrink-0 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div className="pt-2">
                            <h3 className="font-black text-[#0A1128] text-xl">{edu.degree}</h3>
                            <Link 
                              href={`/directory?query=${encodeURIComponent(edu.institution || edu.college || '')}`}
                              className="inline-block mt-2 hover:opacity-80 transition-opacity"
                            >
                              <p className="text-slate-500 text-lg font-serif italic border-b border-transparent hover:border-slate-400 pb-0.5">
                                {edu.institution || edu.college || 'Institution not specified'}
                              </p>
                            </Link>
                            {edu.year && <p className="text-slate-400 text-sm mt-1 font-bold tracking-widest">{edu.year}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Past Experience Timeline */}
              {isDoctor && (!verified || hasValidData(profile.experiences)) && (
                <section id="experience" className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8 mb-6">
                  <h2 className="text-2xl font-black text-[#0A1128] mb-6">Professional Trajectory</h2>
                  
                  {!hasValidData(profile.experiences) ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                       <Briefcase className="w-8 h-8 text-slate-300 mb-3" />
                       <h3 className="text-base font-bold text-slate-700 mb-1">Unverified Experience</h3>
                       <p className="text-slate-500 text-xs max-w-sm mb-4">Professional experience is currently unavailable as this profile is unverified.</p>
                       <button onClick={() => setShowClaimModal(true)} className="bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-full text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">Verify to Unlock</button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {profile.experiences.map((exp: any, index: number) => (
                        <div key={index} className="flex gap-6 group">
                          <div className="w-12 h-12 shrink-0 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="pt-2">
                            <h3 className="font-black text-[#0A1128] text-xl">{exp.role || exp.title}</h3>
                            <Link 
                              href={`/hospitals?query=${encodeURIComponent(exp.hospital || exp.organization || '')}`}
                              className="inline-block mt-2 hover:opacity-80 transition-opacity"
                            >
                              <p className="text-slate-500 text-lg font-serif italic border-b border-transparent hover:border-slate-400 pb-0.5">
                                {exp.hospital || exp.organization}
                              </p>
                            </Link>
                            <p className="text-slate-400 text-sm mt-1 font-bold tracking-widest">{exp.duration || exp.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Awards (Art Gallery Style) */}
              {isDoctor && (!verified || hasValidData(profile.awards)) && (
                <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8 mb-6">
                  <h2 className="text-2xl font-black text-[#0A1128] mb-6">Accolades & Honors</h2>
                  
                  {!hasValidData(profile.awards) ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                       <Medal className="w-8 h-8 text-slate-300 mb-3" />
                       <h3 className="text-base font-bold text-slate-700 mb-1">Unverified Awards</h3>
                       <p className="text-slate-500 text-xs max-w-sm mb-4">Accolades and honors are currently unavailable as this profile is unverified.</p>
                       <button onClick={() => setShowClaimModal(true)} className="bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-full text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">Verify to Unlock</button>
                    </div>
                  ) : (
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
                  )}
                </section>
              )}

              {/* Languages */}
              {isDoctor && (!verified || hasValidData(profile.languages)) && (
                <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8 mb-6">
                  <h2 className="text-2xl font-black text-[#0A1128] mb-6">Languages Spoken</h2>
                  
                  {!hasValidData(profile.languages) ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                       <Globe className="w-8 h-8 text-slate-300 mb-3" />
                       <h3 className="text-base font-bold text-slate-700 mb-1">Unverified Languages</h3>
                       <p className="text-slate-500 text-xs max-w-sm mb-4">Language data is currently unavailable as this profile is unverified.</p>
                       <button onClick={() => setShowClaimModal(true)} className="bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-full text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">Verify to Unlock</button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      {profile.languages.map((lang: string, index: number) => (
                        <div key={index} className="bg-white border border-slate-200 px-6 py-3 rounded-full flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-default">
                          <Globe className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-[#0A1128] text-sm">{lang}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Departments / Fleet - Hospital / Lab / Ambulance Only */}
              {(isHospital || isLab || isAmbulance) && hasValidData(profile.roster) && (
                <section className="relative pl-0 md:pl-16">
                  <div className="hidden md:block absolute left-0 top-2 w-[1px] h-full bg-slate-200"></div>
                  <h2 className="text-3xl font-black text-[#0A1128] mb-8">{isAmbulance ? "Fleet & Vehicles" : isLab ? "Specialized Departments" : "Centers of Excellence"}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {profile.roster.map((dept: string, i: number) => (
                      <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-cyan-500/30 transition-all group cursor-pointer">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center mb-4 text-cyan-600 group-hover:bg-cyan-50 group-hover:text-cyan-700 transition-colors">
                          <Activity className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-[#0A1128] text-lg group-hover:text-cyan-600 transition-colors">{dept}</h4>
                        <p className="text-xs text-slate-400 mt-3 font-bold uppercase tracking-widest group-hover:text-cyan-500">View Specialists &rarr;</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Health Packages / Top Products / Tests */}
              {(isHospital || isPharmacy || isLab) && hasValidData(profile.healthPackages) && (
                <section className="relative pl-0 md:pl-16">
                  <div className="hidden md:block absolute left-0 top-2 w-[1px] h-full bg-slate-200"></div>
                  <h2 className="text-3xl font-black text-[#0A1128] mb-8">{isPharmacy ? "Top Products & Medicines" : isLab ? "Popular Diagnostic Tests" : "Preventive Health Packages"}</h2>
                  <div className="grid grid-cols-1 gap-6">
                    {profile.healthPackages.map((pkg: any, i: number) => (
                      <div key={i} className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1 w-full">
                          <h4 className="text-xl font-bold text-[#0A1128] mb-2">{pkg.name}</h4>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Includes</p>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {pkg.included?.split(',').map((test: string, j: number) => (
                              <li key={j} className="flex items-start gap-2 text-slate-600 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{test.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="w-full md:w-64 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center shrink-0 flex flex-col justify-center">
                           <p className="text-3xl font-black text-cyan-600 mb-4">{pkg.price}</p>
                           {verified && (
                            <button 
                              onClick={() => window.dispatchEvent(new CustomEvent('open-telemedicine-fab', { detail: { action: 'schedule', doctorId: profile.id, doctorName: profile.name, package: pkg.name } }))}
                              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black tracking-widest uppercase text-xs py-3 rounded-full transition-all shadow-md shadow-cyan-500/25 border border-cyan-400/20"
                            >
                              {isPharmacy ? "Order Product" : isLab ? "Book Test" : "Book Package"}
                            </button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}


              {/* Media / Gallery (Editorial Strip) */}
              {((profile.galleryImages && profile.galleryImages.length > 0) || (profile.rawImages && profile.rawImages.length > 0) || (profile.youtubeLinks && profile.youtubeLinks.length > 0)) && (
                <section id="media" className="relative pl-0 md:pl-16">
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

              {/* Claim Profile Upsell (Moved to Bottom) */}
              {!verified && (
                <div className="bg-[#00897B] rounded-[2rem] p-8 md:p-12 mb-8 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
                  
                  <div className="relative z-10 text-center sm:text-left">
                    <h4 className="font-black text-white text-2xl md:text-3xl">Are you {profile.name}?</h4>
                    <p className="text-teal-50 mt-2 max-w-lg text-lg">Claim your digital stage. Verify your credentials, add exclusive clinic media, and unlock the Dehapa VIP Rx Pad.</p>
                  </div>
                  <button onClick={() => setShowClaimModal(true)} className="relative z-10 shrink-0 bg-white text-[#00897B] px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                    Claim Exclusivity
                  </button>
                </div>
              )}

              {/* Location & Map section moved to top */}
            </div>
          </div>

          {/* Right Sidebar (25%) */}
          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-[120px] lg:self-start">
            
            {/* Care Connect Booking Hub */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl overflow-hidden relative group">
              {/* Decorative top border */}
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
                  <p className="text-xs text-rose-700 font-bold mb-3">To protect our doctors from spam, please log in to view contact details.</p>
                  <Link href={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="w-full inline-block bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl text-sm font-black transition-colors">
                    Login / Register
                  </Link>
                </div>
              ) : (
                <button 
                  onClick={() => alert("Care Connect modal will open here.")} 
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
                >
                  Request Callback
                </button>
              )}
            </div>

            {/* Ad Space */}
            {heroRightAd && (
              <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white aspect-square md:aspect-[4/3] lg:aspect-[3/4]">
                {heroRightAd.imageUrl ? (
                  <a href={heroRightAd.linkUrl} target="_blank" rel="noreferrer">
                    <img src={heroRightAd.imageUrl} alt="Advertisement" className="w-full h-full object-cover" />
                  </a>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50" dangerouslySetInnerHTML={{ __html: heroRightAd.htmlCode }} />
                )}
              </div>
            )}


            {/* Similar Entities */}
            {similarEntities && similarEntities.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl flex flex-col">
                <h3 className="font-black text-lg text-[#0A1128] mb-4 shrink-0">Explore Network</h3>
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
                        <img src={sim.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(sim.name || "Provider")}&background=0f766e&color=fff`} alt={sim.name} className={`w-14 h-14 object-cover border border-slate-200 shrink-0 ${isHospitalOrLab ? 'rounded-lg' : 'rounded-xl'}`} />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-[#0A1128] truncate group-hover:text-cyan-600 transition-colors">{sim.name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-bold text-slate-700">{sim.stats?.rating || 4.5}</span>
                            <span className="text-[10px] text-slate-500 truncate ml-1 px-2 border-l border-slate-300">{sim.subtitle || sim.category}</span>
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



      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* QR Code */}
      {showQRModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Clinic QR Code</h3>
              <p className="text-slate-500 text-sm mt-1">Patients can scan this to book appointments instantly.</p>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 flex justify-center shadow-inner">
              <QRCodeSVG 
                value={`https://dehapa.com/${type}s/${profile.id}`}
                size={220}
                bgColor={"#ffffff"}
                fgColor={"#0f766e"}
                level={"Q"}
                includeMargin={false}
                imageSettings={{
                  src: "https://www.shyamdash.com/wp-content/uploads/2023/12/logo.png",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            
            <button className="w-full mt-6 bg-slate-900 hover:bg-black text-white font-bold text-sm py-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2">
              <Share2 className="w-4 h-4" /> Share QR Code
            </button>
          </div>
        </div>
      )}

      {/* Unverified Modal */}
      {showUnverifiedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowUnverifiedModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 border border-orange-200 shadow-sm mx-auto">
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 text-center mb-2">Unverified Profile</h3>
            <p className="text-slate-500 text-center mb-8 font-medium">This profile is unverified, so the booking system is disabled. Are you the authorized representative for this institution?</p>
            <button onClick={() => { setShowUnverifiedModal(false); setShowClaimModal(true); }} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30 flex justify-center items-center gap-2">
              Claim Profile to Unlock Features
            </button>
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimProfileModal 
          entityId={profile.id} 
          entityName={profile.name} 
          onClose={() => setShowClaimModal(false)} 
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative text-center shadow-2xl animate-in fade-in zoom-in-95">
            <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h3 className="font-black text-2xl text-[#0A1128] mb-6">Share Profile</h3>
            
            <div className="flex flex-col gap-3">
              <a 
                href={`https://wa.me/?text=Check out ${encodeURIComponent(profile.name)} on Dehapa: ${typeof window !== 'undefined' ? encodeURIComponent(window.location.href.split('?')[0]) : ''}`}
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-md"
              >
                <MessageCircle className="w-5 h-5" /> Share on WhatsApp
              </a>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href.split('?')[0]) : ''}`}
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-[#1877F2] hover:bg-[#0C5FCD] text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-md"
              >
                <Facebook className="w-5 h-5" /> Share on Facebook
              </a>
              <button 
                onClick={copyToClipboard}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
              >
                <Share2 className="w-5 h-5" /> Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative text-center shadow-2xl animate-in fade-in zoom-in-95 border border-cyan-500/20">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-t-3xl"></div>
            <button onClick={() => setShowInviteModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
            
            <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
              <UserPlus className="w-8 h-8 text-cyan-600" />
            </div>
            
            <h3 className="font-black text-2xl text-[#0A1128] mb-2">Connect with {profile.name}</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">By connecting, you allow this provider to access your medical records securely through the Dehapa Network.</p>
            
            <button 
              onClick={() => handleRequestConnection(false)}
              disabled={isRequestingConnection}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-400 disabled:to-slate-500 disabled:border-transparent text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/25 border border-cyan-400/20 uppercase tracking-widest flex items-center justify-center gap-3"
            >
              {isRequestingConnection ? "Sending Request..." : "Send Connection Request"}
            </button>
            <button onClick={() => setShowInviteModal(false)} className="mt-4 text-sm text-slate-500 font-bold hover:text-slate-800">
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* Unverified Modal */}
      {showUnverifiedModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative text-center shadow-2xl animate-in fade-in zoom-in-95 border border-amber-500/20">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-t-3xl"></div>
            <button onClick={() => setShowUnverifiedModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
            
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
            
            <h3 className="font-black text-2xl text-[#0A1128] mb-2">Profile Not Verified</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">This profile is currently unverified. We are unable to facilitate bookings or connections until the provider completes the Dehapa verification process.</p>
            
            <button 
              onClick={() => setShowUnverifiedModal(false)}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/25 border border-cyan-400/20 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showEmergencyModal && (
        <EmergencyIntakeModal 
          hospitalId={profile.id} 
          hospitalName={profile.name} 
          onClose={() => setShowEmergencyModal(false)} 
        />
      )}

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
