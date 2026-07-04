import React from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false,
  disabled = false,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  isLoading?: boolean;
}) {
  const baseClasses = "relative overflow-hidden flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-500 hover:to-emerald-500 shadow-[0_10px_20px_rgba(13,148,136,0.15)] hover:shadow-[0_15px_30px_rgba(13,148,136,0.25)]",
    secondary: "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 shadow-sm",
    destructive: "bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 shadow-[0_10px_20px_rgba(225,29,72,0.15)]",
    outline: "bg-transparent border-2 border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400"
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
      ) : null}
      {children}
    </button>
  );
}
