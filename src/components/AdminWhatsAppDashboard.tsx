"use client";

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, getDoc, getDocs, doc, setDoc, serverTimestamp, updateDoc, deleteField } from 'firebase/firestore';
import { indianStates, districtsByState, blocksByDistrict } from '@/lib/locations';

export default function AdminWhatsAppDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // internal tabs
  const [internalTab, setInternalTab] = useState<'inbox' | 'crm'>('inbox');

  // CRM State
  const [contacts, setContacts] = useState<any[]>([]);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [bulkUploadText, setBulkUploadText] = useState('');
  const [uploadGroup, setUploadGroup] = useState('General');
  const [groupFilter, setGroupFilter] = useState('All');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [crmLoading, setCrmLoading] = useState(true);
  const [messageType, setMessageType] = useState<'free' | 'template'>('free');
  const [templateName, setTemplateName] = useState('');

  // Import Wizard State
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [wizardCategory, setWizardCategory] = useState('');
  const [wizardState, setWizardState] = useState('');
  const [wizardDistrict, setWizardDistrict] = useState('');
  const [wizardBlock, setWizardBlock] = useState('');

  // API Config State
  const [waToken, setWaToken] = useState("");
  const [waPhoneId, setWaPhoneId] = useState("");
  const [waSaving, setWaSaving] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, "system_settings", "whatsapp"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setWaToken(data.token || "");
          setWaPhoneId(data.phoneId || "");
        }
      } catch (e) {
        console.error("Failed to load WhatsApp settings", e);
      }
    };
    fetchSettings();
  }, []);

  const saveWhatsAppSettings = async () => {
    setWaSaving(true);
    try {
      await setDoc(doc(db, "system_settings", "whatsapp"), {
        token: waToken,
        phoneId: waPhoneId,
        updatedAt: serverTimestamp()
      }, { merge: true });
      alert("WhatsApp API Keys saved successfully!");
    } catch (e) {
      console.error("Failed to save keys", e);
      alert("Failed to save WhatsApp API keys.");
    }
    setWaSaving(false);
  };

  // Fetch Sessions
  useEffect(() => {
    const q = query(collection(db, 'whatsapp_sessions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      sessData.sort((a: any, b: any) => {
        const timeA = a.lastInteraction?.toMillis ? a.lastInteraction.toMillis() : (a.lastInteraction || 0);
        const timeB = b.lastInteraction?.toMillis ? b.lastInteraction.toMillis() : (b.lastInteraction || 0);
        return timeB - timeA;
      });
      setSessions(sessData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Contacts
  useEffect(() => {
    const q = query(collection(db, 'whatsapp_contacts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContacts(contactData);
      setCrmLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Messages for Selected Session
  useEffect(() => {
    if (!selectedSession) return;
    const msgRef = collection(db, 'whatsapp_sessions', selectedSession.id, 'messages');
    const q = query(msgRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [selectedSession?.id]);

  // Keep selectedSession state up to date
  useEffect(() => {
    if (selectedSession) {
      const updated = sessions.find(s => s.id === selectedSession.id);
      if (updated && updated.state !== selectedSession.state) {
        setSelectedSession(updated);
      }
    }
  }, [sessions, selectedSession]);

  const toggleTakeover = async () => {
    if (!selectedSession) return;
    const newState = selectedSession.state === 'HUMAN_TAKEOVER' ? 'MAIN_MENU' : 'HUMAN_TAKEOVER';
    await fetch('/api/whatsapp/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: selectedSession.id, state: newState })
    });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !selectedSession) return;
    const text = inputText;
    setInputText('');
    
    await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: selectedSession.id, text })
    });
  };

  const saveBulkContacts = async () => {
    if (!bulkUploadText.trim()) return;
    const numbers = bulkUploadText.split(/[\n,]+/).map(n => n.trim().replace(/[^0-9]/g, '')).filter(n => n.length > 5);
    let count = 0;
    for (const num of numbers) {
      const existing = contacts.find(c => c.phone === num);
      const newTag = uploadGroup || 'General';
      const tags = Array.from(new Set([...(existing?.tags || (existing?.group ? [existing.group] : [])), newTag]));
      
      await setDoc(doc(db, 'whatsapp_contacts', num), {
        phone: num,
        name: existing ? existing.name : 'Imported Contact',
        tags: tags,
        ...(existing ? {} : { createdAt: serverTimestamp() })
      }, { merge: true });
      if (!existing) count++;
    }
    setBulkUploadText('');
    setUploadGroup('General');
    alert(`Processed ${numbers.length} numbers. Added ${count} new contacts and tagged all with "${uploadGroup || 'General'}"!`);
  };

  const executeWizardImport = async () => {
    if (!confirm("Start import based on these filters? This will skip duplicates automatically.")) return;
    setIsImporting(true);
    try {
      const snap = await getDocs(collection(db, 'directory'));
      let count = 0;
      
      const dateTag = `Imported: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;

      for (const d of snap.docs) {
        const data = d.data();
        
        // Apply Filters
        if (wizardCategory && data.category !== wizardCategory) continue;
        if (wizardState && data.state !== wizardState) continue;
        if (wizardDistrict && data.district !== wizardDistrict) continue;
        if (wizardBlock && data.city !== wizardBlock && data.block !== wizardBlock) continue;
        
        if (data.phone) {
          const num = String(data.phone).replace(/[^0-9]/g, '');
          if (num.length > 5) {
            const existing = contacts.find(c => c.phone === num);
            if (!existing) {
              const masterGroup = data.category ? `Directory - ${data.category}` : 'Directory';
              await setDoc(doc(db, 'whatsapp_contacts', num), {
                phone: num,
                name: data.name || 'Directory Contact',
                tags: [masterGroup, dateTag],
                createdAt: serverTimestamp()
              }, { merge: true });
              count++;
            }
          }
        }
      }
      setIsImportWizardOpen(false);
      alert(`Successfully imported ${count} fresh new contacts and tagged them with "${dateTag}"!`);
    } catch (e) {
      console.error(e);
      alert("Failed to import.");
    }
    setIsImporting(false);
  };

  const deleteGroupTag = async (tagToRemove: string) => {
    if (!confirm(`Are you sure you want to permanently delete the tag "${tagToRemove}" from all contacts? This will NOT delete the contacts themselves.`)) return;
    setCrmLoading(true);
    let updatedCount = 0;
    try {
      for (const c of contacts) {
        const currentTags = c.tags || (c.group ? [c.group] : ['General']);
        if (currentTags.includes(tagToRemove)) {
          const newTags = currentTags.filter((t: string) => t !== tagToRemove);
          await updateDoc(doc(db, 'whatsapp_contacts', c.id), {
            tags: newTags
          });
          updatedCount++;
        }
      }
      alert(`Tag removed from ${updatedCount} contacts.`);
      if (groupFilter === tagToRemove) setGroupFilter('All');
    } catch(e) {
      console.error(e);
      alert("Failed to delete tag.");
    }
    setCrmLoading(false);
  };

  const sendBroadcast = async () => {
    if (selectedContacts.size === 0) {
      alert("Please select at least one contact.");
      return;
    }
    if (messageType === 'free' && !broadcastMessage.trim()) {
      alert("Please enter a message to broadcast.");
      return;
    }
    if (messageType === 'template' && !templateName.trim()) {
      alert("Please enter the Meta Template Name.");
      return;
    }
    setIsBroadcasting(true);
    let success = 0;
    for (const phoneId of Array.from(selectedContacts)) {
      try {
        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            to: phoneId, 
            text: messageType === 'free' ? broadcastMessage : undefined,
            messageType: messageType,
            templateName: messageType === 'template' ? templateName : undefined
          })
        });
        success++;
      } catch (e) {
        console.error("Failed to send to", phoneId);
      }
    }
    setIsBroadcasting(false);
    alert(`Broadcast sent to ${success} contacts!`);
    setBroadcastMessage('');
    setSelectedContacts(new Set());
  };

  const toggleContactSelection = (phone: string) => {
    const newSet = new Set(selectedContacts);
    if (newSet.has(phone)) newSet.delete(phone);
    else newSet.add(phone);
    setSelectedContacts(newSet);
  };

  const filteredContacts = groupFilter === 'All' 
    ? contacts 
    : contacts.filter(c => (c.tags || (c.group ? [c.group] : ['General'])).includes(groupFilter));

  const uniqueGroups = Array.from(new Set(contacts.flatMap(c => c.tags || (c.group ? [c.group] : ['General']))));

  const toggleAllContacts = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.phone)));
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative border border-slate-200">
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              API Configuration
            </h2>
            <p className="text-sm text-slate-500 mb-6">Update credentials from your Meta Developer Portal.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Access Token</label>
                <input 
                  type="password" 
                  value={waToken} 
                  onChange={(e) => setWaToken(e.target.value)} 
                  placeholder="EAAL..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none font-mono text-sm" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Phone Number ID</label>
                <input 
                  type="text" 
                  value={waPhoneId} 
                  onChange={(e) => setWaPhoneId(e.target.value)} 
                  placeholder="1234567890" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none font-mono text-sm" 
                />
              </div>
            </div>
            <button 
              onClick={saveWhatsAppSettings}
              disabled={waSaving}
              className="w-full mt-6 py-4 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30 disabled:opacity-50"
            >
              {waSaving ? "Saving..." : "Save API Keys"}
            </button>
          </div>
        </div>
      )}

      {/* Header and Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setInternalTab('inbox')}
            className={`flex-1 md:flex-none py-2 px-6 font-bold text-sm rounded-lg transition-all ${internalTab === 'inbox' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Live Inbox
          </button>
          <button 
            onClick={() => setInternalTab('crm')}
            className={`flex-1 md:flex-none py-2 px-6 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${internalTab === 'crm' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Contacts & Broadcast
          </button>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
          title="API Settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </button>
      </div>

      {internalTab === 'inbox' && (
      <div className="flex flex-col lg:flex-row h-[700px] bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      {/* Sidebar */}
      <div className="w-full lg:w-1/3 bg-white border-r border-slate-200 flex flex-col h-1/2 lg:h-full">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-900">Live Sessions</h2>
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No active chats</div>
          ) : (
            sessions.map((s) => (
              <div 
                key={s.id} 
                onClick={() => setSelectedSession(s)}
                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedSession?.id === s.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-800">+{s.id}</span>
                  <span className="text-xs text-slate-400">
                    {s.lastInteraction ? new Date(s.lastInteraction?.toMillis ? s.lastInteraction.toMillis() : s.lastInteraction).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                  </span>
                </div>
                <div className="text-xs text-slate-500 truncate mt-1">
                  State: <span className={s.state === 'HUMAN_TAKEOVER' ? 'text-red-500 font-bold' : 'text-teal-600 font-bold'}>{s.state || 'NEW'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-full lg:w-2/3 flex flex-col bg-[#e5ddd5] h-1/2 lg:h-full">
        {selectedSession ? (
          <>
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
              <div>
                <h2 className="font-bold text-slate-900">+{selectedSession.id}</h2>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedSession.state === 'HUMAN_TAKEOVER' ? 'bg-red-500' : 'bg-teal-500'}`}></span>
                  {selectedSession.state === 'HUMAN_TAKEOVER' ? 'Human Takeover (Bot Paused)' : 'Bot Auto-Reply Active'}
                </div>
              </div>
              <button 
                onClick={toggleTakeover}
                className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${selectedSession.state === 'HUMAN_TAKEOVER' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20' : 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20'}`}
              >
                {selectedSession.state === 'HUMAN_TAKEOVER' ? 'Re-Enable Bot' : 'Takeover Chat'}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 my-10 bg-white/60 py-2 rounded-lg mx-auto w-fit px-4 text-sm font-medium">
                  No messages logged yet. (Only new messages will appear here)
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div 
                    className={`max-w-[75%] rounded-xl px-4 py-2 shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-white text-slate-800' 
                        : msg.role === 'admin' 
                          ? 'bg-blue-100 text-slate-800 border border-blue-200'
                          : 'bg-[#dcf8c6] text-slate-800 border border-[#cbe6b6]'
                    }`}
                  >
                    {msg.role !== 'user' && (
                      <div className="text-[9px] uppercase font-bold mb-1 opacity-40 flex justify-end">
                        {msg.role}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
                    <div className="text-[10px] text-slate-400 text-right mt-1.5 font-medium">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a manual reply..." 
                  className="flex-1 rounded-xl px-4 py-3 border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 shadow-sm text-sm outline-none transition-all disabled:opacity-50 disabled:bg-slate-100"
                  disabled={selectedSession.state !== 'HUMAN_TAKEOVER'}
                />
                <button 
                  onClick={sendMessage}
                  disabled={!inputText.trim() || selectedSession.state !== 'HUMAN_TAKEOVER'}
                  className="bg-teal-600 text-white rounded-xl px-6 font-bold disabled:opacity-50 hover:bg-teal-700 transition-colors shadow-md shadow-teal-500/20"
                >
                  Send
                </button>
              </div>
              {selectedSession.state !== 'HUMAN_TAKEOVER' && (
                <div className="text-xs text-slate-500 mt-2 text-center font-medium bg-slate-200/50 py-1.5 rounded-lg w-fit mx-auto px-4">
                  🔒 Click 'Takeover Chat' to disable the bot and type manually.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <p className="font-medium">Select a session from the left to view chat history</p>
          </div>
        )}
      </div>
      </div>
      )}

      {internalTab === 'crm' && (
        <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.05)] border border-slate-300 p-8 flex flex-col lg:flex-row gap-8 min-h-[700px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 hover:translate-x-full duration-1000 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>
          
          {/* Left Column: Contacts */}
          <div className="w-full lg:w-1/2 flex flex-col relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 text-xl drop-shadow-sm">Contact Manager</h3>
              <button 
                onClick={() => setIsImportWizardOpen(true)}
                disabled={isImporting}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors"
              >
                {isImporting ? <span className="animate-spin">...</span> : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                )}
                Advanced Import Wizard
              </button>
            </div>

            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-slate-200 shadow-sm mb-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Bulk Upload Numbers</h4>
              <div className="flex flex-col gap-3">
                 <textarea 
                   value={bulkUploadText}
                   onChange={(e) => setBulkUploadText(e.target.value)}
                   placeholder="Paste comma-separated phone numbers (e.g. 919876543210, 919876543211)"
                   className="w-full rounded-xl p-3 border border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 shadow-inner text-sm outline-none transition-all h-20 resize-none bg-white"
                 />
                 <div className="flex gap-3 items-center">
                   <div className="flex-1 relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                     </span>
                     <input 
                       type="text"
                       value={uploadGroup}
                       onChange={(e) => setUploadGroup(e.target.value)}
                       placeholder="Assign Group (e.g. Doctors, Cold Leads)"
                       className="w-full rounded-xl pl-9 pr-3 py-2 border border-slate-300 focus:border-teal-500 shadow-sm text-sm outline-none transition-all bg-white"
                     />
                   </div>
                   <button 
                     onClick={saveBulkContacts}
                     disabled={!bulkUploadText.trim()}
                     className="bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm disabled:opacity-50 hover:bg-slate-700 transition-colors shadow-sm"
                   >
                     Save
                   </button>
                 </div>
              </div>
            </div>
            <button 
              onClick={saveBulkContacts}
              disabled={!bulkUploadText.trim()}
              className="bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-sm mb-6 disabled:opacity-50 hover:bg-slate-700 transition-colors self-start"
            >
              Upload / Save Numbers
            </button>

            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="font-bold text-slate-700 text-sm">Saved Contacts ({filteredContacts.length})</span>
                <div className="mt-2 flex items-center gap-2">
                  <select 
                    value={groupFilter} 
                    onChange={e => setGroupFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2 py-1 shadow-sm text-xs focus:border-teal-500 outline-none bg-white font-medium text-slate-600 max-w-[200px]"
                  >
                    <option value="All">All Groups</option>
                    {uniqueGroups.map(g => (
                      <option key={g as string} value={g as string}>{g as string}</option>
                    ))}
                  </select>
                  {groupFilter !== 'All' && (
                    <button 
                      onClick={() => deleteGroupTag(groupFilter)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors text-xs font-bold border border-red-200"
                      title="Remove this tag from all contacts"
                    >
                      Delete Tag
                    </button>
                  )}
                </div>
              </div>
              <button onClick={toggleAllContacts} className="text-teal-600 text-xs font-bold hover:underline mb-1">
                {selectedContacts.size === filteredContacts.length && filteredContacts.length > 0 ? "Deselect Filtered" : "Select All Filtered"}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto border border-slate-300 rounded-2xl bg-white shadow-inner max-h-[400px]">
              {crmLoading ? (
                <div className="p-8 text-center text-slate-500">Loading contacts...</div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No contacts found.</div>
              ) : (
                filteredContacts.map(c => (
                  <div key={c.id} className="p-3 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={selectedContacts.has(c.phone)}
                        onChange={() => toggleContactSelection(c.phone)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-sm">+{c.phone}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-slate-400 shrink-0">Added {new Date(c.createdAt?.toMillis ? c.createdAt.toMillis() : c.createdAt).toLocaleDateString()}</span>
                          {(c.tags || (c.group ? [c.group] : ['General'])).map((tag: string, idx: number) => (
                            <span key={idx} className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded uppercase font-bold border border-slate-200 whitespace-nowrap">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Broadcast */}
          <div className="w-full lg:w-1/2 flex flex-col relative z-10">
            <h3 className="font-bold text-slate-900 mb-6 text-xl drop-shadow-sm">Broadcast Engine</h3>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-5 mb-6 shadow-sm">
              <h4 className="font-bold text-amber-800 text-sm mb-1.5 flex items-center gap-2">
                ⚠️ Meta's 24-Hour Policy
              </h4>
              <p className="text-xs text-amber-700/80 leading-relaxed">
                You can only send free-form text messages to users who have messaged your bot within the last 24 hours. For cold marketing to older contacts, you must use approved Meta Message Templates. (This tool currently sends raw text).
              </p>
            </div>

            <div className="mb-3 flex justify-between items-center px-1">
               <label className="text-sm font-bold text-slate-700">Message to Broadcast</label>
               <span className="text-xs font-bold text-teal-700 bg-teal-100 border border-teal-200 px-3 py-1 rounded-full shadow-sm">
                 {selectedContacts.size} Recipients Selected
               </span>
            </div>
            
            <div className="mb-4">
              <div className="flex p-1 bg-slate-100 rounded-xl w-full">
                <button 
                  onClick={() => setMessageType('free')}
                  className={`flex-1 py-2 font-bold text-xs rounded-lg transition-all ${messageType === 'free' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Free-Form Text (24h)
                </button>
                <button 
                  onClick={() => setMessageType('template')}
                  className={`flex-1 py-2 font-bold text-xs rounded-lg transition-all ${messageType === 'template' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Meta Template
                </button>
              </div>
            </div>
            
            {messageType === 'free' ? (
              <textarea 
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Type your promotional message here..."
                className="w-full bg-white rounded-2xl p-5 border border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 shadow-inner text-sm outline-none transition-all h-64 resize-none mb-6"
              />
            ) : (
              <div className="w-full bg-white rounded-2xl p-6 border border-slate-300 shadow-inner mb-6 h-64 flex flex-col justify-center items-center">
                <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <label className="text-sm font-bold text-slate-700 mb-2">Meta Template Name</label>
                <input 
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. promotional_offer_1"
                  className="w-full max-w-sm rounded-xl p-3 border border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 shadow-sm text-center font-mono text-sm outline-none transition-all"
                />
                <p className="text-xs text-slate-400 mt-4 text-center max-w-sm">
                  Must exactly match the template name approved in your Meta Business portal.
                </p>
              </div>
            )}

            <button 
              onClick={sendBroadcast}
              disabled={isBroadcasting || selectedContacts.size === 0 || (messageType === 'free' ? !broadcastMessage.trim() : !templateName.trim())}
              className="bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold py-4 rounded-2xl text-lg hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg shadow-teal-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isBroadcasting ? (
                <><span className="animate-spin text-2xl leading-none -mt-1">↻</span> Sending...</>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  Blast to {selectedContacts.size} Contacts
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Advanced Import Wizard Modal */}
      {isImportWizardOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative border border-slate-200">
            <button 
              onClick={() => setIsImportWizardOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Advanced Ecosystem Import</h2>
            <p className="text-sm text-slate-500 mb-6">Extract contacts from your main directory directly into the CRM. Existing CRM numbers are automatically skipped to prevent duplicates. Contacts will be tagged with a master group and today's date.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Category</label>
                <select value={wizardCategory} onChange={e => setWizardCategory(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 focus:border-teal-500 outline-none text-sm">
                  <option value="">All Categories</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Lab">Lab</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Ambulance">Ambulance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">State</label>
                  <select value={wizardState} onChange={e => { setWizardState(e.target.value); setWizardDistrict(''); setWizardBlock(''); }} className="w-full border border-slate-300 rounded-xl p-3 focus:border-teal-500 outline-none text-sm">
                    <option value="">All States</option>
                    {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">District</label>
                  <select value={wizardDistrict} onChange={e => { setWizardDistrict(e.target.value); setWizardBlock(''); }} disabled={!wizardState} className="w-full border border-slate-300 rounded-xl p-3 focus:border-teal-500 outline-none text-sm disabled:bg-slate-50">
                    <option value="">All Districts</option>
                    {wizardState && districtsByState[wizardState]?.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">City / Block</label>
                <select value={wizardBlock} onChange={e => setWizardBlock(e.target.value)} disabled={!wizardDistrict} className="w-full border border-slate-300 rounded-xl p-3 focus:border-teal-500 outline-none text-sm disabled:bg-slate-50">
                  <option value="">All Blocks</option>
                  {wizardDistrict && blocksByDistrict[wizardDistrict]?.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={executeWizardImport}
                disabled={isImporting}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isImporting ? <span className="animate-spin text-xl">↻</span> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>}
                {isImporting ? "Scanning & Importing..." : "Extract & Import"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
