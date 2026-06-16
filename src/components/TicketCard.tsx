// src/components/TicketCard.tsx
import React, { useRef } from 'react';
import Link from 'next/link';
import { TicketConfigEntry } from '@/lib/ticketConfig';
import InlineEditField from '@/components/InlineEditField';
import ShareButtons from '@/components/ShareButtons';

type Props = {
  entity: any;
  config: TicketConfigEntry;
  isEditMode?: boolean;
  onSave?: (field: string, value: any) => void;
};

export default function TicketCard({ entity, config, isEditMode = false, onSave }: Props) {
  const subtitle = entity[config.subtitleField] || '';
  const leftMetric = config.leftMetric(entity);
  const rightMetric = config.rightMetric(entity);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSave?.('image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.05)] rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-300 flex flex-col md:flex-row items-center gap-6 md:gap-8 relative overflow-hidden">
      {/* Metallic Shine Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 hover:translate-x-full duration-1000 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>
      {/* Profile Image */}
      <div className="w-full max-w-[260px] aspect-square sm:w-64 sm:h-64 md:w-48 md:h-48 rounded-[2rem] bg-white p-2 shadow-xl border border-slate-200 shrink-0 relative z-10 group">
        <img src={entity.image} alt={entity.name} className="w-full h-full object-cover rounded-[1.5rem]" />
        {isEditMode && (
          <div className="absolute inset-0 bg-black/60 rounded-3xl flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/40 text-white text-xs font-bold rounded-lg transition-colors border border-white/50 backdrop-blur-sm"
            >
              Upload Photo
            </button>
          </div>
        )}
      </div>
      {/* Textual Info */}
      <div className="flex-1 text-center md:text-left relative z-10 w-full">
        {isEditMode && <div className="absolute -top-4 right-0 bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest hidden md:block">Header Editable</div>}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 flex-1 min-w-[250px]">
              <InlineEditField 
                value={entity.name} 
                onSave={(val) => onSave?.('name', val)} 
                isEditMode={isEditMode} 
              />
            </h1>
            {entity.verified && (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 px-3 py-1.5 rounded-full shadow-sm">
                <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">{config.trustMarker || "Dehapa Verified"}</span>
              </div>
            )}
          </div>
          
          {/* Unverified Workflow Button */}
          {!entity.verified && (
            <Link href={`/portal/claim?id=${entity.id}`} className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 px-4 py-2 rounded-xl transition-all shadow-sm font-bold animate-pulse group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              Verify your page
            </Link>
          )}
        </div>
        
        {/* Subtitle / Specialty editable */}
        {config.subtitleField && (
          <p className="text-sm font-semibold text-teal-600 mb-2 w-full max-w-xl">
            <InlineEditField 
              value={subtitle} 
              onSave={(val) => onSave?.(config.subtitleField, val)} 
              isEditMode={isEditMode} 
            />
          </p>
        )}
        
        {/* Owner Details (Front-End Display) */}
        {entity.ownerName && (
          <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5 justify-center md:justify-start">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Managed by: <span className="text-slate-800">{entity.ownerName}</span>
          </p>
        )}

        {/* Metrics */}
        <div className="flex items-center space-x-6 mb-4">
          {leftMetric && (
            <div className="flex items-center text-amber-400">
              {/* simple star icon */}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-sm font-bold text-slate-700">{leftMetric}</span>
            </div>
          )}
          {rightMetric && (
            <div className="flex items-center text-emerald-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 17a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L11 14.586l7.293-7.293a1 1 0 111.414 1.414l-8 8A1 1 0 0111 17z" />
              </svg>
              <span className="ml-1 text-sm font-bold text-slate-700">{rightMetric}</span>
            </div>
          )}
        </div>
        
        {/* Share Buttons */}
        <div className="mb-4">
          <ShareButtons title={entity.name || "Dehapa Hub"} />
        </div>

        {/* CTA Button */}
        <button className="w-full px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-[0_8px_30px_rgba(13,148,136,0.3)] transition-all text-sm uppercase tracking-widest mt-2">{config.cta.label}</button>
      </div>
    </div>
  );
}
