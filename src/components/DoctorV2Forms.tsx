"use client";

import React, { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PremiumSlugModal from '@/components/PremiumSlugModal';
import SmartEntitySearch from '@/components/SmartEntitySearch';
import AddressBlock from '@/components/AddressBlock';
import UniversalPersonalForm from '@/components/UniversalPersonalForm';
import ImageUpload from '@/components/ImageUpload';

interface DoctorV2FormsProps {
  activeTab: string;
  entityData: any;
  setEntityData: (data: any) => void;
}

export default function DoctorV2Forms({ activeTab, entityData, setEntityData }: DoctorV2FormsProps) {
  
  const [isSlugModalOpen, setIsSlugModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

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

  const handleGetGPSLocation = () => {
    if (typeof window === 'undefined') return;
    setGpsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEntityData({ 
            ...entityData, 
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude 
          });
          setGpsLoading(false);
        },
        (error) => {
          console.error("GPS error", error);
          alert("Could not retrieve GPS coordinates. Please check your browser permissions.");
          setGpsLoading(false);
        }
      );
    } else {
      alert("Location services are not supported by your browser.");
      setGpsLoading(false);
    }
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
          <h3 className="text-xl font-bold text-slate-200 mb-6">Qualifications & Education</h3>
          {quals.map((q: any, idx: number) => (
            <div key={idx} className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 mb-4 relative">
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
          <h3 className="text-xl font-bold text-slate-200 mb-6">Work Experience</h3>
          {exps.map((exp: any, idx: number) => (
            <div key={idx} className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 mb-4 relative">
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
          <h3 className="text-xl font-bold text-slate-200 mb-6">Research & Publications</h3>
          {research.map((res: any, idx: number) => (
            <div key={idx} className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 mb-4 relative">
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
          <h3 className="text-xl font-bold text-slate-200 mb-6">Awards & Recognitions</h3>
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
            <h3 className="text-xl font-bold text-slate-200">Media Gallery (Up to 10 Images)</h3>
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
          <h3 className="text-xl font-bold text-slate-200 mb-6">Featured YouTube Videos (Up to 10)</h3>
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
              <h3 className="text-xl font-bold text-slate-200 flex items-center gap-3"><span className="text-3xl">🏥</span> Physical In-Clinic Visit</h3>
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
              <h3 className="text-xl font-bold text-slate-200 flex items-center gap-3"><span className="text-3xl">💻</span> Scheduled Video Call</h3>
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
            {/* Map and GPS Pinner (Village Friendly) */}
            <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-6 space-y-5">
              <div>
                <h4 className="font-bold text-sky-900 dark:text-white text-base mb-1">Set Location on Map</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  This maps your clinic location so patients can find you instantly. Use GPS or paste a Google Maps link.
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
                  {entityData.latitude ? "Update Pinned GPS Location" : "Pin My Current GPS Location"}
                </button>
                {entityData.latitude && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-500/10 px-3 py-1 rounded-lg">
                    📍 GPS Coordinates Pinned: {entityData.latitude.toFixed(5)}, {entityData.longitude?.toFixed(5)}
                  </span>
                )}
              </div>
              
              {entityData.latitude && entityData.longitude && (
                <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-700/50 shadow-inner">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={`https://maps.google.com/maps?q=${entityData.latitude},${entityData.longitude}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>
              )}

              <div className="pt-2 border-t border-sky-500/20">
                <label className="sd-label-v3 flex justify-between items-center">
                  <span>Or paste Google Map Pin URL</span>
                  <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline normal-case">Find Pin 📍</a>
                </label>
                <input 
                  type="url"
                  value={entityData.mapUrl || ''}
                  onChange={e => updateField('mapUrl', e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="sd-input-v3 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/60">
          <h3 className="text-xl font-bold text-slate-200 mb-6">Clinic Timings (Split Shifts)</h3>
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
            <input type="text" className="sd-input-v3" placeholder="As it appears on your bank account" value={entityData.bankAccountName || ""} onChange={e => updateField('bankAccountName', e.target.value)} />
          </div>
          <div>
            <label className="sd-label-v3">Bank Name</label>
            <input type="text" className="sd-input-v3" placeholder="e.g. HDFC Bank, SBI" value={entityData.bankName || ""} onChange={e => updateField('bankName', e.target.value)} />
          </div>
          <div>
            <label className="sd-label-v3">Account Number</label>
            <input type="password" placeholder="••••••••••••" className="sd-input-v3 font-mono" value={entityData.bankAccountNumber || ""} onChange={e => updateField('bankAccountNumber', e.target.value)} />
          </div>
          <div>
            <label className="sd-label-v3">IFSC Code</label>
            <input type="text" className="sd-input-v3 font-mono uppercase" placeholder="e.g. HDFC0001234" value={entityData.bankIfscCode || ""} onChange={e => updateField('bankIfscCode', e.target.value.toUpperCase())} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="sd-label-v3">UPI ID (Optional)</label>
            <input type="text" className="sd-input-v3" placeholder="e.g. doctor@upi" value={entityData.bankUpiId || ""} onChange={e => updateField('bankUpiId', e.target.value)} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">
              Cancelled Cheque Photo
            </label>
            <ImageUpload 
              defaultImage={entityData.cancelledChequeImage}
              onChange={(url) => updateField('cancelledChequeImage', url)}
            />
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
