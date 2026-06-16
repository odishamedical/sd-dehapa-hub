"use client";

import React, { useState } from 'react';

export default function ProviderDirectory() {
  const providers = [
    { id: 'ChIJ123', name: 'Dr. A.K. Sharma', type: 'Doctor', location: 'Odisha', tier: 'Premium', verified: true, status: 'Active' },
    { id: 'ChIJ456', name: 'Apollo Speciality', type: 'Hospital', location: 'Odisha', tier: 'Platinum', verified: true, status: 'Active' },
    { id: 'ChIJ789', name: 'LifeCare Pharmacy', type: 'Pharmacy', location: 'West Bengal', tier: 'Free', verified: true, status: 'Active' },
    { id: 'ChIJ101', name: 'SRL Diagnostics', type: 'Lab', location: 'Odisha', tier: 'Free', verified: false, status: 'Unclaimed' },
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Directory Management</h2>
          <p className="text-sm text-slate-500">Manage all entities scraped or registered across the network.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Export CSV
          </button>
          <button className="px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl shadow-[0_4px_15px_rgba(13,148,136,0.3)] hover:bg-teal-700 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Entity
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 bg-slate-50">
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-teal-500">
            <option>All Types</option>
            <option>Doctors</option>
            <option>Hospitals</option>
            <option>Labs</option>
          </select>
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-teal-500">
            <option>All States</option>
            <option>Odisha</option>
            <option>West Bengal</option>
          </select>
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-teal-500">
            <option>All Tiers</option>
            <option>Platinum</option>
            <option>Premium</option>
            <option>Free</option>
          </select>
          <div className="flex-1 min-w-[200px]">
            <input type="text" placeholder="Search entity name or ID..." className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest bg-white">
              <th className="px-6 py-4">Entity</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Tier Status</th>
              <th className="px-6 py-4">State</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {providers.map((prov) => (
              <tr key={prov.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg shadow-inner">
                      {prov.type === 'Doctor' ? '👨‍⚕️' : prov.type === 'Hospital' ? '🏥' : prov.type === 'Pharmacy' ? '💊' : '🔬'}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900">{prov.name}</span>
                        {prov.verified && <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>}
                      </div>
                      <span className="text-xs text-slate-500">{prov.type} • ID: {prov.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                  {prov.location}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    prov.tier === 'Platinum' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    prov.tier === 'Premium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {prov.tier}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                    prov.status === 'Active' ? 'text-teal-600' : 'text-slate-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${prov.status === 'Active' ? 'bg-teal-500' : 'bg-slate-300'}`}></span>
                    {prov.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-teal-600 bg-slate-50 hover:bg-teal-50 rounded-lg border border-transparent hover:border-teal-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
