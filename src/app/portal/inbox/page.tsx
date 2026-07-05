"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { ChatService, ChatThread, ChatMessage } from '@/services/chat.service';
import DashboardLayout from '@/components/DashboardLayout';

export default function InboxPage() {
  const [user, authLoading] = useAuthState(auth);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  if (authLoading) return <DashboardLayout><div className="flex h-screen items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div></DashboardLayout>;
  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  const activeThread = threads.find(t => t.id === activeThreadId);
  const activeOtherId = activeThread?.participants.find(p => p !== user.uid) || '';
  const activeOtherData = activeThread?.participantData[activeOtherId];

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-120px)] bg-white/30 backdrop-blur-[40px] rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 overflow-hidden animate-in fade-in zoom-in-95 mt-4">
        
        {/* Sidebar - Thread List */}
        <div className="w-1/3 min-w-[300px] border-r border-white/60 flex flex-col bg-slate-50/50 backdrop-blur-md">
          <div className="p-6 border-b border-white/60">
            <h1 className="text-2xl font-black text-slate-800">Inbox</h1>
            <p className="text-sm text-slate-500 font-bold mt-1">Manage your secure conversations</p>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {threads.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </div>
                <h3 className="font-bold text-slate-700">No Messages</h3>
                <p className="text-slate-500 text-sm mt-1">When you connect with patients or providers, your chats will appear here.</p>
              </div>
            ) : (
              threads.map(thread => {
                const otherId = thread.participants.find(p => p !== user.uid) || '';
                const otherData = thread.participantData[otherId];
                const unread = thread.unreadCount[user.uid] || 0;
                const isActive = thread.id === activeThreadId;
                
                return (
                  <button 
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id || null)}
                    className={`w-full p-4 flex items-center gap-4 rounded-2xl transition-all text-left border ${isActive ? 'bg-white border-indigo-100 shadow-md shadow-indigo-100/50' : 'bg-transparent border-transparent hover:bg-white/60'}`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isActive ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                        {otherData?.name?.charAt(0).toUpperCase()}
                      </div>
                      {unread > 0 && !isActive && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          {unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className={`truncate pr-2 ${isActive ? 'font-black text-indigo-900' : 'font-bold text-slate-800'}`}>{otherData?.name || 'Unknown'}</h4>
                        <span className={`text-[10px] font-bold shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                          {thread.lastMessageTime?.toDate ? thread.lastMessageTime.toDate().toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${unread > 0 && !isActive ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                        {thread.lastMessage || 'Start a conversation...'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {!activeThreadId ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/30">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mb-6">
                 <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
              </div>
              <h2 className="text-2xl font-black text-slate-800">Your Messages</h2>
              <p className="text-slate-500 mt-2 font-bold max-w-sm text-center">Select a conversation from the sidebar to view messages.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xl shadow-inner">
                    {activeOtherData?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800">{activeOtherData?.name}</h2>
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{activeOtherData?.role}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </button>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#f8fafc]">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <p className="font-bold">This is the beginning of your conversation.</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.senderId === user.uid;
                    const showAvatar = i === 0 || messages[i-1].senderId !== msg.senderId;
                    
                    return (
                      <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-3 animate-in fade-in`}>
                        {!isMe && showAvatar && (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex-shrink-0 mt-auto flex items-center justify-center font-bold shadow-sm">
                            {activeOtherData?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {!isMe && !showAvatar && <div className="w-10 flex-shrink-0"></div>}
                        
                        <div className={`max-w-[70%] px-6 py-4 rounded-3xl ${isMe ? 'bg-indigo-600 text-white rounded-br-sm shadow-[0_4px_14px_rgba(79,70,229,0.3)]' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm shadow-[0_4px_14px_rgba(0,0,0,0.02)]'}`}>
                          <p className="text-[15px] leading-relaxed">{msg.text}</p>
                          <div className={`text-[10px] mt-2 font-bold ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sending...'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex gap-4">
                  <button type="button" className="p-4 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                  </button>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-[15px] focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-800"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-2xl px-8 transition-colors flex items-center justify-center font-bold gap-2 shadow-[0_4px_14px_rgba(79,70,229,0.3)]"
                  >
                    Send
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
