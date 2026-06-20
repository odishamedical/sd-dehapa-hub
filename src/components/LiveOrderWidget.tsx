"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';

export default function LiveOrderWidget({ providerId, providerType }: { providerId: string, providerType: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) return;

    const q = query(
      collection(db, "orders"),
      where("providerId", "==", providerId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [providerId]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", id), {
        status: newStatus
      });
    } catch (err) {
      console.error("Error updating order status", err);
    }
  };

  const pendingCount = orders.filter(o => o.status === 'Pending Review').length;
  const fulfilledCount = orders.filter(o => o.status === 'Completed').length;

  if (loading) {
    return (
      <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-200 pb-4 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">
          {providerType === 'pharmacy' ? "Rx Inbox & Orders" : "Lab Orders"}
        </h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">{pendingCount} Pending</span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">{fulfilledCount} Completed</span>
        </div>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-white/60 rounded-2xl bg-white/40">
          <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <p className="text-slate-500 font-bold mb-2">No incoming orders yet</p>
          <p className="text-sm text-slate-400">Digital requests from patients will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                
                {/* Left Side: Order Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-700' : 
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{new Date(order.timestamp?.toDate()).toLocaleDateString() || "Just Now"}</span>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{order.patientName}</h4>
                    <p className="text-sm text-slate-500">{order.patientEmail} • {order.patientPhone}</p>
                  </div>
                  
                  {order.notes && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-sm text-slate-700"><span className="font-bold text-slate-900">Patient Note:</span> {order.notes}</p>
                    </div>
                  )}

                  {order.fileUrl && (
                    <a href={order.fileUrl} target="_blank" className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 text-sm font-bold bg-cyan-50 px-4 py-2 rounded-xl">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                      View Uploaded Document
                    </a>
                  )}
                </div>

                {/* Right Side: Actions */}
                <div className="flex flex-col gap-2 shrink-0 md:w-48">
                  {order.status === 'Pending Review' && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, "Processing")}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                    >
                      Accept Order
                    </button>
                  )}
                  {order.status === 'Processing' && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, "Completed")}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                    >
                      Mark Completed
                    </button>
                  )}
                  <a 
                    href={`tel:${order.patientPhone || ""}`}
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-center transition-colors block"
                  >
                    Contact Patient
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
