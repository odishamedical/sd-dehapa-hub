"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface ImageCropperProps {
  imageFile?: File | null;
  imageUrl?: string | null;
  onCancel: () => void;
  onCropComplete: (croppedBlob: Blob, isPrimary: boolean) => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous'; // Important for CORS
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export default function ImageCropper({ imageFile, imageUrl, onCancel, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const imageSrc = React.useMemo(() => {
    if (imageUrl) return imageUrl;
    if (imageFile) return URL.createObjectURL(imageFile);
    return "";
  }, [imageFile, imageUrl]);

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async (isPrimary: boolean) => {
    if (!croppedAreaPixels) return;
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        if (blob) onCropComplete(blob, isPrimary);
      }, 'image/jpeg', 0.9);
    } catch (e) {
      console.error(e);
      alert('Failed to crop image');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[200] flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-slate-900 to-teal-900 text-white flex justify-between items-center shadow-md z-10">
          <h3 className="font-bold text-xl font-serif">Crop & Adjust Image</h3>
          <button onClick={onCancel} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="relative h-96 w-full bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
        <div className="p-6 bg-slate-50 border-t flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
            <input 
              type="range" 
              value={zoom} 
              min={1} 
              max={3} 
              step={0.1} 
              onChange={(e) => setZoom(Number(e.target.value))} 
              className="flex-1 accent-teal-600 cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-3 mt-2 flex-wrap">
            <button onClick={onCancel} className="px-6 py-2.5 border-2 border-slate-200 hover:bg-slate-100 font-bold rounded-xl text-slate-600 transition-colors">Cancel</button>
            <button onClick={() => handleSave(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors shadow-md transform hover:-translate-y-0.5">Add to Gallery</button>
            <button onClick={() => handleSave(true)} className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-md transform hover:-translate-y-0.5">Set as Primary Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
}
