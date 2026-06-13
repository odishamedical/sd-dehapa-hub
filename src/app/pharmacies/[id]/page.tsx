"use client";

import React from 'react';
import Link from 'next/link';

// Mock Data for Pharmacy
export default function PharmacyProfilePage({ params }: { params: { id: string } }) {
  
  const mockPharmacy = {
    name: "Apollo Pharmacy",
    type: "24/7 Medical Store & Pharmacy",
    delivery: "Free Home Delivery",
    discount: "Up to 15% Flat Discount",
    speed: "2-Hour Express Delivery",
    rating: 4.7,
    reviews: 3241,
    logo: "https://ui-avatars.com/api/?name=Apollo+Pharmacy&background=ecfdf5&color=059669&size=200&font-size=0.33",
    gallery: [
      "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80",
    ],
    about: "Apollo Pharmacy is your trusted neighborhood medical store, offering 100% genuine medicines, healthcare devices, and daily essentials. We ensure strict cold-chain compliance for sensitive medications like insulin and vaccines.",
    categories: [
      { name: "Prescription Medicines", icon: "💊" },
      { name: "OTC & Skincare", icon: "🧴" },
      { name: "Baby & Mom Care", icon: "🍼" },
      { name: "Ayurvedic & Herbal", icon: "🌿" },
      { name: "Surgical & Devices", icon: "🩹" },
      { name: "Nutrition & Supplements", icon: "💪" },
    ],
    subscriptions: [
      { name: "Diabetes Refill Pack", items: "Insulin, Metformin, Test Strips", savings: "Save 20% Monthly" },
      { name: "Cardiac Care Refill", items: "Statins, BP Monitors", savings: "Save 18% Monthly" },
    ],
    contact: {
      address: "Shop No 14, Kharavela Nagar, Near Master Canteen, Bhubaneswar, Odisha 751001",
      phone: "+91 77777 55555",
      whatsapp: "+91 99999 88888",
      email: "orders@apollopharmacy-bbsr.com",
      website: "www.apollopharmacy.in",
      mapUrl: "https://maps.google.com/maps?q=Kharavela+Nagar+Bhubaneswar&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    hours: [
      { day: "Store Walk-in", time: "Open 24/7" },
      { day: "Home Delivery", time: "07:00 AM - 11:00 PM" },
      { day: "Express Delivery", time: "Within 2 Hours (Local)" }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      
      {/* 1. Retail Hero Gallery */}
      <div className="w-full h-72 md:h-96 bg-emerald-900 relative flex overflow-hidden">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-30">
          <Link href="/portal/admin" className="text-white hover:text-emerald-200 flex items-center gap-2 text-sm font-bold bg-black/40 px-4 py-2 rounded-lg backdrop-blur-md transition-colors border border-white/10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Directory
          </Link>
        </div>

        {/* Gallery Images */}
        <div className="w-1/2 md:w-2/3 h-full relative">
          <img src={mockPharmacy.gallery[0]} className="w-full h-full object-cover" alt="Pharmacy Storefront" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-transparent"></div>
        </div>
        <div className="w-1/2 md:w-1/3 h-full flex flex-col border-l-4 border-[#F9FAFB]">
          <div className="h-1/2 w-full border-b-4 border-[#F9FAFB]">
            <img src={mockPharmacy.gallery[1]} className="w-full h-full object-cover" alt="Medicine Shelves" />
          </div>
          <div className="h-1/2 w-full relative group cursor-pointer">
            <img src={mockPharmacy.gallery[2]} className="w-full h-full object-cover" alt="Delivery Personnel" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
              <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">View Store</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Metrics Bar (Retail Focused) */}
      <div className="w-full bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-center md:justify-end gap-6 md:gap-12 text-sm font-bold tracking-widest uppercase text-slate-300">
          <span className="flex items-center gap-2"><span className="text-blue-400 text-lg">🚚</span> {mockPharmacy.delivery}</span>
          <span className="flex items-center gap-2"><span className="text-emerald-400 text-lg">💊</span> {mockPharmacy.discount}</span>
          <span className="flex items-center gap-2"><span className="text-amber-400 text-lg">⏱️</span> {mockPharmacy.speed}</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 md:-mt-24 z-20">
        
        {/* Header Card (Logo & High Level Info) */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-8 flex flex-col md:flex-row items-start md:items-center gap-6 border border-slate-100">
          {/* Corporate Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-lg overflow-hidden shrink-0 bg-white border border-slate-100 p-2">
            <img src={mockPharmacy.logo} alt={mockPharmacy.name} className="w-full h-full object-contain rounded-xl" />
          </div>
          
          {/* Main Info */}
          <div className="flex-1 mt-2 md:mt-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{mockPharmacy.name}</h1>
            <p className="text-lg text-emerald-700 font-semibold mb-3">{mockPharmacy.type}</p>
            
            <div className="flex items-center gap-2">
              <span className="flex items-center text-amber-400 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <span className="text-sm font-bold text-amber-700">{mockPharmacy.rating}</span>
              </span>
              <span className="text-sm text-slate-500 font-medium">({mockPharmacy.reviews} Google Reviews)</span>
              <span className="mx-2 text-slate-300">•</span>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                Verified Pharmacy
              </span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* In-Content Prescription Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 md:p-8 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Quick Order via Prescription
                </h2>
                <p className="text-emerald-100 font-medium">Just upload a photo of your doctor's prescription, and our pharmacists will instantly pack and dispatch your order.</p>
              </div>
              <button className="shrink-0 bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-6 py-3 rounded-xl shadow-md transition-all">
                Upload Prescription Now
              </button>
            </div>

            {/* Product Categories */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                Available Categories
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {mockPharmacy.categories.map((cat, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer group">
                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="font-semibold text-slate-800 text-sm">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chronic Care Subscriptions */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Monthly Medicine Refills
                </h2>
                <span className="text-emerald-600 text-sm font-bold cursor-pointer hover:underline">Subscribe & Save</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockPharmacy.subscriptions.map((sub, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all relative overflow-hidden group cursor-pointer bg-slate-50">
                    <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg">SUBSCRIPTION</div>
                    <h3 className="font-bold text-slate-900 mb-1 pr-16">{sub.name}</h3>
                    <p className="text-xs text-slate-500 mb-4 h-8">{sub.items}</p>
                    <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg w-max font-bold text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      {sub.savings}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                About {mockPharmacy.name}
              </h2>
              <p className="text-slate-600 leading-relaxed">{mockPharmacy.about}</p>
            </div>

          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              
              {/* Primary Action Card (WhatsApp Focus) */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-emerald-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#25D366]"></div>
                <div className="p-6 space-y-4">
                  <button className="w-full px-6 py-4 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg group">
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    Order via WhatsApp
                  </button>
                  <p className="text-center text-xs font-bold text-emerald-600 uppercase tracking-widest">Instant Response • 2-Hr Delivery</p>
                  
                  <hr className="border-slate-100" />
                  
                  <button className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    Call Pharmacy: {mockPharmacy.contact.phone}
                  </button>
                </div>
              </div>
              
              {/* Location Card */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                {/* Map Box */}
                <div className="w-full h-48 bg-slate-100 relative">
                  <iframe 
                    src={mockPharmacy.contact.mapUrl} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 border-b border-slate-100 pb-2">Store Location</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">{mockPharmacy.contact.address}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                      <p className="text-sm text-emerald-600 hover:underline cursor-pointer font-medium">{mockPharmacy.contact.website}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Store Timings
                </h3>
                <div className="space-y-3">
                  {mockPharmacy.hours.map((h, idx) => (
                    <div key={idx} className="flex flex-col border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                      <span className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-0.5">{h.day}</span>
                      <span className={`font-bold text-sm ${h.time.includes('24/7') ? 'text-emerald-600' : 'text-slate-900'}`}>{h.time}</span>
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
