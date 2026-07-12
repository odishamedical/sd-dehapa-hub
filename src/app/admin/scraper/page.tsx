'use client';

import { useState } from 'react';
import { GlobalHeader } from '@/components/GlobalHeader';

type Lead = {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
};

export default function LeadScraperDashboard() {
  const [query, setQuery] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentLeads, setSentLeads] = useState<Record<string, 'sending' | 'success' | 'error'>>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/leads/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to search');
      
      setLeads(data.leads || []);
      if (data.leads.length === 0) {
        setError('No leads with phone numbers found for this query.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (lead: Lead) => {
    setSentLeads(prev => ({ ...prev, [lead.id]: 'sending' }));
    
    try {
      const res = await fetch('/api/leads/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: lead.phone,
          businessName: lead.name,
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }
      
      setSentLeads(prev => ({ ...prev, [lead.id]: 'success' }));
    } catch (err) {
      console.error(err);
      setSentLeads(prev => ({ ...prev, [lead.id]: 'error' }));
      alert(`Failed to send to ${lead.name}. They might have already been invited.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <GlobalHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Lead Scraper Dashboard
            </h1>
            <p className="text-slate-400 mt-2">Find local businesses via Google Places and instantly send WhatsApp invites.</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Pharmacies in Bhubaneswar"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search Leads'}
            </button>
          </div>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </form>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-300">Business Name</th>
                <th className="px-6 py-4 font-medium text-slate-300">Address</th>
                <th className="px-6 py-4 font-medium text-slate-300">Phone</th>
                <th className="px-6 py-4 font-medium text-slate-300 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {leads.length === 0 && !loading && !error && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Search for a location to find leads.
                  </td>
                </tr>
              )}
              {leads.map((lead) => {
                const status = sentLeads[lead.id];
                
                return (
                  <tr key={lead.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{lead.name}</div>
                      <div className="text-sm text-yellow-400">★ {lead.rating}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{lead.address}</td>
                    <td className="px-6 py-4 text-slate-300 font-mono text-sm">{lead.phone}</td>
                    <td className="px-6 py-4 text-right">
                      {status === 'success' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Invite Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendInvite(lead)}
                          disabled={status === 'sending'}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            status === 'error' 
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          } disabled:opacity-50`}
                        >
                          {status === 'sending' ? 'Sending...' : status === 'error' ? 'Retry Invite' : 'Send Invite'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
