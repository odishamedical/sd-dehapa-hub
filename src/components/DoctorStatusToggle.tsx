"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';

interface DoctorStatusToggleProps {
  doctorId: string;
}

export default function DoctorStatusToggle({ doctorId }: DoctorStatusToggleProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [hasOptedIn, setHasOptedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to doctor's online status in Firestore
  useEffect(() => {
    if (!doctorId) return;

    const docRef = doc(db, 'doctor_status', doctorId);
    
    // Check if doc exists first, if not create it
    getDoc(docRef).then((docSnap) => {
      if (!docSnap.exists()) {
        setDoc(docRef, {
          isOnline: false,
          hasOptedIn: false,
          lastUpdated: new Date()
        });
      }
    });

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsOnline(data.isOnline || false);
        setHasOptedIn(data.hasOptedIn || false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [doctorId]);

  const toggleStatus = async () => {
    setIsLoading(true);
    const newStatus = !isOnline;
    
    // Update local state immediately for snappy UI
    setIsOnline(newStatus);
    
    try {
      const docRef = doc(db, 'doctor_status', doctorId);
      await updateDoc(docRef, {
        isOnline: newStatus,
        lastUpdated: new Date()
      });
    } catch (err) {
      console.error("Failed to update status", err);
      setIsOnline(!newStatus); // revert on failure
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptIn = async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'doctor_status', doctorId);
      await updateDoc(docRef, {
        hasOptedIn: true,
        lastUpdated: new Date()
      });
    } catch (err) {
      console.error("Failed to opt in", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasOptedIn && !isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-sm border border-slate-200 bg-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 relative">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wide text-slate-800">
              On-Demand Telemedicine
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1 max-w-lg">
              Earn extra income by receiving instant "Uber-style" consultation requests from patients. You decide when you are online and available. Do you want to opt-in to this service?
            </p>
          </div>
          <button
            onClick={handleOptIn}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Yes, Opt-In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-sm border transition-colors duration-500 mb-8 ${isOnline ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-4">
          {/* Status Indicator Dot */}
          <div className="relative flex h-5 w-5">
            {isOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-5 w-5 ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          </div>
          
          <div>
            <h2 className={`text-xl font-black uppercase tracking-wide ${isOnline ? 'text-emerald-800' : 'text-slate-600'}`}>
              {isOnline ? "You are Online" : "You are Offline"}
            </h2>
            <p className={`text-sm font-medium ${isOnline ? 'text-emerald-600' : 'text-slate-500'}`}>
              {isOnline 
                ? "Ready to receive instant Uber-style consultation pings." 
                : "You are hidden from the instant consultation network."}
            </p>
          </div>
        </div>

        {/* Big Toggle Button */}
        <button
          onClick={toggleStatus}
          disabled={isLoading}
          className={`relative inline-flex h-12 w-24 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-opacity-75 ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-300'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="sr-only">Toggle Online Status</span>
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-1 flex h-10 w-10 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isOnline ? 'translate-x-12' : 'translate-x-0'
            }`}
          >
            {/* Inner Icon */}
            {isOnline ? (
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </span>
        </button>
      </div>

      {/* Decorative Background Waves when Online */}
      {isOnline && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute -left-10 top-0 h-64 w-64 rounded-full bg-emerald-400 mix-blend-multiply blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-teal-400 mix-blend-multiply blur-3xl animate-[pulse_5s_ease-in-out_infinite_alternate]" />
        </div>
      )}
    </div>
  );
}
