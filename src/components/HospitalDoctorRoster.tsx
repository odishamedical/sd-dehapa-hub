"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';

export default function HospitalDoctorRoster({ entityData }: { entityData: any }) {
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(true);

  // Fetch Affiliated Doctors
  useEffect(() => {
    const fetchAffiliations = async () => {
      if (!entityData?.id) return;
      try {
        const q = query(
          collection(db, "hospital_affiliations"),
          where("hospitalId", "==", entityData.id)
        );
        const querySnapshot = await getDocs(q);
        const results: any[] = [];
        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
        setAffiliations(results);
      } catch (err) {
        console.error("Error fetching roster:", err);
      } finally {
        setLoadingRoster(false);
      }
    };
    
    fetchAffiliations();
  }, [entityData?.id]);

  // Search doctors in Firestore directory
  useEffect(() => {
    const searchDoctors = async () => {
      if (doctorSearchQuery.length < 3) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const q = query(
          collection(db, "directory"),
          where("role", "==", "doctor")
        );
        const querySnapshot = await getDocs(q);
        const results: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const name = data.name || "";
          
          if (name.toLowerCase().includes(doctorSearchQuery.toLowerCase())) {
            // Don't show doctors that are already in the roster
            if (!affiliations.find(a => a.doctorId === doc.id)) {
              results.push({ id: doc.id, name, specialization: data.specialization || "General" });
            }
          }
        });
        setSearchResults(results);
      } catch (err) {
        console.error("Error searching doctors:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchDoctors, 500); // debounce
    return () => clearTimeout(timeoutId);
  }, [doctorSearchQuery, affiliations]);

  const handleInviteDoctor = async (docObj: any) => {
    if (!entityData?.id) return;
    
    try {
      const newInvite = {
        hospitalId: entityData.id,
        hospitalName: entityData.name || "Hospital",
        doctorId: docObj.id,
        doctorName: docObj.name,
        specialization: docObj.specialization || "General",
        status: "pending",
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "hospital_affiliations"), newInvite);
      
      setAffiliations(prev => [...prev, { id: docRef.id, ...newInvite }]);
      setDoctorSearchQuery("");
      alert("Invitation sent to doctor!");
    } catch (err) {
      console.error("Failed to send invite:", err);
    }
  };

  const activeDoctors = affiliations.filter(a => a.status === 'active');
  const pendingDoctors = affiliations.filter(a => a.status === 'pending');

  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
              <span className="text-xl">🩺</span>
            </div>
            Hospital Roster
          </h3>
          <p className="text-sm text-slate-600 mt-2 font-medium">Manage your OPD schedule and affiliated doctors.</p>
        </div>
      </div>
      
      {/* Invite Section */}
      <div className="bg-white/60 p-6 rounded-2xl border border-white shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl"></div>
        <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-widest relative z-10">Invite New Doctor</h4>
        <div className="relative z-10">
          <input 
            type="text" 
            value={doctorSearchQuery}
            onChange={(e) => setDoctorSearchQuery(e.target.value)}
            placeholder="Search registered doctors by name (e.g. Dr. Sharma)..."
            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 focus:border-sky-500 outline-none transition-all"
          />
          {isSearching && <div className="absolute right-4 top-4 text-slate-400 text-sm font-medium">Searching network...</div>}
          
          {searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 overflow-y-auto">
              {searchResults.map(docObj => (
                <div key={docObj.id} className="flex justify-between items-center p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-bold text-slate-900">{docObj.name}</p>
                    <p className="text-xs font-medium text-slate-500">{docObj.specialization}</p>
                  </div>
                  <button 
                    onClick={() => handleInviteDoctor(docObj)}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md transition-colors"
                  >
                    Send Invite
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Roster Display */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest">Active Doctors</h4>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{activeDoctors.length}</span>
          </div>
          
          {loadingRoster ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : activeDoctors.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
              <p className="text-slate-500 font-medium">No active doctors in your roster yet.</p>
              <p className="text-sm text-slate-400 mt-1">Search above to invite doctors to your hospital.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDoctors.map(doc => (
                <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 text-xl">
                      👨‍⚕️
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{doc.doctorName}</p>
                      <p className="text-xs font-medium text-slate-500">{doc.specialization || "General"}</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {pendingDoctors.length > 0 && (
          <div className="pt-6 border-t border-slate-200/50">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest">Pending Invitations</h4>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingDoctors.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingDoctors.map(doc => (
                <div key={doc.id} className="bg-white/50 p-5 rounded-2xl border border-slate-200/60 flex items-center justify-between opacity-80 grayscale-[0.3]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-sm">
                      ⏳
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{doc.doctorName}</p>
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">Awaiting Acceptance</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
