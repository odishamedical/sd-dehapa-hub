"use client";

import React from 'react';
import Link from 'next/link';

import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { useState, useEffect, use } from 'react';

import CategoryNav from '@/components/CategoryNav';
import Breadcrumb from '@/components/Breadcrumb';

export default function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [doctor, setDoctor] = useState<any>(null);
  const [similarDoctors, setSimilarDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const docRef = doc(db, 'directory', resolvedParams.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const rawData = docSnap.data();
          const docData = {
            id: docSnap.id,
            name: rawData.name || "Unknown Doctor",
            specialty: rawData.subCategory || rawData.category || "Specialist",
            experience: rawData.experience || "10+ Years",
            rating: rawData.rating || 4.5,
            reviews: rawData.reviews || 0,
            fee: rawData.fee || 500,
            image: rawData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawData.name || "Doc")}&background=0f766e&color=fff&size=150`,
            verified: rawData.verified || false,
            about: rawData.about || `${rawData.name} is a dedicated healthcare professional based in ${rawData.city || rawData.district || 'Odisha'}. They are committed to providing excellent patient care.`,
            specialties: rawData.specialties || [rawData.subCategory || "General Practice"],
            education: rawData.education || [{ degree: "MBBS", institution: "Medical College" }],
            languages: rawData.languages || ["English", "Odia", "Hindi"],
            banner: "https://images.unsplash.com/photo-1551076805-e18690c5e53b?auto=format&fit=crop&w=1200&q=80",
            clinic: {
              name: rawData.clinicName || "Private Clinic",
              address: rawData.address || "Odisha",
              phone: rawData.phone || "+91 XXXXX XXXXX",
              website: rawData.website || "Not Available",
              mapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(rawData.address || rawData.name)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
            },
            hours: rawData.hours || [
              { day: "Mon - Fri", time: "10:00 AM - 08:00 PM" },
              { day: "Saturday", time: "10:00 AM - 02:00 PM" },
              { day: "Sunday", time: "Closed" }
            ],
            city: rawData.city || rawData.district || "Odisha"
          };
          setDoctor(docData);
          
          // Fetch similar doctors
          try {
            const simQuery = query(
              collection(db, 'directory'),
              where("subCategory", "==", rawData.subCategory || ""),
              where("city", "==", rawData.city || ""),
              limit(4)
            );
            const simSnap = await getDocs(simQuery);
            const simDocs = simSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(d => d.id !== docSnap.id)
              .slice(0, 3);
            setSimilarDoctors(simDocs);
          } catch (e) {
            console.error("Failed to fetch similar doctors", e);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [resolvedParams.id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"></div></div>;
  }

  if (!doctor) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><div className="text-center"><h2 className="text-2xl font-bold text-slate-900 mb-2">Doctor Not Found</h2><Link href="/doctors" className="text-teal-600 hover:underline">Return to Directory</Link></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      <CategoryNav />
      
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: doctor.city || "Odisha", href: "/doctors" },
            { name: "Doctors", href: "/doctors" },
            { name: doctor.specialty || "Specialist", href: "/doctors" },
            { name: doctor.name }
          ]} />
        </div>
      </div>
      
      {/* Banner Area */}
      <div className="w-full h-64 md:h-80 relative bg-teal-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-teal-700 opacity-90 z-10"></div>
        <img 
          src={doctor.banner} 
          alt="Clinic Banner" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        
        {/* Main Content */}
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 z-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left: Sticky Profile Card (25%) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <div className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg overflow-hidden shrink-0 bg-slate-100 mb-4">
                <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
              </div>
              <h1 className="text-center text-xl font-bold text-slate-900">{doctor.name}</h1>
              <p className="text-center text-teal-700 font-semibold text-sm">{doctor.specialty}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                 <button className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all">Book Appointment</button>
                 <button className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-teal-500 text-slate-700 hover:text-teal-600 font-bold rounded-xl transition-all">Call Clinic</button>
              </div>
            </div>
          </div>

          {/* Center: Main Content (50%) */}
          <div className="lg:col-span-1 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About the Doctor</h2>
              <p className="text-slate-600 leading-relaxed">{doctor.bio}</p>
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Specialties & Services</h2>
              <div className="flex flex-wrap gap-2">
                {doctor.specialties.map((spec: string, idx: number) => (
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
                {doctor.education.map((edu: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-teal-500 rounded-full mt-1.5"></div>
                      {idx !== doctor.education.length - 1 && <div className="w-0.5 h-full bg-slate-200 mt-2"></div>}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{edu.degree}</h4>
                      <p className="text-sm text-slate-500">{edu.institution}</p>
                      <span className="text-xs font-bold text-slate-400 mt-1 block">{edu.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar (25%) */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-[100px]">
            
            {/* Location Card */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
              <div className="w-full h-48 bg-slate-100 relative">
                <iframe 
                  src={doctor.clinic.mapUrl} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{doctor.clinic.name}</h3>
                <div className="space-y-4 mt-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <p className="text-sm text-slate-600 leading-relaxed">{doctor.clinic.address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    <p className="text-sm text-slate-900 font-semibold">{doctor.clinic.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                    <p className="text-sm text-teal-600 hover:underline cursor-pointer">{doctor.clinic.website}</p>
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
                {doctor.hours.map((h: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <span className="text-slate-500 font-medium">{h.day}</span>
                    <span className={`font-semibold ${h.time === 'Closed' ? 'text-red-500' : 'text-slate-900'}`}>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Doctors */}
            {similarDoctors.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  Similar {doctor.specialty}s
                </h3>
                <div className="flex flex-col gap-4">
                  {similarDoctors.map((sim, idx) => (
                    <Link key={idx} href={`/doctors/${sim.id}`} className="bg-slate-50 hover:bg-teal-50 rounded-xl p-3 flex items-center gap-3 group transition-colors border border-slate-100 hover:border-teal-100">
                      <img src={sim.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(sim.name || "Doc")}&background=0f766e&color=fff`} alt={sim.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-teal-700 transition-colors">{sim.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] font-bold text-yellow-600">⭐ {sim.rating || 4.5}</span>
                          <span className="text-[10px] font-bold text-slate-400">({sim.reviews || 0})</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
          </div>

        </div>
      </div>
    </div>
  );
}
