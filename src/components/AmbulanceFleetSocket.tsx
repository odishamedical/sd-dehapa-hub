"use client";

import React, { useState } from 'react';

export default function AmbulanceFleetSocket() {
  const [hospitalId, setHospitalId] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [activeSockets, setActiveSockets] = useState([
    { id: "hosp_8231", name: "Care Hospitals, Bhubaneswar", status: "Connected", syncType: "Live Fleet Integration" }
  ]);

  const handleSocketConnect = () => {
    if (hospitalId.length < 5) return alert("Please enter a valid Hospital ID");
    setIsLinking(true);
    setTimeout(() => {
      setActiveSockets([...activeSockets, { 
        id: hospitalId, 
        name: "Apollo Clinic (Connected)", 
        status: "Connected", 
        syncType: "Fleet Integration" 
      }]);
      setHospitalId("");
      setIsLinking(false);
      alert("Successfully socketed into Hospital Fleet!");
    }, 1500);
  };

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.8)] min-h-[70vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-inner">
              <span className="text-xl">🏢</span>
            </div>
            Hospital Fleet Socket
          </h3>
          <p className="text-sm text-slate-600 mt-2 font-medium">Link your ambulance directly to a Hospital to act as their internal emergency vehicle.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/60 border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest mb-6">Connect to Hospital OS</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Hospital Network ID</label>
              <input 
                type="text" 
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                placeholder="e.g. HOSP-9821"
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-5 py-3 shadow-sm text-slate-900 focus:border-slate-800 outline-none transition-all font-bold tracking-wider"
              />
            </div>
            
            <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl flex items-start gap-3">
              <span className="text-slate-600 text-lg mt-0.5">ℹ️</span>
              <div>
                <p className="text-sm font-bold text-slate-900">How Fleet Socketing Works</p>
                <p className="text-xs text-slate-600 mt-1">Once linked, the Hospital's command center can dispatch you directly for patient pick-ups or ICU transfers. Billing is automatically synced between your OS and the Hospital OS.</p>
              </div>
            </div>
            
            <button 
              onClick={handleSocketConnect}
              disabled={isLinking}
              className="w-full bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-[0_5px_15px_rgba(15,23,42,0.3)] transition-all flex justify-center items-center gap-2"
            >
              {isLinking ? 'Authenticating with Hospital...' : 'Connect to Fleet'}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/10 rounded-full blur-3xl"></div>
          
          <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-6 relative z-10">Active Fleet Data Sockets</h4>
          
          <div className="space-y-4 relative z-10">
            {activeSockets.map(socket => (
              <div key={socket.id} className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                  </div>
                  <div>
                    <h5 className="font-bold text-white">{socket.name}</h5>
                    <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mt-1 flex items-center gap-1">
                      <span>✓</span> {socket.syncType}
                    </p>
                  </div>
                </div>
                <button className="text-xs font-bold text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors">
                  Configure
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
