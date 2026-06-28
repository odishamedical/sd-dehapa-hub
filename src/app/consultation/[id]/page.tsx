"use client";
import React from 'react';
import dynamic from 'next/dynamic';

const VideoRoom = dynamic(() => import('@/components/VideoRoom'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  )
});

export default function ConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const roomId = resolvedParams.id;

  return (
    <div className="bg-black min-h-screen w-full overflow-hidden">
      <VideoRoom roomId={roomId} />
    </div>
  );
}
