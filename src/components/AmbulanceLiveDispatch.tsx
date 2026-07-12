"use client";

import React, { useState } from 'react';

export default function AmbulanceLiveDispatch() {
  const [activeSOS, setActiveSOS] = useState<string | null>(null);

  const incomingRequests = [
    { id: "SOS-9912", patient: "Rajesh K.", location: "Sector 5, Salt Lake", distance: "2.4 km away", time: "2 mins ago", type: "Cardiac Emergency" },
    { id: "SOS-9915", patient: "Smita D.", location: "Airport Gate 1", distance: "5.1 km away", time: "8 mins ago", type: "Trauma / Accident" }
  ];

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.8)] min-h-[70vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20 shadow-inner">
              <span className="text-xl">🚨</span>
            </div>
            Live SOS Dispatch
          </h3>
          <p className="text-sm text-slate-600 mt-2 font-medium">Accept incoming emergencies and route directly to the patient.</p>
        </div>
        
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
          <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">GPS Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest mb-4">Incoming SOS</h4>
          
          {incomingRequests.map(req => (
            <div 
              key={req.id} 
              onClick={() => setActiveSOS(req.id)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${activeSOS === req.id ? 'border-rose-400 bg-rose-50 shadow-md ring-4 ring-rose-50' : 'border-slate-200 bg-white hover:border-rose-200 hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black bg-rose-100 text-rose-700 px-2 py-1 rounded-md">{req.id}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.time}</span>
              </div>
              <h5 className="font-bold text-slate-900">{req.patient}</h5>
              <p className="text-xs text-rose-600 font-bold mb-2">{req.type}</p>
              <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                <span>📍</span> {req.location} • <span className="font-bold text-slate-700">{req.distance}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-slate-100 rounded-3xl border-2 border-slate-200 overflow-hidden relative flex flex-col">
          <div className="flex-1 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=22.5726,88.3639&zoom=14&size=800x400&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x333333&style=feature:all|element:labels.text.stroke|color:0xffffff&style=feature:all|element:labels.icon|visibility:off&style=feature:administrative|element:geometry.fill|color:0xfefefe&style=feature:administrative|element:geometry.stroke|color:0xfefefe&style=feature:administrative|element:labels.text.fill|color:0x444444&style=feature:landscape|element:geometry|color:0xf5f5f5&style=feature:poi|element:geometry|color:0xf5f5f5&style=feature:road.highway|element:geometry.fill|color:0xffffff&style=feature:road.highway|element:geometry.stroke|color:0xcecece&style=feature:road.arterial|element:geometry.fill|color:0xffffff&style=feature:road.local|element:geometry.fill|color:0xffffff&style=feature:transit|element:geometry|color:0xf2f2f2&style=feature:water|element:geometry|color:0xe9e9e9')] bg-cover bg-center">
            {/* Map Placeholder Layer */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
            
            {activeSOS ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black text-lg">Routing to Patient</h4>
                    <span className="text-emerald-400 font-bold text-sm">2.4 km</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-rose-500 w-1/3 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors">
                      Call Patient
                    </button>
                    <button className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl shadow-[0_5px_15px_rgba(225,29,72,0.4)] hover:bg-rose-700 transition-colors">
                      Mark Arrived
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg border border-slate-200">
                  <p className="font-bold text-slate-600 flex items-center gap-2">
                    <span className="animate-spin text-xl">⏳</span> Waiting for emergency SOS...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
