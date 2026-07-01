"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { VaultService, VaultDocument } from '@/lib/vault.service';

interface VaultForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDocs: VaultDocument[];
  senderId: string;
  senderName: string;
  onSuccess: () => void;
}

export default function VaultForwardModal({ 
  isOpen, 
  onClose, 
  selectedDocs,
  senderId,
  senderName,
  onSuccess
}: VaultForwardModalProps) {
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [networkConnections, setNetworkConnections] = useState<any[]>([]);
  const [fetchingNetwork, setFetchingNetwork] = useState(true);

  useEffect(() => {
    if (isOpen && senderId) {
      fetchNetwork();
    }
  }, [isOpen, senderId]);

  const fetchNetwork = async () => {
    setFetchingNetwork(true);
    try {
      // Fetch where I am the initiator
      const q1 = query(collection(db, 'connections'), where('initiatorId', '==', senderId), where('status', '==', 'approved'));
      const snap1 = await getDocs(q1);
      
      // Fetch where I am the receiver
      const q2 = query(collection(db, 'connections'), where('receiverId', '==', senderId), where('status', '==', 'approved'));
      const snap2 = await getDocs(q2);

      const connections: any[] = [];
      snap1.forEach(doc => connections.push({ id: doc.id, ...doc.data(), displayRole: doc.data().receiverRole, displayName: doc.data().receiverName, targetId: doc.data().receiverId }));
      snap2.forEach(doc => connections.push({ id: doc.id, ...doc.data(), displayRole: doc.data().initiatorRole, displayName: doc.data().initiatorName, targetId: doc.data().initiatorId }));

      // Deduplicate
      const uniqueConnections = Array.from(new Map(connections.map(item => [item.targetId, item])).values());
      setNetworkConnections(uniqueConnections);
    } catch (e) {
      console.error("Error fetching network:", e);
    }
    setFetchingNetwork(false);
  };

  const handleForward = async () => {
    if (!recipient.trim()) {
      alert("Please enter a recipient Vault ID or @handle");
      return;
    }

    setLoading(true);
    try {
      let targetId = recipient.trim();
      let targetName = "User";

      // If it's a handle (e.g. @cityhospital), resolve it via VaultService
      if (targetId.startsWith('@')) {
        const resolved = await VaultService.resolveVaultHandle(targetId);
        if (!resolved) {
          alert(`Vault handle ${targetId} not found.`);
          setLoading(false);
          return;
        }
        targetId = resolved.id;
        targetName = resolved.name;
      } else {
        // If it's from the dropdown, find the name
        const conn = networkConnections.find(c => c.targetId === targetId);
        if (conn) targetName = conn.displayName;
      }

      // Forward all selected documents
      for (const doc of selectedDocs) {
        await VaultService.forwardDocument(senderId, senderName, targetId, doc);
      }

      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Error forwarding documents");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <span className="text-xl">➡️</span> Forward Documents
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-slate-600 mb-2">
              You are forwarding <span className="font-bold text-slate-900">{selectedDocs.length}</span> document(s).
            </p>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {selectedDocs.map(d => (
                <div key={d.id} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200 truncate max-w-[200px]">
                  {d.fileName}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Connection</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={recipient.startsWith('@') ? '' : recipient}
                onChange={e => setRecipient(e.target.value)}
              >
                <option value="">-- Choose from Network --</option>
                {networkConnections.map(conn => (
                  <option key={conn.targetId} value={conn.targetId}>
                    {conn.displayName} ({conn.displayRole})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs font-bold text-slate-400 uppercase">OR</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Vault Handle / Email</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="e.g. @cityhospital or patient ID"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <span className="absolute left-4 top-3 text-slate-400 font-bold">@</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleForward}
            disabled={loading}
            className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : "Forward Now ➔"}
          </button>
        </div>
      </div>
    </div>
  );
}
