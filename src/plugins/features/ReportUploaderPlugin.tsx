"use client";

import React, { useState } from 'react';

export function ReportUploaderPlugin() {
  const [patientPhone, setPatientPhone] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    if (!patientPhone || !file) return;
    setIsUploading(true);
    
    // Simulate upload to patient vault
    setTimeout(() => {
      setIsUploading(false);
      setFile(null);
      setPatientPhone('');
      alert("Report successfully pushed to patient's secure vault! They have been notified via WhatsApp.");
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
      </div>
      
      <h3 className="text-2xl font-bold text-slate-900 mb-2">1-Click Report Uploader</h3>
      <p className="text-slate-500 mb-8">Push PDF lab reports directly to a patient's Secure Vault using their registered phone number.</p>
      
      <div className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Patient Phone Number</label>
          <input 
            type="tel"
            value={patientPhone}
            onChange={e => setPatientPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none font-bold"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Lab Report (PDF)</label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <p className="font-bold text-teal-700">{file.name}</p>
            ) : (
              <p className="font-bold text-slate-400">Drag & Drop PDF here, or click to browse</p>
            )}
          </div>
        </div>

        <button 
          onClick={handleUpload}
          disabled={!file || !patientPhone || isUploading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
        >
          {isUploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading to Vault...
            </>
          ) : (
            "Push to Patient Vault"
          )}
        </button>
      </div>
    </div>
  );
}
