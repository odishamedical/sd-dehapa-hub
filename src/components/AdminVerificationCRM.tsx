"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, writeBatch, serverTimestamp, query, orderBy } from 'firebase/firestore';

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

      const results = await Promise.all(promises);
      let allApps: any[] = [];
      results.forEach(res => { allApps = [...allApps, ...res] });

      // Sort globally by timestamp descending
      allApps.sort((a, b) => {
        const timeA = a.lastUpdated?.toMillis ? a.lastUpdated.toMillis() : 0;
        const timeB = b.lastUpdated?.toMillis ? b.lastUpdated.toMillis() : 0;
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
    if (!confirm(`Are you sure you want to approve this ${app.appType} application and create a live profile?`)) return;
    
    try {
      const batch = writeBatch(db);
      
      // 1. Update Application Status
      batch.update(doc(db, app.collectionName, app.id), { status: 'approved' });

      // 2. Map data to generic directory schema based on type
      if (app.collectionName !== 'listing_claims') {
        const newListingRef = doc(collection(db, 'directory'));
        
        let directoryData: any = {
          verified: true,
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

        // Generate Custom Slug
        directoryData.customSlug = `${directoryData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

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

      await batch.commit();
      
      setApplications(apps => apps.map(a => a.id === app.id ? { ...a, status: 'approved' } : a));
      setSelectedApp(null);
      alert("Application Approved and Live Profile Created!");
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
    <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.05)] border border-slate-300 rounded-3xl p-6 md:p-8 relative overflow-hidden min-h-[80vh] flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 hover:translate-x-full duration-1000 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>
      
      {/* Header & Filters */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-300 pb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 drop-shadow-sm">Verification CRM</h3>
          <p className="text-sm font-semibold text-teal-600">Review and approve provider credentials.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <input 
            type="text" 
            placeholder="Search name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-slate-300 rounded-xl px-4 py-2 shadow-sm text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none bg-white/80 backdrop-blur-sm"
          />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-300 rounded-xl px-4 py-2 shadow-sm text-sm focus:border-teal-500 outline-none bg-white/80 backdrop-blur-sm font-bold"
          >
            <option value="pending">Pending</option>
            <option value="draft">Draft / Incomplete</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="All">All Statuses</option>
          </select>
        </div>
      </div>

      {/* Type Pills */}
      <div className="relative z-10 flex flex-wrap gap-2 mb-6">
        {['All', 'Doctor', 'Hospital', 'Pharmacy', 'Lab', 'Ambulance', 'Legacy Claim'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${
              filterType === type 
                ? 'bg-slate-800 text-white border-slate-900' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-700'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Main Table Content */}
      <div className="relative z-10 flex-1 overflow-auto bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <p className="font-bold text-slate-900 text-lg">No Applications Found</p>
            <p className="text-sm text-slate-500 font-medium">Try adjusting your filters.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-md shadow-sm z-20">
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filteredApps.map(app => {
                const name = app.officialName?.full || app.legalIdentity?.name || app.fleetIdentity?.agencyName || app.legalName || "Unknown";
                const dateStr = app.timestamp?.toDate ? app.timestamp.toDate().toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : "Unknown";
                
                return (
                  <tr key={app.id} className="hover:bg-teal-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedApp(app)}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{name}</div>
                      {app.appType === 'Doctor' && <div className="text-[10px] text-teal-600 font-bold uppercase">{app.specialty}</div>}
                      {app.status === 'approved' && <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase rounded">Approved</span>}
                      {app.status === 'rejected' && <span className="inline-block mt-1 px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-bold uppercase rounded">Rejected</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold border bg-white text-slate-700 shadow-sm">{app.appType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-600">{app.userEmail}</div>
                      {(app.phone || app.whatsapp) && (
                        <div className="text-[10px] text-slate-500 font-bold mt-1">
                          Ph: {app.phone || app.whatsapp}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-slate-500">{dateStr}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
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
          <div className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
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
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 flex flex-col lg:flex-row gap-8">
              
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
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Professional Details</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Specialty</p><p className="font-bold text-slate-900">{selectedApp.specialty}</p></div>
                        <div><p className="text-xs text-slate-500">MCI Number</p><p className="font-mono text-sm bg-slate-100 p-2 rounded border inline-block mt-1">{selectedApp.credentials?.mciNumber}</p></div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Clinic Info</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Clinic Name</p><p className="font-bold text-slate-900">{selectedApp.clinic?.name}</p></div>
                        <div><p className="text-xs text-slate-500">Address</p><p className="text-sm font-medium text-slate-700">{selectedApp.clinic?.address}</p></div>
                        <div><p className="text-xs text-slate-500">Consultation</p><p className="text-sm font-medium text-slate-700">₹{selectedApp.clinic?.consultationFee} ({selectedApp.clinic?.consultationType})</p></div>
                      </div>
                    </div>
                  </>
                )}

                {/* Hospital Specific */}
                {selectedApp.appType === 'Hospital' && (
                  <>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Facility Details</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Organization Type</p><p className="font-bold text-slate-900">{selectedApp.legalIdentity?.orgType}</p></div>
                        <div><p className="text-xs text-slate-500">Year Established</p><p className="font-bold text-slate-900">{selectedApp.legalIdentity?.yearEstablished}</p></div>
                        <div><p className="text-xs text-slate-500">CEA Number</p><p className="font-mono text-sm bg-slate-100 p-2 rounded border inline-block mt-1">{selectedApp.credentials?.ceaNumber}</p></div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Operations</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Address</p><p className="text-sm font-medium text-slate-700">{selectedApp.facility?.address}</p></div>
                        <div className="flex gap-8">
                          <div><p className="text-xs text-slate-500">Total Beds</p><p className="font-bold text-slate-900 text-lg">{selectedApp.facility?.totalBeds}</p></div>
                          <div><p className="text-xs text-slate-500">Emergency</p><p className="font-bold text-slate-900 text-lg">{selectedApp.facility?.emergencyServices ? 'Yes' : 'No'}</p></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Pharmacy Specific */}
                {selectedApp.appType === 'Pharmacy' && (
                  <>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Licensing</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Pharmacist Name</p><p className="font-bold text-slate-900">{selectedApp.legalIdentity?.pharmacistName}</p></div>
                        <div><p className="text-xs text-slate-500">GSTIN</p><p className="font-mono text-sm bg-slate-100 p-2 rounded border inline-block mt-1">{selectedApp.legalIdentity?.gstinNumber || 'N/A'}</p></div>
                        <div><p className="text-xs text-slate-500">Drug License</p><p className="font-mono text-sm bg-slate-100 p-2 rounded border inline-block mt-1">{selectedApp.credentials?.drugLicenseNumber}</p></div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Operations</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Address</p><p className="text-sm font-medium text-slate-700">{selectedApp.operations?.address}</p></div>
                        <div className="flex gap-8">
                          <div><p className="text-xs text-slate-500">24/7 Open</p><p className="font-bold text-slate-900 text-lg">{selectedApp.operations?.is247 ? 'Yes' : 'No'}</p></div>
                          <div><p className="text-xs text-slate-500">Home Delivery</p><p className="font-bold text-slate-900 text-lg">{selectedApp.operations?.homeDelivery ? 'Yes' : 'No'}</p></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Lab Specific */}
                {selectedApp.appType === 'Lab' && (
                  <>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Accreditations</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Head Doctor</p><p className="font-bold text-slate-900">{selectedApp.legalIdentity?.headDoctorName}</p></div>
                        <div><p className="text-xs text-slate-500">Accreditation</p><p className="font-bold text-slate-900">{selectedApp.credentials?.accreditation}</p></div>
                        <div><p className="text-xs text-slate-500">Reg. Number</p><p className="font-mono text-sm bg-slate-100 p-2 rounded border inline-block mt-1">{selectedApp.credentials?.registrationNumber}</p></div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Operations</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Address</p><p className="text-sm font-medium text-slate-700">{selectedApp.operations?.address}</p></div>
                        <div className="flex gap-8">
                          <div><p className="text-xs text-slate-500">Home Collection</p><p className="font-bold text-slate-900 text-lg">{selectedApp.operations?.homeCollection ? 'Yes' : 'No'}</p></div>
                          <div><p className="text-xs text-slate-500">24/7 Open</p><p className="font-bold text-slate-900 text-lg">{selectedApp.operations?.is247 ? 'Yes' : 'No'}</p></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Ambulance Specific */}
                {selectedApp.appType === 'Ambulance' && (
                  <>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Fleet Info</h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500">Contact</p><p className="font-bold text-slate-900">{selectedApp.fleetIdentity?.contactNumber}</p></div>
                        <div><p className="text-xs text-slate-500">Base City</p><p className="font-bold text-slate-900">{selectedApp.fleetIdentity?.baseCity}</p></div>
                        <div><p className="text-xs text-slate-500">RC Book Number</p><p className="font-mono text-sm bg-slate-100 p-2 rounded border inline-block mt-1">{selectedApp.credentials?.registrationNumber}</p></div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Operations</h4>
                      <div className="space-y-4">
                        <div className="flex gap-8">
                          <div><p className="text-xs text-slate-500">Fleet Size</p><p className="font-bold text-slate-900 text-lg">{selectedApp.operations?.fleetSize}</p></div>
                          <div><p className="text-xs text-slate-500">24/7 Service</p><p className="font-bold text-slate-900 text-lg">{selectedApp.operations?.is247 ? 'Yes' : 'No'}</p></div>
                        </div>
                        <div><p className="text-xs text-slate-500">Ambulance Types</p><p className="font-bold text-slate-900">{selectedApp.operations?.ambulanceTypes}</p></div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Legacy Claim */}
                {selectedApp.appType === 'Legacy Claim' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Claim Details</h4>
                    <div className="space-y-4">
                      <div><p className="text-xs text-slate-500">Listing ID</p><p className="font-mono text-sm bg-slate-100 p-2 rounded border inline-block mt-1">{selectedApp.listingId}</p></div>
                      <div><p className="text-xs text-slate-500">Address</p><p className="text-sm font-medium text-slate-700">{selectedApp.address}</p></div>
                      <div><p className="text-xs text-slate-500">License Submitted</p><p className="font-mono text-sm bg-slate-100 p-2 rounded border inline-block mt-1">{selectedApp.licenseNumber}</p></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Embedded Proof Viewer */}
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px] lg:h-auto">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Document Viewer</h4>
                  {(selectedApp.credentials?.proofUrl || selectedApp.proofUrl) && (
                    <a href={selectedApp.credentials?.proofUrl || selectedApp.proofUrl} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline text-xs font-bold flex items-center gap-1">
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
            {selectedApp.status === 'pending' && (
              <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
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
  );
}
