"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import dynamic from 'next/dynamic';

// Next.js requires dynamic import with SSR disabled for react-leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

export default function FleetCommandMap({ providerId }: { providerId: string }) {
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Default to a central location (e.g. Bhubaneswar) if no fleet is active
  const defaultCenter = [20.2961, 85.8245];

  useEffect(() => {
    // Inject Leaflet CSS dynamically to prevent SSR issues
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!providerId) { setLoading(false); return; }

    const q = query(
      collection(db, "fleet_tracking"),
      where("ambulanceId", "==", providerId),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFleet(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [providerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Calculate center based on fleet positions
  let centerPosition: [number, number] = [defaultCenter[0], defaultCenter[1]];
  if (fleet.length > 0) {
    const sumLat = fleet.reduce((acc, curr) => acc + curr.lat, 0);
    const sumLng = fleet.reduce((acc, curr) => acc + curr.lng, 0);
    centerPosition = [sumLat / fleet.length, sumLng / fleet.length];
  }

  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Live Fleet Command</h3>
          <p className="text-sm text-slate-600">Track all active ambulances in real-time.</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
          <span className="text-sm font-bold text-indigo-700">Active Vehicles: {fleet.length}</span>
        </div>
      </div>

      {fleet.length === 0 ? (
         <div className="text-center py-16 border-2 border-dashed border-white/60 rounded-xl bg-white/40">
           <div className="w-16 h-16 bg-white/60 shadow-sm border border-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
           </div>
           <p className="font-bold text-slate-900 mb-1">No Active Vehicles</p>
           <p className="text-sm text-slate-600 max-w-sm mx-auto">None of your drivers are currently broadcasting their GPS location.</p>
         </div>
      ) : (
        <div className="h-[400px] rounded-2xl overflow-hidden border border-slate-200/60 shadow-inner relative z-0">
          <MapContainer 
            center={centerPosition} 
            zoom={13} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {fleet.map((vehicle) => {
               // Custom Leaflet icon logic since we are dynamically loading
               let LeafletIcon;
               if (typeof window !== 'undefined') {
                 const L = require('leaflet');
                 LeafletIcon = new L.Icon({
                   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                   iconSize: [25, 41],
                   iconAnchor: [12, 41],
                   popupAnchor: [1, -34],
                   shadowSize: [41, 41]
                 });
               }

               return (
                 <Marker 
                   key={vehicle.id} 
                   position={[vehicle.lat, vehicle.lng]}
                   icon={LeafletIcon}
                 >
                   <Popup>
                     <div className="font-sans">
                       <p className="font-bold text-slate-900 text-sm mb-1">{vehicle.driverName || 'Driver'}</p>
                       <p className="text-xs text-slate-500 mb-2">{vehicle.driverEmail}</p>
                       <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block border border-emerald-200">
                         {vehicle.status}
                       </div>
                       {vehicle.lastUpdated && (
                         <p className="text-[10px] text-slate-400 mt-2">
                           Last ping: {new Date(vehicle.lastUpdated.toMillis()).toLocaleTimeString()}
                         </p>
                       )}
                     </div>
                   </Popup>
                 </Marker>
               );
            })}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
