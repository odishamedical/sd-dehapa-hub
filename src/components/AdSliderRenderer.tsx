'use client';

import React, { useState, useEffect } from 'react';

interface AdSliderRendererProps {
  images: string[];
  linkUrl?: string;
  interval?: number; // milliseconds
  animationStyle?: string;
}

export default function AdSliderRenderer({ images, linkUrl, interval = 3000, animationStyle = 'fade' }: AdSliderRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  const getAnimationClasses = (idx: number) => {
    const isActive = idx === currentIndex;
    
    // Base transition
    let base = "absolute w-full h-auto max-h-full object-contain transition-all duration-1000 ease-in-out";
    
    if (animationStyle === 'fade') {
      return `${base} ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`;
    }
    
    if (animationStyle === 'slide-left') {
      return `${base} ${isActive ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-full z-0'}`;
    }
    
    if (animationStyle === 'slide-right') {
      return `${base} ${isActive ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-full z-0'}`;
    }
    
    if (animationStyle === 'slide-up') {
      return `${base} ${isActive ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-full z-0'}`;
    }
    
    if (animationStyle === 'slide-down') {
      return `${base} ${isActive ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 -translate-y-full z-0'}`;
    }
    
    if (animationStyle === 'zoom') {
      return `${base} ${isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-50 z-0'}`;
    }

    // Default fallback
    return `${base} ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`;
  };

  const content = (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Advertisement ${idx + 1}`}
          className={getAnimationClasses(idx)}
        />
      ))}
      
      {/* Optional: Indicator dots if there are multiple images */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-teal-400 w-3' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (linkUrl) {
    return (
      <a href={linkUrl} target="_blank" rel="noreferrer" className="block w-full h-full relative group">
        {content}
      </a>
    );
  }

  return <div className="w-full h-full relative">{content}</div>;
}
