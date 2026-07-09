"use client";

import React, { useState } from 'react';

// Hardcoded for demo purposes
const INITIAL_INVENTORY = [
  { id: '1', name: 'Tab. Paracetamol 500mg', inStock: true, price: 40 },
  { id: '2', name: 'Tab. Pantoprazole 40mg', inStock: true, price: 120 },
  { id: '3', name: 'Syp. Cough Relief', inStock: false, price: 85 },
  { id: '4', name: 'Cap. Amoxicillin 500mg', inStock: true, price: 150 },
  { id: '5', name: 'Insulin Glargine Pen', inStock: false, price: 450 }
];

export function SmartInventoryPlugin() {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleStock = (id: string) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, inStock: !item.inStock } : item
    ));
  };

  const filtered = inventory.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Smart Inventory Toggles</h3>
          <p className="text-slate-500">Toggle stock status to instantly update your availability on the public directory.</p>
        </div>
        <input 
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search inventory..."
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Medicine Name</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Price (₹)</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-800">{item.name}</td>
                <td className="py-4 px-4 text-slate-600">₹{item.price}</td>
                <td className="py-4 px-4">
                  {item.inStock ? (
                    <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold uppercase rounded-full border border-teal-200">In Stock</span>
                  ) : (
                    <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold uppercase rounded-full border border-rose-200">Out of Stock</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right">
                  <button 
                    onClick={() => toggleStock(item.id)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${item.inStock ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
                  >
                    {item.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
