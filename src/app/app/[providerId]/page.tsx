import React from 'react';
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from 'next/link';

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function CustomProviderApp({ params }: { params: { providerId: string } }) {
  const providerId = params.providerId;
  
  // Server-side fetch to ensure SEO and immediate styling
  const docRef = doc(db, "directory", providerId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black text-slate-800 mb-2">Provider Not Found</h1>
        <p className="text-slate-500 mb-6">We couldn't find a clinic or hospital with this ID.</p>
        <Link href="/" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md">
          Return Home
        </Link>
      </div>
    );
  }

  const providerData = docSnap.data();
  const config = providerData.appConfig || {};
  
  const appName = config.appName || providerData.name || "My Clinic";
  const primaryColor = config.primaryColor || "#0ea5e9"; // Default sky blue
  const logoUrl = config.logoUrl || providerData.logo || null;
  const isPublished = config.isPublished;

  if (!isPublished) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black text-slate-800 mb-2">App Not Published</h1>
        <p className="text-slate-500 mb-6">This provider has not yet published their custom app.</p>
      </div>
    );
  }

  // Inject CSS Variables dynamically for styling the rest of the PWA
  const dynamicStyle = {
    '--brand': primaryColor,
    '--brand-light': `${primaryColor}20`,
    '--brand-dark': `${primaryColor}dark`,
  } as React.CSSProperties;

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col" style={dynamicStyle}>
      {/* Install Prompt Overlay (Mobile Specific) */}
      <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
           <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
           </button>
           <h1 className="font-black text-lg text-slate-900 truncate max-w-[150px]">{appName}</h1>
        </div>
        
        <div className="flex gap-2">
           <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors relative">
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full border border-white" style={{ backgroundColor: primaryColor }}></span>
           </button>
           {logoUrl ? (
             <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" />
           ) : (
             <div className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center shadow-sm" style={{ backgroundColor: primaryColor }}>
               {appName.charAt(0)}
             </div>
           )}
        </div>
      </div>

      <div className="flex-1 p-5 max-w-lg mx-auto w-full flex flex-col gap-6">
         {/* Welcome Hero */}
         <div className="relative rounded-3xl p-6 overflow-hidden text-white shadow-xl" style={{ backgroundColor: primaryColor }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -z-0"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl -z-0"></div>
            
            <div className="relative z-10">
              <p className="text-white/80 text-sm font-medium mb-1">Welcome to</p>
              <h2 className="text-3xl font-black mb-4 leading-tight">{appName}</h2>
              
              <Link 
                href={`/portal/patient?connect=${providerId}`} 
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-transform"
              >
                Log In / Register
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </Link>
            </div>
         </div>

         {/* Quick Actions Grid */}
         <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Services</h3>
            <div className="grid grid-cols-2 gap-4">
               {[
                 { icon: "📅", label: "Book Appt", desc: "In-Clinic Visit" },
                 { icon: "💻", label: "Video Consult", desc: "Telemedicine" },
                 { icon: "💊", label: "Order Meds", desc: "Pharmacy" },
                 { icon: "🩸", label: "Lab Tests", desc: "Home Collection" },
               ].map((item, i) => (
                 <button key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-2 hover:border-[var(--brand)] hover:shadow-md transition-all group relative overflow-hidden">
                   <div className="absolute inset-0 bg-[var(--brand-light)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="text-3xl relative z-10">{item.icon}</div>
                   <div className="relative z-10">
                     <div className="font-bold text-slate-800 text-sm">{item.label}</div>
                     <div className="text-[10px] text-slate-500 font-medium">{item.desc}</div>
                   </div>
                 </button>
               ))}
            </div>
         </div>

         {/* PWA Install Banner */}
         <div className="bg-white p-5 rounded-3xl border-2 border-dashed shadow-sm flex items-center gap-4 mt-auto" style={{ borderColor: 'var(--brand-light)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--brand-light)' }}>
               <svg className="w-6 h-6" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </div>
            <div>
               <h4 className="font-bold text-slate-800 text-sm mb-0.5">Install the App</h4>
               <p className="text-xs text-slate-500">Add to your home screen for faster access to your health records.</p>
            </div>
         </div>
      </div>
      
      {/* Dynamic PWA Manifest Meta Tags */}
      <head>
        <title>{appName}</title>
        <meta name="theme-color" content={primaryColor} />
        <link rel="manifest" href={`/api/manifest/${providerId}`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={appName} />
        {logoUrl && <link rel="apple-touch-icon" href={logoUrl} />}
      </head>
    </div>
  );
}
