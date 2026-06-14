import React, { ReactNode } from 'react';
import Link from 'next/link';

export type DashboardTab = {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: string | number;
  section?: string; // Optional section header before this tab
};

interface DashboardLayoutProps {
  roleName: string; // e.g., "Admin", "Doctor", "Hospital"
  tabs: DashboardTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
  headerTitle?: string;
}

export default function DashboardLayout({
  roleName,
  tabs,
  activeTab,
  onTabChange,
  children,
  headerTitle
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans selection:bg-teal-500/30 flex">
      
      {/* Sidebar Navigation - Premium Dark */}
      <aside className="w-64 bg-slate-900 text-white shrink-0 hidden md:flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-slate-800">
          <button onClick={() => onTabChange("home")} className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity">
             <div className="w-8 h-8 rounded-lg bg-tenant-accent flex items-center justify-center text-white font-bold shadow-[0_0_15px_var(--tenant-accent-glow)]">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
             </div>
             <span className="font-serif font-bold tracking-widest uppercase">DehaPa <span className="text-tenant-accent">{roleName}</span></span>
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            return (
              <React.Fragment key={tab.id}>
                {tab.section && (
                  <div className={`pt-4 mt-4 border-t border-slate-800 ${index === 0 ? 'border-t-0 mt-0 pt-0' : ''}`}>
                    <p className="px-4 text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">{tab.section}</p>
                  </div>
                )}
                <button 
                  onClick={() => onTabChange(tab.id)} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-r-xl text-sm font-medium transition-all text-left mb-1 ${
                    isActive 
                      ? 'border-l-4 border-teal-500 bg-teal-500/10 text-white' 
                      : 'border-l-4 border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{tab.badge}</span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-serif font-bold text-slate-900 capitalize">
            {headerTitle || activeTab.replace("-", " ")}
          </h2>
          <div className="flex items-center gap-4">
            <Link href="/portal" className="text-sm font-bold text-tenant-accent hover:underline">Exit to Portal</Link>
          </div>
        </header>

        <div className="p-8 flex-1">
          {activeTab === "home" ? (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Welcome to {roleName}</h3>
                <p className="text-slate-500">Select a module below to get started.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tabs.map(tab => (
                  <button 
                    key={tab.id} 
                    onClick={() => onTabChange(tab.id)} 
                    className="bg-white p-6 border border-slate-200 hover:border-teal-500 rounded-2xl shadow-sm hover:shadow-xl transition-all text-left group flex flex-col items-start h-full"
                  >
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {tab.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{tab.label}</h3>
                    <p className="text-sm text-slate-500 flex-1">Access the {tab.label} module to manage your settings and data.</p>
                    <div className="mt-6 flex items-center gap-2 text-teal-600 text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      Open Module <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>

    </div>
  );
}
