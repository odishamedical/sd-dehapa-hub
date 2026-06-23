"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UniversalShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentData: any;
  senderData: {
    id: string;
    name: string;
    role: string;
  };
}

export default function UniversalShareModal({ isOpen, onClose, documentData, senderData }: UniversalShareModalProps) {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchConnections = async () => {
      setLoading(true);
      try {
        const q1 = query(collection(db, "connections"), where("initiatorId", "==", senderData.id), where("status", "==", "approved"));
        const q2 = query(collection(db, "connections"), where("receiverId", "==", senderData.id), where("status", "==", "approved"));
        
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        
        const all = [...snap1.docs, ...snap2.docs].map(d => {
          const data = d.data();
          if (data.initiatorId === senderData.id) {
             return { id: data.receiverId, name: data.receiverName, role: data.receiverRole };
          } else {
             return { id: data.initiatorId, name: data.initiatorName, role: data.initiatorRole };
          }
        });
        
        // Remove duplicates if any
        const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
        setConnections(unique);
      } catch (err) {
        console.error("Failed to fetch connections", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
    setSuccess(false);
    setSelectedId(null);
  }, [isOpen, senderData.id]);

  if (!isOpen) return null;

  const filteredConnections = filter === 'all' 
    ? connections 
    : connections.filter(c => c.role === filter);

  const handleShare = async () => {
    if (!selectedId) return;
    setSharing(true);

    try {
      const targetUser = connections.find(c => c.id === selectedId);
      
      const vaultRecord = {
        ...documentData,
        // Override or inject sharing metadata
        sharedBy: {
          id: senderData.id,
          name: senderData.name,
          role: senderData.role
        },
        patientId: targetUser?.id, // Routing to their vault
        sharedAt: serverTimestamp(),
        isSharedCopy: true
      };

      // Add to the 'records' subcollection of the target user's vault
      await addDoc(collection(db, "records"), vaultRecord);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error("Share failed", err);
      alert("Failed to share document.");
    } finally {
      setSharing(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'doctor': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'patient': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'lab': return 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200';
      case 'pharmacy': return 'bg-teal-100 text-teal-600 border-teal-200';
      case 'hospital': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'ambulance': return 'bg-amber-100 text-amber-600 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'doctor': return '⚕️';
      case 'patient': return '👤';
      case 'lab': return '🔬';
      case 'pharmacy': return '💊';
      case 'hospital': return '🏥';
      case 'ambulance': return '🚑';
      default: return '🔗';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
              Share to Network Vault
            </h2>
            <p className="text-xs text-slate-500 mt-1">Securely route this document to a connected partner</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {success ? (
          <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Securely Routed!</h3>
            <p className="text-slate-500">The document has been securely copied to their Network Vault.</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
              {['all', 'patient', 'doctor', 'lab', 'pharmacy', 'hospital', 'ambulance'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors ${filter === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {f === 'all' ? 'All Connections' : f + 's'}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredConnections.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 border-dashed">
                  <div className="text-4xl mb-3">📭</div>
                  <h4 className="text-slate-800 font-bold mb-1">No connections found</h4>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    {filter === 'all' 
                      ? "You haven't connected with anyone in your Network Hub yet." 
                      : `You have no connected ${filter}s. Go to your Network Hub to invite them!`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredConnections.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedId(c.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedId === c.id ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-xl ${getRoleColor(c.role)}`}>
                          {getRoleIcon(c.role)}
                        </div>
                        <div>
                          <h4 className="text-slate-800 font-bold">{c.name}</h4>
                          <p className="text-xs text-slate-500 capitalize">{c.role}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedId === c.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                        {selectedId === c.id && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-6 bg-white flex justify-between items-center">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                End-to-End Encrypted Transfer
              </p>
              
              <button 
                disabled={!selectedId || sharing}
                onClick={handleShare}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 group relative"
              >
                {sharing ? 'Routing...' : 'Send to Vault'}
                {!sharing && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                
                {selectedId && !sharing && (
                  <div className="absolute bottom-full right-0 mb-3 w-64 bg-slate-900 text-white text-xs font-medium p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    This document will be securely routed to the selected connection's private vault.
                    <div className="absolute top-full right-6 w-3 h-3 bg-slate-900 transform rotate-45 -mt-1.5"></div>
                  </div>
                )}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
