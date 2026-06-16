import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

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
  userProfile?: {
    image?: string;
    name: string;
    subtitle: string;
  };
  homeWidget?: React.ReactNode;
}

export default function DashboardLayout({
  roleName,
  tabs,
  activeTab,
  onTabChange,
  children,
  headerTitle,
  userProfile,
  homeWidget
}: DashboardLayoutProps) {
  // Find which section the active tab belongs to
  const activeTabDetails = tabs.find(t => t.id === activeTab);
  const activeSection = activeTabDetails?.section;

  // Track expanded state for sections (auto-expand the active section)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (activeSection) {
      initial[activeSection] = true;
    }
    return initial;
  });

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => {
      // If expanding, close all others. If collapsing, close this one.
      if (!prev[sectionName]) {
        return { [sectionName]: true };
      }
      return { ...prev, [sectionName]: false };
    });
  };

  // Group tabs by section
  const sectionedTabs = tabs.reduce((acc, tab) => {
    const section = tab.section || "DEFAULT";
    if (!acc[section]) acc[section] = [];
    acc[section].push(tab);
    return acc;
  }, {} as Record<string, DashboardTab[]>);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-teal-500/30 flex p-2 md:p-4 gap-4 md:gap-6">
      
      {/* Sidebar Navigation - Floating Pill */}
      <aside className="w-[280px] bg-slate-900 text-white shrink-0 hidden md:flex flex-col sticky top-4 h-[calc(100vh-32px)] overflow-y-auto rounded-3xl shadow-2xl shadow-slate-900/20 border border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <button onClick={() => onTabChange("home")} className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity">
             <div className="w-8 h-8 rounded-lg bg-tenant-accent flex items-center justify-center text-white font-bold shadow-[0_0_15px_var(--tenant-accent-glow)]">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
             </div>
             <span className="font-serif font-bold tracking-widest uppercase text-sm leading-tight">
               DehaPa <br/><span className="text-tenant-accent">{roleName}</span>
             </span>
          </button>
        </div>

        {userProfile && (
          <div className="p-6 border-b border-slate-800 bg-slate-900/50">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full border-2 border-teal-500 p-1 mb-3">
                {userProfile.image ? (
                  <img src={userProfile.image} alt={userProfile.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-white text-base">{userProfile.name}</h3>
              <p className="text-teal-400 text-xs font-medium mt-1 mb-4">{userProfile.subtitle}</p>
              
              {/* Dehapa ID QR Code */}
              <div className="bg-white p-2 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] inline-block">
                <QRCodeSVG 
                  value={`https://dehapa.com/id/${userProfile.name.toLowerCase().replace(/\s+/g, '-')}`} 
                  size={96} 
                  level="H"
                  fgColor="#0f172a" 
                />
              </div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-2">Scan for Profile Access</p>
            </div>
          </div>
        )}
        
        <nav className="flex-1 p-4 space-y-1">
          {Object.entries(sectionedTabs).map(([sectionName, sectionTabs], index) => {
            const isDefault = sectionName === "DEFAULT";
            const isExpanded = isDefault || expandedSections[sectionName];

            return (
              <React.Fragment key={sectionName}>
                {!isDefault && (
                  <div className={`mt-3 ${index === 0 ? 'mt-0' : ''}`}>
                    <button 
                      onClick={() => toggleSection(sectionName)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all border ${
                        isExpanded 
                          ? 'bg-slate-800 border-slate-700 text-white shadow-lg shadow-black/20' 
                          : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold tracking-widest uppercase flex items-center gap-3">
                        <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-teal-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                        {sectionName}
                      </span>
                    </button>
                  </div>
                )}
                
                {isExpanded && (
                  <div className={!isDefault ? "mt-1 pl-2 border-l border-slate-800 ml-5 space-y-1" : "space-y-1"}>
                    {sectionTabs.map(tab => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button 
                          key={tab.id}
                          onClick={() => onTabChange(tab.id)} 
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                            isActive 
                              ? 'bg-teal-500/10 text-teal-400' 
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {tab.icon}
                          <span className="truncate">{tab.label}</span>
                          {tab.badge !== undefined && (
                            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{tab.badge}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[calc(100vh-16px)] md:h-[calc(100vh-32px)] overflow-y-auto bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 relative">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 md:px-8 py-5 md:py-6 flex items-center justify-between sticky top-0 z-50">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900 capitalize">
            {headerTitle || activeTab.replace("-", " ")}
          </h2>
          <div className="flex items-center gap-4">
            <Link href="/portal" className="text-sm font-bold text-tenant-accent hover:underline bg-teal-50 px-3 py-1.5 rounded-lg">Exit to Portal</Link>
          </div>
        </header>

        {/* Horizontal Top Menu for Active Section */}
        {activeSection && activeTab !== "home" && (
          <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-[73px] md:top-[81px] z-40 px-4 sm:px-8">
            <div className="flex overflow-x-auto hide-scrollbar gap-1 py-3">
              {sectionedTabs[activeSection].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 md:p-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          {activeTab === "home" ? (
            <div className="max-w-6xl mx-auto">
              {homeWidget && (
                <div className="mb-6">
                  {homeWidget}
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Welcome to {roleName}</h3>
                <p className="text-sm text-slate-500">Select a module below to get started.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {tabs.map(tab => (
                  <button 
                    key={tab.id} 
                    onClick={() => onTabChange(tab.id)} 
                    className="bg-white/70 backdrop-blur-md p-5 border border-white hover:border-teal-400/50 rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 text-left group flex flex-col items-start h-full relative overflow-hidden"
                  >
                    {/* Decorative Blob */}
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-teal-400/20 to-blue-500/20 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-teal-400/30 transition-transform duration-700 z-0"></div>
                    
                    <div className="w-12 h-12 bg-gradient-to-br from-white to-slate-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:from-teal-50 group-hover:to-teal-100 group-hover:scale-110 transition-all duration-300 z-10 shadow-sm border border-slate-100">
                      {tab.icon}
                    </div>
                    
                    <h3 className="font-bold text-slate-800 text-sm mb-1.5 z-10 group-hover:text-teal-700 transition-colors">{tab.label}</h3>
                    <p className="text-[11px] text-slate-500 flex-1 leading-relaxed z-10 line-clamp-2">Manage {tab.label.toLowerCase()} preferences and records.</p>
                    
                    <div className="mt-5 w-full flex items-center justify-between text-teal-600 text-[9px] font-bold uppercase tracking-widest z-10">
                      <span className="group-hover:text-teal-700">Open</span>
                      <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-teal-100 flex items-center justify-center group-hover:translate-x-1 transition-all">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                      </div>
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
