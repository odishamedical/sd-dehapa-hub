"use client";

import React, { useState } from 'react';

export default function HospitalStaffControl() {
  const staffMembers = [
    { id: "EMP-001", name: "Anjali P.", role: "Head Receptionist", access: "Front Desk & Billing", status: "active" },
    { id: "EMP-002", name: "David S.", role: "Ward Boy", access: "IPD Bed Manager", status: "active" },
    { id: "EMP-003", name: "Sr. Kavita", role: "Nursing Head", access: "OT Scheduler & IPD", status: "active" },
  ];

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.8)] min-h-[70vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
              <span className="text-xl">👥</span>
            </div>
            Staff Access Control
          </h3>
          <p className="text-sm text-slate-600 mt-2 font-medium">Manage permissions for your nurses, receptionists, and ward boys.</p>
        </div>
        
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all flex items-center gap-2">
          + Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Staff List */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest mb-2">Registered Staff</h4>
          
          {staffMembers.map(staff => (
            <div key={staff.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-lg border border-indigo-100">
                  🧑‍⚕️
                </div>
                <div>
                  <h5 className="font-bold text-slate-900">{staff.name} <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded ml-2">{staff.id}</span></h5>
                  <p className="text-xs font-medium text-indigo-600 mt-0.5">{staff.role}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Access Level</span>
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-lg">
                  {staff.access}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Access Logs / Activity */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest mb-4">Recent Activity</h4>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-indigo-500 bg-white text-slate-500 shrink-0 z-10 shadow"></div>
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded border border-slate-200 shadow-sm ml-4 md:ml-0 md:mr-6">
                <p className="font-bold text-slate-900 text-xs">Anjali P. <span className="font-normal text-slate-500">collected ₹1,200</span></p>
                <time className="text-[10px] text-slate-400">10 mins ago</time>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-indigo-500 bg-white text-slate-500 shrink-0 z-10 shadow"></div>
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded border border-slate-200 shadow-sm ml-4 md:ml-0 md:ml-6 text-right">
                <p className="font-bold text-slate-900 text-xs">David S. <span className="font-normal text-slate-500">updated Bed A4</span></p>
                <time className="text-[10px] text-slate-400">1 hour ago</time>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
