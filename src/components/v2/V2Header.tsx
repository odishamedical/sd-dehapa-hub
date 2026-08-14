"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Settings, Calendar, FileText, LayoutDashboard } from "lucide-react";
import Image from "next/image";

export default function V2Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  // Mock state to demonstrate both Auth views easily for you
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Smooth scroll background effect instead of hiding the header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 h-20 md:h-24 flex items-center justify-between px-8 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-2xl border-b border-white/60 shadow-md' 
          : 'bg-white/30 backdrop-blur-md border-b border-white/40 shadow-sm'
      }`}
    >
      {/* Logo */}
      <Link href="/v2" className="flex items-center gap-2 group">
        <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
          <Image src="/logo.png" alt="DehaPa Logo" fill sizes="40px" className="object-contain relative z-10" priority />
        </div>
        <span className="font-black text-2xl tracking-tight text-[#0a2540]">
          dehapa<span className="text-blue-600">.v2</span>
        </span>
      </Link>

      {/* Main Navigation */}
      <nav className="hidden lg:flex gap-3 items-center h-full">
        <Link href="/v2" className="text-sm font-bold text-blue-700 hover:text-blue-800 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-4 py-2 rounded-full transition-all shadow-sm">
          Home
        </Link>
        
        {/* Find Care Dropdown */}
        <div className="relative group flex items-center">
          <button className="text-sm font-bold text-slate-700 group-hover:text-blue-700 bg-white/40 hover:bg-white/60 border border-white/60 px-4 py-2 rounded-full transition-all shadow-sm flex items-center gap-1">
            Find Care <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
          </button>
          <div className="absolute top-12 left-0 w-56 bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top group-hover:translate-y-0 translate-y-2">
            <Link href="/search/doctors" className="block px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">Doctors</Link>
            <Link href="/search/hospitals" className="block px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">Hospitals</Link>
            <Link href="/search/labs" className="block px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">Labs</Link>
            <Link href="/search/pharmacies" className="block px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">Pharmacies</Link>
          </div>
        </div>

        {/* Telehealth Dropdown */}
        <div className="relative group flex items-center">
          <button className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 bg-white/40 hover:bg-white/60 border border-white/60 px-4 py-2 rounded-full transition-all shadow-sm flex items-center gap-1">
            Telehealth <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
          </button>
          <div className="absolute top-12 left-0 w-60 bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top group-hover:translate-y-0 translate-y-2">
            <Link href="/search/doctors?mode=instant" className="block px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600">Instant Video Call</Link>
            <Link href="/search/doctors?mode=schedule" className="block px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600">Schedule Consultation</Link>
          </div>
        </div>

        <Link href="/join" className="text-sm font-bold text-slate-700 hover:text-teal-700 bg-white/40 hover:bg-white/60 border border-white/60 px-4 py-2 rounded-full transition-all shadow-sm">
          For Providers
        </Link>
      </nav>

      {/* Auth & Actions */}
      <div className="flex items-center gap-4">
        {/* Toggle State Button (Just for you to easily test the UI) */}
        <button 
          onClick={() => setIsLoggedIn(!isLoggedIn)} 
          className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border border-slate-200 px-2 py-1 rounded hidden lg:block hover:bg-slate-50 hover:text-slate-600 transition-colors"
          title="Toggle Login State for Demo"
        >
          Toggle Auth
        </button>

        {!isLoggedIn ? (
          <div className="flex items-center gap-3">
            <button className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-4 py-2">
              Login
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5">
              Sign Up
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2.5 text-slate-600 hover:text-blue-600 transition-colors bg-white/40 backdrop-blur-md rounded-full border border-white/60 shadow-sm hover:shadow-md">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            {/* User Avatar Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
                className="flex items-center gap-2 p-1 pr-3 bg-white/60 backdrop-blur-md border border-white/80 rounded-full shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                  JS
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">John</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl rounded-2xl py-2 z-50 overflow-hidden transform origin-top-right transition-all">
                  
                  {/* User Info Header */}
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-800">John Smith</p>
                    <p className="text-xs text-slate-500 font-medium truncate">john.smith@example.com</p>
                  </div>
                  
                  {/* Menu Links */}
                  <div className="py-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-slate-400" /> My Dashboard
                    </Link>
                    <Link href="/dashboard/appointments" className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <Calendar className="w-4 h-4 text-slate-400" /> My Appointments
                    </Link>
                    <Link href="/dashboard/records" className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <FileText className="w-4 h-4 text-slate-400" /> Medical Records
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <Settings className="w-4 h-4 text-slate-400" /> Settings
                    </Link>
                  </div>
                  
                  {/* Logout Footer */}
                  <div className="border-t border-slate-100 py-2">
                    <button 
                      onClick={() => setIsLoggedIn(false)}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
