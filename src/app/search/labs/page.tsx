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

export default function LabsDirectory() {
  const [liveLabs, setLiveLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const q = query(collection(db, 'directory'));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const mappedData = docsData
          .filter((d: any) => {
            const isLabType = ["lab", "diagnostic", "pathology", "blood bank", "imaging"].includes(d.category?.toLowerCase()) || ["lab", "diagnostic"].includes(d.role?.toLowerCase());
            const isLive = d.isPublic === true || d.isPublished === true || (d.isPublished !== false && d.adminLocked !== true && d.isPublic !== false);
            return isLabType && isLive;
          })
          .map((d: any) => ({
            id: d.id,
            name: d.name || d.clinicName || "Unknown Lab",
            labType: d.subCategory || d.category || "Diagnostic Center",
            rating: d.rating || "New",
            icon: "🔬",
            isFeatured: d.verified || d.tier === "premium"
          }));

        setLiveLabs(mappedData);
      } catch (err) {
        console.error("Error fetching labs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, []);
  
  const groupA = liveLabs.filter(l => ["Integrated Diagnostics", "Radiology & Imaging", "Diagnostic Center", "Lab", "Diagnostic"].includes(l.labType));
  const groupB = liveLabs.filter(l => ["Pathology", "Pathology Lab"].includes(l.labType));
  const groupC = liveLabs.filter(l => ["Blood Bank"].includes(l.labType));

  const renderGridWithAds = (labs: any[], useWideTickets = false) => {
    if (loading) {
      return (
        <div className="w-full py-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }
    
    if (labs.length === 0) {
      return (
        <div className="w-full py-12 flex flex-col justify-center items-center bg-white/30 backdrop-blur-md rounded-3xl border border-white/50">
          <p className="text-slate-500 font-medium">No labs found in this category.</p>
        </div>
      );
    }

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
                href={`/lab/${l.id}`}
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
              href={`/lab/${l.id}`}
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
        desktopBgImage="/pc-lab.png"
        mobileBgImage="/phone-lab.png"
      />

      <div className="w-full flex justify-center px-4 mt-6 mb-12">
        <Link href="/search?type=lab" className="text-blue-600 font-bold hover:underline bg-white/40 px-4 py-2 rounded-full border border-white/50 backdrop-blur-md shadow-sm">
           📍 View Labs in Odisha →
        </Link>
      </div>

      {/* Row 1: Advanced Diagnostics */}
      <section className="w-full px-4 mb-16">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540]">Advanced Diagnostics & Imaging</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group A</span>
        </div>
        {renderGridWithAds(groupA, true)}
      </section>

      {/* Row 2: Standard Pathology */}
      <section className="w-full px-4 mb-16">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540]">Pathology & Blood Tests</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group B</span>
        </div>
        {renderGridWithAds(groupB)}
      </section>

      {/* Row 3: Support */}
      <section className="w-full px-4 mb-16">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-end mb-6 border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540]">Blood Banks & Support</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md shadow-sm">Group C</span>
        </div>
        {renderGridWithAds(groupC)}
      </section>

    </div>
  );
}
