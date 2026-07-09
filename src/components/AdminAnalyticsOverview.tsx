"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';

export default function AdminAnalyticsOverview() {
  const [stats, setStats] = useState({
    totalRecords: 0,
    verifiedProviders: 0,
    pendingClaims: 0,
    doctors: 0,
    hospitals: 0,
    pharmacies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const dirColl = collection(db, 'directory');
        const claimsColl = collection(db, 'listing_claims');

        const [
          totalSnap,
          verifiedSnap,
          pendingClaimsSnap,
          doctorsSnap,
          hospitalsSnap,
          pharmaciesSnap
        ] = await Promise.all([
          getCountFromServer(dirColl),
          getCountFromServer(query(dirColl, where('verified', '==', true))),
          getCountFromServer(query(claimsColl, where('status', '==', 'pending'))),
          getCountFromServer(query(dirColl, where('category', '==', 'Doctor'))),
          getCountFromServer(query(dirColl, where('category', '==', 'Hospital'))),
          getCountFromServer(query(dirColl, where('category', '==', 'Pharmacy')))
        ]);

        setStats({
          totalRecords: totalSnap.data().count,
          verifiedProviders: verifiedSnap.data().count,
          pendingClaims: pendingClaimsSnap.data().count,
          doctors: doctorsSnap.data().count,
          hospitals: hospitalsSnap.data().count,
          pharmacies: pharmaciesSnap.data().count,
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white drop-shadow-sm">System Analytics</h2>
          <p className="text-sm font-semibold text-teal-600">Live metrics from the SD Ecosystem</p>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 border border-white/20 rounded-3xl p-6 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.05)] group">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-slate-800 rounded-xl shadow-sm border border-white/10 flex items-center justify-center mb-4 text-teal-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Total Directory Records</h3>
            <div className="text-4xl font-black text-white">{stats.totalRecords.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 border border-white/20 rounded-3xl p-6 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.05)] group">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-slate-800 rounded-xl shadow-sm border border-white/10 flex items-center justify-center mb-4 text-teal-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Verified Providers</h3>
            <div className="text-4xl font-black text-teal-700">{stats.verifiedProviders.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 border border-white/20 rounded-3xl p-6 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.05)] group">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-slate-800 rounded-xl shadow-sm border border-white/10 flex items-center justify-center mb-4 text-amber-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Pending KYC Claims</h3>
            <div className="text-4xl font-black text-amber-600">{stats.pendingClaims.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-sm p-6 mt-6">
        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Entity Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Doctors</span>
            <span className="text-lg font-bold text-white">{stats.doctors.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Hospitals</span>
            <span className="text-lg font-bold text-white">{stats.hospitals.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Pharmacies</span>
            <span className="text-lg font-bold text-white">{stats.pharmacies.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Other/Labs</span>
            <span className="text-lg font-bold text-white">{(stats.totalRecords - stats.doctors - stats.hospitals - stats.pharmacies).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
