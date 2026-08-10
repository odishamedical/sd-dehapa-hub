"use client";

import React from "react";
import Link from "next/link";
import SquareTicket from "../components/SquareTicket";
import WideTicket from "../components/WideTicket";
import AdBanner from "../components/AdBanner";
import V2Hero from "../components/V2Hero";

// Dummy data using actual database schema (labType)
const MOCK_LABS = [
  { id: 1, name: "Nidan Diagnostics", location: "Bhubaneswar, Odisha", rating: "4.9", labType: "Integrated Diagnostics", icon: "🔬" },
  { id: 2, name: "SRL Diagnostics", location: "Cuttack, Odisha", rating: "4.8", labType: "Radiology & Imaging", icon: "🔬" },
  { id: 3, name: "Dr Lal PathLabs", location: "Bhubaneswar, Odisha", rating: "4.7", labType: "Pathology", icon: "🔬" },
  { id: 4, name: "City Path Lab", location: "Puri, Odisha", rating: "4.5", labType: "Pathology", icon: "🔬" },
  { id: 5, name: "Red Cross Blood Bank", location: "Bhubaneswar, Odisha", rating: "4.9", labType: "Blood Bank", icon: "🩸" },
];

export default function LabsDirectory() {
  
  const groupA = MOCK_LABS.filter(l => ["Integrated Diagnostics", "Radiology & Imaging", "Diagnostic Center"].includes(l.labType));
  const groupB = MOCK_LABS.filter(l => ["Pathology", "Pathology Lab"].includes(l.labType));
  const groupC = MOCK_LABS.filter(l => ["Blood Bank"].includes(l.labType));

  const renderGridWithAds = (labs: typeof MOCK_LABS, useWideTickets = false) => {
    const items = [];
    
    for (let i = 0; i < labs.length; i++) {
      const l = labs[i];
      if (i > 0 && i % 4 === 0) {
        items.push(
          <div key={`ad-${i}`} className="col-span-1 sm:col-span-2 lg:col-span-3 w-full">
            <AdBanner type="display" size="horizontal" />
          </div>
        );
      }

      items.push(
        useWideTickets ? (
          <div key={l.id} className="col-span-1 sm:col-span-2 lg:col-span-3 w-full">
             <WideTicket 
                title={l.name}
                subtitle={l.labType}
                rating={l.rating}
                icon={l.icon}
                href={`/v2/lab/${l.id}`}
                actionText="View Lab"
                stats="MRI • CT Scan • Ultrasound"
             />
          </div>
        ) : (
          <div key={l.id} className="w-full">
            <SquareTicket 
              title={l.name}
              subtitle={l.labType}
              rating={l.rating}
              icon={l.icon}
              href={`/v2/lab/${l.id}`}
              actionText="View Lab"
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
        titleStart="Diagnostic"
        highlight="Labs"
        subtitle="Find certified pathology labs, radiology centers, and blood banks near you."
        showSearch={true}
        desktopBgImage="https://images.unsplash.com/photo-1579154204601-e1588bc92458?auto=format&fit=crop&q=80&w=2000&h=600"
        mobileBgImage="https://images.unsplash.com/photo-1579154204601-e1588bc92458?auto=format&fit=crop&q=80&w=800&h=800"
      />

      <div className="w-full flex justify-center px-4 mt-6 mb-12">
        <Link href="/v2/search?type=lab" className="text-blue-600 font-bold hover:underline bg-white/40 px-4 py-2 rounded-full border border-white/50 backdrop-blur-md shadow-sm">
           📍 View Labs in Odisha →
        </Link>
      </div>

      {/* Row 1: Advanced Diagnostics */}
      {groupA.length > 0 && (
        <section className="w-full px-4 mb-16">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
            <h2 className="text-3xl font-black text-[#0a2540]">Advanced Diagnostics & Imaging</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group A</span>
          </div>
          {renderGridWithAds(groupA, true)}
        </section>
      )}

      {/* Row 2: Standard Pathology */}
      {groupB.length > 0 && (
        <section className="w-full px-4 mb-16">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
            <h2 className="text-3xl font-black text-[#0a2540]">Pathology & Blood Tests</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group B</span>
          </div>
          {renderGridWithAds(groupB)}
        </section>
      )}

      {/* Row 3: Support */}
      {groupC.length > 0 && (
        <section className="w-full px-4 mb-16">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
            <h2 className="text-3xl font-black text-[#0a2540]">Blood Banks & Support</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group C</span>
          </div>
          {renderGridWithAds(groupC)}
        </section>
      )}

    </div>
  );
}
