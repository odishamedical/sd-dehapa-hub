import React from 'react';

interface AdminHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, description, badge, actions }: AdminHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-800 pb-6">
      <div>
        <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 drop-shadow-sm">
          {title}
          {badge && (
            <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              {badge}
            </span>
          )}
        </h3>
        {description && (
          <p className="text-sm text-slate-400 mt-2">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
