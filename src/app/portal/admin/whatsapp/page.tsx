'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';

export default function WhatsAppChatAdmin() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Sessions
  useEffect(() => {
    const q = query(collection(db, 'whatsapp_sessions')); // Could order by lastInteraction if we add index
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by lastInteraction descending in memory to avoid index requirement for now
      sessData.sort((a: any, b: any) => (b.lastInteraction || 0) - (a.lastInteraction || 0));
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

  // Keep selectedSession state up to date when sessions list changes
  useEffect(() => {
    if (selectedSession) {
      const updated = sessions.find(s => s.id === selectedSession.id);
      if (updated && updated.state !== selectedSession.state) {
        setSelectedSession(updated);
      }
    }
  }, [sessions]);

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
    <div className="flex h-[calc(100vh-100px)] bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700">
          WhatsApp Sessions
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No active chats</div>
          ) : (
            sessions.map((s) => (
              <div 
                key={s.id} 
                onClick={() => setSelectedSession(s)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSession?.id === s.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-gray-800">{s.id}</span>
                  <span className="text-xs text-gray-500">
                    {s.lastInteraction ? new Date(s.lastInteraction).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                  </span>
                </div>
                <div className="text-sm text-gray-600 truncate">
                  State: <span className={s.state === 'HUMAN_TAKEOVER' ? 'text-red-500 font-medium' : 'text-green-500'}>{s.state || 'NEW'}</span>
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
            <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
              <div>
                <h2 className="font-semibold text-gray-800 text-lg">{selectedSession.id}</h2>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${selectedSession.state === 'HUMAN_TAKEOVER' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                  {selectedSession.state === 'HUMAN_TAKEOVER' ? 'Human Takeover (Bot Paused)' : 'Bot Auto-Reply Active'}
                </div>
              </div>
              <button 
                onClick={toggleTakeover}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${selectedSession.state === 'HUMAN_TAKEOVER' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
              >
                {selectedSession.state === 'HUMAN_TAKEOVER' ? 'Re-Enable Bot' : 'Takeover Chat'}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 my-10 bg-white/50 py-2 rounded-lg mx-auto w-fit px-4">
                  No messages logged yet. (Only new messages will appear here)
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div 
                    className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-white text-gray-800' 
                        : msg.role === 'admin' 
                          ? 'bg-blue-100 text-gray-800'
                          : 'bg-[#dcf8c6] text-gray-800'
                    }`}
                  >
                    {msg.role !== 'user' && (
                      <div className="text-[10px] uppercase font-bold mb-1 opacity-50 flex justify-end">
                        {msg.role}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div className="text-[10px] text-gray-500 text-right mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-gray-100 border-t border-gray-200">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..." 
                  className="flex-1 rounded-full px-4 py-2 border-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  disabled={selectedSession.state !== 'HUMAN_TAKEOVER'}
                />
                <button 
                  onClick={sendMessage}
                  disabled={!inputText.trim() || selectedSession.state !== 'HUMAN_TAKEOVER'}
                  className="bg-blue-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center disabled:opacity-50 hover:bg-blue-600 transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                    <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                  </svg>
                </button>
              </div>
              {selectedSession.state !== 'HUMAN_TAKEOVER' && (
                <div className="text-xs text-red-500 mt-2 text-center font-medium">
                  Click 'Takeover Chat' to disable the bot and type manually.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
            Select a session to view chat
          </div>
        )}
      </div>
    </div>
  );
}
