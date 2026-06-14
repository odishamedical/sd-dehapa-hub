import React, { ReactNode, useState } from 'react';
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
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Group tabs by section
  const sectionedTabs = tabs.reduce((acc, tab) => {
    const section = tab.section || "DEFAULT";
    if (!acc[section]) acc[section] = [];
    acc[section].push(tab);
    return acc;
  }, {} as Record<string, DashboardTab[]>);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans selection:bg-teal-500/30 flex">
      
      {/* Sidebar Navigation - Premium Dark */}
      <aside className="w-64 bg-slate-900 text-white shrink-0 hidden md:flex flex-col sticky top-0 h-screen overflow-y-auto">
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
              <p className="text-teal-400 text-xs font-medium mt-1">{userProfile.subtitle}</p>
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
                  <div className={`pt-4 mt-4 border-t border-slate-800 ${index === 0 ? 'border-t-0 mt-0 pt-0' : ''}`}>
                    <button 
                      onClick={() => toggleSection(sectionName)}
                      className="w-full flex items-center justify-between px-4 py-2 text-slate-400 hover:text-white group transition-colors"
                    >
                      <span className="text-[11px] font-bold tracking-widest uppercase flex items-center gap-2">
                        <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90 text-teal-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
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
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                            isActive 
                              ? 'bg-teal-500/10 text-teal-400' 
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-serif font-bold text-slate-900 capitalize">
            {headerTitle || activeTab.replace("-", " ")}
          </h2>
          <div className="flex items-center gap-4">
            <Link href="/portal" className="text-sm font-bold text-tenant-accent hover:underline">Exit to Portal</Link>
          </div>
        </header>

        {/* Horizontal Top Menu for Active Section */}
        {activeSection && activeTab !== "home" && (
          <div className="bg-white border-b border-slate-200 sticky top-[73px] z-40 px-4 sm:px-8">
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

        <div className="p-8 flex-1">
          {activeTab === "home" ? (
            <div className="max-w-6xl mx-auto">
              {homeWidget && (
                <div className="mb-10">
                  {homeWidget}
                </div>
              )}
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
