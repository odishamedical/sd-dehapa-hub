"use client";

import React, { useState } from "react";
import { Share2, Facebook, MessageCircle, Link as LinkIcon, Check } from "lucide-react";

export default function ShareProfileButton() {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: url
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(document.title + " " + url)}`, "_blank");
    setShowMenu(false);
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={handleNativeShare}
        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 h-full"
      >
        <Share2 className="w-5 h-5" />
        <span className="text-sm uppercase tracking-wider">SHARE</span>
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/80 overflow-hidden z-50 animate-in slide-in-from-top-2">
          <button onClick={shareToWhatsApp} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-green-50 hover:text-green-600 transition-colors border-b border-slate-100">
            <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp
          </button>
          <button onClick={shareToFacebook} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-100">
            <Facebook className="w-4 h-4 text-blue-600" /> Facebook
          </button>
          <button onClick={copyToClipboard} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4 text-slate-400" />} 
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}
    </div>
  );
}
