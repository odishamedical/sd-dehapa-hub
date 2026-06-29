import React, { useState, useEffect } from 'react';
import { X, Activity, MapPin, Phone, AlertCircle, ShieldAlert } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface EmergencyModalProps {
  hospitalId: string;
  hospitalName: string;
  onClose: () => void;
}

export default function EmergencyIntakeModal({ hospitalId, hospitalName, onClose }: EmergencyModalProps) {
  const [location, setLocation] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'hospital_emergency_requests'), {
        hospitalId,
        hospitalName,
        location,
        symptoms,
        phone,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit emergency request", err);
      alert("Failed to submit. Please call an ambulance directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
        <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative text-center border-t-8 border-rose-600">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-rose-600 animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-4">Emergency Alert Sent</h2>
          <p className="text-slate-600 mb-8 font-medium">
            Your high-priority alert has been directly dispatched to the emergency response team at <strong className="text-slate-900">{hospitalName}</strong>. 
            They have received your location and will contact you immediately.
          </p>
          
          <div className="flex flex-col gap-3">
            <a href="tel:108" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-lg tracking-widest uppercase">
              <Phone className="w-5 h-5" /> Call 108 Ambulance
            </a>
            <button onClick={onClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition-colors">
              Close Alert
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl relative border-t-8 border-rose-600 animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-rose-100 p-3 rounded-full text-rose-600">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Emergency Intake</h2>
            <p className="text-rose-600 font-bold text-sm">Dispatch to {hospitalName}</p>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex gap-3 text-rose-800 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>This will instantly trigger a loud emergency siren on the hospital's reception dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none"
                placeholder="Where are you right now?"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contact Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="tel" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none"
                placeholder="Phone number for callbacks"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Brief Symptoms / Incident</label>
            <textarea 
              required
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none min-h-[100px] resize-none"
              placeholder="E.g. Chest pain, accident trauma, severe bleeding..."
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-black tracking-widest uppercase text-sm py-4 rounded-xl transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? 'Dispatching Alert...' : 'Dispatch Emergency Alert'}
          </button>
        </form>
      </div>
    </div>
  );
}
