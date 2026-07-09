"use client";

import React, { useState } from 'react';

export function DeliveryDispatcherPlugin({ order, onDispatch }: { order: any, onDispatch: () => void }) {
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = () => {
    setIsAssigning(true);
    // Simulate finding a delivery partner
    setTimeout(() => {
      setIsAssigning(false);
      onDispatch();
      alert(`Order assigned to Dehapa Delivery Partner (Rider: Ramesh)`);
    }, 1500);
  };

  return (
    <button 
      onClick={handleAssign}
      disabled={isAssigning}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50"
    >
      {isAssigning ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Assigning Rider...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          Auto-Assign & Dispatch
        </>
      )}
    </button>
  );
}
