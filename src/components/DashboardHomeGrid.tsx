import React from 'react';
import { DashboardTab } from './DashboardLayout';

export interface PendingAction {
  id: string;
  label: string;
  tabId?: string;
}

export interface CompletedAction {
  id: string;
  label: string;
}

export interface DashboardHomeGridProps {
  onNavigate: (tabId: string) => void;
  tabs: DashboardTab[];
  profileStrength: number;
  profileTitle: string;
  profileSubtitle: string;
  pendingActions?: PendingAction[];
  completedActions?: CompletedAction[];
  topRightWidget?: React.ReactNode;
  middleRightWidget?: React.ReactNode;
  extraContent?: React.ReactNode;
}

export default function DashboardHomeGrid({
  onNavigate,
  tabs,
  profileStrength,
  profileTitle,
  profileSubtitle,
  pendingActions = [],
  completedActions = [],
  topRightWidget,
  middleRightWidget,
  extraContent
}: DashboardHomeGridProps) {
  // Group tabs by section
  const sectionedTabs = tabs.reduce((acc, tab) => {
    const section = tab.section || "DEFAULT";
    if (!acc[section]) acc[section] = [];
    acc[section].push(tab);
    return acc;
  }, {} as Record<string, DashboardTab[]>);

  const getFolderConfig = (sectionName: string) => {
    switch (sectionName) {
      case "PATIENT INQUIRIES":
        return {
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>,
          bgGradient: "bg-gradient-to-br from-amber-50 to-orange-50",
          iconBgColor: "bg-white",
          textColor: "text-amber-600"
        };
      case "PROFILE BUILDER":
        return {
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
          bgGradient: "bg-gradient-to-br from-sky-50 to-blue-50",
          iconBgColor: "bg-white",
          textColor: "text-sky-600"
        };
      case "ORDERS":
      case "FULFILLMENT":
        return {
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path></svg>,
          bgGradient: "bg-gradient-to-br from-purple-50 to-fuchsia-50",
          iconBgColor: "bg-white",
          textColor: "text-purple-600"
        };
      case "TEAM & ASSETS":
      case "FLEET & CREW":
        return {
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>,
          bgGradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
          iconBgColor: "bg-white",
          textColor: "text-emerald-600"
        };
      default:
        return {
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>,
          bgGradient: "bg-gradient-to-br from-slate-50 to-gray-100",
          iconBgColor: "bg-white",
          textColor: "text-slate-600"
        };
    }
  };

  const renderFolder = (sectionName: string) => {
    const config = getFolderConfig(sectionName);
    const { icon, bgGradient, iconBgColor, textColor } = config;
    const items = sectionedTabs[sectionName] || [];
    
    return (
      <div key={sectionName} className={`md:col-span-1 ${bgGradient} border border-${textColor.split('-')[1]}-100 rounded-[24px] p-6 shadow-sm relative overflow-hidden h-full flex flex-col justify-between group`}>
        <div className="flex flex-col h-full z-10 relative">
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className={`w-10 h-10 rounded-xl ${iconBgColor} ${textColor} flex items-center justify-center shadow-sm`}>
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{sectionName === "DEFAULT" ? "GENERAL" : sectionName}</h3>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">{items.length} MODULES</p>
            </div>
          </div>
          <div className="flex-1 relative z-10 overflow-y-auto pr-2 custom-scrollbar">
            <ul className="space-y-2">
              {items.map((tab, index) => (
                <li key={tab.id}>
                  <button 
                    onClick={() => onNavigate(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl bg-white/70 hover:bg-white text-sm text-slate-700 font-bold flex items-center gap-3 transition-all group/item shadow-sm border border-white/50 hover:shadow hover:border-${textColor.split('-')[1]}-200`}
                  >
                    <span className={`text-${textColor.split('-')[1]}-400/50 font-black text-xs w-5 text-right`}>{index + 1}.</span>
                    <span className="truncate flex-1">{tab.label}</span>
                    <div className={`w-6 h-6 rounded-full bg-${textColor.split('-')[1]}-50 flex items-center justify-center opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all`}>
                      <svg className={`w-3 h-3 text-${textColor.split('-')[1]}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 md:row-span-2 flex flex-col gap-6">
        <div className="flex-1 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 border border-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.05)] rounded-[24px] p-6 sm:p-8 relative overflow-hidden">
          {/* Metallic Shine Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 hover:translate-x-full duration-1000 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>
          
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{profileTitle}</h3>
              <p className="text-sm text-slate-500 mt-1">{profileSubtitle}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-teal-600">{profileStrength}%</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-teal-400 to-teal-600 h-full rounded-full" style={{ width: `${profileStrength}%` }}></div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {pendingActions.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Pending Actions
                </h4>
                <ul className="space-y-3">
                  {pendingActions.map((action, i) => (
                    <li key={action.id} className={`flex items-center justify-between p-3 rounded-xl ${i === 0 ? 'bg-amber-50 border border-amber-100' : 'bg-slate-50 border border-slate-100 hover:border-slate-200'} transition-colors`}>
                      <span className={`text-sm font-medium flex items-center gap-2 ${i === 0 ? 'text-amber-900' : 'text-slate-700'}`}>
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-amber-400' : 'bg-slate-300'}`}></div>
                        {action.label}
                      </span>
                      {action.tabId && (
                        <button onClick={() => onNavigate(action.tabId!)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${i === 0 ? 'text-amber-700 bg-amber-100/50 hover:bg-amber-200' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'}`}>
                          Complete
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {completedActions.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Completed
                </h4>
                <ul className="space-y-3">
                  {completedActions.map(action => (
                    <li key={action.id} className="flex items-center justify-between opacity-50 p-3 border border-transparent">
                      <span className="text-sm text-slate-500 font-medium flex items-center gap-2 line-through">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        {action.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {extraContent && (
              <div className="mt-2">
                {extraContent}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {topRightWidget && (
        <div className="md:col-span-1">
          {topRightWidget}
        </div>
      )}

      {middleRightWidget && (
        <div className="md:col-span-1">
          {middleRightWidget}
        </div>
      )}

      {Object.keys(sectionedTabs).map(sectionName => renderFolder(sectionName))}
    </div>
  );
}
