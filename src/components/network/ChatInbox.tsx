"use client";

import React, { useState } from 'react';

export default function ChatInbox({ 
  currentUserRole 
}: { 
  currentUserRole: string 
}) {
  const [activeChat, setActiveChat] = useState<string | null>(null);

  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 flex h-[600px] animate-in fade-in slide-in-from-bottom-4">
      {/* Sidebar - Chat List */}
      <div className="w-1/3 border-r border-slate-100/50 bg-white/40 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Messages</h2>
          <p className="text-slate-500 text-sm">Secure Network Communication</p>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Search conversations..." className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {/* Empty state for now */}
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <p className="text-sm font-bold text-slate-600">No active chats</p>
            <p className="text-xs text-slate-500 mt-1">Start a conversation from your network tab</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-4 text-slate-300">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Select a conversation</h3>
            <p className="text-slate-500 max-w-sm">Securely chat with your {currentUserRole === 'patient' ? 'care team' : 'patients and B2B network'}.</p>
          </div>
        ) : (
          <div className="flex-1">
             {/* Chat UI will go here */}
          </div>
        )}
      </div>
    </div>
  );
}
