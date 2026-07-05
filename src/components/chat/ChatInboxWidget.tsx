import React, { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { ChatService, ChatThread, ChatMessage } from '@/services/chat.service';

interface ChatInboxWidgetProps {
  initialTargetId?: string | null;
}

export default function ChatInboxWidget({ initialTargetId = null }: ChatInboxWidgetProps) {
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

  // Handle initialTargetId to auto-open a specific chat
  useEffect(() => {
    if (initialTargetId && threads.length > 0) {
      const targetThread = threads.find(t => t.participants.includes(initialTargetId));
      if (targetThread) {
        setActiveThreadId(targetThread.id || null);
      }
    }
  }, [initialTargetId, threads]);

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

  if (authLoading) return <div className="flex h-full items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
  if (!user) return null;

  const activeThread = threads.find(t => t.id === activeThreadId);
  const activeOtherId = activeThread?.participants.find(p => p !== user.uid) || '';
  const activeOtherData = activeThread?.participantData[activeOtherId];

  return (
    <div className="flex h-[calc(100vh-140px)] bg-slate-900/50 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95">
      
      {/* Sidebar - Thread List */}
      <div className="w-[340px] border-r border-white/10 flex flex-col bg-slate-800/50 backdrop-blur-md">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-black text-white font-display">Inbox</h1>
          <p className="text-sm text-slate-400 font-bold mt-1">Secure internal messaging</p>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {threads.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </div>
              <h3 className="font-bold text-white">No Messages</h3>
              <p className="text-slate-400 text-sm mt-1">Start chatting via Connections.</p>
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
                  className={`w-full p-4 flex items-center gap-4 rounded-2xl transition-all text-left border ${isActive ? 'bg-indigo-600/20 border-indigo-500/50 shadow-md shadow-indigo-900/20' : 'bg-transparent border-transparent hover:bg-slate-700/50'}`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border ${isActive ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                      {otherData?.name?.charAt(0).toUpperCase()}
                    </div>
                    {unread > 0 && !isActive && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                        {unread}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`truncate pr-2 ${isActive ? 'font-black text-indigo-300' : 'font-bold text-white'}`}>{otherData?.name || 'Unknown'}</h4>
                      <span className={`text-[10px] font-bold shrink-0 ${isActive ? 'text-indigo-300/80' : 'text-slate-400'}`}>
                        {thread.lastMessageTime?.toDate ? thread.lastMessageTime.toDate().toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${unread > 0 && !isActive ? 'font-bold text-white' : 'text-slate-400'}`}>
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
      <div className="flex-1 flex flex-col bg-slate-800/80">
        {!activeThreadId ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-transparent">
            <div className="w-24 h-24 bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            </div>
            <h2 className="text-2xl font-black text-white font-display">Your Messages</h2>
            <p className="text-slate-400 mt-2 font-bold max-w-sm text-center">Select a conversation from the sidebar to view messages.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between bg-slate-900/50 shadow-sm z-10 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full flex items-center justify-center font-bold text-xl shadow-inner">
                  {activeOtherData?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">{activeOtherData?.name}</h2>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{activeOtherData?.role}</p>
                </div>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-transparent">
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
                        <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-300 flex-shrink-0 mt-auto flex items-center justify-center font-bold shadow-sm border border-slate-600">
                          {activeOtherData?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {!isMe && !showAvatar && <div className="w-10 flex-shrink-0"></div>}
                      
                      <div className={`max-w-[70%] px-6 py-4 rounded-3xl ${isMe ? 'bg-indigo-600 text-white rounded-br-sm shadow-[0_4px_14px_rgba(79,70,229,0.3)]' : 'bg-slate-700/80 backdrop-blur-md border border-white/5 text-white rounded-bl-sm shadow-[0_4px_14px_rgba(0,0,0,0.1)]'}`}>
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
            <div className="p-6 bg-slate-900/50 border-t border-white/10 backdrop-blur-md">
              <form onSubmit={handleSendMessage} className="flex gap-4">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-2xl px-6 py-4 text-[15px] focus:outline-none focus:bg-slate-700 focus:border-indigo-500 transition-all font-medium text-white placeholder-slate-400 shadow-inner"
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
  );
}
