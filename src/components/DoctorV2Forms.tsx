"use client";

import React, { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PremiumSlugModal from '@/components/PremiumSlugModal';
import SmartEntitySearch from '@/components/SmartEntitySearch';
import AddressBlock from '@/components/AddressBlock';
import UniversalPersonalForm from '@/components/UniversalPersonalForm';

interface DoctorV2FormsProps {
  activeTab: string;
  entityData: any;
  setEntityData: (data: any) => void;
}

export default function DoctorV2Forms({ activeTab, entityData, setEntityData }: DoctorV2FormsProps) {
  
  const [isSlugModalOpen, setIsSlugModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Generic helper to update standard fields
  const updateField = (key: string, value: any) => {
    setEntityData({ ...entityData, [key]: value });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB.");
      return;
    }
    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `profiles/${entityData.id || Date.now()}/avatar`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      updateField('image', url);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image.");
    }
    setUploadingImage(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const safeArray = Array.isArray(entityData.galleryImages) ? [...entityData.galleryImages] : [];
      for (let i = 0; i < files.length; i++) {
        if (safeArray.length >= 10) break;
        const file = files[i];
        if (file.size > 2 * 1024 * 1024) continue; // Skip large files
        const storageRef = ref(storage, `profiles/${entityData.id || Date.now()}/gallery/${Date.now()}_${i}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        safeArray.push(url);
      }
      updateField('galleryImages', safeArray);
    } catch (err) {
      console.error("Gallery upload failed", err);
      alert("Failed to upload gallery images.");
    }
    setUploadingGallery(false);
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

    return (
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Personal Details</h2>
          <p className="text-slate-500 font-medium text-lg">Standard personal information for your account.</p>
        </div>

        {/* Avatar Upload */}
        <div className="flex items-center gap-6 bg-black/20 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
          <div className="w-24 h-24 rounded-full border-4 border-white/10 shadow-lg overflow-hidden bg-slate-800 relative shrink-0">
            {entityData.image ? (
              <img src={entityData.image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
            )}
            {uploadingImage && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <span className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></span>
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-white mb-1">Profile Photo</h4>
            <p className="text-xs text-slate-500 mb-3">Professional photo. Max size 2MB.</p>
            <label className="sd-btn-v3 bg-white/10 text-white border border-white/20 hover:bg-white/20 py-2 cursor-pointer inline-block">
              {uploadingImage ? 'Uploading...' : 'Upload Image'}
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingImage} />
            </label>
          </div>
        </div>

        <UniversalPersonalForm 
          entityData={entityData} 
          onChange={setEntityData} 
          portalType="doctor" 
        />
        
        <PremiumSlugModal 
          isOpen={isSlugModalOpen} 
          onClose={() => setIsSlugModalOpen(false)} 
          currentName={entityData.name || ""} 
          currentUglyUrl={`dehapa.com/doctors/${entityData.id || "new"}`} 
        />
      </div>
    );
  }

  if (activeTab === "professional") {
    const quals = Array.isArray(entityData.qualificationsList) ? entityData.qualificationsList : [];
    const exps = Array.isArray(entityData.experiences) ? entityData.experiences : [];
    const research = Array.isArray(entityData.research) ? entityData.research : [];
    const awards = Array.isArray(entityData.awards) ? entityData.awards : [];
    const gallery = Array.isArray(entityData.galleryImages) ? entityData.galleryImages : [];
    const youtube = Array.isArray(entityData.youtubeLinks) ? entityData.youtubeLinks : [];

    return (
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Professional Biography</h2>
          <p className="text-slate-500 font-medium text-lg">Highlight your expertise, education, and career journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <label className="sd-label-v3">Primary Specialty <span className="text-rose-500">*</span></label>
            <input type="text" className="sd-input-v3" placeholder="e.g. Cardiologist" value={entityData.primarySpecialty || ""} onChange={e => updateField('primarySpecialty', e.target.value)} />
          </div>
          <div>
            <label className="sd-label-v3 flex justify-between">
              Custom Vanity URL 
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Premium</span>
            </label>
            <div className="flex w-full">
              <span className="inline-flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 text-slate-500 rounded-l-2xl font-mono text-sm shrink-0">dehapa.com/doctors/</span>
              <input type="text" className="sd-input-v3 rounded-none bg-slate-50" disabled value={entityData.customSlug || ""} />
              <button onClick={() => setIsSlugModalOpen(true)} className="px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-r-2xl text-sm transition-colors whitespace-nowrap shadow-sm">
                Reserve URL
              </button>
            </div>
          </div>
          <div>
            <label className="sd-label-v3 flex justify-between">
              Medical Registration No. <span className="text-rose-500">*</span>
              {entityData.registrationNumber && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Verified</span>}
            </label>
            <input type="text" className="sd-input-v3 font-mono uppercase" placeholder="e.g. 12345 (State Medical Council)" value={entityData.registrationNumber || ""} onChange={e => updateField('registrationNumber', e.target.value)} />
          </div>
          <div>
            <label className="sd-label-v3">Marital Status</label>
            <select className="sd-input-v3" value={entityData.maritalStatus || ""} onChange={e => updateField('maritalStatus', e.target.value)}>
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
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
                  <SmartEntitySearch 
                    category="Medical College"
                    placeholder="Search Universities..."
                    value={q.institution || ""}
                    onChangeText={(text) => handleArrayUpdate('qualificationsList', idx, 'institution', text)}
                    onSelectEntity={(id, name) => handleArrayUpdate('qualificationsList', idx, 'collegeId', id)}
                  />
                  {q.collegeId && <p className="text-[10px] text-emerald-600 mt-1 font-bold flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg> Linked to Directory</p>}
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
                  <SmartEntitySearch 
                    category="Hospital"
                    placeholder="Search Hospitals..."
                    value={exp.hospital || ""}
                    onChangeText={(text) => handleArrayUpdate('experiences', idx, 'hospital', text)}
                    onSelectEntity={(id, name) => handleArrayUpdate('experiences', idx, 'hospitalId', id)}
                  />
                  {exp.hospitalId && <p className="text-[10px] text-emerald-600 mt-1 font-bold flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg> Linked to Directory</p>}
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

        <div className="pt-8 border-t border-slate-200/60">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Research & Publications</h3>
          {research.map((res: any, idx: number) => (
            <div key={idx} className="bg-white/50 p-6 rounded-2xl border border-slate-200 mb-4 relative">
              <button onClick={() => removeArrayItem('research', idx)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 font-bold">Remove</button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="sd-label-v3 text-xs">Title of Paper/Research</label>
                  <input type="text" className="sd-input-v3 py-3" placeholder="e.g. Advances in Cardiology" value={res.title || ""} onChange={e => handleArrayUpdate('research', idx, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="sd-label-v3 text-xs">Journal / Publication</label>
                  <input type="text" className="sd-input-v3 py-3" placeholder="e.g. The Lancet" value={res.journal || ""} onChange={e => handleArrayUpdate('research', idx, 'journal', e.target.value)} />
                </div>
                <div>
                  <label className="sd-label-v3 text-xs">Year</label>
                  <input type="text" className="sd-input-v3 py-3" placeholder="e.g. 2021" value={res.year || ""} onChange={e => handleArrayUpdate('research', idx, 'year', e.target.value)} />
                </div>
                <div>
                  <label className="sd-label-v3 text-xs">Link (Optional)</label>
                  <input type="text" className="sd-input-v3 py-3" placeholder="https://..." value={res.link || ""} onChange={e => handleArrayUpdate('research', idx, 'link', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => addArrayItem('research')} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-5 py-3 rounded-xl transition-colors">+ Add Research</button>
        </div>

        <div className="pt-8 border-t border-slate-200/60">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Awards & Recognitions</h3>
          {awards.map((aw: any, idx: number) => (
            <div key={idx} className="bg-amber-50/30 p-6 rounded-2xl border border-amber-200/50 mb-4 relative">
              <button onClick={() => removeArrayItem('awards', idx)} className="absolute top-4 right-4 text-amber-400 hover:text-rose-500 font-bold">Remove</button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="sd-label-v3 text-xs text-amber-900">Award Title</label>
                  <input type="text" className="sd-input-v3 py-3 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20" placeholder="e.g. Best Doctor Award" value={aw.title || ""} onChange={e => handleArrayUpdate('awards', idx, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="sd-label-v3 text-xs text-amber-900">Issuing Organization</label>
                  <input type="text" className="sd-input-v3 py-3 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20" placeholder="e.g. IMA" value={aw.organization || ""} onChange={e => handleArrayUpdate('awards', idx, 'organization', e.target.value)} />
                </div>
                <div>
                  <label className="sd-label-v3 text-xs text-amber-900">Year</label>
                  <input type="text" className="sd-input-v3 py-3 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20" placeholder="e.g. 2022" value={aw.year || ""} onChange={e => handleArrayUpdate('awards', idx, 'year', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => addArrayItem('awards')} className="text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-5 py-3 rounded-xl transition-colors">+ Add Award</button>
        </div>

        <div className="pt-8 border-t border-slate-200/60">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Media Gallery (Up to 10 Images)</h3>
            <label className="text-sm font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-4 py-2 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2">
              {uploadingGallery ? (
                <><span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span> Uploading...</>
              ) : (
                <><span>+</span> Add Gallery Images</>
              )}
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} disabled={uploadingGallery} />
            </label>
          </div>
          <div className="flex flex-wrap gap-4">
            {gallery.map((img: string, idx: number) => (
              <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                <button onClick={() => removeStringArrayItem('galleryImages', idx)} className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs shadow-md">×</button>
              </div>
            ))}
            {gallery.length === 0 && !uploadingGallery && (
              <p className="text-sm text-slate-400 italic">No gallery images uploaded yet.</p>
            )}
          </div>
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

  if (activeTab === "consultation_setup") {
    return (
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Consultation Services</h2>
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

  if (activeTab === "location") {
    const timings = Array.isArray(entityData.clinicTimings) ? entityData.clinicTimings : [];
    
    return (
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Clinic Location & Timings</h2>
          <p className="text-slate-500 font-medium text-lg">Define where patients can visit you and your operating hours.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-2">
            <label className="sd-label-v3">Clinic / Hospital Name</label>
            <input type="text" className="sd-input-v3" placeholder="e.g. Sanjivani Hospital" value={entityData.clinicName || ""} onChange={e => updateField('clinicName', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="sd-label-v3">Full Address</label>
            <textarea rows={3} className="sd-input-v3 resize-none" placeholder="Enter complete address..." value={entityData.address || ""} onChange={e => updateField('address', e.target.value)} />
          </div>
          <div>
            <label className="sd-label-v3">City</label>
            <input type="text" className="sd-input-v3" placeholder="e.g. Bhubaneswar" value={entityData.city || ""} onChange={e => updateField('city', e.target.value)} />
          </div>
          <div>
            <label className="sd-label-v3">District</label>
            <input type="text" className="sd-input-v3" placeholder="e.g. Khordha" value={entityData.district || ""} onChange={e => updateField('district', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="sd-label-v3">Google Maps Embed URL</label>
            <input type="text" className="sd-input-v3 font-mono text-sm" placeholder="https://maps.google.com/..." value={entityData.mapUrl || ""} onChange={e => updateField('mapUrl', e.target.value)} />
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/60">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Clinic Timings (Split Shifts)</h3>
          {timings.map((tm: any, idx: number) => (
            <div key={idx} className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 mb-4 relative">
              <button onClick={() => removeArrayItem('clinicTimings', idx)} className="absolute top-4 right-4 text-indigo-400 hover:text-rose-500 font-bold">Remove</button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="sd-label-v3 text-xs text-indigo-900">Day(s)</label>
                  <input type="text" className="sd-input-v3 py-3 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400/20" placeholder="e.g. Mon-Sat" value={tm.day || ""} onChange={e => handleArrayUpdate('clinicTimings', idx, 'day', e.target.value)} />
                </div>
                <div>
                  <label className="sd-label-v3 text-xs text-indigo-900">Morning Shift</label>
                  <input type="text" className="sd-input-v3 py-3 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400/20" placeholder="e.g. 9AM - 1PM" value={tm.morningShift || ""} onChange={e => handleArrayUpdate('clinicTimings', idx, 'morningShift', e.target.value)} />
                </div>
                <div>
                  <label className="sd-label-v3 text-xs text-indigo-900">Evening Shift</label>
                  <input type="text" className="sd-input-v3 py-3 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400/20" placeholder="e.g. 5PM - 9PM" value={tm.eveningShift || ""} onChange={e => handleArrayUpdate('clinicTimings', idx, 'eveningShift', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => addArrayItem('clinicTimings')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-100 px-5 py-3 rounded-xl transition-colors">+ Add Timings Shift</button>
        </div>
      </div>
    );
  }

  if (activeTab === "bank_details") {
    return (
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Bank & Payouts</h2>
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

  if (activeTab === "staff") {
    const staffList = Array.isArray(entityData.staff) ? entityData.staff : [];
    
    return (
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Staff & Receptionists</h2>
          <p className="text-slate-500 font-medium text-lg">Add your clinic staff so they can manage the Live Queue and Vitals on your behalf.</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
             <h3 className="text-lg font-bold text-slate-800">Authorized Staff</h3>
             <button onClick={() => addArrayItem('staff')} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-teal-200">
               + Add Staff Member
             </button>
           </div>
           
           <div className="p-6 space-y-4">
             {staffList.map((st: any, idx: number) => (
               <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 relative group">
                 <button onClick={() => removeArrayItem('staff', idx)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                 </button>
                 
                 <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
                   <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Staff Name</label>
                     <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-teal-500 outline-none" placeholder="e.g. Ramesh" value={st.name || ""} onChange={e => handleArrayUpdate('staff', idx, 'name', e.target.value)} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number (Login ID)</label>
                     <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-teal-500 outline-none" placeholder="10-digit mobile" value={st.phone || ""} onChange={e => handleArrayUpdate('staff', idx, 'phone', e.target.value)} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Role</label>
                     <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-teal-500 outline-none" value={st.role || ""} onChange={e => handleArrayUpdate('staff', idx, 'role', e.target.value)}>
                       <option value="">Select Role...</option>
                       <option value="Receptionist">Receptionist (Queue Only)</option>
                       <option value="Nurse">Nurse (Vitals + Queue)</option>
                       <option value="Clinic Manager">Clinic Manager (Full Access)</option>
                     </select>
                   </div>
                 </div>
               </div>
             ))}
             {staffList.length === 0 && (
               <div className="text-center py-8">
                 <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                 </div>
                 <p className="text-slate-500 font-medium">No staff members added yet.</p>
                 <p className="text-xs text-slate-400 mt-1">Staff will use their phone number to log in to the OS.</p>
               </div>
             )}
           </div>
        </div>
      </div>
    );
  }

  if (activeTab === "bank_details") {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Bank & Payout Details</h3>
        
        <div className="mb-8 bg-emerald-50 border border-emerald-200 p-6 rounded-2xl">
          <h4 className="text-emerald-800 font-bold mb-2">Payouts Information</h4>
          <p className="text-sm text-emerald-700">DehaPa will deposit all online telemedicine payments directly into this bank account. Please ensure the account name matches your registered legal entity or personal name.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
              Account Holder Name
            </label>
            <input 
              type="text" 
              value={entityData.bankAccountName || ''}
              onChange={e => updateField('bankAccountName', e.target.value)}
              placeholder="e.g. Dr. Rajesh Kumar"
              className="w-full bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl px-5 py-3.5 shadow-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
              Bank Name
            </label>
            <input 
              type="text" 
              value={entityData.bankName || ''}
              onChange={e => updateField('bankName', e.target.value)}
              placeholder="e.g. HDFC Bank"
              className="w-full bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl px-5 py-3.5 shadow-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
              Account Number
            </label>
            <input 
              type="text" 
              value={entityData.bankAccountNumber || ''}
              onChange={e => updateField('bankAccountNumber', e.target.value)}
              placeholder="14-digit Account No."
              className="w-full bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl px-5 py-3.5 shadow-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
              IFSC Code
            </label>
            <input 
              type="text" 
              value={entityData.bankIfscCode || ''}
              onChange={e => updateField('bankIfscCode', e.target.value.toUpperCase())}
              placeholder="e.g. HDFC0001234"
              className="w-full bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl px-5 py-3.5 shadow-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
