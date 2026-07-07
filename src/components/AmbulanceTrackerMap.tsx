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
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });

interface AmbulanceTrackerMapProps {
  ambulanceId: string;
  assignedDriverEmail?: string;
  patientLat?: number;
  patientLng?: number;
}

export default function AmbulanceTrackerMap({ ambulanceId, assignedDriverEmail, patientLat, patientLng }: AmbulanceTrackerMapProps) {
  const [vehicle, setVehicle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (!ambulanceId) { setLoading(false); return; }

    const constraints = [
      where("ambulanceId", "==", ambulanceId),
      where("status", "==", "active")
    ];
    if (assignedDriverEmail) {
      constraints.push(where("driverEmail", "==", assignedDriverEmail));
    }

    const q = query(collection(db, "fleet_tracking"), ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // If driver email is provided, it should be just 1. Otherwise just take the first active one for this fleet
        const data = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setVehicle(data);
      } else {
        setVehicle(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ambulanceId, assignedDriverEmail]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
        <div className="w-12 h-12 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <p className="font-bold text-slate-900">Tracking Unavailable</p>
        <p className="text-sm text-slate-500">The assigned ambulance is not currently broadcasting its GPS location.</p>
      </div>
    );
  }

  // Determine bounds and zoom logic
  let center: [number, number] = [vehicle.lat, vehicle.lng];
  
  // Custom Leaflet icon for ambulance
  let AmbulanceIcon;
  let PatientIcon;
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    AmbulanceIcon = new L.Icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/824/824046.png', // A generic ambulance icon for now
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
    
    PatientIcon = new L.Icon({
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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Ambulance Tracker
          </h3>
          <p className="text-sm text-slate-500">Driver {vehicle.driverName || 'assigned'} is en route.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-emerald-700 font-bold text-xs uppercase tracking-widest">
          Arriving Soon
        </div>
      </div>

      <div className="h-[300px] md:h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 relative z-0">
        <MapContainer 
          center={center} 
          zoom={15} // Zoomed in closer for Uber-style tracking
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Marker 
            position={[vehicle.lat, vehicle.lng]}
            icon={AmbulanceIcon}
          >
            <Popup>
              <div className="font-bold text-slate-900 text-center">
                🚑 Ambulance<br/>
                <span className="text-xs text-slate-500 font-normal">Last ping: {vehicle.lastUpdated ? new Date(vehicle.lastUpdated.toMillis()).toLocaleTimeString() : 'Just now'}</span>
              </div>
            </Popup>
          </Marker>

          {patientLat && patientLng && (
            <>
              <Marker 
                position={[patientLat, patientLng]}
                icon={PatientIcon}
              >
                <Popup>Your Pickup Location</Popup>
              </Marker>
              {/* Highlight a 200m radius around the patient */}
              <Circle 
                center={[patientLat, patientLng]} 
                radius={200}
                pathOptions={{ fillColor: '#3b82f6', color: '#2563eb', weight: 1, opacity: 0.5, fillOpacity: 0.1 }}
              />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
