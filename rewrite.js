const fs = require('fs');

let content = fs.readFileSync('src/components/SecureMedicalVault.tsx', 'utf-8');

// Chunk 1
content = content.replace(
    "const [searchQuery, setSearchQuery] = useState('');",
    "const [searchQuery, setSearchQuery] = useState('');\n  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});"
);

// Chunk 2
const old_fetch = `  const fetchDocuments = async () => {
    if (!providerId) return;
    setLoading(true);
    const docs = await VaultService.getDocuments(providerId, activeFolder);
    setDocuments(docs);
    setSelectedIds([]);
    setLoading(false);
  };`;
const new_fetch = `  const fetchDocuments = async () => {
    if (!providerId) return;
    setLoading(true);
    const docs = await VaultService.getDocuments(providerId, activeFolder);
    setDocuments(docs);
    setSelectedIds([]);
    
    const newExpanded: Record<string, boolean> = {};
    docs.forEach(d => {
      const g = d.consultationId || \`episode_\\${d.uploadDate?.toDate ? d.uploadDate.toDate().toISOString().split('T')[0] : 'unknown'}\`;
      newExpanded[g] = true;
    });
    setExpandedGroups(newExpanded);
    
    setLoading(false);
  };`;
content = content.replace(old_fetch, new_fetch);

// Chunk 3
const old_filter = `  const filteredDocs = documents.filter(d => 
    d.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );`;
const new_filter = old_filter + `

  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    const groupId = doc.consultationId || \`episode_\\${doc.uploadDate?.toDate ? doc.uploadDate.toDate().toISOString().split('T')[0] : 'unknown'}\`;
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
  };`;
content = content.replace(old_filter, new_filter);

// Chunk 4
const start_tag = '<div className="divide-y divide-slate-100/60">';
const end_tag = '</div>\\n          )}\\n        </div>';

if (content.includes(start_tag)) {
    const start_idx = content.indexOf(start_tag);
    let end_idx = content.indexOf(end_tag, start_idx);
    if(end_idx === -1) {
        // Fallback for end tag matching line endings
        end_idx = content.indexOf('</div>\\r\\n          )}\\r\\n        </div>', start_idx);
    }
    
    if (end_idx !== -1) {
      end_idx += '</div>'.length;
      const new_list_view = \`<div className="divide-y divide-slate-100/60 p-4">
              {Object.entries(groupedDocs).map(([groupId, docsInGroup]) => {
                const groupTitle = groupId.startsWith('episode_') ? \\\`Consultation on \\${groupId.replace('episode_', '')}\\\` : \\\`Episode: \\${groupId}\\\`;
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
                              className={\\\`group flex items-center gap-3 md:gap-4 p-4 hover:bg-slate-50 transition-all cursor-pointer \\${!doc.isRead && activeFolder === 'inbox' ? 'bg-blue-50/30' : 'bg-transparent'}\\\`}
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
                                        <span className={\\!doc.isRead && activeFolder === 'inbox' ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}>{doc.patientName}</span>
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
                                  <p className={\\\`text-xs truncate \\${!doc.isRead && activeFolder === 'inbox' ? 'text-slate-700 font-semibold' : 'text-slate-500'}\\\`}>
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
            </div>\`;
      content = content.substring(0, start_idx) + new_list_view + content.substring(end_idx);
    }
}

fs.writeFileSync('src/components/SecureMedicalVault.tsx', content, 'utf-8');
