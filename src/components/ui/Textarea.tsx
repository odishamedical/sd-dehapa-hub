import React from 'react';

export function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea 
      className={`w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/20 hover:border-cyan-500 dark:hover:border-cyan-400 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-white/10 rounded-xl px-5 py-3.5 shadow-sm focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all resize-y min-h-[120px] ${className}`}
      {...props}
    />
  );
}
