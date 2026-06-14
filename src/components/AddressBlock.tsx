import React, { useState } from 'react';
import { indianStates, districtsByState, blocksByDistrict } from '@/lib/locations';

export interface AddressData {
  country: string;
  state: string;
  district: string;
  block: string;
  city: string; // Town/City/Village
  pincode: string;
  localAddress: string;
}

interface AddressBlockProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
}

const defaultCountries = ["India", "USA", "UK", "Australia", "Canada", "Other"];

export default function AddressBlock({ data, onChange }: AddressBlockProps) {
  const updateField = (field: keyof AddressData, value: string) => {
    const newData = { ...data, [field]: value };
    
    // Auto-cascading logic
    if (field === 'country' && value !== 'India') {
      // If they switch away from India, clear State/District/Block logic
      newData.state = '';
      newData.district = '';
      newData.block = '';
    }
    
    if (field === 'state') {
      newData.district = '';
      newData.block = '';
    }
    
    if (field === 'district') {
      newData.block = '';
    }

    onChange(newData);
  };

  const isOdisha = data.state === "Odisha";
  const hasOdishaDistricts = isOdisha && districtsByState["Odisha"];
  const hasBlocks = isOdisha && data.district && blocksByDistrict[data.district];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Country</label>
          <select 
            value={defaultCountries.includes(data.country) ? data.country : (data.country ? "Other" : "")} 
            onChange={(e) => {
              if (e.target.value === "Other") {
                updateField('country', ""); // Open text box
              } else {
                updateField('country', e.target.value);
              }
            }}
            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all mb-2"
          >
            <option value="">Select Country</option>
            {defaultCountries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          {!defaultCountries.includes(data.country) && data.country !== undefined && (
            <input 
              type="text" 
              value={data.country}
              onChange={(e) => updateField('country', e.target.value)}
              placeholder="Type Country Name..."
              className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all animate-in fade-in"
            />
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">State / Province</label>
          {data.country === "India" ? (
            <select 
              value={data.state}
              onChange={(e) => updateField('state', e.target.value)}
              className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all"
            >
              <option value="">Select State</option>
              {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <input 
              type="text" 
              value={data.state}
              onChange={(e) => updateField('state', e.target.value)}
              placeholder="e.g. California, London"
              className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* District */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">District / County</label>
          {isOdisha ? (
            <select 
              value={data.district}
              onChange={(e) => updateField('district', e.target.value)}
              className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all"
            >
              <option value="">Select District</option>
              {districtsByState["Odisha"]?.map((d: string) => <option key={d} value={d}>{d}</option>)}
            </select>
          ) : (
            <input 
              type="text" 
              value={data.district}
              onChange={(e) => updateField('district', e.target.value)}
              placeholder="Type District..."
              className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all"
            />
          )}
        </div>

        {/* Block */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Block / Sub-District</label>
          {isOdisha && data.district ? (
            <select 
              value={data.block}
              onChange={(e) => updateField('block', e.target.value)}
              className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all"
            >
              <option value="">Select Block</option>
              {blocksByDistrict[data.district]?.map((b: string) => <option key={b} value={b}>{b}</option>)}
            </select>
          ) : (
            <input 
              type="text" 
              value={data.block}
              onChange={(e) => updateField('block', e.target.value)}
              placeholder="Type Block (Optional)"
              className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* City / Town / Village */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Town / City / Village</label>
          <input 
            type="text" 
            value={data.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="e.g. Bhubaneswar, Sahid Nagar"
            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all"
          />
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Pincode / Zip</label>
          <input 
            type="text" 
            maxLength={6}
            value={data.pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, ''); // Numbers only
              updateField('pincode', val);
            }}
            placeholder="e.g. 751001"
            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Local Address */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Local Address / Street</label>
        <textarea 
          rows={2}
          value={data.localAddress}
          onChange={(e) => updateField('localAddress', e.target.value)}
          placeholder="Specific landmarks, street names, or building/room numbers..."
          className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-teal-500 outline-none transition-all"
        />
      </div>
    </div>
  );
}
