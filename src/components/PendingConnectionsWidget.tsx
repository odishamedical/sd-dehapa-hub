"use client";

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { ConnectionService, NetworkConnection } from '@/services/connection.service';

export default function PendingConnectionsWidget({ providerId }: { providerId: string | null }) {
  const [user] = useAuthState(auth);
  const [pendingRequests, setPendingRequests] = useState<NetworkConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'connections'),
      where('receiverId', '==', providerId),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs: NetworkConnection[] = [];
      snapshot.forEach(doc => {
        reqs.push({ id: doc.id, ...doc.data() } as NetworkConnection);
      });
      setPendingRequests(reqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [providerId]);

  const handleAction = async (connectionId: string, action: 'approved' | 'rejected') => {
    setProcessingId(connectionId);
    try {
      await ConnectionService.updateConnectionStatus(connectionId, action);
    } catch (err) {
      console.error(`Error ${action} connection:`, err);
      alert(`Failed to ${action} request. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full min-h-[300px] flex flex-col">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          Pending Connections
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 shadow-sm border border-indigo-100 h-full min-h-[300px] flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          Connection Requests
        </h3>
        {pendingRequests.length > 0 && (
          <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-full">{pendingRequests.length}</span>
        )}
      </div>

      <div className="flex-1 relative z-10 overflow-y-auto pr-1 custom-scrollbar">
        {pendingRequests.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <p className="text-sm font-bold text-slate-700">No pending requests</p>
            <p className="text-xs text-slate-500 mt-1">When patients scan your QR code and request a connection, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm truncate">{req.initiatorName}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">{req.initiatorRole}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                  <button 
                    onClick={() => handleAction(req.id!, 'approved')}
                    disabled={processingId === req.id}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleAction(req.id!, 'rejected')}
                    disabled={processingId === req.id}
                    className="flex-1 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
