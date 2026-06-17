import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function PatientLeadsWidget({ providerId }: { providerId: string }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!providerId) return;
      try {
        const q = query(
          collection(db, "contact_leads"),
          where("providerId", "==", providerId)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a: any, b: any) => {
          // Sort client side to avoid missing index errors
          const timeA = a.timestamp?.toMillis() || 0;
          const timeB = b.timestamp?.toMillis() || 0;
          return timeB - timeA;
        });
        setLeads(data);
      } catch (err) {
        console.error("Failed to fetch leads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [providerId]);

  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      {/* Metallic/Glassmorphic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 flex justify-between items-center border-b border-white/30 pb-5 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Patient Inquiries & Leads
          </h3>
          <p className="text-sm text-slate-500 mt-1">Verified patients who unlocked your contact details.</p>
        </div>
        <div className="bg-teal-50 border border-teal-100 px-4 py-2 rounded-xl">
          <span className="text-sm font-bold text-teal-700">Total: {leads.length}</span>
        </div>
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 bg-white/20 backdrop-blur-md rounded-[24px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.05)] border border-white/50">
             <div className="w-16 h-16 bg-white/50 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
             </div>
             <p className="text-slate-900 font-bold text-lg mb-1">No Inquiries Yet</p>
             <p className="text-sm text-slate-600 max-w-sm mx-auto">When a patient clicks to reveal your phone number, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 text-xs uppercase tracking-widest text-slate-500 border-b border-slate-200/60">
                  <th className="p-4 font-bold">Patient Details</th>
                  <th className="p-4 font-bold">Contact Initiated</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/80 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold shadow-sm border border-teal-200">
                          {lead.patientEmail?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{lead.patientEmail}</p>
                          <p className="text-xs text-slate-500">Verified Patient</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-700">
                        {lead.timestamp ? new Date(lead.timestamp.toMillis()).toLocaleString() : "Just now"}
                      </p>
                      <p className="text-xs text-teal-600 font-medium">Revealed Contact Number</p>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors shadow-sm">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
