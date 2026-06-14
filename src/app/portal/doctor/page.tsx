"use client";

import React, { useState } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import PremiumSlugModal from '@/components/PremiumSlugModal';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [isSlugModalOpen, setIsSlugModalOpen] = useState(false);

  const doctorTabs: DashboardTab[] = [
    {
      id: "identity",
      label: "Identity & Hero",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
    },
    {
      id: "clinical",
      label: "Clinical Profile",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    },
    {
      id: "locations",
      label: "Practice Locations",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    }
  ];

  return (
    <DashboardLayout 
      roleName="Doctor Dashboard" 
      tabs={doctorTabs} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Alert */}
        <div className="bg-sky-50 border border-sky-200 text-sky-800 rounded-xl p-4 mb-8 flex items-start gap-3">
          <svg className="w-5 h-5 text-sky-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h4 className="font-bold text-sm">Welcome to your Portal</h4>
            <p className="text-xs mt-1">The information you fill out here instantly maps to your public profile. Ensure it is accurate to maintain your "Verified" badge.</p>
          </div>
        </div>

        {/* Tab 1: Identity & Hero */}
        {activeTab === "identity" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Premium Ticket Call to Action */}
            <div 
              onClick={() => setIsSlugModalOpen(true)}
              className="bg-gradient-to-r from-slate-900 to-teal-900 rounded-2xl p-6 mb-8 cursor-pointer hover:shadow-xl hover:shadow-teal-900/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }}></div>
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Reserve Your Dedicated Name</h3>
                    <p className="text-teal-100 text-sm">Your Name is your Identity. Reserve it before it's too late! Search for your premium URL now.</p>
                  </div>
                </div>
                <button className="shrink-0 px-6 py-3 bg-white text-teal-900 font-bold rounded-xl shadow-lg hover:bg-teal-50 transition-colors whitespace-nowrap">
                  Check Availability
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Identity & Hero Header</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors">Upload Photo</button>
                  <p className="text-xs text-slate-500">Square image. Recommended size 400x400px.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input type="text" placeholder="e.g. Dr. Sandeep Sharma" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Speciality</label>
                  <select className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                    <option>Select Speciality</option>
                    <option>Cardiologist</option>
                    <option>Neurologist</option>
                    <option>Orthopedic Surgeon</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Degrees</label>
                  <input type="text" placeholder="e.g. MBBS, MD (Medicine)" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Medical Registration No.</label>
                  <input type="text" placeholder="e.g. MCI-12345" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all">Save Identity Info</button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Clinical Profile */}
        {activeTab === "clinical" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Clinical Profile</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Years of Experience</label>
                <input type="number" placeholder="e.g. 15" className="w-full md:w-1/3 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Professional Bio</label>
                <textarea rows={5} placeholder="Write a brief professional biography that patients will see..." className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition-all"></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Specializations & Treatments (Tags)</label>
                <input type="text" placeholder="e.g. Angioplasty, Pacemaker (Press enter to add)" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                <div className="flex gap-2 mt-3">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">Angioplasty <button className="hover:text-red-500">×</button></span>
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">Pacemaker <button className="hover:text-red-500">×</button></span>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all">Save Clinical Profile</button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Practice Locations */}
        {activeTab === "locations" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-xl font-bold text-slate-900">Practice Locations</h3>
              <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors">+ Add Clinic</button>
            </div>
            
            <div className="space-y-6">
              {/* Location Card */}
              <div className="border border-slate-200 rounded-xl p-6 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="text-slate-400 hover:text-sky-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                  <button className="text-slate-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Clinic/Hospital Name</label>
                    <p className="font-bold text-slate-900">Apollo Hospitals</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Consultation Fee</label>
                    <p className="font-bold text-slate-900">₹800</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Address</label>
                  <p className="text-sm text-slate-700">Unit 15, Near Sainik School, Bhubaneswar, Odisha 751005</p>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Operating Hours</label>
                  <p className="text-sm text-slate-700">Mon-Fri: 10:00 AM - 02:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Premium Slug Modal */}
      <PremiumSlugModal 
        isOpen={isSlugModalOpen} 
        onClose={() => setIsSlugModalOpen(false)} 
        currentName="Dr. Sandeep Sharma"
        currentUglyUrl="dehapa.com/india/odisha/sambalpur/drsandeep.3gtyuibhyu4768"
      />
    </DashboardLayout>
  );
}
