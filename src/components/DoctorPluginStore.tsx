"use client";

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const AVAILABLE_PLUGINS = [
  {
    id: "plugin_booking_physical",
    name: "Physical Appointment Booking",
    description: "Allow patients to book clinic visits directly from your profile. Includes Care Connect queue integration.",
    icon: "🏥",
    price: "₹499/mo",
    color: "from-emerald-500 to-teal-600"
  },
  {
    id: "plugin_telemedicine_scheduled",
    name: "Scheduled Telemedicine",
    description: "Conduct scheduled video consultations. Includes integrated payment gateway and digital Rx pad.",
    icon: "🩺",
    price: "₹999/mo",
    color: "from-indigo-500 to-blue-600"
  },
  {
    id: "plugin_telemedicine_urgent",
    name: "Urgent Video Call",
    description: "Allow patients to request an instant video call. Perfect for on-demand consultations with premium pricing.",
    icon: "🎥",
    price: "₹1,499/mo",
    color: "from-rose-500 to-pink-600"
  },
  {
    id: "plugin_rx_pad",
    name: "VIP Digital Rx Pad",
    description: "Full access to the smart prescription generator, auto-suggest engine, and 1-click WhatsApp dispatch.",
    icon: "📝",
    price: "₹799/mo",
    color: "from-amber-500 to-orange-600"
  }
];

export default function DoctorPluginStore({ entityData }: { entityData: any }) {
  const [loading, setLoading] = useState<string | null>(null);

  const activePlugins = entityData?.activePlugins || [];

  const handleTogglePlugin = async (pluginId: string) => {
    if (!entityData?.id) return;
    
    setLoading(pluginId);
    try {
      const isCurrentlyActive = activePlugins.includes(pluginId);
      
      // Toggle logic
      const newPlugins = isCurrentlyActive 
        ? activePlugins.filter((p: string) => p !== pluginId)
        : [...activePlugins, pluginId];
        
      await updateDoc(doc(db, "directory", entityData.id), {
        activePlugins: newPlugins
      });
      
      // In a real app, this would redirect to Razorpay for payment.
      // Here, we simulate instant activation for the MVP.
      if (!isCurrentlyActive) {
        alert("Plugin activated! Features are now unlocked.");
      }
    } catch (error) {
      console.error("Error updating plugins:", error);
      alert("Failed to update plugin status.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="bg-gradient-to-r from-slate-900 to-teal-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">Dehapa Plugin Store</h1>
          <p className="text-teal-100 max-w-2xl text-lg opacity-90">
            Customize your Digital OS. Activate powerful tools to grow your practice, automate workflows, and provide seamless care to your patients.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AVAILABLE_PLUGINS.map((plugin) => {
          const isActive = activePlugins.includes(plugin.id);
          const isToggling = loading === plugin.id;

          return (
            <div key={plugin.id} className={`bg-white rounded-3xl p-6 shadow-sm border-[2px] transition-all duration-300 ${isActive ? 'border-teal-500 shadow-[0_10px_30px_rgba(20,184,166,0.15)] scale-[1.02]' : 'border-slate-100 hover:border-slate-300'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${isActive ? `bg-gradient-to-br ${plugin.color} text-white` : 'bg-slate-100'}`}>
                  {plugin.icon}
                </div>
                {isActive && (
                  <div className="bg-teal-50 text-teal-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-teal-200">
                    Active
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2">{plugin.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 min-h-[60px]">
                {plugin.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Pricing</p>
                  <p className="text-lg font-black text-slate-900">{plugin.price}</p>
                </div>
                <button 
                  onClick={() => handleTogglePlugin(plugin.id)}
                  disabled={isToggling}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    isActive 
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                      : `bg-gradient-to-r ${plugin.color} text-white shadow-md hover:shadow-lg hover:-translate-y-0.5`
                  } disabled:opacity-50`}
                >
                  {isToggling ? 'Processing...' : isActive ? 'Manage' : 'Activate Plugin'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
