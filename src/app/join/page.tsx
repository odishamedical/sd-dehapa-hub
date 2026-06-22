"use client";

import { useRouter } from 'next/navigation';
import { Building2, User, ShieldCheck, Activity, FlaskConical, Stethoscope, Truck, ArrowRight } from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GlobalFooter from '@/components/GlobalFooter';

export default function JoinHubPage() {
  const router = useRouter();

  const categories = [
    { id: 'doctor', icon: Stethoscope, label: 'Doctor / Specialist', desc: 'Join as an individual practitioner', color: 'text-teal-400', border: 'hover:border-teal-500', bg: 'hover:bg-teal-500/10' },
    { id: 'hospital', icon: Building2, label: 'Hospital / Clinic', desc: 'Register your healthcare facility', color: 'text-blue-400', border: 'hover:border-blue-500', bg: 'hover:bg-blue-500/10' },
    { id: 'lab', icon: FlaskConical, label: 'Diagnostic Lab', desc: 'Partner your pathology or radiology lab', color: 'text-purple-400', border: 'hover:border-purple-500', bg: 'hover:bg-purple-500/10' },
    { id: 'pharmacy', icon: Activity, label: 'Pharmacy', desc: 'Register your medical store', color: 'text-emerald-400', border: 'hover:border-emerald-500', bg: 'hover:bg-emerald-500/10' },
    { id: 'ambulance', icon: Truck, label: 'Ambulance Service', desc: 'Join our emergency response fleet', color: 'text-rose-400', border: 'hover:border-rose-500', bg: 'hover:bg-rose-500/10' }
  ];

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col font-sans selection:bg-teal-500/30">
      
      <div className="flex-1 flex flex-col items-center pt-16 pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-teal-400 text-xs font-bold tracking-widest uppercase mb-6 shadow-xl backdrop-blur-xl">
            <ShieldCheck className="w-4 h-4" />
            Verified Provider Network
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6 font-serif">
            Join the DehaPa <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Ecosystem</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
            Select your professional category below to start your fast, secure onboarding process and reach thousands of patients.
          </p>
        </div>

        <div className="w-full max-w-5xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => router.push(`/join/${cat.id}`)}
                  className={`flex flex-col items-start p-8 border border-slate-800 bg-slate-900/50 backdrop-blur-xl rounded-[24px] transition-all duration-300 group ${cat.border} ${cat.bg} shadow-lg hover:shadow-2xl hover:-translate-y-1 text-left relative overflow-hidden`}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 transition-colors group-hover:bg-slate-900 ${cat.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{cat.label}</h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">{cat.desc}</p>
                  
                  <div className="mt-auto flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                    View Details <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
