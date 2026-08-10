"use client";

import React, { useState } from 'react';
import { 
  X, Video, Calendar, Stethoscope, ChevronRight, Mic, Send, 
  AlertTriangle, Building, FileText, Pill, Home, TestTube, Truck, UploadCloud
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface V2SmartConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'doctor' | 'hospital' | 'pharmacy' | 'lab' | 'ambulance';
  entityName: string;
  entityId?: string; // Passed from parent to link to DB
}

export default function V2SmartConnectModal({ isOpen, onClose, entityType, entityName, entityId = 'mock_id' }: V2SmartConnectModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Universal Form State
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [location, setLocation] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mocked Slots
  const mockSlots = [
    { time: '09:00 AM', isBooked: true },
    { time: '10:00 AM', isBooked: false },
    { time: '11:30 AM', isBooked: false },
    { time: '02:00 PM', isBooked: true },
    { time: '04:00 PM', isBooked: false },
    { time: '06:30 PM', isBooked: false },
  ];

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setSelectedAction(null);
    setPatientName('');
    setPhone('');
    setDetails('');
    setSelectedDate('');
    setSelectedTime(null);
    setLocation('');
    setSuccess(false);
    onClose();
  };

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
    setStep(2);
  };

  // -------------------------------------------------------------
  // DATABASE SUBMISSION LOGIC (v2_leads)
  // -------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        vendorId: entityId,
        vendorName: entityName,
        vendorType: entityType,
        requestType: selectedAction,
        patientName: patientName || 'Guest User',
        patientPhone: phone,
        status: 'pending',
        createdAt: serverTimestamp(),
        // Dynamic Fields
        details: details,
        date: selectedDate,
        time: selectedTime,
        location: location,
      };

      await addDoc(collection(db, 'v2_leads'), payload);
      
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 3000);

    } catch (error) {
      console.error("Error submitting lead:", error);
      alert("Failed to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER HELPERS
  // -------------------------------------------------------------

  const renderActionSheetItem = (
    id: string, icon: React.ReactNode, title: string, subtitle: string, 
    colorClass: string = "text-blue-600 bg-blue-100"
  ) => (
    <button 
      type="button"
      onClick={() => handleActionClick(id)}
      className="w-full bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-4 flex items-center justify-between transition-all group shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
        <div className="text-left">
          <h4 className="font-black text-[#0a2540] text-lg">{title}</h4>
          <p className="text-slate-600 text-sm font-medium">{subtitle}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0a2540] transition-colors" />
    </button>
  );

  const renderTimeSlotSelector = () => (
    <div className="bg-white/40 border border-white/60 rounded-xl p-4 mt-4">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Select Date & Time</label>
      <input 
        type="date" 
        value={selectedDate}
        onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); }}
        className="w-full bg-white/80 border border-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 mb-4" 
      />
      {selectedDate ? (
        <div>
          <span className="block text-xs font-bold text-slate-500 mb-2">Available Slots</span>
          <div className="grid grid-cols-3 gap-2">
            {mockSlots.map((slot, idx) => (
              <button
                key={idx} type="button" disabled={slot.isBooked}
                onClick={() => setSelectedTime(slot.time)}
                className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${
                  slot.isBooked ? 'bg-slate-200/50 border-slate-300 text-slate-400 cursor-not-allowed line-through' : 
                  selectedTime === slot.time ? 'bg-blue-600 border-blue-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.3)]' : 
                  'bg-white border-white hover:border-blue-300 text-slate-700 shadow-sm'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 bg-slate-50/50 rounded-lg border border-slate-200 border-dashed">
            <p className="text-xs font-bold text-slate-400">Please select a date.</p>
        </div>
      )}
    </div>
  );

  // -------------------------------------------------------------
  // ENTITY-SPECIFIC ACTION SHEETS (STEP 1)
  // -------------------------------------------------------------
  const renderActionSheet = () => {
    switch(entityType) {
      case 'doctor':
        return (
          <div className="flex flex-col gap-3">
            {renderActionSheetItem('instant_video', <Video className="w-6 h-6"/>, 'Instant Video Call', 'Connect right now', 'bg-rose-100 text-rose-600')}
            {renderActionSheetItem('schedule_video', <Calendar className="w-6 h-6"/>, 'Schedule Video Call', 'Book a future slot', 'bg-blue-100 text-blue-600')}
            {renderActionSheetItem('clinic_visit', <Stethoscope className="w-6 h-6"/>, 'Book Clinic Visit', 'Schedule in-person consult', 'bg-emerald-100 text-emerald-600')}
          </div>
        );
      case 'hospital':
        return (
          <div className="flex flex-col gap-3">
            {renderActionSheetItem('emergency', <AlertTriangle className="w-6 h-6"/>, 'Emergency Intake', 'Trigger high-priority alert', 'bg-red-100 text-red-600 border border-red-200 shadow-[0_0_15px_rgba(220,38,38,0.2)]')}
            {renderActionSheetItem('hospital_booking', <Building className="w-6 h-6"/>, 'General Booking', 'Book appointment or admission', 'bg-blue-100 text-blue-600')}
          </div>
        );
      case 'pharmacy':
        return (
          <div className="flex flex-col gap-3">
            {renderActionSheetItem('upload_rx', <FileText className="w-6 h-6"/>, 'Upload Prescription', 'Get a quote for your Rx', 'bg-indigo-100 text-indigo-600')}
            {renderActionSheetItem('manual_order', <Pill className="w-6 h-6"/>, 'Order Medicines', 'Type your OTC requirements', 'bg-emerald-100 text-emerald-600')}
          </div>
        );
      case 'lab':
        return (
          <div className="flex flex-col gap-3">
            {renderActionSheetItem('home_collection', <Home className="w-6 h-6"/>, 'Home Collection', 'We come to you', 'bg-amber-100 text-amber-600')}
            {renderActionSheetItem('center_visit', <TestTube className="w-6 h-6"/>, 'Center Visit', 'Book an in-lab test', 'bg-blue-100 text-blue-600')}
          </div>
        );
      case 'ambulance':
        return (
          <div className="flex flex-col gap-3">
            {renderActionSheetItem('emergency_dispatch', <AlertTriangle className="w-6 h-6"/>, 'Immediate Dispatch', 'Send ambulance NOW', 'bg-red-100 text-red-600 border border-red-200')}
            {renderActionSheetItem('schedule_transport', <Truck className="w-6 h-6"/>, 'Schedule Transport', 'Book for a future date', 'bg-blue-100 text-blue-600')}
          </div>
        );
      default: return null;
    }
  };

  // -------------------------------------------------------------
  // UNIVERSAL FORM RENDERER (STEP 2)
  // -------------------------------------------------------------
  const renderForm = () => {
    const isEmergency = selectedAction === 'emergency' || selectedAction === 'emergency_dispatch';
    const needsTimeSlot = ['schedule_video', 'clinic_visit', 'center_visit', 'home_collection', 'schedule_transport'].includes(selectedAction || '');
    const needsLocation = ['emergency', 'emergency_dispatch', 'schedule_transport', 'upload_rx', 'manual_order', 'home_collection'].includes(selectedAction || '');

    return (
      <form className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300" onSubmit={handleSubmit}>
        
        {/* Selected Action Header */}
        <div className={`${isEmergency ? 'bg-red-50 border-red-200' : 'bg-blue-50/50 border-blue-100'} border rounded-xl p-3 flex items-center gap-3 mb-2`}>
           <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isEmergency ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>
             <ChevronRight className="w-4 h-4" />
           </div>
           <span className={`font-bold text-sm ${isEmergency ? 'text-red-700' : 'text-blue-900'}`}>
             {selectedAction?.replace('_', ' ').toUpperCase()}
           </span>
        </div>

        {/* Standard Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Name</label>
            <input required type="text" value={patientName} onChange={e=>setPatientName(e.target.value)} className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Phone</label>
            <input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" />
          </div>
        </div>

        {needsLocation && (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{isEmergency ? 'Current GPS Location' : 'Delivery/Pickup Address'}</label>
            <input required type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="Full address or landmark" className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" />
          </div>
        )}

        {selectedAction === 'upload_rx' && (
          <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl bg-white/40 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-white/60 transition-colors">
            <UploadCloud className="w-8 h-8 mb-2" />
            <span className="text-sm font-bold">Tap to Upload Prescription</span>
            <span className="text-xs">PDF, JPG, PNG</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            {isEmergency ? 'Incident Details' : 'Details / Requirements'}
          </label>
          <textarea required rows={3} value={details} onChange={e=>setDetails(e.target.value)} placeholder="Describe what you need..." className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700 resize-none"></textarea>
        </div>

        {needsTimeSlot && renderTimeSlotSelector()}

        {entityType === 'doctor' && (
          <div className="flex justify-between items-center bg-white/40 border border-white/60 rounded-xl p-3 mt-2">
             <span className="text-sm font-bold text-slate-600">Add Audio Note (Optional)</span>
             <button type="button" className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 transition-colors">
                <Mic className="w-5 h-5" />
             </button>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting || (needsTimeSlot && (!selectedDate || !selectedTime))}
          className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-4 flex items-center justify-center gap-2 ${
            isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? 'Processing...' : isEmergency ? 'DISPATCH NOW' : 'Confirm & Request'}
        </button>

        <button type="button" onClick={() => setStep(1)} className="w-full text-slate-500 hover:text-slate-800 font-bold text-sm py-2">
          ← Back to Options
        </button>
      </form>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white/60 backdrop-blur-3xl border-2 border-white rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,30,80,0.25)] flex flex-col transform transition-all duration-300 animate-in zoom-in-95 overflow-hidden">
        
        {success ? (
          <div className="p-10 flex flex-col items-center text-center">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
               <Send className="w-10 h-10" />
             </div>
             <h2 className="text-3xl font-black text-[#0a2540] mb-2">Success!</h2>
             <p className="text-slate-600 font-medium">Your request has been sent to {entityName}. They will connect with you shortly.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-white/40 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-[#0a2540] tracking-tight">Connect</h2>
                <p className="text-slate-600 text-sm font-medium">with {entityName}</p>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/50 border border-white/80 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic Content Body */}
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {step === 1 ? renderActionSheet() : renderForm()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
