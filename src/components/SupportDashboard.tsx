"use client";

import React, { useState } from 'react';
import { Card, Input, Label, Select, Textarea, Button } from '@/components/ui';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function SupportDashboard({ 
  userRole, 
  userName,
  providerId,
  faqData 
}: { 
  userRole?: string; 
  userName?: string;
  providerId?: string;
  faqData?: { question: string; answer: string; category?: string }[];
}) {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !subject) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, "admin_support_tickets"), {
        name: userName || "Unknown Provider",
        phone: "N/A", // From profile if available
        email: "N/A", // Add later or fetch from context
        providerId: providerId || null,
        role: userRole || "provider",
        subject: subject,
        message: message,
        status: "pending",
        source: "onboarding_dashboard",
        timestamp: serverTimestamp()
      });
      setIsSent(true);
      setMessage('');
      setSubject('');
      
      // Reset success state after 5 seconds
      setTimeout(() => setIsSent(false), 5000);
    } catch (err) {
      console.error("Failed to submit support ticket", err);
      alert("Failed to submit ticket. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-[32px] p-8 md:p-12 relative overflow-hidden border border-teal-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 border border-teal-500/30 rounded-full text-teal-300 font-bold text-xs uppercase tracking-widest mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            24/7 Priority Support
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">How can we help you?</h2>
          <p className="text-teal-100/80 text-lg max-w-xl">
            Whether you need help with your profile, have a billing question, or just want to say hi—our team is here for you.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Direct Messaging Form */}
        <Card className="lg:col-span-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            Send a Direct Message
          </h3>
          
          {isSent ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-12 text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 dark:text-emerald-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h4 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Message Sent Successfully!</h4>
              <p className="text-emerald-700 dark:text-emerald-300/80">Our support team has received your query and will get back to you shortly via email.</p>
              <Button 
                onClick={() => setIsSent(false)}
                className="mt-6 mx-auto"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-5">
              <div>
                <Label required>Subject</Label>
                <Select 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a topic...</option>
                  <option value="profile_help">Help with Profile Setup</option>
                  <option value="billing">Billing & Payouts</option>
                  <option value="technical">Technical Issue / Bug</option>
                  <option value="appeal">Appeal Profile Lock</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              
              <div>
                <Label required>Message</Label>
                <Textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  required
                />
              </div>
              
              <Button 
                type="submit"
                disabled={isSending || !message || !subject}
                isLoading={isSending}
                className="w-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg> Send Message
              </Button>
            </form>
          )}
        </Card>

        {/* Quick Contact & FAQs */}
        <div className="space-y-6">
          <Card variant="solid" className="group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-14 h-14 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">WhatsApp Support</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 relative z-10">Get instant responses from our automated bot or connect to a live human agent.</p>
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="block w-full text-center py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-colors relative z-10 shadow-lg shadow-green-900/50">
              Chat on WhatsApp
            </a>
          </Card>
          
          <Card variant="solid" className="group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">Email Administration</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 relative z-10">For legal inquiries, partnership requests, or complex account issues.</p>
            <a href="mailto:support@dehapa.com" className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors relative z-10 shadow-lg shadow-blue-900/50">
              support@dehapa.com
            </a>
          </Card>
        </div>

      </div>

      {/* Dynamic FAQ Section */}
      {faqData && faqData.length > 0 && (
        <Card>
          <div className="text-center mb-10">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h3>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Everything you need to know about navigating your dashboard.</p>
          </div>
          
          <div className="space-y-4 max-w-4xl mx-auto">
            {faqData.map((faq, idx) => (
              <details key={idx} className="group bg-white dark:bg-white/5 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 hover:border-teal-400 dark:hover:border-teal-400/50 open:border-teal-500 transition-all shadow-sm">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-slate-900 dark:text-slate-200 text-[15px]">
                  {faq.question}
                  <span className="transition-transform duration-300 group-open:rotate-180 bg-slate-100 dark:bg-white/10 group-open:bg-teal-50 dark:group-open:bg-teal-500/20 p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-white/10 group-open:border-teal-200 dark:group-open:border-teal-500/30 group-open:text-teal-600 dark:group-open:text-teal-400">
                    <svg className="w-5 h-5 text-slate-500 dark:text-slate-400 group-open:text-teal-600 dark:group-open:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed text-sm animate-in fade-in duration-300">
                  <div className="h-px bg-slate-100 dark:bg-white/10 w-full mb-4"></div>
                  {faq.category && (
                    <p className="font-black text-teal-600 dark:text-teal-400 mb-2 uppercase text-[10px] tracking-widest bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 inline-block px-2 py-1 rounded-lg">
                      {faq.category}
                    </p>
                  )}
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
