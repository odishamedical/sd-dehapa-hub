// src/components/TicketCard.tsx
import React from 'react';
import { TicketConfigEntry } from '@/lib/ticketConfig';

type Props = {
  entity: any;
  config: TicketConfigEntry;
};

export default function TicketCard({ entity, config }: Props) {
  const subtitle = entity[config.subtitleField] || '';
  const leftMetric = config.leftMetric(entity);
  const rightMetric = config.rightMetric(entity);

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row items-center gap-8">
      {/* Profile Image */}
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden shrink-0 bg-slate-100">
        <img src={entity.image} alt={entity.name} className="w-full h-full object-cover" />
      </div>
      {/* Textual Info */}
      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-2 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{entity.name}</h1>
          {entity.verified && (
            <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 mt-1 md:mt-0">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {config.trustMarker}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-slate-500 mb-2">{subtitle}</p>
        }
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
        {/* CTA Button */}
        <button className={`w-full px-6 py-4 bg-${config.cta.bgColor} hover:bg-${config.cta.bgColor.replace('600','700')} text-${config.cta.textColor} font-bold rounded-xl shadow-lg transition-all text-sm`}>{config.cta.label}</button>
      </div>
    </div>
  );
}
