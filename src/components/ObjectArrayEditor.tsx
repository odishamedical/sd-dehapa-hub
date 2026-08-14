import React from 'react';
import HybridEntitySelector from './HybridEntitySelector';
import ImageUpload from './ImageUpload';
import InlineEditArray from './InlineEditArray';

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'hybrid_entity_selector' | 'image_upload' | 'string_array' | 'dynamic_select' | 'select' | 'number' | 'boolean';
  targetEntity?: string;
  placeholder?: string;
  options?: string[];
  sourceField?: string;
  sourceKey?: string;
}

interface ObjectArrayEditorProps {
  title: string;
  items: any[];
  fields: FieldDef[];
  onUpdate: (index: number, key: string, value: any) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  currentUserId?: string;
  currentUserRole?: string;
  currentUserName?: string;
  contextData?: any;
}

export default function ObjectArrayEditor({
  title,
  items,
  fields,
  onUpdate,
  onAdd,
  onRemove,
  currentUserId,
  currentUserRole,
  currentUserName,
  contextData
}: ObjectArrayEditorProps) {
  return (
    <div className="w-full">
      <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-widest">{title}</h4>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="p-6 border border-white/10 rounded-2xl bg-slate-800/50 backdrop-blur-md relative group shadow-sm transition-shadow">
            <button 
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              title="Remove"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
              {fields.map((field) => (
                <div key={field.key} className={(field.type === 'textarea' || field.type === 'hybrid_entity_selector') ? "md:col-span-2" : ""}>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea 
                      value={item[field.key] || ""} 
                      onChange={(e) => onUpdate(index, field.key, e.target.value)}
                      className="sd-input-v3 resize-none"
                      rows={2}
                    />
                  ) : field.type === 'hybrid_entity_selector' ? (
                    <div className="mt-2">
                      <HybridEntitySelector 
                        targetEntity={field.targetEntity || "Doctor"}
                        placeholder={field.placeholder || "Search or Add..."}
                        selectedItems={item[field.key] || []}
                        onChange={(newItems) => onUpdate(index, field.key, newItems as any)}
                        currentUserId={currentUserId || ''}
                        currentUserRole={currentUserRole || ''}
                        currentUserName={currentUserName || ''}
                      />
                    </div>
                  ) : field.type === 'image_upload' ? (
                    <div className="mt-2">
                      <ImageUpload 
                        defaultImage={item[field.key] || ""}
                        onChange={(url) => onUpdate(index, field.key, url)}
                      />
                    </div>
                  ) : field.type === 'string_array' ? (
                    <div className="mt-2">
                      <InlineEditArray 
                        items={item[field.key] || []}
                        onSave={(newItems) => onUpdate(index, field.key, newItems)}
                        isEditMode={true}
                        placeholder={field.placeholder || "Add item..."}
                        suggestions={field.options}
                      />
                    </div>
                  ) : field.type === 'dynamic_select' && field.sourceField && field.sourceKey ? (
                    <select
                      value={item[field.key] || ""}
                      onChange={(e) => onUpdate(index, field.key, e.target.value)}
                      className="sd-input-v3 text-slate-800"
                    >
                      <option value="">Select an option...</option>
                      {(contextData?.[field.sourceField] || []).map((sourceObj: any, i: number) => {
                        const val = sourceObj[field.sourceKey!];
                        if (!val) return null;
                        return <option key={i} value={val}>{val}</option>;
                      })}
                    </select>
                  ) : field.type === 'select' ? (
                    <select
                      value={item[field.key] || ""}
                      onChange={(e) => onUpdate(index, field.key, e.target.value)}
                      className="sd-input-v3 text-slate-800"
                    >
                      <option value="">Select an option...</option>
                      {field.options?.map((opt: string, i: number) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type={field.type === 'number' ? 'number' : 'text'} 
                      value={item[field.key] || ""} 
                      onChange={(e) => onUpdate(index, field.key, e.target.value)}
                      className="sd-input-v3"
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-6 bg-slate-800/50 border border-dashed border-white/20 rounded-xl">
            <p className="text-sm text-slate-400">No items added yet.</p>
          </div>
        )}
      </div>
      <button 
        onClick={onAdd}
        className="mt-4 flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl font-bold transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        Add New {title.replace(/s$/, '')}
      </button>
    </div>
  );
}
