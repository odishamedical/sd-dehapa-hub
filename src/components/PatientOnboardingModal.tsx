import React, { useState } from 'react';

interface PatientOnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: { phone: string; whatsappNumber: string }) => void;
  onSkip: () => void;
}

export default function PatientOnboardingModal({ isOpen, onComplete, onSkip }: PatientOnboardingModalProps) {
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ phone, whatsappNumber: sameAsPhone ? phone : whatsappNumber });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 p-6 border-b border-white/40">
          <h2 className="text-2xl font-serif font-bold text-slate-900">Complete Your Profile</h2>
          <p className="text-sm text-slate-600 mt-1">
            To book appointments and contact doctors, we need your verified phone numbers.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">Phone Number</label>
            <input 
              type="tel" 
              required 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-teal-500/20 outline-none transition-all placeholder:text-slate-400" 
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
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest flex items-center gap-2">
                WhatsApp Number
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </label>
              <input 
                type="tel" 
                required={!sameAsPhone}
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-teal-500/20 outline-none transition-all placeholder:text-slate-400" 
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
              Do it later
            </button>
            <button 
              type="submit" 
              disabled={phone.length < 10}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold hover:from-teal-700 hover:to-cyan-700 shadow-md shadow-teal-900/20 transition-all disabled:opacity-50"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
