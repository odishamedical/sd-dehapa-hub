"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerModalProps {
  onClose: () => void;
}

export default function ScannerModal({ onClose }: ScannerModalProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Initialize Scanner on mount
    const initScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!isProcessing) {
              handleScan(decodedText);
            }
          },
          (errorMessage) => {
            // ignore constant scanning errors
          }
        );
      } catch (err) {
        console.error("Camera init error", err);
        setErrorMsg("Failed to access camera. Please check permissions.");
      }
    };
    
    initScanner();

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error("Error stopping scanner", err));
      }
    };
  }, []);

  const handleScan = (text: string) => {
    // 1. Instantly freeze the camera stream so it stops scanning,
    // but DO NOT destroy or unmount it (which causes the fatal crash).
    if (scannerRef.current) {
      try {
        scannerRef.current.pause(true);
      } catch (e) {
        console.error("Pause error", e);
      }
    }
    
    // 2. Add an artificial delay so the user sees the freeze, then route natively.
    setTimeout(() => {
      processUrlLogic(text);
    }, 500);
  };

  const processUrlLogic = (url: string) => {
    try {
      // Logic 1: Patient Identity Scanned by Doctor/Hospital
      // Payload format: dehapa-auth://scan?uid=...
      if (url.startsWith('dehapa-auth://scan?uid=')) {
        const uid = new URLSearchParams(url.split('?')[1]).get('uid');
        if (uid) {
          router.push(`/portal/doctor?patientId=${encodeURIComponent(uid)}`);
          setTimeout(() => { onClose(); }, 1000);
          return;
        }
      }

      // Logic 2: Doctor/Hospital/Lab Profile Scanned by Patient
      // Payload format: https://dehapa.com/doctors/... or https://dehapa.com/profile/...
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const parsedUrl = new URL(url);
        // Ensure it's a dehapa URL or route it anyway if we trust it
        if (parsedUrl.hostname.includes('dehapa.com') || parsedUrl.hostname.includes('localhost') || parsedUrl.hostname.includes('vercel.app')) {
          // 3. Use seamless Next.js router.push so we never trigger a native Android browser navigation,
          // which is causing the "This page couldn't load" system crash in Custom Tabs.
          router.push(parsedUrl.pathname + parsedUrl.search);
          
          // 4. Delay the onClose so the DOM isn't destroyed while router is transitioning.
          setTimeout(() => {
            onClose();
          }, 1000);
          return;
        }
      }

      // Fallback: Unknown QR Code
      setErrorMsg("Unrecognized QR Code format. Please scan a valid DehaPa code.");
      setIsProcessing(false);
      
    } catch (err) {
      console.error("Failed to parse QR:", err);
      setErrorMsg("Invalid QR Code.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#020810]/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative bg-slate-900 border border-teal-500/30 shadow-[0_0_50px_rgba(20,184,166,0.15)] rounded-[2rem] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white leading-tight">Universal Scanner</h2>
              <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">DehaPa Network</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-6 relative">
          
          {errorMsg ? (
            <div className="py-12 flex flex-col items-center text-center">
              <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Scan Failed</h3>
              <p className="text-slate-400 text-sm mb-6 px-4">{errorMsg}</p>
              <button 
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-full text-sm font-bold transition-colors"
              >
                Close
              </button>
            </div>
          ) : isProcessing ? (
            <div className="py-16 flex flex-col items-center text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <CheckCircle2 className="w-20 h-20 text-teal-400 relative z-10" />
              </div>
              <h3 className="text-2xl font-black text-white mt-6 mb-2">Code Detected!</h3>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing network route...
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-2xl overflow-hidden ring-4 ring-slate-800 bg-black relative">
                {/* The Scanner */}
                <div id="qr-reader" className="w-full h-[300px] bg-black"></div>
                
                {/* Custom Overlay */}
                <div className="absolute inset-0 border-[40px] border-[#020810]/50 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-teal-500 rounded-2xl">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-400 -translate-x-1 -translate-y-1"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-400 translate-x-1 -translate-y-1"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-400 -translate-x-1 translate-y-1"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-400 translate-x-1 translate-y-1"></div>
                    {/* Laser Line */}
                    <div className="w-full h-0.5 bg-teal-400 shadow-[0_0_10px_#2dd4bf] absolute top-1/2 -translate-y-1/2 animate-[bounce_2s_infinite]"></div>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm font-medium text-slate-400 mt-6">
                Point your camera at a Doctor, Hospital, or Patient QR code.
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
