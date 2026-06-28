"use client";
import React from 'react';
import VideoRoom from '@/components/VideoRoom';

export default function ConsultationPage({ params }: { params: { id: string } }) {
  const roomId = params.id;

  return (
    <div className="bg-black min-h-screen w-full overflow-hidden">
      <VideoRoom roomId={roomId} />
    </div>
  );
}
