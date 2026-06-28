"use client";
import React from 'react';
import VideoRoom from '@/components/VideoRoom';

export default function ConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const roomId = resolvedParams.id;

  return (
    <div className="bg-black min-h-screen w-full overflow-hidden">
      <VideoRoom roomId={roomId} />
    </div>
  );
}
