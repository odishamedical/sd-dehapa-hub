"use client";

import React, { useState } from 'react';
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface AppFactoryStudioProps {
  entityData: any;
  providerType: string;
}

export default function AppFactoryStudio({ entityData, providerType }: AppFactoryStudioProps) {
  const [appName, setAppName] = useState(entityData?.appConfig?.appName || entityData?.entityName || "");
  const [primaryColor, setPrimaryColor] = useState(entityData?.appConfig?.primaryColor || "#0f172a");
  const [logoUrl, setLogoUrl] = useState(entityData?.appConfig?.logoUrl || entityData?.logo || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublished, setIsPublished] = useState(!!entityData?.appConfig?.isPublished);

  const handlePublish = async () => {
    if (!entityData?.id) return;
    setIsProcessing(true);
    
    try {
      await updateDoc(doc(db, "directory", entityData.id), {
        appConfig: {
          appName,
          primaryColor,
          logoUrl,
          isPublished: true,
          publishedAt: new Date().toISOString()
        }
      });
      
      setIsPublished(true);
      alert("App Configuration Published! Your patients can now install your custom PWA.");
      
    } catch (err) {
      console.error("Publish failed:", err);
      alert("Failed to publish app configuration.");
    } finally {
      setIsProcessing(false);
    }
  };

  const appUrl = typeof window !== 'undefined' ? `${window.location.origin}/app/${entityData?.id}` : `https://dehapa.com/app/${entityData?.id}`;

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.8)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
              <span className="text-xl">📱</span>
            </div>
            White-Label App Studio
          </h3>
          <p className="text-sm text-slate-600 mt-2 font-medium">Generate your own custom-branded Patient App. No app store approval required.</p>
        </div>
        
        {isPublished && (
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
            <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">App Live</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Editor Side */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10"></div>
             
             <h4 className="font-bold text-slate-800 mb-6 uppercase tracking-widest text-xs">App Customization</h4>
             
             <div className="space-y-5">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">App Name (max 15 chars)</label>
                 <input 
                   type="text" 
                   value={appName}
                   onChange={(e) => setAppName(e.target.value.substring(0, 15))}
                   className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                   placeholder="e.g. Dr Sharma"
                 />
               </div>
               
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Primary Brand Color</label>
                 <div className="flex gap-4 items-center">
                   <input 
                     type="color" 
                     value={primaryColor}
                     onChange={(e) => setPrimaryColor(e.target.value)}
                     className="w-14 h-14 rounded-xl cursor-pointer border-2 border-slate-200 p-1 bg-white"
                   />
                   <span className="font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                     {primaryColor}
                   </span>
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">App Icon URL</label>
                 <input 
                   type="text" 
                   value={logoUrl}
                   onChange={(e) => setLogoUrl(e.target.value)}
                   className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all"
                   placeholder="https://..."
                 />
                 <p className="text-[10px] text-slate-400 mt-2 font-medium">Must be a square PNG image (512x512 recommended).</p>
               </div>
             </div>
          </div>
          
          <button 
            onClick={handlePublish}
            disabled={isProcessing}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-[0_5px_20px_rgba(15,23,42,0.3)] transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-70"
          >
            {isProcessing ? 'Generating...' : (isPublished ? 'Update App Config' : '🚀 Publish My App')}
          </button>
          
          {isPublished && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex flex-col items-center text-center">
              <h5 className="font-bold text-indigo-900 mb-1">Your App is Ready!</h5>
              <p className="text-xs text-indigo-700/80 mb-4">Share this link or print a QR code for your waiting room.</p>
              
              <div className="bg-white border-2 border-indigo-200 p-4 rounded-xl mb-4 w-48 h-48 flex items-center justify-center">
                 {/* Mock QR Code */}
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(appUrl)}`} alt="QR Code" className="opacity-90 mix-blend-multiply" />
              </div>
              
              <code className="text-xs font-bold bg-white px-3 py-2 rounded-lg border border-indigo-100 text-indigo-900 break-all w-full select-all">
                {appUrl}
              </code>
            </div>
          )}
        </div>

        {/* Live Preview Side */}
        <div className="flex justify-center items-start pt-4 lg:pt-0">
          <div className="relative w-[300px] h-[600px] bg-black rounded-[45px] p-2 shadow-[0_0_50px_rgba(0,0,0,0.2)] border-4 border-slate-800">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
              <div className="w-24 h-6 bg-black rounded-b-xl"></div>
            </div>
            
            {/* Screen Content */}
            <div className="bg-slate-50 w-full h-full rounded-[38px] overflow-hidden flex flex-col relative" style={{ '--brand': primaryColor } as React.CSSProperties}>
              {/* App Header */}
              <div 
                className="pt-12 pb-6 px-6 text-white shadow-md relative"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-xl bg-white p-0.5 object-cover shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-xl">🏥</span>
                    </div>
                  )}
                  <div>
                    <h2 className="font-black text-lg leading-tight truncate w-32">{appName || "Your App"}</h2>
                    <p className="text-xs opacity-80 font-medium capitalize">{providerType} Portal</p>
                  </div>
                </div>
              </div>
              
              {/* App Body */}
              <div className="flex-1 p-5 space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 flex flex-col items-center justify-center gap-2 border border-slate-100">
                      <span className="text-xl">📅</span>
                      <span className="text-[10px] font-bold text-slate-600">Book Appt</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 flex flex-col items-center justify-center gap-2 border border-slate-100">
                      <span className="text-xl">💬</span>
                      <span className="text-[10px] font-bold text-slate-600">Chat</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex-1">
                  <div className="h-4 bg-slate-100 rounded-full w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-12 bg-slate-50 rounded-xl border border-slate-100"></div>
                    <div className="h-12 bg-slate-50 rounded-xl border border-slate-100"></div>
                  </div>
                </div>
              </div>
              
              {/* App Install Prompt Simulator */}
              {!isPublished && (
                <div className="absolute bottom-4 inset-x-4 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 animate-bounce">
                  <div className="flex items-center gap-3 mb-3">
                    {logoUrl && <img src={logoUrl} className="w-8 h-8 rounded-lg" />}
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">Install {appName || "App"}</p>
                      <p className="text-[10px] text-slate-500">Add to Home Screen</p>
                    </div>
                  </div>
                  <button className="w-full text-white text-xs font-bold py-2 rounded-xl" style={{ backgroundColor: primaryColor }}>
                    Install
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
