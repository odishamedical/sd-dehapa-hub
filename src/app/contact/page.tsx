"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, PhoneCall, Mail, Send, Building2 } from "lucide-react";
import V2Header from "@/components/v2/V2Header";
import GlobalFooter from "@/components/GlobalFooter";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-cyan-500/30">
      <V2Header />
      
      <main className="flex-1 pt-24 md:pt-32 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
        
        {/* Navigation & Title */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center justify-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors mb-4 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-[#0a2540] tracking-tight">Contact Us</h1>
          <p className="text-lg text-slate-600 font-medium mt-3 max-w-2xl mx-auto">
            Have questions about our healthcare network? Our team at Shyam Dash Creation is here to assist you 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Info & Address */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="bg-[#0a2540] text-white rounded-[2.5rem] p-8 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.2)] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#113a63] to-transparent pointer-events-none"></div>
               
               <h3 className="text-2xl font-black text-cyan-400 mb-8 relative z-10 flex items-center gap-3">
                 <Building2 className="w-7 h-7" /> Shyam Dash Creation
               </h3>
               
               <div className="space-y-8 relative z-10">
                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                     <MapPin className="w-5 h-5 text-cyan-300" />
                   </div>
                   <div>
                     <strong className="block text-white font-bold text-lg mb-1">Corporate Office</strong>
                     <span className="text-slate-300 leading-relaxed block">
                       R7/A2, Jagannath Mandir Colony,<br/>
                       Budharaja, Sambalpur,<br/>
                       Odisha, India - 768004
                     </span>
                   </div>
                 </div>

                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                     <PhoneCall className="w-5 h-5 text-cyan-300" />
                   </div>
                   <div className="flex flex-col gap-1">
                     <strong className="block text-white font-bold text-lg mb-1">Direct Lines</strong>
                     <a href="tel:+917847904847" className="text-slate-300 hover:text-white transition-colors">+91 78479 04847</a>
                     <a href="tel:+917684811120" className="text-slate-300 hover:text-white transition-colors">+91 76848 11120</a>
                     <a href="tel:+916371390831" className="text-slate-300 hover:text-white transition-colors">+91 63713 90831</a>
                   </div>
                 </div>

                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                     <Mail className="w-5 h-5 text-cyan-300" />
                   </div>
                   <div>
                     <strong className="block text-white font-bold text-lg mb-1">Email Support</strong>
                     <a href="mailto:support@dehapa.com" className="text-slate-300 hover:text-white transition-colors">support@dehapa.com</a>
                   </div>
                 </div>
               </div>
            </div>

            {/* Google Map Mock/Placeholder */}
            <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-100 h-64 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-slate-100">
                 {/* Replace with actual embedded iframe in production */}
                 <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-30"></div>
              </div>
              <div className="relative z-10 flex flex-col items-center bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-sm border border-white">
                <MapPin className="w-8 h-8 text-rose-500 mb-2" />
                <span className="font-bold text-[#0a2540]">Sambalpur, Odisha</span>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
              
              <h3 className="text-2xl font-black text-[#0a2540] mb-2">Send us a Message</h3>
              <p className="text-slate-500 font-medium mb-8">Whether you're a patient needing help with a booking, or a provider looking to join our network, drop us a line below.</p>
              
              {isSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center flex flex-col items-center animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <Send className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-emerald-800 mb-2">Message Sent!</h4>
                  <p className="text-emerald-600">Thank you for reaching out. A member of our support team will get back to you shortly.</p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="mt-6 text-sm font-bold text-emerald-700 hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input type="text" required className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-slate-800 outline-none transition-all" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                      <input type="tel" required className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-slate-800 outline-none transition-all" placeholder="+91" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input type="email" required className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-slate-800 outline-none transition-all" placeholder="name@example.com" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">I am a...</label>
                    <select className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-slate-800 outline-none transition-all appearance-none">
                      <option>Patient seeking help</option>
                      <option>Doctor / Healthcare Professional</option>
                      <option>Hospital Administrator</option>
                      <option>Pharmacy Owner</option>
                      <option>Other / General Inquiry</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Message</label>
                    <textarea required rows={5} className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-slate-800 outline-none transition-all resize-none" placeholder="How can we help you today?"></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>Send Message <Send className="w-5 h-5" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>

      <GlobalFooter />
    </div>
  );
}
