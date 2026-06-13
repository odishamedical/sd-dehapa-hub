"use client";

import React from 'react';
import Link from 'next/link';

// Mock Data for Hospital
export default function HospitalProfilePage({ params }: { params: { id: string } }) {
  
  const mockHospital = {
    name: "Apollo City Hospital & Research Center",
    type: "Multi-Specialty Hospital",
    accreditation: "NABH & NABL Accredited",
    beds: "500+",
    rating: 4.6,
    reviews: 1284,
    logo: "https://ui-avatars.com/api/?name=Apollo+Hospital&background=e2e8f0&color=0f766e&size=200&font-size=0.33",
    gallery: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80",
    ],
    about: "Apollo City Hospital is a premier multi-specialty healthcare institution dedicated to providing world-class medical services. Equipped with state-of-the-art technology and a team of internationally trained medical professionals, we offer comprehensive care across more than 20 specialties.",
    departments: [
      { name: "Cardiology", icon: "❤️" },
      { name: "Neurology", icon: "🧠" },
      { name: "Orthopedics", icon: "🦴" },
      { name: "Oncology", icon: "🎗️" },
      { name: "Pediatrics", icon: "👶" },
      { name: "Gastroenterology", icon: "🩺" },
    ],
    facilities: [
      "24/7 Emergency & Trauma",
      "Advanced ICU / NICU",
      "24/7 Pharmacy",
      "In-house Blood Bank",
      "Advanced Radiology (MRI, CT)",
      "Patient Cafeteria"
    ],
    insurances: [
      "Star Health Insurance",
      "HDFC ERGO",
      "ICICI Lombard",
      "Aditya Birla Health",
      "Niva Bupa (Max Bupa)"
    ],
    contact: {
      address: "Plot No. 251, Sainik School Road, Bhubaneswar, Odisha 751005",
      emergencyPhone: "1066 / +91 99999 11111",
      opdPhone: "0674-2553333",
      email: "info@apollo-bhubaneswar.com",
      website: "www.apollohospitals.com/bhubaneswar",
      mapUrl: "https://maps.google.com/maps?q=Apollo+Hospitals+Bhubaneswar&t=&z=15&ie=UTF8&iwloc=&output=embed"
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      
      {/* 1. Hero Gallery */}
      <div className="w-full h-72 md:h-96 bg-slate-900 relative flex overflow-hidden">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-30">
          <Link href="/portal/admin" className="text-white hover:text-teal-200 flex items-center gap-2 text-sm font-bold bg-black/40 px-4 py-2 rounded-lg backdrop-blur-md transition-colors border border-white/10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Directory
          </Link>
        </div>

        {/* Gallery Images */}
        <div className="w-1/2 md:w-2/3 h-full relative">
          <img src={mockHospital.gallery[0]} className="w-full h-full object-cover" alt="Hospital Exterior" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent"></div>
        </div>
        <div className="w-1/2 md:w-1/3 h-full flex flex-col border-l-4 border-[#F9FAFB]">
          <div className="h-1/2 w-full border-b-4 border-[#F9FAFB]">
            <img src={mockHospital.gallery[1]} className="w-full h-full object-cover" alt="Hospital Room" />
          </div>
          <div className="h-1/2 w-full relative group cursor-pointer">
            <img src={mockHospital.gallery[2]} className="w-full h-full object-cover" alt="Hospital Equipment" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
              <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">View All Photos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Metrics Bar */}
      <div className="w-full bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-center md:justify-end gap-6 md:gap-12 text-sm font-bold tracking-widest uppercase text-slate-300">
          <span className="flex items-center gap-2"><span className="text-teal-400 text-lg">🏥</span> {mockHospital.beds} Beds</span>
          <span className="flex items-center gap-2"><span className="text-red-400 text-lg">🚑</span> 24/7 Emergency</span>
          <span className="flex items-center gap-2"><span className="text-blue-400 text-lg">🏅</span> {mockHospital.accreditation}</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 md:-mt-24 z-20">
        
        {/* Header Card (Logo & High Level Info) */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-8 flex flex-col md:flex-row items-start md:items-center gap-6 border border-slate-100">
          {/* Corporate Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-lg overflow-hidden shrink-0 bg-white border border-slate-100 p-2">
            <img src={mockHospital.logo} alt={mockHospital.name} className="w-full h-full object-contain rounded-xl" />
          </div>
          
          {/* Main Info */}
          <div className="flex-1 mt-2 md:mt-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{mockHospital.name}</h1>
            <p className="text-lg text-teal-700 font-semibold mb-3">{mockHospital.type}</p>
            
            <div className="flex items-center gap-2">
              <span className="flex items-center text-amber-400 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <span className="text-sm font-bold text-amber-700">{mockHospital.rating}</span>
              </span>
              <span className="text-sm text-slate-500 font-medium">({mockHospital.reviews} Google Reviews)</span>
              <span className="mx-2 text-slate-300">•</span>
              <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                Verified Institution
              </span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Institution */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                About the Institution
              </h2>
              <p className="text-slate-600 leading-relaxed">{mockHospital.about}</p>
            </div>

            {/* Centers of Excellence */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                Centers of Excellence
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {mockHospital.departments.map((dept, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 hover:border-teal-300 hover:shadow-md transition-all rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer group">
                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{dept.icon}</span>
                    <span className="font-semibold text-slate-800 text-sm">{dept.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities & Amenities */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                Infrastructure & Facilities
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockHospital.facilities.map((fac, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <svg className="w-5 h-5 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {fac}
                  </li>
                ))}
              </ul>
            </div>

            {/* Insurance & TPAs */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                Supported Insurances & TPAs
              </h2>
              <div className="flex flex-wrap gap-3">
                {mockHospital.insurances.map((ins, idx) => (
                  <span key={idx} className="bg-white border border-slate-200 shadow-sm text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold">
                    {ins}
                  </span>
                ))}
                <span className="bg-slate-100 border border-slate-200 text-slate-500 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-slate-200 transition-colors">
                  + 15 More
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              
              {/* Emergency Action Card */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 overflow-hidden">
                <div className="p-6 space-y-4">
                  <button className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-3 text-lg">
                    <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    Call Emergency
                  </button>
                  <p className="text-center text-xs font-bold text-red-600 uppercase tracking-widest">{mockHospital.contact.emergencyPhone}</p>
                  
                  <hr className="border-slate-100" />
                  
                  <button className="w-full px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2">
                    Book OPD Appointment
                  </button>
                  <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest">Enquiry: {mockHospital.contact.opdPhone}</p>
                </div>
              </div>
              
              {/* Location Card */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                {/* Map Box */}
                <div className="w-full h-48 bg-slate-100 relative">
                  <iframe 
                    src={mockHospital.contact.mapUrl} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 border-b border-slate-100 pb-2">Location & Contact</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">{mockHospital.contact.address}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      <p className="text-sm text-slate-700 font-medium">{mockHospital.contact.email}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                      <p className="text-sm text-teal-600 hover:underline cursor-pointer font-medium">{mockHospital.contact.website}</p>
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
