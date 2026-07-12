"use client";

import React, { useState } from 'react';

export default function HospitalBilling() {
  const [activeTab, setActiveTab] = useState("pending");

  const bills = [
    { id: "INV-2041", patient: "Rajiv M.", amount: "₹45,000", status: "pending", type: "IPD Surgery", date: "Today, 10:30 AM" },
    { id: "INV-2042", patient: "Anita S.", amount: "₹1,200", status: "pending", type: "OPD Consult", date: "Today, 11:15 AM" },
    { id: "INV-2039", patient: "Suresh P.", amount: "₹8,500", status: "paid", type: "Emergency", date: "Yesterday" },
  ];

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.8)] min-h-[70vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <span className="text-xl">💳</span>
            </div>
            Centralized Billing
          </h3>
          <p className="text-sm text-slate-600 mt-2 font-medium">Manage IPD/OPD invoices and cashless insurance claims.</p>
        </div>
        
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2">
          + Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Today's Revenue</p>
          <p className="text-3xl font-black text-slate-900">₹12,450</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-amber-700 mb-1">Pending Receivables</p>
          <p className="text-3xl font-black text-amber-600">₹46,200</p>
        </div>
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-sky-700 mb-1">Insurance Claims (TPA)</p>
          <p className="text-3xl font-black text-sky-600">₹1,15,000</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-4 text-sm font-bold transition-all ${activeTab === 'pending' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Pending Payments
          </button>
          <button 
            onClick={() => setActiveTab("paid")}
            className={`px-6 py-4 text-sm font-bold transition-all ${activeTab === 'paid' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Completed
          </button>
        </div>

        <div className="p-0">
          {bills.filter(b => b.status === activeTab).length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-medium">No invoices found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="p-4 font-bold">Invoice ID</th>
                  <th className="p-4 font-bold">Patient</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold text-right">Amount</th>
                  <th className="p-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.filter(b => b.status === activeTab).map(bill => (
                  <tr key={bill.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-black text-slate-900">{bill.id}</td>
                    <td className="p-4 font-bold text-slate-700">{bill.patient}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">
                        {bill.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500 font-medium">{bill.date}</td>
                    <td className="p-4 font-black text-slate-900 text-right">{bill.amount}</td>
                    <td className="p-4 text-center">
                      {bill.status === 'pending' ? (
                        <button className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all">
                          Collect
                        </button>
                      ) : (
                        <button className="text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors">
                          Print Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
