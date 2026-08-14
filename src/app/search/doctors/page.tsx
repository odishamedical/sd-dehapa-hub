"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import SquareTicket from "@/components/v2/SquareTicket";
import PortraitTicket from "@/components/v2/PortraitTicket";
import AdBanner from "@/components/v2/AdBanner";
import V2Hero from "@/components/v2/V2Hero";
import { getTaxonomyGroup } from "@/data/taxonomy";
import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export default function DoctorsDirectoryHub() {
  const [liveDoctors, setLiveDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const q = query(collection(db, 'directory'));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const mappedData = docsData
          .filter((d: any) => {
            const isDocType = d.category?.toLowerCase() === "doctor" || d.role?.toLowerCase() === "doctor";
            const isLive = d.isPublic === true || d.isPublished === true || (d.isPublished !== false && d.adminLocked !== true && d.isPublic !== false);
            return isDocType && isLive;
          })
          .map((d: any) => ({
            id: d.id,
            name: d.name || "Unknown Doctor",
            specialty: d.primarySpecialty || d.subCategory || d.category || "Specialist",
            tier: d.doctorLevel || d.taxonomy || "",
            rating: d.rating || "New",
            isFeatured: d.verified || d.tier === "premium",
            image: d.image || (d.galleryImages && d.galleryImages.length > 0 ? d.galleryImages[0] : null) || (d.rawImages && d.rawImages.length > 0 ? d.rawImages[0] : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || "Doc")}&background=0a2540&color=fff&size=400`
          }));

        setLiveDoctors(mappedData);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);
  
  // Dynamically bucket the doctors into the 3 SEO Taxonomy groups
  const { general, specialists, superSpecialists } = useMemo(() => {
    const buckets = { general: [] as any[], specialists: [] as any[], superSpecialists: [] as any[] };
    
    liveDoctors.forEach(doc => {
      const tierLower = doc.tier.toLowerCase();
      
      // Trust the explicit tier from the crawler/admin first
      if (tierLower.includes("super")) {
        buckets.superSpecialists.push(doc);
      } else if (tierLower.includes("general") || tierLower.includes("ayush") || tierLower.includes("mbbs")) {
        buckets.general.push(doc);
      } else if (tierLower === "specialist" || tierLower.includes("specialist")) {
        buckets.specialists.push(doc);
      } else {
        // Fallback to text parsing if no explicit tier exists
        const group = getTaxonomyGroup(doc.specialty);
        if (group === "GENERAL") buckets.general.push(doc);
        else if (group === "SPECIALIST") buckets.specialists.push(doc);
        else buckets.superSpecialists.push(doc);
      }
    });
    
    return buckets;
  }, [liveDoctors]);

  // Reusable render function for a Ticket Grid with Ad Injection
  const renderGridWithAds = (doctorsList: any[]) => {
    if (loading) {
      return (
        <div className="w-full py-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }
    
    if (doctorsList.length === 0) {
      return (
        <div className="w-full py-12 flex flex-col justify-center items-center bg-white/30 backdrop-blur-md rounded-3xl border border-white/50">
          <p className="text-slate-500 font-medium">No doctors found in this category.</p>
        </div>
      );
    }

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
                      href={`/doctor/${doc.id}`} 
                      actionText="Book Consultation" 
                    />
                 ) : (
                    <SquareTicket 
                      title={doc.name} 
                      subtitle={doc.specialty} 
                      rating={doc.rating} 
                      icon="👨‍⚕️" 
                      imageSrc={doc.image}
                      href={`/doctor/${doc.id}`} 
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
        <Link href="/doctors/india/odisha" className="text-blue-600 font-bold hover:underline bg-white/40 px-4 py-2 rounded-full border border-white/50 backdrop-blur-md shadow-sm">
           📍 View Doctors in Odisha →
        </Link>
      </div>

      {/* Row 1: Super Specialists */}
      <section className="w-full max-w-7xl mb-16 px-4 md:px-8">
        <div className="mb-6 flex justify-between items-end border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">Super Specialists</h2>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-white/30 px-3 py-1 rounded-full">Group C</span>
        </div>
        {renderGridWithAds(superSpecialists)}
      </section>

      {/* Row 2: Specialists */}
      <section className="w-full max-w-7xl mb-16 px-4 md:px-8">
        <div className="mb-6 flex justify-between items-end border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">Specialists</h2>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-white/30 px-3 py-1 rounded-full">Group B</span>
        </div>
        {renderGridWithAds(specialists)}
      </section>

      {/* Row 3: General Practitioners */}
      <section className="w-full max-w-7xl mb-16 px-4 md:px-8">
        <div className="mb-6 flex justify-between items-end border-b border-white/40 pb-2">
          <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">General Practitioners</h2>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-white/30 px-3 py-1 rounded-full">Group A</span>
        </div>
        {renderGridWithAds(general)}
      </section>

    </div>
  );
}
