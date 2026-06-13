"use client";

import React from 'react';
import Link from 'next/link';

// Using mock data for now, ignoring the actual `id`
export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  
  const mockDoctor = {
    name: "Dr. Sandeep Sharma",
    specialty: "Cardiology & Internal Medicine",
    qualification: "MBBS, MD (Medicine), DM (Cardiology)",
    experience: "15+ Years Experience",
    rating: 4.8,
    reviews: 124,
    image: "https://ui-avatars.com/api/?name=Dr+Sandeep+Sharma&background=0f766e&color=fff&size=200",
    banner: "https://images.unsplash.com/photo-1551076805-e18690c5e53b?auto=format&fit=crop&w=1200&q=80",
    bio: "Dr. Sandeep Sharma is a highly skilled Cardiologist with over 15 years of experience in treating complex heart conditions. He is dedicated to providing compassionate, patient-centered care and utilizing the latest advancements in cardiovascular medicine.",
    specialties: ["Heart Failure", "Echocardiography", "Hypertension", "Preventive Cardiology"],
    education: [
      { year: "2010", degree: "DM - Cardiology", institute: "AIIMS, New Delhi" },
      { year: "2006", degree: "MD - General Medicine", institute: "SCB Medical College, Cuttack" },
      { year: "2002", degree: "MBBS", institute: "SCB Medical College, Cuttack" }
    ],
    clinic: {
      name: "Apollo Hospitals",
      address: "Unit 15, Bhubaneswar, Odisha 751005",
      phone: "+91 98765 43210",
      email: "dr.sandeep@example.com",
      website: "www.apollohospitals.com/sandeep",
      mapUrl: "https://maps.google.com/maps?q=Apollo+Hospitals+Bhubaneswar&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    hours: [
      { day: "Monday - Friday", time: "09:00 AM - 05:00 PM" },
      { day: "Saturday", time: "09:00 AM - 01:00 PM" },
      { day: "Sunday", time: "Closed" }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      {/* 1. Hero Banner */}
      <div className="w-full h-64 md:h-80 relative bg-teal-900 overflow-hidden">
        {/* Placeholder background image. Using an abstract medical/hospital gradient if image fails */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-teal-700 opacity-90 z-10"></div>
        <img 
          src={mockDoctor.banner} 
          alt="Clinic Banner" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <Link href="/portal/admin" className="text-white hover:text-teal-200 flex items-center gap-2 text-sm font-bold bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Directory
          </Link>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 z-20">
        
        {/* Header Card (Profile Pic & High Level Info) */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 flex flex-col md:flex-row items-start md:items-center gap-6 border border-slate-100">
          {/* Profile Photo */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden shrink-0 bg-slate-100 mt-[-4rem] md:mt-0">
            <img src={mockDoctor.image} alt={mockDoctor.name} className="w-full h-full object-cover" />
          </div>
          
          {/* Main Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{mockDoctor.name}</h1>
              <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                Verified
              </span>
            </div>
            <p className="text-lg text-teal-700 font-semibold mb-2">{mockDoctor.specialty}</p>
            <p className="text-sm text-slate-500 mb-3">{mockDoctor.qualification} • {mockDoctor.experience}</p>
            
            <div className="flex items-center gap-2">
              <span className="flex items-center text-amber-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <span className="ml-1 text-sm font-bold text-slate-700">{mockDoctor.rating}</span>
              </span>
              <span className="text-sm text-slate-400">({mockDoctor.reviews} Google Reviews)</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
            <button className="w-full md:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2">
              Book Appointment
            </button>
            <button className="w-full md:w-auto px-8 py-3 bg-white border border-slate-200 hover:border-teal-500 text-slate-700 hover:text-teal-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              Call Clinic
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About the Doctor</h2>
              <p className="text-slate-600 leading-relaxed">{mockDoctor.bio}</p>
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Specialties & Services</h2>
              <div className="flex flex-wrap gap-2">
                {mockDoctor.specialties.map((spec, idx) => (
                  <span key={idx} className="bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1.5 rounded-lg text-sm font-semibold">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Education & Training</h2>
              <div className="space-y-6">
                {mockDoctor.education.map((edu, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-teal-500 rounded-full mt-1.5"></div>
                      {idx !== mockDoctor.education.length - 1 && <div className="w-0.5 h-full bg-slate-200 mt-2"></div>}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{edu.degree}</h4>
                      <p className="text-sm text-slate-500">{edu.institute}</p>
                      <span className="text-xs font-bold text-slate-400 mt-1 block">{edu.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              
              {/* Location Card */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                {/* Map Box */}
                <div className="w-full h-48 bg-slate-100 relative">
                  <iframe 
                    src={mockDoctor.clinic.mapUrl} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{mockDoctor.clinic.name}</h3>
                  
                  <div className="space-y-4 mt-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <p className="text-sm text-slate-600 leading-relaxed">{mockDoctor.clinic.address}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      <p className="text-sm text-slate-900 font-semibold">{mockDoctor.clinic.phone}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                      <p className="text-sm text-teal-600 hover:underline cursor-pointer">{mockDoctor.clinic.website}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Operating Hours
                </h3>
                <div className="space-y-3">
                  {mockDoctor.hours.map((h, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                      <span className="text-slate-500 font-medium">{h.day}</span>
                      <span className={`font-semibold ${h.time === 'Closed' ? 'text-red-500' : 'text-slate-900'}`}>{h.time}</span>
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
