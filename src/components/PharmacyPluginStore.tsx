// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface PharmacyPluginStoreProps {
  entityData: any;
}

export default function PharmacyPluginStore({ entityData }: PharmacyPluginStoreProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const activePlugins = entityData?.activePlugins || [];

  const TIERS = [
    {
      id: "tier_basic",
      name: "Basic Retailer",
      price: "Free",
      color: "emerald",
      icon: "🏪",
      description: "A premium digital storefront to capture local walk-ins.",
      features: [
        "Premium Public Profile & SEO",
        "Basic Inbox for Paper Prescriptions",
        "Google Maps Routing Integration"
      ],
      isDefault: true,
      pluginsRequired: []
    },
    {
      id: "tier_pro",
      name: "Digital Fulfillment Pro",
      price: "₹999/mo",
      color: "sky",
      icon: "📦",
      description: "Receive digital prescriptions directly from the Dehapa network.",
      features: [
        "Everything in Basic Retailer",
        "Live Digital Rx Fulfillment Dashboard",
        "Smart Inventory Sync (Out of Stock Toggles)",
        "1-Click Driver Dispatch Integration"
      ],
      isDefault: false,
      pluginsRequired: ["plugin_pharmacy_fulfillment_pro"]
    },
    {
      id: "tier_enterprise",
      name: "Enterprise B2B Socket",
      price: "₹2499/mo",
      color: "purple",
      icon: "🔌",
      description: "Directly socket your pharmacy into a nearby Hospital OS.",
      features: [
        "Everything in Digital Fulfillment Pro",
        "Direct Hospital B2B Integration Socket",
        "Automated In-Patient (IPD) Medicine Supply",
        "Corporate TPA & Cashless Billing Sync",
        "Multi-Branch Pharmacy Management"
      ],
      isDefault: false,
      pluginsRequired: ["plugin_pharmacy_fulfillment_pro", "plugin_pharmacy_enterprise_os"]
    }
  ];

  const handleUpgrade = async (tier: any) => {
    if (!entityData?.id) return;
    setIsProcessing(tier.id);
    
    try {
      // Add required plugins to active array without removing others
      const currentPlugins = new Set(activePlugins);
      tier.pluginsRequired.forEach((p: string) => currentPlugins.add(p));
      
      const updatedPlugins = Array.from(currentPlugins);
      
      await updateDoc(doc(db, "directory", entityData.id), {
        activePlugins: updatedPlugins
      });
      
      // Update local object immediately to reflect in UI without refresh
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
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
              <span className="text-xl">🏪</span>
            </div>
            Pharmacy OS Plans
          </h3>
          <p className="text-sm text-slate-600 mt-2 font-medium">Upgrade your SaaS tier to unlock powerful B2B network features.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier) => {
          const isActive = hasAccessToTier(tier);
          const colorStyles: Record<string, string | undefined> = {
            emerald: "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300",
            sky: "border-sky-200 bg-sky-50/50 hover:border-sky-300 shadow-[0_0_30px_rgba(14,165,233,0.1)]",
            purple: "border-purple-200 bg-purple-50/50 hover:border-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden"
          }[tier.color as keyof typeof colorStyles];

          return (
            <div 
              key={tier.id} 
              className={`rounded-3xl p-6 border-2 transition-all flex flex-col h-full ${colorStyles} ${isActive ? 'ring-4 ring-white/50' : ''}`}
            >
              {tier.color === 'purple' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl"></div>
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
                      tier.color === 'sky' ? 'bg-sky-500 hover:bg-sky-600 shadow-[0_5px_15px_rgba(14,165,233,0.3)]' : 
                      'bg-purple-600 hover:bg-purple-700 shadow-[0_5px_15px_rgba(147,51,234,0.3)]'
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
