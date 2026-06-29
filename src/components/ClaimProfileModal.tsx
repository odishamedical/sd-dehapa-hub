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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
        <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative text-center">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-4">Claim Submitted!</h2>
          <p className="text-slate-600 mb-8 font-medium">
            Thank you for claiming <strong className="text-slate-900">{entityName}</strong>. 
            Our verification team will review your details and contact you shortly to complete the onboarding process.
          </p>
          
          <button onClick={onClose} className="w-full bg-[#0A1128] hover:bg-slate-800 text-white font-black py-4 rounded-xl shadow-lg transition-colors tracking-widest uppercase">
            Return to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Claim Profile</h2>
            <p className="text-emerald-600 font-bold text-sm truncate pr-4">{entityName}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6 font-medium">
          Verify your identity to take control of this profile, update your services, and receive direct patient bookings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Your Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Your Role</label>
              <input 
                type="text" 
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
                placeholder="E.g. Manager, Owner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Official Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
                placeholder="name@hospital.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Direct Contact</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="tel" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
                placeholder="Mobile number"
              />
            </div>
          </div>

          <label className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 flex items-center justify-center gap-3 mt-2 cursor-pointer hover:bg-slate-100 transition-colors">
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <UploadCloud className="w-5 h-5 text-slate-400 shrink-0" />
            <span className="text-sm font-bold text-slate-500 truncate">
              {file ? file.name : 'Upload ID / License (Optional)'}
            </span>
          </label>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#0A1128] hover:bg-slate-800 disabled:bg-slate-400 text-white font-black tracking-widest uppercase text-sm py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? 'Submitting Claim...' : 'Submit Verification Claim'}
          </button>
        </form>
      </div>
    </div>
  );
}
