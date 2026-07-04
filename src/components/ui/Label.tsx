import React from 'react';

export function Label({ 
  children, 
  required = false, 
  className = '', 
  ...props 
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label 
      className={`block text-xs uppercase font-bold text-slate-500 dark:text-slate-300 mb-2 tracking-wider ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
  );
}
