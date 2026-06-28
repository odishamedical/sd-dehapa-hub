"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

export default function AdminStaffManagement() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('data_entry');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'admin_users'));
      setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Failed to load staff", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!email) return;
    setIsInviting(true);
    try {
      // Just save to admin_users. They still need to sign in with Google/Email to get their UID.
      // But the role will be checked against this email on login.
      await setDoc(doc(db, 'admin_users', email.toLowerCase()), {
        email: email.toLowerCase(),
        role: role,
        addedAt: new Date()
      });
      alert(`Invited ${email} as ${role}. They can now login to the admin panel.`);
      setEmail('');
      fetchStaff();
    } catch (err) {
      console.error(err);
      alert("Failed to add staff member.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (emailId: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${emailId}?`)) return;
    try {
      await deleteDoc(doc(db, 'admin_users', emailId));
      fetchStaff();
    } catch (err) {
      console.error(err);
      alert("Failed to remove staff member.");
    }
  };

  const getRoleDisplayName = (r: string) => {
    switch (r) {
      case 'super_admin': return 'Super Admin';
      case 'data_entry': return 'Data Manager';
      case 'verification_officer': return 'Verification Officer';
      case 'auditor': return 'System Auditor';
      default: return 'Administrator';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Staff & Permissions</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage team access and role-based permissions.</p>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 flex flex-col lg:flex-row gap-4 lg:items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Staff Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. employee@dehapa.com"
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 shadow-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 font-medium" 
          />
        </div>
        <div className="w-full lg:w-64">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Assign Role</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 shadow-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 font-bold form-select"
          >
            <option value="data_entry">Data Manager (CRM Only)</option>
            <option value="verification_officer">Verification Officer (Claims)</option>
            <option value="auditor">System Auditor (Logs)</option>
            <option value="super_admin">Super Admin (Full Access)</option>
          </select>
        </div>
        <button 
          onClick={handleInvite}
          disabled={isInviting || !email}
          className="w-full lg:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50 mt-2 lg:mt-0"
        >
          {isInviting ? "Adding..." : "Grant Access"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="font-bold text-slate-900 mb-1">No Staff Members</p>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">Only the default super admin has access right now.</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <table className="w-full text-left block md:table">
            <thead className="bg-slate-50 border-b border-slate-200 hidden md:table-header-group">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-slate-100 p-3 md:p-0">
              {staff.map(user => (
                <tr key={user.id} className="block md:table-row hover:bg-slate-50 transition-colors p-4 md:p-0">
                  <td className="block md:table-cell px-0 md:px-6 py-1 md:py-4">
                    <div className="font-bold text-slate-900 break-all md:break-normal">{user.email}</div>
                  </td>
                  <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4">
                    <span className="bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest inline-block">
                      {getRoleDisplayName(user.role)}
                    </span>
                  </td>
                  <td className="block md:table-cell px-0 md:px-6 pt-2 md:py-4 text-right border-t border-slate-100 md:border-none mt-2 md:mt-0">
                    <button 
                      onClick={() => handleRemove(user.id)}
                      className="text-xs font-bold text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 md:border-transparent md:bg-transparent md:hover:bg-red-50 px-3 py-2 md:py-1.5 rounded-lg transition-colors w-full md:w-auto text-center"
                    >
                      Revoke Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
