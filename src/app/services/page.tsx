"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Video, Ambulance, HeartPulse, Calendar, Syringe, ShieldCheck, Activity } from "lucide-react";

export default function ServicesPage() {
  const [isPinging, setIsPinging] = useState(false);

  const handlePingAmbulance = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      window.location.href = '/ambulances';
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Book Health Services</h1>
          <p className="text-slate-600">Access emergency care, book appointments, and manage your health.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Emergency / SOS Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
              {isPinging ? <Activity className="w-8 h-8 animate-spin" /> : <Ambulance className="w-8 h-8" />}
            </div>
            <h2 className="text-xl font-bold mb-2">Live Ambulance</h2>
            <p className="text-sm text-slate-500 mb-6">Ping an SOS and track nearby ambulance units in real-time.</p>
            <button onClick={handlePingAmbulance} className="sd-btn-urgent w-full mt-auto">
              {isPinging ? 'Pinging SOS...' : 'Ping Ambulance SOS'}
            </button>
          </div>

          {/* Instant Video Consult */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-500">
              <Video className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">Instant Video Consult</h2>
            <p className="text-sm text-slate-500 mb-6">Join the Live Queue and see a doctor right now from your home.</p>
            <Link href="/urgent-care" className="sd-btn-nav w-full mt-auto block">
              Start Video Call
            </Link>
          </div>

          {/* Book Clinic Visit */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4 text-green-500">
              <Calendar className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">Clinic Appointment</h2>
            <p className="text-sm text-slate-500 mb-6">Schedule a physical visit with top specialists near you.</p>
            <Link href="/search?type=doctor" className="sd-btn-book w-full mt-auto block">
              Book Appointment
            </Link>
          </div>

          {/* ICU Bed Search */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4 text-orange-500">
              <HeartPulse className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">ICU Bed Booking</h2>
            <p className="text-sm text-slate-500 mb-6">Find and reserve available ICU beds in partner hospitals.</p>
            <Link href="/search?type=hospital&beds=icu" className="sd-btn-urgent w-full mt-auto block bg-orange-500 hover:bg-orange-400 border-orange-600">
              Find ICU Bed
            </Link>
          </div>

          {/* Lab Tests */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mb-4 text-violet-500">
              <Syringe className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">Book Lab Tests</h2>
            <p className="text-sm text-slate-500 mb-6">Schedule home sample collection or clinic visits for pathology.</p>
            <Link href="/search?type=lab" className="sd-btn-book w-full mt-auto block">
              Book Test
            </Link>
          </div>

          {/* Health Vault */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4 text-purple-500">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">My Health Vault</h2>
            <p className="text-sm text-slate-500 mb-6">Access your Sovereign ID and manage lifetime health records.</p>
            <Link href="/portal" className="sd-btn-nav w-full mt-auto block bg-purple-600 hover:bg-purple-500 border-purple-700">
              Open Vault
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
