"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface Option {
  value: string;
  label: string;
}

interface GlassSelectProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export default function GlassSelect({ options, value, onChange, placeholder = "Select...", icon }: GlassSelectProps) {
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

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 h-[52px] bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-teal-500 hover:shadow-sm focus-within:ring-4 focus-within:ring-teal-500/10 transition-all"
      >
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          {icon && <div className="shrink-0 text-teal-600">{icon}</div>}
          <span className={`truncate font-medium text-sm ${selectedOption ? 'text-slate-800' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-500/30 scrollbar-track-transparent hover:scrollbar-thumb-teal-500/50">
            {options.map((opt) => (
              <div 
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors text-sm ${
                  value === opt.value 
                    ? 'bg-teal-50 text-teal-700 font-bold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {value === opt.value && <Check className="w-4 h-4 shrink-0 text-teal-600" />}
              </div>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-3 text-slate-400 text-sm">No options available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
