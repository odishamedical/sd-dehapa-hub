"use client";
import React from 'react';
import dynamic from 'next/dynamic';

// Agora SDK relies on window and document, so it must be completely excluded from SSR
const VideoRoomDynamic = dynamic(() => import('@/components/VideoRoom'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
        </div>
      </div>
      <h2 className="text-xl font-bold text-slate-700 mt-6 animate-pulse">Initializing Secure Video Feed...</h2>
      <p className="text-slate-500 text-sm mt-2">Connecting to encrypted peer-to-peer network</p>
    </div>
  ),
});

export default function ConsultationPage({ params }: { params: { id: string } }) {
  // Extract the appointment ID from the URL to use as the secure Agora Channel Name
  const roomId = params.id;

  return (
    <div className="bg-black min-h-screen w-full overflow-hidden">
      <VideoRoomDynamic roomId={roomId} />
    </div>
  );
}
