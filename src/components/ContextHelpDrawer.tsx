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
      case 'identity_infrastructure':
        return {
          title: "Identity & Infrastructure",
          content: "This is the core of your diagnostic facility. Uploading pictures of your actual heavy machinery (like your 3T MRI) builds massive trust with patients. Make sure to accurately list your accreditations like NABL/NABH."
        };
      case 'test_menu':
        return {
          title: "Diagnostic Test Menu",
          content: "Start typing to add tests. Our smart system will auto-suggest tests from our global medical dictionary! If you offer a unique test that isn't in our database, simply type it out and we will save it for the future."
        };
      case 'personnel':
        return {
          title: "Key Personnel & Roster",
          content: "Link Verified Doctors (Chief Pathologists and Radiologists) to your lab here. This shows patients exactly who is signing their reports."
        };
      case 'vault':
        return {
          title: "Health Vault: Your Medical Records",
          content: (
            <div className="space-y-3">
              <p><strong>What is the Health Vault?</strong><br/>It is a highly secure, encrypted digital locker where you can upload and permanently store your medical history, including prescriptions, lab reports, X-rays, and MRI scans.</p>
              <p><strong>How to use it:</strong></p>
              <ul className="list-decimal pl-4 space-y-1">
                <li>Click the "Upload Record" button.</li>
                <li>Select a photo or PDF from your device.</li>
                <li>Give it a clear title (e.g., "Blood Test Jan 2026").</li>
              </ul>
              <p><strong>Privacy & Sharing:</strong><br/>Your data is private. When you start an urgent video call with a doctor on DehaPa, the doctor is granted <em>temporary</em> read-only access to your vault to provide an accurate diagnosis. The moment the call ends, their access is immediately revoked.</p>
            </div>
          )
        };
      case 'appointments':
        return {
          title: "My Appointments & Bookings",
          content: (
            <div className="space-y-3">
              <p><strong>Managing your schedule:</strong><br/>This section displays all your upcoming and past medical consultations. It helps you keep track of your healthcare journey.</p>
              <p><strong>How to join a Video Call:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Find your scheduled appointment in the list.</li>
                <li>Exactly 5 minutes before the scheduled time, a "Join Call" button will become active.</li>
                <li>Click it to enter the secure waiting room.</li>
              </ul>
              <p className="text-xs text-indigo-600 font-bold bg-indigo-50 p-2 rounded">Tip: Ensure you have a stable internet connection and are in a quiet room before joining.</p>
            </div>
          )
        };
      case 'settings':
        return {
          title: "Account Settings & Family",
          content: (
            <div className="space-y-3">
              <p><strong>Why fill this out?</strong><br/>Completing your profile here saves crucial minutes during a medical emergency. Our Smart Booking system uses this data.</p>
              <p><strong>Profile Photo:</strong><br/>Uploading a high-quality picture builds trust with the doctor during telemedicine calls, ensuring they know exactly who they are treating.</p>
              <p><strong>Family Members:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Click "Add Family Member" at the bottom of the page.</li>
                <li>Enter their name, age, and biological sex.</li>
                <li>During an urgent call, you can instantly select them from the dropdown menu, completely skipping the manual data entry process!</li>
              </ul>
            </div>
          )
        };
      case 'network':
        return {
          title: "My Care Network",
          content: (
            <div className="space-y-3">
              <p><strong>Your Digital Healthcare Circle</strong><br/>This is your personal directory of trusted medical professionals. Any doctor you consult with, or any clinic you bookmark, will be saved here.</p>
              <p><strong>How to use it:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Click on a doctor's card to instantly view their profile.</li>
                <li>Quickly request a follow-up consultation with a single click.</li>
                <li>Share their profile with friends via WhatsApp directly from their card.</li>
              </ul>
            </div>
          )
        };
      case 'home':
        return {
          title: "User Dashboard (Home)",
          content: (
            <div className="space-y-3">
              <p><strong>Welcome to DehaPa!</strong><br/>This is your central hub for managing your healthcare securely and instantly.</p>
              <p><strong>Quick Actions:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Consult a Doctor Now:</strong> Tap the large red button during emergencies. You'll be connected to a verified doctor in under 2 minutes.</li>
                <li><strong>Show My QR Code:</strong> Tap this when visiting a physical hospital. The receptionist will scan it to instantly pull up your file, bypassing the waiting room queue!</li>
              </ul>
            </div>
          )
        };
      default:
        return {
          title: `Guide: ${tabId.replace(/_/g, ' ')}`,
          content: "Fill out the fields in this section accurately. If you get stuck or need help, feel free to open a support ticket or start a live chat!"
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0 relative overflow-hidden">
          {/* Subtle brand watermark background */}
          <div className="absolute top-[-50%] right-[-10%] opacity-10 text-9xl font-black italic select-none pointer-events-none">D</div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-teal-400 font-black tracking-tight text-3xl">DehaPa</span> 
              <span className="font-serif text-white/90">Help & Guide</span>
            </h2>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          {/* Navigation */}
          <div className="flex bg-slate-800/50 p-1.5 rounded-2xl relative z-10 border border-slate-700/50">
            <button 
              onClick={() => setView('guide')} 
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${view === 'guide' ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              Guide
            </button>
            <button 
              onClick={() => setView('chat')} 
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${view === 'chat' ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              Live Chat
            </button>
            <button 
              onClick={() => setView('ticket')} 
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${view === 'ticket' ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
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
