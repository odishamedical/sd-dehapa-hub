"use client";

import React, { useState } from 'react';

// Mock routing data
const ROUTES = [
  { id: '1', patient: 'Ramesh Das', address: 'Khandagiri, Bhubaneswar', time: '08:00 AM', status: 'pending', tests: 'CBC, Lipid Profile' },
  { id: '2', patient: 'Sunita Mishra', address: 'Patia, Bhubaneswar', time: '09:30 AM', status: 'pending', tests: 'HbA1c, Fasting Sugar' },
  { id: '3', patient: 'Anita Rout', address: 'Saheed Nagar, Bhubaneswar', time: '11:00 AM', status: 'pending', tests: 'Thyroid Profile' },
];

export function HomeCollectionRouterPlugin() {
  const [routes, setRoutes] = useState(ROUTES);

  const markCompleted = (id: string) => {
    setRoutes(routes.map(r => r.id === id ? { ...r, status: 'completed' } : r));
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900">Home Collection Router</h3>
        <p className="text-slate-500">Optimized daily routes for your phlebotomists.</p>
      </div>

      <div className="space-y-4">
        {routes.map((route, index) => (
          <div key={route.id} className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${route.status === 'completed' ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-teal-200 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                {index + 1}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">{route.patient}</h4>
                <p className="text-sm text-slate-500">{route.address}</p>
                <div className="mt-2 flex gap-2">
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded-md">{route.time}</span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-md">{route.tests}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => markCompleted(route.id)}
              disabled={route.status === 'completed'}
              className="px-6 py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-slate-900 hover:bg-slate-800 text-white w-full md:w-auto"
            >
              {route.status === 'completed' ? 'Collected' : 'Mark Collected'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
