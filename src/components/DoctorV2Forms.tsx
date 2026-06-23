"use client";

import React, { useState } from 'react';
import { directoryConfig } from '@/lib/directoryConfig';

interface DoctorV2FormsProps {
  activeTab: string;
  entityData: any;
  setEntityData: (data: any) => void;
}

export default function DoctorV2Forms({ activeTab, entityData, setEntityData }: DoctorV2FormsProps) {
  
  // Custom Identity Form
  if (activeTab === 'identity') {
    return (
      <div>
        <h2 className="text-2xl font-black text-slate-800 mb-6">Public Profile</h2>
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="sd-label-v2">Full Name</label>
            <input 
              type="text" 
              value={entityData.name || ''} 
              onChange={e => setEntityData({ ...entityData, name: e.target.value })}
              className="sd-input-v2"
              placeholder="e.g. Dr. Amaar Halchal"
            />
          </div>
          <div>
            <label className="sd-label-v2">Mobile Number</label>
            <input 
              type="text" 
              value={entityData.phone || ''} 
              onChange={e => setEntityData({ ...entityData, phone: e.target.value })}
              className="sd-input-v2"
              placeholder="e.g. +91 9876543210"
            />
          </div>
          <div>
            <label className="sd-label-v2">About / Bio</label>
            <textarea 
              value={entityData.about || ''} 
              onChange={e => setEntityData({ ...entityData, about: e.target.value })}
              className="sd-input-v2 min-h-[120px]"
              placeholder="Write a short bio about your experience and philosophy..."
            />
          </div>
        </div>
      </div>
    );
  }

  // Dynamic Config Forms
  const doctorConfig = directoryConfig.Doctor;
  const tabConfig = doctorConfig.tabs.find(t => t.id === activeTab);

  if (!tabConfig) return null;

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-800 mb-6">{tabConfig.label}</h2>
      
      <div className="space-y-8 max-w-3xl">
        {tabConfig.fields.map(field => {
          
          if (field.type === 'text' || field.type === 'number') {
            return (
              <div key={field.key}>
                <label className="sd-label-v2">{field.label}</label>
                <input 
                  type={field.type}
                  value={entityData[field.key] || ''}
                  onChange={e => setEntityData({ ...entityData, [field.key]: e.target.value })}
                  className="sd-input-v2"
                  placeholder={field.placeholder}
                />
              </div>
            );
          }

          if (field.type === 'boolean') {
            return (
              <div key={field.key} className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm">
                <input 
                  type="checkbox"
                  checked={!!entityData[field.key]}
                  onChange={e => setEntityData({ ...entityData, [field.key]: e.target.checked })}
                  className="w-6 h-6 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500"
                />
                <label className="text-lg font-bold text-slate-800 cursor-pointer" onClick={() => setEntityData({ ...entityData, [field.key]: !entityData[field.key] })}>
                  {field.label}
                </label>
              </div>
            );
          }

          if (field.type === 'object_array') {
             const items = entityData[field.key] || [];
             return (
               <div key={field.key} className="bg-white p-6 rounded-3xl border-2 border-slate-200">
                 <label className="sd-label-v2 mb-4">{field.label}</label>
                 
                 <div className="space-y-4 mb-4">
                   {items.map((item: any, idx: number) => (
                     <div key={idx} className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {field.arrayFields?.map(af => (
                            <div key={af.key}>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{af.label}</span>
                              <p className="font-bold text-slate-800">{item[af.key] || '---'}</p>
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => {
                            const newItems = [...items];
                            newItems.splice(idx, 1);
                            setEntityData({ ...entityData, [field.key]: newItems });
                          }}
                          className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                     </div>
                   ))}
                 </div>
                 
                 <button 
                   onClick={() => {
                     const newItem: any = {};
                     field.arrayFields?.forEach(af => newItem[af.key] = "");
                     setEntityData({ ...entityData, [field.key]: [...items, newItem] });
                   }}
                   className="sd-btn-v2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 w-full py-3"
                 >
                   + Add Entry
                 </button>
               </div>
             );
          }

          return null;
        })}
      </div>
    </div>
  );
}
