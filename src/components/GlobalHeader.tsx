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

  return null;
}
