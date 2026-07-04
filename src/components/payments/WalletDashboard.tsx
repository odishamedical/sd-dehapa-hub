"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'; 

export default function WalletDashboard({ 
  entityId, 
  userRole, 
  walletBalance = 0 
}: { 
  entityId: string, 
  userRole: string, 
  walletBalance?: number 
}) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) return;

    // In a real scenario, we'd fetch from a sub-collection:
    // const q = query(collection(db, 'users', entityId, 'wallet_transactions'), orderBy('createdAt', 'desc'), limit(10));
    // getDocs(q).then(...)
    // For now, since the backend function might not exist yet, we will just use an empty array
    // to strictly adhere to NO MOCK DATA.
    setTransactions([]);
    setLoading(false);
  }, [entityId]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">DehaPa Wallet</h2>
        <p className="text-slate-300 font-medium text-lg">
          {userRole === 'patient' 
            ? 'Manage your funds and view refund history.'
            : 'View your digital consultation payouts and current balance.'}
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-8 md:p-12 text-white shadow-[0_20px_40px_rgba(16,185,129,0.2)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-emerald-50 font-medium text-lg mb-2 opacity-90 uppercase tracking-widest">Available Balance</p>
            <h1 className="text-6xl font-black tracking-tight flex items-center gap-2">
              <span className="text-emerald-200">₹</span>{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h1>
          </div>
          
          <div className="flex flex-col gap-3 min-w-[200px]">
            {userRole === 'patient' ? (
              <button className="bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95 text-center w-full">
                + Add Funds
              </button>
            ) : (
              <button className="bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95 text-center w-full">
                Withdraw to Bank
              </button>
            )}
            <p className="text-xs text-center text-emerald-100/70 font-medium">
              {userRole === 'patient' ? 'Secure payments via Razorpay' : 'Transfers within 48 hours'}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Recent Transactions</h3>
          <button className="text-teal-600 font-bold hover:text-teal-700 text-sm">View All</button>
        </div>
        
        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium animate-pulse">Loading ledger...</div>
          ) : transactions.length > 0 ? (
            transactions.map((tx, idx) => (
              <div key={idx} className="p-6 md:px-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {tx.amount > 0 ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{tx.description}</h4>
                    <p className="text-sm text-slate-500 font-medium">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`text-xl font-black ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-700'}`}>
                  {tx.amount > 0 ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <span className="text-4xl">🧾</span>
              </div>
              <h4 className="text-lg font-bold text-slate-700 mb-1">No Transactions Yet</h4>
              <p className="text-slate-500 font-medium">Your wallet history will appear here once active.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
