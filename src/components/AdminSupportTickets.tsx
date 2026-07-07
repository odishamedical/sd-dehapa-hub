import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const q = query(collection(db, "admin_support_tickets"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTickets(data);
      } catch (err) {
        console.error("Error fetching support tickets", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await updateDoc(doc(db, "admin_support_tickets", id), { status: "resolved" });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "resolved" } : t));
    } catch (err) {
      console.error("Failed to resolve ticket", err);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === 'open' && t.status !== 'pending' && t.status !== 'open') return false;
    if (filter === 'resolved' && t.status !== 'resolved') return false;
    if (filter === 'onboarding' && t.source !== 'onboarding_dashboard') return false;
    if (filter === 'patient' && t.source === 'onboarding_dashboard') return false;
    return true;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold">Support & Coordinator Requests</h3>
          <p className="text-sm text-slate-500">Manage patient requests and provider onboarding assistance.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
           {['all', 'open', 'resolved', 'onboarding', 'patient'].map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${filter === f ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500 hover:text-slate-700'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <p className="font-bold text-slate-900 mb-1">No Support Tickets</p>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">When users request help, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map(ticket => {
            const isOpen = ticket.status === 'open' || ticket.status === 'pending';
            const isOnboarding = ticket.source === 'onboarding_dashboard';
            
            return (
              <div key={ticket.id} className={`border rounded-xl p-5 transition-all ${isOpen ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block ${isOpen ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                      {ticket.status}
                    </span>
                    {isOnboarding ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-2 ml-2 inline-block bg-indigo-100 text-indigo-700">
                        Provider Onboarding
                      </span>
                    ) : (
                       <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-2 ml-2 inline-block bg-rose-100 text-rose-700">
                         Patient Request
                       </span>
                    )}
                    <h4 className="font-bold text-slate-900">{isOnboarding ? ticket.name : ticket.patientEmail}</h4>
                    <p className="text-xs text-slate-500">
                      {isOnboarding ? (
                        <>Role: <span className="font-semibold text-slate-700 uppercase">{ticket.role}</span> | Subject: <span className="font-semibold text-slate-700">{ticket.subject}</span></>
                      ) : (
                        <>Looking for: <span className="font-semibold text-slate-700">{ticket.providerTypeRequested}</span></>
                      )}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-xs text-slate-500">{ticket.timestamp ? new Date(ticket.timestamp.toMillis()).toLocaleString() : 'Just now'}</p>
                    {isOpen && (
                      <button 
                        onClick={() => handleResolve(ticket.id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {isOnboarding && ticket.providerId && (
                       <a href={`/portal/${ticket.role}?adminViewId=${ticket.providerId}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-teal-600 hover:underline">
                         View Dashboard &rarr;
                       </a>
                    )}
                  </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-lg p-4 mt-3">
                  <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap">"{isOnboarding ? ticket.message : ticket.query}"</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
