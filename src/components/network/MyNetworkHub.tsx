"use client";

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ConnectionService, NetworkConnection, ConnectionStatus } from '@/services/connection.service';

export default function MyNetworkHub({ 
  providerId, 
  providerRole 
}: { 
  providerId: string | null;
  providerRole: string;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'colleagues' | 'facilities' | 'requests'>('overview');
  
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!providerId) {
      setLoading(false);
      return;
    }

    // We fetch all connections where this provider is either initiator or receiver
    const unsubReceiver = onSnapshot(query(collection(db, 'connections'), where('receiverId', '==', providerId)), (snap) => {
      const incoming = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NetworkConnection));
      
      const unsubInitiator = onSnapshot(query(collection(db, 'connections'), where('initiatorId', '==', providerId)), (snap2) => {
        const outgoing = snap2.docs.map(doc => ({ id: doc.id, ...doc.data() } as NetworkConnection));
        
        // Merge and deduplicate just in case
        const allConnections = [...incoming, ...outgoing];
        const uniqueConnections = Array.from(new Map(allConnections.map(c => [c.id, c])).values());
        
        setConnections(uniqueConnections.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setLoading(false);
      });
      
      return () => unsubInitiator();
    });

    return () => unsubReceiver();
  }, [providerId]);

  const handleAction = async (connectionId: string, action: 'approved' | 'rejected') => {
    try {
      await ConnectionService.updateConnectionStatus(connectionId, action);
    } catch (err) {
      console.error(`Error ${action} connection:`, err);
      alert(`Failed to ${action} request. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Categorize connections
  const pendingRequests = connections.filter(c => c.status === 'pending' && c.receiverId === providerId);
  
  const approvedConnections = connections.filter(c => c.status === 'approved');
  
  const patients = approvedConnections.filter(c => 
    (c.initiatorRole === 'patient' && c.initiatorId !== providerId) || 
    (c.receiverRole === 'patient' && c.receiverId !== providerId)
  );
  
  const colleagues = approvedConnections.filter(c => 
    (c.initiatorRole === 'doctor' && c.initiatorId !== providerId) || 
    (c.receiverRole === 'doctor' && c.receiverId !== providerId)
  );

  const facilities = approvedConnections.filter(c => 
    (['hospital', 'lab', 'pharmacy'].includes(c.initiatorRole) && c.initiatorId !== providerId) || 
    (['hospital', 'lab', 'pharmacy'].includes(c.receiverRole) && c.receiverId !== providerId)
  );

  // Helper to get the "other person" in the connection
  const getOtherParty = (conn: NetworkConnection) => {
    if (conn.initiatorId === providerId) {
      return { name: conn.receiverName, role: conn.receiverRole, id: conn.receiverId };
    } else {
      return { name: conn.initiatorName, role: conn.initiatorRole, id: conn.initiatorId };
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'requests', label: 'Requests', count: pendingRequests.length },
    { id: 'patients', label: 'Patients', count: patients.length },
    { id: 'colleagues', label: 'Colleagues', count: colleagues.length },
    { id: 'facilities', label: 'Facilities', count: facilities.length },
  ] as const;

  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-6 sm:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-800">My Network</h2>
          <p className="text-slate-500 text-sm">Manage your patients, colleagues, and facility connections.</p>
        </div>
      </div>

      {/* Internal Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-6 custom-scrollbar">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white/60 text-slate-600 hover:bg-white border border-white/60 hover:border-slate-200'}`}
          >
            {item.label}
            {item.count !== null && item.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === item.id ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {connections.length === 0 ? (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40 skew-x-12 translate-x-[-150%] animate-[shimmer_3s_infinite]"></div>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100 relative z-10">
                  <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">Your Network is Empty</h3>
                <p className="text-slate-600 max-w-md mx-auto mb-8 relative z-10">Start building your medical network today to securely share records, give 2nd opinions, and route e-prescriptions.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                  <div className="bg-white p-5 rounded-2xl shadow-sm text-left border border-slate-100">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 font-bold">1</div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Share QR Code</h4>
                    <p className="text-xs text-slate-500">Ask patients to scan your public profile QR code.</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm text-left border border-slate-100">
                    <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mb-3 font-bold">2</div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Patients Connect</h4>
                    <p className="text-xs text-slate-500">They click "Request Connection" on your profile.</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm text-left border border-slate-100">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3 font-bold">3</div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">You Approve</h4>
                    <p className="text-xs text-slate-500">Accept requests here to link their secure vault.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="bg-white/60 border border-white p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-bold mb-1">Total Network Size</p>
                      <p className="text-4xl font-black text-slate-800">{approvedConnections.length}</p>
                    </div>
                    <div className="mt-4 w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg></div>
                 </div>
                 <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('patients')}>
                    <div>
                      <p className="text-emerald-700 text-sm font-bold mb-1">Connected Patients</p>
                      <p className="text-4xl font-black text-emerald-900">{patients.length}</p>
                    </div>
                    <div className="mt-4 w-10 h-10 bg-white text-emerald-500 rounded-xl flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
                 </div>
                 <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('colleagues')}>
                    <div>
                      <p className="text-sky-700 text-sm font-bold mb-1">Colleagues</p>
                      <p className="text-4xl font-black text-sky-900">{colleagues.length}</p>
                    </div>
                    <div className="mt-4 w-10 h-10 bg-white text-sky-500 rounded-xl flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div>
                 </div>
                 <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('facilities')}>
                    <div>
                      <p className="text-purple-700 text-sm font-bold mb-1">Facilities</p>
                      <p className="text-4xl font-black text-purple-900">{facilities.length}</p>
                    </div>
                    <div className="mt-4 w-10 h-10 bg-white text-purple-500 rounded-xl flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="animate-in fade-in">
            {pendingRequests.length === 0 ? (
               <div className="text-center py-16 bg-white/40 rounded-3xl border border-white/60 border-dashed">
                 <p className="text-slate-500 font-bold">No pending connection requests</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map(req => (
                  <div key={req.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm">
                          {req.initiatorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{req.initiatorName}</h4>
                          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{req.initiatorRole}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-md">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => handleAction(req.id!, 'approved')}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleAction(req.id!, 'rejected')}
                        className="flex-1 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 text-sm font-bold py-2.5 rounded-xl transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LIST TABS (PATIENTS, COLLEAGUES, FACILITIES) */}
        {['patients', 'colleagues', 'facilities'].includes(activeTab) && (
          <div className="animate-in fade-in">
            {(() => {
              const list = activeTab === 'patients' ? patients : activeTab === 'colleagues' ? colleagues : facilities;
              if (list.length === 0) {
                 return (
                   <div className="text-center py-16 bg-white/40 rounded-3xl border border-white/60 border-dashed">
                     <p className="text-slate-500 font-bold">No connected {activeTab} yet.</p>
                   </div>
                 );
              }
              return (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Name</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Role</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Connected Since</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {list.map(conn => {
                        const other = getOtherParty(conn);
                        return (
                          <tr key={conn.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${activeTab === 'patients' ? 'bg-emerald-100 text-emerald-700' : activeTab === 'colleagues' ? 'bg-sky-100 text-sky-700' : 'bg-purple-100 text-purple-700'}`}>
                                  {other.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-bold text-slate-800">{other.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{other.role}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-500">{new Date(conn.updatedAt || conn.createdAt).toLocaleDateString()}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {activeTab === 'patients' && (
                                <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                  View Vault
                                </button>
                              )}
                              {activeTab === 'colleagues' && (
                                <button className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                  Refer Patient
                                </button>
                              )}
                              {activeTab === 'facilities' && (
                                <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                  Route Order
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
}
