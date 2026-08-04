"use client";

import React, { useState, useRef } from "react";
import { CheckCircle2, ChevronRight, ChevronLeft, Upload, User, GraduationCap, Briefcase, Sparkles, Image as ImageIcon, MapPin, X, FileText } from "lucide-react";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { jobSeekersCollection } from "@/lib/jobs";
import Image from "next/image";
import AddressBlock, { AddressData } from "@/components/AddressBlock";

export default function MedicalSeekerWizard({ userUid, userEmail, onSuccess }: { userUid: string, userEmail: string, onSuccess: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // -- Form State --
  // Step 1
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  // Step 2 Address Block
  const [address, setAddress] = useState<AddressData>({
    country: "India",
    state: "",
    district: "",
    block: "",
    city: "",
    pincode: "",
    localAddress: ""
  });

  // Step 3
  const [primaryQualification, setPrimaryQualification] = useState("");
  const [institution, setInstitution] = useState("");
  const [passingYear, setPassingYear] = useState("");
  const [medicalRegNumber, setMedicalRegNumber] = useState("");
  const [medicalCouncil, setMedicalCouncil] = useState("");
  const [additionalCerts, setAdditionalCerts] = useState<string[]>([]);
  const [certInput, setCertInput] = useState("");

  const addCert = () => {
    if (certInput.trim() && !additionalCerts.includes(certInput.trim())) {
      setAdditionalCerts([...additionalCerts, certInput.trim()]);
      setCertInput("");
    }
  };
  const removeCert = (cert: string) => setAdditionalCerts(additionalCerts.filter(c => c !== cert));

  // Step 4
  const [workHistory, setWorkHistory] = useState([{ employer: "", role: "", duration: "", responsibilities: "" }]);
  const [isFresher, setIsFresher] = useState(false);
  const [totalExperience, setTotalExperience] = useState("");
  const [specialization, setSpecialization] = useState("");

  const addWork = () => setWorkHistory([...workHistory, { employer: "", role: "", duration: "", responsibilities: "" }]);
  const updateWork = (idx: number, field: string, val: string) => {
    const newWork = [...workHistory];
    newWork[idx] = { ...newWork[idx], [field]: val };
    setWorkHistory(newWork);
  };
  const removeWork = (idx: number) => setWorkHistory(workHistory.filter((_, i) => i !== idx));

  // Step 5
  const [preferredJobType, setPreferredJobType] = useState("Full-time");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [declaration, setDeclaration] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
         setCvFile(file);
      } else {
         alert("Please upload a PDF or DOCX file for your CV.");
      }
    }
  };

  const validateStep = (step: number) => {
    setErrorMsg("");
    if (step === 1) {
      if (!fullName || !dob || !phone) {
        setErrorMsg("Please fill all mandatory personal details.");
        return false;
      }
      if (!profileImageFile) {
        setErrorMsg("Profile photo is mandatory.");
        return false;
      }
    }
    if (step === 2) {
      if (address.country === 'India' && (!address.state || !address.district || !address.pincode)) {
        setErrorMsg("Please complete your address details including State, District, and Pincode.");
        return false;
      }
    }
    if (step === 3) {
      if (!primaryQualification || !institution || !passingYear) {
         setErrorMsg("Please fill all required education fields.");
         return false;
      }
    }
    if (step === 4 && !isFresher) {
      if (!totalExperience || !specialization) {
         setErrorMsg("Please provide your total experience and primary specialization.");
         return false;
      }
      if (workHistory.some(w => !w.employer || !w.role || !w.duration)) {
         setErrorMsg("Please fill all required work history fields or select Fresher.");
         return false;
      }
    }
    if (step === 5) {
      if (!cvFile) {
        setErrorMsg("Please upload your CV/Resume.");
        return false;
      }
      if (!declaration) {
        setErrorMsg("You must accept the declaration.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => setCurrentStep(currentStep - 1);

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setSubmitting(true);
    try {
      // 1. Upload Profile Image
      const imageRef = ref(storage, `dehapa_ats/profiles/${userUid}_${Date.now()}`);
      await uploadBytes(imageRef, profileImageFile!);
      const imageUrl = await getDownloadURL(imageRef);
      
      // 2. Upload CV
      const cvRef = ref(storage, `dehapa_ats/cvs/${userUid}_${Date.now()}_cv`);
      await uploadBytes(cvRef, cvFile!);
      const cvUrl = await getDownloadURL(cvRef);

      // 3. Save Data
      const seekerData = {
        uid: userUid,
        email: userEmail,
        fullName, dob, gender, phone, whatsapp,
        
        country: address.country,
        state: address.state,
        district: address.district,
        block: address.block,
        localAddress: address.localAddress,
        pincode: address.pincode,
        
        primaryQualification, institution, passingYear,
        medicalRegNumber, medicalCouncil, additionalCerts,
        
        isFresher, totalExperience: isFresher ? "0" : totalExperience, specialization,
        workHistory: isFresher ? [] : workHistory,
        
        preferredJobType, expectedSalary, preferredLocation,
        
        profileImage: imageUrl,
        cvFileUrl: cvUrl,
        declarationSigned: declaration,
        isLookingForJob: true,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(jobSeekersCollection, userUid), seekerData);
      onSuccess();

    } catch (e) {
      console.error(e);
      setErrorMsg("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-[32px] p-6 md:p-10 text-white bg-[#0a111a]/95 backdrop-blur-xl border border-slate-700 shadow-[0_0_50px_rgba(20,184,166,0.15)] relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-80 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-50 pointer-events-none"></div>
      
      <div className="mb-10 relative z-10">
        <h1 className="text-3xl font-bold text-center mb-2 font-serif text-white">Create Medical Profile</h1>
        <p className="text-center text-slate-400 text-sm">Join the Dehapa medical workforce network</p>
        <div className="flex justify-between items-center mt-8 relative max-w-2xl mx-auto">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -z-10 -translate-y-1/2 rounded-full"></div>
          <div className={`absolute top-1/2 left-0 h-1 bg-teal-500 -z-10 -translate-y-1/2 transition-all duration-300 rounded-full`} style={{ width: `${((currentStep - 1) / 4) * 100}%` }}></div>
          {[1,2,3,4,5].map(step => (
            <div key={step} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${currentStep >= step ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.6)] border-0' : 'bg-[#222] text-slate-500 border border-slate-700'}`}>
              {step}
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm text-center font-bold">
          {errorMsg}
        </div>
      )}

      <div className="min-h-[400px]">
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white"><User className="w-5 h-5 text-teal-400 drop-shadow-[0_0_5px_rgba(20,184,166,0.8)]"/> Personal Details</h2>
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className={`w-32 h-32 rounded-full border-2 ${profileImagePreview ? 'border-teal-400' : 'border-slate-600 border-dashed'} flex flex-col items-center justify-center overflow-hidden bg-slate-800/50 group`}>
                  {profileImagePreview ? (
                    <Image src={profileImagePreview} alt="Preview" fill className="object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-2 group-hover:text-teal-400 transition-colors" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase group-hover:text-teal-400 transition-colors">Upload Photo</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Full Name <span className="text-rose-500">*</span></label>
                <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Date of Birth <span className="text-rose-500">*</span></label>
                <input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3" style={{colorScheme: 'dark'}} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Gender <span className="text-rose-500">*</span></label>
                <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Phone Number <span className="text-rose-500">*</span></label>
                <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">WhatsApp Number</label>
                <input type="tel" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white"><MapPin className="w-5 h-5 text-teal-400 drop-shadow-[0_0_5px_rgba(20,184,166,0.8)]"/> Permanent Address</h2>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
               <AddressBlock value={address} onChange={setAddress} darkTheme={true} />
            </div>
          </div>
        )}

        {/* Step 3: Education & Medical Credentials */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white"><GraduationCap className="w-5 h-5 text-teal-400 drop-shadow-[0_0_5px_rgba(20,184,166,0.8)]"/> Education & Credentials</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Primary Qualification <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="e.g. MBBS, B.Sc Nursing, DMLT" value={primaryQualification} onChange={e=>setPrimaryQualification(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Institution / University <span className="text-rose-500">*</span></label>
                <input type="text" value={institution} onChange={e=>setInstitution(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Passing Year <span className="text-rose-500">*</span></label>
                <input type="number" placeholder="YYYY" value={passingYear} onChange={e=>setPassingYear(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
               <h3 className="text-sm font-bold text-slate-300 mb-4">Medical Registration (If Applicable)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Registration / License Number</label>
                   <input type="text" placeholder="e.g. 12345 (MCI/State Council)" value={medicalRegNumber} onChange={e=>setMedicalRegNumber(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Registration Council / Authority</label>
                   <input type="text" placeholder="e.g. Odisha Medical Council" value={medicalCouncil} onChange={e=>setMedicalCouncil(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3" />
                 </div>
               </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
               <h3 className="text-sm font-bold text-slate-300 mb-4">Additional Certifications (e.g. BLS, ACLS)</h3>
               <div className="flex gap-2 mb-4">
                 <input type="text" placeholder="Add certification..." value={certInput} onChange={e=>setCertInput(e.target.value)} onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); addCert(); } }} className="flex-1 bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 transition-all duration-300 rounded-[14px] px-4 py-3" />
                 <button onClick={addCert} className="bg-slate-800 hover:bg-slate-700 px-6 font-bold rounded-[14px] transition-colors">Add</button>
               </div>
               <div className="flex flex-wrap gap-2">
                 {additionalCerts.map((cert, i) => (
                   <div key={i} className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-300 px-3 py-1.5 rounded-full text-xs font-medium">
                     {cert}
                     <button onClick={() => removeCert(cert)} className="text-teal-500 hover:text-teal-300"><X size={14} /></button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* Step 4: Work History */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white"><Briefcase className="w-5 h-5 text-teal-400 drop-shadow-[0_0_5px_rgba(20,184,166,0.8)]"/> Experience & Specialization</h2>
            
            <label className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700 rounded-xl cursor-pointer hover:border-teal-500/50 transition-colors">
              <input type="checkbox" checked={isFresher} onChange={e => setIsFresher(e.target.checked)} className="w-5 h-5 accent-teal-500 rounded" />
              <div>
                <div className="font-bold text-white">I am a Fresher</div>
                <div className="text-xs text-slate-400">I do not have any prior medical work experience.</div>
              </div>
            </label>

            {!isFresher && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Total Experience (Years) <span className="text-rose-500">*</span></label>
                    <input type="number" placeholder="e.g. 5" value={totalExperience} onChange={e=>setTotalExperience(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Primary Specialization <span className="text-rose-500">*</span></label>
                    <input type="text" placeholder="e.g. ICU Nurse, Cardiology, Phlebotomist" value={specialization} onChange={e=>setSpecialization(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3" />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-700">
                  <h3 className="text-sm font-bold text-slate-300">Work History</h3>
                  {workHistory.map((work, idx) => (
                    <div key={idx} className="p-5 bg-slate-800/30 border border-slate-700 rounded-xl relative group">
                      <button onClick={() => removeWork(idx)} className="absolute top-4 right-4 text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={18} /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Hospital / Employer <span className="text-rose-500">*</span></label>
                          <input type="text" value={work.employer} onChange={e => updateWork(idx, 'employer', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Role / Designation <span className="text-rose-500">*</span></label>
                          <input type="text" value={work.role} onChange={e => updateWork(idx, 'role', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-teal-500 outline-none" />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Duration (e.g., 2018 - 2021) <span className="text-rose-500">*</span></label>
                        <input type="text" value={work.duration} onChange={e => updateWork(idx, 'duration', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-teal-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Key Responsibilities</label>
                        <textarea rows={2} value={work.responsibilities} onChange={e => updateWork(idx, 'responsibilities', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-teal-500 outline-none"></textarea>
                      </div>
                    </div>
                  ))}
                  <button onClick={addWork} className="text-teal-400 hover:text-teal-300 text-sm font-bold flex items-center gap-1">+ Add Previous Employer</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 5: Preferences & CV Upload */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white"><Sparkles className="w-5 h-5 text-teal-400 drop-shadow-[0_0_5px_rgba(20,184,166,0.8)]"/> Job Preferences & CV Upload</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Preferred Job Type</label>
                <select value={preferredJobType} onChange={e=>setPreferredJobType(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3">
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract / Locum</option>
                  <option>Night Shift</option>
                  <option>Freelance</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Expected Salary (₹)</label>
                <input type="text" placeholder="e.g. ₹20,000 / month" value={expectedSalary} onChange={e=>setExpectedSalary(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Preferred Location</label>
                <input type="text" placeholder="e.g. Bhubaneswar, Any in Odisha" value={preferredLocation} onChange={e=>setPreferredLocation(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 focus:bg-slate-900 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 rounded-[14px] outline-none px-4 py-3" />
              </div>
            </div>

            <div className="pt-6">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Upload CV / Resume (PDF) <span className="text-rose-500">*</span></label>
              <div className="relative">
                <div className={`w-full h-32 rounded-2xl border-2 ${cvFile ? 'border-teal-400 bg-teal-900/20' : 'border-slate-600 border-dashed bg-slate-800/50'} flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover:border-teal-400 transition-colors`}>
                  {cvFile ? (
                    <>
                      <FileText className="w-8 h-8 text-teal-400 mb-2" />
                      <span className="text-sm text-teal-300 font-bold truncate max-w-[80%]">{cvFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-teal-400 transition-colors" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase group-hover:text-teal-400 transition-colors">Click to Upload PDF</span>
                    </>
                  )}
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 mt-8 p-4 bg-teal-500/5 border border-teal-500/20 rounded-xl cursor-pointer hover:bg-teal-500/10 transition-colors">
              <input type="checkbox" checked={declaration} onChange={e => setDeclaration(e.target.checked)} className="w-5 h-5 mt-0.5 accent-teal-500 rounded" />
              <div className="text-xs text-slate-300 leading-relaxed">
                I hereby declare that all the information provided by me in this application is true and correct to the best of my knowledge and belief. I understand that any false information may result in the rejection of my application.
              </div>
            </label>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-10 pt-6 border-t border-slate-800">
        <button
          onClick={prevStep}
          disabled={currentStep === 1 || submitting}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        
        {currentStep < 5 ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-8 py-3 rounded-full font-bold bg-teal-500 text-white hover:bg-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all"
          >
            Next Step <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !declaration}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all ${declaration && !submitting ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] scale-105' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Complete Profile
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
