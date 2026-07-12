"use client";

import React, { useState } from 'react';
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface AmbulancePluginStoreProps {
  entityData: any;
}

export default function AmbulancePluginStore({ entityData }: AmbulancePluginStoreProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const activePlugins = entityData?.activePlugins || [];

  const TIERS = [
    {
      id: "tier_basic",
      name: "Basic Listing",
      price: "Free",
      color: "emerald",
      icon: "🚑",
      description: "Ensure your ambulance is visible in the public emergency directory.",
      features: [
        "Premium Public Profile & SEO",
        "Click-to-Call Phone Number",
        "Service Area Display"
      ],
      isDefault: true,
      pluginsRequired: []
    },
    {
      id: "tier_pro",
      name: "Live Dispatch Pro",
      price: "₹999/mo",
      color: "rose",
      icon: "🚨",
      description: "Receive instant SOS alerts with live patient GPS tracking.",
      features: [
        "Everything in Basic Listing",
        "Live SOS Dispatch Dashboard",
        "Google Maps Patient Routing",
        "1-Click Arrival Confirmation"
      ],
      isDefault: false,
      pluginsRequired: ["plugin_ambulance_dispatch_pro"]
    },
    {
      id: "tier_enterprise",
      name: "Fleet Manager OS",
      price: "₹2499/mo",
      color: "slate",
      icon: "🏢",
      description: "Socket into a hospital to manage their internal emergency fleet.",
      features: [
        "Everything in Live Dispatch Pro",
        "Direct Hospital B2B Integration Socket",
        "Automated ICU Transfer Routing",
        "Corporate Billing & Shift Tracking",
        "Multi-Vehicle Fleet Management"
      ],
      isDefault: false,
      pluginsRequired: ["plugin_ambulance_dispatch_pro", "plugin_ambulance_fleet_os"]
    }
  ];

  const handleUpgrade = async (tier: any) => {
    if (!entityData?.id) return;
    setIsProcessing(tier.id);
    
    try {
      const currentPlugins = new Set(activePlugins);
      tier.pluginsRequired.forEach((p: string) => currentPlugins.add(p));
      
      const updatedPlugins = Array.from(currentPlugins);
      
      await updateDoc(doc(db, "directory", entityData.id), {
        activePlugins: updatedPlugins
      });
      
      entityData.activePlugins = updatedPlugins;
      
    } catch (err) {
      console.error("Upgrade failed:", err);
      alert("Failed to process upgrade. Please try again.");
    } finally {
      setIsProcessing(null);
    }
  };

  const hasAccessToTier = (tier: any) => {
    if (tier.isDefault) return true;
    return tier.pluginsRequired.every((pluginId: string) => activePlugins.includes(pluginId));
  };

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.8)]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20 shadow-inner">
              <span className="text-xl">🚨</span>
            </div>
            Ambulance OS Plans
          </h3>
          <p className="text-sm text-slate-600 mt-2 font-medium">Upgrade your SaaS tier to unlock live GPS dispatching and Hospital fleet socketing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier) => {
          const isActive = hasAccessToTier(tier);
          const colorStyles = {
            emerald: "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300",
            rose: "border-rose-200 bg-rose-50/50 hover:border-rose-300 shadow-[0_0_30px_rgba(225,29,72,0.1)]",
            slate: "border-slate-300 bg-slate-50/80 hover:border-slate-400 shadow-[0_0_30px_rgba(15,23,42,0.15)] relative overflow-hidden"
          }[tier.color as keyof typeof colorStyles];

          return (
            <div 
              key={tier.id} 
              className={`rounded-3xl p-6 border-2 transition-all flex flex-col h-full ${colorStyles} ${isActive ? 'ring-4 ring-white/50' : ''}`}
            >
              {tier.color === 'slate' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-400/20 rounded-full blur-3xl"></div>
              )}
              
              <div className="mb-6 relative z-10">
                <span className="text-4xl block mb-4">{tier.icon}</span>
                <h4 className={`text-lg font-black text-${tier.color}-900`}>{tier.name}</h4>
                <div className={`text-2xl font-black text-${tier.color}-600 mt-1 mb-2`}>{tier.price}</div>
                <p className="text-sm text-slate-600 font-medium">{tier.description}</p>
              </div>
              
              <div className="flex-1 mb-8 relative z-10">
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                      <span className={`text-${tier.color}-500 font-bold shrink-0`}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto relative z-10">
                {isActive ? (
                  <button disabled className="w-full py-3 px-4 bg-white/80 border-2 border-slate-200 text-slate-500 rounded-xl font-bold text-sm cursor-default">
                    Current Plan
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpgrade(tier)}
                    disabled={isProcessing === tier.id}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-md transition-transform active:scale-95 ${
                      tier.color === 'rose' ? 'bg-rose-500 hover:bg-rose-600 shadow-[0_5px_15px_rgba(225,29,72,0.3)]' : 
                      'bg-slate-800 hover:bg-slate-900 shadow-[0_5px_15px_rgba(15,23,42,0.3)]'
                    }`}
                  >
                    {isProcessing === tier.id ? 'Processing...' : `Upgrade to ${tier.name}`}
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
