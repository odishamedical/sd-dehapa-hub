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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [origin, setOrigin] = useState("https://dehapa.com");

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
      <nav className="space-y-1 w-full">
        <button 
          onClick={() => { onTabChange('home'); if (isMobile) setIsMobileMenuOpen(false); }} 
          className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'home' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          <span className={`w-2 h-2 rounded-full ${activeTab === 'home' ? 'bg-indigo-500' : 'bg-slate-300'}`}></span>
          {roleName === "Patient" ? "User Dashboard" : `${roleName} Dashboard`}
        </button>
        
        {sectionedTabsList.map((sectionObj, idx) => (
          <React.Fragment key={sectionObj.section}>
            {sectionObj.section !== "DEFAULT" && (
              <div className={`pt-6 pb-2 ${idx > 0 ? 'border-t border-slate-200/50 mt-4' : ''}`}>
                <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{sectionObj.section}</p>
              </div>
            )}
            
            {sectionObj.tabs.map(tab => {
              if (tab.id === "home") return null;
              const isActive = activeTab === tab.id;
              const tintClasses = isActive ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';
              
              return (
                <button 
                  key={tab.id}
                  onClick={() => { onTabChange(tab.id); if (isMobile) setIsMobileMenuOpen(false); }} 
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-between group ${tintClasses}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className={isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}>
                      {tab.icon}
                    </div>
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </nav>
    );
  };

  const [expandedHomeSections, setExpandedHomeSections] = useState<Record<string, boolean>>({});

  const toggleHomeSection = (sectionName: string) => {
    setExpandedHomeSections(prev => {
      if (!prev[sectionName]) {
        return { [sectionName]: true };
      }
      return { ...prev, [sectionName]: false };
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans relative overflow-x-hidden flex flex-col">
      
      {/* Background Orbs for Glassmorphism effect */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-200/40 rounded-full blur-[120px] animate-float-slow"></div>
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] bg-indigo-200/40 rounded-full blur-[100px] animate-float-slow-reverse"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] bg-rose-200/30 rounded-full blur-[100px] animate-float-slow"></div>
      </div>

      {/* Main Header (Sticky) */}
      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/80 shadow-sm px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <button onClick={() => onTabChange("home")} className="text-xl md:text-2xl font-black text-slate-800 tracking-tight hover:text-teal-600 transition-colors">
            DehaPa Portal
          </button>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={() => {
              if (window.location.hash !== '#scan') {
                window.location.hash = 'scan';
              }
            }}
            className="hidden md:flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Scan QR
          </button>

          <button 
            onClick={() => setIsHelpOpen(true)}
            className="hidden md:flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Help & Guide
          </button>
          
          <button 
            onClick={() => setIsHelpOpen(true)}
            className="md:hidden p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>

          <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900">
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative z-10 w-full max-w-[1400px] mx-auto">
        
        {/* =========================================================================
            LEFT SIDEBAR (Glassmorphism)
           ========================================================================= */}
        <aside className="hidden lg:block w-72 shrink-0 p-6">
          <div className="sticky top-[100px] sd-glass-panel p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            {userProfile && (
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200/50">
                {userProfile.image ? (
                  <img src={userProfile.image} alt={userProfile.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                    {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div className="overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex-1 group" onClick={() => setShowQRModal(true)}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors" title={userProfile.name}>{userProfile.name}</h3>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5" title={userProfile.subtitle}>{userProfile.subtitle}</p>
                </div>
              </div>
            )}

            {renderNavLinks(false)}
          </div>
        </aside>

        {/* =========================================================================
            MOBILE SLIDE-IN SIDEBAR (Drawer)
           ========================================================================= */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden flex">
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="relative w-72 max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left-full duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {userProfile?.image ? (
                    <img src={userProfile.image} alt={userProfile.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="overflow-hidden flex-1 group" onClick={() => setShowQRModal(true)}>
                    <div className="flex items-center justify-between cursor-pointer">
                      <h3 className="font-bold text-slate-900 truncate text-sm group-hover:text-teal-600 transition-colors">{userProfile?.name || roleName}</h3>
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {renderNavLinks(true)}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MAIN CONTENT AREA
           ========================================================================= */}
        <main className="flex-1 py-8 px-4 md:px-8 w-full max-w-5xl mx-auto overflow-x-hidden min-h-[calc(100vh-80px)]">
          {activeTab === "home" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              {homeWidget && (
                <div className="mb-6">
                  {homeWidget}
                </div>
              )}
              
              {!hideDefaultModulesList && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Welcome to {roleName} Dashboard</h3>
                  <p className="text-sm text-slate-500">Select a module below to get started.</p>
                </div>
              )}
              
              {!hideDefaultModulesList && (
                <div className="space-y-4">
                {sectionedTabsList.map((sectionObj) => {
                  const sectionName = sectionObj.section;
                  const isDefault = sectionName === "DEFAULT";
                  const displayName = isDefault ? "General Modules" : sectionName;
                  const isExpanded = isDefault || expandedHomeSections[sectionName];
                  
                  const displayTabs = sectionObj.tabs.filter(t => t.id !== "home");
                  if (displayTabs.length === 0) return null;

                  return (
                    <div key={sectionName} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                      <button 
                        onClick={() => toggleHomeSection(sectionName)}
                        className="w-full flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>
                            {isExpanded ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            )}
                          </div>
                          <div className="text-left">
                            <h3 className="text-sm md:text-base font-bold text-slate-900">{displayName}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{displayTabs.length} Modules</p>
                          </div>
                        </div>
                      </button>

                      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        <div className="p-5 pt-0 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white">
                          {displayTabs.map(tab => (
                            <button 
                              key={tab.id} 
                              onClick={() => onTabChange(tab.id)} 
                              className="group flex flex-col p-4 rounded-xl border border-slate-100 bg-white hover:border-teal-200 hover:shadow-md hover:shadow-teal-900/5 transition-all text-left"
                            >
                              <div className="w-8 h-8 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center mb-3 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                {tab.icon}
                              </div>
                              <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-teal-700 transition-colors">{tab.label}</h4>
                              <p className="text-xs text-slate-500 line-clamp-1">Manage {tab.label.toLowerCase()}</p>
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
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">
              {children}
            </div>
          )}
        </main>
      </div>
      
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
