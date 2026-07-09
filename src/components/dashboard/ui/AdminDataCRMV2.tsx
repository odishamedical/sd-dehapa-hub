"use client";

import React, { useState } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { StandardDataTable } from '@/components/dashboard/ui/StandardDataTable';
import { StandardFormDrawer } from '@/components/dashboard/ui/StandardFormDrawer';
import { Edit } from 'lucide-react';

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
    { header: "Name", accessorKey: "name" },
    { header: "Category", accessorKey: "category" },
    { header: "Phone", accessorKey: "phone" },
    { header: "City", accessorKey: "city" },
    { 
      header: "Status", 
      cell: (item: any) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${item.verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
          {item.verified ? 'Verified' : 'Pending'}
        </span>
      )
    },
    {
      header: "Actions",
      cell: (item: any) => (
        <button 
          onClick={(e) => { e.stopPropagation(); handleRowClick(item); }}
          className="text-teal-500 hover:text-teal-400 p-2"
        >
          <Edit size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="flex flex-col h-[80vh]">
      {/* Header & Filters */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-t-xl shrink-0 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Directory Data CRM (V2)
          </h3>
          <p className="text-sm text-teal-400">Modular Architecture Active - {stats.totalEntities} Records</p>
        </div>
        
        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => filters.setSearch(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
          />
          <select 
            value={filters.categoryFilter}
            onChange={(e) => filters.setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
          >
            <option value="">All Categories</option>
            <option value="Doctor">Doctor</option>
            <option value="Hospital">Hospital</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Lab">Lab</option>
          </select>
        </div>
      </div>

      {/* Main Data Table Wrapper */}
      <div className="flex-1 overflow-hidden bg-slate-900 border-x border-b border-slate-800 rounded-b-xl">
        <div className="h-full overflow-y-auto p-4 custom-scrollbar">
          <StandardDataTable 
            data={filteredData}
            columns={columns}
            isLoading={loading}
            onRowClick={handleRowClick}
          />
        </div>
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
    </div>
  );
}
