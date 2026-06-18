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
    <div className={`relative border-b md:border-b-0 md:border-r border-slate-700 px-4 py-2 shrink-0 text-left min-w-[140px] ${className}`} ref={dropdownRef}>
      <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-wider mb-1">{label}</label>
      
      <div 
        className="w-full bg-transparent border-none text-sm font-bold text-white cursor-pointer flex items-center justify-between gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <svg className={`w-4 h-4 text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''} shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>

      {isOpen && (
        <div className="absolute top-[120%] left-0 w-full min-w-[180px] bg-[#0a1229]/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] py-2 z-[200] max-h-60 overflow-y-auto custom-scrollbar">
          {options.map((opt) => (
            <div 
              key={opt.value}
              className={`px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors ${value === opt.value ? 'bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-2 border-transparent'}`}
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
