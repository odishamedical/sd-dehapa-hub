"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, FlaskConical, Stethoscope, Truck, Activity, ArrowRight, ShieldCheck, CheckCircle } from "lucide-react";
import V2Hero from "@/components/v2/V2Hero";
import Link from "next/link";

import { Suspense } from "react";

function JoinV2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const categories = [
    { id: 'doctor', icon: Stethoscope, label: 'Doctor / Specialist', desc: 'Join as an individual practitioner', color: 'text-blue-600', bg: 'bg-blue-100', border: 'hover:border-blue-400' },
    { id: 'hospital', icon: Building2, label: 'Hospital / Clinic', desc: 'Register your healthcare facility', color: 'text-rose-600', bg: 'bg-rose-100', border: 'hover:border-rose-400' },
    { id: 'lab', icon: FlaskConical, label: 'Diagnostic Lab', desc: 'Partner your pathology or radiology lab', color: 'text-purple-600', bg: 'bg-purple-100', border: 'hover:border-purple-400' },
    { id: 'pharmacy', icon: Activity, label: 'Pharmacy', desc: 'Register your medical store', color: 'text-amber-600', bg: 'bg-amber-100', border: 'hover:border-amber-400' },
    { id: 'ambulance', icon: Truck, label: 'Ambulance Service', desc: 'Join our emergency response fleet', color: 'text-teal-600', bg: 'bg-teal-100', border: 'hover:border-teal-400' }
  ];

  const [formState, setFormState] = useState({
    name: "",
    phone: "",
    email: "",
    specialization: "",
    city: ""
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // In a real app, send data to API here
  };

  if (!isClient) return null; // Avoid hydration mismatch on useSearchParams

  return (
    <div className="flex flex-col w-full min-h-screen text-slate-800 font-sans pb-24 relative z-10">
      
      {/* If a role is passed, we show the Form view. Otherwise, the Grid view. */}
      
      {!role ? (
        <>
          <V2Hero 
            titleStart="Grow Your"
            highlight="Medical Practice"
            subtitle="Join the largest healthcare network in the region. Reach thousands of patients instantly."
            showSearch={false}
            desktopBgImage="/pc-hero.png" // using same bg as home for consistency
            mobileBgImage="/phone-hero.png"
          />

          <section className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 pt-4 pb-12 max-w-5xl mx-auto -mt-8">
            <div className="w-full flex justify-center mb-8">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-blue-200 text-blue-700 text-xs font-bold tracking-widest uppercase shadow-sm backdrop-blur-xl">
                 <ShieldCheck className="w-4 h-4" /> Verified Provider Network
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => router.push(`/v2/join?role=${cat.id}`)}
                    className={`flex flex-col items-start p-8 border border-white/60 bg-white/40 backdrop-blur-xl rounded-[24px] transition-all duration-300 group shadow-[0_8px_30px_-10px_rgba(0,20,60,0.1)] hover:shadow-[0_15px_40px_-10px_rgba(0,20,60,0.15)] hover:-translate-y-1 text-left relative overflow-hidden ${cat.border}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors shadow-sm ${cat.bg} ${cat.color}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0a2540] mb-2">{cat.label}</h3>
                    <p className="text-slate-600 text-sm mb-8 leading-relaxed font-medium">{cat.desc}</p>
                    
                    <div className="mt-auto flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-600 group-hover:text-blue-700 transition-colors">
                      Start <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 pt-12 pb-12 max-w-3xl mx-auto">
             <div className="w-full text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-widest uppercase shadow-sm mb-6">
                  {role.toUpperCase()} ONBOARDING
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-[#0a2540] tracking-tight leading-tight">
                  Partner with <span className="text-blue-600">Dehapa</span>
                </h1>
                <p className="text-lg text-slate-600 font-medium mt-4">
                  Complete this quick form and our verification team will contact you within 24 hours.
                </p>
             </div>

             <div className="w-full bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[32px] p-6 md:p-10 shadow-[0_15px_50px_-12px_rgba(0,20,60,0.1)]">
                {!isSubmitted ? (
                   <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                           <label className="text-sm font-bold text-slate-700 ml-2">Full Name / Facility Name</label>
                           <input 
                             type="text" 
                             required
                             value={formState.name}
                             onChange={(e) => setFormState({...formState, name: e.target.value})}
                             placeholder="Dr. John Doe / Care Hospital" 
                             className="w-full px-6 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 font-medium text-slate-800"
                           />
                        </div>
                        <div className="flex flex-col gap-2">
                           <label className="text-sm font-bold text-slate-700 ml-2">Phone Number</label>
                           <input 
                             type="tel" 
                             required
                             value={formState.phone}
                             onChange={(e) => setFormState({...formState, phone: e.target.value})}
                             placeholder="+91 98765 43210" 
                             className="w-full px-6 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 font-medium text-slate-800"
                           />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                           <label className="text-sm font-bold text-slate-700 ml-2">Email Address</label>
                           <input 
                             type="email" 
                             required
                             value={formState.email}
                             onChange={(e) => setFormState({...formState, email: e.target.value})}
                             placeholder="contact@example.com" 
                             className="w-full px-6 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 font-medium text-slate-800"
                           />
                        </div>
                        <div className="flex flex-col gap-2">
                           <label className="text-sm font-bold text-slate-700 ml-2">City</label>
                           <input 
                             type="text" 
                             required
                             value={formState.city}
                             onChange={(e) => setFormState({...formState, city: e.target.value})}
                             placeholder="Bhubaneswar" 
                             className="w-full px-6 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 font-medium text-slate-800"
                           />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                         <label className="text-sm font-bold text-slate-700 ml-2">Specialization / Services Provided</label>
                         <textarea 
                           required
                           rows={3}
                           value={formState.specialization}
                           onChange={(e) => setFormState({...formState, specialization: e.target.value})}
                           placeholder="e.g. Cardiologist, 24/7 ER, Pathology..." 
                           className="w-full px-6 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 font-medium text-slate-800 resize-none"
                         ></textarea>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 justify-between pt-6 border-t border-slate-200">
                         <Link href="/join" className="text-slate-500 font-bold hover:text-slate-700 text-sm">
                           ← Back to Categories
                         </Link>
                         <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-10 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
                           Submit Application <ArrowRight className="w-5 h-5" />
                         </button>
                      </div>

                   </form>
                ) : (
                   <div className="flex flex-col items-center justify-center py-12 text-center">
                     <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10" />
                     </div>
                     <h3 className="text-2xl font-black text-[#0a2540] mb-2">Application Received!</h3>
                     <p className="text-slate-600 font-medium max-w-md mx-auto mb-8">
                       Thank you for choosing Dehapa. Our verification team will review your details and contact you at <strong>{formState.email}</strong> shortly.
                     </p>
                     <Link href="/v2" className="bg-[#0a2540] hover:bg-slate-800 text-white font-bold text-base py-3 px-8 rounded-xl shadow-lg transition-transform hover:-translate-y-1">
                       Return to Homepage
                     </Link>
                   </div>
                )}
             </div>
          </section>
        </>
      )}

    </div>
  );
}

export default function JoinV2Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <JoinV2Content />
    </Suspense>
  );
}
