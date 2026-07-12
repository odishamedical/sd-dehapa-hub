"use client";

import React, { useState } from 'react';

export default function LabReportUploader() {
  const [activeTab, setActiveTab] = useState("pending");
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const testRequests = [
    { id: "REQ-4492", patient: "Rajiv M.", test: "Complete Blood Count (CBC)", status: "pending", source: "Dr. Sharma", date: "Today, 09:30 AM" },
    { id: "REQ-4493", patient: "Anita S.", test: "Lipid Profile", status: "pending", source: "City Hospital", date: "Today, 10:15 AM" },
    { id: "REQ-4490", patient: "Suresh P.", test: "HbA1c", status: "completed", source: "Walk-in", date: "Yesterday" },
  ];

  const handleUpload = (id: string) => {
    setIsUploading(id);
    setTimeout(() => {
      setIsUploading(null);
      alert("Report successfully uploaded and synced to Patient Vault!");
    }, 1500);
  };

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.8)] min-h-[70vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/20 shadow-inner">
              <span className="text-xl">📄</span>
            </div>
            1-Click Report Uploader
          </h3>
          <p className="text-sm text-slate-600 mt-2 font-medium">Upload pathology reports directly into the patient's digital Medical Vault.</p>
        </div>
        
        <button className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all flex items-center gap-2">
          + New Walk-in Test
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-4 text-sm font-bold transition-all ${activeTab === 'pending' ? 'border-b-2 border-sky-500 text-sky-600 bg-sky-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Pending Uploads
          </button>
          <button 
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-4 text-sm font-bold transition-all ${activeTab === 'completed' ? 'border-b-2 border-sky-500 text-sky-600 bg-sky-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Completed
          </button>
        </div>

        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-bold">Request ID</th>
                <th className="p-4 font-bold">Patient</th>
                <th className="p-4 font-bold">Test Name</th>
                <th className="p-4 font-bold">Source</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {testRequests.filter(req => req.status === activeTab).map(req => (
                <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-black text-slate-900">{req.id}</td>
                  <td className="p-4 font-bold text-slate-700">{req.patient}</td>
                  <td className="p-4 text-sm font-medium text-slate-700">{req.test}</td>
                  <td className="p-4 text-xs font-bold text-slate-500">{req.source}</td>
                  <td className="p-4 text-center">
                    {req.status === 'pending' ? (
                      <button 
                        onClick={() => handleUpload(req.id)}
                        disabled={isUploading === req.id}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 min-w-[120px] mx-auto"
                      >
                        {isUploading === req.id ? 'Uploading...' : 'Upload PDF'}
                      </button>
                    ) : (
                      <span className="text-emerald-500 font-bold text-xs flex items-center justify-center gap-1">
                        ✓ Synced to Vault
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
