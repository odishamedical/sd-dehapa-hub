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

export default function HospitalsDirectory() {
  const [liveHospitals, setLiveHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const q = query(collection(db, 'directory'));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const mappedData = docsData
          .filter((d: any) => {
            const isHospitalType = ["hospital", "clinic", "nursing home", "maternity", "health center"].includes(d.category?.toLowerCase()) || ["hospital", "clinic"].includes(d.role?.toLowerCase());
            const isLive = d.isPublic === true || d.isPublished === true || (d.isPublished !== false && d.adminLocked !== true && d.isPublic !== false);
            return isHospitalType && isLive;
          })
          .map((d: any) => ({
            id: d.id,
            name: d.name || d.clinicName || "Unknown Hospital",
            facilityType: d.subCategory || d.category || "Hospital",
            rating: d.rating || "New",
            icon: "🏥",
            isFeatured: d.verified || d.tier === "premium"
          }));

        setLiveHospitals(mappedData);
      } catch (err) {
        console.error("Error fetching hospitals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);
  
  const groupA = liveHospitals.filter(h => ["Corporate Hospital", "Multispecialty Hospital", "Cancer Hospital", "Hospital"].includes(h.facilityType));
  const groupB = liveHospitals.filter(h => ["Nursing Home", "Maternity Home", "Surgical Center", "Children's Hospital", "Eye Hospital"].includes(h.facilityType));
  const groupC = liveHospitals.filter(h => ["Clinic", "Poly-Clinic", "Government Hospital", "General Hospital", "Ayurvedic Hospital", "Homeopathic Hospital"].includes(h.facilityType));

  // The universal algorithmic grid renderer with Ad Injection
  const renderGridWithAds = (hospitals: any[], useWideTickets = false) => {
    if (loading) {
      return (
        <div className="w-full py-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }
    
    if (hospitals.length === 0) {
      return (
        <div className="w-full py-12 flex flex-col justify-center items-center bg-white/30 backdrop-blur-md rounded-3xl border border-white/50">
          <p className="text-slate-500 font-medium">No hospitals found in this category.</p>
        </div>
      );
    }

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
                stats="Verified Facility • 24/7 Support"
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
        desktopBgImage="/pc-hospital.png"
        mobileBgImage="/phone-hospital.png"
      />

      <div className="w-full flex justify-center px-4 mt-6 mb-12">
        <Link href="/search?type=hospital" className="text-blue-600 font-bold hover:underline bg-white/40 px-4 py-2 rounded-full border border-white/50 backdrop-blur-md shadow-sm">
           📍 View Hospitals in Odisha →
        </Link>
      </div>

      {/* Row 1: Corporate & Multi-Specialty */}
      <section className="w-full px-4 mb-16">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540]">Corporate & Multi-Specialty</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group A</span>
        </div>
        {renderGridWithAds(groupA, true)}
      </section>

      {/* Row 2: Nursing Homes & Specialized */}
      <section className="w-full px-4 mb-16">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540]">Nursing Homes & Specialized</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group B</span>
        </div>
        {renderGridWithAds(groupB)}
      </section>

      {/* Row 3: Clinics & Public Health */}
      <section className="w-full px-4 mb-16">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540]">Clinics & Public Health</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group C</span>
        </div>
        {renderGridWithAds(groupC)}
      </section>

    </div>
  );
}
