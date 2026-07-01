"use client";

import React, { useState, useEffect, useRef } from 'react';
import { VaultService, VaultDocument, VaultFolder } from '@/lib/vault.service';
import VaultForwardModal from './VaultForwardModal';

      {/* Upload Details Panel (Hidden on mobile, slides out on desktop) */}
      <div className={`hidden lg:block w-72 bg-white border-l border-slate-200 p-6 overflow-y-auto transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          Quick Upload
        </h3>
        
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Patient Name</label>
            <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Patient ID / @Handle</label>
            <input type="text" value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="e.g. @johndoe or P-123" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Record Type</label>
            <select value={recordType} onChange={e => setRecordType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
              <option value="prescription">💊 Prescription</option>
              <option value="lab_report">🧪 Lab Report</option>
              <option value="mri">🩻 MRI / X-Ray</option>
              <option value="other">📄 Other Document</option>
            </select>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.dcm" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 rounded-2xl py-8 flex flex-col items-center justify-center gap-2 transition-all group">
              <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              </div>
              <span className="text-sm font-bold text-slate-600 group-hover:text-blue-700">Select File</span>
              <span className="text-[10px] text-slate-400 font-medium">PDF, JPG, PNG (Max 15MB)</span>
            </button>
          </div>
        </div>
      </div>

      <VaultForwardModal 
        isOpen={isForwardModalOpen} 
        onClose={() => setIsForwardModalOpen(false)} 
        selectedDocs={documents.filter(d => selectedIds.includes(d.id))} 
        senderId={providerId}
        senderName={providerName || "DehaPa Provider"}
        onSuccess={() => {
          setSelectedIds([]);
          // Optionally refresh sent folder if we were viewing it
        }}
      />
    </div>
  );
}
