"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Video, Building2, Pill, TestTube2, Calendar } from "lucide-react";
import SquareTicket from "@/components/v2/SquareTicket";
import WideTicket from "@/components/v2/WideTicket";
import PortraitTicket from "@/components/v2/PortraitTicket";
import V2Hero from "@/components/v2/V2Hero";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, limit as fLimit, getDocs, documentId } from "firebase/firestore";

interface EntityData {
  id: string;
  name: string;
  subtitle: string;
  rating: string;
  icon: string;
  imageSrc?: string;
  href: string;
  stats?: string;
  actionText: string;
}

export default function V2GlassHomepage() {
  const [layout, setLayout] = useState<any>(null);
  const [rowEntities, setRowEntities] = useState<Record<string, EntityData[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLayoutAndData = async () => {
      setLoading(true);
      try {
        const layoutRef = doc(db, 'page_layouts', 'home');
        const layoutSnap = await getDoc(layoutRef);
        
        let layoutData: any;
        if (layoutSnap.exists()) {
          layoutData = layoutSnap.data();
        } else {
          // Fallback if no layout is configured yet
          setLoading(false);
          return;
        }

        setLayout(layoutData);
        
        // Fetch entities for each row
        const fetchedEntities: Record<string, EntityData[]> = {};
        const directoryRef = collection(db, 'directory');

        for (const row of layoutData.rows || []) {
          if (!row.visible || row.type === 'ad-injection' || row.type.startsWith('how-it-works') || row.type === 'quick-services-slider') continue;
          
          let q;
          if (row.populationType === 'manual' && row.pinnedEntityIds?.length > 0) {
             // Fetch by pinned IDs in batches of 10 max
             const batchIds = row.pinnedEntityIds.slice(0, 10);
             q = query(directoryRef, where(documentId(), 'in', batchIds));
          } else if (row.populationType === 'dynamic' && row.dynamicRules) {
             // Dynamic Query
             q = query(directoryRef, where('category', '==', row.dynamicRules.category || 'Doctor'), fLimit(row.dynamicRules.limit || 4));
             // Note: More complex rules (location, sortBy) require composite indexes in Firestore
          }

          if (q) {
            const snap = await getDocs(q);
            const entities = snap.docs.map(d => {
              const data = d.data();
              const cat = data.category?.toLowerCase() || 'doctor';
              const name = data.name || data.legalName || data.basicInfo?.fullName || data.firstName || "Unknown Entity";
              let subtitle = data.subCategory || data.specialty || data.basicInfo?.specialityName || "Service Provider";
              let icon = cat === 'hospital' ? '🏥' : cat === 'pharmacy' ? '💊' : cat === 'lab' ? '🔬' : cat === 'ambulance' ? '🚑' : '👨‍⚕️';
              let href = `/${cat}/${d.id}`;
              
              if (cat === 'doctor' && data.primarySpecialty) subtitle = data.primarySpecialty;

              return {
                id: d.id,
                name: name,
                subtitle: subtitle,
                rating: (data.rating || "4.8").toString(),
                icon: icon,
                imageSrc: data.image || data.basicInfo?.profilePicture || data.galleryImages?.[0],
                href: href,
                stats: cat === 'hospital' ? `${data.facilityType || 'Multi-Specialty'} • ${data.city}` : undefined,
                actionText: cat === 'hospital' ? "View Services" : cat === 'pharmacy' ? "Order Meds" : cat === 'lab' ? "Book Test" : cat === 'ambulance' ? "Call Now" : "Book Now"
              };
            });
            
            // If manual, sort them by the exact order of pinnedEntityIds
            if (row.populationType === 'manual' && row.pinnedEntityIds?.length > 0) {
               entities.sort((a, b) => row.pinnedEntityIds.indexOf(a.id) - row.pinnedEntityIds.indexOf(b.id));
            }
            fetchedEntities[row.id] = entities;
          }
        }
        
        setRowEntities(fetchedEntities);

      } catch (err) {
        console.error("Error fetching homepage layout:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLayoutAndData();
  }, []);

  const renderRowContent = (row: any) => {
    const entities = rowEntities[row.id] || [];

    switch (row.type) {
      case 'quick-services-slider':
        return (
          <section key={row.id} className="relative z-10 w-full px-4 md:px-8 pb-6 pt-2 max-w-7xl mx-auto">
            <div className="flex overflow-x-auto lg:grid lg:grid-cols-6 gap-4 w-full pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 md:mx-0 md:px-0">
              <Link href="/search/doctors?mode=instant" className="min-w-[150px] lg:min-w-0 snap-center group flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-blue-400 rounded-3xl p-6 shadow-[0_8px_30px_-10px_rgba(0,20,60,0.1)] transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-3">
                  <Video className="w-7 h-7" />
                </div>
                <span className="font-bold text-[#0a2540] text-center text-sm group-hover:text-blue-600 transition-colors">Instant Video Call</span>
              </Link>
              <Link href="/search/doctors?mode=schedule" className="min-w-[150px] lg:min-w-0 snap-center group flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-blue-400 rounded-3xl p-6 shadow-[0_8px_30px_-10px_rgba(0,20,60,0.1)] transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-3">
                  <Calendar className="w-7 h-7" />
                </div>
                <span className="font-bold text-[#0a2540] text-center text-sm group-hover:text-indigo-600 transition-colors">Schedule Video</span>
              </Link>
              <Link href="/search/doctors?mode=in-clinic" className="min-w-[150px] lg:min-w-0 snap-center group flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-blue-400 rounded-3xl p-6 shadow-[0_8px_30px_-10px_rgba(0,20,60,0.1)] transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-3">
                  <Building2 className="w-7 h-7" />
                </div>
                <span className="font-bold text-[#0a2540] text-center text-sm group-hover:text-teal-600 transition-colors">Book Clinic Visit</span>
              </Link>
              <Link href="/search/hospitals" className="min-w-[150px] lg:min-w-0 snap-center group flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-blue-400 rounded-3xl p-6 shadow-[0_8px_30px_-10px_rgba(0,20,60,0.1)] transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-3">
                  <span className="text-2xl">🏥</span>
                </div>
                <span className="font-bold text-[#0a2540] text-center text-sm group-hover:text-rose-600 transition-colors">Find Hospitals</span>
              </Link>
              <Link href="/search/pharmacies" className="min-w-[150px] lg:min-w-0 snap-center group flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-blue-400 rounded-3xl p-6 shadow-[0_8px_30px_-10px_rgba(0,20,60,0.1)] transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-3">
                  <Pill className="w-7 h-7" />
                </div>
                <span className="font-bold text-[#0a2540] text-center text-sm group-hover:text-amber-600 transition-colors">Order Medicines</span>
              </Link>
              <Link href="/search/labs" className="min-w-[150px] lg:min-w-0 snap-center group flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-blue-400 rounded-3xl p-6 shadow-[0_8px_30px_-10px_rgba(0,20,60,0.1)] transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-3">
                  <TestTube2 className="w-7 h-7" />
                </div>
                <span className="font-bold text-[#0a2540] text-center text-sm group-hover:text-purple-600 transition-colors">Book Lab Tests</span>
              </Link>
            </div>
          </section>
        );

      case 'square-grid':
        if (entities.length === 0) return null;
        return (
          <section key={row.id} className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 py-4 max-w-7xl mx-auto">
            {row.title && (
              <div className="w-full flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">{row.title}</h2>
                  {row.subtitle && <p className="text-slate-600 font-medium mt-1">{row.subtitle}</p>}
                </div>
                {row.viewAllLink && <Link href={row.viewAllLink} className="text-blue-600 font-bold hover:underline hidden sm:block">View All →</Link>}
              </div>
            )}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {entities.map((item) => (
                 <SquareTicket key={item.id} {...item} />
              ))}
            </div>
          </section>
        );

      case 'wide-list':
        if (entities.length === 0) return null;
        return (
          <section key={row.id} className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 py-10 max-w-7xl mx-auto">
            {row.title && (
              <div className="w-full flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">{row.title}</h2>
                  {row.subtitle && <p className="text-slate-600 font-medium mt-1">{row.subtitle}</p>}
                </div>
                {row.viewAllLink && <Link href={row.viewAllLink} className="text-blue-600 font-bold hover:underline hidden sm:block">View All →</Link>}
              </div>
            )}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
              {entities.map((item) => (
                 <WideTicket key={item.id} {...item} />
              ))}
            </div>
          </section>
        );

      case 'mixed-portrait-square':
        if (entities.length === 0) return null;
        const portraitEntity = entities[0];
        const squareEntities = entities.slice(1);
        return (
          <section key={row.id} className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 pb-10 pt-4 max-w-7xl mx-auto">
            {row.title && (
              <div className="w-full flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-black text-[#0a2540] tracking-tight">{row.title}</h2>
                  {row.subtitle && <p className="text-slate-600 font-medium mt-1">{row.subtitle}</p>}
                </div>
                {row.viewAllLink && <Link href={row.viewAllLink} className="text-blue-600 font-bold hover:underline hidden sm:block">View All →</Link>}
              </div>
            )}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                {portraitEntity && <PortraitTicket {...portraitEntity} />}
              </div>
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {squareEntities.map((item) => (
                   <SquareTicket key={item.id} {...item} />
                ))}
              </div>
            </div>
          </section>
        );

      case 'ad-injection':
        return (
          <section key={row.id} className="relative z-10 w-full px-4 md:px-8 py-6 max-w-7xl mx-auto">
            <div className="bg-white/40 backdrop-blur-2xl border border-white rounded-[40px] p-2 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] w-full h-[120px] flex items-center justify-center overflow-hidden">
               {/* Native Ad Engine Injection Zone */}
               {/* Note: the actual Ads component would mount here looking for row.adSlotId */}
               <div className="w-[95%] h-[90%] border-2 border-dashed border-slate-400/50 rounded-2xl flex items-center justify-center bg-white/20">
                  <span className="text-slate-500 font-bold tracking-widest uppercase text-sm">[ AD INJECTION ZONE: {row.adSlotId} ]</span>
               </div>
            </div>
          </section>
        );

      case 'how-it-works-patient':
        return (
          <section key={row.id} className="relative z-10 w-full px-4 md:px-8 pt-4 pb-4 max-w-7xl mx-auto">
            <div className="bg-white/40 backdrop-blur-2xl border border-white rounded-[40px] p-12 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-300/30 rounded-full blur-[80px]"></div>
              <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-teal-300/30 rounded-full blur-[80px]"></div>

              <h2 className="text-4xl font-black tracking-tight mb-4 relative z-10 text-[#0a2540]">Your Health Journey, Simplified</h2>
              <p className="text-lg text-slate-600 font-medium mb-12 max-w-2xl relative z-10">Access premium healthcare from the comfort of your home. Search, book, and consult with the best professionals in seconds.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12 relative z-10">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm text-blue-600">🔍</div>
                  <h4 className="font-bold text-[#0a2540] text-xl mb-2">Find Services</h4>
                  <p className="text-slate-600 text-sm">Search for doctors, hospitals, pharmacies, or instant video consultations.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm text-indigo-600">📅</div>
                  <h4 className="font-bold text-[#0a2540] text-xl mb-2">Book & Consult</h4>
                  <p className="text-slate-600 text-sm">Schedule a clinic visit or start an immediate video call with verified experts.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm text-teal-600">❤️</div>
                  <h4 className="font-bold text-[#0a2540] text-xl mb-2">Get Care</h4>
                  <p className="text-slate-600 text-sm">Receive prescriptions, order medicines, and track your health progress seamlessly.</p>
                </div>
              </div>

              <Link href="/search" className="relative z-10">
                 <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-12 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-transform hover:-translate-y-1">
                    Explore Services Now
                 </button>
              </Link>
            </div>
          </section>
        );

      case 'how-it-works-provider':
        return (
          <section key={row.id} className="relative z-10 w-full px-4 md:px-8 pt-4 pb-4 max-w-7xl mx-auto">
            <div className="bg-white/40 backdrop-blur-2xl border border-white rounded-[40px] p-12 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] flex flex-col items-center text-center">
              <h2 className="text-4xl font-black text-[#0a2540] tracking-tight mb-4">Grow Your Medical Practice</h2>
              <p className="text-lg text-slate-600 font-medium mb-12 max-w-2xl">Join the largest healthcare network in the region. Reach thousands of patients, manage appointments, and grow your digital presence.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/40 border border-white/60 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm">1️⃣</div>
                  <h4 className="font-bold text-[#0a2540] text-xl mb-2">Create Profile</h4>
                  <p className="text-slate-600 text-sm">Add your specialties, timing, and clinic details to our directory.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/40 border border-white/60 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm">2️⃣</div>
                  <h4 className="font-bold text-[#0a2540] text-xl mb-2">Get Verified</h4>
                  <p className="text-slate-600 text-sm">Our team verifies your credentials to grant the Trust Badge.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/40 border border-white/60 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm">3️⃣</div>
                  <h4 className="font-bold text-[#0a2540] text-xl mb-2">Receive Patients</h4>
                  <p className="text-slate-600 text-sm">Start accepting online appointments directly through your portal.</p>
                </div>
              </div>

              <Link href="/join">
                 <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-12 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-transform hover:-translate-y-1">
                    Start Onboarding Now
                 </button>
              </Link>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen text-slate-800 font-sans pb-24">
      {/* Dynamic Hero */}
      <V2Hero 
        titleStart={layout?.hero?.titleStart || "Find & Book"}
        highlight={layout?.hero?.highlight || "Premium Healthcare."}
        subtitle={layout?.hero?.subtitle || "The most trusted medical professionals, instantly available near you."}
        showSearch={true}
        desktopBgImage={layout?.hero?.desktopBgImage || "/v2/pc-hero.png"}
        mobileBgImage={layout?.hero?.mobileBgImage || "/v2/phone-hero.png"}
      />

      {loading ? (
        <div className="flex justify-center items-center py-32">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {layout?.rows?.filter((r: any) => r.visible).map((row: any) => renderRowContent(row))}
        </>
      )}
    </div>
  );
}
