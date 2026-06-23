"use client";

import React from 'react';

export default function LiveHealthFeed({ userName }: { userName: string | null }) {
  // Mock data for the "Live Health Feed" to simulate a bustling hospital atmosphere
  const feedItems = [
    {
      id: 1,
      type: 'update',
      title: 'Dr. Sarah Smith updated her availability.',
      desc: 'She is now accepting weekend appointments for telemedicine.',
      time: '1 hour ago',
      icon: <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
      bg: 'bg-indigo-50'
    },
    {
      id: 2,
      type: 'alert',
      title: 'Flu vaccines are now available.',
      desc: 'City Hospital has restocked flu vaccines. Book a walk-in slot now.',
      time: '3 hours ago',
      icon: <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>,
      bg: 'bg-rose-50'
    },
    {
      id: 3,
      type: 'network',
      title: 'New endorsement in your network.',
      desc: 'Dr. Patel recently endorsed Apollo Diagnostics for high accuracy.',
      time: '5 hours ago',
      icon: <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
      bg: 'bg-amber-50'
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Time for your annual checkup?',
      desc: 'It has been 11 months since your last recorded visit. Stay proactive with your health.',
      time: '1 day ago',
      icon: <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
      bg: 'bg-emerald-50'
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[24px] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
          </span>
          Live Health Feed
        </h3>
      </div>
      
      <div className="space-y-4">
        {feedItems.map((item) => (
          <div key={item.id} className="flex gap-4 items-start group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.bg} group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <div className="flex-1 pb-4 border-b border-slate-100 group-last:border-0 group-last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                <span className="text-[10px] font-bold text-slate-400 shrink-0 whitespace-nowrap">{item.time}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
