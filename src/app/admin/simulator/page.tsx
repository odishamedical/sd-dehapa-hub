"use client";

import React, { useState, useEffect } from 'react';

const DEVICES = [
  { name: 'iPhone 14 Pro', width: 393, height: 852 },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'Pixel 7', width: 412, height: 915 },
  { name: 'iPad Mini', width: 768, height: 1024 },
];

export default function MobileSimulator() {
  const [url, setUrl] = useState('/portal/doctor');
  const [activeUrl, setActiveUrl] = useState('/portal/doctor');
  const [activeDevice, setActiveDevice] = useState(DEVICES[0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.startsWith('http') && !url.startsWith('/')) {
      setActiveUrl('/' + url);
    } else {
      setActiveUrl(url);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      {/* Top Control Bar */}
      <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-black text-xl tracking-tight text-teal-400">Device Simulator</h1>
          <div className="h-6 w-[1px] bg-slate-600 mx-2"></div>
          
          <div className="flex gap-2">
            {DEVICES.map(device => (
              <button 
                key={device.name}
                onClick={() => setActiveDevice(device)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeDevice.name === device.name ? 'bg-teal-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                {device.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleGo} className="flex items-center gap-2 max-w-md w-full ml-8">
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter relative path (e.g. /portal/doctor)"
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-1.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
          />
          <button type="submit" className="px-4 py-1.5 bg-teal-500 text-slate-900 text-sm font-bold rounded-lg hover:bg-teal-400">
            Go
          </button>
        </form>
      </div>

      {/* Simulator Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-slate-900 relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        {/* Device Frame */}
        <div 
          className="relative bg-white rounded-[3rem] border-[14px] border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-4 ring-slate-700 overflow-hidden transition-all duration-500 ease-out z-10"
          style={{ width: activeDevice.width + 28, height: activeDevice.height + 28 }}
        >
          {/* Dynamic Island / Notch Simulation */}
          {activeDevice.name.includes('iPhone') && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-800 rounded-b-3xl z-50 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-900/50"></div>
              <div className="w-12 h-2 rounded-full bg-slate-900/50"></div>
            </div>
          )}

          {/* Screen Content */}
          <iframe 
            src={activeUrl}
            className="w-full h-full bg-white"
            style={{ border: 'none' }}
            title="Mobile Simulator"
          />
        </div>

        {/* Specs tooltip */}
        <div className="absolute bottom-8 right-8 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-lg z-20">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Current Screen</p>
          <p className="text-lg font-mono text-white">{activeDevice.width} × {activeDevice.height}</p>
        </div>
      </div>
    </div>
  );
}
