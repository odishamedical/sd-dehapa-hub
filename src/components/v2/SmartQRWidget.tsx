"use client";

import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Printer, X, Maximize2 } from "lucide-react";

interface SmartQRWidgetProps {
  profileUrl: string;
  profileName: string;
  role: string;
}

export default function SmartQRWidget({ profileUrl, profileName, role }: SmartQRWidgetProps) {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('qr-print-area');
    if (!printContent) return;
    
    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    if (!windowPrint) return;

    windowPrint.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${profileName}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 0; background: #fff; }
            .print-container { width: 100%; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; page-break-after: always; }
            .header { margin-bottom: 2rem; }
            .header h1 { font-size: 3rem; color: #0a2540; margin: 0 0 0.5rem 0; }
            .header p { font-size: 1.5rem; color: #475569; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
            .qr-wrapper { padding: 3rem; background: #fff; border: 4px solid #0a2540; border-radius: 2rem; margin-bottom: 2rem; }
            .footer { margin-top: 2rem; }
            .footer h2 { font-size: 2.5rem; color: #2563eb; margin: 0 0 0.5rem 0; }
            .footer p { font-size: 1.25rem; color: #64748b; margin: 0; }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="header">
              <h1>${profileName}</h1>
              <p>${role}</p>
            </div>
            <div class="qr-wrapper">
              ${printContent.innerHTML}
            </div>
            <div class="footer">
              <h2>Scan to Connect</h2>
              <p>Book appointments, access medical records, and follow for updates.</p>
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    windowPrint.document.close();
  };

  return (
    <>
      <div className="bg-white/40 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-6 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] relative overflow-hidden mb-8 group">
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/60 to-transparent pointer-events-none"></div>
        
        <h3 className="text-lg font-black text-[#0a2540] mb-4 flex items-center gap-2">
          Digital Connect
        </h3>

        <div 
          onClick={() => setIsQrModalOpen(true)}
          className="bg-white rounded-3xl p-6 shadow-inner border-2 border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all group/qr relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover/qr:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10 w-40 h-40 bg-white rounded-2xl p-2 shadow-sm border border-slate-100 mb-4 transition-transform group-hover/qr:scale-105 duration-500">
            <QRCode value={profileUrl} size={142} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
            
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
              <div className="bg-blue-600 text-white rounded-full p-3 shadow-lg">
                <Maximize2 className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm font-bold text-slate-600 relative z-10">Scan to view profile on mobile</p>
        </div>
      </div>

      {/* QR Modal & Print Area */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8 pr-12">
              <h3 className="text-2xl font-black text-[#0a2540] leading-tight">{profileName}</h3>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-1">{role}</p>
            </div>

            <div id="qr-print-area" className="bg-white p-4 rounded-3xl border-4 border-slate-100 shadow-inner mb-8">
              <QRCode value={profileUrl} size={300} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
            </div>

            <button 
              onClick={handlePrint}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Desk Poster
            </button>
          </div>
        </div>
      )}
    </>
  );
}
