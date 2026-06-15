"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

interface WhatsAppSession {
  id: string; // The phone number
  state: string;
  lastInteraction?: any;
}

export default function AdminWhatsAppDashboard() {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'whatsapp_sessions')); // Ideally order by lastInteraction
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sess: WhatsAppSession[] = [];
      snapshot.forEach((doc) => {
        sess.push({ id: doc.id, ...doc.data() } as WhatsAppSession);
      });
      // Sort by interaction client side since we might not have indexes yet
      sess.sort((a, b) => {
        const timeA = a.lastInteraction?.toMillis() || 0;
        const timeB = b.lastInteraction?.toMillis() || 0;
        return timeB - timeA;
      });
      setSessions(sess);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching sessions: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">WhatsApp Live Sessions</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time view of patients interacting with your bot.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-teal-100 text-teal-800 rounded-lg text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            Bot Online
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center p-12 text-slate-400">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-xl">
            <h3 className="text-lg font-bold text-slate-700">No Active Sessions</h3>
            <p className="text-slate-500 mt-1">When users message your WhatsApp Bot, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold bg-slate-50">
                  <th className="px-4 py-3">Phone Number</th>
                  <th className="px-4 py-3">Current Bot State</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-4 font-mono text-sm text-slate-900 font-medium">
                      +{sess.id}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {sess.state}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {sess.lastInteraction ? new Date(sess.lastInteraction.toMillis()).toLocaleString() : 'Unknown'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button className="text-sm font-bold text-teal-600 hover:text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
