"use client";

import React, { useState, useEffect } from "react";
import { X, Building2, Briefcase, Upload, Image as ImageIcon } from "lucide-react";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { jobsCollection, Job } from "@/lib/jobs";
import Image from "next/image";
import { EMPLOYER_TYPES, JOB_ROLES_MAP } from "./jobRoles";

interface PostJobModalProps {
  onClose: () => void;
  profile: any; // User Profile
  onSuccess: () => void;
}

const COMMON_SKILLS = [
  "Patient Care", "BLS / CPR", "ICU Management", "Medical Billing",
  "Pharmacy Inventory", "Phlebotomy", "Diagnostic Imaging",
  "Sales & Marketing", "Healthcare Administration", "Emergency Response"
];

const COMMON_BENEFITS = [
  "Health Insurance", "Paid Leave", "Provident Fund (PF)",
  "Travel Allowance", "Accommodation Provided", "Food Allowance",
  "Flexible Shifts", "Performance Bonus"
];

export default function PostJobModal({ onClose, profile, onSuccess }: PostJobModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  
  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

  // Form State
  const [formData, setFormData] = useState({
    // Page 1
    shopName: profile?.companyName || profile?.name || "",
    industry: "", // Employer Type
    companyWebsite: "",
    companyAddress: profile?.address || "",
    contactName: profile?.name || "",
    contactEmail: profile?.email || "",
    contactPhone: profile?.phone || "",
    contactWhatsapp: "",
    // Page 2
    title: "", // Job Role
    customTitle: "", // For "Other" role
    jobType: "Full-time",
    location: "",
    salaryRange: "",
    experience: "",
    qualification: "",
    skillsRequired: [] as string[],
    vacancies: 1,
    deadline: "",
    // Page 3
    description: "",
    keyResponsibilities: "",
    benefits: [] as string[],
    workSchedule: "Day Shift",
    additionalNotes: ""
  });

  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState("");

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'skillsRequired' | 'benefits', item: string) => {
    const current = formData[field];
    if (current.includes(item)) {
      updateForm(field, current.filter(i => i !== item));
    } else {
      updateForm(field, [...current, item]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCompanyLogoFile(file);
      setCompanyLogoPreview(URL.createObjectURL(file));
    }
  };

  const validateStep = (step: number) => {
    setErrorMsg("");
    if (step === 1) {
      if (!formData.shopName || !formData.industry || !formData.contactEmail || !formData.contactPhone) {
         setErrorMsg("Please fill all mandatory company details.");
         return false;
      }
    }
    if (step === 2) {
      if (!formData.title || !formData.location || !formData.deadline) {
         setErrorMsg("Please fill Job Title, Location, and Deadline.");
         return false;
      }
      if (formData.title === "Other" && !formData.customTitle) {
         setErrorMsg("Please specify the custom job title.");
         return false;
      }
    }
    if (step === 3) {
      if (!formData.description) {
         setErrorMsg("Please provide a Job Description.");
         return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (previewMode) setPreviewMode(false);
    else setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!companyLogoFile && !companyLogoPreview) {
      setErrorMsg("Company Logo is required.");
      setPreviewMode(false);
      setCurrentStep(1);
      return;
    }
    setSubmitting(true);
    try {
      let logoUrl = companyLogoPreview;
      if (companyLogoFile) {
        const imageRef = ref(storage, `dehapa_job_logos/${profile.id}_${Date.now()}`);
        await uploadBytes(imageRef, companyLogoFile);
        logoUrl = await getDownloadURL(imageRef);
      }
      
      const finalTitle = formData.title === "Other" ? formData.customTitle : formData.title;

      const jobData: Job = {
        shopId: isAdmin ? 'platform' : profile.id,
        shopName: formData.shopName,
        companyLogo: logoUrl,
        industry: formData.industry,
        companyWebsite: formData.companyWebsite,
        companyAddress: formData.companyAddress,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        contactWhatsapp: formData.contactWhatsapp,
        
        title: finalTitle,
        jobType: formData.jobType as any,
        location: formData.location,
        salaryRange: formData.salaryRange,
        experience: formData.experience,
        qualification: formData.qualification,
        skillsRequired: formData.skillsRequired,
        vacancies: formData.vacancies,
        deadline: formData.deadline,
        
        description: formData.description,
        keyResponsibilities: formData.keyResponsibilities,
        benefits: formData.benefits,
        workSchedule: formData.workSchedule,
        additionalNotes: formData.additionalNotes,
        
        status: isAdmin ? "Active" : "Pending", // Admins skip approval
        isDraft: false,
        createdAt: serverTimestamp() as any
      };

      const newDocRef = doc(jobsCollection);
      await setDoc(newDocRef, jobData);

      onSuccess();
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to post job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic Job Roles based on selected Employer Type
  const availableRoles = formData.industry ? (JOB_ROLES_MAP[formData.industry] || []) : [];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-4xl bg-slate-900 border border-teal-500/30 rounded-[32px] overflow-hidden relative shadow-[0_0_50px_rgba(20,184,166,0.15)] flex flex-col my-8`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-slate-900/90 backdrop-blur-md z-20">
          <h2 className="text-[28px] font-black text-white tracking-tight">
            {previewMode ? "Preview Job Post" : "Post a Medical Job"}
          </h2>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 text-white flex-1 overflow-y-auto min-h-[500px]">
          
          {!previewMode && (
            <div className="mb-8 relative z-10 max-w-md mx-auto">
              <div className="flex justify-between items-center relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -z-10 -translate-y-1/2 rounded-full"></div>
                <div className={`absolute top-1/2 left-0 h-1 bg-teal-500 -z-10 -translate-y-1/2 transition-all duration-300 rounded-full`} style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
                {[1,2,3].map(step => (
                  <div key={step} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${currentStep >= step ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.5)] border-0' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-950/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm text-center font-bold">
              {errorMsg}
            </div>
          )}

          {/* PREVIEW MODE */}
          {previewMode ? (
            <div className="space-y-8 animate-in fade-in">
              <div className="p-8 bg-slate-800/50 rounded-2xl border border-white/5">
                 <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 bg-white/5 rounded-xl border border-white/10 overflow-hidden relative">
                      {companyLogoPreview ? <Image src={companyLogoPreview} alt="Logo" fill className="object-cover"/> : <ImageIcon className="w-8 h-8 m-auto mt-8 text-slate-500"/>}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-teal-400">{formData.title === "Other" ? formData.customTitle : formData.title}</h1>
                      <p className="text-xl text-slate-300">{formData.shopName}</p>
                      <p className="text-sm text-slate-400">{formData.location} &bull; {formData.jobType}</p>
                    </div>
                 </div>
                 {/* Preview details... */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
                   <div className="bg-white/5 p-3 rounded-lg border border-white/10"><span className="opacity-50 block text-xs">Salary</span>{formData.salaryRange || 'Not disclosed'}</div>
                   <div className="bg-white/5 p-3 rounded-lg border border-white/10"><span className="opacity-50 block text-xs">Experience</span>{formData.experience || 'Any'}</div>
                   <div className="bg-white/5 p-3 rounded-lg border border-white/10"><span className="opacity-50 block text-xs">Vacancies</span>{formData.vacancies}</div>
                   <div className="bg-white/5 p-3 rounded-lg border border-white/10"><span className="opacity-50 block text-xs">Apply By</span>{formData.deadline}</div>
                 </div>
                 <div>
                   <h3 className="font-bold text-lg mb-2 text-white">Job Description</h3>
                   <p className="whitespace-pre-wrap text-slate-300">{formData.description}</p>
                 </div>
                 <div className="mt-6">
                   <h3 className="font-bold text-lg mb-2 text-white">Required Skills</h3>
                   <div className="flex flex-wrap gap-2">
                     {formData.skillsRequired.map(s => <span key={s} className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold border border-teal-500/30">{s}</span>)}
                   </div>
                 </div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-4 rounded-xl text-sm text-center">
                 Your contact details (Email, Phone, WhatsApp) will remain hidden from the public and are for administrative use only.
                 {!isAdmin && " Your job post will require Admin approval before going live."}
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Company Details */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-8">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white"><Building2 className="w-5 h-5 text-teal-400"/> Employer Details</h2>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <label className="w-32 h-32 shrink-0 border-2 border-dashed border-teal-500/50 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        {companyLogoPreview ? (
                          <Image src={companyLogoPreview} alt="Preview" fill className="object-cover" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-teal-500 group-hover:scale-110 transition-transform mb-2" />
                            <span className="text-xs font-bold text-center px-2 text-slate-300">Upload Logo</span>
                          </>
                        )}
                    </label>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Employer Type *</label>
                        <select value={formData.industry} onChange={e=>updateForm('industry', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-xl px-4 py-3 appearance-none">
                          <option value="">Select Employer Type...</option>
                          {EMPLOYER_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Company / Hospital Name *</label>
                        <input type="text" value={formData.shopName} onChange={e=>updateForm('shopName', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-xl px-4 py-3" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Full Address</label>
                        <input type="text" value={formData.companyAddress} onChange={e=>updateForm('companyAddress', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-xl px-4 py-3" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold border-t border-white/10 pt-6 text-teal-400">Private Contact Info (Hidden from Public)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Contact Person *</label>
                      <input type="text" value={formData.contactName} onChange={e=>updateForm('contactName', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-xl px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Email *</label>
                      <input type="email" value={formData.contactEmail} onChange={e=>updateForm('contactEmail', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-xl px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Phone *</label>
                      <input type="tel" value={formData.contactPhone} onChange={e=>updateForm('contactPhone', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-xl px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">WhatsApp</label>
                      <input type="tel" value={formData.contactWhatsapp} onChange={e=>updateForm('contactWhatsapp', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-xl px-4 py-3" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Job Information */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-8">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white"><Briefcase className="w-5 h-5 text-teal-400"/> Role Information</h2>
                  
                  {/* Dynamic Dropdown Logic */}
                  {!formData.industry && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-3 rounded-lg text-sm mb-4">
                      Please go back and select an Employer Type first.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Job Role *</label>
                      <select 
                        disabled={!formData.industry}
                        value={formData.title} 
                        onChange={e=>updateForm('title', e.target.value)} 
                        className="w-full bg-slate-950/50 border border-white/10 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-xl px-4 py-3 appearance-none disabled:opacity-50"
                      >
                        <option value="">Select a Role...</option>
                        {availableRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                        <option value="Other">Other (Custom Role)</option>
                      </select>
                    </div>

                    {formData.title === "Other" && (
                      <div className="animate-in slide-in-from-top-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-2">Custom Job Title *</label>
                        <input type="text" placeholder="e.g. Specialized ICU Nurse" value={formData.customTitle} onChange={e=>updateForm('customTitle', e.target.value)} className="w-full bg-slate-950/50 border border-teal-500/50 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-xl px-4 py-3 shadow-[0_0_15px_rgba(20,184,166,0.1)]" />
                      </div>
                    )}

                    <div className={formData.title === "Other" ? "md:col-span-2" : ""}>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Job Type</label>
                      <select value={formData.jobType} onChange={e=>updateForm('jobType', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-xl px-4 py-3 appearance-none">
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Location (City or Remote) *</label>
                      <input type="text" value={formData.location} onChange={e=>updateForm('location', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-xl px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Salary Range</label>
                      <input type="text" placeholder="e.g. ₹20k - ₹35k / month" value={formData.salaryRange} onChange={e=>updateForm('salaryRange', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-xl px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Application Deadline *</label>
                      <input type="date" value={formData.deadline} onChange={e=>updateForm('deadline', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-xl px-4 py-3" style={{colorScheme:'dark'}} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Skills Required</label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_SKILLS.map(skill => (
                        <button key={skill} onClick={() => toggleArrayItem('skillsRequired', skill)} className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${formData.skillsRequired.includes(skill) ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Job Description */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-8">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-teal-400"/> Detailed Description</h2>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Full Job Description *</label>
                    <textarea rows={5} value={formData.description} onChange={e=>updateForm('description', e.target.value)} className="w-full bg-slate-950/50 border border-white/10 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-xl px-4 py-3 custom-scrollbar" placeholder="Describe the role..."></textarea>
                  </div>

                  <div className="mt-4">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Benefits Offered</label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_BENEFITS.map(benefit => (
                        <button key={benefit} onClick={() => toggleArrayItem('benefits', benefit)} className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${formData.benefits.includes(benefit) ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                          {benefit}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-white/10 bg-slate-900/90 backdrop-blur-md flex justify-between items-center z-20">
          <div>
             {currentStep > 1 && !previewMode && (
               <button onClick={prevStep} className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm">
                 Back
               </button>
             )}
             {previewMode && (
               <button onClick={() => setPreviewMode(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm">
                 Edit Form
               </button>
             )}
          </div>
          <div>
            {!previewMode ? (
              currentStep < 3 ? (
                <button onClick={nextStep} className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 text-sm">
                  Next Step
                </button>
              ) : (
                <button onClick={() => { if(validateStep(3)) setPreviewMode(true); }} className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 text-sm">
                  Review Post
                </button>
              )
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 text-sm disabled:opacity-50">
                {submitting ? "Posting..." : isAdmin ? "Post Job Instantly" : "Submit for Approval"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
