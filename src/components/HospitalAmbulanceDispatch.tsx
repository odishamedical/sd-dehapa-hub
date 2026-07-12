"use client";

import React, { useState } from 'react';

export default function HospitalAmbulanceDispatch() {
  const [activeTab, setActiveTab] = useState("map");

  const ambulances = [
    { id: "AMB-101", driver: "Ramesh K.", status: "available", location: "Hospital Parking", type: "ALS (Advanced)" },
    { id: "AMB-102", driver: "Suresh P.", status: "dispatched", location: "Sector 14, 2km away", type: "BLS (Basic)" },
    { id: "AMB-103", driver: "Mohammad A.", status: "returning", location: "Highway 9, 5km away", type: "ALS (Advanced)" },
  ];

  const sosAlerts = [
    { id: "SOS-892", patient: "Unknown Male, 45", condition: "Severe Chest Pain", location: "Central Mall, Sector 29", time: "2 mins ago", distance: "3.2 km" },
    { id: "SOS-893", patient: "Pooja V.", condition: "Road Accident Trauma", location: "NH-48 Intersection", time: "5 mins ago", distance: "6.5 km" },
  ];

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.8)] min-h-[80vh] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 shadow-inner">
              <span className="text-xl">🚑</span>
            </div>
            Ambulance Dispatch
          </h3>
          <p className="text-sm text-slate-600 mt-2 font-medium">Command center for your hospital's emergency fleet.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab("map")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'map' ? 'bg-white shadow text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Live Map
          </button>
          <button 
            onClick={() => setActiveTab("fleet")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'fleet' ? 'bg-white shadow text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Fleet Status
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Alerts & Fleet */}
        <div className="space-y-6 flex flex-col">
          
          {/* Incoming SOS */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-red-700 flex items-center gap-2 mb-4 text-sm uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Active SOS Alerts ({sosAlerts.length})
            </h4>
            
            <div className="space-y-3">
              {sosAlerts.map(alert => (
                <div key={alert.id} className="bg-white p-4 rounded-xl border border-red-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-black text-slate-900">{alert.condition}</span>
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">{alert.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">{alert.patient} • {alert.distance}</p>
                  <p className="text-xs font-medium text-slate-800 mb-3 bg-slate-50 p-2 rounded flex items-center gap-1">
                    📍 {alert.location}
                  </p>
                  <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-xs font-bold shadow-md transition-all">
                    Dispatch Ambulance
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Fleet Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex-1">
            <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-widest">Available Fleet</h4>
            <div className="space-y-3">
              {ambulances.map(amb => (
                <div key={amb.id} className="flex justify-between items-center p-3 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      amb.status === 'available' ? 'bg-emerald-500' :
                      amb.status === 'dispatched' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{amb.id} <span className="font-normal text-xs text-slate-500">({amb.type})</span></p>
                      <p className="text-[10px] text-slate-500">{amb.driver} • {amb.location}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded ${
                    amb.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                    amb.status === 'dispatched' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {amb.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Map Simulation */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center min-h-[400px]">
          {/* Simulated Dark Map Pattern */}
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `
              linear-gradient(to right, #1e293b 1px, transparent 1px),
              linear-gradient(to bottom, #1e293b 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}></div>
          
          {/* Map Nodes Simulation */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow whitespace-nowrap">
              SOS-892
            </div>
          </div>
          
          <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50">
            <span className="text-xl">🏥</span>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-emerald-400 text-[10px] font-bold px-2 py-1 whitespace-nowrap">
              Your Hospital
            </div>
          </div>
          
          <div className="absolute top-1/3 left-1/2 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/50">
            <span className="text-sm">🚑</span>
          </div>

          <div className="relative z-10 bg-slate-800/80 backdrop-blur border border-slate-700 p-4 rounded-xl text-center max-w-sm">
            <span className="text-2xl mb-2 block">🗺️</span>
            <p className="text-white font-bold mb-1">Live Fleet Tracking Active</p>
            <p className="text-xs text-slate-400">Waiting for live GPS coordinates from drivers via the Dehapa Partner app.</p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
