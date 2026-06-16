"use client";

import React, { useEffect, useState } from 'react';
import { FacebookShareButton, WhatsappShareButton, FacebookIcon, WhatsappIcon } from 'react-share';

interface ShareButtonsProps {
  title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Get the current URL dynamically on the client side
    setUrl(window.location.href);
  }, []);

  if (!url) return null; // Don't render until we have the URL

  return (
    <div className="flex flex-col gap-2 mt-4">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Share Profile</span>
      <div className="flex gap-3">
        <WhatsappShareButton 
          url={url} 
          title={`Check out ${title} on DehaPa Sovereign Health Network!`} 
          separator=" - "
          className="hover:scale-110 transition-transform hover:drop-shadow-md"
        >
          <WhatsappIcon size={36} round />
        </WhatsappShareButton>

        <FacebookShareButton 
          url={url} 
          className="hover:scale-110 transition-transform hover:drop-shadow-md"
        >
          <FacebookIcon size={36} round />
        </FacebookShareButton>
      </div>
    </div>
  );
}
