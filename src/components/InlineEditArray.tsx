import React, { useState, useEffect } from 'react';

interface InlineEditArrayProps {
  items: string[];
  onSave: (newItems: string[]) => void;
  isEditMode: boolean;
  itemClassName?: string;
  placeholder?: string;
  suggestions?: string[];
}

export default function InlineEditArray({
  items,
  onSave,
  isEditMode,
  itemClassName = "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm",
  placeholder = "Add an item...",
  suggestions
}: InlineEditArrayProps) {
  const [currentItems, setCurrentItems] = useState<string[]>([...items]);
  const [newItemText, setNewItemText] = useState("");
  const datalistId = React.useId();

  useEffect(() => {
    setCurrentItems([...items]);
  }, [items]);

  const handleRemove = (index: number) => {
    const newArr = currentItems.filter((_, i) => i !== index);
    setCurrentItems(newArr);
    onSave(newArr);
  };

  const handleAdd = () => {
    if (newItemText.trim() === "") return;
    const newArr = [...currentItems, newItemText.trim()];
    setCurrentItems(newArr);
    onSave(newArr);
    setNewItemText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  if (!isEditMode) {
    return (
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && <span className="text-slate-500 text-sm italic">None added</span>}
        {items.map((item, idx) => (
          <span key={idx} className={itemClassName}>
            {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {currentItems.map((item, idx) => (
          <div key={idx} className={`${itemClassName} flex items-center gap-2 group relative pr-7`}>
            <span>{item}</span>
            <button 
              onClick={() => handleRemove(idx)}
              className="absolute right-1 w-5 h-5 flex items-center justify-center bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 rounded-md opacity-0 group-hover:opacity-100 transition-all"
              title="Remove item"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-2 max-w-sm mt-1">
        <input 
          type="text" 
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={handleKeyDown}
          list={suggestions ? datalistId : undefined}
          className="sd-input-v3 flex-1 px-3 py-2 text-sm"
          placeholder={placeholder}
        />
        {suggestions && (
          <datalist id={datalistId}>
            {suggestions.map((sug, idx) => (
              <option key={idx} value={sug} />
            ))}
          </datalist>
        )}
        <button 
          onClick={handleAdd}
          disabled={!newItemText.trim()}
          className="bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors shadow-sm"
        >
          Add
        </button>
      </div>
    </div>
  );
}
