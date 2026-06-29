"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';

export default function PatientVaultWidget() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labReports, setLabReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'prescriptions' | 'labReports'>('prescriptions');

  const handleDelete = async (rxId: string) => {
    if (!window.confirm("Are you sure you want to completely delete this prescription? This action cannot be undone.")) return;
    try {
      const userEmail = localStorage.getItem("sd_current_user_email");
      if (!userEmail) return;
      try { await deleteDoc(doc(db, "prescriptions", rxId)); } catch(e){}
      try { await deleteDoc(doc(db, "patients", userEmail, "records", rxId)); } catch(e){}
      setPrescriptions(prev => prev.filter(rx => rx.id !== rxId));
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete the prescription.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userEmail = localStorage.getItem("sd_current_user_email");
        if (!userEmail) return;

        // Fetch from root prescriptions collection
        const rxQuery = query(collection(db, "prescriptions"), where("patientEmail", "==", userEmail));
        const rxSnap = await getDocs(rxQuery);
        const rootPrescriptions = rxSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch from patient vault records subcollection directly (No index required)
        const vaultRecordsQuery = query(collection(db, "patients", userEmail, "records"), where("type", "==", "prescription"));
        const vaultRecordsSnap = await getDocs(vaultRecordsQuery);
        const vaultPrescriptions = vaultRecordsSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            providerName: data.authorName || "General Prescription",
            facilityName: data.facilityName || "Clinic/Hospital",
            diagnosis: data.diagnosis || "Medical Document",
            medicines: data.medicines || [],
            notes: data.notes || "",
            routedToPharmacy: data.routedToPharmacy,
            routedToLab: data.routedToLab,
            timestamp: data.timestamp,
            date: data.date
          };
        });

        // Merge & Deduplicate
        const mergedMap = new Map();
        [...rootPrescriptions, ...vaultPrescriptions].forEach(item => {
          mergedMap.set(item.id, item);
        });
        const mergedList = Array.from(mergedMap.values());

        // Sort by timestamp descending
        mergedList.sort((a, b) => {
          const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.date || 0).getTime();
          const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.date || 0).getTime();
          return timeB - timeA;
        });

        setPrescriptions(mergedList);

        // Fetch Lab Reports
        const labQuery = query(collection(db, "lab_reports"), where("patientEmail", "==", userEmail), orderBy("timestamp", "desc"));
        const labSnap = await getDocs(labQuery);
        setLabReports(labSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (error) {
        console.error("Failed to load vault data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.05)] border border-slate-300 rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 hover:translate-x-full duration-1000 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 drop-shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center border border-teal-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            Sovereign Medical Vault
          </h3>
          <p className="text-sm font-semibold text-teal-600 mt-2">Your securely encrypted digital health records.</p>
        </div>
        
        <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveSubTab('prescriptions')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'prescriptions' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            E-Prescriptions ({prescriptions.length})
          </button>
          <button 
            onClick={() => setActiveSubTab('labReports')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'labReports' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Lab Reports ({labReports.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 relative z-10">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
        </div>
      ) : (
        <div className="relative z-10">
          {activeSubTab === 'prescriptions' && (
            <div>
              {prescriptions.length === 0 ? (
                <div className="text-center py-20 bg-white/50 backdrop-blur-sm border-2 border-dashed border-slate-300 rounded-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 shadow-inner rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">No Prescriptions Yet</h4>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">When a doctor or pharmacy uploads your prescription, it will securely appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-teal-100">
                          {rx.timestamp ? new Date(rx.timestamp.toMillis()).toLocaleDateString() : 'Recent'}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleDelete(rx.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete Prescription"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                          <button 
                            onClick={() => {
                              const email = localStorage.getItem("sd_current_user_email");
                              if (email) router.push(`/portal/vault/${encodeURIComponent(email)}`);
                            }}
                            className="text-slate-400 hover:text-teal-600 transition-colors"
                            title="View & Download"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1 text-lg">{rx.providerName || "General Prescription"}</h4>
                      <p className="text-xs text-slate-500 font-medium mb-4">{rx.providerType || "Doctor"}</p>
                      
                      <button 
                        onClick={() => {
                          const email = localStorage.getItem("sd_current_user_email");
                          if (email) router.push(`/portal/vault/${encodeURIComponent(email)}`);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-md"
                      >
                        View Rx Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'labReports' && (
            <div>
              {labReports.length === 0 ? (
                <div className="text-center py-20 bg-white/50 backdrop-blur-sm border-2 border-dashed border-slate-300 rounded-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 shadow-inner rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">No Lab Reports Yet</h4>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">Your diagnostic test results and imaging reports will be stored here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {labReports.map((report) => (
                    <div key={report.id} className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                          {report.timestamp ? new Date(report.timestamp.toMillis()).toLocaleDateString() : 'Recent'}
                        </div>
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </button>
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1 text-lg">{report.testName || "Diagnostic Report"}</h4>
                      <p className="text-xs text-slate-500 font-medium mb-4">{report.labName || "Diagnostic Center"}</p>
                      
                      <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-md">
                        View Report PDF
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
