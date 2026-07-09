"use client";

import React, { useState, useEffect, useRef } from 'react';
import { VaultService, VaultDocument, VaultFolder } from '@/lib/vault.service';
import VaultForwardModal from './VaultForwardModal';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ExtensionPoint } from '@/plugins/core/ExtensionPoint';

export default function SecureMedicalVault({ providerId, providerName }: { providerId: string, providerName?: string }) {
  const [activeFolder, setActiveFolder] = useState<VaultFolder>('inbox');
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  
  // Multi-select & Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // CRM Connections for Dropdown
  const [connections, setConnections] = useState<{id: string, name: string}[]>([]);
  const [showConnectionsDropdown, setShowConnectionsDropdown] = useState(false);

  // Upload Form
  const [recipientName, setRecipientName] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [recordType, setRecordType] = useState<VaultDocument['recordType']>('lab_report');
  const [accessLevel, setAccessLevel] = useState<'temporary'|'permanent'>('permanent');

  useEffect(() => {
    fetchDocuments();
  }, [providerId, activeFolder]);

  useEffect(() => {
    if (!providerId) { setLoading(false); return; }
    const fetchConnections = async () => {
      try {
        const q1 = query(collection(db, 'connections'), where('receiverId', '==', providerId), where('status', '==', 'approved'));
        const q2 = query(collection(db, 'connections'), where('initiatorId', '==', providerId), where('status', '==', 'approved'));
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        
        const conns = [...snap1.docs, ...snap2.docs].map(d => {
          const data = d.data();
          const otherId = data.initiatorId === providerId ? data.receiverId : data.initiatorId;
          const otherName = data.initiatorId === providerId ? data.receiverName : data.initiatorName;
          return { id: otherId, name: otherName };
        });
        const unique = Array.from(new Map(conns.map(c => [c.id, c])).values());
        setConnections(unique);
      } catch (e) {
        console.error("Failed to fetch connections for vault dropdown", e);
      }
    };
    fetchConnections();
  }, [providerId]);

  const fetchDocuments = async () => {
    if (!providerId) {
      setDocuments([]);
      setLoading(false);
      return;
    }
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
    
    // Auto-select first item if exists
    if (docs.length > 0 && !selectedFileId) {
      setSelectedFileId(docs[0].id);
    } else if (docs.length === 0) {
      setSelectedFileId(null);
    }
    
    setLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!recipientName || !recipientId) {
      alert("Please specify the recipient before uploading.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Resolve handle if needed
      let finalRecipientId = recipientId;
      if (recipientId.startsWith('@')) {
        const resolved = await VaultService.resolveVaultHandle(recipientId);
        if (!resolved) throw new Error("Could not find a user with that handle.");
        finalRecipientId = resolved.id;
      }

      const newDoc = await VaultService.directSendDocument(
        providerId, 
        providerName || "Medical Provider",
        finalRecipientId,
        file, 
        {
          patientName: recipientName,
          patientId: finalRecipientId,
          recordType,
          fileName: file.name,
          accessLevel: accessLevel
        },
        (progress) => setUploadProgress(progress)
      );
      
      if (activeFolder === 'sent') {
        setDocuments(prev => [newDoc, ...prev]);
      } else {
        alert("Record sent successfully!");
      }
      
      setRecipientName('');
      setRecipientId('');
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

  const handleSelectOne = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      setDocuments(prev => prev.filter(d => !selectedIds.includes(d.id)));
      setSelectedIds([]);
      if (selectedIds.includes(selectedFileId || '')) setSelectedFileId(null);
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
    d.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.senderName?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const selectedFile = documents.find(d => d.id === selectedFileId);

  return (
    <div className="bg-white/10 backdrop-blur-[40px] border border-white/20 rounded-[32px] overflow-hidden flex flex-col md:flex-row h-[85vh] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3),inset_0_1px_3px_rgba(255,255,255,0.2)] relative text-slate-100">
      
      {/* Mobile Header / Hamburger */}
      <div className="md:hidden bg-slate-900/60 p-4 border-b border-white/10 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <span className="font-bold text-white text-lg flex items-center gap-2">🗄️ Vault</span>
        </div>
        <div className="text-xs font-bold text-indigo-400 capitalize">{activeFolder}</div>
      </div>

      {/* Sidebar (Navigation) */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 inset-y-0 left-0 w-64 bg-slate-900/80 md:bg-transparent border-r border-white/10 flex flex-col transition-transform duration-300 shadow-2xl md:shadow-none backdrop-blur-2xl md:backdrop-blur-none`}>
        <div className="p-8 hidden md:block">
          <h2 className="text-2xl font-black text-white flex items-center gap-3 font-serif">
            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            Vault
          </h2>
        </div>

        <div className="px-6 py-2">
          <button 
            onClick={() => { setSelectedFileId(null); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
            className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${!selectedFileId ? 'ring-2 ring-white/50' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Send Record
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 mt-4">
          {[
            { id: 'inbox', label: 'Inbox', icon: '📥' },
            { id: 'sent', label: 'Sent', icon: '📤' }
          ].map(folder => (
            <button
              key={folder.id}
              onClick={() => { setActiveFolder(folder.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all ${
                activeFolder === folder.id 
                ? 'bg-white/10 text-white shadow-inner border border-white/5' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg opacity-80">{folder.icon}</span>
                {folder.label}
              </div>
            </button>
          ))}
          
          <div className="pt-6 pb-2 px-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Organization</h3>
          </div>
          
          {[
            { id: 'archive', label: 'Archive', icon: '📦' },
            { id: 'trash', label: 'Trash', icon: '🗑️' }
          ].map(folder => (
            <button
              key={folder.id}
              onClick={() => { setActiveFolder(folder.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all ${
                activeFolder === folder.id 
                ? 'bg-white/10 text-white shadow-inner border border-white/5' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg opacity-80">{folder.icon}</span>
                {folder.label}
              </div>
            </button>
          ))}
          
          {/* INJECTED PLUGINS (Family Profiles, Reminders) */}
          <ExtensionPoint name="vault_sidebar_widgets" providerId={providerId} />
          
        </nav>
      </div>

      {/* Middle Pane (List) */}
      <div className={`flex-1 flex flex-col bg-black/20 border-r border-white/10 transition-all ${selectedFileId && window.innerWidth < 1024 ? 'hidden lg:flex' : 'flex'}`}>
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white/5 backdrop-blur-md">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded-lg border-white/20 bg-black/20 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0"
              onChange={handleSelectAll}
              checked={selectedIds.length > 0 && selectedIds.length === documents.length}
            />
            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-2 animate-in fade-in">
                <button onClick={() => handleAction('archive')} className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors tooltip-trigger" title="Archive">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                </button>
                <button onClick={() => handleAction('trash')} className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors tooltip-trigger" title="Delete">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
                <span className="text-sm font-bold text-slate-400 ml-2">{selectedIds.length} selected</span>
              </div>
            ) : (
              <h3 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                {activeFolder} <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">{documents.length}</span>
              </h3>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 custom-scrollbar relative">
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
             </div>
          ) : Object.keys(groupedDocs).length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                 <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Folder is Empty</h3>
               <p className="text-slate-400 max-w-xs mx-auto">Files you receive or send will appear here.</p>
             </div>
          ) : (
            Object.entries(groupedDocs).map(([groupId, groupDocs]) => {
              const date = groupDocs[0]?.uploadDate?.toDate ? groupDocs[0].uploadDate.toDate().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date';
              return (
                <div key={groupId} className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden animate-in fade-in">
                  <div 
                    onClick={() => toggleGroup(groupId)}
                    className="bg-black/20 px-5 py-3 border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-black/30 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{date}</span>
                    <svg className={`w-4 h-4 text-slate-500 transition-transform ${expandedGroups[groupId] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                  
                  {expandedGroups[groupId] && (
                    <div className="divide-y divide-white/5">
                      {groupDocs.map(doc => {
                        const expired = isExpired(doc);
                        const isSelected = selectedIds.includes(doc.id);
                        const isActive = selectedFileId === doc.id;
                        
                        return (
                          <div 
                            key={doc.id} 
                            onClick={() => { setSelectedFileId(doc.id); markAsRead(doc); }}
                            className={`flex items-start gap-4 p-4 hover:bg-white/10 transition-colors cursor-pointer group relative ${!doc.isRead && activeFolder === 'inbox' ? 'bg-indigo-500/10' : ''} ${isActive ? 'bg-white/10 ring-1 ring-white/20' : ''}`}
                          >
                            <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectOne(doc.id)}
                                className="w-5 h-5 rounded border-white/20 bg-black/40 text-indigo-500 focus:ring-0 cursor-pointer"
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-base truncate ${!doc.isRead && activeFolder === 'inbox' ? 'font-black text-white' : 'font-bold text-slate-200'}`}>
                                  {doc.fileName}
                                </h4>
                                <span className="text-xs font-bold text-slate-400 whitespace-nowrap ml-4">
                                  {formatSize(doc.fileSize)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <span className="text-slate-400 truncate">
                                  {activeFolder === 'sent' ? `To: ${doc.patientName}` : `From: ${doc.senderName || doc.patientName}`}
                                </span>
                                {expired && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    EXPIRED
                                  </span>
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
            })
          )}
        </div>
      </div>

      {/* Right Pane (Contextual: Preview OR Upload Form) */}
      <div className={`w-full lg:w-[400px] xl:w-[450px] bg-slate-900/40 backdrop-blur-3xl flex flex-col transition-all ${!selectedFileId && window.innerWidth < 1024 ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Close button for mobile */}
        {selectedFileId && (
          <div className="lg:hidden p-4 border-b border-white/10 flex justify-start">
            <button onClick={() => setSelectedFileId(null)} className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white bg-white/10 px-4 py-2 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              Back to List
            </button>
          </div>
        )}

        {selectedFileId && selectedFile ? (
          /* FILE PREVIEW STATE */
          <div className="flex-1 overflow-y-auto p-6 animate-in fade-in slide-in-from-right-8 custom-scrollbar">
            <div className="w-full aspect-[4/3] bg-black/40 rounded-2xl mb-8 flex items-center justify-center border border-white/10 relative group overflow-hidden shadow-inner">
               <svg className="w-20 h-20 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
               {selectedFile.fileUrl && !isExpired(selectedFile) && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                   <a href={selectedFile.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                     View Document
                   </a>
                 </div>
               )}
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 font-serif break-words">{selectedFile.fileName}</h3>
            
            <div className="flex gap-2 mb-8">
              <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-slate-300 uppercase tracking-widest">{selectedFile.recordType.replace('_', ' ')}</span>
              <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-slate-300 uppercase tracking-widest">{formatSize(selectedFile.fileSize)}</span>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Record Details</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Patient</p>
                    <p className="font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">{selectedFile.patientName?.charAt(0)}</span>
                      {selectedFile.patientName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Sender</p>
                    <p className="font-bold text-white">{selectedFile.senderName || selectedFile.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Date</p>
                    <p className="font-bold text-white">{selectedFile.uploadDate?.toDate ? selectedFile.uploadDate.toDate().toLocaleString() : 'Processing...'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Access Level</p>
                    {isExpired(selectedFile) ? (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Expired</span>
                    ) : (
                      <p className="font-bold text-emerald-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        {selectedFile.accessLevel === 'temporary' ? '24-Hour Access' : 'Lifelong Access'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsForwardModalOpen(true)}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  Forward
                </button>
                <a 
                  href={selectedFile.fileUrl}
                  download
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-colors tooltip-trigger"
                  title="Download File"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* SEND RECORD FORM STATE */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 animate-in fade-in slide-in-from-right-8 custom-scrollbar relative">
            <h3 className="text-xl font-bold text-white font-serif mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              </div>
              Send Record
            </h3>

            <div className="space-y-6">
              
              {/* Smart Recipient Search */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Send To (Patient / Partner)</label>
                <input 
                  type="text" 
                  placeholder="Search connections or type handle..." 
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    setShowConnectionsDropdown(true);
                  }}
                  onFocus={() => setShowConnectionsDropdown(true)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                
                {/* Auto-complete dropdown */}
                {showConnectionsDropdown && recipientName && (
                  <div className="absolute z-50 mt-2 w-full bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {connections.filter(c => c.name.toLowerCase().includes(recipientName.toLowerCase())).map(conn => (
                      <div 
                        key={conn.id}
                        onClick={() => {
                          setRecipientName(conn.name);
                          setRecipientId(conn.id);
                          setShowConnectionsDropdown(false);
                        }}
                        className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">{conn.name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-bold text-white">{conn.name}</p>
                        </div>
                      </div>
                    ))}
                    {connections.filter(c => c.name.toLowerCase().includes(recipientName.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-xs text-slate-400">
                        No connections found. You can type a handle (e.g. @johndoe) manually below.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fallback Handle Input if not selected from CRM */}
              {!recipientId && recipientName && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Recipient Handle</label>
                  <input 
                    type="text" 
                    placeholder="e.g. @johndoe" 
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Record Type</label>
                <select 
                  value={recordType}
                  onChange={(e: any) => setRecordType(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="lab_report">Lab Report</option>
                  <option value="prescription">Prescription</option>
                  <option value="mri">MRI / Scan</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Access Level</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setAccessLevel('permanent')}
                    className={`py-3 px-4 rounded-xl text-sm font-bold border transition-colors ${accessLevel === 'permanent' ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'}`}
                  >
                    Lifelong
                  </button>
                  <button 
                    onClick={() => setAccessLevel('temporary')}
                    className={`py-3 px-4 rounded-xl text-sm font-bold border transition-colors ${accessLevel === 'temporary' ? 'bg-amber-500 border-amber-400 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'}`}
                  >
                    24-Hour
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-white/20 rounded-2xl bg-black/20 hover:bg-white/5 hover:border-indigo-400/50 transition-all cursor-pointer flex flex-col items-center justify-center group"
                >
                  <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  </div>
                  <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Select File to Send</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (Max 15MB)</p>
                </div>
              </div>

              {isUploading && (
                <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between text-xs font-bold text-indigo-300 mb-2">
                    <span>Sending to {recipientName}...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-300 relative overflow-hidden" style={{ width: `${uploadProgress}%` }}>
                       <div className="absolute inset-0 bg-white/30 skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isForwardModalOpen && selectedFile && (
        <VaultForwardModal 
          onClose={() => setIsForwardModalOpen(false)} 
          providerId={providerId}
          providerName={providerName || "Medical Provider"}
          docToForward={selectedFile}
          onSuccess={() => {
             setIsForwardModalOpen(false);
             if (activeFolder === 'sent') fetchDocuments(); // refresh sent list
          }}
        />
      )}

    </div>
  );
}
