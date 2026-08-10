"use client";

import React, { useState } from 'react';
import { X, Video, Calendar, Stethoscope, ChevronRight, Mic, Send } from 'lucide-react';

interface V2SmartConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'doctor' | 'hospital' | 'pharmacy' | 'lab' | 'ambulance';
  entityName: string;
}

export default function V2SmartConnectModal({ isOpen, onClose, entityType, entityName }: V2SmartConnectModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  if (!isOpen) return null;

  // Reset state when closing
  const handleClose = () => {
    setStep(1);
    setSelectedAction(null);
    onClose();
  };

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
    setStep(2);
  };

  const renderDoctorActionSheet = () => (
    <div className="flex flex-col gap-3">
      <button 
        onClick={() => handleActionClick('instant_video')}
        className="w-full bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-4 flex items-center justify-between transition-all group shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <Video className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h4 className="font-black text-[#0a2540] text-lg">Instant Video Call</h4>
            <p className="text-slate-600 text-sm font-medium">Connect with {entityName} right now</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0a2540] transition-colors" />
      </button>

      <button 
        onClick={() => handleActionClick('schedule_video')}
        className="w-full bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-4 flex items-center justify-between transition-all group shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h4 className="font-black text-[#0a2540] text-lg">Schedule Video Call</h4>
            <p className="text-slate-600 text-sm font-medium">Book a future telemedicine slot</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0a2540] transition-colors" />
      </button>

      <button 
        onClick={() => handleActionClick('clinic_visit')}
        className="w-full bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-4 flex items-center justify-between transition-all group shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h4 className="font-black text-[#0a2540] text-lg">Book Clinic Visit</h4>
            <p className="text-slate-600 text-sm font-medium">Schedule an in-person consultation</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0a2540] transition-colors" />
      </button>
    </div>
  );

  const renderDoctorForm = () => (
    <form className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300" onSubmit={(e) => { e.preventDefault(); handleClose(); }}>
      
      {/* Visual Indicator of what was selected */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-center gap-3 mb-2">
         {selectedAction === 'instant_video' && <Video className="w-5 h-5 text-blue-600" />}
         {selectedAction === 'schedule_video' && <Calendar className="w-5 h-5 text-blue-600" />}
         {selectedAction === 'clinic_visit' && <Stethoscope className="w-5 h-5 text-blue-600" />}
         <span className="font-bold text-blue-900 text-sm">
           {selectedAction === 'instant_video' ? 'Requesting Instant Video Consult' : selectedAction === 'schedule_video' ? 'Scheduling Video Consult' : 'Booking Clinic Visit'}
         </span>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Patient Name</label>
        <input type="text" placeholder="Full Name" className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700" />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">WhatsApp Number</label>
        <input type="tel" placeholder="+91" className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700" />
      </div>

      {selectedAction !== 'instant_video' && (
         <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Preferred Date</label>
            <input type="date" className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700" />
         </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Describe Symptoms</label>
        <textarea rows={3} placeholder="Briefly describe why you need to consult..." className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700 resize-none"></textarea>
      </div>

      <div className="flex justify-between items-center bg-white/40 border border-white/60 rounded-xl p-3">
         <span className="text-sm font-bold text-slate-600">Audio Note (Optional)</span>
         <button type="button" className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 transition-colors">
            <Mic className="w-5 h-5" />
         </button>
      </div>

      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-colors mt-2 flex items-center justify-center gap-2">
        <Send className="w-5 h-5" />
        Confirm & Request
      </button>

      <button type="button" onClick={() => setStep(1)} className="w-full text-slate-500 hover:text-slate-800 font-bold text-sm py-2">
        ← Back to Options
      </button>
    </form>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white/60 backdrop-blur-3xl border-2 border-white rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,30,80,0.25)] flex flex-col transform transition-all duration-300 animate-in zoom-in-95 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/40 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-[#0a2540] tracking-tight">Connect</h2>
            <p className="text-slate-600 text-sm font-medium">with {entityName}</p>
          </div>
          <button 
            onClick={handleClose} 
            className="w-8 h-8 rounded-full bg-white/50 border border-white/80 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Content Body */}
        <div className="p-6">
          {entityType === 'doctor' && step === 1 && renderDoctorActionSheet()}
          {entityType === 'doctor' && step === 2 && renderDoctorForm()}
          
          {/* We will build out Hospital/Pharmacy/Lab here later */}
          {entityType !== 'doctor' && (
             <div className="text-center py-8">
               <p className="text-slate-500 font-bold">Forms for {entityType} coming soon!</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
