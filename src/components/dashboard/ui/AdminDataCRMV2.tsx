"use client";

import React, { useState } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { StandardDataTable } from '@/components/dashboard/ui/StandardDataTable';
import { StandardFormDrawer } from '@/components/dashboard/ui/StandardFormDrawer';
import { Edit } from 'lucide-react';
import Link from 'next/link';
import { generateUniversalSeoUrl } from '@/lib/urlHelpers';
import { AdminCard, AdminHeader } from '@/components/admin/ui';
import { indianStates, districtsByState, blocksByDistrict } from '@/lib/locations';

export default function AdminDataCRMV2() {
  const { 
    data, 
    loading, 
    filteredData, 
    stats,
    filters 
  } = useAdminData();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const columns = [
    { 
      header: <input type="checkbox" className="w-4 h-4 text-cyan-500 rounded border-slate-700 bg-slate-800 focus:ring-cyan-500" />,
      className: "w-10",
      cell: (item: any) => <input type="checkbox" className="w-4 h-4 text-cyan-500 rounded border-slate-700 bg-slate-800 focus:ring-cyan-500" />
    },
    { 
      header: "Image",
      cell: (item: any) => (
        <div className="w-12 h-12 rounded-xl bg-slate-800 p-0.5 shadow-sm border border-slate-700 overflow-hidden shrink-0">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-slate-600 shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
          )}
        </div>
      )
    },
    { 
      header: "Entity", 
      cell: (item: any) => (
        <div>
          <div className="font-bold text-sm text-slate-200 drop-shadow-sm flex items-center gap-2">
            {item.name}
            {item.isPublished === false && <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-slate-700">Hidden</span>}
          </div>
          <div className="text-xs font-semibold text-cyan-400 mt-0.5 uppercase tracking-wider">{item.category}</div>
        </div>
      )
    },
    { 
      header: "Contact", 
      cell: (item: any) => (
        <div>
          <div className="text-sm font-medium text-slate-300 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> {item.phone || "N/A"}</div>
          <div className="text-[10px] text-slate-500 mt-1 max-w-[200px] truncate" title={item.city}>{item.city}, {item.district}</div>
        </div>
      )
    },
    { 
      header: "Status", 
      cell: (item: any) => (
        item.verified ? (
          <span className="flex w-max items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md shadow-sm">
            <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            Verified
          </span>
        ) : (
          <span className="flex w-max items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md shadow-sm">
            Unverified
          </span>
        )
      )
    },
    {
      header: <div className="text-right">Action</div>,
      className: "text-right",
      cell: (item: any) => (
        <div className="flex items-center justify-end gap-3">
          <Link href={generateUniversalSeoUrl(item, item.category?.toLowerCase() + 's' as any) || `/doctors/${item.customSlug || item.id}`} target="_blank" className="text-slate-400 hover:text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 bg-slate-800 border border-slate-700 px-2 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            <span className="hidden xl:inline">Cat URL</span>
          </Link>
          <Link href={`/${item.customSlug || item.id}`} target="_blank" className="text-cyan-400 hover:text-cyan-300 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 px-2 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
            <span className="hidden xl:inline">Global URL</span>
          </Link>
          <button onClick={(e) => { e.stopPropagation(); handleRowClick(item); }} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2 py-1.5 rounded-lg transition-colors">
            <Edit size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminCard noPadding className="flex flex-col h-[80vh]">
      <AdminHeader 
        title="Directory Data CRM (V2)"
        description={`Modular Architecture Active - ${stats.totalEntities} Records`}
        actions={
          <div className="flex flex-wrap gap-3 w-full md:w-auto relative z-10">
            <button onClick={() => { filters.setCountryFilter(""); filters.setStateFilter(""); filters.setDistrictFilter(""); filters.setBlockFilter(""); filters.setSearch(""); filters.setCategoryFilter(""); }} className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Reset
            </button>
            <button className="bg-amber-600 hover:bg-amber-500 text-white border border-amber-500 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
              Migrate Legacy Data
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 whitespace-nowrap">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              Export CSV
            </button>
          </div>
        }
      />
      
      {/* Sub-Filters */}
      <div className="px-6 py-4 bg-slate-900/40 backdrop-blur-xl border-b border-white/5 flex flex-wrap items-center gap-4">
        <select 
          value={filters.countryFilter} 
          onChange={e => { filters.setCountryFilter(e.target.value); filters.setStateFilter(""); filters.setDistrictFilter(""); filters.setBlockFilter(""); }}
          className="border border-slate-800 rounded-xl px-4 py-2 shadow-sm text-sm focus:border-cyan-500 focus:ring-2 outline-none w-full md:w-32 bg-slate-950/80 text-white font-medium"
        >
          <option value="">All Countries</option>
          <option value="India">India</option>
          <option value="USA">USA</option>
          <option value="UAE">UAE</option>
        </select>
        {filters.countryFilter === "India" && (
          <select 
            value={filters.stateFilter} 
            onChange={e => { filters.setStateFilter(e.target.value); filters.setDistrictFilter(""); filters.setBlockFilter(""); }}
            className="border border-slate-800 rounded-xl px-4 py-2 shadow-sm text-sm focus:border-cyan-500 focus:ring-2 outline-none w-full md:w-32 bg-slate-950/80 text-white font-medium"
          >
            <option value="">All States</option>
            {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {filters.stateFilter && districtsByState[filters.stateFilter] && (
          <select 
            value={filters.districtFilter} 
            onChange={e => { filters.setDistrictFilter(e.target.value); filters.setBlockFilter(""); }}
            className="border border-slate-800 rounded-xl px-4 py-2 shadow-sm text-sm focus:border-cyan-500 focus:ring-2 outline-none w-full md:w-36 bg-slate-950/80 text-white font-medium"
          >
            <option value="">All Districts</option>
            {districtsByState[filters.stateFilter].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
        <input 
          type="text"
          placeholder="Search name or phone..."
          value={filters.search}
          onChange={(e) => filters.setSearch(e.target.value)}
          className="flex-1 border border-slate-800 rounded-xl px-4 py-2 shadow-sm text-sm focus:border-cyan-500 focus:ring-2 outline-none bg-slate-950/80 text-white font-medium"
        />
        <select 
          value={filters.categoryFilter}
          onChange={(e) => filters.setCategoryFilter(e.target.value)}
          className="border border-slate-800 rounded-xl px-4 py-2 shadow-sm text-sm focus:border-cyan-500 focus:ring-2 outline-none w-full md:w-36 bg-slate-950/80 text-white font-medium"
        >
          <option value="">All Categories</option>
          <option value="Doctor">Doctor</option>
          <option value="Hospital">Hospital</option>
          <option value="Pharmacy">Pharmacy</option>
          <option value="Lab">Lab</option>
          <option value="Ambulance">Ambulance</option>
        </select>
      </div>

      {/* Main Data Table Wrapper */}
      <div className="flex-1 overflow-hidden p-6 md:p-8">
        <StandardDataTable 
          data={filteredData}
          columns={columns}
          isLoading={loading}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Reusable Form Drawer */}
      <StandardFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedItem ? `Edit ${selectedItem.name}` : "New Record"}
        onSave={() => alert("Save logic separated into Phase 3")}
      >
        <div className="space-y-4">
          <p className="text-slate-400 text-sm mb-4">
            The massive form logic from V1 is currently being componentized. 
            This shell demonstrates the decoupled architecture.
          </p>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
            <input 
              type="text" 
              defaultValue={selectedItem?.name} 
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
            <input 
              type="text" 
              defaultValue={selectedItem?.category} 
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
            <input 
              type="text" 
              defaultValue={selectedItem?.phone} 
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </StandardFormDrawer>
    </AdminCard>
  );
}
