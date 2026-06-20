"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

function OrderEngineForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = searchParams?.get("id") || "";
  const providerType = searchParams?.get("type") || "pharmacy";
  
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<any>(null);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);

  const [notes, setNotes] = useState("");
  const [fileUrl, setFileUrl] = useState(""); // Simplified for prototype: direct URL input
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("sd_current_user_email");
    const name = localStorage.getItem("sd_current_user_name");
    const uid = localStorage.getItem("sd_current_user_uid") || email;

    if (!email) {
      router.push(`/login?redirect=/portal/order?id=${providerId}&type=${providerType}`);
      return;
    }

    setUserEmail(email);
    setUserName(name || "Patient");
    setUserUid(uid);

    const fetchProvider = async () => {
      if (!providerId) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'directory', providerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProvider({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error(`Failed to fetch ${providerType} details`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [router, providerId, providerType]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !userEmail) return;
    
    setIsSubmitting(true);
    try {
      const orderData = {
        patientId: userUid,
        patientName: userName,
        patientEmail: userEmail,
        providerId: provider.id,
        providerName: provider.name,
        providerType: providerType,
        notes: notes,
        fileUrl: fileUrl,
        status: "Pending Review",
        timestamp: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      setOrderId(docRef.id);
      setOrderSuccess(true);
    } catch (error) {
      console.error("Error submitting order", error);
      alert("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
         <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
         <div className="text-center">
           <h2 className="text-2xl font-bold mb-2">Provider Not Found</h2>
           <Link href={`/${providerType}s`} className="text-cyan-600 underline">Return to Directory</Link>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-24">
      {/* Header Area */}
      <div className="bg-slate-900 text-white pt-24 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 20% 150%, ${providerType === 'pharmacy' ? '#0ea5e9' : '#8b5cf6'} 0%, transparent 50%)` }}></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <Link href={`/${providerType}s/${provider.id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold uppercase tracking-widest mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Profile
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-white">
            {providerType === 'pharmacy' ? 'Order Medicines' : 'Book Lab Tests'}
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto">
            Submit your prescription or test requirements to {provider.name}.
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        {!orderSuccess ? (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                {providerType === 'pharmacy' ? (
                  <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path></svg>
                ) : (
                  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{provider.name}</h2>
                <p className="text-slate-500 text-sm font-medium">{provider.subtitle || (providerType === 'pharmacy' ? "Verified Pharmacy" : "Diagnostic Lab")}</p>
              </div>
            </div>

            <form onSubmit={handleOrder} className="space-y-6 text-left">
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                 </div>
                 <h4 className="font-bold text-slate-800 text-sm mb-1">Attach E-Prescription</h4>
                 <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">Please provide a link to your digital prescription or test requirements.</p>
                 <input 
                    type="url" 
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://link-to-prescription.pdf"
                    className="w-full max-w-sm mx-auto bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all block"
                  />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">Additional Notes</label>
                <textarea 
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g. Home delivery requested, or preferred time for sample collection..."
                  className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-cyan-500 outline-none transition-all focus:ring-4 focus:ring-cyan-500/10 resize-none"
                />
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button 
                  type="submit" 
                  disabled={isSubmitting || (!fileUrl && !notes)}
                  className="w-full py-5 bg-slate-900 hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request to Provider
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 md:p-16 shadow-2xl shadow-cyan-900/10 border border-slate-100 text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-500 text-5xl mx-auto">
              ✓
            </div>
            
            <div>
              <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">Request Submitted!</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Your request has been successfully sent to <strong className="text-cyan-600">{provider.name}</strong>. They will review it shortly.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left space-y-3 mx-auto max-w-sm">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">Order ID</span>
                <strong className="text-slate-900 font-mono">{orderId.substring(0, 8).toUpperCase()}</strong>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 text-sm">Status</span>
                <strong className="text-yellow-600 text-sm font-bold">Pending Review</strong>
              </div>
            </div>

            <Link href="/portal" className="inline-block w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-md">
              Go to Patient Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default function OrderEngine() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrderEngineForm />
    </Suspense>
  );
}
