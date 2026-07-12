"use client";

import React, { useState } from 'react';

export default function HospitalInsurancePortal() {
  const [activeTab, setActiveTab] = useState("active_claims");

  const claims = [
    { id: "CLM-9923", patient: "Rajiv M.", provider: "Star Health", amount: "₹45,000", status: "processing", submitted: "2 days ago" },
    { id: "CLM-9924", patient: "Sujata K.", provider: "HDFC Ergo", amount: "₹1,20,000", status: "approved", submitted: "4 days ago" },
    { id: "CLM-9925", patient: "Amit P.", provider: "ICICI Lombard", amount: "₹85,000", status: "rejected", submitted: "1 week ago" },
  ];

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.8)] min-h-[70vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 shadow-inner">
              <span className="text-xl">🛡️</span>
            </div>
            Insurance & TPA Portal
          </h3>
          <p className="text-sm text-slate-600 mt-2 font-medium">Process cashless claims and manage corporate healthcare accounts.</p>
        </div>
        
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all flex items-center gap-2">
          + New Cashless Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {['HDFC Ergo', 'Star Health', 'ICICI Lombard', 'Care Health'].map(tpa => (
          <div key={tpa} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-purple-300 transition-colors cursor-pointer group">
            <span className="font-bold text-slate-700 group-hover:text-purple-700">{tpa}</span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab("active_claims")}
            className={`px-6 py-4 text-sm font-bold transition-all ${activeTab === 'active_claims' ? 'border-b-2 border-purple-600 text-purple-700 bg-purple-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Active Claims
          </button>
          <button 
            onClick={() => setActiveTab("settled")}
            className={`px-6 py-4 text-sm font-bold transition-all ${activeTab === 'settled' ? 'border-b-2 border-purple-600 text-purple-700 bg-purple-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Settled
          </button>
        </div>

        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-bold">Claim ID</th>
                <th className="p-4 font-bold">Patient</th>
                <th className="p-4 font-bold">Provider</th>
                <th className="p-4 font-bold">Amount</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.map(claim => (
                <tr key={claim.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-black text-slate-900">{claim.id}</td>
                  <td className="p-4 font-bold text-slate-700">{claim.patient}</td>
                  <td className="p-4 text-sm font-medium text-slate-500">{claim.provider}</td>
                  <td className="p-4 font-black text-slate-900">{claim.amount}</td>
                  <td className="p-4">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${
                      claim.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      claim.status === 'processing' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-purple-600 hover:text-purple-800 text-xs font-bold transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
