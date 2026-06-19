"use client";

import React from 'react';

interface PrescriptionTemplateProps {
  doctorData: {
    name: string;
    speciality: string;
    degrees: string;
    registrationNo: string;
    phone: string;
    address: string;
  };
  rxData: any;
  date: string;
}

export default function PrescriptionTemplate({ doctorData, rxData, date }: PrescriptionTemplateProps) {
  return (
    <div id="prescription-pdf-content" className="bg-white text-black p-10 font-sans w-[800px] h-auto relative overflow-hidden hidden print:block shadow-none border-none">
      
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L3 7l9 5 9-5-9-5zM2 10v9.99A2 2 0 0 0 4 22h16a2 2 0 0 0 2-2v-9.99l-10 5.56L2 10z"/></svg>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-teal-600 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-black text-teal-800 tracking-tight">{doctorData.name}</h1>
          <p className="text-lg font-bold text-slate-700">{doctorData.degrees}</p>
          <p className="text-md text-slate-600">{doctorData.speciality}</p>
          <p className="text-sm font-semibold text-slate-500 mt-2">Reg. No: {doctorData.registrationNo}</p>
        </div>
        <div className="text-right">
          <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center ml-auto mb-3">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          </div>
          <p className="text-sm text-slate-600 font-medium max-w-[200px]">{doctorData.address}</p>
          <p className="text-sm text-slate-600 font-medium">Contact: {doctorData.phone}</p>
        </div>
      </div>

      {/* Patient Details */}
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Patient Name</p>
          <p className="text-lg font-black text-slate-800">{rxData.patientInfo.name}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Age / Sex</p>
          <p className="text-lg font-bold text-slate-800">{rxData.patientInfo.age} Y / {rxData.patientInfo.gender || 'N/A'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Date</p>
          <p className="text-lg font-bold text-slate-800">{date}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 min-h-[400px]">
        {/* Left Column: Vitals, History, Diagnosis */}
        <div className="col-span-4 border-r border-slate-200 pr-6 space-y-6">
          {rxData.history && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">History & Symptoms</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{rxData.history}</p>
            </div>
          )}
          
          {rxData.diagnosis && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Diagnosis</h3>
              <p className="text-sm font-semibold text-teal-700 bg-teal-50 px-3 py-2 rounded-lg">{rxData.diagnosis}</p>
            </div>
          )}

          {rxData.tests && rxData.tests[0].name && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Investigations</h3>
              <ul className="list-disc pl-4 space-y-2">
                {rxData.tests.map((test: any, i: number) => test.name && (
                  <li key={i} className="text-sm text-slate-700">
                    <span className="font-semibold">{test.name}</span>
                    {test.instructions && <span className="block text-xs text-slate-500 mt-0.5">{test.instructions}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Rx */}
        <div className="col-span-8">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <svg className="w-8 h-8 text-teal-700" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 4a3.5 3.5 0 011.66 6.572l3.194 6.388-1.788.894-3.195-6.388A3.5 3.5 0 1116.5 4zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7 4h2v5h5v2H9v5H7v-5H2V9h5V4z"/>
            </svg>
            <h2 className="text-xl font-bold text-slate-800">Prescription</h2>
          </div>

          <div className="space-y-6">
            {rxData.medicines.map((med: any, i: number) => med.name && (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-50 last:border-0">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">{med.name}</h4>
                  <div className="flex flex-wrap gap-4 text-sm mt-2">
                    <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded font-semibold border border-amber-100">{med.dosage}</span>
                    <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded font-semibold border border-sky-100">{med.frequency}</span>
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-semibold border border-emerald-100">{med.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {rxData.advice && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">General Advice / Instructions</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{rxData.advice}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer and Signature */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end">
        <div>
          <p className="text-xs text-slate-500 font-medium">Digitally Signed on DehaPa Platform.</p>
          <p className="text-[10px] text-slate-400 mt-1">This is a valid e-prescription generated via secure authentication.</p>
        </div>
        <div className="text-center">
          <div className="w-48 h-16 border-b border-slate-300 mb-2 flex items-end justify-center pb-2">
             <span className="font-[signature] text-2xl text-teal-800 opacity-80" style={{ fontFamily: 'var(--font-signature), cursive' }}>{doctorData.name}</span>
          </div>
          <p className="text-sm font-bold text-slate-700">Signature</p>
        </div>
      </div>

    </div>
  );
}
