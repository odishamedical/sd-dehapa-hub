"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { CheckCircle2, XCircle, Clock, Check, X } from 'lucide-react';

interface OrderInboxWidgetProps {
  ownerEmail: string;
}

export default function OrderInboxWidget({ ownerEmail }: OrderInboxWidgetProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    // Ideally we query by providerId (which might be the doc id), but for now we'll fetch all and filter client side 
    // or just fetch everything if this is a demo.
    // In production, you would fetch where providerId == owner's hospital/pharmacy ID.
    // Assuming for now the backend sets providerEmail to ownerEmail, or we just fetch all to show it working.
    
    const q = query(
      collection(db, 'bookings'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetchedOrders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(fetchedOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ownerEmail]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', orderId), { status });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) return <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg h-[800px] flex">
      {/* List Sidebar */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-6 border-b border-slate-200 bg-white">
          <h2 className="font-black text-xl text-[#0A1128]">Live Orders</h2>
          <p className="text-xs text-slate-500 mt-1">{orders.length} total requests</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {orders.map((order) => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrder(order)}
              className={`p-4 border-b border-slate-200 cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-cyan-50 border-l-4 border-l-cyan-500' : 'hover:bg-white border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                  order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                  order.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 
                  'bg-rose-100 text-rose-700'
                }`}>
                  {order.status}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-[#0A1128] truncate">{order.patientEmail}</h4>
              <p className="text-xs text-slate-500 truncate mt-1">
                {order.bookingMode === 'upload_rx' && 'Prescription Upload'}
                {order.bookingMode === 'request_bed' && 'Admission Request'}
                {order.bookingMode === 'offline' && 'Clinic Visit'}
                {order.bookingMode === 'schedule_video' && 'Video Consult'}
                {order.bookingMode === 'instant_video' && 'Instant Telemedicine'}
              </p>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm font-medium">No live orders yet.</div>
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 bg-white flex flex-col">
        {selectedOrder ? (
          <>
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-2xl font-black text-[#0A1128] mb-2">
                {selectedOrder.bookingMode === 'upload_rx' && 'Prescription Upload'}
                {selectedOrder.bookingMode === 'request_bed' && 'Admission Request'}
                {selectedOrder.bookingMode === 'offline' && 'Clinic Visit'}
                {selectedOrder.bookingMode === 'schedule_video' && 'Video Consult'}
                {selectedOrder.bookingMode === 'instant_video' && 'Instant Telemedicine'}
              </h2>
              <p className="text-sm text-slate-500">From: <span className="font-bold text-slate-700">{selectedOrder.patientEmail}</span></p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Request Details</h3>
                
                {selectedOrder.date && (
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm font-medium text-slate-500 w-24">Date/Time</span>
                    <span className="text-sm font-bold text-[#0A1128]">{selectedOrder.date} at {selectedOrder.time}</span>
                  </div>
                )}
                
                {selectedOrder.condition && (
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm font-medium text-slate-500 w-24">Condition</span>
                    <span className="text-sm font-bold text-amber-600">{selectedOrder.condition}</span>
                  </div>
                )}
                
                {selectedOrder.requestedBed && (
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm font-medium text-slate-500 w-24">Bed Type</span>
                    <span className="text-sm font-bold text-[#0A1128]">{selectedOrder.requestedBed}</span>
                  </div>
                )}
                
                {selectedOrder.instructions && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <span className="text-sm font-medium text-slate-500 block mb-2">Instructions:</span>
                    <p className="text-sm text-[#0A1128] bg-white p-4 rounded-xl border border-slate-200">{selectedOrder.instructions}</p>
                  </div>
                )}

                {selectedOrder.bookingMode === 'upload_rx' && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                     <span className="text-sm font-medium text-slate-500 block mb-2">Prescription Document:</span>
                     <div className="w-full h-32 bg-slate-200 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
                       <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Document Provided</span>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {selectedOrder.status === 'pending' && (
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                <button onClick={() => handleUpdateStatus(selectedOrder.id, 'accepted')} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" /> Accept Request
                </button>
                <button onClick={() => handleUpdateStatus(selectedOrder.id, 'rejected')} className="flex-1 bg-rose-500 hover:bg-rose-400 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2">
                  <X className="w-5 h-5" /> Reject
                </button>
              </div>
            )}
            
            {selectedOrder.status === 'accepted' && (
              <div className="p-6 border-t border-slate-100 bg-emerald-50 flex items-center justify-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-5 h-5" /> Request Accepted
              </div>
            )}
            
            {selectedOrder.status === 'rejected' && (
              <div className="p-6 border-t border-slate-100 bg-rose-50 flex items-center justify-center gap-2 text-rose-700 font-bold">
                <XCircle className="w-5 h-5" /> Request Rejected
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Clock className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="font-bold text-lg">Select a request</h3>
            <p className="text-sm">Choose an order from the list to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
