"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export default function DriverEarningsWidget({ 
  providerId, 
  userEmail, 
  entityData 
}: { 
  providerId: string, 
  userEmail: string | null, 
  entityData: any 
}) {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const driverMap = entityData?.driverMapping?.find((d: any) => d.driverEmail === userEmail);
  const assignedVehicle = driverMap?.registrationNumber || "Unknown";

  useEffect(() => {
    if (!providerId || !assignedVehicle || assignedVehicle === "Unknown") {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "emergencies"),
      where("ambulanceId", "==", providerId),
      where("vehicleNumber", "==", assignedVehicle),
      where("status", "==", "Completed"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [providerId, assignedVehicle]);

  const totalCollected = trips.reduce((sum, trip) => sum + (Number(trip.estimatedPrice) || 0), 0);

  if (loading) {
    return (
      <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 min-h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-emerald-50 font-black text-sm mb-2 uppercase tracking-widest bg-black/20 inline-block px-3 py-1 rounded-full">
              Cash & UPI Collected
            </p>
            <h1 className="text-6xl font-black tracking-tight flex items-center gap-2 mt-4">
              <span className="text-emerald-300">₹</span>{totalCollected.toLocaleString('en-IN')}
            </h1>
            <p className="mt-4 text-emerald-100 font-medium">For Vehicle: <span className="font-black text-white">{assignedVehicle}</span></p>
          </div>
          <div className="bg-black/20 p-6 rounded-3xl backdrop-blur-sm border border-white/10 min-w-[200px] text-center">
            <p className="text-4xl font-black text-white mb-1">{trips.length}</p>
            <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">Completed Trips</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-6 px-2">Trip Ledger</h3>
        {trips.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No completed trips yet.
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map(trip => (
              <div key={trip.id} className="flex justify-between items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900">{trip.patientName}</h4>
                  <p className="text-xs text-slate-500 font-medium">{trip.dropAddress || trip.pickupAddress}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-600">₹{trip.estimatedPrice || 0}</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collected</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
