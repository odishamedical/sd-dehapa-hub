import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import ContextHelpDrawer from './ContextHelpDrawer';

export type DashboardTab = {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: string | number;
  section?: string;
};

interface DashboardLayoutProps {
  roleName: string;
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
  const [expandedNavSection, setExpandedNavSection] = useState<string | null>(null);

  useEffect(() => {
    if (roleName === "User Portal") {
      for (const section of sectionedTabsList) {
        if (section.tabs.some(t => t.id === activeTab)) {
          setExpandedNavSection(section.section);
          break;
        }
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
      <nav className="flex flex-col w-full">
        {/* Home Tab */}
        <button 
          onClick={() => { onTabChange('home'); if (isMobile) setIsMobileMenuOpen(false); }} 
          className={`w-full text-left px-4 py-3.5 mb-2 rounded-xl font-bold transition-colors flex items-center gap-3 ${activeTab === 'home' ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100'}`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span className="truncate">{roleName}</span>
        </button>
        
        {sectionedTabsList.map((sectionObj, idx) => {
          const isAccordion = roleName === "User Portal" && sectionObj.section !== "DEFAULT";
          const isExpanded = expandedNavSection === sectionObj.section;
          
          return (
          <div key={sectionObj.section} className="flex flex-col w-full">
            {sectionObj.section !== "DEFAULT" && (
              <div className="pt-4 pb-2">
                {isAccordion ? (
                  <button 
                    onClick={() => setExpandedNavSection(isExpanded ? null : sectionObj.section)}
                    className="w-full flex items-center justify-between px-2 py-2 text-slate-500 hover:text-slate-900"
                  >
                    <span className="text-xs font-black uppercase tracking-widest">{sectionObj.section}</span>
                    <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                ) : (
                  <p className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 py-1">{sectionObj.section}</p>
                )}
              </div>
            )}
            
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isAccordion ? (isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0') : ''}`}>
              {sectionObj.tabs.map((tab, tabIdx) => {
                if (tab.id === "home") return null;
                const isActive = activeTab === tab.id;
                
                return (
                  <button 
                    key={tab.id}
                    onClick={() => { onTabChange(tab.id); if (isMobile) setIsMobileMenuOpen(false); }} 
                    className={`w-full text-left px-4 py-3.5 font-semibold transition-colors flex items-center justify-between group border-b border-slate-100 last:border-b-0 ${isActive ? 'text-teal-700 bg-teal-50/50 relative' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 rounded-r-full"></div>}
                    <div className="flex items-center gap-3 truncate">
                      <div className={isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}>
                        {tab.icon}
                      </div>
                      <span className="truncate text-sm">{tab.label}</span>
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
          </div>
          );
        })}
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* =========================================================================
          LEFT SIDEBAR (Fixed Desktop)
         ========================================================================= */}
      <aside className="hidden lg:flex w-[280px] shrink-0 flex-col bg-white border-r border-slate-200 h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] sticky top-20 md:top-24 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg leading-none">D</span>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">DehaPa</span>
          </Link>
        </div>

        {/* User Profile Widget */}
        <div className="p-4 shrink-0">
          <div 
            onClick={() => setShowQRModal(true)}
            className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-teal-50 hover:border-teal-100 transition-colors group"
          >
            {userProfile?.image ? (
              <img src={userProfile.image} alt={userProfile.name} className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-white shadow-sm" />
            ) : (
              <div className="w-10 h-10 bg-teal-100 text-teal-700 border-2 border-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-teal-700 transition-colors">{userProfile?.name || roleName}</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span> Online
              </p>
            </div>
            <svg className="w-4 h-4 text-slate-400 group-hover:text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6">
          {renderNavLinks(false)}
        </div>
      </aside>

      {/* =========================================================================
          MOBILE SLIDE-IN SIDEBAR (Drawer)
         ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden flex">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative w-[280px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left-full duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-lg leading-none">D</span>
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">DehaPa</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-4 shrink-0">
              <div 
                onClick={() => setShowQRModal(true)}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-3 cursor-pointer group"
              >
                {userProfile?.image ? (
                  <img src={userProfile.image} alt={userProfile.name} className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-white shadow-sm" />
                ) : (
                  <div className="w-10 h-10 bg-teal-100 text-teal-700 border-2 border-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{userProfile?.name || roleName}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span> Online
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-safe custom-scrollbar">
              {renderNavLinks(true)}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN CONTENT AREA
         ========================================================================= */}
      <div className="flex-1 flex flex-col w-full min-h-screen transition-all duration-300">
        
        {/* Main Header (Sticky) */}
        <header className="sticky top-20 md:top-24 z-30 bg-white border-b border-slate-200 h-16 px-4 lg:px-8 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu (Mobile Only) */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight hidden sm:block">
              {headerTitle || <><span className="font-black text-teal-700">{roleName.split(' ')[0]}</span> {roleName.split(' ').slice(1).join(' ')} Dashboard</>}
            </h1>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button 
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-colors shadow-sm shadow-rose-200 flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              SOS
            </button>

            <button 
              onClick={() => {
                if (window.location.hash !== '#scan') {
                  window.location.hash = 'scan';
                }
              }}
              className="hidden md:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Scan
            </button>

            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            
            <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 hidden md:block">
              Logout
            </button>
            
            {/* User Dropdown - Mockup */}
            <div className="hidden sm:flex items-center gap-2 cursor-pointer border border-slate-200 p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors">
              {userProfile?.image ? (
                <img src={userProfile.image} alt="User" className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-xs">U</div>
              )}
              <div className="flex flex-col text-left">
                 <span className="text-xs font-bold text-slate-900 leading-none">{userProfile?.name || "Dr. Rajesh Mishra"}</span>
                 <span className="text-[9px] text-slate-500 leading-none mt-0.5">{userProfile?.subtitle || "Cardiologist"}</span>
              </div>
              <svg className="w-3 h-3 text-slate-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 w-full max-w-[1400px] mx-auto pb-24 md:pb-8">
          {activeTab === "home" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out w-full">
              {children}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              {children}
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION BAR
         ========================================================================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[90] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {(() => {
            const bottomNavTabs = [{ id: 'home', label: 'Home', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> }, ...tabs.slice(0, 3).map(t => ({ id: t.id, label: t.label, icon: t.icon }))];
            return [
              ...bottomNavTabs,
              { id: 'more', label: 'More', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>, isMenuToggle: true }
            ].map((navItem) => {
              const isActive = activeTab === navItem.id && !('isMenuToggle' in navItem && navItem.isMenuToggle);
              return (
                <button
                  key={navItem.id}
                  onClick={() => ('isMenuToggle' in navItem && navItem.isMenuToggle) ? setIsMobileMenuOpen(true) : onTabChange(navItem.id)}
                  className={`flex flex-col items-center justify-center w-14 transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <div className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
                    {navItem.icon}
                  </div>
                  <span className={`text-[9px] font-bold ${isActive ? 'text-teal-700' : ''} truncate max-w-full px-1`}>
                    {navItem.label}
                  </span>
                </button>
              );
            });
          })()}
        </div>
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
                 onClick={() => alert("Copied")}
                 className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold text-sm"
               >
                 Copy Link
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
