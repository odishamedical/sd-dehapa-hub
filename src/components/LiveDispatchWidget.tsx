"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';

export default function LiveDispatchWidget({ providerId }: { providerId: string }) {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrentUserEmail(localStorage.getItem("sd_current_user_email"));
    setCurrentUserName(localStorage.getItem("sd_current_user_name") || "Ambulance Driver");
  }, []);

  useEffect(() => {
    if (!providerId) return;

    const q = query(
      collection(db, "emergencies"),
      where("ambulanceId", "==", providerId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmergencies(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [providerId]);

  // Timeout for missed pings
  useEffect(() => {
    const interval = setInterval(() => {
      emergencies.forEach(emg => {
        if (emg.status === "Pending Confirmation" && emg.timestamp) {
          const age = Date.now() - emg.timestamp.toMillis();
          if (age > 60000) {
            updateDoc(doc(db, "emergencies", emg.id), { status: "Missed" }).catch(console.error);
          }
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [emergencies]);

  const handleAccept = async (id: string) => {
    try {
      await updateDoc(doc(db, "emergencies", id), {
        status: "Accepted & En Route",
        acceptedByDriverEmail: currentUserEmail,
        acceptedByDriverName: currentUserName
      });
    } catch (err) {
      console.error("Error accepting dispatch", err);
    }
  };

  const handleVerifyCode = async (emg: any) => {
    if (codeInputs[emg.id] === emg.rideCode) {
      try {
        await updateDoc(doc(db, "emergencies", emg.id), { status: "Completed" });
      } catch (err) {
        console.error("Error completing dispatch", err);
      }
    } else {
      alert("Invalid Ride Code. Please check with the patient.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Emergency Dispatch Queue</h3>
          <p className="text-sm text-slate-600">Manage incoming ambulance requests in real-time.</p>
        </div>
        <div className="bg-red-50/80 backdrop-blur-md text-red-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-red-200/50 animate-pulse">
          Live Feed Active
        </div>
      </div>
      
      {emergencies.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-white/60 rounded-xl bg-white/40">
          <div className="w-16 h-16 bg-white/60 shadow-sm border border-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p className="font-bold text-slate-900 mb-1">No Active Emergencies</p>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">Standby for incoming dispatch requests from patients or hospitals.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {emergencies.map((emg) => (
            <div key={emg.id} className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              {emg.status === "Pending Confirmation" && (
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse"></div>
              )}
              {emg.status === "Accepted & En Route" && (
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              )}
              
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      emg.status === 'Pending Confirmation' ? 'bg-red-100 text-red-700 border border-red-200' : 
                      emg.status === 'Accepted & En Route' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      emg.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {emg.status}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{emg.emergencyType}</span>
                    {emg.vehicleNumber && (
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded border border-indigo-200 uppercase tracking-widest">
                        Vehicle: {emg.vehicleNumber}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{emg.patientName}</h4>
                    <p className="text-sm text-slate-600 font-medium">{emg.pickupAddress}</p>
                    {emg.coordinates && (
                      <a href={`https://www.google.com/maps/search/?api=1&query=${emg.coordinates}`} target="_blank" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                        View Coordinates on Maps: {emg.coordinates}
                      </a>
                    )}
                    {emg.status === "Accepted & En Route" && (
                      <div className="mt-2 text-xs font-bold text-amber-600 bg-amber-50 inline-block px-3 py-1 rounded border border-amber-200">
                        Accepted By: {emg.acceptedByDriverName || emg.acceptedByDriverEmail}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 min-w-[200px]">
                  {emg.status === "Pending Confirmation" ? (
                    <button 
                      onClick={() => handleAccept(emg.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-[0_4px_15px_rgba(220,38,38,0.2)]"
                    >
                      Accept & Dispatch
                    </button>
                  ) : emg.status === "Accepted & En Route" ? (
                    <div className="flex flex-col gap-2 bg-amber-50 p-2 rounded-xl border border-amber-200">
                      <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest text-center">Verify Ride Code</div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          maxLength={4}
                          placeholder="0000"
                          value={codeInputs[emg.id] || ''}
                          onChange={(e) => setCodeInputs({...codeInputs, [emg.id]: e.target.value})}
                          className="w-16 text-center font-mono font-bold border-2 border-amber-300 rounded-lg text-amber-900 focus:outline-none focus:border-amber-500"
                        />
                        <button 
                          onClick={() => handleVerifyCode(emg)}
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-colors"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button disabled className="bg-slate-50 text-slate-400 border border-slate-200 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest">
                      {emg.status}
                    </button>
                  )}
                  <a 
                    href={`tel:${emg.patientPhone || ""}`}
                    className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-center transition-colors"
                  >
                    Call Patient
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
