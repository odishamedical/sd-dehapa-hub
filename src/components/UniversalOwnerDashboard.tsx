"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout, { DashboardTab } from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import AddressBlock, { AddressData } from '@/components/AddressBlock';
import { useAutosave } from '@/hooks/useAutosave';
import AutosaveIndicator from '@/components/AutosaveIndicator';
import ImageUpload from '@/components/ImageUpload';
import ObjectArrayEditor from '@/components/ObjectArrayEditor';
import InlineEditArray from '@/components/InlineEditArray';
import { doc, getDocs, updateDoc, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { directoryConfig } from '@/lib/directoryConfig';

interface UniversalOwnerDashboardProps {
  expectedRole: string; // e.g. "pharmacy", "lab", "ambulance", "doctor", "hospital"
  customTabs?: DashboardTab[];
  renderCustomTab?: (tabId: string, entityData: any) => React.ReactNode;
  homeWidget?: React.ReactNode;
}

export default function UniversalOwnerDashboard({ expectedRole, customTabs = [], renderCustomTab, homeWidget }: UniversalOwnerDashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [entityDocId, setEntityDocId] = useState<string | null>(null);
  const [origin, setOrigin] = useState("https://www.dehapa.com");
  const [userEmail, setUserEmail] = useState("");
  const [activeTab, setActiveTab] = useState("home");

  // Sync tab with URL Hash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      const email = localStorage.getItem("sd_current_user_email");
      if (!email) {
        window.location.href = "/login";
        return;
      }
      if (hash) {
        setActiveTab(hash);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "#" + activeTab);
    }
  }, [activeTab]);
  // Dynamic State for the Entity
  const [entityData, setEntityData] = useState<any>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const isInitialMount = React.useRef(true);
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (!entityDocId) return;

    setSaveStatus("saving");
    const timeout = setTimeout(async () => {
      try {
        const docRef = doc(db, 'directory', entityDocId);
        await updateDoc(docRef, entityData);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } catch (err) {
        console.error("Autosave error:", err);
        setSaveStatus("error");
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [entityData, entityDocId]);

  const categoryConfig = directoryConfig[expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1)];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("sd_current_user_role");
      const email = localStorage.getItem("sd_current_user_email");
      
      if ((role === expectedRole || role === "super_admin") && email) {
        setAccessGranted(true);
        setUserEmail(email);
        fetchEntity(email);
      } else {
        setAccessGranted(false);
        router.push("/portal");
      }
    }
  }, [router, expectedRole]);

  const fetchEntity = async (email: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, "directory"), where("ownerEmail", "==", email));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setEntityDocId(docSnap.id);
        setEntityData({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (err) {
      console.error("Error fetching entity for dashboard:", err);
    }
    setLoading(false);
  };

  if (loading) return null;
  if (!accessGranted) return null;

  // Calculate Progress
  const calculateCompletion = () => {
    let requiredFieldsCount = 0;
    let completedFieldsCount = 0;

    const baseMandatoryKeys = ['name', 'phone', 'about', 'image', 'city'];
    baseMandatoryKeys.forEach(k => {
      requiredFieldsCount++;
      if (entityData[k] && entityData[k].toString().trim() !== '') {
        completedFieldsCount++;
      }
    });

    categoryConfig?.tabs.forEach(tab => {
      tab.fields.forEach(field => {
        if (field.mandatory) {
          requiredFieldsCount++;
          const val = entityData[field.key];
          if (Array.isArray(val) && val.length > 0) {
            completedFieldsCount++;
          } else if (val && val.toString().trim() !== '') {
            completedFieldsCount++;
          }
        }
      });
    });

    return requiredFieldsCount === 0 ? 100 : Math.round((completedFieldsCount / requiredFieldsCount) * 100);
  };
  
  const completionPercentage = calculateCompletion();

  // Build Tabs Dynamically
  const baseTabs: DashboardTab[] = [
    {
      id: "identity",
      label: "Identity & Basic Info",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
    },
    {
      id: "location",
      label: "Location & Address",
      section: "PROFILE BUILDER",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
    }
  ];

  const schemaTabs: DashboardTab[] = categoryConfig?.tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    section: "PROFILE BUILDER",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
  })) || [];

  const allTabs = [...baseTabs, ...schemaTabs, ...customTabs];

  return (
    <DashboardLayout 
      roleName={`${expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1)} Portal`} 
      tabs={allTabs} 
      activeTab={activeTab} 
      onTabChange={(tabId) => {
        if (tabId === "home") setActiveTab("home");
        else setActiveTab(tabId);
      }}
      userProfile={entityData.id ? {
        name: entityData.name || "Provider",
        subtitle: userEmail,
        profileUrl: `${origin}/profile/${expectedRole}/${entityData.id}`
      } : undefined}
      homeWidget={homeWidget}
    >
      <div className="max-w-4xl mx-auto pb-24">
        
        {/* PROGRESS BAR WIDGET */}
        {(activeTab === "identity" || activeTab === "location" || categoryConfig?.tabs.some(t => t.id === activeTab)) && (
          <div className="bg-white/50 backdrop-blur-[40px] rounded-[32px] p-6 mb-8 shadow-sm border border-white/60 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-slate-800">Profile Completion</h3>
                <p className="text-xs text-slate-500 font-medium">Reach 100% on mandatory fields to publish your directory page.</p>
              </div>
              <span className="text-2xl font-black text-teal-600">{completionPercentage}%</span>
            </div>
            <div className="bg-slate-200/50 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-1000 ease-out relative ${completionPercentage === 100 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-sky-400 to-cyan-500'}`}
                style={{ width: `${Math.max(5, completionPercentage)}%` }}
              >
                <div className="absolute inset-0 bg-white/30 -skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>
        )}

        {/* IDENTITY TAB */}
        {activeTab === "identity" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Identity & Basic Info</h3>
            
            <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">Profile Visibility</h4>
                <p className="text-xs text-slate-500">
                  {completionPercentage < 100 
                    ? "Complete all mandatory fields to enable publication." 
                    : "When turned on, your profile will be visible in the public directory."}
                </p>
              </div>
              <label className={`relative inline-flex items-center ${completionPercentage < 100 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={entityData.isPublished === true}
                  disabled={completionPercentage < 100}
                  onChange={(e) => setEntityData({ ...entityData, isPublished: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
              </label>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                  Profile Photo <span className="text-rose-500 ml-1">*</span>
                </label>
                <ImageUpload 
                  defaultImage={entityData.image}
                  onChange={(url) => setEntityData({ ...entityData, image: url })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                    Business/Provider Name <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={entityData.name || ''}
                    onChange={e => setEntityData({ ...entityData, name: e.target.value })}
                    className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                    Phone Number <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={entityData.phone || ''}
                    onChange={e => setEntityData({ ...entityData, phone: e.target.value })}
                    className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                  About / Description <span className="text-rose-500 ml-1">*</span>
                </label>
                <textarea 
                  value={entityData.about || ''}
                  onChange={e => setEntityData({ ...entityData, about: e.target.value })}
                  rows={4}
                  className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all resize-none" 
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <AutosaveIndicator status={saveStatus} />
              </div>
            </div>
          </div>
        )}

        {/* LOCATION TAB */}
        {activeTab === "location" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Location & Address</h3>
            <AddressBlock 
              data={{
                country: entityData.country || 'India',
                state: entityData.state || 'Odisha',
                district: entityData.district || '',
                block: entityData.block || '',
                city: entityData.city || '',
                pincode: entityData.pin || '',
                localAddress: entityData.address || ''
              }} 
              onChange={(newData) => {
                setEntityData({
                  ...entityData,
                  country: newData.country,
                  state: newData.state,
                  district: newData.district,
                  block: newData.block,
                  city: newData.city,
                  pin: newData.pincode,
                  address: newData.localAddress
                });
              }} 
            />
            <div className="mt-6">
               <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">Google Maps Embed URL</label>
               <input 
                 type="text" 
                 value={entityData.mapUrl || ''}
                 onChange={e => setEntityData({ ...entityData, mapUrl: e.target.value })}
                 placeholder="<iframe src='...' /> or https://www.google.com/maps/embed?pb=..."
                 className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all" 
               />
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
              <AutosaveIndicator status={saveStatus} />
            </div>
          </div>
        )}

        {/* SCHEMA DYNAMIC TABS */}
        {categoryConfig?.tabs.map(tab => {
          if (activeTab === tab.id) {
            return (
              <div key={tab.id} className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">{tab.label}</h3>
                <div className="space-y-8">
                  {tab.fields.map(field => (
                    <div key={field.key} className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm hover:border-white transition-all">
                      {field.type === 'object_array' && field.arrayFields ? (
                        <ObjectArrayEditor
                          title={field.label}
                          items={entityData[field.key] || []}
                          fields={field.arrayFields}
                          onUpdate={(idx, k, val) => {
                            const newArr = [...(entityData[field.key] || [])];
                            newArr[idx] = { ...newArr[idx], [k]: val };
                            setEntityData({...entityData, [field.key]: newArr});
                          }}
                          onAdd={() => {
                            const emptyObj: any = {};
                            field.arrayFields?.forEach(af => emptyObj[af.key] = '');
                            setEntityData({...entityData, [field.key]: [...(entityData[field.key] || []), emptyObj]});
                          }}
                          onRemove={(idx) => {
                            const newArr = [...(entityData[field.key] || [])];
                            newArr.splice(idx, 1);
                            setEntityData({...entityData, [field.key]: newArr});
                          }}
                        />
                      ) : field.type === 'string_array' ? (
                        <>
                          <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-widest">{field.label}</h4>
                          <InlineEditArray 
                            items={entityData[field.key] || []} 
                            onSave={(newItems) => setEntityData({...entityData, [field.key]: newItems})} 
                            isEditMode={true}
                            placeholder={field.placeholder || "Add item..."} 
                          />
                        </>
                      ) : (
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">
                            {field.label} {field.mandatory && <span className="text-rose-500 ml-1">*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                              <textarea 
                                value={entityData[field.key] || ''} 
                                onChange={e => setEntityData({...entityData, [field.key]: e.target.value})} 
                                placeholder={field.placeholder}
                                rows={3}
                                className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all resize-none"
                              />
                          ) : field.type === 'select' ? (
                              <select 
                                value={entityData[field.key] || ''} 
                                onChange={e => setEntityData({...entityData, [field.key]: e.target.value})}
                                className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all"
                              >
                                <option value="">Select option</option>
                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                          ) : field.type === 'boolean' ? (
                              <label className="flex items-center gap-3 mt-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={entityData[field.key] || false} 
                                  onChange={e => setEntityData({...entityData, [field.key]: e.target.checked})} 
                                  className="w-5 h-5 text-cyan-500 rounded border-slate-300 focus:ring-cyan-500"
                                />
                                <span className="text-sm font-bold text-slate-700">Yes, this applies</span>
                              </label>
                          ) : (
                              <input 
                                type={field.type === 'number' ? 'number' : 'text'}
                                value={entityData[field.key] || ''} 
                                onChange={e => setEntityData({...entityData, [field.key]: e.target.value})} 
                                placeholder={field.placeholder}
                                className="w-full bg-white/60 backdrop-blur-md border border-white/60 hover:border-white rounded-xl px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all"
                              />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
                  <AutosaveIndicator status={saveStatus} />
                </div>
              </div>
            );
          }
          return null;
        })}

        {/* CUSTOM TABS RENDERER */}
        {renderCustomTab && renderCustomTab(activeTab, entityData)}

      </div>
    </DashboardLayout>
  );
}
