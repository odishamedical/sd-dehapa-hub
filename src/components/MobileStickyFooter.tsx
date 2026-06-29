"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Search, FolderHeart, User, QrCode, Stethoscope, Calendar } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface Props {
  onScanClick: () => void;
}

export default function MobileStickyFooter({ onScanClick }: Props) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Only show on mobile screens
  useEffect(() => {
    const handleResize = () => {
      setIsVisible(window.innerWidth < 768);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    // Auth Check
    setRole(localStorage.getItem('sd_current_user_role'));
    setEmail(localStorage.getItem('sd_current_user_email'));
    
    const handleStorage = () => {
      setRole(localStorage.getItem('sd_current_user_role'));
      setEmail(localStorage.getItem('sd_current_user_email'));
    };
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', handleStorage);
    }
  }, []);

  // Hide in call rooms or auth screens
  if (!isVisible || pathname.includes('/consultation/room') || pathname.includes('/login') || pathname.includes('/join')) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom,16px)] pt-2 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
      {/* Floating Center Cutout Background */}
      <div className="absolute left-1/2 -top-6 -translate-x-1/2 w-20 h-20 bg-white rounded-full border border-slate-200 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] -z-10"></div>

      <div className="flex items-center justify-between px-6 py-1 relative max-w-md mx-auto">
        
        {/* Left Nav */}
        <Link href="/" className={`flex flex-col items-center gap-1 w-12 ${pathname === '/' ? 'text-teal-600 font-bold scale-110' : 'text-slate-500 hover:text-slate-900'} transition-all`}>
          <Home className="w-6 h-6" />
          <span className="text-[10px] tracking-wide">Home</span>
        </Link>
        
        {role === 'doctor' ? (
          <Link href="/portal/doctor" className={`flex flex-col items-center gap-1 w-12 mr-8 ${pathname.includes('/portal/doctor') && !pathname.includes('tab=appointments') ? 'text-teal-600 font-bold scale-110' : 'text-slate-500 hover:text-slate-900'} transition-all`}>
            <Stethoscope className="w-6 h-6" />
            <span className="text-[10px] tracking-wide">Rx Pad</span>
          </Link>
        ) : (
          <Link href="/search" className={`flex flex-col items-center gap-1 w-12 mr-8 ${pathname.startsWith('/search') ? 'text-teal-600 font-bold scale-110' : 'text-slate-500 hover:text-slate-900'} transition-all`}>
            <Search className="w-6 h-6" />
            <span className="text-[10px] tracking-wide">Search</span>
          </Link>
        )}

        {/* Center Floating SCAN Button */}
        <button 
          onClick={onScanClick}
          className="absolute left-1/2 -top-5 -translate-x-1/2 flex flex-col items-center group outline-none"
        >
          <div className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center shadow-[0_4px_15px_rgba(20,184,166,0.3)] group-hover:scale-105 transition-all duration-300 border-4 border-white">
            <QrCode className="w-7 h-7 text-white" />
          </div>
          <span className="text-[10px] font-bold text-teal-600 mt-1 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full shadow-sm">Scan</span>
        </button>

        {/* Right Nav */}
        {role === 'doctor' ? (
          <Link href="/portal/doctor?tab=appointments" className={`flex flex-col items-center gap-1 w-12 ml-8 ${pathname.includes('tab=appointments') ? 'text-teal-600 font-bold scale-110' : 'text-slate-500 hover:text-slate-900'} transition-all`}>
            <Calendar className="w-6 h-6" />
            <span className="text-[10px] tracking-wide">Schedule</span>
          </Link>
        ) : (
          <Link href={email ? `/portal/vault/${encodeURIComponent(email)}` : '/login'} className={`flex flex-col items-center gap-1 w-12 ml-8 ${pathname.includes('/vault') ? 'text-teal-600 font-bold scale-110' : 'text-slate-500 hover:text-slate-900'} transition-all`}>
            <FolderHeart className="w-6 h-6" />
            <span className="text-[10px] tracking-wide">Vault</span>
          </Link>
        )}

        <Link href={email ? (role === 'doctor' ? '/portal/doctor' : '/portal') : '/login'} className={`flex flex-col items-center gap-1 w-12 ${pathname === '/portal' || (pathname === '/portal/doctor' && role === 'doctor' && !pathname.includes('tab=')) ? 'text-teal-600 font-bold scale-110' : 'text-slate-500 hover:text-slate-900'} transition-all`}>
          <User className="w-6 h-6" />
          <span className="text-[10px] tracking-wide">{email ? 'Profile' : 'Login'}</span>
        </Link>

      </div>
    </div>
  );
}
