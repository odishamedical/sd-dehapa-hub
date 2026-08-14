"use client";

import React from "react";
import Link from "next/link";
import SquareTicket from "../components/SquareTicket";
import WideTicket from "../components/WideTicket";
import AdBanner from "../components/AdBanner";
import V2Hero from "../components/V2Hero";

// Dummy data using actual database schema (lifeSupportLevel)
const MOCK_AMBULANCES = [
  { id: 1, name: "Ziqitza Health Care", location: "Bhubaneswar", rating: "4.8", lifeSupportLevel: "ALS", icon: "🚑" },
  { id: 2, name: "City Rescue Services", location: "Cuttack, Odisha", rating: "4.9", lifeSupportLevel: "ALS", icon: "🚑" },
  { id: 3, name: "Odisha Emergency 108", location: "Statewide", rating: "4.7", lifeSupportLevel: "BLS", icon: "🚑" },
  { id: 4, name: "Hope Ambulance", location: "Puri, Odisha", rating: "4.5", lifeSupportLevel: "BLS", icon: "🚑" },
  { id: 5, name: "Shanti Mortuary Van", location: "Bhubaneswar", rating: "4.6", lifeSupportLevel: "Patient Transport", icon: "🚐" },
];

export default function AmbulancesDirectory() {
  
  const groupA = MOCK_AMBULANCES.filter(a => ["ALS", "ALS / Mobile ICU"].includes(a.lifeSupportLevel));
  const groupB = MOCK_AMBULANCES.filter(a => ["BLS", "BLS / Oxygen"].includes(a.lifeSupportLevel));
  const groupC = MOCK_AMBULANCES.filter(a => ["Patient Transport", "Hearse"].includes(a.lifeSupportLevel));

  const renderGridWithAds = (ambulances: typeof MOCK_AMBULANCES, useWideTickets = false) => {
    const items = [];
    
    for (let i = 0; i < ambulances.length; i++) {
      const a = ambulances[i];
      if (i > 0 && i % 4 === 0) {
        items.push(
          <div key={`ad-${i}`} className="col-span-1 sm:col-span-2 lg:col-span-3 w-full">
            <AdBanner type="display" size="horizontal" />
          </div>
        );
      }

      items.push(
        useWideTickets ? (
          <div key={a.id} className="col-span-1 sm:col-span-2 lg:col-span-3 w-full">
             <WideTicket 
                title={a.name}
                subtitle={`${a.lifeSupportLevel} Ambulance`}
                rating={a.rating}
                icon={a.icon}
                href={`/v2/ambulance/${a.id}`}
                actionText="View Fleet"
                stats="ICU Setup • 24/7"
             />
          </div>
        ) : (
          <div key={a.id} className="w-full">
            <SquareTicket 
              title={a.name}
              subtitle={`${a.lifeSupportLevel} Ambulance`}
              rating={a.rating}
              icon={a.icon}
              href={`/v2/ambulance/${a.id}`}
              actionText="View Details"
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
      
      <V2Hero 
        titleStart="Ambulance"
        highlight="Services"
        subtitle="Find rapid response ICU ambulances and patient transport vehicles."
        showSearch={true}
        desktopBgImage="/v2/pc-ambulance.png"
        mobileBgImage="/v2/phone-ambulance.png"
      />

      <div className="w-full flex justify-center px-4 mt-6 mb-12">
        <Link href="/v2/search?type=ambulance" className="text-blue-600 font-bold hover:underline bg-white/40 px-4 py-2 rounded-full border border-white/50 backdrop-blur-md shadow-sm">
           📍 View Ambulances in Odisha →
        </Link>
      </div>

      {/* Row 1: ALS */}
      {groupA.length > 0 && (
        <section className="w-full px-4 mb-16">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
            <h2 className="text-3xl font-black text-[#0a2540]">Advanced Life Support (ALS)</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group A</span>
          </div>
          {renderGridWithAds(groupA, true)}
        </section>
      )}

      {/* Row 2: BLS */}
      {groupB.length > 0 && (
        <section className="w-full px-4 mb-16">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
            <h2 className="text-3xl font-black text-[#0a2540]">Basic Life Support (BLS)</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group B</span>
          </div>
          {renderGridWithAds(groupB)}
        </section>
      )}

      {/* Row 3: Transport */}
      {groupC.length > 0 && (
        <section className="w-full px-4 mb-16">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
            <h2 className="text-3xl font-black text-[#0a2540]">Patient Transport Vehicles</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group C</span>
          </div>
          {renderGridWithAds(groupC)}
        </section>
      )}

    </div>
  );
}
