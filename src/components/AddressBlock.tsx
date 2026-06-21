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
  darkTheme?: boolean;
}

const defaultCountries = ["India", "USA", "UK", "Australia", "Canada", "Other"];

export default function AddressBlock({ data, onChange, darkTheme = false }: AddressBlockProps) {
  const updateField = (field: keyof AddressData, value: string) => {
    const newData = { ...data, [field]: value };
    
    // Auto-cascading logic
    if (field === 'country' && value !== 'India') {
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

  const labelClass = darkTheme 
    ? "block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2" 
    : "block text-sm font-semibold text-slate-800 mb-2";

  const inputClass = darkTheme
    ? "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors mb-2"
    : "w-full bg-slate-900/5 backdrop-blur-md shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),0_1px_1px_rgba(255,255,255,0.6)] border border-slate-900/5 rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:bg-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all mb-2";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country */}
        <div>
          <label className={labelClass}>Country</label>
          <select 
            value={defaultCountries.includes(data.country) ? data.country : (data.country ? "Other" : "")} 
            onChange={(e) => {
              if (e.target.value === "Other") {
                updateField('country', "Other"); 
              } else {
                updateField('country', e.target.value);
              }
            }}
            className={inputClass}
          >
            <option value="">Select Country</option>
            {defaultCountries.map(c => <option key={c} value={c} className={darkTheme ? "bg-slate-900" : ""}>{c}</option>)}
            <option value="Other" className={darkTheme ? "bg-slate-900" : ""}>Other</option>
          </select>
          
          {!defaultCountries.includes(data.country) && data.country !== undefined && (
            <input 
              type="text" 
              value={data.country === "Other" ? "" : data.country}
              onChange={(e) => updateField('country', e.target.value)}
              placeholder="Type Country Name..."
              className={inputClass}
            />
          )}
        </div>

        {/* State */}
        <div>
          <label className={labelClass}>State / Province</label>
          {data.country === "India" ? (
            <select 
              value={data.state}
              onChange={(e) => updateField('state', e.target.value)}
              className={inputClass}
            >
              <option value="">Select State</option>
              {indianStates.map(s => <option key={s} value={s} className={darkTheme ? "bg-slate-900" : ""}>{s}</option>)}
            </select>
          ) : (
            <input 
              type="text" 
              value={data.state}
              onChange={(e) => updateField('state', e.target.value)}
              placeholder="e.g. California, London"
              className={inputClass}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* District */}
        <div>
          <label className={labelClass}>District / County</label>
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
              className={inputClass}
            >
              <option value="">Select District</option>
              {districtsByState[data.state].map((d: string) => <option key={d} value={d} className={darkTheme ? "bg-slate-900" : ""}>{d}</option>)}
              <option value="Other" className={darkTheme ? "bg-slate-900" : ""}>Other</option>
            </select>
          ) : (
            <input 
              type="text" 
              value={data.district}
              onChange={(e) => updateField('district', e.target.value)}
              placeholder="Type District..."
              className={inputClass}
            />
          )}
          {data.state && districtsByState[data.state] && !districtsByState[data.state].includes(data.district) && data.district !== "" && data.district !== undefined && (
            <input 
              type="text" 
              value={data.district === "Other" ? "" : data.district}
              onChange={(e) => updateField('district', e.target.value)}
              placeholder="Type Custom District..."
              className={inputClass}
            />
          )}
        </div>

        {/* Block */}
        <div>
          <label className={labelClass}>Block / Sub-District</label>
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
              className={inputClass}
            >
              <option value="">Select Block</option>
              {blocksByDistrict[data.district].map((b: string) => <option key={b} value={b} className={darkTheme ? "bg-slate-900" : ""}>{b}</option>)}
              <option value="Other" className={darkTheme ? "bg-slate-900" : ""}>Other</option>
            </select>
          ) : (
            <input 
              type="text" 
              value={data.block}
              onChange={(e) => updateField('block', e.target.value)}
              placeholder="Type Block (Optional)"
              className={inputClass}
            />
          )}
          {data.district && blocksByDistrict[data.district] && !blocksByDistrict[data.district].includes(data.block) && data.block !== "" && data.block !== undefined && (
            <input 
              type="text" 
              value={data.block === "Other" ? "" : data.block}
              onChange={(e) => updateField('block', e.target.value)}
              placeholder="Type Custom Block..."
              className={inputClass}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* City / Town / Village */}
        <div>
          <label className={labelClass}>Town / City / Village</label>
          <input 
            type="text" 
            value={data.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="e.g. Bhubaneswar, Sahid Nagar"
            className={inputClass}
          />
        </div>

        {/* Pincode */}
        <div>
          <label className={labelClass}>Pincode / Zip</label>
          <input 
            type="text" 
            maxLength={6}
            value={data.pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, ''); 
              updateField('pincode', val);
            }}
            placeholder="e.g. 751001"
            className={inputClass}
          />
        </div>
      </div>

      {/* Local Address */}
      <div>
        <label className={labelClass}>Local Address / Street</label>
        <textarea 
          rows={2}
          value={data.localAddress}
          onChange={(e) => updateField('localAddress', e.target.value)}
          placeholder="Specific landmarks, street names, or building/room numbers..."
          className={`${inputClass} resize-none`}
        />
      </div>
    </div>
  );
}
