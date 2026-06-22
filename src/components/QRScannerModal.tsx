"use client";

import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    let scanner: Html5QrcodeScanner | null = null;
    
    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const cameras = await Html5Qrcode.getCameras();
        
        if (cameras && cameras.length > 0) {
          scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
          );

          scanner.render(
            (decodedText) => {
              if (scanner) scanner.clear();
              onClose();
              if (decodedText.startsWith("http")) {
                 try {
                   const url = new URL(decodedText);
                   if (typeof window !== 'undefined' && url.origin === window.location.origin) {
                     router.push(url.pathname + url.search + url.hash);
                   } else {
                     window.location.href = decodedText;
                   }
                 } catch (e) {
                   window.location.href = decodedText;
                 }
              } else if (decodedText.length === 8) {
                 router.push(`/invite/${decodedText}`);
              } else {
                 alert(`Scanned: ${decodedText}`);
              }
            },
            (errorMessage) => {
              // Ignore typical frame empty errors
            }
          );
        } else {
          setErrorMsg("No cameras found on your device.");
        }
      } catch (err: any) {
        console.error("Camera check error:", err);
        setErrorMsg("Camera access denied or unavailable. Please check your browser permissions.");
      }
    };

    const timer = setTimeout(initScanner, 100);

    return () => {
      clearTimeout(timer);
      if (scanner) {
        try {
          scanner.clear();
        } catch(e) {}
      }
    };
  }, [isOpen, onClose, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Scan Doctor's QR Code</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded-full text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8">
          {errorMsg ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex flex-col items-center text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Camera Unavailable</h3>
              <p className="text-sm">{errorMsg}</p>
            </div>
          ) : (
            <div className="relative">
              <p className="text-center text-slate-500 text-sm mb-4">Position the QR code within the frame to connect instantly.</p>
              
              <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-slate-200"></div>

              {/* Override default ugly scanner UI styles slightly with global css below or just let it be. Html5QrcodeScanner creates its own UI. */}
              <style dangerouslySetInnerHTML={{__html: `
                #reader button {
                  background-color: #0f172a !important;
                  color: white !important;
                  border: none !important;
                  border-radius: 8px !important;
                  padding: 8px 16px !important;
                  margin-top: 10px !important;
                  cursor: pointer;
                  font-weight: 600;
                  font-family: inherit;
                }
                #reader select {
                  padding: 8px !important;
                  border-radius: 8px !important;
                  border: 1px solid #cbd5e1 !important;
                  margin-bottom: 10px !important;
                  width: 100%;
                }
                #reader a {
                   display: none !important;
                }
                #reader__dashboard_section_csr span {
                   color: #64748b !important;
                   font-size: 14px;
                   display: block;
                   margin-bottom: 10px;
                }
              `}} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
