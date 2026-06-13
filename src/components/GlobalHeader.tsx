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

      setUserEmail(localStorage.getItem("sd_current_user_email"));
      setUserName(localStorage.getItem("sd_current_user_name"));
      setUserAvatar(localStorage.getItem("sd_current_user_avatar"));
      setUserRole(localStorage.getItem("sd_current_user_role"));
      
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
    if (confirm("Are you sure you want to sign out from the SD Ecosystem?")) {
      const authBase = window.location.hostname === "localhost" ? "http://localhost:3000" : "https://sd-auth-center.vercel.app";
      const returnUrl = encodeURIComponent(window.location.origin + "/");
      window.location.href = `${authBase}/signout?redirect=${returnUrl}`;
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

  const getAuthCenterUrl = () => {
    if (typeof window === "undefined") return "https://sd-auth-center.vercel.app";
    const authCenterBase = window.location.hostname === "localhost" 
      ? "http://localhost:3000" 
      : "https://sd-auth-center.vercel.app";
    const ref = sessionStorage.getItem("sd_invite_ref") || "";
    const inviteName = sessionStorage.getItem("sd_invite_name") || "";
    const params = new URLSearchParams();
    params.set("redirect_uri", window.location.href);
    if (ref) params.set("ref", ref);
    if (inviteName) params.set("invite_name", inviteName);
    return `${authCenterBase}?${params.toString()}`;
  };

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
    <>
    <div className="flex w-full h-[40px] bg-[#ffffff] border-b border-[#0d9488]/20 items-center justify-between px-3 md:px-6 font-sans sticky top-0 z-[100]">
      {/* Dynamic inline styles for 3D button, pulse effect, and scrollbar removal */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes goldPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.6), 0 3px 0 #784f0e, 0 4px 6px rgba(0,0,0,0.4);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(13, 148, 136, 0), 0 3px 0 #784f0e, 0 4px 6px rgba(0,0,0,0.4);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(13, 148, 136, 0), 0 3px 0 #784f0e, 0 4px 6px rgba(0,0,0,0.4);
          }
        }
        .active-pulse-button {
          animation: goldPulse 2s infinite;
          background: linear-gradient(180deg, #FFE082 0%, #0d9488 50%, #996515 100%);
          border-bottom: 3px solid #784f0e;
          text-shadow: 0 1px 0 rgba(255,255,255,0.3);
          transform: translateY(-2px);
          color: #ffffff !important;
          border-radius: 6px;
          padding: 3px 10px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          transition: all 0.2s ease;
        }
        .active-pulse-button:active {
          transform: translateY(0px);
          border-bottom: 1px solid #784f0e;
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sdPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .sd-pulse-dot { animation: sdPulse 2s ease-in-out infinite; }
      `}} />

      {/* ZONE 1: BRANDING — compact SD on mobile, full ECOSYSTEM on desktop */}
      <a href="https://sd-auth-center.vercel.app/launcher" className="md:hidden flex items-center gap-1.5 text-[#0d9488] hover:brightness-110 transition-all shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="text-[9px] font-black tracking-[0.15em] uppercase font-mono">SD</span>
      </a>
      <a href="https://sd-auth-center.vercel.app/launcher" className="hidden md:flex items-center gap-2 text-[#0d9488] hover:brightness-110 transition-all shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="text-[10px] font-black tracking-[0.2em] uppercase font-mono">SD ECOSYSTEM</span>
        {isAdminMode && (
          <span className="text-[8px] font-extrabold bg-[#0d9488]/20 text-[#0d9488] px-1.5 py-0.5 rounded border border-[#0d9488]/30 uppercase tracking-widest font-mono shrink-0">ADMIN</span>
        )}
      </a>

      {/* ZONE 2: ACTIVE PILL (mobile) / TAB ROW (desktop) */}
      <div className="md:hidden flex-1 flex justify-center px-2 min-w-0">
        <span className="text-[8px] font-bold uppercase tracking-widest text-[#0d9488] bg-[#0d9488]/10 border border-[#0d9488]/25 px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
          <span className="sd-pulse-dot w-1.5 h-1.5 rounded-full bg-[#0d9488] inline-block flex-shrink-0" />
          <span className="truncate max-w-[110px]">{activeProject || "SD Ecosystem"}</span>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-4 lg:gap-6 h-full py-1 overflow-x-auto scrollbar-none flex-nowrap #0f172aspace-nowrap">
        {projects.map((p) => {
          const isActive = activeProject === p.name;
          return (
            <a key={p.name} href={getProjectUrl(p.url, p.adminPath)}
              className={isActive ? "active-pulse-button text-[10px] uppercase tracking-widest shrink-0" : "text-[10px] font-bold text-#475569 hover:text-[#0d9488] uppercase tracking-widest transition-colors py-1 px-3 shrink-0"}
            >{p.name}</a>
          );
        })}
      </div>

      {/* ZONE 3: USER AUTH (always visible) + HAMBURGER (mobile only) */}
      <div className="flex items-center gap-1.5 md:gap-4 relative shrink-0" ref={dropdownRef}>
        {userEmail ? (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 md:gap-2 focus:outline-none cursor-pointer"
            >
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt="" 
                  className="w-6 h-6 rounded-full object-cover border-2 border-[#0d9488] hover:scale-105 transition-transform" 
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#0d9488] text-[#0A1021] flex items-center justify-center font-bold text-[10px] border-2 border-[#0d9488] hover:scale-105 transition-transform">
                  {userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()}
                </div>
              )}
              <svg className={`w-3.5 h-3.5 text-#475569 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-60 bg-[#ffffff] border border-[#0d9488]/40 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] py-2 z-[110] text-left">
                <div className="px-4 py-2 border-b border-[#e2e8f0]">
                  <p className="text-xs font-bold text-#0f172a truncate">{userName || userEmail.split("@")[0]}</p>
                  <p className="text-[10px] text-#475569 truncate mt-0.5">{userEmail}</p>
                  {userRole && (
                    <span className="inline-block text-[8px] font-mono font-bold bg-[#0d9488]/20 text-[#0d9488] px-1.5 py-0.5 rounded mt-1.5 uppercase tracking-wide">
                      {userRole.replace("_", " ")}
                    </span>
                  )}
                </div>
                
                <a 
                  href="https://sd-auth-center.vercel.app/launcher" 
                  className="flex items-center gap-2 px-4 py-2 text-xs text-#334155 hover:bg-[#0d9488]/10 hover:text-#0f172a transition-colors"
                >
                  <svg className="w-4 h-4 text-[#0d9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Go to Launcher / Dashboard</span>
                </a>

                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-red-950/20 transition-colors text-left font-bold border-t border-[#e2e8f0]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <a 
            href={getAuthCenterUrl()}
            className="text-[9px] md:text-[10px] text-[#0d9488] hover:text-[#e5c158] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
          >
            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
            </svg>
            <span>Sign In</span>
          </a>
        )}
        {/* ☰ Hamburger — mobile only, opens ecosystem project drawer */}
        <button
          onClick={() => setEcosystemMenuOpen(!ecosystemMenuOpen)}
          className="md:hidden flex flex-col justify-center items-center gap-[4px] w-7 h-7 rounded focus:outline-none ml-0.5"
          aria-label="Open SD Ecosystem menu"
        >
          <span className={`block h-[2px] w-4 bg-[#0d9488] rounded-full transition-all duration-200 origin-center ${ecosystemMenuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
          <span className={`block h-[2px] w-4 bg-[#0d9488] rounded-full transition-all duration-200 ${ecosystemMenuOpen ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`block h-[2px] w-4 bg-[#0d9488] rounded-full transition-all duration-200 origin-center ${ecosystemMenuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
        </button>
      </div>
    </div>
    {/* ECOSYSTEM MOBILE DRAWER */}
    {ecosystemMenuOpen && (
      <div
        className="md:hidden fixed top-[40px] left-0 right-0 bottom-0 z-[9999] bg-[#ffffff] overflow-y-auto"
        onClick={() => setEcosystemMenuOpen(false)}
      >
        <div
          className="bg-[#ffffff] border-b border-[#0d9488]/30 shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "slideDown 0.2s ease-out" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-2 text-[#0d9488]">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-[10px] font-black tracking-[0.2em] uppercase font-mono">SD ECOSYSTEM</span>
            </div>
            <button
              onClick={() => setEcosystemMenuOpen(false)}
              className="text-#475569 hover:text-#0f172a transition-colors w-7 h-7 flex items-center justify-center rounded-lg hover:bg-#0f172a/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2.5 p-4">
            {projects.map((p) => {
              const isActive = activeProject === p.name;
              return (
                <a
                  key={p.name}
                  href={getProjectUrl(p.url, p.adminPath)}
                  onClick={() => setEcosystemMenuOpen(false)}
                  className={`flex flex-col items-center gap-2 py-4 px-1 rounded-xl border transition-all min-w-0 ${
                    isActive
                      ? "border-[#0d9488]/60 bg-[#0d9488]/10 shadow-[0_0_12px_rgba(197,160,89,0.15)]"
                      : "border-#0f172a/10 bg-[#f8fafc] hover:border-[#0d9488]/40 hover:bg-[#0d9488]/5"
                  }`}
                >
                  <span className="text-2xl leading-none shrink-0">{p.icon}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest text-center leading-tight w-full px-1 break-words ${isActive ? "text-[#0d9488]" : "text-#334155"}`}>{p.name}</span>
                  {isActive && <span className="text-[7px] font-mono text-[#0d9488]/70 uppercase tracking-widest shrink-0">● Active</span>}
                </a>
              );
            })}
          </div>
          {(userRole === "super_admin" || userRole === "admin") && (
            <div className="px-4 pb-4 pt-1 border-t border-[#e2e8f0]">
              <button
                onClick={() => { setIsAdminMode(!isAdminMode); setEcosystemMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all ${
                  isAdminMode ? "border-[#0d9488]/40 bg-[#0d9488]/10 text-[#0d9488]" : "border-#0f172a/10 bg-[#f8fafc] text-#475569"
                }`}
              >
                <span>Admin Mode</span>
                <span className={`text-[8px] px-2 py-0.5 rounded font-mono font-bold ${isAdminMode ? "bg-[#0d9488] text-[#ffffff]" : "bg-#0f172a/10 text-#475569"}`}>
                  {isAdminMode ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    )}
    {inviteName && (
      <div className="w-full bg-gradient-to-r from-[#996515]/20 via-[#0d9488]/10 to-[#996515]/20 border-b border-[#0d9488]/30 py-2.5 text-center text-[10px] md:text-xs font-semibold text-#0f172a tracking-widest uppercase flex items-center justify-center gap-2">
        <span>✨ Hello Mr/Ms. {inviteName}, welcome to {activeProject || "Shyam Dash Creation"}! We are delighted to host you. ✨</span>
      </div>
    )}
    </>
  );
}
