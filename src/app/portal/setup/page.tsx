"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Users, CheckCircle, ShieldCheck } from 'lucide-react';
import AddressBlock, { AddressData } from '@/components/AddressBlock';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export default function PatientSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    // If they already completed it, don't let them back in here
    if (localStorage.getItem("sd_current_user_profile_complete") === "true") {
      router.replace('/portal');
    } else {
      // Fetch draft data so they don't lose progress if they skipped
      const fetchDraft = async () => {
        try {
          const uid = localStorage.getItem("sd_current_user_uid");
          if (uid) {
            const snap = await getDoc(doc(db, 'users', uid));
            if (snap.exists()) {
              const data = snap.data();
              if (data.phone) setPhone(data.phone);
              if (data.whatsappNumber) {
                setWhatsappNumber(data.whatsappNumber);
                if (data.whatsappNumber !== data.phone) setSameAsPhone(false);
              }
              if (data.firstName) setFirstName(data.firstName);
              if (data.lastName) setLastName(data.lastName);
              if (data.address) setAddressData(prev => ({...prev, ...data.address}));
            }
          }
        } catch(e) {
          console.warn("Failed to fetch draft:", e);
        } finally {
          setIsLoadingDraft(false);
        }
      };
      fetchDraft();
    }
  }, [router]);

  // Step 1: Contact
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);

  // Step 2: Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [addressData, setAddressData] = useState<AddressData>({
    country: "India", state: "Odisha", district: "", block: "", city: "", pincode: "", localAddress: ""
  });

  // Step 3: Family
  const [familyCount, setFamilyCount] = useState(0);
  const [showFamilyForms, setShowFamilyForms] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<{firstName: string, lastName: string, age: string, sex: string}[]>([]);

  const handleFamilyCountChange = (newCount: number) => {
    setFamilyCount(newCount);
    if (newCount > familyMembers.length) {
      const additional = Array(newCount - familyMembers.length).fill({firstName: '', lastName: '', age: '', sex: ''});
      setFamilyMembers([...familyMembers, ...additional]);
    } else if (newCount < familyMembers.length) {
      setFamilyMembers(familyMembers.slice(0, newCount));
    }
  };

  const updateFamilyMember = (index: number, field: string, value: string) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const handleSkip = () => {
    router.replace('/portal');
  };

  const handleNextStep1 = async () => {
    setStep(2);
    try {
      const uid = localStorage.getItem("sd_current_user_uid");
      if (uid) {
        await updateDoc(doc(db, 'users', uid), {
          phone: phone,
          whatsappNumber: sameAsPhone ? phone : whatsappNumber
        });
      }
    } catch(e) { console.warn(e); }
  };

  const handleNextStep2 = async () => {
    setStep(3);
    try {
      const uid = localStorage.getItem("sd_current_user_uid");
      if (uid) {
        await updateDoc(doc(db, 'users', uid), {
          firstName: firstName,
          lastName: lastName,
          displayName: `${firstName} ${lastName}`.trim(),
          address: addressData
        });
      }
    } catch(e) { console.warn(e); }
  };

  const handleFinish = async () => {
    // Save to local storage to mark as complete
    localStorage.setItem("sd_current_user_profile_complete", "true");
    
    // Save to Firestore
    try {
        const uid = localStorage.getItem("sd_current_user_uid");
        if (uid) {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                phone: phone,
                whatsappNumber: sameAsPhone ? phone : whatsappNumber,
                firstName: firstName,
                lastName: lastName,
                displayName: `${firstName} ${lastName}`.trim(),
                familyMembers: familyMembers.slice(0, familyCount),
                address: addressData,
                isProfileComplete: true
            });
        }
    } catch(err) {
        console.error("Error saving setup data", err);
    }

    setStep(4);
  };

  if (!isMounted || isLoadingDraft) return null;

  return (
    <div className="min-h-screen bg-[#060B14] flex flex-col font-sans">
      <div className="flex-1 flex flex-col items-center pt-12 pb-16 px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Patient Onboarding
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-2">
            Welcome to DehaPa
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-lg mx-auto">
            Let's set up your secure medical profile so you can start booking appointments and managing your family's health.
          </p>
        </div>

        <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          
          {step < 4 && (
            <div className="flex border-b border-slate-800">
              <div className={`flex-1 py-4 text-center font-bold text-[10px] sm:text-xs tracking-widest uppercase transition-colors ${step === 1 ? 'bg-teal-500/10 text-teal-400 border-b-2 border-teal-500' : 'bg-transparent text-slate-500 hover:text-slate-400'}`}>
                1. Contact
              </div>
              <div className={`flex-1 py-4 text-center font-bold text-[10px] sm:text-xs tracking-widest uppercase transition-colors ${step === 2 ? 'bg-teal-500/10 text-teal-400 border-b-2 border-teal-500' : 'bg-transparent text-slate-500 hover:text-slate-400'}`}>
                2. Details
              </div>
              <div className={`flex-1 py-4 text-center font-bold text-[10px] sm:text-xs tracking-widest uppercase transition-colors ${step === 3 ? 'bg-teal-500/10 text-teal-400 border-b-2 border-teal-500' : 'bg-transparent text-slate-500 hover:text-slate-400'}`}>
                3. Family
              </div>
            </div>
          )}

          <div className="p-6 md:p-10">
            
            {/* STEP 1: CONTACT */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-teal-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Verify your Phone</h2>
                  <p className="text-slate-400 text-sm mt-1">Doctors use this to contact you regarding appointments.</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors font-medium text-white text-lg" 
                      placeholder="+91 10-digit-number" 
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                    <input 
                      type="checkbox" 
                      id="sameAsPhone" 
                      checked={sameAsPhone}
                      onChange={(e) => setSameAsPhone(e.target.checked)}
                      className="w-5 h-5 text-teal-500 rounded border-slate-600 focus:ring-teal-500 bg-slate-800"
                    />
                    <label htmlFor="sameAsPhone" className="text-sm font-bold text-slate-300 cursor-pointer">My WhatsApp number is exactly the same</label>
                  </div>

                  {!sameAsPhone && (
                    <div className="animate-in slide-in-from-top-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">WhatsApp Number</label>
                      <input 
                        type="tel" 
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors font-medium text-white text-lg" 
                        placeholder="+91 10-digit-number" 
                      />
                    </div>
                  )}

                  <div className="pt-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={handleSkip} className="w-full sm:w-1/3 px-4 py-4 rounded-xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-colors">
                      Skip for now
                    </button>
                    <button 
                      onClick={handleNextStep1}
                      disabled={phone.length < 10}
                      className="w-full sm:w-2/3 px-4 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold text-lg transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-50"
                    >
                      Continue to Details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DETAILS */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8">
                <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white font-bold text-sm mb-6 flex items-center gap-2 transition-colors">
                  &larr; Back to Phone
                </button>

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Personal Details</h2>
                  <p className="text-slate-400 text-sm mt-1">Help us find the best doctors in your exact area.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">First Name</label>
                      <input 
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors font-medium text-white text-lg" 
                        placeholder="e.g. Shyam" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Last Name</label>
                      <input 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors font-medium text-white text-lg" 
                        placeholder="e.g. Dash" 
                      />
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-800 pt-6">
                    <AddressBlock data={addressData} onChange={setAddressData} darkTheme={true} />
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row gap-3 border-t border-slate-800">
                    <button onClick={handleSkip} className="w-full sm:w-1/3 px-4 py-4 rounded-xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-colors">
                      Skip for now
                    </button>
                    <button 
                      onClick={handleNextStep2}
                      disabled={!firstName || !lastName || !addressData.city || !addressData.district}
                      className="w-full sm:w-2/3 px-4 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold text-lg transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-50"
                    >
                      Continue to Family
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: FAMILY */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-8">
                <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white font-bold text-sm mb-6 flex items-center gap-2 transition-colors">
                  &larr; Back to Details
                </button>

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Family Members</h2>
                  <p className="text-slate-400 text-sm mt-1">Will you be booking appointments for anyone else?</p>
                </div>

                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 text-center mb-8">
                  <p className="text-slate-300 font-bold mb-6">You can manage yourself + 6 family members.</p>
                  <div className="flex items-center justify-center gap-8">
                    <button onClick={() => handleFamilyCountChange(Math.max(0, familyCount - 1))} className="w-14 h-14 rounded-full bg-slate-800 border border-slate-600 text-slate-400 font-black text-2xl hover:border-teal-500 hover:text-teal-400 transition-colors shadow-sm">-</button>
                    <span className="text-5xl font-black text-white w-12">{familyCount}</span>
                    <button onClick={() => handleFamilyCountChange(Math.min(6, familyCount + 1))} className="w-14 h-14 rounded-full bg-slate-800 border border-slate-600 text-slate-400 font-black text-2xl hover:border-teal-500 hover:text-teal-400 transition-colors shadow-sm">+</button>
                  </div>
                  
                  {familyCount > 0 && !showFamilyForms && (
                    <div className="mt-8 flex flex-col gap-3 max-w-sm mx-auto animate-in fade-in">
                        <button onClick={() => setShowFamilyForms(true)} className="w-full py-3 bg-teal-500/20 text-teal-400 rounded-xl font-bold border border-teal-500/30 hover:bg-teal-500/30 transition-colors shadow-sm">
                            Fill out member details now
                        </button>
                        <button onClick={handleFinish} className="w-full py-3 bg-slate-800 text-slate-400 rounded-xl font-bold border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors">
                            Skip and do this later in settings
                        </button>
                    </div>
                  )}

                  {showFamilyForms && familyCount > 0 && (
                    <div className="space-y-6 mt-8 text-left animate-in fade-in slide-in-from-top-4">
                        {familyMembers.slice(0, familyCount).map((member, index) => (
                            <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                <h4 className="text-white font-bold mb-3 text-sm tracking-widest uppercase">Family Member {index + 1}</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <input placeholder="First Name" value={member.firstName} onChange={e => updateFamilyMember(index, 'firstName', e.target.value)} className="col-span-2 sm:col-span-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-teal-500 text-sm" />
                                    <input placeholder="Last Name" value={member.lastName} onChange={e => updateFamilyMember(index, 'lastName', e.target.value)} className="col-span-2 sm:col-span-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-teal-500 text-sm" />
                                    <input placeholder="Age" type="number" value={member.age} onChange={e => updateFamilyMember(index, 'age', e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-teal-500 text-sm" />
                                    <select value={member.sex} onChange={e => updateFamilyMember(index, 'sex', e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-teal-500 text-sm">
                                        <option value="">Sex</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                  )}
                </div>

                {(!familyCount || showFamilyForms) && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={handleSkip} className="w-full sm:w-1/3 px-4 py-4 rounded-xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-colors">
                        Skip for now
                      </button>
                      <button 
                        onClick={handleFinish}
                        className="w-full sm:w-2/3 px-4 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-black text-lg uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                      >
                        Finish Setup
                      </button>
                    </div>
                )}
              </div>
            )}

            {/* STEP 4: SUCCESS / UPSELL */}
            {step === 4 && (
              <div className="text-center animate-in zoom-in-95 duration-500 py-8">
                <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Thank you!</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                  You have completed all your details. You can now securely search our doctors and hospitals.
                </p>

                <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 text-left relative overflow-hidden mb-8 shadow-2xl backdrop-blur-xl">
                  <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl"></div>
                  <h3 className="text-2xl font-black text-white mb-2 relative z-10">Are you a Healthcare Professional?</h3>
                  <p className="text-slate-400 mb-6 relative z-10">Or do you represent a Hospital, Lab, or Pharmacy?</p>
                  <button 
                    onClick={() => router.push('/join')}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 text-lg font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] relative z-10"
                  >
                    Join as a Service Provider
                  </button>
                </div>

                <button 
                  onClick={() => router.replace('/portal')}
                  className="w-full px-4 py-5 rounded-2xl bg-slate-800 text-white font-black text-lg uppercase tracking-widest hover:bg-slate-700 border border-slate-700 transition-colors shadow-lg"
                >
                  Go to Patient Dashboard &rarr;
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
