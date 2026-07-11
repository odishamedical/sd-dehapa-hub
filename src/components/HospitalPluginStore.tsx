"use client";

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Check } from 'lucide-react';

const TIERS = [
  {
    id: "basic",
    name: "Basic Hospital Hub",
    description: "Perfect for managing an out-patient clinic with multiple doctors.",
    price: 0,
    originalPrice: null,
    plugins: ["plugin_hospital_opd"],
    features: [
      "Premium Public Profile",
      "Doctor Roster Management",
      "Centralized OPD Queue",
      "Department Setup",
      "Basic Lead Inbox"
    ],
    badge: null,
    color: "slate"
  },
  {
    id: "pro",
    name: "Clinic & IPD Pro",
    description: "Transforms the hospital into a digitally operated smart hospital.",
    price: 1499,
    originalPrice: 2499,
    plugins: ["plugin_hospital_opd", "plugin_hospital_ipd_pro"],
    features: [
      "Everything in Basic",
      "Live Bed Manager (IPD)",
      "OT Scheduler",
      "Centralized Billing & Cashier",
      "Staff Access Control"
    ],
    badge: "MOST POPULAR",
    color: "sky"
  },
  {
    id: "advanced",
    name: "Enterprise Health OS",
    description: "For massive super-specialty hospitals needing complete ecosystem control.",
    price: 2999,
    originalPrice: 4999,
    plugins: ["plugin_hospital_opd", "plugin_hospital_ipd_pro", "plugin_hospital_enterprise_os"],
    features: [
      "Everything in Pro",
      "B2B Pharmacy & Lab Links",
      "Insurance & TPA Portal",
      "AI Analytics Dashboard",
      "Ambulance Fleet Integration"
    ],
    badge: "BEST VALUE",
    color: "emerald"
  }
];

export default function HospitalPluginStore({ entityData }: { entityData: any }) {
  const [loading, setLoading] = useState<string | null>(null);

  const activePlugins = entityData?.activePlugins || [];

  // Determine current tier based on plugins
  const isTierActive = (tierPlugins: string[]) => {
    if (tierPlugins.length === 1 && tierPlugins[0] === "plugin_hospital_opd") {
      return activePlugins.length <= 1; // They haven't bought pro
    }
    return tierPlugins.every((p: string) => activePlugins.includes(p));
  };

  const handleSelectTier = async (tier: any) => {
    if (!entityData?.id) return;
    
    setLoading(tier.id);
    try {
      await updateDoc(doc(db, "directory", entityData.id), {
        activePlugins: tier.plugins
      });
    } catch (error) {
      console.error("Error updating plugins:", error);
      alert("Failed to update subscription.");
    } finally {
      setLoading(null);
    }
  };

  let currentTierName = "Basic Hospital Hub";
  if (isTierActive(TIERS[2].plugins)) currentTierName = "Enterprise Health OS";
  else if (isTierActive(TIERS[1].plugins)) currentTierName = "Clinic & IPD Pro";

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24 relative min-h-[85vh]">
      {/* Network Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20 -z-10" style={{
        backgroundImage: `
          linear-gradient(to right, #0ea5e9 1px, transparent 1px),
          linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(circle at top, black, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(circle at top, black, transparent 80%)'
      }}></div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="text-sky-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-2">Hospital Operating System</div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Choose Your Hospital Plan</h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Scale your hospital operations. Start with the free basic hub to manage walk-ins, or upgrade to completely digitize your IPD wards and OT rooms.
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shrink-0 min-w-[200px] text-center shadow-inner">
            <div className="text-slate-500 font-bold tracking-widest text-[10px] uppercase mb-1">Current Active Plan</div>
            <div className="text-2xl font-black text-white flex justify-center items-end gap-1">
              {currentTierName}
            </div>
            {currentTierName !== "Basic Hospital Hub" ? (
              <div className="text-emerald-400 text-[10px] font-bold mt-2 uppercase tracking-widest flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Subscription
              </div>
            ) : (
              <div className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-widest">
                Freemium Tier
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier) => {
          let isActive = false;
          if (tier.id === "advanced") isActive = currentTierName === "Enterprise Health OS";
          if (tier.id === "pro") isActive = currentTierName === "Clinic & IPD Pro";
          if (tier.id === "basic") isActive = currentTierName === "Basic Hospital Hub";

          const isToggling = loading === tier.id;

          const colorMap: any = {
            slate: {
              border: "border-slate-700 hover:border-slate-500",
              bg: "bg-slate-800/40",
              text: "text-slate-300",
              button: "bg-slate-700 hover:bg-slate-600 text-white"
            },
            sky: {
              border: "border-sky-500/50 shadow-[0_0_30px_rgba(14,165,233,0.15)] ring-1 ring-sky-500/50",
              bg: "bg-gradient-to-br from-sky-900/40 via-slate-900/80 to-slate-900/90",
              text: "text-sky-400",
              button: "bg-sky-500 hover:bg-sky-400 text-white shadow-[0_0_15px_rgba(14,165,233,0.5)]"
            },
            emerald: {
              border: "border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50",
              bg: "bg-gradient-to-br from-emerald-900/40 via-slate-900/80 to-slate-900/90",
              text: "text-emerald-400",
              button: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            }
          };

          const styles = colorMap[tier.color];

          return (
            <div 
              key={tier.id} 
              className={`relative overflow-hidden rounded-[2rem] p-8 transition-all duration-500 flex flex-col h-full backdrop-blur-md ${styles.border} ${styles.bg}`}
            >
              {tier.badge && (
                <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl rounded-tr-[2rem] text-[10px] font-black tracking-widest uppercase ${
                  tier.color === 'sky' ? 'bg-sky-500 text-sky-50' : 'bg-emerald-500 text-emerald-50'
                }`}>
                  {tier.badge}
                </div>
              )}

              <div className="relative z-10 flex-1">
                <h3 className="text-2xl font-black text-white mb-2">{tier.name}</h3>
                <p className="text-slate-400 text-sm mb-6 h-10">{tier.description}</p>
                
                <div className="mb-8">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">₹{tier.price}</span>
                    <span className="text-sm font-bold text-slate-500 mb-1">/mo</span>
                  </div>
                  {tier.originalPrice && (
                    <div className="text-sm font-bold text-slate-500 line-through mt-1">
                      ₹{tier.originalPrice}/mo
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 mb-8">
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm font-medium text-slate-300">
                      <Check size={18} className={`shrink-0 mt-0.5 ${styles.text}`} strokeWidth={3} />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-white/10 relative z-10">
                {isActive ? (
                  <button disabled className="w-full py-4 rounded-xl font-bold text-sm bg-slate-800 text-slate-400 border border-slate-700 cursor-default flex items-center justify-center gap-2">
                    <Check size={18} /> Current Plan
                  </button>
                ) : (
                  <button 
                    onClick={() => handleSelectTier(tier)}
                    disabled={isToggling}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${styles.button} disabled:opacity-50`}
                  >
                    {isToggling ? 'Updating...' : `Select ${tier.name}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
