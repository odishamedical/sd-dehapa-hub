import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PatientOnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: { phone: string; whatsappNumber: string; name: string; address: string }) => void;
  onSkip: () => void;
}

export default function PatientOnboardingModal({ isOpen, onComplete, onSkip }: PatientOnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Step 1: Phone
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);

  // Step 2: Details
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');

  // Step 3: Family Members (Simple counter for now to keep onboarding fast)
  const [familyCount, setFamilyCount] = useState(0);

  if (!isOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Finish onboarding
    setStep(4);
    
    // Save data in background
    onComplete({ 
      phone, 
      whatsappNumber: sameAsPhone ? phone : whatsappNumber,
      name: fullName,
      address: address
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* STEP 1: CONTACT INFO */}
        {step === 1 && (
          <>
            <div className="bg-teal-50 p-8 border-b border-teal-100 text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👋</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">Welcome to DehaPa!</h2>
              <p className="text-sm text-slate-600 mt-2">
                To book appointments and contact doctors securely, please verify your phone number.
              </p>
            </div>
            
            <form onSubmit={handlePhoneSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900" 
                  placeholder="+91 10-digit-number" 
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="sameAsPhone" 
                  checked={sameAsPhone}
                  onChange={(e) => setSameAsPhone(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <label htmlFor="sameAsPhone" className="text-sm font-medium text-slate-700">WhatsApp number is same as Phone number</label>
              </div>

              {!sameAsPhone && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">WhatsApp Number</label>
                  <input 
                    type="tel" 
                    required={!sameAsPhone}
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900" 
                    placeholder="+91 10-digit-number" 
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={onSkip}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Do it next time
                </button>
                <button 
                  type="submit" 
                  disabled={phone.length < 10}
                  className="flex-1 px-4 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP 2: DETAILS */}
        {step === 2 && (
          <>
            <div className="bg-teal-50 p-6 border-b border-teal-100">
              <h2 className="text-xl font-bold text-slate-900">Personal Details</h2>
              <p className="text-sm text-slate-600 mt-1">Help doctors know who you are.</p>
            </div>
            <form onSubmit={handleDetailsSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900" 
                  placeholder="e.g. Shyam Dash" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">City & State</label>
                <input 
                  type="text" 
                  required 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900" 
                  placeholder="e.g. Bhubaneswar, Odisha" 
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={onSkip} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                  Do it next time
                </button>
                <button type="submit" disabled={!fullName || !address} className="flex-1 px-4 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all disabled:opacity-50">
                  Continue
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP 3: FAMILY MEMBERS */}
        {step === 3 && (
          <>
            <div className="bg-teal-50 p-6 border-b border-teal-100">
              <h2 className="text-xl font-bold text-slate-900">Family Members</h2>
              <p className="text-sm text-slate-600 mt-1">Will you be booking appointments for anyone else?</p>
            </div>
            <form onSubmit={handleFamilySubmit} className="p-6 space-y-6">
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                <p className="text-sm text-slate-600 mb-4 font-medium">How many family members do you want to add to your profile?</p>
                <div className="flex items-center justify-center gap-6">
                  <button type="button" onClick={() => setFamilyCount(Math.max(0, familyCount - 1))} className="w-10 h-10 rounded-full bg-white border border-slate-300 text-slate-600 font-bold text-xl hover:bg-slate-100">-</button>
                  <span className="text-3xl font-black text-slate-900 w-8">{familyCount}</span>
                  <button type="button" onClick={() => setFamilyCount(Math.min(5, familyCount + 1))} className="w-10 h-10 rounded-full bg-white border border-slate-300 text-slate-600 font-bold text-xl hover:bg-slate-100">+</button>
                </div>
                {familyCount > 0 && (
                  <p className="text-xs text-teal-600 font-bold mt-4">You can fill in their names later from settings!</p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={onSkip} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                  Do it next time
                </button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all">
                  Finish Setup
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP 4: SUCCESS / UPSELL */}
        {step === 4 && (
          <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank you!</h2>
            <p className="text-slate-600 mb-8">
              You have completed all your details. You can now search our doctors and hospitals.
            </p>

            <div className="bg-slate-900 rounded-2xl p-6 text-left relative overflow-hidden mb-6">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl"></div>
              <h3 className="text-white font-bold text-lg mb-2 relative z-10">Are you a Healthcare Professional?</h3>
              <p className="text-slate-400 text-sm mb-4 relative z-10">Or do you represent a Hospital, Lab, or Pharmacy?</p>
              <button 
                onClick={() => router.push('/join')}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-colors relative z-10"
              >
                Join as a Service Provider
              </button>
            </div>

            <button 
              onClick={onSkip}
              className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              Go to Patient Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
