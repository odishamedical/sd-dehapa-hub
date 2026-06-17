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
          <label className="block text-sm font-semibold text-slate-800 mb-2">Country</label>
          <select 
            value={defaultCountries.includes(data.country) ? data.country : (data.country ? "Other" : "")} 
            onChange={(e) => {
              if (e.target.value === "Other") {
                updateField('country', "Other"); // Open text box
              } else {
                updateField('country', e.target.value);
              }
            }}
            className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all mb-2"
          >
            <option value="">Select Country</option>
            {defaultCountries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          {!defaultCountries.includes(data.country) && data.country !== undefined && (
            <input 
              type="text" 
              value={data.country === "Other" ? "" : data.country}
              onChange={(e) => updateField('country', e.target.value)}
              placeholder="Type Country Name..."
              className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all animate-in fade-in"
            />
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">State / Province</label>
          {data.country === "India" ? (
            <select 
              value={data.state}
              onChange={(e) => updateField('state', e.target.value)}
              className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
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
              className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* District */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">District / County</label>
          {data.state && districtsByState[data.state] ? (
            <select 
              value={districtsByState[data.state].includes(data.district) ? data.district : (data.district ? "Other" : "")}
              onChange={(e) => {
                if (e.target.value === "Other") {
                  updateField('district', "Other");
                } else {
                  updateField('district', e.target.value);
                }
              }}
              className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all mb-2"
            >
              <option value="">Select District</option>
              {districtsByState[data.state].map((d: string) => <option key={d} value={d}>{d}</option>)}
              <option value="Other">Other</option>
            </select>
          ) : (
            <input 
              type="text" 
              value={data.district}
              onChange={(e) => updateField('district', e.target.value)}
              placeholder="Type District..."
              className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
            />
          )}
          {data.state && districtsByState[data.state] && !districtsByState[data.state].includes(data.district) && data.district !== "" && data.district !== undefined && (
            <input 
              type="text" 
              value={data.district === "Other" ? "" : data.district}
              onChange={(e) => updateField('district', e.target.value)}
              placeholder="Type Custom District..."
              className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all animate-in fade-in"
            />
          )}
        </div>

        {/* Block */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">Block / Sub-District</label>
          {data.district && blocksByDistrict[data.district] ? (
            <select 
              value={blocksByDistrict[data.district].includes(data.block) ? data.block : (data.block ? "Other" : "")}
              onChange={(e) => {
                if (e.target.value === "Other") {
                  updateField('block', "Other");
                } else {
                  updateField('block', e.target.value);
                }
              }}
              className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all mb-2"
            >
              <option value="">Select Block</option>
              {blocksByDistrict[data.district].map((b: string) => <option key={b} value={b}>{b}</option>)}
              <option value="Other">Other</option>
            </select>
          ) : (
            <input 
              type="text" 
              value={data.block}
              onChange={(e) => updateField('block', e.target.value)}
              placeholder="Type Block (Optional)"
              className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
            />
          )}
          {data.district && blocksByDistrict[data.district] && !blocksByDistrict[data.district].includes(data.block) && data.block !== "" && data.block !== undefined && (
            <input 
              type="text" 
              value={data.block === "Other" ? "" : data.block}
              onChange={(e) => updateField('block', e.target.value)}
              placeholder="Type Custom Block..."
              className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all animate-in fade-in"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* City / Town / Village */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">Town / City / Village</label>
          <input 
            type="text" 
            value={data.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="e.g. Bhubaneswar, Sahid Nagar"
            className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
          />
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">Pincode / Zip</label>
          <input 
            type="text" 
            maxLength={6}
            value={data.pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, ''); // Numbers only
              updateField('pincode', val);
            }}
            placeholder="e.g. 751001"
            className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Local Address */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">Local Address / Street</label>
        <textarea 
          rows={2}
          value={data.localAddress}
          onChange={(e) => updateField('localAddress', e.target.value)}
          placeholder="Specific landmarks, street names, or building/room numbers..."
          className="w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
        />
      </div>
    </div>
  );
}
