"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Activity, ShieldCheck } from "lucide-react";

function QueueInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queueId = searchParams?.get("id");

  const [queueData, setQueueData] = useState<any>(null);

  useEffect(() => {
    if (!queueId) {
      router.push("/urgent-care");
      return;
    }

    const unsub = onSnapshot(doc(db, "urgentQueue", queueId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setQueueData(data);
        
        // If doctor accepted, route to consultation room
        if (data.status === "matched" && data.roomId) {
          router.push(`/consultation/${data.roomId}?role=patient`);
        }
      }
    });

    return () => unsub();
  }, [queueId, router]);

  return (
    <div className="min-h-screen bg-[#050B14] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Radar Animation Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-50">
        <div className="w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] rounded-full border border-rose-500/10 absolute animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="w-[60vw] h-[60vw] md:w-[30vw] md:h-[30vw] rounded-full border border-rose-500/20 absolute animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
        <div className="w-[40vw] h-[40vw] md:w-[20vw] md:h-[20vw] rounded-full border border-rose-500/30 absolute animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[100vw] h-[2px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent -translate-x-1/2 -translate-y-1/2 animate-spin-slow"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-rose-600 border-4 border-rose-900 flex items-center justify-center shadow-[0_0_50px_rgba(225,29,72,0.6)] mb-8 relative">
           <Activity className="w-10 h-10 text-white animate-pulse" />
           <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-black flex items-center gap-1 shadow-lg">
             <ShieldCheck className="w-3 h-3" /> Priority
           </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Connecting to Doctor...</h1>
        <p className="text-rose-200 text-lg mb-8 max-w-md">
          Please do not close this window. We are paging the next available {queueData?.requiredSpecialty || queueData?.requiredTier}.
        </p>

        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 w-full max-w-md backdrop-blur-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-400 text-sm">Patient Name</span>
            <span className="text-white font-bold">{queueData?.patientName || "Loading..."}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-400 text-sm">Requested Tier</span>
            <span className="text-rose-400 font-bold">{queueData?.requiredTier}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Status</span>
            <span className="text-amber-400 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Waiting for acceptance
            </span>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 mt-8 max-w-sm">
          If no doctor accepts within 5 minutes, your ₹{queueData?.feePaid || "amount"} fee will be automatically refunded to your original payment method.
        </p>
      </div>
    </div>
  );
}

export default function UrgentQueuePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050B14] flex items-center justify-center text-white">Loading Queue...</div>}>
      <QueueInner />
    </Suspense>
  );
}
