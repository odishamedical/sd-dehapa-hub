import React from 'react';
import HybridEntitySelector from './HybridEntitySelector';
import ImageUpload from './ImageUpload';

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'hybrid_entity_selector' | 'image_upload';
  targetEntity?: string;
  placeholder?: string;
}

interface ObjectArrayEditorProps {
  title: string;
  items: any[];
  fields: FieldDef[];
  onUpdate: (index: number, key: string, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  currentUserId?: string;
  currentUserRole?: string;
  currentUserName?: string;
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
  currentUserName
}: ObjectArrayEditorProps) {
  return (
    <div className="w-full">
      <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-widest">{title}</h4>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="p-4 border border-slate-200 rounded-xl bg-white relative group shadow-sm hover:shadow-md transition-shadow">
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
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea 
                      value={item[field.key] || ""} 
                      onChange={(e) => onUpdate(index, field.key, e.target.value)}
                      className="w-full border-2 border-slate-200 focus:border-teal-500 rounded-lg px-3 py-2 outline-none transition-colors text-sm"
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
                  ) : (
                    <input 
                      type="text" 
                      value={item[field.key] || ""} 
                      onChange={(e) => onUpdate(index, field.key, e.target.value)}
                      className="w-full border-2 border-slate-200 focus:border-teal-500 rounded-lg px-3 py-2 outline-none transition-colors text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
            <p className="text-sm text-slate-500">No items added yet.</p>
          </div>
        )}
      </div>
      <button 
        onClick={onAdd}
        className="mt-4 flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-teal-300 text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl font-bold transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        Add New {title.replace(/s$/, '')}
      </button>
    </div>
  );
}
