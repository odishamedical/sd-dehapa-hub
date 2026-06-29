"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";

function DispatchEngineForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ambId = searchParams?.get("id") || "";
  
  const [loading, setLoading] = useState(true);
  const [ambulance, setAmbulance] = useState<any>(null);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);

  const [emergencyType, setEmergencyType] = useState("Medical Emergency");
  const [pickupAddress, setPickupAddress] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);
  const [pingId, setPingId] = useState("");
  const [pingStatus, setPingStatus] = useState("Pending Confirmation");

  useEffect(() => {
    const email = localStorage.getItem("sd_current_user_email");
    const name = localStorage.getItem("sd_current_user_name");
    const uid = localStorage.getItem("sd_current_user_uid") || email;

    if (!email) {
      router.push("/login?redirect=/portal/dispatch?id=" + ambId);
      return;
    }

    setUserEmail(email);
    setUserName(name || "Patient");
    setUserUid(uid);

    const fetchAmbulance = async () => {
      if (!ambId) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'directory', ambId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAmbulance({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Failed to fetch ambulance details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAmbulance();
  }, [router, ambId]);

  // Listen to the ping status
  useEffect(() => {
    if (!pingId) return;
    const unsub = onSnapshot(doc(db, "emergencies", pingId), (docSnap) => {
      if (docSnap.exists()) {
        setPingStatus(docSnap.data().status);
      }
    });
    return () => unsub();
  }, [pingId]);

  // Auto-request location on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoordinates(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
      }, (error) => {
        console.warn("Location permission denied on load:", error);
      });
    }
  }, []);

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoordinates(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
      }, (error) => {
        alert("Location access denied. Please enable Location/GPS settings on your device to dispatch an ambulance.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambulance || !userEmail) return;

    if (!coordinates) {
      alert("Error: Real-time GPS Location is strictly required to dispatch an ambulance. Please click 'Get My Location' and allow GPS tracking.");
      handleGetLocation();
      return;
    }
    
    setIsSubmitting(true);
    try {
      const dispatchData = {
        patientId: userUid,
        patientName: userName,
        patientEmail: userEmail,
        ambulanceId: ambulance.id,
        ambulanceName: ambulance.name,
        emergencyType: emergencyType,
        pickupAddress: pickupAddress,
        coordinates: coordinates,
        status: "Pending Confirmation",
        timestamp: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "emergencies"), dispatchData);
      setPingId(docRef.id);
      setPingSuccess(true);
    } catch (error) {
      console.error("Error sending emergency ping", error);
      alert("Failed to send dispatch request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
         <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!ambulance) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
         <div className="text-center">
           <h2 className="text-2xl font-bold mb-2">Ambulance Not Found</h2>
           <Link href="/ambulances" className="text-teal-600 underline">Return to Directory</Link>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-24">
      {/* Header Area */}
      <div className="bg-slate-900 text-white pt-24 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 150%, #ef4444 0%, transparent 50%)' }}></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <Link href={`/ambulances/${ambulance.id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold uppercase tracking-widest mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Profile
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-red-500">Emergency Dispatch Ping</h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto">Instantly alert {ambulance.name} with your exact location and emergency details for immediate response.</p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        {!pingSuccess ? (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{ambulance.name}</h2>
                <p className="text-slate-500 text-sm font-medium">{ambulance.subtitle || "Emergency Transport Services"}</p>
              </div>
            </div>

            <form onSubmit={handleDispatch} className="space-y-6 text-left">
              <div className="space-y-3">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">Emergency Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Cardiac", "Trauma / Accident", "Maternal", "Medical Emergency"].map((t) => {
                    const isActive = emergencyType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setEmergencyType(t)}
                        className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          isActive 
                            ? "bg-red-50 border-red-500 text-red-600 shadow-[inset_0_0_0_1px_rgba(239,68,68,1)]" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-red-300"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">Pickup Address</label>
                <textarea 
                  rows={3}
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Enter exact landmark and pickup address..."
                  required
                  className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-red-500 outline-none transition-all focus:ring-4 focus:ring-red-500/10 resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">GPS Coordinates (Mandatory)</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={coordinates}
                    onChange={(e) => setCoordinates(e.target.value)}
                    placeholder="Lat, Lng"
                    className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-5 py-3.5 shadow-sm text-sm focus:border-red-500 outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={handleGetLocation}
                    className="px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl text-sm whitespace-nowrap hover:bg-black transition-colors"
                  >
                    Get My Location
                  </button>
                </div>
                {coordinates && (
                  <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-200 shadow-sm mt-3 animate-in fade-in">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      src={`https://maps.google.com/maps?q=${coordinates}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    />
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-[0_10px_40px_rgba(220,38,38,0.3)] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Dispatching Ping...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                      SEND EMERGENCY PING NOW
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 md:p-16 shadow-2xl shadow-red-900/10 border border-slate-100 text-center space-y-8 animate-in zoom-in-95 duration-500">
            {pingStatus === "Pending Confirmation" ? (
              <>
                <div className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center text-red-500 mx-auto animate-pulse">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                
                <div>
                  <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">Ping Sent!</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    We have alerted <strong className="text-red-600">{ambulance.name}</strong>. Waiting for the driver to accept the dispatch and confirm ETA.
                  </p>
                </div>

                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium animate-pulse border border-red-200">
                  Status: Waiting for Driver Confirmation...
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-500 text-5xl mx-auto">
                  ✓
                </div>
                
                <div>
                  <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">Dispatch Accepted!</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    <strong className="text-slate-900">{ambulance.name}</strong> has accepted the emergency ping and is en route to your location.
                  </p>
                </div>

                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-bold border border-emerald-200">
                  Status: En Route
                </div>
              </>
            )}

            <Link href="/portal" className="inline-block w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-md">
              Go to Patient Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DispatchEngine() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DispatchEngineForm />
    </Suspense>
  );
}
