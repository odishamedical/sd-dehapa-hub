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
  hideDefaultModulesList?: boolean;
}

export default function DashboardLayout({
  roleName,
  tabs,
  activeTab,
  onTabChange,
  children,
  headerTitle,
  userProfile,
  homeWidget,
  hideDefaultModulesList
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

  const [expandedHomeSections, setExpandedHomeSections] = useState<Record<string, boolean>>({});
  const [showQRModal, setShowQRModal] = useState(false);

  const toggleHomeSection = (sectionName: string) => {
    setExpandedHomeSections(prev => {
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
    <>
      <div className="min-h-screen bg-[#040815] text-slate-900 font-sans selection:bg-cyan-500/30 flex p-2 md:p-4 gap-4 md:gap-6">
      
      {/* Sidebar Navigation - Floating Pill */}
      <aside className="w-[280px] bg-[#0a1229] text-slate-200 shrink-0 hidden md:flex flex-col h-[calc(100vh-32px)] sticky top-4 overflow-y-auto scrollbar-hide rounded-[24px] shadow-2xl shadow-cyan-900/10 border border-cyan-500/20">
        {/* The top 'DEHAPA DOCTOR DASHBOARD' box has been completely removed to save space */}

        {userProfile && (
          <div className="p-6 border-b border-cyan-500/10 bg-[#040815]/50">
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
              
              {/* Sleek Teal QR Button */}
              <button 
                onClick={() => setShowQRModal(true)}
                className="mt-4 w-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/50 rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:shadow-[0_0_25px_rgba(20,184,166,0.25)] group"
              >
                <svg className="w-4 h-4 text-teal-300 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                <span className="text-teal-300 font-bold text-xs uppercase tracking-widest">Show Profile QR</span>
              </button>
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
                  <div className="mb-2">
                    <button 
                      onClick={() => {
                        toggleSection(sectionName);
                        // Also trigger navigation to the first tab instantly when opening the group
                        if (!isExpanded) {
                           onTabChange(sectionTabs[0].id);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all border ${
                        isExpanded
                          ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                          : 'bg-transparent border-transparent text-slate-400 hover:bg-[#040815] hover:border-cyan-500/20 hover:text-slate-200'
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
                              ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                              : 'text-slate-400 hover:bg-cyan-950/30 hover:text-cyan-100'
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
      <main className="flex-1 min-w-0 flex flex-col bg-[#aab6c4] bg-gradient-to-br from-[#c6d1dd] via-[#d4dde8] to-[#92a1b5] rounded-[24px] md:rounded-[32px] shadow-[inset_0_1px_3px_rgba(255,255,255,0.8),0_20px_50px_rgba(0,0,0,0.2)] border border-[#e2e8f0] relative overflow-hidden relative">
        
        {/* Subtle Brushed Metal Texture Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, #fff 1px, #fff 2px)' }}></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)' }}></div>

        <header className="bg-transparent border-b border-white/30 px-4 md:px-8 py-4 md:py-6 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 rounded-t-[24px] md:rounded-t-[32px]">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900 capitalize">
            {activeSection ? activeSection.replace("-", " ").toLowerCase() : "Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold text-teal-700 hover:text-teal-900 hover:underline bg-teal-50 border border-teal-100 px-4 py-2 rounded-xl transition-colors">Return to Home Page</Link>
          </div>
        </header>

        {/* Horizontal Top Stepper (Mockup Style) */}
        {activeSection && activeTab !== "home" && (
          <div className="bg-transparent sticky top-[73px] md:top-[81px] z-40 px-4 sm:px-8 pt-4 pb-2">
            <div className="flex justify-start md:justify-start">
              {(() => {
                const tabs = sectionedTabs[activeSection] || [];
                const currentIndex = tabs.findIndex(t => t.id === activeTab);
                if (currentIndex === -1) return null;
                
                const totalTabs = tabs.length;
                const visibleTabs = [tabs[currentIndex]];
                const hasPrev = currentIndex > 0;
                const hasNext = currentIndex < totalTabs - 1;
                
                return (
                  <div className="flex items-center bg-white/20 backdrop-blur-[30px] p-1.5 rounded-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_10px_20px_rgba(0,0,0,0.05)] border border-white/60">
                    {hasPrev && (
                      <button
                        onClick={() => onTabChange(tabs[currentIndex - 1].id)}
                        className="px-6 py-2.5 bg-transparent hover:bg-white/40 rounded-xl text-slate-600 font-bold text-sm transition-all border-r border-slate-400/20 mr-1"
                      >
                        Previous
                      </button>
                    )}
                    
                    {visibleTabs.map((tab, idx) => (
                      <div
                        key={tab.id}
                        className="px-6 sm:px-10 py-2.5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] rounded-xl text-slate-900 font-black text-sm relative z-10 flex items-center gap-2"
                      >
                        {currentIndex + 1}. {tab.label}
                      </div>
                    ))}
                    
                    {hasNext && (
                      <button
                        onClick={() => onTabChange(tabs[currentIndex + 1].id)}
                        className="px-8 py-2.5 bg-[#0f172a] text-white rounded-xl shadow-[0_4px_15px_rgba(15,23,42,0.3)] font-bold text-sm ml-2 transition-all hover:bg-[#1e293b]"
                      >
                        Next
                      </button>
                    )}

                    {!hasNext && (
                      <button 
                        onClick={() => {
                          alert("Profile setup complete! Your dashboard is ready.");
                          onTabChange("home");
                        }}
                        className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl font-bold text-sm transition-all shadow-md ml-2"
                      >
                        Finish Setup
                      </button>
                    )}
                  </div>
                );
              })()}
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
              {!hideDefaultModulesList && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Welcome to {roleName}</h3>
                  <p className="text-sm text-slate-500">Select a module below to get started.</p>
                </div>
              )}
              {!hideDefaultModulesList && (
                <div className="space-y-4">
                {Object.entries(sectionedTabs).map(([sectionName, sectionTabs]) => {
                  const isDefault = sectionName === "DEFAULT";
                  const displayName = isDefault ? "General Modules" : sectionName;
                  const isExpanded = isDefault || expandedHomeSections[sectionName];
                  
                  const displayTabs = sectionTabs.filter(t => t.id !== "home");
                  if (displayTabs.length === 0) return null;

                  return (
                    <div key={sectionName} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[24px] overflow-hidden shadow-xl shadow-slate-200/50 transition-all duration-300">
                      <button 
                        onClick={() => toggleHomeSection(sectionName)}
                        className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-white/60 to-white/90 hover:from-white/80 hover:to-white transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-[#0a1229] text-cyan-400 shadow-lg shadow-cyan-900/20 border border-cyan-500/30' : 'bg-slate-100/80 text-slate-500'}`}>
                            {isExpanded ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            ) : (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            )}
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-slate-900">{displayName}</h3>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{sectionTabs.length} Modules</p>
                          </div>
                        </div>
                      </button>

                      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        <div className="p-6 pt-0 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 bg-slate-50/50">
                          {displayTabs.map(tab => (
                            <button 
                              key={tab.id} 
                              onClick={() => onTabChange(tab.id)} 
                              className="bg-gradient-to-br from-[#ffffff] via-[#f8fafc] to-[#e2e8f0] p-5 border border-slate-200/60 hover:border-cyan-400/50 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-cyan-900/10 transition-all duration-300 text-left group flex flex-col items-start h-full relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-teal-50/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-700 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>
                              
                              <h4 className="font-bold text-slate-800 text-sm mb-1 z-10 group-hover:text-teal-700 transition-colors w-full">{tab.label}</h4>
                              <p className="text-[10px] text-slate-500 mb-4 z-10 line-clamp-1 w-full">Manage {tab.label.toLowerCase()}</p>
                              
                              <div className="w-10 h-10 bg-white/80 text-cyan-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#0a1229] group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-300 z-10 shadow-sm border border-slate-200/50 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                {tab.icon}
                              </div>
                              
                              <div className="mt-auto pt-2 w-full flex items-center justify-between text-cyan-600 text-[9px] font-bold uppercase tracking-widest z-10 border-t border-slate-200/50">
                                <span className="group-hover:text-cyan-700">Open</span>
                                <div className="w-6 h-6 rounded-full bg-white group-hover:bg-cyan-100 flex items-center justify-center group-hover:translate-x-1 transition-all shadow-sm">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          ) : (
            children
          )}
        </div>
      </main>

    </div>
      
      {/* QR Code Modal */}
      {showQRModal && userProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#040815]/80 backdrop-blur-sm cursor-pointer"
            onClick={() => setShowQRModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] p-10 flex flex-col items-center shadow-2xl shadow-cyan-900/50 animate-in fade-in zoom-in-95 max-w-sm w-full">
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <h3 className="text-xl font-serif font-bold text-white mb-2 text-center">{userProfile.name}'s Profile</h3>
            <p className="text-sm text-teal-400 mb-8 text-center">{userProfile.subtitle}</p>

            <div className="bg-white p-6 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.2)] mb-8">
              <QRCodeSVG 
                value={`https://dehapa.com/id/${userProfile.name.toLowerCase().replace(/\s+/g, '-')}`} 
                size={200} 
                level="H"
                fgColor="#0f172a" 
              />
            </div>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(`https://dehapa.com/id/${userProfile.name.toLowerCase().replace(/\s+/g, '-')}`);
                alert("Profile Link Copied to Clipboard!");
              }}
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(20,184,166,0.6)]"
            >
              Copy Profile Link
            </button>
          </div>
        </div>
      )}
    </>
  );
}
