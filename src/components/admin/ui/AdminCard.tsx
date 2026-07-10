import React from 'react';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function AdminCard({ children, className = "", noPadding = false }: AdminCardProps) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl ${noPadding ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
}
