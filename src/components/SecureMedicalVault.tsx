"use client";

import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, query, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export type MedicalRecord = {
  id: string;
  patientName: string;
  patientId: string;
  recordType: 'prescription' | 'mri' | 'lab_report' | 'other';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: any;
};

export default function SecureMedicalVault({ providerId }: { providerId: string }) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [recordType, setRecordType] = useState<MedicalRecord['recordType']>('lab_report');

  useEffect(() => {
    const fetchRecords = async () => {
      if (!providerId) return;
      try {
        const q = query(collection(db, `medicalVault/${providerId}/records`), orderBy('uploadDate', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedRecords: MedicalRecord[] = [];
        querySnapshot.forEach((doc) => {
          fetchedRecords.push({ id: doc.id, ...doc.data() } as MedicalRecord);
        });
        setRecords(fetchedRecords);
      } catch (error) {
        console.error("Error fetching medical records:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [providerId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!patientName || !patientId) {
      alert("Please enter Patient Name and ID before uploading.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const storageRef = ref(storage, `medical-vault/${providerId}/${patientId}/${safeFileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      }, 
      (error) => {
        console.error("Upload failed:", error);
        setUploading(false);
        alert("Upload failed. Please try again.");
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // Save metadata to Firestore
        try {
          const docRef = await addDoc(collection(db, `medicalVault/${providerId}/records`), {
            patientName,
            patientId,
            recordType,
            fileName: file.name,
            fileUrl: downloadURL,
            fileSize: file.size,
            uploadDate: serverTimestamp()
          });

          // Prepend to local state to avoid refetching
          setRecords(prev => [{
            id: docRef.id,
            patientName,
            patientId,
            recordType,
            fileName: file.name,
            fileUrl: downloadURL,
            fileSize: file.size,
            uploadDate: new Date() // approximate
          }, ...prev]);

          // Reset form
          setPatientName('');
          setPatientId('');
          if (fileInputRef.current) fileInputRef.current.value = '';
          
        } catch (error) {
          console.error("Error saving record metadata:", error);
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      }
    );
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateObj: any) => {
    if (!dateObj) return '';
    // Handle Firestore Timestamp or standard JS Date
    const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prescription': return '💊';
      case 'mri': return '🩻';
      case 'lab_report': return '🧪';
      default: return '📄';
    }
  };

  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden min-h-[600px]">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/40 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Secure Medical Vault
          </h2>
          <p className="text-slate-600 text-sm mt-2">End-to-end encrypted storage for patient prescriptions, MRI scans, and lab reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Upload Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white shadow-sm sticky top-6">
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Upload New Record</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Patient Name</label>
                <input 
                  type="text" 
                  value={patientName} 
                  onChange={e => setPatientName(e.target.value)} 
                  placeholder="e.g. John Doe"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Patient ID / Phone</label>
                <input 
                  type="text" 
                  value={patientId} 
                  onChange={e => setPatientId(e.target.value)} 
                  placeholder="e.g. P-10023"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Record Type</label>
                <select 
                  value={recordType} 
                  onChange={e => setRecordType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="prescription">💊 Prescription</option>
                  <option value="lab_report">🧪 Lab Report</option>
                  <option value="mri">🩻 MRI / X-Ray</option>
                  <option value="other">📄 Other Document</option>
                </select>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-200">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png,.dcm"
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-bold shadow-md transition-all flex justify-center items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Uploading {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      Select File to Upload
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-slate-400 mt-3">PDF, JPG, PNG, DICOM (Max 15MB)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vault Explorer */}
        <div className="lg:col-span-2">
          <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden h-full min-h-[400px] flex flex-col">
            <div className="bg-white/50 px-6 py-4 border-b border-white flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Vault Contents</h3>
              <div className="relative">
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" placeholder="Search patient or ID..." className="bg-white/80 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all focus:w-64" />
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-300 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </div>
                  <h4 className="font-bold text-slate-700 text-lg">Vault is Empty</h4>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm">You haven't uploaded any patient records yet. Use the upload panel to securely store prescriptions and reports.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map(record => (
                    <div key={record.id} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xl shrink-0">
                        {getTypeIcon(record.recordType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate">{record.fileName}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className="font-semibold text-blue-700">{record.patientName}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span>ID: {record.patientId}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span>{formatDate(record.uploadDate)}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span>{formatSize(record.fileSize)}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <a 
                          href={record.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Document"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
