"use client";
import React from 'react';

export default function ConsultationPage({ params }: { params: { id: string } }) {
  const roomId = params.id;

  return (
    <div className="bg-black min-h-screen w-full flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-slate-400 mb-8">Appointment Created: {roomId}</p>
      
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-2">Diagnostic Mode</h2>
        <p className="text-slate-400 text-sm">We temporarily disabled the Video Engine to see if it was crashing your phone. If you can see this screen, the bug is in the Agora Video library!</p>
      </div>
    </div>
  );
}
