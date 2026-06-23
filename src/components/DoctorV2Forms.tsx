"use client";

import React, { useState } from 'react';

interface DoctorV2FormsProps {
  activeTab: string;
  entityData: any;
  setEntityData: (data: any) => void;
}

export default function DoctorV2Forms({ activeTab, entityData, setEntityData }: DoctorV2FormsProps) {
  
  // Generic helper to update standard fields
  const updateField = (key: string, value: any) => {
    setEntityData({ ...entityData, [key]: value });
  };

  // Helper for arrays (Experiences, Awards, etc.)
  const handleArrayUpdate = (key: string, index: number, subKey: string, value: string) => {
    const safeArray = Array.isArray(entityData[key]) ? [...entityData[key]] : [];
    if (!safeArray[index]) safeArray[index] = {};
    safeArray[index][subKey] = value;
    updateField(key, safeArray);
  };

  const addArrayItem = (key: string) => {
    const safeArray = Array.isArray(entityData[key]) ? [...entityData[key]] : [];
    safeArray.push({});
    updateField(key, safeArray);
  };

  const removeArrayItem = (key: string, index: number) => {
    const safeArray = Array.isArray(entityData[key]) ? [...entityData[key]] : [];
    safeArray.splice(index, 1);
    updateField(key, safeArray);
  };

  // Helper for string arrays (YouTube, Gallery)
  const handleStringArrayUpdate = (key: string, index: number, value: string) => {
    const safeArray = Array.isArray(entityData[key]) ? [...entityData[key]] : [];
    safeArray[index] = value;
    updateField(key, safeArray);
  };

  const addStringArrayItem = (key: string) => {
    const safeArray = Array.isArray(entityData[key]) ? [...entityData[key]] : [];
    if (safeArray.length < 10) {
      safeArray.push("");
      updateField(key, safeArray);
    }
  };

  const removeStringArrayItem = (key: string, index: number) => {
    const safeArray = Array.isArray(entityData[key]) ? [...entityData[key]] : [];
    safeArray.splice(index, 1);
    updateField(key, safeArray);
  };

  if (activeTab === "identity") {
    const gallery = Array.isArray(entityData.galleryImages) ? entityData.galleryImages : [];
    const youtube = Array.isArray(entityData.youtubeLinks) ? entityData.youtubeLinks : [];

    return (
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Identity & Media</h2>
          <p className="text-slate-500 font-medium text-lg">Define how patients see you across the DehaPa Ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="sd-label-v3">Full Name <span className="text-rose-500">*</span></label>
            <input type="text" className="sd-input-v3" placeholder="e.g. Dr. John Doe" value={entityData.name || ""} onChange={e => updateField('name', e.target.value)} />
          </div>
          <div>
            <label className="sd-label-v3">Primary Specialty <span className="text-rose-500">*</span></label>
            <input type="text" className="sd-input-v3" placeholder="e.g. Cardiologist" value={entityData.primarySpecialty || ""} onChange={e => updateField('primarySpecialty', e.target.value)} />
          </div>
          <div>
            <label className="sd-label-v3">Phone Number <span className="text-rose-500">*</span></label>
            <input type="text" className="sd-input-v3" placeholder="e.g. 9876543210" value={entityData.phone || ""} onChange={e => updateField('phone', e.target.value)} />
          </div>
          <div>
            <label className="sd-label-v3 flex justify-between">
              Custom Vanity URL 
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Premium</span>
            </label>
            <div className="flex w-full">
              <span className="inline-flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 text-slate-500 rounded-l-2xl font-mono text-sm shrink-0">dehapa.com/doctors/</span>
              <input type="text" className="sd-input-v3 rounded-l-none" placeholder="dr-john-doe" value={entityData.customSlug || ""} onChange={e => updateField('customSlug', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/60">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Media Gallery (Up to 10 Images)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gallery.map((img: string, idx: number) => (
              <div key={idx} className="flex gap-2">
                <input type="text" className="sd-input-v3 text-sm py-3" placeholder="Image URL..." value={img} onChange={e => handleStringArrayUpdate('galleryImages', idx, e.target.value)} />
                <button onClick={() => removeStringArrayItem('galleryImages', idx)} className="px-4 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-colors font-bold text-xl">×</button>
              </div>
            ))}
          </div>
          {gallery.length < 10 && (
            <button onClick={() => addStringArrayItem('galleryImages')} className="mt-4 text-sm font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-2">
              <span>+</span> Add Gallery Image
            </button>
          )}
        </div>

        <div className="pt-8 border-t border-slate-200/60">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Featured YouTube Videos (Up to 10)</h3>
          <div className="grid grid-cols-1 gap-4">
            {youtube.map((vid: string, idx: number) => (
              <div key={idx} className="flex gap-2">
                <input type="text" className="sd-input-v3 font-mono text-sm py-3" placeholder="https://youtube.com/watch?v=..." value={vid} onChange={e => handleStringArrayUpdate('youtubeLinks', idx, e.target.value)} />
                <button onClick={() => removeStringArrayItem('youtubeLinks', idx)} className="px-4 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-colors font-bold text-xl">×</button>
              </div>
            ))}
          </div>
          {youtube.length < 10 && (
            <button onClick={() => addStringArrayItem('youtubeLinks')} className="mt-4 text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              Add YouTube Link
            </button>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === "professional") {
    const quals = Array.isArray(entityData.qualificationsList) ? entityData.qualificationsList : [];
    const exps = Array.isArray(entityData.experiences) ? entityData.experiences : [];

    return (
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Professional Biography</h2>
          <p className="text-slate-500 font-medium text-lg">Highlight your expertise, education, and career journey.</p>
        </div>

        <div>
          <label className="sd-label-v3">About / Biography</label>
          <textarea rows={4} className="sd-input-v3 resize-none" placeholder="Write a short biography about your clinical practice..." value={entityData.about || ""} onChange={e => updateField('about', e.target.value)} />
        </div>

        <div className="pt-8 border-t border-slate-200/60">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Qualifications & Education</h3>
          {quals.map((q: any, idx: number) => (
            <div key={idx} className="bg-white/50 p-6 rounded-2xl border border-slate-200 mb-4 relative">
              <button onClick={() => removeArrayItem('qualificationsList', idx)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 font-bold">Remove</button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="sd-label-v3 text-xs">Degree</label>
                  <input type="text" className="sd-input-v3 py-3" placeholder="e.g. MBBS, MS" value={q.degree || ""} onChange={e => handleArrayUpdate('qualificationsList', idx, 'degree', e.target.value)} />
                </div>
                <div>
                  <label className="sd-label-v3 text-xs">Institution</label>
                  <input type="text" className="sd-input-v3 py-3" placeholder="University/College" value={q.institution || ""} onChange={e => handleArrayUpdate('qualificationsList', idx, 'institution', e.target.value)} />
                </div>
                <div>
                  <label className="sd-label-v3 text-xs">Year</label>
                  <input type="text" className="sd-input-v3 py-3" placeholder="e.g. 2015" value={q.year || ""} onChange={e => handleArrayUpdate('qualificationsList', idx, 'year', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => addArrayItem('qualificationsList')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-5 py-3 rounded-xl transition-colors">+ Add Qualification</button>
        </div>

        <div className="pt-8 border-t border-slate-200/60">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Work Experience</h3>
          {exps.map((exp: any, idx: number) => (
            <div key={idx} className="bg-white/50 p-6 rounded-2xl border border-slate-200 mb-4 relative">
              <button onClick={() => removeArrayItem('experiences', idx)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 font-bold">Remove</button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="sd-label-v3 text-xs">Role</label>
                  <input type="text" className="sd-input-v3 py-3" placeholder="e.g. Senior Consultant" value={exp.role || ""} onChange={e => handleArrayUpdate('experiences', idx, 'role', e.target.value)} />
                </div>
                <div>
                  <label className="sd-label-v3 text-xs">Hospital / Clinic</label>
                  <input type="text" className="sd-input-v3 py-3" placeholder="e.g. Apollo Hospitals" value={exp.hospital || ""} onChange={e => handleArrayUpdate('experiences', idx, 'hospital', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="sd-label-v3 text-xs">Duration</label>
                  <input type="text" className="sd-input-v3 py-3" placeholder="e.g. 2018 - Present" value={exp.duration || ""} onChange={e => handleArrayUpdate('experiences', idx, 'duration', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => addArrayItem('experiences')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-5 py-3 rounded-xl transition-colors">+ Add Experience</button>
        </div>
      </div>
    );
  }

  if (activeTab === "consultation_setup") {
    return (
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Consultation Services</h2>
          <p className="text-slate-500 font-medium text-lg">Configure your availability and fees for DehaPa native bookings.</p>
        </div>

        {/* Physical Booking */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3"><span className="text-3xl">🏥</span> Physical In-Clinic Visit</h3>
              <p className="text-slate-500 text-sm mt-1">Patients book appointments to visit your physical clinic.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={entityData.offersPhysical || false} onChange={e => updateField('offersPhysical', e.target.checked)} />
              <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500 shadow-inner"></div>
            </label>
          </div>
          {entityData.offersPhysical && (
            <div>
              <label className="sd-label-v3">In-Clinic Consultation Fee (₹)</label>
              <input type="number" className="sd-input-v3" placeholder="e.g. 800" value={entityData.inClinicFee || ""} onChange={e => updateField('inClinicFee', e.target.value)} />
            </div>
          )}
        </div>

        {/* Scheduled Video Call */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3"><span className="text-3xl">💻</span> Scheduled Video Call</h3>
              <p className="text-slate-500 text-sm mt-1">Standard telemedicine consultations over DehaPa Video.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={entityData.offersDigital || false} onChange={e => updateField('offersDigital', e.target.checked)} />
              <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500 shadow-inner"></div>
            </label>
          </div>
          {entityData.offersDigital && (
            <div>
              <label className="sd-label-v3">Scheduled Video Fee (₹)</label>
              <input type="number" className="sd-input-v3" placeholder="e.g. 500" value={entityData.videoFee || ""} onChange={e => updateField('videoFee', e.target.value)} />
            </div>
          )}
        </div>

        {/* Emergency Ping */}
        <div className="bg-rose-50/50 p-8 rounded-3xl border border-rose-200 shadow-[0_8px_30px_rgb(225,29,72,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 border-b border-rose-100 pb-6 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-rose-900 flex items-center gap-3"><span className="text-3xl">🚨</span> Emergency Direct Ping</h3>
              <p className="text-rose-700/80 text-sm mt-1">Accept instant video calls from patients in immediate need.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={entityData.offersEmergencyPing || false} onChange={e => updateField('offersEmergencyPing', e.target.checked)} />
              <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
            </label>
          </div>
          {entityData.offersEmergencyPing && (
            <div className="relative z-10">
              <label className="sd-label-v3 text-rose-900">Emergency Premium Fee (₹)</label>
              <input type="number" className="sd-input-v3 border-rose-200 focus:border-rose-400 focus:ring-rose-400/20" placeholder="e.g. 1500" value={entityData.emergencyFee || ""} onChange={e => updateField('emergencyFee', e.target.value)} />
            </div>
          )}
        </div>

      </div>
    );
  }

  if (activeTab === "bank_details") {
    return (
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Bank & Payouts</h2>
          <p className="text-slate-500 font-medium text-lg">Securely enter your bank details to receive digital consultation payouts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="sd-label-v3">Account Holder Name</label>
            <input type="text" className="sd-input-v3" placeholder="As it appears on your bank account" value={entityData.accountName || ""} onChange={e => updateField('accountName', e.target.value)} />
          </div>
          <div>
            <label className="sd-label-v3">Bank Name</label>
            <input type="text" className="sd-input-v3" placeholder="e.g. HDFC Bank, SBI" value={entityData.bankName || ""} onChange={e => updateField('bankName', e.target.value)} />
          </div>
          <div>
            <label className="sd-label-v3">Account Number</label>
            <input type="password" placeholder="••••••••••••" className="sd-input-v3 font-mono" value={entityData.accountNumber || ""} onChange={e => updateField('accountNumber', e.target.value)} />
          </div>
          <div>
            <label className="sd-label-v3">IFSC Code</label>
            <input type="text" className="sd-input-v3 font-mono uppercase" placeholder="e.g. HDFC0001234" value={entityData.ifscCode || ""} onChange={e => updateField('ifscCode', e.target.value.toUpperCase())} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="sd-label-v3">UPI ID (Optional)</label>
            <input type="text" className="sd-input-v3" placeholder="e.g. doctor@upi" value={entityData.upiId || ""} onChange={e => updateField('upiId', e.target.value)} />
          </div>
        </div>
        
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
           <div className="text-emerald-500 text-2xl mt-1">🔒</div>
           <div>
             <h4 className="font-bold text-emerald-900 mb-1">Bank-Grade Security</h4>
             <p className="text-sm text-emerald-700/80 leading-relaxed">Your financial information is securely encrypted. DehaPa processes payouts for digital consultations automatically every 48 hours to this verified account.</p>
           </div>
        </div>

      </div>
    );
  }

  return null;
}
