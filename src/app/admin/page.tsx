"use client";

import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Providers', value: '4,281', change: '+12%', trend: 'up' },
    { name: 'Pending KYC', value: '156', change: '+5%', trend: 'up', alert: true },
    { name: 'Verified Claims', value: '892', change: '+22%', trend: 'up' },
    { name: 'Premium Upgrades', value: '45', change: '-2%', trend: 'down' },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            {stat.alert && <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>}
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">{stat.name}</h3>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
              <div className={`flex items-center gap-1 text-sm font-bold mb-1 ${stat.trend === 'up' ? 'text-teal-600' : 'text-rose-500'}`}>
                {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/kyc" className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-teal-50 hover:border-teal-200 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-rose-500 shadow-sm group-hover:text-teal-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Review Pending KYC</h4>
                  <p className="text-xs text-slate-500">156 providers waiting</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </Link>
            
            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-teal-50 hover:border-teal-200 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm group-hover:text-teal-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-900 text-sm">Add New Provider</h4>
                  <p className="text-xs text-slate-500">Manual entry to directory</p>
                </div>
              </div>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-teal-50 hover:border-teal-200 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm group-hover:text-teal-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-900 text-sm">Manage Home Advertisements</h4>
                  <p className="text-xs text-slate-500">Configure global banners</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent System Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Platform Activity</h2>
          <div className="space-y-6">
            {[
              { time: "10 mins ago", action: "Profile Claimed", details: "Dr. A.K. Sharma claimed their Google-scraped profile.", status: "Pending KYC" },
              { time: "1 hour ago", action: "Tier Upgrade", details: "Apollo Hospital upgraded to Platinum Sponsored Listing.", status: "Completed" },
              { time: "3 hours ago", action: "Admin Approval", details: "Super Admin [You] approved 12 Lab KYC verifications.", status: "Verified" },
              { time: "5 hours ago", action: "Crawler Sync", details: "System successfully injected 350 new pharmacies into Odisha.", status: "System" }
            ].map((activity, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0"></div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 text-sm">{activity.action}</h4>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">{activity.status}</span>
                  </div>
                  <p className="text-sm text-slate-600">{activity.details}</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
