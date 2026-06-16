import React, { useState, useEffect, useRef } from 'react';

interface InlineEditFieldProps {
  value: string;
  onSave: (val: string) => void;
  isEditMode: boolean;
  type?: 'text' | 'textarea' | 'number';
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export default function InlineEditField({
  value,
  onSave,
  isEditMode,
  type = 'text',
  placeholder = 'Click to edit...',
  className = '',
  inputClassName = ''
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onSave(currentValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (!isEditMode) {
    return <span className={className}>{value || placeholder}</span>;
  }

  if (isEditing) {
    if (type === 'textarea') {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full bg-white text-slate-800 border-2 border-teal-500 rounded-lg p-3 outline-none shadow-inner resize-y min-h-[120px] text-base font-sans ${inputClassName}`}
          placeholder={placeholder}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full bg-white text-slate-800 border-2 border-teal-500 rounded-lg px-3 py-2 outline-none shadow-inner text-base font-sans font-normal leading-normal ${inputClassName}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span 
      className={`cursor-pointer hover:bg-teal-50 hover:ring-2 hover:ring-teal-200 rounded px-1 -mx-1 transition-all ${!value ? 'text-slate-400 italic' : ''} ${className}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value || placeholder}
    </span>
  );
}
