"use client";

import React, { useState } from 'react';
import AddressBlock from '@/components/AddressBlock';

export interface UniversalPersonalFormProps {
  entityData: any;
  onChange: (newData: any) => void;
  portalType: 'patient' | 'doctor' | 'hospital' | 'lab' | 'pharmacy' | 'ambulance';
  isFamilyMember?: boolean;
}

export default function UniversalPersonalForm({ entityData, onChange, portalType, isFamilyMember = false }: UniversalPersonalFormProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...entityData, [field]: value });
  };

  // Determine allowed prefixes based on portal type
  const allowedPrefixes = () => {
    if (portalType === 'doctor') {
      return ["Dr.", "Prof. Dr.", "Dt."];
    }
    if (portalType === 'patient') {
      return ["Mr.", "Mrs.", "Miss", "Ms."];
    }
    return ["Mr.", "Mrs.", "Miss", "Ms.", "Dr.", "Prof. Dr."]; // All prefixes for Hospital/Lab/Pharmacy
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* 1. Basic Identity */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Prefix</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" 
            value={entityData.prefix || ""} 
            onChange={e => updateField('prefix', e.target.value)}
          >
            <option value="">Select</option>
            {allowedPrefixes().map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">First Name <span className="text-rose-500">*</span></label>
          <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="e.g. John" value={entityData.firstName || ""} onChange={e => updateField('firstName', e.target.value)} />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Middle Name</label>
          <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="" value={entityData.middleName || ""} onChange={e => updateField('middleName', e.target.value)} />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Last Name <span className="text-rose-500">*</span></label>
          <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="e.g. Doe" value={entityData.lastName || ""} onChange={e => updateField('lastName', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
          <input type="email" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="e.g. you@example.com" value={entityData.email || ""} onChange={e => updateField('email', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Date of Birth</label>
          <input type="date" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" value={entityData.dob || ""} onChange={e => updateField('dob', e.target.value)} />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Biological Sex</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" value={entityData.sex || ""} onChange={e => updateField('sex', e.target.value)}>
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Blood Group</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" value={entityData.bloodGroup || ""} onChange={e => updateField('bloodGroup', e.target.value)}>
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option><option value="A-">A-</option>
            <option value="B+">B+</option><option value="B-">B-</option>
            <option value="AB+">AB+</option><option value="AB-">AB-</option>
            <option value="O+">O+</option><option value="O-">O-</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Languages Spoken</label>
        <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="e.g. English, Odia, Hindi" value={entityData.languages || ""} onChange={e => updateField('languages', e.target.value)} />
      </div>

      {/* 2. Professional Designation Checkbox (Conditional) */}
      {(portalType === 'hospital' || portalType === 'lab') && (
        <div className="my-6">
           <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
              <input type="checkbox" className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500" checked={entityData.isDoctor || false} onChange={e => updateField('isDoctor', e.target.checked)} />
              <span className="font-bold text-slate-800">I am a registered medical practitioner (Doctor)</span>
           </label>
        </div>
      )}

      {portalType === 'pharmacy' && (
        <div className="my-6">
           <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
              <input type="checkbox" className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500" checked={entityData.isPharmacist || false} onChange={e => updateField('isPharmacist', e.target.checked)} />
              <span className="font-bold text-slate-800">I am a registered Pharmacist</span>
           </label>
        </div>
      )}

      {/* 3. Address & Phone Segment */}
      <div className="pt-8 border-t border-slate-200 mt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Contact & Location</h3>
        
        {isFamilyMember && (
          <div className="mb-6">
             <label className="flex items-center gap-3 cursor-pointer p-4 bg-sky-50 border border-sky-200 rounded-xl hover:bg-sky-100 transition-colors">
                <input type="checkbox" className="w-5 h-5 text-sky-600 rounded focus:ring-sky-500" checked={entityData.sameAsPrimary || false} onChange={e => updateField('sameAsPrimary', e.target.checked)} />
                <span className="font-bold text-sky-800">Address and Phone same as primary user</span>
             </label>
          </div>
        )}

        {(!isFamilyMember || !entityData.sameAsPrimary) && (
          <div className="space-y-8 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone Number <span className="text-rose-500">*</span></label>
                <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="e.g. 9876543210" value={entityData.phone || ""} onChange={e => updateField('phone', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between items-center">
                  <span>WhatsApp Number</span>
                  <label className="flex items-center gap-2 text-[10px] text-slate-500 cursor-pointer hover:text-teal-600 font-bold normal-case tracking-normal">
                    <input type="checkbox" checked={entityData.whatsapp === entityData.phone && !!entityData.phone} onChange={e => updateField('whatsapp', e.target.checked ? entityData.phone : '')} />
                    Same as Phone
                  </label>
                </label>
                <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-teal-500 outline-none" placeholder="e.g. 9876543210" value={entityData.whatsapp || ""} onChange={e => updateField('whatsapp', e.target.value)} />
              </div>
            </div>

            <div>
              <AddressBlock 
                data={{
                  country: entityData.country || "India",
                  state: entityData.state || "",
                  district: entityData.district || "",
                  block: entityData.block || "",
                  city: entityData.city || "",
                  pincode: entityData.pincode || "",
                  localAddress: entityData.localAddress || "",
                  mapPin: entityData.mapUrl || "",
                  latitude: entityData.latitude || undefined,
                  longitude: entityData.longitude || undefined,
                }} 
                onChange={(newData) => {
                  const updates: any = { ...newData };
                  if (newData.mapPin !== undefined) {
                    updates.mapUrl = newData.mapPin;
                    delete updates.mapPin;
                  }
                  onChange({ ...entityData, ...updates });
                }} 
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
