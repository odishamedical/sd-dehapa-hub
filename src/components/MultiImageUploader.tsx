"use client";

import React, { useState, useRef } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface MultiImageUploaderProps {
  initialImages?: string[];
  onUpload?: (urls: string[]) => void;
  providerId?: string;
}

export default function MultiImageUploader({ initialImages = [], onUpload, providerId }: MultiImageUploaderProps) {
  const [images, setImages] = useState<{ id: string, url: string, file?: File, isUploading?: boolean }[]>(
    initialImages.map((url, i) => ({ id: `init-${i}`, url }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newImages = Array.from(files).map(file => ({
      id: Math.random().toString(),
      url: URL.createObjectURL(file), // Local preview URL
      file,
      isUploading: false
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleUpload = async () => {
    if (!providerId) {
      console.warn("No providerId passed to MultiImageUploader");
      return;
    }

    // Set uploading state for files that aren't uploaded yet
    setImages(prev => prev.map(img => img.file ? { ...img, isUploading: true } : img));
    
    const newUrls: string[] = [];
    
    try {
      const uploadPromises = images.map(async (img) => {
        if (!img.file) {
          // Already uploaded/initial image
          newUrls.push(img.url);
          return img;
        }

        const fileName = `${Date.now()}_${img.file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const storageRef = ref(storage, `doctor-galleries/${providerId}/${fileName}`);
        
        await uploadBytes(storageRef, img.file);
        const downloadUrl = await getDownloadURL(storageRef);
        
        newUrls.push(downloadUrl);
        return { ...img, url: downloadUrl, isUploading: false, file: undefined };
      });

      const updatedImages = await Promise.all(uploadPromises);
      setImages(updatedImages);
      
      if (onUpload) {
        onUpload(newUrls);
      }
    } catch (error) {
      console.error("Error uploading images to Firebase:", error);
      // Revert uploading state on error
      setImages(prev => prev.map(img => img.file ? { ...img, isUploading: false } : img));
      alert("Failed to upload images. Please try again.");
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-[24px] p-8 border border-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.05)] w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Clinic Gallery</h3>
          <p className="text-sm text-slate-500 mt-1">Upload high-quality photos of your clinic, waiting area, and equipment.</p>
        </div>
        
        {images.some(img => img.file) && (
          <button 
            onClick={handleUpload}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md transition-colors flex items-center gap-2"
          >
            {images.some(img => img.isUploading) ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Uploading...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg> Upload New Photos</>
            )}
          </button>
        )}
      </div>

      <div 
        className={`border-2 border-dashed rounded-[20px] p-8 text-center transition-all ${isDragging ? 'border-cyan-500 bg-cyan-50/50' : 'border-slate-300 hover:border-cyan-400 bg-white/40'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files); }}
      >
        <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 text-cyan-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <h4 className="font-bold text-slate-800 text-lg mb-2">Drag & Drop photos here</h4>
        <p className="text-sm text-slate-500 mb-6">Supports JPG, PNG, WEBP (Max 5MB per image)</p>
        
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all"
        >
          Browse Files
        </button>
      </div>

      {images.length > 0 && (
        <div className="mt-8">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Gallery Preview ({images.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map(img => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                <img src={img.url} alt="Gallery item" className="w-full h-full object-cover" />
                
                {/* Uploading Overlay */}
                {img.isUploading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                     <svg className="animate-spin w-8 h-8 text-cyan-600" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  </div>
                )}

                {/* Delete Button */}
                {!img.isUploading && (
                  <button 
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
