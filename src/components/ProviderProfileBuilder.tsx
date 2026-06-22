"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Save, ChevronRight, LayoutDashboard, Stethoscope, Building2, FlaskConical, Activity, Truck } from 'lucide-react';

interface ProviderProfileBuilderProps {
  role: string;
  userId: string;
}

export default function ProviderProfileBuilder({ role, userId }: ProviderProfileBuilderProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('basic');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Define tabs based on role
  const getTabsForRole = () => {
    const baseTabs = [
      { id: 'basic', label: 'Basic Information', isMandatory: true, isComplete: false },
      { id: 'gallery', label: 'Media Gallery', isMandatory: false, isComplete: false },
    ];

    switch (role.toLowerCase()) {
      case 'doctor':
        return [
          ...baseTabs,
          { id: 'education', label: 'Educational Qualifications', isMandatory: true, isComplete: false },
          { id: 'pricing', label: 'Consultation Pricing', isMandatory: true, isComplete: false },
          { id: 'timings', label: 'Clinic Timings', isMandatory: true, isComplete: false },
        ];
      case 'hospital':
        return [
          ...baseTabs,
          { id: 'capacity', label: 'Bed Capacity & ICU', isMandatory: true, isComplete: false },
          { id: 'departments', label: 'Departments & Services', isMandatory: true, isComplete: false },
        ];
      case 'lab':
        return [
          ...baseTabs,
          { id: 'tests', label: 'Lab Tests & Collection', isMandatory: true, isComplete: false },
          { id: 'accreditation', label: 'Accreditations', isMandatory: true, isComplete: false },
        ];
      case 'pharmacy':
        return [
          ...baseTabs,
          { id: 'delivery', label: 'Home Delivery & Radius', isMandatory: true, isComplete: false },
          { id: 'timings', label: 'Operating Hours', isMandatory: true, isComplete: false },
        ];
      case 'ambulance':
        return [
          ...baseTabs,
          { id: 'fleet', label: 'Fleet Details & Types', isMandatory: true, isComplete: false },
          { id: 'coverage', label: 'Coverage Area', isMandatory: true, isComplete: false },
        ];
      default:
        return baseTabs;
    }
  };

  const tabs = getTabsForRole();

  // Placeholder for auto-save simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
      }, 1000);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-[800px] bg-[#060B14] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl font-sans">
      
      {/* Top Progress Bar & Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-cyan-500" />
              Profile Builder
            </h2>
            <p className="text-slate-400 text-sm mt-1">Complete the mandatory fields below to activate your public profile.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1 justify-end">
                {isSaving ? (
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div> Auto-saving...</span>
                ) : (
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><Save className="w-3 h-3" /> {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'All changes saved'}</span>
                )}
              </div>
              <button 
                disabled={completionPercentage < 100}
                className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg ${completionPercentage === 100 ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 hover:scale-105 shadow-[0_0_20px_rgba(20,184,166,0.3)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
              >
                Publish Profile
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar UI */}
        <div className="bg-slate-800/50 rounded-full h-3 overflow-hidden border border-slate-700 relative">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: `${Math.max(5, completionPercentage)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs font-bold tracking-widest uppercase">
          <span className="text-teal-400">{completionPercentage}% Completed</span>
          <span className="text-slate-500">100% Required for Publication</span>
        </div>
      </div>

      {/* Main Builder Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar Tabs */}
        <div className="w-full max-w-[280px] bg-slate-900/50 border-r border-slate-800 overflow-y-auto hidden md:block">
          <div className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all ${activeTab === tab.id ? 'bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-transparent border border-transparent hover:bg-slate-800/50 hover:border-slate-700'}`}
              >
                <div className="flex items-center gap-3">
                  {tab.isMandatory ? (
                    tab.isComplete ? <CheckCircle2 className="w-5 h-5 text-teal-500" /> : <Circle className="w-5 h-5 text-rose-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600" />
                  )}
                  <div>
                    <div className={`font-bold text-sm ${activeTab === tab.id ? 'text-cyan-400' : 'text-slate-300'}`}>{tab.label}</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">
                      {tab.isMandatory ? 'Required' : 'Optional'}
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === tab.id ? 'text-cyan-400' : 'text-slate-600'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Form Area */}
        <div className="flex-1 bg-[#060B14] p-8 overflow-y-auto">
          <div className="max-w-3xl">
            <div className="mb-8 border-b border-slate-800 pb-6">
              <h3 className="text-2xl font-black text-white">{tabs.find(t => t.id === activeTab)?.label}</h3>
              <p className="text-slate-400 mt-2">Fill out the details below. Changes are saved automatically.</p>
            </div>
            
            {/* Placeholder for actual form schemas */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center border-dashed">
              <p className="text-slate-500 font-medium">Form schema for <strong className="text-cyan-400 uppercase tracking-widest">{activeTab}</strong> goes here.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
