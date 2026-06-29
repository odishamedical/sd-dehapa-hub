"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import PrescriptionTemplate from '@/components/PrescriptionTemplate';

interface DoctorRxHistoryWidgetProps {
  docId: string;
  docName: string;
}

export default function DoctorRxHistoryWidget({ docId, docName }: DoctorRxHistoryWidgetProps) {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [printRxData, setPrintRxData] = useState<any>(null);

  const handleDelete = async (rxId: string, patientEmail: string) => {
    if (!window.confirm("Are you sure you want to completely delete this prescription? This action cannot be undone.")) return;
    try {
      try { await deleteDoc(doc(db, "prescriptions", rxId)); } catch(e){}
      if (patientEmail) {
        try { await deleteDoc(doc(db, "patients", patientEmail, "records", rxId)); } catch(e){}
      }
      setPrescriptions(prev => prev.filter(rx => rx.id !== rxId));
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete the prescription.");
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Query prescriptions where providerId matches doctor ID
        const q = query(
          collection(db, "prescriptions"),
          where("providerId", "==", docId || "unknown")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort descending by timestamp/date
        list.sort((a: any, b: any) => {
          const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.date || 0).getTime();
          const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.date || 0).getTime();
          return timeB - timeA;
        });

        setPrescriptions(list);
      } catch (err) {
        console.error("Error fetching doctor rx history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (docId) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    if (printRxData) {
      const timer = setTimeout(() => {
        window.print();
        setPrintRxData(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [printRxData]);

  const handlePrint = (rx: any) => {
    const formattedDoctor = {
      name: rx.providerName || docName || "Dr. Medical Provider",
      speciality: rx.doctorSpeciality || "General Physician",
      degrees: rx.doctorDegrees || "MBBS",
      registrationNo: rx.doctorRegNo || "Pending",
      phone: rx.doctorPhone || "+91 9876543210",
      address: rx.facilityName || "DehaPa Clinic"
    };

    const formattedRx = {
      patientInfo: {
        name: rx.patientName || "Patient",
        age: rx.patientAge || "",
        gender: rx.patientGender || ""
      },
      history: rx.history || "",
      diagnosis: rx.diagnosis || "",
      medicines: rx.medicines || [],
      tests: rx.tests || [],
      advice: rx.notes || "",
      routing: {
        pharmacyId: rx.routedToPharmacy || "",
        labId: rx.routedToLab || ""
      }
    };

    setPrintRxData({
      doctorData: formattedDoctor,
      rxData: formattedRx,
      date: rx.date || new Date().toLocaleDateString()
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Sent Prescription History</h2>
          <p className="text-xs text-slate-500 mt-1">View and reprint prescriptions you have generated for patients</p>
        </div>
        <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600">
          Total Sent: {prescriptions.length}
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center py-16 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">📜</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Prescriptions Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">You have not sent any digital prescriptions yet. Use the 'Digital Rx Pad' to write one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-teal-50 text-teal-600 border border-teal-100 px-2 py-1 rounded-md">
                    {rx.date}
                  </span>
                  {(rx.routedToPharmacy || rx.routedToLab) && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-md">
                      Routed
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-0.5">Patient: {rx.patientName}</h3>
                <p className="text-xs text-slate-500 mb-3">ID: {rx.patientEmail}</p>
                <div className="bg-slate-50/80 rounded-xl p-3 mb-4 text-xs space-y-1">
                  <p className="text-slate-700"><span className="font-bold text-slate-500 uppercase text-[9px] mr-2">Diagnosis:</span>{rx.diagnosis || "General Consult"}</p>
                  {rx.medicines && rx.medicines.length > 0 && (
                    <p className="text-slate-700 truncate"><span className="font-bold text-slate-500 uppercase text-[9px] mr-2">Medicines:</span>{rx.medicines.map((m: any) => m.name).join(", ")}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <button 
                  onClick={() => handleDelete(rx.id, rx.patientEmail)}
                  className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
                  title="Delete Prescription"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
                <button 
                  onClick={() => handlePrint(rx)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Print PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Print PDF output layout (hidden on screen) */}
      {printRxData && (
        <PrescriptionTemplate 
          doctorData={printRxData.doctorData} 
          rxData={printRxData.rxData} 
          date={printRxData.date} 
        />
      )}
    </div>
  );
}
