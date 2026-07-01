"use client";

import React, { useState, useEffect, useRef } from 'react';
import { VaultService, VaultDocument, VaultFolder } from '@/lib/vault.service';
import VaultForwardModal from './VaultForwardModal';

export default function SecureMedicalVault({ providerId, providerName }: { providerId: string, providerName?: string }) {
  const [activeFolder, setActiveFolder] = useState<VaultFolder>('inbox');
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Multi-select & Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Upload Form
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [recordType, setRecordType] = useState<VaultDocument['recordType']>('lab_report');

  useEffect(() => {
    fetchDocuments();
  }, [providerId, activeFolder]);

  const fetchDocuments = async () => {
    if (!providerId) return;
    setLoading(true);
    const docs = await VaultService.getDocuments(providerId, activeFolder);
    setDocuments(docs);
    setSelectedIds([]);
    
    const newExpanded: Record<string, boolean> = {};
    docs.forEach(d => {
      const g = d.consultationId || `episode_${d.uploadDate?.toDate ? d.uploadDate.toDate().toISOString().split('T')[0] : 'unknown'}`;
      newExpanded[g] = true;
    });
    setExpandedGroups(newExpanded);
    
    setLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!patientName || !patientId) {
      alert("Please provide the Patient Name and ID/Handle before uploading.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newDoc = await VaultService.uploadDocument(
        providerId, 
        file, 
        {
          patientName,
          patientId,
          recordType,
          fileName: file.name,
          folder: 'inbox',
          isRead: true
        },
        (progress) => setUploadProgress(progress)
      );
      
      if (activeFolder === 'inbox') {
        setDocuments(prev => [newDoc, ...prev]);
      }
      
      setPatientName('');
      setPatientId('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e: any) {
      alert(e.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(documents.map(d => d.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAction = async (action: 'archive' | 'trash') => {
    if (selectedIds.length === 0) return;
    try {
      if (action === 'trash' && activeFolder === 'trash') {
        if (confirm("Permanently delete these files?")) {
          await VaultService.deleteDocuments(providerId, selectedIds, activeFolder);
        } else return;
      } else if (action === 'trash') {
        await VaultService.deleteDocuments(providerId, selectedIds, activeFolder);
      } else {
        await VaultService.moveDocuments(providerId, selectedIds, 'archive');
      }
      // Optimistic update
      setDocuments(prev => prev.filter(d => !selectedIds.includes(d.id)));
      setSelectedIds([]);
    } catch (e) {
      alert("Action failed");
    }
  };

  const markAsRead = (doc: VaultDocument) => {
    if (!doc.isRead && activeFolder === 'inbox') {
      VaultService.markAsRead(providerId, doc.id);
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, isRead: true } : d));
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredDocs = documents.filter(d => 
    d.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    const groupId = doc.consultationId || `episode_${doc.uploadDate?.toDate ? doc.uploadDate.toDate().toISOString().split('T')[0] : 'unknown'}`;
    if (!acc[groupId]) acc[groupId] = [];
    acc[groupId].push(doc);
    return acc;
  }, {} as Record<string, VaultDocument[]>);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const isExpired = (doc: VaultDocument) => {
    if (doc.creatorId === providerId) return false;
    if (doc.accessLevel === 'permanent') return false;
    if (doc.expiresAt && doc.expiresAt.toDate) {
      return doc.expiresAt.toDate() < new Date();
    }
    return false;
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden flex flex-col md:flex-row h-[85vh] shadow-xl relative">
      
      {/* Mobile Header / Hamburger */}
      <div className="md:hidden bg-white p-4 border-b border-slate-200 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <span className="font-bold text-slate-800 text-lg flex items-center gap-2">🗄️ Vault</span>
        </div>
        <div className="text-xs font-bold text-blue-600 capitalize">{activeFolder}</div>
      </div>

      {/* Sidebar (Navigation) */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 shadow-2xl md:shadow-none`}>
        <div className="p-6 hidden md:block">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            🗄️ Vault
          </h2>
        </div>

        <div className="px-4 py-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Upload File
          </button>
          {isUploading && (
            <div className="mt-3 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-2 rounded-lg text-center animate-pulse">
              Uploading {uploadProgress}%
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <button onClick={() => { setActiveFolder('inbox'); setIsSidebarOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-3 ${activeFolder === 'inbox' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            📥 Inbox
          </button>
          <button onClick={() => { setActiveFolder('sent'); setIsSidebarOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-3 ${activeFolder === 'sent' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            📤 Sent
          </button>
          
          <div className="pt-4 pb-2">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Organization</p>
          </div>
          <button onClick={() => { setActiveFolder('archive'); setIsSidebarOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-3 ${activeFolder === 'archive' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            📦 Archive
          </button>
          <button onClick={() => { setActiveFolder('trash'); setIsSidebarOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-3 ${activeFolder === 'trash' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            🗑️ Trash
          </button>
        </nav>
      </div>

      {/* Main Content (Inbox Grid/List) */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative">
        
        {/* Top Search Bar */}
        <div className="h-16 px-4 md:px-6 flex items-center border-b border-slate-200 bg-white/50 backdrop-blur-sm shrink-0 gap-4">
          <div className="flex-1 relative max-w-2xl">
            <svg className="w-5 h-5 text-slate-400 absolute left-4 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search patients or files..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Smart Action Bar (Visible when items selected) */}
        {selectedIds.length > 0 && (
          <div className="absolute top-16 left-0 right-0 bg-blue-600 text-white px-6 py-3 flex items-center justify-between z-10 shadow-md animate-in slide-in-from-top-2">
            <div className="text-sm font-bold flex items-center gap-4">
              <button onClick={() => setSelectedIds([])} className="hover:bg-blue-700 p-1 rounded">✕</button>
              {selectedIds.length} selected
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsForwardModalOpen(true)} className="p-2 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold" title="Forward">
                ➡️ <span className="hidden sm:inline">Forward</span>
              </button>
              {activeFolder !== 'archive' && (
                <button onClick={() => handleAction('archive')} className="p-2 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold" title="Archive">
                  📦 <span className="hidden sm:inline">Archive</span>
                </button>
              )}
              <button onClick={() => handleAction('trash')} className="p-2 hover:bg-rose-500 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold" title="Delete">
                🗑️ <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* List View */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
              <div className="text-6xl mb-4 opacity-50">📭</div>
              <p className="font-bold text-lg text-slate-600">Nothing here yet</p>
              <p className="text-sm max-w-sm mt-2">When you upload or receive documents, they will appear in this folder.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100/60 p-4">
              {Object.entries(groupedDocs).map(([groupId, docsInGroup]) => {
                const groupTitle = groupId.startsWith('episode_') ? `Consultation on ${groupId.replace('episode_', '')}` : `Episode: ${groupId}`;
                const isExpanded = expandedGroups[groupId];
                const allSelected = docsInGroup.every(d => selectedIds.includes(d.id));

                return (
                  <div key={groupId} className="mb-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div 
                      className="bg-slate-50 px-4 py-3 flex items-center justify-between cursor-pointer border-b border-slate-100"
                      onClick={() => toggleGroup(groupId)}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={allSelected} 
                          onChange={(e) => {
                            e.stopPropagation();
                            if (allSelected) {
                              setSelectedIds(prev => prev.filter(id => !docsInGroup.some(d => d.id === id)));
                            } else {
                              const newIds = docsInGroup.map(d => d.id).filter(id => !selectedIds.includes(id));
                              setSelectedIds(prev => [...prev, ...newIds]);
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                        />
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          📁 {groupTitle}
                        </h3>
                        <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">{docsInGroup.length}</span>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? '▲' : '▼'}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="divide-y divide-slate-50">
                        {docsInGroup.map(doc => {
                          const expired = isExpired(doc);
                          return (
                            <div 
                              key={doc.id} 
                              className={`group flex items-center gap-3 md:gap-4 p-4 hover:bg-slate-50 transition-all cursor-pointer ${!doc.isRead && activeFolder === 'inbox' ? 'bg-blue-50/30' : 'bg-transparent'}`}
                              onClick={() => markAsRead(doc)}
                            >
                              <div className="shrink-0 pt-1" onClick={e => e.stopPropagation()}>
                                <input 
                                  type="checkbox" 
                                  checked={selectedIds.includes(doc.id)} 
                                  onChange={() => handleSelectOne(doc.id)} 
                                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                                />
                              </div>
                              
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0 shadow-sm border border-blue-100">
                                {expired ? '🔒' : (doc.recordType === 'prescription' ? '💊' : doc.recordType === 'lab_report' ? '🧪' : doc.recordType === 'mri' ? '🩻' : '📄')}
                              </div>

                              <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4">
                                <div className="min-w-0 md:flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm truncate">
                                      {activeFolder === 'inbox' && doc.senderName ? (
                                        <span className="text-blue-600 font-bold">From: {doc.senderName}</span>
                                      ) : (
                                        <span className={!doc.isRead && activeFolder === 'inbox' ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}>{doc.patientName}</span>
                                      )}
                                    </h4>
                                    {!doc.isRead && activeFolder === 'inbox' && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>}
                                    {doc.accessLevel === 'permanent' && activeFolder === 'inbox' && (
                                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Verified Referral
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-xs truncate ${!doc.isRead && activeFolder === 'inbox' ? 'text-slate-700 font-semibold' : 'text-slate-500'}`}>
                                    {doc.fileName}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono hidden sm:block">
                                    {formatSize(doc.fileSize)}
                                  </div>
                                  <div className="text-xs text-slate-400 w-16 text-right hidden sm:block">
                                    {doc.uploadDate?.toDate ? doc.uploadDate.toDate().toLocaleDateString(undefined, {month: 'short', day:'numeric'}) : 'Just now'}
                                  </div>
                                  
                                  {expired ? (
                                    <button 
                                      onClick={e => {
                                        e.stopPropagation();
                                        alert("This document's 24-hour access has expired. Please request authorization from the patient.");
                                      }}
                                      className="p-1.5 px-3 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg shadow-sm transition-all"
                                    >
                                      Request Access
                                    </button>
                                  ) : (
                                    <a 
                                      href={doc.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={e => e.stopPropagation()}
                                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg shadow-sm transition-all"
                                      title="View Document"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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
