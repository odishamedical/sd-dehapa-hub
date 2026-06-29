"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, FolderHeart, User, Stethoscope, Calendar } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Read from localStorage on mount
    setRole(localStorage.getItem('sd_current_user_role'));
    setEmail(localStorage.getItem('sd_current_user_email'));
    
    // Optional: listen to storage events if login happens in another tab
    const handleStorage = () => {
      setRole(localStorage.getItem('sd_current_user_role'));
      setEmail(localStorage.getItem('sd_current_user_email'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Don't show the nav if we are inside a video call or full-screen workflow
  if (pathname.includes('/consultation/room') || pathname.includes('/login') || pathname.includes('/join')) {
    return null;
  }

  // Determine Nav Items based on Role
  const navItems = [];

  // Home is universal
  navItems.push({
    id: 'home',
    label: 'Home',
    icon: <Home className="w-6 h-6" />,
    href: '/'
  });

  if (role === 'doctor') {
    navItems.push({
      id: 'rxpad',
      label: 'Rx Pad',
      icon: <Stethoscope className="w-6 h-6" />,
      href: '/portal/doctor' // Doctor dashboard usually contains Rx pad
    });
    navItems.push({
      id: 'schedule',
      label: 'Schedule',
      icon: <Calendar className="w-6 h-6" />,
      href: '/portal/doctor?tab=appointments'
    });
  } else {
    // Default / Patient view
    navItems.push({
      id: 'search',
      label: 'Search',
      icon: <Search className="w-6 h-6" />,
      href: '/search'
    });
    navItems.push({
      id: 'vault',
      label: 'My Vault',
      icon: <FolderHeart className="w-6 h-6" />,
      href: email ? `/portal/vault/${encodeURIComponent(email)}` : '/login'
    });
  }

  // Profile is universal
  navItems.push({
    id: 'profile',
    label: email ? 'Profile' : 'Login',
    icon: <User className="w-6 h-6" />,
    href: email ? (role === 'doctor' ? '/portal/doctor' : '/portal') : '/login'
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[100] pb-[env(safe-area-inset-bottom,16px)] pt-2 px-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:hidden">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          // Check if active based on pathname
          const isActive = pathname === item.href || (item.id !== 'home' && pathname.startsWith(item.href.split('?')[0]));
          
          return (
            <Link 
              key={item.id} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full py-1 ${isActive ? 'text-teal-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <div className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
