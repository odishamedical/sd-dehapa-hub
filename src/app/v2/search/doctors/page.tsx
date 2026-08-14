"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import SquareTicket from "../components/SquareTicket";
import PortraitTicket from "../components/PortraitTicket";
import AdBanner from "../components/AdBanner";
import V2Hero from "../components/V2Hero";
import { getTaxonomyGroup } from "../../../data/taxonomy";

// Dummy data to simulate the massive SEO database
const MOCK_DOCTORS = [
  { id: "1", name: "Dr. Sarah Jenkins", specialty: "Cardiology", rating: "4.9", isFeatured: true, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=600" },
  { id: "2", name: "Dr. Rahul Sharma", specialty: "Neurology", rating: "4.8", isFeatured: false },
  { id: "3", name: "Dr. Priya Patel", specialty: "Dermatology", rating: "5.0", isFeatured: false },
  { id: "4", name: "Dr. Amit Kumar", specialty: "Pediatrics", rating: "4.7", isFeatured: false },
  { id: "5", name: "Dr. Anil Desai", specialty: "General Physician", rating: "4.5", isFeatured: false },
  { id: "6", name: "Dr. Sunita Rao", specialty: "MBBS", rating: "4.6", isFeatured: false },
  { id: "7", name: "Dr. Vikas Singh", specialty: "Orthopedic", rating: "4.9", isFeatured: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=600" },
  { id: "8", name: "Dr. Neha Gupta", specialty: "Gynecology", rating: "4.8", isFeatured: false },
  { id: "9", name: "Dr. Rohan Mehta", specialty: "Plastic Surgery", rating: "4.7", isFeatured: false },
  { id: "10", name: "Dr. Aditi Verma", specialty: "AYUSH", rating: "4.9", isFeatured: false },
];

export default function DoctorsDirectoryHub() {
  
  // Dynamically bucket the doctors into the 3 SEO Taxonomy groups
  const { general, specialists, superSpecialists } = useMemo(() => {
    const buckets = { general: [], specialists: [], superSpecialists: [] };
    
    MOCK_DOCTORS.forEach(doc => {
      const group = getTaxonomyGroup(doc.specialty);
      if (group === "GENERAL") buckets.general.push(doc);
      else if (group === "SPECIALIST") buckets.specialists.push(doc);
      else buckets.superSpecialists.push(doc);
    });
    
    return buckets;
  }, []);

  // Reusable render function for a Ticket Grid with Ad Injection
  const renderGridWithAds = (doctorsList: any[]) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {doctorsList.map((doc, index) => {
          
          // Ad Injection Algorithm: Insert a massive Ad banner every 4 items
          const injectAd = index > 0 && index % 4 === 0;

          return (
            <React.Fragment key={doc.id}>
              {injectAd && (
                 <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
                    <AdBanner type="adsense" client="ca-pub-12345678" slot="87654321" />
                 </div>
              )}
              
              {/* If Featured, render the tall Portrait Ticket, else Square */}
              <div className={doc.isFeatured ? "row-span-2 col-span-1" : "col-span-1"}>
                 {doc.isFeatured ? (
                    <PortraitTicket 
                      title={doc.name} 
                      subtitle={doc.specialty} 
                      rating={doc.rating} 
                      imageSrc={doc.image || ""} 
                      href={`/v2/doctor/${doc.id}`} 
                      actionText="Book Consultation" 
                    />
                 ) : (
                    <SquareTicket 
                      title={doc.name} 
                      subtitle={doc.specialty} 
                      rating={doc.rating} 
                      icon="👨‍⚕️" 
                      href={`/v2/doctor/${doc.id}`} 
                      actionText="View Profile" 
                    />
                 )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center pb-20 relative z-10">
      
      {/* --- HERO SECTION --- */}
      <V2Hero 
        titleStart="Find Top"
        highlight="Doctors"
        titleEnd="Near You"
        subtitle="Book appointments with trusted specialists, available for in-clinic visits and telemedicine."
        showSearch={true}
        desktopBgImage="/v2/pc-doctor.png"
        mobileBgImage="/v2/phone-doctor.png"
      />

      <div className="w-full flex justify-center px-4 mt-6 mb-12">
        <Link href="/v2/doctors/india/odisha" className="text-blue-600 font-bold hover:underline bg-white/40 px-4 py-2 rounded-full border border-white/50 backdrop-blur-md shadow-sm">
           📍 View Doctors in Odisha →
        </Link>
      </div>

      {/* Row 1: Super Specialists */}
      <section className="w-full max-w-7xl mb-16">
        <div className="mb-6 flex justify-between items-end border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">Super Specialists</h2>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-white/30 px-3 py-1 rounded-full">Group C</span>
        </div>
        {renderGridWithAds(superSpecialists)}
      </section>

      {/* Row 2: Specialists */}
      <section className="w-full max-w-7xl mb-16">
        <div className="mb-6 flex justify-between items-end border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">Specialists</h2>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-white/30 px-3 py-1 rounded-full">Group B</span>
        </div>
        {renderGridWithAds(specialists)}
      </section>

      {/* Row 3: General Practitioners */}
      <section className="w-full max-w-7xl mb-16">
        <div className="mb-6 flex justify-between items-end border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">General Practitioners</h2>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-white/30 px-3 py-1 rounded-full">Group A</span>
        </div>
        {renderGridWithAds(general)}
      </section>

    </div>
  );
}
