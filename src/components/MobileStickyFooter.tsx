"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Search, FileText, User, QrCode } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface Props {
  onScanClick: () => void;
}

export default function MobileStickyFooter({ onScanClick }: Props) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // Only show on mobile screens
  useEffect(() => {
    const handleResize = () => {
      setIsVisible(window.innerWidth < 768);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#020810]/90 backdrop-blur-xl border-t border-slate-800 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {/* Floating Center Orb Background */}
      <div className="absolute left-1/2 -top-6 -translate-x-1/2 w-20 h-20 bg-[#020810] rounded-full border border-slate-800"></div>

      <div className="flex items-center justify-between px-6 py-2 relative">
        
        {/* Left Nav */}
        <Link href="/" className={`flex flex-col items-center gap-1 ${pathname === '/' ? 'text-teal-400' : 'text-slate-500'}`}>
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold tracking-wider">Home</span>
        </Link>
        
        <Link href="/doctors" className={`flex flex-col items-center gap-1 ${pathname.startsWith('/doctors') ? 'text-teal-400' : 'text-slate-500'}`}>
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-bold tracking-wider">Search</span>
        </Link>

        {/* Center Floating SCAN Button */}
        <button 
          onClick={onScanClick}
          className="absolute left-1/2 -top-5 -translate-x-1/2 flex flex-col items-center group outline-none"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.4)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] transition-all duration-300">
            <QrCode className="w-7 h-7 text-white" />
          </div>
          <span className="text-[10px] font-black text-white mt-1 uppercase tracking-widest">Scan</span>
        </button>

        {/* Right Nav */}
        <Link href="/portal" className={`flex flex-col items-center gap-1 ml-16 ${pathname.includes('/portal') && !pathname.includes('profile') ? 'text-teal-400' : 'text-slate-500'}`}>
          <FileText className="w-6 h-6" />
          <span className="text-[10px] font-bold tracking-wider">Vault</span>
        </Link>

        <Link href="/portal/patient" className={`flex flex-col items-center gap-1 ${pathname.includes('patient') ? 'text-teal-400' : 'text-slate-500'}`}>
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold tracking-wider">Profile</span>
        </Link>

      </div>
    </div>
  );
}
