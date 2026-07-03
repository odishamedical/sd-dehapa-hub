"use client";

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
  latitude?: number;
  longitude?: number;
  mapPin?: string;
}

interface AddressBlockProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
  darkTheme?: boolean;
}

const defaultCountries = ["India", "USA", "UK", "Australia", "Canada", "Other"];

export default function AddressBlock({ data, onChange, darkTheme = false }: AddressBlockProps) {
  const [gpsLoading, setGpsLoading] = useState(false);

  const updateField = (field: keyof AddressData, value: any) => {
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

  const handleGetGPSLocation = () => {
    if (typeof window === 'undefined') return;
    setGpsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newData = {
            ...data,
            latitude: lat,
            longitude: lng
          };
          onChange(newData);
          setGpsLoading(false);
        },
        (error) => {
          console.error("GPS error", error);
          alert("Could not retrieve GPS coordinates. Please make sure location access is allowed in your browser settings.");
          setGpsLoading(false);
        }
      );
    } else {
      alert("Location services are not supported by your browser.");
      setGpsLoading(false);
    }
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
      
      {/* Map and GPS Pinner (Village Friendly) */}
      <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-6 mb-6 space-y-5">
        <div>
          <h4 className="font-bold text-sky-900 dark:text-white text-base mb-1">Set Location on Map</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            This maps your location so ambulances and patients can find you instantly. You can either use GPS or paste a Google Maps link.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <button 
            type="button"
            onClick={handleGetGPSLocation}
            className="w-full md:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-widest px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            {gpsLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {data.latitude ? "Update Pinned GPS Location" : "Pin My Current GPS Location"}
          </button>
          {data.latitude && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-500/10 px-3 py-1 rounded-lg">
              📍 GPS Coordinates Pinned: {data.latitude.toFixed(5)}, {data.longitude?.toFixed(5)}
            </span>
          )}
        </div>
        
        {data.latitude && data.longitude && (
          <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-700/50 shadow-inner">
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no" 
              marginHeight={0} 
              marginWidth={0} 
              src={`https://maps.google.com/maps?q=${data.latitude},${data.longitude}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        )}

        <div className="pt-2 border-t border-sky-500/20">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between items-center">
            <span>Or paste Google Map Pin URL</span>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-sky-600 hover:underline normal-case">Find Pin 📍</a>
          </label>
          <input 
            type="url"
            value={data.mapPin || ''}
            onChange={e => updateField('mapPin', e.target.value)}
            placeholder="https://maps.app.goo.gl/..."
            className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 outline-none font-mono text-sm"
          />
        </div>
      </div>

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
            {defaultCountries.map(c => c !== "Other" ? <option key={c} value={c} className={darkTheme ? "bg-slate-900" : ""}>{c}</option> : null)}
            <option value="Other" className={darkTheme ? "bg-slate-900" : ""}>Other</option>
          </select>
          
          {(!defaultCountries.includes(data.country) || data.country === "Other") && data.country !== undefined && data.country !== "" && (
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
              placeholder="Type State/Province"
              className={inputClass}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* District */}
        <div>
          <label className={labelClass}>District</label>
          {isOdisha && hasOdishaDistricts ? (
            <select 
              value={districtsByState["Odisha"].includes(data.district) ? data.district : (data.district ? "Other" : "")}
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
              {districtsByState["Odisha"].map((d: string) => <option key={d} value={d} className={darkTheme ? "bg-slate-900" : ""}>{d}</option>)}
              <option value="Other" className={darkTheme ? "bg-slate-900" : ""}>Other</option>
            </select>
          ) : (
            <input 
              type="text" 
              value={data.district}
              onChange={(e) => updateField('district', e.target.value)}
              placeholder="Type District (Optional)"
              className={inputClass}
            />
          )}
          {isOdisha && hasOdishaDistricts && !districtsByState["Odisha"].includes(data.district) && data.district !== "" && data.district !== undefined && (
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
          <label className={labelClass}>
            Town / City / Village <span className="text-rose-500 ml-1">*</span>
          </label>
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
