"use client";

import React, { useState } from 'react';

export default function KYCManagement() {
  const [activeTab, setActiveTab] = useState('pending');

  const pendingRequests = [
    { id: 'REQ-8821', provider: 'Dr. Surya Kanta Pradhan', type: 'Doctor', date: '2026-06-15', docType: 'Medical Registration', status: 'Pending Review' },
    { id: 'REQ-8822', provider: 'Apollo Specialty', type: 'Hospital', date: '2026-06-15', docType: 'NABH Certificate', status: 'Pending Review' },
    { id: 'REQ-8823', provider: 'LifeCare Labs', type: 'Lab', date: '2026-06-14', docType: 'Trade License', status: 'Pending Review' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Pending Reviews <span className="ml-2 bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px]">156</span>
          </button>
          <button 
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'approved' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Approved
          </button>
          <button 
            onClick={() => setActiveTab('rejected')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'rejected' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Rejected
          </button>
        </div>
        
        <div className="px-4">
          <div className="relative">
            <input type="text" placeholder="Search Request ID or Name..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-64" />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
      </div>

      {/* KYC Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <th className="px-6 py-4">Request ID</th>
              <th className="px-6 py-4">Provider Info</th>
              <th className="px-6 py-4">Document Type</th>
              <th className="px-6 py-4">Submitted On</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pendingRequests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-sm font-mono font-bold text-slate-700">{req.id}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{req.provider}</span>
                    <span className="text-xs font-semibold text-teal-600">{req.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                    <span className="text-sm text-slate-600 font-medium">{req.docType}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {req.date}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors">
                      View Docs
                    </button>
                    <button className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-lg border border-teal-200 transition-colors">
                      Approve
                    </button>
                    <button className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Showing 1 to 3 of 156 entries</span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded text-xs font-bold text-slate-400 bg-white" disabled>Prev</button>
            <button className="px-3 py-1 border border-teal-500 rounded text-xs font-bold text-white bg-teal-500">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded text-xs font-bold text-slate-600 bg-white hover:bg-slate-100">2</button>
            <button className="px-3 py-1 border border-slate-200 rounded text-xs font-bold text-slate-600 bg-white hover:bg-slate-100">3</button>
            <button className="px-3 py-1 border border-slate-200 rounded text-xs font-bold text-slate-600 bg-white hover:bg-slate-100">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
