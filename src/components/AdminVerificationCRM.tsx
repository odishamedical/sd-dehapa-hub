"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, writeBatch, serverTimestamp, query, orderBy, updateDoc, where } from 'firebase/firestore';
import { AdminCard, AdminHeader } from '@/components/admin/ui';

export default function AdminVerificationCRM() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const collectionsToFetch = [
        { name: 'listing_claims', type: 'Legacy Claim' },
        { name: 'doctor_applications', type: 'Doctor' },
        { name: 'hospital_applications', type: 'Hospital' },
        { name: 'pharmacy_applications', type: 'Pharmacy' },
        { name: 'lab_applications', type: 'Lab' },
        { name: 'ambulance_applications', type: 'Ambulance' }
      ];

      const promises = collectionsToFetch.map(async (c) => {
        const q = query(collection(db, c.name), orderBy('lastUpdated', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({
          id: doc.id,
          collectionName: c.name,
          appType: c.type,
          ...doc.data()
        }));
      });

      // Fetch new directory drafts and pending approvals
      const dirDraftsQ = query(collection(db, 'directory'), where('status', '==', 'draft'));
      const dirPendingQ = query(collection(db, 'directory'), where('status', '==', 'pending_approval'));
      const profileClaimsQ = query(collection(db, 'profile_claims'));
      
      const dirPromises = [getDocs(dirDraftsQ), getDocs(dirPendingQ), getDocs(profileClaimsQ)];
      
      const results = await Promise.allSettled([...promises, ...dirPromises]);
      let allApps: any[] = [];
      
      // Helper to safely get value from Promise.allSettled
      const getResultDocs = (result: any) => result.status === 'fulfilled' ? result.value : (result.value?.docs || []);
      
      // Combine legacy results
      results.slice(0, collectionsToFetch.length).forEach((res: any) => { 
        if (res.status === 'fulfilled') {
          allApps = [...allApps, ...res.value];
        } else {
          console.error("Failed to fetch legacy collection", res.reason);
        }
      });
      
      // Combine directory results and map to application schema
      const dirDraftSnap = results[collectionsToFetch.length];
      const dirPendingSnap = results[collectionsToFetch.length + 1];
      
      const drafts = dirDraftSnap.status === 'fulfilled' ? dirDraftSnap.value.docs : [];
      const pendings = dirPendingSnap.status === 'fulfilled' ? dirPendingSnap.value.docs : [];
      
      const dirApps = [...drafts, ...pendings].map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          collectionName: 'directory',
          appType: data.category || 'Unknown',
          status: data.status,
          userEmail: data.ownerEmail,
          officialName: { full: data.name },
          clinic: { name: data.clinicName, address: data.address },
          legalIdentity: { name: data.name, orgType: data.orgType },
          fleetIdentity: { agencyName: data.name },
          facility: { address: data.address },
          operations: { address: data.address },
          credentials: { ceaNumber: data.registrationNumber, mciNumber: data.registrationNumber, drugLicenseNumber: data.registrationNumber },
          phone: data.phone,
          timestamp: data.createdAt,
          lastUpdated: data.updatedAt,
          ...data
        };
      });
      
      const profileClaimsSnap = results[collectionsToFetch.length + 2];
      const claimDocs = profileClaimsSnap.status === 'fulfilled' ? profileClaimsSnap.value.docs : [];
      
      const claimApps = claimDocs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          collectionName: 'profile_claims',
          appType: 'Ownership Claim',
          status: data.status === 'pending_review' ? 'pending' : data.status,
          userEmail: data.email,
          officialName: { full: data.claimantName || data.entityId || "Claimant" },
          legalIdentity: { name: data.claimantName || data.entityId },
          phone: data.phone,
          timestamp: data.timestamp,
          ...data
        };
      });
      
      allApps = [...allApps, ...dirApps, ...claimApps];

      // Sort globally by timestamp descending
      allApps.sort((a, b) => {
        const timeA = a.lastUpdated?.toMillis ? a.lastUpdated.toMillis() : (a.timestamp?.toMillis ? a.timestamp.toMillis() : 0);
        const timeB = b.lastUpdated?.toMillis ? b.lastUpdated.toMillis() : (b.timestamp?.toMillis ? b.timestamp.toMillis() : 0);
        return timeB - timeA;
      });

      setApplications(allApps);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app: any) => {
    if (!confirm(`Are you sure you want to approve this ${app.appType} application? This will upgrade their account role and generate a draft profile in their dashboard.`)) return;
    
    try {
      const batch = writeBatch(db);
      
      if (app.collectionName === 'directory') {
         batch.update(doc(db, 'directory', app.id), {
           status: 'active',
           isPublished: true,
           verified: true,
           founderStatus: true,
           activePlugins: ['plugin_booking_physical', 'plugin_telemedicine_scheduled', 'plugin_telemedicine_urgent', 'plugin_featured_listing', 'plugin_vip_rx_pad'],
           updatedAt: serverTimestamp()
         });
      } else if (app.collectionName === 'profile_claims') {
         batch.update(doc(db, 'directory', app.entityId), {
           ownerEmail: app.email,
           ownerUid: app.uid,
           registrationNumber: app.medicalRegistration || '',
           verified: true,
           founderStatus: true,
           activePlugins: ['plugin_booking_physical', 'plugin_telemedicine_scheduled', 'plugin_telemedicine_urgent', 'plugin_featured_listing', 'plugin_vip_rx_pad'],
           updatedAt: serverTimestamp()
         });
         batch.update(doc(db, 'profile_claims', app.id), { status: 'approved' });
         
         // Promote the user account role to 'doctor' securely
         if (app.uid) {
           batch.update(doc(db, 'users', app.uid), { role: 'doctor' });
         }
      } else {
        batch.update(doc(db, app.collectionName, app.id), { status: 'approved' });
      }

      // 2. Map data to generic directory schema based on type
      if (app.collectionName !== 'listing_claims' && app.collectionName !== 'directory' && app.collectionName !== 'profile_claims') {
        const newListingRef = doc(collection(db, 'directory'));
        let directoryData: any = {
          verified: true,
          founderStatus: true,
          activePlugins: ['plugin_booking_physical', 'plugin_telemedicine_scheduled', 'plugin_telemedicine_urgent', 'plugin_featured_listing', 'plugin_vip_rx_pad'],
          isPublished: false,
          ownerEmail: app.userEmail,
          category: app.appType,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          source: 'application'
        };

        if (app.appType === 'Doctor') {
          directoryData.name = app.officialName?.full || '';
          directoryData.subCategory = app.specialty || '';
          directoryData.clinicName = app.clinic?.name || '';
          directoryData.address = app.clinic?.address || '';
          directoryData.registrationNumber = app.credentials?.mciNumber || '';
          directoryData.consultationFee = app.clinic?.consultationFee || '';
        } else if (app.appType === 'Hospital') {
          directoryData.name = app.legalIdentity?.name || '';
          directoryData.address = app.facility?.address || '';
          directoryData.totalBeds = app.facility?.totalBeds || '';
          directoryData.emergencyServices = app.facility?.emergencyServices ? 'Yes' : 'No';
          directoryData.registrationNumber = app.credentials?.ceaNumber || '';
          directoryData.orgType = app.legalIdentity?.orgType || '';
        } else if (app.appType === 'Pharmacy') {
          directoryData.name = app.legalIdentity?.name || '';
          directoryData.address = app.operations?.address || '';
          directoryData.is247 = app.operations?.is247 || false;
          directoryData.homeDelivery = app.operations?.homeDelivery || false;
          directoryData.retailLicense = app.credentials?.drugLicenseNumber || '';
          directoryData.pharmacistName = app.legalIdentity?.pharmacistName || '';
        } else if (app.appType === 'Lab') {
          directoryData.name = app.legalIdentity?.name || '';
          directoryData.address = app.operations?.address || '';
          directoryData.labType = app.legalIdentity?.labType || '';
          directoryData.is247 = app.operations?.is247 || false;
          directoryData.homeCollection = app.operations?.homeCollection || false;
          directoryData.accreditations = [app.credentials?.accreditation].filter(Boolean);
          directoryData.registrationNumber = app.credentials?.registrationNumber || '';
        } else if (app.appType === 'Ambulance') {
          directoryData.name = app.fleetIdentity?.agencyName || '';
          directoryData.phone = app.fleetIdentity?.contactNumber || '';
          directoryData.city = app.fleetIdentity?.baseCity || '';
          directoryData.fleetSize = app.operations?.fleetSize || '';
          directoryData.ambulanceType = app.operations?.ambulanceTypes || '';
          directoryData.is247 = app.operations?.is247 || false;
          directoryData.registrationNumber = app.credentials?.registrationNumber || '';
        }

        // Do NOT generate Custom Slug automatically. Vanity URLs are a premium feature.
        // It should be assigned manually by admin via the Slug Registry if they purchase the plan.
        
        batch.set(newListingRef, directoryData);
      } else {
        // Handle legacy listing claim
        if (app.listingId && app.listingId !== "new_listing") {
          const updateData: any = {
            verified: true,
            ownerEmail: app.userEmail
          };
          
          if (app.whatsapp) updateData.whatsapp = app.whatsapp;
          if (app.phone) updateData.phone = app.phone;

          batch.update(doc(db, 'directory', app.listingId), updateData);
        }
      }

      // Add Notification
      const newNotificationRef = doc(collection(db, 'notifications'));
      batch.set(newNotificationRef, {
        recipientEmail: app.userEmail,
        title: "Application Approved",
        message: `Congratulations! Your ${app.appType} application has been verified and approved. You can now access your dashboard to complete your profile.`,
        type: 'success',
        read: false,
        createdAt: serverTimestamp(),
        link: `/portal/${app.appType.toLowerCase()}`
      });

      await batch.commit();
      
      // Upgrade role in users collection
      try {
        const usersRef = collection(db, 'users');
        let matchedUserId = app.userUid || app.uid || null;

        // Force upgrade the exact user UID if we have it
        if (matchedUserId) {
           try {
             await updateDoc(doc(db, 'users', matchedUserId), {
               role: app.appType.toLowerCase(),
               updatedAt: serverTimestamp()
             });
             console.log(`Successfully upgraded exact user UID ${matchedUserId}`);
           } catch(e) {
             console.warn("Could not update by exact UID", e);
           }
        }

        // Try matching by email for legacy/duplicate profiles
        const emailToMatch = app.userEmail || app.email;
        if (emailToMatch) {
          const userQ = query(usersRef, where('email', '==', emailToMatch.trim()));
          const userSnap = await getDocs(userQ);
          if (!userSnap.empty) {
            matchedUserId = matchedUserId || userSnap.docs[0].id;
            const updatePromises = userSnap.docs.map(docSnap => 
              updateDoc(doc(db, 'users', docSnap.id), {
                role: app.appType.toLowerCase(),
                updatedAt: serverTimestamp()
              })
            );
            await Promise.all(updatePromises);
            console.log(`Successfully upgraded ${userSnap.docs.length} user documents by email`);
          }
        }

        // Try matching by phone if email didn't work
        if (!matchedUserId && app.phone) {
          const cleanPhone = app.phone.replace(/[^0-9]/g, '');
          const phoneQ = query(usersRef); 
          const phoneSnap = await getDocs(phoneQ);
          const matchedDoc = phoneSnap.docs.find(d => {
             const dPhone = d.data().phone ? d.data().phone.replace(/[^0-9]/g, '') : '';
             return dPhone.includes(cleanPhone) || cleanPhone.includes(dPhone);
          });
          if (matchedDoc) {
             await updateDoc(doc(db, 'users', matchedDoc.id), {
                role: app.appType.toLowerCase(),
                updatedAt: serverTimestamp()
             });
          }
        }
      } catch (roleErr) {
        console.error("Failed to upgrade role in users table:", roleErr);
      }
      
      setApplications(apps => apps.map(a => a.id === app.id ? { ...a, status: 'approved' } : a));
      setSelectedApp(null);
      alert("Application Approved and Draft Profile Created!");
    } catch (err) {
      console.error("Approval error:", err);
      alert("Failed to approve application.");
    }
  };

  const handleReject = async (app: any) => {
    const reason = prompt("Enter reason for rejection (optional):");
    if (reason === null) return; // cancelled
    
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, app.collectionName, app.id), { 
        status: 'rejected',
        rejectReason: reason 
      });
      await batch.commit();
      
      setApplications(apps => apps.map(a => a.id === app.id ? { ...a, status: 'rejected', rejectReason: reason } : a));
      setSelectedApp(null);
      alert("Application Rejected.");
    } catch (err) {
      console.error("Reject error:", err);
      alert("Failed to reject application.");
    }
  };

  const filteredApps = applications.filter(app => {
    if (filterType !== 'All' && app.appType !== filterType) return false;
    if (filterStatus !== 'All' && app.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (app.officialName?.full || app.legalIdentity?.name || app.fleetIdentity?.agencyName || app.legalName || "").toLowerCase();
      const email = (app.userEmail || "").toLowerCase();
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });

  return (
    <AdminCard noPadding>
      <AdminHeader 
        title="Verification CRM"
        description="Review and approve provider credentials."
        actions={
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <input 
              type="text" 
              placeholder="Search name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-auto border border-slate-800 text-white rounded-xl px-4 py-2.5 shadow-sm text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none bg-slate-950/80 backdrop-blur-sm"
            />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto border border-slate-800 text-white rounded-xl px-4 py-2.5 shadow-sm text-sm focus:border-cyan-500 outline-none bg-slate-950/80 backdrop-blur-sm font-bold"
            >
              <option value="pending">Pending</option>
              <option value="draft">Draft / Incomplete</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="All">All Statuses</option>
            </select>
          </div>
        }
      />
      
      <div className="p-6 md:p-8">

      {/* Type Pills */}
      <div className="relative z-10 flex overflow-x-auto snap-x pb-3 custom-scrollbar gap-2 mb-4 w-full">
        {['All', 'Doctor', 'Hospital', 'Pharmacy', 'Lab', 'Ambulance', 'Ownership Claim', 'Legacy Claim'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`shrink-0 snap-center px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${
              filterType === type 
                ? 'bg-slate-800 text-cyan-400 border-cyan-500/30' 
                : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-cyan-400/50 hover:text-cyan-300'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Main Table Content */}
      <div className="relative z-10 flex-1 overflow-auto bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.4)]"></div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <p className="font-bold text-slate-300 text-lg">No Applications Found</p>
            <p className="text-sm text-slate-500 font-medium">Try adjusting your filters.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse block md:table">
            <thead className="sticky top-0 bg-slate-800/90 backdrop-blur-md shadow-sm z-20 hidden md:table-header-group">
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-transparent md:divide-slate-200/60 p-3 md:p-0">
              {filteredApps.map(app => {
                const name = app.officialName?.full || app.legalIdentity?.name || app.fleetIdentity?.agencyName || app.legalName || "Unknown";
                const dateStr = app.timestamp?.toDate ? app.timestamp.toDate().toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : "Unknown";
                
                return (
                  <tr key={app.id} className="block md:table-row bg-slate-800 md:bg-transparent mb-3 md:mb-0 border md:border-none shadow-sm md:shadow-none p-4 md:p-0 rounded-2xl md:rounded-none hover:bg-slate-800/40 transition-colors group cursor-pointer" onClick={() => setSelectedApp(app)}>
                    <td className="block md:table-cell px-0 md:px-6 py-0 md:py-4">
                      <div className="flex justify-between items-start md:block">
                        <div>
                          <div className="font-bold text-slate-200 text-base md:text-sm">{name}</div>
                          {app.appType === 'Doctor' && <div className="text-[10px] text-cyan-400 font-bold uppercase">{app.specialty}</div>}
                          
                          {/* Mobile ONLY contact & date summary */}
                          <div className="md:hidden mt-3 text-xs text-slate-600 space-y-1">
                            <div className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>{app.userEmail}</div>
                            {(app.phone || app.whatsapp) && <div className="flex items-center gap-1.5 font-medium text-slate-400"><svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>{app.phone || app.whatsapp}</div>}
                            <div className="text-[10px] text-slate-400 mt-2">{dateStr}</div>
                          </div>
                        </div>

                        {/* Mobile ONLY badges & button */}
                        <div className="flex flex-col items-end gap-1.5 md:hidden">
                          <span className="px-2 py-1 rounded text-[9px] font-bold border bg-slate-50 text-slate-300 shadow-sm uppercase">{app.appType}</span>
                          {app.status === 'approved' && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase rounded">Approved</span>}
                          {app.status === 'rejected' && <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-bold uppercase rounded">Rejected</span>}
                          {app.status === 'pending' && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold uppercase rounded">Pending</span>}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm mt-3 w-full text-center"
                          >
                            Review
                          </button>
                        </div>
                      </div>

                      {/* Desktop badges */}
                      <div className="hidden md:block">
                        {app.status === 'approved' && <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase rounded">Approved</span>}
                        {app.status === 'rejected' && <span className="inline-block mt-1 px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-bold uppercase rounded">Rejected</span>}
                        {app.status === 'pending' && <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold uppercase rounded">Pending</span>}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold border bg-slate-800 text-slate-300 border-white/10 shadow-sm">{app.appType}</span>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <div className="text-xs text-slate-600">{app.userEmail}</div>
                      {(app.phone || app.whatsapp) && (
                        <div className="text-[10px] text-slate-500 font-bold mt-1">
                          Ph: {app.phone || app.whatsapp}
                        </div>
                      )}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <div className="text-xs font-medium text-slate-500">{dateStr}</div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                        className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-l border-white/10 w-full max-w-4xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex justify-between items-center shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-white/20">{selectedApp.appType}</span>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${selectedApp.status === 'approved' ? 'bg-emerald-500' : selectedApp.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'}`}>{selectedApp.status}</span>
                </div>
                <h2 className="text-2xl font-bold font-serif">{selectedApp.officialName?.full || selectedApp.legalIdentity?.name || selectedApp.fleetIdentity?.agencyName || selectedApp.legalName || "Application Details"}</h2>
                <p className="text-sm text-slate-300">{selectedApp.userEmail}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-900/50 flex flex-col lg:flex-row gap-8">
              
              {/* Left Column: Details */}
              <div className="flex-1 space-y-6">
                
                {/* Contact & Draft Info */}
                {(selectedApp.phone || selectedApp.whatsapp) && (
                  <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/50 shadow-sm">
                    <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-4">Contact Information</h4>
                    <div className="flex gap-8">
                      {selectedApp.phone && <div><p className="text-xs text-amber-600/70">Phone</p><p className="font-bold text-amber-900">{selectedApp.phone}</p></div>}
                      {selectedApp.whatsapp && <div><p className="text-xs text-amber-600/70">WhatsApp</p><p className="font-bold text-amber-900">{selectedApp.whatsapp}</p></div>}
                    </div>
                  </div>
                )}
                
                {/* Doctor Specific */}
                {selectedApp.appType === 'Doctor' && (
                  <>
                    <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Professional Details</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Specialty</p><p className="font-bold text-white">{selectedApp.specialty}</p></div>
                        <div><p className="text-xs text-slate-500">MCI Number</p><p className="font-mono text-sm bg-slate-900 border-white/10 p-2 rounded border inline-block mt-1">{selectedApp.credentials?.mciNumber}</p></div>
                      </div>
                    </div>
                    <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Clinic Info</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Clinic Name</p><p className="font-bold text-white">{selectedApp.clinic?.name}</p></div>
                        <div><p className="text-xs text-slate-500">Address</p><p className="text-sm font-medium text-slate-300">{selectedApp.clinic?.address}</p></div>
                        <div><p className="text-xs text-slate-500">Consultation</p><p className="text-sm font-medium text-slate-300">₹{selectedApp.clinic?.consultationFee} ({selectedApp.clinic?.consultationType})</p></div>
                      </div>
                    </div>
                  </>
                )}

                {/* Hospital Specific */}
                {selectedApp.appType === 'Hospital' && (
                  <>
                    <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Facility Details</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Organization Type</p><p className="font-bold text-white">{selectedApp.legalIdentity?.orgType}</p></div>
                        <div><p className="text-xs text-slate-500">Year Established</p><p className="font-bold text-white">{selectedApp.legalIdentity?.yearEstablished}</p></div>
                        <div><p className="text-xs text-slate-500">CEA Number</p><p className="font-mono text-sm bg-slate-900 border-white/10 p-2 rounded border inline-block mt-1">{selectedApp.credentials?.ceaNumber}</p></div>
                      </div>
                    </div>
                    <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Operations</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Address</p><p className="text-sm font-medium text-slate-300">{selectedApp.facility?.address}</p></div>
                        <div className="flex gap-8">
                          <div><p className="text-xs text-slate-500">Total Beds</p><p className="font-bold text-white text-lg">{selectedApp.facility?.totalBeds}</p></div>
                          <div><p className="text-xs text-slate-500">Emergency</p><p className="font-bold text-white text-lg">{selectedApp.facility?.emergencyServices ? 'Yes' : 'No'}</p></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Pharmacy Specific */}
                {selectedApp.appType === 'Pharmacy' && (
                  <>
                    <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Licensing</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Pharmacist Name</p><p className="font-bold text-white">{selectedApp.legalIdentity?.pharmacistName}</p></div>
                        <div><p className="text-xs text-slate-500">GSTIN</p><p className="font-mono text-sm bg-slate-900 border-white/10 p-2 rounded border inline-block mt-1">{selectedApp.legalIdentity?.gstinNumber || 'N/A'}</p></div>
                        <div><p className="text-xs text-slate-500">Drug License</p><p className="font-mono text-sm bg-slate-900 border-white/10 p-2 rounded border inline-block mt-1">{selectedApp.credentials?.drugLicenseNumber}</p></div>
                      </div>
                    </div>
                    <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Operations</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Address</p><p className="text-sm font-medium text-slate-300">{selectedApp.operations?.address}</p></div>
                        <div className="flex gap-8">
                          <div><p className="text-xs text-slate-500">24/7 Open</p><p className="font-bold text-white text-lg">{selectedApp.operations?.is247 ? 'Yes' : 'No'}</p></div>
                          <div><p className="text-xs text-slate-500">Home Delivery</p><p className="font-bold text-white text-lg">{selectedApp.operations?.homeDelivery ? 'Yes' : 'No'}</p></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Lab Specific */}
                {selectedApp.appType === 'Lab' && (
                  <>
                    <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Accreditations</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Head Doctor</p><p className="font-bold text-white">{selectedApp.legalIdentity?.headDoctorName}</p></div>
                        <div><p className="text-xs text-slate-500">Accreditation</p><p className="font-bold text-white">{selectedApp.credentials?.accreditation}</p></div>
                        <div><p className="text-xs text-slate-500">Reg. Number</p><p className="font-mono text-sm bg-slate-900 border-white/10 p-2 rounded border inline-block mt-1">{selectedApp.credentials?.registrationNumber}</p></div>
                      </div>
                    </div>
                    <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Operations</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Address</p><p className="text-sm font-medium text-slate-300">{selectedApp.operations?.address}</p></div>
                        <div className="flex gap-8">
                          <div><p className="text-xs text-slate-500">Home Collection</p><p className="font-bold text-white text-lg">{selectedApp.operations?.homeCollection ? 'Yes' : 'No'}</p></div>
                          <div><p className="text-xs text-slate-500">24/7 Open</p><p className="font-bold text-white text-lg">{selectedApp.operations?.is247 ? 'Yes' : 'No'}</p></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Ambulance Specific */}
                {selectedApp.appType === 'Ambulance' && (
                  <>
                    <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Fleet Info</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Contact</p><p className="font-bold text-white">{selectedApp.fleetIdentity?.contactNumber}</p></div>
                        <div><p className="text-xs text-slate-500">Base City</p><p className="font-bold text-white">{selectedApp.fleetIdentity?.baseCity}</p></div>
                        <div><p className="text-xs text-slate-500">RC Book Number</p><p className="font-mono text-sm bg-slate-900 border-white/10 p-2 rounded border inline-block mt-1">{selectedApp.credentials?.registrationNumber}</p></div>
                      </div>
                    </div>
                    <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Operations</h4>
                      <div className="space-y-4">
                        <div className="flex gap-8">
                          <div><p className="text-xs text-slate-500">Fleet Size</p><p className="font-bold text-white text-lg">{selectedApp.operations?.fleetSize}</p></div>
                          <div><p className="text-xs text-slate-500">24/7 Service</p><p className="font-bold text-white text-lg">{selectedApp.operations?.is247 ? 'Yes' : 'No'}</p></div>
                        </div>
                        <div><p className="text-xs text-slate-500">Ambulance Types</p><p className="font-bold text-white">{selectedApp.operations?.ambulanceTypes}</p></div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Ownership Claim */}
                {selectedApp.appType === 'Ownership Claim' && (
                  <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ownership Verification</h4>
                    <div className="space-y-4">
                      <div><p className="text-xs text-slate-500">Applicant User ID</p><p className="font-mono text-xs bg-slate-900 border-white/10 p-2 rounded border inline-block mt-1 text-slate-400">{selectedApp.uid}</p></div>
                      <div><p className="text-xs text-slate-500">Target Profile ID (Directory)</p><p className="font-mono text-sm bg-slate-900 border-white/10 p-2 rounded border inline-block mt-1">{selectedApp.entityId}</p></div>
                      <div><p className="text-xs text-slate-500">Medical Registration No.</p><p className="font-mono text-lg font-bold text-emerald-400 mt-1">{selectedApp.medicalRegistration || 'N/A'}</p></div>
                      <div><p className="text-xs text-slate-500">Email to Bind</p><p className="text-sm font-medium text-emerald-600">{selectedApp.email}</p></div>
                    </div>
                  </div>
                )}
                
                {/* Legacy Claim */}
                {selectedApp.appType === 'Legacy Claim' && (
                  <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Claim Details</h4>
                    <div className="space-y-4">
                      <div><p className="text-xs text-slate-500">Listing ID</p><p className="font-mono text-sm bg-slate-900 border-white/10 p-2 rounded border inline-block mt-1">{selectedApp.listingId}</p></div>
                      <div><p className="text-xs text-slate-500">Address</p><p className="text-sm font-medium text-slate-300">{selectedApp.address}</p></div>
                      <div><p className="text-xs text-slate-500">License Submitted</p><p className="font-mono text-sm bg-slate-900 border-white/10 p-2 rounded border inline-block mt-1">{selectedApp.licenseNumber}</p></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Embedded Proof Viewer */}
              <div className="flex-1 bg-slate-800/40 rounded-2xl border border-white/5 shadow-sm overflow-hidden flex flex-col h-[600px] lg:h-auto">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Document Viewer</h4>
                  {(selectedApp.credentials?.proofUrl || selectedApp.proofUrl || selectedApp.fileName) && (
                    <a href={selectedApp.credentials?.proofUrl || selectedApp.proofUrl || "#"} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline text-xs font-bold flex items-center gap-1">
                      Open in New Tab <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                  )}
                </div>
                <div className="flex-1 bg-slate-200 p-2">
                  {(selectedApp.credentials?.proofUrl || selectedApp.proofUrl) ? (
                    <iframe 
                      src={selectedApp.credentials?.proofUrl || selectedApp.proofUrl} 
                      className="w-full h-full rounded bg-white shadow-inner"
                      title="Proof Document"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-2">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <p>No document uploaded</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            {(selectedApp.status === 'pending' || selectedApp.status === 'pending_approval' || selectedApp.status === 'draft') && (
              <div className="p-6 border-t border-slate-200 bg-slate-900 flex justify-end gap-4 shrink-0 border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                {selectedApp.collectionName === 'directory' && (
                  <button 
                    onClick={() => window.open(`/portal/${selectedApp.appType.toLowerCase()}?adminViewId=${selectedApp.id}`, '_blank')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    View / Edit Dashboard
                  </button>
                )}
                <button 
                  onClick={() => handleReject(selectedApp)}
                  className="px-6 py-3 rounded-xl font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Reject Application
                </button>
                <button 
                  onClick={() => handleApprove(selectedApp)}
                  className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest shadow-[0_4px_15px_rgba(13,148,136,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Approve & Go Live
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </AdminCard>
  );
}
