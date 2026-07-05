"use client";

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { ConnectionService, NetworkConnection } from '@/services/connection.service';
import SuggestedConnectionsWidget from './SuggestedConnectionsWidget';

export default function MyNetworkHub({ 
  providerId, 
  providerRole,
  viewMode = 'all'
}: { 
  providerId: string | null;
  providerRole: string;
  viewMode?: 'all' | 'b2c' | 'b2b' | 'care_team';
}) {
  const [user, setUser] = useState<User | null>(null);
  
  // Default active tab based on view mode
  const getDefaultTab = () => {
    if (viewMode === 'b2c') return 'patients';
    if (viewMode === 'b2b') return 'overview_b2b';
    if (viewMode === 'care_team' || providerRole === 'patient') return 'overview_care_team';
    return 'overview';
  };
  
  const [activeTab, setActiveTab] = useState<string>(getDefaultTab());
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState<string | null>(null); // connection ID

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

    const unsubReceiver = onSnapshot(query(collection(db, 'connections'), where('receiverId', '==', providerId)), (snap) => {
      const incoming = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NetworkConnection));
      
      const unsubInitiator = onSnapshot(query(collection(db, 'connections'), where('initiatorId', '==', providerId)), (snap2) => {
        const outgoing = snap2.docs.map(doc => ({ id: doc.id, ...doc.data() } as NetworkConnection));
        
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
      if (action === 'approved' && providerRole === 'patient') {
        // Show modal to ask for vault permission before approving
        setShowPermissionModal(connectionId);
        return;
      }
      await ConnectionService.updateConnectionStatus(connectionId, action);
    } catch (err) {
      console.error(`Error ${action} connection:`, err);
      alert(`Failed to ${action} request. Please try again.`);
    }
  };

  const grantPermissionAndApprove = async (duration: '24h' | 'lifelong' | 'none') => {
    if (!showPermissionModal) return;
    try {
      let expiresAt = null;
      if (duration === '24h') {
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }
      
      // Update connection in Firestore manually since we added new fields
      const connRef = doc(db, 'connections', showPermissionModal);
      await updateDoc(connRef, {
        status: 'approved',
        vaultAccessType: duration,
        vaultAccessExpiresAt: expiresAt,
        updatedAt: new Date().toISOString()
      });
      setShowPermissionModal(null);
    } catch (err) {
      console.error("Error setting permissions:", err);
      alert("Failed to approve connection.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const pendingRequests = connections.filter(c => c.status === 'pending' && c.receiverId === providerId);
  const approvedConnections = connections.filter(c => c.status === 'approved');
  
  const patients = approvedConnections.filter(c => 
    (c.initiatorRole === 'patient' && c.initiatorId !== providerId) || 
    (c.receiverRole === 'patient' && c.receiverId !== providerId)
  );
  
  const partners = approvedConnections.filter(c => 
    (c.initiatorRole !== 'patient' && c.initiatorId !== providerId) || 
    (c.receiverRole !== 'patient' && c.receiverId !== providerId)
  );

  const getOtherParty = (conn: NetworkConnection) => {
    if (conn.initiatorId === providerId) {
      return { name: conn.receiverName, role: conn.receiverRole, id: conn.receiverId };
    } else {
      return { name: conn.initiatorName, role: conn.initiatorRole, id: conn.initiatorId };
    }
  };

  // Group partners by role
  const getRoleConnections = (targetRole: string) => partners.filter(c => getOtherParty(c).role === targetRole);
  const getAssociates = () => partners.filter(c => getOtherParty(c).role === providerRole);

  // Dynamic Navigation Items based on viewMode
  let navItems: any[] = [];

  if (providerRole === 'patient' || viewMode === 'care_team') {
    navItems = [
      { id: 'overview_care_team', label: 'Overview', count: null },
      { id: 'doctors', label: 'My Doctors', count: getRoleConnections('doctor').length },
      { id: 'hospitals', label: 'My Hospitals', count: getRoleConnections('hospital').length },
      { id: 'labs', label: 'My Labs', count: getRoleConnections('lab').length },
      { id: 'pharmacies', label: 'My Pharmacies', count: getRoleConnections('pharmacy').length },
      { id: 'ambulances', label: 'My Ambulances', count: getRoleConnections('ambulance').length },
      { id: 'requests', label: 'Requests', count: pendingRequests.length },
    ];
  } else if (viewMode === 'b2c') {
    navItems = [
      { id: 'patients', label: 'All Patients', count: patients.length },
      { id: 'requests', label: 'Patient Requests', count: pendingRequests.filter(c => c.initiatorRole === 'patient').length },
    ];
  } else if (viewMode === 'b2b') {
    navItems = [
      { id: 'overview_b2b', label: 'Overview', count: null },
      { id: 'doctors', label: 'Doctors', count: getRoleConnections('doctor').length },
      { id: 'hospitals', label: 'Hospitals', count: getRoleConnections('hospital').length },
      { id: 'labs', label: 'Labs', count: getRoleConnections('lab').length },
      { id: 'pharmacies', label: 'Pharmacies', count: getRoleConnections('pharmacy').length },
      { id: 'ambulances', label: 'Ambulances', count: getRoleConnections('ambulance').length },
      { id: 'associates', label: 'My Associates', count: getAssociates().length },
      { id: 'requests', label: 'B2B Requests', count: pendingRequests.filter(c => c.initiatorRole !== 'patient').length },
    ];
  } else {
    // Fallback 'all' mode
    navItems = [
      { id: 'overview', label: 'Overview', count: null },
      { id: 'patients', label: 'My Patients (B2C)', count: patients.length },
      { id: 'partners', label: 'My Partners (B2B)', count: partners.length },
      { id: 'requests', label: 'Requests', count: pendingRequests.length },
    ];
  }

  // Filter out empty counts for cleaner UI (optional, but requested by user to keep it organized)
  // Actually, we'll keep them visible so users know they can connect to these categories.

  const renderTable = (list: NetworkConnection[], emptyMsg: string, isPatientList: boolean = false) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-16 bg-white/40 rounded-3xl border border-white/60 border-dashed">
          <p className="text-slate-500 font-bold">{emptyMsg}</p>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Name</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Role</th>
              {!isPatientList && providerRole === 'patient' && (
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Vault Access</th>
              )}
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map(conn => {
              const other = getOtherParty(conn);
              
              // @ts-ignore - custom fields
              const accessType = conn.vaultAccessType || 'lifelong';
              // @ts-ignore
              const expiresAt = conn.vaultAccessExpiresAt ? new Date(conn.vaultAccessExpiresAt) : null;
              const isExpired = expiresAt && expiresAt < new Date();

              return (
                <tr key={conn.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-indigo-100 text-indigo-700">
                        {other.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800">{other.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{other.role}</span>
                  </td>
                  {!isPatientList && providerRole === 'patient' && (
                    <td className="px-6 py-4">
                      {accessType === 'none' ? (
                        <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">Denied</span>
                      ) : isExpired ? (
                        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">Expired</span>
                      ) : accessType === '24h' ? (
                        <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">24-Hour</span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Lifelong</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="px-4 py-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                      Message
                    </button>
                    {isPatientList && (
                      <button className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors shadow-sm">
                        View Vault
                      </button>
                    )}
                    {!isPatientList && (
                       <button className="px-4 py-2 bg-slate-50 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm">
                         View Profile
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
  };

  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-6 sm:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4 relative">
      
      {/* Vault Permission Modal */}
      {showPermissionModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm rounded-[32px] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
             <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
             </div>
             <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Vault Access Permission</h3>
             <p className="text-slate-500 text-sm text-center mb-8">How much access should this provider have to your medical records?</p>
             
             <div className="space-y-3">
               <button onClick={() => grantPermissionAndApprove('lifelong')} className="w-full p-4 border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 rounded-2xl text-left transition-colors group">
                 <div className="font-bold text-emerald-800 flex justify-between">Lifelong Access <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span></div>
                 <div className="text-xs text-emerald-600 mt-1">Best for your primary doctor. They can always view your latest records.</div>
               </button>
               <button onClick={() => grantPermissionAndApprove('24h')} className="w-full p-4 border-2 border-amber-100 hover:border-amber-500 hover:bg-amber-50 rounded-2xl text-left transition-colors group">
                 <div className="font-bold text-amber-800 flex justify-between">24-Hour Access <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span></div>
                 <div className="text-xs text-amber-600 mt-1">Best for labs, pharmacies, or walk-in clinics. Access revokes automatically.</div>
               </button>
               <button onClick={() => grantPermissionAndApprove('none')} className="w-full p-4 border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-50 rounded-2xl text-left transition-colors group">
                 <div className="font-bold text-slate-700 flex justify-between">Deny Access (Chat Only) <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span></div>
                 <div className="text-xs text-slate-500 mt-1">They can message you, but cannot see your prescriptions or reports.</div>
               </button>
             </div>
             
             <button onClick={() => setShowPermissionModal(null)} className="w-full mt-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
               Cancel
             </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
          {viewMode === 'b2c' ? (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          ) : viewMode === 'b2b' ? (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          ) : (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-white">
            {viewMode === 'b2c' ? 'My Patients CRM' : viewMode === 'b2b' ? 'B2B Network' : providerRole === 'patient' ? 'My Care Team' : 'My Network'}
          </h2>
          <p className="text-slate-200 text-sm">
            {viewMode === 'b2c' ? 'Manage your patient relationships and EMR access.' : viewMode === 'b2b' ? 'Collaborate with doctors, labs, and hospitals.' : 'Manage your trusted health connections.'}
          </p>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-4 mb-6 custom-scrollbar">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
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
        
        {/* OVERVIEWS */}
        {(activeTab === 'overview' || activeTab === 'overview_care_team' || activeTab === 'overview_b2b') && (
          <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 <div className="bg-white/60 border border-white p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-bold mb-1">Total {activeTab === 'overview_b2b' ? 'Partners' : 'Connections'}</p>
                      <p className="text-4xl font-black text-slate-800">{activeTab === 'overview_b2b' ? partners.length : approvedConnections.length}</p>
                    </div>
                    <div className="mt-4 w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg></div>
                 </div>
                 
                 {/* B2B specific stats */}
                 {activeTab === 'overview_b2b' && (
                   <>
                     <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between cursor-pointer" onClick={() => setActiveTab('doctors')}>
                        <div>
                          <p className="text-purple-700 text-sm font-bold mb-1">Doctors Connected</p>
                          <p className="text-4xl font-black text-purple-900">{getRoleConnections('doctor').length}</p>
                        </div>
                     </div>
                     <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between cursor-pointer" onClick={() => setActiveTab('labs')}>
                        <div>
                          <p className="text-orange-700 text-sm font-bold mb-1">Labs Connected</p>
                          <p className="text-4xl font-black text-orange-900">{getRoleConnections('lab').length}</p>
                        </div>
                     </div>
                   </>
                 )}

                 {/* Patient specific stats */}
                 {activeTab === 'overview_care_team' && (
                   <>
                     <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between cursor-pointer" onClick={() => setActiveTab('doctors')}>
                        <div>
                          <p className="text-sky-700 text-sm font-bold mb-1">My Doctors</p>
                          <p className="text-4xl font-black text-sky-900">{getRoleConnections('doctor').length}</p>
                        </div>
                     </div>
                     <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between cursor-pointer" onClick={() => setActiveTab('pharmacies')}>
                        <div>
                          <p className="text-emerald-700 text-sm font-bold mb-1">My Pharmacies</p>
                          <p className="text-4xl font-black text-emerald-900">{getRoleConnections('pharmacy').length}</p>
                        </div>
                     </div>
                   </>
                 )}
              </div>
            {activeTab !== 'overview_b2b' && (
              <SuggestedConnectionsWidget 
                currentUserId={providerId} 
                currentUserRole={providerRole} 
                currentConnections={connections} 
              />
            )}
          </div>
        )}

        {/* REQUESTS */}
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

        {/* LISTINGS */}
        {activeTab === 'patients' && renderTable(patients, "No patients connected yet.", true)}
        {activeTab === 'partners' && renderTable(partners, "No B2B partners connected yet.", false)}
        
        {/* SUB-TABS for Care Team & B2B */}
        {activeTab === 'doctors' && renderTable(getRoleConnections('doctor'), "No Doctors connected yet.", false)}
        {activeTab === 'hospitals' && renderTable(getRoleConnections('hospital'), "No Hospitals connected yet.", false)}
        {activeTab === 'labs' && renderTable(getRoleConnections('lab'), "No Labs connected yet.", false)}
        {activeTab === 'pharmacies' && renderTable(getRoleConnections('pharmacy'), "No Pharmacies connected yet.", false)}
        {activeTab === 'ambulances' && renderTable(getRoleConnections('ambulance'), "No Ambulances connected yet.", false)}
        {activeTab === 'associates' && renderTable(getAssociates(), "No Associates connected yet.", false)}

      </div>
    </div>
  );
}
