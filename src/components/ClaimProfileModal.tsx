import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Phone, UploadCloud } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ClaimModalProps {
  entityId: string;
  entityName: string;
  onClose: () => void;
}

export default function ClaimProfileModal({ entityId, entityName, onClose }: ClaimModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'profile_claims'), {
        entityId,
        entityName,
        claimantName: name,
        claimantRole: role,
        email,
        phone,
        fileName: file ? file.name : null,
        status: 'pending_review',
        timestamp: serverTimestamp()
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit claim", err);
      alert("Failed to submit claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-[#0A1128]/95 backdrop-blur-2xl rounded-[2rem] p-8 max-w-md w-full shadow-[0_0_50px_rgba(20,184,166,0.15)] border border-white/10 relative text-center">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-20 h-20 bg-teal-500/20 border border-teal-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
            <ShieldCheck className="w-10 h-10 text-teal-400" />
          </div>
          
          <h2 className="text-3xl font-black text-white mb-4">Claim Submitted!</h2>
          <p className="text-slate-300 mb-8 font-medium">
            Thank you for claiming <strong className="text-teal-400">{entityName}</strong>. 
            Our verification team will review your details and contact you shortly to complete the onboarding process.
          </p>
          
          <button onClick={onClose} className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-xl shadow-lg transition-colors tracking-widest uppercase border border-white/10">
            Return to Profile
          </button>
        </div>
      </div>
    );
  }

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

        <p className="text-sm text-slate-300 mb-8 font-medium">
          Verify your identity to take control of this profile, update your services, and receive direct patient bookings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Your Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-teal-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-500"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Your Role</label>
              <input 
                type="text" 
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-teal-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-500"
                placeholder="E.g. Manager, Owner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Official Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-teal-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-500"
                placeholder="name@hospital.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">WhatsApp Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="tel" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-teal-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-500"
                placeholder="Required for verification"
              />
            </div>
          </div>

          <label className="bg-white/5 border border-dashed border-white/20 rounded-xl p-4 flex items-center justify-center gap-3 mt-4 cursor-pointer hover:bg-white/10 transition-colors">
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <UploadCloud className="w-5 h-5 text-teal-400 shrink-0" />
            <span className="text-sm font-bold text-slate-300 truncate">
              {file ? file.name : 'Upload ID / License (Optional)'}
            </span>
          </label>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 disabled:opacity-50 text-white font-black tracking-widest uppercase text-[13px] py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-6 border-none"
          >
            {isSubmitting ? 'Submitting Claim...' : 'Submit Verification Claim'}
          </button>
        </form>
      </div>
    </div>
  );
}
