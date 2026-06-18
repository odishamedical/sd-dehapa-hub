"use client";

import React, { useState, useRef } from 'react';

interface HorizontalScrollGalleryProps {
  images: string[];
}

export default function HorizontalScrollGallery({ images }: HorizontalScrollGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const goNextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };

  const goPrevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-700/50 overflow-hidden relative group/section">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-serif flex items-center gap-3">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Gallery
          </h2>
          
          {/* Scroll Navigation Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button 
              onClick={scrollLeft}
              className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 hover:border-cyan-500/50 transition-all shadow-md"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button 
              onClick={scrollRight}
              className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 hover:border-cyan-500/50 transition-all shadow-md"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
        
        {/* Horizontal Scroll Container */}
        <div className="relative -mx-6 px-6 md:-mx-8 md:px-8">
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {images.map((src, i) => (
              <div 
                key={i} 
                onClick={() => openLightbox(i)}
                className="snap-center shrink-0 w-64 md:w-[320px] aspect-video rounded-2xl overflow-hidden cursor-pointer border border-slate-700/50 shadow-sm hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:border-cyan-500/50 hover:scale-[1.02] transition-all duration-300 relative group"
              >
                <img src={src} alt={"Gallery image " + (i + 1)} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-cyan-900/0 group-hover:bg-cyan-900/30 transition-colors flex items-center justify-center">
                  <div className="bg-slate-900/90 backdrop-blur text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all shadow-xl border border-slate-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Gradient Fades for Scroll Indication */}
          <div className="absolute top-0 left-0 bottom-4 w-8 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none opacity-50"></div>
          <div className="absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none opacity-50"></div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-200" onClick={closeLightbox}>
          <button 
            className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 p-3 rounded-full transition-all border border-slate-700"
            onClick={closeLightbox}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-16 flex items-center justify-center h-full" onClick={e => e.stopPropagation()}>
            {/* Prev Button */}
            {images.length > 1 && (
              <button 
                onClick={goPrevLightbox}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 p-4 rounded-full transition-all backdrop-blur-md border border-slate-700 z-10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
            )}

            <img 
              src={images[lightboxIndex]} 
              alt="Fullscreen Gallery" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300"
            />

            {/* Next Button */}
            {images.length > 1 && (
              <button 
                onClick={goNextLightbox}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 p-4 rounded-full transition-all backdrop-blur-md border border-slate-700 z-10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-300 font-bold text-sm bg-slate-800/80 px-6 py-2 rounded-full backdrop-blur-md border border-slate-700">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
