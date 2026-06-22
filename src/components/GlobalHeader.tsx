"use client";

import React, { useState, useEffect, useRef } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, where, getDocs } from "firebase/firestore";
import GlobalAvatarWidget from "./GlobalAvatarWidget";
import DoctorStatusToggle from "./DoctorStatusToggle";
import GlobalNotifications from "./GlobalNotifications";

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

      // SSO connection completely severed for native Dehapa security.
      // (SSO parameters from URL are ignored)

      const savedEmail = localStorage.getItem("sd_current_user_email");
      setUserEmail(savedEmail);
      setUserName(localStorage.getItem("sd_current_user_name"));
      setUserAvatar(localStorage.getItem("sd_current_user_avatar"));
      
      let savedRole = localStorage.getItem("sd_current_user_role");
      if (savedRole) {
        savedRole = savedRole.toLowerCase();
        if (savedRole === "user") {
          savedRole = "patient";
        }
        localStorage.setItem("sd_current_user_role", savedRole);
      }
      
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

  // ── AUTO-UPGRADE ROLE TO PROVIDER ────────────────────────────────────────────
  // If the admin approved their profile in the Directory, they own a verified doc.
  // We check this on load, and if so, upgrade their role so they see the right dashboard.
  useEffect(() => {
    if (!userEmail) return;
    const checkProviderRole = async () => {
      const app2 = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const db2 = getFirestore(app2, "default");
      try {
        const q = query(
          collection(db2, "directory"),
          where("ownerEmail", "==", userEmail)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          // Find the first verified profile for this user (tolerate boolean/string verified)
          const verifiedProfileDoc = snap.docs.find(d => {
            const data = d.data();
            const isVerified = data.verified === true || data.verified === 'true';
            return isVerified;
          });
          
          if (verifiedProfileDoc) {
            const profile = verifiedProfileDoc.data();
            let newRole = "doctor"; // default assumption if missing
            if (profile.category) newRole = profile.category.toLowerCase();
            
            const currentRole = localStorage.getItem("sd_current_user_role");
            if (currentRole !== newRole && currentRole !== "super_admin" && currentRole !== "admin") {
               localStorage.setItem("sd_current_user_role", newRole);
               setUserRole(newRole);
               window.dispatchEvent(new Event("sd_role_upgraded"));
            }
          }
        }
      } catch(e) {
         console.warn("Failed to check provider role:", e);
      }
    };
    checkProviderRole();
  }, [userEmail]);
  // ─────────────────────────────────────────────────────────────────────────────

  // ── REAL-TIME ROLE SYNC ────────────────────────────────────────────────────
  useEffect(() => {
    const email = localStorage.getItem("sd_current_user_email");
    if (!email) return;
    
    const app2 = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db2 = getFirestore(app2, "default");
    
    // We need to dynamically import doc because it might not be imported at the top
    import("firebase/firestore").then(({ collection, query, where, onSnapshot }) => {
      const q = query(collection(db2, "users"), where("email", "==", email));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const data = snap.docs[0].data();
          const currentRole = localStorage.getItem("sd_current_user_role");
          if (data.role && data.role !== currentRole) {
            localStorage.setItem("sd_current_user_role", data.role);
            setUserRole(data.role);
            window.dispatchEvent(new Event("sd_auth_change"));
          }
        }
      });
      return unsub;
    }).catch(err => console.warn("Role sync failed", err));
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
    <header className="sticky top-0 z-[100] bg-[#020810]/80 backdrop-blur-3xl border-b border-teal-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-between px-6 lg:px-12 h-24 transition-all duration-300">
      {/* 1. Web Name / Logo */}
      <div className="flex items-center gap-4">
        <a href="/" className="flex items-center gap-4 group">
          <div className="relative w-16 h-16 flex items-center justify-center transition-transform group-hover:scale-105">
            {/* Added unoptimized tag or use a regular img tag to prevent Next.js from breaking the path if not configured */}
            <img src="/logo.png" alt="DehaPa Logo" className="w-full h-full object-contain relative z-10" />
            <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-xl group-hover:bg-teal-400/40 transition-colors pointer-events-none"></div>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-2xl sm:text-3xl font-black tracking-wide text-white font-serif drop-shadow-md">
              Dehapa
            </span>
            <span className="text-xs sm:text-sm text-teal-300 tracking-[0.1em] font-medium group-hover:text-cyan-300 transition-colors">Your Health Our Mission</span>
          </div>
        </a>
      </div>

      {/* 2. Menu */}
      <nav className="hidden md:flex items-center gap-3">
        <a href="/doctors" className="relative group bg-slate-900 border border-teal-500/30 hover:border-cyan-400 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest text-teal-300 hover:text-cyan-200 transition-all shadow-[0_0_15px_rgba(20,184,166,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] overflow-hidden">
          <span className="relative z-10">Find Specialists</span>
          <div className="absolute inset-0 h-full w-full bg-cyan-400/10 -skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
        </a>
        {(!userRole || userRole === 'user' || userRole === 'patient') && (
          <a href="/join" className="relative group bg-slate-900 border border-amber-500/30 hover:border-orange-400 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest text-amber-300 hover:text-orange-200 transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(249,115,22,0.3)] overflow-hidden">
            <span className="relative z-10">Join as Provider</span>
            <div className="absolute inset-0 h-full w-full bg-orange-400/10 -skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          </a>
        )}
      </nav>

      {/* 3. User Menu / Auth */}
      <div className="flex items-center gap-2 md:gap-4 relative" ref={dropdownRef}>
        
        {/* Hamburger Button (Mobile Only) */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>

        {/* DoctorStatusToggle */}
        <DoctorStatusToggle />

        {/* Real-time Notifications */}
        <GlobalNotifications userEmail={userEmail} />

        {userEmail ? (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 focus:outline-none cursor-pointer bg-slate-800/50 hover:bg-slate-700/80 border border-slate-700 hover:border-teal-500/50 rounded-full py-1.5 px-2 pr-4 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
            >
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-teal-500/50 group-hover:shadow-[0_0_10px_rgba(20,184,166,0.5)] transition-all" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-white flex items-center justify-center font-black text-xs shadow-[0_0_10px_rgba(20,184,166,0.5)]">
                  {userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left">
                 <span className="text-xs font-bold text-white tracking-wide max-w-[120px] truncate">{userName || "User"}</span>
                 {userRole && <span className="text-[9px] text-cyan-400 font-mono uppercase tracking-widest leading-none mt-0.5">{userRole.replace("_", " ")}</span>}
              </div>
              <svg className={`w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </button>
            
            {/* The Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-4 w-72 bg-[#0a111a]/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] py-3 z-[110] text-left overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800/50 bg-slate-800/20">
                  <p className="text-sm font-black text-white truncate">{userName || userEmail.split("@")[0]}</p>
                  <p className="text-xs text-slate-400 truncate mt-1 font-mono">{userEmail}</p>
                </div>
                
                {/* ROLE-BASED MENUS */}
                {(!userRole || userRole === "patient") && (
                  <div className="py-2">
                    <a href="/portal#vault" className="flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors group">
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      <span className="font-bold">My Profile & Vault</span>
                    </a>
                    <a href="/portal#appointments" className="flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors group">
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <span className="font-bold">My Appointments</span>
                    </a>
                    <a href="/portal#vault" className="flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors group">
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <span className="font-bold">Lab Reports</span>
                    </a>
                    <a href="/portal#identity" className="flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors group">
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <span className="font-bold">Settings</span>
                    </a>
                  </div>
                )}

                {/* DOCTOR / HOSPITAL / PHARMACY / LAB MENU */}
                {(userRole === "doctor" || userRole === "hospital" || userRole === "pharmacy" || userRole === "lab" || userRole === "ambulance") && (
                  <div className="py-2">
                    <a href={`/portal/${userRole.toLowerCase()}`} className="flex items-center gap-3 px-5 py-3 text-sm text-teal-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors group">
                      <svg className="w-4 h-4 text-teal-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      <span className="font-bold uppercase tracking-widest text-[11px]">{userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard</span>
                    </a>
                    <a href={`/portal/${userRole.toLowerCase()}#appointments`} className="flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors group">
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <span className="font-bold">Appointments & Schedule</span>
                    </a>
                    {userRole === "doctor" && (
                      <a href={`/portal/${userRole.toLowerCase()}#vault`} className="flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors group">
                        <svg className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        <span className="font-bold">Patient Records</span>
                      </a>
                    )}
                    <a href={`/portal/${userRole.toLowerCase()}#home`} className="flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors group">
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span className="font-bold">Earnings & Payouts</span>
                    </a>
                    <a href={`/portal/${userRole.toLowerCase()}#identity`} className="flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors group">
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <span className="font-bold">Settings</span>
                    </a>
                  </div>
                )}

                {/* SUPER ADMIN MENU */}
                {(userRole === "super_admin" || userRole === "admin") && (
                  <div className="py-2">
                    <a href="/portal/admin" className="flex items-center gap-3 px-5 py-3 text-sm text-yellow-500 hover:bg-yellow-500/10 transition-colors group">
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                      <span className="font-bold uppercase tracking-widest text-[10px]">Super Admin Panel</span>
                    </a>
                  </div>
                )}

                <div className="py-2 border-t border-slate-800/50 bg-red-900/10">
                  <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors text-left group">
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" /></svg>
                    <span className="font-bold uppercase tracking-widest text-[10px]">Disconnect</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <a href={getAuthCenterUrl()} className="relative group bg-teal-600 border border-teal-400 hover:bg-teal-500 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest text-white transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] overflow-hidden hidden sm:inline-flex items-center justify-center">
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"></path></svg>
              Access Portal
            </span>
            <div className="absolute inset-0 h-full w-full bg-white/20 -skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          </a>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-slate-900 border-b border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] md:hidden flex flex-col z-[90]">
          <a href="/join" className="px-6 py-4 border-b border-slate-800 text-amber-400 font-bold flex items-center gap-3 hover:bg-slate-800 hover:text-orange-400">
            <span className="text-xl">🤝</span> Join as Provider
          </a>
          <a href="/doctors" className="px-6 py-4 border-b border-slate-800 text-slate-300 font-bold flex items-center gap-3 hover:bg-slate-800 hover:text-cyan-400">
            <span className="text-xl">🩺</span> Find Specialists
          </a>
          <a href="/hospitals" className="px-6 py-4 border-b border-slate-800 text-slate-300 font-bold flex items-center gap-3 hover:bg-slate-800 hover:text-cyan-400">
            <span className="text-xl">🏥</span> Hospitals
          </a>
          <a href="/labs" className="px-6 py-4 border-b border-slate-800 text-slate-300 font-bold flex items-center gap-3 hover:bg-slate-800 hover:text-cyan-400">
            <span className="text-xl">🔬</span> Labs
          </a>
          <a href="/pharmacies" className="px-6 py-4 border-b border-slate-800 text-slate-300 font-bold flex items-center gap-3 hover:bg-slate-800 hover:text-cyan-400">
            <span className="text-xl">💊</span> Pharmacies
          </a>
          <a href="/ambulances" className="px-6 py-4 border-b border-slate-800 text-slate-300 font-bold flex items-center gap-3 hover:bg-slate-800 hover:text-cyan-400">
            <span className="text-xl">🚑</span> Ambulances
          </a>
          {!userEmail && (
            <div className="p-6 bg-slate-950 border-t border-slate-800">
               <a href={getAuthCenterUrl()} className="block w-full text-center font-bold bg-teal-600 hover:bg-teal-500 text-white px-5 py-3 rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                 Initialize Access
               </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
