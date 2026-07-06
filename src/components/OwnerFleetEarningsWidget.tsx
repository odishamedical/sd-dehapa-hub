"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export default function OwnerFleetEarningsWidget({ 
  providerId, 
  entityData 
}: { 
  providerId: string, 
  entityData: any 
}) {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "emergencies"),
      where("ambulanceId", "==", providerId),
      where("status", "==", "Completed"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [providerId]);

  if (loading) {
    return (
      <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 min-h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const driverMapping = entityData?.driverMapping || [];
  
  // Calculate total earnings across the entire fleet
  const totalFleetEarnings = trips.reduce((sum, trip) => sum + (Number(trip.estimatedPrice) || 0), 0);

  // Group by vehicle
  const earningsByVehicle = trips.reduce((acc: Record<string, number>, trip) => {
    const v = trip.vehicleNumber || "Unassigned";
    if (!acc[v]) acc[v] = 0;
    acc[v] += Number(trip.estimatedPrice) || 0;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-indigo-100 font-black text-sm mb-2 uppercase tracking-widest bg-black/20 inline-block px-3 py-1 rounded-full">
              Master Fleet Earnings
            </p>
            <h1 className="text-6xl font-black tracking-tight flex items-center gap-2 mt-4">
              <span className="text-indigo-300">₹</span>{totalFleetEarnings.toLocaleString('en-IN')}
            </h1>
            <p className="mt-4 text-indigo-200 font-medium">Total Cash/UPI Collected by Drivers</p>
          </div>
          <div className="bg-black/20 p-6 rounded-3xl backdrop-blur-sm border border-white/10 min-w-[200px] text-center">
            <p className="text-4xl font-black text-white mb-1">{trips.length}</p>
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Total Fleet Trips</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-6 px-2">Driver Collection Ledger</h3>
        {driverMapping.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No drivers mapped yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {driverMapping.map((driver: any, idx: number) => {
              const collected = earningsByVehicle[driver.registrationNumber] || 0;
              return (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900">{driver.driverName}</h4>
                      <p className="text-xs text-slate-500 font-medium">{driver.driverEmail}</p>
                      <p className="text-xs text-slate-500 font-medium">Ph: {driver.driverPhone}</p>
                    </div>
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                      {driver.registrationNumber}
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Driver Holds:</span>
                    <span className="text-2xl font-black text-indigo-600">₹{collected.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
