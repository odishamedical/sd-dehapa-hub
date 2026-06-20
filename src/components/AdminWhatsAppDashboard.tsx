"use client";

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AdminWhatsAppDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API Config State
  const [waToken, setWaToken] = useState("");
  const [waPhoneId, setWaPhoneId] = useState("");
  const [waSaving, setWaSaving] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* API Configuration Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
           API Configuration
        </h3>
        <p className="text-xs text-slate-400 mb-6">Update these credentials directly from your Meta Developer Portal. The bot will instantly start using them without requiring a redeploy.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Access Token</label>
            <input 
              type="password" 
              value={waToken} 
              onChange={(e) => setWaToken(e.target.value)} 
              placeholder="EAAL..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-[#25D366] outline-none font-mono text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Phone Number ID</label>
            <input 
              type="text" 
              value={waPhoneId} 
              onChange={(e) => setWaPhoneId(e.target.value)} 
              placeholder="1234567890" 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-[#25D366] outline-none font-mono text-sm" 
            />
          </div>
        </div>
        <button 
          onClick={saveWhatsAppSettings}
          disabled={waSaving}
          className="w-full md:w-auto mt-6 py-3 px-8 rounded-xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 font-bold hover:bg-[#25D366]/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {waSaving ? "Saving..." : "Save API Keys"}
        </button>
      </div>

      {/* Live Sessions Container */}
      <div className="flex h-[700px] bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col">
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
      <div className="w-2/3 flex flex-col bg-[#e5ddd5]">
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
  );
}
