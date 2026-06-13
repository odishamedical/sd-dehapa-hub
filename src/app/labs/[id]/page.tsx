"use client";

import React from 'react';
import Link from 'next/link';

// Mock Data for Lab
export default function LabProfilePage({ params }: { params: { id: string } }) {
  
  const mockLab = {
    name: "Nidan Diagnostics & Imaging Center",
    type: "Advanced Diagnostic Lab",
    accreditation: "NABL & CAP Accredited",
    homeCollection: "Available within 2 Hrs",
    reportingTime: "24-Hour Reporting",
    rating: 4.8,
    reviews: 2156,
    logo: "https://ui-avatars.com/api/?name=Nidan+Diagnostics&background=e0f2fe&color=0369a1&size=200&font-size=0.33",
    gallery: [
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80",
    ],
    about: "Nidan Diagnostics is a state-of-the-art pathology and imaging center committed to delivering highly accurate and timely reports. Equipped with fully automated robotic platforms and advanced imaging technology like 3T MRI, we serve thousands of patients daily with unwavering reliability.",
    categories: [
      { name: "Blood Tests & Pathology", icon: "🩸" },
      { name: "X-Ray & Ultrasound", icon: "🩻" },
      { name: "MRI & CT Scans", icon: "🧲" },
      { name: "Cardiology (ECG/ECHO)", icon: "🫀" },
      { name: "Advanced Genomics", icon: "🧬" },
      { name: "Health Packages", icon: "📋" },
    ],
    packages: [
      { name: "Comprehensive Full Body Checkup", tests: 85, price: "₹2,499", oldPrice: "₹4,000" },
      { name: "Cardiac Risk Profile", tests: 24, price: "₹1,299", oldPrice: "₹2,500" },
      { name: "Diabetes Care Package", tests: 15, price: "₹899", oldPrice: "₹1,500" },
    ],
    machines: [
      "Siemens 3T MRI Scanner",
      "Philips 128-Slice CT",
      "Roche Fully Automated Analyzers",
      "Advanced 4D Ultrasound"
    ],
    contact: {
      address: "Ground Floor, Metropolis Building, Janpath, Bhubaneswar, Odisha 751001",
      phone: "+91 88888 22222",
      whatsapp: "+91 99999 33333",
      email: "reports@nidandiagnostics.com",
      website: "www.nidandiagnostics.com",
      mapUrl: "https://maps.google.com/maps?q=Janpath+Bhubaneswar&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    hours: [
      { day: "Lab Timings", time: "06:00 AM - 10:00 PM (Daily)" },
      { day: "Home Collection", time: "06:00 AM - 08:00 PM" },
      { day: "Report Delivery", time: "Online / 24 Hours" }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      
      {/* 1. Hero Gallery */}
      <div className="w-full h-72 md:h-96 bg-slate-900 relative flex overflow-hidden">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-30">
          <Link href="/portal/admin" className="text-white hover:text-sky-200 flex items-center gap-2 text-sm font-bold bg-black/40 px-4 py-2 rounded-lg backdrop-blur-md transition-colors border border-white/10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Directory
          </Link>
        </div>

        {/* Gallery Images */}
        <div className="w-1/2 md:w-2/3 h-full relative">
          <img src={mockLab.gallery[0]} className="w-full h-full object-cover" alt="Lab Facility" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent"></div>
        </div>
        <div className="w-1/2 md:w-1/3 h-full flex flex-col border-l-4 border-[#F9FAFB]">
          <div className="h-1/2 w-full border-b-4 border-[#F9FAFB]">
            <img src={mockLab.gallery[1]} className="w-full h-full object-cover" alt="Lab Technician" />
          </div>
          <div className="h-1/2 w-full relative group cursor-pointer">
            <img src={mockLab.gallery[2]} className="w-full h-full object-cover" alt="MRI Machine" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
              <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">View Facility</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Metrics Bar */}
      <div className="w-full bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-center md:justify-end gap-6 md:gap-12 text-sm font-bold tracking-widest uppercase text-slate-300">
          <span className="flex items-center gap-2"><span className="text-amber-400 text-lg">🏅</span> {mockLab.accreditation}</span>
          <span className="flex items-center gap-2"><span className="text-sky-400 text-lg">🛵</span> {mockLab.homeCollection}</span>
          <span className="flex items-center gap-2"><span className="text-teal-400 text-lg">⚡</span> {mockLab.reportingTime}</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 md:-mt-24 z-20">
        
        {/* Header Card (Logo & High Level Info) */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-8 flex flex-col md:flex-row items-start md:items-center gap-6 border border-slate-100">
          {/* Corporate Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-lg overflow-hidden shrink-0 bg-white border border-slate-100 p-2">
            <img src={mockLab.logo} alt={mockLab.name} className="w-full h-full object-contain rounded-xl" />
          </div>
          
          {/* Main Info */}
          <div className="flex-1 mt-2 md:mt-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{mockLab.name}</h1>
            <p className="text-lg text-sky-700 font-semibold mb-3">{mockLab.type}</p>
            
            <div className="flex items-center gap-2">
              <span className="flex items-center text-amber-400 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <span className="text-sm font-bold text-amber-700">{mockLab.rating}</span>
              </span>
              <span className="text-sm text-slate-500 font-medium">({mockLab.reviews} Google Reviews)</span>
              <span className="mx-2 text-slate-300">•</span>
              <span className="bg-sky-50 text-sky-600 border border-sky-100 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                Verified Lab
              </span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Health Packages (Lab Specific) */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  Popular Health Packages
                </h2>
                <span className="text-sky-600 text-sm font-bold cursor-pointer hover:underline">View All</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockLab.packages.map((pkg, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-5 hover:border-sky-300 hover:shadow-md transition-all relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">OFFER</div>
                    <h3 className="font-bold text-slate-900 mb-1 pr-10">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 mb-4">{pkg.tests} Parameters Included</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-sky-700">{pkg.price}</span>
                      <span className="text-sm text-slate-400 line-through">{pkg.oldPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Categories */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                Test Categories
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {mockLab.categories.map((cat, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 hover:border-sky-300 hover:shadow-md transition-all rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer group">
                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="font-semibold text-slate-800 text-sm">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* About & Technology */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                About & Technology
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">{mockLab.about}</p>
              
              <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Advanced Equipment</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockLab.machines.map((machine, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                    {machine}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              
              {/* Primary Action Card */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-sky-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-sky-600"></div>
                <div className="p-6 space-y-4">
                  <button className="w-full px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg group">
                    <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    Book Home Collection
                  </button>
                  <p className="text-center text-xs font-bold text-sky-600 uppercase tracking-widest">Free for orders above ₹1,000</p>
                  
                  <hr className="border-slate-100" />
                  
                  <button className="w-full px-6 py-4 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    Upload Prescription
                  </button>
                  <p className="text-center text-xs font-medium text-slate-500">Get a quote within 15 minutes</p>
                </div>
              </div>
              
              {/* Location Card */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                {/* Map Box */}
                <div className="w-full h-48 bg-slate-100 relative">
                  <iframe 
                    src={mockLab.contact.mapUrl} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 border-b border-slate-100 pb-2">Lab Location & Contact</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">{mockLab.contact.address}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-sky-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      <p className="text-sm text-slate-900 font-bold">{mockLab.contact.phone}</p>
                    </div>

                    <div className="flex items-center gap-3 bg-green-50 p-2 rounded-lg border border-green-100">
                      <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      <p className="text-sm text-green-700 font-bold">WhatsApp: {mockLab.contact.whatsapp}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Lab Timings
                </h3>
                <div className="space-y-3">
                  {mockLab.hours.map((h, idx) => (
                    <div key={idx} className="flex flex-col border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                      <span className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-0.5">{h.day}</span>
                      <span className="font-bold text-slate-900 text-sm">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
