"use client";

import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface BillingInvoiceProps {
  patient: any;
  provider: any;
  onClose: () => void;
}

export default function BillingInvoice({ patient, provider, onClose }: BillingInvoiceProps) {
  const [mounted, setMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const generatePDF = async () => {
    if (!invoiceRef.current) return;
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a5'); // A5 size for receipts
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${patient?.patientName?.replace(/\s+/g, '_') || patient?.name?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Failed to generate PDF invoice.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!mounted) return null;

  const fee = 500;
  const tax = fee * 0.18; // 18% GST mock
  const total = fee + tax;
  const invoiceId = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-full">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">Billing Invoice</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Scrollable Invoice Area */}
        <div className="p-6 md:p-10 overflow-y-auto bg-slate-100 flex justify-center custom-scrollbar">
           {/* The actual A5 sized printable container */}
           <div 
             ref={invoiceRef} 
             className="bg-white w-[420px] p-8 shadow-sm border border-slate-200 relative"
           >
             {/* Logo & Header */}
             <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
                <div className="w-12 h-12 bg-slate-900 rounded-xl mx-auto mb-3 flex items-center justify-center">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <h1 className="font-black text-2xl text-slate-900 tracking-tight">{provider?.name || "Dr. John Doe Clinic"}</h1>
                <p className="text-xs text-slate-500 mt-1">{provider?.address || "123 Health Avenue, Medical District"}</p>
                <p className="text-xs text-slate-500 font-bold mt-1">Ph: +91 9876543210</p>
             </div>

             <div className="flex justify-between items-start mb-8 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Billed To</p>
                  <p className="font-bold text-slate-900">{patient?.patientName || patient?.name || "Walk-in Patient"}</p>
                  <p className="text-slate-600 text-xs">{patient?.patientEmail || patient?.email || "N/A"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Invoice Details</p>
                  <p className="font-bold text-slate-900">{invoiceId}</p>
                  <p className="text-slate-600 text-xs">{dateStr}</p>
                </div>
             </div>

             {/* Line Items */}
             <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="text-right py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-4 px-4 text-slate-900 font-medium border-b border-slate-100">Medical Consultation Fee</td>
                      <td className="py-4 px-4 text-slate-900 text-right font-bold border-b border-slate-100">₹{fee.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-500 text-xs text-right">GST (18%)</td>
                      <td className="py-3 px-4 text-slate-500 text-xs text-right font-medium">₹{tax.toFixed(2)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white">
                      <td className="py-4 px-4 font-bold">Total Amount</td>
                      <td className="py-4 px-4 font-black text-right text-lg">₹{total.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
             </div>

             <div className="text-center mt-10">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Status: <span className="text-emerald-500">PAID</span></p>
               <div className="mt-4 opacity-30 flex justify-center">
                 <svg className="w-16 h-16 text-slate-900" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>
               </div>
             </div>

             {/* Watermark / Footer */}
             <div className="absolute bottom-4 left-0 right-0 text-center">
               <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">Generated by SD Ecosystem OS</p>
             </div>
           </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button 
            onClick={generatePDF}
            disabled={isGenerating}
            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? 'Generating PDF...' : 'Download Invoice'}
            {!isGenerating && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>}
          </button>
        </div>
      </div>
    </div>
  );
}
