"use client";

import React from "react";
import Link from "next/link";
import SquareTicket from "../components/SquareTicket";
import WideTicket from "../components/WideTicket";
import AdBanner from "../components/AdBanner";
import V2Hero from "../components/V2Hero";

// Dummy data using actual database schema (pharmacyType)
const MOCK_PHARMACIES = [
  { id: 1, name: "Sun Pharma", location: "Mumbai, India", rating: "4.9", pharmacyType: "Pharma Manufacturer", icon: "🏭" },
  { id: 2, name: "Apollo Pharmacy Distributor", location: "Bhubaneswar", rating: "4.8", pharmacyType: "Company Distributor / Franchise", icon: "🏢" },
  { id: 3, name: "Cuttack Medico Wholesale", location: "Cuttack, Odisha", rating: "4.7", pharmacyType: "Wholesaler", icon: "📦" },
  { id: 4, name: "City Pharmacy", location: "Puri, Odisha", rating: "4.6", pharmacyType: "Retail Store", icon: "💊" },
  { id: 5, name: "Sanjivani Medicals", location: "Bhubaneswar, Odisha", rating: "4.5", pharmacyType: "Retail Store", icon: "💊" },
];

export default function PharmaciesDirectory() {
  
  const groupA = MOCK_PHARMACIES.filter(p => ["Pharma Manufacturer", "Company Distributor / Franchise", "Wholesale Pharmacy", "24/7 Medical Store"].includes(p.pharmacyType));
  const groupB = MOCK_PHARMACIES.filter(p => ["Wholesaler"].includes(p.pharmacyType));
  const groupC = MOCK_PHARMACIES.filter(p => ["Retail Store", "Retail Pharmacy", "Ayurvedic Pharmacy"].includes(p.pharmacyType));

  const renderGridWithAds = (pharmacies: typeof MOCK_PHARMACIES, useWideTickets = false) => {
    const items = [];
    
    for (let i = 0; i < pharmacies.length; i++) {
      const p = pharmacies[i];
      if (i > 0 && i % 4 === 0) {
        items.push(
          <div key={`ad-${i}`} className="col-span-1 sm:col-span-2 lg:col-span-3 w-full">
            <AdBanner type="display" size="horizontal" />
          </div>
        );
      }

      items.push(
        useWideTickets ? (
          <div key={p.id} className="col-span-1 sm:col-span-2 lg:col-span-3 w-full">
             <WideTicket 
                title={p.name}
                subtitle={p.pharmacyType}
                rating={p.rating}
                icon={p.icon}
                href={`/v2/pharmacy/${p.id}`}
                actionText="View Details"
                stats="B2B • Bulk Orders"
             />
          </div>
        ) : (
          <div key={p.id} className="w-full">
            <SquareTicket 
              title={p.name}
              subtitle={p.pharmacyType}
              rating={p.rating}
              icon={p.icon}
              href={`/v2/pharmacy/${p.id}`}
              actionText="View Store"
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
        titleStart="Pharmacy"
        highlight="Directory"
        subtitle="Discover retail chemists, wholesale distributors, and pharma manufacturers."
        showSearch={true}
        desktopBgImage="/v2/pc-pharmaces.png"
        mobileBgImage="/v2/phone-pharmaces.png"
      />

      <div className="w-full flex justify-center px-4 mt-6 mb-12">
        <Link href="/v2/search?type=pharmacy" className="text-blue-600 font-bold hover:underline bg-white/40 px-4 py-2 rounded-full border border-white/50 backdrop-blur-md shadow-sm">
           📍 View Pharmacies in Odisha →
        </Link>
      </div>

      {/* Row 1: Enterprise */}
      {groupA.length > 0 && (
        <section className="w-full px-4 mb-16">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
            <h2 className="text-3xl font-black text-[#0a2540]">Manufacturers & Distributors</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group A</span>
          </div>
          {renderGridWithAds(groupA, true)}
        </section>
      )}

      {/* Row 2: B2B Wholesale */}
      {groupB.length > 0 && (
        <section className="w-full px-4 mb-16">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
            <h2 className="text-3xl font-black text-[#0a2540]">B2B Wholesalers</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group B</span>
          </div>
          {renderGridWithAds(groupB)}
        </section>
      )}

      {/* Row 3: B2C Retail */}
      {groupC.length > 0 && (
        <section className="w-full px-4 mb-16">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
            <h2 className="text-3xl font-black text-[#0a2540]">Retail Pharmacies</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group C</span>
          </div>
          {renderGridWithAds(groupC)}
        </section>
      )}

    </div>
  );
}
