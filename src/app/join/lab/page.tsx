import React from 'react';
import Link from 'next/link';
import { Microscope, ShieldCheck, Activity, TestTube2, ArrowRight, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: "Partner as Diagnostic Lab | Dehapa",
  description: "Join India's most advanced healthcare network. Connect with thousands of patients and digitize your diagnostic laboratory."
};

export default function LabLandingPage() {
  return (
    <div className="min-h-screen bg-[#020810] text-slate-300 selection:bg-purple-500/30 pb-20">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-900/20 blur-[120px]"></div>
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-12 md:pt-24">
        
        {/* Navigation / Back Button */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors font-bold text-sm bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800 backdrop-blur-md">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-widest uppercase mb-6">
              <Microscope className="w-3 h-3" />
              For Diagnostic Labs
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white font-serif tracking-tight leading-[1.1] mb-6">
              Modernize your lab with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Dehapa Network</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
              Receive automated test bookings from our network of doctors and patients. Deliver digital reports instantly via our Medplum-integrated platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/join/apply?role=lab" className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]">
                Register Lab
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login?redirect=/portal/admin" className="inline-flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-4 rounded-xl border border-slate-700 transition-all">
                Lab Login
              </Link>
            </div>
            
            <div className="mt-8 flex items-center gap-4 text-sm font-medium text-slate-500">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#020810] flex items-center justify-center text-[10px] text-white">🔬</div>
                <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-[#020810] flex items-center justify-center text-[10px] text-white">🧪</div>
                <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-[#020810] flex items-center justify-center text-[10px] text-white font-bold">2k+</div>
              </div>
              <p>Network of 2,000+ verified labs</p>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-[2.5rem] transform rotate-3 blur-xl"></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
              {/* Dashboard Mockup */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                </div>
                <div className="text-[10px] font-bold text-purple-500 tracking-widest uppercase">Lab Portal</div>
              </div>
              <div className="space-y-4">
                <div className="h-24 rounded-2xl bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/20 p-4 flex flex-col justify-between relative overflow-hidden">
                  <TestTube2 className="absolute right-[-10px] bottom-[-10px] w-20 h-20 text-purple-500/10" />
                  <div className="text-xs text-purple-400 font-bold uppercase tracking-widest">Pending Samples</div>
                  <div className="text-3xl font-black text-white">86 <span className="text-sm font-medium text-purple-500">Tests</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 rounded-2xl bg-slate-800/50 border border-slate-800 p-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Reports Sent</div>
                    <div className="text-xl font-black text-white">124</div>
                  </div>
                  <div className="h-32 rounded-2xl bg-slate-800/50 border border-slate-800 p-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Revenue</div>
                    <div className="text-xl font-black text-white">₹85k</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-black text-white mb-4">Why Partner With Us?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Transform your laboratory into a digital-first diagnostic center with zero upfront IT costs.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-32">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-purple-500/30 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Automated Doctor Referrals</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              When doctors prescribe tests on Dehapa, patients can book them directly at your lab with a single click.
            </p>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-pink-500/30 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Digital Report Delivery</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload PDF reports directly to the patient's secure Dehapa Vault. No more printing or manual WhatsApp messages.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-blue-500/30 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Home Collection Management</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Offer home sample collection easily. Manage your phlebotomists, track their routes, and optimize your schedule.
            </p>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-8 md:p-12 mb-20 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1">
            <h3 className="text-2xl font-black text-white mb-4">Ready to upgrade your lab?</h3>
            <p className="text-slate-400 mb-6">Here is what you need to create your verified diagnostic center profile.</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
                Valid Lab License & NABL Accreditation (if applicable)
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
                Pathologist Credentials
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
                Complete Test Catalog & Pricing
              </li>
            </ul>
          </div>
          <div className="w-full md:w-auto">
            <Link href="/join/apply?role=lab" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white text-slate-900 hover:bg-slate-200 font-black px-8 py-4 rounded-xl transition-all">
              Start Onboarding
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
