import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// -----------------------------------------------------------------------------
// Global Label
// -----------------------------------------------------------------------------
export const GlobalLabel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <label className={`block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 ${className}`}>
    {children}
  </label>
);

// -----------------------------------------------------------------------------
// Global Input
// -----------------------------------------------------------------------------
export const GlobalInput = React.forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all ${className}`}
    {...props}
  />
));
GlobalInput.displayName = "GlobalInput";

// -----------------------------------------------------------------------------
// Global Select
// -----------------------------------------------------------------------------
export const GlobalSelect = React.forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className = "", children, ...props }, ref) => (
  <select
    ref={ref}
    className={`w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all cursor-pointer ${className}`}
    {...props}
  >
    {children}
  </select>
));
GlobalSelect.displayName = "GlobalSelect";

// -----------------------------------------------------------------------------
// Global Textarea
// -----------------------------------------------------------------------------
export const GlobalTextarea = React.forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className = "", ...props }, ref) => (
  <textarea
    ref={ref}
    className={`w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all min-h-[100px] ${className}`}
    {...props}
  />
));
GlobalTextarea.displayName = "GlobalTextarea";

// -----------------------------------------------------------------------------
// Global Form Card
// -----------------------------------------------------------------------------
export const GlobalFormCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`border border-slate-300 rounded-2xl p-6 relative bg-slate-100 shadow-inner hover:border-teal-400 hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
);
