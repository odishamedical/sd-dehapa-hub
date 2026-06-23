"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NetworkConnection, ConnectionService } from '@/services/connection.service';

interface SuggestedWidgetProps {
  currentUserId: string | null;
  currentUserRole: string;
  currentConnections: NetworkConnection[];
}

export default function SuggestedConnectionsWidget({ currentUserId, currentUserRole, currentConnections }: SuggestedWidgetProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingRequestTo, setSendingRequestTo] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        // Logic: 
        // If current user is Patient -> Suggest Doctors, Labs, Pharmacies
        // If current user is Doctor -> Suggest Hospitals, Labs, Pharmacies, other Doctors
        const targetRoles = currentUserRole === 'patient' 
          ? ['doctor', 'lab', 'pharmacy', 'hospital'] 
          : ['doctor', 'hospital', 'lab', 'pharmacy'];

        const q = query(
          collection(db, "directory"),
          where("role", "in", targetRoles),
          limit(10)
        );
        const snap = await getDocs(q);
        
        // Exclude self and already connected people
        const connectedIds = currentConnections.map(c => 
          c.initiatorId === currentUserId ? c.receiverId : c.initiatorId
        );
        
        const results = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(d => d.id !== currentUserId && !connectedIds.includes(d.id))
          .slice(0, 3); // Take top 3

        setSuggestions(results);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [currentUserId, currentUserRole, currentConnections]);

  const handleConnect = async (targetUser: any) => {
    if (!currentUserId) return;
    setSendingRequestTo(targetUser.id);
    try {
      // In a real app we'd need the current user's name/role from a context.
      // We will fetch it quickly from directory/users just to be safe.
      let myName = "User";
      let myRole = currentUserRole;
      
      const dirQ = query(collection(db, "directory"), where("id", "==", currentUserId));
      const dirSnap = await getDocs(dirQ);
      if (!dirSnap.empty) {
        myName = dirSnap.docs[0].data().name || myName;
      } else {
        const userQ = query(collection(db, "users"), where("uid", "==", currentUserId));
        const userSnap = await getDocs(userQ);
        if (!userSnap.empty) {
          myName = userSnap.docs[0].data().name || myName;
        }
      }

      await ConnectionService.createConnectionRequest({
        initiatorId: currentUserId,
        initiatorName: myName,
        initiatorRole: myRole,
        receiverId: targetUser.id,
        receiverName: targetUser.name || "Provider",
        receiverRole: targetUser.role || "provider"
      });

      // Remove from suggestions locally
      setSuggestions(prev => prev.filter(s => s.id !== targetUser.id));
      alert("Connection request sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send request.");
    } finally {
      setSendingRequestTo(null);
    }
  };

  if (loading) return null;
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
          Suggested Connections
        </h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">People you may know</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map(s => (
          <div key={s.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 mb-3 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-400">
              {s.image ? (
                <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-xl">{s.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{s.name}</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">{s.role}</p>
            <p className="text-xs text-slate-500 line-clamp-1 mb-4">{s.city || s.specialty || 'Medical Professional'}</p>
            
            <button 
              onClick={() => handleConnect(s)}
              disabled={sendingRequestTo === s.id}
              className="mt-auto w-full py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              {sendingRequestTo === s.id ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                  Connect
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
