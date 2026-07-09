"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { VaultDocument } from '@/lib/vault.service';
import { ExtensionPoint } from '@/plugins/core/ExtensionPoint';

export default function PharmacyFulfillmentWidget({ providerId }: { providerId: string }) {
  const [orders, setOrders] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotingOrderId, setQuotingOrderId] = useState<string | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<string>('');
  
  // Status filters: New, Quoted, Paid, Dispatched
  const [activeTab, setActiveTab] = useState<'New' | 'Quoted' | 'Paid' | 'Dispatched'>('New');

  useEffect(() => {
    if (!providerId) { setLoading(false); return; }

    const q = query(
      collection(db, `medicalVault/${providerId}/records`),
      where("folder", "==", "inbox"),
      where("recordType", "==", "prescription"),
      orderBy("uploadDate", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VaultDocument));
      // Map legacy undefined status to 'New'
      const sanitized = data.map(d => ({...d, fulfillmentStatus: d.fulfillmentStatus || 'New'}));
      setOrders(sanitized);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [providerId]);

  const handleUpdateStatus = async (id: string, newStatus: VaultDocument['fulfillmentStatus']) => {
    try {
      await updateDoc(doc(db, `medicalVault/${providerId}/records`, id), {
        fulfillmentStatus: newStatus
      });
    } catch (err) {
      console.error("Error updating order status", err);
    }
  };

  const handleSendQuote = async (id: string) => {
    if (!quoteAmount || isNaN(Number(quoteAmount))) return;
    try {
      await updateDoc(doc(db, `medicalVault/${providerId}/records`, id), {
        fulfillmentStatus: 'Quoted',
        quoteAmount: Number(quoteAmount)
      });
      setQuotingOrderId(null);
      setQuoteAmount('');
      
      // Simulate SMS Alert
      alert("Payment Link Sent to Patient via SMS & WhatsApp!");
    } catch (err) {
      console.error("Error sending quote", err);
    }
  };

  const filteredOrders = orders.filter(o => o.fulfillmentStatus === activeTab);
  
  const counts = {
    New: orders.filter(o => o.fulfillmentStatus === 'New').length,
    Quoted: orders.filter(o => o.fulfillmentStatus === 'Quoted').length,
    Paid: orders.filter(o => o.fulfillmentStatus === 'Paid').length,
    Dispatched: orders.filter(o => o.fulfillmentStatus === 'Dispatched').length,
  };

  if (loading) {
    return (
      <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      
      {/* HEADER */}
      <div className="bg-slate-900 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-black text-white flex items-center gap-3">
             <div className="w-10 h-10 bg-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
             </div>
             Rx Fulfillment Hub
           </h2>
           <p className="text-slate-400 text-sm mt-1">Manage incoming digital prescriptions from doctors.</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto border-b border-white/40 bg-white/10 px-4 pt-4 custom-scrollbar">
         {(['New', 'Quoted', 'Paid', 'Dispatched'] as const).map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`px-6 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-teal-600 text-teal-800 bg-teal-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/20'}`}
           >
             {tab} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{counts[tab]}</span>
           </button>
         ))}
      </div>
      
      {/* CONTENT */}
      <div className="p-6 md:p-8 min-h-[300px]">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-white/60 rounded-2xl bg-white/40">
            <svg className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-slate-600 font-black text-xl mb-2">No {activeTab} Orders</p>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Incoming prescriptions from the B2B network will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white/70 backdrop-blur-md border border-white rounded-[24px] p-6 shadow-lg hover:shadow-xl transition-all flex flex-col relative overflow-hidden">
                
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex justify-between items-start mb-6 z-10">
                   <div>
                     <h4 className="text-2xl font-black text-slate-900 font-serif">{order.patientName}</h4>
                     <p className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-2">
                       <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                       Referred by: {order.senderName || "Unknown Doctor"}
                     </p>
                   </div>
                   <div className="text-right">
                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{order.uploadDate?.toDate ? order.uploadDate.toDate().toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : "Just Now"}</span>
                   </div>
                </div>
                
                <div className="mb-6 z-10">
                  <a href={order.fileUrl} target="_blank" className="flex items-center gap-4 p-4 bg-teal-50 border border-teal-100 rounded-xl group hover:bg-teal-100 transition-colors">
                    <div className="w-12 h-12 bg-teal-600 text-white rounded-lg flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                      <p className="font-bold text-teal-900">{order.fileName}</p>
                      <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mt-1">View Prescription PDF</p>
                    </div>
                  </a>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-200 z-10">
                  {/* WORKFLOW BUTTONS */}
                  
                  {activeTab === 'New' && (
                    <div className="flex flex-col gap-3">
                      {quotingOrderId === order.id ? (
                        <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
                          <span className="text-xl font-bold text-slate-500">₹</span>
                          <input 
                            type="number" 
                            value={quoteAmount}
                            onChange={(e) => setQuoteAmount(e.target.value)}
                            placeholder="Enter Amount"
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 font-bold focus:border-teal-500 outline-none"
                            autoFocus
                          />
                          <button onClick={() => handleSendQuote(order.id)} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-colors">Send Link</button>
                          <button onClick={() => setQuotingOrderId(null)} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setQuotingOrderId(order.id)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-transform hover:-translate-y-0.5 shadow-xl flex items-center justify-center gap-2"
                        >
                          Generate Quote & Send Payment Link
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                      )}
                    </div>
                  )}

                  {activeTab === 'Quoted' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount Quoted</p>
                        <p className="text-2xl font-black text-slate-900">₹{order.quoteAmount}</p>
                      </div>
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'Paid')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-colors shadow-lg flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Mark as Paid
                      </button>
                    </div>
                  )}

                  {activeTab === 'Paid' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Payment Received
                      </div>
                      <ExtensionPoint 
                        name="pharmacy_dispatch_actions" 
                        order={order} 
                        onDispatch={() => handleUpdateStatus(order.id, 'Dispatched')} 
                      />
                    </div>
                  )}

                  {activeTab === 'Dispatched' && (
                    <div className="flex items-center justify-between w-full bg-slate-50 p-4 rounded-xl border border-slate-200">
                       <span className="font-bold text-slate-600">Order Completed</span>
                       <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
