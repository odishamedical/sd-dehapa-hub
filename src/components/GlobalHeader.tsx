"use client";

import React, { useState, useEffect, useRef } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8",
  authDomain: "sd-auth-center.firebaseapp.com",
  projectId: "sd-auth-center",
  storageBucket: "sd-auth-center.firebasestorage.app",
  messagingSenderId: "393346058191",
  appId: "1:393346058191:web:a5e96e1c481a72f86db4ba"
};

const logReferralTraffic = async (referrerId: string, inviteName: string, originHub: string) => {
  try {
    let geo = { ip: "unknown", city: "unknown", region: "unknown", country: "unknown" };
    try {
      const geoRes = await fetch("https://ipapi.co/json/");
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        geo = {
          ip: geoData.ip || "unknown",
          city: geoData.city || "unknown",
          region: geoData.region || "unknown",
          country: geoData.country_name || "unknown"
        };
      }
    } catch (e) {
      console.warn("GeoIP lookup failed, recording fallback...", e);
    }

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app, "default");
    
    await addDoc(collection(db, "referral_traffic"), {
      referrerId,
      inviteName,
      ip: geo.ip,
      city: geo.city,
      region: geo.region,
      country: geo.country,
      originHub,
      timestamp: new Date().toISOString()
    });
    console.log("Logged referral traffic successfully.");
  } catch (err) {
    console.error("Error logging referral traffic to Firestore:", err);
  }
};

interface GlobalHeaderProps {
  activeProject?: "Gold Hub" | "Sambalpuri Hub" | "Telemedicine" | "News" | "Directory" | "IT Service";
}

