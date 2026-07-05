"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { ChatService, ChatThread, ChatMessage } from '@/services/chat.service';

export default function FloatingChat() {
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Global listener to open chat from anywhere
  useEffect(() => {
    const handleOpenChat = async (e: any) => {
      const targetId = e.detail;
      if (!user || !targetId) return;
      
      setIsOpen(true);
      setTargetUserId(targetId);

      // Fetch user data to create thread if needed
      const currentUserData = { id: user.uid, name: user.displayName || 'Me', role: localStorage.getItem('sd_current_user_role') || 'patient' };
      
      // We would ideally fetch target user details from directory here, using basic fallback
      const targetUserData = { id: targetId, name: 'Connection', role: 'partner' }; 
      
      try {
        const threadId = await ChatService.getOrCreateThread(currentUserData, targetUserData);
        setActiveThreadId(threadId);
      } catch (err) {
        console.error("Failed to open chat", err);
      }
    };

    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, [user]);

  // Listen to user's chat threads
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'), 
      where('participants', 'array-contains', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetchedThreads = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatThread));
      // Sort by latest message
      fetchedThreads.sort((a, b) => {
        const timeA = a.lastMessageTime?.toMillis ? a.lastMessageTime.toMillis() : 0;
        const timeB = b.lastMessageTime?.toMillis ? b.lastMessageTime.toMillis() : 0;
        return timeB - timeA;
      });
      setThreads(fetchedThreads);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen to messages when a thread is active
  useEffect(() => {
    if (!activeThreadId) return;
    
    const q = query(
      collection(db, `chats/${activeThreadId}/messages`),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetchedMessages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(fetchedMessages);
      scrollToBottom();
      
      // Mark as read
      if (user) ChatService.markThreadRead(activeThreadId, user.uid);
    });

    return () => unsubscribe();
  }, [activeThreadId, user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThreadId || !user) return;
    
    // Find target user ID
    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;
    const targetId = thread.participants.find(p => p !== user.uid);
    if (!targetId) return;

    const messageText = newMessage;
    setNewMessage('');
    
    try {
      await ChatService.sendMessage(activeThreadId, user.uid, targetId, messageText);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (!user) return null;

  const unreadTotal = threads.reduce((acc, t) => acc + (t.unreadCount[user.uid] || 0), 0);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[550px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200 mb-4 overflow-hidden flex flex-col pointer-events-auto animate-in slide-in-from-bottom-8 zoom-in-95 duration-300">
          
          {/* Header */}
          <div className="bg-indigo-600 px-5 py-4 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-3">
              {activeThreadId ? (
                <button onClick={() => setActiveThreadId(null)} className="text-white/80 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
              ) : null}
              <h3 className="font-bold text-white">
                {activeThreadId 
                  ? threads.find(t => t.id === activeThreadId)?.participantData[threads.find(t => t.id === activeThreadId)?.participants.find(p => p !== user.uid) || '']?.name || 'Chat'
                  : 'Messages'
                }
              </h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white bg-indigo-700/50 hover:bg-indigo-700 rounded-full p-1.5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden relative bg-slate-50">
            {!activeThreadId ? (
              // Thread List
              <div className="h-full overflow-y-auto custom-scrollbar p-2">
                {threads.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    </div>
                    <p className="font-bold text-slate-600">No messages yet</p>
                    <p className="text-sm mt-1">Connect with patients or providers to start chatting.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {threads.map(thread => {
                      const otherId = thread.participants.find(p => p !== user.uid) || '';
                      const otherData = thread.participantData[otherId];
                      const unread = thread.unreadCount[user.uid] || 0;
                      return (
                        <button 
                          key={thread.id}
                          onClick={() => setActiveThreadId(thread.id || null)}
                          className="w-full p-4 flex items-center gap-4 hover:bg-white rounded-2xl transition-colors text-left"
                        >
                          <div className="relative">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
                              {otherData?.name?.charAt(0).toUpperCase()}
                            </div>
                            {unread > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                                {unread}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                              <h4 className="font-bold text-slate-800 truncate pr-2">{otherData?.name || 'Unknown'}</h4>
                              <span className="text-[10px] font-bold text-slate-400">
                                {thread.lastMessageTime?.toDate ? thread.lastMessageTime.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                              {thread.lastMessage || 'Tap to chat...'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // Active Chat
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                  {messages.map((msg, i) => {
                    const isMe = msg.senderId === user.uid;
                    const showAvatar = i === 0 || messages[i-1].senderId !== msg.senderId;
                    
                    return (
                      <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}>
                        {!isMe && showAvatar && (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 mt-auto"></div>
                        )}
                        {!isMe && !showAvatar && <div className="w-8 flex-shrink-0"></div>}
                        
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'}`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input Box */}
                <div className="p-3 bg-white border-t border-slate-100">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl p-2.5 transition-colors flex items-center justify-center shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-[0_10px_25px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1 relative"
      >
        {isOpen ? (
           <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        ) : (
           <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        )}
        
        {!isOpen && unreadTotal > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-md animate-in zoom-in">
            {unreadTotal > 99 ? '99+' : unreadTotal}
          </div>
        )}
      </button>

    </div>
  );
}
