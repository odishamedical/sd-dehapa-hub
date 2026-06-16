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

  if (type === 'textarea') {
    if (!isEditMode) {
      return <span className={className}>{value || placeholder}</span>;
    }
    if (isEditing) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full bg-white text-slate-800 border-2 border-teal-500 rounded-lg p-3 outline-none shadow-inner resize-y min-h-[60px] text-base font-sans ${inputClassName}`}
          placeholder={placeholder}
          autoFocus
        />
      );
    }
    return (
      <span 
        className={`cursor-pointer hover:bg-teal-50 hover:ring-2 hover:ring-teal-200 rounded px-1 -mx-1 transition-all block ${!value ? 'text-slate-400 italic' : ''} ${className}`}
        onClick={() => setIsEditing(true)}
        title="Click to edit"
      >
        {value || placeholder}
      </span>
    );
  }

  // Seamless contentEditable for text and number types
  if (!isEditMode) {
    return <span className={className}>{value || placeholder}</span>;
  }

  return (
    <span 
      contentEditable={isEditing}
      suppressContentEditableWarning={true}
      ref={inputRef as React.RefObject<HTMLSpanElement>}
      onBlur={(e) => {
        setIsEditing(false);
        const val = e.currentTarget.textContent || '';
        if (val !== value) {
          onSave(val);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === 'Escape') {
          e.currentTarget.textContent = value || placeholder;
          setIsEditing(false);
        }
      }}
      onClick={() => {
        if (!isEditing) {
          setIsEditing(true);
          // Focus is handled by contentEditable natively when clicked, 
          // but we might need to set cursor position if triggered programmatically
        }
      }}
      className={
        isEditing 
          ? `bg-white text-slate-900 border-b-2 border-teal-500 outline-none shadow-sm px-1 min-w-[20px] inline-block cursor-text ${inputClassName}` 
          : `cursor-pointer hover:bg-teal-50 hover:ring-2 hover:ring-teal-200 rounded px-1 -mx-1 transition-all ${!value ? 'text-slate-400 italic' : ''} ${className}`
      }
      title={isEditing ? "" : "Click to edit"}
    >
      {value || (isEditing ? '' : placeholder)}
    </span>
  );
}
