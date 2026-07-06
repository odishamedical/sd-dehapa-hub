"use client";

import React, { useState } from 'react';
import { Video, Calendar, MapPin, Upload, Ambulance, FileText, CheckCircle2, Phone, X, CreditCard, Activity } from 'lucide-react';
import Link from 'next/link';

interface BookingEngineProps {
  entityType: 'doctor' | 'hospital' | 'lab' | 'pharmacy' | 'ambulance';
  entityId: string;
  entityName: string;
  isLoggedIn: boolean;
  onDispatchAction: () => void;
}

export default function BookingEngine({ entityType, entityId, entityName, isLoggedIn, onDispatchAction }: BookingEngineProps) {
  const [showModal, setShowModal] = useState(false);
  const [bookingMode, setBookingMode] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center mt-4">
        <p className="text-xs text-rose-700 font-bold mb-3">Please log in to view availability and book services.</p>
        <Link href={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="w-full inline-block bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl text-sm font-black transition-colors shadow-md shadow-rose-500/20">
          Login / Register
        </Link>
      </div>
    );
  }

  const renderButtons = () => {
    switch(entityType) {
      case 'doctor':
        return (
          <div className="flex flex-col gap-3 mt-4">
            <button onClick={() => { setBookingMode('offline'); setShowModal(true); }} className="w-full bg-white border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 text-[#0A1128] py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 group">
              <MapPin className="w-4 h-4 text-slate-400 group-hover:text-cyan-500" /> Clinic Visit
            </button>
            <button onClick={() => { setBookingMode('schedule_video'); setShowModal(true); }} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
              <Calendar className="w-4 h-4 text-cyan-400" /> Schedule Video Consult
            </button>
            <button onClick={() => { setBookingMode('instant_video'); setShowModal(true); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 animate-pulse">
              <Video className="w-4 h-4" /> Connect Now (Instant)
            </button>
          </div>
        );
      case 'ambulance':
        return (
          <div className="flex flex-col gap-3 mt-4">
            <button onClick={() => { onDispatchAction(); }} className="w-full bg-rose-600 hover:bg-rose-500 text-white py-5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(225,29,72,0.3)] uppercase tracking-widest hover:-translate-y-0.5">
              <Ambulance className="w-5 h-5" /> Dispatch Emergency
            </button>
          </div>
        );
      case 'pharmacy':
        return (
          <div className="flex flex-col gap-3 mt-4">
            <button onClick={() => { setBookingMode('upload_rx'); setShowModal(true); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5">
              <Upload className="w-4 h-4" /> Upload Prescription
            </button>
          </div>
        );
      case 'lab':
        return (
          <div className="flex flex-col gap-3 mt-4">
            <button onClick={() => { setBookingMode('home_collection'); setShowModal(true); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5">
              <MapPin className="w-4 h-4" /> Book Home Collection
            </button>
            <button onClick={() => { setBookingMode('upload_rx'); setShowModal(true); }} className="w-full bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-[#0A1128] py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 group">
              <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500" /> Upload Test Requisition
            </button>
          </div>
        );
      case 'hospital':
        return (
          <div className="flex flex-col gap-3 mt-4">
            <button onClick={() => { setBookingMode('request_bed'); setShowModal(true); }} className="w-full bg-amber-500 hover:bg-amber-400 text-white py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5">
              <Activity className="w-4 h-4" /> Request Admission / Bed
            </button>
            <button onClick={() => { onDispatchAction(); }} className="w-full bg-white border border-rose-200 hover:border-rose-400 hover:bg-rose-50 text-rose-700 py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 group">
              <Phone className="w-4 h-4 text-rose-400 group-hover:text-rose-500" /> Emergency Hotline
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderButtons()}

      {/* Unified Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <h3 className="font-black text-xl text-[#0A1128]">
                {bookingMode === 'offline' && "Book Clinic Visit"}
                {bookingMode === 'schedule_video' && "Schedule Video Consult"}
                {bookingMode === 'instant_video' && "Instant Telemedicine Room"}
                {bookingMode === 'upload_rx' && "Upload Prescription"}
                {bookingMode === 'home_collection' && "Home Sample Collection"}
                {bookingMode === 'request_bed' && "Admission Request"}
              </h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              
              {/* Doctor: Schedule View */}
              {(bookingMode === 'offline' || bookingMode === 'schedule_video') && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Select Date</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                      {['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                        <button key={i} className={`shrink-0 w-16 h-20 rounded-2xl border flex flex-col items-center justify-center transition-colors ${i === 0 ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-400 hover:bg-cyan-50'}`}>
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">{day}</span>
                          <span className="text-lg font-black">{new Date().getDate() + i}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Available Slots</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['09:00 AM', '10:30 AM', '11:45 AM', '02:00 PM', '04:15 PM', '06:30 PM'].map((time, i) => (
                        <button key={i} className="bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-400 text-slate-700 py-3 rounded-xl text-sm font-bold transition-colors">
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest mt-4 shadow-lg shadow-cyan-600/30">
                    Confirm & Pay
                  </button>
                </div>
              )}

              {/* Instant Video View */}
              {bookingMode === 'instant_video' && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Video className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-bold text-[#0A1128] mb-2">Connecting to Dr. {entityName}...</h4>
                  <p className="text-sm text-slate-500 mb-8">Please have your payment method ready. You will be placed in a waiting room until the doctor accepts.</p>
                  <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" /> Pay ₹500 & Enter Room
                  </button>
                </div>
              )}

              {/* Upload Prescription */}
              {bookingMode === 'upload_rx' && (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-blue-500">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-[#0A1128] mb-1">Click to Upload Prescription</h4>
                    <p className="text-xs text-slate-500">PDF, JPG, PNG up to 10MB</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Delivery Details</label>
                    <textarea placeholder="Any specific instructions..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-blue-400 focus:bg-white transition-all min-h-[100px]"></textarea>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-600/30">
                    Send to Pharmacy
                  </button>
                </div>
              )}

              {/* Hospital Admission */}
              {bookingMode === 'request_bed' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Patient Condition</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all font-medium text-slate-700">
                      <option>Emergency (Critical)</option>
                      <option>Planned Surgery / Admission</option>
                      <option>Maternity</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Requested Ward/Bed Type</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all font-medium text-slate-700">
                      <option>General Ward</option>
                      <option>Private Room</option>
                      <option>ICU (Intensive Care Unit)</option>
                      <option>NICU (Neonatal ICU)</option>
                    </select>
                  </div>
                  <button className="w-full bg-amber-500 hover:bg-amber-400 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest mt-4 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2">
                    <Activity className="w-4 h-4" /> Send Request
                  </button>
                  <p className="text-xs text-center text-slate-500 mt-2 font-medium">The hospital admissions desk will contact you immediately.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
