"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, updateDoc, deleteDoc, doc, orderBy } from "firebase/firestore";
import { Check, X, Trash2, ExternalLink } from "lucide-react";

export default function AdminATSManagement() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "jobs", id), { status });
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this job posting?")) {
      try {
        await deleteDoc(doc(db, "jobs", id));
      } catch (e) {
        console.error(e);
        alert("Failed to delete job");
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Job Postings (ATS)</h2>
          <p className="text-sm text-slate-500">Manage pending and active job postings across the network.</p>
        </div>
      </div>
      
      <div className="p-6">
        {jobs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No job postings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Job Title & Employer</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Salary</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-800">{job.title}</div>
                      <div className="text-slate-500 text-xs">{job.companyName} ({job.employerType})</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-slate-700">{job.district}, {job.state}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      ₹{job.salaryMin} - ₹{job.salaryMax}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        job.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        job.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right space-x-2 flex justify-end">
                      {job.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusUpdate(job.id, 'active')}
                          className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors"
                          title="Approve Job"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {job.status === 'active' && (
                        <button 
                          onClick={() => handleStatusUpdate(job.id, 'closed')}
                          className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Close Job"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(job.id)}
                        className="p-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
