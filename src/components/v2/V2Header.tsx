"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Settings, Calendar, FileText, LayoutDashboard, Menu, X } from "lucide-react";
import Image from "next/image";

export default function V2Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [userName, setUserName] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      if (email) {
        setIsLoggedIn(true);
        setUserName(name || "User");
      } else {
        setIsLoggedIn(false);
      }
    };
    
    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);
    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

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
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
          <Image src="/logo.png" alt="DehaPa Logo" fill sizes="40px" className="object-contain relative z-10" priority />
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-black text-2xl md:text-3xl tracking-tight text-[#0a2540] leading-none">
            DehaPa
          </span>
          <span className="text-[9px] md:text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-tight mt-0.5">
            Your Health, Our Mission
          </span>
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="hidden lg:flex gap-3 items-center h-full">
        <Link href="/" className="text-sm font-bold text-blue-700 hover:text-blue-800 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-4 py-2 rounded-full transition-all shadow-sm">
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
          <div className="flex items-center gap-2 lg:gap-3">
            <Link href="/login" className="text-xs lg:text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-2 lg:px-4 py-2">
              Login
            </Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm font-bold py-2 lg:py-2.5 px-3 lg:px-6 rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5">
              Sign Up
            </Link>
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
                    <p className="text-sm font-bold text-slate-800">{userName}</p>
                    <p className="text-xs text-slate-500 font-medium truncate">My Account</p>
                  </div>
                  
                  {/* Menu Links */}
                  <div className="py-2">
                    <Link href="/portal" className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-slate-400" /> My Dashboard
                    </Link>
                    <Link href="/portal#appointments" className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <Calendar className="w-4 h-4 text-slate-400" /> My Appointments
                    </Link>
                    <Link href="/portal#medical_vault" className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <FileText className="w-4 h-4 text-slate-400" /> Medical Records
                    </Link>
                    <Link href="/portal#settings" className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <Settings className="w-4 h-4 text-slate-400" /> Settings
                    </Link>
                  </div>
                  
                  {/* Logout Footer */}
                  <div className="border-t border-slate-100 py-2">
                    <button 
                      onClick={() => {
                        localStorage.removeItem("sd_current_user_email");
                        localStorage.removeItem("sd_current_user_name");
                        localStorage.removeItem("sd_current_user_uid");
                        localStorage.removeItem("sd_current_user_role");
                        window.dispatchEvent(new Event("sd_auth_change"));
                        setIsLoggedIn(false);
                      }}
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

        {/* Mobile Hamburger Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-slate-700 hover:text-blue-600 transition-colors bg-white/40 backdrop-blur-md rounded-xl border border-white/60 shadow-sm"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-white/80 shadow-2xl flex flex-col py-4 px-6 z-50 transition-all">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-lg font-bold text-slate-800 border-b border-slate-100 flex items-center gap-2">
            Home
          </Link>
          
          <div className="py-3 border-b border-slate-100 flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Find Care</span>
            <Link href="/search/doctors" onClick={() => setIsMobileMenuOpen(false)} className="pl-4 py-2 text-base font-bold text-slate-700 hover:text-blue-600">Doctors</Link>
            <Link href="/search/hospitals" onClick={() => setIsMobileMenuOpen(false)} className="pl-4 py-2 text-base font-bold text-slate-700 hover:text-blue-600">Hospitals</Link>
            <Link href="/search/labs" onClick={() => setIsMobileMenuOpen(false)} className="pl-4 py-2 text-base font-bold text-slate-700 hover:text-blue-600">Labs</Link>
            <Link href="/search/pharmacies" onClick={() => setIsMobileMenuOpen(false)} className="pl-4 py-2 text-base font-bold text-slate-700 hover:text-blue-600">Pharmacies</Link>
          </div>

          <div className="py-3 border-b border-slate-100 flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Telehealth</span>
            <Link href="/search/doctors?mode=instant" onClick={() => setIsMobileMenuOpen(false)} className="pl-4 py-2 text-base font-bold text-slate-700 hover:text-indigo-600">Instant Video Call</Link>
            <Link href="/search/doctors?mode=schedule" onClick={() => setIsMobileMenuOpen(false)} className="pl-4 py-2 text-base font-bold text-slate-700 hover:text-indigo-600">Schedule Consultation</Link>
          </div>

          <Link href="/join" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-lg font-bold text-slate-800 flex items-center gap-2 mt-2">
            For Providers
          </Link>
        </div>
      )}
    </header>
  );
}
