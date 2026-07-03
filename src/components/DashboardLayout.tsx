import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import ContextHelpDrawer from './ContextHelpDrawer';

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
    profileUrl?: string;
    uid?: string;
  };
  homeWidget?: React.ReactNode;
  hideDefaultModulesList?: boolean;
  godMode?: boolean;
  onToggleGodMode?: () => void;
  userRole?: string;
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
  hideDefaultModulesList,
  godMode,
  onToggleGodMode,
  userRole
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [origin, setOrigin] = useState("https://dehapa.com");
  const [expandedNavSection, setExpandedNavSection] = useState<string | null>(null);

  // Automatically expand the section that contains the activeTab on mount or when activeTab changes
  useEffect(() => {
    // Auto-expand active tab section for all portals
    for (const section of sectionedTabsList) {
      if (section.tabs.some(t => t.id === activeTab)) {
        setExpandedNavSection(section.section);
        break;
      }
    }
  }, [activeTab, tabs, roleName]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const handleOpenQR = () => setShowQRModal(true);
    window.addEventListener('sd_open_qr_modal', handleOpenQR);
    return () => window.removeEventListener('sd_open_qr_modal', handleOpenQR);
  }, []);

  // Group tabs by section (maintain order)
  const sectionedTabsList: { section: string, tabs: DashboardTab[] }[] = [];
  tabs.forEach(tab => {
    const sectionName = tab.section || "DEFAULT";
    let existingSection = sectionedTabsList.find(s => s.section === sectionName);
    if (!existingSection) {
      existingSection = { section: sectionName, tabs: [] };
      sectionedTabsList.push(existingSection);
    }
    existingSection.tabs.push(tab);
  });

  const renderNavLinks = (isMobile = false) => {
    return (
      <nav className="space-y-2 w-full">
        <button 
          onClick={() => { onTabChange('home'); if (isMobile) setIsMobileMenuOpen(false); }} 
          className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'home' ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          <span className={`w-2 h-2 rounded-full ${activeTab === 'home' ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.6)]' : 'bg-slate-400'}`}></span>
          {roleName === "Patient" ? "User Dashboard" : `${roleName} Dashboard`}
        </button>
        
        {sectionedTabsList.map((sectionObj, idx) => {
          const isAccordion = sectionObj.section !== "DEFAULT";
          const isExpanded = expandedNavSection === sectionObj.section;
          
          let headerColorClass = "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50";
          let headerTextClass = "text-[10px] uppercase tracking-widest";
          let headerBgClass = "";
          
          if (isAccordion) {
            headerTextClass = "text-xs font-black uppercase tracking-wider";
            if (sectionObj.section === "Personal Details") {
              headerColorClass = "text-rose-600 hover:text-rose-800";
              headerBgClass = "bg-rose-50 hover:bg-rose-100";
            } else if (sectionObj.section === "Healthcare & Consults") {
              headerColorClass = "text-red-600 hover:text-red-800";
              headerBgClass = "bg-red-50 hover:bg-red-100";
            } else if (sectionObj.section === "Medical Records") {
              headerColorClass = "text-emerald-600 hover:text-emerald-800";
              headerBgClass = "bg-emerald-50 hover:bg-emerald-100";
            } else if (sectionObj.section === "Network & Financials") {
              headerColorClass = "text-blue-600 hover:text-blue-800";
              headerBgClass = "bg-blue-50 hover:bg-blue-100";
            }
          }
          
          return (
          <React.Fragment key={sectionObj.section}>
            {sectionObj.section !== "DEFAULT" && (
              <div className={`pt-4 pb-2 ${idx > 0 ? 'mt-2 border-t border-white/10' : ''}`}>
                {isAccordion ? (
                  <button 
                    onClick={() => setExpandedNavSection(isExpanded ? null : sectionObj.section)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all shadow-sm ${headerColorClass} ${headerBgClass} border border-transparent hover:border-white/10`}
                  >
                    <span className={headerTextClass}>{sectionObj.section}</span>
                    <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                ) : (
                  <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 py-1">{sectionObj.section}</p>
                )}
              </div>
            )}
            
            <div className={`space-y-1.5 overflow-hidden transition-all duration-300 ${isAccordion ? (isExpanded ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0') : ''}`}>
              {sectionObj.tabs.map(tab => {
                if (tab.id === "home") return null;
                const isActive = activeTab === tab.id;
                const tintClasses = isActive 
                  ? 'bg-gradient-to-r from-teal-50 to-transparent border-l-4 border-teal-500 text-teal-700 font-black shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900 border-l-4 border-transparent hover:border-slate-200';
                
                return (
                  <button 
                    key={tab.id}
                    onClick={() => { onTabChange(tab.id); if (isMobile) setIsMobileMenuOpen(false); }} 
                    className={`w-full text-left pl-3 pr-4 py-3 rounded-r-xl font-bold transition-all flex items-center justify-between group hover:translate-x-1 duration-200 ${tintClasses}`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={isActive ? 'text-teal-600 drop-shadow-[0_0_4px_rgba(20,184,166,0.3)]' : 'text-slate-400 group-hover:text-slate-600 transition-colors'}>
                        {tab.icon}
                      </div>
                      <span className="truncate">{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span className="ml-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-sm shadow-rose-200">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </React.Fragment>
          );
        })}
      </nav>
    );
  };

  const [expandedHomeSections, setExpandedHomeSections] = useState<Record<string, boolean>>({});

  const toggleHomeSection = (sectionName: string) => {
    setExpandedHomeSections(prev => {
      if (!prev[sectionName]) {
        return { ...prev, [sectionName]: true };
      }
      const next = { ...prev };
      delete next[sectionName];
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 text-slate-900 font-sans relative overflow-x-hidden flex flex-col">
      
      {/* Enhanced Vibrant Background Orbs for Soft Glassmorphism effect */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/30 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-400/20 blur-[120px] animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-indigo-400/20 blur-[90px] animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Main Header (Sticky) */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-white/80 shadow-sm px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <button onClick={() => onTabChange("home")} className="text-xl md:text-2xl font-black text-slate-900 tracking-tight hover:text-teal-600 transition-colors">
            DehaPa Portal
          </button>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={() => { if (window.location.hash !== '#scan') window.location.hash = 'scan'; }}
            className="hidden md:flex items-center gap-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 border border-teal-500/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
          >
            Scan QR
          </button>

          <button 
            onClick={() => setIsHelpOpen(true)}
            className="hidden md:flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
          >
            Help
          </button>
          
          <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative z-40 w-full max-w-[1400px] mx-auto">
        
        {/* =========================================================================
            LEFT SIDEBAR (Glassmorphism)
           ========================================================================= */}
        <aside className="hidden lg:block w-80 shrink-0 p-6 z-20">
          <div className="sticky top-[100px] bg-white/60 backdrop-blur-3xl p-6 rounded-[2rem] shadow-lg border border-white/80 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
            {userProfile && (
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200/50">
                {userProfile.image ? (
                  <img src={userProfile.image} alt={userProfile.name} className="w-12 h-12 rounded-full object-cover shrink-0 border border-white" />
                ) : (
                  <div className="w-12 h-12 bg-teal-100 border border-teal-200 text-teal-700 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                    {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div className="overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex-1 group" onClick={() => setShowQRModal(true)}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">{userProfile.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{userProfile.subtitle}</p>
                </div>
              </div>
            )}

            {renderNavLinks(false)}

            <div className="mt-8 pt-6 border-t border-slate-200/50">
              <button 
                onClick={() => onTabChange('faq')}
                className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm ${activeTab === 'faq' ? 'bg-blue-600 text-white shadow-blue-200 shadow-md' : 'bg-white/50 text-slate-600 border border-slate-200/50 hover:bg-blue-600 hover:text-white'}`}
              >
                Dashboard FAQ
              </button>
              
              {userRole === 'super_admin' && onToggleGodMode && (
                <button 
                  onClick={onToggleGodMode}
                  className={`mt-4 w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm border ${godMode ? 'bg-red-500 text-white border-red-500' : 'bg-white text-red-500 border-red-200 hover:bg-red-500 hover:text-white'}`}
                >
                  {godMode ? 'Disable God Mode' : 'Enable God Mode'}
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* =========================================================================
            MOBILE SLIDE-IN SIDEBAR (Drawer)
           ========================================================================= */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden flex">
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="relative w-72 max-w-sm bg-white/90 backdrop-blur-3xl border-r border-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left-full duration-300">
              <div className="p-6 border-b border-slate-200/50 flex items-center justify-between">
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col">
                <div className="flex-1">
                  {renderNavLinks(true)}
                </div>
                
                {/* Mobile FAQ Button */}
                <div className="mt-6 pt-6 border-t border-white/10">
                   <button 
                     onClick={() => { onTabChange('faq'); setIsMobileMenuOpen(false); }}
                     className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm ${activeTab === 'faq' ? 'bg-blue-600 text-white shadow-md' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-blue-600 hover:text-white'}`}
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     Dashboard FAQ
                   </button>
                   
                   {/* GOD MODE TOGGLE */}
                   {userRole === 'super_admin' && onToggleGodMode && (
                     <button 
                       onClick={() => { onToggleGodMode(); setIsMobileMenuOpen(false); }}
                       className={`mt-4 w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm border ${godMode ? 'bg-red-500 text-white border-red-500 shadow-md' : 'bg-white text-red-500 border-red-200 hover:bg-red-500 hover:text-white'}`}
                     >
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path></svg>
                       {godMode ? 'Disable God Mode' : 'Enable God Mode'}
                     </button>
                   )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MAIN CONTENT AREA
           ========================================================================= */}
        <main className="flex-1 py-8 px-4 md:px-8 w-full max-w-5xl mx-auto overflow-x-hidden min-h-[calc(100vh-80px)]">
          {activeTab === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out mb-8">
              {homeWidget && (
                <div className="mb-6">
                  {homeWidget}
                </div>
              )}
              
              {!hideDefaultModulesList && (
                <>
                  {/* Premium Hero Section */}
              <div className="relative rounded-[2rem] bg-gradient-to-br from-indigo-900 via-slate-900 to-teal-900 p-8 md:p-12 mb-8 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/30 rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-[80px]"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Welcome to {roleName}</h2>
                    <p className="text-indigo-200 text-lg max-w-xl">Your central command center for managing operations across the DehaPa Ecosystem.</p>
                  </div>
                  {userProfile?.image && (
                    <div className="w-20 h-20 rounded-full border-4 border-white/20 shadow-lg overflow-hidden shrink-0 hidden md:block">
                      <img src={userProfile.image} alt={userProfile.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Bento Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sectionedTabsList.map((sectionObj) => {
                  const sectionName = sectionObj.section;
                  const isDefault = sectionName === "DEFAULT";
                  const displayName = isDefault ? "General Modules" : sectionName;
                  
                  const displayTabs = sectionObj.tabs.filter(t => t.id !== "home");
                  if (displayTabs.length === 0) return null;

                  return (
                    <div key={sectionName} className="col-span-1 md:col-span-2 lg:col-span-3 mb-2">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">{displayName}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayTabs.map(tab => (
                          <button 
                            key={tab.id} 
                            onClick={() => onTabChange(tab.id)} 
                            className="group relative bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.12)] hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden flex flex-col justify-between min-h-[160px]"
                          >
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors"></div>
                            
                            <div className="relative z-10">
                              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                {tab.icon}
                              </div>
                              <h4 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-indigo-700 transition-colors">{tab.label}</h4>
                              <p className="text-sm text-slate-500 line-clamp-2">Manage settings and records for {tab.label.toLowerCase()}.</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
                </>
              )}
            </div>
          )}

          <div className={activeTab === "home" ? "" : "animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out bg-white/70 backdrop-blur-3xl rounded-2xl shadow-xl border border-white/80 overflow-hidden p-6 md:p-8"}>
            {children}
          </div>
        </main>
      </div>

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION BAR (Only for Patient Portal)
         ========================================================================= */}
      {roleName === "User Portal" && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[90] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe">
          <div className="flex items-center justify-around px-2 py-3">
            {[
              { id: 'home', label: 'Home', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> },
              { id: 'appointments', label: 'Bookings', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> },
              { id: 'vault', label: 'Records', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> },
              { id: 'settings', label: 'Profile', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> }
            ].map((navItem) => {
              const isActive = activeTab === navItem.id;
              return (
                <button
                  key={navItem.id}
                  onClick={() => onTabChange(navItem.id)}
                  className={`flex flex-col items-center justify-center w-16 transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <div className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
                    {navItem.icon}
                  </div>
                  <span className={`text-[10px] font-bold ${isActive ? 'text-teal-700' : ''}`}>
                    {navItem.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* QR Code Modal */}
      {showQRModal && userProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm cursor-pointer transition-opacity"
            onClick={() => setShowQRModal(false)}
          ></div>
          
          <div className="relative bg-white rounded-3xl p-10 flex flex-col items-center shadow-2xl max-w-sm w-full animate-in zoom-in-95">
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1 text-center">{userProfile.name}'s Profile</h3>
            <p className="text-sm text-teal-600 mb-8 text-center">{roleName === "User Portal" ? "Patient QR Code" : userProfile.subtitle}</p>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
              <QRCodeSVG 
                value={
                  roleName === "User Portal" && userProfile.uid 
                    ? `dehapa-auth://scan?uid=${userProfile.uid}`
                    : (userProfile.profileUrl || `${origin}/profile/${roleName.split(' ')[0].toLowerCase()}/${userProfile.name.toLowerCase().replace(/\s+/g, '-')}`) + '?action=connect'
                } 
                size={200} 
                level="L"
                fgColor="#0f172a" 
              />
            </div>

            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={() => {
                  const link = roleName === "User Portal" && userProfile.uid
                    ? `dehapa-auth://scan?uid=${userProfile.uid}`
                    : (userProfile.profileUrl || `${origin}/profile/${roleName.split(' ')[0].toLowerCase()}/${userProfile.name.toLowerCase().replace(/\s+/g, '-')}`) + '?action=connect';
                  navigator.clipboard.writeText(link);
                  alert(roleName === "User Portal" ? "Patient QR Data Copied!" : "Invitation Link Copied to Clipboard!");
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                {roleName === "User Portal" ? "Copy ID Link" : "Copy Invitation Link"}
              </button>

              <button 
                onClick={() => {
                  const link = roleName === "User Portal" && userProfile.uid
                    ? `dehapa-auth://scan?uid=${userProfile.uid}`
                    : (userProfile.profileUrl || `${origin}/profile/${roleName.split(' ')[0].toLowerCase()}/${userProfile.name.toLowerCase().replace(/\s+/g, '-')}`) + '?action=connect';
                  
                  const message = roleName === "User Portal" 
                    ? `Add me to your patient roster on DehaPa: ${link}`
                    : `Book an appointment or connect with me on DehaPa: ${link}`;
                  
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-xl py-3 font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Share via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context-Aware Help Drawer */}
      <ContextHelpDrawer 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        activeTab={activeTab}
        userProfile={userProfile}
        roleName={roleName}
      />
    </div>
  );
}
