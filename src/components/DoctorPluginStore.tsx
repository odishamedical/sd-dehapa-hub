"use client";

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Check, Star, Zap } from 'lucide-react';

const TIERS = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for managing a physical clinic.",
    price: 0,
    originalPrice: null,
    plugins: ["plugin_booking_physical"],
    features: [
      "Beautiful Public Profile",
      "Walk-in & Scheduled Bookings",
      "Digital Queue Manager",
      "Automated SMS Reminders"
    ],
    badge: null,
    color: "slate"
  },
  {
    id: "pro",
    name: "Telemedicine Pro",
    description: "Launch your digital practice and increase visibility.",
    price: 499,
    originalPrice: 999,
    plugins: ["plugin_booking_physical", "plugin_telemedicine_scheduled", "plugin_telemedicine_urgent", "plugin_featured_listing"],
    features: [
      "Everything in Basic",
      "Priority Search Visibility",
      "Scheduled Video Consults",
      "Urgent On-Demand Video",
      "Basic PDF Rx Pad"
    ],
    badge: "MOST POPULAR",
    color: "sky"
  },
  {
    id: "advanced",
    name: "Advanced OS",
    description: "The ultimate operating system for top doctors.",
    price: 799,
    originalPrice: 1499,
    plugins: ["plugin_booking_physical", "plugin_telemedicine_scheduled", "plugin_telemedicine_urgent", "plugin_featured_listing", "plugin_vip_rx_pad"],
    features: [
      "Everything in Pro",
      "AI Diagnosis Assistant",
      "Smart Auto-Suggest Meds",
      "1-Click WhatsApp Dispatch",
      "Full Vitals Dashboard"
    ],
    badge: "BEST VALUE",
    color: "emerald"
  }
];

export default function DoctorPluginStore({ entityData }: { entityData: any }) {
  const [loading, setLoading] = useState<string | null>(null);

  const activePlugins = entityData?.activePlugins || [];

  // Determine current tier based on plugins (naive check)
  const isTierActive = (tierPlugins: string[]) => {
    // If it's the basic tier, we check if they ONLY have the basic plugins or less
    if (tierPlugins.length === 1 && tierPlugins[0] === "plugin_booking_physical") {
      return activePlugins.length <= 1; // They haven't bought pro
    }
    
    // For Pro and Advanced, check if they have ALL the plugins of that tier
    return tierPlugins.every((p: string) => activePlugins.includes(p));
  };

  const handleSelectTier = async (tier: any) => {
    if (!entityData?.id) return;
    
    setLoading(tier.id);
    try {
      await updateDoc(doc(db, "directory", entityData.id), {
        activePlugins: tier.plugins
      });
      // The Firestore snapshot will automatically update `entityData` in the parent
    } catch (error) {
      console.error("Error updating plugins:", error);
      alert("Failed to update subscription.");
    } finally {
      setLoading(null);
    }
  };

  // Determine current highest tier
  let currentTierName = "Basic";
  if (isTierActive(TIERS[2].plugins)) currentTierName = "Advanced OS";
  else if (isTierActive(TIERS[1].plugins)) currentTierName = "Telemedicine Pro";

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
            <div className="text-sky-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-2">Dehapa SaaS Engine</div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Choose Your Plan</h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Scale your practice instantly. Start for free with our physical clinic manager, or upgrade to launch a full digital hospital.
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shrink-0 min-w-[200px] text-center shadow-inner">
            <div className="text-slate-500 font-bold tracking-widest text-[10px] uppercase mb-1">Current Active Plan</div>
            <div className="text-2xl font-black text-white flex justify-center items-end gap-1">
              {currentTierName}
            </div>
            {currentTierName !== "Basic" ? (
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
          if (tier.id === "advanced") isActive = currentTierName === "Advanced OS";
          if (tier.id === "pro") isActive = currentTierName === "Telemedicine Pro";
          if (tier.id === "basic") isActive = currentTierName === "Basic";

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
