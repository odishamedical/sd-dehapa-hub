import React, { useRef, useState } from 'react';

interface ImageUploadProps {
  label?: string;
  helperText?: string;
  defaultImage?: string;
  onChange?: (imageUrl: string) => void;
  className?: string;
}

export default function ImageUpload({ 
  label = "Profile Photo", 
  helperText = "Square image. Recommended size 400x400px.",
  defaultImage,
  onChange,
  className = ""
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(defaultImage || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        if (onChange) onChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold text-slate-900 mb-1.5">{label}</label>}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          )}
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
          >
            Upload Photo
          </button>
          {helperText && <p className="text-xs text-slate-500 mt-2">{helperText}</p>}
        </div>
      </div>
    </div>
  );
}
