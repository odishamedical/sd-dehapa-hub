"use client";

import React from "react";

interface AdBannerProps {
  type: "image" | "adsense" | "youtube";
  src?: string; // For image or youtube
  client?: string; // For adsense
  slot?: string; // For adsense
}

export default function AdBanner({ type, src, client, slot }: AdBannerProps) {
  return (
    <div className="w-full my-8 bg-[linear-gradient(135deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.1)_40%,rgba(255,255,255,0.0)_100%)] backdrop-blur-2xl border border-white/50 rounded-3xl p-1 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),0_15px_35px_rgba(0,100,200,0.12)] relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
       
       <span className="absolute top-2 right-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase z-10 bg-white/40 px-2 py-0.5 rounded-full backdrop-blur-md">Sponsored</span>

       <div className="w-[98%] h-[90%] border border-dashed border-slate-400/30 rounded-2xl flex items-center justify-center bg-white/20 relative overflow-hidden">
          
          {type === "image" && src && (
            <img src={src} alt="Advertisement" className="w-full h-full object-cover" />
          )}

          {type === "youtube" && src && (
            <iframe 
               src={src} 
               className="w-full h-full"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
            />
          )}

          {type === "adsense" && client && slot && (
            <div className="text-slate-500 font-bold tracking-widest uppercase text-xs text-center p-4">
              [ AdSense Zone: {client} / {slot} ]<br/>
              <span className="text-[10px] opacity-70">Will render Google Ad script in production</span>
            </div>
          )}

          {!src && type !== "adsense" && (
            <span className="text-slate-500 font-bold tracking-widest uppercase text-sm">[ AD INJECTION ZONE ]</span>
          )}

       </div>
    </div>
  );
}
