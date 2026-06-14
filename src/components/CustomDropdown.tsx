"use client";
import { useState, useRef, useEffect } from 'react';

export default function CustomDropdown({ 
  label, 
  options, 
  value, 
  onChange,
  placeholder = "Select...",
  className = ""
}: { 
  label: string; 
  options: { label: string, value: string }[]; 
  value: string; 
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`relative border-b md:border-b-0 md:border-r border-slate-200 px-4 py-2 shrink-0 text-left min-w-[140px] ${className}`} ref={dropdownRef}>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</label>
      
      <div 
        className="w-full bg-transparent border-none text-sm font-bold text-slate-800 cursor-pointer flex items-center justify-between gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''} shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>

      {isOpen && (
        <div className="absolute top-[120%] left-0 w-full min-w-[180px] bg-white border border-slate-100 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] py-2 z-[200] max-h-60 overflow-y-auto custom-scrollbar">
          {options.map((opt) => (
            <div 
              key={opt.value}
              className={`px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors ${value === opt.value ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50 hover:text-teal-600'}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
