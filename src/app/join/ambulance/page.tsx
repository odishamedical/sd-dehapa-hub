import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, Activity, Navigation, ArrowRight, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: "Partner as Ambulance Provider | Dehapa",
  description: "Join India's fastest emergency response network. Connect your fleet with patients who need immediate medical transport."
};

export default function AmbulanceLandingPage() {
  return (
    <div className="min-h-screen bg-[#020810] text-slate-300 selection:bg-rose-500/30 pb-20">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-900/20 blur-[120px]"></div>
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-12 md:pt-24">
        
        {/* Navigation / Back Button */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-colors font-bold text-sm bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800 backdrop-blur-md">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold tracking-widest uppercase mb-6">
              <Truck className="w-3 h-3" />
              For Ambulance Providers
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white font-serif tracking-tight leading-[1.1] mb-6">
              Connect your fleet to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Dehapa Network</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
              Receive emergency ride requests instantly. Track your fleet in real-time with our advanced GPS mapping, and ensure patients reach hospitals safely and efficiently.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/join/ambulance/apply" className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-black px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(225,29,72,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(225,29,72,0.5)]">
                Register Fleet
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login?redirect=/portal/admin" className="inline-flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-4 rounded-xl border border-slate-700 transition-all">
                Fleet Login
              </Link>
            </div>
            
            <div className="mt-8 flex items-center gap-4 text-sm font-medium text-slate-500">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#020810] flex items-center justify-center text-[10px] text-white">🚑</div>
                <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-[#020810] flex items-center justify-center text-[10px] text-white">🏥</div>
                <div className="w-8 h-8 rounded-full bg-rose-600 border-2 border-[#020810] flex items-center justify-center text-[10px] text-white font-bold">1k+</div>
              </div>
              <p>Network of 1,000+ emergency vehicles</p>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-orange-500/20 rounded-[2.5rem] transform rotate-3 blur-xl"></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
              {/* Dashboard Mockup */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                </div>
                <div className="text-[10px] font-bold text-rose-500 tracking-widest uppercase">Fleet Portal</div>
              </div>
              <div className="space-y-4">
                <div className="h-24 rounded-2xl bg-gradient-to-r from-rose-900/50 to-orange-900/50 border border-rose-500/20 p-4 flex flex-col justify-between relative overflow-hidden">
                  <Activity className="absolute right-[-10px] bottom-[-10px] w-20 h-20 text-rose-500/10" />
                  <div className="text-xs text-rose-400 font-bold uppercase tracking-widest">Active Dispatches</div>
                  <div className="text-3xl font-black text-white">12 <span className="text-sm font-medium text-rose-500">In Transit</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 rounded-2xl bg-slate-800/50 border border-slate-800 p-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                      <Navigation className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Available Units</div>
                    <div className="text-xl font-black text-white">4 Online</div>
                  </div>
                  <div className="h-32 rounded-2xl bg-slate-800/50 border border-slate-800 p-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Completed</div>
                    <div className="text-xl font-black text-white">34 Today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-black text-white mb-4">Why Partner With Us?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Equip your fleet with advanced dispatching technology and ensure maximum utilization of your ambulances.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-32">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-rose-500/30 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Instant Booking Alerts</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Receive immediate notifications on the driver app when a nearby patient requests emergency or non-emergency transport.
            </p>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-orange-500/30 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Navigation className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Live GPS Tracking</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track your entire fleet from a single dashboard. Patients also get a live tracking link to see the ambulance arriving in real-time.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-teal-500/30 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Hospital Integration</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hospitals in the Dehapa network are notified of your ETA, ensuring emergency wards are prepared before the patient even arrives.
            </p>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-8 md:p-12 mb-20 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1">
            <h3 className="text-2xl font-black text-white mb-4">Ready to upgrade your fleet?</h3>
            <p className="text-slate-400 mb-6">Here is what you need to create your verified ambulance provider profile.</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-rose-500" />
                Vehicle Registration Certificates (RC)
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-rose-500" />
                Driver Licenses and Background Check
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-rose-500" />
                Proof of Basic/Advanced Life Support Equipment
              </li>
            </ul>
          </div>
          <div className="w-full md:w-auto">
            <Link href="/join/ambulance/apply" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white text-slate-900 hover:bg-slate-200 font-black px-8 py-4 rounded-xl transition-all">
              Start Onboarding
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
