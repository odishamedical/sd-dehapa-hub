"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SquareTicket from "@/components/v2/SquareTicket";
import WideTicket from "@/components/v2/WideTicket";
import AdBanner from "@/components/v2/AdBanner";
import V2Hero from "@/components/v2/V2Hero";
import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export default function PharmaciesDirectory() {
  const [livePharmacies, setLivePharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const q = query(collection(db, 'directory'));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const mappedData = docsData
          .filter((d: any) => {
            const isPharmacyType = ["pharmacy", "medical store", "chemist"].includes(d.category?.toLowerCase()) || ["pharmacy", "chemist"].includes(d.role?.toLowerCase());
            const isLive = d.isPublic === true || d.isPublished === true || (d.isPublished !== false && d.adminLocked !== true && d.isPublic !== false);
            return isPharmacyType && isLive;
          })
          .map((d: any) => ({
            id: d.id,
            name: d.name || d.clinicName || "Unknown Pharmacy",
            pharmacyType: d.subCategory || d.category || "Retail Store",
            rating: d.rating || "New",
            icon: "💊",
            isFeatured: d.verified || d.tier === "premium"
          }));

        setLivePharmacies(mappedData);
      } catch (err) {
        console.error("Error fetching pharmacies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);
  
  const groupA = livePharmacies.filter(p => ["Pharma Manufacturer", "Company Distributor / Franchise", "Wholesale Pharmacy", "24/7 Medical Store"].includes(p.pharmacyType));
  const groupB = livePharmacies.filter(p => ["Wholesaler", "Distributor"].includes(p.pharmacyType));
  const groupC = livePharmacies.filter(p => ["Retail Store", "Retail Pharmacy", "Ayurvedic Pharmacy", "Pharmacy", "Medical Store"].includes(p.pharmacyType));

  const renderGridWithAds = (pharmacies: any[], useWideTickets = false) => {
    if (loading) {
      return (
        <div className="w-full py-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }
    
    if (pharmacies.length === 0) {
      return (
        <div className="w-full py-12 flex flex-col justify-center items-center bg-white/30 backdrop-blur-md rounded-3xl border border-white/50">
          <p className="text-slate-500 font-medium">No pharmacies found in this category.</p>
        </div>
      );
    }

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
        desktopBgImage="/pc-pharmaces.png"
        mobileBgImage="/phone-pharmaces.png"
      />

      <div className="w-full flex justify-center px-4 mt-6 mb-12">
        <Link href="/search?type=pharmacy" className="text-blue-600 font-bold hover:underline bg-white/40 px-4 py-2 rounded-full border border-white/50 backdrop-blur-md shadow-sm">
           📍 View Pharmacies in Odisha →
        </Link>
      </div>

      {/* Row 1: Enterprise */}
      <section className="w-full px-4 mb-16">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540]">Manufacturers & Distributors</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group A</span>
        </div>
        {renderGridWithAds(groupA, true)}
      </section>

      {/* Row 2: B2B Wholesale */}
      <section className="w-full px-4 mb-16">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540]">B2B Wholesalers</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group B</span>
        </div>
        {renderGridWithAds(groupB)}
      </section>

      {/* Row 3: B2C Retail */}
      <section className="w-full px-4 mb-16">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540]">Retail Pharmacies</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group C</span>
        </div>
        {renderGridWithAds(groupC)}
      </section>

    </div>
  );
}