export default function GlobalHeader({ activeProject }: GlobalHeaderProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [ecosystemMenuOpen, setEcosystemMenuOpen] = useState(false);
  const [inviteName, setInviteName] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const AUTH_KEYS = [
    "sd_current_user_email","sd_current_user_name","sd_current_user_avatar",
    "sd_current_user_role","sd_current_user_uid","sd_current_user_profile_complete",
  ];

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);

      // ── SIGNOUT INTERCEPTION ─────────────────────────────────────────────
      // auth-center /signout redirects back with ?sd_signout=1 after killing Firebase.
      // localStorage is domain-scoped — we must clear OUR domain storage here.
      if (params.get("sd_signout") === "1") {
        AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
        sessionStorage.clear();
        setUserEmail(null); setUserName(null); setUserAvatar(null); setUserRole(null);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      // ─────────────────────────────────────────────────────────────────────

      const ssoEmail = params.get("sso_email");
      const ssoName = params.get("sso_name");
      const ssoAvatar = params.get("sso_avatar");
      const ssoRole = params.get("sso_role");
      const ssoProfileComplete = params.get("sso_profile_complete");

      if (ssoEmail) {
        localStorage.setItem("sd_current_user_email", ssoEmail);
        if (ssoName) localStorage.setItem("sd_current_user_name", ssoName);
        if (ssoAvatar) localStorage.setItem("sd_current_user_avatar", ssoAvatar);
        if (ssoRole) localStorage.setItem("sd_current_user_role", ssoRole);
        if (ssoProfileComplete) localStorage.setItem("sd_current_user_profile_complete", ssoProfileComplete);
        
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      const savedEmail = localStorage.getItem("sd_current_user_email");
      setUserEmail(savedEmail);
      setUserName(localStorage.getItem("sd_current_user_name"));
      setUserAvatar(localStorage.getItem("sd_current_user_avatar"));
      
      let savedRole = localStorage.getItem("sd_current_user_role");
      if (savedEmail === 'odishamedical@gmail.com') savedRole = 'super_admin';
      setUserRole(savedRole);
      
      // Parse invite name and referral code
      const invite = params.get("invite_name");
      const refCode = params.get("ref");
      
      if (invite) {
        sessionStorage.setItem("sd_invite_name", invite);
        if (refCode) {
          sessionStorage.setItem("sd_invite_ref", refCode);
        }
      }
      
      if (refCode) {
        sessionStorage.setItem("sd_invite_ref", refCode);
        localStorage.setItem("sd_referral_id", refCode);
        
        // Log referral traffic
        const hasLoggedVisit = sessionStorage.getItem(`sd_logged_visit_${refCode}`);
        if (!hasLoggedVisit) {
          sessionStorage.setItem(`sd_logged_visit_${refCode}`, "true");
          logReferralTraffic(refCode, invite || "Guest", activeProject || "Unknown Hub");
        }
      }

      setInviteName(sessionStorage.getItem("sd_invite_name"));

      // Auto-detect Admin Mode from pathname prefix
      const path = window.location.pathname;
      const isAd = path.startsWith("/admin") || 
                   path.startsWith("/portal") || 
                   path.startsWith("/franchise") || 
                   path.startsWith("/weaver") || 
                   path.startsWith("/store");
      setIsAdminMode(isAd);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);

    // Cross-domain sign-out: when another tab/domain removes the auth key, clear ours too
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sd_current_user_email" && e.newValue === null) {
        ["sd_current_user_email","sd_current_user_name","sd_current_user_avatar",
         "sd_current_user_role","sd_current_user_uid","sd_current_user_profile_complete"].forEach(
          (k) => localStorage.removeItem(k)
        );
        setUserEmail(null); setUserName(null); setUserAvatar(null); setUserRole(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("sd_auth_change", checkAuth);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ── UNIVERSAL SIGNOUT LISTENER ─────────────────────────────────────────────
  // When any SD project signs out, it writes to Firestore "signout_broadcast".
  // This onSnapshot listener detects that event in real-time and clears THIS
  // domain's localStorage immediately — achieving true cross-domain signout.
  const pageLoadTimeRef = useRef(Date.now());
  useEffect(() => {
    if (!userEmail) return;
    const app2 = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db2 = getFirestore(app2, "default");
    // ── FIX: No orderBy — avoids composite index requirement.
    // Use docChanges() to skip pre-existing docs and only react to NEW additions.
    let isInitialLoad = true;
    const q = query(
      collection(db2, "signout_broadcast"),
      where("email", "==", userEmail)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (isInitialLoad) { isInitialLoad = false; return; }
      snap.docChanges().forEach((change) => {
        if (change.type === "added") {
          // New signout event — clear THIS domain immediately
          AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
          sessionStorage.clear();
          setUserEmail(null); setUserName(null); setUserAvatar(null); setUserRole(null);
        }
      });
    }, (err) => console.warn("Signout broadcast listener error:", err));
    return () => unsub();
  }, [userEmail]);
  // ─────────────────────────────────────────────────────────────────────────────

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out?")) {
      import('firebase/auth').then(({ getAuth, signOut }) => {
        signOut(getAuth());
        ["sd_current_user_email","sd_current_user_name","sd_current_user_avatar",
         "sd_current_user_role","sd_current_user_uid","sd_current_user_profile_complete"].forEach(
          (k) => localStorage.removeItem(k)
        );
        sessionStorage.clear();
        window.location.href = "/";
      });
    }
  };


  const projects = [
    { name: "Gold Hub",       shortName: "Gold",   icon: "💛", url: "https://sd-gold-hub.vercel.app",     adminPath: "/admin" },
    { name: "Sambalpuri Hub", shortName: "Saree",  icon: "🧵", url: "https://sd-bhulia-hub.vercel.app",   adminPath: "/franchise/dashboard" },
    { name: "Telemedicine",   shortName: "Health", icon: "🏥", url: "https://sd-dehapa-hub.vercel.app",   adminPath: "/portal" },
    { name: "News",           shortName: "News",   icon: "📰", url: "https://sd-news-hub.vercel.app",     adminPath: "/admin" },
    { name: "Directory",      shortName: "Dir",    icon: "🧭", url: "https://sd-directory.vercel.app",    adminPath: "/admin" },
    { name: "IT Service",     shortName: "IT",     icon: "💻", url: "https://sd-it-hub-w3sk.vercel.app", adminPath: "/admin" }
  ];

  const getDynamicUrl = (prodUrl: string) => {
    if (typeof window === "undefined") return prodUrl;
    if (window.location.hostname !== "localhost") return prodUrl;
    
    if (prodUrl.includes("sd-auth-center")) return "http://localhost:3000";
    if (prodUrl.includes("sd-gold-hub")) return "http://localhost:3001";
    if (prodUrl.includes("sd-bhulia-hub")) return "http://localhost:3002";
    if (prodUrl.includes("sd-dehapa-hub")) return "http://localhost:3003";
    if (prodUrl.includes("sd-directory")) return "http://localhost:3004";
    if (prodUrl.includes("sd-news-hub")) return "http://localhost:3005";
    if (prodUrl.includes("sd-it-hub")) return "http://localhost:3006";
    return prodUrl;
  };

  const getAuthCenterUrl = () => "/login";

  const getProjectUrl = (baseUrl: string, adminPath: string) => {
    const dynamicBase = getDynamicUrl(baseUrl);
    const finalUrlString = isAdminMode ? (dynamicBase + adminPath) : dynamicBase;
    const url = new URL(finalUrlString);
    if (!userEmail) return url.toString();
    
    url.searchParams.set("token", "sso_jump");
    url.searchParams.set("sso_email", userEmail);
    if (userName) url.searchParams.set("sso_name", userName);
    if (userAvatar) url.searchParams.set("sso_avatar", userAvatar);
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("sd_current_user_role");
      if (role) url.searchParams.set("sso_role", role);
      const profileComplete = localStorage.getItem("sd_current_user_profile_complete");
      if (profileComplete) url.searchParams.set("sso_profile_complete", profileComplete);
    }
    return url.toString();
  };

  return (
    <header className="sticky top-0 z-[100] bg-white/90 backdrop-blur-2xl border-b-[3px] border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center justify-between px-6 lg:px-12 h-20 transition-all duration-300">
      {/* 1. Web Name / Logo */}
      <div className="flex items-center gap-4">
        <a href="/" className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(20,184,166,0.4)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-widest text-slate-900 uppercase font-serif">
              DehaPa <span className="text-teal-600">Health</span>
            </span>
            <span className="text-[9px] text-teal-600/80 tracking-[0.2em] uppercase font-mono">Sovereign Medical Network</span>
          </div>
        </a>
      </div>

      {/* 2. Menu */}
      <nav className="hidden md:flex items-center gap-3">
        <a href="/doctors" className="bg-teal-700 hover:bg-teal-800 text-white transition-all rounded-xl border border-teal-600 px-6 py-2.5 font-bold text-sm capitalize shadow-[0_4px_12px_rgba(15,118,110,0.3)] hover:shadow-[0_6px_16px_rgba(15,118,110,0.4)] hover:-translate-y-0.5">Find Specialists</a>
      </nav>

      {/* 3. User Menu / Auth */}
      <div className="flex items-center gap-2 md:gap-4 relative" ref={dropdownRef}>
        
        {/* Hamburger Button (Mobile Only) */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>

        {userEmail ? (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 focus:outline-none cursor-pointer"
            >
              {userAvatar ? (
                <img src={userAvatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-teal-500 hover:scale-105 transition-transform" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xs border-2 border-teal-600 hover:scale-105 transition-transform">
                  {userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()}
                </div>
              )}
              <svg className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-[110] text-left">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900 truncate">{userName || userEmail.split("@")[0]}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
                  {userRole && (
                    <span className="inline-block text-[10px] font-mono font-bold bg-teal-50 text-teal-700 px-2 py-1 rounded mt-2 uppercase tracking-widest border border-teal-100">
                      {userRole.replace("_", " ")}
                    </span>
                  )}
                </div>
                {(userRole === "super_admin" || userRole === "admin") && (
                  <a href="/portal/admin" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100">
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                    <span className="font-bold">Super Admin Dashboard</span>
                  </a>
                )}
                <a href="/login/launcher" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  <span>Ecosystem Launcher</span>
                </a>
                <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-bold border-t border-slate-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" /></svg>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <a href={getAuthCenterUrl()} className="text-[10px] font-bold uppercase tracking-widest bg-teal-700 hover:bg-teal-800 text-white border border-teal-600 px-5 py-2.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(15,118,110,0.3)] hidden sm:inline-block">
            Sign In
          </a>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-2xl md:hidden flex flex-col z-[90]">
          <a href="/doctors" className="px-6 py-4 border-b border-slate-50 text-slate-800 font-bold flex items-center gap-3 hover:bg-slate-50">
            <span className="text-xl">🩺</span> Find Specialists
          </a>
          <a href="/hospitals" className="px-6 py-4 border-b border-slate-50 text-slate-800 font-bold flex items-center gap-3 hover:bg-slate-50">
            <span className="text-xl">🏥</span> Hospitals
          </a>
          <a href="/labs" className="px-6 py-4 border-b border-slate-50 text-slate-800 font-bold flex items-center gap-3 hover:bg-slate-50">
            <span className="text-xl">🔬</span> Labs
          </a>
          <a href="/pharmacies" className="px-6 py-4 border-b border-slate-50 text-slate-800 font-bold flex items-center gap-3 hover:bg-slate-50">
            <span className="text-xl">💊</span> Pharmacies
          </a>
          <a href="/ambulances" className="px-6 py-4 text-slate-800 font-bold flex items-center gap-3 hover:bg-slate-50">
            <span className="text-xl">🚑</span> Ambulances
          </a>
          {!userEmail && (
            <div className="p-6 bg-slate-50 border-t border-slate-200">
               <a href={getAuthCenterUrl()} className="block w-full text-center font-bold bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl shadow-md">
                 Sign In / Register
               </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
