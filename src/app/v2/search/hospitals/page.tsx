"use client";

import React from "react";
import Link from "next/link";
import SquareTicket from "../../components/SquareTicket";
import WideTicket from "../../components/WideTicket";
import AdBanner from "../../components/AdBanner";
import V2Hero from "../../components/V2Hero";

// Dummy data using actual database schema (facilityType)
const MOCK_HOSPITALS = [
  { id: 1, name: "Apollo Hospitals", location: "Bhubaneswar, Odisha", rating: "4.9", facilityType: "Corporate Hospital", icon: "🏥" },
  { id: 2, name: "Kalinga Institute of Medical Sciences (KIMS)", location: "Bhubaneswar, Odisha", rating: "4.8", facilityType: "Corporate Hospital", icon: "🏥" },
  { id: 3, name: "Care Hospitals", location: "Bhubaneswar, Odisha", rating: "4.7", facilityType: "Corporate Hospital", icon: "🏥" },
  
  { id: 4, name: "Sum Hospital", location: "Bhubaneswar, Odisha", rating: "4.8", facilityType: "Multispecialty Hospital", icon: "🏥" }, // Legacy compatibility
  
  { id: 5, name: "Sparsh Maternity & Nursing Home", location: "Cuttack, Odisha", rating: "4.8", facilityType: "Nursing Home", icon: "🏥" },
  { id: 6, name: "Kar Clinic", location: "Bhubaneswar, Odisha", rating: "4.6", facilityType: "Maternity Home", icon: "🏥" },
  { id: 7, name: "LV Prasad Eye Institute", location: "Bhubaneswar, Odisha", rating: "4.9", facilityType: "Surgical Center", icon: "🏥" },
  
  { id: 8, name: "Capital Hospital", location: "Bhubaneswar, Odisha", rating: "4.5", facilityType: "Government Hospital", icon: "🏥" }, // Legacy
  { id: 9, name: "City Poly-Clinic", location: "Cuttack, Odisha", rating: "4.3", facilityType: "Poly-Clinic", icon: "🏥" },
  { id: 10, name: "Health Plus Clinic", location: "Bhubaneswar, Odisha", rating: "4.4", facilityType: "Clinic", icon: "🏥" },
];

export default function HospitalsDirectory() {
  
  const groupA = MOCK_HOSPITALS.filter(h => ["Corporate Hospital", "Multispecialty Hospital", "Cancer Hospital"].includes(h.facilityType));
  const groupB = MOCK_HOSPITALS.filter(h => ["Nursing Home", "Maternity Home", "Surgical Center", "Children's Hospital", "Eye Hospital"].includes(h.facilityType));
  const groupC = MOCK_HOSPITALS.filter(h => ["Clinic", "Poly-Clinic", "Government Hospital", "General Hospital", "Ayurvedic Hospital", "Homeopathic Hospital"].includes(h.facilityType));

  // The universal algorithmic grid renderer with Ad Injection
  const renderGridWithAds = (hospitals: typeof MOCK_HOSPITALS, useWideTickets = false) => {
    const items = [];
    
    for (let i = 0; i < hospitals.length; i++) {
      const h = hospitals[i];
      
      // Every 4th slot, inject an Ad Banner BEFORE the ticket
      if (i > 0 && i % 4 === 0) {
        items.push(
          <div key={`ad-${i}`} className="col-span-1 sm:col-span-2 lg:col-span-3 w-full">
            <AdBanner type="display" size="horizontal" />
          </div>
        );
      }

      items.push(
        useWideTickets ? (
          <div key={h.id} className="col-span-1 sm:col-span-2 lg:col-span-3 w-full">
             <WideTicket 
                title={h.name}
                subtitle={h.facilityType}
                rating={h.rating}
                icon={h.icon}
                href={`/v2/hospital/${h.id}`}
                actionText="View Hospital"
                stats="500+ Beds • 24/7 ICU"
             />
          </div>
        ) : (
          <div key={h.id} className="w-full">
            <SquareTicket 
              title={h.name}
              subtitle={h.facilityType}
              rating={h.rating}
              icon={h.icon}
              href={`/v2/hospital/${h.id}`}
              actionText="View Hospital"
            />
          </div>
        )
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
        {items}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center pb-20 relative z-10">
      
      {/* --- HERO SECTION --- */}
      <V2Hero 
        titleStart="Hospital"
        highlight="Directory"
        subtitle="Find top-rated corporate hospitals, nursing homes, and specialized surgical centers."
        showSearch={true}
        desktopBgImage="/v2/pc-hospital.png"
        mobileBgImage="/v2/phone-hospital.png"
      />

      <div className="w-full flex justify-center px-4 mt-6 mb-12">
        <Link href="/v2/search?type=hospital" className="text-blue-600 font-bold hover:underline bg-white/40 px-4 py-2 rounded-full border border-white/50 backdrop-blur-md shadow-sm">
           📍 View Hospitals in Odisha →
        </Link>
      </div>

      {/* Row 1: Corporate & Multi-Specialty */}
      {groupA.length > 0 && (
        <section className="w-full px-4 mb-16">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
            <h2 className="text-3xl font-black text-[#0a2540]">Corporate & Multi-Specialty</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group A</span>
          </div>
          {renderGridWithAds(groupA, true)}
        </section>
      )}

      {/* Row 2: Nursing Homes & Specialized */}
      {groupB.length > 0 && (
        <section className="w-full px-4 mb-16">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
            <h2 className="text-3xl font-black text-[#0a2540]">Nursing Homes & Specialized</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group B</span>
          </div>
          {renderGridWithAds(groupB)}
        </section>
      )}

      {/* Row 3: Clinics & Public Health */}
      {groupC.length > 0 && (
        <section className="w-full px-4 mb-16">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
            <h2 className="text-3xl font-black text-[#0a2540]">Clinics & Public Health</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group C</span>
          </div>
          {renderGridWithAds(groupC)}
        </section>
      )}

    </div>
  );
}
