"use client";

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';

interface ContextHelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  userProfile: any;
  roleName: string;
}

export default function ContextHelpDrawer({ isOpen, onClose, activeTab, userProfile, roleName }: ContextHelpDrawerProps) {
  const [view, setView] = useState<'guide' | 'ticket' | 'chat'>('guide');
  
  // Ticket State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Contextual Content Mapping
  const getContextContent = (tabId: string) => {
    switch (tabId) {
      case 'identity':
        return {
          title: "Identity & Basic Info",
          content: "This page is the foundation of your digital clinic. Uploading a high-quality square image builds trust. Your 'Custom Slug' is your unique DehaPa URL. Ensure your primary phone number is active for patient queries."
        };
      case 'location':
        return {
          title: "Locations & Address",
          content: "Accurate location data ensures patients can find you on the map. If you operate at multiple clinics, list them all here so patients can choose the most convenient spot."
        };
      case 'professional':
        return {
          title: "Professional & Services",
          content: "Detail your medical expertise here. Adding comprehensive Qualifications and exact Clinic Timings (including split shifts) ensures patients book you at the right time. Accurate consultation fees prevent patient drop-offs."
        };
      case 'accreditations_insurance':
        return {
          title: "Accreditations & Insurance",
          content: "Patients frequently search for hospitals that accept their specific health insurance (e.g., Ayushman Bharat, ESI). List every TPA and government scheme you support here to dramatically increase your visibility."
        };
      case 'departments':
        return {
          title: "Departments & Roster",
          content: "Build your hospital's hierarchy here. First, create a Department (like Cardiology). Then, add doctors to it. If the doctor is already on DehaPa, search their name and click Connect. If they are new, enter their details manually to create a 'Ghost Profile', then copy the Magic Link and send it to them via WhatsApp to claim!"
        };
      case 'health_packages':
        return {
          title: "Health Packages",
          content: "Preventive care is a growing sector. List your comprehensive health packages (e.g., 'Full Body Checkup') with pricing and features to attract proactive patients."
        };
      case 'home':
        return {
          title: "Dashboard Home",
          content: "Welcome to your DehaPa Operating System! From here, you can navigate to different modules to build out your profile. Remember, you must reach 100% completion before you can publish your profile live to the public."
        };
      default:
        return {
          title: `Guide: ${tabId.replace(/_/g, ' ')}`,
          content: "Fill out the fields in this section accurately. This data will be used to generate your premium public profile. If you get stuck, feel free to open a support ticket!"
        };
    }
  };

  const contextData = getContextContent(activeTab);

  // Chat Listener
  useEffect(() => {
    if (view === 'chat' && userProfile?.email) {
      const q = query(
        collection(db, 'chat_messages'),
        where('userId', '==', userProfile.email),
        orderBy('createdAt', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });
      return () => unsubscribe();
    }
  }, [view, userProfile]);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;
    setIsSubmittingTicket(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        userId: userProfile?.email || 'Unknown',
        userName: userProfile?.name || 'Unknown User',
        userRole: roleName,
        subject: ticketSubject,
        description: ticketDescription,
        status: 'open',
        contextTab: activeTab,
        createdAt: serverTimestamp()
      });
      setTicketSuccess(true);
      setTicketSubject('');
      setTicketDescription('');
      setTimeout(() => setTicketSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit ticket.");
    }
    setIsSubmittingTicket(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userProfile?.email) return;
    const msgText = newMessage.trim();
    setNewMessage(''); // optimistic clear
    try {
      await addDoc(collection(db, 'chat_messages'), {
        userId: userProfile.email,
        userName: userProfile.name || 'User',
        text: msgText,
        sender: 'user', // 'user' or 'admin'
        createdAt: serverTimestamp(),
        isRead: false
      });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-teal-600 to-indigo-600 text-white shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-serif flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Help & Guide
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          {/* Navigation */}
          <div className="flex bg-white/10 p-1 rounded-xl">
            <button 
              onClick={() => setView('guide')} 
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${view === 'guide' ? 'bg-white text-teal-700 shadow-md' : 'text-white/80 hover:bg-white/20'}`}
            >
              Guide
            </button>
            <button 
              onClick={() => setView('chat')} 
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${view === 'chat' ? 'bg-white text-indigo-700 shadow-md' : 'text-white/80 hover:bg-white/20'}`}
            >
              Live Chat
            </button>
            <button 
              onClick={() => setView('ticket')} 
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${view === 'ticket' ? 'bg-white text-rose-700 shadow-md' : 'text-white/80 hover:bg-white/20'}`}
            >
              Ticket
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative">
          
          {/* VIEW: GUIDE */}
          {view === 'guide' && (
            <div className="p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Page Context</h3>
                    <h4 className="font-bold text-slate-900 text-lg">{contextData.title}</h4>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {contextData.content}
                </p>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-indigo-200/50 rounded-full blur-2xl group-hover:bg-indigo-300/50 transition-colors"></div>
                <h4 className="font-bold text-indigo-900 mb-2">Still confused?</h4>
                <p className="text-sm text-indigo-700 mb-4 relative z-10">Our support team is available 24/7 to assist you with setting up your profile.</p>
                <div className="flex gap-2 relative z-10">
                  <button onClick={() => setView('chat')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold transition-colors">Open Chat</button>
                  <button onClick={() => setView('ticket')} className="flex-1 bg-white text-indigo-600 hover:bg-indigo-100 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm">Raise Ticket</button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: TICKET */}
          {view === 'ticket' && (
            <div className="p-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Submit Support Ticket</h3>
                <p className="text-xs text-slate-500">Provide details about your issue and our team will email you back shortly.</p>
              </div>
              
              {ticketSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-6 rounded-2xl text-center animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h4 className="font-bold text-lg mb-1">Ticket Submitted!</h4>
                  <p className="text-sm">We'll look into it right away.</p>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Subject</label>
                    <input 
                      type="text" 
                      required
                      value={ticketSubject}
                      onChange={e => setTicketSubject(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all shadow-sm"
                      placeholder="e.g., Cannot publish profile"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Description</label>
                    <textarea 
                      required
                      value={ticketDescription}
                      onChange={e => setTicketDescription(e.target.value)}
                      rows={5}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all shadow-sm resize-none"
                      placeholder="Please describe your issue in detail..."
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmittingTicket}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_15px_rgba(225,29,72,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmittingTicket ? (
                      <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Submitting...</>
                    ) : (
                      <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg> Send Ticket</>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* VIEW: CHAT */}
          {view === 'chat' && (
            <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-4 duration-300">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                <div className="text-center mb-6">
                  <div className="inline-block bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">Live Support</div>
                  <p className="text-xs text-slate-500">Messages will be answered as soon as an agent is available. You will receive an email notification if you are offline.</p>
                </div>

                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    <p className="text-sm font-medium">Send a message to start chatting</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender === 'user';
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        }`}>
                          {msg.text}
                          <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {msg.createdAt?.toMillis ? new Date(msg.createdAt.toMillis()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sending...'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-12 h-12 bg-indigo-600 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center shadow-md hover:bg-indigo-700 transition-colors shrink-0"
                  >
                    <svg className="w-5 h-5 translate-x-[-1px] translate-y-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
