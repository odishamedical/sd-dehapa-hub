"use client";

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, Users } from 'lucide-react';

interface InviteWidgetProps {
  userUid: string | null;
  userName?: string | null;
}

export default function InviteWidget({ userUid, userName }: InviteWidgetProps) {
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState<string>('');
  const [activeUid, setActiveUid] = useState<string | null>(null);

  useEffect(() => {
    const uidToUse = userUid || (typeof window !== 'undefined' ? localStorage.getItem("sd_current_user_email") : null);
    setActiveUid(uidToUse);
    
    if (uidToUse) {
      const shortCode = uidToUse.substring(0, 8).toUpperCase();
      setReferralCode(shortCode);
    }
  }, [userUid]);

  if (!activeUid) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dehapa.com';
  const inviteLink = `${origin}/invite/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Hi! I've joined DehaPa. Click here to connect with me and access my health vault securely:\n\n${inviteLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm rounded-2xl p-6 relative overflow-hidden group">
      {/* Decorative BG element */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Invite & Connect</h3>
            <p className="text-xs text-slate-500">Share your link to securely connect with your doctors.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white border border-indigo-100 p-2 rounded-xl mb-4">
          <div className="flex-1 px-2 text-sm font-mono text-slate-600 truncate">
            {typeof window !== 'undefined' ? window.location.host : 'dehapa.com'}/invite/<span className="font-bold text-indigo-600">{referralCode}</span>
          </div>
          <button 
            onClick={handleCopy}
            className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors shrink-0"
            title="Copy Link"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <button 
          onClick={handleShareWhatsApp}
          className="w-full py-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-[0_4px_14px_rgba(37,211,102,0.3)]"
        >
          <Share2 className="w-4 h-4" />
          Share via WhatsApp
        </button>
      </div>
    </div>
  );
}
