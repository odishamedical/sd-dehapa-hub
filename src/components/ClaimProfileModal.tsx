import React, { useState } from 'react';
import { X, ShieldCheck, Stethoscope, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClaimModalProps {
  entityId: string;
  entityName: string;
  onClose: () => void;
}

export default function ClaimProfileModal({ entityId, entityName, onClose }: ClaimModalProps) {
  const router = useRouter();
  const [medicalReg, setMedicalReg] = useState('');
  const [phone, setPhone] = useState('');

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicalReg.trim()) return;
    
    // Redirect to Auth Center / Login with the exact document ID and verification details
    router.push(`/login?claim=${entityId}&regNo=${encodeURIComponent(medicalReg)}&phone=${encodeURIComponent(phone)}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-[#0A1128]/95 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(20,184,166,0.15)] border border-white/10 relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-3.5 rounded-2xl border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.2)] shrink-0">
            <ShieldCheck className="w-7 h-7 text-teal-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Claim Profile</h2>
            <p className="text-teal-400 font-bold text-sm truncate pr-4">{entityName}</p>
          </div>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
           <Stethoscope className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
           <p className="text-xs text-orange-200 font-medium leading-relaxed">
             For security purposes, you must provide your valid Medical Registration or License Number to claim this healthcare profile.
           </p>
        </div>

        <form onSubmit={handleProceed} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Medical Registration No. (MCI / NMC)</label>
            <input 
              type="text" 
              required
              value={medicalReg}
              onChange={(e) => setMedicalReg(e.target.value)}
              className="w-full bg-[#111A3A] border-2 border-[#1E2954] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-teal-500 focus:bg-[#152044] transition-colors font-medium placeholder:text-slate-600"
              placeholder="e.g. 12345/2010"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Registered Phone Number</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#111A3A] border-2 border-[#1E2954] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-teal-500 focus:bg-[#152044] transition-colors font-medium placeholder:text-slate-600"
              placeholder="+91"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center gap-2 mt-4"
          >
            Proceed to Verification <ChevronRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
