"use client";

import React, { useState } from 'react';

interface HorizontalScrollGalleryProps {
  images: string[];
}

export default function HorizontalScrollGallery({ images }: HorizontalScrollGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <>
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mt-8 overflow-hidden">
        <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          Gallery
        </h3>
        
        {/* Horizontal Scroll Container */}
        <div className="relative -mx-8 px-8">
          <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {images.map((src, i) => (
              <div 
                key={i} 
                onClick={() => openLightbox(i)}
                className="snap-center shrink-0 w-64 md:w-80 aspect-video rounded-2xl overflow-hidden cursor-pointer border border-slate-200 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative group"
              >
                <img src={src} alt={"Gallery image " + (i + 1)} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur text-slate-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all shadow-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Gradient Fades for Scroll Indication */}
          <div className="absolute top-0 left-0 bottom-6 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 bottom-6 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-200" onClick={closeLightbox}>
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-slate-800/50 hover:bg-slate-700 p-2 rounded-full transition-all"
            onClick={closeLightbox}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-12 flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {/* Prev Button */}
            {images.length > 1 && (
              <button 
                onClick={goPrev}
                className="absolute left-4 sm:left-0 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-slate-800/50 hover:bg-slate-700 p-3 rounded-full transition-all backdrop-blur-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
            )}

            <img 
              src={images[lightboxIndex]} 
              alt="Fullscreen Gallery" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            />

            {/* Next Button */}
            {images.length > 1 && (
              <button 
                onClick={goNext}
                className="absolute right-4 sm:right-0 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-slate-800/50 hover:bg-slate-700 p-3 rounded-full transition-all backdrop-blur-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            )}

            {/* Image Counter */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/70 font-medium text-sm bg-slate-800/50 px-4 py-1.5 rounded-full backdrop-blur-md">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
