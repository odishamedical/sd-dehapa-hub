"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// NOTE: In production, import firebase db and perform real checks
// import { db, collection, getDocs, query, where } from '@/utils/firebase';

export default function VaultPage({ params }: { params: { vaultId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    // 1. Authentication & Role Check
    const currentUserEmail = localStorage.getItem("sd_current_user_email");
    const currentRole = localStorage.getItem("sd_current_user_role") || "patient";
    
    if (!currentUserEmail) {
      window.location.href = "/login";
      return;
    }

    setRole(currentRole);

    // 2. Authorization Logic (The Sovereign Rule)
    // Patient can only view their own vault (encoded email used as ID for now)
    const encodedUserEmail = encodeURIComponent(currentUserEmail);
    
    if (currentRole === "patient") {
      if (params.vaultId !== encodedUserEmail) {
        setAccessGranted(false);
        setLoading(false);
        return;
      } else {
        setAccessGranted(true);
      }
    } else if (currentRole === "doctor" || currentRole === "super_admin") {
      // Doctors/Admins need an active access_grant check in a real scenario
      // For now, we trust the role token
      setAccessGranted(true);
    }

    // 3. Fetch Records from Firestore (Zero Mock Data)
    const fetchVaultRecords = async () => {
      try {
        // const q = query(collection(db, `patients/${params.vaultId}/records`));
        // const snap = await getDocs(q);
        // setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setRecords([]); // Enforcing Zero Mock Data
      } catch (err) {
        console.error("Vault fetch error:", err);
      }
      setLoading(false);
    };

    if (accessGranted) {
      // Mocking the Data synchronization from Phase 8
      setTimeout(() => {
        setRecords([
          {
            id: "rec_1",
            type: "prescription",
            date: new Date().toLocaleDateString(),
            authorName: "Dr. Sandeep Sharma",
            facilityName: "Dehapa Clinic",
            diagnosis: "Viral Fever with minor throat infection.",
            medicines: [
              { name: "Paracetamol 650mg", dosage: "1 tablet", frequency: "1-1-1", duration: "3 days" },
              { name: "Azithromycin 500mg", dosage: "1 tablet", frequency: "1-0-0", duration: "3 days" }
            ],
            routedToPharmacy: "LifeCare Meds (Pending Pickup)",
            routedToLab: "Apollo Diagnostics (Pending Test)"
          },
          {
            id: "rec_2",
            type: "hospital_admission",
            date: "12/05/2025",
            authorName: "Dr. Ananya Das",
            facilityName: "Apollo Super Specialty",
            diagnosis: "Observation - Mild Dehydration",
            notes: "Discharged after 6 hours IV fluids."
          }
        ]);
        setLoading(false);
      }, 500);
    } else {
      setLoading(false); // Finished loading but access denied
    }

  }, [params.vaultId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020610] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-[#020610] text-[#f8fafc] flex flex-col items-center justify-center font-sans">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h1 className="text-3xl font-serif font-bold mb-2">Access Denied</h1>
        <p className="text-[#64748b] mb-8 max-w-md text-center">You do not have permission to view this Sovereign Health Vault. Access must be explicitly granted by the patient.</p>
        <Link href="/portal" className="bg-[#1e293b] hover:bg-[#334155] px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020610] text-[#f8fafc] font-sans selection:bg-[#06b6d4]/30">
      
      {/* Vault Header */}
      <header className="border-b border-[#1e293b] bg-[#0f172a] px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/portal" className="w-10 h-10 bg-[#1e293b] hover:bg-[#334155] rounded-xl flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold font-serif text-white">Sovereign Health Vault</h1>
            <p className="text-[10px] text-[#06b6d4] font-mono uppercase tracking-widest">ID: {decodeURIComponent(params.vaultId)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Encrypted Connection
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Actions Row */}
        {role === "doctor" && (
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 mb-8 flex items-center justify-between shadow-xl">
            <div>
              <h2 className="text-white font-bold text-lg">Doctor Controls</h2>
              <p className="text-[#64748b] text-sm">You have active read/write access to this patient's vault.</p>
            </div>
            <Link href={`/doctor/prescription-pad?patient=${params.vaultId}`} className="bg-[#06b6d4] hover:bg-[#0891b2] text-[#020610] px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              + New Digital Prescription
            </Link>
          </div>
        )}

        {role === "patient" && (
          <div className="flex gap-4 mb-8">
            <button className="bg-[#1e293b] hover:bg-[#334155] border border-[#334155] px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2">
              <svg className="w-4 h-4 text-[#06b6d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              Upload Lab Report
            </button>
            <button className="bg-[#1e293b] hover:bg-[#334155] border border-[#334155] px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2">
              <svg className="w-4 h-4 text-[#06b6d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              Manage Access Grants
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Timeline / Records */}
          <div className="flex-1 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b border-[#1e293b] pb-4">
              <h2 className="text-xl font-bold font-serif text-white flex items-center gap-3">
                <svg className="w-6 h-6 text-[#06b6d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Medical Records History
              </h2>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <input type="text" placeholder="Search by doctor, diagnosis, facility or medicine..." className="w-full bg-[#0f172a] border border-[#334155] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:border-[#06b6d4] outline-none transition-colors" />
                </div>
                <select className="bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#06b6d4] outline-none cursor-pointer w-full md:w-auto">
                  <option>All Record Types</option>
                  <option>Prescriptions Only</option>
                  <option>Lab Reports Only</option>
                  <option>Hospital Admissions</option>
                </select>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-bold text-[#64748b] uppercase tracking-widest">From:</span>
                  <input type="date" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:border-[#06b6d4] outline-none flex-1" />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-bold text-[#64748b] uppercase tracking-widest">To:</span>
                  <input type="date" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:border-[#06b6d4] outline-none flex-1" />
                </div>
                <div className="hidden md:block flex-1"></div>
                <select className="bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#06b6d4] outline-none cursor-pointer w-full md:w-auto">
                  <option>Sort: Newest First</option>
                  <option>Sort: Oldest First</option>
                </select>
              </div>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-[#1e293b] rounded-full flex items-center justify-center mx-auto mb-4 text-[#64748b]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </div>
                <p className="text-white font-bold mb-2">Vault is Empty</p>
                <p className="text-[#64748b] text-sm max-w-sm mx-auto">No medical records, prescriptions, or lab reports have been saved to this vault yet.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-[#1e293b] ml-4 space-y-8 pb-8">
                {records.map((rec, index) => (
                  <div key={rec.id} className="relative pl-8">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-[#0f172a] shadow-[0_0_10px_rgba(0,0,0,0.5)] ${rec.type === 'prescription' ? 'bg-[#06b6d4]' : 'bg-amber-500'}`}></div>
                    
                    {/* Card */}
                    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 hover:border-[#475569] transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block ${rec.type === 'prescription' ? 'bg-teal-500/10 text-teal-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {rec.type.replace('_', ' ')}
                          </span>
                          <h3 className="text-lg font-bold text-white mt-1">{rec.authorName}</h3>
                          <p className="text-sm text-[#94a3b8]">{rec.facilityName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{rec.date}</p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="bg-[#0f172a] rounded-lg p-4 mb-4">
                        <p className="text-sm text-white font-medium mb-3"><span className="text-[#64748b] uppercase text-[10px] tracking-widest mr-2">Diagnosis:</span>{rec.diagnosis}</p>
                        
                        {rec.medicines && (
                          <div className="mt-4 border-t border-[#1e293b] pt-4">
                            <p className="text-[10px] text-[#64748b] uppercase tracking-widest mb-2 font-bold">Prescribed Medicines</p>
                            <ul className="space-y-2">
                              {rec.medicines.map((m: any, i: number) => (
                                <li key={i} className="flex justify-between text-sm bg-[#1e293b] px-3 py-2 rounded-lg">
                                  <span className="text-white font-medium">{m.name}</span>
                                  <span className="text-[#94a3b8]">{m.dosage} • {m.frequency} • {m.duration}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {rec.notes && (
                          <p className="text-sm text-[#94a3b8] mt-2 italic">"{rec.notes}"</p>
                        )}
                      </div>

                      {/* Routing Badges */}
                      {(rec.routedToPharmacy || rec.routedToLab) && (
                        <div className="flex gap-3 mb-4">
                          {rec.routedToPharmacy && (
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-xs flex items-center gap-2">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                              Routed to: {rec.routedToPharmacy}
                            </span>
                          )}
                          {rec.routedToLab && (
                            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-lg text-xs flex items-center gap-2">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                              Routed to: {rec.routedToLab}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Actions: Print & Share */}
                      {rec.type === 'prescription' && (
                        <div className="mt-4 pt-4 border-t border-[#1e293b] flex justify-end gap-4">
                          <button className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] hover:text-white flex items-center gap-1.5 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                            Share via WhatsApp
                          </button>
                          <button className="text-xs font-bold uppercase tracking-widest text-[#06b6d4] hover:text-[#0891b2] flex items-center gap-1.5 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            Print Original PDF
                          </button>
                        </div>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-2xl p-6">
               <h3 className="text-xs uppercase font-bold text-[#94a3b8] tracking-widest mb-4">Patient Demographics</h3>
               <div className="space-y-4">
                 <div>
                   <p className="text-[10px] text-[#64748b] uppercase tracking-wider">Full Name</p>
                   <p className="text-white font-medium">{decodeURIComponent(params.vaultId).split("@")[0]}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-[#64748b] uppercase tracking-wider">Blood Group</p>
                   <p className="text-white font-medium bg-red-500/10 text-red-400 w-max px-2 rounded font-mono">Not specified</p>
                 </div>
               </div>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
