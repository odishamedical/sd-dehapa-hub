import React from 'react';

export function Card({ 
  children, 
  variant = 'glass', 
  className = '' 
}: { 
  children: React.ReactNode; 
  variant?: 'glass' | 'solid'; 
  className?: string;
}) {
  const baseClasses = "rounded-[32px] p-8 shadow-xl relative overflow-hidden";
  
  const variantClasses = {
    glass: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]",
    solid: "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}