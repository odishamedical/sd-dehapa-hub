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

export default function AmbulancesDirectory() {
  const [liveAmbulances, setLiveAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        const q = query(collection(db, 'directory'));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const mappedData = docsData
          .filter((d: any) => {
            const isAmbulanceType = ["ambulance", "emergency", "medical transport"].includes(d.category?.toLowerCase()) || ["ambulance", "emergency"].includes(d.role?.toLowerCase());
            const isLive = d.isPublic === true || d.isPublished === true || (d.isPublished !== false && d.adminLocked !== true && d.isPublic !== false);
            return isAmbulanceType && isLive;
          })
          .map((d: any) => ({
            id: d.id,
            name: d.name || d.clinicName || "Unknown Ambulance Service",
            lifeSupportLevel: d.subCategory || d.category || "BLS",
            rating: d.rating || "New",
            icon: "🚑",
            isFeatured: d.verified || d.tier === "premium"
          }));

        setLiveAmbulances(mappedData);
      } catch (err) {
        console.error("Error fetching ambulances:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAmbulances();
  }, []);
  
  const groupA = liveAmbulances.filter(a => ["ALS", "ALS / Mobile ICU", "Advanced Life Support"].includes(a.lifeSupportLevel));
  const groupB = liveAmbulances.filter(a => ["BLS", "BLS / Oxygen", "Basic Life Support"].includes(a.lifeSupportLevel));
  const groupC = liveAmbulances.filter(a => ["Patient Transport", "Hearse", "Ambulance", "Transport"].includes(a.lifeSupportLevel));

  const renderGridWithAds = (ambulances: any[], useWideTickets = false) => {
    if (loading) {
      return (
        <div className="w-full py-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }
    
    if (ambulances.length === 0) {
      return (
        <div className="w-full py-12 flex flex-col justify-center items-center bg-white/30 backdrop-blur-md rounded-3xl border border-white/50">
          <p className="text-slate-500 font-medium">No ambulances found in this category.</p>
        </div>
      );
    }

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
                href={`/ambulance/${a.id}`}
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
              href={`/ambulance/${a.id}`}
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
        <Link href="/search?type=ambulance" className="text-blue-600 font-bold hover:underline bg-white/40 px-4 py-2 rounded-full border border-white/50 backdrop-blur-md shadow-sm">
           📍 View Ambulances in Odisha →
        </Link>
      </div>

      {/* Row 1: ALS */}
      <section className="w-full px-4 mb-16">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540]">Advanced Life Support (ALS)</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group A</span>
        </div>
        {renderGridWithAds(groupA, true)}
      </section>

      {/* Row 2: BLS */}
      <section className="w-full px-4 mb-16">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540]">Basic Life Support (BLS)</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group B</span>
        </div>
        {renderGridWithAds(groupB)}
      </section>

      {/* Row 3: Transport */}
      <section className="w-full px-4 mb-16">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540]">Patient Transport Vehicles</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group C</span>
        </div>
        {renderGridWithAds(groupC)}
      </section>

    </div>
  );
}
