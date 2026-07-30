"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';

interface ProfileMasonryGalleryProps {
  images: string[];
}

export default function ProfileMasonryGallery({ images }: ProfileMasonryGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  // Filter out any broken or empty image strings
  const validImages = images.filter(img => img && typeof img === 'string' && img.startsWith('http'));
  if (validImages.length === 0) return null;

  // Ensure maximum 5 images for the grid
  const displayImages = validImages.slice(0, 5);
  const count = displayImages.length;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % validImages.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + validImages.length) % validImages.length);
    }
  };

  return (
    <>
      <div className="w-full rounded-2xl overflow-hidden bg-slate-900/50 border border-slate-800/50 mt-8 mb-12">
        {count === 1 && (
          <div className="relative w-full aspect-video md:aspect-[21/9] cursor-pointer group" onClick={() => setSelectedIndex(0)}>
            <Image src={displayImages[0]} alt="Gallery 1" fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300"></div>
            <Expand className="absolute top-4 right-4 w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {count === 2 && (
          <div className="grid grid-cols-2 gap-1 w-full h-[300px] md:h-[450px]">
            {displayImages.map((img, idx) => (
              <div key={idx} className="relative w-full h-full cursor-pointer group" onClick={() => setSelectedIndex(idx)}>
                <Image src={img} alt={`Gallery ${idx + 1}`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300"></div>
              </div>
            ))}
          </div>
        )}

        {count === 3 && (
          <div className="grid grid-cols-2 gap-1 w-full h-[300px] md:h-[450px]">
            <div className="relative w-full h-full cursor-pointer group" onClick={() => setSelectedIndex(0)}>
              <Image src={displayImages[0]} alt="Gallery 1" fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300"></div>
            </div>
            <div className="grid grid-rows-2 gap-1 h-full">
              {displayImages.slice(1, 3).map((img, idx) => (
                <div key={idx + 1} className="relative w-full h-full cursor-pointer group overflow-hidden" onClick={() => setSelectedIndex(idx + 1)}>
                  <Image src={img} alt={`Gallery ${idx + 2}`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {count === 4 && (
          <div className="grid grid-cols-12 gap-1 w-full h-[400px] md:h-[500px]">
            <div className="col-span-8 relative h-full cursor-pointer group overflow-hidden" onClick={() => setSelectedIndex(0)}>
              <Image src={displayImages[0]} alt="Gallery 1" fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300"></div>
            </div>
            <div className="col-span-4 grid grid-rows-3 gap-1 h-full">
              {displayImages.slice(1, 4).map((img, idx) => (
                <div key={idx + 1} className="relative w-full h-full cursor-pointer group overflow-hidden" onClick={() => setSelectedIndex(idx + 1)}>
                  <Image src={img} alt={`Gallery ${idx + 2}`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {count >= 5 && (
          <div className="grid grid-cols-12 gap-1 w-full h-[450px] md:h-[600px]">
            <div className="col-span-6 md:col-span-8 relative h-full cursor-pointer group overflow-hidden" onClick={() => setSelectedIndex(0)}>
              <Image src={displayImages[0]} alt="Gallery 1" fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300"></div>
            </div>
            <div className="col-span-6 md:col-span-4 grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-1 h-full">
              {displayImages.slice(1, 5).map((img, idx) => (
                <div key={idx + 1} className={`relative w-full h-full cursor-pointer group overflow-hidden ${idx === 3 && validImages.length > 5 ? 'opacity-80' : ''}`} onClick={() => setSelectedIndex(idx + 1)}>
                  <Image src={img} alt={`Gallery ${idx + 2}`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300"></div>
                  {idx === 3 && validImages.length > 5 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold text-xl md:text-2xl">
                      +{validImages.length - 5}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col" onClick={() => setSelectedIndex(null)}>
          <div className="flex items-center justify-between p-4 z-[101]">
            <div className="text-white font-medium">
              {selectedIndex + 1} / {validImages.length}
            </div>
            <button 
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center px-4 md:px-16" onClick={(e) => e.stopPropagation()}>
            <Image 
              src={validImages[selectedIndex]} 
              alt="Fullscreen view" 
              fill 
              className="object-contain" 
              unoptimized 
            />
            
            {validImages.length > 1 && (
              <>
                <button 
                  className="absolute left-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-[101]"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  className="absolute right-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-[101]"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
