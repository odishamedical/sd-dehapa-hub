"use client";

import React from 'react';
import Link from 'next/link';
import GlobalHeader from '@/components/GlobalHeader';
import GlobalFooter from '@/components/GlobalFooter';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060B14] flex flex-col font-sans">
      <GlobalHeader />
      
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-2xl w-full text-center relative z-10">
          <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-slate-800 mb-6 font-serif">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Page Not Found</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps you followed a broken link.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/" 
              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Return Home
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-3 border border-slate-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Go Back
            </button>
          </div>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
}
