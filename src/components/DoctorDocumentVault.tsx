'use client';

import React, { useState } from 'react';

export default function DoctorDocumentVault() {
  const [activeTab, setActiveTab] = useState<'medical' | 'clinic' | 'tax'>('medical');
  const [documents, setDocuments] = useState([
    { id: 1, type: 'medical', name: 'MBBS Degree Certificate', date: '12 Oct 2025', status: 'Verified', file: 'mbbs_cert.pdf' },
    { id: 2, type: 'medical', name: 'State Medical Council Registration', date: '12 Oct 2025', status: 'Verified', file: 'smc_reg.pdf' },
    { id: 3, type: 'clinic', name: 'Clinic Trade License', date: '14 Oct 2025', status: 'Pending Review', file: 'trade_license_2025.pdf' },
    { id: 4, type: 'tax', name: 'GST Registration (Optional)', date: '14 Oct 2025', status: 'Missing', file: '' },
  ]);

  const filteredDocs = documents.filter(d => d.type === activeTab);

  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/10 rounded-full flex items-center justify-center border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
              <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            Document Vault
          </h3>
          <p className="text-sm text-slate-400 mt-2">Securely store and manage your medical licenses, clinic registrations, and tax documents.</p>
        </div>
        
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          Upload New Document
        </button>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('medical')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'medical' ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'}`}
        >
          Medical Licenses
        </button>
        <button 
          onClick={() => setActiveTab('clinic')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'clinic' ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'}`}
        >
          Clinic Registration
        </button>
        <button 
          onClick={() => setActiveTab('tax')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'tax' ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'}`}
        >
          Tax & KYC
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl relative group hover:bg-white/10 transition-colors">
            
            {doc.status === 'Verified' && (
              <div className="absolute top-4 right-4 text-emerald-400 bg-emerald-400/10 p-1.5 rounded-full" title="Verified">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
            )}
            {doc.status === 'Pending Review' && (
              <div className="absolute top-4 right-4 text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg text-xs font-bold" title="Pending Review">
                Pending
              </div>
            )}
            {doc.status === 'Missing' && (
              <div className="absolute top-4 right-4 text-rose-400 bg-rose-400/10 px-2 py-1 rounded-lg text-xs font-bold" title="Missing Document">
                Required
              </div>
            )}

            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 border border-slate-700 text-slate-400 group-hover:text-teal-400 transition-colors">
               {doc.status === 'Missing' ? (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
               ) : (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
               )}
            </div>
            
            <h4 className="font-bold text-slate-200 text-lg mb-1">{doc.name}</h4>
            
            {doc.status !== 'Missing' ? (
              <div className="flex flex-col gap-1 mt-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Uploaded on {doc.date}</span>
                <span className="text-sm text-slate-400 truncate">{doc.file}</span>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-bold transition-colors">View</button>
                  <button className="flex-1 bg-white/5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 py-2 rounded-lg text-sm font-bold transition-colors">Delete</button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <button className="w-full bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/50 py-2.5 rounded-xl text-sm font-bold transition-colors border-dashed">
                  + Upload Document
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-sky-500/10 border border-sky-500/20 p-6 rounded-2xl flex gap-4">
        <div className="text-sky-400 shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <h4 className="font-bold text-sky-300 mb-1">Dehapa Verification</h4>
          <p className="text-sm text-sky-400/80 leading-relaxed">Documents marked as "Verified" have been checked by our compliance team. If you upload a new document to replace an existing one, your verification status will temporarily revert to "Pending Review".</p>
        </div>
      </div>

    </div>
  );
}
