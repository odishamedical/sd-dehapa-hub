"use client";

import React from 'react';
import Link from 'next/link';

// Mock Data for Ambulance Fleet
export default function AmbulanceProfilePage({ params }: { params: { id: string } }) {
  
  const mockAmbulance = {
    name: "Sanjivani Emergency Fleet",
    type: "24/7 Advanced Life Support Network",
    dispatch: "24/7 Rapid Dispatch",
    response: "15-Min Avg Response",
    support: "BLS & ALS Support",
    rating: 4.9,
    reviews: 1432,
    logo: "https://ui-avatars.com/api/?name=Sanjivani+Fleet&background=fee2e2&color=b91c1c&size=200&font-size=0.33",
    gallery: [
      "https://loremflickr.com/800/600/ambulance",
      "https://loremflickr.com/800/600/paramedic",
      "https://loremflickr.com/800/600/defibrillator",
    ],
    about: "Sanjivani Emergency Fleet operates the largest and fastest network of Advanced Life Support (ALS) ambulances in the city. Our vehicles are essentially ICUs on wheels, staffed by highly trained paramedics capable of managing critical cardiac, trauma, and respiratory emergencies en route to the hospital.",
    capabilities: [
      { name: "Advanced Life Support (ICU)", icon: "🚑" },
      { name: "Basic Life Support (BLS)", icon: "🚐" },
      { name: "Neonatal Transport (Incubator)", icon: "👶" },
      { name: "Inter-City Patient Transfer", icon: "🛣️" },
      { name: "Dead Body Transport (Mortuary)", icon: "🕊️" },
      { name: "Event Medical Standby", icon: "🎪" },
    ],
    equipment: [
      { name: "Transport Ventilator", icon: "💨" },
      { name: "Automated Defibrillator", icon: "⚡" },
      { name: "Multipara Patient Monitor", icon: "📈" },
      { name: "Continuous Oxygen Supply", icon: "🫁" },
      { name: "Syringe Pumps", icon: "💉" },
      { name: "Trained Paramedic Crew", icon: "👩‍⚕️" },
    ],
    coverage: [
      "Bhubaneswar (All Zones)",
      "Cuttack",
      "Puri",
      "Khurda Highway",
      "Statewide (For Planned Transfers)"
    ],
    contact: {
      base: "Main Depot: Unit 6, Near Capital Hospital, Bhubaneswar, Odisha",
      emergencyPhone: "1088 / +91 99999 00000",
      bookingPhone: "0674-2559999",
      mapUrl: "https://maps.google.com/maps?q=Capital+Hospital+Bhubaneswar&t=&z=14&ie=UTF8&iwloc=&output=embed"
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      
      {/* 1. Emergency Hero Gallery */}
      <div className="w-full h-72 md:h-96 bg-slate-900 relative flex overflow-hidden">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-30">
          <Link href="/portal/admin" className="text-white hover:text-red-200 flex items-center gap-2 text-sm font-bold bg-black/40 px-4 py-2 rounded-lg backdrop-blur-md transition-colors border border-white/10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Directory
          </Link>
        </div>

        {/* Gallery Images */}
        <div className="w-1/2 md:w-2/3 h-full relative">
          <img src={mockAmbulance.gallery[0]} className="w-full h-full object-cover" alt="Ambulance Exterior" />
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-transparent"></div>
        </div>
        <div className="w-1/2 md:w-1/3 h-full flex flex-col border-l-4 border-[#F9FAFB]">
          <div className="h-1/2 w-full border-b-4 border-[#F9FAFB]">
            <img src={mockAmbulance.gallery[1]} className="w-full h-full object-cover" alt="Paramedic Staff" />
          </div>
          <div className="h-1/2 w-full relative group cursor-pointer">
            <img src={mockAmbulance.gallery[2]} className="w-full h-full object-cover" alt="Ambulance Interior ICU" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
              <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">View Fleet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Metrics Bar (Emergency Focused) */}
      <div className="w-full bg-red-700 border-t border-red-800 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-center md:justify-end gap-6 md:gap-12 text-sm font-bold tracking-widest uppercase text-white">
          <span className="flex items-center gap-2"><span className="text-red-200 text-lg">🚨</span> {mockAmbulance.dispatch}</span>
          <span className="flex items-center gap-2"><span className="text-red-200 text-lg">⏱️</span> {mockAmbulance.response}</span>
          <span className="flex items-center gap-2"><span className="text-red-200 text-lg">🩺</span> {mockAmbulance.support}</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 md:-mt-24 z-20">
        
        {/* Header Card (Logo & High Level Info) */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-8 flex flex-col md:flex-row items-start md:items-center gap-6 border border-slate-100">
          {/* Corporate Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-lg overflow-hidden shrink-0 bg-white border border-slate-100 p-2">
            <img src={mockAmbulance.logo} alt={mockAmbulance.name} className="w-full h-full object-contain rounded-xl" />
          </div>
          
          {/* Main Info */}
          <div className="flex-1 mt-2 md:mt-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{mockAmbulance.name}</h1>
            <p className="text-lg text-red-700 font-semibold mb-3">{mockAmbulance.type}</p>
            
            <div className="flex items-center gap-2">
              <span className="flex items-center text-amber-400 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <span className="text-sm font-bold text-amber-700">{mockAmbulance.rating}</span>
              </span>
              <span className="text-sm text-slate-500 font-medium">({mockAmbulance.reviews} Verified Rescue Logs)</span>
              <span className="mx-2 text-slate-300">•</span>
              <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                Certified Fleet
              </span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Fleet Capabilities */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                Fleet Capabilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockAmbulance.capabilities.map((cap, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <span className="text-3xl bg-white w-12 h-12 flex items-center justify-center rounded-lg shadow-sm shrink-0">{cap.icon}</span>
                    <span className="font-bold text-slate-800 text-sm leading-snug">{cap.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* On-Board Equipment (Critical) */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                ALS Life Support Equipment
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {mockAmbulance.equipment.map((eq, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl mb-2">{eq.icon}</span>
                    <span className="font-semibold text-slate-700 text-xs">{eq.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage Areas */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Primary Dispatch Coverage
              </h2>
              <div className="flex flex-wrap gap-3">
                {mockAmbulance.coverage.map((area, idx) => (
                  <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold">
                    📍 {area}
                  </span>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                About {mockAmbulance.name}
              </h2>
              <p className="text-slate-600 leading-relaxed">{mockAmbulance.about}</p>
            </div>

          </div>

          {/* Right Column: Sticky Sidebar (HYPER CRITICAL) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              
              {/* Primary Action Card (Emergency Focus) */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-red-500 overflow-hidden relative">
                {/* Red warning stripe */}
                <div className="w-full bg-red-600 text-white text-center py-2 text-[10px] font-black tracking-widest uppercase">
                  Emergency Dispatch Center
                </div>
                
                <div className="p-6 space-y-5">
                  <button className="w-full px-6 py-6 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-xl shadow-red-600/40 transition-all flex flex-col items-center justify-center gap-1 group animate-pulse hover:animate-none">
                    <span className="text-2xl tracking-wide">CALL AMBULANCE</span>
                    <span className="text-sm opacity-90 font-medium">Instantly Connect to Dispatch</span>
                  </button>
                  
                  <div className="text-center">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Direct Hotline</p>
                    <p className="text-2xl font-black text-slate-900">{mockAmbulance.contact.emergencyPhone}</p>
                  </div>
                  
                  <hr className="border-slate-200" />
                  
                  <button className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                    Book Planned Transfer
                  </button>
                  <p className="text-center text-xs font-medium text-slate-500">For Hospital Discharges or Shifting</p>
                </div>
              </div>
              
              {/* Location Card */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                {/* Map Box */}
                <div className="w-full h-48 bg-slate-100 relative">
                  <iframe 
                    src={mockAmbulance.contact.mapUrl} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 border-b border-slate-100 pb-2">Primary Depot Location</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">{mockAmbulance.contact.base}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
